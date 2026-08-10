import { useState, useMemo } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

export interface DetectorNode {
  id: string;
  x: number;
  y: number;
  t: number;
  label: string;
  fired: boolean;
}

export interface FaultEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  errorType: 'X' | 'Z' | 'Measurement';
  active: boolean;
}

const DEFAULT_DETECTORS: DetectorNode[] = [
  { id: 'D0', x: 80, y: 80, t: 1, label: 'D0 (Z-check 1, t=1)', fired: false },
  { id: 'D1', x: 220, y: 80, t: 1, label: 'D1 (X-check 1, t=1)', fired: false },
  { id: 'D2', x: 360, y: 80, t: 1, label: 'D2 (Z-check 2, t=1)', fired: false },
  { id: 'D3', x: 80, y: 220, t: 2, label: 'D3 (Z-check 1, t=2)', fired: false },
  { id: 'D4', x: 220, y: 220, t: 2, label: 'D4 (X-check 1, t=2)', fired: false },
  { id: 'D5', x: 360, y: 220, t: 2, label: 'D5 (Z-check 2, t=2)', fired: false },
];

const DEFAULT_FAULTS: FaultEdge[] = [
  { id: 'F0', from: 'D0', to: 'D1', weight: 1.2, errorType: 'X', active: false },
  { id: 'F1', from: 'D1', to: 'D2', weight: 1.2, errorType: 'Z', active: false },
  { id: 'F2', from: 'D0', to: 'D3', weight: 2.1, errorType: 'Measurement', active: false },
  { id: 'F3', from: 'D1', to: 'D4', weight: 2.1, errorType: 'Measurement', active: false },
  { id: 'F4', from: 'D2', to: 'D5', weight: 2.1, errorType: 'Measurement', active: false },
  { id: 'F5', from: 'D3', to: 'D4', weight: 1.2, errorType: 'X', active: false },
  { id: 'F6', from: 'D4', to: 'D5', weight: 1.2, errorType: 'Z', active: false },
];

// Virtual node used for boundary (half) edges that touch only one real detector.
const BOUNDARY = 'BOUNDARY';

interface Graph {
  nodes: string[];
  idx: Map<string, number>;
  dist: number[][];
  next: number[][];
  hasBoundary: boolean;
}

interface MatchPair {
  a: string;
  b: string;
  weight: number;
  path: string[];
}

type Decoding =
  | { matched: true; pairs: MatchPair[]; totalWeight: number }
  | { matched: false }
  | null;

// A Stim DEM edge weight is w = ln((1-p)/p); invert it to recover the physical
// error probability of that edge so we can Monte-Carlo sample the real model.
function edgeProbability(weight: number): number {
  return 1 / (1 + Math.exp(weight));
}

// Toggling an edge flips the parity (XOR) of its two incident detectors.
function computeFired(faults: FaultEdge[]): Set<string> {
  const fired = new Set<string>();
  faults.forEach((f) => {
    if (!f.active) return;
    [f.from, f.to].forEach((id) => {
      if (fired.has(id)) fired.delete(id);
      else fired.add(id);
    });
  });
  return fired;
}

// Build a weighted graph from the DEM edges and compute all-pairs shortest-path
// distances with Floyd-Warshall (edge weights are the DEM weights).
function buildGraph(detectors: DetectorNode[], faults: FaultEdge[]): Graph {
  const detectorIds = detectors.map((d) => d.id);
  const idSet = new Set(detectorIds);

  let hasBoundary = false;
  const edges = faults.map((f) => {
    const from = idSet.has(f.from) ? f.from : BOUNDARY;
    const to = idSet.has(f.to) ? f.to : BOUNDARY;
    if (from === BOUNDARY || to === BOUNDARY) hasBoundary = true;
    return { from, to, weight: f.weight };
  });

  const nodes = hasBoundary ? [...detectorIds, BOUNDARY] : [...detectorIds];
  const idx = new Map(nodes.map((n, i) => [n, i]));
  const N = nodes.length;

  const dist: number[][] = Array.from({ length: N }, () => Array(N).fill(Infinity));
  const next: number[][] = Array.from({ length: N }, () => Array(N).fill(-1));
  for (let i = 0; i < N; i++) {
    dist[i][i] = 0;
    next[i][i] = i;
  }

  edges.forEach((e) => {
    const a = idx.get(e.from);
    const b = idx.get(e.to);
    if (a === undefined || b === undefined) return;
    if (e.weight < dist[a][b]) {
      dist[a][b] = e.weight;
      dist[b][a] = e.weight;
      next[a][b] = b;
      next[b][a] = a;
    }
  });

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  return { nodes, idx, dist, next, hasBoundary };
}

// Reconstruct the actual shortest-path node sequence between two nodes.
function pathBetween(graph: Graph, a: string, b: string): string[] {
  const { idx, next, nodes } = graph;
  const ai = idx.get(a);
  const bi = idx.get(b);
  if (ai === undefined || bi === undefined || next[ai][bi] === -1) return [a, b];
  const path = [a];
  let cur = ai;
  let guard = 0;
  while (cur !== bi && guard++ <= nodes.length) {
    cur = next[cur][bi];
    if (cur === -1) break;
    path.push(nodes[cur]);
  }
  return path;
}

// Exact minimum-weight perfect matching over the fired detectors. Pairs are
// scored by shortest-path distance; when boundary edges exist a detector may
// instead match the virtual boundary node (required when the count is odd).
// This is an exact recursive search (memoized) — correct at this small size.
function minWeightMatching(
  fired: string[],
  graph: Graph
): { cost: number; pairs: { a: string; b: string; weight: number }[] } | null {
  const { dist, idx, hasBoundary } = graph;
  const memo = new Map<string, { cost: number; pairs: { a: string; b: string; weight: number }[] } | null>();

  const solve = (
    rem: string[]
  ): { cost: number; pairs: { a: string; b: string; weight: number }[] } | null => {
    if (rem.length === 0) return { cost: 0, pairs: [] };
    const key = rem.join(',');
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    const first = rem[0];
    const rest = rem.slice(1);
    let best: { cost: number; pairs: { a: string; b: string; weight: number }[] } | null = null;

    for (let i = 0; i < rest.length; i++) {
      const other = rest[i];
      const d = dist[idx.get(first)!][idx.get(other)!];
      if (!isFinite(d)) continue;
      const sub = solve(rest.filter((_, j) => j !== i));
      if (sub === null) continue;
      const total = d + sub.cost;
      if (best === null || total < best.cost) {
        best = { cost: total, pairs: [{ a: first, b: other, weight: d }, ...sub.pairs] };
      }
    }

    if (hasBoundary) {
      const d = dist[idx.get(first)!][idx.get(BOUNDARY)!];
      if (isFinite(d)) {
        const sub = solve(rest);
        if (sub !== null) {
          const total = d + sub.cost;
          if (best === null || total < best.cost) {
            best = { cost: total, pairs: [{ a: first, b: BOUNDARY, weight: d }, ...sub.pairs] };
          }
        }
      }
    }

    memo.set(key, best);
    return best;
  };

  return solve(fired);
}

export default function StimDetectorGraphVisualizer() {
  const [detectors, setDetectors] = useState<DetectorNode[]>(DEFAULT_DETECTORS);
  const [faults, setFaults] = useState<FaultEdge[]>(DEFAULT_FAULTS);
  const [activeFaultId, setActiveFaultId] = useState<string | null>(null);
  const [decoding, setDecoding] = useState<Decoding>(null);

  const graph = useMemo(() => buildGraph(detectors, faults), [detectors, faults]);

  const computeDecoding = (g: Graph, firedIds: Set<string>) => {
    const fired = detectors.filter((d) => firedIds.has(d.id)).map((d) => d.id);
    if (fired.length === 0) {
      setDecoding(null);
      return;
    }
    const result = minWeightMatching(fired, g);
    if (result === null) {
      setDecoding({ matched: false });
      return;
    }
    const pairs: MatchPair[] = result.pairs.map((p) => ({
      ...p,
      path: pathBetween(g, p.a, p.b),
    }));
    setDecoding({ matched: true, pairs, totalWeight: result.cost });
  };

  const injectRandomNoise = () => {
    sound.playSyndromeTick();
    // Genuine Monte Carlo draw of the DEM: each edge fires with its own physical
    // probability derived from the edge weight (p = 1 / (1 + e^w)).
    const newFaults = faults.map((f) => ({
      ...f,
      active: Math.random() < edgeProbability(f.weight),
    }));

    const firedIds = computeFired(newFaults);
    setFaults(newFaults);
    setDetectors((prev) => prev.map((d) => ({ ...d, fired: firedIds.has(d.id) })));
    computeDecoding(graph, firedIds);
  };

  const resetGraph = () => {
    sound.playDecoderLock();
    setDetectors(DEFAULT_DETECTORS);
    setFaults(DEFAULT_FAULTS);
    setActiveFaultId(null);
    setDecoding(null);
  };

  const handleFaultClick = (faultId: string) => {
    sound.playDecoderLock();
    setActiveFaultId((prev) => (prev === faultId ? null : faultId));

    const newFaults = faults.map((f) =>
      f.id === faultId ? { ...f, active: !f.active } : f
    );
    const firedIds = computeFired(newFaults);
    setFaults(newFaults);
    setDetectors((prev) => prev.map((d) => ({ ...d, fired: firedIds.has(d.id) })));
    computeDecoding(graph, firedIds);
  };

  const firedCount = useMemo(() => detectors.filter((d) => d.fired).length, [detectors]);
  const activeFaultCount = useMemo(() => faults.filter((f) => f.active).length, [faults]);

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// STIM DETECTOR ERROR MODEL (.DEM)</span>
            <span className="rounded bg-syndrome/20 px-2 py-0.5 font-mono text-[10px] text-syndrome font-bold">GRAPH VISUALIZER</span>
            <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-text-low font-bold">ILLUSTRATIVE DEM</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Interactive Syndrome & Fault Graph Studio</h3>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={injectRandomNoise}
            className="btn-primary text-xs !px-4 !py-2 flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" /> Sample DEM Noise
          </button>
          <button
            type="button"
            onClick={resetGraph}
            className="rounded-lg border border-ink-700 bg-ink-950 p-2 text-text-low hover:text-text-hi flex items-center gap-1 font-mono text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Explore an illustrative Stim Detector Error Model (DEM) graph. Click any error edge to toggle a
        physical Pauli fault (X or Z) or measurement flip and watch detector nodes trigger odd-parity
        syndrome events. “Sample DEM Noise” performs a genuine Monte Carlo draw — each edge fires with its
        own probability p = 1/(1+eᵂ) derived from its weight — and the syndrome is decoded by an exact
        minimum-weight perfect matching over the graph’s shortest-path distances.
      </p>

      {/* Main Canvas Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Graph Viewport */}
        <div className="lg:col-span-2 rounded-xl border border-ink-700 bg-ink-950 p-4 relative overflow-hidden flex items-center justify-center min-h-[320px]">
          <svg viewBox="0 0 440 300" className="w-full h-full max-h-[320px]">
            {/* Background Grid Lines */}
            <defs>
              <pattern id="demGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="440" height="300" fill="url(#demGrid)" />

            {/* Time Round Guides */}
            <line x1="20" y1="80" x2="420" y2="80" stroke="rgba(0,240,255,0.15)" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="20" y1="220" x2="420" y2="220" stroke="rgba(0,240,255,0.15)" strokeDasharray="4 4" strokeWidth="1" />
            <text x="30" y="72" fill="#7B89A7" fontSize="10" fontFamily="monospace">Round t=1</text>
            <text x="30" y="212" fill="#7B89A7" fontSize="10" fontFamily="monospace">Round t=2</text>

            {/* MWPM Match Pairing Paths — drawn along the real shortest paths */}
            {decoding?.matched &&
              decoding.pairs.map((pair, i) => {
                const pts = pair.path
                  .filter((id) => id !== BOUNDARY)
                  .map((id) => detectors.find((d) => d.id === id))
                  .filter((d): d is DetectorNode => !!d);
                if (pts.length === 0) return null;
                const coords = pts.map((d) => `${d.x},${d.y}`);
                // If the pair terminates at the boundary, extend to the canvas edge.
                if (pair.a === BOUNDARY || pair.b === BOUNDARY) {
                  const last = pts[pts.length - 1];
                  coords.push(`${last.x},292`);
                }
                return (
                  <polyline
                    key={`match-${i}`}
                    points={coords.join(' ')}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                );
              })}

            {/* Fault Edges */}
            {faults.map((fault) => {
              const dFrom = detectors.find((d) => d.id === fault.from);
              const dTo = detectors.find((d) => d.id === fault.to);
              if (!dFrom || !dTo) return null;

              const isSelected = activeFaultId === fault.id;

              return (
                <g key={fault.id} onClick={() => handleFaultClick(fault.id)} className="cursor-pointer group" role="button" tabIndex={0} aria-label="Toggle element" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const h = () => handleFaultClick(fault.id); h(); } }}>
                  <line
                    x1={dFrom.x}
                    y1={dFrom.y}
                    x2={dTo.x}
                    y2={dTo.y}
                    stroke={
                      fault.active
                        ? '#FF2A6D'
                        : isSelected
                        ? '#00F0FF'
                        : fault.errorType === 'Measurement'
                        ? '#A855F7'
                        : '#3B82F6'
                    }
                    strokeWidth={fault.active ? '3.5' : '2'}
                    opacity={fault.active ? 1 : 0.6}
                  />
                  {/* Invisible thicker line for easy clicking */}
                  <line
                    x1={dFrom.x}
                    y1={dFrom.y}
                    x2={dTo.x}
                    y2={dTo.y}
                    stroke="transparent"
                    strokeWidth="14"
                  />
                  {/* Edge Weight Label */}
                  <rect
                    x={(dFrom.x + dTo.x) / 2 - 12}
                    y={(dFrom.y + dTo.y) / 2 - 8}
                    width="24"
                    height="16"
                    rx="4"
                    fill="#0D1322"
                    stroke={fault.active ? '#FF2A6D' : '#1F293D'}
                  />
                  <text
                    x={(dFrom.x + dTo.x) / 2}
                    y={(dFrom.y + dTo.y) / 2 + 3}
                    textAnchor="middle"
                    fill={fault.active ? '#FF2A6D' : '#7B89A7'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {fault.errorType[0]}
                  </text>
                </g>
              );
            })}

            {/* Detector Nodes */}
            {detectors.map((d) => (
              <g key={d.id} transform={`translate(${d.x}, ${d.y})`}>
                {d.fired && (
                  <circle r="18" fill="none" stroke="#FF2A6D" strokeWidth="2" className="animate-ping opacity-75" />
                )}
                <circle
                  r="12"
                  fill={d.fired ? '#FF2A6D' : '#0D1322'}
                  stroke={d.fired ? '#FF2A6D' : '#00F0FF'}
                  strokeWidth="2.5"
                  className="transition-colors duration-200"
                />
                <text
                  y="4"
                  textAnchor="middle"
                  fill={d.fired ? '#FFFFFF' : '#00F0FF'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {d.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Analytics & Control Panel */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-text-low">// DETECTOR EVENTS</span>
              <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">MWPM ACTIVE</span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-lg bg-ink-900 border border-ink-800">
                  <span className="text-[9px] text-text-low uppercase block">Fired Detectors</span>
                  <span className={`text-xl font-bold block mt-0.5 ${firedCount > 0 ? 'text-syndrome' : 'text-stabilizer'}`}>
                    {firedCount}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-ink-900 border border-ink-800">
                  <span className="text-[9px] text-text-low uppercase block">Active Faults</span>
                  <span className="text-xl font-bold text-star block mt-0.5">
                    {activeFaultCount}
                  </span>
                </div>
              </div>

              {decoding?.matched && decoding.pairs.length > 0 && (
                <div className="p-3 rounded-lg bg-stabilizer/10 border border-stabilizer/30 text-xs">
                  <span className="text-stabilizer font-bold block mb-1">
                    ✓ MWPM Match Found (total weight {decoding.totalWeight.toFixed(2)}):
                  </span>
                  {decoding.pairs.map((pair, i) => (
                    <span key={i} className="text-text-mid block">
                      Pairing {pair.a} ↔ {pair.b} via shortest graph path (w={pair.weight.toFixed(2)}
                      {pair.path.filter((n) => n !== BOUNDARY).length > 2
                        ? `: ${pair.path.filter((n) => n !== BOUNDARY).join('→')}`
                        : ''}
                      ).
                    </span>
                  ))}
                </div>
              )}

              {decoding && !decoding.matched && firedCount > 0 && (
                <div className="p-3 rounded-lg bg-syndrome/10 border border-syndrome/30 text-xs">
                  <span className="text-syndrome font-bold block">
                    No perfect matching: odd syndrome with no boundary edge in this DEM.
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-ink-800 space-y-2">
                <span className="text-text-low block font-bold">Detector Status:</span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {detectors.map((d) => (
                    <div key={d.id} className="flex justify-between items-center text-[11px] p-1 rounded bg-ink-900">
                      <span>{d.label}</span>
                      <span className={`font-bold ${d.fired ? 'text-syndrome' : 'text-text-low'}`}>
                        {d.fired ? 'FIRED (1)' : '0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-ink-800 text-[10px] font-mono text-text-low">
            💡 Click any edge line to toggle physical error events and test syndrome parity matching.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { bpMinSumDecode } from '@/lib/bp';
import { buildBicycleCode } from '@/lib/bicycleCodes';
import { RefreshCw, Zap, Layers, Play } from 'lucide-react';
import { sound } from '@/lib/sound';

type Pauli = 'I' | 'X' | 'Y' | 'Z';

interface QldpcPreset {
  id: string;
  name: string;
  n: number;
  k: number;
  d: number;
  l: number;
  m: number;
  aPoly: string;
  bPoly: string;
  /** Exponent pairs over Z_l x Z_m — the real algebraic construction. */
  aTerms: Array<readonly [number, number]>;
  bTerms: Array<readonly [number, number]>;
  description: string;
  surfaceEquivQubits: number;
}

const QLDPC_PRESETS: QldpcPreset[] = [
  {
    id: 'bb-18',
    name: '[[18, 4, 4]] Compact Bivariate Bicycle',
    n: 18,
    k: 4,
    d: 4,
    l: 3,
    m: 3,
    aPoly: '1 + x + y',
    bPoly: '1 + y + x^2·y',
    aTerms: [[0, 0], [0, 1], [1, 0]],
    bTerms: [[0, 0], [0, 1], [2, 1]],
    description: 'Compact 18-qubit demonstration bicycle code; k and d verified by exhaustive GF(2) rank and distance computation.',
    surfaceEquivQubits: 36,
  },
  {
    id: 'bb-72',
    name: '[[72, 12, 6]] IBM Gross QLDPC Code',
    n: 72,
    k: 12,
    d: 6,
    l: 6,
    m: 6,
    aPoly: 'x^3 + y + y^2',
    bPoly: 'y^3 + x + x^2',
    aTerms: [[3, 0], [0, 1], [0, 2]],
    bTerms: [[0, 3], [1, 0], [2, 0]],
    description: 'IBM 2021 landmark Bivariate Bicycle code encoding 12 logical qubits in 72 physical qubits (16.7% encoding rate vs <2% for surface codes).',
    surfaceEquivQubits: 864,
  },
  {
    id: 'pk-144',
    name: '[[144, 12, 12]] Bivariate-Bicycle (IBM, Bravyi et al. 2024)',
    n: 144,
    k: 12,
    d: 12,
    l: 12,
    m: 6,
    aPoly: 'x^3 + y + y^2',
    bPoly: 'y^3 + x + x^2',
    aTerms: [[3, 0], [0, 1], [0, 2]],
    bTerms: [[0, 3], [1, 0], [2, 0]],
    description: 'High-rate QLDPC architecture using far fewer physical qubits than an equal number of distance-12 surface-code patches (see the live ratio below).',
    surfaceEquivQubits: 3456,
  },
];

export default function QldpcTannerGraphVisualizer() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bb-18');
  const [errors, setErrors] = useState<Pauli[]>(() => new Array(18).fill('I'));
  const [bpIteration, setBpIteration] = useState<number>(0);
  const BP_MAX = 12;

  const preset = useMemo(
    () => QLDPC_PRESETS.find((p) => p.id === selectedPresetId) ?? QLDPC_PRESETS[0],
    [selectedPresetId]
  );

  // The real bivariate-bicycle Tanner graph for the selected preset
  // (algebraic construction, verified by scripts/check-codes.mjs).
  const graphData = useMemo(() => {
    const code = buildBicycleCode(preset.l, preset.m, preset.aTerms, preset.bTerms);
    const n = code.n;

    // Position data qubits on a large outer circle
    const dataNodes = Array.from({ length: n }).map((_, i) => {
      const angle = (i * 360 / n - 90) * (Math.PI / 180);
      const r = 160;
      return {
        id: i,
        label: `q${i}`,
        x: 200 + r * Math.cos(angle),
        y: 200 + r * Math.sin(angle),
      };
    });

    // One X-check node per real check row of the bicycle construction
    const xCheckNodes = code.xChecks.map((_, i) => {
      const numChecks = code.xChecks.length;
      const angle = (i * 360 / numChecks - 90) * (Math.PI / 180);
      const r = 75;
      return {
        id: `X${i}`,
        type: 'X' as const,
        label: `C_X${i}`,
        x: 200 + r * Math.cos(angle),
        y: 200 + r * Math.sin(angle),
      };
    });

    // Real edges: check c touches exactly the qubits in its support (weight 6)
    const edges: Array<{ from: string; to: number; type: 'X' | 'Z' }> = [];
    code.xChecks.forEach((support, cIdx) => {
      for (const q of support) edges.push({ from: `X${cIdx}`, to: q, type: 'X' });
    });

    return { dataNodes, xCheckNodes, edges, code };
  }, [preset]);

  const toggleError = (idx: number) => {
    setErrors((prev) => {
      const next = [...prev];
      const cur = next[idx] ?? 'I';
      const seq: Pauli[] = ['I', 'X', 'Z', 'Y'];
      next[idx] = seq[(seq.indexOf(cur) + 1) % seq.length];
      return next;
    });
    setBpIteration(0);
    sound.playSyndromeTick();
  };

  const clearErrors = () => {
    setErrors(new Array(preset.n).fill('I'));
    setBpIteration(0);
    sound.playDecoderLock();
  };

  const stepBeliefPropagation = () => {
    if (bpIteration >= BP_MAX) return;
    sound.playSyndromeTick();
    setBpIteration((prev) => prev + 1); // BP re-runs for `bpIteration` rounds (see `bp` useMemo)
  };
  const runBeliefPropagation = () => {
    sound.playDecoderLock();
    setBpIteration(BP_MAX); // run min-sum BP to the iteration cap in one go
  };

  // Compute active check fires
  const activeFires = useMemo(() => {
    return graphData.xCheckNodes.map((cNode) => {
      const connectedEdges = graphData.edges.filter((e) => e.from === cNode.id);
      let fires = false;
      connectedEdges.forEach((e) => {
        const err = errors[e.to];
        if (err === 'Z' || err === 'Y') fires = !fires;
      });
      return { id: cNode.id, fires };
    });
  }, [graphData, errors]);

  // Real min-sum belief propagation over the Tanner graph. checkSupports[c] is
  // the list of qubits in X-check c; the syndrome is the live activeFires vector.
  const checkSupports = useMemo(
    () => graphData.xCheckNodes.map((cNode) => graphData.edges.filter((e) => e.from === cNode.id).map((e) => e.to)),
    [graphData],
  );
  const syndromeVec = useMemo(() => activeFires.map((f) => (f.fires ? 1 : 0)), [activeFires]);
  const bp = useMemo(
    () => bpMinSumDecode(checkSupports, preset.n, syndromeVec, 0.06, bpIteration),
    [checkSupports, preset.n, syndromeVec, bpIteration],
  );
  const bpErrorCount = bp.estimate.reduce((a, b) => a + b, 0);

  const totalErrorCount = errors.slice(0, preset.n).filter((e) => e !== 'I').length;
  const totalFiresCount = activeFires.filter((f) => f.fires).length;

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-magic" />
            <h2 className="font-display text-xl font-bold text-text-hi">
              Quantum LDPC (QLDPC) Bivariate Bicycle Visualizer
            </h2>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Explore constant-rate QLDPC codes (k/n &gt; 0.1) with sparse bipartite Tanner graphs. The Tanner graph is the actual algebraic bicycle construction (verified by the build), the syndrome is computed live from it, and a <strong>real min-sum belief-propagation decoder</strong> passes LLR messages over it to find a correction.
          </p>
        </div>

        <button
          type="button"
          onClick={clearErrors}
          className="flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-magic/50 hover:text-text-hi"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Clear Faults
        </button>
      </div>

      {/* Code Preset Selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {QLDPC_PRESETS.map((p) => {
          const active = p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPresetId(p.id);
                setErrors(new Array(p.n).fill('I'));
                setBpIteration(0);
                sound.playSyndromeTick();
              }}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                active
                  ? 'border-magic/70 bg-magic/15 font-semibold text-text-hi shadow-glow-violet'
                  : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <span className="font-mono text-[11px] font-bold text-magic">
                [[{p.n}, {p.k}, {p.d}]]
              </span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Visualizer Workspace */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Tanner Graph SVG Viewport */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900/90 p-4 min-h-[420px]">
          <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
            <span className="text-text-hi font-bold">Bipartite Tanner Graph</span> · n={preset.n} Data Qubits, k={preset.k} Logical Qubits
          </div>

          <div className="relative w-full max-w-[400px] aspect-square my-2">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Tanner Edges */}
              {graphData.edges.map((e, idx) => {
                const cNode = graphData.xCheckNodes.find((c) => c.id === e.from);
                const qNode = graphData.dataNodes.find((q) => q.id === e.to);
                if (!cNode || !qNode) return null;

                const checkFires = activeFires.find((f) => f.id === cNode.id)?.fires;
                return (
                  <line
                    key={idx}
                    x1={cNode.x}
                    y1={cNode.y}
                    x2={qNode.x}
                    y2={qNode.y}
                    stroke={checkFires ? '#F43F5E' : '#3D5178'}
                    strokeWidth={checkFires ? '2' : '1'}
                    strokeOpacity={checkFires ? '0.8' : '0.4'}
                  />
                );
              })}

              {/* Parity Check Nodes (C-nodes) */}
              {graphData.xCheckNodes.map((c) => {
                const fires = activeFires.find((f) => f.id === c.id)?.fires;
                return (
                  <g key={c.id}>
                    <rect
                      x={c.x - 14}
                      y={c.y - 14}
                      width="28"
                      height="28"
                      rx="6"
                      fill={fires ? '#F43F5E' : '#1E293B'}
                      stroke={fires ? '#FFFFFF' : '#8B5CF6'}
                      strokeWidth="2"
                    />
                    <text
                      x={c.x}
                      y={c.y + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {c.label}
                    </text>
                  </g>
                );
              })}

              {/* Data Qubit Nodes (V-nodes) */}
              {graphData.dataNodes.map((q) => {
                const err = errors[q.id] ?? 'I';
                const hasErr = err !== 'I';
                return (
                  <g key={q.id} className="cursor-pointer" onClick={() => toggleError(q.id)} role="button" tabIndex={0} aria-label="Toggle element" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const h = () => toggleError(q.id); h(); } }}>
                    <circle
                      cx={q.x}
                      cy={q.y}
                      r={hasErr ? '15' : '11'}
                      fill={hasErr ? (err === 'X' ? '#F43F5E' : err === 'Z' ? '#8B5CF6' : '#F5B83D') : '#0F172A'}
                      stroke={hasErr ? '#FFFFFF' : '#22D3EE'}
                      strokeWidth={hasErr ? '2.5' : '1.5'}
                      className="transition-all duration-200 hover:scale-115"
                    />
                    <text
                      x={q.x}
                      y={q.y + 3.5}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {hasErr ? err : `q${q.id}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-center font-mono text-[11px] text-text-low">
            Outer Ring = Data Qubits ($V$-nodes) · Inner Square = Parity Check Generators ($C$-nodes)
          </div>
        </div>

        {/* BP-OSD Decoder & Overhead Comparison Panel */}
        <div className="flex flex-col gap-4">
          {/* BP Decoder Controls */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <h3 className="eyebrow mb-3 !text-magic">// MIN-SUM BELIEF PROPAGATION DECODER (real)</h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-text-mid">Active Errors:</span>
                <span className={`font-bold ${totalErrorCount > 0 ? 'text-syndrome' : 'text-stabilizer'}`}>
                  {totalErrorCount} Pauli error{totalErrorCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex justify-between items-center rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-text-mid">Syndrome Fires:</span>
                <span className={`font-bold ${totalFiresCount > 0 ? 'text-rose-400' : 'text-stabilizer'}`}>
                  {totalFiresCount} check{totalFiresCount === 1 ? '' : 's'} failing
                </span>
              </div>

              <div className="flex justify-between items-center rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-text-mid">BP Iteration:</span>
                <span className="font-bold text-plaquette">{bp.iterations} / {BP_MAX}</span>
              </div>

              <div className="flex justify-between items-center rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-text-mid">Decode result:</span>
                {bpIteration === 0 ? (
                  <span className="font-bold text-text-low">— (step to decode)</span>
                ) : bp.converged ? (
                  <span className="font-bold text-stabilizer">converged · {bpErrorCount}-qubit correction</span>
                ) : (
                  <span className="font-bold text-syndrome">not converged (needs OSD)</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={stepBeliefPropagation}
                disabled={bpIteration >= BP_MAX}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {bpIteration >= BP_MAX ? 'Max iterations' : 'Step BP iteration'}
              </button>
              <button
                type="button"
                onClick={runBeliefPropagation}
                className="rounded-lg border border-ink-600 bg-ink-900 px-3 font-mono text-xs text-text-mid hover:border-plaquette/50 hover:text-plaquette"
              >
                Run BP
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-text-low">
              Real min-sum belief propagation: LLR messages pass between qubit and check nodes over the Tanner
              graph for the shown iterations, hard-deciding each qubit’s marginal. “Converged” means the estimate
              reproduces the syndrome (H·ê = s). A full BP-OSD decoder adds ordered-statistics post-processing when
              BP alone stalls.
            </p>
          </div>

          {/* QUBIT OVERHEAD SAVINGS MATRIX */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 font-mono text-xs">
            <h3 className="eyebrow mb-3 !text-stabilizer">// ARCHITECTURAL EFFICIENCY ADVANTAGE</h3>
            
            <div className="space-y-3">
              <div className="rounded-lg bg-ink-900 p-3 border border-ink-700">
                <div className="text-[11px] text-text-low">QLDPC Bivariate Bicycle Overhead:</div>
                <div className="mt-1 text-base font-bold text-plaquette">
                  {preset.n} Physical Qubits for {preset.k} Logical Qubits
                </div>
              </div>

              <div className="rounded-lg bg-ink-900 p-3 border border-ink-700 opacity-80">
                <div className="text-[11px] text-text-low">Equivalent 2D Surface Code Overhead:</div>
                <div className="mt-1 text-base font-bold text-rose-400">
                  {preset.surfaceEquivQubits} Physical Qubits
                </div>
              </div>

              <div className="flex items-center gap-2 text-stabilizer font-bold text-xs pt-1">
                <Zap className="h-4 w-4 shrink-0" />
                <span>{(preset.surfaceEquivQubits / preset.n).toFixed(1)}x Physical Qubit Savings!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

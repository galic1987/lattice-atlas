import { useEffect, useMemo, useRef, useState } from 'react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { sound } from '@/lib/sound';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Cpu,
  Download,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  SkipBack,
  SkipForward,
  Layers,
  Grid,
  Columns,
} from 'lucide-react';
import type { McCell, McCommand, McProgress } from '@/lib/threshold.worker';
import {
  buildLattice,
  computeSyndrome,
  decode,
  logicalFlips,
  sampleDepolarizing,
  toStimCircuit,
  PAULI_LABEL,
  type DecodeResult,
  type Lattice,
  type Pauli,
  type Stabilizer,
} from '@/lib/surfaceCode';
import { topicById, shortName } from '@/data';
import SpacetimeView3D from '@/components/SpacetimeView3D';
import WasmQuantumSandbox from '@/components/WasmQuantumSandbox';
import TorusTopologyViewer from '@/components/TorusTopologyViewer';

const EASE = [0.22, 1, 0.36, 1] as const;

const PAULI_COLORS: Record<Exclude<Pauli, 0>, string> = {
  1: '#8B5CF6', // X — star violet
  2: '#22D3EE', // Z — plaquette cyan
  3: '#F5B83D', // Y — magic amber
};
const SYNDROME = '#FB7185';
const OK = '#34D399';

const CELL = 64;
const PAD = 52;

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function qubitPoint(d: number, q: number): { x: number; y: number } {
  return { x: PAD + (q % d) * CELL, y: PAD + Math.floor(q / d) * CELL };
}

function faceCenter(s: Stabilizer): { x: number; y: number } {
  return { x: PAD + (s.fc - 0.5) * CELL, y: PAD + (s.fr - 0.5) * CELL };
}

/** SVG path for a stabilizer face: square (interior) or outward semicircle (boundary). */
function facePath(lat: Lattice, s: Stabilizer): string {
  const pts = s.qubits.map((q) => qubitPoint(lat.d, q));
  if (!s.boundary) {
    const [a, , , dpt] = [pts[0], pts[1], pts[2], pts[3]];
    return `M ${a.x} ${a.y} L ${pts[1].x} ${pts[1].y} L ${dpt.x} ${dpt.y} L ${pts[2].x} ${pts[2].y} Z`;
  }
  const [p1, p2] = pts;
  const r = CELL / 2;
  // Bulge away from the lattice: up (fr=0), down (fr=d), left (fc=0), right (fc=d).
  const sweep = s.fr === 0 || s.fc === lat.d ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y} Z`;
}

/* ------------------------------------------------------------------ */
/* Playback Pipeline Step Definition                                   */
/* ------------------------------------------------------------------ */

const PLAYBACK_STEPS = [
  {
    step: 0,
    title: 'Clean Error Frame',
    subtitle: 'No Pauli errors',
    description: 'The classical model starts with no Pauli errors, so every ideal stabilizer check returns +1.',
  },
  {
    step: 1,
    title: 'Error Injection',
    subtitle: 'Pauli Noise (X, Z, Y)',
    description: 'Environmental noise or manual painting injects Pauli X bit-flips, Z phase-flips, or Y combined errors on data qubits.',
  },
  {
    step: 2,
    title: 'Ideal Check Readout',
    subtitle: 'Parity from the error frame',
    description: 'The model computes ideal stabilizer parities. Checks that anticommute with the painted Pauli errors return -1 (rose syndrome).',
  },
  {
    step: 3,
    title: 'Defect Identification',
    subtitle: 'Matching-graph vertices',
    description: 'The fired X- and Z-type checks become separate vertices in the built-in decoder’s spatial matching graphs.',
  },
  {
    step: 4,
    title: 'Built-in Matching',
    subtitle: 'Exact small cases · greedy fallback',
    description: 'The local model pairs same-type defects or boundaries by shortest graph paths. It uses exact dynamic programming up to 16 defects per type, then a greedy fallback—not PyMatching.',
  },
  {
    step: 5,
    title: 'Correction Applied',
    subtitle: 'Syndrome + logical-sector check',
    description: 'The model combines error and candidate correction, confirms the residual syndrome clears, then tests whether the residual crosses a chosen logical support. This verifies the toy-model outcome, not hardware recovery.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Lattice SVG                                                         */
/* ------------------------------------------------------------------ */

function LatticeView({
  lat,
  errors,
  syndrome,
  result,
  currentStep,
  onQubitClick,
}: {
  lat: Lattice;
  errors: Pauli[];
  syndrome: Set<string>;
  result: DecodeResult | null;
  currentStep: number;
  onQubitClick: (q: number) => void;
}) {
  const reduce = useReducedMotion();
  const size = (lat.d - 1) * CELL + 2 * PAD;
  const stabById = useMemo(
    () => new Map(lat.stabilizers.map((s) => [s.id, s])),
    [lat],
  );
  const correctedQubits = useMemo(() => {
    if (!result || currentStep < 5) return new Set<number>();
    return new Set(result.correction.flatMap((p, q) => (p !== 0 ? [q] : [])));
  }, [result, currentStep]);

  // Determine active display states based on current playback step
  const showErrors = currentStep >= 1 && currentStep < 5;
  const showSyndrome = currentStep >= 2 && currentStep < 5;
  const showDefects = currentStep >= 3 && currentStep < 5;
  const showMatches = currentStep >= 4 && result !== null;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full"
      role="group"
      aria-label={`Interactive distance-${lat.d} rotated surface code lattice`}
    >
      {/* stabilizer faces */}
      {lat.stabilizers.map((s) => {
        const hot = showSyndrome && syndrome.has(s.id);
        const base = s.type === 'X' ? PAULI_COLORS[1] : PAULI_COLORS[2];
        return (
          <g key={s.id}>
            <path
              d={facePath(lat, s)}
              fill={hot ? SYNDROME : base}
              fillOpacity={hot ? 0.42 : 0.13}
              stroke={hot ? SYNDROME : base}
              strokeOpacity={hot ? 0.9 : 0.3}
              strokeWidth={hot ? 1.5 : 1}
              className={hot && !reduce ? 'animate-pulse' : undefined}
            />
            <text
              x={faceCenter(s).x}
              y={faceCenter(s).y + 3.5}
              textAnchor="middle"
              fontSize={12}
              fontFamily="'JetBrains Mono', monospace"
              fill={hot ? SYNDROME : base}
              fillOpacity={hot ? 1 : 0.55}
            >
              {s.type}
            </text>

            {/* Step 3 & 4 Defect Identification Overlays */}
            {showDefects && hot && (
              <g key={`defect-${s.id}`}>
                <circle
                  cx={faceCenter(s).x}
                  cy={faceCenter(s).y}
                  r={16}
                  fill="none"
                  stroke={SYNDROME}
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  className={!reduce ? 'animate-spin' : undefined}
                />
                <circle
                  cx={faceCenter(s).x}
                  cy={faceCenter(s).y}
                  r={5}
                  fill={SYNDROME}
                  className={!reduce ? 'animate-ping' : undefined}
                  opacity={0.8}
                />
              </g>
            )}
          </g>
        );
      })}

      {/* decoder correction chains (Step 4 & 5) */}
      {showMatches &&
        result?.matches.map((m, i) => {
          const a = stabById.get(m.a);
          if (!a) return null;
          const pts = [faceCenter(a), ...m.qubits.map((q) => qubitPoint(lat.d, q))];
          if (m.b !== 'boundary') {
            const b = stabById.get(m.b);
            if (b) pts.push(faceCenter(b));
          }
          return (
            <motion.polyline
              key={i}
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={OK}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              strokeLinecap="round"
              initial={reduce ? undefined : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [...EASE] }}
            />
          );
        })}

      {/* data qubits */}
      {errors.map((e, q) => {
        const { x, y } = qubitPoint(lat.d, q);
        const corrected = correctedQubits.has(q);
        const activeError = showErrors ? e : 0;

        return (
          <g
            key={q}
            role="button"
            tabIndex={0}
            aria-label={`Data qubit ${q + 1}, ${e === 0 ? 'no painted error' : `painted ${PAULI_LABEL[e]} error`}`}
            onClick={() => onQubitClick(q)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onQubitClick(q);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <circle cx={x} cy={y} r={21} fill="transparent" />
            {corrected && (
              <circle cx={x} cy={y} r={16} fill="none" stroke={OK} strokeWidth={2} strokeDasharray="4 3" />
            )}
            <circle
              cx={x}
              cy={y}
              r={11}
              fill={activeError === 0 ? '#1B2743' : PAULI_COLORS[activeError]}
              stroke={activeError === 0 ? '#3D5178' : PAULI_COLORS[activeError]}
              strokeWidth={1.5}
              className="transition-[fill,stroke] duration-150 group-hover:stroke-[#EAF0FB] group-focus-visible:stroke-[#EAF0FB] group-focus-visible:stroke-[3px]"
            />
            {activeError !== 0 && (
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fontFamily="'JetBrains Mono', monospace"
                fill="#05080F"
                pointerEvents="none"
              >
                {PAULI_LABEL[activeError]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Threshold experiment — live Monte Carlo sweep in a web worker       */
/* ------------------------------------------------------------------ */

const MC_DISTANCES = [3, 5, 7];
const MC_P_VALUES = [0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2];
const MC_MAX_TRIALS = 50000;

/** Series colors validated for the ink-800 surface (dataviz six-checks pass). */
const SERIES_COLORS: Record<number, string> = { 3: '#0891B2', 5: '#8B5CF6', 7: '#D97706' };

const fmtRate = (f: number) => (f >= 0.01 ? `${(f * 100).toFixed(1)}%` : f.toExponential(1));

interface SeriesPoint {
  p: number;
  f: number;
  ciLo: number;
  ciHi: number;
  trials: number;
  fails: number;
}

interface BinomialEstimate {
  rate: number;
  lo: number;
  hi: number;
}

/** Two-sided 95% Wilson score interval; remains meaningful at 0 failures. */
function wilsonEstimate(fails: number, trials: number): BinomialEstimate | null {
  if (trials <= 0) return null;
  const z = 1.96;
  const z2 = z * z;
  const rate = fails / trials;
  const denominator = 1 + z2 / trials;
  const center = (rate + z2 / (2 * trials)) / denominator;
  const halfWidth =
    (z / denominator) *
    Math.sqrt((rate * (1 - rate)) / trials + z2 / (4 * trials * trials));
  return {
    rate,
    lo: Math.max(0, center - halfWidth),
    hi: Math.min(1, center + halfWidth),
  };
}

function seriesFor(cells: McCell[], d: number): SeriesPoint[] {
  return cells
    .filter((c) => c.d === d && c.trials > 0)
    .map((c) => {
      const estimate = wilsonEstimate(c.fails, c.trials)!;
      return {
        p: c.p,
        f: estimate.rate,
        ciLo: estimate.lo,
        ciHi: estimate.hi,
        trials: c.trials,
        fails: c.fails,
      };
    })
    .sort((a, b) => a.p - b.p);
}

function ThresholdChart({ cells, hoverP, onHoverP }: {
  cells: McCell[];
  hoverP: number | null;
  onHoverP: (p: number | null) => void;
}) {
  const W = 720;
  const H = 400;
  const M = { top: 18, right: 66, bottom: 46, left: 58 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const X_MIN = 0.01;
  const X_MAX = 0.21;
  const x = (p: number) => M.left + ((p - X_MIN) / (X_MAX - X_MIN)) * iw;
  const y = (f: number) => M.top + (-Math.log10(Math.min(Math.max(f, 1e-4), 1)) / 4) * ih;
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = X_MIN + (((e.clientX - rect.left) * (W / rect.width) - M.left) / iw) * (X_MAX - X_MIN);
    let best = MC_P_VALUES[0];
    for (const p of MC_P_VALUES) if (Math.abs(p - px) < Math.abs(best - px)) best = p;
    onHoverP(best);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Logical error rate versus physical error rate for distances 3, 5, and 7, with 95 percent Wilson intervals and upper-bound markers for zero failures"
      onMouseMove={handleMove}
      onMouseLeave={() => onHoverP(null)}
    >
      {/* y grid: decades */}
      {[1, 0.1, 0.01, 0.001, 0.0001].map((f, i) => (
        <g key={f}>
          <line x1={M.left} x2={W - M.right} y1={y(f)} y2={y(f)} stroke="#2A3A5F" strokeWidth={1} strokeOpacity={0.55} />
          <text x={M.left - 8} y={y(f) + 4} textAnchor="end" fontSize={12} fontFamily="'JetBrains Mono', monospace" fill="#7B89A7">
            {i === 0 ? '1' : `10${'⁻'}${['¹', '²', '³', '⁴'][i - 1]}`}
          </text>
        </g>
      ))}
      {/* x ticks */}
      {[0.04, 0.08, 0.12, 0.16, 0.2].map((p) => (
        <g key={p}>
          <line x1={x(p)} x2={x(p)} y1={M.top} y2={H - M.bottom} stroke="#2A3A5F" strokeWidth={1} strokeOpacity={0.3} />
          <text x={x(p)} y={H - M.bottom + 19} textAnchor="middle" fontSize={12} fontFamily="'JetBrains Mono', monospace" fill="#7B89A7">
            {(p * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      <text x={M.left + iw / 2} y={H - 6} textAnchor="middle" fontSize={11} fontFamily="'JetBrains Mono', monospace" fill="#A9B4CC">
        physical error rate p
      </text>
      <text x={14} y={M.top + ih / 2} textAnchor="middle" fontSize={11} fontFamily="'JetBrains Mono', monospace" fill="#A9B4CC" transform={`rotate(-90 14 ${M.top + ih / 2})`}>
        logical error rate
      </text>

      {/* crosshair */}
      {hoverP !== null && (
        <line x1={x(hoverP)} x2={x(hoverP)} y1={M.top} y2={H - M.bottom} stroke="#EAF0FB" strokeWidth={1} strokeOpacity={0.35} strokeDasharray="3 3" />
      )}

      {/* series */}
      {MC_DISTANCES.map((d) => {
        const pts = seriesFor(cells, d);
        const observed = pts.filter((pt) => pt.fails > 0);
        const color = SERIES_COLORS[d];
        const path = observed.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${x(pt.p)} ${y(pt.f)}`).join(' ');
        const last = observed[observed.length - 1];
        return (
          <g key={d}>
            {observed.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />}
            {pts.map((pt) => {
              const px = x(pt.p);
              if (pt.fails === 0) {
                const upperY = y(pt.ciHi);
                return (
                  <g key={pt.p}>
                    <line x1={px} x2={px} y1={upperY} y2={H - M.bottom} stroke={color} strokeWidth={1.25} strokeOpacity={0.55} strokeDasharray="3 3" />
                    <path d={`M ${px - 5} ${upperY - 4} L ${px + 5} ${upperY - 4} L ${px} ${upperY + 5} Z`} fill={color} />
                  </g>
                );
              }
              return (
                <g key={pt.p}>
                  <line x1={px} x2={px} y1={y(pt.ciLo)} y2={y(pt.ciHi)} stroke={color} strokeWidth={1.5} strokeOpacity={0.65} />
                  <circle cx={px} cy={y(pt.f)} r={4} fill={color} stroke="#121B31" strokeWidth={2} />
                </g>
              );
            })}
            {last && (
              <text x={x(last.p) + 10} y={y(last.f) + 4} fontSize={11} fontFamily="'JetBrains Mono', monospace" fill="#A9B4CC">
                d={d}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ThresholdSection() {
  const workerRef = useRef<Worker | null>(null);
  const [cells, setCells] = useState<McCell[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [tps, setTps] = useState(0);
  const [hoverP, setHoverP] = useState<number | null>(null);
  const [refP, setRefP] = useState(0.06);

  useEffect(() => () => workerRef.current?.terminate(), []);

  const stopFailedWorker = (worker: Worker, message: string) => {
    worker.terminate();
    if (workerRef.current === worker) workerRef.current = null;
    setRunning(false);
    setDone(false);
    setTps(0);
    setWorkerError(message);
  };

  const ensureWorker = (): Worker | null => {
    if (workerRef.current) return workerRef.current;
    let worker: Worker;
    try {
      worker = new Worker(new URL('../lib/threshold.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      setWorkerError('The Monte Carlo worker could not start in this browser.');
      return null;
    }
    const w = worker;
    w.onmessage = (e: MessageEvent<McProgress>) => {
      setWorkerError(null);
      setCells(e.data.cells);
      setTps(e.data.trialsPerSec);
      if (e.data.done) {
        setDone(true);
        setRunning(false);
      }
    };
    w.onerror = (event) => {
      event.preventDefault();
      stopFailedWorker(w, event.message || 'The Monte Carlo worker stopped unexpectedly.');
    };
    w.onmessageerror = () => {
      stopFailedWorker(w, 'The browser could not read a Monte Carlo worker result.');
    };
    workerRef.current = w;
    return w;
  };

  const toggle = () => {
    const worker = ensureWorker();
    if (!worker) return;
    if (running) {
      worker.postMessage({ cmd: 'pause' } satisfies McCommand);
      setRunning(false);
    } else if (cells.length > 0 && !done) {
      worker.postMessage({ cmd: 'resume' } satisfies McCommand);
      setWorkerError(null);
      setRunning(true);
    } else {
      worker.postMessage({
        cmd: 'start',
        distances: MC_DISTANCES,
        pValues: MC_P_VALUES,
        maxTrials: MC_MAX_TRIALS,
      } satisfies McCommand);
      setDone(false);
      setWorkerError(null);
      setRunning(true);
    }
  };

  const reset = () => {
    workerRef.current?.postMessage({ cmd: 'pause' } satisfies McCommand);
    setCells([]);
    setRunning(false);
    setDone(false);
    setWorkerError(null);
    setTps(0);
  };

  const retryWorker = () => {
    if (workerRef.current) workerRef.current.terminate();
    workerRef.current = null;
    setCells([]);
    setDone(false);
    setRunning(false);
    setTps(0);
    setWorkerError(null);
    const worker = ensureWorker();
    if (!worker) return;
    worker.postMessage({
      cmd: 'start',
      distances: MC_DISTANCES,
      pValues: MC_P_VALUES,
      maxTrials: MC_MAX_TRIALS,
    } satisfies McCommand);
    setRunning(true);
  };

  const totalTrials = cells.reduce((acc, c) => acc + c.trials, 0);
  const trialsByD = (d: number) => cells.filter((c) => c.d === d).reduce((a, c) => a + c.trials, 0);

  type LambdaEstimate =
    | { status: 'waiting' | 'insufficient'; reason: string }
    | { status: 'estimated'; value: number; lo: number; hi: number; conclusion: string; counts: string };

  const lambda = (dLo: number, dHi: number): LambdaEstimate => {
    const lowDistance = cells.find((cell) => cell.d === dLo && Math.abs(cell.p - refP) < 1e-9);
    const highDistance = cells.find((cell) => cell.d === dHi && Math.abs(cell.p - refP) < 1e-9);
    if (!lowDistance || !highDistance || lowDistance.trials === 0 || highDistance.trials === 0) {
      return { status: 'waiting', reason: 'run the sweep' };
    }
    if (lowDistance.fails < 20 || highDistance.fails < 20) {
      return {
        status: 'insufficient',
        reason: `${lowDistance.fails} vs ${highDistance.fails} failures · need ≥20 each`,
      };
    }
    const lowEstimate = wilsonEstimate(lowDistance.fails, lowDistance.trials)!;
    const highEstimate = wilsonEstimate(highDistance.fails, highDistance.trials)!;
    if (highEstimate.rate <= 0 || highEstimate.lo <= 0) {
      return { status: 'insufficient', reason: 'denominator unresolved' };
    }
    const value = lowEstimate.rate / highEstimate.rate;
    const ratioLo = lowEstimate.lo / highEstimate.hi;
    const ratioHi = lowEstimate.hi / highEstimate.lo;
    const conclusion =
      ratioLo > 1
        ? 'suppression supported'
        : ratioHi < 1
          ? 'larger code is worse'
          : 'range crosses 1';
    return {
      status: 'estimated',
      value,
      lo: ratioLo,
      hi: ratioHi,
      conclusion,
      counts: `${lowDistance.fails}/${lowDistance.trials} vs ${highDistance.fails}/${highDistance.trials}`,
    };
  };
  const l35 = lambda(3, 5);
  const l57 = lambda(5, 7);

  const hoverRows =
    hoverP !== null
      ? MC_DISTANCES.map((d) => ({
          d,
          cell: cells.find((c) => c.d === d && Math.abs(c.p - hoverP) < 1e-9) ?? null,
        }))
      : [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [...EASE] }}
      >
        <p className="eyebrow !text-magic">{'// THE EXPERIMENT'}</p>
        <h2 className="mt-4 max-w-2xl font-display text-[32px] font-semibold leading-[1.1] text-text-hi md:text-[40px]">
          Explore a finite-size scaling signal.
        </h2>
        <p className="mt-5 max-w-2xl leading-[1.7] text-text-mid">
          This is a browser-scale version of a canonical threshold diagnostic. Sample independent data-qubit Pauli noise at
          each physical error rate, decode, and count logical failures — live,
          in your browser. Below threshold, bigger codes win: the curves
          separate, with <span className="mono-pill">d = 7</span> below{' '}
          <span className="mono-pill">d = 5</span> below{' '}
          <span className="mono-pill">d = 3</span>. Above it, they cross and
          bigger codes lose.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* chart card */}
        <div className="relative rounded-xl border border-ink-600 bg-ink-800 p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-3">
            {MC_DISTANCES.map((d) => (
              <span key={d} className="flex items-center gap-1.5 font-mono text-[12px] text-text-mid">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[d] }} />
                d={d}
                <span className="text-text-low">({(trialsByD(d) / 1000).toFixed(0)}k trials)</span>
              </span>
            ))}
            <span className="ml-auto font-mono text-[11px] text-text-low">
              95% Wilson intervals · ▼ = zero-failure upper bound
            </span>
          </div>
          <ThresholdChart cells={cells} hoverP={hoverP} onHoverP={setHoverP} />
          {hoverP !== null && hoverRows.some((r) => r.cell && r.cell.trials > 0) && (
            <div className="pointer-events-none absolute right-8 top-16 rounded-lg border border-ink-600 bg-ink-850 p-3 shadow-xl">
              <p className="font-mono text-[11px] text-text-low">p = {(hoverP * 100).toFixed(0)}%</p>
              {hoverRows.map(({ d, cell }) => (
                <p key={d} className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-mid">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[d] }} />
                  d={d}:{' '}
                  {cell && cell.trials > 0
                    ? cell.fails > 0
                      ? fmtRate(cell.fails / cell.trials)
                      : `≤ ${fmtRate(wilsonEstimate(0, cell.trials)!.hi)} (95%)`
                    : '—'}
                </p>
              ))}
            </div>
          )}
          <details className="mt-2 border-t border-ink-700 pt-3">
            <summary className="cursor-pointer font-mono text-[11px] text-text-low transition-colors hover:text-text-mid">
              view data table
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full font-mono text-[11px] text-text-mid">
                <thead>
                  <tr className="text-left text-text-low">
                    <th className="py-1 pr-4 font-medium">p</th>
                    {MC_DISTANCES.map((d) => (
                      <th key={d} className="py-1 pr-4 font-medium">
                        d={d} fails/trials
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MC_P_VALUES.map((p) => (
                    <tr key={p} className="border-t border-ink-700">
                      <td className="py-1 pr-4">{(p * 100).toFixed(0)}%</td>
                      {MC_DISTANCES.map((d) => {
                        const cell = cells.find((c) => c.d === d && Math.abs(c.p - p) < 1e-9);
                        return (
                          <td key={d} className="py-1 pr-4">
                            {cell && cell.trials > 0
                              ? cell.fails > 0
                                ? `${cell.fails}/${cell.trials}`
                                : `0/${cell.trials} (upper ≤${fmtRate(wilsonEstimate(0, cell.trials)!.hi)})`
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        {/* controls + lambda */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <p className="eyebrow mb-3">{'// RUN'}</p>
            {workerError && (
              <div role="alert" className="mb-3 rounded-lg border border-syndrome/50 bg-syndrome/[0.08] p-3">
                <p className="text-[12px] leading-relaxed text-text-mid">{workerError}</p>
                <button type="button" onClick={retryWorker} className="btn-secondary mt-2 !px-3 !py-1.5 text-[12px]">
                  Retry sweep
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={toggle} disabled={done || Boolean(workerError)} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40">
                {running ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> {cells.length > 0 && !done ? 'Resume' : 'Run sweep'}
                  </>
                )}
              </button>
              <button type="button" onClick={reset} aria-label="Reset sweep" className="btn-ghost">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p aria-live="polite" className="mt-3 font-mono text-[11px] leading-relaxed text-text-low">
              {workerError
                ? 'worker stopped · results incomplete'
                : done
                  ? `finished · ${(totalTrials / 1000).toFixed(0)}k trials`
                : running
                  ? `${tps.toLocaleString()} trials/s · ${(totalTrials / 1000).toFixed(0)}k total`
                  : totalTrials > 0
                    ? `paused · ${(totalTrials / 1000).toFixed(0)}k trials`
                    : `30 cells · up to ${(MC_MAX_TRIALS / 1000).toFixed(0)}k trials each`}
            </p>
          </div>

          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <p className="eyebrow mb-2">{'// Λ — ERROR SUPPRESSION'}</p>
            <p className="text-[13px] leading-relaxed text-text-mid">
              Λ is the factor logical error drops when distance grows by 2 —
              the below-threshold headline number. At p ={' '}
            </p>
            <div className="mt-2 flex overflow-hidden rounded-lg border border-ink-600">
              {[0.04, 0.06, 0.08].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRefP(p)}
                  aria-pressed={refP === p}
                  className={`flex-1 px-2 py-1.5 font-mono text-[12px] transition-colors duration-200 ${
                    refP === p ? 'bg-plaquette/15 text-plaquette' : 'text-text-mid hover:bg-ink-700 hover:text-text-hi'
                  }`}
                >
                  {(p * 100).toFixed(0)}%
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Λ (3→5)', value: l35 },
                { label: 'Λ (5→7)', value: l57 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-ink-700 bg-ink-850 p-3 text-center">
                  <p className="font-display text-2xl font-bold text-text-hi">
                    {value.status === 'estimated' ? value.value.toFixed(2) : '—'}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-low">{label}</p>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed text-text-low">
                    {value.status === 'estimated'
                      ? <>
                          <span className="block">Wilson endpoint range {value.lo.toFixed(2)}–{value.hi.toFixed(2)} · {value.conclusion}</span>
                          <span className="mt-1 block">failures/trials: {value.counts}</span>
                        </>
                      : value.reason}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-text-low">
              A point estimate Λ &gt; 1 suggests suppression in this model. The lab
              reports a conclusion only after both codes record at least 20 failures,
              and only calls it supported when the conservative Wilson endpoint range excludes 1.{' '}
              <Link to="/papers#2408.13687" className="link-slide text-star hover:text-text-hi">
                Google&apos;s 2024 experiment
              </Link>{' '}
              reported Λ ≈ 2.1 on its hardware experiment.
            </p>
          </div>

          <div className="rounded-xl border border-magic/40 bg-magic/[0.06] p-5">
            <p className="eyebrow mb-2 !text-magic">{'// WHY ~15%, NOT ~1%?'}</p>
            <p className="text-[13px] leading-relaxed text-text-mid">
              Here the curves cross near p ≈ 15% because this lab uses
              code-capacity noise: errors strike once and measurements are
              perfect. Real devices measure syndromes with noisy circuits,
              producing a much lower, model-dependent crossing often near 1%.
              The qualitative test—whether larger distances help—survives, but
              this crossing value does not transfer to hardware.
            </p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-text-low">
              Decoder disclosure: exact shortest-path matching is used for up
              to 16 defects per check type; larger cases use a greedy fallback.
              This page does not execute PyMatching.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const BRUSHES: { pauli: Exclude<Pauli, 0>; label: string; hint: string }[] = [
  { pauli: 1, label: 'X', hint: 'bit flip' },
  { pauli: 2, label: 'Z', hint: 'phase flip' },
  { pauli: 3, label: 'Y', hint: 'both' },
];

/* ---------------- challenges ---------------- */

interface LabChallenge {
  id: string;
  d: number;
  title: string;
  goal: string;
  hint: string;
  lesson: string;
  check: (a: {
    errors: Pauli[];
    syndrome: Set<string>;
    result: DecodeResult | null;
    lat: Lattice;
  }) => boolean;
}

const CHALLENGES: LabChallenge[] = [
  {
    id: 'lonely-defect',
    d: 3,
    title: 'The lonely defect',
    goal: 'Light up exactly one detector.',
    hint: 'In the bulk, an error always lights two detectors — it is a chain with two endpoints. What changes next to a boundary?',
    lesson: 'Boundaries absorb chain endpoints. That is why the decoder must be allowed to match defects to the edge, not just to each other.',
    check: ({ syndrome }) => syndrome.size === 1,
  },
  {
    id: 'invisible',
    d: 3,
    title: 'The invisible error',
    goal: 'Build an error with a completely silent syndrome — that still corrupts the logical qubit.',
    hint: 'A chain with no endpoints triggers nothing. Stretch one from boundary to boundary (try a full column of X).',
    lesson: 'You just applied a logical operator by hand: undetectable, uncorrectable. Its minimum length is the code distance d — the whole game is making such chains unlikely.',
    check: ({ errors, syndrome, lat }) => {
      if (syndrome.size !== 0 || !errors.some((e) => e !== 0)) return false;
      const f = logicalFlips(lat, errors);
      return f.x || f.z;
    },
  },
  {
    id: 'fool-3',
    d: 3,
    title: 'Fool the decoder',
    goal: 'Make the decoder cause a logical error using at most 2 painted errors, then press Decode.',
    hint: 'Put two errors on one logical line (e.g. two X in one column). The cheapest explanation of the syndrome completes your chain the wrong way.',
    lesson: 'd=3 guarantees correction of 1 error; with ⌈d/2⌉ = 2 well-placed errors the most likely explanation is wrong. The decoder did its job perfectly — and still lost.',
    check: ({ errors, result }) => {
      const n = errors.filter((e) => e !== 0).length;
      return result !== null && !result.success && n > 0 && n <= 2;
    },
  },
  {
    id: 'fool-5',
    d: 5,
    title: 'Distance raises the bar',
    goal: 'Now fool the d=5 decoder — with at most 3 painted errors.',
    hint: 'Two errors are always corrected at d=5. You need ⌈d/2⌉ = 3, in a line starting from a boundary, so the short completion crosses the lattice.',
    lesson: 'The minimum number of errors that can fool an ideal decoder grows with distance — exactly why below-threshold scaling suppresses logical errors exponentially.',
    check: ({ errors, result }) => {
      const n = errors.filter((e) => e !== 0).length;
      return result !== null && !result.success && n > 0 && n <= 3;
    },
  },
];

const CHALLENGES_KEY = 'lattice-atlas-lab-challenges';

export default function SurfaceCodeLab() {
  useDocumentTitle('Surface Code Interactive Lab & 3D Viewer');
  const [d, setD] = useState(5);
  const lat = useMemo(() => buildLattice(d), [d]);
  const [errors, setErrors] = useState<Pauli[]>(() => new Array<Pauli>(25).fill(0));
  const [brush, setBrush] = useState<Exclude<Pauli, 0>>(1);
  const [p, setP] = useState(0.08);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [score, setScore] = useState({ trials: 0, fails: 0 });

  // Playback controller state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [labViewMode, setLabViewMode] = useState<'2d' | '3d' | 'dual'>('2d');

  const syndrome = useMemo(() => computeSyndrome(lat, errors), [lat, errors]);
  const errorCount = errors.filter((e) => e !== 0).length;
  const stimUrl = useRef<string | null>(null);

  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [challengesDone, setChallengesDone] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(CHALLENGES_KEY) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });
  const activeChallenge = CHALLENGES.find((c) => c.id === challengeId) ?? null;
  const activeSolved = activeChallenge !== null && challengesDone.has(activeChallenge.id);

  /** Mirror of currentStep so the playback interval reads the live head
   *  without threading it through a (must-stay-pure) setState updater. */
  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  /** Playback auto-stepping interval effect. The step-driven side effects
   *  (halt at the end, decode once the correction is revealed) run in the
   *  async interval callback, never inside a setState updater. */
  useEffect(() => {
    if (!isPlaying) return;
    const speedMs = 1400 / playbackSpeed;
    const timer = setInterval(() => {
      const prev = currentStepRef.current;
      if (prev >= 5) {
        setIsPlaying(false);
        return;
      }
      const next = prev + 1;
      setCurrentStep(next);
      if (next >= 4 && !result) setResult(decode(lat, errors));
    }, speedMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, lat, errors, result]);

  /** Called from the event handlers with the freshly-computed state. */
  const checkChallenge = (nextErrors: Pauli[], nextResult: DecodeResult | null) => {
    const ch = activeChallenge;
    if (!ch || lat.d !== ch.d || challengesDone.has(ch.id)) return;
    const win = ch.check({
      errors: nextErrors,
      syndrome: computeSyndrome(lat, nextErrors),
      result: nextResult,
      lat,
    });
    if (!win) return;
    setChallengesDone((prev) => {
      const next = new Set(prev);
      next.add(ch.id);
      try {
        localStorage.setItem(CHALLENGES_KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const changeD = (next: number) => {
    setD(next);
    setErrors(new Array<Pauli>(next * next).fill(0));
    setResult(null);
    setCurrentStep(1);
    setIsPlaying(false);
  };

  const editQubit = (q: number) => {
    sound.playErrorFlip();
    setResult(null);
    const next = [...errors];
    next[q] = (next[q] ^ brush) as Pauli;
    setErrors(next);
    setCurrentStep(1);
    checkChallenge(next, null);
  };

  const injectNoise = () => {
    sound.playSyndromeTick(780);
    setResult(null);
    const next = sampleDepolarizing(lat.n, p);
    setErrors(next);
    setCurrentStep(1);
    checkChallenge(next, null);
  };

  const runDecoder = () => {
    sound.playDecoderLock();
    const res = decode(lat, errors);
    setResult(res);
    setScore((s) => ({ trials: s.trials + 1, fails: s.fails + (res.success ? 0 : 1) }));
    setCurrentStep(4);
    checkChallenge(errors, res);
  };

  const clear = () => {
    setErrors(new Array<Pauli>(lat.n).fill(0));
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const goToStep = (s: number) => {
    if (s >= 4 && !result) {
      const res = decode(lat, errors);
      setResult(res);
    }
    setCurrentStep(s);
  };

  const startChallenge = (ch: LabChallenge) => {
    setChallengeId(ch.id);
    setShowHint(false);
    changeD(ch.d);
  };

  const downloadStim = () => {
    const text = toStimCircuit(lat, p);
    if (stimUrl.current) URL.revokeObjectURL(stimUrl.current);
    stimUrl.current = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = stimUrl.current;
    a.download = `surface_code_d${d}_p${p.toFixed(3)}.stim`;
    a.click();
  };

  const labTopics = ['surface-code', 'syndrome-extraction-circuits', 'decoding-mwpm'];
  const activeStepMeta = PLAYBACK_STEPS[currentStep] ?? PLAYBACK_STEPS[0];

  return (
    <div className="bg-ink-900">
      {/* header */}
      <header className="lattice-bg">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-16 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [...EASE] }}
            className="eyebrow"
          >
            {'// HANDS-ON'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [...EASE] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            The Surface Code Lab
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [...EASE] }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-text-mid"
          >
            A live distance-{d} rotated surface code. Click data qubits to inject
            errors and watch the stabilizers light up. Step through error correction
            with the interactive playback controller, or inspect an explicitly scoped
            phenomenological history with cumulative data faults and noisy measurements.
          </motion.p>
        </div>
      </header>

      {/* lab */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        {/* View Mode Toggle Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-600 bg-ink-800 p-4">
          <div className="flex min-w-0 w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-low">
              Visualization Mode:
            </span>
            <div className="grid w-full min-w-0 grid-cols-3 overflow-hidden rounded-lg border border-ink-600 bg-ink-850 sm:flex sm:w-auto">
              <button
                type="button"
                onClick={() => setLabViewMode('2d')}
                aria-pressed={labViewMode === '2d'}
                className={`flex min-w-0 items-center justify-center gap-1.5 px-2 py-1.5 font-mono text-[12px] transition-colors sm:px-3 ${
                  labViewMode === '2d'
                    ? 'bg-plaquette/20 text-plaquette font-bold'
                    : 'text-text-mid hover:text-text-hi'
                }`}
              >
                <Grid className="h-3.5 w-3.5" /> 2D Lattice
              </button>
              <button
                type="button"
                onClick={() => setLabViewMode('3d')}
                aria-pressed={labViewMode === '3d'}
                className={`flex min-w-0 items-center justify-center gap-1.5 px-2 py-1.5 font-mono text-[12px] transition-colors sm:px-3 ${
                  labViewMode === '3d'
                    ? 'bg-magic/20 text-magic font-bold'
                    : 'text-text-mid hover:text-text-hi'
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> 3D Spacetime
              </button>
              <button
                type="button"
                onClick={() => setLabViewMode('dual')}
                aria-pressed={labViewMode === 'dual'}
                className={`flex min-w-0 items-center justify-center gap-1.5 px-2 py-1.5 font-mono text-[12px] transition-colors sm:px-3 ${
                  labViewMode === 'dual'
                    ? 'bg-star/20 text-star font-bold'
                    : 'text-text-mid hover:text-text-hi'
                }`}
              >
                <Columns className="h-3.5 w-3.5" /> Dual View
              </button>
            </div>
          </div>

          <div className="font-mono text-[12px] text-text-low">
            Distance <span className="text-text-hi font-bold">d={d}</span> · {lat.n} Data Qubits · {lat.stabilizers.length} Stabilizers
          </div>
        </div>

        {/* Step-by-Step Playback Controller Bar */}
        <div className="mb-6 rounded-xl border border-ink-600 bg-ink-800 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-4">
            <div>
              <p className="eyebrow !text-magic mb-1">{'// PLAYBACK PIPELINE CONTROLLER'}</p>
              <h3 className="font-display text-xl font-semibold text-text-hi">
                Step-by-Step Error Correction Lifecycle
              </h3>
            </div>

            {/* Controls */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => goToStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="btn-ghost !p-2 disabled:opacity-40"
                title="Step Back"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentStep === 5 && !isPlaying) {
                    setCurrentStep(0);
                  }
                  setIsPlaying((prev) => !prev);
                }}
                className="btn-primary !px-4 !py-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : currentStep === 5 ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> Replay Steps
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Play Steps
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => goToStep(Math.min(5, currentStep + 1))}
                disabled={currentStep === 5}
                className="btn-ghost !p-2 disabled:opacity-40"
                title="Step Forward"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Speed Selector */}
              <div className="flex overflow-hidden rounded-lg border border-ink-600 bg-ink-850">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    aria-pressed={playbackSpeed === spd}
                    className={`px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-plaquette/20 text-plaquette font-bold'
                        : 'text-text-low hover:text-text-mid'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={clear}
                className="btn-ghost !p-2"
                title="Reset to Initial State"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {PLAYBACK_STEPS.map((s) => {
              const active = currentStep === s.step;
              const completed = currentStep > s.step;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => goToStep(s.step)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all duration-150 ${
                    active
                      ? 'border-magic bg-magic/15 shadow-lg shadow-magic/10'
                      : completed
                        ? 'border-plaquette/50 bg-plaquette/[0.06] text-text-mid hover:border-plaquette'
                        : 'border-ink-700 bg-ink-850 text-text-low hover:border-ink-600'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                      active ? 'text-magic' : completed ? 'text-plaquette' : 'text-text-low'
                    }`}
                  >
                    Step {s.step}
                  </span>
                  <span
                    className={`mt-1 font-display text-[13px] font-semibold leading-tight ${
                      active ? 'text-text-hi' : 'text-text-mid'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Description Card */}
          <div className="mt-4 rounded-lg border border-ink-700 bg-ink-850 p-4">
            <div className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-wider text-magic">
              <span>Step {activeStepMeta.step}: {activeStepMeta.title}</span>
              <span className="text-text-low">· {activeStepMeta.subtitle}</span>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-text-mid">
              {activeStepMeta.description}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Visualization Column */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* 2D Lattice View */}
            {(labViewMode === '2d' || labViewMode === 'dual') && (
              <div className="rounded-xl border border-ink-600 bg-ink-850 p-4 md:p-6">
                <div className="mb-2 flex items-center justify-between font-mono text-[12px] text-text-low">
                  <span className="text-text-hi font-bold">2D Rotated Surface Code Lattice (Step {currentStep})</span>
                  <span>Click data qubits to paint {PAULI_LABEL[brush]}</span>
                </div>

                <LatticeView
                  lat={lat}
                  errors={errors}
                  syndrome={syndrome}
                  result={result}
                  currentStep={currentStep}
                  onQubitClick={editQubit}
                />

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-ink-700 pt-3 font-mono text-[11px] text-text-low">
                  <span>
                    <span style={{ color: PAULI_COLORS[2] }}>■</span> Z plaquette
                  </span>
                  <span>
                    <span style={{ color: PAULI_COLORS[1] }}>■</span> X plaquette
                  </span>
                  <span>
                    <span style={{ color: SYNDROME }}>■</span> syndrome −1
                  </span>
                  <span>
                    <span style={{ color: OK }}>◌</span> correction chain
                  </span>
                  <span className="ml-auto">click a circle to paint {PAULI_LABEL[brush]}</span>
                </div>
              </div>
            )}

            {/* 3D Spacetime View */}
            {(labViewMode === '3d' || labViewMode === 'dual') && (
              <SpacetimeView3D
                key={d}
                lat={lat}
                errors={errors}
                result={result}
                currentStep={currentStep}
                p={p}
              />
            )}
          </div>

          {/* controls */}
          <aside className="flex flex-col gap-6">
            {/* distance */}
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <p className="eyebrow mb-3">{'// CODE DISTANCE'}</p>
              <div className="flex overflow-hidden rounded-lg border border-ink-600">
                {[3, 5, 7].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => changeD(v)}
                    aria-pressed={d === v}
                    className={`flex-1 px-3 py-2 font-mono text-sm transition-colors duration-200 ${
                      d === v
                        ? 'bg-plaquette/15 text-plaquette'
                        : 'text-text-mid hover:bg-ink-700 hover:text-text-hi'
                    }`}
                  >
                    d={v}
                  </button>
                ))}
              </div>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-text-low">
                {lat.n} data qubits · {lat.stabilizers.length} stabilizers ·
                corrects any ⌊(d−1)/2⌋ = {(d - 1) / 2} error{(d - 1) / 2 === 1 ? '' : 's'}
              </p>
            </div>

            {/* error brush + noise */}
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <p className="eyebrow mb-3">{'// INJECT ERRORS'}</p>
              <div className="flex gap-2">
                {BRUSHES.map((b) => (
                  <button
                    key={b.pauli}
                    type="button"
                    onClick={() => setBrush(b.pauli)}
                    aria-pressed={brush === b.pauli}
                    title={b.hint}
                    className="flex-1 rounded-lg border px-3 py-2 font-mono text-sm font-bold transition-all duration-200"
                    style={
                      brush === b.pauli
                        ? {
                            borderColor: PAULI_COLORS[b.pauli],
                            backgroundColor: `${PAULI_COLORS[b.pauli]}24`,
                            color: PAULI_COLORS[b.pauli],
                          }
                        : { borderColor: 'var(--ink-600)', color: 'var(--text-mid)' }
                    }
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <label className="mt-5 block">
                <span className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-text-low">
                  <span>physical error rate</span>
                  <span className="text-magic">p = {(p * 100).toFixed(0)}%</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={Math.round(p * 100)}
                  onChange={(e) => setP(Number(e.target.value) / 100)}
                  className="mt-2 w-full accent-[#F5B83D]"
                />
              </label>
              <button type="button" onClick={injectNoise} className="btn-secondary mt-4 w-full">
                <Sparkles className="h-4 w-4" /> Inject random noise
              </button>
            </div>

            {/* decode */}
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <p className="eyebrow mb-3">{'// DECODE & FAULT CLASSIFICATION'}</p>
              
              {/* Structured Fault & Event Separation */}
              <div className="mb-4 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between rounded-lg bg-ink-900 p-2 border border-ink-700">
                  <span className="text-text-mid flex items-center gap-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-syndrome" /> 1. Input Faults:
                  </span>
                  <span className="text-text-hi font-bold">{errorCount} Pauli error{errorCount === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-ink-900 p-2 border border-ink-700">
                  <span className="text-text-mid flex items-center gap-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-magic" /> 2. Observed Events:
                  </span>
                  <span className="text-magic font-bold">{syndrome.size} detection event{syndrome.size === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-ink-900 p-2 border border-ink-700">
                  <span className="text-text-mid flex items-center gap-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-stabilizer" /> 3. Residual Faults:
                  </span>
                  <span className={result ? (result.success ? 'text-stabilizer font-bold' : 'text-syndrome font-bold') : 'text-text-low'}>
                    {result ? (result.success ? '0 Logical Flips' : 'Logical Flip (Uncorrected)') : 'Pending Decode'}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={runDecoder}
                  disabled={result !== null && currentStep === 5}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Cpu className="h-4 w-4" /> Decode &amp; correct
                </button>
                <button type="button" onClick={clear} aria-label="Clear all errors" className="btn-ghost">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [...EASE] }}
                  className={`mt-4 rounded-lg border p-3 ${
                    result.success
                      ? 'border-stabilizer/50 bg-stabilizer/10'
                      : 'border-syndrome/60 bg-syndrome/10'
                  }`}
                >
                  <p
                    className={`font-mono text-[12px] font-semibold uppercase tracking-wider ${
                      result.success ? 'text-stabilizer' : 'text-syndrome'
                    }`}
                  >
                    {result.success ? '✓ corrected — logical sector preserved' : '✗ logical error'}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-text-mid">
                    {result.success
                      ? 'The correction chains cancel your errors exactly (up to a harmless stabilizer).'
                      : `The decoder's best guess plus your errors formed a chain crossing the lattice — a logical ${[
                          result.logicalXFlip ? 'X' : '',
                          result.logicalZFlip ? 'Z' : '',
                        ]
                          .filter(Boolean)
                          .join(' and ')} flip the code cannot see.`}
                  </p>
                  {!result.exact && (
                    <p className="mt-1.5 font-mono text-[11px] text-text-low">
                      (many defects — greedy matching used)
                    </p>
                  )}
                </motion.div>
              )}

              {score.trials > 0 && (
                <p className="mt-4 border-t border-ink-700 pt-3 font-mono text-[11px] text-text-low">
                  session: {score.trials} decode{score.trials === 1 ? '' : 's'} ·{' '}
                  {score.fails} logical error{score.fails === 1 ? '' : 's'} ·{' '}
                  {((1 - score.fails / score.trials) * 100).toFixed(0)}% recovered
                </p>
              )}
            </div>

            {/* challenges */}
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <p className="eyebrow mb-1">{'// CHALLENGES'}</p>
              <p className="font-mono text-[11px] text-text-low">
                {challengesDone.size}/{CHALLENGES.length} solved
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {CHALLENGES.map((ch) => {
                  const done = challengesDone.has(ch.id);
                  const active = challengeId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => startChallenge(ch)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                        active
                          ? 'border-plaquette/60 bg-plaquette/10 text-text-hi'
                          : 'border-ink-600 text-text-mid hover:border-plaquette/40 hover:text-text-hi'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          done
                            ? 'border-stabilizer bg-stabilizer/20 text-stabilizer'
                            : 'border-ink-500 text-transparent'
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="flex-1">{ch.title}</span>
                      <span className="font-mono text-[10px] text-text-low">d={ch.d}</span>
                    </button>
                  );
                })}
              </div>
              {activeChallenge && (
                <div
                  className={`mt-3 rounded-lg border p-3 ${
                    activeSolved
                      ? 'border-stabilizer/50 bg-stabilizer/10'
                      : 'border-plaquette/40 bg-plaquette/[0.06]'
                  }`}
                >
                  {activeSolved ? (
                    <>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stabilizer">
                        ✓ solved — {activeChallenge.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-text-mid">
                        {activeChallenge.lesson}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] leading-relaxed text-text-hi">
                        {activeChallenge.goal}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowHint((v) => !v)}
                        className="mt-2 font-mono text-[11px] text-text-low transition-colors hover:text-plaquette"
                      >
                        {showHint ? 'hide hint' : 'show hint'}
                      </button>
                      {showHint && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-text-mid">
                          {activeChallenge.hint}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* stim export */}
            <div className="rounded-xl border border-star/40 bg-star/[0.07] p-5">
              <p className="eyebrow mb-3 !text-star">{'// TAKE IT TO REAL SOFTWARE'}</p>
              <p className="text-[13px] leading-relaxed text-text-mid">
                Download this d={d} lattice as a generated noisy-memory circuit
                in <span className="mono-pill">.stim</span> format. This page does
                not execute the file: inspect it in Crumble or run it separately
                with Stim and a decoder such as PyMatching. Its circuit-level
                noise model is different from the ideal-measurement browser sweep above.
              </p>
              <button type="button" onClick={downloadStim} className="btn-secondary mt-4 w-full !border-star/50 !text-star hover:!bg-star/10">
                <Download className="h-4 w-4" /> Download .stim circuit
              </button>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
                <a
                  href="https://algassert.com/crumble"
                  target="_blank"
                  rel="noreferrer"
                  className="link-slide inline-flex items-center gap-1 text-star hover:text-text-hi"
                >
                  Crumble editor <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://github.com/quantumlib/Stim"
                  target="_blank"
                  rel="noreferrer"
                  className="link-slide inline-flex items-center gap-1 text-star hover:text-text-hi"
                >
                  Stim <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://github.com/oscarhiggott/PyMatching"
                  target="_blank"
                  rel="noreferrer"
                  className="link-slide inline-flex items-center gap-1 text-star hover:text-text-hi"
                >
                  PyMatching <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* how to read it */}
      <section className="mx-auto max-w-7xl px-6 pb-8 md:px-8">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {[
            {
              n: '01',
              title: 'Paint errors',
              body: 'Each circle is a data qubit. Painting X, Z, or Y simulates what noise does between measurement rounds. Errors compose: painting X twice cancels it.',
            },
            {
              n: '02',
              title: 'Read the syndrome',
              body: 'A plaquette turns rose when its stabilizer measurement flips to −1 — that happens only at the endpoints of an error chain. The bulk of a chain is invisible.',
            },
            {
              n: '03',
              title: 'Decode — or get fooled',
              body: 'The decoder pairs up detection events with minimum-weight chains. If error + correction wraps boundary to boundary, you just built a logical error by hand.',
            },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [...EASE] }}
              className="rounded-xl border border-ink-600 bg-ink-800 p-5"
            >
              <p className="font-mono text-[13px] text-plaquette">{s.n}</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-text-hi">{s.title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-text-mid">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <WasmQuantumSandbox />
      </section>

      <ThresholdSection />

      {/* Where the surface code comes from: the toric code on a torus */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="mb-6">
          <p className="eyebrow !text-star">{'// WHERE IT COMES FROM'}</p>
          <h2 className="mt-2 max-w-2xl font-display text-[26px] font-semibold leading-[1.15] text-text-hi md:text-[32px]">
            The surface code is a torus, cut open.
          </h2>
          <p className="mt-3 max-w-2xl leading-[1.7] text-text-mid">
            The planar code you just decoded is the toric code flattened onto a
            patch with boundaries. On the torus itself, the two logical operators
            are loops that wind the donut two different ways — and no local error
            can shrink them away. That is the topology doing the protecting.
          </p>
        </div>
        <TorusTopologyViewer />
      </section>

      {/* cross-links */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-700 pt-6 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-low">
            The theory behind this:
          </span>
          {labTopics.map((id) => {
            const topic = topicById.get(id);
            if (!topic) return null;
            return (
              <Link
                key={id}
                to={`/map?topic=${id}`}
                title={topic.short}
                className="inline-flex items-center gap-1.5 rounded-full border border-plaquette/35 bg-plaquette/[0.08] px-2.5 py-1 text-[13px] text-plaquette transition-colors hover:border-plaquette hover:bg-plaquette/[0.14]"
              >
                {shortName(topic)}
              </Link>
            );
          })}
          <Link
            to="/glossary#code-distance"
            className="link-slide font-mono text-[12px] text-text-mid hover:text-plaquette"
          >
            glossary: code distance →
          </Link>
        </div>
      </section>
    </div>
  );
}

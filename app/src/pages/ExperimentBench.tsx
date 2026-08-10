import { useMemo, useState } from 'react';
import { FlaskConical, Waypoints, Grid3x3, Circle, RotateCcw, Ruler } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { simulate, type SimGate } from '@/lib/statevector';
import {
  percolate,
  spanningProbability,
  pauliStringsCommute,
  blochVector,
  PAULI_CHARS,
  type PauliChar,
} from '@/lib/experiments';

const CYAN = '#22D3EE';
const VIOLET = '#8B5CF6';
const ERR = '#FB7185';
const OK = '#34D399';
const DIM = '#22304d';

function ComputedTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-magic/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-magic">
      ▷ computed, not drawn
    </span>
  );
}

/* ============ Experiment 1 — threshold as percolation ============ */

const GRID_N = 15;
const SWEEP_P = [0.2, 0.3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7];

function sampleGrid(n: number, p: number): boolean[] {
  return Array.from({ length: n * n }, () => Math.random() < p);
}

function PercolationExperiment() {
  const [p, setP] = useState(0.45);
  const [grid, setGrid] = useState<boolean[]>(() => sampleGrid(GRID_N, 0.45));
  const [sweep, setSweep] = useState<{ p: number; ps: number }[]>([]);

  const result = useMemo(() => percolate(GRID_N, grid), [grid]);

  const resample = (np = p) => setGrid(sampleGrid(GRID_N, np));
  const onP = (np: number) => {
    setP(np);
    setGrid(sampleGrid(GRID_N, np));
  };
  const mapTransition = () => {
    setSweep(SWEEP_P.map((pp) => ({ p: pp, ps: spanningProbability(GRID_N, pp, 300) })));
  };

  const cell = 20;
  const size = GRID_N * cell;

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-plaquette" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// EXPERIMENT 01</span>
            <ComputedTag />
          </div>
          <h3 className="mt-1 font-display text-xl font-bold text-text-hi">The threshold is a percolation transition</h3>
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-text-mid">
        Raise the physical error rate and watch error clusters grow. When one cluster <strong>spans</strong> the
        patch left-to-right, an error chain has crossed the code — a logical failure. Near the threshold a
        spanning cluster appears abruptly and won’t go away: that’s the phase transition, computed live by
        union-find on the sampled errors.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[auto_1fr]">
        {/* grid */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px]">
            {grid.map((e, i) => {
              const r = Math.floor(i / GRID_N);
              const c = i % GRID_N;
              const inSpan = result.spanning && result.labels[i] === result.spanningLabel;
              return (
                <rect
                  key={i}
                  x={c * cell + 1.5}
                  y={r * cell + 1.5}
                  width={cell - 3}
                  height={cell - 3}
                  rx={3}
                  fill={e ? (inSpan ? ERR : CYAN) : 'transparent'}
                  fillOpacity={e ? (inSpan ? 0.95 : 0.35) : 1}
                  stroke={e ? (inSpan ? ERR : CYAN) : DIM}
                  strokeOpacity={e ? 0.9 : 0.5}
                  strokeWidth={1}
                />
              );
            })}
          </svg>
          <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
            <span className="text-text-low">{result.clusterCount} clusters</span>
            <span className="font-bold" style={{ color: result.spanning ? ERR : OK }}>
              {result.spanning ? 'SPANNING → logical failure' : 'no spanning cluster'}
            </span>
          </div>
        </div>

        {/* controls + transition plot */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-xs">
            <div className="flex justify-between text-text-mid">
              <span>Physical error rate p</span>
              <span className="font-bold text-text-hi">{(p * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.7}
              step={0.01}
              value={p}
              onChange={(e) => onP(parseFloat(e.target.value))}
              className="mt-2 w-full accent-plaquette"
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => resample()} className="btn-primary text-xs !px-3 !py-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Resample
              </button>
              <button
                type="button"
                onClick={mapTransition}
                className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-plaquette/50 hover:text-plaquette"
              >
                Map the transition (300 samples/point)
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <span className="font-mono text-[10px] uppercase text-text-low">P(spanning) vs p</span>
            <svg viewBox="0 0 300 150" className="mt-1 w-full">
              <line x1="30" y1="120" x2="290" y2="120" stroke={DIM} strokeWidth="1" />
              <line x1="30" y1="15" x2="30" y2="120" stroke={DIM} strokeWidth="1" />
              <text x="26" y="20" textAnchor="end" fill="#5B6a8c" fontSize="8" fontFamily="monospace">1</text>
              <text x="26" y="122" textAnchor="end" fill="#5B6a8c" fontSize="8" fontFamily="monospace">0</text>
              {sweep.length > 0 ? (
                <>
                  <path
                    d={sweep
                      .map((s, i) => {
                        const x = 30 + ((s.p - 0.15) / (0.7 - 0.15)) * 260;
                        const y = 120 - s.ps * 105;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={VIOLET}
                    strokeWidth="2.5"
                  />
                  {sweep.map((s) => {
                    const x = 30 + ((s.p - 0.15) / (0.7 - 0.15)) * 260;
                    const y = 120 - s.ps * 105;
                    return <circle key={s.p} cx={x} cy={y} r="2.5" fill={VIOLET} />;
                  })}
                </>
              ) : (
                <text x="160" y="70" textAnchor="middle" fill="#5B6a8c" fontSize="10" fontFamily="monospace">
                  “Map the transition” to plot the S-curve
                </text>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Experiment 2 — Bloch sphere + measurement ============ */

type Gate1 = 'H' | 'X' | 'Z' | 'S' | 'T';

function BlochExperiment() {
  const [gates, setGates] = useState<Gate1[]>(['H']);
  const [shots, setShots] = useState<{ zero: number; one: number } | null>(null);

  const bloch = useMemo(() => {
    const state = simulate(gates.map((type) => ({ type, qubit: 0 } satisfies SimGate)), 1);
    return blochVector(state[0], state[1]);
  }, [gates]);

  const add = (g: Gate1) => {
    setGates((prev) => [...prev.slice(-11), g]);
    setShots(null);
  };
  const reset = () => {
    setGates([]);
    setShots(null);
  };
  const measure = () => {
    let zero = 0;
    for (let i = 0; i < 200; i++) if (Math.random() < bloch.p0) zero++;
    setShots({ zero, one: 200 - zero });
  };

  // front view: x → horizontal, z → vertical; y shown as marker size/opacity
  const cx = 90 + bloch.x * 70;
  const cy = 90 - bloch.z * 70;

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-star" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// EXPERIMENT 02</span>
            <ComputedTag />
          </div>
          <h3 className="mt-1 font-display text-xl font-bold text-text-hi">Rotate a qubit, then measure it</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['H', 'X', 'Z', 'S', 'T'] as Gate1[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => add(g)}
              className="h-7 w-8 rounded border border-star/50 bg-star/10 font-mono text-xs font-bold text-star hover:bg-star/20"
            >
              {g}
            </button>
          ))}
          <button type="button" onClick={reset} className="rounded border border-ink-600 bg-ink-800 px-2 text-text-low hover:text-text-hi" title="Reset to |0⟩">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr]">
        {/* Bloch front view */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <svg viewBox="0 0 180 180" className="w-full max-w-[220px]">
            <circle cx="90" cy="90" r="70" fill="none" stroke={DIM} strokeWidth="1.5" />
            <ellipse cx="90" cy="90" rx="70" ry="22" fill="none" stroke={DIM} strokeWidth="1" strokeDasharray="3 3" />
            <line x1="20" y1="90" x2="160" y2="90" stroke={DIM} strokeWidth="1" />
            <line x1="90" y1="20" x2="90" y2="160" stroke={DIM} strokeWidth="1" />
            <text x="90" y="16" textAnchor="middle" fill="#5B6a8c" fontSize="9" fontFamily="monospace">|0⟩</text>
            <text x="90" y="174" textAnchor="middle" fill="#5B6a8c" fontSize="9" fontFamily="monospace">|1⟩</text>
            {/* state vector */}
            <line x1="90" y1="90" x2={cx} y2={cy} stroke={CYAN} strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r={5 + (bloch.y + 1) * 1.5} fill={CYAN} fillOpacity={0.5 + (bloch.y + 1) * 0.2} stroke={CYAN} />
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-[11px]">
            <div className="text-text-low">gates: <span className="text-text-hi">{gates.length ? gates.join(' → ') : '(none, state = |0⟩)'}</span></div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Stat3 label="⟨X⟩" v={bloch.x} />
              <Stat3 label="⟨Y⟩" v={bloch.y} />
              <Stat3 label="⟨Z⟩" v={bloch.z} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat3 label="P(0)" v={bloch.p0} pct />
              <Stat3 label="P(1)" v={bloch.p1} pct />
            </div>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <button type="button" onClick={measure} className="btn-primary text-xs !px-3 !py-1.5">
              Measure — 200 shots
            </button>
            {shots && (
              <div className="mt-3 font-mono text-[11px]">
                <BarRow label="|0⟩" n={shots.zero} total={200} color={CYAN} />
                <BarRow label="|1⟩" n={shots.one} total={200} color={VIOLET} />
                <p className="mt-1.5 text-text-low">Sampled from the Born rule (P = |amplitude|²) — try re-measuring.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat3({ label, v, pct }: { label: string; v: number; pct?: boolean }) {
  return (
    <div className="rounded bg-ink-900 p-2 text-center">
      <div className="text-[9px] uppercase text-text-low">{label}</div>
      <div className="font-bold text-text-hi">{pct ? `${(v * 100).toFixed(0)}%` : v.toFixed(3)}</div>
    </div>
  );
}

function BarRow({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <span className="w-6 text-text-mid">{label}</span>
      <div className="h-3 flex-1 rounded bg-ink-800">
        <div className="h-3 rounded" style={{ width: `${(n / total) * 100}%`, background: color }} />
      </div>
      <span className="w-14 text-right text-text-hi">{n}/{total}</span>
    </div>
  );
}

/* ============ Experiment 3 — Pauli commutation playground ============ */

const CLASH = ERR;

function PauliStrip({
  which,
  arr,
  clashes,
  onCycle,
}: {
  which: 'a' | 'b';
  arr: PauliChar[];
  clashes: number[];
  onCycle: (which: 'a' | 'b', i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 font-mono text-xs text-text-low">{which === 'a' ? 'A' : 'B'}</span>
      {arr.map((pch, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onCycle(which, i)}
          className="h-9 w-9 rounded-lg border-2 font-mono text-sm font-bold"
          style={{
            borderColor: clashes.includes(i) ? CLASH : '#2A3554',
            background: clashes.includes(i) ? CLASH + '22' : 'transparent',
            color: pch === 'I' ? '#5B6a8c' : which === 'a' ? CYAN : VIOLET,
          }}
        >
          {pch}
        </button>
      ))}
    </div>
  );
}

function CommutationExperiment() {
  const [a, setA] = useState<PauliChar[]>(['X', 'X', 'I', 'I']);
  const [b, setB] = useState<PauliChar[]>(['Z', 'Z', 'I', 'I']);
  const { commute, clashes } = pauliStringsCommute(a, b);

  const cycle = (which: 'a' | 'b', i: number) => {
    const setter = which === 'a' ? setA : setB;
    const arr = which === 'a' ? a : b;
    const next = arr.slice();
    next[i] = PAULI_CHARS[(PAULI_CHARS.indexOf(arr[i]) + 1) % 4];
    setter(next);
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Waypoints className="h-4 w-4 text-plaquette" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// EXPERIMENT 03</span>
            <ComputedTag />
          </div>
          <h3 className="mt-1 font-display text-xl font-bold text-text-hi">Do these two operators commute?</h3>
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-text-mid">
        Click any site to cycle it through I, X, Y, Z. Two Pauli strings commute iff an <strong>even</strong>
        number of sites anticommute (rose) — a single-site X and Z anticommute; equal or identity sites don’t.
        This exact GF(2) parity is the rule that forces every pair of stabilizer generators to commute.
      </p>

      <div className="mt-5 space-y-2 rounded-xl border border-ink-700 bg-ink-950 p-5">
        <PauliStrip which="a" arr={a} clashes={clashes} onCycle={cycle} />
        <PauliStrip which="b" arr={b} clashes={clashes} onCycle={cycle} />
      </div>

      <div
        className="mt-4 rounded-xl border p-3 font-mono text-sm font-bold"
        style={{ borderColor: commute ? OK : CLASH, background: (commute ? OK : CLASH) + '14', color: commute ? OK : CLASH }}
      >
        {clashes.length} anticommuting site{clashes.length === 1 ? '' : 's'} ({clashes.length % 2 === 0 ? 'even' : 'odd'})
        {' → '}
        {commute ? 'COMMUTE — a valid stabilizer pair' : 'ANTICOMMUTE — cannot both be stabilizers'}
      </div>
    </div>
  );
}

/* ============ Experiment 4 — the distance ruler ============ */

function RulerFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-lg border border-ink-800 bg-ink-950 p-2.5">
      <span className="text-text-low">{label}</span>
      <span className="font-bold text-text-hi">{value}</span>
    </div>
  );
}

function DistanceRulerExperiment() {
  const [d, setD] = useState(5);
  const corrects = Math.floor((d - 1) / 2);
  const cell = 32;
  const pad = 28;
  const size = (d - 1) * cell + 2 * pad;
  const mid = Math.floor(d / 2); // the middle row carries the minimal logical chain

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-plaquette" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// EXPERIMENT 04</span>
            <ComputedTag />
          </div>
          <h3 className="mt-1 font-display text-xl font-bold text-text-hi">How far is “far enough”? The code distance</h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="mr-1 text-text-low">distance d</span>
          {[3, 5, 7].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setD(v)}
              className={`h-7 w-8 rounded border font-bold ${d === v ? 'border-plaquette bg-plaquette text-ink-950' : 'border-ink-600 text-plaquette'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-text-mid">
        The shortest operator that flips the logical qubit is a chain crossing the whole code from one boundary
        to the other — exactly <strong>d</strong> qubits long. That length <em>is</em> the code distance: it
        takes ⌊(d−1)/2⌋ errors before a chain can span the code and cause an undetectable logical flip. Slide d
        and watch the ruler grow.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px]">
            <line x1={pad - 15} y1={pad - 15} x2={pad - 15} y2={size - pad + 15} stroke={VIOLET} strokeWidth={3} strokeOpacity={0.6} />
            <line x1={size - pad + 15} y1={pad - 15} x2={size - pad + 15} y2={size - pad + 15} stroke={VIOLET} strokeWidth={3} strokeOpacity={0.6} />
            <line x1={pad} y1={pad + mid * cell} x2={pad + (d - 1) * cell} y2={pad + mid * cell} stroke={ERR} strokeWidth={4} />
            {Array.from({ length: d * d }).map((_, i) => {
              const r = Math.floor(i / d);
              const c = i % d;
              const onChain = r === mid;
              return (
                <circle
                  key={i}
                  cx={pad + c * cell}
                  cy={pad + r * cell}
                  r={onChain ? 7 : 4}
                  fill={onChain ? ERR : DIM}
                  stroke={onChain ? ERR : DIM}
                />
              );
            })}
          </svg>
          <div className="mt-2 text-center font-mono text-[11px]" style={{ color: ERR }}>
            shortest logical = {d} qubits (the ruler)
          </div>
        </div>

        <div className="flex flex-col gap-2.5 font-mono text-xs">
          <RulerFact label="Code distance d" value={`${d}`} />
          <RulerFact label="Shortest logical operator" value={`${d} qubits · boundary → boundary`} />
          <RulerFact label="Guaranteed correctable errors" value={`⌊(d−1)/2⌋ = ${corrects}`} />
          <RulerFact label="Data qubits (rotated patch)" value={`d² = ${d * d}`} />
          <p className="text-[11px] leading-relaxed text-text-low">
            A logical failure needs an error chain reaching all the way across, so it takes more errors as d
            grows — which is exactly why, below threshold, a bigger code suppresses logical errors.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============ page ============ */

export default function ExperimentBench() {
  useDocumentTitle('Experiment Bench — Lattice Atlas');

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
      <div className="mb-8">
        <p className="eyebrow !text-plaquette flex items-center gap-2">
          <FlaskConical className="h-4 w-4" /> {'// EXPERIMENT BENCH'}
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-[30px] font-semibold leading-[1.12] text-text-hi md:text-[40px]">
          Turn a knob. Watch a real invariant appear.
        </h1>
        <p className="mt-3 max-w-2xl leading-[1.7] text-text-mid">
          Every experiment here runs genuine computation — union-find, exact statevectors, GF(2) parity — so
          the phenomenon <em>emerges</em> from the math rather than being drawn for you. Each card is tagged
          <span className="mx-1 font-mono text-[11px] text-magic">▷ computed, not drawn</span> as proof.
        </p>
      </div>

      <div className="space-y-8">
        <PercolationExperiment />
        <BlochExperiment />
        <CommutationExperiment />
        <DistanceRulerExperiment />
      </div>
    </div>
  );
}

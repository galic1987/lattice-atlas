import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Cpu,
  Download,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  buildLattice,
  computeSyndrome,
  decode,
  sampleDepolarizing,
  toStimCircuit,
  PAULI_LABEL,
  type DecodeResult,
  type Lattice,
  type Pauli,
  type Stabilizer,
} from '@/lib/surfaceCode';
import { topicById, shortName } from '@/data';

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
/* Lattice SVG                                                         */
/* ------------------------------------------------------------------ */

function LatticeView({
  lat,
  errors,
  syndrome,
  result,
  onQubitClick,
}: {
  lat: Lattice;
  errors: Pauli[];
  syndrome: Set<string>;
  result: DecodeResult | null;
  onQubitClick: (q: number) => void;
}) {
  const reduce = useReducedMotion();
  const size = (lat.d - 1) * CELL + 2 * PAD;
  const stabById = useMemo(
    () => new Map(lat.stabilizers.map((s) => [s.id, s])),
    [lat],
  );
  const correctedQubits = useMemo(() => {
    if (!result) return new Set<number>();
    return new Set(result.correction.flatMap((p, q) => (p !== 0 ? [q] : [])));
  }, [result]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full"
      role="img"
      aria-label={`Distance-${lat.d} rotated surface code lattice`}
    >
      {/* stabilizer faces */}
      {lat.stabilizers.map((s) => {
        const hot = syndrome.has(s.id);
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
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
              fill={hot ? SYNDROME : base}
              fillOpacity={hot ? 1 : 0.55}
            >
              {s.type}
            </text>
          </g>
        );
      })}

      {/* decoder correction chains */}
      {result?.matches.map((m, i) => {
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
        return (
          <g key={q} onClick={() => onQubitClick(q)} className="cursor-pointer">
            {corrected && (
              <circle cx={x} cy={y} r={16} fill="none" stroke={OK} strokeWidth={2} strokeDasharray="4 3" />
            )}
            <circle
              cx={x}
              cy={y}
              r={11}
              fill={e === 0 ? '#1B2743' : PAULI_COLORS[e]}
              stroke={e === 0 ? '#3D5178' : PAULI_COLORS[e]}
              strokeWidth={1.5}
              className="transition-[fill,stroke] duration-150 hover:stroke-[#EAF0FB]"
            />
            {e !== 0 && (
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
                {PAULI_LABEL[e]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
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

export default function SurfaceCodeLab() {
  const [d, setD] = useState(5);
  const lat = useMemo(() => buildLattice(d), [d]);
  const [errors, setErrors] = useState<Pauli[]>(() => new Array<Pauli>(25).fill(0));
  const [brush, setBrush] = useState<Exclude<Pauli, 0>>(1);
  const [p, setP] = useState(0.08);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [score, setScore] = useState({ trials: 0, fails: 0 });

  const syndrome = useMemo(() => computeSyndrome(lat, errors), [lat, errors]);
  const errorCount = errors.filter((e) => e !== 0).length;
  const stimUrl = useRef<string | null>(null);

  const changeD = (next: number) => {
    setD(next);
    setErrors(new Array<Pauli>(next * next).fill(0));
    setResult(null);
  };

  const editQubit = (q: number) => {
    setResult(null);
    setErrors((prev) => {
      const next = [...prev];
      next[q] = (next[q] ^ brush) as Pauli;
      return next;
    });
  };

  const injectNoise = () => {
    setResult(null);
    setErrors(sampleDepolarizing(lat.n, p));
  };

  const runDecoder = () => {
    const res = decode(lat, errors);
    setResult(res);
    setScore((s) => ({ trials: s.trials + 1, fails: s.fails + (res.success ? 0 : 1) }));
  };

  const clear = () => {
    setErrors(new Array<Pauli>(lat.n).fill(0));
    setResult(null);
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
            errors and watch the stabilizers light up. Then run the matching
            decoder and see whether it recovers your state — or gets fooled into
            a logical error. Export any configuration as a Stim circuit to
            continue in real research software.
          </motion.p>
        </div>
      </header>

      {/* lab */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* lattice card */}
          <div className="rounded-xl border border-ink-600 bg-ink-850 p-4 md:p-6">
            <LatticeView
              lat={lat}
              errors={errors}
              syndrome={syndrome}
              result={result}
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
              <p className="eyebrow mb-3">{'// DECODE'}</p>
              <p className="font-mono text-[12px] leading-relaxed text-text-mid">
                {errorCount} error{errorCount === 1 ? '' : 's'} ·{' '}
                <span className={syndrome.size > 0 ? 'text-syndrome' : ''}>
                  {syndrome.size} detection event{syndrome.size === 1 ? '' : 's'}
                </span>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={runDecoder}
                  disabled={result !== null}
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
                    {result.success ? '✓ corrected — state recovered' : '✗ logical error'}
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

            {/* stim export */}
            <div className="rounded-xl border border-star/40 bg-star/[0.07] p-5">
              <p className="eyebrow mb-3 !text-star">{'// TAKE IT TO REAL SOFTWARE'}</p>
              <p className="text-[13px] leading-relaxed text-text-mid">
                Download this d={d} lattice as a noisy memory experiment in{' '}
                <span className="mono-pill">.stim</span> format — the simulator
                used in the below-threshold experiments. Paste it into Crumble
                to step through the circuit, or sample it with Stim + PyMatching.
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

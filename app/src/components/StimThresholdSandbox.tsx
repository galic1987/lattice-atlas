import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Play, Pause, RotateCcw, TrendingDown } from 'lucide-react';
import { sound } from '@/lib/sound';
import type { McCell, McCommand, McProgress } from '@/lib/threshold.worker';

// Distances kept to 3/5/7: the exact TypeScript matching decoder stays
// genuinely real-time here. Physical error rates bracket the crossing (the
// threshold emerges from the data — it is not hard-coded).
const DISTANCES = [3, 5, 7];
const P_VALUES = [0.05, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17];
const MAX_TRIALS = 40000;
const MIN_PLOT_TRIALS = 200; // don't plot a cell until it has enough samples

const DIST_COLORS: Record<number, string> = { 3: '#F43F5E', 5: '#F5B83D', 7: '#22D3EE' };

const PX_MIN = Math.log10(0.05);
const PX_MAX = Math.log10(0.17);
const PY_MIN = Math.log10(1e-4);
const PY_MAX = Math.log10(0.5);
const xOf = (p: number) => 50 + ((Math.log10(p) - PX_MIN) / (PX_MAX - PX_MIN)) * 320;
const yOf = (pL: number) => {
  const c = Math.min(0.5, Math.max(1e-4, pL));
  return 250 - ((Math.log10(c) - PY_MIN) / (PY_MAX - PY_MIN)) * 220;
};

export default function StimThresholdSandbox() {
  const workerRef = useRef<Worker | null>(null);
  const [cells, setCells] = useState<McCell[]>([]);
  const [tps, setTps] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Terminate the worker on unmount so no background sampling leaks.
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const ensureWorker = (): Worker | null => {
    if (workerRef.current) return workerRef.current;
    let worker: Worker;
    try {
      worker = new Worker(new URL('../lib/threshold.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      setError('The Monte Carlo worker could not start in this browser.');
      return null;
    }
    worker.onmessage = (e: MessageEvent<McProgress>) => {
      setError(null);
      setCells(e.data.cells);
      setTps(e.data.trialsPerSec);
      if (e.data.done) {
        setDone(true);
        setRunning(false);
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      setError(event.message || 'The Monte Carlo worker stopped unexpectedly.');
      setRunning(false);
    };
    workerRef.current = worker;
    return worker;
  };

  const toggle = () => {
    const worker = ensureWorker();
    if (!worker) return;
    if (running) {
      worker.postMessage({ cmd: 'pause' } satisfies McCommand);
      setRunning(false);
      return;
    }
    sound.playDecoderLock();
    if (cells.length > 0 && !done) {
      worker.postMessage({ cmd: 'resume' } satisfies McCommand);
    } else {
      worker.postMessage({
        cmd: 'start',
        distances: DISTANCES,
        pValues: P_VALUES,
        maxTrials: MAX_TRIALS,
      } satisfies McCommand);
      setDone(false);
    }
    setError(null);
    setRunning(true);
  };

  const reset = () => {
    workerRef.current?.postMessage({ cmd: 'pause' } satisfies McCommand);
    setCells([]);
    setRunning(false);
    setDone(false);
    setTps(0);
  };

  const totalTrials = cells.reduce((a, c) => a + c.trials, 0);

  const curves = useMemo(() => {
    return DISTANCES.map((d) => {
      const points = cells
        .filter((c) => c.d === d && c.trials >= MIN_PLOT_TRIALS)
        .sort((a, b) => a.p - b.p)
        .map((c) => ({ p: c.p, pL: c.fails / c.trials, trials: c.trials }));
      return { d, points };
    });
  }, [cells]);

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-plaquette" />
            <h3 className="font-display text-xl font-bold text-text-hi">Live Monte Carlo Threshold Sandbox (Pₗ vs p)</h3>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] font-bold text-magic">REAL · TS DECODER</span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-text-mid">
            A genuine Monte Carlo sweep: each trial samples depolarizing noise and runs this atlas’s
            TypeScript matching decoder in a Web Worker — <strong>not Stim, not WASM</strong>. The rate below
            is your machine’s measured throughput; the d = 3, 5, 7 curves sharpen live and cross at the threshold.
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={toggle} className="btn-primary">
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? 'Pause' : cells.length > 0 && !done ? 'Resume' : 'Run Monte Carlo'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-ink-700 bg-ink-950 p-2 text-text-low hover:text-text-hi"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live measured stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
        <Stat label="Measured rate" value={tps > 0 ? `${tps.toLocaleString()} trials/s` : '—'} />
        <Stat label="Total trials" value={totalTrials.toLocaleString()} />
        <Stat label="Per (d,p) cap" value={MAX_TRIALS.toLocaleString()} />
        <Stat label="Status" value={done ? 'converged' : running ? 'sampling…' : cells.length ? 'paused' : 'idle'} />
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-syndrome/40 bg-syndrome/10 p-2.5 font-mono text-xs text-syndrome">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Live log-log plot */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="font-mono text-[11px] text-text-low">
            <span className="font-bold text-text-hi">Logical error Pₗ vs physical error p</span> · log–log
          </div>
          <svg viewBox="0 0 400 300" className="mt-2 w-full">
            {/* axes */}
            <line x1="50" y1="250" x2="380" y2="250" stroke="#3D5178" strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="250" stroke="#3D5178" strokeWidth="1.5" />
            {/* p ticks */}
            {P_VALUES.map((p) => (
              <text key={p} x={xOf(p)} y={264} textAnchor="middle" fill="#5B6a8c" fontSize="8" fontFamily="monospace">
                {(p * 100).toFixed(0)}%
              </text>
            ))}
            {/* Pl gridlines */}
            {[0.1, 0.01, 0.001].map((g) => (
              <g key={g}>
                <line x1="50" y1={yOf(g)} x2="380" y2={yOf(g)} stroke="#1c2842" strokeWidth="1" />
                <text x="46" y={yOf(g) + 3} textAnchor="end" fill="#5B6a8c" fontSize="8" fontFamily="monospace">
                  {g}
                </text>
              </g>
            ))}

            {curves.map(({ d, points }) => {
              if (points.length === 0) return null;
              const path = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xOf(pt.p)} ${yOf(pt.pL)}`).join(' ');
              return (
                <g key={d}>
                  <path d={path} fill="none" stroke={DIST_COLORS[d]} strokeWidth="2.5" strokeOpacity="0.9" />
                  {points.map((pt) => (
                    <circle key={pt.p} cx={xOf(pt.p)} cy={yOf(pt.pL)} r="2.5" fill={DIST_COLORS[d]} />
                  ))}
                </g>
              );
            })}

            {cells.length === 0 && (
              <text x="215" y="145" textAnchor="middle" fill="#5B6a8c" fontSize="11" fontFamily="monospace">
                Press “Run Monte Carlo” to sample live
              </text>
            )}
          </svg>

          <div className="mt-1 flex flex-wrap justify-center gap-4 font-mono text-xs">
            {DISTANCES.map((d) => (
              <span key={d} className="flex items-center gap-1.5" style={{ color: DIST_COLORS[d] }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DIST_COLORS[d] }} /> d={d}
              </span>
            ))}
          </div>
        </div>

        {/* Reasoning */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-5">
            <h4 className="eyebrow mb-2 !text-stabilizer">// READING THE CROSSING</h4>
            <p className="text-xs leading-relaxed text-text-mid">
              The point where the d = 3, 5, 7 curves meet is the <strong>threshold</strong> pₜₕ. To its left
              (p &lt; pₜₕ) a larger code distance drives Pₗ <span className="text-stabilizer inline-flex items-center gap-1">down<TrendingDown className="h-3 w-3" /></span>
              exponentially; to its right, larger d makes things worse. You’re reading it straight off live
              sampled data — nothing here is a fitted or hard-coded curve.
            </p>
          </div>
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-[11px] text-text-low leading-relaxed">
            This is the code-capacity model (per-qubit depolarizing + one round of perfect syndrome extraction),
            so the crossing sits higher than a circuit-level threshold. It is the same real decoder used across
            the Lab, just swept live over (d, p).
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-950 p-2.5">
      <span className="block text-[10px] uppercase text-text-low">{label}</span>
      <span className="mt-0.5 block font-bold text-text-hi">{value}</span>
    </div>
  );
}

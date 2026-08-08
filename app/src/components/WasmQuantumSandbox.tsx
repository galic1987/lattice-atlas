import { useCallback, useState } from 'react';
import { Cpu, Download, Play, Terminal } from 'lucide-react';
import {
  MAX_EXACT_DEFECTS,
  buildLattice,
  decode,
  sampleDepolarizing,
  toStimCircuit,
} from '@/lib/surfaceCode';

interface Results {
  totalShots: number;
  logicalErrors: number;
  logicalErrorRate: number;
  interval: [number, number];
  executionTimeMs: number;
  stimCircuit: string;
  seed: number;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function wilson95(failures: number, shots: number): [number, number] {
  const z = 1.959963984540054;
  const observed = failures / shots;
  const denominator = 1 + z * z / shots;
  const center = (observed + z * z / (2 * shots)) / denominator;
  const half = z * Math.sqrt((observed * (1 - observed) + z * z / (4 * shots)) / shots) / denominator;
  return [Math.max(0, center - half), Math.min(1, center + half)];
}

function percent(value: number) {
  return `${(value * 100).toFixed(value < 0.001 ? 4 : 3)}%`;
}

export default function WasmQuantumSandbox() {
  const [distance, setDistance] = useState(3);
  const [errorRate, setErrorRate] = useState(0.005);
  const [shots, setShots] = useState(1000);
  const [seed, setSeed] = useState(20260807);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const runSimulation = useCallback(() => {
    setIsRunning(true);
    window.setTimeout(() => {
      const start = performance.now();
      const lattice = buildLattice(distance);
      const rng = seededRandom(seed);
      let failures = 0;
      for (let shot = 0; shot < shots; shot += 1) {
        const errors = sampleDepolarizing(lattice.n, errorRate, rng);
        if (!decode(lattice, errors).success) failures += 1;
      }
      setResults({
        totalShots: shots,
        logicalErrors: failures,
        logicalErrorRate: failures / shots,
        interval: wilson95(failures, shots),
        executionTimeMs: Math.max(performance.now() - start, 0),
        stimCircuit: toStimCircuit(lattice, errorRate),
        seed,
      });
      setIsRunning(false);
    }, 0);
  }, [distance, errorRate, seed, shots]);

  const downloadStim = () => {
    if (!results) return;
    const blob = new Blob([results.stimCircuit], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `surface_code_d${distance}_p${errorRate}.stim`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-plaquette/40 bg-ink-900 p-5 shadow-glow-cyan md:p-6" aria-labelledby="browser-sandbox-title">
      <div className="flex flex-col gap-3 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette"><Cpu className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// MAIN-THREAD TYPESCRIPT TOY MODEL</span>
            <h3 id="browser-sandbox-title" className="font-display text-xl font-bold text-text-hi">Browser code-capacity sandbox</h3>
          </div>
        </div>
        <span className="rounded border border-magic/40 bg-magic/10 px-3 py-1 font-mono text-xs text-magic">NOT WASM · NOT A WORKER · NOT HARDWARE</span>
      </div>

      <div className="mt-5 rounded-xl border border-magic/30 bg-magic/5 p-4 text-xs leading-5 text-text-mid">
        Each shot samples independent X/Y/Z data-qubit errors with total probability <span className="font-mono text-magic">p</span>, measures ideal syndromes once, and applies this site&apos;s exact-small/greedy-large decoder. It omits gate, reset, measurement, leakage, correlation, and time-dependent faults; it cannot establish a hardware or universal threshold.
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <fieldset className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <legend className="px-1 font-mono text-xs text-text-mid">Code distance</legend>
          <div className="mt-2 flex gap-2">
            {[3, 5, 7].map((value) => (
              <button key={value} type="button" onClick={() => setDistance(value)} aria-pressed={distance === value} className={distance === value ? 'flex-1 rounded-lg border border-plaquette bg-plaquette/20 py-2 font-mono text-xs font-bold text-plaquette' : 'flex-1 rounded-lg border border-ink-600 bg-ink-850 py-2 font-mono text-xs text-text-mid hover:border-ink-500'}>d={value}</button>
            ))}
          </div>
        </fieldset>

        <label className="rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-xs text-text-mid">
          <span className="flex justify-between gap-3">Data-Pauli error p <output className="font-bold text-syndrome">{percent(errorRate)}</output></span>
          <input type="range" min="0.001" max="0.15" step="0.001" value={errorRate} onChange={(event) => setErrorRate(Number(event.target.value))} aria-valuetext={`${percent(errorRate)} independent data-Pauli error probability`} className="mt-4 w-full accent-syndrome" />
        </label>

        <fieldset className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <legend className="px-1 font-mono text-xs text-text-mid">Shots</legend>
          <div className="mt-2 flex gap-2">
            {[100, 1000, 5000].map((value) => (
              <button key={value} type="button" onClick={() => setShots(value)} aria-pressed={shots === value} className={shots === value ? 'flex-1 rounded-lg border border-star bg-star/20 py-2 font-mono text-xs font-bold text-star' : 'flex-1 rounded-lg border border-ink-600 bg-ink-850 py-2 font-mono text-xs text-text-mid hover:border-ink-500'}>{value >= 1000 ? `${value / 1000}k` : value}</button>
            ))}
          </div>
        </fieldset>

        <label className="rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-xs text-text-mid">
          Deterministic seed
          <input type="number" value={seed} min="0" max="4294967295" onChange={(event) => setSeed(Number(event.target.value) >>> 0)} className="mt-3 w-full rounded border border-ink-600 bg-ink-850 px-3 py-2 text-text-hi" />
        </label>
      </div>

      <button type="button" onClick={runSimulation} disabled={isRunning} className="btn-primary mt-6 w-full">
        <Play className="h-4 w-4" aria-hidden="true" /> {isRunning ? 'Sampling on the browser main thread…' : `Run ${shots.toLocaleString()} deterministic shots`}
      </button>

      {results && (
        <div className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-5" role="status" aria-live="polite">
          <span className="font-mono text-[10px] uppercase tracking-wider text-stabilizer">Local toy-model result</span>
          <h4 className="mt-1 font-display text-lg font-bold text-text-hi">Logical failures: {results.logicalErrors} / {results.totalShots}</h4>
          <p className="mt-2 font-mono text-sm text-text-mid">
            estimate {percent(results.logicalErrorRate)} · Wilson 95% interval [{percent(results.interval[0])}, {percent(results.interval[1])}]
          </p>
          {results.logicalErrors === 0 && <p className="mt-2 text-xs text-magic">Zero observed failures does not mean zero risk; the interval&apos;s upper bound is the supported statement.</p>}
          <p className="mt-2 text-xs leading-5 text-text-low">
            Seed {results.seed} · {results.executionTimeMs.toFixed(1)} ms on this device · decoder is exact only while each check type has at most {MAX_EXACT_DEFECTS} defects, then greedy.
          </p>

          <div className="mt-5 min-w-0">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-text-mid">
              <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-plaquette" aria-hidden="true" /> Generated Stim text—not executed here</span>
              <button type="button" onClick={downloadStim} className="inline-flex items-center gap-1 text-plaquette hover:underline"><Download className="h-3 w-3" aria-hidden="true" /> Download text</button>
            </div>
            <pre className="max-h-40 max-w-full overflow-auto rounded-lg border border-ink-800 bg-ink-900 p-3 font-mono text-xs text-text-mid">{results.stimCircuit}</pre>
          </div>
        </div>
      )}
    </section>
  );
}

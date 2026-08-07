import { useCallback, useRef, useState } from 'react';
import {
  Cpu,
  Download,
  Play,
  Terminal,
  Zap,
} from 'lucide-react';
import { buildLattice, decode, sampleDepolarizing, toStimCircuit } from '@/lib/surfaceCode';

interface LocalModelResults {
  distance: number;
  errorRate: number;
  totalShots: number;
  logicalFailures: number;
  logicalFailureRate: number;
  interval95: [number, number];
  exactMatchingShots: number;
  executionTimeMs: number;
  shotsPerSec: number;
  stimCircuit: string;
}

/** Wilson score interval: unlike a normal approximation, it remains useful at zero observed failures. */
function wilson95(events: number, trials: number): [number, number] {
  const z = 1.96;
  const zSquared = z * z;
  const observed = events / trials;
  const denominator = 1 + zSquared / trials;
  const center = (observed + zSquared / (2 * trials)) / denominator;
  const margin =
    (z * Math.sqrt((observed * (1 - observed)) / trials + zSquared / (4 * trials * trials))) /
    denominator;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

export default function WasmQuantumSandbox() {
  const [distance, setDistance] = useState<number>(3);
  const [errorRate, setErrorRate] = useState<number>(0.005);
  const [shots, setShots] = useState<number>(1000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<LocalModelResults | null>(null);
  const runSequence = useRef(0);

  const runLocalSimulation = useCallback(() => {
    const sequence = ++runSequence.current;
    setIsRunning(true);

    // Yield one frame so the busy state can paint; the computation itself remains on the browser main thread.
    window.requestAnimationFrame(() => {
      const startTime = performance.now();
      const lattice = buildLattice(distance);
      let failures = 0;
      let exactMatchingShots = 0;

      for (let shot = 0; shot < shots; shot++) {
        const errors = sampleDepolarizing(lattice.n, errorRate);
        const decoded = decode(lattice, errors);
        if (!decoded.success) failures++;
        if (decoded.exact) exactMatchingShots++;
      }

      if (sequence !== runSequence.current) return;

      const durationMs = Math.max(performance.now() - startTime, 1);
      setResults({
        distance,
        errorRate,
        totalShots: shots,
        logicalFailures: failures,
        logicalFailureRate: failures / shots,
        interval95: wilson95(failures, shots),
        exactMatchingShots,
        executionTimeMs: durationMs,
        shotsPerSec: Math.round((shots / durationMs) * 1000),
        stimCircuit: toStimCircuit(lattice, errorRate),
      });
      setIsRunning(false);
    });
  }, [distance, errorRate, shots]);

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-col gap-2 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">
                // LOCAL TYPESCRIPT TEACHING MODEL
              </span>
              <span className="rounded bg-plaquette/15 px-2 py-0.5 font-mono text-[10px] font-bold text-plaquette">
                BROWSER MAIN THREAD
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-text-hi">Surface-code sampling sandbox</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-text-mid">
          <span className="inline-block h-2 w-2 rounded-full bg-plaquette" />
          No WASM · no worker · no hardware
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-magic/30 bg-magic/5 p-3 text-xs leading-relaxed text-text-mid">
        This interactive samples independent data-qubit Pauli errors, computes ideal stabilizer syndromes, and applies the bundled TypeScript decoder.
        It omits noisy gates and measurements, so it is a learning model—not a circuit-level threshold or hardware benchmark.
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-mid">Code distance:</span>
            <span className="font-bold text-plaquette">d = {distance}</span>
          </div>
          <div className="mt-3 flex gap-2" role="group" aria-label="Choose surface-code distance">
            {[3, 5, 7].map((distanceValue) => (
              <button
                key={distanceValue}
                type="button"
                onClick={() => setDistance(distanceValue)}
                aria-pressed={distance === distanceValue}
                className={
                  distance === distanceValue
                    ? 'flex-1 rounded-lg border border-plaquette bg-plaquette/20 py-1.5 font-mono text-xs font-bold text-plaquette'
                    : 'flex-1 rounded-lg border border-ink-600 bg-ink-850 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
                }
              >
                d={distanceValue} ({distanceValue * distanceValue} data)
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <label htmlFor="local-error-rate" className="text-text-mid">Data-Pauli probability (p):</label>
            <span className="font-bold text-syndrome">{(errorRate * 100).toFixed(2)}%</span>
          </div>
          <input
            id="local-error-rate"
            type="range"
            min="0.001"
            max="0.03"
            step="0.001"
            value={errorRate}
            onChange={(event) => setErrorRate(Number.parseFloat(event.target.value))}
            aria-valuetext={`${(errorRate * 100).toFixed(1)} percent independent data-Pauli probability`}
            className="mt-3 h-2 w-full cursor-pointer rounded-lg bg-ink-700 accent-syndrome"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
            <span>0.1%</span>
            <span>No universal p_th implied</span>
            <span>3.0%</span>
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-mid">Independent samples:</span>
            <span className="font-bold text-star">{shots.toLocaleString()}</span>
          </div>
          <div className="mt-3 flex gap-2" role="group" aria-label="Choose number of independent samples">
            {[100, 1000, 5000].map((shotCount) => (
              <button
                key={shotCount}
                type="button"
                onClick={() => setShots(shotCount)}
                aria-pressed={shots === shotCount}
                className={
                  shots === shotCount
                    ? 'flex-1 rounded-lg border border-star bg-star/20 py-1.5 font-mono text-xs font-bold text-star'
                    : 'flex-1 rounded-lg border border-ink-600 bg-ink-850 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
                }
              >
                {shotCount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={runLocalSimulation}
          disabled={isRunning}
          className="btn-primary w-full justify-center text-sm"
        >
          {isRunning ? (
            <>
              <Zap className="h-4 w-4 animate-spin text-plaquette" /> Sampling in local TypeScript…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Resample local model ({shots.toLocaleString()} samples, d={distance})
            </>
          )}
        </button>
      </div>

      {results && (
        <div className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-5">
          <div className="flex flex-col gap-4 border-b border-ink-800 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-plaquette">
                LOCAL MODEL ESTIMATE · d={results.distance} · p={(results.errorRate * 100).toFixed(2)}%
              </span>
              <h4 className="font-display text-lg font-bold text-text-hi">
                Logical failures per sampled pattern:{' '}
                <span className="text-star">{(results.logicalFailureRate * 100).toFixed(3)}%</span>
              </h4>
              <p className="mt-1 font-mono text-[11px] text-text-low">
                95% Wilson interval: {(results.interval95[0] * 100).toFixed(3)}%–{(results.interval95[1] * 100).toFixed(3)}%
                {' · '}sampling uncertainty only
              </p>
            </div>

            <div className="flex flex-wrap gap-3 font-mono text-xs text-text-mid">
              <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                LOCAL SPEED: <span className="font-bold text-plaquette">{results.shotsPerSec.toLocaleString()} samples/s</span>
              </div>
              <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                TIME: <span className="text-text-hi">{results.executionTimeMs.toFixed(1)} ms</span>
              </div>
              <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
                FAILURES: <span className="text-syndrome">{results.logicalFailures} / {results.totalShots}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-ink-700 bg-ink-900 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">DECODER PATH</span>
              <p className="mt-1 text-xs leading-relaxed text-text-mid">
                Exact matching stayed within its detector-count cap for {results.exactMatchingShots.toLocaleString()} of{' '}
                {results.totalShots.toLocaleString()} samples; higher-count cases use the library&apos;s greedy fallback.
              </p>
            </div>
            <div className="rounded-lg border border-ink-700 bg-ink-900 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">INTERPRETATION LIMIT</span>
              <p className="mt-1 text-xs leading-relaxed text-text-mid">
                One finite sample at one distance cannot establish a threshold, validate Willow, or certify a circuit-level decoder.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs text-text-low">
              <span className="flex items-center gap-1.5 text-text-mid">
                <Terminal className="h-3.5 w-3.5 text-plaquette" /> Generated Stim circuit text—not executed in this browser
              </span>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([results.stimCircuit], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement('a');
                  anchor.href = url;
                  anchor.download = `surface_code_d${results.distance}_p${results.errorRate}.stim`;
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1 text-plaquette hover:underline"
              >
                <Download className="h-3 w-3" /> Download input
              </button>
            </div>
            <pre className="max-h-36 overflow-y-auto rounded-lg border border-ink-800 bg-ink-900 p-3 font-mono text-xs text-text-mid">
              {results.stimCircuit}
            </pre>
            <p className="mt-2 text-[11px] leading-relaxed text-text-low">
              This export describes a separate repeated-round memory-Z experiment. Run it with an installed Stim workflow to obtain Stim results;
              the estimate above did not execute this text.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

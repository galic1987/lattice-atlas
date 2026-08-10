import { useState, useMemo } from 'react';
import { Play, Download, Terminal, RefreshCw, Cpu } from 'lucide-react';
import { sound } from '@/lib/sound';
import {
  buildLattice,
  sampleDepolarizing,
  decode,
  logicalFlips,
  computeSyndrome,
  type Pauli,
} from '@/lib/surfaceCode';

interface SimulatorExample {
  id: string;
  title: string;
  category: 'Surface Code' | 'Lattice Surgery' | 'Magic State' | 'Color Code';
  description: string;
  stimCode: string;
  qubitCount: number;
  detectorCount: number;
  observableCount: number;
  /**
   * How this example's logical error rate is produced:
   * - 'sampled': a genuine in-browser Monte Carlo over a real surface-code
   *   lattice + matching decoder (only available where an in-repo model exists).
   * - 'analytic': a closed-form estimate; no execution happens in-browser.
   */
  method: 'sampled' | 'analytic';
  /** Surface-code distance used for the real Monte Carlo (sampled examples only). */
  latticeDistance?: number;
  /** Closed-form estimate of the logical error rate (analytic examples only). */
  analytic?: { formula: string; rate: (p: number) => number };
}

const SIMULATOR_EXAMPLES: SimulatorExample[] = [
  {
    id: 'surface-d3',
    title: 'Rotated Surface Code d=3 Memory',
    category: 'Surface Code',
    description: '3 rounds of syndrome extraction on a d=3 rotated surface code with 9 data qubits and 8 ancillas under depolarizing noise (p=0.5%).',
    qubitCount: 17,
    detectorCount: 16,
    observableCount: 1,
    method: 'sampled',
    latticeDistance: 3,
    stimCode: `# Rotated Surface Code d=3 Memory Experiment (3 rounds)
QUBIT_COORDS(1, 1) 0
QUBIT_COORDS(1, 3) 1
QUBIT_COORDS(3, 1) 2
QUBIT_COORDS(3, 3) 3
QUBIT_COORDS(1, 2) 4
QUBIT_COORDS(2, 1) 5
R 0 1 2 3 4 5
DEPOLARIZE1(0.005) 0 1 2 3 4 5
H 4
CX 0 4 1 4 2 5 3 5
DEPOLARIZE2(0.005) 0 4 1 4 2 5 3 5
H 4
M 4 5
DETECTOR(1, 2, 0) rec[-2]
DETECTOR(2, 1, 0) rec[-1]
M 0 1 2 3
OBSERVABLE_INCLUDE(0) rec[-4] rec[-3]`,
  },
  {
    id: 'logical-bell',
    title: 'Logical Bell State Entanglement (|Φ⁺⟩_L)',
    category: 'Surface Code',
    description: 'Prepares two planar surface code patches in |0⟩_L, applies transversally fault-tolerant Hadamard and joint Z1Z2 lattice surgery measurement to create maximal entanglement.',
    qubitCount: 34,
    detectorCount: 32,
    observableCount: 2,
    method: 'analytic',
    analytic: { formula: 'p_L ≈ 8·p²', rate: (p) => 8 * p * p },
    stimCode: `# Logical Bell State Preparation (|Φ⁺⟩_L = 1/√2 (|00⟩_L + |11⟩_L))
# Patch 1: Qubits 0-16 | Patch 2: Qubits 17-33
R 0 1 2 3 4 5 17 18 19 20 21 22
DEPOLARIZE1(0.003) 0 1 2 3 4 5 17 18 19 20 21 22
# Apply H_L to Patch 1
H 0 1 2 3
# Lattice Surgery Merge Z1 Z2
CX 0 17 1 18 2 19 3 20
M 17 18 19 20
DETECTOR(1, 1, 1) rec[-4] rec[-3]
OBSERVABLE_INCLUDE(0) rec[-2]
OBSERVABLE_INCLUDE(1) rec[-1]`,
  },
  {
    id: 'lattice-surgery-cnot',
    title: 'Lattice Surgery CNOT Weld',
    category: 'Lattice Surgery',
    description: 'Executes a non-destructive CNOT gate between two patch boundaries using an intermediate ancilla bus patch without physical qubit movement.',
    qubitCount: 25,
    detectorCount: 24,
    observableCount: 1,
    method: 'analytic',
    analytic: { formula: 'p_L ≈ 12·p²', rate: (p) => 12 * p * p },
    stimCode: `# Lattice Surgery CNOT Gate via Boundary Welding
# Q1 (Control) | Ancilla Bus | Q2 (Target)
R 0 1 2 3 4 5 6 7 8
# Step 1: Merge Z1 Z_ancilla
CX 0 4 1 5
M 4 5
DETECTOR(0, 1, 0) rec[-2] rec[-1]
# Step 2: Merge X_ancilla X2
H 4 5 6 7
CX 4 6 5 7
H 4 5 6 7
M 4 5
DETECTOR(1, 0, 0) rec[-2] rec[-1]
OBSERVABLE_INCLUDE(0) rec[-1]`,
  },
  {
    id: 'magic-distillation',
    title: '15-to-1 Magic State Distillation ([[15,1,3]])',
    category: 'Magic State',
    description: 'Bravyi-Kitaev 15-to-1 magic state distillation circuit converting 15 raw noisy |T⟩ states (error ~ 1%) into 1 purified |T⟩ state (error ~ 0.0035%).',
    qubitCount: 15,
    detectorCount: 14,
    observableCount: 1,
    method: 'analytic',
    analytic: { formula: 'p_out ≈ 35·p³', rate: (p) => 35 * p * p * p },
    stimCode: `# 15-to-1 Bravyi-Kitaev Reed-Muller [[15, 1, 3]] Distillation
R 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14
# Prepare 15 raw |T⟩ states with p_error = 1%
X_ERROR(0.01) 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14
# Reed-Muller syndrome extraction network
CX 0 1 0 2 0 4 0 8 1 3 1 5 1 9 2 3 2 6 2 10
M 1 2 3 4 5 6 7 8 9 10 11 12 13 14
DETECTOR(0, 0, 0) rec[-14] rec[-13] rec[-12]
DETECTOR(1, 0, 0) rec[-11] rec[-10] rec[-9]
OBSERVABLE_INCLUDE(0) rec[-1]`,
  },
  {
    id: 'color-code-steane',
    title: 'Steane Code [[7,1,3]] Transversal H Gate',
    category: 'Color Code',
    description: 'Demonstrates transversal Hadamard operation on the 7-qubit Steane color code where physical H on all 7 qubits applies logical H.',
    qubitCount: 7,
    detectorCount: 6,
    observableCount: 1,
    method: 'analytic',
    analytic: { formula: 'p_L ≈ 8·p²', rate: (p) => 8 * p * p },
    stimCode: `# Steane [[7, 1, 3]] Color Code Transversal H Gate
R 0 1 2 3 4 5 6
DEPOLARIZE1(0.002) 0 1 2 3 4 5 6
# Transversal H on all 7 physical qubits
H 0 1 2 3 4 5 6
# Measure 6 stabilizer generators (3 X-type, 3 Z-type)
M 0 1 2 3 4 5 6
DETECTOR(0, 0, 0) rec[-7] rec[-6] rec[-5]
DETECTOR(1, 0, 0) rec[-4] rec[-3] rec[-2]
OBSERVABLE_INCLUDE(0) rec[-1]`,
  },
];

/**
 * Count qubits / detectors / observables actually present in the displayed Stim
 * snippet, so the header can never disagree with the circuit on screen (the
 * mismatch the E2E audit caught: header "17 Qubits · 16 Detectors" over a snippet
 * defining 6 qubits and 2 detectors). Qubit count follows Stim's max-index+1.
 */
function circuitStats(stim: string): { qubits: number; detectors: number; observables: number } {
  let maxQubit = -1;
  let detectors = 0;
  const observables = new Set<number>();
  for (const raw of stim.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const name = line.match(/^([A-Za-z_]+)/)?.[1] ?? '';
    if (name === 'DETECTOR') {
      detectors++;
      continue;
    }
    if (name === 'OBSERVABLE_INCLUDE') {
      const m = line.match(/OBSERVABLE_INCLUDE\((\d+)\)/);
      observables.add(m ? Number(m[1]) : observables.size);
      continue;
    }
    if (name === 'QUBIT_COORDS') {
      const m = line.match(/\)\s+(\d+)\s*$/);
      if (m) maxQubit = Math.max(maxQubit, Number(m[1]));
      continue;
    }
    if (name === 'TICK' || name === 'SHIFT_COORDS' || name === 'REPEAT' || line.startsWith('}')) continue;
    // Gate / reset / measure / noise op: operands after the name are qubit
    // indices. Strip (...) params and rec[...] targets first.
    const cleaned = line.replace(/\([^)]*\)/g, ' ').replace(/rec\[[^\]]*\]/g, ' ');
    for (const tok of cleaned.split(/\s+/).slice(1)) {
      if (/^\d+$/.test(tok)) maxQubit = Math.max(maxQubit, Number(tok));
    }
  }
  return { qubits: maxQubit + 1, detectors, observables: observables.size };
}

type SimResult =
  | {
      method: 'sampled';
      logicalErrorRate: number;
      fidelity: number;
      failures: number;
      trials: number;
      defects: number;
    }
  | {
      method: 'analytic';
      logicalErrorRate: number;
      fidelity: number;
      formula: string;
    };

export default function ExecutableSimulatorStudio() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>('surface-d3');
  const [noiseRate, setNoiseRate] = useState<number>(0.005); // 0.5%
  const [trialCount, setTrialCount] = useState<number>(1000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimResult | null>(null);

  const activeExample = useMemo(
    () => SIMULATOR_EXAMPLES.find((e) => e.id === selectedExampleId) || SIMULATOR_EXAMPLES[0],
    [selectedExampleId]
  );
  // Stats are derived from the snippet on screen, never hardcoded — they must match.
  const shownStats = useMemo(() => circuitStats(activeExample.stimCode), [activeExample.stimCode]);

  const runSimulationEngine = () => {
    sound.playDecoderLock();
    setIsSimulating(true);

    // The setTimeout keeps the spinner visible; the real work runs inside it.
    setTimeout(() => {
      if (activeExample.method === 'sampled') {
        // Genuine Monte Carlo: sample depolarizing errors on a real rotated
        // surface-code lattice, decode each shot with the in-repo minimum-weight
        // matching decoder, and count residual logical failures.
        const lat = buildLattice(activeExample.latticeDistance ?? 3);
        let failures = 0;
        let defects = 0;
        for (let t = 0; t < trialCount; t++) {
          const err = sampleDepolarizing(lat.n, noiseRate);
          defects += computeSyndrome(lat, err).size;
          const res = decode(lat, err);
          const residual = err.map((e, i) => (e ^ res.correction[i]) as Pauli);
          const flips = logicalFlips(lat, residual);
          if (flips.x || flips.z) failures++;
        }
        const rate = failures / trialCount;
        setSimulationResult({
          method: 'sampled',
          logicalErrorRate: rate,
          fidelity: 1 - rate,
          failures,
          trials: trialCount,
          defects,
        });
      } else {
        // Closed-form analytic estimate — no circuit is executed in-browser.
        const rate = Math.min(1, activeExample.analytic!.rate(noiseRate));
        setSimulationResult({
          method: 'analytic',
          logicalErrorRate: rate,
          fidelity: 1 - rate,
          formula: activeExample.analytic!.formula,
        });
      }

      setIsSimulating(false);
    }, 400);
  };

  const downloadStimFile = () => {
    sound.playDecoderLock();
    const blob = new Blob([activeExample.stimCode], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${activeExample.id}.stim`;
    anchor.click();
  };

  const runLabel = activeExample.method === 'sampled' ? 'Run surface-code Monte Carlo' : 'Show estimate';

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// SURFACE-CODE MONTE CARLO + ANALYTIC ESTIMATES</span>
            <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">EXAMPLE CIRCUITS</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Fault-Tolerant Quantum Circuit Simulator Studio</h3>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={runSimulationEngine}
            disabled={isSimulating}
            className="btn-primary text-xs !px-4 !py-2 flex items-center gap-1.5"
          >
            {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isSimulating ? 'Running...' : runLabel}
          </button>
          <button
            type="button"
            onClick={downloadStimFile}
            className="rounded-lg border border-ink-700 bg-ink-950 p-2 text-text-low hover:text-text-hi flex items-center gap-1 font-mono text-xs"
            title="Download .stim Circuit"
          >
            <Download className="h-3.5 w-3.5" /> Export .stim
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Explore quantum error-correction example circuits. The rotated surface-code memory runs a genuine in-browser Monte Carlo — it samples depolarizing errors ($p$), decodes each shot with this repo's minimum-weight matching decoder, and counts residual logical failures over the chosen number of trials. The remaining examples report a closed-form analytic estimate of the logical error rate; their illustrative Stim circuits are <strong>not</strong> executed in-browser.
      </p>

      {/* Example Selector Pills */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-ink-800 pb-4">
        {SIMULATOR_EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => {
              sound.playDecoderLock();
              setSelectedExampleId(ex.id);
              setSimulationResult(null);
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
              selectedExampleId === ex.id
                ? 'bg-plaquette text-ink-950 font-bold shadow-glow-cyan'
                : 'bg-ink-800 text-text-mid hover:text-text-hi'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* Active Example Meta & Controls */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Viewport Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-text-low">
            <span className="flex items-center gap-1.5 text-plaquette font-bold">
              <Terminal className="h-4 w-4" /> Illustrative Stim circuit — not executed in-browser
            </span>
            <span title="Counted from the snippet shown below (a compact illustrative excerpt, not the full experiment)">
              snippet: {shownStats.qubits} qubits · {shownStats.detectors} detector{shownStats.detectors === 1 ? '' : 's'} · {shownStats.observables} observable{shownStats.observables === 1 ? '' : 's'}
            </span>
          </div>

          <div className="relative rounded-xl border border-ink-700 bg-ink-950 p-4 font-mono text-xs text-text-hi overflow-x-auto max-h-72">
            <pre className="whitespace-pre">{activeExample.stimCode}</pre>
          </div>

          {/* Interactive Parameters */}
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-text-low block mb-1.5">Physical Error Rate (p):</label>
              <div className="flex gap-2">
                {[0.001, 0.005, 0.01].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNoiseRate(rate)}
                    className={`px-2.5 py-1 rounded font-bold ${
                      noiseRate === rate ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid'
                    }`}
                  >
                    {(rate * 100).toFixed(1)}%
                  </button>
                ))}
              </div>
            </div>

            {activeExample.method === 'sampled' ? (
              <div>
                <label className="text-text-low block mb-1.5">Monte Carlo Trials (sampled):</label>
                <div className="flex gap-2">
                  {[1000, 5000, 10000].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTrialCount(count)}
                      className={`px-2.5 py-1 rounded font-bold ${
                        trialCount === count ? 'bg-star text-ink-950' : 'bg-ink-800 text-text-mid'
                      }`}
                    >
                      {count.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-text-low block mb-1.5">Analytic Model (not sampled):</label>
                <div className="px-2.5 py-1 rounded bg-ink-800 text-star font-bold inline-block">
                  {activeExample.analytic!.formula}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Analytics Panel */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-text-low">// RESULTS</span>
              {activeExample.method === 'sampled' ? (
                <span className="rounded bg-stabilizer/20 px-2 py-0.5 font-mono text-[10px] text-stabilizer font-bold">SAMPLED</span>
              ) : (
                <span className="rounded bg-star/20 px-2 py-0.5 font-mono text-[10px] text-star font-bold">ANALYTIC ESTIMATE</span>
              )}
            </div>

            {simulationResult ? (
              <div className="mt-4 space-y-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-stabilizer/10 border border-stabilizer/30 text-center">
                  <span className="text-[10px] text-text-low uppercase block">
                    Logical Fidelity (F_L){simulationResult.method === 'analytic' ? ', est.' : ''}:
                  </span>
                  <span className="text-2xl font-bold text-stabilizer block mt-0.5">
                    {(simulationResult.fidelity * 100).toFixed(3)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded bg-ink-900 border border-ink-800">
                    <span className="text-[9px] text-text-low uppercase block">
                      Logical Error Rate{simulationResult.method === 'analytic' ? ' (est.)' : ''}
                    </span>
                    <span className="text-sm font-bold text-syndrome block mt-0.5">
                      {(simulationResult.logicalErrorRate * 100).toFixed(3)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-ink-900 border border-ink-800">
                    {simulationResult.method === 'sampled' ? (
                      <>
                        <span className="text-[9px] text-text-low uppercase block">Syndrome Defects (sampled)</span>
                        <span className="text-sm font-bold text-star block mt-0.5">
                          {simulationResult.defects.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] text-text-low uppercase block">Model</span>
                        <span className="text-sm font-bold text-star block mt-0.5">
                          {simulationResult.formula}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-ink-800 text-[11px] text-text-low space-y-1">
                  {simulationResult.method === 'sampled' ? (
                    <div className="flex justify-between">
                      <span>Sampled Failures:</span>
                      <span className="text-text-hi font-bold">
                        {simulationResult.failures} / {simulationResult.trials.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span className="text-text-hi font-bold">closed-form estimate (not sampled)</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-12 text-center space-y-3 p-4">
                <Cpu className="h-10 w-10 text-plaquette mx-auto opacity-40 animate-pulse" />
                <p className="text-xs text-text-low leading-relaxed">
                  {activeExample.method === 'sampled' ? (
                    <>
                      Click <strong>[{runLabel}]</strong> to sample {trialCount.toLocaleString()} trials of {activeExample.title}.
                    </>
                  ) : (
                    <>
                      Click <strong>[{runLabel}]</strong> to evaluate the analytic model for {activeExample.title}.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-ink-800 text-[10px] font-mono text-text-low">
            * Surface-code results are sampled in-browser with this repo's minimum-weight matching decoder; other examples are closed-form analytic estimates. The Stim circuits are illustrative and are not executed here.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Server } from 'lucide-react';
import { sound } from '@/lib/sound';

interface TargetAlgorithm {
  id: string;
  name: string;
  logicalQubits: number;
  tGateCount: number;
  circuitDepth: number;
  targetFailureProb: number;
  description: string;
}

interface HardwareModality {
  id: string;
  name: string;
  physicalErrorRate: number;
  gateCycleTimeNs: number;
  powerPerThousandQubitsKw: number;
  baselinePowerKw: number;
  description: string;
}

const ALGORITHMS: TargetAlgorithm[] = [
  {
    id: 'rsa-2048',
    name: 'Shor 2048-Bit RSA Factoring',
    logicalQubits: 4096,
    tGateCount: 2e9,
    circuitDepth: 5e8,
    targetFailureProb: 0.01,
    description: 'Break 2048-bit RSA encryption using Shor modular exponentiation. Requires ~2 billion T-gates.',
  },
  {
    id: 'femoco-chemistry',
    name: 'FeMoco Nitrogenase Active Site Simulation',
    logicalQubits: 2000,
    tGateCount: 1e8,
    circuitDepth: 2.5e7,
    targetFailureProb: 0.05,
    description: 'Catalytic nitrogen fixation quantum chemistry simulation. Requires ~100 million T-gates.',
  },
  {
    id: 'hhl-linear',
    name: 'HHL Linear System Solver (1024x1024)',
    logicalQubits: 1024,
    tGateCount: 5e7,
    circuitDepth: 1.2e7,
    targetFailureProb: 0.01,
    description: 'Solves sparse linear system equations with exponential speedup for high-dimensional matrix inversion.',
  },
];

const MODALITIES: HardwareModality[] = [
  {
    id: 'superconducting',
    name: 'Superconducting Transmon (15 mK Cryo)',
    physicalErrorRate: 0.001, // 0.1%
    gateCycleTimeNs: 100, // 100 ns
    powerPerThousandQubitsKw: 15, // 15 kW / 1k qubits (cryo dilution fridge)
    baselinePowerKw: 50,
    description: 'Google Willow / IBM Eagle architecture. Fast 100ns gate cycles, 15 mK dilution refrigeration.',
  },
  {
    id: 'trapped-ion',
    name: 'Trapped Ion (Quantinuum H2)',
    physicalErrorRate: 0.0001, // 0.01%
    gateCycleTimeNs: 10000, // 10 μs
    powerPerThousandQubitsKw: 2, // 2 kW / 1k qubits
    baselinePowerKw: 25,
    description: 'Quantinuum / IonQ shuttle architecture. High fidelity (10^-4), 10μs gate cycle times.',
  },
  {
    id: 'neutral-atom',
    name: 'Neutral Atom Array (QuEra Aquila)',
    physicalErrorRate: 0.0005, // 0.05%
    gateCycleTimeNs: 1000, // 1 μs
    powerPerThousandQubitsKw: 5,
    baselinePowerKw: 30,
    description: 'QuEra / Harvard optical tweezer arrays. Reconfigurable 2D atom positioning.',
  },
  {
    id: 'photonic',
    name: 'Photonic Cluster State (PsiQuantum)',
    physicalErrorRate: 0.005, // 0.5%
    gateCycleTimeNs: 1, // 1 ns
    powerPerThousandQubitsKw: 1,
    baselinePowerKw: 100,
    description: 'PsiQuantum continuous-variable photonic architecture. Ultra-fast 1ns clock, high room-temp throughput.',
  },
];

export default function FtqcHardwareCompilerStudio() {
  const [algoId, setAlgoId] = useState<string>('rsa-2048');
  const [modalityId, setModalityId] = useState<string>('superconducting');

  const algo = useMemo(() => ALGORITHMS.find((a) => a.id === algoId) ?? ALGORITHMS[0], [algoId]);
  const modality = useMemo(() => MODALITIES.find((m) => m.id === modalityId) ?? MODALITIES[0], [modalityId]);

  // Compute FTQC compilation specs
  const specs = useMemo(() => {
    const p = modality.physicalErrorRate;
    const pTh = 0.01; // Surface code threshold
    
    // Required code distance d
    const targetP = algo.targetFailureProb / algo.tGateCount;
    const ratio = Math.max(0.01, p / pTh);
    let d = Math.ceil(Math.log(targetP) / Math.log(ratio));
    if (d % 2 === 0) d += 1;
    d = Math.max(3, Math.min(27, d));

    // Data qubits + ancillas per logical qubit = 2 * d^2
    const qubitsPerLogical = 2 * d * d;
    const dataQubitCount = algo.logicalQubits * qubitsPerLogical;

    // 15-to-1 T-factory Distillation Factories
    // FACTORY_RATIO: assumed parallel T-factories per logical qubit — a rough
    // planning figure, not a derived constant.
    const FACTORY_RATIO = 0.25;
    const factoryCount = Math.ceil(algo.logicalQubits * FACTORY_RATIO);
    const qubitsPerFactory = 15 * qubitsPerLogical;
    const factoryQubitCount = factoryCount * qubitsPerFactory;

    const totalPhysicalQubits = dataQubitCount + factoryQubitCount;

    // Total Runtime
    const totalCycles = algo.circuitDepth * d;
    const runtimeSeconds = totalCycles * (modality.gateCycleTimeNs * 1e-9);
    const runtimeHours = runtimeSeconds / 3600;
    const runtimeDays = runtimeHours / 24;

    // Power Consumption
    const totalPowerKw = modality.baselinePowerKw + (totalPhysicalQubits / 1000) * modality.powerPerThousandQubitsKw;

    return {
      d,
      qubitsPerLogical,
      dataQubitCount,
      factoryCount,
      totalPhysicalQubits,
      runtimeSeconds,
      runtimeHours,
      runtimeDays,
      totalPowerKw,
    };
  }, [algo, modality]);

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-magic" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              Full-System FTQC Hardware Architecture Compiler
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Full-system compilation model estimating physical qubits, T-factories, execution runtime, &amp; power footprint.
          </p>
        </div>

        <span className="rounded-full border border-magic/40 bg-magic/10 px-3 py-1 font-mono text-xs font-bold text-magic">
          FTQC Resource Estimator
        </span>
      </div>

      {/* Target Algorithm & Hardware Modality Selectors */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Algorithm Selector */}
        <div>
          <label className="eyebrow mb-2 block !text-plaquette">// 1. TARGET QUANTUM ALGORITHM</label>
          <div className="space-y-2">
            {ALGORITHMS.map((a) => {
              const active = a.id === algo.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAlgoId(a.id);
                    sound.playSyndromeTick();
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                    active
                      ? 'border-plaquette/70 bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
                      : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500'
                  }`}
                >
                  <div className="flex justify-between items-center font-mono text-xs font-bold">
                    <span>{a.name}</span>
                    <span className="text-plaquette">{a.logicalQubits} Logical Qubits</span>
                  </div>
                  <div className="mt-1 text-[11px] text-text-low line-clamp-1">{a.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware Modality Selector */}
        <div>
          <label className="eyebrow mb-2 block !text-magic">// 2. HARDWARE QUBIT MODALITY</label>
          <div className="space-y-2">
            {MODALITIES.map((m) => {
              const active = m.id === modality.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setModalityId(m.id);
                    sound.playSyndromeTick();
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                    active
                      ? 'border-magic/70 bg-magic/15 font-semibold text-text-hi shadow-glow-violet'
                      : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500'
                  }`}
                >
                  <div className="flex justify-between items-center font-mono text-xs font-bold">
                    <span>{m.name}</span>
                    <span className="text-magic">{(m.physicalErrorRate * 100).toFixed(2)}% Error</span>
                  </div>
                  <div className="mt-1 text-[11px] text-text-low line-clamp-1">{m.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compiled Architecture Resource Dashboard */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Distance */}
        <div className="rounded-xl border border-ink-600 bg-ink-900 p-4 font-mono">
          <div className="text-[11px] text-text-low uppercase">Code Distance d:</div>
          <div className="mt-1 text-2xl font-bold text-plaquette">d = {specs.d}</div>
          <div className="mt-1 text-[10px] text-text-mid">{specs.qubitsPerLogical} physical qubits / logical</div>
        </div>

        {/* Total Physical Qubits */}
        <div className="rounded-xl border border-ink-600 bg-ink-900 p-4 font-mono">
          <div className="text-[11px] text-text-low uppercase">Total Physical Qubits:</div>
          <div className="mt-1 text-2xl font-bold text-syndrome">
            {specs.totalPhysicalQubits.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-text-mid">{specs.factoryCount} T-distillation factories</div>
        </div>

        {/* Runtime */}
        <div className="rounded-xl border border-ink-600 bg-ink-900 p-4 font-mono">
          <div className="text-[11px] text-text-low uppercase">Execution Runtime:</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">
            {specs.runtimeHours < 24
              ? `${specs.runtimeHours.toFixed(1)} Hours`
              : `${specs.runtimeDays.toFixed(1)} Days`}
          </div>
          <div className="mt-1 text-[10px] text-text-mid">{(algo.tGateCount / 1e6).toFixed(0)}M T-gates</div>
        </div>

        {/* Power Footprint */}
        <div className="rounded-xl border border-ink-600 bg-ink-900 p-4 font-mono">
          <div className="text-[11px] text-text-low uppercase">Cryo &amp; Power Footprint:</div>
          <div className="mt-1 text-2xl font-bold text-stabilizer">
            {specs.totalPowerKw > 1000
              ? `${(specs.totalPowerKw / 1000).toFixed(2)} MW`
              : `${Math.round(specs.totalPowerKw)} kW`}
          </div>
          <div className="mt-1 text-[10px] text-text-mid">Wall-plug cooling power</div>
        </div>
      </div>
    </div>
  );
}

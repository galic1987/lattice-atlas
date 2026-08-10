import { useState, useMemo } from 'react';
import { Cpu, Zap, Clock, ShieldCheck, Sparkles, Copy, Check, Code } from 'lucide-react';
import { sound } from '@/lib/sound';

interface AlgorithmTarget {
  id: string;
  name: string;
  category: string;
  logicalQubits: number;
  tGatesRequired: number; // Total T-gates
  description: string;
}

const ALGORITHMS: AlgorithmTarget[] = [
  {
    id: 'rsa-2048',
    name: '2048-bit RSA Factorization (Shor)',
    category: 'Cryptography',
    logicalQubits: 4096,
    tGatesRequired: 2e9, // 2 Billion T-gates
    description: 'Shor factorizing 2048-bit RSA keys using modular exponentiation circuits.',
  },
  {
    id: 'femoco-catalyst',
    name: 'FeMoco Catalyst (Nitrogen Fixation)',
    category: 'Quantum Chemistry',
    logicalQubits: 2880,
    tGatesRequired: 5e10, // 50 Billion T-gates
    description: 'Electronic structure calculation of the iron-molybdenum nitrogenase active site.',
  },
  {
    id: 'p450-metabolism',
    name: 'Cytochrome P450 Drug Metabolism',
    category: 'Pharma / Bio',
    logicalQubits: 1800,
    tGatesRequired: 1.2e10, // 12 Billion T-gates
    description: 'Simulating heme-based enzymatic oxidation for drug discovery.',
  },
  {
    id: 'h2o-surface',
    name: 'H2O Molecule PES (Benchmark)',
    category: 'Chemistry Benchmark',
    logicalQubits: 120,
    tGatesRequired: 5e6, // 5 Million T-gates
    description: 'High-accuracy potential energy surface map for water molecules.',
  },
];

export default function FtqcResourceEstimatorStudio() {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('rsa-2048');
  const [physicalErrorRate, setPhysicalErrorRate] = useState<number>(0.001); // 0.1%
  const [codeDistance, setCodeDistance] = useState<number>(27);
  const [distillationScheme, setDistillationScheme] = useState<'15-to-1' | '20-to-4'>('15-to-1');

  const [copiedStim, setCopiedStim] = useState<boolean>(false);
  const [copiedVeo, setCopiedVeo] = useState<boolean>(false);

  const currentAlgo = useMemo(() => {
    return ALGORITHMS.find((a) => a.id === selectedAlgoId) || ALGORITHMS[0];
  }, [selectedAlgoId]);

  // Calculated Estimates
  const estimates = useMemo(() => {
    // 1. Data Qubits footprint = 2 * d^2 per logical qubit
    const dataPhysicalPerLogical = 2 * codeDistance * codeDistance;
    const totalDataPhysical = currentAlgo.logicalQubits * dataPhysicalPerLogical;

    // 2. Distillation Factory footprint
    const factoryMultiplier = distillationScheme === '15-to-1' ? 15 : 12;
    const totalFactoryPhysical = Math.round(currentAlgo.logicalQubits * 0.4 * factoryMultiplier * codeDistance * codeDistance);

    const totalPhysicalQubits = totalDataPhysical + totalFactoryPhysical;

    // 3. Execution Latency (assumes 1μs per QEC round, surface code cycle time)
    const cycleTimeUs = 1.0;
    const roundsPerTGate = 2 * codeDistance;
    const totalSeconds = (currentAlgo.tGatesRequired * roundsPerTGate * cycleTimeUs) / 1e6;

    let timeFormatted = '';
    if (totalSeconds < 3600) {
      timeFormatted = `${(totalSeconds / 60).toFixed(1)} mins`;
    } else if (totalSeconds < 86400) {
      timeFormatted = `${(totalSeconds / 3600).toFixed(1)} hours`;
    } else {
      timeFormatted = `${(totalSeconds / 86400).toFixed(1)} days`;
    }

    // 4. Cryogenic Cooling Power (approx 15mW per physical transmon qubit at 15mK)
    const cryoPowerkW = (totalPhysicalQubits * 0.015).toFixed(1);

    return {
      totalPhysicalQubits: totalPhysicalQubits.toLocaleString(),
      dataPhysicalQubits: totalDataPhysical.toLocaleString(),
      factoryPhysicalQubits: totalFactoryPhysical.toLocaleString(),
      timeFormatted,
      cryoPowerkW,
      lambdaEstimate: (physicalErrorRate < 0.001 ? 2.8 : 2.14).toFixed(2),
    };
  }, [currentAlgo, codeDistance, physicalErrorRate, distillationScheme]);

  // Generated Stim Code snippet
  const stimSnippet = useMemo(() => {
    return `# Fault-Tolerant Resource Estimation Circuit
# Target: ${currentAlgo.name}
# Code Distance d=${codeDistance}, Physical Error p=${physicalErrorRate * 100}%
# Factory Scheme: ${distillationScheme} Reed-Muller

QUBIT_COUNT ${estimates.totalPhysicalQubits.replace(/,/g, '')}
# Logical Memory Patches
R 0..${currentAlgo.logicalQubits - 1}
# T-State Distillation Factory Cycles
REPEAT ${Math.min(1000, currentAlgo.tGatesRequired)} {
  TICK
  MXX 0 1 2 3
  MRZ 4 5 6 7
  DETECTOR rec[-1] rec[-3]
}
OBSERVABLE_INCLUDE(0) rec[-1]`;
  }, [currentAlgo, codeDistance, physicalErrorRate, distillationScheme, estimates]);

  const copyStim = () => {
    navigator.clipboard.writeText(stimSnippet);
    sound.playDecoderLock();
    setCopiedStim(true);
    setTimeout(() => setCopiedStim(false), 2000);
  };

  const veoPrompt = `Cinematic 8K 3D photorealistic visualization of a mega-scale quantum supercomputer room. Rows of dilution refrigerators cool ${estimates.totalPhysicalQubits} physical qubits executing fault-tolerant ${currentAlgo.name} under distance-${codeDistance} surface code protection, 60fps.`;

  const copyVeo = () => {
    navigator.clipboard.writeText(veoPrompt);
    sound.playDecoderLock();
    setCopiedVeo(true);
    setTimeout(() => setCopiedVeo(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="border-b border-ink-700 pb-5">
        <span className="eyebrow text-plaquette mb-1">// FULL-SYSTEM FTQC RESOURCE ESTIMATOR</span>
        <h3 className="font-display text-xl font-bold text-text-hi">
          Fault-Tolerant Quantum Resource Estimator Calculator
        </h3>
        <p className="mt-1 text-sm text-text-mid">
          Calculate physical qubit counts, T-state factory spatial footprint, execution latency, and cryogenic power requirements for practical quantum algorithms.
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Target Algorithm Selection */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Target Quantum Algorithm:</span>
          <select
            value={selectedAlgoId}
            onChange={(e) => { setSelectedAlgoId(e.target.value); sound.playSyndromeTick(); }}
            className="w-full rounded border border-ink-600 bg-ink-800 p-2 text-text-hi font-bold text-xs focus:border-plaquette outline-none"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name} ({algo.logicalQubits} qubits)
              </option>
            ))}
          </select>
          <span className="text-[10px] text-text-low mt-2 block">{currentAlgo.description}</span>
        </div>

        {/* Physical Error Rate & Code Distance */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Physical Error Rate (p):</span>
          <div className="flex gap-2 mb-2">
            {[0.001, 0.0005, 0.0001].map((pVal) => (
              <button
                key={pVal}
                type="button"
                onClick={() => { setPhysicalErrorRate(pVal); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  physicalErrorRate === pVal ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid'
                }`}
              >
                {(pVal * 100).toFixed(2)}%
              </button>
            ))}
          </div>

          <span className="text-text-low text-[10px] uppercase block mb-1">Code Distance (d):</span>
          <div className="flex gap-2">
            {[15, 21, 27, 31].map((dVal) => (
              <button
                key={dVal}
                type="button"
                onClick={() => { setCodeDistance(dVal); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  codeDistance === dVal ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid'
                }`}
              >
                d={dVal}
              </button>
            ))}
          </div>
        </div>

        {/* Magic State Factory Scheme */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3 flex flex-col justify-between">
          <div>
            <span className="text-text-low text-[10px] uppercase block mb-1">T-State Distillation Scheme:</span>
            <div className="flex gap-2">
              {(['15-to-1', '20-to-4'] as const).map((scheme) => (
                <button
                  key={scheme}
                  type="button"
                  onClick={() => { setDistillationScheme(scheme); sound.playSyndromeTick(); }}
                  className={`flex-1 rounded py-1 font-bold ${
                    distillationScheme === scheme ? 'bg-magic text-ink-950' : 'bg-ink-800 text-text-mid'
                  }`}
                >
                  {scheme} RM
                </button>
              ))}
            </div>
          </div>

          <div className="rounded bg-ink-950 p-2 text-[10px] text-text-low mt-2 border border-ink-800">
            <span className="text-magic font-bold">Eastin-Knill Invariant:</span> Distillation purifies $|T\rangle$ ancillas at cubic suppression $O(\epsilon^3)$.
          </div>
        </div>
      </div>

      {/* Calculated Results Dashboard */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-plaquette/40 bg-plaquette/10 p-4">
          <div className="flex items-center gap-1.5 text-plaquette font-bold text-[10px] uppercase">
            <Cpu className="h-4 w-4" /> Total Physical Qubits
          </div>
          <div className="font-display text-2xl font-bold text-text-hi mt-1">
            {estimates.totalPhysicalQubits}
          </div>
          <div className="text-[10px] text-text-low mt-1">
            Data: {estimates.dataPhysicalQubits} | Factory: {estimates.factoryPhysicalQubits}
          </div>
        </div>

        <div className="rounded-xl border border-magic/40 bg-magic/10 p-4">
          <div className="flex items-center gap-1.5 text-magic font-bold text-[10px] uppercase">
            <Clock className="h-4 w-4" /> Execution Latency
          </div>
          <div className="font-display text-2xl font-bold text-text-hi mt-1">
            {estimates.timeFormatted}
          </div>
          <div className="text-[10px] text-text-low mt-1">
            {(currentAlgo.tGatesRequired / 1e9).toFixed(1)}B T-Gates @ 1.0μs/cycle
          </div>
        </div>

        <div className="rounded-xl border border-stabilizer/40 bg-stabilizer/10 p-4">
          <div className="flex items-center gap-1.5 text-stabilizer font-bold text-[10px] uppercase">
            <Zap className="h-4 w-4" /> Cryo Cooling Load
          </div>
          <div className="font-display text-2xl font-bold text-text-hi mt-1">
            {estimates.cryoPowerkW} kW
          </div>
          <div className="text-[10px] text-text-low mt-1">
            15mK dilution refrigeration load
          </div>
        </div>

        <div className="rounded-xl border border-star/40 bg-star/10 p-4">
          <div className="flex items-center gap-1.5 text-star font-bold text-[10px] uppercase">
            <ShieldCheck className="h-4 w-4" /> Threshold Gain (Λ)
          </div>
          <div className="font-display text-2xl font-bold text-text-hi mt-1">
            {estimates.lambdaEstimate}
          </div>
          <div className="text-[10px] text-text-low mt-1">
            Exponential error suppression
          </div>
        </div>
      </div>

      {/* Auto-Generated Stim Circuit */}
      <div className="mt-5 rounded-xl border border-ink-700 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-plaquette font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5" /> Compiled Stim Circuit Header Snippet
          </span>
          <button
            type="button"
            onClick={copyStim}
            className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copiedStim ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
            {copiedStim ? 'Copied Stim Snippet!' : 'Copy Stim Snippet'}
          </button>
        </div>
        <pre className="rounded-lg bg-ink-950 p-3.5 border border-ink-700 text-text-hi leading-relaxed overflow-x-auto text-[11px]">
          {stimSnippet}
        </pre>
      </div>

      {/* Veo 3.1 AI Prompt Box */}
      <div className="mt-4 rounded-xl border border-magic/30 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Google Veo 3.1 AI Video Generation Prompt
          </span>
          <button
            type="button"
            onClick={copyVeo}
            className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copiedVeo ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
            {copiedVeo ? 'Copied Prompt!' : 'Copy Prompt'}
          </button>
        </div>
        <div className="rounded-lg bg-ink-950 p-3 border border-ink-700 text-text-mid select-all">
          &ldquo;{veoPrompt}&rdquo;
        </div>
      </div>
    </div>
  );
}

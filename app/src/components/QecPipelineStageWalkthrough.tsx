import { useState } from 'react';
import { CheckCircle2, Zap, Copy, Check } from 'lucide-react';
import { sound } from '@/lib/sound';

interface StageMeta {
  stepNumber: number;
  stageTitle: string;
  subtitle: string;
  iconName: string;
  color: string;
  whatHappens: string;
  whyItMatters: string;
  physicalLatency: string;
  mathFormalism: string;
  veoPrompt: string;
}

const STAGES: StageMeta[] = [
  {
    stepNumber: 1,
    stageTitle: 'Physical Transmon Grid Initialization',
    subtitle: 'Preparing physical qubits in uniform Hadamard superposition state',
    iconName: 'Cpu',
    color: 'border-plaquette text-plaquette bg-plaquette/10',
    whatHappens: 'Physical transmon qubits are reset to ground state |0⟩ and initialized into equal superposition |+⟩ = 1/√2(|0⟩+|1⟩) using microwave Hadamard pulses.',
    whyItMatters: 'Establishes the initial uncorrupted quantum state space prior to syndrome measurement cycles.',
    physicalLatency: '20 - 40 ns',
    mathFormalism: '|Ψ_0⟩ = H^{⊗n} |0⟩^{⊗n} = \\frac{1}{2^{n/2}} \\sum_{x \\in \\{0,1\\}^n} |x⟩',
    veoPrompt: 'Cinematic 8K 3D photorealistic animation of superconducting transmon qubit grid glowing with cyan microwave excitation pulses inside a 15mK dilution refrigerator, 60fps.',
  },
  {
    stepNumber: 2,
    stageTitle: 'Stabilizer Ancilla Parity Checks',
    subtitle: 'Pulsing CNOT gates to measure ZZZZ and XXXX plaquette parities',
    iconName: 'Activity',
    color: 'border-star text-star bg-star/10',
    whatHappens: 'Ancilla qubits execute 4 CNOT entangling gates with neighboring data qubits to measure 4-qubit parity without collapsing single data qubit amplitudes.',
    whyItMatters: 'Extracts error information while keeping encoded logical information perfectly secret and coherent.',
    physicalLatency: '200 - 400 ns / cycle',
    mathFormalism: 'S_p = Z_1 Z_2 Z_3 Z_4, \\quad A_v = X_1 X_2 X_3 X_4, \\quad [S_p, S_{p\'}] = 0',
    veoPrompt: '3D photorealistic video of 4-qubit stabilizer plaquette pulsing CNOT entangling laser pulses to ancilla qubit, projecting measurement outcome to +1 or -1, high resolution.',
  },
  {
    stepNumber: 3,
    stageTitle: 'Syndrome Detector Graph Extraction',
    subtitle: 'Comparing current round measurements against previous round',
    iconName: 'Network',
    color: 'border-syndrome text-syndrome bg-syndrome/10',
    whatHappens: 'A detector fires when a stabilizer measurement outcome flips between round t-1 and round t, creating a node on a (2+1)D spacetime detector graph.',
    whyItMatters: 'Converts noisy quantum measurements into discrete topological graph defects ready for real-time decoding.',
    physicalLatency: '1 - 2 μs',
    mathFormalism: 'D_{p,t} = M_{p,t} \\oplus M_{p,t-1} = 1 \\implies \\text{Detector Fire}',
    veoPrompt: 'Cinematic 3D animation of 3D spacetime detector graph where red syndrome nodes illuminate when Pauli errors flip measurement outcomes over time, 60fps.',
  },
  {
    stepNumber: 4,
    stageTitle: 'Real-Time MWPM / BP Decoding',
    subtitle: 'Computing Blossom V minimum-weight pairings to identify error chains',
    iconName: 'Zap',
    color: 'border-stabilizer text-stabilizer bg-stabilizer/10',
    whatHappens: 'Minimum Weight Perfect Matching (MWPM) or Belief Propagation (BP) pairs detector defects on the graph to find the most probable Pauli error path.',
    whyItMatters: 'Prevents error buildup from exceeding half the code distance (d/2), preserving logical qubit lifetime indefinitely below threshold.',
    physicalLatency: '< 63 μs (Google Willow FPGA latency)',
    mathFormalism: '\\min_{E} \\sum_{e \\in E} -\\ln\\left(\\frac{p_e}{1-p_e}\\right) \\quad \\text{s.t.} \\quad \\partial E = D',
    veoPrompt: 'Photorealistic rendering of high-speed FPGA decoder algorithm running Minimum Weight Perfect Matching on a 3D syndrome graph, linking error nodes in microsecond latency.',
  },
  {
    stepNumber: 5,
    stageTitle: 'Fault-Tolerant Logical Operations',
    subtitle: 'Executing lattice surgery Z-welds and transversal Clifford gates',
    iconName: 'ShieldCheck',
    color: 'border-magic text-magic bg-magic/10',
    whatHappens: 'Surface code patches undergo boundary merges (Z-welds) and splits to measure joint operators Z_L1 · Z_L2 for fault-tolerant logical CNOT gates.',
    whyItMatters: 'Enables full Clifford logical gate operations without exposing data to single-point hardware failures.',
    physicalLatency: 'd \\times t_{\\text{round}} \\approx 1 - 5 \\mu\\text{s}',
    mathFormalism: '\\bar{Z}_1 \\bar{Z}_2 = \\prod_{i \\in \\text{boundary}} Z_i, \\quad \\bar{X}_L \\to \\bar{X}_1 \\bar{X}_2',
    veoPrompt: 'Cinematic 3D video of two planar surface code patches welding smooth boundaries together for fault-tolerant lattice surgery logical CNOT logic, 60fps.',
  },
  {
    stepNumber: 6,
    stageTitle: 'Magic State Distillation Factory',
    subtitle: 'Purifying noisy T-gate ancillas with 15-to-1 Reed-Muller factories',
    iconName: 'Layers',
    color: 'border-plaquette text-plaquette bg-plaquette/10',
    whatHappens: '15 noisy physical T-states |T_ε⟩ are encoded into a [[15,1,3]] code block and measured to filter out error components, producing 1 pristine |T⟩ state with O(ε³) error rate.',
    whyItMatters: 'Bypasses the Eastin-Knill theorem to enable universal non-Clifford quantum logic (Shor 2048 & FeMoco chemistry algorithms).',
    physicalLatency: '10 - 20 μs per factory cycle',
    mathFormalism: '|T⟩ = \\frac{1}{\\sqrt{2}}(|0⟩ + e^{i\\pi/4}|1⟩), \\quad P_{\\text{error,out}} = 35 \\epsilon^3 + O(\\epsilon^4)',
    veoPrompt: 'Cinematic 8K 3D photorealistic visualization of 15-to-1 magic state distillation factory, glowing crystal pyramids purifying noisy ancillas into pristine T-gate states, 60fps.',
  },
];

export default function QecPipelineStageWalkthrough() {
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const stage = STAGES.find((s) => s.stepNumber === selectedStep) ?? STAGES[0];

  const handleSelect = (step: number) => {
    setSelectedStep(step);
    sound.playSyndromeTick();
  };

  const copyPrompt = (promptText: string, step: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedStep(step);
    sound.playDecoderLock();
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <span className="eyebrow text-plaquette mb-1">// COMPLETE QEC PIPELINE WALKTHROUGH</span>
          <h3 className="font-display text-xl font-bold text-text-hi">
            End-to-End Fault-Tolerant QEC Stage Architecture
          </h3>
          <p className="mt-1 text-sm text-text-mid">
            Step-by-step physical breakdown from transmon qubit preparation to magic state distillation factories.
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          6-Stage Process Walkthrough
        </span>
      </div>

      {/* Stepper Pipeline Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAGES.map((s) => {
          const active = s.stepNumber === stage.stepNumber;
          return (
            <button
              key={s.stepNumber}
              type="button"
              onClick={() => handleSelect(s.stepNumber)}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 ${
                active
                  ? `${s.color} font-semibold shadow-glow-cyan border-opacity-100`
                  : 'border-ink-700 bg-ink-900/60 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1 font-mono text-[10px]">
                <span className="font-bold uppercase">Stage {s.stepNumber}</span>
                {active && <CheckCircle2 className="h-3 w-3 text-plaquette" />}
              </div>
              <span className="font-display text-xs font-bold line-clamp-1">{s.stageTitle.split(' ')[0]} {s.stageTitle.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Stage Breakdown Box */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left Column: Stage Explanation & Latency */}
        <div className="rounded-xl border border-ink-600 bg-ink-900 p-5 flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${stage.color}`}>
                Stage {stage.stepNumber} of 6
              </span>
              <span className="text-text-low text-[11px] font-mono">Latency: {stage.physicalLatency}</span>
            </div>

            <h4 className="font-display text-lg font-bold text-text-hi mb-1">{stage.stageTitle}</h4>
            <div className="text-text-mid text-xs mb-4 font-sans italic">{stage.subtitle}</div>

            <div className="space-y-4 font-sans text-xs">
              <div className="rounded-lg bg-ink-950 p-3.5 border border-ink-700">
                <span className="font-mono text-[10px] text-plaquette font-bold uppercase block mb-1">What Happens:</span>
                <p className="text-text-hi leading-relaxed">{stage.whatHappens}</p>
              </div>

              <div className="rounded-lg bg-ink-950 p-3.5 border border-ink-700">
                <span className="font-mono text-[10px] text-star font-bold uppercase block mb-1">Why It Matters:</span>
                <p className="text-text-mid leading-relaxed">{stage.whyItMatters}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-ink-700 flex items-center justify-between">
            <span className="text-text-low text-[10px] uppercase font-mono">Math Formalism:</span>
            <span className="font-mono text-xs text-text-hi font-bold bg-ink-950 px-2.5 py-1 rounded border border-ink-700">
              {stage.mathFormalism}
            </span>
          </div>
        </div>

        {/* Right Column: Google Veo 3.1 AI Prompt Box & Visual Generator */}
        <div className="rounded-xl border border-ink-600 bg-ink-900 p-5 flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Google Veo 3.1 AI Video Generation Prompt
              </span>
              <button
                type="button"
                onClick={() => copyPrompt(stage.veoPrompt, stage.stepNumber)}
                className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
              >
                {copiedStep === stage.stepNumber ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
                {copiedStep === stage.stepNumber ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>

            <div className="rounded-xl bg-ink-950 p-4 border border-magic/30 font-mono text-xs text-text-mid leading-relaxed select-all">
              &ldquo;{stage.veoPrompt}&rdquo;
            </div>

            <div className="mt-5 p-4 rounded-xl border border-ink-700 bg-ink-950 flex flex-col items-center justify-center text-center min-h-[140px]">
              <span className="text-text-low text-[11px] mb-2 font-mono">// STEP NAVIGATION</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={stage.stepNumber === 1}
                  onClick={() => handleSelect(stage.stepNumber - 1)}
                  className="px-3 py-1.5 rounded border border-ink-600 bg-ink-800 text-xs text-text-hi disabled:opacity-40 hover:border-ink-500"
                >
                  ← Prev Stage
                </button>
                <span className="font-mono text-xs font-bold text-plaquette">{stage.stepNumber} / 6</span>
                <button
                  type="button"
                  disabled={stage.stepNumber === 6}
                  onClick={() => handleSelect(stage.stepNumber + 1)}
                  className="px-3 py-1.5 rounded border border-ink-600 bg-ink-800 text-xs text-text-hi disabled:opacity-40 hover:border-ink-500"
                >
                  Next Stage →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MultiAgeCognitiveLens from '@/components/MultiAgeCognitiveLens';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FlaskConical,
  RotateCcw,
  Share2,
  Sparkles,
  Waves,
} from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = 'lattice-atlas-waves-to-qubits-practice-v1';

const STAGES = [
  { id: 'bit-amplitude', short: 'Bit / amplitude', title: 'From switches to amplitudes' },
  { id: 'interference', short: 'Interference', title: 'Add arrows, then square' },
  { id: 'ket-born', short: 'Ket / Born rule', title: 'A ket is a coordinate list' },
  { id: 'phase', short: 'Two phases', title: 'What rotation can physics notice?' },
  { id: 'two-qubit', short: 'Two qubits', title: 'When the table will not factor' },
] as const;

type StageId = (typeof STAGES)[number]['id'];

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const QUESTIONS: Record<StageId, Question> = {
  'bit-amplitude': {
    prompt: 'A normalized qubit has amplitudes (1/√5)|0⟩ + (2/√5)|1⟩. What will a standard-basis measurement do most often?',
    options: ['Return 0 with probability 80%', 'Return 1 with probability 80%', 'Return both values together', 'Return 1 with probability 2/√5'],
    answer: 1,
    explanation: 'Square the magnitudes: P(0) = 1/5 and P(1) = 4/5. An amplitude is not itself a probability.',
  },
  interference: {
    prompt: 'Two equal path amplitudes arrive 180° out of phase at detector D0. Predict D0 before revealing the result.',
    options: ['Always clicks', 'Clicks 50% of the time', 'Never clicks in the ideal model', 'The phase cannot matter'],
    answer: 2,
    explanation: 'The arrows cancel: 1/2 + (1/2)eⁱᵖⁱ = 0. The squared magnitude is therefore P(D0) = 0.',
  },
  'ket-born': {
    prompt: 'For |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩, what is P(1)?',
    options: ['√3/2 ≈ 86.6%', '3/4 = 75%', '1/2 = 50%', 'The two entries must be added first'],
    answer: 1,
    explanation: 'The |1⟩ coordinate is √3/2, so the Born rule gives |√3/2|² = 3/4.',
  },
  phase: {
    prompt: 'Every amplitude in a complete state is multiplied by −1. Which prediction changes?',
    options: ['Only P(0)', 'Only P(1)', 'Every probability', 'No physical prediction'],
    answer: 3,
    explanation: 'Multiplying the complete state by −1 is a global phase of π. Inner-product magnitudes and therefore all physical predictions stay unchanged.',
  },
  'two-qubit': {
    prompt: 'The Bell state (|00⟩ + |11⟩)/√2 fills only the diagonal of its 2×2 amplitude table. Can it be factored into one state for A and one for B?',
    options: ['Yes, because there are only two nonzero cells', 'Yes, as |+⟩ ⊗ |+⟩', 'No; its amplitude determinant is nonzero', 'No; every two-qubit state is entangled'],
    answer: 2,
    explanation: 'Its determinant is (1/√2)(1/√2) − 0 = 1/2. A pure two-qubit state factors exactly when that determinant is zero.',
  },
};

type PredictionState = {
  selected: number | null;
  submitted: boolean;
};

type Answers = Record<StageId, PredictionState>;

function emptyAnswers(): Answers {
  return {
    'bit-amplitude': { selected: null, submitted: false },
    interference: { selected: null, submitted: false },
    'ket-born': { selected: null, submitted: false },
    phase: { selected: null, submitted: false },
    'two-qubit': { selected: null, submitted: false },
  };
}

function loadAnswers(): Answers {
  const clean = emptyAnswers();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clean;
    const saved = JSON.parse(raw) as Partial<Record<StageId, Partial<PredictionState>>>;
    for (const stage of STAGES) {
      const candidate = saved[stage.id];
      const selected = candidate?.selected;
      if (
        typeof selected === 'number'
        && Number.isInteger(selected)
        && selected >= 0
        && selected < QUESTIONS[stage.id].options.length
      ) {
        clean[stage.id] = { selected, submitted: candidate?.submitted === true };
      }
    }
  } catch {
    // Storage can be unavailable in private browsing. The practice still works in memory.
  }
  return clean;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function fixed(value: number, digits = 2): string {
  const safe = Math.abs(value) < 0.0005 ? 0 : value;
  return safe.toFixed(digits);
}

function ArrowHead({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M 0 0 L 8 4 L 0 8 z" fill={color} />
    </marker>
  );
}

function HeroBridge() {
  return (
    <svg viewBox="0 0 560 210" className="w-full" role="img" aria-label="A classical switch becomes two amplitude arrows, which become measurement probabilities">
      <defs>
        <linearGradient id="hero-wave" x1="0" x2="1">
          <stop offset="0" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="hero-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g opacity="0.25" stroke="#3D5178">
        {Array.from({ length: 8 }, (_, index) => <line key={`v-${index}`} x1={35 + index * 70} y1="20" x2={35 + index * 70} y2="190" />)}
        {Array.from({ length: 3 }, (_, index) => <line key={`h-${index}`} x1="20" y1={45 + index * 60} x2="540" y2={45 + index * 60} />)}
      </g>
      <g transform="translate(48 45)">
        <text x="45" y="0" textAnchor="middle" fill="#64708E" fontSize="11" fontFamily="JetBrains Mono">BIT</text>
        <rect x="4" y="28" width="82" height="92" rx="18" fill="#0E1526" stroke="#2A3A5F" />
        <circle cx="45" cy="55" r="17" fill="#22D3EE" filter="url(#hero-glow)" />
        <circle cx="45" cy="96" r="9" fill="#1B2743" stroke="#3D5178" />
        <text x="45" y="59" textAnchor="middle" fill="#05080F" fontSize="13" fontWeight="700">0</text>
        <text x="45" y="100" textAnchor="middle" fill="#A9B4CC" fontSize="11">1</text>
      </g>
      <path d="M 150 105 C 174 105, 178 67, 205 67 S 239 143, 267 143 S 300 67, 327 67" fill="none" stroke="url(#hero-wave)" strokeWidth="4" strokeLinecap="round" />
      <g transform="translate(350 105)">
        <circle r="56" fill="#0E1526" stroke="#2A3A5F" />
        <line x1="-40" y1="0" x2="42" y2="0" stroke="#3D5178" />
        <line x1="0" y1="40" x2="0" y2="-42" stroke="#3D5178" />
        <line x1="0" y1="0" x2="38" y2="-25" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" />
        <circle cx="38" cy="-25" r="5" fill="#22D3EE" />
        <line x1="0" y1="0" x2="-17" y2="-35" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="-17" cy="-35" r="5" fill="#8B5CF6" />
      </g>
      <g transform="translate(444 49)">
        <text x="43" y="-4" textAnchor="middle" fill="#64708E" fontSize="11" fontFamily="JetBrains Mono">BORN READOUT</text>
        <rect x="0" y="25" width="34" height="104" rx="8" fill="#0E1526" stroke="#2A3A5F" />
        <rect x="4" y="55" width="26" height="70" rx="5" fill="#22D3EE" opacity="0.8" />
        <rect x="51" y="25" width="34" height="104" rx="8" fill="#0E1526" stroke="#2A3A5F" />
        <rect x="55" y="84" width="26" height="41" rx="5" fill="#8B5CF6" opacity="0.8" />
        <text x="17" y="148" textAnchor="middle" fill="#A9B4CC" fontSize="12">0</text>
        <text x="68" y="148" textAnchor="middle" fill="#A9B4CC" fontSize="12">1</text>
      </g>
    </svg>
  );
}

function BitAmplitudeVisual() {
  const [bit, setBit] = useState<0 | 1>(0);
  const [pZero, setPZero] = useState(64);
  const pOne = 100 - pZero;
  const alpha = Math.sqrt(pZero / 100);
  const beta = Math.sqrt(pOne / 100);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-xl border border-ink-600 bg-ink-900/70 p-5" aria-labelledby="classical-switch-title">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p id="classical-switch-title" className="font-display font-semibold text-text-hi">Classical rail switch</p>
            <p className="mt-1 text-sm text-text-low">Exactly one rail is occupied.</p>
          </div>
          <span className="rounded-full border border-plaquette/30 bg-plaquette/10 px-3 py-1 font-mono text-xs text-plaquette">b = {bit}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {([0, 1] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setBit(value)}
              aria-pressed={bit === value}
              className={`min-h-28 rounded-xl border p-4 transition-colors ${bit === value ? 'border-plaquette bg-plaquette/10 text-text-hi' : 'border-ink-600 bg-ink-850 text-text-low hover:border-ink-500'}`}
            >
              <span className={`mx-auto block h-10 w-10 rounded-full border-2 ${bit === value ? 'border-plaquette bg-plaquette shadow-[0_0_24px_rgba(34,211,238,0.35)]' : 'border-ink-500 bg-ink-700'}`} />
              <span className="mt-3 block font-mono text-sm">rail |{value}⟩</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-star/30 bg-ink-900/70 p-5" aria-labelledby="amplitude-mixer-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="amplitude-mixer-title" className="font-display font-semibold text-text-hi">Two-channel amplitude mixer</p>
            <p className="mt-1 text-sm text-text-low">Move probability; watch amplitude follow its square root.</p>
          </div>
          <span className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs text-star">|α|² + |β|² = 1</span>
        </div>

        <label htmlFor="probability-zero" className="mt-6 flex items-center justify-between gap-4 text-sm text-text-mid">
          <span>Probability assigned to outcome 0</span>
          <output htmlFor="probability-zero" className="font-mono text-plaquette">{pZero}%</output>
        </label>
        <input
          id="probability-zero"
          type="range"
          min="0"
          max="100"
          step="1"
          value={pZero}
          onChange={(event) => setPZero(Number(event.target.value))}
          aria-valuetext={`${pZero} percent probability of outcome zero`}
          className="mt-3 w-full accent-plaquette"
        />

        <div className="mt-6 grid grid-cols-2 gap-4" aria-live="polite">
          <ProbabilityChannel label="0" amplitude={alpha} probability={pZero / 100} color="cyan" />
          <ProbabilityChannel label="1" amplitude={beta} probability={pOne / 100} color="violet" />
        </div>
        <p className="mt-5 overflow-x-auto rounded-lg border border-ink-600 bg-ink-950/60 px-4 py-3 text-center font-mono text-sm text-text-hi">
          |ψ⟩ = <span className="text-plaquette">{fixed(alpha)}</span>|0⟩ + <span className="text-star">{fixed(beta)}</span>|1⟩
        </p>
      </section>
    </div>
  );
}

function ProbabilityChannel({
  label,
  amplitude,
  probability,
  color,
}: {
  label: string;
  amplitude: number;
  probability: number;
  color: 'cyan' | 'violet';
}) {
  const tone = color === 'cyan' ? 'bg-plaquette text-plaquette' : 'bg-star text-star';
  return (
    <div className="rounded-lg border border-ink-600 bg-ink-850 p-3">
      <div className="flex h-28 items-end justify-center rounded-md bg-ink-950/70 p-2">
        <div className={`w-full max-w-14 rounded-t-md ${tone.split(' ')[0]}`} style={{ height: `${Math.max(4, probability * 100)}%`, opacity: 0.82 }} />
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="font-mono text-xs text-text-low">|{label}⟩</span>
        <span className={`font-mono text-xs ${tone.split(' ')[1]}`}>amp {fixed(amplitude)}</span>
      </div>
      <p className="mt-1 font-mono text-sm text-text-hi">P({label}) = {percent(probability)}</p>
    </div>
  );
}

function InterferenceVisual() {
  const [phase, setPhase] = useState(120);
  const radians = phase * Math.PI / 180;
  const first = { x: 0.5, y: 0 };
  const second = { x: 0.5 * Math.cos(radians), y: 0.5 * Math.sin(radians) };
  const result = { x: first.x + second.x, y: second.y };
  const magnitude = Math.hypot(result.x, result.y);
  const pD0 = Math.min(1, magnitude ** 2);
  const pD1 = 1 - pD0;
  const origin = { x: 142, y: 135 };
  const scale = 105;
  const firstTip = { x: origin.x + first.x * scale, y: origin.y - first.y * scale };
  const resultTip = { x: origin.x + result.x * scale, y: origin.y - result.y * scale };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-ink-600 bg-ink-900/70 p-5" aria-labelledby="phasor-board-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="phasor-board-title" className="font-display font-semibold text-text-hi">Phasor addition board</p>
            <p className="mt-1 text-sm text-text-low">Two path amplitudes, each length 1/2.</p>
          </div>
          <span className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs text-plaquette">φ = {phase}°</span>
        </div>
        <svg viewBox="0 0 310 260" className="mx-auto mt-3 w-full max-w-md" role="img" aria-label={`Two amplitude arrows separated by ${phase} degrees produce resultant magnitude ${fixed(magnitude)}`}>
          <defs>
            <ArrowHead id="arrow-cyan" color="#22D3EE" />
            <ArrowHead id="arrow-violet" color="#8B5CF6" />
            <ArrowHead id="arrow-result" color="#34D399" />
          </defs>
          <circle cx={origin.x} cy={origin.y} r="106" fill="#0A0F1C" stroke="#2A3A5F" />
          <line x1="36" y1={origin.y} x2="260" y2={origin.y} stroke="#3D5178" />
          <line x1={origin.x} y1="29" x2={origin.x} y2="241" stroke="#3D5178" />
          <circle cx={origin.x} cy={origin.y} r="53" fill="none" stroke="#2A3A5F" strokeDasharray="3 5" />
          <circle cx={origin.x} cy={origin.y} r="106" fill="none" stroke="#2A3A5F" strokeDasharray="3 5" />
          <line x1={origin.x} y1={origin.y} x2={firstTip.x} y2={firstTip.y} stroke="#22D3EE" strokeWidth="4" markerEnd="url(#arrow-cyan)" />
          <line x1={firstTip.x} y1={firstTip.y} x2={resultTip.x} y2={resultTip.y} stroke="#8B5CF6" strokeWidth="4" markerEnd="url(#arrow-violet)" />
          <line x1={origin.x} y1={origin.y} x2={resultTip.x} y2={resultTip.y} stroke="#34D399" strokeWidth="3" strokeDasharray="6 4" markerEnd="url(#arrow-result)" />
          <text x={origin.x + 31} y={origin.y + 20} fill="#22D3EE" fontSize="11" fontFamily="JetBrains Mono">path A</text>
          <text x={firstTip.x + second.x * scale * 0.35} y={firstTip.y - second.y * scale * 0.35 - 10} fill="#A78BFA" fontSize="11" fontFamily="JetBrains Mono">path B</text>
          <text x={resultTip.x + 8} y={resultTip.y - 8} fill="#34D399" fontSize="11" fontFamily="JetBrains Mono">sum</text>
        </svg>
        <label htmlFor="path-phase" className="flex items-center justify-between gap-4 text-sm text-text-mid">
          <span>Rotate path B</span>
          <output htmlFor="path-phase" className="font-mono text-star">{phase}°</output>
        </label>
        <input
          id="path-phase"
          type="range"
          min="0"
          max="360"
          step="15"
          value={phase}
          onChange={(event) => setPhase(Number(event.target.value))}
          aria-valuetext={`${phase} degrees relative phase`}
          className="mt-3 w-full accent-star"
        />
      </section>

      <section className="rounded-xl border border-stabilizer/25 bg-ink-900/70 p-5" aria-labelledby="detector-board-title">
        <p id="detector-board-title" className="font-display font-semibold text-text-hi">Interference readout</p>
        <p className="mt-1 text-sm leading-6 text-text-low">At D0, add amplitudes first. Only then turn the result into probability.</p>
        <div className="mt-6 rounded-lg border border-ink-600 bg-ink-950/60 p-4 font-mono text-xs leading-7 text-text-mid" aria-live="polite">
          <p>A(D0) = 0.5 + 0.5eⁱφ</p>
          <p>|A(D0)| = <span className="text-stabilizer">{fixed(magnitude)}</span></p>
          <p>P(D0) = |A|² = <span className="text-stabilizer">{percent(pD0)}</span></p>
        </div>
        <div className="mt-6 space-y-5">
          <DetectorBar label="D0" value={pD0} color="green" />
          <DetectorBar label="D1" value={pD1} color="violet" />
        </div>
        <div className="mt-6 rounded-lg border border-magic/25 bg-magic/5 p-4 text-sm leading-6 text-text-mid">
          <span className="font-mono text-xs uppercase tracking-wider text-magic">Notice</span>
          <p className="mt-1">The two detector probabilities still total 100%. Interference moves probability; it does not create or destroy it.</p>
        </div>
      </section>
    </div>
  );
}

function DetectorBar({ label, value, color }: { label: string; value: number; color: 'green' | 'violet' }) {
  const fill = color === 'green' ? 'bg-stabilizer' : 'bg-star';
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-xs">
        <span className="text-text-mid">{label}</span>
        <span className="text-text-hi">{percent(value)}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full border border-ink-600 bg-ink-850">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function KetBornVisual() {
  const [theta, setTheta] = useState(72);
  const halfRadians = theta * Math.PI / 360;
  const alpha = Math.cos(halfRadians);
  const beta = Math.sin(halfRadians);
  const pZero = alpha ** 2;
  const pOne = beta ** 2;
  const origin = { x: 52, y: 190 };
  const scale = 135;
  const tip = { x: origin.x + alpha * scale, y: origin.y - beta * scale };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-xl border border-ink-600 bg-ink-900/70 p-5" aria-labelledby="coordinate-plane-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="coordinate-plane-title" className="font-display font-semibold text-text-hi">Ket coordinate plane</p>
            <p className="mt-1 text-sm text-text-low">A real-amplitude slice of the full complex state space.</p>
          </div>
          <span className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs text-star">θ = {theta}°</span>
        </div>
        <svg viewBox="0 0 270 230" className="mx-auto mt-2 w-full max-w-md" role="img" aria-label={`State-vector coordinates alpha ${fixed(alpha)} and beta ${fixed(beta)}`}>
          <defs><ArrowHead id="ket-arrow" color="#22D3EE" /></defs>
          <path d={`M ${origin.x + scale} ${origin.y} A ${scale} ${scale} 0 0 0 ${origin.x} ${origin.y - scale}`} fill="none" stroke="#2A3A5F" strokeDasharray="4 5" />
          <line x1={origin.x} y1={origin.y} x2="235" y2={origin.y} stroke="#3D5178" />
          <line x1={origin.x} y1={origin.y} x2={origin.x} y2="25" stroke="#3D5178" />
          <line x1={tip.x} y1={tip.y} x2={tip.x} y2={origin.y} stroke="#8B5CF6" strokeDasharray="4 4" />
          <line x1={origin.x} y1={tip.y} x2={tip.x} y2={tip.y} stroke="#8B5CF6" strokeDasharray="4 4" />
          <line x1={origin.x} y1={origin.y} x2={tip.x} y2={tip.y} stroke="#22D3EE" strokeWidth="4" markerEnd="url(#ket-arrow)" />
          <circle cx={tip.x} cy={tip.y} r="6" fill="#22D3EE" />
          <text x="237" y={origin.y + 4} fill="#A9B4CC" fontSize="11" fontFamily="JetBrains Mono">α · |0⟩</text>
          <text x={origin.x} y="17" textAnchor="middle" fill="#A9B4CC" fontSize="11" fontFamily="JetBrains Mono">β · |1⟩</text>
          <text x={tip.x} y={origin.y + 18} textAnchor="middle" fill="#A78BFA" fontSize="11" fontFamily="JetBrains Mono">α={fixed(alpha)}</text>
          <text x={origin.x - 7} y={tip.y + 4} textAnchor="end" fill="#A78BFA" fontSize="11" fontFamily="JetBrains Mono">β={fixed(beta)}</text>
        </svg>
        <label htmlFor="ket-angle" className="flex items-center justify-between gap-4 text-sm text-text-mid">
          <span>Preparation rotation θ</span>
          <output htmlFor="ket-angle" className="font-mono text-star">{theta}°</output>
        </label>
        <input
          id="ket-angle"
          type="range"
          min="0"
          max="180"
          step="2"
          value={theta}
          onChange={(event) => setTheta(Number(event.target.value))}
          aria-valuetext={`${theta} degrees preparation rotation`}
          className="mt-3 w-full accent-star"
        />
      </section>

      <section className="rounded-xl border border-plaquette/25 bg-ink-900/70 p-5" aria-labelledby="born-projector-title">
        <p id="born-projector-title" className="font-display font-semibold text-text-hi">Project, square, observe</p>
        <p className="mt-1 text-sm leading-6 text-text-low">The bra asks for one coordinate. The Born rule squares its magnitude.</p>
        <div className="mt-5 space-y-3 overflow-x-auto rounded-lg border border-ink-600 bg-ink-950/60 p-4 font-mono text-xs leading-7 text-text-mid" aria-live="polite">
          <p>|ψ⟩ = <span className="text-plaquette">{fixed(alpha)}</span>|0⟩ + <span className="text-star">{fixed(beta)}</span>|1⟩</p>
          <p>⟨0|ψ⟩ = α = <span className="text-plaquette">{fixed(alpha)}</span></p>
          <p>P(0) = |α|² = <span className="text-plaquette">{percent(pZero)}</span></p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <BornTile outcome="0" amplitude={alpha} probability={pZero} tone="cyan" />
          <BornTile outcome="1" amplitude={beta} probability={pOne} tone="violet" />
        </div>
        <p className="mt-5 rounded-lg border border-stabilizer/25 bg-stabilizer/5 p-3 text-sm leading-6 text-text-mid">
          The vector stays length 1: <span className="font-mono text-stabilizer">|α|² + |β|² = {fixed(pZero + pOne)}</span>
        </p>
      </section>
    </div>
  );
}

function BornTile({ outcome, amplitude, probability, tone }: { outcome: string; amplitude: number; probability: number; tone: 'cyan' | 'violet' }) {
  const classes = tone === 'cyan' ? 'border-plaquette/30 text-plaquette' : 'border-star/30 text-star';
  return (
    <div className={`rounded-xl border bg-ink-850 p-4 text-center ${classes}`}>
      <span className="font-mono text-xs">outcome {outcome}</span>
      <p className="mt-3 font-mono text-lg text-text-hi">{fixed(amplitude)}²</p>
      <p className="mt-1 font-display text-2xl font-bold">{percent(probability)}</p>
    </div>
  );
}

function PhaseVisual() {
  const [globalPhase, setGlobalPhase] = useState(35);
  const [relativePhase, setRelativePhase] = useState(120);
  const globalRadians = globalPhase * Math.PI / 180;
  const relativeRadians = relativePhase * Math.PI / 180;
  const pAfterH = Math.cos(relativeRadians / 2) ** 2;
  const origin = { x: 145, y: 132 };
  const length = 82;
  const zeroTip = {
    x: origin.x + length * Math.cos(globalRadians),
    y: origin.y - length * Math.sin(globalRadians),
  };
  const oneTip = {
    x: origin.x + length * Math.cos(globalRadians + relativeRadians),
    y: origin.y - length * Math.sin(globalRadians + relativeRadians),
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-xl border border-ink-600 bg-ink-900/70 p-5" aria-labelledby="phase-clock-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="phase-clock-title" className="font-display font-semibold text-text-hi">Two-hand phase clock</p>
            <p className="mt-1 text-sm text-text-low">Rotate the pair together, then change their separation.</p>
          </div>
          <span className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs text-plaquette">gap φ = {relativePhase}°</span>
        </div>
        <svg viewBox="0 0 290 265" className="mx-auto mt-2 w-full max-w-md" role="img" aria-label={`Two amplitude clock hands have global rotation ${globalPhase} degrees and relative separation ${relativePhase} degrees`}>
          <defs>
            <ArrowHead id="phase-zero" color="#22D3EE" />
            <ArrowHead id="phase-one" color="#8B5CF6" />
          </defs>
          <circle cx={origin.x} cy={origin.y} r="105" fill="#0A0F1C" stroke="#2A3A5F" />
          {Array.from({ length: 12 }, (_, index) => {
            const angle = index * Math.PI / 6;
            return <circle key={index} cx={origin.x + Math.cos(angle) * 91} cy={origin.y - Math.sin(angle) * 91} r="2.5" fill="#3D5178" />;
          })}
          <line x1={origin.x - 105} y1={origin.y} x2={origin.x + 105} y2={origin.y} stroke="#2A3A5F" />
          <line x1={origin.x} y1={origin.y - 105} x2={origin.x} y2={origin.y + 105} stroke="#2A3A5F" />
          <line x1={origin.x} y1={origin.y} x2={zeroTip.x} y2={zeroTip.y} stroke="#22D3EE" strokeWidth="5" markerEnd="url(#phase-zero)" />
          <line x1={origin.x} y1={origin.y} x2={oneTip.x} y2={oneTip.y} stroke="#8B5CF6" strokeWidth="5" markerEnd="url(#phase-one)" />
          <circle cx={origin.x} cy={origin.y} r="7" fill="#EAF0FB" />
          <text x={zeroTip.x + 9} y={zeroTip.y - 7} fill="#22D3EE" fontSize="12" fontFamily="JetBrains Mono">|0⟩</text>
          <text x={oneTip.x + 9} y={oneTip.y - 7} fill="#A78BFA" fontSize="12" fontFamily="JetBrains Mono">|1⟩</text>
          <text x={origin.x} y="256" textAnchor="middle" fill="#64708E" fontSize="11" fontFamily="JetBrains Mono">Only the angle between the hands reaches the mixer</text>
        </svg>

        <div className="space-y-5">
          <div>
            <label htmlFor="global-phase" className="flex items-center justify-between gap-4 text-sm text-text-mid">
              <span>Rotate both hands: global γ</span>
              <output htmlFor="global-phase" className="font-mono text-plaquette">{globalPhase}°</output>
            </label>
            <input id="global-phase" type="range" min="0" max="360" step="5" value={globalPhase} onChange={(event) => setGlobalPhase(Number(event.target.value))} aria-valuetext={`${globalPhase} degrees global phase`} className="mt-2 w-full accent-plaquette" />
          </div>
          <div>
            <label htmlFor="relative-phase" className="flex items-center justify-between gap-4 text-sm text-text-mid">
              <span>Separate the hands: relative φ</span>
              <output htmlFor="relative-phase" className="font-mono text-star">{relativePhase}°</output>
            </label>
            <input id="relative-phase" type="range" min="0" max="360" step="5" value={relativePhase} onChange={(event) => setRelativePhase(Number(event.target.value))} aria-valuetext={`${relativePhase} degrees relative phase`} className="mt-2 w-full accent-star" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-star/25 bg-ink-900/70 p-5" aria-labelledby="phase-mixer-title">
        <p id="phase-mixer-title" className="font-display font-semibold text-text-hi">Send the state through H</p>
        <p className="mt-1 text-sm leading-6 text-text-low">A Hadamard mixes the two basis paths, turning relative phase into a countable output.</p>
        <div className="mt-5 overflow-x-auto rounded-lg border border-ink-600 bg-ink-950/60 p-4 font-mono text-xs leading-7 text-text-mid" aria-live="polite">
          <p>|ψ⟩ = eⁱγ(|0⟩ + eⁱφ|1⟩)/√2</p>
          <p>P(0 after H) = cos²(φ/2)</p>
          <p className="text-star">= {percent(pAfterH)}</p>
        </div>
        <div className="mt-6 rounded-xl border border-ink-600 bg-ink-850 p-5">
          <div className="flex items-center gap-3 font-mono text-xs text-text-mid">
            <span className="rounded-md border border-star/30 bg-star/10 px-3 py-2 text-star">relative φ</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span className="rounded-md border border-plaquette/30 bg-plaquette/10 px-3 py-2 text-plaquette">H mixer</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span className="rounded-md border border-stabilizer/30 bg-stabilizer/10 px-3 py-2 text-stabilizer">counts</span>
          </div>
          <div className="mt-6">
            <DetectorBar label="outcome 0" value={pAfterH} color="green" />
          </div>
        </div>
        <p className="mt-5 rounded-lg border border-plaquette/25 bg-plaquette/5 p-4 text-sm leading-6 text-text-mid">
          Try moving only <span className="font-mono text-plaquette">γ</span>: the clock rotates, but the output bar does not. Move <span className="font-mono text-star">φ</span>: the output changes.
        </p>
      </section>
    </div>
  );
}

const TWO_QUBIT_STATES = {
  'plus-plus': {
    name: 'Independent |+⟩ states',
    notation: '|+⟩ ⊗ |+⟩',
    amplitudes: [0.5, 0.5, 0.5, 0.5],
    hint: 'Every row has the same shape. One row recipe and one column recipe generate the table.',
  },
  bell: {
    name: 'Bell pair',
    notation: '(|00⟩ + |11⟩)/√2',
    amplitudes: [Math.SQRT1_2, 0, 0, Math.SQRT1_2],
    hint: 'The diagonal cells cannot come from multiplying two independent single-qubit lists.',
  },
  biased: {
    name: 'Biased product',
    notation: '(√.8|0⟩+√.2|1⟩) ⊗ (√.25|0⟩−√.75|1⟩)',
    amplitudes: [Math.sqrt(0.2), -Math.sqrt(0.6), Math.sqrt(0.05), -Math.sqrt(0.15)],
    hint: 'Unequal cells can still factor. Entanglement is not the same thing as “looks uneven.”',
  },
  knot: {
    name: 'One phase knot',
    notation: 'CZ |++⟩',
    amplitudes: [0.5, 0.5, 0.5, -0.5],
    hint: 'All four probabilities match |++⟩, yet one relative minus sign makes the table inseparable.',
  },
} as const;

type TwoQubitPreset = keyof typeof TWO_QUBIT_STATES;

function TwoQubitVisual() {
  const [preset, setPreset] = useState<TwoQubitPreset>('plus-plus');
  const state = TWO_QUBIT_STATES[preset];
  const [a00, a01, a10, a11] = state.amplitudes;
  const determinant = a00 * a11 - a01 * a10;
  const factors = Math.abs(determinant) < 1e-9;
  const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-xl border border-ink-600 bg-ink-900/70 p-5" aria-labelledby="amplitude-table-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="amplitude-table-title" className="font-display font-semibold text-text-hi">Joint-amplitude table</p>
            <p className="mt-1 text-sm text-text-low">Rows belong to qubit A; columns belong to qubit B.</p>
          </div>
          <span className={`rounded-full border px-3 py-1 font-mono text-xs ${factors ? 'border-stabilizer/35 bg-stabilizer/10 text-stabilizer' : 'border-syndrome/35 bg-syndrome/10 text-syndrome'}`}>
            {factors ? 'FACTORS' : 'ENTANGLED'}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Choose a two-qubit pure state">
          {(Object.keys(TWO_QUBIT_STATES) as TwoQubitPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreset(key)}
              aria-pressed={preset === key}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${preset === key ? 'border-plaquette bg-plaquette/10 text-plaquette' : 'border-ink-600 bg-ink-850 text-text-mid hover:border-ink-500 hover:text-text-hi'}`}
            >
              {TWO_QUBIT_STATES[key].name}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-7 grid max-w-md grid-cols-[34px_1fr_1fr] grid-rows-[28px_1fr_1fr] gap-2" role="img" aria-label={`${state.name} amplitude table: ${labels.map((label, index) => `${label} amplitude ${fixed(state.amplitudes[index])}`).join(', ')}`}>
          <div />
          <div className="text-center font-mono text-xs text-text-low">B = 0</div>
          <div className="text-center font-mono text-xs text-text-low">B = 1</div>
          <div className="flex items-center font-mono text-xs text-text-low">A=0</div>
          {state.amplitudes.slice(0, 2).map((amplitude, index) => <AmplitudeCell key={labels[index]} label={labels[index]} amplitude={amplitude} />)}
          <div className="flex items-center font-mono text-xs text-text-low">A=1</div>
          {state.amplitudes.slice(2).map((amplitude, index) => <AmplitudeCell key={labels[index + 2]} label={labels[index + 2]} amplitude={amplitude} />)}
        </div>

        <p className="mt-6 overflow-x-auto rounded-lg border border-ink-600 bg-ink-950/60 px-4 py-3 text-center font-mono text-xs text-text-hi">{state.notation}</p>
        <p className="mt-4 text-sm leading-6 text-text-mid">{state.hint}</p>
      </section>

      <section className={`rounded-xl border bg-ink-900/70 p-5 ${factors ? 'border-stabilizer/30' : 'border-syndrome/30'}`} aria-labelledby="factor-test-title">
        <p id="factor-test-title" className="font-display font-semibold text-text-hi">The cross-product test</p>
        <p className="mt-1 text-sm leading-6 text-text-low">For a pure two-qubit state, this one number answers whether the table separates.</p>
        <div className="mt-5 rounded-lg border border-ink-600 bg-ink-950/60 p-4 font-mono text-xs leading-7 text-text-mid" aria-live="polite">
          <p>Δ = a₀₀a₁₁ − a₀₁a₁₀</p>
          <p>Δ = ({fixed(a00)})({fixed(a11)})</p>
          <p className="pl-7">− ({fixed(a01)})({fixed(a10)})</p>
          <p className={`mt-2 text-base ${factors ? 'text-stabilizer' : 'text-syndrome'}`}>Δ = {fixed(determinant, 3)}</p>
        </div>
        <div className={`mt-5 rounded-xl border p-5 ${factors ? 'border-stabilizer/30 bg-stabilizer/5' : 'border-syndrome/30 bg-syndrome/5'}`}>
          <div className="flex items-center gap-3">
            {factors ? <CheckCircle2 className="h-5 w-5 text-stabilizer" aria-hidden="true" /> : <Sparkles className="h-5 w-5 text-syndrome" aria-hidden="true" />}
            <p className={`font-mono text-xs uppercase tracking-wider ${factors ? 'text-stabilizer' : 'text-syndrome'}`}>{factors ? 'Independent recipes exist' : 'One joint recipe is required'}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-text-mid">
            {factors
              ? 'Δ = 0, so the amplitude table can be written as a column for A multiplied by a row for B.'
              : 'Δ ≠ 0, so no pair of single-qubit amplitude lists can reproduce all four cells.'}
          </p>
        </div>
        <div className="mt-5 rounded-lg border border-magic/25 bg-magic/5 p-4 text-sm leading-6 text-text-mid">
          <span className="font-mono text-xs uppercase tracking-wider text-magic">Strong comparison</span>
          <p className="mt-1">Compare <span className="font-mono text-text-hi">Independent |+⟩ states</span> with <span className="font-mono text-text-hi">One phase knot</span>. Their cell probabilities match, but their relative phases—and entanglement—do not.</p>
        </div>
      </section>
    </div>
  );
}

function AmplitudeCell({ label, amplitude }: { label: string; amplitude: number }) {
  const magnitude = Math.abs(amplitude);
  const isNegative = amplitude < 0;
  return (
    <div
      className={`relative flex min-h-28 flex-col items-center justify-center overflow-hidden rounded-xl border p-3 ${isNegative ? 'border-star/50 bg-star/10' : magnitude > 0 ? 'border-plaquette/40 bg-plaquette/10' : 'border-ink-600 bg-ink-850'}`}
    >
      <div className={`absolute inset-x-0 bottom-0 ${isNegative ? 'bg-star/15' : 'bg-plaquette/15'}`} style={{ height: `${magnitude ** 2 * 100}%` }} />
      <span className="relative font-mono text-xs text-text-low">{label}</span>
      <span className={`relative mt-2 font-mono text-base ${isNegative ? 'text-star' : magnitude > 0 ? 'text-plaquette' : 'text-text-low'}`}>{amplitude >= 0 ? '+' : '−'}{fixed(magnitude)}</span>
      <span className="relative mt-1 font-mono text-[10px] text-text-low">P {percent(magnitude ** 2)}</span>
    </div>
  );
}

type Mapping = {
  concrete: string;
  formal: string;
};

function LearningFrame({
  metaphorTitle,
  metaphor,
  mappings,
  boundary,
}: {
  metaphorTitle: string;
  metaphor: string;
  mappings: Mapping[];
  boundary: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-plaquette/25 bg-plaquette/5 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-plaquette">Physical metaphor</p>
        <h3 className="mt-2 font-display text-lg font-semibold text-text-hi">{metaphorTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-text-mid">{metaphor}</p>
      </section>

      <section className="rounded-xl border border-star/25 bg-star/5 p-5 lg:col-span-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-star">Correspondence map</p>
        <div className="mt-4 divide-y divide-ink-600/70">
          {mappings.map((mapping) => (
            <div key={mapping.concrete} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[0.8fr_28px_1.2fr] sm:items-center">
              <span className="text-sm text-text-mid">{mapping.concrete}</span>
              <ArrowRight className="hidden h-4 w-4 text-text-low sm:block" aria-hidden="true" />
              <span className="font-mono text-xs leading-5 text-text-hi">{mapping.formal}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-magic/25 bg-magic/5 p-5 lg:col-span-3">
        <div className="flex gap-3">
          <span className="mt-0.5 rounded-md border border-magic/30 bg-magic/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-magic">Where it breaks</span>
          <p className="text-sm leading-6 text-text-mid">{boundary}</p>
        </div>
      </section>
    </div>
  );
}

function WorkedExample({ title, steps, result }: { title: string; steps: string[]; result: string }) {
  return (
    <section className="rounded-xl border border-ink-600 bg-ink-850/80 p-5 md:p-6" aria-labelledby={`worked-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-stabilizer/30 bg-stabilizer/10 font-mono text-xs text-stabilizer">∴</span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-stabilizer">Worked example</p>
          <h3 id={`worked-${title.replace(/\s+/g, '-').toLowerCase()}`} className="mt-1 font-display text-lg font-semibold text-text-hi">{title}</h3>
        </div>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step} className="rounded-lg border border-ink-600 bg-ink-900/70 p-4 text-sm leading-6 text-text-mid">
            <span className="mb-2 block font-mono text-xs text-plaquette">0{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-lg border border-stabilizer/25 bg-stabilizer/5 px-4 py-3 font-mono text-sm leading-6 text-stabilizer">{result}</p>
    </section>
  );
}

function Prediction({
  stageId,
  state,
  onSelect,
  onSubmit,
}: {
  stageId: StageId;
  state: PredictionState;
  onSelect: (option: number) => void;
  onSubmit: () => void;
}) {
  const question = QUESTIONS[stageId];
  const correct = state.submitted && state.selected === question.answer;

  return (
    <section className="rounded-xl border border-plaquette/30 bg-[linear-gradient(135deg,rgba(34,211,238,0.07),rgba(139,92,246,0.05))] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-plaquette/30 bg-plaquette/10">
          <FlaskConical className="h-5 w-5 text-plaquette" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-plaquette">Predict before reveal · 20 practice points</p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-7 text-text-hi">{question.prompt}</h3>
        </div>
      </div>

      <fieldset className="mt-5" disabled={state.submitted}>
        <legend className="sr-only">Choose one prediction</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {question.options.map((option, index) => {
            const selected = state.selected === index;
            const isAnswer = state.submitted && index === question.answer;
            const isWrongSelection = state.submitted && selected && index !== question.answer;
            return (
              <label
                key={option}
                className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm leading-5 transition-colors ${isAnswer ? 'border-stabilizer/60 bg-stabilizer/10 text-text-hi' : isWrongSelection ? 'border-syndrome/60 bg-syndrome/10 text-text-hi' : selected ? 'border-plaquette bg-plaquette/10 text-text-hi' : 'border-ink-600 bg-ink-900/70 text-text-mid hover:border-ink-500 hover:text-text-hi'} ${state.submitted ? 'cursor-default' : ''}`}
              >
                <input
                  type="radio"
                  name={`prediction-${stageId}`}
                  value={index}
                  checked={selected}
                  onChange={() => onSelect(index)}
                  className="h-4 w-4 shrink-0 accent-plaquette"
                />
                <span className="flex-1">{option}</span>
                {isAnswer && <Check className="h-4 w-4 shrink-0 text-stabilizer" aria-label="Correct answer" />}
              </label>
            );
          })}
        </div>
      </fieldset>

      {!state.submitted ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={onSubmit} disabled={state.selected === null} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
            Lock prediction & reveal
          </button>
          <span className="text-xs text-text-low">Your choice cannot change until you reset the local practice.</span>
        </div>
      ) : (
        <div className={`mt-5 rounded-lg border p-4 ${correct ? 'border-stabilizer/35 bg-stabilizer/5' : 'border-syndrome/35 bg-syndrome/5'}`} role="status" aria-live="polite">
          <p className={`font-mono text-xs font-semibold uppercase tracking-wider ${correct ? 'text-stabilizer' : 'text-syndrome'}`}>{correct ? '+20 · Prediction matched' : '+0 · Model updated'}</p>
          <p className="mt-2 text-sm leading-6 text-text-mid">{question.explanation}</p>
        </div>
      )}
    </section>
  );
}

function StageContent({
  stageId,
  answer,
  onSelect,
  onSubmit,
}: {
  stageId: StageId;
  answer: PredictionState;
  onSelect: (option: number) => void;
  onSubmit: () => void;
}) {
  if (stageId === 'bit-amplitude') {
    return (
      <>
        <BitAmplitudeVisual />
        <LearningFrame
          metaphorTitle="A rail switch beside a wave splitter"
          metaphor="A classical switch commits to one rail. A wave splitter assigns a height to both output channels, and the energy delivered by a channel scales like height squared."
          mappings={[
            { concrete: 'One occupied rail', formal: 'classical bit b ∈ {0, 1}' },
            { concrete: 'Wave height in each channel', formal: 'complex amplitudes α and β' },
            { concrete: 'Channel energy ∝ height²', formal: 'P(0)=|α|², P(1)=|β|²' },
            { concrete: 'Fixed total input energy', formal: '|α|² + |β|² = 1' },
          ]}
          boundary="Water can literally divide and be watched continuously. A qubit does not reveal two partial answers: a standard measurement returns one classical outcome and generally changes the state. Quantum amplitudes can also carry complex phase, which water height alone does not capture."
        />
        <WorkedExample
          title="Amplitude is the square root of frequency"
          steps={[
            'Prepare |ψ⟩ = (3/5)|0⟩ + (4/5)|1⟩.',
            'Check normalization: (3/5)² + (4/5)² = 9/25 + 16/25 = 1.',
            'Apply the Born rule separately to each basis coordinate.',
          ]}
          result="P(0) = 9/25 = 36% · P(1) = 16/25 = 64%"
        />
        <Prediction stageId={stageId} state={answer} onSelect={onSelect} onSubmit={onSubmit} />
      </>
    );
  }

  if (stageId === 'interference') {
    return (
      <>
        <InterferenceVisual />
        <LearningFrame
          metaphorTitle="Two timed pushes on one swing"
          metaphor="Push with the swing and the motion grows; push against it and the motion shrinks. Strength sets arrow length, timing sets arrow direction, and the arrows add tip-to-tail."
          mappings={[
            { concrete: 'Strength of a push', formal: 'amplitude magnitude |a|' },
            { concrete: 'Timing within a cycle', formal: 'complex phase arg(a)' },
            { concrete: 'Combined swing motion', formal: 'amplitude sum a₁ + a₂' },
            { concrete: 'Observed energy after combining', formal: 'probability |a₁ + a₂|²' },
          ]}
          boundary="A phasor is a mathematical representation, not a tiny arrow orbiting inside a qubit. A detector produces discrete events across repeated trials, not a continuously visible swing height. The analogy earns its keep only for addition and phase."
        />
        <WorkedExample
          title="Quarter-cycle separation"
          steps={[
            'Let the D0 path amplitudes be 1/2 and i/2, a 90° separation.',
            'Add first: A(D0) = 1/2 + i/2.',
            'Square the resultant length: |A|² = (1/2)² + (1/2)².',
          ]}
          result="P(D0) = 1/2 · the complementary detector receives the other 1/2"
        />
        <Prediction stageId={stageId} state={answer} onSelect={onSelect} onSubmit={onSubmit} />
      </>
    );
  }

  if (stageId === 'ket-born') {
    return (
      <>
        <KetBornVisual />
        <LearningFrame
          metaphorTitle="Coordinates on a map"
          metaphor="A location is not its latitude or longitude alone; it is the ordered pair. In the same way, a ket records the amplitude coordinate along every chosen basis direction."
          mappings={[
            { concrete: 'Map axes', formal: 'basis kets |0⟩ and |1⟩' },
            { concrete: 'Ordered coordinate pair', formal: '|ψ⟩ ↔ column [α, β]ᵀ' },
            { concrete: 'Projection onto one axis', formal: '⟨0|ψ⟩ = α' },
            { concrete: 'Squared projection magnitude', formal: 'Born probability P(0)=|α|²' },
          ]}
          boundary="The drawn arrow is not a trajectory through ordinary space, and the basis axes are not physical x/y directions. The visual above shows only real, nonnegative amplitudes; a general ket has complex coordinates."
        />
        <WorkedExample
          title="Complex coordinates still obey the same rule"
          steps={[
            'Take |ψ⟩ = (−i/√3)|0⟩ + √(2/3)|1⟩.',
            'Magnitude removes phase: |−i/√3|² = 1/3.',
            'Square the other coordinate: |√(2/3)|² = 2/3; the sum is 1.',
          ]}
          result="P(0) = 1/3 · P(1) = 2/3 · the factor −i affects phase, not this basis readout"
        />
        <Prediction stageId={stageId} state={answer} onSelect={onSelect} onSubmit={onSubmit} />
      </>
    );
  }

  if (stageId === 'phase') {
    return (
      <>
        <PhaseVisual />
        <LearningFrame
          metaphorTitle="Two clock hands and a rotating camera"
          metaphor="Turning the camera rotates both hands in the picture but preserves their separation. Changing one hand relative to the other changes when their pushes reinforce after they are mixed."
          mappings={[
            { concrete: 'Rotate the whole camera', formal: 'global factor eⁱγ on the complete state' },
            { concrete: 'Angle between the hands', formal: 'relative phase φ' },
            { concrete: 'Mechanism that compares the hands', formal: 'interference operation such as H' },
            { concrete: 'Changed output counts', formal: 'P(0 after H)=cos²(φ/2)' },
          ]}
          boundary="Phase is not a literal clock hidden inside the hardware. A global phase of the complete state is unobservable; a phase that looks global for one subsystem can become relative when that subsystem is compared or entangled with something else."
        />
        <WorkedExample
          title="The plus and minus states look equal until mixed"
          steps={[
            '|+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2 both give 50/50 in a direct Z-basis measurement.',
            'Their relative phases differ: φ = 0 for |+⟩ and φ = π for |−⟩.',
            'Apply H to make the paths interfere: H|+⟩ = |0⟩ and H|−⟩ = |1⟩.',
          ]}
          result="Relative phase becomes observable through interference; a common global phase never does"
        />
        <Prediction stageId={stageId} state={answer} onSelect={onSelect} onSubmit={onSubmit} />
      </>
    );
  }

  return (
    <>
      <TwoQubitVisual />
      <LearningFrame
        metaphorTitle="A 2×2 tray made from two recipes"
        metaphor="Rows say what qubit A contributes; columns say what qubit B contributes. If one row recipe times one column recipe fills every cell, the preparation is independent. A pattern that resists that split is woven jointly."
        mappings={[
          { concrete: 'Tray address: row A, column B', formal: 'basis ket |AB⟩' },
          { concrete: 'Signed/complex amount in one cell', formal: 'joint amplitude aᵢⱼ' },
          { concrete: 'Row recipe × column recipe', formal: 'product state |u⟩ ⊗ |v⟩' },
          { concrete: 'Cross-products disagree', formal: 'a₀₀a₁₁ − a₀₁a₁₀ ≠ 0 ⇒ entangled' },
        ]}
        boundary="The four boxes are basis labels, not four places where two little particles sit. The determinant test here is exact for pure two-qubit states; classically correlated mixed states require a density matrix and a more careful entanglement test."
      />
      <WorkedExample
        title="Factor an all-equal table"
        steps={[
          'Start with a₀₀ = a₀₁ = a₁₀ = a₁₁ = 1/2.',
          'Test the cross-products: (1/2)(1/2) − (1/2)(1/2) = 0.',
          'Pull out two identical lists: [1/√2, 1/√2]ᵀ times [1/√2, 1/√2].',
        ]}
        result="[1/2  1/2; 1/2  1/2] = |+⟩ ⊗ |+⟩ · zero determinant means separable"
      />
      <Prediction stageId={stageId} state={answer} onSelect={onSelect} onSubmit={onSubmit} />
    </>
  );
}

function PracticeScore({
  answers,
  onReset,
}: {
  answers: Answers;
  onReset: () => void;
}) {
  const [shareStatus, setShareStatus] = useState('');
  const submitted = STAGES.filter((stage) => answers[stage.id].submitted).length;
  const correct = STAGES.filter((stage) => answers[stage.id].submitted && answers[stage.id].selected === QUESTIONS[stage.id].answer).length;
  const score = correct * 20;
  const complete = submitted === STAGES.length;

  const share = async () => {
    const marks = STAGES.map((stage) => answers[stage.id].selected === QUESTIONS[stage.id].answer ? '●' : answers[stage.id].submitted ? '○' : '·').join('');
    const text = `Waves to Qubits — ${score}/100 local practice points ${marks}\n${correct}/${STAGES.length} predictions matched. Practice result only; not independently verified.`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Waves to Qubits practice result', text });
        setShareStatus('Share sheet opened.');
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus('Practice result copied.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('Sharing is unavailable in this browser.');
    }
  };

  return (
    <aside className="overflow-hidden rounded-2xl border border-ink-500 bg-ink-850 shadow-[0_20px_70px_rgba(0,0,0,0.28)]" aria-labelledby="practice-score-title">
      <div className="border-b border-ink-600 bg-[linear-gradient(120deg,rgba(34,211,238,0.10),rgba(139,92,246,0.10))] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-magic/40 bg-magic/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-magic">Local practice · not verified</span>
          <span className="font-mono text-xs text-text-low">saved on this device</span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p id="practice-score-title" className="font-display text-xl font-semibold text-text-hi">Practice transcript</p>
            <p className="mt-1 text-sm text-text-mid">{submitted}/{STAGES.length} predictions locked</p>
          </div>
          <div className="text-right">
            <span className="font-display text-4xl font-bold text-gradient-cyan-violet">{score}</span>
            <span className="font-mono text-sm text-text-low"> / 100</span>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <ol className="space-y-3">
          {STAGES.map((stage, index) => {
            const answer = answers[stage.id];
            const isCorrect = answer.submitted && answer.selected === QUESTIONS[stage.id].answer;
            return (
              <li key={stage.id} className="flex items-center gap-3 text-sm">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${isCorrect ? 'border-stabilizer/40 bg-stabilizer/10 text-stabilizer' : answer.submitted ? 'border-syndrome/40 bg-syndrome/10 text-syndrome' : 'border-ink-600 bg-ink-900 text-text-low'}`}>
                  {isCorrect ? <Check className="h-3.5 w-3.5" aria-label="Correct" /> : index + 1}
                </span>
                <span className="flex-1 text-text-mid">{stage.short}</span>
                <span className={`font-mono text-xs ${isCorrect ? 'text-stabilizer' : answer.submitted ? 'text-syndrome' : 'text-text-low'}`}>{isCorrect ? '+20' : answer.submitted ? '+0' : 'open'}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-lg border border-ink-600 bg-ink-900/70 p-4 text-xs leading-5 text-text-low">
          This score proves only what this browser recorded. It has no server signature, identity check, or independent verifier.
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={share} disabled={!complete} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share practice result
          </button>
          <button type="button" onClick={onReset} className="btn-ghost px-2 py-2.5">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset local practice
          </button>
        </div>
        {!complete && <p className="mt-3 text-xs text-text-low">Complete all five predictions to share a comparable practice result.</p>}
        {shareStatus && <p className="mt-3 text-xs text-stabilizer" role="status" aria-live="polite">{shareStatus}</p>}
      </div>
    </aside>
  );
}

export default function FoundationsLab() {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(loadAnswers);
  const activeStage = STAGES[activeIndex];
  const submittedCount = useMemo(() => STAGES.filter((stage) => answers[stage.id].submitted).length, [answers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // In-memory practice remains available if storage is blocked.
    }
  }, [answers]);

  const chooseStage = (index: number) => {
    setActiveIndex(index);
    window.requestAnimationFrame(() => {
      document.getElementById('foundations-experiment')?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  const choosePrediction = (option: number) => {
    const stageId = activeStage.id;
    setAnswers((current) => {
      if (current[stageId].submitted) return current;
      return { ...current, [stageId]: { selected: option, submitted: false } };
    });
  };

  const submitPrediction = () => {
    const stageId = activeStage.id;
    setAnswers((current) => {
      if (current[stageId].selected === null || current[stageId].submitted) return current;
      return { ...current, [stageId]: { ...current[stageId], submitted: true } };
    });
  };

  const resetPractice = () => {
    setAnswers(emptyAnswers());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing else to clear when storage is blocked.
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-900 text-text-hi">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px] opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle at 18% 16%, rgba(34,211,238,0.16), transparent 28%), radial-gradient(circle at 80% 14%, rgba(139,92,246,0.16), transparent 30%), radial-gradient(circle, rgba(61,81,120,0.36) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 32px 32px',
        }}
        aria-hidden="true"
      />

      <section className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.65, ease: EASE }}>
          <p className="eyebrow">Foundation semester · module 01</p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-[-0.035em] text-text-hi md:text-7xl">
            Waves to <span className="text-gradient-cyan-violet">Qubits</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-mid">
            Build quantum intuition with your hands first: move a slider, predict the picture, then pin every visual mark to the mathematics it represents.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider text-text-low">
            <span className="rounded-full border border-ink-500 bg-ink-850/80 px-3 py-1.5">5 experiments</span>
            <span className="rounded-full border border-ink-500 bg-ink-850/80 px-3 py-1.5">No prerequisites</span>
            <span className="rounded-full border border-ink-500 bg-ink-850/80 px-3 py-1.5">Keyboard ready</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => chooseStage(0)} className="btn-primary">
              Begin with the bit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <a href="#practice-transcript" className="btn-secondary">See practice model</a>
          </div>
        </motion.div>

        <motion.div initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.08, ease: EASE }} className="relative">
          <div className="absolute -inset-8 rounded-full bg-plaquette/5 blur-3xl" aria-hidden="true" />
          <div className="relative rounded-2xl border border-ink-500 bg-ink-850/90 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-sm">
            <HeroBridge />
            <div className="grid gap-2 border-t border-ink-600 px-2 pb-2 pt-4 sm:grid-cols-3">
              {['See the relation', 'Name the symbols', 'Retrieve unaided'].map((label, index) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-ink-900/70 px-3 py-2 text-xs text-text-mid">
                  <span className="font-mono text-plaquette">0{index + 1}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-ink-600 bg-ink-950/55">
        <div className="mx-auto max-w-6xl px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-plaquette">Learning contract</p>
              <p className="mt-1 text-sm text-text-mid">Every analogy declares its correspondence—and its failure boundary.</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-text-low">
              <Waves className="h-4 w-4 text-star" aria-hidden="true" />
              see → manipulate → predict → explain
            </div>
          </div>
        </div>
      </section>

      <section id="foundations-experiment" className="relative scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Choose an experiment</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">One idea per workbench</h2>
            </div>
            <p className="font-mono text-xs text-text-low">{submittedCount}/5 predictions complete</p>
          </div>

          <nav className="mt-8" aria-label="Waves to Qubits experiments">
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {STAGES.map((stage, index) => {
                const active = index === activeIndex;
                const completed = answers[stage.id].submitted;
                return (
                  <li key={stage.id}>
                    <button
                      type="button"
                      onClick={() => chooseStage(index)}
                      aria-current={active ? 'step' : undefined}
                      className={`group flex min-h-[76px] w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${active ? 'border-plaquette bg-plaquette/10' : completed ? 'border-stabilizer/35 bg-stabilizer/5' : 'border-ink-600 bg-ink-850 hover:border-ink-500'}`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${active ? 'border-plaquette bg-plaquette text-ink-950' : completed ? 'border-stabilizer bg-stabilizer/10 text-stabilizer' : 'border-ink-500 bg-ink-900 text-text-low'}`}>
                        {completed ? <Check className="h-4 w-4" aria-label="Prediction complete" /> : index + 1}
                      </span>
                      <span>
                        <span className={`block text-xs font-semibold ${active ? 'text-text-hi' : 'text-text-mid group-hover:text-text-hi'}`}>{stage.short}</span>
                        <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-text-low">experiment 0{index + 1}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <motion.article
            key={activeStage.id}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            className="mt-10"
            aria-labelledby={`stage-title-${activeStage.id}`}
          >
            <header className="mb-7 border-l-2 border-plaquette pl-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-plaquette">Experiment {activeIndex + 1} of 5</p>
              <h2 id={`stage-title-${activeStage.id}`} className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">{activeStage.title}</h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-text-mid">
                {activeStage.id === 'bit-amplitude' && 'Separate a definite classical value from the pair of complex weights that defines a qubit state.'}
                {activeStage.id === 'interference' && 'Treat phase as geometry: combine possible paths as arrows before converting anything into probability.'}
                {activeStage.id === 'ket-born' && 'Translate without hand-waving between a drawn vector, ket notation, coordinates, and observed frequencies.'}
                {activeStage.id === 'phase' && 'Discover why rotating every amplitude together does nothing while rotating one against another changes interference.'}
                {activeStage.id === 'two-qubit' && 'Use a joint amplitude table to see the exact boundary between two independent states and entanglement.'}
              </p>
            </header>

            <div className="space-y-6">
              <MultiAgeCognitiveLens />
              <StageContent
                stageId={activeStage.id}
                answer={answers[activeStage.id]}
                onSelect={choosePrediction}
                onSubmit={submitPrediction}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink-600 pt-6">
              <button type="button" onClick={() => chooseStage(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} className="btn-ghost px-2 py-2 disabled:cursor-not-allowed disabled:opacity-30">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Previous experiment
              </button>
              {activeIndex < STAGES.length - 1 ? (
                <button type="button" onClick={() => chooseStage(activeIndex + 1)} className="btn-secondary">
                  Next experiment
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <a href="#practice-transcript" className="btn-secondary">
                  View practice transcript
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.article>
        </div>
      </section>

      <section id="practice-transcript" className="relative scroll-mt-20 border-t border-ink-600 bg-ink-950/45 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="max-w-xl">
            <p className="eyebrow">Retrieval, not decoration</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-hi md:text-4xl">A score with an honest boundary</h2>
            <p className="mt-5 text-base leading-7 text-text-mid">
              Each locked prediction is worth 20 points. The transcript persists in this browser so you can leave and return, but it is intentionally labeled practice—not proof of identity, mastery, or server-verified work.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ['01', 'Manipulate', 'Change a visible relationship.'],
                ['02', 'Predict', 'Commit before feedback.'],
                ['03', 'Explain', 'Map the picture to symbols.'],
              ].map(([number, title, copy]) => (
                <div key={number} className="rounded-xl border border-ink-600 bg-ink-850 p-4">
                  <span className="font-mono text-xs text-plaquette">{number}</span>
                  <p className="mt-2 font-display font-semibold text-text-hi">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-text-low">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <PracticeScore answers={answers} onReset={resetPractice} />
        </div>
      </section>
    </div>
  );
}

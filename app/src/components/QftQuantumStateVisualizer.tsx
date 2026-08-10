import { useState } from 'react';
import { Sparkles, Video } from 'lucide-react';
import { sound } from '@/lib/sound';

interface QftConcept {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  qftInsight: string;
  mathNotation: string;
  veo3Prompt: string;
}

const QFT_CONCEPTS: QftConcept[] = [
  {
    id: 'vacuum-fluctuations',
    title: '1. Quantum Vacuum & Zero-Point Energy',
    subtitle: 'Quantum Field Theory Vacuum State |0⟩',
    description: 'In Quantum Field Theory (QFT), the "empty" vacuum is not empty space—it is a dynamic sea of quantum field zero-point fluctuations E_0 = ½ħω.',
    qftInsight: 'Virtual particle-hole pairs continuously form and annihilate in zero-point vacuum modes, creating quantum noise floors in physical qubits.',
    mathNotation: '⟨0| ϕ(x) ϕ(y) |0⟩ = ∫ d³k / ((2π)³ 2E_k) e^{ik·(x-y)}',
    veo3Prompt: 'Cinematic 8K rendering of quantum field vacuum zero-point energy fluctuations, glowing cyan energy field ripples forming and dissolving in dark ink-navy space, photorealistic, 60fps.',
  },
  {
    id: 'superposition-wavepacket',
    title: '2. Superposition as Field Wavepacket Interference',
    subtitle: 'Quantum State |ψ⟩ = α|0⟩ + β|1⟩',
    description: 'A single qubit state is a coherent superposition wavepacket of quantum field excitations interfering in Hilbert space.',
    qftInsight: 'Relative phase θ dictates constructive vs destructive interference of field amplitudes before measurement.',
    mathNotation: '|ψ⟩ = cos(θ/2)|0⟩ + e^{iϕ} sin(θ/2)|1⟩',
    veo3Prompt: 'Hyperrealistic 3D visualization of a quantum state vector superposition wavepacket interfering in phase space, luminous cyan and violet wave crests merging, cinematic lighting, Google Veo 3 quality.',
  },
  {
    id: 'tqft-anyons',
    title: '3. Topological Anyon Excitations (TQFT)',
    subtitle: '2+1D Chern-Simons Topological Field Theory',
    description: 'Topological anyons are localized non-trivial topological excitations (defects) in a 2+1D Topological Quantum Field Theory (TQFT).',
    qftInsight: 'Braiding world-lines in 2+1D spacetime applies non-Abelian unitary rotations invariant under smooth geometric deformations.',
    mathNotation: 'S_{CS} = (k / 4π) ∫ Tr(A ∧ dA + ⅔ A ∧ A ∧ A)',
    veo3Prompt: 'Cinematic animation of non-Abelian anyon world-lines weaving through 3D spacetime, glowing braided ribbons of cyan and violet energy, topological quantum field theory, ultra high resolution.',
  },
  {
    id: 'measurement-collapse',
    title: '4. Projective Measurement & Decoherence',
    subtitle: 'Environmental Entanglement & Wavefunction Collapse',
    description: 'Measurement is the rapid entanglement of a qubit field with an external macroscopic environment reservoir.',
    qftInsight: 'Environmental decoherence suppresses off-diagonal density matrix elements ρ_01 → 0 in time t_decoherence < t_gate.',
    mathNotation: 'ρ(t) = ∑_k E_k ρ(0) E_k^†  (Kraus operator-sum representation)',
    veo3Prompt: 'Dramatic visual of a quantum superposition field collapsing into a definite measurement eigenstate upon environmental contact, glowing particles, photorealistic 8K, Google Veo 3 simulation.',
  },
];

export default function QftQuantumStateVisualizer() {
  const [selectedId, setSelectedId] = useState<string>('vacuum-fluctuations');
  const concept = QFT_CONCEPTS.find((c) => c.id === selectedId) ?? QFT_CONCEPTS[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    sound.playSyndromeTick();
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-plaquette" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              Quantum Field Theory (QFT) &amp; State Visualization
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Explore how quantum states truly behave as field excitations in QFT with Google Veo 3 AI generation prompts.
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          Veo 3 AI Prompts
        </span>
      </div>

      {/* Concept Selector Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {QFT_CONCEPTS.map((c) => {
          const active = c.id === concept.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c.id)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                active
                  ? 'border-plaquette bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
                  : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${active ? 'text-plaquette' : 'text-text-low'}`} />
              <span>{c.title}</span>
            </button>
          );
        })}
      </div>

      {/* Detailed Concept & Veo 3 Video Generator Card */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Interactive QFT Wave/Field Canvas Simulation */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-6 min-h-[380px]">
          <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
            <span className="text-text-hi font-bold">{concept.subtitle}</span>
          </div>

          <div className="relative w-full max-w-[380px] aspect-[4/3] my-4 flex flex-col items-center justify-center bg-ink-950 rounded-xl border border-ink-700 p-4">
            {/* Animated Field Ripple Simulation */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-plaquette/40 animate-ping opacity-75" />
              <div className="absolute inset-4 rounded-full border-2 border-magic/40 animate-pulse" />
              <div className="absolute inset-8 rounded-full border-2 border-stabilizer/50 animate-spin" />
              <div className="relative z-10 font-mono text-xs font-bold text-text-hi bg-ink-900/90 px-3 py-1.5 rounded-lg border border-ink-600">
                {concept.id === 'vacuum-fluctuations' && 'E₀ = ½ħω Vacuum'}
                {concept.id === 'superposition-wavepacket' && '|ψ⟩ Field Packet'}
                {concept.id === 'tqft-anyons' && 'Chern-Simons Braid'}
                {concept.id === 'measurement-collapse' && 'ρ₀₁ → 0 Collapse'}
              </div>
            </div>

            <div className="mt-4 font-mono text-[11px] text-plaquette text-center font-bold">
              {concept.mathNotation}
            </div>
          </div>
        </div>

        {/* Description & Google Veo 3 Prompt Studio */}
        <div className="flex flex-col justify-between rounded-xl border border-ink-600 bg-ink-800 p-5 font-mono text-xs">
          <div>
            <span className="eyebrow text-plaquette mb-2">// QFT PHYSICAL INSIGHT</span>
            <h4 className="font-display text-base font-bold text-text-hi mb-2">{concept.title}</h4>
            <p className="text-text-mid leading-relaxed font-sans text-xs mb-4">{concept.description}</p>

            <div className="rounded-lg bg-ink-900 p-3 border border-ink-700 mb-4">
              <span className="text-[10px] text-text-low uppercase block mb-1">Field Physics Context:</span>
              <span className="text-stabilizer font-sans text-xs leading-relaxed">{concept.qftInsight}</span>
            </div>

            {/* Google Veo 3 Prompt Studio */}
            <div className="border-t border-ink-700 pt-3">
              <div className="flex items-center gap-1.5 text-magic font-bold text-[11px] uppercase tracking-wider mb-2">
                <Video className="h-3.5 w-3.5" />
                <span>Google Veo 3 AI Video Generation Prompt</span>
              </div>
              <div className="rounded-lg bg-ink-950 p-3 border border-magic/30 font-mono text-[11px] text-text-mid select-all leading-relaxed">
                &ldquo;{concept.veo3Prompt}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

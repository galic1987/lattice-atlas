import { useState } from 'react';
import { Layers, BookOpen, GraduationCap, Cpu, Briefcase, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound';

type AudienceLevel = 'eli5' | 'undergrad' | 'phd' | 'hardware' | 'executive';
type VisualAngle = 'everyday' | 'geometric' | 'math' | 'circuit';

interface ConceptPrism {
  id: string;
  topicName: string;
  levels: Record<
    AudienceLevel,
    {
      title: string;
      summary: string;
      analogy: string;
      keyTakeaway: string;
    }
  >;
  angles: Record<
    VisualAngle,
    {
      title: string;
      description: string;
      visualNotation: string;
    }
  >;
}

const PRISM_CONCEPTS: ConceptPrism[] = [
  {
    id: 'surface-code-memory',
    topicName: 'Surface Code Quantum Memory',
    levels: {
      eli5: {
        title: '👶 ELI5: A Magic Checkerboard That Fixes Its Own Mistakes',
        summary: 'Imagine a checkerboard where your pieces can get accidentally flipped over by a breeze. Special checkerboard helpers constantly check neighbor pieces without looking at the secret numbers underneath!',
        analogy: 'Like a team of blindfolded puzzle checkers who can feel if two adjacent tiles match without revealing what picture is printed on them.',
        keyTakeaway: 'Errors are spotted by checking relationships, not by spoiling the secret quantum state!',
      },
      undergrad: {
        title: '🎓 Undergrad: 2D Grid of Data & Ancilla Qubits',
        summary: 'A 2D square lattice interweaving data qubits on edges with parity check ancilla qubits on faces (X-plaquettes and Z-stars).',
        analogy: 'Parity measurement extracts eigenvalue +1 or -1 for operators X₁X₂X₃X₄ and Z₁Z₂Z₃Z₄ without projecting data qubits into computational states.',
        keyTakeaway: 'Measures 2-qubit & 4-qubit Pauli product parity continuously.',
      },
      phd: {
        title: '🔬 PhD: Homological Error Correction on 2D Manifolds',
        summary: 'Logical qubits are encoded in non-trivial homology cycles H₁(Σ, ℤ₂). Physical Pauli errors form boundary chains ∂C; syndromes are boundary points ∂C.',
        analogy: 'MWPM decodes by pairing syndrome defect endpoints on a 2+1D spacetime graph, finding the minimum-weight chain to restore the ground state manifold.',
        keyTakeaway: 'Fault tolerance threshold p_th ≈ 1.0% under phenomenological noise.',
      },
      hardware: {
        title: '🚀 Hardware Engineer: Transmon Layout & 20mK Cryo Controls',
        summary: 'Superconducting transmon grid with flux-tunable couplers, 1.1μs QEC measurement cycles, and fast active feedback to FPGA control racks.',
        analogy: 'High-fidelity CNOT pairs (99.87%) require precise microwave pulse shaping and readout resonators operating at 15–20mK dilution fridge temperatures.',
        keyTakeaway: 'Thermal dissipation & readout crosstalk dictate maximum grid size.',
      },
      executive: {
        title: '💼 Executive: 1,000x Physical Redundancy for Perfect Compute',
        summary: 'Quantum error correction converts noisy physical qubits into ultra-reliable logical qubits, unlocking commercial quantum algorithms.',
        analogy: 'Like RAID 6 for quantum computing—spreading 1 bit of logical information across 1,000 physical hardware elements so failures pass unnoticed.',
        keyTakeaway: 'Enables 100,000+ gate algorithms like Shor RSA-2048 & chemical catalysts.',
      },
    },
    angles: {
      everyday: {
        title: '🎨 Everyday Analogy: Woven Fabric & Knots',
        description: 'Topological protection acts like a tightly woven fabric. A tiny frayed thread (single physical qubit error) does not tear the sweater (logical qubit state).',
        visualNotation: 'Physical Error = Thread Fray · Topological Gate = Unraveling Protection',
      },
      geometric: {
        title: '📐 Geometric & Topological View: Anyonic Defect Graphs',
        description: 'Syndrome measurements highlight pairs of glowing anyon defects (cyan e-charges and violet m-monopoles) at boundary chain endpoints.',
        visualNotation: 'e-anyon = Z-plaquette flip · m-anyon = X-star flip',
      },
      math: {
        title: '🧮 Mathematical Formalism: Stabilizer Group Generator',
        description: 'The code space C is the joint +1 eigenspace of all generators in the stabilizer group S: C = {|ψ⟩ : g|ψ⟩ = |ψ⟩, ∀g ∈ S}.',
        visualNotation: 'g_X = ∏_{i ∈ P} X_i,   g_Z = ∏_{j ∈ S} Z_j',
      },
      circuit: {
        title: '💻 Circuit Pipeline: Stim Detector & DEM Extraction',
        description: 'Ancilla qubits execute 4 CNOT gates with neighbor data qubits, followed by Z-basis readout and DETECTOR declarations.',
        visualNotation: 'REPEAT 10 { R 0 1 2; CNOT 0 1; DETECTOR rec[-1] rec[-2]; }',
      },
    },
  },
];

export default function MultiAgeCognitivePrism() {
  const [activeLevel, setActiveLevel] = useState<AudienceLevel>('eli5');
  const [activeAngle, setActiveAngle] = useState<VisualAngle>('everyday');

  const concept = PRISM_CONCEPTS[0];
  const levelData = concept.levels[activeLevel];
  const angleData = concept.angles[activeAngle];

  const handleLevelSelect = (lvl: AudienceLevel) => {
    setActiveLevel(lvl);
    sound.playSyndromeTick();
  };

  const handleAngleSelect = (ang: VisualAngle) => {
    setActiveAngle(ang);
    sound.playSyndromeTick();
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-plaquette" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              Multi-Age &amp; Multi-Perspective Cognitive Prism
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Target every background level (ELI5 to PhD) and visual angle (analogies, topology, math, &amp; circuits).
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          5 Levels · 4 Perspectives
        </span>
      </div>

      {/* Audience Level Selector */}
      <div className="mt-6">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-low block mb-2 font-bold">
          // CHOOSE AUDIENCE LEVEL (DEPTH):
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'eli5', label: '👶 ELI5 (5-Year-Old)', icon: Sparkles },
            { id: 'undergrad', label: '🎓 Undergrad', icon: BookOpen },
            { id: 'phd', label: '🔬 PhD / Researcher', icon: GraduationCap },
            { id: 'hardware', label: '🚀 Hardware Eng', icon: Cpu },
            { id: 'executive', label: '💼 Executive', icon: Briefcase },
          ].map((item) => {
            const active = item.id === activeLevel;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLevelSelect(item.id as AudienceLevel)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                  active
                    ? 'border-plaquette bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
                    : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-plaquette' : 'text-text-low'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Angle Selector */}
      <div className="mt-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-low block mb-2 font-bold">
          // CHOOSE VISUAL PERSPECTIVE (ANGLE):
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'everyday', label: '🎨 Everyday Analogy' },
            { id: 'geometric', label: '📐 Geometric & Topological' },
            { id: 'math', label: '🧮 Math Formalism' },
            { id: 'circuit', label: '💻 Circuit & Code' },
          ].map((item) => {
            const active = item.id === activeAngle;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAngleSelect(item.id as VisualAngle)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
                  active
                    ? 'border-magic bg-magic/15 font-semibold text-text-hi shadow-glow-violet'
                    : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Display Card: Audience Explanation & Visual Angle */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Audience Level Explanation Card */}
        <div className="flex flex-col justify-between rounded-xl border border-ink-600 bg-ink-900 p-5 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-ink-700 pb-3 mb-4">
              <span className="eyebrow text-plaquette">// AUDIENCE LEVEL VIEW</span>
              <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-text-low uppercase">
                {activeLevel}
              </span>
            </div>

            <h4 className="font-display text-base font-bold text-text-hi mb-3">{levelData.title}</h4>
            <p className="font-sans text-xs text-text-mid leading-relaxed mb-4">{levelData.summary}</p>

            <div className="rounded-lg bg-ink-950 p-3.5 border border-plaquette/30 mb-4">
              <span className="text-[10px] text-plaquette uppercase block mb-1 font-bold">Physical Analogy:</span>
              <span className="font-sans text-xs text-text-hi leading-relaxed">{levelData.analogy}</span>
            </div>
          </div>

          <div className="rounded-lg bg-ink-950 p-3 border border-ink-700">
            <span className="text-[10px] text-stabilizer uppercase block mb-1 font-bold">Key Takeaway:</span>
            <span className="font-sans text-xs text-stabilizer leading-relaxed">{levelData.keyTakeaway}</span>
          </div>
        </div>

        {/* Visual Perspective Card */}
        <div className="flex flex-col justify-between rounded-xl border border-ink-600 bg-ink-900 p-5 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-ink-700 pb-3 mb-4">
              <span className="eyebrow text-magic">// VISUAL PERSPECTIVE ANGLE</span>
              <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-text-low uppercase">
                {activeAngle}
              </span>
            </div>

            <h4 className="font-display text-base font-bold text-text-hi mb-3">{angleData.title}</h4>
            <p className="font-sans text-xs text-text-mid leading-relaxed mb-4">{angleData.description}</p>
          </div>

          <div className="rounded-lg bg-ink-950 p-3.5 border border-magic/30 font-mono text-xs text-plaquette">
            <span className="text-[10px] text-text-low uppercase block mb-1">Visual Notation / Code:</span>
            <span className="font-bold">{angleData.visualNotation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

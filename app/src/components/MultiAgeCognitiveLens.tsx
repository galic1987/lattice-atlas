import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Baby,
  Gamepad2,
  GraduationCap,
  Atom,
  ChevronRight
} from 'lucide-react';
import { asset } from '@/lib/asset';

type CognitiveAgeLevel = '5yr' | '10yr' | '15yr' | '20yr';

interface AgeLensContent {
  level: CognitiveAgeLevel;
  ageLabel: string;
  badge: string;
  icon: typeof Baby;
  analogyTitle: string;
  metaphor: string;
  keyTakeaway: string;
  visualMetaphorType: string;
}

const AGE_LENS_MAP: Record<CognitiveAgeLevel, AgeLensContent> = {
  '5yr': {
    level: '5yr',
    ageLabel: '5 Years Old (Playful Wonder)',
    badge: '🧒 PLAYFUL TOYS',
    icon: Baby,
    analogyTitle: 'Toy Block Wall & Mischievous Ghosts',
    metaphor:
      'Imagine a magic toy block wall holding secret colored lights. Mischievous ghosts try to flip the light switches when you aren’t looking! But smart smoke detectors on the ceiling beep loudly when a ghost touches a block, so you know exactly which toy block to fix without opening the secret box!',
    keyTakeaway: 'We check for mistakes using smart alarms without looking inside the secret value!',
    visualMetaphorType: 'Playful Toy Blocks & Ceiling Smoke Alarms',
  },
  '10yr': {
    level: '10yr',
    ageLabel: '10 Years Old (Puzzle Game)',
    badge: '👦 PUZZLE GAME',
    icon: Gamepad2,
    analogyTitle: 'The Parity Alarm Maze',
    metaphor:
      'Think of a grid parity puzzle game! A grid of 9 qubits stores a hidden message. When environmental noise flips a qubit, the 4 surrounding square tiles turn RED. Your goal is to connect red alarm pairs with string paths before the timer expires to restore code balance!',
    keyTakeaway: 'Pairs of red syndrome alarms pinpoint errors so minimum-weight path matching restores equilibrium.',
    visualMetaphorType: 'Grid Parity Tile Maze & String Matching',
  },
  '15yr': {
    level: '15yr',
    ageLabel: '15 Years Old (High School Physics)',
    badge: '🧑 MATRIX ALGEBRA',
    icon: Atom,
    analogyTitle: 'Pauli Observables & Subspace Projection',
    metaphor:
      'A quantum state vector |ψ⟩ lives in a 2ⁿ-dimensional Hilbert space. Instead of measuring individual qubits directly (which collapses superposition), we measure 4-qubit Pauli Z-plaquette and X-star operators. Since stabilizers commute [Sᵢ, Sⱼ] = 0, measuring eigenvalues ±1 reveals Pauli faults while projecting back into the code subspace.',
    keyTakeaway: 'Commuting Hermitian matrix measurements extract error syndromes without destroying logical superposition.',
    visualMetaphorType: 'Pauli Matrix Tableaus & State Vector Projection',
  },
  '20yr': {
    level: '20yr',
    ageLabel: '20 Years Old / PhD (Fault-Tolerant Rigor)',
    badge: '🎓 HOMOLOGICAL RIGOR',
    icon: GraduationCap,
    analogyTitle: 'Homological Quantum Codes on 2D Manifolds',
    metaphor:
      'Topological surface codes map quantum error correction onto the homology of 2D Cell Complexes with Z₂ boundary conditions. The stabilizer group S = ⟨S₁ … S_d²-1⟩ defines a code space V_C = {|ψ⟩ : Sᵢ|ψ⟩ = +|ψ⟩}. Logical operations correspond to non-contractible 1-cycles on a Torus (Genus 1). Minimum-Weight Perfect Matching decodes syndrome 0-boundaries ∂e = s below fault-tolerant threshold p_th ≈ 1%.',
    keyTakeaway: 'Quantum error suppression relies on non-local topological invariants on Riemannian cell complexes.',
    visualMetaphorType: 'Homological 1-Cycles, Z₂ Chains & Torus Topology',
  },
};

export default function MultiAgeCognitiveLens() {
  const [activeLevel, setActiveLevel] = useState<CognitiveAgeLevel>('10yr');

  const lens = AGE_LENS_MAP[activeLevel];
  const Icon = lens.icon;

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// MULTI-AGE COGNITIVE GROWTH LENS</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] text-magic font-bold">4 MATURITY STAGES</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">How TQEC Explanation Scales From 5 to 20 Years Old</h3>
        </div>

        {/* Maturity Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {(['5yr', '10yr', '15yr', '20yr'] as CognitiveAgeLevel[]).map((lvl) => {
            const item = AGE_LENS_MAP[lvl];
            const active = activeLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevel(lvl)}
                className={
                  active
                    ? 'rounded-lg border border-plaquette bg-plaquette/20 px-3 py-1.5 font-mono text-xs font-bold text-plaquette shadow-sm'
                    : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
                }
              >
                {item.badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Metaphor Banner */}
      <div className="relative mt-6 h-48 w-full overflow-hidden rounded-xl border border-plaquette/30">
        <img
          src={asset('multi_age_cognitive_prism.jpg')}
          alt="Multi-Age Cognitive Prism Refraction"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent p-4 flex flex-col justify-end">
          <div className="flex items-center gap-2 font-mono text-xs text-star">
            <Sparkles className="h-4 w-4 animate-pulse" /> Active Dimension: {lens.visualMetaphorType}
          </div>
        </div>
      </div>

      {/* Active Cognitive Lens Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-6"
        >
          <div className="flex items-center justify-between border-b border-ink-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs text-text-low">{lens.ageLabel}</span>
                <h4 className="font-display text-lg font-bold text-text-hi">{lens.analogyTitle}</h4>
              </div>
            </div>
            <span className="font-mono text-xs text-plaquette font-bold">{lens.badge}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-text-hi font-sans">{lens.metaphor}</p>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-stabilizer/40 bg-stabilizer/10 p-3 font-mono text-xs text-stabilizer">
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span>Key Takeaway: {lens.keyTakeaway}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

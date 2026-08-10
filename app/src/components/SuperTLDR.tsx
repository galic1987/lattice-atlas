import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound';

const PAGE_TLDR: Record<string, { summary: string; takeaways: string[] }> = {
  '/': {
    summary: 'How quantum computers fix their own errors — the surface code, from linear algebra to Google Willow.',
    takeaways: [
      'Physical qubits under depolarizing noise generate syndrome detector fires.',
      'Minimum Weight Perfect Matching (MWPM) decodes syndromes without collapsing superpositions.',
      'Scaling code distance d exponential suppresses logical error rates (p < p_th).',
    ],
  },
  '/foundations': {
    summary: 'Master quantum fundamentals: from wave interference to Bloch sphere states and stabilizer circuits.',
    takeaways: [
      'Classical wave interference underpins quantum probability amplitudes.',
      'Single-qubit states live on the 3D Bloch sphere, rotated via H, X, Z, S, and T gates.',
      'Stabilizer check circuits measure multi-qubit Pauli parity without reading qubit states.',
    ],
  },
  '/map': {
    summary: 'Non-linear interactive knowledge graph organizing 26 fundamental TQEC topics across 6 progressive tiers.',
    takeaways: [
      'Explore prerequisite paths connecting classical error correction to fault-tolerant algorithms.',
      'Toggle between Physical Metaphor (Intuition) and Rigorous Math (Formalism) cognitive lenses.',
      'Track your mastery progress across all 26 core topological concepts.',
    ],
  },
  '/path': {
    summary: 'Structured 5-Act curriculum taking you from fundamental quantum mechanics to fault-tolerant architectures.',
    takeaways: [
      'Act 1 & 2: Quantum foundations, superposition paradoxes, and stabilizer algebra.',
      'Act 3 & 4: Rotated surface codes, syndrome decoding, and anyon braiding topology.',
      'Act 5: Fault-tolerant compilation, magic state distillation, and physical resource overheads.',
    ],
  },
  '/altitudes': {
    summary: 'Multi-age cognitive prism presenting quantum error correction across 5 distinct levels of detail.',
    takeaways: [
      'Story (~5 yrs): Tactile light-up tiles & physical metaphors.',
      'Cause (~10 yrs) & Model (~15 yrs): Interactive dot-connecting & stabilizer matrix models.',
      'Formal & Verify (20+ yrs): Rigorous math bounds (Λ), Stim circuit verification, and paper receipts.',
    ],
  },
  '/lab': {
    summary: 'Interactive FTQC Workbench Hub for 3D surface code patches, spacetime braid weaving, and illustrative Stim example circuits.',
    takeaways: [
      'Simulate d=3, 5, 7 rotated surface code lattices under depolarizing noise.',
      'Visualize 3D spacetime defect braiding worldlines and lattice surgery boundary welds.',
      'Browse illustrative Stim example circuits and explore Detector Error Model (.dem) graphs (not executed in-browser).',
    ],
  },
  '/duel': {
    summary: 'Daily 60-second speed challenge testing your visual intuition for MWPM decoding.',
    takeaways: [
      'Identify rose-ringed syndrome detector fires on a d=3 surface code lattice.',
      'Apply exact data qubit correction chains (X, Z) to prevent logical Pauli flips.',
      'Paint the correction, beat the built-in matching decoder, and share your (local, unverified) daily score.',
    ],
  },
  '/papers': {
    summary: 'Annotated bibliography of 23 seminal quantum error correction papers with PDF-verified reading prompts.',
    takeaways: [
      'Chronological timeline from Shor 1995 & Kitaev 1997 to Willow 2024 & TopoLS 2025.',
      'Each paper includes key contributions, why it matters, and PDF-verified technical notes.',
      'Direct arXiv links and prerequisite topic mappings for deep academic research.',
    ],
  },
  '/glossary': {
    summary: 'Comprehensive dictionary of 61 fundamental QEC terms, mathematical definitions, and physical concepts.',
    takeaways: [
      'Search and filter terms across Stabilizers, Topology, Decoders, and Distillation.',
      'Mathematical expressions formatted in clean JetBrains Mono notation.',
      'Cross-linked to Knowledge Map topics and seminal research papers.',
    ],
  },
  '/review': {
    summary: 'Spaced repetition active recall deck to permanently solidify key QEC physics, algorithms, and concepts.',
    takeaways: [
      'SM-2 algorithmic scheduling surfaces cards based on your self-reported confidence.',
      'Covers threshold theorems, stabilizer generators, lattice surgery, and distillation factories.',
      'Maintains long-term retention of core fault-tolerance physics principles.',
    ],
  },
  '/capstone': {
    summary: 'Final synthesis capstone project testing model diagnosis, dual-depth teach-back explanations, and local learning records.',
    takeaways: [
      'Diagnose syndrome pattern anticommutation rules on rotated surface code lattices.',
      'Submit dual-depth teach-back explanations (5-yr physical metaphor + 20-yr formal math).',
      'Generate a local, self-recorded evidence log of your progress (stored in your browser — not verified).',
    ],
  },
};

export interface SuperTLDRProps {
  summary?: string;
  takeaways?: string[];
  badge?: string;
}

export default function SuperTLDR({ summary: propsSummary, takeaways: propsTakeaways, badge = 'SUPER TL;DR' }: SuperTLDRProps = {}) {
  const { pathname } = useLocation();
  const routeData = PAGE_TLDR[pathname];
  const summary = propsSummary ?? routeData?.summary;
  const takeaways = propsTakeaways ?? routeData?.takeaways;

  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!summary) return null;

  const toggleOpen = () => {
    sound.playDecoderLock();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="mb-8 rounded-2xl border border-plaquette/40 bg-gradient-to-r from-plaquette/10 via-ink-900 to-magic/10 p-4 sm:p-5 shadow-glow-cyan">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-plaquette/20 text-plaquette group-hover:scale-105 transition-transform">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-plaquette flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> // {badge}
            </span>
            <h3 className="font-display text-sm font-bold text-text-hi group-hover:text-plaquette transition-colors">
              {summary}
            </h3>
          </div>
        </button>

        <button
          type="button"
          onClick={toggleOpen}
          className="ml-3 rounded-lg border border-ink-700 bg-ink-950/80 p-1.5 text-text-low hover:text-text-hi transition-colors shrink-0"
          aria-label={isOpen ? 'Collapse Super TL;DR' : 'Expand Super TL;DR'}
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      {takeaways && takeaways.length > 0 && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <ul className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-2.5 border-t border-ink-700/60 pt-3">
                {takeaways.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-xl bg-ink-950/60 p-2.5 font-mono text-xs text-text-mid border border-ink-800/80"
                  >
                    <span className="mt-0.5 shrink-0 text-plaquette text-[10px]">◆</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

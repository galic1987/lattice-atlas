import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  BookOpen,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { resolveTopic, shortName } from '@/data';
import { TERMS, matchGlossaryTerm, type GlossaryTerm } from '@/data/glossary';
import { TOPIC_COGNITIVE_LENS } from '@/data/cognitive_lens';
import { useProgress } from '@/store/progress';

interface SelectionState {
  text: string;
  contextText: string;
  x: number;
  y: number;
}

/** Visual SVG diagram generator for any concept */
function ConceptSuperVisual({ term }: { term: string }) {
  const lower = term.toLowerCase();

  // 1. Torus / Topology / Toric Code / Anyon
  if (lower.includes('torus') || lower.includes('topolog') || lower.includes('toric') || lower.includes('anyon')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-plaquette/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full">
          <defs>
            <linearGradient id="torusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Translucent Torus Oval */}
          <ellipse cx="150" cy="80" rx="100" ry="45" fill="none" stroke="url(#torusGrad)" strokeWidth="3" strokeDasharray="6 3" />
          <ellipse cx="150" cy="80" rx="40" ry="18" fill="none" stroke="#22D3EE" strokeWidth="2" />
          {/* Topological Loop */}
          <path d="M 50 80 Q 150 130 250 80" fill="none" stroke="#FB7185" strokeWidth="3" className="animate-pulse" />
          <circle cx="150" cy="105" r="4" fill="#FB7185" />
          <text x="150" y="125" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px]">Non-contractible Logical Loop</text>
          <text x="150" y="45" textAnchor="middle" fill="#A9B4CC" className="font-mono text-[11px]">Torus Topology (Genus 1)</text>
        </svg>
      </div>
    );
  }

  // 2. Stabilizer / Syndrome / Plaquette / Star / Error
  if (lower.includes('stabilizer') || lower.includes('syndrome') || lower.includes('plaquette') || lower.includes('star') || lower.includes('error')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-syndrome/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full">
          {/* Grid */}
          <rect x="90" y="30" width="120" height="100" fill="none" stroke="#2A3A5F" strokeWidth="2" />
          {/* Z Plaquette */}
          <rect x="90" y="30" width="60" height="50" fill="#22D3EE" fillOpacity="0.25" stroke="#22D3EE" strokeWidth="2" />
          {/* X Star */}
          <rect x="150" y="80" width="60" height="50" fill="#8B5CF6" fillOpacity="0.25" stroke="#8B5CF6" strokeWidth="2" />
          {/* Qubit dots */}
          <circle cx="90" cy="30" r="5" fill="#EAF0FB" />
          <circle cx="150" cy="30" r="5" fill="#EAF0FB" />
          <circle cx="210" cy="30" r="5" fill="#EAF0FB" />
          <circle cx="90" cy="80" r="5" fill="#EAF0FB" />
          <circle cx="150" cy="80" r="6" fill="#FB7185" />
          <circle cx="210" cy="80" r="5" fill="#EAF0FB" />
          <circle cx="150" cy="130" r="5" fill="#EAF0FB" />
          {/* Syndrome flash */}
          <circle cx="120" cy="55" r="8" fill="#FB7185" fillOpacity="0.8" className="animate-ping" />
          <text x="120" y="58" textAnchor="middle" fill="#FFFFFF" className="font-mono text-[9px] font-bold">!</text>
          <text x="150" y="152" textAnchor="middle" fill="#A9B4CC" className="font-mono text-[10px]">Syndrome Flash on Anti-Commutation</text>
        </svg>
      </div>
    );
  }

  // 3. Qubit / Pauli / Gate / Superposition / Dirac / Matrix
  if (lower.includes('qubit') || lower.includes('pauli') || lower.includes('gate') || lower.includes('state') || lower.includes('dirac') || lower.includes('matrix')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-star/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full">
          {/* Bloch Sphere Circle */}
          <circle cx="150" cy="80" r="50" fill="none" stroke="#2A3A5F" strokeWidth="2" />
          <ellipse cx="150" cy="80" rx="50" ry="18" fill="none" stroke="#2A3A5F" strokeWidth="1" strokeDasharray="3 3" />
          {/* Axis */}
          <line x1="150" y1="20" x2="150" y2="140" stroke="#64708E" strokeWidth="1.5" />
          {/* State Vector Arrow */}
          <line x1="150" y1="80" x2="185" y2="45" stroke="#8B5CF6" strokeWidth="3" />
          <circle cx="185" cy="45" r="4" fill="#8B5CF6" />
          {/* Kets */}
          <text x="150" y="15" textAnchor="middle" fill="#22D3EE" className="font-mono text-[11px]">|0⟩</text>
          <text x="150" y="155" textAnchor="middle" fill="#22D3EE" className="font-mono text-[11px]">|1⟩</text>
          <text x="210" y="45" textAnchor="start" fill="#8B5CF6" className="font-mono text-[10px]">|ψ⟩ = α|0⟩ + β|1⟩</text>
        </svg>
      </div>
    );
  }

  // Default Generic Quantum System Diagram
  return (
    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-ink-600 bg-ink-950 p-4">
      <svg viewBox="0 0 300 160" className="h-full w-full">
        <rect x="40" y="30" width="220" height="100" rx="8" fill="none" stroke="#2A3A5F" strokeWidth="2" />
        <circle cx="100" cy="80" r="25" fill="#22D3EE" fillOpacity="0.2" stroke="#22D3EE" strokeWidth="2" />
        <circle cx="200" cy="80" r="25" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="2" />
        <path d="M 125 80 Q 150 60 175 80" fill="none" stroke="#34D399" strokeWidth="2" strokeDasharray="4 2" />
        <text x="150" y="115" textAnchor="middle" fill="#A9B4CC" className="font-mono text-[11px]">Quantum Fault-Tolerant System</text>
      </svg>
    </div>
  );
}

export default function UniversalExplainer() {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [contextSnippet, setContextSnippet] = useState<string>('');
  const { lensMode } = useProgress();

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString().trim();
      if (text.length < 2 || text.length > 80) return;

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const parentEl = range.startContainer.parentElement;
        const context = parentEl ? (parentEl.innerText || parentEl.textContent || '') : '';

        setSelection({
          text,
          contextText: context.slice(0, 200),
          x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 120),
          y: Math.max(rect.top - 12, 40),
        });
      } catch {
        // ignore selection range errors
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 50);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#universal-explain-trigger') && !target.closest('#universal-explain-drawer')) {
        setSelection(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelection(null);
        setActiveQuery(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openExplainer = (query: string) => {
    setActiveQuery(query);
    if (selection) {
      setContextSnippet(selection.contextText);
    }
    setSelection(null);
  };

  // Resolve matching glossary term or topic with alias awareness
  const matchingGlossary: GlossaryTerm | undefined = activeQuery
    ? matchGlossaryTerm(activeQuery) || TERMS.find((g: GlossaryTerm) => g.term.toLowerCase() === activeQuery.toLowerCase())
    : undefined;

  const matchingTopic = activeQuery ? resolveTopic(activeQuery) : undefined;

  const topicLens = matchingTopic ? TOPIC_COGNITIVE_LENS[matchingTopic.id] : undefined;

  return (
    <>
      {/* 1. Floating Trigger Button near selection */}
      <AnimatePresence>
        {selection && (
          <motion.div
            id="universal-explain-trigger"
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: `${selection.x}px`,
              top: `${selection.y}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
            }}
          >
            <button
              type="button"
              onClick={() => openExplainer(selection.text)}
              className="inline-flex items-center gap-1.5 rounded-full border border-plaquette/60 bg-ink-900/95 px-3 py-1.5 text-xs font-semibold text-plaquette shadow-glow-cyan backdrop-blur-md transition-transform hover:scale-105 hover:bg-ink-850"
            >
              <Sparkles className="h-3.5 w-3.5 text-plaquette animate-pulse" />
              Explain &ldquo;{selection.text.length > 20 ? selection.text.slice(0, 20) + '…' : selection.text}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Contextual Explainer Drawer / Modal */}
      <AnimatePresence>
        {activeQuery && (
          <div id="universal-explain-drawer" className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/60 backdrop-blur-sm">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex h-full w-full max-w-lg flex-col border-l border-ink-600 bg-ink-900 p-6 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-ink-700 pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-plaquette/40 bg-plaquette/10 p-1.5 text-plaquette">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">// CONTEXTUAL EXPLAINER</span>
                    <h2 className="font-display text-xl font-bold text-text-hi">&ldquo;{activeQuery}&rdquo;</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQuery(null)}
                  className="rounded-lg p-2 text-text-low hover:bg-ink-800 hover:text-text-hi"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="mt-6 flex-1 space-y-6">
                {/* Visual Explanation Diagram */}
                <div>
                  <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-plaquette">// SUPER VISUAL EXPLANATION</h3>
                  <ConceptSuperVisual term={activeQuery} />
                </div>

                {/* Direct Definition / Analysis */}
                {matchingGlossary ? (
                  <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-star">{matchingGlossary.category}</span>
                      {matchingGlossary.notation && (
                        <span className="rounded bg-ink-900 px-2 py-0.5 font-mono text-xs text-plaquette">
                          {matchingGlossary.notation}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-hi">{matchingGlossary.short}</p>
                    <p className="mt-2 text-xs leading-relaxed text-text-mid">{matchingGlossary.long}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-ink-700 bg-ink-800 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-low uppercase tracking-wider font-mono">
                      <span>Vocabulary Note</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-mid">
                      <span className="font-semibold text-text-hi">&ldquo;{activeQuery}&rdquo;</span> is not directly indexed in the Lattice Atlas core vocabulary. Explore our curated glossary to search related topological concepts.
                    </p>
                    <Link
                      to={`/glossary`}
                      onClick={() => setActiveQuery(null)}
                      className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-plaquette hover:underline"
                    >
                      Browse Atlas Glossary <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {/* Dual Mode Cognitive Lens Insight (Analogy vs Rigor) */}
                <div className="rounded-xl border border-plaquette/30 bg-ink-850 p-4">
                  <div className="flex items-center justify-between border-b border-ink-700 pb-2">
                    <span className="font-mono text-[11px] text-stabilizer">
                      {lensMode === 'intuition' ? '💡 INTUITION & ANALOGY LENS' : '🔬 PHYSICS RIGOR LENS'}
                    </span>
                    <span className="font-mono text-[10px] text-text-low">active mode</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-mid">
                    {lensMode === 'intuition'
                      ? (topicLens?.intuition.description || `Think of ${activeQuery} as a protective shield that checks for mistakes among neighboring qubits without looking directly inside the secret quantum value.`)
                      : (topicLens?.rigor.description || `Formally, ${activeQuery} operates in the stabilizer subspace V_C = {|ψ⟩ : S_i|ψ⟩ = +|ψ⟩}, preserving quantum code distance d.`)}
                  </p>
                </div>

                {/* Context Snippet where user clicked */}
                {contextSnippet && (
                  <div>
                    <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-text-low">// SOURCE PAGE CONTEXT</h3>
                    <blockquote className="rounded-lg border-l-2 border-ink-500 bg-ink-950 p-3 font-mono text-xs text-text-mid">
                      &ldquo;{contextSnippet}&rdquo;
                    </blockquote>
                  </div>
                )}

                {/* Quantum Stack Location */}
                <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">// QUANTUM SYSTEM STACK LOCATION</span>
                  <div className="mt-3 flex items-center justify-between gap-1 text-[11px] font-mono text-text-low">
                    <span className="rounded bg-ink-800 px-2 py-1 text-text-mid">Physical Qubits</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="rounded bg-plaquette/20 px-2 py-1 text-plaquette font-bold">Stabilizers</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="rounded bg-ink-800 px-2 py-1 text-text-mid">Decoder</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="rounded bg-ink-800 px-2 py-1 text-text-mid">Logical Qubit</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 flex flex-col gap-2 border-t border-ink-700 pt-4">
                {matchingTopic && (
                  <Link
                    to="/map"
                    onClick={() => setActiveQuery(null)}
                    className="btn-primary w-full justify-center text-xs"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Explore {shortName(matchingTopic)} in Knowledge Map
                  </Link>
                )}
                <Link
                  to="/lab"
                  onClick={() => setActiveQuery(null)}
                  className="btn-ghost w-full justify-center text-xs"
                >
                  <Cpu className="h-3.5 w-3.5" /> Test in Surface Code Lab
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

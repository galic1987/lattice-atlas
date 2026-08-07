import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  X,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { resolveTopic, shortName } from '@/data';
import { matchGlossaryTerm } from '@/data/glossary';
import { TOPIC_COGNITIVE_LENS } from '@/data/cognitive_lens';
import { useProgress } from '@/store/progress';

interface SelectionState {
  text: string;
  contextText: string;
  x: number;
  y: number;
}

const FOUNDATION_QUERIES = new Set([
  'amplitude',
  'amplitudes',
  'complex amplitude',
  'complex amplitudes',
  'probability amplitude',
  'probability amplitudes',
  'phase',
  'phases',
  'relative phase',
  'global phase',
  'interference',
  'vector',
  'vectors',
  'state vector',
  'state vectors',
  'basis',
  'basis vector',
  'basis vectors',
  'matrix',
  'matrices',
  'inner product',
  'inner products',
  'tensor product',
  'tensor products',
  'eigenvalue',
  'eigenvalues',
  'eigenstate',
  'eigenstates',
  'superposition',
  'superpositions',
  'measurement',
  'measurements',
  'born rule',
  'complex number',
  'complex numbers',
  'dirac notation',
  'bra ket notation',
  'ket',
  'kets',
  'entanglement',
  'qubit',
  'qubits',
]);

const normalizeQuery = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Small relationship diagrams for the concept families this site can explain. */
function ConceptSuperVisual({ term }: { term: string }) {
  const lower = term.toLowerCase();

  if (
    lower.includes('amplitude')
    || lower.includes('phase')
    || lower.includes('interference')
    || lower.includes('born')
    || lower.includes('superposition')
    || lower.includes('complex')
  ) {
    return (
      <div className="h-48 overflow-hidden rounded-xl border border-plaquette/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="Two complex amplitude arrows add tip to tail, then the squared length of their sum becomes a probability">
          <defs>
            <marker id="phasor-cyan" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#22D3EE" /></marker>
            <marker id="phasor-violet" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#8B5CF6" /></marker>
            <marker id="phasor-green" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#34D399" /></marker>
          </defs>
          <circle cx="92" cy="78" r="57" fill="none" stroke="#2A3A5F" />
          <line x1="35" y1="78" x2="149" y2="78" stroke="#2A3A5F" />
          <line x1="92" y1="21" x2="92" y2="135" stroke="#2A3A5F" />
          <line x1="92" y1="78" x2="130" y2="78" stroke="#22D3EE" strokeWidth="4" markerEnd="url(#phasor-cyan)" />
          <line x1="130" y1="78" x2="154" y2="48" stroke="#8B5CF6" strokeWidth="4" markerEnd="url(#phasor-violet)" />
          <line x1="92" y1="78" x2="154" y2="48" stroke="#34D399" strokeWidth="3" strokeDasharray="5 4" markerEnd="url(#phasor-green)" />
          <text x="174" y="52" fill="#34D399" fontSize="11" fontFamily="JetBrains Mono">a + b</text>
          <path d="M190 80h50" stroke="#64708E" markerEnd="url(#phasor-green)" />
          <text x="215" y="70" textAnchor="middle" fill="#64708E" fontSize="10" fontFamily="JetBrains Mono">square length</text>
          <rect x="202" y="95" width="52" height="38" rx="8" fill="#34D399" fillOpacity="0.15" stroke="#34D399" />
          <text x="228" y="118" textAnchor="middle" fill="#34D399" fontSize="12" fontFamily="JetBrains Mono">|a+b|²</text>
          <text x="92" y="151" textAnchor="middle" fill="#A9B4CC" fontSize="10" fontFamily="JetBrains Mono">add amplitudes first</text>
        </svg>
      </div>
    );
  }

  if (lower.includes('tensor') || lower.includes('entang')) {
    return (
      <div className="h-48 overflow-hidden rounded-xl border border-star/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="A two by two amplitude table; a crossed diagonal pattern cannot be made from one independent row recipe and one column recipe">
          <text x="74" y="18" textAnchor="middle" fill="#64708E" fontSize="10" fontFamily="JetBrains Mono">B=0</text>
          <text x="134" y="18" textAnchor="middle" fill="#64708E" fontSize="10" fontFamily="JetBrains Mono">B=1</text>
          <text x="25" y="57" fill="#64708E" fontSize="10" fontFamily="JetBrains Mono">A=0</text>
          <text x="25" y="117" fill="#64708E" fontSize="10" fontFamily="JetBrains Mono">A=1</text>
          {[[44, 27], [104, 27], [44, 87], [104, 87]].map(([x, y], index) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="54" height="54" rx="8" fill={index === 0 || index === 3 ? '#22D3EE' : '#111A2E'} fillOpacity={index === 0 || index === 3 ? 0.25 : 1} stroke={index === 0 || index === 3 ? '#22D3EE' : '#2A3A5F'} />
          ))}
          <text x="71" y="61" textAnchor="middle" fill="#22D3EE" fontSize="13" fontFamily="JetBrains Mono">1/√2</text>
          <text x="131" y="121" textAnchor="middle" fill="#22D3EE" fontSize="13" fontFamily="JetBrains Mono">1/√2</text>
          <path d="M178 82h36" stroke="#64708E" strokeWidth="2" />
          <text x="238" y="54" textAnchor="middle" fill="#FB7185" fontSize="10" fontFamily="JetBrains Mono">cannot factor</text>
          <text x="238" y="78" textAnchor="middle" fill="#EAF0FB" fontSize="13" fontFamily="JetBrains Mono">det ≠ 0</text>
          <text x="238" y="105" textAnchor="middle" fill="#8B5CF6" fontSize="11" fontFamily="JetBrains Mono">entangled</text>
        </svg>
      </div>
    );
  }

  if (
    lower.includes('vector')
    || lower.includes('basis')
    || lower.includes('inner product')
    || lower.includes('hilbert')
    || lower.includes('bra')
    || lower.includes('eigen')
    || lower.includes('unitary')
    || lower.includes('observable')
    || lower.includes('matrix')
  ) {
    return (
      <div className="h-48 overflow-hidden rounded-xl border border-star/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="A state vector is resolved into coordinates along two basis axes; an inner product measures one projection">
          <defs><marker id="vector-head" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#22D3EE" /></marker></defs>
          <line x1="48" y1="126" x2="235" y2="126" stroke="#3D5178" />
          <line x1="48" y1="126" x2="48" y2="20" stroke="#3D5178" />
          <text x="240" y="130" fill="#8B5CF6" fontSize="11" fontFamily="JetBrains Mono">|0⟩</text>
          <text x="35" y="19" fill="#8B5CF6" fontSize="11" fontFamily="JetBrains Mono">|1⟩</text>
          <line x1="48" y1="126" x2="190" y2="49" stroke="#22D3EE" strokeWidth="4" markerEnd="url(#vector-head)" />
          <line x1="190" y1="49" x2="190" y2="126" stroke="#34D399" strokeDasharray="4 4" />
          <line x1="48" y1="49" x2="190" y2="49" stroke="#8B5CF6" strokeDasharray="4 4" />
          <text x="202" y="47" fill="#22D3EE" fontSize="12" fontFamily="JetBrains Mono">|ψ⟩</text>
          <text x="121" y="144" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="JetBrains Mono">α = ⟨0|ψ⟩</text>
          <text x="35" y="83" textAnchor="end" fill="#8B5CF6" fontSize="10" fontFamily="JetBrains Mono">β</text>
        </svg>
      </div>
    );
  }

  if (lower.includes('torus') || lower.includes('topolog') || lower.includes('toric') || lower.includes('anyon')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-plaquette/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="A non-contractible loop wraps around a torus and cannot shrink to a point">
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
          <path d="M 50 80 Q 150 130 250 80" fill="none" stroke="#FB7185" strokeWidth="3" />
          <circle cx="150" cy="105" r="4" fill="#FB7185" />
          <text x="150" y="125" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px]">Non-contractible Logical Loop</text>
          <text x="150" y="45" textAnchor="middle" fill="#A9B4CC" className="font-mono text-[11px]">Torus Topology (Genus 1)</text>
        </svg>
      </div>
    );
  }

  if (lower.includes('stabilizer') || lower.includes('syndrome') || lower.includes('plaquette') || lower.includes('star') || lower.includes('error') || lower.includes('decoder') || lower.includes('code')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-syndrome/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="A physical error touches neighboring parity checks and produces a syndrome pattern">
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
          <circle cx="120" cy="55" r="8" fill="#FB7185" fillOpacity="0.8" />
          <text x="120" y="58" textAnchor="middle" fill="#FFFFFF" className="font-mono text-[9px] font-bold">!</text>
          <text x="150" y="152" textAnchor="middle" fill="#A9B4CC" className="font-mono text-[10px]">Syndrome Flash on Anti-Commutation</text>
        </svg>
      </div>
    );
  }

  if (lower.includes('qubit') || lower.includes('pauli') || lower.includes('gate') || lower.includes('state') || lower.includes('dirac')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-star/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="A one-qubit pure state is shown as an arrow on the Bloch sphere">
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

  return (
    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-ink-600 bg-ink-950 p-4">
      <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label={`${term} shown between its prerequisites and downstream applications`}>
        <rect x="90" y="52" width="120" height="56" rx="12" fill="#22D3EE" fillOpacity="0.12" stroke="#22D3EE" />
        <text x="150" y="77" textAnchor="middle" fill="#EAF0FB" fontSize="12" fontFamily="JetBrains Mono">{term.slice(0, 22)}</text>
        <text x="150" y="94" textAnchor="middle" fill="#64708E" fontSize="9" fontFamily="JetBrains Mono">selected concept</text>
        <path d="M20 80h58M222 80h58" stroke="#3D5178" strokeWidth="2" strokeDasharray="4 3" />
        <text x="48" y="69" textAnchor="middle" fill="#64708E" fontSize="9" fontFamily="JetBrains Mono">prerequisites</text>
        <text x="252" y="69" textAnchor="middle" fill="#64708E" fontSize="9" fontFamily="JetBrains Mono">applications</text>
      </svg>
    </div>
  );
}

export default function UniversalExplainer() {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [contextSnippet, setContextSnippet] = useState<string>('');
  const { lensMode } = useProgress();
  const reduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!activeQuery) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [activeQuery]);

  const openExplainer = (query: string) => {
    setActiveQuery(query);
    if (selection) {
      setContextSnippet(selection.contextText);
    }
    setSelection(null);
  };

  // Both resolvers are normalized exact matches; neither performs substring guessing.
  const matchingGlossary = activeQuery ? matchGlossaryTerm(activeQuery) : undefined;

  const matchingTopic = activeQuery ? resolveTopic(activeQuery) : undefined;

  const topicLens = matchingTopic ? TOPIC_COGNITIVE_LENS[matchingTopic.id] : undefined;
  const isFoundationConcept = Boolean(
    matchingTopic?.tier === 1 || (activeQuery && FOUNDATION_QUERIES.has(normalizeQuery(activeQuery))),
  );
  const visualTerm = matchingGlossary?.term ?? matchingTopic?.name;

  return (
    <>
      {/* 1. Floating Trigger Button near selection */}
      <AnimatePresence>
        {selection && (
          <motion.div
            id="universal-explain-trigger"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
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
              className={`inline-flex items-center gap-1.5 rounded-full border border-plaquette/60 bg-ink-900/95 px-3 py-1.5 text-xs font-semibold text-plaquette shadow-glow-cyan backdrop-blur-md hover:bg-ink-850 ${reduceMotion ? '' : 'transition-transform hover:scale-105'}`}
            >
              <Sparkles className={reduceMotion ? 'h-3.5 w-3.5 text-plaquette' : 'h-3.5 w-3.5 animate-pulse text-plaquette'} />
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
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="universal-explainer-title"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
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
                    <h2 id="universal-explainer-title" className="font-display text-xl font-bold text-text-hi">&ldquo;{activeQuery}&rdquo;</h2>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setActiveQuery(null)}
                  className="rounded-lg p-2 text-text-low hover:bg-ink-800 hover:text-text-hi"
                  aria-label="Close concept explanation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="mt-6 flex-1 space-y-6">
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
                ) : matchingTopic ? (
                  <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-star">
                      Atlas topic · tier {matchingTopic.tier}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-text-hi">
                      {matchingTopic.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-hi">{matchingTopic.short}</p>
                    <p className="mt-2 text-xs leading-relaxed text-text-mid">{matchingTopic.detail}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-ink-700 bg-ink-800 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-low uppercase tracking-wider font-mono">
                      <span>Not indexed in Atlas</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-mid">
                      Lattice Atlas does not currently have a glossary definition or exact topic match for{' '}
                      <span className="font-semibold text-text-hi">&ldquo;{activeQuery}&rdquo;</span>. No generic quantum-error-correction explanation has been substituted.
                    </p>
                    <Link
                      to={isFoundationConcept ? '/foundations' : '/glossary'}
                      onClick={() => setActiveQuery(null)}
                      className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-plaquette hover:underline"
                    >
                      {isFoundationConcept ? 'Open the foundation workbench' : 'Search the Atlas glossary'}{' '}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {visualTerm && (
                  <div>
                    <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-plaquette">
                      // VISUAL RELATIONSHIP
                    </h3>
                    <ConceptSuperVisual term={visualTerm} />
                  </div>
                )}

                {topicLens && (
                  <div className="rounded-xl border border-plaquette/30 bg-ink-850 p-4">
                    <div className="flex items-center justify-between border-b border-ink-700 pb-2">
                      <span className="font-mono text-[11px] text-stabilizer">
                        {lensMode === 'intuition' ? '💡 INTUITION & ANALOGY LENS' : '🔬 PHYSICS RIGOR LENS'}
                      </span>
                      <span className="font-mono text-[10px] text-text-low">curated topic lens</span>
                    </div>
                    {lensMode === 'intuition' ? (
                      <>
                        <h3 className="mt-3 font-display text-base font-semibold text-text-hi">
                          {topicLens.intuition.analogyTitle}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-mid">
                          {topicLens.intuition.description}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-stabilizer">
                          {topicLens.intuition.takeaway}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="mt-3 font-display text-base font-semibold text-text-hi">
                          {topicLens.rigor.formalismTitle}
                        </h3>
                        <p className="mt-2 overflow-x-auto rounded bg-ink-950 px-2 py-1.5 font-mono text-xs text-plaquette">
                          {topicLens.rigor.mathExpression}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-text-mid">
                          {topicLens.rigor.description}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Context Snippet where user clicked */}
                {contextSnippet && (
                  <div>
                    <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-text-low">// SOURCE PAGE CONTEXT</h3>
                    <blockquote className="rounded-lg border-l-2 border-ink-500 bg-ink-950 p-3 font-mono text-xs text-text-mid">
                      &ldquo;{contextSnippet}&rdquo;
                    </blockquote>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              {(matchingTopic || matchingGlossary) && (
                <div className="mt-6 flex flex-col gap-2 border-t border-ink-700 pt-4">
                  {isFoundationConcept && (
                    <Link
                      to="/foundations"
                      onClick={() => setActiveQuery(null)}
                      className="btn-primary w-full justify-center text-xs"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Open the foundation workbench
                    </Link>
                  )}
                  {matchingTopic && (
                    <Link
                      to={`/map?topic=${matchingTopic.id}`}
                      onClick={() => setActiveQuery(null)}
                      className={`${isFoundationConcept ? 'btn-secondary' : 'btn-primary'} w-full justify-center text-xs`}
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Explore {shortName(matchingTopic)} in Knowledge Map
                    </Link>
                  )}
                  {matchingGlossary && !matchingTopic && (
                    <Link
                      to={`/glossary#${matchingGlossary.slug}`}
                      onClick={() => setActiveQuery(null)}
                      className={`${isFoundationConcept ? 'btn-secondary' : 'btn-primary'} w-full justify-center text-xs`}
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Open the glossary entry
                    </Link>
                  )}
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

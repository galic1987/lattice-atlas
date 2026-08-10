import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  X,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { resolveTopic, shortName, topicById } from '@/data';
import GlossaryText from '@/components/GlossaryText';
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
    || lower.includes('probability')
    || lower.includes('normaliz')
    || lower.includes('measurement')
    || lower.includes('projector')
  ) {
    return (
      <div className="h-48 overflow-hidden rounded-xl border border-plaquette/30 bg-ink-950 p-4">
        <svg
          viewBox="0 0 300 160"
          className="h-full w-full"
          role="img"
          aria-label="For the normalized state alpha ket zero plus beta ket one, the Born rule gives outcome probabilities magnitude alpha squared and magnitude beta squared, which sum to one"
        >
          <rect x="14" y="27" width="130" height="82" rx="10" fill="#111A2E" stroke="#3D5178" />
          <text x="79" y="52" textAnchor="middle" fill="#EAF0FB" fontSize="12" fontFamily="JetBrains Mono">|ψ⟩ = α|0⟩ + β|1⟩</text>
          <text x="79" y="78" textAnchor="middle" fill="#34D399" fontSize="11" fontFamily="JetBrains Mono">|α|² + |β|² = 1</text>
          <text x="79" y="98" textAnchor="middle" fill="#8491AD" fontSize="9" fontFamily="JetBrains Mono">normalized state</text>
          <path d="M151 68h28" stroke="#8491AD" strokeWidth="2" />
          <path d="M177 64l7 4-7 4" fill="none" stroke="#8491AD" strokeWidth="2" />
          <text x="166" y="56" textAnchor="middle" fill="#8491AD" fontSize="9" fontFamily="JetBrains Mono">measure</text>
          <rect x="190" y="21" width="96" height="46" rx="9" fill="#22D3EE" fillOpacity="0.12" stroke="#22D3EE" />
          <text x="238" y="39" textAnchor="middle" fill="#A9B4CC" fontSize="9" fontFamily="JetBrains Mono">outcome 0</text>
          <text x="238" y="57" textAnchor="middle" fill="#22D3EE" fontSize="12" fontFamily="JetBrains Mono">P(0) = |α|²</text>
          <rect x="190" y="75" width="96" height="46" rx="9" fill="#9B7BFA" fillOpacity="0.12" stroke="#9B7BFA" />
          <text x="238" y="93" textAnchor="middle" fill="#A9B4CC" fontSize="9" fontFamily="JetBrains Mono">outcome 1</text>
          <text x="238" y="111" textAnchor="middle" fill="#9B7BFA" fontSize="12" fontFamily="JetBrains Mono">P(1) = |β|²</text>
          <text x="150" y="146" textAnchor="middle" fill="#A9B4CC" fontSize="9" fontFamily="JetBrains Mono">relative phase changes later interference</text>
        </svg>
      </div>
    );
  }

  if (lower.includes('tensor') || lower.includes('entang')) {
    return (
      <div className="h-48 overflow-hidden rounded-xl border border-star/30 bg-ink-950 p-4">
        <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label="A two by two amplitude table; a crossed diagonal pattern cannot be made from one independent row recipe and one column recipe">
          <text x="74" y="18" textAnchor="middle" fill="#8491AD" fontSize="10" fontFamily="JetBrains Mono">B=0</text>
          <text x="134" y="18" textAnchor="middle" fill="#8491AD" fontSize="10" fontFamily="JetBrains Mono">B=1</text>
          <text x="25" y="57" fill="#8491AD" fontSize="10" fontFamily="JetBrains Mono">A=0</text>
          <text x="25" y="117" fill="#8491AD" fontSize="10" fontFamily="JetBrains Mono">A=1</text>
          {[[44, 27], [104, 27], [44, 87], [104, 87]].map(([x, y], index) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="54" height="54" rx="8" fill={index === 0 || index === 3 ? '#22D3EE' : '#111A2E'} fillOpacity={index === 0 || index === 3 ? 0.25 : 1} stroke={index === 0 || index === 3 ? '#22D3EE' : '#2A3A5F'} />
          ))}
          <text x="71" y="61" textAnchor="middle" fill="#22D3EE" fontSize="13" fontFamily="JetBrains Mono">1/√2</text>
          <text x="131" y="121" textAnchor="middle" fill="#22D3EE" fontSize="13" fontFamily="JetBrains Mono">1/√2</text>
          <path d="M178 82h36" stroke="#8491AD" strokeWidth="2" />
          <text x="238" y="54" textAnchor="middle" fill="#FB7185" fontSize="10" fontFamily="JetBrains Mono">cannot factor</text>
          <text x="238" y="78" textAnchor="middle" fill="#EAF0FB" fontSize="13" fontFamily="JetBrains Mono">det ≠ 0</text>
          <text x="238" y="105" textAnchor="middle" fill="#9B7BFA" fontSize="11" fontFamily="JetBrains Mono">entangled</text>
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
          <text x="240" y="130" fill="#9B7BFA" fontSize="11" fontFamily="JetBrains Mono">|0⟩</text>
          <text x="35" y="19" fill="#9B7BFA" fontSize="11" fontFamily="JetBrains Mono">|1⟩</text>
          <line x1="48" y1="126" x2="190" y2="49" stroke="#22D3EE" strokeWidth="4" markerEnd="url(#vector-head)" />
          <line x1="190" y1="49" x2="190" y2="126" stroke="#34D399" strokeDasharray="4 4" />
          <line x1="48" y1="49" x2="190" y2="49" stroke="#9B7BFA" strokeDasharray="4 4" />
          <text x="202" y="47" fill="#22D3EE" fontSize="12" fontFamily="JetBrains Mono">|ψ⟩</text>
          <text x="121" y="144" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="JetBrains Mono">α = ⟨0|ψ⟩</text>
          <text x="35" y="83" textAnchor="end" fill="#9B7BFA" fontSize="10" fontFamily="JetBrains Mono">β</text>
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
              <stop offset="100%" stopColor="#9B7BFA" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Translucent Torus Oval */}
          <ellipse cx="150" cy="80" rx="100" ry="45" fill="none" stroke="url(#torusGrad)" strokeWidth="3" strokeDasharray="6 3" />
          <ellipse cx="150" cy="80" rx="40" ry="18" fill="none" stroke="#22D3EE" strokeWidth="2" />
          {/* A logical loop is closed; its winding prevents contraction on the torus. */}
          <path d="M 50 80 Q 150 130 250 80 Q 150 30 50 80 Z" fill="none" stroke="#FB7185" strokeWidth="3" />
          <text x="150" y="139" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px]">Closed, non-contractible loop</text>
          <text x="150" y="45" textAnchor="middle" fill="#A9B4CC" className="font-mono text-[11px]">Torus Topology (Genus 1)</text>
        </svg>
      </div>
    );
  }

  if (lower.includes('stabilizer') || lower.includes('syndrome') || lower.includes('plaquette') || lower.includes('star') || lower.includes('error') || lower.includes('decoder') || lower.includes('code')) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-syndrome/30 bg-ink-950 p-4">
        <svg
          viewBox="0 0 300 160"
          className="h-full w-full"
          role="img"
          aria-label="An X error on one interior data qubit anticommutes with its two adjacent Z checks, flipping both check outcomes to minus one"
        >
          <rect x="31" y="42" width="84" height="72" rx="12" fill="#22D3EE" fillOpacity="0.14" stroke="#22D3EE" strokeWidth="2" />
          <rect x="185" y="42" width="84" height="72" rx="12" fill="#22D3EE" fillOpacity="0.14" stroke="#22D3EE" strokeWidth="2" />
          <text x="73" y="67" textAnchor="middle" fill="#22D3EE" fontSize="11" fontFamily="JetBrains Mono">Z check</text>
          <text x="227" y="67" textAnchor="middle" fill="#22D3EE" fontSize="11" fontFamily="JetBrains Mono">Z check</text>
          <circle cx="73" cy="91" r="12" fill="#FB7185" fillOpacity="0.22" stroke="#FB7185" />
          <circle cx="227" cy="91" r="12" fill="#FB7185" fillOpacity="0.22" stroke="#FB7185" />
          <text x="73" y="95" textAnchor="middle" fill="#FB7185" fontSize="11" fontFamily="JetBrains Mono">−1</text>
          <text x="227" y="95" textAnchor="middle" fill="#FB7185" fontSize="11" fontFamily="JetBrains Mono">−1</text>
          <path d="M115 78h23M162 78h23" stroke="#8491AD" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx="150" cy="78" r="18" fill="#FB7185" fillOpacity="0.18" stroke="#FB7185" strokeWidth="2" />
          <text x="150" y="83" textAnchor="middle" fill="#FB7185" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">X</text>
          <text x="150" y="122" textAnchor="middle" fill="#EAF0FB" fontSize="10" fontFamily="JetBrains Mono">center data-qubit error</text>
          <text x="150" y="145" textAnchor="middle" fill="#A9B4CC" fontSize="9" fontFamily="JetBrains Mono">X anticommutes with each adjacent Z check</text>
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
          <line x1="150" y1="20" x2="150" y2="140" stroke="#8491AD" strokeWidth="1.5" />
          {/* State Vector Arrow */}
          <line x1="150" y1="80" x2="185" y2="45" stroke="#9B7BFA" strokeWidth="3" />
          <circle cx="185" cy="45" r="4" fill="#9B7BFA" />
          {/* Kets */}
          <text x="150" y="15" textAnchor="middle" fill="#22D3EE" className="font-mono text-[11px]">|0⟩</text>
          <text x="150" y="155" textAnchor="middle" fill="#22D3EE" className="font-mono text-[11px]">|1⟩</text>
          <text x="210" y="45" textAnchor="start" fill="#9B7BFA" className="font-mono text-[10px]">|ψ⟩ = α|0⟩ + β|1⟩</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-ink-600 bg-ink-950 p-4">
      <svg viewBox="0 0 300 160" className="h-full w-full" role="img" aria-label={`${term} shown between its prerequisites and downstream applications`}>
        <rect x="90" y="52" width="120" height="56" rx="12" fill="#22D3EE" fillOpacity="0.12" stroke="#22D3EE" />
        <text x="150" y="77" textAnchor="middle" fill="#EAF0FB" fontSize="12" fontFamily="JetBrains Mono">{term.slice(0, 22)}</text>
        <text x="150" y="94" textAnchor="middle" fill="#8491AD" fontSize="9" fontFamily="JetBrains Mono">selected concept</text>
        <path d="M20 80h58M222 80h58" stroke="#3D5178" strokeWidth="2" strokeDasharray="4 3" />
        <text x="48" y="69" textAnchor="middle" fill="#8491AD" fontSize="9" fontFamily="JetBrains Mono">prerequisites</text>
        <text x="252" y="69" textAnchor="middle" fill="#8491AD" fontSize="9" fontFamily="JetBrains Mono">applications</text>
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
        // Do not offer a second explainer from text selected inside this drawer.
        if (parentEl?.closest('#universal-explain-drawer, #universal-explain-trigger')) return;
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
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!activeQuery) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
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
      document.body.style.overflow = previousBodyOverflow;
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
    matchingTopic?.tier === 1
      || matchingGlossary?.related_topics.some((topicId) => topicById.get(topicId)?.tier === 1)
      || (activeQuery && FOUNDATION_QUERIES.has(normalizeQuery(activeQuery))),
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
              aria-label={`Explain selected text: ${selection.text}`}
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
          <div
            id="universal-explain-drawer"
            className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/60 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActiveQuery(null);
            }}
          >
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="universal-explainer-title"
              aria-describedby="universal-explainer-description"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex h-full w-full max-w-lg flex-col border-l border-ink-600 bg-ink-900 p-6 shadow-2xl overflow-y-auto"
            >
              <p id="universal-explainer-description" className="sr-only">
                An Atlas definition, visual relationship, and curated links for the selected text when that text is indexed.
              </p>
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
                    <p className="mt-3 text-sm leading-relaxed text-text-hi"><GlossaryText text={matchingGlossary.short} /></p>
                    <p className="mt-2 text-xs leading-relaxed text-text-mid"><GlossaryText text={matchingGlossary.long} /></p>
                  </div>
                ) : matchingTopic ? (
                  <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-star">
                      Atlas topic · tier {matchingTopic.tier}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-text-hi">
                      {matchingTopic.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-hi"><GlossaryText text={matchingTopic.short} /></p>
                    <p className="mt-2 text-xs leading-relaxed text-text-mid"><GlossaryText text={matchingTopic.detail} /></p>
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
                  {matchingGlossary && (
                    <Link
                      to={`/glossary#${matchingGlossary.slug}`}
                      onClick={() => setActiveQuery(null)}
                      className={`${isFoundationConcept || matchingTopic ? 'btn-secondary' : 'btn-primary'} w-full justify-center text-xs`}
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

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { topics } from '@/data';
import { TERMS } from '@/data/glossary';
import { sound } from '@/lib/sound';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Route' | 'Topic' | 'Glossary' | 'Tool';
  url: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const COMMAND_ITEMS: CommandItem[] = [
    { id: 'c1', title: 'Foundations Lab (Waves to Qubits)', category: 'Route', url: '/foundations' },
    { id: 'c2', title: 'Surface Code Lab & 3D Braid Weaver', category: 'Route', url: '/lab' },
    { id: 'c3', title: 'Knowledge Map (Dependency Graph)', category: 'Route', url: '/map' },
    { id: 'c4', title: 'Decoder Duel (Daily Challenge)', category: 'Route', url: '/duel' },
    { id: 'c5', title: 'Multi-Age Cognitive Lens (5 Altitudes)', category: 'Route', url: '/altitudes' },
    { id: 'c6', title: 'Daily Spaced Review Deck', category: 'Route', url: '/review' },
    { id: 'c7', title: 'Seminal TQEC Research Papers', category: 'Route', url: '/papers' },
    { id: 'c8', title: 'TQEC Glossary & Terminology', category: 'Route', url: '/glossary' },
    { id: 'c9', title: 'Executable Stim Simulator Studio', category: 'Tool', url: '/lab?tab=executable-simulator' },
    { id: 'c10', title: 'Stim DEM Syndrome Graph Studio', category: 'Tool', url: '/lab?tab=stim-dem-graph' },
    { id: 'c11', title: 'Standard Quantum Code Zoo Studio (Steane, Shor, 5-Qubit)', category: 'Tool', url: '/lab?tab=standard-code-zoo' },
    { id: 'c12', title: 'Quantum LDPC Bivariate Bicycle Studio (IBM Gross 72, 144)', category: 'Tool', url: '/lab?tab=qldpc-tanner-graph' },
    { id: 'c13', title: 'Manim Mathematical Animation Gallery', category: 'Tool', url: '/lab?tab=manim-gallery' },
    { id: 'c14', title: 'Full-System FTQC Hardware Compiler (RSA-2048 & FeMoco)', category: 'Tool', url: '/lab?tab=ftqc-compiler' },
    { id: 'c15', title: 'Real-Time Stim Threshold Sandbox (P_L vs p Plot)', category: 'Tool', url: '/lab?tab=stim-threshold' },
    { id: 'c16', title: 'Interactive Visual Experiments Studio (Anyons, Color Codes, Duality)', category: 'Tool', url: '/lab?tab=visual-experiments' },
    { id: 'c17', title: 'Quantum Field Theory (QFT) & Google Veo 3 AI Studio', category: 'Tool', url: '/lab?tab=qft-visualizer' },
    { id: 'c18', title: 'TQEC Hardware Chip Benchmark Matrix (Willow, Heron, H2, Aquila)', category: 'Tool', url: '/lab?tab=chip-benchmarks' },
    { id: 'c19', title: 'Multi-Age & Multi-Perspective Cognitive Prism (5 Levels, 4 Angles)', category: 'Tool', url: '/lab?tab=cognitive-prism' },
    { id: 'c20', title: 'End-to-End Fault-Tolerant QEC Stage Architecture Walkthrough', category: 'Tool', url: '/lab?tab=pipeline-walkthrough' },
    { id: 'c21', title: '3D Spacetime Syndrome Decoder Sandbox (MWPM & Noise Injection)', category: 'Tool', url: '/lab?tab=spacetime-3d-decoder' },
    ...topics.map((t) => ({
      id: `topic-${t.id}`,
      title: `${t.name} (Tier ${t.tier})`,
      category: 'Topic' as const,
      url: `/map?topic=${t.id}`,
    })),
    ...TERMS.slice(0, 20).map((gt) => ({
      id: `term-${gt.term.toLowerCase().replace(/\s+/g, '-')}`,
      title: gt.term,
      category: 'Glossary' as const,
      url: `/glossary#${gt.term.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  ];

  const filteredItems = COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  const selectItem = (url: string) => {
    sound.playDecoderLock();
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  return (
    <>
      {/* Floating Keyboard Shortcut Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-plaquette/50 bg-ink-900/90 px-3.5 py-2 font-mono text-xs text-plaquette shadow-glow-cyan backdrop-blur-md transition-transform hover:scale-105"
        title="Open Command Palette (Cmd+K)"
      >
        <Command className="h-3.5 w-3.5" />
        <span className="hidden sm:inline font-bold">Quick Jump (Cmd+K)</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-ink-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3 border-b border-ink-700 p-4">
                <Search className="h-5 w-5 text-plaquette shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jump anywhere non-linearly (e.g. Surface Code, MWPM, Willow, Review)..."
                  className="flex-1 bg-transparent font-mono text-sm text-text-hi placeholder:text-text-low focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-text-low hover:text-text-hi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filtered Command List */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="p-6 text-center font-mono text-xs text-text-low">
                    No results found for "{query}". Try searching for "Surface Code", "Torus", or "Review".
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectItem(item.url)}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-plaquette/15 hover:border-plaquette/40 border border-transparent"
                    >
                      <span className="font-display text-sm font-semibold text-text-hi">{item.title}</span>
                      <span className="rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-plaquette">
                        {item.category}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

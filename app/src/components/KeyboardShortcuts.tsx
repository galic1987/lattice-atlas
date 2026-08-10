import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Command } from 'lucide-react';

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setIsOpen((v) => !v);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const shortcuts = [
    { key: '?', description: 'Toggle this cheat sheet' },
    { key: '⌘ + K', description: 'Open Concept Lookup (AI Tutor)' },
    { key: 'Esc', description: 'Close modals/drawers' },
    { key: 'Tab', description: 'Navigate focusable elements' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-ink-950/70 p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-ink-600 bg-ink-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink-700 bg-ink-850 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text-hi">
                <Command className="h-5 w-5 text-plaquette" />
                Keyboard Shortcuts
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-text-mid transition-colors hover:bg-ink-700 hover:text-text-hi"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {shortcuts.map((s) => (
                  <li key={s.key} className="flex items-center justify-between">
                    <span className="text-sm text-text-mid">{s.description}</span>
                    <kbd className="rounded border border-ink-600 bg-ink-800 px-2 py-1 font-mono text-xs text-text-hi shadow-sm">
                      {s.key}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

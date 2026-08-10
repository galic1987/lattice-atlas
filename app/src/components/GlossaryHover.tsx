import { useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { matchGlossaryTerm } from '@/data/glossary';

export default function GlossaryHover({ term, children }: { term: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLSpanElement>(null);
  
  const match = matchGlossaryTerm(term);

  if (!match) return <>{children}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      ref={triggerRef}
    >
      <span className="cursor-help underline decoration-star/40 decoration-dashed underline-offset-4 hover:decoration-star">
        {children}
      </span>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 z-[9999] mb-2 w-64 -translate-x-1/2 text-left pointer-events-none"
          >
            <div className="rounded-xl border border-ink-600 bg-ink-900 p-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase text-star">{match.category}</span>
                {match.notation && (
                  <span className="rounded bg-ink-950 px-1.5 py-0.5 font-mono text-[10px] text-plaquette">
                    {match.notation}
                  </span>
                )}
              </div>
              <p className="font-display text-sm font-semibold text-text-hi mb-1">{match.term}</p>
              <p className="text-xs leading-relaxed text-text-mid">{match.short}</p>
            </div>
            <div className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-ink-600 bg-ink-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

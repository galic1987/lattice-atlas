import { motion, useReducedMotion } from 'framer-motion';
import { Atom, Sparkles } from 'lucide-react';
import { useProgress, type LensMode } from '@/store/progress';

export default function CognitiveLensToggle({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { lensMode, setLensMode, explanationDepth } = useProgress();
  const reduceMotion = useReducedMotion();

  if (compact) {
    return (
      <div
        className={`inline-flex items-center rounded-full border border-ink-600 bg-ink-850 p-1 shadow-inner ${className}`}
        role="group"
        aria-label="Cognitive Lens Toggle"
      >
        <button
          type="button"
          onClick={() => setLensMode('intuition')}
          aria-pressed={lensMode === 'intuition'}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[12px] font-medium ${reduceMotion ? '' : 'transition-all duration-200'} ${
            lensMode === 'intuition'
              ? 'bg-plaquette/20 text-plaquette shadow-glow-cyan border border-plaquette/50'
              : 'text-text-low hover:text-text-mid'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intuition & Analogy</span>
        </button>
        <button
          type="button"
          onClick={() => setLensMode('rigor')}
          aria-pressed={lensMode === 'rigor'}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[12px] font-medium ${reduceMotion ? '' : 'transition-all duration-200'} ${
            lensMode === 'rigor'
              ? 'bg-magic/20 text-magic shadow-glow-violet border border-magic/50'
              : 'text-text-low hover:text-text-mid'
          }`}
        >
          <Atom className="h-3.5 w-3.5" />
          <span>Physics Rigor</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-ink-600 bg-gradient-to-b from-ink-800 to-ink-850 p-5 md:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-plaquette">
            // COGNITIVE LENS CONTROL
          </span>
          <h3 className="mt-1 font-display text-lg font-semibold text-text-hi">
            Choose Your Mindset
          </h3>
          <p className="mt-1 text-xs text-text-mid">
            This two-position shortcut moves the same five-level depth preference used across the Atlas.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-low">
            Current depth · <span className="text-text-hi">{explanationDepth}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-ink-600 bg-ink-900/60 p-1">
          {(['intuition', 'rigor'] as const).map((mode: LensMode) => {
            const active = lensMode === mode;
            const isIntuition = mode === 'intuition';
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setLensMode(mode)}
                aria-pressed={active}
                className={`relative flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                  active
                    ? isIntuition
                      ? 'text-ink-950 font-semibold shadow-md'
                      : 'text-ink-950 font-semibold shadow-md'
                    : 'text-text-mid hover:text-text-hi hover:bg-ink-800/50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="cognitive-lens-thumb"
                    className={`absolute inset-0 rounded-md ${
                      isIntuition
                        ? 'bg-gradient-to-r from-plaquette to-cyan-300'
                        : 'bg-gradient-to-r from-magic to-purple-300'
                    }`}
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isIntuition ? (
                    <Sparkles className={`h-4 w-4 ${active ? 'text-ink-950' : 'text-plaquette'}`} />
                  ) : (
                    <Atom className={`h-4 w-4 ${active ? 'text-ink-950' : 'text-magic'}`} />
                  )}
                  <span>{isIntuition ? 'Intuition & Analogy' : 'Physics Rigor'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode callout preview */}
      <motion.div
        key={lensMode}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        className={`mt-4 flex items-start gap-3 rounded-lg border p-3 text-xs leading-relaxed ${
          lensMode === 'intuition'
            ? 'border-plaquette/30 bg-plaquette/10 text-text-hi'
            : 'border-magic/30 bg-magic/10 text-text-hi'
        }`}
      >
        <span className="mt-0.5 shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-star">
          Active Mode:
        </span>
        {lensMode === 'intuition' ? (
          <span>
            <strong className="text-plaquette">Intuition & Analogy Mode active.</strong> Content highlights real-world physical metaphors like smoke detectors, donut topology, and balance scales.
          </span>
        ) : (
          <span>
            <strong className="text-magic">Physics Rigor Mode active.</strong> Content highlights formal state vectors |ψ⟩, Pauli commutation [X, Z], stabilizer generators S_i, and MWPM graph weights.
          </span>
        )}
      </motion.div>
    </div>
  );
}

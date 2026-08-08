import { motion } from 'framer-motion';
import { Atom, BookOpen, Compass, Lightbulb, Sparkles } from 'lucide-react';
import { ACT_NARRATIVES } from '@/data/cognitive_lens';
import { tierColors } from '@/data';
import { useProgress } from '@/store/progress';
import { asset } from '@/lib/asset';

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'ACT I',
  2: 'ACT II',
  3: 'ACT III',
  4: 'ACT IV',
  5: 'ACT V',
  6: 'ACT VI',
};

export default function ActChapterCard({ tier }: { tier: number }) {
  const { lensMode } = useProgress();
  const act = ACT_NARRATIVES[tier];
  if (!act) return null;

  const color = tierColors[tier] ?? '#22D3EE';
  const isIntuition = lensMode === 'intuition';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative ml-12 mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-ink-850 via-ink-900 to-ink-950 p-6 md:p-8 shadow-2xl"
      style={{ borderColor: `${color}66` }}
    >
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      {/* Visual Metaphor Header Artwork */}
      {tier === 2 && (
        <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl border border-plaquette/30">
          <img src={asset('act2_superposition_paradox.jpg')} alt="Act II Superposition Paradox Metaphor" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
        </div>
      )}

      {tier === 4 && (
        <div className="relative mb-6 h-40 w-full overflow-hidden rounded-xl border border-star/30">
          <img src={asset('act4_anyon_braiding.jpg')} alt="Act IV Anyon Braiding Metaphor" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
        </div>
      )}

      {/* Act Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700/80 pb-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-md px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.25em] shadow-sm"
            style={{
              backgroundColor: `${color}22`,
              color,
              border: `1px solid ${color}66`,
            }}
          >
            {ROMAN_NUMERALS[tier]}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-text-low">
            Prerequisite Chapter · Tier {tier}
          </span>
        </div>

        {/* Cognitive Lens Indicator */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-mono text-[11px] font-medium transition-colors ${
            isIntuition
              ? 'border-plaquette/40 bg-plaquette/10 text-plaquette'
              : 'border-magic/40 bg-magic/10 text-magic'
          }`}
        >
          {isIntuition ? <Sparkles className="h-3 w-3" /> : <Atom className="h-3" />}
          <span>{isIntuition ? 'Intuition Lens' : 'Rigor Lens'}</span>
        </div>
      </div>

      {/* Dramatic Act Title */}
      <div className="mt-5">
        <h2 className="font-display text-2xl font-bold leading-snug text-text-hi md:text-3xl">
          {act.actTitle}
        </h2>
        <p className="mt-2 text-sm font-medium italic leading-relaxed text-text-mid md:text-base">
          &ldquo;{act.actSubtitle}&rdquo;
        </p>
      </div>

      {/* Narrative Body */}
      <motion.div
        key={lensMode}
        initial={{ opacity: 0, x: isIntuition ? -12 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mt-5 rounded-xl border border-ink-700/60 bg-ink-950/70 p-5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-star">
          {isIntuition ? (
            <>
              <Lightbulb className="h-3.5 w-3.5 text-plaquette" />
              <span>Analogy Narrative</span>
            </>
          ) : (
            <>
              <Compass className="h-3.5 w-3.5 text-magic" />
              <span>Physics Rigor Narrative</span>
            </>
          )}
        </div>

        <p className="mt-2.5 text-sm leading-[1.75] text-text-hi md:text-[15px]">
          {isIntuition ? act.intuitionText : act.rigorText}
        </p>
      </motion.div>

      {/* Footer Chips */}
      <div className="mt-5 flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/80 px-3 py-1 text-text-mid">
          <BookOpen className="h-3.5 w-3.5 text-text-low" />
          <span className="text-text-low">Focus:</span>
          <span className="text-text-hi font-medium">{act.keyFocus}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/80 px-3 py-1 text-text-mid">
          <span className="text-text-low">{isIntuition ? 'Metaphor:' : 'Anchor:'}</span>
          <span className="text-plaquette font-medium">{act.metaphor}</span>
        </div>
      </div>
    </motion.div>
  );
}

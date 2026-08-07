import { motion } from 'framer-motion';
import { Atom, Lightbulb, Sparkles } from 'lucide-react';
import { TOPIC_COGNITIVE_LENS } from '@/data/cognitive_lens';
import { useProgress } from '@/store/progress';

export default function TopicLensInsight({ topicId }: { topicId: string }) {
  const { lensMode } = useProgress();
  const data = TOPIC_COGNITIVE_LENS[topicId];
  if (!data) return null;

  const isIntuition = lensMode === 'intuition';

  return (
    <motion.div
      key={lensMode}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`mt-4 rounded-xl border p-4 text-xs leading-relaxed transition-colors ${
        isIntuition
          ? 'border-plaquette/40 bg-plaquette/10 text-text-hi'
          : 'border-magic/40 bg-magic/10 text-text-hi'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ink-700/50 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider">
          {isIntuition ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-plaquette" />
              <span className="text-plaquette">Intuition & Analogy Lens</span>
            </>
          ) : (
            <>
              <Atom className="h-3.5 w-3.5 text-magic" />
              <span className="text-magic">Physics Rigor Lens</span>
            </>
          )}
        </div>
        <span className="font-mono text-[10px] uppercase text-text-low">
          {isIntuition ? 'Physical Metaphor' : 'Formalism'}
        </span>
      </div>

      <div className="mt-2.5">
        {isIntuition ? (
          <>
            <h4 className="flex items-center gap-1.5 font-display text-sm font-semibold text-text-hi">
              <Lightbulb className="h-3.5 w-3.5 text-plaquette shrink-0" />
              {data.intuition.analogyTitle}
            </h4>
            <p className="mt-1 text-text-mid leading-relaxed">{data.intuition.description}</p>
            <p className="mt-2 font-mono text-[11px] text-plaquette font-medium">
              💡 Takeaway: {data.intuition.takeaway}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-display text-sm font-semibold text-text-hi">
              {data.rigor.formalismTitle}
            </h4>
            <div className="mt-1.5 block max-w-full overflow-x-auto rounded bg-ink-950 px-2.5 py-1 font-mono text-[12px] text-magic border border-magic/30">
              {data.rigor.mathExpression}
            </div>
            <p className="mt-2 text-text-mid leading-relaxed">{data.rigor.description}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

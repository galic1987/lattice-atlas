import { motion } from 'framer-motion';
import { Atom, Lightbulb, Sparkles, X, Check } from 'lucide-react';
import { TOPIC_COGNITIVE_LENS } from '@/data/cognitive_lens';
import { useProgress } from '@/store/progress';
import insightsJson from '@/data/topic_insights.json';

interface TopicInsight {
  intuition?: string;
  misconceptions?: { myth: string; truth: string }[];
}

const INSIGHTS = insightsJson as Record<string, TopicInsight>;

export default function TopicLensInsight({ topicId }: { topicId: string }) {
  const { lensMode } = useProgress();
  const data = TOPIC_COGNITIVE_LENS[topicId];
  const insight = INSIGHTS[topicId];
  const isIntuition = lensMode === 'intuition';

  if (!data && !insight) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Vivid Mental Picture (if present) */}
      {insight?.intuition && (
        <div className="rounded-xl border border-plaquette/30 bg-plaquette/[0.06] p-4">
          <p className="eyebrow mb-2 !text-plaquette">{'// THE MENTAL PICTURE'}</p>
          <p className="leading-[1.7] text-text-hi text-xs">{insight.intuition}</p>
        </div>
      )}

      {/* Dynamic Cognitive Lens Card */}
      {data && (
        <motion.div
          key={lensMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`rounded-xl border p-4 text-xs leading-relaxed transition-colors ${
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
      )}

      {/* Common Traps & Misconceptions */}
      {insight?.misconceptions && insight.misconceptions.length > 0 && (
        <div>
          <p className="eyebrow mb-2.5">// COMMON TRAPS & MISCONCEPTIONS</p>
          <div className="flex flex-col gap-2.5">
            {insight.misconceptions.map((m, i) => (
              <div key={i} className="rounded-lg border border-ink-600 bg-ink-800 p-3.5">
                <p className="flex gap-2 text-xs leading-relaxed text-text-mid">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-syndrome" aria-hidden />
                  <span className="italic">&ldquo;{m.myth}&rdquo;</span>
                </p>
                <p className="mt-2 flex gap-2 border-t border-ink-700/60 pt-2 text-xs leading-relaxed text-text-mid">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stabilizer" aria-hidden />
                  <span>{m.truth}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

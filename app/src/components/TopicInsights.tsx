import { Check, X } from 'lucide-react';
import insightsJson from '@/data/topic_insights.json';

interface TopicInsight {
  intuition: string;
  misconceptions: { myth: string; truth: string }[];
}

const INSIGHTS = insightsJson as Record<string, TopicInsight>;

/**
 * The intuition layer: one vivid mental picture, shown before the precise
 * prose. Leads with "how to think about it" so the formal explanation has
 * something to attach to.
 */
export function Intuition({ topicId }: { topicId: string }) {
  const insight = INSIGHTS[topicId];
  if (!insight?.intuition) return null;
  return (
    <div className="rounded-lg border border-plaquette/30 bg-plaquette/[0.06] p-4">
      <p className="eyebrow mb-2 !text-plaquette">{'// THE PICTURE'}</p>
      <p className="leading-[1.7] text-text-hi">{insight.intuition}</p>
    </div>
  );
}

/**
 * Misconception cards: name the wrong idea explicitly, then correct it.
 * Meeting learners at the trap beats any forward-only explanation.
 */
export function Misconceptions({ topicId }: { topicId: string }) {
  const insight = INSIGHTS[topicId];
  if (!insight?.misconceptions?.length) return null;
  return (
    <div>
      <p className="eyebrow mb-3">{'// COMMON TRAP'}</p>
      <div className="flex flex-col gap-3">
        {insight.misconceptions.map((m, i) => (
          <div key={i} className="rounded-lg border border-ink-600 bg-ink-800 p-4">
            <p className="flex gap-2.5 text-sm leading-relaxed text-text-mid">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-syndrome" aria-hidden />
              <span className="italic">&ldquo;{m.myth}&rdquo;</span>
            </p>
            <p className="mt-2.5 flex gap-2.5 border-t border-ink-700 pt-2.5 text-sm leading-relaxed text-text-mid">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-stabilizer" aria-hidden />
              <span>{m.truth}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

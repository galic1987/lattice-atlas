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
 *
 * (Misconception cards now render inside TopicLensInsight; this file keeps
 * only the intuition card the drawers still use.)
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

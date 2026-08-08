import { useEffect, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import selfChecksJson from '@/data/self_checks.json';
import { useProgress } from '@/store/progress';

interface CheckQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

const SELF_CHECKS = selfChecksJson as Record<string, CheckQuestion[]>;

/**
 * Retrieval-practice questions for a topic (shown in the topic drawers).
 * A perfect attempt is stored as local check evidence. It is still a small,
 * open-book check rather than proof of retained or applied mastery.
 */
export default function SelfCheck({ topicId }: { topicId: string }) {
  const questions = SELF_CHECKS[topicId] ?? [];
  const [picks, setPicks] = useState<Record<number, number>>({});
  const { recordTopicCheck, topicCheck } = useProgress();

  const answered = Object.keys(picks).length;
  const correct = questions.filter((qq, i) => picks[i] === qq.answer).length;
  const complete = questions.length > 0 && answered === questions.length;
  const saved = topicCheck(topicId);

  useEffect(() => {
    if (complete) recordTopicCheck(topicId, correct, questions.length);
  }, [complete, correct, questions.length, recordTopicCheck, topicId]);

  if (questions.length === 0) return null;

  const retryMissed = () => {
    setPicks((current) => Object.fromEntries(
      Object.entries(current).filter(([index, pick]) => questions[Number(index)]?.answer === pick),
    ));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">{'// CHECK YOURSELF'}</p>
        {saved?.correct === saved?.total && (
          <span className="font-mono text-[11px] text-stabilizer">checked locally ✓</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {questions.map((qq, qi) => {
          const pick = picks[qi];
          const decided = pick !== undefined;
          return (
            <div key={qi} className="rounded-lg border border-ink-600 bg-ink-800 p-4">
              <p className="text-sm font-medium leading-relaxed text-text-hi">{qq.q}</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {qq.options.map((opt, oi) => {
                  const isAnswer = oi === qq.answer;
                  const isPick = pick === oi;
                  let cls = 'border-ink-600 text-text-mid hover:border-plaquette/50 hover:text-text-hi';
                  if (decided && isAnswer)
                    cls = 'border-stabilizer/60 bg-stabilizer/10 text-stabilizer';
                  else if (decided && isPick)
                    cls = 'border-syndrome/60 bg-syndrome/10 text-syndrome';
                  else if (decided) cls = 'border-ink-700 text-text-low';
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={decided}
                      aria-pressed={isPick}
                      onClick={() => setPicks((p) => ({ ...p, [qi]: oi }))}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-[13px] leading-snug transition-colors duration-150 disabled:cursor-default ${cls}`}
                    >
                      {decided && isAnswer && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                      {decided && isPick && !isAnswer && (
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {decided && (
                <p className="mt-3 border-t border-ink-700 pt-3 text-[13px] leading-relaxed text-text-mid">
                  {qq.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {complete && (
        <div className="mt-3" role="status" aria-live="polite">
          <p
            className={`font-mono text-[12px] ${
              correct === questions.length ? 'text-stabilizer' : 'text-text-mid'
            }`}
          >
            {correct}/{questions.length} correct
            {correct === questions.length
              ? ' — recorded as a checked topic on this device.'
              : ' — revisit the explanation, then retry the missed item.'}
          </p>
          {correct < questions.length && (
            <button type="button" onClick={retryMissed} className="btn-ghost mt-2 text-[12px]">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry missed
            </button>
          )}
          <p className="mt-2 text-xs leading-5 text-text-low">
            This is an open-book knowledge check, not evidence of delayed retention or real-world application.
          </p>
        </div>
      )}
    </div>
  );
}

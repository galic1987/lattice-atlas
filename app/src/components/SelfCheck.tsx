import { useState } from 'react';
import { Check, X } from 'lucide-react';
import selfChecksJson from '@/data/self_checks.json';

interface CheckQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

const SELF_CHECKS = selfChecksJson as Record<string, CheckQuestion[]>;

/**
 * Retrieval-practice questions for a topic (shown in the topic drawers).
 * Not a gate — a "prove it to yourself" moment before marking understood.
 */
export default function SelfCheck({ topicId }: { topicId: string }) {
  const questions = SELF_CHECKS[topicId];
  const [picks, setPicks] = useState<Record<number, number>>({});

  if (!questions || questions.length === 0) return null;
  const answered = Object.keys(picks).length;
  const correct = questions.filter((qq, i) => picks[i] === qq.answer).length;

  return (
    <div>
      <p className="eyebrow mb-3">{'// CHECK YOURSELF'}</p>
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
      {answered === questions.length && (
        <p
          className={`mt-3 font-mono text-[12px] ${
            correct === questions.length ? 'text-stabilizer' : 'text-text-mid'
          }`}
        >
          {correct}/{questions.length} correct
          {correct === questions.length
            ? ' — mark it understood with confidence.'
            : ' — worth re-reading the explanation above before marking understood.'}
        </p>
      )}
    </div>
  );
}

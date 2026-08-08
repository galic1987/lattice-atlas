import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass, X } from 'lucide-react';
import { tierNames, type Topic } from '@/data';

/**
 * Placement diagnostic for the learning path: one question per tier, in
 * order. The recommended starting tier is the first one answered wrongly
 * (or skipped). Six samples can suggest a starting point; they never alter
 * progress or certify mastery of whole tiers.
 */

interface DiagQuestion {
  tier: number;
  q: string;
  options: string[];
  answer: number;
}

const QUESTIONS: DiagQuestion[] = [
  {
    tier: 1,
    q: 'What is ⟨0|1⟩, the inner product of the two computational basis states?',
    options: ['1', '0', '1/√2', 'i'],
    answer: 1,
  },
  {
    tier: 2,
    q: 'Which relation holds for Pauli X and Z on the same qubit?',
    options: ['They commute: XZ = ZX', 'X is the inverse of Z', 'They anticommute: XZ = −ZX', 'XZ = identity'],
    answer: 2,
  },
  {
    tier: 3,
    q: 'A stabilizer S of a code state |ψ⟩ satisfies…',
    options: ['S|ψ⟩ = +|ψ⟩', 'S|ψ⟩ = 0', 'S|ψ⟩ = −|ψ⟩', 'S must be measured destructively'],
    answer: 0,
  },
  {
    tier: 4,
    q: 'How does the surface code detect errors?',
    options: [
      'By measuring every data qubit directly',
      'By cooling below the threshold temperature',
      'By measuring the logical operator each cycle',
      'By repeatedly measuring X- and Z-type stabilizers via ancilla qubits',
    ],
    answer: 3,
  },
  {
    tier: 5,
    q: 'In lattice surgery, merging two patches along a boundary implements…',
    options: [
      'a joint logical Z⊗Z (or X⊗X) measurement',
      'a SWAP of the two logical qubits',
      'a transversal T gate',
      'nothing — merging destroys both patches',
    ],
    answer: 0,
  },
  {
    tier: 6,
    q: '“Magic state cultivation” refers to…',
    options: [
      'a NISQ error-mitigation technique',
      'the layout of distillation factories',
      'growing a high-fidelity |T⟩ state directly inside the code at low overhead',
      'a decoder for correlated noise',
    ],
    answer: 2,
  },
];

export default function Diagnostic({ ordered }: { ordered: Topic[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<Record<number, number | 'skip'>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredAll = QUESTIONS.every((_, i) => picks[i] !== undefined);
  const firstMiss = QUESTIONS.find((qq, i) => picks[i] !== qq.answer)?.tier ?? null;
  const startTier = firstMiss ?? 6;

  const scrollToTier = () => {
    const target = ordered.find((t) => t.tier === startTier);
    if (!target) return;
    setOpen(false);
    document
      .getElementById(`step-${target.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const reset = () => {
    setPicks({});
    setSubmitted(false);
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="placement-quiz"
        className="inline-flex items-center gap-2 rounded-full border border-magic/40 bg-magic/[0.08] px-4 py-2 text-sm text-magic transition-colors duration-200 hover:border-magic hover:bg-magic/[0.14]"
      >
        <Compass className="h-4 w-4" />
        Not sure where to start? Take the 2-minute placement quiz
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="placement-quiz"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border border-ink-600 bg-ink-800 p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow !text-magic">{'// PLACEMENT'}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close placement quiz"
                  className="rounded-lg p-1 text-text-mid transition-colors hover:text-text-hi"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">
                One question per tier, in order. Answer honestly — &ldquo;not
                sure&rdquo; counts as a starting point, not a failure. This short
                sample recommends where to begin; it does not prove a tier is mastered.
              </p>

              <div className="mt-5 flex flex-col gap-4">
                {QUESTIONS.map((qq, qi) => (
                  <div key={qi}>
                    <p className="text-sm font-medium leading-relaxed text-text-hi">
                      <span className="mr-2 font-mono text-[11px] text-text-low">
                        T{qq.tier}
                      </span>
                      {qq.q}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {qq.options.map((opt, oi) => {
                        const picked = picks[qi] === oi;
                        const showResult = submitted;
                        const isAnswer = oi === qq.answer;
                        let cls = picked
                          ? 'border-plaquette/70 bg-plaquette/10 text-plaquette'
                          : 'border-ink-600 text-text-mid hover:border-plaquette/40 hover:text-text-hi';
                        if (showResult && picked && isAnswer)
                          cls = 'border-stabilizer/70 bg-stabilizer/10 text-stabilizer';
                        else if (showResult && picked && !isAnswer)
                          cls = 'border-syndrome/70 bg-syndrome/10 text-syndrome';
                        return (
                          <button
                            key={oi}
                            type="button"
                            disabled={submitted}
                            onClick={() => setPicks((p) => ({ ...p, [qi]: oi }))}
                            aria-pressed={picked}
                            className={`rounded-lg border px-3 py-1.5 text-left text-[13px] leading-snug transition-colors duration-150 disabled:cursor-default ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() => setPicks((p) => ({ ...p, [qi]: 'skip' }))}
                        aria-pressed={picks[qi] === 'skip'}
                        className={`rounded-lg border px-3 py-1.5 font-mono text-[12px] transition-colors duration-150 disabled:cursor-default ${
                          picks[qi] === 'skip'
                            ? 'border-magic/70 bg-magic/10 text-magic'
                            : 'border-ink-700 text-text-low hover:text-text-mid'
                        }`}
                      >
                        not sure
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!submitted ? (
                <button
                  type="button"
                  disabled={!answeredAll}
                  onClick={() => setSubmitted(true)}
                  className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Get my starting point <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="mt-6 rounded-lg border border-magic/40 bg-magic/[0.06] p-4" role="status" aria-live="polite">
                  <p className="font-mono text-[12px] font-semibold uppercase tracking-wider text-magic">
                    {firstMiss === null
                      ? 'No gap found in these six samples'
                      : `Suggested review point: Tier ${startTier} · ${tierNames[startTier]}`}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-mid">
                    {firstMiss === null
                      ? 'All six answers were correct. Start with Tier 6, but use each topic check and a delayed review before treating earlier material as retained.'
                      : `Begin near the first uncertain or incorrect sample. Earlier answers were correct samples, not certification of the full tiers.`}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-text-low">
                    {QUESTIONS.map((question, index) => `T${question.tier} ${picks[index] === question.answer ? '✓' : 'review'}`).join(' · ')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={scrollToTier} className="btn-primary px-4 py-2 text-[13px]">
                      Take me to Tier {startTier}
                    </button>
                    <button type="button" onClick={reset} className="btn-ghost text-[13px]">
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

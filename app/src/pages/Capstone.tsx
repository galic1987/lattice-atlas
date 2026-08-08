import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, RotateCcw, Share2, ShieldCheck } from 'lucide-react';
import { asset } from '@/lib/asset';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { SURFACE_CODE_CAPSTONE_ID } from '@/lib/learningRecord';
import { useProgress } from '@/store/progress';

const MIN_TEACHBACK = 40;

const QUESTIONS = [
  {
    prompt: 'Two neighboring Z checks change sign around the center data qubit. Which Pauli component is consistent with that pattern?',
    options: ['An X component on the center data qubit', 'A Z component on the center data qubit', 'No data error can do this'],
    answer: 0,
    why: 'An X component anticommutes with the adjacent Z checks, so both reported outcomes change sign in this declared ideal-check model.',
  },
  {
    prompt: 'Does this syndrome uniquely identify the physical fault that occurred?',
    options: ['Yes—the syndrome is a photograph of the fault', 'No—multiple faults or equivalent chains can share a syndrome', 'Yes, but only on distance 3'],
    answer: 1,
    why: 'A syndrome constrains explanations; it does not reveal one unique microscopic history. A decoder chooses a correction or logical class under a declared model.',
  },
  {
    prompt: 'What must a candidate correction establish in this browser exercise?',
    options: ['Only that it is visually short', 'That the residual syndrome clears and the chosen logical support is not flipped', 'That Willow hardware will succeed'],
    answer: 1,
    why: 'The shipped toy combines error and correction, checks the residual syndrome, then tests the selected logical support. That is model verification, not hardware certification.',
  },
  {
    prompt: 'Which evidence label belongs on the result?',
    options: ['Direct Willow hardware execution', 'A universal threshold proof', 'Local browser evidence for one explicit idealized model'],
    answer: 2,
    why: 'The page can establish the behavior of its declared ideal-check model. It cannot establish omitted circuit faults, decoder latency, or device performance.',
  },
] as const;

export default function Capstone() {
  useDocumentTitle('Synthesis Capstone');
  const reduce = useReducedMotion();
  const { recordEvidence, evidenceFor } = useProgress();
  const [answers, setAnswers] = useState<Array<number | null>>(() => QUESTIONS.map(() => null));
  const [checked, setChecked] = useState(false);
  const [story, setStory] = useState('');
  const [formal, setFormal] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const recorded = useRef(false);

  const correct = useMemo(
    () => answers.filter((answer, index) => answer === QUESTIONS[index].answer).length,
    [answers],
  );
  const allAnswered = answers.every((answer) => answer !== null);
  const teachbackComplete = story.trim().length >= MIN_TEACHBACK && formal.trim().length >= MIN_TEACHBACK;
  const complete = checked && teachbackComplete;
  const passed = correct >= 3 && teachbackComplete;
  const previous = evidenceFor('capstone').find((event) => event.capstoneId === SURFACE_CODE_CAPSTONE_ID);

  useEffect(() => {
    if (!complete || recorded.current) return;
    recorded.current = true;
    recordEvidence({
      kind: 'capstone',
      capstoneId: SURFACE_CODE_CAPSTONE_ID,
      correct,
      total: QUESTIONS.length,
      passed,
    });
  }, [complete, correct, passed, recordEvidence]);

  const reset = () => {
    recorded.current = false;
    setAnswers(QUESTIONS.map(() => null));
    setChecked(false);
    setStory('');
    setFormal('');
    setShareStatus('');
  };

  const share = async () => {
    const text = `Lattice Atlas synthesis capstone — ${correct}/${QUESTIONS.length} model checks · two-depth teach-back complete. Local unsigned evidence; not a credential.`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}capstone/`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Lattice Atlas synthesis capstone', text, url });
        setShareStatus('Share sheet opened.');
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareStatus('Capstone result copied.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('Sharing is unavailable in this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 text-text-hi">
      <header className="lattice-bg border-b border-ink-600">
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-20 md:px-8 md:pt-28">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.45 }}
            className="eyebrow"
          >
            // SYNTHESIS CAPSTONE
          </motion.p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-display-lg">
            Read the pattern. Repair the model. Name the boundary.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-mid">
            One compact transfer task joins the physical picture, stabilizer logic,
            correction test, two explanation depths, and an honest evidence label.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-12 md:px-8 md:py-16">
        <section className="grid min-w-0 gap-6 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="capstone-model-title">
          <figure className="min-w-0 overflow-hidden rounded-2xl border border-plaquette/35 bg-ink-950 p-4">
            <img
              src={asset('surface-code-diagram.svg')}
              alt="Exact distance-three rotated surface-code diagram with nine data qubits, eight checks, a center X error, and its two neighboring Z-check syndrome outcomes"
              className="h-auto w-full"
              width="720"
              height="520"
            />
            <figcaption className="mt-3 text-xs leading-5 text-text-low">
              Exact shipped d=3 layout. The rose center mark is a declared X component;
              the highlighted cyan checks are the two adjacent Z checks that anticommute with it.
            </figcaption>
          </figure>
          <div className="rounded-2xl border border-magic/35 bg-magic/[0.06] p-6">
            <p className="eyebrow !text-magic">// DECLARE THE MODEL FIRST</p>
            <h2 id="capstone-model-title" className="mt-3 font-display text-2xl font-semibold">
              Ideal single-round memory exercise
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-text-mid">
              <li><span className="text-magic">01.</span> Rotated distance-3 patch: 9 data qubits and 8 checks.</li>
              <li><span className="text-magic">02.</span> Perfect check outcomes; no measurement faults or time history.</li>
              <li><span className="text-magic">03.</span> One declared data-Pauli component at the center.</li>
              <li><span className="text-magic">04.</span> Correction is tested inside this model, not on hardware.</li>
            </ul>
            <p className="mt-5 rounded-lg border border-ink-600 bg-ink-950/70 p-3 text-xs leading-5 text-text-low">
              The diagram supplies evidence for the stated invariant. It does not prove a
              circuit-level threshold, real-time decoding, or Willow performance.
            </p>
          </div>
        </section>

        <section aria-labelledby="model-check-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">// PART 1 · MODEL CHECK</p>
              <h2 id="model-check-title" className="mt-2 font-display text-3xl font-semibold">Commit before feedback.</h2>
            </div>
            <span className="font-mono text-xs text-text-low">{answers.filter((answer) => answer !== null).length}/{QUESTIONS.length} answered</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {QUESTIONS.map((question, questionIndex) => (
              <fieldset key={question.prompt} className="min-w-0 rounded-xl border border-ink-600 bg-ink-850 p-5">
                <legend className="px-1 font-display text-lg font-semibold leading-6 text-text-hi">
                  {questionIndex + 1}. {question.prompt}
                </legend>
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[questionIndex] === optionIndex;
                    const isCorrect = question.answer === optionIndex;
                    const state = checked && selected ? (isCorrect ? 'correct' : 'wrong') : 'idle';
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={checked}
                        aria-pressed={selected}
                        onClick={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer))}
                        className={`w-full rounded-lg border px-3 py-3 text-left text-sm leading-5 transition-colors ${
                          state === 'correct'
                            ? 'border-stabilizer bg-stabilizer/10 text-stabilizer'
                            : state === 'wrong'
                              ? 'border-syndrome bg-syndrome/10 text-syndrome'
                              : selected
                                ? 'border-plaquette bg-plaquette/10 text-text-hi'
                                : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {checked && <p className="mt-4 border-t border-ink-700 pt-3 text-xs leading-5 text-text-mid">{question.why}</p>}
              </fieldset>
            ))}
          </div>
          {!checked ? (
            <button type="button" disabled={!allAnswered} onClick={() => setChecked(true)} className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-40">
              <Check className="h-4 w-4" aria-hidden="true" /> Check the declared model
            </button>
          ) : (
            <p className="mt-6 font-mono text-sm text-stabilizer" role="status">{correct}/{QUESTIONS.length} model checks matched.</p>
          )}
        </section>

        <section className="rounded-2xl border border-star/35 bg-star/[0.05] p-6 md:p-8" aria-labelledby="teachback-title">
          <p className="eyebrow !text-star">// PART 2 · TWO-ALTITUDE TEACH-BACK</p>
          <h2 id="teachback-title" className="mt-2 font-display text-3xl font-semibold">Explain one truth twice.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-text-mid">
            These responses are stored only as completion evidence; the browser does not grade their scientific quality.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-text-mid">
              <span className="font-mono text-xs uppercase tracking-wider text-magic">Story / Cause</span>
              <span className="mt-2 block text-xs leading-5 text-text-low">Explain what the two alarms mean without using equations. Name where the alarm metaphor stops working.</span>
              <textarea value={story} onChange={(event) => setStory(event.target.value)} rows={6} maxLength={900} className="mt-3 w-full resize-y rounded-lg border border-ink-600 bg-ink-950 p-3 leading-6 text-text-hi focus:border-star focus:outline-none" />
              <span className="mt-1 block font-mono text-[10px] text-text-low">{story.trim().length}/{MIN_TEACHBACK} minimum characters</span>
            </label>
            <label className="block text-sm text-text-mid">
              <span className="font-mono text-xs uppercase tracking-wider text-plaquette">Formal / Verify</span>
              <span className="mt-2 block text-xs leading-5 text-text-low">Use anticommutation, residual syndrome, logical support, and the model boundary.</span>
              <textarea value={formal} onChange={(event) => setFormal(event.target.value)} rows={6} maxLength={900} className="mt-3 w-full resize-y rounded-lg border border-ink-600 bg-ink-950 p-3 leading-6 text-text-hi focus:border-plaquette focus:outline-none" />
              <span className="mt-1 block font-mono text-[10px] text-text-low">{formal.trim().length}/{MIN_TEACHBACK} minimum characters</span>
            </label>
          </div>
        </section>

        <section className={`rounded-2xl border p-6 md:p-8 ${complete ? (passed ? 'border-stabilizer/45 bg-stabilizer/[0.06]' : 'border-magic/45 bg-magic/[0.06]') : 'border-ink-600 bg-ink-850'}`} aria-labelledby="capstone-result-title" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="eyebrow">// LOCAL EVIDENCE RECORD</p>
              <h2 id="capstone-result-title" className="mt-2 font-display text-3xl font-semibold">
                {complete ? (passed ? 'Transfer task complete.' : 'Teach-back saved; revisit the model checks.') : 'Finish both parts to record this attempt.'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-mid">
                {complete
                  ? `${correct}/${QUESTIONS.length} objective checks matched. Two teach-backs were completed but not independently graded.`
                  : 'The result enters the same versioned local record as Foundations, Review, and Duel.'}
              </p>
              {previous && <p className="mt-2 font-mono text-[11px] text-text-low">A previous local capstone attempt is already in this learning record.</p>}
            </div>
            <ShieldCheck className={`h-10 w-10 ${passed ? 'text-stabilizer' : 'text-text-low'}`} aria-hidden="true" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={share} disabled={!complete} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">
              <Share2 className="h-4 w-4" aria-hidden="true" /> Share local result
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try a fresh explanation
            </button>
            <Link to="/review" className="btn-ghost">Continue retrieval <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {shareStatus && <p className="mt-3 text-xs text-stabilizer" role="status">{shareStatus}</p>}
        </section>
      </div>
    </div>
  );
}

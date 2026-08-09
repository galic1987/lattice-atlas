import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Map as MapIcon } from 'lucide-react';
import { CATEGORY_COLORS, TERMS, type GlossaryTerm } from '@/data/glossary';
import { useProgress, type ReviewScheduleEntry } from '@/store/progress';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import SuperTLDR from '@/components/SuperTLDR';

/**
 * Spaced review of glossary terms. Learners produce a response before seeing
 * the reference, then self-rate the semantic match. Ratings are local evidence,
 * not an independently graded assessment.
 */

const DAILY_SESSION_LIMIT = 5;

const FOUNDATION_TERMS: Record<string, string[]> = {
  'bit-amplitude': ['amplitude', 'probability'],
  interference: ['superposition', 'phase'],
  'ket-born': ['born-rule', 'measurement'],
  phase: ['global-phase', 'complex-number'],
  'two-qubit': ['tensor-product', 'entanglement'],
};

const ALTITUDE_TERMS: Record<string, string[]> = {
  'error-correction': ['surface-code', 'syndrome'],
  superposition: ['superposition', 'phase'],
  topology: ['topological-order', 'toric-code'],
  decoding: ['decoder', 'mwpm-decoder'],
  'magic-states': ['magic-state', 'non-clifford-gate'],
};

type ReviewRecord = ReviewScheduleEntry;

const todayIso = () => new Date().toISOString().slice(0, 10);

const addDays = (days: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const TERM_BY_SLUG = new Map(TERMS.map((term) => [term.slug, term]));

export default function Review() {
  useDocumentTitle('Daily Review');
  const reduce = useReducedMotion();
  const {
    evidenceFor,
    isExplored,
    exploredCount,
    recordEvidence,
    reviewSchedule: records,
    setReviewScheduleEntry,
  } = useProgress();

  const earlyCourseSlugs = useMemo(() => {
    const slugs = new Set<string>();
    const latestFoundation = new Map(
      evidenceFor('foundation-prediction').map((event) => [event.stageId, event]),
    );
    for (const event of latestFoundation.values()) {
      for (const slug of FOUNDATION_TERMS[event.stageId] ?? []) slugs.add(slug);
    }
    for (const event of evidenceFor('altitude-study')) {
      for (const slug of ALTITUDE_TERMS[event.conceptId] ?? []) slugs.add(slug);
    }
    return slugs;
  }, [evidenceFor]);

  const unlocked = TERMS.filter(
    (term) => earlyCourseSlugs.has(term.slug) || term.related_topics.some((id) => isExplored(id)),
  );

  const dueSlugs = unlocked
    .filter((term) => {
      const record = records[term.slug];
      return !record || record.due <= todayIso();
    })
    .map((term) => term.slug);

  const [session] = useState(() => ({
    queue: dueSlugs.slice(0, DAILY_SESSION_LIMIT),
    dueCount: dueSlugs.length,
  }));
  const queue = session.queue;
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [response, setResponse] = useState('');
  const [graded, setGraded] = useState(0);
  const responseRef = useRef<HTMLTextAreaElement>(null);

  const currentSlug = queue[pos];
  const current: GlossaryTerm | undefined = currentSlug
    ? TERM_BY_SLUG.get(currentSlug)
    : undefined;
  const remaining = queue.length - pos;
  const deferred = Math.max(0, session.dueCount - queue.length);

  useEffect(() => {
    if (!revealed) responseRef.current?.focus();
  }, [pos, revealed]);

  const grade = (kind: 'again' | 'good' | 'easy') => {
    if (!current) return;
    const previous = records[current.slug];
    const prev = previous?.interval ?? 0;
    let rec: ReviewRecord;
    const attempts = (previous?.attempts ?? 0) + 1;
    const recalled = (previous?.recalled ?? 0) + (kind === 'easy' ? 1 : 0);
    if (kind === 'again') rec = { due: addDays(1), interval: 0, attempts, recalled };
    else if (kind === 'good') {
      const interval = Math.max(1, Math.round(prev * 2.5));
      rec = { due: addDays(interval), interval, attempts, recalled };
    } else {
      const interval = Math.max(4, prev * 4);
      rec = { due: addDays(interval), interval, attempts, recalled };
    }
    setReviewScheduleEntry(current.slug, rec);
    recordEvidence({
      kind: 'review-recall',
      termSlug: current.slug,
      rating: kind,
      responseProvided: response.trim().length >= 3,
      attempts: 1,
    });
    setGraded((g) => g + 1);
    setPos((p) => p + 1);
    setRevealed(false);
    setResponse('');
  };

  const scheduled = Object.keys(records).length;
  const nextDue = Object.values(records)
    .map((record) => record.due)
    .filter((due) => due > todayIso())
    .sort()[0];

  return (
    <div className="bg-ink-900">
      <header className="lattice-bg">
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 md:px-8">
          <SuperTLDR
            summary="Spaced repetition active recall deck to permanently solidify key QEC physics, algorithms, and engineering concepts."
            takeaways={[
              'SM-2 algorithmic scheduling surfaces cards based on your self-reported confidence.',
              'Covers threshold theorems, stabilizer generators, lattice surgery, and distillation factories.',
              'Maintains long-term retention of core fault-tolerance physics principles.',
            ]}
          />
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            {'// DAILY REVIEW'}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Keep it fresh.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-[17px] leading-[1.7] text-text-mid"
          >
            Retrieval strengthens access. Produce a definition before revealing
            the reference, compare meaning rather than wording, then rate the match.
            Terms enter this deck as you explore their topics.
          </motion.p>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-mid"
          >
            <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-plaquette">// TL;DR</span>
            A daily deck that asks you to recall terms and schedules the next review.
          </motion.p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[13px] text-text-low" role="status" aria-live="polite">
            <span>{unlocked.length} available</span>
            <span className={remaining > 0 ? 'text-magic' : 'text-stabilizer'}>
              {remaining} due now
            </span>
            <span>{scheduled} scheduled</span>
            <span>{queue.length}-card session · about 3 minutes</span>
            {deferred > 0 && <span>{deferred} deferred to another session</span>}
            {exploredCount === 0 && earlyCourseSlugs.size === 0 && <span>(finish a Foundation prediction or explore a topic to begin)</span>}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10 md:px-8">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={`${current.slug}-${pos}`}
              initial={reduce ? false : { opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-ink-600 bg-ink-800 p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 font-mono text-[12px] text-text-low">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[current.category] }}
                  />
                  {current.category}
                </p>
                <p className="font-mono text-[12px] text-text-low">
                  {pos + 1} / {queue.length}
                </p>
              </div>

              <h2 className="mt-6 font-display text-[36px] font-bold leading-tight text-text-hi">
                {current.term}
                {current.notation && <span className="mono-pill ml-3 align-middle text-base">{current.notation}</span>}
              </h2>

              {!revealed ? (
                <>
                  <label htmlFor="review-response" className="mt-5 block font-mono text-[12px] text-text-low">
                    Recall first: explain it in your own words
                  </label>
                  <textarea
                    ref={responseRef}
                    id="review-response"
                    value={response}
                    maxLength={500}
                    rows={3}
                    onChange={(event) => setResponse(event.target.value)}
                    placeholder="Type the mechanism, not just a keyword…"
                    className="mt-2 w-full resize-y rounded-lg border border-ink-600 bg-ink-900 p-3 text-sm leading-6 text-text-hi placeholder:text-text-low focus:border-plaquette/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={response.trim().length < 3}
                    onClick={() => setRevealed(true)}
                    className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Compare with reference
                  </button>
                </>
              ) : (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-ink-600 bg-ink-900/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">Your response</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-mid">{response}</p>
                    </div>
                    <div className="rounded-lg border border-plaquette/30 bg-plaquette/[0.06] p-4">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-plaquette">Reference meaning</p>
                      <p className="mt-2 text-sm leading-6 text-text-hi">{current.short}</p>
                    </div>
                  </div>
                  <Link
                    to={`/glossary#${current.slug}`}
                    className="link-slide mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] text-plaquette"
                  >
                    full entry <ArrowRight className="h-3 w-3" />
                  </Link>
                  <div className="mt-7 flex flex-wrap gap-2 border-t border-ink-700 pt-5">
                    <button
                      type="button"
                      onClick={() => grade('again')}
                      className="flex-1 rounded-lg border border-syndrome/50 px-4 py-2.5 text-sm font-semibold text-syndrome transition-colors hover:bg-syndrome/10"
                    >
                      Missed it
                      <span className="ml-2 font-mono text-[10px] font-normal opacity-70">1d</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => grade('good')}
                      className="flex-1 rounded-lg border border-plaquette/50 px-4 py-2.5 text-sm font-semibold text-plaquette transition-colors hover:bg-plaquette/10"
                    >
                      Close
                      <span className="ml-2 font-mono text-[10px] font-normal opacity-70">
                        {Math.max(1, Math.round((records[current.slug]?.interval ?? 0) * 2.5))}d
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => grade('easy')}
                      className="flex-1 rounded-lg border border-stabilizer/50 px-4 py-2.5 text-sm font-semibold text-stabilizer transition-colors hover:bg-stabilizer/10"
                    >
                      Recalled
                      <span className="ml-2 font-mono text-[10px] font-normal opacity-70">
                        {Math.max(4, (records[current.slug]?.interval ?? 0) * 4)}d
                      </span>
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-text-low">
                    These are honest self-ratings after comparison. “Recalled” records a local retrieval claim; it is not independently graded.
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-stabilizer/40 bg-ink-850 p-10 text-center"
            >
              <p className={`eyebrow ${graded > 0 ? '!text-stabilizer' : '!text-plaquette'}`}>
                {graded > 0 ? '// DONE FOR TODAY' : '// BUILD YOUR DAILY REVIEW DECK'}
              </p>
              <h2 className="mt-3 font-display text-[28px] font-semibold text-text-hi">
                {graded > 0
                  ? `${graded} card${graded === 1 ? '' : 's'} reviewed.`
                  : 'Your Review Deck is Empty'}
              </h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-text-mid">
                {graded > 0 ? (
                  deferred > 0
                    ? `${deferred} more card${deferred === 1 ? '' : 's'} remain due, but this session stops here to protect focus.`
                    : nextDue
                      ? `Next scheduled card: ${nextDue}. Exploring more topics adds more to your deck.`
                      : 'Cards return as their intervals expire. Exploring more topics adds more of the deck.'
                ) : (
                  'Cards automatically enter your daily spaced-repetition review deck as you explore topics in the Knowledge Map, complete experiments in Foundations Lab, or study Altitudes. Return here daily to strengthen your quantum memory!'
                )}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link to="/foundations" className="btn-primary">
                  Start Foundations Lab <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/map" className="btn-secondary">
                  <MapIcon className="h-4 w-4" /> Explore Knowledge Map
                </Link>
                <Link to="/glossary" className="btn-ghost">
                  <BookOpen className="h-4 w-4" /> Browse Glossary
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, Map as MapIcon, Route as RouteIcon } from 'lucide-react';
import { CATEGORY_COLORS, TERMS, type GlossaryTerm } from '@/data/glossary';
import { useProgress } from '@/store/progress';

/**
 * Spaced review of glossary terms. Cards unlock as their related topics
 * are marked understood; grading (again / good / easy) schedules the next
 * appearance with a simple expanding-interval rule, stored locally.
 */

const REVIEW_KEY = 'lattice-atlas-review';

interface ReviewRecord {
  due: string; // ISO date
  interval: number; // days
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

function loadRecords(): Record<string, ReviewRecord> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(REVIEW_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, ReviewRecord>)
      : {};
  } catch {
    return {};
  }
}

const TERM_BY_SLUG = new Map(TERMS.map((t) => [t.slug, t]));

export default function Review() {
  const { isUnderstood, understoodCount } = useProgress();
  const [records, setRecords] = useState<Record<string, ReviewRecord>>(loadRecords);

  // Terms whose backing topics the learner has studied; with zero progress,
  // the whole glossary is open so the deck is still usable.
  const reviewingEverything = understoodCount === 0;
  const unlocked = reviewingEverything
    ? TERMS
    : TERMS.filter((t) => t.related_topics.some((id) => isUnderstood(id)));

  const [queue, setQueue] = useState<string[]>(() => {
    const recs = loadRecords();
    const now = todayIso();
    return (understoodCount === 0
      ? TERMS
      : TERMS.filter((t) => t.related_topics.some((id) => isUnderstood(id)))
    )
      .filter((t) => {
        const r = recs[t.slug];
        return !r || r.due <= now;
      })
      .map((t) => t.slug);
  });
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState(0);

  const currentSlug = queue[pos];
  const current: GlossaryTerm | undefined = currentSlug
    ? TERM_BY_SLUG.get(currentSlug)
    : undefined;
  const remaining = queue.length - pos;

  const grade = (kind: 'again' | 'good' | 'easy') => {
    if (!current) return;
    const prev = records[current.slug]?.interval ?? 0;
    let rec: ReviewRecord;
    if (kind === 'again') rec = { due: todayIso(), interval: 0 };
    else if (kind === 'good') rec = { due: addDays(Math.max(1, Math.round(prev * 2.5))), interval: Math.max(1, Math.round(prev * 2.5)) };
    else rec = { due: addDays(Math.max(4, prev * 4)), interval: Math.max(4, prev * 4) };
    const next = { ...records, [current.slug]: rec };
    setRecords(next);
    try {
      localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    if (kind === 'again') setQueue((q) => [...q, current.slug]);
    setGraded((g) => g + 1);
    setPos((p) => p + 1);
    setRevealed(false);
  };

  const scheduled = Object.keys(records).length;

  return (
    <div className="bg-ink-900">
      <header className="lattice-bg">
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            {'// DAILY REVIEW'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Keep it fresh.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-[17px] leading-[1.7] text-text-mid"
          >
            Understanding decays; a few minutes of recall stops it. Terms enter
            this deck as you mark their topics understood, and each grade
            schedules the next appearance further out.
          </motion.p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[13px] text-text-low">
            <span>{unlocked.length} unlocked</span>
            <span className={remaining > 0 ? 'text-magic' : 'text-stabilizer'}>
              {remaining} due now
            </span>
            <span>{scheduled} scheduled</span>
            {reviewingEverything && <span>(no progress yet — reviewing everything)</span>}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10 md:px-8">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={`${current.slug}-${pos}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
                  <p className="mt-4 font-mono text-[13px] text-text-low">
                    Say the definition out loud — then check.
                  </p>
                  <button type="button" onClick={() => setRevealed(true)} className="btn-primary mt-6">
                    Show definition
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-5 text-[17px] leading-[1.7] text-text-mid">{current.short}</p>
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
                      Again
                      <span className="ml-2 font-mono text-[10px] font-normal opacity-70">today</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => grade('good')}
                      className="flex-1 rounded-lg border border-plaquette/50 px-4 py-2.5 text-sm font-semibold text-plaquette transition-colors hover:bg-plaquette/10"
                    >
                      Good
                      <span className="ml-2 font-mono text-[10px] font-normal opacity-70">
                        {Math.max(1, Math.round((records[current.slug]?.interval ?? 0) * 2.5))}d
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => grade('easy')}
                      className="flex-1 rounded-lg border border-stabilizer/50 px-4 py-2.5 text-sm font-semibold text-stabilizer transition-colors hover:bg-stabilizer/10"
                    >
                      Easy
                      <span className="ml-2 font-mono text-[10px] font-normal opacity-70">
                        {Math.max(4, (records[current.slug]?.interval ?? 0) * 4)}d
                      </span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-stabilizer/40 bg-ink-850 p-10 text-center"
            >
              <p className="eyebrow !text-stabilizer">{'// DONE FOR TODAY'}</p>
              <h2 className="mt-3 font-display text-[28px] font-semibold text-text-hi">
                {graded > 0
                  ? `${graded} card${graded === 1 ? '' : 's'} reviewed.`
                  : 'Nothing due right now.'}
              </h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-text-mid">
                {unlocked.length === 0
                  ? 'Mark topics as understood on the map or path and their vocabulary starts appearing here.'
                  : 'Cards return as their intervals expire. Learning more topics unlocks more of the deck.'}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link to="/path" className="btn-primary">
                  <RouteIcon className="h-4 w-4" /> Continue the path
                </Link>
                <Link to="/map" className="btn-secondary">
                  <MapIcon className="h-4 w-4" /> Open the map
                </Link>
                <Link to="/glossary" className="btn-ghost">
                  <BookOpen className="h-4 w-4" /> Browse the glossary
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

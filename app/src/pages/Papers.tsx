import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bookmark, Check, ChevronDown, ExternalLink, Search, X } from 'lucide-react';
import {
  eraNames,
  eraOrder as ERA_ORDER,
  eraColors as ERA_COLORS,
  eraYearRange,
  papers,
  tierColors,
  tierNames,
  tierEffort,
  topics,
  topicById as TOPIC_BY_ID,
  shortName as topicShortName,
  resolveTopic as resolvePrereq,
  paperPrereqIds,
  paperPrereqClosure,
  type Paper,
  type Topic,
} from '@/data';
import { useProgress } from '@/store/progress';
import DifficultyMeter from '@/components/DifficultyMeter';

/* ------------------------------------------------------------------ */
/* Era metadata (design.md §2 / papers.md §2)                          */
/* ------------------------------------------------------------------ */

const ERA_SUMMARIES: Record<string, string> = {
  foundations: 'The toric code meets boundaries — topological quantum memory is born.',
  'cluster-state schemes':
    'Fault-tolerant schemes built on measurement-based cluster-state constructions.',
  'defect-based surface code':
    'Holes, braiding and matching decoders turn the planar code into a computer.',
  'lattice surgery era':
    'Merging and splitting patches replaces braiding — the surface code gets practical.',
  'experimental era':
    'Real hardware crosses the threshold — quantum error correction leaves the blackboard.',
};

const FIRST_YEAR = Math.min(...papers.map((p) => p.year));
const LAST_YEAR = Math.max(...papers.map((p) => p.year));

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function PrereqChip({ name }: { name: string }) {
  const { isUnderstood } = useProgress();
  const topic = resolvePrereq(name);
  const understood = topic ? isUnderstood(topic.id) : false;
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  const classes =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] transition-colors duration-200';

  const body = (
    <>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: understood ? 'var(--stabilizer)' : 'var(--plaquette)' }}
      />
      {label}
      {understood && <Check className="h-3 w-3 text-stabilizer" aria-label="understood" />}
    </>
  );

  if (!topic) {
    return (
      <span className={`${classes} border-ink-600 bg-ink-800 text-text-mid`} title={label}>
        {body}
      </span>
    );
  }
  return (
    <Link
      to={`/map?topic=${topic.id}`}
      title={topic.short}
      className={`${classes} ${
        understood
          ? 'border-stabilizer/40 bg-stabilizer/10 text-stabilizer hover:border-stabilizer'
          : 'border-plaquette/35 bg-plaquette/[0.08] text-plaquette hover:border-plaquette hover:bg-plaquette/[0.14]'
      }`}
    >
      {body}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Paper card (design.md §7.8 + papers.md §3)                          */
/* ------------------------------------------------------------------ */

interface PaperCardProps {
  paper: Paper;
  firstOfYear: boolean;
  side: 'left' | 'right';
  highlighted: boolean;
  onPlan: (paper: Paper) => void;
}

function PaperCard({ paper, firstOfYear, side, highlighted, onPlan }: PaperCardProps) {
  const { isRead, toggleRead, isUnderstood } = useProgress();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [fullAuthors, setFullAuthors] = useState(false);

  const eraColor = ERA_COLORS[paper.era] ?? '#22D3EE';
  const read = isRead(paper.arxiv_id);

  const resolvedPrereqs = paper.prerequisites
    .map((name) => resolvePrereq(name))
    .filter((t): t is Topic => Boolean(t));
  const missingCount = resolvedPrereqs.filter((t) => !isUnderstood(t.id)).length;
  const ready = resolvedPrereqs.length > 0 && missingCount === 0;

  const authorList = paper.authors.split(',').map((a) => a.trim());
  const shownAuthors = fullAuthors
    ? paper.authors
    : authorList.slice(0, 3).join(', ') + (authorList.length > 3 ? ', et al.' : '');

  return (
    <div className="relative mb-8 pl-14 lg:mb-10 lg:grid lg:grid-cols-2 lg:gap-x-20 lg:pl-0">
      {/* spine node */}
      <span
        aria-hidden
        className="absolute left-6 top-8 z-10 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-ink-900 lg:left-1/2"
        style={{ backgroundColor: eraColor, boxShadow: `0 0 10px ${eraColor}66` }}
      />

      {/* year marker on the opposite side (desktop) / above card (mobile) */}
      {firstOfYear && (
        <div
          className={`mb-2 lg:mb-0 lg:flex lg:items-start lg:pt-5 ${
            side === 'left' ? 'lg:col-start-2 lg:pl-2' : 'lg:col-start-1 lg:row-start-1 lg:justify-end lg:pr-2'
          }`}
        >
          <span
            className="font-display text-[28px] font-bold leading-none tracking-tight"
            style={{ color: eraColor }}
          >
            {paper.year}
          </span>
        </div>
      )}

      <motion.article
        id={`paper-${paper.arxiv_id}`}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        animate={
          highlighted && !reduceMotion
            ? {
                boxShadow: [
                  '0 0 0 0px rgba(139,92,246,0)',
                  '0 0 0 3px rgba(139,92,246,0.65)',
                  '0 0 0 0px rgba(139,92,246,0)',
                  '0 0 0 3px rgba(139,92,246,0.65)',
                  '0 0 0 0px rgba(139,92,246,0)',
                ],
              }
            : undefined
        }
        style={{ '--era': eraColor, borderRadius: '12px' } as CSSProperties}
        className={`ripple-card rounded-xl border border-ink-600 bg-ink-800 p-5 transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-[var(--era)] hover:shadow-glow-violet md:p-6 ${
          side === 'left' ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-2'
        }`}
      >
        {/* readiness ribbon */}
        {resolvedPrereqs.length > 0 && (
          <span
            className={`absolute right-4 top-4 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              ready ? 'bg-stabilizer/10 text-stabilizer' : 'bg-magic/10 text-magic'
            }`}
          >
            {ready ? 'Ready to read' : `${missingCount} prerequisite${missingCount === 1 ? '' : 's'} left`}
          </span>
        )}

        {/* header row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pr-28">
          <span className="font-mono text-[13px] text-text-low">
            {firstOfYear ? '' : `${paper.year} · `}
            arXiv:{paper.arxiv_id}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-low">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: eraColor }} />
            {eraNames[paper.era] ?? paper.era}
          </span>
          <div className="ml-auto">
            <DifficultyMeter level={paper.difficulty} />
          </div>
        </div>

        <h3 className="mt-3 font-display text-[20px] font-semibold leading-snug text-text-hi md:text-[22px]">
          {paper.title}
        </h3>

        <p className="mt-1.5 text-sm text-text-low">
          {shownAuthors}
          {authorList.length > 3 && (
            <button
              type="button"
              onClick={() => setFullAuthors((v) => !v)}
              className="link-slide ml-2 font-mono text-xs text-plaquette"
            >
              {fullAuthors ? 'collapse' : `+${authorList.length - 3} more`}
            </button>
          )}
        </p>

        <p className="mt-3 leading-relaxed text-text-mid">
          <span className="mr-1.5 text-plaquette" aria-hidden>
            ▸
          </span>
          {paper.one_sentence}
        </p>

        {/* expandable breakdown */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="btn-ghost mt-4 font-mono text-[13px]"
        >
          {expanded ? 'Hide the breakdown' : 'Read the breakdown'}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-4 border-l-2 border-ink-600 pl-4">
                <div>
                  <p className="eyebrow mb-1.5" style={{ color: eraColor }}>
                    {'// CONTRIBUTION'}
                  </p>
                  <p className="text-[15px] leading-relaxed text-text-mid">{paper.contribution}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1.5" style={{ color: eraColor }}>
                    {'// WHY IT MATTERS'}
                  </p>
                  <p className="text-[15px] leading-relaxed text-text-mid">{paper.why_it_matters}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* prereqs */}
        {paper.prerequisites.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-low">
              Assumes:
            </p>
            <div className="flex flex-wrap gap-2">
              {paper.prerequisites.map((name) => (
                <PrereqChip key={name} name={name} />
              ))}
            </div>
          </div>
        )}

        {/* footer */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink-700 pt-4">
          <a
            href={`https://arxiv.org/abs/${paper.arxiv_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-4 py-2 font-mono text-[13px]"
          >
            arXiv:{paper.arxiv_id}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {resolvedPrereqs.length > 0 && (
            <button
              type="button"
              onClick={() => onPlan(paper)}
              className="btn-ghost font-mono text-[13px]"
            >
              {ready ? 'View prerequisites' : 'Plan my path'}
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleRead(paper.arxiv_id)}
            aria-pressed={read}
            className={`ml-auto inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              read
                ? 'border-star/50 bg-star/15 text-star'
                : 'border-ink-600 text-text-mid hover:border-star/50 hover:text-star'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${read ? 'fill-star' : ''}`} />
            {read ? 'Read' : 'Mark as read'}
          </button>
        </div>
      </motion.article>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Study-plan drawer — "what do I need before this paper?"             */
/* ------------------------------------------------------------------ */

function PlanDrawer({ paper, onClose }: { paper: Paper | null; onClose: () => void }) {
  const { isUnderstood, toggleUnderstood } = useProgress();

  useEffect(() => {
    if (!paper) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [paper, onClose]);

  const closure = useMemo(
    () => (paper ? paperPrereqClosure(paper.arxiv_id) : []),
    [paper],
  );
  const directIds = useMemo(
    () => new Set(paper ? (paperPrereqIds.get(paper.arxiv_id) ?? []) : []),
    [paper],
  );

  const doneCount = closure.filter((t) => isUnderstood(t.id)).length;
  const remaining = closure.length - doneCount;
  const tiers = [...new Set(closure.map((t) => t.tier))];

  return (
    <AnimatePresence>
      {paper && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label={`Study plan for ${paper.title}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-ink-600 bg-ink-850 sm:max-w-[480px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="border-b border-ink-600 p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow text-star">{'// STUDY PLAN'}</p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close study plan"
                  className="rounded-lg p-1.5 text-text-mid transition-colors hover:bg-ink-700 hover:text-text-hi"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h2 className="mt-3 font-display text-[20px] font-semibold leading-snug text-text-hi">
                {paper.title}
              </h2>
              <p className="mt-1.5 font-mono text-[12px] text-text-low">
                {paper.year} · arXiv:{paper.arxiv_id}
              </p>
              <div className="mt-4">
                <div className="flex items-baseline justify-between font-mono text-[12px]">
                  <span className={remaining === 0 ? 'text-stabilizer' : 'text-text-mid'}>
                    {remaining === 0
                      ? 'All prerequisites understood — ready to read'
                      : `${remaining} of ${closure.length} prerequisite topic${closure.length === 1 ? '' : 's'} to go`}
                  </span>
                  <span className="text-text-low">
                    {doneCount}/{closure.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full bg-stabilizer transition-[width] duration-300"
                    style={{ width: `${closure.length ? (doneCount / closure.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto p-6 [scrollbar-width:thin] [scrollbar-color:#2A3A5F_transparent]">
              {tiers.map((tier) => {
                const tierTopics = closure.filter((t) => t.tier === tier);
                const tierRemaining = tierTopics.filter((t) => !isUnderstood(t.id)).length;
                const color = tierColors[tier];
                return (
                  <div key={tier}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-display text-base font-semibold" style={{ color }}>
                        Tier {tier} · {tierNames[tier]}
                      </h3>
                      <span className="font-mono text-[11px] text-text-low">
                        {tierRemaining === 0 ? 'done ✓' : `${tierRemaining} left · ${tierEffort[tier]}`}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {tierTopics.map((topic) => {
                        const done = isUnderstood(topic.id);
                        return (
                          <li
                            key={topic.id}
                            className="flex items-center gap-3 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2.5"
                          >
                            <button
                              type="button"
                              aria-pressed={done}
                              aria-label={`Mark ${topicShortName(topic)} as understood`}
                              onClick={() => toggleUnderstood(topic.id)}
                              className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 ${
                                done
                                  ? 'border-stabilizer bg-stabilizer/20 text-stabilizer'
                                  : 'border-ink-500 text-text-low hover:border-stabilizer/60 hover:text-stabilizer'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={done ? 3 : 2} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm font-medium ${
                                  done ? 'text-text-low line-through decoration-ink-500' : 'text-text-hi'
                                }`}
                                title={topic.short}
                              >
                                {topicShortName(topic)}
                              </p>
                            </div>
                            {directIds.has(topic.id) && (
                              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-star/80">
                                direct
                              </span>
                            )}
                            <Link
                              to={`/map?topic=${topic.id}`}
                              className="shrink-0 font-mono text-[11px] text-plaquette transition-colors hover:text-text-hi"
                            >
                              learn →
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-ink-600 p-6">
              {remaining === 0 ? (
                <a
                  href={`https://arxiv.org/abs/${paper.arxiv_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                >
                  Ready — open the paper <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link to="/path" className="btn-secondary w-full">
                  Follow the full guided path <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline mini-map (papers.md §4)                                    */
/* ------------------------------------------------------------------ */

function MiniMap({ onJump }: { onJump: (arxivId: string) => void }) {
  const reduceMotion = useReducedMotion();
  const span = LAST_YEAR - FIRST_YEAR + 1;
  return (
    <div className="mx-auto max-w-7xl px-6 pb-6 md:px-8">
      <div className="relative h-14 rounded-full border border-ink-600 bg-ink-800">
        {papers.map((p, i) => {
          const left = 4 + ((p.year - FIRST_YEAR + 0.5) / span) * 92;
          const size = 6 + p.difficulty * 1.6;
          return (
            <motion.button
              key={p.arxiv_id}
              type="button"
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.3 + i * 0.03, type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => onJump(p.arxiv_id)}
              aria-label={`${p.title} (${p.year})`}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-150 hover:scale-125"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                backgroundColor: ERA_COLORS[p.era],
                boxShadow: `0 0 8px ${ERA_COLORS[p.era]}55`,
              }}
            >
              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border border-ink-600 bg-ink-850 p-2.5 text-left shadow-lg group-hover:block">
                <span className="block font-mono text-[11px] text-text-low">{p.year}</span>
                <span className="mt-0.5 block text-xs leading-snug text-text-hi">{p.title}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[11px] text-text-low">
        {FIRST_YEAR} → {LAST_YEAR} · dot color = era · dot size = difficulty · click to jump
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type DiffFilter = 'any' | 'low' | 'mid' | 'high';

const DIFF_OPTIONS: { value: DiffFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'low', label: '1–2' },
  { value: 'mid', label: '3' },
  { value: 'high', label: '4–5' },
];

export default function Papers() {
  const { readCount } = useProgress();
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialEra = searchParams.get('era');
  const [activeEras, setActiveEras] = useState<Set<string>>(() =>
    initialEra && (ERA_ORDER as readonly string[]).includes(initialEra)
      ? new Set([initialEra])
      : new Set(),
  );
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('any');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [planPaper, setPlanPaper] = useState<Paper | null>(null);

  const jumpToPaper = (arxivId: string) => {
    setHighlightId(arxivId);
    document
      .getElementById(`paper-${arxivId}`)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => setHighlightId((cur) => (cur === arxivId ? null : cur)), 2600);
  };

  // Deep link: #<arxiv_id> scrolls to and pulses the card.
  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!papers.some((p) => p.arxiv_id === id)) return;
    const t = window.setTimeout(() => jumpToPaper(id), 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const toggleEra = (era: string) => {
    setActiveEras((prev) => {
      const next = new Set(prev);
      if (next.has(era)) next.delete(era);
      else next.add(era);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return papers.filter((p) => {
      if (activeEras.size > 0 && !activeEras.has(p.era)) return false;
      if (diffFilter === 'low' && p.difficulty > 2) return false;
      if (diffFilter === 'mid' && p.difficulty !== 3) return false;
      if (diffFilter === 'high' && p.difficulty < 4) return false;
      if (topicId) {
        const match = p.prerequisites.some((name) => resolvePrereq(name)?.id === topicId);
        if (!match) return false;
      }
      if (q) {
        const haystack = `${p.title} ${p.authors} ${p.one_sentence} ${p.arxiv_id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeEras, diffFilter, topicId, search]);

  const grouped = useMemo(
    () =>
      ERA_ORDER.map((era) => ({ era, items: filtered.filter((p) => p.era === era) })).filter(
        (g) => g.items.length > 0,
      ),
    [filtered],
  );

  const hasFilters = activeEras.size > 0 || diffFilter !== 'any' || topicId !== null || search.trim() !== '';
  const clearAll = () => {
    setActiveEras(new Set());
    setDiffFilter('any');
    setTopicId(null);
    setSearch('');
  };

  const selectedTopic = topicId ? TOPIC_BY_ID.get(topicId) : undefined;
  const topicsByTier = useMemo(() => {
    const tiers = new Map<number, Topic[]>();
    for (const t of topics) {
      const list = tiers.get(t.tier) ?? [];
      list.push(t);
      tiers.set(t.tier, list);
    }
    return [...tiers.entries()].sort(([a], [b]) => a - b);
  }, []);

  const headlineWords = 'Twenty-three papers, one field.'.split(' ');

  return (
    <div className="bg-ink-900">
      {/* ---------------- Section 1: header ---------------- */}
      <header className="relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-[-4%] bg-[url('/era-strip.svg')] bg-cover bg-center opacity-[0.14]"
          animate={reduceMotion ? undefined : { x: ['-2%', '2%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <div aria-hidden className="lattice-bg absolute inset-0 opacity-40" />
        <div aria-hidden className="absolute inset-0 bg-ink-900/80" />

        <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-32 md:px-8">
          <p className="eyebrow text-star">{'// THE CANON'}</p>
          <h1 className="mt-4 font-display text-display-lg text-text-hi max-md:text-[36px]">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.1 + i * 0.02, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
                {i < headlineWords.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-text-mid"
          >
            These are the key results of topological quantum error correction, in chronological
            order. They run from the 1998 lattice code with boundaries to below-threshold quantum
            hardware. Each summary uses plain English, shows a difficulty rating, and links to the
            prerequisites it assumes.
          </motion.p>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] uppercase tracking-wider text-text-low"
          >
            <span>{papers.length} papers</span>
            <span>{ERA_ORDER.length} eras</span>
            <span>
              {FIRST_YEAR} → {LAST_YEAR}
            </span>
            <span className="text-star">{readCount} marked read</span>
          </motion.div>
        </div>
      </header>

      {/* ---------------- Section 4: mini-map ---------------- */}
      <MiniMap onJump={jumpToPaper} />

      {/* ---------------- Section 2: filter bar ---------------- */}
      <div className="sticky top-16 z-30 border-b border-ink-600 bg-ink-900/90 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 md:px-8">
          {/* era chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveEras(new Set())}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                activeEras.size === 0
                  ? 'border-plaquette bg-plaquette/10 text-plaquette'
                  : 'border-ink-600 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              All
            </button>
            {ERA_ORDER.map((era) => {
              const active = activeEras.has(era);
              const color = ERA_COLORS[era];
              return (
                <button
                  key={era}
                  type="button"
                  onClick={() => toggleEra(era)}
                  aria-pressed={active}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200"
                  style={
                    active
                      ? { borderColor: color, backgroundColor: `${color}1A`, color }
                      : { borderColor: 'var(--ink-600)', color: 'var(--text-mid)' }
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {eraNames[era]}
                </button>
              );
            })}
          </div>

          {/* difficulty segmented control */}
          <div className="flex overflow-hidden rounded-lg border border-ink-600">
            {DIFF_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDiffFilter(opt.value)}
                aria-pressed={diffFilter === opt.value}
                className={`px-3 py-1.5 font-mono text-[13px] transition-colors duration-200 ${
                  diffFilter === opt.value
                    ? 'bg-plaquette/10 text-plaquette'
                    : 'text-text-mid hover:bg-ink-800 hover:text-text-hi'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* topic filter */}
          <select
            value={topicId ?? ''}
            onChange={(e) => setTopicId(e.target.value || null)}
            aria-label="Filter by prerequisite topic"
            className="max-w-[220px] rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm text-text-mid transition-colors duration-200 hover:border-ink-500 focus:border-plaquette"
          >
            <option value="">Any prerequisite topic…</option>
            {topicsByTier.map(([tier, list]) => (
              <optgroup key={tier} label={`Tier ${tier} · ${tierNames[tier]}`}>
                {list.map((t) => (
                  <option key={t.id} value={t.id}>
                    {topicShortName(t)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {selectedTopic && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px]"
              style={{
                borderColor: `${tierColors[selectedTopic.tier]}59`,
                backgroundColor: `${tierColors[selectedTopic.tier]}24`,
                color: tierColors[selectedTopic.tier],
              }}
            >
              {topicShortName(selectedTopic)}
              <button
                type="button"
                onClick={() => setTopicId(null)}
                aria-label="Clear topic filter"
                className="rounded-full p-0.5 hover:bg-ink-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-low" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search papers…"
              className="w-48 rounded-lg border border-ink-600 bg-ink-800 py-1.5 pl-9 pr-3 font-mono text-[13px] text-text-hi placeholder:text-text-low transition-colors duration-200 focus:border-plaquette md:w-56"
            />
          </div>

          {/* result count + clear */}
          <div className="ml-auto flex items-center gap-4">
            <span key={filtered.length} className="font-mono text-[13px] uppercase tracking-wider text-text-low">
              Showing {filtered.length} of {papers.length}
            </span>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="btn-ghost text-[13px]">
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Section 3: timeline ---------------- */}
      <section className="relative mx-auto max-w-5xl px-6 py-16 md:px-8">
        {/* spine */}
        <div
          aria-hidden
          className="absolute bottom-16 left-6 top-16 w-[2px] -translate-x-1/2 lg:left-1/2"
          style={{
            background:
              'linear-gradient(180deg, #22D3EE 0%, #38BDF8 20%, #A78BFA 45%, #F5B83D 70%, #FB7185 100%)',
          }}
        />

        {grouped.length === 0 && (
          <div className="relative rounded-xl border border-ink-600 bg-ink-800 p-10 text-center">
            <p className="font-display text-xl text-text-hi">No papers match those filters.</p>
            <p className="mt-2 text-text-mid">Remove one or two filters. The full list of papers will still be here.</p>
            <button type="button" onClick={clearAll} className="btn-secondary mt-5">
              Clear all filters
            </button>
          </div>
        )}

        {grouped.map((group) => {
          const eraColor = ERA_COLORS[group.era];
          let lastYear: number | null = null;
          return (
            <div key={group.era} className="relative mb-14 last:mb-0">
              {/* era banner */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative mb-10 ml-14 rounded-lg border border-ink-600 bg-ink-850 p-5 lg:ml-0"
                style={{ borderLeftWidth: 4, borderLeftColor: eraColor }}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="font-display text-2xl font-semibold md:text-[26px]" style={{ color: eraColor }}>
                    {eraNames[group.era]}
                  </h2>
                  <span className="font-mono text-[13px] text-text-low">{eraYearRange(group.era)}</span>
                  <span className="ml-auto font-mono text-[13px] text-text-low">
                    {group.items.length} paper{group.items.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-mid">{ERA_SUMMARIES[group.era]}</p>
              </motion.div>

              {group.items.map((paper, i) => {
                const firstOfYear = paper.year !== lastYear;
                lastYear = paper.year;
                return (
                  <PaperCard
                    key={paper.arxiv_id}
                    paper={paper}
                    firstOfYear={firstOfYear}
                    side={i % 2 === 0 ? 'left' : 'right'}
                    highlighted={highlightId === paper.arxiv_id}
                    onPlan={setPlanPaper}
                  />
                );
              })}
            </div>
          );
        })}
      </section>

      {/* ---------------- Section 5: bottom CTA ---------------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-8">
        <img src="/braid-divider.svg" alt="" aria-hidden className="mx-auto mb-16 w-full max-w-3xl opacity-70" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-semibold text-text-hi">
            Don't have the background for a paper?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-text-mid">
            Every prerequisite chip on these cards links to the knowledge map. Learn the topic
            there. Mark it understood. The paper's readiness ribbon then updates.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/map" className="btn-primary">
              Open the knowledge map
            </Link>
            <Link to="/path" className="btn-ghost">
              See the guided path
            </Link>
          </div>
        </motion.div>
      </section>

      <PlanDrawer paper={planPaper} onClose={() => setPlanPaper(null)} />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  Library,
  Lock,
  Map as MapIcon,
  Repeat,
  RotateCcw,
  ScrollText,
  Telescope,
  X,
} from 'lucide-react';
import {
  topics,
  papers,
  tierNames,
  tierColors,
  eraNames,
  eraColors,
  topicById,
  shortName,
  papersByTopic,
  paperPrereqIds,
  parseResource,
  tierEffort,
  type Paper,
  type Topic,
} from '@/data';
import { useProgress } from '@/store/progress';
import CertificatePanel from '@/components/Certificate';
import SelfCheck from '@/components/SelfCheck';
import Diagnostic from '@/components/Diagnostic';
import GlossaryText from '@/components/GlossaryText';
import TopicNotes from '@/components/TopicNotes';
import { Intuition } from '@/components/TopicInsights';
import CognitiveLensToggle from '@/components/CognitiveLensToggle';
import ActChapterCard from '@/components/ActChapterCard';
import TopicLensInsight from '@/components/TopicLensInsight';
import Expandable3B1BCard from '@/components/Expandable3B1BCard';

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const MILESTONE_COPY: Record<number, string> = {
  1: 'You have explored the foundations used later: vectors, bras, kets, and measurement. Use the checks to test what you can retrieve.',
  2: 'You have explored circuit diagrams, gates, Paulis, and measurements. The next tier builds on those self-marked steps.',
  3: 'You have explored the code and threshold vocabulary needed to begin reading the linked papers critically.',
  4: 'You have explored the toric code, surface code, and syndrome extraction. The practical literature is now easier to navigate.',
  5: 'You have explored computation and decoding. Apply the ideas in the Lab and Decoder Duel to produce stronger evidence.',
  6: 'You have explored every atlas topic. The live literature remains an ongoing practice, not a final unlocked state.',
};

/* ---------- derived path data (name→id resolution lives in @/data) ---------- */

interface PathData {
  ordered: Topic[];
  byId: Map<string, Topic>;
  /** topic id → papers that list it as a prerequisite */
  unlocksByTopic: Map<string, Paper[]>;
  /** paper arxiv_id → resolved prerequisite topic ids */
  paperPrereqIds: Map<string, string[]>;
  /** tier → papers whose highest-tier prerequisite is that tier */
  boundaryPapers: Record<number, Paper[]>;
  /** ordered tiers that actually occur */
  tiers: number[];
}

function buildPathData(): PathData {
  // Data ships in a valid tier-major topological order (verified); keep it stable.
  const ordered = [...topics].sort((a, b) => a.tier - b.tier);

  const boundaryPapers: Record<number, Paper[]> = {};
  for (const p of papers) {
    const ids = paperPrereqIds.get(p.arxiv_id) ?? [];
    const maxTier = ids.reduce((m, id) => Math.max(m, topicById.get(id)?.tier ?? 1), 1);
    (boundaryPapers[maxTier] ??= []).push(p);
  }

  const tiers = [...new Set(ordered.map((t) => t.tier))].sort((a, b) => a - b);
  return {
    ordered,
    byId: topicById,
    unlocksByTopic: papersByTopic,
    paperPrereqIds,
    boundaryPapers,
    tiers,
  };
}

/* ---------- small shared bits ---------- */

function TierBadge({ tier, compact = false }: { tier: number; compact?: boolean }) {
  const color = tierColors[tier];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]"
      style={{
        color,
        borderColor: `${color}59`,
        backgroundColor: `${color}24`,
      }}
    >
      {compact ? `T${tier}` : `TIER ${tier} · ${tierNames[tier]}`}
    </span>
  );
}

function PaperChip({ paper, dim = false }: { paper: Paper; dim?: boolean }) {
  return (
    <Link
      to={`/papers#${paper.arxiv_id}`}
      title={paper.title}
      className={`group flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-star/30 bg-star/10 px-2.5 py-1.5 text-left transition-colors duration-200 hover:border-star/70 hover:bg-star/20 ${
        dim ? 'opacity-60' : ''
      }`}
    >
      <span className="shrink-0 font-mono text-[11px] text-star">{paper.year}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-text-mid transition-colors group-hover:text-text-hi">
        {paper.title}
      </span>
    </Link>
  );
}

/* ---------- progress ring ---------- */

function ProgressRing({ pct, bump }: { pct: number; bump: number }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const mv = useMotionValue(0);
  const dash = useTransform(mv, (v) => C * (1 - v / 100));
  const [display, setDisplay] = useState(0);
  const [bursts, setBursts] = useState<number[]>([]);
  const prevBump = useRef(bump);

  useEffect(() => {
    const controls = animate(mv, pct, {
      duration: 1.4,
      delay: 0.3,
      ease: [...EASE_OUT_EXPO],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [pct, mv]);

  // One-time particle burst when a step is completed while the ring is mounted.
  useEffect(() => {
    if (bump <= prevBump.current) return undefined;
    prevBump.current = bump;
    const id = Date.now();
    const t1 = setTimeout(() => setBursts((b) => [...b, id]), 0);
    const t2 = setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [bump]);

  return (
    <div className="relative h-[120px] w-[120px] shrink-0" role="img" aria-label={`${pct}% of path topics self-marked explored`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#2A3A5F" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          style={{ strokeDashoffset: dash }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[32px] font-bold leading-none text-text-hi">
          {display}%
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-low">
          explored
        </span>
      </div>
      {bursts.map((id) => (
        <span key={id} className="pointer-events-none absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-plaquette"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * 56,
                  y: Math.sin(angle) * 56,
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

/* ---------- topic drawer (learning-path.md §2, design.md §7.10) ---------- */

function TopicDrawer({
  topic,
  onClose,
  data,
}: {
  topic: Topic | null;
  onClose: () => void;
  data: PathData;
}) {
  const reduce = useReducedMotion();
  const { isUnderstood, toggleUnderstood } = useProgress();
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!topic) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => titleRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [topic, onClose]);

  return (
    <AnimatePresence>
      {topic && (
        <>
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-ink-950/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`path-topic-title-${topic.id}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto border-l border-ink-600 bg-ink-850 sm:max-w-[480px]"
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-600 p-6">
              <div>
                <TierBadge tier={topic.tier} />
                <h2
                  ref={titleRef}
                  id={`path-topic-title-${topic.id}`}
                  tabIndex={-1}
                  className="mt-3 font-display text-[22px] font-semibold leading-snug text-text-hi outline-none"
                >
                  {topic.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close topic details"
                className="rounded-lg p-2 text-text-mid transition-colors hover:text-text-hi"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-8 p-6">
              <Intuition topicId={topic.id} />

              <p className="leading-relaxed text-text-mid">
                <GlossaryText text={topic.detail} />
              </p>

              <TopicLensInsight topicId={topic.id} />

              <div>
                <p className="eyebrow mb-3">// KEY POINTS</p>
                <ul className="space-y-2.5">
                  {topic.key_points.map((kp) => (
                    <li key={kp} className="flex gap-2.5 text-sm leading-relaxed text-text-mid">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-plaquette" />
                      {kp}
                    </li>
                  ))}
                </ul>
              </div>

              <SelfCheck topicId={topic.id} />

              {topic.depends_on.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">// DEPENDS ON</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.depends_on.map((depId) => {
                      const dep = data.byId.get(depId);
                      if (!dep) return null;
                      const done = isUnderstood(depId);
                      return (
                        <span
                          key={depId}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                            done
                              ? 'border-stabilizer/40 bg-stabilizer/10 text-stabilizer'
                              : 'border-ink-500 bg-ink-800 text-text-mid'
                          }`}
                        >
                          {done ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <span className="h-2 w-2 rounded-full border border-text-low" />
                          )}
                          {shortName(dep)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <TopicNotes topicId={topic.id} />

              {topic.resources.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">// RESOURCES</p>
                  <ul className="space-y-2">
                    {topic.resources.map((res) => {
                      const r = parseResource(res);
                      if (r.is3B1B) {
                        return <li key={res}><Expandable3B1BCard resource={r} /></li>;
                      }
                      return (
                        <li key={res}>
                          {r.link ? (
                            <a
                              href={r.link}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-start gap-2 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-text-mid transition-colors hover:border-plaquette/50 hover:text-text-hi"
                            >
                              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-plaquette">
                                {r.tag}
                              </span>
                              <span className="flex-1 leading-snug">{r.title}</span>
                              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-low transition-colors group-hover:text-plaquette" />
                            </a>
                          ) : (
                            <div className="flex items-start gap-2 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-text-mid">
                              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-text-low">
                                {r.tag}
                              </span>
                              <span className="leading-snug">{r.title}</span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-ink-600 p-6">
              <button
                type="button"
                onClick={() => toggleUnderstood(topic.id)}
                aria-pressed={isUnderstood(topic.id)}
                className={
                  isUnderstood(topic.id)
                    ? 'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stabilizer/50 bg-stabilizer/15 px-5 py-2.5 text-sm font-semibold text-stabilizer transition-all duration-200'
                    : 'btn-primary w-full'
                }
              >
                {isUnderstood(topic.id) ? (
                  <>
                    <Check className="h-4 w-4" /> Explored — tap to undo
                  </>
                ) : (
                  'Mark explored'
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- step card ---------- */

function StepCard({
  topic,
  index,
  isCurrent,
  flash,
  data,
  onOpen,
}: {
  topic: Topic;
  index: number;
  isCurrent: boolean;
  flash: boolean;
  data: PathData;
  onOpen: (t: Topic) => void;
}) {
  const { isUnderstood, toggleUnderstood } = useProgress();
  const [expanded, setExpanded] = useState(false);
  const done = isUnderstood(topic.id);
  const color = tierColors[topic.tier];

  const missingDeps = topic.depends_on.filter((d) => !isUnderstood(d));
  const unlocks = data.unlocksByTopic.get(topic.id) ?? [];
  const visibleUnlocks = expanded ? unlocks : unlocks.slice(0, 3);

  return (
    <motion.article
      id={`step-${topic.id}`}
      initial={{ opacity: 0, x: 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [...EASE_OUT_EXPO] }}
      className={`ripple-card relative ml-12 mb-6 min-w-0 rounded-xl border bg-ink-800 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow-cyan sm:p-6 ${
        flash
          ? 'border-stabilizer/60 shadow-[0_0_24px_rgba(52,211,153,0.15)]'
          : done
            ? 'border-ink-600 hover:border-stabilizer/40'
            : 'border-ink-600 hover:border-plaquette/40'
      }`}
      style={{ borderLeft: `3px solid ${flash ? '#34D399' : color}` }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
    >
      <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="min-w-0">
          <p className="font-mono text-[13px] text-text-low">
            STEP {String(index + 1).padStart(2, '0')}
            {isCurrent && !done && (
              <span className="ml-2 text-plaquette">← YOU ARE HERE</span>
            )}
          </p>
          <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-text-hi">
            {shortName(topic)}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-text-mid">{topic.short}</p>

          <TopicLensInsight topicId={topic.id} />

          {topic.depends_on.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-text-low">needs:</span>
              {topic.depends_on.map((depId) => {
                const dep = data.byId.get(depId);
                if (!dep) return null;
                const depDone = isUnderstood(depId);
                return (
                  <span
                    key={depId}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] ${
                      depDone
                        ? 'border-stabilizer/40 bg-stabilizer/10 text-stabilizer'
                        : 'border-ink-500 text-text-low'
                    }`}
                  >
                    {depDone && <Check className="h-3 w-3" />}
                    {shortName(dep)}
                  </span>
                );
              })}
            </div>
          )}

          {missingDeps.length > 0 && !done && (
            <p className="mt-3 font-mono text-xs text-magic/90">
              heads-up: you have not marked {missingDeps.length} prerequisite
              {missingDeps.length > 1 ? 's' : ''} above as explored yet
            </p>
          )}
        </div>

        <div className="min-w-0 md:border-l md:border-ink-700 md:pl-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-star">
            Related papers
          </p>
          {unlocks.length > 0 ? (
            <div className="mt-2 flex flex-col gap-1.5">
              {visibleUnlocks.map((p) => (
                <PaperChip key={p.arxiv_id} paper={p} />
              ))}
              {unlocks.length > 3 && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="self-start font-mono text-[11px] text-text-low transition-colors hover:text-star"
                >
                  {expanded ? 'show less' : `+${unlocks.length - 3} more`}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-text-low">
              No paper lists this topic as a direct prerequisite, but later topics build on
              it.
            </p>
          )}
          <p className="mt-4 font-mono text-[11px] text-text-low">
            effort: <span className="text-text-mid">{tierEffort[topic.tier]}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700 pt-4">
        <button type="button" onClick={() => onOpen(topic)} className="btn-ghost group">
          Read the topic
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={() => toggleUnderstood(topic.id)}
          aria-pressed={done}
          className={
            done
              ? 'inline-flex items-center gap-2 rounded-lg border border-stabilizer/50 bg-stabilizer/15 px-4 py-2 text-sm font-semibold text-stabilizer transition-all duration-200'
              : 'inline-flex items-center gap-2 rounded-lg border border-plaquette/40 px-4 py-2 text-sm font-semibold text-plaquette transition-all duration-200 hover:border-plaquette hover:bg-plaquette/10'
          }
        >
          {done ? (
            <>
              <Check className="h-4 w-4" /> Explored
            </>
          ) : (
            'Mark explored'
          )}
        </button>
      </div>
    </motion.article>
  );
}

/* ---------- milestone interstitial ---------- */

function Milestone({ tier, data }: { tier: number; data: PathData }) {
  const color = tierColors[tier];
  const unlocked = (data.boundaryPapers[tier] ?? []).slice(0, 3);
  const { isUnderstood } = useProgress();
  const tierTopics = data.ordered.filter((t) => t.tier === tier);
  const complete = tierTopics.every((t) => isUnderstood(t.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [...EASE_OUT_EXPO] }}
      className={`relative ml-12 mb-10 min-w-0 rounded-xl border border-dashed bg-ink-850 p-4 sm:p-6 ${
        complete ? '' : 'opacity-75'
      }`}
      style={{ borderColor: `${color}80` }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color }}>
        {complete ? '✓ Tier explored' : 'Tier activity — preview'}
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-text-hi">
        Tier {tier} · {tierNames[tier]} {complete ? 'self-marked' : 'in progress'}
      </p>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-text-mid">
        {MILESTONE_COPY[tier]}
      </p>
      {unlocked.length > 0 && (
        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-text-low">related reading:</span>
          {unlocked.map((p) => (
            <PaperChip key={p.arxiv_id} paper={p} dim={!complete} />
          ))}
          <Link
            to="/papers"
            className="link-slide font-mono text-[11px] text-star hover:text-text-hi"
          >
            browse all →
          </Link>
        </div>
      )}
    </motion.div>
  );
}

/* ---------- papers-unlocked panel ---------- */

function PapersPanel({ data, fixed }: { data: PathData; fixed: boolean }) {
  const { isUnderstood } = useProgress();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lattice-atlas-path-panel-collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try {
        localStorage.setItem('lattice-atlas-path-panel-collapsed', v ? '0' : '1');
      } catch {
        /* storage unavailable */
      }
      return !v;
    });
  };

  const unlockedPapers = papers.filter((p) =>
    (data.paperPrereqIds.get(p.arxiv_id) ?? []).every((id) => isUnderstood(id)),
  );
  const recent = [...unlockedPapers].sort((a, b) => b.year - a.year).slice(0, 3);

  const eras = Object.keys(eraNames);
  const eraCounts = eras.map((era) => ({
    era,
    total: papers.filter((p) => p.era === era).length,
    unlocked: unlockedPapers.filter((p) => p.era === era).length,
  }));

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-star">
          Papers whose prerequisites were explored
        </p>
        {fixed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            className="rounded-md p-1 text-text-low transition-colors hover:text-text-hi"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {(!fixed || !collapsed) && (
        <>
          <p className="mt-2 font-display text-2xl font-bold text-text-hi">
            {unlockedPapers.length}
            <span className="text-base font-medium text-text-low">/{papers.length}</span>
          </p>
          <div
            className="mt-2 flex h-2 overflow-hidden rounded-full bg-ink-700"
            role="img"
            aria-label={`${unlockedPapers.length} of ${papers.length} papers have all prerequisites self-marked explored`}
          >
            {eraCounts.map(({ era, total, unlocked }) =>
              unlocked > 0 ? (
                <motion.span
                  key={era}
                  className="h-full"
                  style={{ backgroundColor: eraColors[era] }}
                  initial={false}
                  animate={{ width: `${(unlocked / total) * (total / papers.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  title={`${eraNames[era]}: ${unlocked}/${total}`}
                />
              ) : null,
            )}
          </div>
          <div className="mt-3 space-y-1.5">
            {recent.length > 0 ? (
              recent.map((p) => (
                <Link
                  key={p.arxiv_id}
                  to="/papers"
                  className="block truncate font-mono text-[11px] text-text-mid transition-colors hover:text-star"
                  title={p.title}
                >
                  <span className="text-text-low">{p.year}</span> {p.title}
                </Link>
              ))
            ) : (
              <p className="text-xs leading-relaxed text-text-low">
                Mark topics explored to reveal which papers list them as prerequisites.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );

  if (!fixed) {
    return (
      <section className="mx-auto max-w-4xl px-6 pb-20 md:hidden">
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">{body}</div>
      </section>
    );
  }

  return (
    <motion.aside
      className="fixed bottom-6 right-6 z-40 hidden w-64 rounded-xl border border-ink-600 bg-ink-800/95 p-4 shadow-glow-violet backdrop-blur-sm md:block"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.35, ease: [...EASE_OUT_EXPO] }}
    >
      {body}
    </motion.aside>
  );
}

/* ---------- completion band ---------- */

function CompletionBand() {
  const reduce = useReducedMotion();
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (reduce) return undefined;
    try {
      if (sessionStorage.getItem('lattice-atlas-celebrated')) return undefined;
      sessionStorage.setItem('lattice-atlas-celebrated', '1');
      const t1 = setTimeout(() => setCelebrate(true), 0);
      const t2 = setTimeout(() => setCelebrate(false), 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch {
      return undefined;
    }
  }, [reduce]);

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [...EASE_OUT_EXPO] }}
      className="relative overflow-hidden rounded-xl border border-stabilizer/40 bg-ink-850 p-8 md:p-10"
    >
      {celebrate && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                left: `${8 + (i * 83) % 88}%`,
                top: -8,
                backgroundColor: ['#22D3EE', '#8B5CF6', '#FB7185'][i % 3],
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 320, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.06,
                ease: [0.4, 0, 1, 1],
              }}
            />
          ))}
        </div>
      )}
      <p className="eyebrow !text-stabilizer">// ALL TOPICS EXPLORED</p>
      <h2 className="mt-3 font-display text-[32px] font-semibold leading-tight text-text-hi">
        You marked every path topic as explored.
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-text-mid">
        This is a complete activity pass, not proof of mastery. Use the recorded
        topic checks, delayed Review, Lab, and Decoder Duel to build evidence of what
        you can retrieve and apply. All readings remain available for critical study.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/capstone" className="btn-primary">
          <Check className="h-4 w-4" /> Take the synthesis capstone
        </Link>
        <Link to="/papers" className="btn-secondary !border-star/50 !text-star hover:!border-star hover:!bg-star/10">
          <ScrollText className="h-4 w-4" /> Browse the papers
        </Link>
        <Link to="/field-today" className="btn-secondary">
          <Telescope className="h-4 w-4" /> Visit the frontier
        </Link>
        <Link to="/glossary" className="btn-ghost">
          <Library className="h-4 w-4" /> Review the glossary
        </Link>
      </div>

      <CertificatePanel />
    </motion.section>
  );
}

/* ---------- page ---------- */

export default function LearningPath() {
  useDocumentTitle('TQEC Learning Path & Curriculum');
  const reduce = useReducedMotion();
  const data = useMemo(() => buildPathData(), []);
  const { isUnderstood, understoodCount, checkedCount, resetProgress } = useProgress();
  const [drawerTopic, setDrawerTopic] = useState<Topic | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const prevCount = useRef(understoodCount);

  const pct = Math.round((understoodCount / data.ordered.length) * 100);
  const complete = understoodCount >= data.ordered.length;
  const nextTopic = data.ordered.find((t) => !isUnderstood(t.id)) ?? null;

  const unlockedPaperCount = papers.filter((p) =>
    (data.paperPrereqIds.get(p.arxiv_id) ?? []).every((id) => isUnderstood(id)),
  ).length;

  // Green flash on the card that was just completed (800ms decay).
  useEffect(() => {
    if (understoodCount > prevCount.current && flashId !== null) {
      const t = setTimeout(() => setFlashId(null), 800);
      prevCount.current = understoodCount;
      return () => clearTimeout(t);
    }
    prevCount.current = understoodCount;
    return undefined;
  }, [understoodCount, flashId]);

  // Track which card to flash: intercept toggles via a wrapper.
  const handleOpen = useCallback((topic: Topic) => setDrawerTopic(topic), []);
  const closeTopic = useCallback(() => setDrawerTopic(null), []);

  // Papers panel appears past 40% scroll.
  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, 'change', (v) => setPanelVisible(v > 0.4));

  // Spine draw tied to scroll through the path section.
  const pathRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: spineProgress } = useScroll({
    target: pathRef,
    offset: ['start 0.85', 'end 0.65'],
  });
  const spineScale = useTransform(spineProgress, [0, 1], [0, 1]);

  const scrollToCurrent = () => {
    if (!nextTopic) return;
    document
      .getElementById(`step-${nextTopic.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Spine gradient stops proportional to per-tier step counts.
  const spineGradient = useMemo(() => {
    const total = data.ordered.length;
    let acc = 0;
    const stops: string[] = [];
    for (const tier of data.tiers) {
      const count = data.ordered.filter((t) => t.tier === tier).length;
      const start = (acc / total) * 100;
      acc += count;
      const end = (acc / total) * 100;
      stops.push(`${tierColors[tier]} ${start}%`, `${tierColors[tier]} ${end}%`);
    }
    return `linear-gradient(to bottom, ${stops.join(', ')})`;
  }, [data]);

  return (
    <div className="lattice-bg">
      {/* Section 1 — header + progress hero */}
      <section className="mx-auto max-w-6xl px-6 pt-32 pb-12 md:px-8">
        <p className="eyebrow !text-stabilizer">// GUIDED ROUTE</p>
        <h1 className="mt-4 font-display text-display-lg text-text-hi max-md:text-4xl">
          The Learning Path
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-mid max-md:text-[17px]">
          Twenty-six steps from your first vector space to reading this year&apos;s
          surface-code papers. The path respects dependencies — each step assumes only what
          came before it. The app saves your progress on this device. You can leave and come
          back any time. Topic marks mean “explored”; checks and applied challenges are shown separately.
        </p>

        <div className="mt-8">
          <CognitiveLensToggle />
        </div>

        <Diagnostic ordered={data.ordered} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [...EASE_OUT_EXPO] }}
          className="mt-10 rounded-xl border border-ink-600 bg-ink-800 p-8"
        >
          {complete ? (
            <CompletionBand />
          ) : (
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <ProgressRing pct={pct} bump={understoodCount} />

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-low">
                  Next up:
                </p>
                {nextTopic && (
                  <>
                    <h3 className="mt-2 font-display text-xl font-semibold text-plaquette">
                      {shortName(nextTopic)}
                    </h3>
                    <div className="mt-2">
                      <TierBadge tier={nextTopic.tier} />
                    </div>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-mid">
                      {nextTopic.short}
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2 font-mono text-[13px] text-text-mid md:text-right" role="status" aria-live="polite">
                <p>
                  TOPICS EXPLORED <span className="text-text-hi">{understoodCount}/{data.ordered.length}</span>
                </p>
                <p>
                  TOPIC CHECKS PASSED <span className="text-text-hi">{checkedCount}/{data.ordered.length}</span>
                </p>
                <p>
                  PAPER PREREQS EXPLORED <span className="text-text-hi">{unlockedPaperCount}/{papers.length}</span>
                </p>
                <p>
                  CURRENT TIER <span className="text-text-hi">T{nextTopic?.tier ?? 6}</span>
                </p>
              </div>
            </div>
          )}

          {!complete && (
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ink-700 pt-6">
              <button type="button" onClick={scrollToCurrent} className="btn-primary">
                Continue where you left off <ArrowRight className="h-4 w-4" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setConfirmReset((v) => !v)}
                  className="btn-ghost"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restart path
                </button>
                <AnimatePresence>
                  {confirmReset && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-lg border border-ink-500 bg-ink-850 p-4 shadow-glow-cyan"
                    >
                      <p className="text-sm leading-relaxed text-text-mid">
                        Clear all {understoodCount} explored marks and topic-check evidence?
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            resetProgress();
                            setConfirmReset(false);
                          }}
                          className="rounded-md bg-syndrome/15 px-3 py-1.5 text-xs font-semibold text-syndrome transition-colors hover:bg-syndrome/25"
                        >
                          Yes, restart
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="rounded-md border border-ink-500 px-3 py-1.5 text-xs font-medium text-text-mid transition-colors hover:text-text-hi"
                        >
                          Keep my progress
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Section 2 — the path */}
      <section ref={pathRef} className="relative mx-auto max-w-4xl overflow-x-clip px-6 py-16 md:px-8">
        {/* spine */}
        <div className="absolute bottom-16 left-[30px] top-16 w-0.5 bg-ink-500 md:left-[34px]" aria-hidden>
          <motion.div
            className="h-full w-full origin-top"
            style={{ scaleY: spineScale, background: spineGradient }}
          />
        </div>

        {data.tiers.map((tier) => {
          const tierTopics = data.ordered.filter((t) => t.tier === tier);
          const doneCount = tierTopics.filter((t) => isUnderstood(t.id)).length;
          const color = tierColors[tier];
          return (
            <div key={tier}>
              {/* tier section header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, ease: [...EASE_OUT_EXPO] }}
                className="relative ml-12 mb-6 py-6"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <TierBadge tier={tier} compact />
                  <h2
                    className="font-display text-[26px] font-semibold leading-tight md:text-[32px]"
                    style={{ color }}
                  >
                    {tierNames[tier]}
                  </h2>
                  <span className="font-mono text-[13px] text-text-low">
                    {doneCount}/{tierTopics.length}
                  </span>
                </div>
                <motion.div
                  className="mt-3 h-px origin-left"
                  style={{ backgroundColor: `${color}66` }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [...EASE_OUT_EXPO] }}
                />
              </motion.div>

              <ActChapterCard tier={tier} />

              {tierTopics.map((topic) => {
                const index = data.ordered.indexOf(topic);
                const done = isUnderstood(topic.id);
                const isCurrent = nextTopic?.id === topic.id;
                return (
                  <div key={topic.id} className="relative">
                    {/* node marker */}
                    <motion.div
                      className="absolute left-[19px] top-7 z-10 md:left-[23px]"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20, duration: 0.25 }}
                      aria-hidden
                    >
                      {done ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stabilizer text-ink-950">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      ) : isCurrent ? (
                        <span className="relative flex h-7 w-7 items-center justify-center">
                          {!reduce && (
                            <motion.span
                              className="absolute inset-0 rounded-full border-2 border-plaquette"
                              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                            />
                          )}
                          <span className="h-7 w-7 rounded-full border-2 border-plaquette bg-ink-900" />
                          <span className="absolute h-2.5 w-2.5 rounded-full bg-plaquette" />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink-500 bg-ink-900">
                          <Lock className="h-3 w-3 text-text-low" aria-hidden />
                        </span>
                      )}
                    </motion.div>

                    <StepCardWithFlash
                      topic={topic}
                      index={index}
                      isCurrent={isCurrent}
                      data={data}
                      onOpen={handleOpen}
                      onToggled={(id) => setFlashId(id)}
                      flash={flashId === topic.id}
                    />
                  </div>
                );
              })}

              <Milestone tier={tier} data={data} />
            </div>
          );
        })}
      </section>

      {/* Section 3 — papers progress: fixed panel (desktop) + bottom section (mobile) */}
      <AnimatePresence>
        {panelVisible && !complete && <PapersPanel data={data} fixed />}
      </AnimatePresence>
      <PapersPanel data={data} fixed={false} />

      {/* cross-links footer strip */}
      <section className="mx-auto max-w-4xl px-6 pb-20 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-700 pt-8 text-sm text-text-low">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            Keep exploring:
          </span>
          <Link to="/map" className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette">
            <MapIcon className="h-3.5 w-3.5" /> Knowledge map
          </Link>
          <Link to="/papers" className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette">
            <ScrollText className="h-3.5 w-3.5" /> Paper explorer
          </Link>
          <Link to="/field-today" className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette">
            <Telescope className="h-3.5 w-3.5" /> Field today
          </Link>
          <Link to="/glossary" className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette">
            <BookOpen className="h-3.5 w-3.5" /> Glossary
          </Link>
          <Link to="/review" className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette">
            <Repeat className="h-3.5 w-3.5" /> Daily review
          </Link>
        </div>
      </section>

      <TopicDrawer topic={drawerTopic} onClose={closeTopic} data={data} />
    </div>
  );
}

/** Wrapper that flashes the card green when it is newly marked explored. */
function StepCardWithFlash(props: {
  topic: Topic;
  index: number;
  isCurrent: boolean;
  flash: boolean;
  data: PathData;
  onOpen: (t: Topic) => void;
  onToggled: (id: string) => void;
}) {
  const { onToggled, topic, ...rest } = props;
  const { isUnderstood } = useProgress();
  const wasUnderstood = useRef(isUnderstood(topic.id));

  useEffect(() => {
    const now = isUnderstood(topic.id);
    if (now && !wasUnderstood.current) onToggled(topic.id);
    wasUnderstood.current = now;
  }, [isUnderstood, onToggled, topic.id]);

  return <StepCard topic={topic} {...rest} />;
}

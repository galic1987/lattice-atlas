import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  topics,
  tierNames,
  tierColors,
  topicById,
  shortName,
  papersByTopic,
  parseResource,
  type Topic,
} from '@/data';
import { useProgress } from '@/store/progress';
import SelfCheck from '@/components/SelfCheck';
import GlossaryText from '@/components/GlossaryText';

/* ------------------------------------------------------------------ */
/* Data helpers                                                        */
/* ------------------------------------------------------------------ */

const TIER_LIST = [1, 2, 3, 4, 5, 6] as const;

const topicsByTier = TIER_LIST.map((tier) => topics.filter((t) => t.tier === tier));

const matchesQuery = (t: Topic, q: string) =>
  !q ||
  t.name.toLowerCase().includes(q) ||
  t.short.toLowerCase().includes(q) ||
  tierNames[t.tier].toLowerCase().includes(q);

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function TierBadge({ tier, compact = false }: { tier: number; compact?: boolean }) {
  const c = tierColors[tier];
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider"
      style={{ color: c, backgroundColor: `${c}24`, border: `1px solid ${c}59` }}
    >
      {compact ? `T${tier}` : `Tier ${tier} · ${tierNames[tier]}`}
    </span>
  );
}

function CheckToggle({
  active,
  onToggle,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={active ? 'Marked as understood ✓ — click to unmark' : label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 ${
        active
          ? 'border-stabilizer bg-stabilizer/20 text-stabilizer'
          : 'border-ink-500 text-text-low hover:border-stabilizer/60 hover:text-stabilizer'
      }`}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: 0.6 }}
        animate={{ scale: active ? [0.6, 1.15, 1] : 1 }}
        transition={{ duration: 0.35 }}
        className="flex"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={active ? 3 : 2} />
      </motion.span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Section 1 — Page header                                             */
/* ------------------------------------------------------------------ */

function PageHeader({ understoodCount }: { understoodCount: number }) {
  const reduce = useReducedMotion();
  const spring = useSpring(understoodCount, { stiffness: 120, damping: 22 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(understoodCount);
  }, [understoodCount, spring]);

  const block = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <header className="lattice-bg relative overflow-hidden">
      {/* anyon illustration, floated right (desktop only) */}
      <motion.img
        src="/anyon-illustration.svg"
        alt=""
        aria-hidden
        initial={reduce ? false : { opacity: 0, x: 60 }}
        animate={{ opacity: 0.3, x: 0 }}
        transition={{ duration: 0.9, delay: 0.3 }}
        className="pointer-events-none absolute right-0 top-1/2 hidden w-[420px] -translate-y-1/2 select-none lg:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 35%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 35%)',
        }}
      />
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 hidden w-[420px] -translate-y-1/2 lg:block"
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/30" />

      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 md:px-8">
        <motion.p {...block(0)} className="eyebrow">
          {'// PREREQUISITE TREE'}
        </motion.p>
        <motion.h1
          {...block(0.08)}
          className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-text-hi md:text-display-lg"
        >
          The Knowledge Map
        </motion.h1>
        <motion.p {...block(0.16)} className="mt-6 max-w-2xl text-[17px] leading-[1.7] text-text-mid">
          Every concept you need before the key papers make sense — arranged in
          six tiers, each building on the last. Click any topic for a full
          explanation, key points, and curated resources. Mark topics as
          understood when you master them. The map saves your marks.
        </motion.p>
        <motion.div
          {...block(0.4)}
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[13px]"
        >
          <span className="text-text-mid">{topics.length} TOPICS</span>
          <span className="text-text-mid">{TIER_LIST.length} TIERS</span>
          <span className="text-stabilizer">
            <motion.span>{rounded}</motion.span> UNDERSTOOD
          </span>
          <span className="text-text-low">{topics.length - understoodCount} REMAINING</span>
        </motion.div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Section 2 — Sticky controls bar                                     */
/* ------------------------------------------------------------------ */

function ControlsBar({
  view,
  setView,
  search,
  setSearch,
  onReset,
}: {
  view: 'tree' | 'list';
  setView: (v: 'tree' | 'list') => void;
  search: string;
  setSearch: (s: string) => void;
  onReset: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`sticky top-16 z-30 border-b border-ink-600 bg-ink-900/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_24px_rgba(5,8,15,0.6)]' : ''
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3 md:px-8">
        {/* View toggle */}
        <div
          role="tablist"
          aria-label="Map view"
          className="flex rounded-full border border-ink-600 bg-ink-800 p-1"
        >
          {(['tree', 'list'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`relative cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                view === v ? 'text-ink-950' : 'text-text-mid hover:text-text-hi'
              }`}
            >
              {view === v && (
                <motion.span
                  layoutId="view-toggle-thumb"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-plaquette"
                />
              )}
              <span className="relative">{v === 'tree' ? 'Tree view' : 'List view'}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-low" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="filter topics…"
            aria-label="Filter topics"
            className="w-full rounded-full border border-ink-600 bg-ink-800 py-1.5 pl-9 pr-4 font-mono text-[13px] text-text-hi placeholder:text-text-low focus:border-plaquette/60 focus:outline-none"
          />
        </label>

        {/* Legend */}
        <div className="ml-auto hidden items-center gap-3 lg:flex" aria-hidden>
          {TIER_LIST.map((t) => (
            <span key={t} className="flex items-center gap-1.5 font-mono text-[11px] text-text-low">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tierColors[t] }}
              />
              T{t}
            </span>
          ))}
        </div>

        {/* Reset progress */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setConfirming((c) => !c)}
            className="btn-ghost cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Reset progress
          </button>
          <AnimatePresence>
            {confirming && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-ink-600 bg-ink-850 p-4 shadow-xl"
              >
                <p className="text-sm leading-relaxed text-text-mid">
                  Clear all understood marks? This only affects your browser.
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="btn-ghost cursor-pointer px-2 py-1 text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setConfirming(false);
                    }}
                    className="cursor-pointer rounded-lg border border-syndrome/50 px-3 py-1 text-[13px] font-semibold text-syndrome transition-colors hover:bg-syndrome/10"
                  >
                    Clear all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section 3 — Tree view                                               */
/* ------------------------------------------------------------------ */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Edge {
  from: string;
  to: string;
}

const EDGES: Edge[] = topics.flatMap((t) =>
  t.depends_on.map((d) => ({ from: d, to: t.id })),
);

function TopicNode({
  topic,
  query,
  hoverState,
  onHover,
  onOpen,
  isUnderstood,
  onToggle,
  index,
}: {
  topic: Topic;
  query: string;
  hoverState: 'normal' | 'hot' | 'connected' | 'dim';
  onHover: (id: string | null) => void;
  onOpen: (id: string) => void;
  isUnderstood: boolean;
  onToggle: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();
  const c = tierColors[topic.tier];
  const dimmedBySearch = query !== '' && !matchesQuery(topic, query);
  const matchHighlight = query !== '' && matchesQuery(topic, query);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
    >
      <div data-node-id={topic.id}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpen(topic.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen(topic.id);
            }
          }}
          onMouseEnter={() => onHover(topic.id)}
          onMouseLeave={() => onHover(null)}
          onMouseMove={handleMouseMove}
          className={`ripple-card group relative w-full cursor-pointer rounded-xl border bg-ink-800 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-glow-cyan ${
            dimmedBySearch || hoverState === 'dim'
              ? 'opacity-30'
              : isUnderstood
                ? 'opacity-100'
                : 'opacity-100'
          }`}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: c,
            borderColor:
              hoverState === 'hot' || hoverState === 'connected'
                ? `${c}99`
                : matchHighlight
                  ? 'rgba(34,211,238,0.7)'
                  : undefined,
            boxShadow: isUnderstood
              ? `inset 3px 0 12px -6px rgba(52,211,153,0.5)`
              : undefined,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <TierBadge tier={topic.tier} compact />
            <CheckToggle
              active={isUnderstood}
              onToggle={onToggle}
              label={`Mark ${shortName(topic)} as understood`}
            />
          </div>
          <h3 className="mt-2.5 font-display text-lg font-semibold leading-snug text-text-hi">
            {shortName(topic)}
          </h3>
          <p className="mt-2.5 font-mono text-[12px] text-text-low">
            {topic.depends_on.length === 0
              ? 'no prerequisites'
              : `depends on ${topic.depends_on.length} topic${topic.depends_on.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TreeView({
  search,
  hoveredId,
  setHoveredId,
  onOpen,
}: {
  search: string;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onOpen: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const { isUnderstood, toggleUnderstood } = useProgress();
  const innerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, Box> | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const q = search.trim().toLowerCase();

  const measure = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const base = inner.getBoundingClientRect();
    const next: Record<string, Box> = {};
    inner.querySelectorAll<HTMLElement>('[data-node-id]').forEach((el) => {
      const r = el.getBoundingClientRect();
      next[el.dataset.nodeId as string] = {
        x: r.left - base.left,
        y: r.top - base.top,
        w: r.width,
        h: r.height,
      };
    });
    setPositions(next);
  }, []);

  // Measure after entrance animations settle (last tier column finishes ~1.05s
  // in: 0.1s/column stagger + 0.55s duration); keep updated on resize.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const t1 = window.setTimeout(measure, reduce ? 60 : 1200);
    const ro = new ResizeObserver(() => measure());
    ro.observe(inner);
    document.fonts?.ready.then(() => measure()).catch(() => undefined);
    return () => {
      window.clearTimeout(t1);
      ro.disconnect();
    };
  }, [measure, reduce]);

  const connectedToHovered = useMemo(() => {
    if (!hoveredId) return null;
    const set = new Set<string>([hoveredId]);
    topicById.get(hoveredId)?.depends_on.forEach((d) => set.add(d));
    topics.forEach((t) => {
      if (t.depends_on.includes(hoveredId)) set.add(t.id);
    });
    return set;
  }, [hoveredId]);

  const hoverColor = hoveredId
    ? tierColors[topicById.get(hoveredId)?.tier ?? 2]
    : '#3D5178';

  return (
    <section aria-label="Prerequisite tree" className="mx-auto max-w-7xl px-6 py-12 md:px-8">
      <div
        className="relative overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:#2A3A5F_transparent]"
        onScroll={() => setHintVisible(false)}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div ref={innerRef} className="relative flex w-max gap-8 pr-8">
          {topicsByTier.map((tierTopics, i) => {
            const tier = TIER_LIST[i];
            const c = tierColors[tier];
            const done = tierTopics.filter((t) => isUnderstood(t.id)).length;
            return (
              <motion.div
                key={tier}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: reduce ? 0 : 0.1 * i,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-[300px] shrink-0"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2.5">
                    <TierBadge tier={tier} compact />
                    <h2 className="font-display text-lg font-semibold" style={{ color: c }}>
                      {tierNames[tier]}
                    </h2>
                  </div>
                  <p className="mt-1.5 font-mono text-[12px] text-text-low">
                    {tierTopics.length} topics · {done} understood
                  </p>
                  {/* understood-by-tier track */}
                  <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${(done / tierTopics.length) * 100}%`,
                        backgroundColor: c,
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {tierTopics.map((topic, j) => {
                    let hoverState: 'normal' | 'hot' | 'connected' | 'dim' = 'normal';
                    if (connectedToHovered) {
                      if (topic.id === hoveredId) hoverState = 'hot';
                      else if (connectedToHovered.has(topic.id)) hoverState = 'connected';
                      else hoverState = 'dim';
                    }
                    return (
                      <TopicNode
                        key={topic.id}
                        topic={topic}
                        query={q}
                        hoverState={hoverState}
                        onHover={setHoveredId}
                        onOpen={onOpen}
                        isUnderstood={isUnderstood(topic.id)}
                        onToggle={() => toggleUnderstood(topic.id)}
                        index={j}
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {/* Dependency edges overlay */}
          {positions && (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              {EDGES.map((e) => {
                const a = positions[e.from];
                const b = positions[e.to];
                if (!a || !b) return null;
                const x1 = a.x + a.w;
                const y1 = a.y + a.h / 2;
                const x2 = b.x;
                const y2 = b.y + b.h / 2;
                const dx = Math.max(40, (x2 - x1) / 2);
                const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                const hot = hoveredId && (e.from === hoveredId || e.to === hoveredId);
                const dim = hoveredId && !hot;
                return (
                  <motion.path
                    key={`${e.from}->${e.to}`}
                    d={d}
                    fill="none"
                    stroke={hot ? hoverColor : '#3D5178'}
                    strokeWidth={hot ? 2 : 1.5}
                    strokeOpacity={hot ? 1 : dim ? 0.15 : 0.4}
                    style={{ transition: 'stroke 200ms, stroke-opacity 200ms' }}
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: reduce ? 0 : 0.3 + (topicById.get(e.to)?.tier ?? 1) * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {hintVisible && (
            <motion.p
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none sticky left-full top-2 -mt-2 inline-block font-mono text-[12px] text-text-low"
              aria-hidden
            >
              drag / scroll →
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 4 — List view                                               */
/* ------------------------------------------------------------------ */

function ListView({
  search,
  onOpen,
}: {
  search: string;
  onOpen: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const { isUnderstood, toggleUnderstood } = useProgress();
  const [openTiers, setOpenTiers] = useState<Set<number>>(
    () => new Set<number>(TIER_LIST),
  );
  const q = search.trim().toLowerCase();

  const toggleTier = (tier: number) =>
    setOpenTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) next.delete(tier);
      else next.add(tier);
      return next;
    });

  return (
    <section aria-label="Topic list" className="mx-auto max-w-6xl px-6 py-12 md:px-8">
      <div className="flex flex-col gap-4">
        {topicsByTier.map((tierTopics, i) => {
          const tier = TIER_LIST[i];
          const c = tierColors[tier];
          const visible = tierTopics.filter((t) => matchesQuery(t, q));
          const done = tierTopics.filter((t) => isUnderstood(t.id)).length;
          const open = openTiers.has(tier);
          return (
            <div key={tier} className="overflow-hidden rounded-xl border border-ink-600 bg-ink-850">
              <button
                type="button"
                onClick={() => toggleTier(tier)}
                aria-expanded={open}
                className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-800"
              >
                <TierBadge tier={tier} compact />
                <span className="font-display text-lg font-semibold" style={{ color: c }}>
                  {tierNames[tier]}
                </span>
                <span className="ml-auto font-mono text-[12px] text-text-low">
                  {done}/{tierTopics.length} understood
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-text-low transition-transform duration-250 ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ul>
                      {visible.length === 0 && (
                        <li className="border-t border-ink-600 px-5 py-4 text-sm text-text-low">
                          No topics match this filter.
                        </li>
                      )}
                      {visible.map((topic, j) => (
                        <motion.li
                          key={topic.id}
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: reduce ? 0 : 0.04 * j }}
                          className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-600 px-5 py-4"
                        >
                          <CheckToggle
                            active={isUnderstood(topic.id)}
                            onToggle={() => toggleUnderstood(topic.id)}
                            label={`Mark ${shortName(topic)} as understood`}
                          />
                          <div className="min-w-[200px] flex-1">
                            <h3 className="font-display text-base font-semibold text-text-hi">
                              {shortName(topic)}
                            </h3>
                            <p className="mt-0.5 text-sm leading-relaxed text-text-mid">
                              {topic.short}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {topic.depends_on.map((depId) => {
                              const dep = topicById.get(depId);
                              if (!dep) return null;
                              return (
                                <button
                                  key={depId}
                                  type="button"
                                  onClick={() => onOpen(depId)}
                                  title={dep.short}
                                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800 px-2.5 py-1 text-[12px] text-text-mid transition-colors hover:border-plaquette/50 hover:text-plaquette"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-plaquette" />
                                  {shortName(dep)}
                                  {isUnderstood(depId) && (
                                    <Check className="h-3 w-3 text-stabilizer" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpen(topic.id)}
                            className="btn-ghost cursor-pointer text-plaquette hover:text-plaquette/80"
                          >
                            Details →
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 5 — Topic drawer                                            */
/* ------------------------------------------------------------------ */

function DrawerSection({
  eyebrow,
  children,
}: {
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      {children}
    </div>
  );
}

function TopicDrawer({
  stack,
  onNavigate,
  onBack,
  onClose,
}: {
  stack: string[];
  onNavigate: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const { isUnderstood, toggleUnderstood } = useProgress();
  const topic = topicById.get(stack[stack.length - 1]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!topic) return null;

  const understood = isUnderstood(topic.id);
  const unlocks = papersByTopic.get(topic.id) ?? [];
  const breadcrumb = [...stack]
    .reverse()
    .map((id) => shortName(topicById.get(id) ?? topic))
    .join(' ← ');

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={topic.name}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/70"
      />
      <motion.aside
        initial={reduce ? { opacity: 0 } : { x: '100%' }}
        animate={reduce ? { opacity: 1 } : { x: 0 }}
        exit={reduce ? { opacity: 0 } : { x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-ink-600 bg-ink-850 sm:w-[480px]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={topic.id}
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#2A3A5F_transparent]"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {stack.length > 1 && (
                    <button
                      type="button"
                      onClick={onBack}
                      aria-label="Back to previous topic"
                      className="cursor-pointer rounded-lg p-1.5 text-text-mid transition-colors hover:bg-ink-700 hover:text-text-hi"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  <TierBadge tier={topic.tier} />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close topic detail"
                  className="cursor-pointer rounded-lg p-1.5 text-text-mid transition-colors hover:bg-ink-700 hover:text-text-hi"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {stack.length > 1 && (
                <p className="mt-2 font-mono text-[12px] text-text-low">{breadcrumb}</p>
              )}
              <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-text-hi md:text-[26px]">
                {topic.name}
              </h2>
              <p className="mt-2 font-mono text-[12px] text-text-low">
                Tier {topic.tier} of 6 · depends on {topic.depends_on.length} topic
                {topic.depends_on.length === 1 ? '' : 's'} · required by {unlocks.length} paper
                {unlocks.length === 1 ? '' : 's'}
              </p>

              {/* Understood toggle */}
              <button
                type="button"
                onClick={() => toggleUnderstood(topic.id)}
                aria-pressed={understood}
                className={`mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  understood
                    ? 'border-stabilizer/60 bg-stabilizer/15 text-stabilizer hover:bg-stabilizer/10'
                    : 'border-plaquette/40 text-plaquette hover:border-plaquette hover:bg-plaquette/10'
                }`}
              >
                <motion.span
                  key={String(understood)}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: understood ? [0.6, 1.15, 1] : 1 }}
                  transition={{ duration: 0.35 }}
                  className="flex"
                >
                  <Check className="h-4 w-4" strokeWidth={understood ? 3 : 2} />
                </motion.span>
                {understood ? 'Understood — click to unmark' : 'Mark as understood'}
              </button>

              <div className="mt-8 flex flex-col gap-8">
                <DrawerSection>
                  <p className="text-[17px] leading-[1.7] text-text-hi">
                    <GlossaryText text={topic.short} />
                  </p>
                </DrawerSection>

                <DrawerSection eyebrow="// FULL EXPLANATION">
                  <p className="leading-[1.7] text-text-mid">
                    <GlossaryText text={topic.detail} />
                  </p>
                </DrawerSection>

                <SelfCheck topicId={topic.id} />

                <DrawerSection eyebrow="// KEY POINTS">
                  <ul className="flex flex-col gap-3">
                    {topic.key_points.map((kp, i) => (
                      <li key={i} className="flex gap-3 leading-[1.7] text-text-mid">
                        <span className="mt-0.5 shrink-0 text-[10px] text-plaquette">◆</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </DrawerSection>

                {topic.depends_on.length > 0 && (
                  <DrawerSection eyebrow="// BEFORE THIS, UNDERSTAND:">
                    <div className="flex flex-wrap gap-2">
                      {topic.depends_on.map((depId) => {
                        const dep = topicById.get(depId);
                        if (!dep) return null;
                        const depDone = isUnderstood(depId);
                        return (
                          <button
                            key={depId}
                            type="button"
                            onClick={() => onNavigate(depId)}
                            title={dep.short}
                            className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm text-text-mid transition-colors hover:border-plaquette/50 hover:text-plaquette"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: tierColors[dep.tier] }}
                            />
                            {shortName(dep)}
                            {depDone && <Check className="h-3.5 w-3.5 text-stabilizer" />}
                          </button>
                        );
                      })}
                    </div>
                  </DrawerSection>
                )}

                {unlocks.length > 0 && (
                  <DrawerSection eyebrow="// REQUIRED FOR THESE PAPERS:">
                    <div className="flex flex-wrap gap-2">
                      {unlocks.map((p) => (
                        <Link
                          key={p.arxiv_id}
                          to={`/papers#${p.arxiv_id}`}
                          className="flex max-w-full items-center gap-2 rounded-full border border-star/40 bg-star/10 px-3 py-1.5 text-sm text-star transition-colors hover:border-star hover:bg-star/15"
                        >
                          <span className="font-mono text-[12px]">{p.year}</span>
                          <span className="truncate">{p.title}</span>
                        </Link>
                      ))}
                    </div>
                  </DrawerSection>
                )}

                {topic.resources.length > 0 && (
                  <DrawerSection eyebrow="// RESOURCES">
                    <div className="flex flex-col gap-3">
                      {topic.resources.map((raw, i) => {
                        const r = parseResource(raw);
                        const inner = (
                          <>
                            <span className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                              {r.tag}
                            </span>
                            <span
                              className={`mt-1 flex items-start gap-1.5 text-sm leading-relaxed ${
                                r.link ? 'text-plaquette' : 'text-text-mid'
                              }`}
                            >
                              <span className="flex-1">{r.title}</span>
                              {r.link && <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                            </span>
                          </>
                        );
                        const cls =
                          'block rounded-lg border border-ink-600 bg-ink-800 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-plaquette/40';
                        return r.link ? (
                          <a
                            key={i}
                            href={r.link}
                            target="_blank"
                            rel="noreferrer"
                            className={cls}
                          >
                            {inner}
                          </a>
                        ) : (
                          <div key={i} className={cls}>
                            {inner}
                          </div>
                        );
                      })}
                    </div>
                  </DrawerSection>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section 6 — Bottom CTA                                              */
/* ------------------------------------------------------------------ */

function BottomCta() {
  const reduce = useReducedMotion();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 text-center md:px-8">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src="/braid-divider.svg" alt="" aria-hidden className="mx-auto mb-12 w-full max-w-3xl opacity-70" />
        <h2 className="font-display text-2xl font-semibold text-text-hi md:text-[32px]">
          Do you prefer a guided route?
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-[1.7] text-text-mid">
          The learning path shows the same 26 topics in dependency order. You
          learn one topic at a time, and papers unlock as you go.
        </p>
        <motion.div
          animate={reduce ? undefined : {
            boxShadow: [
              '0 0 24px rgba(34,211,238,0.12)',
              '0 0 32px rgba(34,211,238,0.2)',
              '0 0 24px rgba(34,211,238,0.12)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-8 inline-block rounded-lg"
        >
          <Link to="/path" className="btn-primary">
            Start the guided path
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function KnowledgeMap() {
  const { understoodCount, resetProgress } = useProgress();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'tree' | 'list'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
      ? 'list'
      : 'tree',
  );
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // ?topic=<id> opens the drawer on load (used by PrereqChips site-wide).
  // State is adjusted during render (not in an effect) per React guidance.
  const topicParam = searchParams.get('topic');
  const [drawerStack, setDrawerStack] = useState<string[]>(() =>
    topicParam && topicById.has(topicParam) ? [topicParam] : [],
  );
  const [seenParam, setSeenParam] = useState(topicParam);
  if (topicParam !== seenParam) {
    setSeenParam(topicParam);
    if (topicParam && topicById.has(topicParam)) setDrawerStack([topicParam]);
  }

  const openTopic = useCallback((id: string) => setDrawerStack([id]), []);
  const navigateTopic = useCallback(
    (id: string) => setDrawerStack((s) => [...s, id]),
    [],
  );
  const backTopic = useCallback(() => setDrawerStack((s) => s.slice(0, -1)), []);
  // Clear ?topic on close so navigating to the same deep link reopens the drawer.
  const closeDrawer = useCallback(() => {
    setDrawerStack([]);
    setSearchParams(
      (prev) => {
        if (!prev.has('topic')) return prev;
        const next = new URLSearchParams(prev);
        next.delete('topic');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return (
    <div className="bg-ink-900">
      <PageHeader understoodCount={understoodCount} />
      <ControlsBar
        view={view}
        setView={setView}
        search={search}
        setSearch={setSearch}
        onReset={resetProgress}
      />
      {view === 'tree' ? (
        <TreeView
          search={search}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onOpen={openTopic}
        />
      ) : (
        <ListView search={search} onOpen={openTopic} />
      )}
      <BottomCta />

      <AnimatePresence>
        {drawerStack.length > 0 && (
          <TopicDrawer
            stack={drawerStack}
            onNavigate={navigateTopic}
            onBack={backTopic}
            onClose={closeDrawer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

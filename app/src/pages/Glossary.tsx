import { asset } from '@/lib/asset';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Map as MapIcon, Repeat, ScrollText, Route } from 'lucide-react';
import { topicById, shortName } from '@/data';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import SuperTLDR from '@/components/SuperTLDR';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  TERMS,
  type Category,
  type GlossaryTerm,
} from '@/data/glossary';

/* ------------------------------------------------------------------ */
/* Glossary data (design/glossary.md §4 — 61 terms, 5 categories)      */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SORTED_TERMS = [...TERMS].sort((a, b) =>
  a.term.toLowerCase().localeCompare(b.term.toLowerCase()),
);

const TERM_BY_SLUG = new Map(SORTED_TERMS.map((t) => [t.slug, t]));

function firstLetter(term: string): string {
  return term[0].toUpperCase();
}

/** Wrap matched query substrings in a cyan highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  for (;;) {
    const idx = rest.toLowerCase().indexOf(q);
    if (idx === -1) {
      parts.push(rest);
      break;
    }
    parts.push(rest.slice(0, idx));
    parts.push(
      <mark key={key++} className="bg-transparent text-plaquette">
        {rest.slice(idx, idx + q.length)}
      </mark>,
    );
    rest = rest.slice(idx + q.length);
  }
  return <>{parts}</>;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Glossary() {
  useDocumentTitle('TQEC Glossary');
  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pulseSlug, setPulseSlug] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* "/" focuses the search box */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Deep-link: /glossary#stabilizer scrolls, expands, pulses */
  useEffect(() => {
    const slug = window.location.hash.replace('#', '');
    if (!slug || !TERM_BY_SLUG.has(slug)) return;
    const timer = window.setTimeout(() => {
      setExpanded((prev) => new Set(prev).add(slug));
      document
        .getElementById(slug)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPulseSlug(slug);
      window.setTimeout(() => setPulseSlug(null), 2600);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SORTED_TERMS.filter((t) => {
      if (activeCategories.size > 0 && !activeCategories.has(t.category)) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.long.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategories]);

  const groups = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const l = firstLetter(t.term);
      if (!map.has(l)) map.set(l, []);
      map.get(l)!.push(t);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const activeLetters = useMemo(() => new Set(groups.map(([l]) => l)), [groups]);

  const toggleCategory = (c: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const toggleExpanded = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const scrollToTerm = (slug: string) => {
    setExpanded((prev) => new Set(prev).add(slug));
    window.history.replaceState(null, '', `#${slug}`);
    window.setTimeout(() => {
      document
        .getElementById(slug)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPulseSlug(slug);
      window.setTimeout(() => setPulseSlug(null), 2600);
    }, 80);
  };

  const scrollToLetter = (letter: string) => {
    document
      .getElementById(`letter-${letter}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Section 1 — header */}
      <section className="lattice-bg">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 md:px-8">
          <SuperTLDR
            summary="Comprehensive dictionary of 61 fundamental QEC terms, mathematical definitions, and physical concepts."
            takeaways={[
              'Search and filter terms across Stabilizers, Topology, Decoders, and Distillation.',
              'Mathematical expressions formatted in clean JetBrains Mono notation.',
              'Cross-linked to Knowledge Map topics and seminal research papers.',
            ]}
          />
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            // REFERENCE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Glossary
          </motion.h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-mid">
            <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-plaquette">{'// TL;DR'}</span>Every technical term on this site, defined in plain English.
          </p>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-text-mid md:text-lg md:leading-[1.7]"
          >
            The vocabulary of topological quantum error correction, defined plainly.
            Terms cross-link to the knowledge map and the paper canon, so a definition
            is never a dead end.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.46 }}
            className="mt-6 font-mono text-[13px] text-text-low"
          >
            {TERMS.length} TERMS · {CATEGORIES.length} CATEGORIES
          </motion.p>
        </div>
      </section>

      {/* Section 2 — sticky search + category bar */}
      <div className="sticky top-16 z-30 border-b border-ink-600 bg-ink-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3 md:px-8">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-low" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search terms… ( / to focus )"
              aria-label="Search glossary terms"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 py-2 pl-9 pr-10 font-mono text-sm text-text-hi placeholder:text-text-low transition-all duration-200 focus:border-plaquette focus:shadow-glow-cyan focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 font-mono text-[11px] text-text-low">
              /
            </kbd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategories(new Set())}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                activeCategories.size === 0
                  ? 'border-plaquette/60 bg-plaquette/10 text-text-hi'
                  : 'border-ink-600 text-text-mid hover:text-text-hi'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => {
              const active = activeCategories.has(c);
              const color = CATEGORY_COLORS[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                    active
                      ? 'text-text-hi'
                      : 'border-ink-600 text-text-mid hover:text-text-hi'
                  }`}
                  style={
                    active
                      ? { borderColor: `${color}99`, backgroundColor: `${color}1F` }
                      : undefined
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {c}
                </button>
              );
            })}
          </div>
          <p className="ml-auto font-mono text-[13px] text-text-low" role="status" aria-live="polite" aria-atomic="true">
            SHOWING {filtered.length} OF {TERMS.length}
          </p>
        </div>
      </div>

      {/* Section 3 — alphabet jump rail */}
      <div className="border-b border-ink-700">
        <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-6 py-3 md:px-8">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
            const active = activeLetters.has(letter);
            return active ? (
              <button
                key={letter}
                type="button"
                onClick={() => scrollToLetter(letter)}
                aria-label={`Jump to glossary terms beginning with ${letter}`}
                className="inline-flex min-h-11 min-w-8 items-center justify-center font-mono text-[13px] text-plaquette transition-colors duration-200 hover:text-text-hi"
              >
                {letter}
              </button>
            ) : (
              <span
                key={letter}
                aria-hidden
                className="font-mono text-[13px] text-text-low/25"
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>

      {/* Section 4 — term list */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        {groups.length === 0 && (
          <p className="py-16 text-center font-mono text-sm text-text-low">
            no terms match — try a different search or category
          </p>
        )}
        {groups.map(([letter, terms]) => (
          <motion.section
            key={letter}
            id={`letter-${letter}`}
            layout
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ staggerChildren: 0.05 }}
            className="scroll-mt-44"
          >
            <h2 className="-ml-1 select-none font-display text-[96px] font-bold leading-none text-ink-700/50">
              {letter}
            </h2>
            <div className="mt-2">
              {terms.map((t) => (
                <TermRow
                  key={t.slug}
                  term={t}
                  query={query}
                  isExpanded={expanded.has(t.slug)}
                  isPulsing={pulseSlug === t.slug}
                  onToggle={() => toggleExpanded(t.slug)}
                  onJumpToTerm={scrollToTerm}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </section>

      {/* Section 5 — cross-links band */}
      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-8">
        <img
          src={asset('braid-divider.svg')}
          alt=""
          className="mx-auto mb-12 w-full max-w-3xl opacity-80"
        />
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {[
            {
              to: '/review',
              icon: Repeat,
              color: 'text-magic',
              title: 'Review daily',
              body: 'A few minutes of recall keeps the vocabulary from fading. Cards unlock as you learn.',
            },
            {
              to: '/map',
              icon: MapIcon,
              color: 'text-plaquette',
              title: 'Terms → topics',
              body: 'Every glossary entry links to the topic that teaches it properly.',
            },
            {
              to: '/papers',
              icon: ScrollText,
              color: 'text-star',
              title: 'Terms → papers',
              body: 'See where each concept appears in the 23-paper canon.',
            },
            {
              to: '/path',
              icon: Route,
              color: 'text-stabilizer',
              title: 'Learn in order',
              body: 'The guided path introduces terms exactly when you need them.',
            },
          ].map(({ to, icon: Icon, color, title, body }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={to}
                className="ripple-card group block h-full rounded-xl border border-ink-600 bg-ink-800 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ink-500 hover:shadow-glow-cyan"
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <h3 className="mt-3 font-display text-lg font-semibold text-text-hi">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-mid">{body}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Term row                                                            */
/* ------------------------------------------------------------------ */

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

function TermRow({
  term,
  query,
  isExpanded,
  isPulsing,
  onToggle,
  onJumpToTerm,
}: {
  term: GlossaryTerm;
  query: string;
  isExpanded: boolean;
  isPulsing: boolean;
  onToggle: () => void;
  onJumpToTerm: (slug: string) => void;
}) {
  const catColor = CATEGORY_COLORS[term.category];

  return (
    <motion.article
      id={term.slug}
      layout
      variants={rowVariants}
      animate={
        isPulsing
          ? {
              boxShadow: [
                '0 0 0 0px rgba(34,211,238,0)',
                '0 0 0 2px rgba(34,211,238,0.9)',
                '0 0 0 0px rgba(34,211,238,0)',
                '0 0 0 2px rgba(34,211,238,0.9)',
                '0 0 0 0px rgba(34,211,238,0)',
              ],
            }
          : { boxShadow: '0 0 0 0px rgba(34,211,238,0)' }
      }
      transition={
        isPulsing
          ? { duration: 2.4, times: [0, 0.25, 0.5, 0.75, 1] }
          : { duration: 0.3 }
      }
      className="scroll-mt-44 rounded-lg border-b border-ink-600 py-6"
    >
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left — name, category, notation */}
        <div className="md:col-span-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold text-text-hi">
              <Highlight text={term.term} query={query} />
            </h3>
            {term.notation && <span className="mono-pill">{term.notation}</span>}
          </div>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[13px] text-text-low">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            {term.category}
          </p>
        </div>

        {/* Right — definition + expandable links */}
        <div className="md:col-span-8">
          <p className="leading-[1.7] text-text-mid">
            <Highlight text={term.short} query={query} />
          </p>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="btn-ghost mt-3"
          >
            Definition + links
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-250 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <p className="mt-3 leading-[1.7] text-text-mid">{term.long}</p>

                {term.related_terms.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-low">SEE ALSO:</span>
                    {term.related_terms.map((slug) => {
                      const related = TERM_BY_SLUG.get(slug);
                      if (!related) return null;
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => onJumpToTerm(slug)}
                          className="rounded-full border border-star/35 bg-star/[0.14] px-2.5 py-1 text-sm text-star transition-colors duration-200 hover:border-star hover:bg-star/20"
                        >
                          {related.term}
                        </button>
                      );
                    })}
                  </div>
                )}

                {term.related_topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-low">LEARN IT:</span>
                    {term.related_topics.map((topicId) => {
                      const topic = topicById.get(topicId);
                      return (
                        <Link
                          key={topicId}
                          to={`/map?topic=${topicId}`}
                          title={topic?.short}
                          className="rounded-full border border-plaquette/35 bg-plaquette/[0.14] px-2.5 py-1 text-sm text-plaquette transition-colors duration-200 hover:border-plaquette hover:bg-plaquette/20"
                        >
                          {topic ? shortName(topic) : topicId}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {term.related_papers.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-low">READ IT:</span>
                    {term.related_papers.map((arxivId) => (
                      <Link
                        key={arxivId}
                        to={`/papers#${arxivId}`}
                        className="rounded-full border border-syndrome/35 bg-syndrome/[0.14] px-2.5 py-1 font-mono text-[13px] text-syndrome transition-colors duration-200 hover:border-syndrome hover:bg-syndrome/20"
                      >
                        arXiv:{arxivId}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

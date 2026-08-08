import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TERMS } from '@/data/glossary';

/**
 * Renders prose with glossary terms annotated: dotted underline, hover/focus
 * popover with the short definition, click through to the full entry.
 * Each term is annotated at most once per text to keep prose readable.
 */

interface Entry {
  name: string;
  slug: string;
  short: string;
}

const ENTRIES: Entry[] = TERMS.flatMap((t) => {
  const names = new Set<string>([t.term, ...(t.aliases ?? [])]);
  const paren = t.term.match(/\(([^)]+)\)/);
  if (paren) names.add(paren[1]);
  const base = t.term.replace(/\s*\([^)]*\)/, '').trim();
  if (base) names.add(base);
  return [...names].map((name) => ({ name, slug: t.slug, short: t.short }));
}).sort((a, b) => b.name.length - a.name.length);

const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/gu, ' ');
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp(`\\b(${ENTRIES.map((e) => escapeRe(e.name)).join('|')})\\b`, 'gi');
const BY_NORMALIZED = new Map(ENTRIES.map((entry) => [normalizeName(entry.name), entry]));

export default function GlossaryText({ text }: { text: string }) {
  const tooltipPrefix = useId();
  const parts: ReactNode[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const entry = BY_NORMALIZED.get(normalizeName(m[0]));
    if (!entry || seen.has(entry.slug) || m.index === undefined) continue;
    seen.add(entry.slug);
    const tooltipId = `${tooltipPrefix}-${entry.slug}`;
    parts.push(text.slice(last, m.index));
    parts.push(
      <span key={entry.slug} className="group/gt relative">
        <Link
          to={`/glossary#${entry.slug}`}
          aria-describedby={tooltipId}
          className="rounded-sm underline decoration-plaquette/40 decoration-dotted underline-offset-2 transition-colors hover:text-plaquette hover:decoration-plaquette focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette/70"
        >
          {m[0]}
        </Link>
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden w-64 -translate-x-1/2 rounded-lg border border-ink-600 bg-ink-850 p-2.5 text-[12px] font-normal leading-snug text-text-mid shadow-xl group-hover/gt:block group-focus-within/gt:block"
        >
          {entry.short}
        </span>
      </span>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

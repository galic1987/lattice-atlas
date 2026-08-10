import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TERMS } from '@/data/glossary';
import GlossaryHover from '@/components/GlossaryHover';

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
const escapeRe = (s: string) => s.replace(/[.*k?^$x}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp(`\\b(${ENTRIES.map((e) => escapeRe(e.name)).join('|')})\\b`, 'gi');
const BY_NORMALIZED = new Map(ENTRIES.map((entry) => [normalizeName(entry.name), entry]));

export default function GlossaryText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const entry = BY_NORMALIZED.get(normalizeName(m[0]));
    if (!entry || seen.has(entry.slug) || m.index === undefined) continue;
    seen.add(entry.slug);
    parts.push(text.slice(last, m.index));
    parts.push(
      <GlossaryHover key={entry.slug} term={entry.name}>
        <Link to={`/glossary#${entry.slug}`} className="text-inherit">
          {m[0]}
        </Link>
      </GlossaryHover>
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

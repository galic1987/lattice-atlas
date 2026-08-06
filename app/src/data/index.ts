import topicsJson from './knowledge_tree.json';
import papersJson from './papers.json';
import prereqAliasesJson from './prereq_aliases.json';

/** A node in the TQEC prerequisite tree (design.md §8). */
export interface Topic {
  /** URL-safe unique id, e.g. "stabilizer-formalism". */
  id: string;
  /** Long descriptive name; text before the first colon is the short display name. */
  name: string;
  /** Knowledge tier, 1 (foundations) through 6 (frontier). */
  tier: number;
  /** One-line summary for cards and chips. */
  short: string;
  /** Full explanation for detail drawers. */
  detail: string;
  /** 4–6 bullet takeaways. */
  key_points: string[];
  /** Prerequisite topic ids (direct lookup against Topic.id). */
  depends_on: string[];
  /** Citation strings; parse the `arXiv:<id>` substring to build links. */
  resources: string[];
}

/** A seminal TQEC paper (design.md §8). */
export interface Paper {
  arxiv_id: string;
  title: string;
  /** Full author list as a single string. */
  authors: string;
  year: number;
  /** Plain-English one-sentence summary. */
  one_sentence: string;
  contribution: string;
  why_it_matters: string;
  /** Informal lowercase topic names, NOT topic ids — resolve via a name→id lookup. */
  prerequisites: string[];
  /** 1 (accessible) to 5 (frontier). */
  difficulty: number;
  /** One of the five era keys in {@link eraNames}. */
  era: string;
}

/** All 26 prerequisite-tree topics. */
export const topics: Topic[] = topicsJson as Topic[];

/** All 23 seminal papers. */
export const papers: Paper[] = papersJson as Paper[];

/** Display name per knowledge tier (design.md §2 tier scale). */
export const tierNames: Record<number, string> = {
  1: 'Foundations',
  2: 'QC Basics',
  3: 'QEC Fundamentals',
  4: 'Topological Core',
  5: 'Computation & Decoding',
  6: 'Frontier',
};

/** Accent color per knowledge tier (design.md §2 tier scale, cool → warm). */
export const tierColors: Record<number, string> = {
  1: '#38BDF8',
  2: '#22D3EE',
  3: '#34D399',
  4: '#A78BFA',
  5: '#F5B83D',
  6: '#FB7185',
};

/** Display name per paper era key (design.md §8). */
export const eraNames: Record<string, string> = {
  foundations: 'Foundations',
  'cluster-state schemes': 'Cluster-State Schemes',
  'defect-based surface code': 'Defect-Based Surface Code',
  'lattice surgery era': 'Lattice Surgery Era',
  'experimental era': 'Experimental Era',
};

/** Chronological era order (design.md §8). */
export const eraOrder = [
  'foundations',
  'cluster-state schemes',
  'defect-based surface code',
  'lattice surgery era',
  'experimental era',
] as const;

/** Accent color per era key (design.md §2). */
export const eraColors: Record<string, string> = {
  foundations: '#22D3EE',
  'cluster-state schemes': '#38BDF8',
  'defect-based surface code': '#A78BFA',
  'lattice surgery era': '#F5B83D',
  'experimental era': '#FB7185',
};

/** Year span of an era, e.g. "2008–2013"; the still-open experimental era uses "2014 → 2026". */
export function eraYearRange(era: string): string {
  const years = papers.filter((p) => p.era === era).map((p) => p.year);
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  return era === 'experimental era' ? `${lo} → ${hi}` : `${lo}–${hi}`;
}

/* ------------------------------------------------------------------ */
/* Shared lookups & name resolution (design.md §8 caveats)             */
/* ------------------------------------------------------------------ */

export const topicById = new Map<string, Topic>(topics.map((t) => [t.id, t]));

/** Short display name: text before the first colon (design.md §8). */
export function shortName(topic: Topic): string {
  const i = topic.name.indexOf(':');
  return (i === -1 ? topic.name : topic.name.slice(0, i)).trim();
}

const normalizeName = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Aliases for informal paper prerequisite names that don't match a topic
 * name or short name, keyed post-normalization. Lives in JSON so
 * scripts/check-data.mjs validates the exact same map the app uses.
 */
const PREREQ_ALIASES: Record<string, string> = prereqAliasesJson;

const nameToId = new Map<string, string>();
for (const t of topics) {
  nameToId.set(normalizeName(t.name), t.id);
  nameToId.set(normalizeName(shortName(t)), t.id);
}

/** Resolve an informal prerequisite name (e.g. "qubits & gates") to a topic id. */
export function resolveTopicId(name: string): string | undefined {
  const key = normalizeName(name);
  return PREREQ_ALIASES[key] ?? nameToId.get(key);
}

/** Resolve an informal prerequisite name directly to its Topic. */
export function resolveTopic(name: string): Topic | undefined {
  const id = resolveTopicId(name);
  return id ? topicById.get(id) : undefined;
}

/** paper arxiv_id → resolved prerequisite topic ids. */
export const paperPrereqIds = new Map<string, string[]>();

/** topic id → papers that list it as a prerequisite ("unlocks"). */
export const papersByTopic = new Map<string, Paper[]>();

for (const p of papers) {
  const ids: string[] = [];
  for (const name of p.prerequisites) {
    const id = resolveTopicId(name);
    if (!id || ids.includes(id)) continue;
    ids.push(id);
    const list = papersByTopic.get(id) ?? [];
    list.push(p);
    papersByTopic.set(id, list);
  }
  paperPrereqIds.set(p.arxiv_id, ids);
}

/** Curated per-tier effort estimates (learning-path.md §2). */
export const tierEffort: Record<number, string> = {
  1: '~1 evening',
  2: '~1 evening',
  3: '~2–3 evenings',
  4: '~1 week',
  5: '~1 week',
  6: '~1–2 weeks',
};

/**
 * Transitive prerequisite closure for a paper — every topic you must
 * understand before reading it, in tier-major topological order.
 */
export function paperPrereqClosure(arxivId: string): Topic[] {
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    topicById.get(id)?.depends_on.forEach(visit);
  };
  (paperPrereqIds.get(arxivId) ?? []).forEach(visit);
  // topics ship in topological order; stable sort by tier preserves it.
  return topics.filter((t) => seen.has(t.id)).sort((a, b) => a.tier - b.tier);
}

// Data drift guard: every paper prerequisite must resolve to a real topic.
if (import.meta.env.DEV) {
  const unresolved = papers.flatMap((p) =>
    p.prerequisites
      .filter((name) => !resolveTopicId(name))
      .map((name) => `"${name}" (arXiv:${p.arxiv_id})`),
  );
  if (unresolved.length > 0) {
    console.error(
      `[data] ${unresolved.length} paper prerequisite name(s) do not resolve to a topic id — add aliases in src/data/index.ts:\n  ${unresolved.join('\n  ')}`,
    );
  }
}

const ARXIV_RE = /arXiv:([a-z-]+\/\d{7}|\d{4}\.\d{4,5})(v\d+)?/i;

/** Parse a citation string into a display title, arXiv link (if any), and type tag. */
export function parseResource(raw: string): { title: string; link: string | null; tag: string } {
  const m = raw.match(ARXIV_RE);
  let tag = 'REFERENCE';
  if (m) tag = 'PAPER';
  else if (/video|youtube/i.test(raw)) tag = 'VIDEO';
  else if (/lecture/i.test(raw)) tag = 'LECTURE NOTES';
  else if (/textbook|book|chapter|nielsen|preskill notes/i.test(raw)) tag = 'TEXTBOOK';
  return {
    title: raw,
    link: m ? `https://arxiv.org/abs/${m[1]}` : null,
    tag,
  };
}

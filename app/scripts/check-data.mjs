#!/usr/bin/env node
/**
 * Lattice Atlas data integrity checker (`npm run check-data`).
 *
 * Validates knowledge_tree.json, papers.json, prereq_aliases.json, and the
 * hand-written cross-link ids embedded in Glossary.tsx / FieldToday.tsx.
 * Runs before every build; exits 1 on any error so bad data cannot ship.
 *
 * The name-resolution logic mirrors src/data/index.ts and both read the
 * alias map from the same prereq_aliases.json.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(readFileSync(join(appRoot, rel), 'utf8'));
const readText = (rel) => readFileSync(join(appRoot, rel), 'utf8');

const topics = readJson('src/data/knowledge_tree.json');
const papers = readJson('src/data/papers.json');
const aliases = readJson('src/data/prereq_aliases.json');

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// Mirrors src/data/index.ts.
const normalizeName = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const shortName = (name) => {
  const i = name.indexOf(':');
  return (i === -1 ? name : name.slice(0, i)).trim();
};

const ERAS = [
  'foundations',
  'cluster-state schemes',
  'defect-based surface code',
  'lattice surgery era',
  'experimental era',
];

/* ---------------- topics ---------------- */

const topicIds = new Set();
topics.forEach((t, i) => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) err(`topic[${i}] id "${t.id}" is not kebab-case`);
  if (topicIds.has(t.id)) err(`duplicate topic id "${t.id}"`);
  topicIds.add(t.id);
  if (!Number.isInteger(t.tier) || t.tier < 1 || t.tier > 6)
    err(`topic "${t.id}" has invalid tier ${t.tier} (expected integer 1–6)`);
  for (const f of ['name', 'short', 'detail'])
    if (typeof t[f] !== 'string' || !t[f].trim()) err(`topic "${t.id}" is missing field "${f}"`);
  if (!Array.isArray(t.key_points) || t.key_points.length === 0)
    err(`topic "${t.id}" has no key_points`);
  if (!Array.isArray(t.resources)) err(`topic "${t.id}" resources is not an array`);
  if (!Array.isArray(t.depends_on)) err(`topic "${t.id}" depends_on is not an array`);
});

// Dependency sanity + shipped topological order (the learning path relies on it).
// A forward reference here also catches any dependency cycle.
const indexOf = new Map(topics.map((t, i) => [t.id, i]));
topics.forEach((t, i) => {
  for (const d of t.depends_on ?? []) {
    if (!topicIds.has(d)) {
      err(`topic "${t.id}" depends on unknown id "${d}"`);
      continue;
    }
    if (d === t.id) err(`topic "${t.id}" depends on itself`);
    if (indexOf.get(d) > i)
      err(
        `topic order broken: "${t.id}" (index ${i}) depends on "${d}" (index ${indexOf.get(d)}) — ` +
          `the learning path assumes the array ships in topological order`,
      );
    const dep = topics[indexOf.get(d)];
    if (dep && dep.tier > t.tier)
      err(`topic "${t.id}" (tier ${t.tier}) depends on higher-tier "${d}" (tier ${dep.tier})`);
  }
});

/* ---------------- papers + prerequisite resolution ---------------- */

const nameToId = new Map();
for (const t of topics) {
  nameToId.set(normalizeName(t.name), t.id);
  nameToId.set(normalizeName(shortName(t.name)), t.id);
}
const resolve = (n) => {
  const k = normalizeName(n);
  return aliases[k] ?? nameToId.get(k);
};

const paperIds = new Set();
const ARXIV_ID = /^([a-z-]+\/\d{7}|\d{4}\.\d{4,5})$/;
papers.forEach((p) => {
  if (!ARXIV_ID.test(p.arxiv_id)) err(`paper arxiv_id "${p.arxiv_id}" has unexpected format`);
  if (paperIds.has(p.arxiv_id)) err(`duplicate paper "${p.arxiv_id}"`);
  paperIds.add(p.arxiv_id);
  if (!ERAS.includes(p.era)) err(`paper ${p.arxiv_id} has unknown era "${p.era}"`);
  if (!Number.isInteger(p.difficulty) || p.difficulty < 1 || p.difficulty > 5)
    err(`paper ${p.arxiv_id} has invalid difficulty ${p.difficulty} (expected integer 1–5)`);
  if (!Number.isInteger(p.year) || p.year < 1990 || p.year > 2100)
    err(`paper ${p.arxiv_id} has implausible year ${p.year}`);
  for (const f of ['title', 'authors', 'one_sentence', 'contribution', 'why_it_matters'])
    if (typeof p[f] !== 'string' || !p[f].trim()) err(`paper ${p.arxiv_id} is missing field "${f}"`);
  for (const n of p.prerequisites ?? []) {
    const id = resolve(n);
    if (!id)
      err(
        `paper ${p.arxiv_id} prerequisite "${n}" does not resolve — ` +
          `add an alias in src/data/prereq_aliases.json`,
      );
    else if (!topicIds.has(id))
      err(`paper ${p.arxiv_id} prerequisite "${n}" resolves to unknown topic id "${id}"`);
  }
});

/* ---------------- alias hygiene ---------------- */

for (const [k, v] of Object.entries(aliases)) {
  if (!topicIds.has(v)) err(`alias "${k}" points to unknown topic id "${v}"`);
  if (normalizeName(k) !== k) err(`alias key "${k}" is not in normalized form ("${normalizeName(k)}")`);
}
const usedPrereqKeys = new Set(papers.flatMap((p) => (p.prerequisites ?? []).map(normalizeName)));
for (const k of Object.keys(aliases))
  if (!usedPrereqKeys.has(k)) warn(`alias "${k}" is not used by any paper prerequisite`);

/* ---------------- self-check questions ---------------- */

const selfChecks = readJson('src/data/self_checks.json');
for (const [topicId, questions] of Object.entries(selfChecks)) {
  if (!topicIds.has(topicId)) err(`self_checks key "${topicId}" is not a topic id`);
  if (!Array.isArray(questions) || questions.length !== 2)
    err(`self_checks["${topicId}"] must contain exactly 2 questions (learning-record schema 1)`);
  for (const [i, q] of (questions ?? []).entries()) {
    if (typeof q.q !== 'string' || !q.q.trim()) err(`self_checks["${topicId}"][${i}] missing q`);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      err(`self_checks["${topicId}"][${i}] must have exactly 4 options`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0))
      err(`self_checks["${topicId}"][${i}] answer index out of range`);
    if (typeof q.why !== 'string' || !q.why.trim()) err(`self_checks["${topicId}"][${i}] missing why`);
  }
}
for (const id of topicIds)
  if (!(id in selfChecks)) err(`topic "${id}" has no self-check questions`);

/* ---------------- topic insights (intuition + misconceptions) ---------------- */

const insights = readJson('src/data/topic_insights.json');
for (const [topicId, ins] of Object.entries(insights)) {
  if (!topicIds.has(topicId)) err(`topic_insights key "${topicId}" is not a topic id`);
  if (typeof ins.intuition !== 'string' || !ins.intuition.trim())
    err(`topic_insights["${topicId}"] missing intuition`);
  if (!Array.isArray(ins.misconceptions) || ins.misconceptions.length === 0)
    err(`topic_insights["${topicId}"] has no misconceptions`);
  for (const [i, m] of (ins.misconceptions ?? []).entries()) {
    if (typeof m.myth !== 'string' || !m.myth.trim())
      err(`topic_insights["${topicId}"].misconceptions[${i}] missing myth`);
    if (typeof m.truth !== 'string' || !m.truth.trim())
      err(`topic_insights["${topicId}"].misconceptions[${i}] missing truth`);
  }
}
for (const id of topicIds)
  if (!(id in insights)) err(`topic "${id}" has no entry in topic_insights.json`);

/* ---------------- reading prompts ---------------- */

const readingPrompts = readJson('src/data/reading_prompts.json');
for (const [pid, prompts] of Object.entries(readingPrompts)) {
  if (!paperIds.has(pid)) err(`reading_prompts key "${pid}" is not a paper id`);
  if (!Array.isArray(prompts) || prompts.length === 0 || prompts.some((s) => typeof s !== 'string' || !s.trim()))
    err(`reading_prompts["${pid}"] must be a non-empty array of strings`);
}
for (const pid of paperIds)
  if (!(pid in readingPrompts)) err(`paper "${pid}" has no reading prompts`);

/* ---------------- Glossary.tsx cross-links (regex-extracted) ---------------- */

const glossary = readText('src/data/glossary.ts');
const glossarySlugs = [...glossary.matchAll(/^\s*slug: '([a-z0-9-]+)'/gm)].map((m) => m[1]);
if (glossarySlugs.length < 10)
  err('could not extract glossary slugs from Glossary.tsx — update the regex in scripts/check-data.mjs');
const slugSet = new Set(glossarySlugs);
if (slugSet.size !== glossarySlugs.length) err('duplicate slugs in Glossary.tsx');

const extractIds = (source, field) =>
  [...source.matchAll(new RegExp(`${field}: \\[([^\\]]*)\\]`, 'g'))]
    .flatMap((m) => m[1].match(/'[^']+'/g) ?? [])
    .map((s) => s.slice(1, -1));

for (const s of extractIds(glossary, 'related_terms'))
  if (!slugSet.has(s)) err(`glossary related_terms slug "${s}" has no glossary entry`);
for (const id of extractIds(glossary, 'related_topics'))
  if (!topicIds.has(id)) err(`glossary related_topics id "${id}" is not a topic`);
for (const id of extractIds(glossary, 'related_papers'))
  if (!paperIds.has(id)) err(`glossary related_papers id "${id}" is not in papers.json`);

/* ---------------- FieldToday.tsx hand-written links ---------------- */

const fieldToday = readText('src/pages/FieldToday.tsx');
const topicChipIds = [...fieldToday.matchAll(/TopicChip id="([^"]+)"/g)].map((m) => m[1]);
if (topicChipIds.length === 0)
  err('could not extract TopicChip ids from FieldToday.tsx — update the regex in scripts/check-data.mjs');
for (const id of topicChipIds)
  if (!topicIds.has(id)) err(`FieldToday TopicChip id "${id}" is not a topic`);
for (const m of fieldToday.matchAll(/CrossLinkChip kind="paper" id="([^"]+)"/g))
  if (!paperIds.has(m[1])) err(`FieldToday paper chip id "${m[1]}" is not in papers.json`);
for (const m of fieldToday.matchAll(/^\s*slug: '([a-z0-9-]+)'/gm))
  if (!slugSet.has(m[1])) err(`FieldToday jargon slug "${m[1]}" has no glossary entry`);

/* ---------------- clip references resolve to real files ---------------- */

const clipsDir = join(appRoot, 'public', 'clips');
const clipFiles = new Set(readdirSync(clipsDir));
const requireClip = (name, where, exts = ['.mp4', '.jpg']) => {
  for (const ext of exts) {
    if (!clipFiles.has(`${name}${ext}`))
      err(`clip "${name}${ext}" referenced by ${where} is missing from public/clips/`);
  }
};

// topicClips.ts: TOPIC_CLIPS maps topic ids to clip basenames.
const topicClipsSrc = readText('src/lib/topicClips.ts');
const clipNames = [...topicClipsSrc.matchAll(/'([a-z0-9-]+)'/g)]
  .map((m) => m[1])
  .filter((s) => s.includes('-') && !topicIds.has(s)); // topic ids are kebab-case too; clips are the non-topic strings
for (const name of clipNames) requireClip(name, 'src/lib/topicClips.ts');

// PaperVeoVideoGallery: every paperId maps to a clip of the same basename.
const gallerySrc = readText('src/components/PaperVeoVideoGallery.tsx');
for (const m of gallerySrc.matchAll(/paperId: '([^']+)'/g)) requireClip(m[1], 'PaperVeoVideoGallery');

// One-off clip references in pages (hero, depth dive).
requireClip('hero-torus-ambience', 'src/pages/Home.tsx');
requireClip('metaphor-descent', 'src/components/DepthDive.tsx');
for (let i = 0; i < 5; i++) requireClip(`descent-level-${i}`, 'src/components/DepthDive.tsx', ['.jpg']);

/* ---------------- report ---------------- */

console.log(
  `checked ${topics.length} topics, ${papers.length} papers, ` +
    `${Object.keys(aliases).length} aliases, ${glossarySlugs.length} glossary terms`,
);
for (const w of warnings) console.warn(`  warn: ${w}`);
if (errors.length > 0) {
  console.error(`✗ ${errors.length} data error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✓ all data checks passed');

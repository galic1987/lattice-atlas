#!/usr/bin/env node
/**
 * Registry sync checker — the workbench tool registry and the test suites
 * must not drift apart. Fails the build when they do.
 *
 *   1. Every id in WORKBENCH_TOOLS (LabWorkbenchHub.tsx) appears in the
 *      LAB_TOOLS smoke list (tests/workbench-tools.spec.ts), and vice versa.
 *   2. Every route in App.tsx appears in the mobile-overflow route list
 *      (tests/release-gates.spec.ts).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(appRoot, rel), 'utf8');

const errors = [];
const err = (msg) => errors.push(msg);

/* ---------------- 1. workbench tools ↔ smoke suite ---------------- */

const hub = read('src/components/LabWorkbenchHub.tsx');
const toolsBlock = hub.slice(hub.indexOf('WORKBENCH_TOOLS'));
const hubIds = new Set([...toolsBlock.matchAll(/id: '([a-z0-9-]+)'/g)].map((m) => m[1]));

const spec = read('tests/workbench-tools.spec.ts');
const labBlock = spec.slice(spec.indexOf('LAB_TOOLS'), spec.indexOf('] as const'));
const specIds = new Set([...labBlock.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]));

for (const id of hubIds) if (!specIds.has(id)) err(`tool "${id}" is in WORKBENCH_TOOLS but missing from the smoke suite`);
for (const id of specIds) if (!hubIds.has(id)) err(`tool "${id}" is in the smoke suite but not in WORKBENCH_TOOLS`);

/* ---------------- 2. routes ↔ mobile-overflow suite ---------------- */

const app = read('src/App.tsx');
const appRoutes = new Set(
  [...app.matchAll(/<Route path="([a-z-]+)"/g)].map((m) => `${m[1]}/`),
);
appRoutes.add(''); // index route

const gates = read('tests/release-gates.spec.ts');
const overflowBlock = gates.slice(
  gates.indexOf('horizontal overflow'),
  gates.indexOf('])', gates.indexOf('horizontal overflow')),
);
const coveredRoutes = new Set(
  [...overflowBlock.matchAll(/'([a-z-]*\/?)'/g)].map((m) => m[1]),
);
for (const route of appRoutes)
  if (!coveredRoutes.has(route)) err(`route "/${route}" is missing from the mobile-overflow suite`);

/* ---------------- topic↔tool registry integrity ---------------- */

const topicToolsSrc = read('src/lib/topicTools.ts');
const treeSrc = read('src/data/knowledge_tree.json');
const treeIds = new Set(JSON.parse(treeSrc).map((t) => t.id));
for (const m of topicToolsSrc.matchAll(/'([a-z0-9-]+)':\s*\[/g))
  if (!treeIds.has(m[1])) err(`TOPIC_TOOLS key "${m[1]}" is not a knowledge-tree topic id`);
for (const m of topicToolsSrc.matchAll(/tool: '([a-z0-9-]+)'/g))
  if (!hubIds.has(m[1])) err(`TOPIC_TOOLS tool "${m[1]}" is not in WORKBENCH_TOOLS`);

/* ---------------- report ---------------- */

if (errors.length) {
  console.error(`✗ ${errors.length} registry drift error(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(
  `checked ${hubIds.size} workbench tools against the smoke suite, ` +
    `${appRoutes.size} routes against the overflow suite`,
);
console.log('✓ registries in sync');

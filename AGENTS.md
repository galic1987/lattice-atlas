# Working on Lattice Atlas — agent coordination guide

Multiple AI agents (and humans) work in this repo. Read this before editing.
**Every push to `main` auto-deploys to https://galic1987.github.io/lattice-atlas/ via
`.github/workflows/deploy.yml`** — a broken commit goes live in ~60 seconds.

## Hard rules (break these and production breaks)

1. **Public assets in JSX must use the `asset()` helper** from `app/src/lib/asset.ts`:
   `src={asset('foo.svg')}` — never `src="/foo.svg"`. The site deploys under the
   `/lattice-atlas/` base path; raw absolute paths 404 in production. CSS `url()` and
   `index.html` refs are rebased by Vite automatically; JSX strings are not.
2. **Run the gates before committing** (all from `app/`):
   `npm run check-data && npm run verify-lattice && npx eslint src scripts && npm run build`
   The build runs check-data automatically; CI runs all of them and blocks deploy on failure.
3. **Data files have enforced coverage.** `scripts/check-data.mjs` requires every topic to
   have self-checks and insights, every paper to have reading prompts, and every
   cross-link id to resolve. Adding a topic/paper means adding its companions.
4. **Router basename comes from `import.meta.env.BASE_URL`** — never hardcode `/lattice-atlas`
   in links; use react-router `Link`/`to` which handles it.
5. **Don't commit unrelated in-flight work.** Stage specific paths, not `git add -A`,
   when another agent may have uncommitted changes in the tree.

## Design language (design/design.md is the authority)

- Dark ink-navy palette with semantic accents: cyan `--plaquette`, violet `--star`,
  amber `--magic`, rose `--syndrome`, green `--stabilizer`. Text wears text tokens.
- SVG-first, generative assets; keep any raster media compressed (aim ≤ 300 KB) —
  the whole app currently ships ~1 MB gzipped.
- Respect `useReducedMotion` for any new animation; one heavy effect per section.
- Physics notation in JetBrains Mono pills, no MathJax/KaTeX.

## Current lane split (to avoid collisions)

- **Gemini / Antigravity**: narrative arc (Home hero, tier intro copy), Manim-rendered
  video explainers, generated imagery, sound design.
- **Claude Code**: data layer (`app/src/data/*`), topic drawers (KnowledgeMap/LearningPath
  drawer internals), Surface Code Lab internals (`src/lib/surfaceCode.ts`, worker),
  `scripts/`, CI/deploy.
- Shared files (Home.tsx, LearningPath.tsx page shells): small, focused diffs; commit
  promptly so the other agent can rebase.

## Consolidation status (Claude, 2026-08-07 afternoon)

Done in this pass: the three generated JPGs compressed in place (≈950 KB → ≈230 KB
each — please keep future rasters ≤ 300 KB), and the `no-useless-escape` lint error
in `src/data/index.ts` (URL_RE) fixed in place so your next commit gates clean.

Verified with thanks: UniversalExplainer now uses the precise matchers and the
fabricated fallback is gone; WasmQuantumSandbox is honestly labeled; the
RealQuantumEndpoint rewrite in flight removes the fake verification.

Still open, flagged for whoever gets there first:
1. **TopoLSCompiler**: the Compile button is a staged `setTimeout` — it must be
   framed as a *conceptual walkthrough* of the pipeline (with a link to
   github.com/tqec/TopoLS), never as running the compiler.
2. **Λ direction**: site-wide convention is Λ = ε(d)/ε(d+2), so Λ > 1 means
   suppression (Willow measured Λ ≈ 2.14). Any card claiming "Λ < 1 proves
   suppression" is inverted.
3. **Per-page `<title>`s** are still missing (all routes share one title).
4. **Drawer curation**: TopicLensInsight + Intuition/Misconceptions both render
   in topic drawers — worth merging into one section when things settle.

## Handoff notes (Claude → Gemini, 2026-08-07)

We both built a select-to-explain feature simultaneously; Claude withdrew its
duplicate (`SelectionExplainer`) in favor of your `UniversalExplainer`, which is
live. Two improvements worth making to it, with shared helpers ready to use:

1. **Matching precision**: the current topic match
   (`t.name.includes(query) || query.includes(t.name)`) over-matches long
   selections. `src/data/index.ts` exports `resolveTopic(name)` (alias-aware,
   normalized) and `src/data/glossary.ts` now exports `matchGlossaryTerm(text)`
   (handles plurals and parenthetical aliases). Papers can be matched by
   `arxiv_id` or title via the `papers` export.
2. **Honest fallback**: the unknown-word branch currently asserts every
   selection "is a key concept in TQEC" — misleading for arbitrary words
   (select "browser" and it claims relevance). Prefer an explicit
   "not in the atlas vocabulary" state linking to the glossary.

## Physics correctness

The lattice model has invariant checks (`npm run verify-lattice`, including validation
against real Stim). Content claims should match the shipped data in
`app/src/data/*.json` — check-data catches broken ids, not wrong physics, so review
physics statements carefully.

# Working on Lattice Atlas — agent coordination guide

Multiple AI agents (and humans) work in this repo. Read this before editing.
**Every push to `main` auto-deploys to https://galic1987.github.io/lattice-atlas/ via
`.github/workflows/deploy.yml`** — a broken commit goes live in ~60 seconds.

## Workflow: pull requests only (as of 2026-08-07)

`main` is branch-protected: direct pushes are rejected, and merging requires the
`gates` check (CI: lint + verify-lattice + check-data + build) to pass. Deploys
still happen automatically — on merge to `main`.

```bash
git checkout -b feat/<short-name>     # branch from up-to-date main
# ...work, commit early and often...
git push -u origin feat/<short-name>
gh pr create --fill                   # CI runs automatically
gh pr merge --squash --delete-branch  # once the gates check is green
```

No PR needs a human review approval — green gates are the merge requirement.
Keep PRs small and focused; two agents work here concurrently, and small PRs
rebase cleanly. Never commit another agent's in-flight files into your PR
(stage specific paths).

## Shared machine, separate worktrees (added 2026-08-07)

Both agents run on the same machine. Branches do NOT isolate you locally —
there is one working directory per checkout, and simultaneous edits clobber
each other (this happened repeatedly today). Use a dedicated git worktree:

```bash
git worktree add ../lattice-atlas-<agent> -b <branch> origin/main
ln -s "$(pwd)/app/node_modules" ../lattice-atlas-<agent>/app/node_modules
```

Claude works in `../lattice-atlas-claude`. The main checkout
(`Kimi_Agent_Prerequisite Knowledge Tool`) is Gemini's. Edit only inside
your own worktree; integrate through PRs, never through the other agent's
working directory.

## Open review findings — needs owner (2026-08-07, four-reviewer audit)

A full review (physics / code / security / perf-a11y) ran against main. Claude
fixed everything cleanly in the data lane + Decoder Duel (merged PRs #14, #16).
The items below live in files Gemini has been actively editing, so they're
handed off rather than raced. Ranked by severity; each has a concrete fix. Items 6-9 DONE by Claude (PRs #19, #20). Items 1-5 remain — all in Gemini-owned, actively-edited files (3D components, SurfaceCodeLab, Certificate/ShareableScoreCard); Gemini owns these to avoid clobbering live edits.

1. **HIGH — WebGL GPU leak** `components/SpacetimeView3D.tsx`. The scene-build
   `useEffect` re-runs on every playback step and reallocates a `WebGLRenderer`
   + many geometries/materials; cleanup only calls `renderer.dispose()`.
   Fix: `.dispose()` every geometry/material (or reuse them across renders), and
   `renderer.forceContextLoss()` on unmount. Also gate the RAF loop on
   interaction + `prefers-reduced-motion`, and pause via IntersectionObserver.
2. **HIGH — timer leak** `components/SpacetimeBraidWeaver.tsx:133`. `setInterval`
   created in `togglePlay`, never cleared on pause/unmount. Fix: move it into a
   `useEffect` keyed on `isPlaying` with `clearInterval` cleanup (mirror
   `SurfaceCodeLab.tsx`'s worker/interval pattern).
3. **HIGH — a11y** `pages/SurfaceCodeLab.tsx` lattice qubits are bare
   `<g onClick>`. Give them `role="button"`, `tabIndex`, `aria-label`,
   `onKeyDown` (Enter/Space), and a focus ring — see the pattern just landed in
   `pages/DecoderDuel.tsx` (PR #16).
4. **MEDIUM — name key split**: `Certificate.tsx` uses `lattice-atlas-name`,
   `ShareableScoreCard.tsx` uses `lattice-atlas-user-name`. Same field, two keys.
   Pick one canonical key (suggest `lattice-atlas-name`) in both.
5. **MEDIUM — dead code / unreachable points**: `components/QuantumArcade.tsx` is
   never imported, yet is the only writer of `lattice-atlas-game-scores`, which
   `ShareableScoreCard.tsx` reads for up to 120/1000 points → permanently
   unreachable. Either mount the arcade or drop the arcade-points path.
6. **[DONE — PR #19]** ~~MEDIUM (security) — supply chain~~: removed `plugin-inspect-react-code`
   (dev-only Vite plugin resolving from `npmmirror.com`, thin provenance; the
   `inspectAttr()` in `vite.config.ts`). It's unnecessary. While there, prune the
   ~40 unused scaffold deps in `package.json` (all `@radix-ui/*`,
   `@react-three/*`, `gsap`, `lenis`, `recharts`, `zod`, `vaul`, …) — tree-shaken
   out but bloating install/audit surface.
7. **[DONE — PR #19]** ~~LOW — privacy~~: `Expandable3B1BCard.tsx` now uses `youtube-nocookie.com`  //
   (in-page Google frame). Switch to `youtube-nocookie.com` to honor "no tracking".
8. **[DONE — PR #20]** ~~LOW — contrast~~: `text-low` is now `#7B89A7` (4.87:1).  // old note: `#64708E` ≈ 4.0:1 (below AA
   for small text). `design/design.md` already documents the intended fix to a
   lighter value — apply it to the config.
9. **[PARTIAL — PR #20]** `manualChunks` split done (framer-motion + react vendor out of entry). REMAINING: add `loading="lazy"` to below-fold <img> in Home.tsx / ActChapterCard.tsx / FieldToday.tsx (Gemini-owned). Was: split framer-motion
   (~177KB gzip) out of the entry chunk; add `loading="lazy"` to below-fold
   `<img>` in `Home.tsx`, `ActChapterCard.tsx`, `FieldToday.tsx`.

Verified sound (no action): no tracking (source + bundle clean), no XSS surface,
Three.js correctly code-split to /lab only, all routes lazy, worker bounded,
mobile drawer exemplary, all 52 quiz answers correct.

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

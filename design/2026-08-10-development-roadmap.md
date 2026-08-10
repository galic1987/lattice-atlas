# Lattice Atlas — Development Roadmap (2026-08-10)

Synthesized from a 5-reviewer audit (product/curriculum, tech/performance, UX/a11y,
content/data, media/interactive) of the post-video, post-qLDPC, post-audit-remediation
site. Reviewers converged on four themes: the curriculum and the workbench are two
disconnected products; a staged content lane is ready to merge; several small trust
fixes outrank any new feature; and UX debt concentrates in the workbench.

## Phase 1 — Trust & hygiene (S each, do first)

Nothing here needs design decisions; all of it protects the honesty doctrine.

1. **Manim gallery copy** — Veo-clip "takeaways" claim the clips *demonstrate* results
   ("Demonstrates Λ = 2.14", "immune to local noise", "Achieves O(ε³)"). Attribute to
   the papers, never the clip; drop "immune"; fix the dead default id; add
   check-trust sentinels for "Demonstrates/Achieves" in AI-clip copy.
2. **AI-media category separation** — move `veo-prompt-refiner`, `qft-visualizer`,
   `manim-gallery` out of Simulation/Physics into an explicit "AI Media" category;
   remove or banner-wall the Veo-prompt box inside FtqcResourceEstimatorStudio.
3. **Estimator honesty gaps** — label the pseudo-Stim "illustrative — not executable";
   delete or derive the `lambdaEstimate` heuristic; add both to check-trust.mjs.
4. **Clip-reference CI check** (~30 lines) — every basename in `topicClips.ts` and the
   paper-gallery ids must exist in `public/clips/` (.mp4 + .jpg). Kills silent 404s.
5. **Duplicate intuition drawer** — drop `<Intuition>` from LearningPath.tsx:328
   (TopicLensInsight renders the same string); closes the AGENTS.md drawer-curation item.
6. **Dynamic counts** — "23 papers · 26 topics" is hardcoded in 5+ places; make
   data-driven before Phase 3 changes the numbers. Sweep residual "seminal" stragglers.
7. **Quarantine stale research JSONs** — `tqec/data/*.json` (both repos) and the
   snapshot copies are pre-audit physics; add a superseded banner or delete.
8. **Tool-registry ↔ smoke-suite sync** — `mastery-cert` missing from LAB_TOOLS;
   `experiments/` missing from the mobile-overflow list; assert set equality in CI.

## Phase 2 — Curriculum spine (M each, highest leverage)

The site's best interactives record nothing and nothing links to them.

1. **Wire workbench into the curriculum.** Per-topic "Try it" metadata linking topic
   drawers/path steps to `/lab?tool=<id>` (deep-linking already exists). 4–6 flagship
   tools (code zoo, lattice-surgery composer, magic-state factory, stim-threshold) get
   a short guided task whose completion records evidence (reuse `topic-check` shape).
   Zero new content; converts 25+ sunk-cost tools into assessed curriculum.
2. **Workbench tab semantics + two-way URL** — role=tablist/tab/tabpanel (or
   aria-pressed cheap version), headings out of buttons, `?tab=` written on selection
   (Back/refresh/copy-URL keep the tool). In-repo template: KnowledgeMap tablist.
3. **Mobile workbench launch flow** — scroll/focus + announce the workspace on select;
   collapse the 28-card wall under `sm`.
4. **SuperTLDR hygiene** — h3-in-button → p + aria-expanded; render after the h1
   everywhere (currently before on 8/12 pages); add `/field-today` entry; dedupe
   Glossary's hand-rolled line.
5. **Budget restructure (before the next media PR)** — entry 92% / total-JS 94% /
   video 91% of caps; ~3 clips fit before the wall. Deliberate raise or CDN/poster
   manifest; replace the meaningless 175 KiB lab-shell cap with a per-tool-chunk cap.

## Phase 3 — Content expansion (M each)

1. **Merge the staged 29-paper lane** (`papers_extension.json` 23 + `papers_cultivation.json`
   6 on the Radiator archive). Known blockers, all small: add "design automation era" to
   check-data ERAS + era metadata; 2 aliases (`zx calculus`, `real-time decoding`);
   `joss-tqec` id convention; 58 reading prompts; then gates. **The real cost is a
   physics review of the agent-written prose — do not skip it.** Anchors 2 orphaned
   frontier topics (ZX, real-time decoding) and closes the canon↔tools gap (Stim,
   Sparse Blossom, TopoLS, cultivation). Consider a qLDPC topic + a "cultivation
   variants" topic (plan-v2's promise) — each needs 2 self-checks + insights.
2. **Extend `verified_note` to all 23 papers** — PDFs + extracts already local;
   ~1 verified note per paper; makes the "PDF-verified" claim true for the whole canon.
3. **qLDPC distance proof in CI** — the [[18,4,4]]/[[72,12,6]]/[[144,12,12]] distance
   labels are asserted, not proven (surface code has the real guard; qLDPC doesn't).
   Bounded logical search for the small two; sampling argument or published-result
   citation for the 144. Also a seeded BP Monte-Carlo suppression check.
4. **Close the review loop for skills** — schedule failed topic-check items and weak
   duel rounds into the Review queue (store is already generic).

## Phase 4 — Elective, larger (L; pick deliberately)

- **Tier-5/6 computation capstone** — graded lattice-surgery + magic-state + decoder-choice
  tasks inside the existing studios (the frontier half of the journey currently ends in
  2 MCQs per topic).
- **Nav IA regrouping** — 11 flat entries → Learn / Playground / Reference clusters;
  fix two Label-in-Name violations (Depths, Frontier); lower desktop breakpoint.
- **Goal-driven workbench entry** — 4–6 goal cards ("Decode a syndrome", "Find the
  threshold", "Estimate RSA-2048", "Make media") over the flat catalog.
- **Real Fibonacci braider (S–M)** — explicit F/R matrices, show B₁B₂ ≠ B₂B₁ numerically;
  converts the weakest interactive into a correct one.
- **Composer → real (L)** — full merge/split stabilizer simulation is tqec-scale;
  middle step: generate one real d=3 merge circuit and decode it with the existing engine (M).

## Non-goals for now

- No Lighthouse/RUM harness (flag if mobile perf becomes a goal).
- No Lighthouse-based visual regression (two audits recommended; the bounding-box +
  smoke suite covers the deterministic failures first).
- No new Veo batches for explanation content — prefer Manim (claims carry legitimately
  there); Veo stays ambience-only.

## Suggested sequencing

Phase 1 as one or two small PRs → Phase 2.1 (curriculum wiring) as the flagship PR →
Phase 2.2–2.5 bundled → Phase 3.1 (papers lane, with the physics review) →
Phase 3.2–3.4 → Phase 4 by appetite.

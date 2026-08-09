# Decorative Art Enrichment — Design Spec (2026-08-08)

Goal: enrich the site's visual experience with ~19 nano-banana-generated decorative
images, matched to the existing art style, without breaking any repo rule
(SVG-first for scientific diagrams, rasters decorative-only and ≤ 300 KB,
`asset()` helper, lazy loading below the fold, empty alt).

## Style baseline

Derived from `app/public/hero_quantum_lattice.jpg` and `act4_anyon_braiding.jpg`:

- Dark navy / near-black starfield background (matches `--ink-900`).
- Glowing neon wireframe lattice structures as the subject.
- Accent palette: cyan (`--plaquette`), violet (`--star`), amber (`--magic`),
  rose (`--syndrome`) used sparingly, emerald (`--stabilizer`) where thematic.
- Ethereal particle field, soft bloom, no text, no letters, no UI elements.
- 1600×900-ish output, compressed to ≤ 300 KB JPEG (or WebP where smaller).

Every prompt in the manifest starts from a shared style preamble encoding the above.

## Workflow

1. **Manifest** — `design/asset-manifest.md`: one ready-to-paste prompt per asset
   with target filename, dimensions, palette emphasis, and target page/slot.
2. **Generation (user, Antigravity IDE)** — paste prompts, save outputs into
   `asset-inbox/` (gitignored) using the manifest filenames.
3. **Prep script** — `app/scripts/prepare-images.mjs` (Node + macOS `sips`, no new
   npm deps): resizes to manifest dimensions, compresses to ≤ 300 KB into
   `app/public/`, prints per-asset coverage and failures.
4. **Wiring (agents, per batch)** — wire dropped assets into pages:
   `asset()` helper, `alt=""` + `aria-hidden`, `loading="lazy"` + `decoding="async"`
   below the fold, low-opacity backdrop treatment with scrim so text stays readable.
   Each batch = its own small PR (repo is PR-only; gates must pass).

## Asset set (19)

| # | File | Slot | Size |
|---|------|------|------|
| 1–6 | `tier-1.jpg` … `tier-6.jpg` | Home Journey tier cards | 1200×675 |
| 7–11 | `era-foundations.jpg`, `era-cluster-state.jpg`, `era-defect-surface.jpg`, `era-lattice-surgery.jpg`, `era-experimental.jpg` | Papers timeline era banners | 1600×500 |
| 12–17 | `hero-altitudes.jpg`, `hero-foundations-lab.jpg`, `hero-surface-lab.jpg`, `hero-decoder-duel.jpg`, `hero-review.jpg`, `hero-capstone.jpg` | page heroes | 1600×900 |
| 18 | `fieldtoday-mood.jpg` | FieldToday decorative backdrop (SVG vignettes stay) | 1600×900 |
| 19 | `og-image.png` (regenerate) | social card | 1200×630 |

Subject-matter direction per asset is defined in the manifest (e.g. tier 4 =
wireframe torus wrapped in lattice; lattice-surgery era = two glowing patches
merging along a boundary; decoder duel = two rival light-path networks racing
across a grid). Subjects stay abstract/decorative — never a literal diagram with
scientific claims.

## Guardrails

- No text inside images; no new npm dependencies; no heavy effects added to pages
  (one heavy effect per section rule already holds).
- `check-bundles` raster budget (300 KiB) must pass before any wiring PR merges.
- If a generated image looks like a diagram (grids with implied data), the wiring
  agent rejects it and notes a re-prompt in the manifest.

# Paper Explorer Page — `/papers`

**Purpose**: The 23-paper canon (1998→2026) on a chronological timeline, grouped by era, with plain-English summaries, contribution context, difficulty ratings, prerequisite chips, and arXiv links. Filterable by era, difficulty, and topic.

**URL params**: `?era=<era>` pre-filters (from Home era cards); `#<arxiv_id>` scrolls to and highlights a paper (from Map/Path "unlocks" chips).

---

## Section 1 — Page header (~40vh)

**Layout**: `max-w-7xl`, `pt-32 pb-10`. Background: `era-strip.png` as full-width backdrop at 12% opacity under an `ink-900` scrim (80%), plus dim LatticeCanvas.

- Eyebrow (mono, violet): `// THE CANON`
- H1 (display-lg): `Twenty-three papers, one field.`
- Lead (body-lg, `text-mid`, max-w-2xl): *"From the 1998 lattice code with boundaries to below-threshold quantum hardware — the seminal results of topological quantum error correction in chronological order. Every summary is written in plain English, rated for difficulty, and cross-linked to the prerequisites it assumes."*
- Stat row (mono-sm, gap-6): `23 PAPERS` · `5 ERAS` · `1998 → 2026` · live `N MARKED READ` (violet).

**Animation**: H1 word-level reveal (0.02s stagger); lead block-rise 24px; stat row fades +0.3s; `era-strip.png` slow horizontal drift (translateX -2%→2%, 20s infinite alternate — disabled on reduced motion).

---

## Section 2 — Filter bar (sticky)

**Layout**: Sticky `top-16`, z-30, `ink-900/90 backdrop-blur`, 1px bottom border, `py-3`. `max-w-7xl` flex-wrap gap-3.

- **Era chips** (toggle buttons, rounded-full, body-sm): `All` + five eras (exact data keys in parentheses), each with its era color dot: `Foundations` (cyan, `foundations`) · `Cluster-State Schemes` (sky, `cluster-state schemes`) · `Defect-Based Surface Code` (violet, `defect-based surface code`) · `Lattice Surgery Era` (amber, `lattice surgery era`) · `Experimental Era` (rose, `experimental era`). Multi-select. Active chip: era-color border + 10% tint fill.
- **Difficulty filter**: segmented control `Any · 1–2 · 3 · 4–5` with DifficultyMeter glyphs.
- **Topic filter**: dropdown (shadcn select) listing all 26 topics (grouped by tier); selecting shows only papers listing that topic in prerequisites. Chip appears with X to clear.
- **Search**: text input filtering title/authors/keywords, mono placeholder `search papers…`.
- Right: result count (mono-sm `text-low`): `SHOWING 8 OF 23` + ghost `Clear all`.

**Animation**: Bar contents fade in on load; chips animate active state (background/border 200ms); result count cross-fades on change. Filtered list below animates via Framer Motion `layout` — cards reflow with spring (400/35) rather than hard-jumping.

---

## Section 3 — Timeline (main content)

**Layout**: `max-w-5xl mx-auto`, `py-16`. Central vertical spine (2px, gradient cyan→violet→amber→rose following eras, positioned left-6 on mobile, centered on desktop with alternating card sides ≥1024px). Year markers: large Space Grotesk 700 28px year labels (era-colored) sit on the spine at the first paper of each year (desktop: opposite side from card; mobile: above card).

**Era group headers**: full-width banner rows between eras — era name (h2, era color) + year range (mono) + 1-line era summary (body-sm `text-mid`) + paper count. Left border 4px era color; `ink-850` background.

**Paper cards** = PaperCard (design.md §7.8), alternating left/right of spine on desktop (card width ~460px), full-width stacked on mobile. Each card:
- **Header row**: big year (only if first-of-year, else arXiv id), era dot + era tag (mono-sm), DifficultyMeter right-aligned.
- **Title** (h3, `text-hi`) — full paper title.
- **Authors** (body-sm, `text-low`): first 3 authors + `et al.`; click expands full author list inline.
- **One-sentence summary** (body, `text-mid`, prefixed with a cyan `▸`): the plain-English pitch — use each paper's real `one_sentence` from the data, e.g. the 1998 anchor: *"Extends Kitaev's toric code to lattices with edges and holes, turning a flat 2D chip with boundaries into a topological quantum memory."*
- **Expand toggle** (`Read the breakdown` + ChevronDown, ghost button): expands Contribution and Why-it-matters blocks (body, `text-mid`), each with a mono eyebrow label: `// CONTRIBUTION`, `// WHY IT MATTERS`. Height-auto animation 300ms.
- **Prereq chips**: `ASSUMES:` row of PrereqChips (cyan) linking to `/map?topic=<id>`; chips show green check overlay if user has marked that topic understood — an instant "am I ready?" signal.
- **Footer**: arXiv button (secondary, mono-sm): `arXiv:quant-ph/9707021 ↗` (opens `https://arxiv.org/abs/<id>` new tab) + **Mark as read** toggle (bookmark icon; fills violet when read, stored in localStorage `papersRead`; feeds header stat + Path "papers unlocked" panel).
- **Readiness indicator** (top-right corner ribbon, computed): if ALL prereq topics understood → green mono-sm tag `READY TO READ`; if some → amber `N PREREQS LEFT`. Subtle, 10px mono.

**Deep-linked paper** (`#<arxiv_id>`): on load, card scrolls into center and pulses a violet outline glow (2 pulses, 1.2s).

**Animation**: Spine draws with scroll (GSAP scrub scaleY across section). Cards: desktop alternating slide-in (x ±48px + opacity, 500ms, trigger 20% viewport); mobile slide-up 32px. Year markers count in (opacity + letter-spacing tighten). Era banners: left border draws down (scaleY, 400ms) then content staggers. Expand/collapse: height spring + chevron rotate 180°.

---

## Section 4 — Timeline overview strip (nav aid)

**Layout**: Directly under header (before filters), a horizontal **mini-map** of the whole timeline: `ink-800` rounded-full pill containing 23 dots positioned proportionally by year (1998→2026), dot color = era, dot size = difficulty (1→small, 5→large). Hover a dot → tooltip (title + year). Click → smooth-scrolls to that paper and applies the deep-link pulse. A draggable thumb shows the current viewport position within the timeline (updates on scroll).

**Animation**: Dots pop in sequentially left→right (0.03s stagger, scale spring) on page load; thumb slides with easing on scroll (100ms lerp). Tooltip: fade + 8px rise, 150ms.

---

## Section 5 — Bottom CTA

**Layout**: `max-w-6xl`, centered, `py-20`, braid divider above.
- H2: `Missing the background for a paper?`
- Body (`text-mid`): *"Every prerequisite chip on these cards links back to the knowledge map — learn the topic, mark it understood, and the paper's readiness ribbon updates."*
- Buttons: primary `Open the knowledge map` · ghost `See the guided path`.

**Animation**: block-stagger up 24px, 0.08s, trigger 20% viewport.

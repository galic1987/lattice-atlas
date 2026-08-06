# Glossary Page — `/glossary`

**Purpose**: A searchable, cross-linked reference of key TQEC terms. Fast, dense, keyboard-friendly. Every term links back to related topics (knowledge map) and papers. Supports deep links (`/glossary#stabilizer`) from other pages.

**Data**: `glossary.json` — 28 terms: `{ term, slug, category, short, long, notation (optional), related_terms[], related_topics[], related_papers[] }`. Categories: `code theory` · `topology & anyons` · `computation` · `decoding` · `hardware & experiment`.

---

## Section 1 — Page header (~35vh)

**Layout**: `max-w-6xl`, `pt-32 pb-8`, dim LatticeCanvas behind.
- Eyebrow (mono, cyan): `// REFERENCE`
- H1 (display-lg): `Glossary`
- Lead (body-lg, `text-mid`, max-w-2xl): *"The vocabulary of topological quantum error correction, defined plainly. Terms cross-link to the knowledge map and the paper canon, so a definition is never a dead end."*
- Stat row (mono-sm): `26 TERMS` · `5 CATEGORIES`

**Animation**: H1 + lead block-stagger (24px rise, 0.08s); stat row fades +0.3s.

---

## Section 2 — Search + category bar (sticky)

**Layout**: Sticky `top-16`, z-30, `ink-900/90 backdrop-blur`, border-bottom, `py-3`, `max-w-6xl` flex gap-3 wrap.
- **Search input** (flex-1, min 240px): icon Search, mono placeholder `search terms… ( / to focus )`. Live-filters as you type (matches term, short, long; matched substring highlighted cyan in results). Keyboard `/` focuses input (documented hint kbd-style chip: `/`).
- **Category chips** (toggle, rounded-full body-sm): `All` + five categories, each with a distinct dot color (code theory = cyan, topology & anyons = violet, computation = amber, decoding = rose, hardware & experiment = emerald). Multi-select.
- Right: count (mono-sm `text-low`): `SHOWING n OF 24`.

**Animation**: input focus ring expands (border + glow 200ms); chips toggle 200ms; result count cross-fade.

---

## Section 3 — Alphabet index (jump rail)

**Layout**: Below sticky bar, a horizontal row of letter buttons (mono-sm, `text-low`): only letters that have terms are active (cyan, clickable, smooth-scroll to that letter group); inactive letters at 25% opacity, non-interactive. Row scrolls horizontally on mobile.

**Animation**: active letter pulses once when its group enters the viewport (IntersectionObserver-driven, subtle color brighten).

---

## Section 4 — Term list (main content)

**Layout**: `max-w-6xl`, `py-12`. Terms grouped alphabetically; each letter group has a ghost letter header (Space Grotesk 700 96px, `ink-700` 50%, left margin) followed by its terms.

**Term rows**: full-width, `border-b border-ink-600`, py-6, grid `md:grid-cols-12 gap-6`:
- **Left (col-span-4)**: term name (h3, `text-hi`) with anchor `#slug`; category dot + category label (mono-sm `text-low`); optional notation pill (mono, cyan, e.g. `p_th`, `[[n,k,d]]`, `Λ`) beside the name.
- **Right (col-span-8)**: `short` definition (body, `text-mid`) always visible. Expand chevron (`Definition + links` ghost button) opens: `long` explanation (body, `text-mid`) + three chip rows where data exists:
  - `SEE ALSO:` related term chips (violet, click scrolls to that term with pulse highlight)
  - `LEARN IT:` related topic chips (cyan → `/map?topic=<id>`)
  - `READ IT:` related paper chips (rose-tinted → `/papers#<arxiv_id>`)

**Deep-link behavior**: loading `/glossary#stabilizer` scrolls the term to center, expands it automatically, and pulses a cyan outline (2 pulses, 1.2s).

**Full term list** (28 terms, with notation where applicable — final copy in `glossary.json`; implementers should write 1–2 sentence `short` + 1 paragraph `long` for each):
`ancilla qubit` · `anyon` · `braiding` · `Clifford gate` · `non-Clifford gate` (notation: `T`) · `code distance` (`d`) · `CSS code` · `defect / hole` · `error chain` · `fault tolerance` · `flag qubit` · `hook error` · `lattice surgery` · `logical operator` · `logical qubit` · `magic state` (`|T⟩`) · `measurement-based QC (MBQC)` · `MWPM decoder` · `plaquette` · `real-time decoding` · `rotated surface code` · `space-time diagram` · `stabilizer` · `surface code` · `syndrome` · `threshold theorem` (`p_th ≈ 1%`) · `topological order` · `toric code` · `ZX-calculus`.

**Animation**: Letter groups reveal with 0.05s row stagger (rise 16px + fade, trigger 15% viewport). Ghost letter parallaxes slightly (0.9× scroll). Expand: height-auto 250ms + chevron rotate. Search filtering uses Framer Motion `layout` springs so rows reflow smoothly (400/35).

---

## Section 5 — Cross-links band

**Layout**: `max-w-6xl`, `py-20`, top braid divider, 3-column card row (same style as Home entry-point cards, compact):
1. (icon Map, cyan) `Terms → topics` — *"Every glossary entry links to the topic that teaches it properly."* → `/map`
2. (icon ScrollText, violet) `Terms → papers` — *"See where each concept appears in the 23-paper canon."* → `/papers`
3. (icon Route, emerald) `Learn in order` — *"The guided path introduces terms exactly when you need them."* → `/path`

**Animation**: cards stagger up 24px, 0.1s, trigger 20%; icons draw-in 500ms.

---

## Mobile notes
- Alphabet rail becomes horizontally scrollable.
- Term rows stack: name block above definition; expand chips wrap.
- Sticky bar keeps search input full-width; category chips collapse into a horizontal scroll row beneath.

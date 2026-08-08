# Knowledge Map Page — `/map`

**Purpose**: The interactive prerequisite knowledge tree — 26 topics in 6 tiers. Users explore dependencies, read detailed topic explanations, and mark topics "understood" (localStorage). This is the site's core reference tool.

**Accepts URL param**: `?topic=<id>` → opens that topic's drawer on load (used by PrereqChips site-wide).

---

## Section 1 — Page header (compact hero, ~45vh)

**Layout**: `max-w-7xl mx-auto`, `pt-32 pb-12`. Background: `LatticeCanvas` (decorative) + `anyon-illustration.svg` floated right at 30% opacity on desktop (hidden on mobile), blended with a left-to-right scrim so text stays readable.

- Eyebrow (mono, cyan): `// PREREQUISITE TREE`
- H1 (display-lg): `The Knowledge Map`
- Lead (body-lg, `text-mid`, max-w-2xl): *"Every concept you need before the seminal papers make sense — arranged in six tiers, each building on the last. Click any topic for a full explanation, key points, and curated resources. Mark topics understood as you master them; the map remembers."*
- Header stat row (flex, gap-8, mono-sm): `26 TOPICS` · `6 TIERS` · live `N UNDERSTOOD` (green) · `M REMAINING` (`text-low`).

**Animation**: Eyebrow + H1 + lead block-stagger (24px up, 0.08s, trigger on load). `anyon-illustration.svg` drifts in from right with a slow 6s floating loop (translateY ±8px, ease-in-out infinite). Stat row fades in +0.4s; the `N UNDERSTOOD` number tween-animates when it changes.

---

## Section 2 — Controls bar (sticky)

**Layout**: Sticky below navbar (`top-16`, z-30, `ink-900/90 backdrop-blur`, 1px bottom border). Contents (`max-w-7xl`, flex, gap-3, py-3):
- **View toggle** (segmented control, rounded-full, `ink-800`): `Tree view` | `List view` — animated thumb (Framer Motion `layoutId`).
- **Search input** (icon Search): filters topics by name/keyword, mono placeholder `filter topics…`. Matching topics highlight (border cyan) and non-matches dim to 30%.
- **Legend** (right, desktop): six tier dots + labels (mono-sm, tier colors).
- **Progress reset**: ghost button `Reset progress` (icon RotateCcw) with confirm popover ("Clear all understood marks? This only affects your browser.").

**Animation**: Bar slides down on first scroll past 100px (translateY -8→0 + shadow appears). Toggle thumb springs between segments (stiffness 400, damping 32).

---

## Section 3 — Tree view (default, the map itself)

**Layout**: `max-w-7xl`, horizontal scroll container (overflow-x-auto with custom thin scrollbar, `scroll-behavior: smooth`) holding **6 tier columns** (each min-width 300px, gap-8), arranged left→right as T1→T6. Above each column: tier header (sticky within scroll area): TierBadge + tier name (h3, tier color) + topic count (mono-sm `text-low`).

**Dependency edges**: An SVG overlay (absolute, pointer-events-none, sized to the scroll content) draws **curved bezier edges** from each topic card to its `depends_on` parents in earlier columns. Edge style: 1.5px stroke, `ink-500` at 40% opacity, slight curve. Interactive edge behavior:
- Hover a card → its incoming/outgoing edges brighten to the card's tier color (100% opacity, 2px) and connected cards get a 1px tier-color outline; all other edges dim to 15%.
- Edges animate in on load as draw-on strokes (`stroke-dashoffset` animation, 800ms, staggered by column).
- On `prefers-reduced-motion` or narrow screens, edges render statically (no animation).

**Topic nodes** = TopicCard (design.md §7.7), full list per tier (content for implementation):

- **T1 Math & Physics Foundations** (sky): `linear algebra` · `complex numbers & Dirac notation` · `quantum mechanics basics`
- **T2 Quantum Computing Basics** (cyan): `qubits & Pauli operators` · `quantum gates & circuits`
- **T3 QEC Fundamentals** (emerald): `classical error correction` · `stabilizer formalism` · `quantum codes basics` · `fault tolerance & thresholds`
- **T4 Topological Codes Core** (violet): `topological order & anyons` · `toric code` · `surface code` · `syndrome extraction circuits`
- **T5 Computation & Decoding** (amber): `decoding & MWPM` · `defects & braiding` · `lattice surgery` · `cluster states & MBQC` · `magic states & distillation` · `flag fault-tolerance` · `ZX-calculus basics`
- **T6 Frontier** (rose): `advanced decoding` · `real-time decoding & control` · `magic state cultivation` · `TQEC compilers & automation` · `Clifford+statevector hybrid simulation` · `below-threshold experiments`

**Node interactions**:
- Click card → opens Topic Drawer (Section 5).
- Hover → card lift, edge highlight (above), cursor ripple glow.
- Understood toggle: small circular check button on each card (top-right). Click toggles `understood` in localStorage — check fills green with a spring pop (scale 0.6→1.15→1), card gains subtle green left-glow, and the global progress pill updates. A brief mono tooltip confirms: `marked understood ✓`.
- Keyboard: cards are `<button>`s; arrow keys move between cards in reading order (roving tabindex optional, nice-to-have).

**Understood-by-tier indicator**: thin 3px progress track under each tier header showing fraction understood in that tier (tier color fill, animates width 300ms on change).

**Animation**: On load, columns stagger in from bottom (y +40px, opacity, 0.1s per column, left→right); cards within each column stagger 0.06s. Edges draw after cards land (+0.3s). Scroll hint at right edge (mono `drag / scroll →`) fades out after first horizontal scroll.

---

## Section 4 — List view (alternate)

**Layout**: Same data, accessible vertical disclosure groups by tier. Each tier header row: TierBadge + name + `x/y explored` + chevron. Expanded tiers show full-width topic rows, dependency chips, `Details →`, and separate self-marked exploration versus local check evidence.

**Purpose**: Accessibility + mobile fallback + fast scanning. List view is the default on viewports <768px.

**Animation**: Accordion expand uses height auto-animation (Framer Motion, 250ms, ease-out-expo); rows fade in staggered 0.04s on expand.

---

## Section 5 — Topic Drawer (detail view, shared with Path page)

**Layout**: Drawer component (design.md §7.10), right side, 480px. Content scrolls internally. Structure top→bottom:

1. **Header**: TierBadge + close X. Topic name (h2, `text-hi`). Status line (mono-sm): `Tier 4 of 6 · depends on 3 topics · required by 5 papers`.
2. **Understood toggle** (large, full-width secondary button): `Mark as understood` / state `✓ Understood` (green, click to unmark). Toggle springs with green flash.
3. **Summary**: topic `short` (body-lg, `text-hi` — given prominence).
4. **Deep dive**: topic `detail` paragraph (body, `text-mid`), with inline mono pills for notation.
5. **Key points**: list of 4–6 bullets; each bullet prefixed with a small cyan diamond glyph (◆, echoes plaquette). body, `text-mid`, gap-3.
6. **Dependencies**: section title `BEFORE THIS, UNDERSTAND:` (mono eyebrow) — list of parent topic chips (PrereqChip); each shows its own understood state (green check if done). Clicking swaps drawer content to that topic (drawer internal navigation with back chevron + breadcrumb mono-sm trail, e.g. `surface code ← toric code`).
7. **Unlocks**: `THIS UNLOCKS:` — chips of papers (from papers.json where topic ∈ prerequisites): paper year + short title, violet chips; click → Papers page scrolled to that paper (`/papers#<arxiv_id>`).
8. **Resources**: 1–3 curated references — title (link, cyan), type tag (mono-sm: `TEXTBOOK` / `LECTURE NOTES` / `PAPER` / `VIDEO`), external-link icon. Card-style rows with hover lift.

**Animation**: Drawer slides in spring (300/30); content sections stagger up 16px, 0.05s. Internal topic navigation: current content slides left + fades (200ms), new slides from right (300ms). Backdrop fades 200ms.

---

## Section 6 — Bottom CTA band

**Layout**: `max-w-6xl`, centered text, `py-20`, top braid divider.
- H2: `Rather follow a guided route?`
- Body (`text-mid`): *"The learning path walks these same 26 topics in dependency order — one step at a time, with papers unlocked as you go."*
- Primary button: `Start the guided path →` (`/path`)

**Animation**: Children stagger up 24px on viewport entry (20%), 0.08s stagger. Button has a subtle infinite breathing glow (box-shadow pulse, 3s cycle, cyan 12%↔20%).

# Learning Path Page — `/path`

**Purpose**: A guided, ordered route through all 26 topics in dependency order, with progress tracking. Each step explains the topic (via drawer), lets the learner mark it understood, and shows which papers that step unlocks. Feels like a quest log / course outline.

---

## Section 1 — Page header + progress hero (~50vh)

**Layout**: `max-w-6xl`, `pt-32 pb-12`. Background: `LatticeCanvas` dim + a faint ascending staircase of lattice dots along the right edge (SVG, nodes fill as progress grows).

- Eyebrow (mono, emerald): `// GUIDED ROUTE`
- H1 (display-lg): `The Learning Path`
- Lead (body-lg, `text-mid`, max-w-2xl): *"Twenty-six steps from your first vector space to reading this year's surface-code papers. The path respects dependencies — each step assumes only what came before it. Your progress is saved locally; leave and come back any time."*

**Progress hero block** (below lead, `ink-800` rounded-xl p-8, border `ink-600`, mt-10):
- Left: **circular progress ring** (SVG, 120px): circumference fills cyan→violet gradient by % complete; center shows Space Grotesk 700 32px percentage + mono-sm `OF 26 STEPS`.
- Middle: current status — `NEXT UP:` eyebrow + next unfinished topic name (h3, cyan) + its tier badge + one-line short (body-sm `text-mid`). If path complete: `✓ Path complete — you made it to the frontier.` (green).
- Right: stats column (mono-sm, gap-2): `STEPS DONE n/26` · `PAPERS UNLOCKED m/23` · `CURRENT TIER T#`.
- CTA row: Primary `Continue where you left off →` (scrolls to current step) + ghost `Restart path` (confirm popover).

**Animation**: Ring draws on load (stroke-dashoffset 0→target, 1.4s, ease-out, 0.3s delay); percentage counts up in sync. Block rises 32px + fade (500ms). On step completion anywhere on page, ring animates to new value and emits a one-time particle burst (6 small cyan dots radiating, 600ms — cap: only if ring on screen).

---

## Section 2 — The path (vertical timeline of 26 steps)

**Layout**: `max-w-4xl mx-auto`, `py-16`. A vertical spine (2px, `ink-500`) runs down the left (24px from left edge; centered behind node markers), tier-colored segment-by-segment (spine gradient stops at tier boundaries). Steps are grouped under **6 tier section headers**.

**Tier section headers** (sticky-ish, py-6): TierBadge + tier name (h2, tier color) + tier progress (`x/y` mono-sm) + thin tier-colored underline that draws in on entry.

**Step rows**: Each step = node marker + card.
- **Node marker**: 28px circle on the spine. States:
  - `done`: filled green, white check icon.
  - `current` (next unfinished): cyan, pulsing ring animation (1.5s infinite, ring scale 1→1.6 fade).
  - `upcoming`: hollow, `ink-500` border.
- **Step card** (ml-12, `ink-800`, rounded-xl, border `ink-600`, p-6, mb-6): grid layout:
  - Left/main: step number (mono-sm `text-low`: `STEP 07`) + topic name (h3) + short description (body, `text-mid`) + dependency line (mono-sm: `needs: stabilizer formalism, quantum codes basics` — each dependency is a mini-chip showing green check if understood).
  - Right rail (200px, desktop): **"Unlocks"** mini-list — up to 3 paper chips (violet, year + short title) that this topic unlocks per papers.json; `+2 more` expands inline. Below: estimated effort tag (mono-sm, e.g. `~1 evening`, `~1 week` — static curated values in topics.json).
  - Footer row: `Read the topic →` (ghost, opens Topic Drawer — same drawer component as Map page, §5 of knowledge-map.md) + understood toggle button (`Mark understood` / `✓ Understood`, springs green on toggle).
- **Locked affordance**: None — path is suggestive, not gated (any step can be marked). But steps whose dependencies are incomplete show a subtle amber hint line (mono-sm): `heads-up: 2 prerequisites above aren't marked understood yet`.

**Tier transition moments**: Between tier groups, a full-width interstitial card (`ink-850`, dashed tier-color border) announces: `MILESTONE — You've finished Tier 3. You can now read the threshold-theorem papers with understanding.` + chips of the 2–3 papers unlocked at that tier boundary + link `/papers?era=…`. Shows even if incomplete (as a preview of what's coming, dimmed with `upcoming` styling).

**Animation**: Framer Motion reveals nodes/cards in viewport and updates completion state. Reduced-motion users receive final states without offscreen transforms. Completion feedback is brief and nonessential.

**Mobile**: spine at 12px, cards full-width, right rail stacks below main content.

---

## Section 3 — Papers progress sidebar (desktop) / section (mobile)

**Desktop**: fixed mini-panel bottom-right (above footer zone, `ink-800`, rounded-xl, p-4, w-64, collapsible to a pill): `PAPERS UNLOCKED` eyebrow + count `m/23` + horizontal stacked bar (violet segments per era) + list of the 3 most recently unlocked papers (mono-sm, truncated, link → `/papers#<id>`). Collapse toggle persists in localStorage.

**Mobile**: rendered as a normal section at page bottom instead (same content, full width).

**Animation**: Panel slides up + fades on scroll past 40% of page; bar segments animate width on each new unlock (300ms ease-out). New unlocks trigger a temporary `NEW` amber tag that fades after 5s.

---

## Section 4 — Completion state (rendered when 26/26)

Replaces Section 1 status and pins to top of path: celebratory band — H2 `You've climbed the whole tree.`, body: *"Every prerequisite understood. The 23-paper canon and today's research frontier are fully unlocked. Go read the field's latest results like an insider."* + three buttons: `Browse the papers` (violet secondary), `Visit the frontier` (primary), `Review the glossary` (ghost). Decorative: braid-divider + subtle confetti of 12 cyan/violet/rose lattice dots falling once (Framer Motion, physics-y gravity, 1.5s, only once per session).

**Animation**: Band reveals with scale 0.96→1 + fade; buttons stagger 0.08s.

# Home Page — `/`

**Purpose**: Explain what TQEC is in one screen, sell the learning journey, and route users to the four main tools (Map, Path, Papers, Field Today). Sets the visual tone: dark observatory, lattice motifs, cyan/violet duality.

**Scroll length**: ~6 sections, long-form storytelling with one GSAP pinned sequence.

---

## Section 1 — Hero (100vh, sticky-feeling)

**Layout**: Full viewport height. Background: Three.js scene (React Three Fiber) — a slowly rotating **wireframe torus** (torus geometry, `0.4` radial tilt, rotation ~0.05 rad/s on Y, subtle 0.02 wobble on X) wrapped in a lattice: points placed on the torus surface in a grid (cyan and violet points alternating like X/Z stabilizers), with 2–3 points at a time emitting a soft rose "syndrome flash" (sprite scale + opacity pulse, 1.4s cycle). Deep fog fade to `ink-900`. Fallback: `hero-torus-fallback.png` poster (WebGL unavailable / reduced-motion / mobile low-power). A dim `lattice-texture.svg` overlays the whole hero at 20% opacity. Gradient scrim at bottom (`ink-900` 0%→100%) blends into next section.

**Content** (left-aligned, `max-w-6xl`, vertically centered, z-index above canvas):
- Eyebrow (mono, cyan): `// A LEARNING COMPANION FOR QUANTUM ERROR CORRECTION`
- Headline (display-xl, Space Grotesk 700, white):
  Line 1: `Quantum information,`
  Line 2: `woven into topology.` — "topology." rendered in a cyan→violet gradient.
- Subhead (body-lg, `text-mid`, max-w-xl): *"Topological Quantum Error Correction protects fragile quantum states by encoding them into the global properties of qubit lattices. This is your guided path from the prerequisites to the research frontier — 26 topics, 23 seminal papers, one map."*
- CTA row (gap-4):
  - Primary button: `Start the learning path →` (links `/path`)
  - Secondary button: `Explore the knowledge map` (links `/map`)
- Bottom-right, mono-sm `text-low` (fades in last): `23 papers · 26 topics · 6 tiers · 1998 → 2026`

**Animation**:
- Load sequence: eyebrow fades in (300ms) → headline lines slide up 40px + opacity, character-split per line (SplitText-style, 0.02s char stagger, 700ms) → subhead word-level reveal (0.01s word stagger) → CTAs scale 0.95→1 + fade (400ms, stagger 100ms) → stat line fades (300ms, +200ms delay).
- Torus: continuous slow rotation; on mouse move, camera parallax ±2° (lerped).
- Scroll: hero content parallaxes up at 0.5× scroll speed and fades out by 60% scroll of the section (GSAP ScrollTrigger). Torus scales 1→1.08 and dims 30%.

---

## Section 2 — What is TQEC? (the pitch, 2-column)

**Layout**: `max-w-6xl`, grid `md:grid-cols-2 gap-12`, vertically centered, `py-28`. `braid-divider.svg` sits above the section as a separator.

- **Left column**:
  - Eyebrow: `// THE IDEA`
  - H1: `Errors are local. Topology is global.`
  - Three body paragraphs (body, `text-mid`):
    1. *"Qubits decohere constantly — stray interactions flip them, phase them, leak them. A quantum computer that can't correct errors is a very expensive random number generator."*
    2. *"Topological quantum error correction fights back with geometry. Information is encoded non-locally — spread across a lattice of physical qubits so that no single local error can destroy it. The logical qubit lives in the topology of the lattice, the way a hole in a torus can't be removed by a small deformation."*
    3. *"The surface code — the workhorse of the field — needs only nearest-neighbor interactions on a 2D grid and tolerates error rates near" + mono pill `p_th ≈ 1%` + ", which is why Google, IBM, and dozens of startups are betting on it."*
  - Inline mono pills used for notation: `[[n, k, d]]`, `d = 3`, `X ⊗ Z`.
- **Right column**: `surface-code-diagram.svg` in an `ink-800` rounded-xl frame with 1px border and a mono-sm caption below: *"A distance-3 rotated surface code. Data qubits (circles), stabilizer plaquettes (cyan/violet), and an error chain (rose)."* On hover, the diagram's error chain gently pulses (CSS animation on SVG, rose glow, 2s cycle).

**Animation**: Left column children stagger up 24px, 0.08s stagger, trigger at 20% viewport. Diagram slides in from right 40px + fade (600ms), slight `rotate(0.5deg)`→0. Caption fades in +300ms delay.

---

## Section 3 — Stats band

**Layout**: Full-width band, `ink-850` background with `lattice-texture.svg` at 15% opacity, top+bottom 1px borders. Inside `max-w-6xl`: 4-column grid (`grid-cols-2 md:grid-cols-4`), each a Stat component (design.md §7.12):
- `26` — PREREQUISITE TOPICS (cyan)
- `23` — SEMINAL PAPERS (violet)
- `6` — KNOWLEDGE TIERS (emerald)
- `28` — YEARS OF RESEARCH (amber), with mono-sm sub-line `1998 → 2026`

**Animation**: Numbers count up 0→value on viewport entry (1.2s, ease-out, stagger 0.15s per stat); labels fade in +0.3s. Band itself reveals with a 1px cyan line that draws left→right across the top border (scaleX 0→1, 800ms).

---

## Section 4 — The Journey (GSAP pinned scroll story) ★ signature section

**Layout**: Section height `300vh`; inner viewport pinned for the middle 200vh (ScrollTrigger pin). Content is a horizontal-feeling progression through **6 tier cards** that translate in from the right as scroll advances — a "climbing the tree" moment. Background: `ink-900` with a large, very dim vertical ladder of lattice dots down the left edge (nodes light up tier-color as you pass each tier).

- Pinned header (top-left): eyebrow `// THE JOURNEY` + H1 `Six tiers from linear algebra to the frontier.`
- Each tier card (520px wide, `ink-800`, tier-colored left border 4px):
  - Tier badge + mono-sm tier index `TIER 1/6`
  - Tier name (h2, tier color): e.g. `Math & Physics Foundations`
  - One-line description (body, `text-mid`): e.g. *"Vectors, complex amplitudes, and the language of quantum states."*
  - Topic list (mono-sm, `text-low`): e.g. `linear algebra · complex numbers & Dirac notation · quantum mechanics basics`
  - Papers unlocked hint: `→ unlocks the 1998 toric code paper` (cyan, body-sm)

**Tier content** (short names for the cards):
1. **T1 Math & Physics Foundations** — linear algebra · complex numbers & Dirac notation · QM basics — *unlocks the 1998 toric code paper*
2. **T2 Quantum Computing Basics** — qubits & Pauli operators · gates & circuits — *unlocks stabilizer language*
3. **T3 QEC Fundamentals** — classical codes · stabilizer formalism · quantum codes · fault tolerance & thresholds — *unlocks the threshold theorem era*
4. **T4 Topological Codes Core** — topological order & anyons · toric code · surface code · syndrome extraction — *unlocks the 2D lattice papers*
5. **T5 Computation & Decoding** — MWPM decoding · defects & braiding · lattice surgery · cluster states/MBQC · magic states · flag FT · ZX-calculus — *unlocks the architecture era*
6. **T6 Frontier** — advanced & real-time decoding · magic state cultivation · compilers · hybrid simulation · below-threshold experiments — *unlocks today's research news*

**Animation**: GSAP ScrollTrigger with `pin: true`, `scrub: 0.5`. Scroll progress drives: cards translateX from +120vw to 0 sequentially (each card gets ~1/6 of pin distance), previous card shifts left -30% and dims to 35% opacity (depth stack). Left ladder nodes fill tier-color as their card is active. On unpin, final card (T6) remains centered and a CTA fades in below: `See the full map →` (secondary button → `/map`).

**Mobile**: pinning disabled; tiers render as a vertical stack of cards with standard stagger reveals.

---

## Section 5 — The Canon (era overview)

**Layout**: `max-w-6xl`, `py-28`. Eyebrow `// THE CANON`, H1 `Twenty-three papers that built a field.`, lead paragraph (body-lg, `text-mid`, max-w-2xl): *"From Bravyi & Kitaev's 1998 planar lattice code to below-threshold hardware experiments and the latest surface-code circuits, these are the papers every TQEC researcher has read. Each comes with a plain-English summary and a list of the prerequisites you'll need."*

Below: a horizontal scroll-snap strip (overflow-x-auto, snap-x) of **5 era cards** (each 320px, `ink-800`, era-tinted top border):
1. **Foundations** (1998–2001, cyan) — toric-code memory and the planar code with boundaries. `2 papers`
2. **Cluster-State Schemes** (2005–2008, sky) — 3D cluster states and measurement-based routes to fault tolerance. `4 papers`
3. **Defect-Based Surface Code** (2008–2013, violet) — braiding defects and holes; the 2D lattice becomes practical; matching decoders and thresholds. `9 papers`
4. **Lattice Surgery Era** (2011–2019, amber) — merges, splits, twists, compact logical gates, and magic-state factories. `4 papers`
5. **Experimental Era** (2014→2026, rose) — superconducting-qubit proposals, below-threshold hardware, and the latest syndrome-extraction circuits. `4 papers`

Each card: era name (h3, era color), year range (mono), 1-line description, paper count, mini list of its 2–3 landmark paper titles (body-sm, truncated). Click card → `/papers?era=<era>` (Papers page pre-filtered).

**Animation**: Strip container fades in; cards stagger in from right (x +60px, opacity, 0.1s stagger, trigger 20% viewport). Scroll-snap strip has a subtle "scroll →" hint (mono-sm `text-low`, animated arrow nudge loop) on desktop; on hover, cards lift -4px with era-color glow. `era-strip.png` as a very dim backdrop behind the strip (10% opacity, absolute, covered by scrim).

---

## Section 6 — Entry points (routing cards)

**Layout**: `max-w-6xl`, `py-28`, eyebrow `// START HERE`, H1 `Choose your route.` Grid `md:grid-cols-2 xl:grid-cols-4 gap-6` of four tall routing cards (each `ink-800`, rounded-xl, p-8, hover lift):

1. **The Map** (icon: Map, cyan) — *"See the whole prerequisite tree. Click any topic for explanations, key points, and resources."* Footer link: `Explore the map →`
2. **The Path** (icon: Route, emerald) — *"A guided, ordered walk through every topic with progress tracking and papers unlocked at each step."* — `Follow the path →`
3. **The Papers** (icon: ScrollText, violet) — *"The 23-paper canon on a chronological timeline, with plain-English summaries and difficulty ratings."* — `Browse the timeline →`
4. **The Frontier** (icon: Telescope, amber) — *"What's happening now: magic-state cultivation, TQEC compilers, real-time decoding, and below-threshold experiments."* — `Visit the frontier →`

Each card shows a tiny live stat in mono-sm if progress exists: e.g. Map card shows `7/26 understood`, Path card `Step 9 of 26`.

**Animation**: Cards stagger up 32px, 0.1s stagger; icons draw in (SVG path animation, 500ms); footer links slide underline on hover. Section closes with `braid-divider.svg` then Footer.

**Animation (section)**: header children block-reveal; strip parallax background at 0.8× scroll speed.

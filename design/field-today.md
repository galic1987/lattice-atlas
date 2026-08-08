# Field Today Page — `/field-today`

**Purpose**: "Where the field is right now" — the current research frontier of TQEC and its design-automation community: magic state cultivation, compilers & tooling, simulation, real-time decoding, flag fault-tolerance, and below-threshold experiments. This page is the reward for finishing the path — it reads like an insider briefing. More editorial/scrollytelling than the tool pages.

**Content type**: Rich editorial (curated prose in a `frontier.json` or inline constants; cross-links to T6 topics and experimental-era papers).

---

## Section 1 — Hero (~70vh)

**Layout**: Full-width, decorative `frontier-hero.svg` as background (darkened under an `ink-900` scrim and bottom gradient). Content `max-w-6xl`, vertically centered.

- Eyebrow (mono, amber): `// THE FIELD TODAY — 2024 → 2026`
- H1 (display-lg): `The frontier is a factory.` — "factory." in amber→rose gradient.
- Lead (body-lg, `text-mid`, max-w-2xl): *"Topological error correction has crossed from theory into engineering. The questions are no longer 'does it work?' but 'how fast can we decode it, how cheaply can we distill magic states, and how automatically can we compile a whole algorithm onto a lattice?' This is what researchers and tool-builders are working on right now."*
- Small nav row (mono-sm chips, anchor links to sections): `magic states` · `compilers` · `simulation` · `decoding` · `flag FT` · `experiments`

**Animation**: Background image slow Ken Burns (scale 1→1.06, 25s, alternate). H1 word-reveal (0.03s stagger, y 30px); lead block-rise; anchor chips stagger 0.06s with amber underline-slide on hover.

---

## Section 2 — The big picture (state of the field)

**Layout**: `max-w-6xl`, `py-24`, two-column (`md:grid-cols-5`, text col-span-3, sidebar col-span-2).

**Main column** — three editorial paragraphs (body, `text-mid`, drop-cap on first paragraph — first letter Space Grotesk 700 64px amber, floated):
1. *"Google's 2024 below-threshold result changed the conversation: for the first time, a larger surface code demonstrably outperformed a smaller one on real hardware, with logical error rates falling as distance grew. Error correction is now compounding like an engineering technology, not a physics bet."*
2. *"The bottleneck now spans the stack. Below-threshold memory scaling is a major milestone, while fidelity, overhead, control, logical operations, non-Clifford resources, routing, and real-time decoding remain open engineering constraints."*
3. *"Around this has grown a design-automation ecosystem: compilers that turn quantum algorithms into lattice-surgery instructions, simulators that verify fault-tolerant circuits exactly over billions of shots, and layout tools that make space-time diagrams something you can draw, optimize, and debug."*

**Sidebar** — `ink-800` rounded-xl p-6 "signal board" (sticky, top-24): mono eyebrow `// SIGNALS`, 4 rows of label + amber/violet value (mono-sm), each with a 1-line explainer (body-sm `text-low`):
- `THRESHOLD` — `p_th ≈ 1%` — *physical error rate the surface code tolerates*
- `STATUS` — `below threshold (2024)` — *logical error ↓ as code distance ↑*
- `HOTTEST PROBLEM` — `magic states` — *the non-Clifford bottleneck*
- `NEW FRONTIER` — `compilation & real-time decoding`

**Animation**: Paragraphs block-reveal (24px rise, 0.1s stagger, 20% trigger). Sidebar slides from right 40px + fade; signal rows stagger 0.08s; values glow amber on hover (text-shadow pulse).

---

## Section 3 — Frontier themes (the heart: 5 deep-dive blocks)

**Layout**: `max-w-6xl`, five alternating two-column blocks (`md:grid-cols-2 gap-16`, `py-20` each, braid divider between). Numbering in huge ghost numerals (Space Grotesk 700, 160px, `ink-700` at 40%, absolute behind content, `-ml-6 -mt-10`).

### Block 01 — Magic State Cultivation (amber accent)
- Eyebrow `// THE BOTTLENECK`, H2 `Growing T gates in a Clifford world.`
- Body: *"Many surface-code architectures implement logical Clifford effects with tracking, deformation, or surgery, while non-Clifford T operations commonly consume injected |A⟩ = T|+⟩ resources. Factory cost is architecture- and target-dependent. Cultivation is a postselected injection/check/grow/escape proposal whose reported advantage is scoped to specified simulations and baselines."*
- Key-point list (cyan ◆ bullets): `why non-Clifford gates need magic states` · `distillation → cultivation: the overhead collapse` · `cultivation as the current highest-leverage research problem`.
- Cross-links: chip → T6 topic `Magic State Cultivation & Injection Advances` (`/map?topic=…`) · chip → 2018 paper *"Efficient magic state factories…"* (`/papers#1812.01238`).

### Block 02 — Compilers & Design Automation (violet accent)
- Eyebrow `// THE TOOLCHAIN`, H2 `From algorithm to lattice, automatically.`
- Body: *"A surface-code computation is a 3D space-time object — tubes and blocks of lattice surgery weaving through time. A new compiler ecosystem builds these objects automatically: TopoLS translates ZX-calculus diagrams into lattice-surgery space-time layouts; pathfinding tools (in the Topologiq / qelebrimbor lineage) route block-graphs through space; visual layout environments (SketchUp-style editors) let designers draw and inspect constructions by hand."*
- Key points: `ZX-calculus → lattice surgery compilation` · `space-time block-graph pathfinding` · `visual, debuggable layout tools`.
- Cross-links: T6 topic `TQEC Design Automation & Compilers` · T5 topic `ZX-Calculus Basics`.

### Block 03 — Simulation at Scale (cyan accent)
- Eyebrow `// TRUST BUT VERIFY`, H2 `Simulating the uncorrectable, exactly.`
- Body: *"How do you validate a fault-tolerant circuit before hardware exists? Clifford simulators are fast but blind to non-Clifford physics. Hybrid simulators like Clifft carry a Clifford frame and factorize the residual statevector, reaching exact results over billions of shots for circuits that brute-force statevector methods could never touch."*
- Key points: `stabilizer simulation vs statevector limits` · `Clifford-frame + factorization trick` · `verification workflow for new code constructions`.
- Cross-links: T6 topic `Classical Simulation of QEC: Clifford & Hybrid Methods`.

### Block 04 — Real-Time Decoding & Flag Fault-Tolerance (rose accent)
- Eyebrow `// THE CLOCK`, H2 `Decoding faster than the noise.`
- Body: *"Real-time control needs both enough average throughput and decisions before the operations that consume them. At fixed arrival and service rates, a persistent rate deficit grows queue backlog approximately linearly in time; latency deadlines are a separate constraint. Flag circuits can expose particular correlated faults, but their guarantees depend on the code, circuit, schedule, and decoder."*
- Key points: `latency vs decoherence race` · `streaming/hierarchical real-time decoders` · `flag qubits: cheap fault-tolerance for small codes`.
- Cross-links: T6 topics `Real-Time Decoding & Classical Control`, `Advanced Decoders` · T5 topic `Flag Fault-Tolerant Syndrome Extraction` · paper *"Towards practical classical processing for the surface code"* (`/papers#1110.5133`).

### Block 05 — Below-Threshold Experiments (emerald accent)
- Eyebrow `// THE HARDWARE`, H2 `Error correction that compounds.`
- Body: *"The experimental era's defining plot: logical error rate vs code distance, bending downward. Google's 2024 below-threshold demonstration on superconducting hardware showed distance-7 beating distance-5 beating distance-3 — the scaling signature the field has chased since 1998. The roadmap question is now 'how many qubits to factoring-scale machines?'"*
- Key points: `Λ (lambda): εd/εd+2 for the stated task and decoder` · `memory scaling is not universal logical-gate validation` · `resource roadmaps require explicit architecture and error-budget assumptions`.
- Cross-links: T6 topic `Below-Threshold Experiments…` · papers 2022 (`/papers#2207.06431`) + 2024 (`/papers#2408.13687`).

**Block layout details**: text column (eyebrow, h2, body paragraphs, key-point list, cross-link chip row) + visual column — each block gets a thematic **SVG vignette** (custom, inline, no asset generation needed):
- 01: a small glowing amber diamond (magic state) growing inside a dim lattice cell, concentric ring pulse (CSS 2.5s loop).
- 02: a ZX-style graph (green/red nodes — muted to cyan/violet) morphing into stacked space-time tubes (SVG dash draw-on, scroll-triggered).
- 03: a branching factorization tree splitting a large tensor into small factors (nodes pop-in staggered).
- 04: a scrolling strip-chart: syndrome dots arriving, decoder line chasing them, latency gap highlighted rose.
- 05: a simple descending line chart (SVG) — logical error vs distance 3→5→7, points labeled `d=3 d=5 d=7`, line draws on scroll.
Each vignette lives in an `ink-800` rounded-xl frame with mono-sm caption. All are hand-authored inline SVG (listed as such, not image assets).

**Animation** (per block): ghost numeral parallaxes at 0.6× scroll speed; text column staggers (eyebrow → h2 → body → bullets 0.07s); vignette frame scales 0.96→1 + fade; SVG internals animate on 30% viewport entry (draw-on strokes 1s, node pops 0.05s stagger). Alternating blocks mirror columns; mobile stacks text over visual.

---

## Section 4 — “How to read the frontier”

**Layout**: Responsive native-flow cards teach the jargon phrases that unlock frontier news. Each shows the term, scoped definition, related T6 chip, and evidence boundary; no scroll hijacking.

Terms: `magic state` (amber) — *the distilled resource that powers non-Clifford T gates* · `lattice surgery` (violet) — *merging and splitting code patches to perform logical gates* · `space-time diagram` (cyan) — *the 3D blueprint of a fault-tolerant computation* · `real-time decoding` (rose) — *correcting syndromes as fast as the hardware produces them* · `flag qubit` (emerald) — *a sentinel ancilla that catches correlated hook errors*. Each term chip links to `/glossary#<slug>`.

**Animation**: short in-view cross-fades on desktop; a static stacked list on mobile and under reduced motion.

---

## Section 5 — Reading list: the frontier shelf

**Layout**: `max-w-6xl`, `py-24`. Eyebrow `// KEEP READING`, H2 `Papers of the experimental era.` Horizontal scroll-snap row of the 4 experimental-era PaperCards (2014, 2022, 2024, 2026 — reused PaperCard component, era=rose) + a terminal "capstone card" linking to `/papers?era=experimental era` (`See all experimental-era papers →`, dashed rose border, centered arrow icon).

**Animation**: cards stagger in from right (x +60, 0.1s stagger); capstone card arrow nudges right on hover loop (translateX 0→6px, 800ms alternate).

---

## Section 6 — Closing CTA

**Layout**: centered `max-w-3xl`, `py-24`, braid divider above. H2 `Ready to understand all of it?` Body (`text-mid`): *"Everything on this page traces back through the knowledge tree. Climb it step by step and the frontier stops being jargon."* Buttons: primary `Start the learning path` · secondary `Open the knowledge map`. If user progress = 26/26, swap headline to `You've already climbed the tree — stay curious.` and primary becomes `Revisit the papers`.

**Animation**: block-stagger 24px rise, 0.08s; buttons breathing glow (cyan, 3s).

# Lattice Atlas — Global Design Document

**Project**: Lattice Atlas — An Interactive Learning Companion for Topological Quantum Error Correction (TQEC)
**Type**: Educational study tool / interactive knowledge companion (multi-page React SPA)
**Audience**: Technically-minded learners — programmers, engineers, physics-curious readers — who want a structured route from "basic linear algebra" to reading 2024–2026 surface-code research papers.
**Tone**: Educational, encouraging, precise. Content clarity over marketing. Dense information presented cleanly, with a sense of wonder appropriate to the subject.

---

## 1. Concept & Visual Direction

The visual identity is built from the subject itself: **the surface code lattice**. Every visual motif derives from the physics:

- **The lattice**: grids of dots (data qubits) connected by edges, with alternating plaquettes — used as background textures, section dividers, and the hero centerpiece.
- **Plaquette/star duality**: In the surface code, X-stabilizers (stars/vertices) and Z-stabilizers (plaquettes) form a checkerboard. We map this duality onto the two primary accent colors — **cyan (plaquette/Z)** and **violet (star/X)**. Whenever two complementary ideas appear (prereq ↔ paper, theory ↔ experiment), they are colored cyan/violet.
- **Syndrome flashes**: A stabilizer measurement that detects an error "lights up". We use this as a micro-interaction language: hover states make lattice nodes glow; errors/highlights use rose.
- **Braiding trails**: Anyon world-lines drawn as smooth curving paths — used as SVG decoration, timeline spine, and page-transition flourishes.
- **Topology**: Closed loops, boundaries, and homology appear in explanatory diagrams. The Home hero stays abstract and decorative so it is never mistaken for a code geometry.

**Mood**: A dark observatory / chalkboard-of-the-future. Deep ink-navy background, luminous accents, generous negative space, monospace annotations like researcher marginalia. Feels like a beautifully crafted interactive textbook, not a startup landing page.

**Anti-goals**: No generic purple-gradient SaaS look, no stock photos of people, no glassmorphism overload, no marketing copy. Every decorative element must trace back to lattice/anyon/torus motifs.

---

## 2. Color Palette

### Base
| Token | Hex | Usage |
|---|---|---|
| `--ink-950` | `#05080F` | Deepest background (page root, footer) |
| `--ink-900` | `#0A0F1C` | Primary page background |
| `--ink-850` | `#0E1526` | Raised section background |
| `--ink-800` | `#121B31` | Card background |
| `--ink-700` | `#1B2743` | Card hover / elevated surface |
| `--ink-600` | `#2A3A5F` | Borders (subtle), dividers |
| `--ink-500` | `#3D5178` | Borders (emphasis), inactive tracks |

### Text
| Token | Hex | Usage |
|---|---|---|
| `--text-hi` | `#EAF0FB` | Headings, primary text |
| `--text-mid` | `#A9B4CC` | Body text, descriptions |
| `--text-low` | `#7B89A7` | Captions, metadata, placeholders (4.87:1 on `ink-800`) |

### Accents (semantic — tied to physics)
| Token | Hex | Meaning / Usage |
|---|---|---|
| `--plaquette` (cyan) | `#22D3EE` | Primary accent. Z-plaquettes, links, primary CTAs, knowledge-map nodes, progress fill |
| `--star` (violet) | `#9B7BFA` | Secondary accent. X-stars, papers, timeline markers, complementary highlights; readable as normal text on dark cards |
| `--magic` (amber) | `#F5B83D` | Frontier content, magic states, "field today", warnings, difficulty peaks |
| `--syndrome` (rose) | `#FB7185` | Errors, syndrome flashes, destructive states, "not yet understood" markers |
| `--stabilizer` (green) | `#34D399` | Success, "understood" checkmarks, completed progress |

### Tier color scale (knowledge map, 6 tiers — used as left-border / chip tint everywhere tiers appear)
1. Tier 1 Foundations — `#38BDF8` (sky)
2. Tier 2 QC Basics — `#22D3EE` (cyan)
3. Tier 3 QEC Fundamentals — `#34D399` (emerald)
4. Tier 4 Topological Core — `#A78BFA` (violet)
5. Tier 5 Computation & Decoding — `#F5B83D` (amber)
6. Tier 6 Frontier — `#FB7185` (rose)

Colors progress cool→warm as you climb the tree, evoking "ascending into deeper water / hotter research".

### Functional pairings
- Cyan on ink-900: primary interactive. Violet: secondary interactive. Never use amber/rose/green for plain links.
- Tier chips: tier color at 14% opacity background + tier color text + 1px border at 35% opacity.
- Focus rings: 2px `--plaquette` with 2px offset.

---

## 3. Typography

Google Fonts, three families:

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / headings | **Space Grotesk** | 500, 600, 700 | Geometric with character; slight sci-technical flavor. `letter-spacing: -0.02em` on large sizes |
| Body / UI | **Inter** | 400, 500, 600 | Workhorse. `font-feature-settings: "cv11", "ss01"` for cleaner readability |
| Mono / technical | **JetBrains Mono** | 400, 500, 700 | arXiv IDs, math notation (e.g. `⟨ψ| = α⟨0| + β⟨1|`), code labels, timestamps, stats, nav eyebrows |

### Scale (desktop → mobile)
| Token | Size (d/m) | Weight | Line-height | Usage |
|---|---|---|---|---|
| `display-xl` | 72px / 42px | SG 700 | 1.02 | Hero headline |
| `display-lg` | 56px / 36px | SG 700 | 1.05 | Page titles |
| `h1` | 44px / 32px | SG 600 | 1.1 | Section titles |
| `h2` | 32px / 26px | SG 600 | 1.15 | Sub-sections, card group titles |
| `h3` | 22px / 20px | SG 600 | 1.25 | Card titles, topic names |
| `eyebrow` | 12px | JB Mono 500 | 1.4, `letter-spacing: 0.18em`, uppercase | Section labels, e.g. `// PREREQUISITE TREE` |
| `body-lg` | 18px / 17px | Inter 400 | 1.7 | Lead paragraphs |
| `body` | 16px / 15px | Inter 400 | 1.7 | Default body |
| `body-sm` | 14px | Inter 400 | 1.6 | Card metadata, chips |
| `mono-sm` | 13px | JB Mono 400 | 1.5 | arXiv IDs, formula snippets, tags |

### Math/physics inline styling
Physics notation (e.g. `X ⊗ Z ⊗ I`, `[[n, k, d]]`, `p_th ≈ 1%`) always in JetBrains Mono, colored `--plaquette` or `--star`, optionally wrapped in a subtle `ink-800` pill with 4px padding. Never render real MathJax — inline mono pills keep it crisp and buildable.

---

## 4. Spacing & Layout

- **Spacing scale**: Tailwind defaults; semantic rhythm of 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px.
- **Page shell**: max-width `1200px` content container (`max-w-6xl`), centered, `px-6 md:px-8`. Wide layouts (knowledge map, timeline) may use `max-w-7xl` (1280px).
- **Section vertical rhythm**: `py-20 md:py-28` for major sections; `py-12` for dense tool pages (map/papers).
- **Card grid gaps**: `gap-4 md:gap-6`.
- **Border radius**: `rounded-xl` (12px) cards, `rounded-lg` (8px) inner elements, `rounded-full` chips/pills. Sharp corners avoided — lattices feel engineered but the UI stays friendly.
- **Borders**: 1px `ink-600` default; on hover, border transitions to tier/accent color at 50% opacity.

---

## 5. Animation Style

**Philosophy**: Motions should feel like *measurements propagating through a lattice* — quick, precise, with slight ripple. Durations are short; eases are snappy. Nothing bouncy-playful; everything deliberate.

- **Global easing**: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo) for entrances; `cubic-bezier(0.4, 0, 0.2, 1)` for state changes.
- **Durations**: micro-interactions 150–250ms; card entrances 400–600ms; page transitions 350ms; hero sequences 800–1200ms.
- **Stagger language**: Lists/grids stagger at 0.05–0.08s per item, translating 24px up + opacity 0→1, triggered at 15–20% viewport entry (Framer Motion `whileInView`).
- **Scroll**: Native browser scrolling. A 2px cyan→violet progress bar may appear at the top of long pages.
- **Lattice ripple hover**: On card hover, a subtle radial glow (accent color, 8% opacity) follows the cursor within the card (CSS custom properties + radial-gradient).
- **Page transitions**: Framer Motion `AnimatePresence` — outgoing fades + slides down 12px (200ms), incoming fades + slides up 16px (350ms, 80ms delay).
- **Reduced motion**: Respect `prefers-reduced-motion` — stop continuous image/canvas motion and render reveal sequences in their final state.

### Performance guardrails (per guide)
- Max ~8–10 simultaneously animating elements per viewport.
- One heavy effect per section. Home uses one slow decorative raster-scale effect; the Lab alone owns the optional Three.js spacetime view. Other teaching visuals are lightweight SVG/DOM.
- Character-split animation only for hero headline (≤20 chars per line); word-level for page subheads; block-level for body.

---

## 6. Cursor & Hover Style

- Default cursor everywhere (no custom cursor — this is a study tool; precision matters).
- Interactive elements: `cursor-pointer`, plus:
  - **Links/buttons**: color shift to `--plaquette` + underline slide-in (background-size animation, 200ms).
  - **Cards**: translateY(-4px), border brightens, ripple glow, shadow `0 8px 32px rgba(34,211,238,0.08)`.
  - **Lattice nodes** (knowledge map): node scales 1→1.15, halo ring expands, connected edges brighten.
- Focus-visible: 2px cyan outline on all interactive elements (accessibility).

---

## 7. Shared Components

### 7.1 Navbar (fixed, all pages)
- Height 64px, `ink-900` at 85% opacity + `backdrop-blur-md`, 1px bottom border `ink-600`.
- Left: **Logo** — custom SVG mark (2×2 lattice of dots with one glowing plaquette, cyan) + wordmark "Lattice Atlas" in Space Grotesk 600, 18px. Hover: plaquette in logo pulses.
- Center/right: the core study routes (Start, Depths, Map, Path, Lab, Duel, Papers, Frontier, Glossary, Review). Active link: cyan text + 2px underline indicator. Compact viewports use the menu dialog.
- Far right: **Global progress pill** — mono 12px, e.g. `▓▓▓░░ 19%` reading from localStorage (topics understood / 26). Click → Learning Path page. Shows a tiny animated fill on change.
- Mobile/compact: hamburger → full-screen modal menu (`ink-950` 98% opacity), all routes plus the shareable activity/evidence score, with focus trapped and returned on close.
- Navbar hides on scroll down, reveals on scroll up (translateY transition 300ms).

### 7.2 Footer (all pages)
- `ink-950` background, top border `ink-600`, decorative lattice-dot SVG strip (low opacity) above content.
- Three columns (desktop) / stacked (mobile):
  1. Logo + one-line mission: *"A self-study companion for topological quantum error correction — from linear algebra to the research frontier."*
  2. Site links (all public study routes).
  3. Meta: mono-sm text — `23 papers · 26 topics · 6 tiers · 1998 → 2026`, plus note "Progress is stored locally in your browser. No account, no tracking."
- Bottom line: `text-low` mono-sm: "Built for learners. Content curated from the seminal TQEC literature." + year.

### 7.3 ScrollProgressBar
Fixed top, 2px, gradient cyan→violet, scaleX driven by scroll (Framer Motion `useScroll`). Sits above navbar (z-index higher).

### 7.4 TierBadge
Pill chip: mono-sm uppercase, tier-colored (see §2 tier scale). Format: `TIER 3 · QEC FUNDAMENTALS` or compact `T3`.

### 7.5 DifficultyMeter
5-segment bar (like signal strength): segments 4×14px rounded; filled segments in gradient cyan(1)→amber(4)→rose(5); label mono-sm e.g. `DIFFICULTY 3/5`. Used on paper cards.

### 7.6 PrereqChip
Small pill (body-sm) with cyan dot prefix; renders a prerequisite topic name; hover → tooltip with one-line topic summary; click → opens that topic's detail (knowledge map page with topic pre-selected, or topic drawer if already on map).

### 7.7 TopicCard (map, path)
- Card `ink-800`, 1px border `ink-600`, left 3px border in tier color.
- Contents: tier badge + status icon, topic name (h3), short description (body-sm, `text-mid`), dependency count (`depends on 3 topics` mono-sm), understood toggle.
- Status states: `understood` (green check circle, subtle green border glow), `available` (default), `locked` (60% opacity, lock icon — only used in Learning Path strict mode).

### 7.8 PaperCard (timeline, path, home)
- Card `ink-800`; header row: year in Space Grotesk 700 (large, era-colored) + era tag + difficulty meter.
- Title (h3, `text-hi`), authors (body-sm, `text-low`, truncated with expand), one-sentence summary (body, `text-mid`) in plain English.
- Expandable section: "Contribution" and "Why it matters" paragraphs.
- Footer: prereq chips row + arXiv link button (`arXiv:xxxx.xxxxx ↗` mono-sm, opens PDF in new tab).
- Hover: translateY(-4px), era-color border glow.

### 7.9 LatticeCanvas (decorative background)
Lightweight 2D canvas: dim lattice of dots (ink-500 at 30–50% opacity) in offset checkerboard; a few nodes randomly "flash" (syndrome pulse: rose or cyan radial fade, 1.2s ease) every 2–4s; mouse proximity (≤120px) brightens nodes and draws faint connecting edges. Pauses when off-screen (IntersectionObserver) and under `prefers-reduced-motion`. Used behind heroes and section headers on every page. Fallback: static SVG lattice PNG.

### 7.10 Drawer (topic detail)
Right-side drawer (480px desktop, full-screen mobile), `ink-850`, slides in with spring (Framer Motion, `stiffness 300, damping 30`), overlay `ink-950/70` backdrop. Used for topic details on Map/Path pages and glossary term quick-views. Close: X button, backdrop click, `Esc`.

### 7.11 Button styles
- **Primary**: cyan (`--plaquette`) background, ink-950 text, Inter 600 14px, rounded-lg, px-5 py-2.5. Hover: brightness +10%, scale 1.02, active scale 0.98. Ripple glow.
- **Secondary**: transparent, 1px cyan border at 40%, cyan text. Hover: border 100%, background cyan 8%.
- **Ghost**: text-only, `text-mid` → `text-hi`, underline slide.
- **Era-colored variants** on Papers page filter chips.

### 7.12 Stat / counter
Big Space Grotesk 700 number (48px) in accent color + mono-sm uppercase label. Numbers count up from 0 on viewport entry (Framer Motion `animate` on `useInView`, 1.2s, ease-out).

---

## 8. Data Model (embedded JSON)

All content ships as static JSON in the app bundle (no backend). Progress in `localStorage`.

**`topics.json`** — 26 topics: `{ id, name, tier (1–6), short, detail, key_points[4–6], depends_on[topicId[]], resources[string[]] }` (tier display names come from the tier system in §2; resources are citation strings — see caveats below)

**`papers.json`** — 23 papers: `{ arxiv_id, title, authors (string), year, one_sentence, contribution, why_it_matters, prerequisites[topic names], difficulty (1–5), era }`. **Exact era keys and counts** (must match data): `foundations` (2 papers, 1998–2001) · `cluster-state schemes` (4, 2005–2008) · `defect-based surface code` (9, 2008–2013) · `lattice surgery era` (4, 2011–2019) · `experimental era` (4, 2014–2026). Era display names: Foundations / Cluster-State Schemes / Defect-Based Surface Code / Lattice Surgery Era / Experimental Era. Note: the 1998 anchor paper is Bravyi–Kitaev *"Quantum codes on a lattice with boundary"* — the planar-surface-code origin; the 2026 anchor is *"Surface code off-the-hook"* (diagonal syndrome-extraction scheduling).

**Data source**: the JSON data already exists in the shared workspace at `/mnt/agents/output/tqec/data/knowledge_tree.json` (26 topics, fields: `id, name, tier, short, detail, key_points, depends_on, resources`) and `/mnt/agents/output/tqec/data/papers.json` (fields as above). Copy these into the app bundle; do not regenerate content. Topic `name` values are long and descriptive (e.g. "Decoding: Minimum-Weight Perfect Matching & the Threshold") — display them in full in drawers, but derive a short display name (text before the first colon) for cards and chips.

**Field-shape caveats (verified against the real data)**:
- `topics.depends_on` contains topic **ids** (e.g. `stabilizer-formalism`) — direct lookup.
- `topics.resources` is an array of **plain strings** (e.g. `"Dennis, Kitaev, Landahl & Preskill, 'Topological quantum memory', arXiv:quant-ph/0110143"`) — parse the `arXiv:<id>` substring to build the link; render the string as the title and infer the type tag (`PAPER` when an arXiv id is present, else `REFERENCE`).
- `papers.prerequisites` contains **informal topic names** (e.g. `"qubits & gates"`, `"surface code"`), not ids — build a normalized name→id lookup (lowercase, strip punctuation) with a small manual alias map for mismatches, so PrereqChips resolve to real topic ids.

**`src/data/glossary.ts`** — 61 canonical terms with explicit aliases: `{ term, slug, category, short, long, notation (optional), related_terms[], related_topics[], related_papers[], aliases (optional) }`. Matching uses normalized exact equality, not substring or automatic stemming (see glossary.md).

**`localStorage` schema**: `lattice-atlas-progress = { understood: topicId[], papersRead: arxivId[] }`. Cross-page reactivity via a small context/store that syncs on `storage` events. (The path page derives "current step" from the first not-understood topic, so no separate `lastVisitedPath` field is stored.)

---

## 9. Page List

| Page | File | Route | One-line description |
|---|---|---|---|
| Home | `home.md` | `/` | What TQEC is, the journey pitch, decorative quantum-lattice hero, stats, era overview, entry points |
| Knowledge Map | `knowledge-map.md` | `/map` | Interactive tiered prerequisite tree of 26 topics with detail drawer + progress marking |
| Learning Path | `learning-path.md` | `/path` | Guided ordered route through all topics with step-by-step progress tracking and unlocked papers |
| Paper Explorer | `papers.md` | `/papers` | Chronological timeline of 23 papers grouped by era, plain-English summaries, filters |
| Field Today | `field-today.md` | `/field-today` | The current research frontier: magic state cultivation, compilers, simulators, real-time decoding, experiments |
| Glossary | `glossary.md` | `/glossary` | Searchable, cross-linked glossary of 61 math, quantum, QEC, topology, decoding, and frontier terms |
| Foundations Lab | — | `/foundations` | Five-step interference-first prerequisite game with local, shareable evidence |
| Five Altitudes | — | `/altitudes` | Five concepts at Story, Cause, Model, Formal, and Evidence depth while preserving one invariant |
| Surface Code Lab | — | `/lab` | Keyboard-accessible ideal-check toy, decoder challenges, threshold sampling, and scoped spacetime view |
| Decoder Duel | — | `/duel` | Versioned daily decoding game with comparable puzzle IDs and local, unverified share score |
| Review | — | `/review` | Retrieval-practice response/compare loop driven by the local study record |

---

## 10. Assets

Teaching diagrams are code-native SVG/DOM whenever they carry scientific meaning. The Home raster is decorative mood art and stays empty-alt; raster assets remain compressed.

| Filename | Description | Location | Dimensions | Type |
|---|---|---|---|---|
| `logo.svg` | Minimal mark: 3×3 grid of small dots (qubit lattice) with the center square plaquette filled as a glowing cyan diamond; crisp geometry, flat, works at 24px; single-color variant (cyan `#22D3EE`) plus white wordmark-friendly variant | Navbar, footer, favicon | 64×64 1:1 (vector) | SVG |
| `hero_quantum_lattice.jpg` | Abstract quantum-lattice mood art; decorative only, never a literal surface-code or toric-code diagram | Home hero backdrop (empty alt) | responsive cover | Compressed image |
| `lattice-texture.svg` | Seamless tileable pattern: offset square lattice of tiny dim dots (`#2A3A5F` on transparent) with faint alternating plaquette squares at 6% opacity; tile size small so it repeats invisibly | Section backgrounds site-wide (CSS background) | 240×240 tile | SVG |
| `braid-divider.svg` | Horizontal decorative divider: two smooth curving world-lines (one cyan, one violet) that cross over/under each other twice like anyon braids, thin 1.5px strokes on transparent, with small dots at endpoints | Section dividers on Home, Field Today | 1200×120 10:1 | SVG |
| `era-strip.svg` | Low-contrast era timeline texture; decorative behind readable HTML | Papers header and Home canon | wide | SVG |
| `frontier-hero.svg` | Abstract, unlabeled frontier motif; decorative only | Field Today hero | wide | SVG |
| `surface-code-diagram.svg` | Exact distance-3 rotated patch from the shipped lattice model: 9 data qubits, 4 X checks, 4 Z checks, and a center X component flipping its two adjacent Z checks | Home “what is TQEC?” section | 960×720 4:3 | SVG |
| `anyon-illustration.svg` | Decorative spatial loop motif; the exact mutual-statistics claim and caveat live in accessible HTML, not image text | Knowledge Map | 800×600 4:3 | SVG |
| `og-image.png` | Social card: logo + "Lattice Atlas — Learn Topological Quantum Error Correction" in Space Grotesk on `ink-900` with faint lattice texture and cyan/violet braid line | Site `<meta og:image>` | 1200×630 | Image |

---

## 11. Dependencies (for implementation team)

- `react`, `react-dom`, `react-router-dom` — SPA + routing
- `tailwindcss@3.4.19` — styling
- `framer-motion` — page transitions, stagger reveals, layout animations, drag
- `three` — optional WebGL spacetime view in the Surface Code Lab
- `lucide-react` — icons (BookOpen, Map, Route, ScrollText, Telescope, Library, Check, Lock, ArrowRight, ExternalLink, Search, X, ChevronDown, Zap, Cpu, FlaskConical, Waves, GitBranch, Sparkles)
- `sonner` — visible copy/result feedback
- Google Fonts: Space Grotesk, Inter, JetBrains Mono (via `<link>` or `@fontsource`)

**Explicitly NOT used**: MathJax/KaTeX (mono pills instead), chart libraries (custom SVG), backend/API, auth.

---

## 12. Accessibility & Responsiveness

- Breakpoints: mobile <768px, tablet 768–1024px, desktop >1024px, wide >1440px.
- All interactive elements keyboard-focusable with visible focus rings; drawer traps focus; `Esc` closes overlays.
- Color is never the sole encoder: tier badges include text labels; difficulty meters include numeric labels; understood state has a check icon.
- Contrast: `text-mid` (#A9B4CC) on `ink-900` ≈ 7.5:1 (AA/AAA pass); accent text cyan on ink-900 ≈ 8:1.
- Knowledge map and timeline provide list-view alternatives (the map IS a DOM list under the hood — columns are real HTML, not canvas; only decorative backgrounds are canvas).
- `prefers-reduced-motion`: stop continuous hero/canvas motion and bypass nonessential reveal transforms.

# Decorative Art — Prompt Manifest (2026-08-08, extended 2026-08-09)

Companion to `design/2026-08-08-decorative-art.md` and
`design/2026-08-09-educational-visuals.md` (workstreams A + B). One ready-to-paste
prompt per asset. Workflow: paste a prompt verbatim into the generator
(nano-banana), save the output into `asset-inbox/` (gitignored) using the
**exact filename** below, then run `app/scripts/prepare-images.mjs` to
resize/compress into `app/public/`.

Format note: `prepare-images.mjs` parses this file line-by-line — each asset's
heading carries `filename.jpg — … — WxH` on one line (first occurrence wins).
Keep that shape when adding assets.

Rules (from the specs): no text/letters/numbers/UI inside any image; subjects
stay abstract/decorative mood pieces, never literal diagrams; generated rasters
never carry scientific claims; if a result looks like a diagram (grids with
implied data), reject it, note a re-prompt under the asset's section or in the
re-prompt log, and regenerate.

## STYLE PREAMBLE (included verbatim at the start of every prompt below)

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark.
```

Every prompt below is self-contained: it already begins with this preamble,
followed by the asset's subject description. Paste the whole block as-is.

---

## Tier illustrations — Home Journey tier cards (1200×675, 16:9)

Tier themes from `app/src/data/index.ts` `tierNames`/`tierColors` (cool → warm).

### 1. `tier-1.jpg` — Tier 1: Foundations — 1200×675

- **Slot:** Home Journey tier card, Tier 1
- **Palette emphasis:** sky-blue/cyan (`#38BDF8`), dim ambient — the faintest image of the six

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A single bright point of light anchors the very first faint wireframe lattice lines rising out of total darkness, a sparse dim grid just beginning to form around it, most of the frame still empty and dark, quiet sense of origin and first principles, wide 16:9 composition.
```

### 2. `tier-2.jpg` — Tier 2: QC Basics — 1200×675

- **Slot:** Home Journey tier card, Tier 2
- **Palette emphasis:** cyan (`#22D3EE`) with violet interference fringes

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. Two overlapping translucent waves of cyan and violet light ripple across a small wireframe lattice and interfere, creating soft luminous interference bands where the waves cross, a few nodes glowing brighter at the crests, fluid and wavelike mood, wide 16:9 composition.
```

### 3. `tier-3.jpg` — Tier 3: QEC Fundamentals — 1200×675

- **Slot:** Home Journey tier card, Tier 3
- **Palette emphasis:** cyan base with emerald-green accents (`#34D399`, stabilizer green)

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A wireframe lattice whose nodes are grouped into repeating glowing rings of emerald-green light, one flickering unstable node encircled and steadied by a protective green halo, a feeling of redundancy and quiet repair, calm and orderly mood, wide 16:9 composition.
```

### 4. `tier-4.jpg` — Tier 4: Topological Core — 1200×675

- **Slot:** Home Journey tier card, Tier 4
- **Palette emphasis:** violet (`#A78BFA`) dominant, cyan lattice lines

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A large luminous wireframe torus wrapped in a glowing cyan-violet lattice mesh, floating in space like a cosmic donut of light, small colored particles of light drifting on thin threads around it, majestic centerpiece mood, wide 16:9 composition.
```

### 5. `tier-5.jpg` — Tier 5: Computation & Decoding — 1200×675

- **Slot:** Home Journey tier card, Tier 5
- **Palette emphasis:** amber (`#F5B83D`) highlights over cyan/violet paths

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. Braided streams of cyan and violet light race across a wireframe lattice and converge at bright amber junction points where paths merge and split, dynamic flowing motion like computation traveling through a circuit of light, energetic mood, wide 16:9 composition.
```

### 6. `tier-6.jpg` — Tier 6: Frontier — 1200×675

- **Slot:** Home Journey tier card, Tier 6
- **Palette emphasis:** rose (`#FB7185`) sparks, violet edges fading into darkness

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A glowing wireframe lattice whose far edge dissolves and breaks apart into unexplored darkness, bright rose-colored sparks leaping beyond the boundary of the known grid into the void, a feeling of an open research frontier, adventurous mood, wide 16:9 composition.
```

---

## Era banners — Papers timeline era headers (1600×500, ultra-wide)

Era keys and colors from `design/papers.md` §2 and `app/src/data/index.ts`.

### 7. `era-foundations.jpg` — Foundations (1998) — 1600×500

- **Slot:** Papers timeline era banner, `foundations`
- **Palette emphasis:** cyan, mostly dark — sparse and embryonic

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A vast sparse dim wireframe grid stretching into darkness, with just a few first glowing square plaquettes of cyan light igniting here and there like the first lamps lit in a dark city, minimal and embryonic mood, ultra-wide banner composition.
```

### 8. `era-cluster-state.jpg` — Cluster-State Schemes — 1600×500

- **Slot:** Papers timeline era banner, `cluster-state schemes`
- **Palette emphasis:** sky-blue/cyan, violet entanglement edges

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A three-dimensional cubic lattice of glowing sky-blue nodes suspended in space, every node linked to its neighbors by thin luminous violet threads of light, a dense entangled scaffolding receding in perspective, architectural mood, ultra-wide banner composition.
```

### 9. `era-defect-surface.jpg` — Defect-Based Surface Code — 1600×500

- **Slot:** Papers timeline era banner, `defect-based surface code`
- **Palette emphasis:** violet dominant, dark voids rimmed with light

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A dark violet wireframe lattice plane punctured by several smooth circular holes whose edges glow brightly with violet and cyan light, luminous rings around dark voids floating in the mesh, mysterious elegant mood, ultra-wide banner composition.
```

### 10. `era-lattice-surgery.jpg` — Lattice Surgery Era — 1600×500

- **Slot:** Papers timeline era banner, `lattice surgery era`
- **Palette emphasis:** amber (`#F5B83D`) seam light, cyan patches

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. Two separate glowing cyan wireframe lattice patches drifting toward each other and merging along one shared boundary, a brilliant amber seam of light welding the two patches together where they touch, surgical precise mood, ultra-wide banner composition.
```

### 11. `era-experimental.jpg` — Experimental Era — 1600×500

- **Slot:** Papers timeline era banner, `experimental era`
- **Palette emphasis:** rose (`#FB7185`) highlights, dense full illumination

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A dense planar chip-like wireframe lattice seen at a low raking angle, fully lit with hundreds of glowing nodes in cyan and rose like a futuristic processor at full power, rich detailed glow fading toward the horizon of the chip, triumphant mood, ultra-wide banner composition.
```

---

## Page heroes (1600×900, 16:9)

### 12. `hero-altitudes.jpg` — Altitudes page — 1600×900

- **Slot:** `Altitudes.tsx` hero — "Five altitudes, one truth": the same idea explained at five depths
- **Palette emphasis:** layered cyan → violet gradient up the stack

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. The same glowing wireframe lattice structure shown as five stacked translucent layers receding upward like terraces of light, each layer a different scale and depth of the same form, shifting from cyan at the base to violet at the summit, meditative sense of one truth seen at many altitudes, wide 16:9 composition.
```

### 13. `hero-foundations-lab.jpg` — Foundations Lab page — 1600×900

- **Slot:** `FoundationsLab.tsx` hero — "Waves to Qubits": from continuous waves to discrete quantum states
- **Palette emphasis:** cyan with violet wave gradients

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A smooth flowing wave of cyan and violet light on the left gradually crystallizing into a discrete lattice of glowing points on the right, continuous motion condensing into quantized structure, an elegant visual metamorphosis, wide 16:9 composition.
```

### 14. `hero-surface-lab.jpg` — Surface Code Lab page — 1600×900

- **Slot:** `SurfaceCodeLab.tsx` hero — hands-on lattice with errors appearing and being corrected
- **Palette emphasis:** cyan/violet lattice, amber and rose error sparks, green correcting halos

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A glowing planar wireframe lattice viewed at a dramatic angle, a few bright amber and rose sparks flaring at scattered nodes while soft green rings of light close around them like healing halos, an abstract feeling of errors being caught and repaired, lively but harmonious mood, wide 16:9 composition.
```

### 15. `hero-decoder-duel.jpg` — Decoder Duel page — 1600×900

- **Slot:** `DecoderDuel.tsx` hero — a game where two decoders race across a syndrome grid
- **Palette emphasis:** cyan network vs rose/violet network, competitive tension

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. Two rival networks of light paths racing across a dark wireframe grid, one network glowing cyan and the other glowing rose-violet, their luminous trails weaving and crossing as they compete to connect scattered bright points, dynamic competitive energy, wide 16:9 composition.
```

### 16. `hero-review.jpg` — Review page — 1600×900

- **Slot:** `Review.tsx` hero — "Keep it fresh": daily spaced-repetition review rekindling fading knowledge
- **Palette emphasis:** violet/cyan, contrast of dim and relit nodes

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A scattered constellation of wireframe lattice fragments at varying brightness, the dimmest fading fragments being rekindled one by one by gentle passing pulses of violet and cyan light, a quiet rhythm of remembering, warm contemplative mood, wide 16:9 composition.
```

### 17. `hero-capstone.jpg` — Capstone page — 1600×900

- **Slot:** `Capstone.tsx` hero — synthesis capstone joining all the site's ideas into one transfer task
- **Palette emphasis:** full palette in harmony — cyan, violet, amber, rose, green unified

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. Several distinct glowing wireframe motifs — a small lattice torus, a braided strand of light, a square lattice patch, a wave of particles — converging from different directions and fusing into one unified radiant lattice structure at the center, a celebratory synthesis of many forms into one, wide 16:9 composition.
```

---

## Standalone assets

### 18. `fieldtoday-mood.jpg` — FieldToday decorative backdrop — 1600×900

- **Slot:** `FieldToday.tsx` low-opacity backdrop (SVG vignettes stay on top)
- **Palette emphasis:** cyan assembly light, amber welding sparks — decorative, low-contrast so page text stays readable

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A vast automated factory floor made of light, long rows of glowing assembly lines receding into darkness, robotic beams of cyan light welding wireframe lattice structures together at intervals with small amber sparks, endless industrial scale rendered as pure light, low-contrast atmospheric mood, wide 16:9 composition.
```

### 19. `og-image.png` — Social card (regenerate) — 1200×630

- **Slot:** `og:image` / social preview — title text is overlaid elsewhere, so the image itself must stay text-free
- **Palette emphasis:** hero-style cyan/violet at the edges, center kept dark and empty

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A wide cinematic composition where a glowing wireframe lattice torus and drifting strands of luminous particles frame the edges and corners of the image, while the central area stays dark, calm and empty, leaving clean negative space in the middle, balanced symmetrical framing, wide social-card composition.
```

---

## Analogy art — topic drawer header art (1200×675, 16:9)

Workstream A of `design/2026-08-09-educational-visuals.md`: one metaphor
illustration per core concept. The metaphor is rendered through objects and
light, never as a labeled diagram — no text, no letters, no physics claims.

### 20. `analogy-toric-code.jpg` — toric code: a hole you cannot deform away — 1200×675

- **Slot:** Topic drawer header art, `toric-code`
- **Palette emphasis:** violet torus mesh, cyan deformation ripples

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A glowing wireframe donut shape being stretched and squeezed by unseen forces, ripples of deformation traveling across its luminous mesh while the hole through its center remains perfectly intact and unmistakable no matter how the surface warps, a quiet metaphor of a feature that cannot be deformed away, wide 16:9 composition.
```

### 21. `analogy-stabilizer-formalism.jpg` — stabilizers: watchers that never open the box — 1200×675

- **Slot:** Topic drawer header art, `stabilizer-formalism`
- **Palette emphasis:** emerald-green watcher lights over a sealed cyan lattice

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A sealed glowing box of wireframe lattice light hovering in darkness, ringed by small watchful sentinel orbs of emerald-green light that hover around it like thermostats on a wall, each orb softly reading the glow of the box without ever touching or opening it, calm vigilant mood, wide 16:9 composition.
```

### 22. `analogy-surface-code.jpg` — surface code: woven fabric with a snagged thread — 1200×675

- **Slot:** Topic drawer header art, `surface-code`
- **Palette emphasis:** cyan woven threads, one amber snagged thread glowing

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A vast fabric woven from countless glowing cyan threads of light stretching into the distance, one single thread snagged and pulled visibly out of line glowing bright amber, the flaw obvious to the eye yet the surrounding cloth holding its shape and strength undamaged, textile-tactile mood, wide 16:9 composition.
```

### 23. `analogy-syndrome-extraction-circuits.jpg` — syndrome extraction: detectors that report, never touch — 1200×675

- **Slot:** Topic drawer header art, `syndrome-extraction-circuits`
- **Palette emphasis:** rose alarm flare against dim cyan hall of light

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A dark hall whose ceiling is a wireframe lattice, small detector-like lights mounted along it like smoke detectors, one thin wisp of glowing smoke rising from below and a single detector flaring rose-red in response while everything beneath remains completely untouched and still, an alarm that only ever reports, wide 16:9 composition.
```

### 24. `analogy-defects-braiding.jpg` — defects & braiding: ribbons braided on a board — 1200×675

- **Slot:** Topic drawer header art, `defects-braiding`
- **Palette emphasis:** cyan and violet ribbons over a dim warped board

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. Two luminous ribbons of light, one cyan and one violet, gracefully braided around each other as they travel across a dark warped wireframe board that stretches to the horizon, the crossing pattern of the ribbons carrying a quiet sense of stored meaning, flowing elegant mood, wide 16:9 composition.
```

### 25. `analogy-magic-states-distillation.jpg` — magic-state distillation: rough gems into one clear gem — 1200×675

- **Slot:** Topic drawer header art, `magic-states-distillation`
- **Palette emphasis:** amber rough gems refining into one brilliant cyan-white gem

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. A cluster of rough, dim, cloudy amber gemstones feeding into a rising column of refining light, their impurities dissolving away as they ascend, until a single flawless brilliantly clear faceted gem of cyan-white light emerges at the top, alchemical mood of many rough things becoming one pure thing, wide 16:9 composition.
```

---

## Altitudes zoom series — Altitudes page backdrops (1600×900, 16:9)

Workstream B of `design/2026-08-09-educational-visuals.md`: one coherent glowing
lattice scene at five zoom levels (chip scale → array of patches → single patch
→ individual qubits → wavefunction/phase scale). Every prompt names its position
in the series to maximize cross-image coherence. Accept minor drift between
frames (mood pieces, not data); reject any frame that turns into a literal
diagram and note it in the re-prompt log.

### 26. `altitude-1.jpg` — zoom 1 of 5: chip scale — 1600×900

- **Slot:** `Altitudes.tsx` backdrop, altitude 1 (widest view)
- **Palette emphasis:** cyan chip glow against the starfield, violet rim light

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. This is image 1 of a 5-image series of the SAME scene, one zoom step closer each time: the widest view, an entire glowing chip-like plane of cyan-violet wireframe lattice seen from far above, a vast rectangular expanse of tiny luminous grid cells floating in dark space, its fine detail blurred by distance into an even ethereal glow, wide 16:9 composition.
```

### 27. `altitude-2.jpg` — zoom 2 of 5: array of patches — 1600×900

- **Slot:** `Altitudes.tsx` backdrop, altitude 2
- **Palette emphasis:** cyan patches with violet seams between them

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. This is image 2 of a 5-image series of the SAME scene, one zoom step closer than before: the same glowing chip-like lattice plane now nearer, resolving into an ordered array of distinct square patches of light, each patch a small glowing lattice tile separated from its neighbors by thin dim violet seams, a mosaic of luminous tiles receding in perspective, wide 16:9 composition.
```

### 28. `altitude-3.jpg` — zoom 3 of 5: single patch — 1600×900

- **Slot:** `Altitudes.tsx` backdrop, altitude 3
- **Palette emphasis:** cyan lattice cells, occasional amber and rose node glows

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. This is image 3 of a 5-image series of the SAME scene, one zoom step closer than before: one single square patch of the same glowing lattice now fills the frame, its individual wireframe cells and glowing nodes clearly visible, a few nodes shimmering amber and rose among the cyan, the edges of the patch fading softly into darkness, wide 16:9 composition.
```

### 29. `altitude-4.jpg` — zoom 4 of 5: individual qubits — 1600×900

- **Slot:** `Altitudes.tsx` backdrop, altitude 4
- **Palette emphasis:** large cyan node orbs, violet connecting edges, sparse particles

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. This is image 4 of a 5-image series of the SAME scene, one zoom step closer than before: an intimate close-up of just a handful of individual glowing nodes of the same lattice, each node a soft orb of cyan light, connected by thin luminous violet edges, floating particles drifting slowly between them, a sense of standing inside the grid among its smallest units, wide 16:9 composition.
```

### 30. `altitude-5.jpg` — zoom 5 of 5: wavefunction / phase scale — 1600×900

- **Slot:** `Altitudes.tsx` backdrop, altitude 5 (deepest view)
- **Palette emphasis:** cyan and violet phase ripples dissolving into pure light

```
Digital artwork, dark navy near-black starfield background, glowing neon wireframe lattice structures rendered in luminous cyan and violet light with sparse amber and rose particle accents, ethereal floating particle field, soft bloom and gentle volumetric glow, cinematic lighting, vast cosmic depth, elegant and abstract, moody atmospheric sci-fi mood piece, no text, no letters, no numbers, no labels, no UI elements, no watermark. This is image 5 of a 5-image series of the SAME scene, one final zoom step closer than before: an extreme close-up where a single glowing node of the same lattice dissolves into flowing translucent waves and ripples of cyan and violet phase light, structure giving way to pure undulating luminosity, dreamlike and abstract, the deepest layer of the scene, wide 16:9 composition.
```

---

## Re-prompt log

(Empty — wiring agents: if a generated image reads as a diagram rather than a
mood piece, reject it, record the asset filename and what went wrong here, and
regenerate with an adjusted prompt.)

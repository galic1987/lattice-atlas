# Art directions — Five Altitudes concept banners

Four banners needed, one per new ladder concept. Generated imagery (nano
banana / Imagen) is welcome here because these are *narrative* banners —
the teaching diagrams stay computed SVG.

## Locked style (from the approved `foundations-memory-lab-v1.webp`)

**"Instruments on a dark museum bench"**: photorealistic tabletop objects,
rim-lit, on deep ink-navy (#0A0F1C). This register matches the site's
physical-metaphor content and passed correctness review — reuse it.

Hard constraints (every banner):
- No text, letters, numerals, or glyph-like sigils anywhere.
- No people, spaceships, planets, or mystical symbolism.
- Glow/accent colors ONLY from the semantic palette: cyan `#22D3EE`,
  violet `#8B5CF6`, amber `#F5B83D`, rose `#FB7185`, green `#34D399`.
  Color carries meaning on this site — no rainbow assortments.
- Landscape banner, ~1600×640. Deliver ≤ 300 KB (webp preferred; the
  foundations webp at 82 KB is the benchmark).
- Filenames: `altitude_<concept-id>.webp` → then set the concept's
  `banner` + `bannerAlt` fields in `app/src/data/altitudes.ts`.

## Per-concept prompts

**altitude_superposition** — A single guitar string stretched over a dark
resonance box, visibly vibrating in two superimposed standing-wave shapes
at once — one broad and slow traced in cyan light, one tight and fast in
violet — their blur overlapping. Beside it, a coin spinning on the bench,
caught mid-blur. *(Physics check: the two wave envelopes must coexist on
ONE string — not two strings.)*

**altitude_topology** — A dark ceramic torus (donut) on the bench with two
glowing elastic bands wrapped around it: one cyan band threading through
the hole, one violet band circling the tube. A pair of scissors lies
nearby, unused. *(Physics check: the two bands must wind differently —
one through the hole, one around the body — since they represent the two
inequivalent cycles.)*

**altitude_decoding** — A dusting of fresh snow across a dark bench. A
trail of rose-glowing paw prints crosses it, but the middle of the trail
has faded — only the first and last prints still glow. A thin cyan thread
has been laid by hand connecting the two endpoints, taking the shortest
path. *(Physics check: exactly the endpoints glow, not the whole trail —
that IS the syndrome.)*

**altitude_magic-states** — A row of small glass bottles of murky amber
liquid on the bench, connected by glass tubing that converges into a
single small vial of intensely pure amber light. Most of the bench is
tubing and bottles; the pure vial is tiny. *(Physics check: many dirty
inputs → one clean output, and the apparatus dwarfs the product — that
ratio is the whole point of distillation.)*

## Review checklist (run before merging any banner)

1. Zero text/glyph artifacts (generated text is always garbled).
2. Palette compliance — no off-semantic colors doing meaning-work.
3. The physics check noted in each prompt above.
4. ≤ 300 KB on disk; looks correct at 400 px wide (card size).
5. Reviewed by the other agent before merge (four-eyes rule for art,
   same as the audit that caught the space-battle and rainbow-syndrome
   images).

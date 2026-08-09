# Educational Visual Generation — Design Spec (2026-08-09)

Companion to `2026-08-08-decorative-art.md` (which covers purely decorative art).
This spec covers visuals whose purpose is *understanding*. Governing rule (from
AGENTS.md / design.md): **generated rasters never carry scientific claims — anything
with physics content is code-native and verifiable.** Every workstream below keeps
that rule by construction.

## Workstream A — Analogy art (pilot: 6 topics)

One metaphor illustration per core concept, shown as decorative header art in the
topic drawer (empty alt, `asset()`, lazy). Analogies are evocative by design, so
generative art is safe here.

Pilot topics and analogy directions (final copy in the manifest extension):
1. `toric-code` — donut hole you cannot deform away (topology as protection)
2. `stabilizer-formalism` — thermostat-like watchers that never open the box
3. `surface-code` — woven fabric: a snagged thread is visible but the cloth holds
4. `syndrome-extraction-circuits` — smoke detectors: they report, they never touch
5. `defects-braiding` — ribbons braided on a board (already echoed by existing art)
6. `magic-states-distillation` — refining many rough gems into one clear one

Mechanics: extend `design/asset-manifest.md` with an "Analogy art" section
(`analogy-<topic-id>.jpg`, 1200×675, same style preamble), same inbox →
`npm run prepare-images` → wiring-PR flow as the decorative set.

## Workstream B — Altitudes zoom series (5 images)

The Altitudes page teaches one truth at five zoom levels. Generate a coherent
series: *the same glowing lattice scene* at chip scale → array scale → patch scale
→ qubit scale → wavefunction scale. Prompted as an explicit series ("image N of 5,
same scene, one zoom step closer") to keep composition coherent; each image keeps
the shared style preamble. Files `altitude-1.jpg` … `altitude-5.jpg`, 1600×900,
wired as the per-altitude backdrop on the Altitudes page.

Risk and mitigation: cross-image coherence is the weak point of generative series —
accept minor drift (these are mood pieces, not data), but reject any frame that
turns into a literal diagram (re-prompt log in the manifest).

## Workstream C — Manim explainers (pilot: 3 clips)

Programmatic animation = frame-exact physics. Pilot clips (20–40 s, looping,
muted, webm/mp4 ≤ ~2 MB each), embedded in the matching topic drawers:

1. **Stabilizer measurement round** — data qubits + ancilla, CNOT schedule, readout
2. **Error → syndrome** — an X error chain lights up its two adjacent Z checks
   (use the exact distance-3 `buildLattice(3)` geometry the site already ships and
   `verify-lattice` validates — the same configuration as the Home diagram)
3. **Lattice-surgery merge/split** — two patches merge (rough merge = X_L X_L
   measurement, per the PDF-verified convention), then split

Environment: Python virtualenv inside the repo tooling area (e.g. `notebooks/.venv`
or `tools/manim/.venv`), `manim` + `ffmpeg` installed there only — nothing global.
Scene code lives in `tools/manim/` with one scene class per clip; a
`tools/manim/render.sh` renders all scenes to `app/public/clips/`.

Coordination flag: AGENTS.md assigns "Manim-rendered video explainers" to the
Gemini/Antigravity lane and this checkout is Gemini's — still, keep PRs small and
announce in the PR body so Claude's lane can rebase.

## Phasing

- **Phase 1 (now):** A pilot + B — manifest extensions + wiring plan; user
  generates in Antigravity; agents wire per batch.
- **Phase 2:** A generate→trace proof — one lattice-surgery illustration where a
  nano-banana sketch is used as composition reference and an agent re-implements
  it as exact SVG/DOM from the verified lattice model. Evaluate before scaling.
- **Phase 3:** C pilot (3 Manim clips), then evaluate.

## Guardrails (all workstreams)

- No text/letters in generated images; no scientific labels in raster art.
- Rasters ≤ 300 KB via the prep script; videos lazy-loaded, `playsinline`, muted,
  respect `prefers-reduced-motion` (static poster frame instead).
- Every physics-carrying visual traces to `buildLattice` / shipped data or it
  does not ship.

# Depth Observatory — design QA

## Source truth

- Selected visual target: `/Users/ivo/.codex/generated_images/019fdc7f-abfb-7c22-a01a-0f355ccb0e43/exec-56b81bb1-ac00-4f32-ba10-5ae96a6716fe.png`
- Source dimensions: 1487 × 1058 px
- Product design authority: `design/design.md` plus the existing Lattice Atlas token system
- Implemented state used for comparison: Superposition / interference, Model selected, earlier layers visible, coherent paths, relative phase 90°

## Capture metadata

| Capture | Viewport / DPR | Rendered size | Artifact |
| --- | --- | --- | --- |
| Reference | 1487 × 1058 px | 1487 × 1058 px | source truth above |
| Desktop viewport | 1487 × 1058 CSS px / DPR 1 | full viewport | `/tmp/depth-observatory-final-viewport.png` |
| Desktop component | 1487 × 1058 CSS px / DPR 1 | 1423 × 1228 px | `/tmp/depth-observatory-final-desktop.png` |
| Mobile component | 390 × 844 CSS px / DPR 1 | 358 × 3366 px | `/tmp/depth-observatory-final-mobile.png` |
| Full comparison | 1487 × 1058 source and build | 2974 × 1058 px | `/tmp/depth-observatory-reference-vs-build.png` |
| Focus comparison | matched central observatory crops | 1640 × 560 px | `/tmp/depth-observatory-focus-compare.png` |

The desktop document width measured exactly 1487 px. The mobile viewport, document, and body widths each measured exactly 390 px. No document-level horizontal overflow was present.

## Fidelity review

### Typography

- Preserved the product's display, sans, and mono hierarchy rather than importing type from the generated reference.
- Station labels, invariant beam, formulas, and model receipts follow the existing semantic typography system.
- Minimum interactive and explanatory copy remains readable on mobile; scientific notation is rendered as mono pills or SVG text, with no raw TeX delimiters.

### Spacing and layout

- Matched the reference's nonlinear station orbit, three-part middle composition, central visual focus, and bottom all-depth comparison rail.
- Reduced the first implementation from roughly 1635 px to 1228 px by collapsing supporting prose and using a compact Verify preview outside Verify depth.
- Preserved accessible 44 px controls and readable text measure instead of compressing the implementation to the exact static-reference height.
- Mobile order is central representation, Verify support, then the two-column all-depth rail; no horizontal clipping was found.

### Colors and tokens

- Used the native ink-navy surfaces and the semantic cyan, violet, amber, rose, and green accents.
- Critical state differences use labels, geometry, and icons in addition to color.
- Automated WCAG A/AA scanning found no serious or critical violation in the final route states.

### Image and asset fidelity

- The selected generated reference is used as the visual composition target, not shipped as a decorative bitmap.
- The live observatory uses deterministic semantic diagrams so concept/depth changes remain accurate and accessible.
- Comparison captures confirm that the orbit, microscope, Verify column, invariant beam, and comparison rail retain the reference's hierarchy.

### Copy and content

- Reused each concept's canonical invariant and existing five-level copy rather than inventing a parallel curriculum.
- Story, Cause, Model, Formal, and Verify progressively change the representation; advanced terms do not leak into Story.
- Superposition uses the balanced H–phase–H model: `A₀=(1+eⁱφ)/2` and `P(0)=|A₀|²=cos²(φ/2)`.
- The orthogonal-record branch correctly removes phase visibility and predicts 50% at detector 0.
- Topology distinguishes a closed-orientable torus slice from the planar relative-path Lab challenge.
- Magic-state Cause shows both accepted-output and rejected-attempt branches.
- Seeded finite-shot observations are labeled browser-model evidence, not hardware measurements.

## Interaction and accessibility QA

- One semantic tab set exposes the five depths; decorative echoes are not duplicate controls.
- Arrow Left/Right, Home/End, and scoped 1–5 shortcuts move both selection and focus.
- Opening the full experiment transfers focus to Verify instead of dropping focus to the body.
- The ghost-layer switch is unavailable at Story and affects presentation only.
- The phase slider exposes degrees, predicted probability, seeded observation, and a Wilson 95% interval.
- Reduced motion disables continuous travel and leaves the manual model fully usable.
- The sweep restarts after completion, stops when leaving Verify, and suppresses frame-by-frame live-region announcements.
- All five concepts across all five depths rendered without page or console errors in the final audit.

## Iterations resolved

1. Replaced the always-expanded Verify panel with a compact four-step preview.
2. Added visual microcharts to Verify and visual thumbnails to the all-depth rail.
3. Made every concept representation change by depth and removed advanced Story labels.
4. Made ghost layers depth-aware and disabled them at Story.
5. Removed invalid `aria-pressed` from tabs and fixed numeric-shortcut focus.
6. Removed a duplicate React key and aligned teach-back test content with the default concept.
7. Added accurate sweep restart, reduced-motion, and assistive-technology announcement behavior.
8. Split topology's toric Model view from its planar Verify challenge.
9. Added the magic-state rejection branch.
10. Moved the topology trust footnote inside the SVG safe area.
11. Made the Observe microglyph visualize seeded observed frequency rather than ideal prediction.
12. Added regression coverage for the orthogonal-record 50% branch.

## Intentional deviations

- The generated source is a static composition; the implementation replaces static diagrams with deterministic concept- and depth-specific SVG/DOM views.
- Accessible targets and full scientific disclosure make the complete component taller than the 1058 px reference. The primary orbit and microscope remain visible within the matched desktop viewport.
- The Verify preview uses seeded, reproducible microvisuals instead of decorative chart placeholders.

## Automated evidence

- `npx eslint src scripts tests` — passed
- `npx tsc -b --pretty false` — passed
- `npm run build:e2e` — passed
- `npm run verify-lattice -- --require-stim` — passed, including Stim 1.16 and exact d=3/5/7 circuit distance
- `npm run check-bundles` — passed
- `LATTICE_RELEASE_PORT=43928 npm run test:e2e` — 46/46 passed, including mobile reflow, reduced motion, Depth Observatory behavior, orthogonal records, and axe A/AA checks
- `git diff --check` — passed

## Final findings

- P0: none
- P1: none
- P2: none actionable after the final visual, science, keyboard, mobile, and automated review
- Page errors: none
- Console errors: none

final result: passed

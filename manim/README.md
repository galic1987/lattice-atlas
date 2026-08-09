# Concept Films — Manim scene scripts

Exact, equation-driven animations of core TQEC ideas, for embedding in Lattice
Atlas as **illustrative concept films**. Unlike generative AI video, these are
computed from the real structure of the surface code, so the geometry and the
numbers are correct — the styling is a teaching aid, not an artist's guess.

## Scenes (`tqec_scenes.py`)

| Scene | What it shows | Physics it's faithful to |
|-------|---------------|--------------------------|
| `StabilizerCheck` | A Z-plaquette measures `Z₁Z₂Z₃Z₄` and flips +1 → −1 when an X error touches it | Z-checks detect X (bit-flip) errors; measuring a stabilizer doesn't collapse the logical state |
| `SyndromeMatching` | Error chain → detectors fire **only at its endpoints** → min-weight matching pairs them → correction annihilates the chain | The syndrome is the *boundary* of the error chain; MWPM matches defects by shortest path |
| `ThresholdSuppression` | `Pₗ` vs `p` for d = 3, 5, 7 fanning below `p_th` | `Pₗ ≈ A(p/p_th)^((d+1)/2)`; curves cross at threshold |
| `ToricCodeLogicals` | Two non-contractible loops (`Z̄`, `X̄`) wrap the torus; a local loop shrinks to a point | Logical operators = non-contractible cycles; contractible loops are stabilizers |

## Render

Requires [Manim Community](https://docs.manim.community/) (`v0.18+`), a LaTeX
distribution (for the equation labels), and `ffmpeg`.

```bash
pip install manim          # + a system LaTeX (e.g. MacTeX / TeX Live) and ffmpeg

# one scene, high quality (1080p60):
manim -qh tqec_scenes.py SyndromeMatching

# all four:
manim -qh tqec_scenes.py StabilizerCheck SyndromeMatching ThresholdSuppression ToricCodeLogicals

# 4K for a hero clip:
manim -qk tqec_scenes.py SyndromeMatching
```

Rendered files land in `media/videos/tqec_scenes/<quality>/<Scene>.mp4`.

## Publishing checklist (keep the atlas honest)

1. **Watch each clip and check the physics** before publishing — the scripts are
   correct, but confirm nothing rendered misleadingly.
2. Commit the `.mp4`/`.webm` under the app's assets and embed it **labeled
   "illustrative concept film"** — accurate in structure, stylised in look.
3. Never present a concept film as a *measurement* or a live simulation. The
   live/interactive tools (Surface Code Lab, Experiment Bench, Threshold
   Sandbox) are where real computation runs; these films illustrate the ideas.
4. Keep clips short (they're intros/explainers), and prefer `.webm` for size.

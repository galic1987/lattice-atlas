# Lattice Atlas — companion notebooks

The verification ladder: every claim on the site can be reproduced one rung
deeper, ending on real hardware.

| Rung | Where | What it verifies | Cost |
|---|---|---|---|
| 1 | [The Lab](https://galic1987.github.io/lattice-atlas/lab) (browser) | Error chains, syndromes, decoding, the scaling law under code-capacity noise (~15% threshold) | free, instant |
| 2 | `first-threshold-curve.ipynb` (Stim + PyMatching) | Same experiment with noisy syndrome-extraction circuits — the threshold drops to the famous ~1% | free, minutes |
| 3 | `real-hardware-error-suppression.ipynb` (IBM Quantum) | Error suppression with code distance **measured on actual superconducting qubits** | free (IBM Open Plan), one job |

Run them on [Google Colab](https://colab.research.google.com) or any Jupyter
environment. Rung 3 needs a free IBM Quantum account
(https://quantum.cloud.ibm.com — no card, no application).

All notebook code is executed against the real libraries before being
committed (see repo history); the hardware cells are validated on the Aer
simulator with a thermal-relaxation noise model, and each notebook includes a
dry-run cell so you never waste hardware minutes on a broken pipeline.

PR flow verified end-to-end on 2026-08-07.

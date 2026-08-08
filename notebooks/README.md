# Lattice Atlas — companion notebooks

These notebooks are reproduction exercises, not committed execution receipts.
The repository currently stores no notebook outputs, backend job IDs, or
hardware counts.

| Rung | Where | What it verifies | Cost |
|---|---|---|---|
| 1 | [The Lab](https://galic1987.github.io/lattice-atlas/lab) (browser) | Ideal-check, i.i.d. data-Pauli toy behavior; not a circuit-level threshold | local, instant |
| 2 | `first-threshold-curve.ipynb` (Stim + PyMatching) | Estimate a threshold for one generated circuit/noise/decoder model, including sampling intervals | local, minutes |
| 3 | `real-hardware-error-suppression.ipynb` (provider account required) | Test a repetition-code trend on an available backend; report suppressive, non-suppressive, or inconclusive data | access and queue dependent |

Run them on [Google Colab](https://colab.research.google.com) or another Jupyter
environment. Hardware availability, pricing, quotas, and backend access can
change; check the provider's current terms before submitting a job.

Before treating a run as evidence, save the exact dependency versions, backend
name, job ID, circuit/transpilation settings, shot counts, raw counts, uncertainty
intervals, and the outcome test. A simulator dry run checks only the modeled
pipeline; it cannot validate current credentials, queues, calibration, or hardware.

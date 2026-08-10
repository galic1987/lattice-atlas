# IBM Quantum QEC demo

Runs the **3-qubit bit-flip (repetition) code** — the 1D surface/repetition code —
on a **real quantum backend** and records genuine, provenance-stamped results. It's
the honest hardware counterpart to the Lattice Atlas lab's in-browser *classical*
simulation: same syndrome idea (measure Z-parity stabilizers to detect a single X
error), but actually executed on a QPU.

## Why this is a CLI tool, not part of the website

The site is a static SPA on GitHub Pages with **no backend**. It cannot call IBM's
API from the browser without leaking a token (and IBM blocks browser CORS anyway),
so the app deliberately never claims live hardware access. This tool is where real
hardware runs happen — with your token, on your machine — producing an evidence
receipt you could later surface in the app with honest provenance.

## Honesty rules (non-negotiable)

- **With** an `QISKIT_IBM_TOKEN`, it submits to a real QPU and stamps the receipt
  with the backend name, **job id**, and timestamp (`executed_on: ibm_quantum_hardware`).
- **Without** a token, it runs on Qiskit's **Aer** simulator — real computation, but
  **not** hardware — and the receipt says exactly that
  (`executed_on: aer_simulator`, `provider: local-simulator`).
- Counts come straight from the backend result object. **Nothing is fabricated**,
  and a simulator run is never labeled as hardware.

## Setup

```bash
pip install -r requirements.txt
```

Token and options are read from the environment — **never hardcode or commit them**:

```bash
export QISKIT_IBM_TOKEN=...                       # required for hardware
export QISKIT_IBM_CHANNEL=ibm_quantum_platform    # optional (default)
export QISKIT_IBM_INSTANCE=...                    # optional (CRN / instance)
export QISKIT_IBM_BACKEND=...                     # optional; else least-busy real QPU
```

## Run

```bash
# Local Aer simulation (no token needed) — proves the circuit + pipeline:
python3 run_qec_demo.py

# On real IBM hardware:
QISKIT_IBM_TOKEN=... python3 run_qec_demo.py --shots 2048
```

It sweeps the four single-error cases (no error, X on each data qubit), prints
whether each produced its expected syndrome, and writes a JSON evidence receipt to
`/Volumes/Radiator 8TB/qtec/ibm_quantum_receipts/` (off-repo). On a noiseless
simulator every case matches exactly; on hardware you'll see the syndrome
distribution broadened by real device noise — which is the interesting part.

## Expected syndromes (Qiskit bit order `a1 a0`)

| error        | syndrome |
|--------------|----------|
| none         | `00`     |
| X on data 0  | `01`     |
| X on data 1  | `11`     |
| X on data 2  | `10`     |

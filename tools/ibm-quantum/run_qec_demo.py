#!/usr/bin/env python3
"""
Run the 3-qubit bit-flip repetition code on a REAL quantum backend and record
genuine, provenance-stamped results — the honest counterpart to the Lattice Atlas
lab's in-browser classical simulation.

The bit-flip code is the 1D surface (repetition) code: it encodes one logical
qubit in three physical qubits and detects/corrects a single X error via two
Z-parity stabilizer measurements (Z0Z1, Z1Z2) — exactly the syndrome idea the lab
teaches, but executed on hardware here.

HONESTY (non-negotiable):
  * With an IBM Quantum token in the environment, this submits to a real QPU and
    labels the receipt with the backend name, job id, and timestamp.
  * With no token, it runs on Qiskit's Aer simulator — real computation, but NOT
    hardware — and the receipt says so explicitly ("aer_simulator", provider
    "local-simulator"). It never claims hardware it did not use.
  * Nothing is fabricated: counts come straight from the backend's result object.

Token is read from the environment, NEVER hardcoded:
    export QISKIT_IBM_TOKEN=...            # required for hardware
    export QISKIT_IBM_CHANNEL=ibm_quantum_platform   # optional (default)
    export QISKIT_IBM_INSTANCE=...         # optional (CRN / instance)
    export QISKIT_IBM_BACKEND=...          # optional (else least-busy real QPU)

Usage:
    python3 run_qec_demo.py                # local Aer sim (no token needed)
    python3 run_qec_demo.py --shots 2048   # more shots
    QISKIT_IBM_TOKEN=... python3 run_qec_demo.py   # real IBM hardware
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone

from qiskit import QuantumCircuit, transpile

# ---- The code ---------------------------------------------------------------

# Data qubits 0,1,2 ; ancilla (syndrome) qubits 3,4.
DATA = [0, 1, 2]
ANC = [3, 4]

ERROR_CASES = [
    ("no error", None),
    ("X on data 0", 0),
    ("X on data 1", 1),
    ("X on data 2", 2),
]

# The single-X syndromes the code SHOULD report (a0=Z0Z1, a1=Z1Z2), as the
# 2-bit string "a1a0" that Qiskit prints (most-significant bit = highest clbit).
EXPECTED_SYNDROME = {
    "no error": "00",
    "X on data 0": "01",  # a0=1, a1=0
    "X on data 1": "11",  # a0=1, a1=1
    "X on data 2": "10",  # a0=0, a1=1
}


def build_circuit(logical: int, error_qubit: int | None) -> QuantumCircuit:
    """Encode |logical>_L into three qubits, optionally inject one X error, then
    extract the two Z-parity syndromes onto ancillas and measure them."""
    qc = QuantumCircuit(5, 2)
    # Encode: |1>_L = |111> (three-qubit repetition). |0>_L = |000>.
    if logical == 1:
        for q in DATA:
            qc.x(q)
    qc.barrier()
    # Inject a physical bit-flip error.
    if error_qubit is not None:
        qc.x(DATA[error_qubit])
    qc.barrier()
    # Syndrome extraction: a0 = parity(d0,d1), a1 = parity(d1,d2).
    qc.cx(DATA[0], ANC[0])
    qc.cx(DATA[1], ANC[0])
    qc.cx(DATA[1], ANC[1])
    qc.cx(DATA[2], ANC[1])
    qc.barrier()
    qc.measure(ANC[0], 0)  # clbit 0 = a0 (Z0Z1)
    qc.measure(ANC[1], 1)  # clbit 1 = a1 (Z1Z2)
    return qc


# ---- Backends ---------------------------------------------------------------


def get_hardware_backend():
    """Return (service, backend) for a real IBM QPU, or None if unavailable."""
    token = os.environ.get("QISKIT_IBM_TOKEN")
    if not token:
        return None
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService
    except ImportError:
        print("qiskit-ibm-runtime not installed; cannot reach hardware.", file=sys.stderr)
        return None
    channel = os.environ.get("QISKIT_IBM_CHANNEL", "ibm_quantum_platform")
    instance = os.environ.get("QISKIT_IBM_INSTANCE")
    kwargs = {"channel": channel, "token": token}
    if instance:
        kwargs["instance"] = instance
    service = QiskitRuntimeService(**kwargs)
    named = os.environ.get("QISKIT_IBM_BACKEND")
    backend = (
        service.backend(named)
        if named
        else service.least_busy(operational=True, simulator=False, min_num_qubits=5)
    )
    return service, backend


def run_on_hardware(backend, circuits, shots):
    """Submit via SamplerV2 and return (list_of_counts, provenance)."""
    from qiskit_ibm_runtime import SamplerV2

    tqc = transpile(circuits, backend=backend, optimization_level=1)
    sampler = SamplerV2(mode=backend)
    job = sampler.run(tqc, shots=shots)
    result = job.result()
    counts = [res.data.c.get_counts() for res in result]
    prov = {
        "executed_on": "ibm_quantum_hardware",
        "provider": "IBM Quantum",
        "backend": backend.name,
        "job_id": job.job_id(),
        "shots": shots,
    }
    return counts, prov


def run_on_aer(circuits, shots):
    """Real local simulation via Aer — explicitly NOT hardware."""
    from qiskit_aer import AerSimulator

    sim = AerSimulator()
    tqc = transpile(circuits, sim)
    counts = [sim.run(c, shots=shots).result().get_counts() for c in tqc]
    prov = {
        "executed_on": "aer_simulator",
        "provider": "local-simulator",
        "backend": "aer_simulator",
        "job_id": None,
        "shots": shots,
        "note": "Local Qiskit Aer simulation — real computation, but NOT IBM hardware.",
    }
    return counts, prov


# ---- Main -------------------------------------------------------------------


def majority_from_counts(counts: dict) -> None:
    return None  # syndrome-only readout in this minimal demo


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--shots", type=int, default=1024)
    parser.add_argument("--logical", type=int, choices=[0, 1], default=1,
                        help="logical state to encode before the error (default 1)")
    parser.add_argument("--out", default="/Volumes/Radiator 8TB/qtec/ibm_quantum_receipts",
                        help="directory for the evidence receipt (off-repo)")
    args = parser.parse_args()

    circuits = [build_circuit(args.logical, e) for _, e in ERROR_CASES]

    hw = get_hardware_backend()
    if hw is not None:
        service, backend = hw
        print(f"Submitting to IBM Quantum backend: {backend.name} ...")
        counts_list, prov = run_on_hardware(backend, circuits, args.shots)
    else:
        print("No IBM token found — running on the local Aer simulator (NOT hardware).")
        counts_list, prov = run_on_aer(circuits, args.shots)

    # Score each case: does the most-frequent syndrome match the expected one?
    rows = []
    correct = 0
    for (label, _), counts in zip(ERROR_CASES, counts_list):
        top = max(counts, key=counts.get)
        top_syndrome = top.replace(" ", "")[:2]
        expected = EXPECTED_SYNDROME[label]
        ok = top_syndrome == expected
        correct += ok
        shots = sum(counts.values())
        fidelity = counts.get(expected, 0) + counts.get(f"{expected[0]} {expected[1]}", 0)
        rows.append({
            "case": label,
            "expected_syndrome": expected,
            "most_frequent_syndrome": top_syndrome,
            "matches_expected": ok,
            "expected_syndrome_shots": counts.get(expected, 0),
            "shots": shots,
            "raw_counts": counts,
        })

    receipt = {
        "experiment": "3-qubit bit-flip (repetition) code — encode, single-X error, Z-parity syndrome",
        "logical_state": args.logical,
        "run_at_utc": datetime.now(timezone.utc).isoformat(),
        "provenance": prov,
        "cases_matching_expected_syndrome": f"{correct}/{len(ERROR_CASES)}",
        "results": rows,
    }

    print()
    print(f"  Executed on : {prov['executed_on']} ({prov.get('backend')})")
    if prov.get("job_id"):
        print(f"  Job id      : {prov['job_id']}")
    print(f"  Shots/case  : {prov['shots']}")
    print(f"  Syndrome hits: {correct}/{len(ERROR_CASES)} cases had the expected syndrome as top result")
    print()
    for r in rows:
        mark = "OK " if r["matches_expected"] else "!! "
        frac = r["expected_syndrome_shots"] / r["shots"] if r["shots"] else 0.0
        print(f"  {mark}{r['case']:<14} expected {r['expected_syndrome']}  "
              f"top {r['most_frequent_syndrome']}  "
              f"P(expected)={frac:5.1%}")

    # Save the receipt off-repo (never large binaries / never the main disk repo).
    try:
        os.makedirs(args.out, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        path = os.path.join(args.out, f"bitflip_{prov['executed_on']}_{stamp}.json")
        with open(path, "w") as fh:
            json.dump(receipt, fh, indent=2)
        print(f"\n  Evidence receipt: {path}")
    except OSError as exc:
        print(f"\n  (could not write receipt: {exc})", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

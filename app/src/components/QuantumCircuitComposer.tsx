import { useState, useRef } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { sound } from '@/lib/sound';
import { simulate, formatStatevector, formatProbabilities, type SimGate } from '@/lib/statevector';

export type GateType = 'H' | 'X' | 'Z' | 'S' | 'T' | 'CX';

export interface CircuitGate {
  id: string;
  type: GateType;
  qubit: number;
  targetQubit?: number;
}

const N_QUBITS = 3;

const INITIAL_GATES: CircuitGate[] = [
  { id: 'g1', type: 'H', qubit: 0 },
  { id: 'g2', type: 'CX', qubit: 0, targetQubit: 1 },
];

// Run the exact statevector simulator over the current gate list (in order).
function describe(circuitGates: CircuitGate[]): { vec: string; probs: string } {
  const state = simulate(circuitGates as SimGate[], N_QUBITS);
  return {
    vec: formatStatevector(state, N_QUBITS),
    probs: formatProbabilities(state, N_QUBITS),
  };
}

export default function QuantumCircuitComposer() {
  const [gates, setGates] = useState<CircuitGate[]>(INITIAL_GATES);
  const [qubitCount] = useState<number>(N_QUBITS);
  const [output, setOutput] = useState<{ vec: string; probs: string }>(() => describe(INITIAL_GATES));
  const gateCounter = useRef<number>(100);

  const addGate = (type: GateType, qubit: number) => {
    sound.playDecoderLock();
    gateCounter.current += 1;
    const newGate: CircuitGate = {
      id: `gate-${gateCounter.current}`,
      type,
      qubit,
      targetQubit: type === 'CX' ? (qubit + 1) % qubitCount : undefined,
    };
    const updated = [...gates, newGate];
    setGates(updated);
    setOutput(describe(updated));
  };

  const removeGate = (id: string) => {
    sound.playErrorFlip();
    const updated = gates.filter((g) => g.id !== id);
    setGates(updated);
    setOutput(describe(updated));
  };

  const clearCircuit = () => {
    sound.playErrorFlip();
    setGates([]);
    setOutput(describe([]));
  };

  const runSimulation = (circuitGates: CircuitGate[]) => {
    setOutput(describe(circuitGates));
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// INTERACTIVE QUANTUM CIRCUIT SIMULATOR</span>
            <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">3-QUBIT · EXACT STATEVECTOR</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Visual Quantum Circuit Composer</h3>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => runSimulation(gates)}
            className="btn-primary text-xs !px-3 !py-1.5"
          >
            <Play className="h-3.5 w-3.5" /> Simulate Circuit
          </button>
          <button
            type="button"
            onClick={clearCircuit}
            className="rounded-lg border border-ink-700 bg-ink-950 p-1.5 text-text-low hover:text-text-hi"
            title="Clear Circuit"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Build circuits from Hadamard (H), Pauli (X, Z), Phase (S, T), and CNOT (CX) gates on 3 wires.
        Each edit runs an exact 2³ = 8-amplitude statevector simulation — gate matrices applied in the
        order you added them — so phases (S, T) and entanglement (CX) are computed, not canned.
      </p>

      {/* Circuit Grid Wires */}
      <div className="mt-6 space-y-4 rounded-xl border border-ink-700 bg-ink-950 p-6">
        {Array.from({ length: qubitCount }).map((_, qIndex) => (
          <div key={qIndex} className="flex items-center gap-4">
            <span className="font-mono text-xs text-plaquette font-bold w-12 shrink-0">
              q[{qIndex}]:
            </span>

            {/* Wire */}
            <div className="relative flex-1 flex items-center h-12 bg-ink-900/60 rounded-lg border border-ink-800 px-4 gap-3 overflow-x-auto">
              <div className="absolute left-0 right-0 h-0.5 bg-ink-600 z-0" />

              {/* Gates on this wire */}
              {gates
                .filter((g) => g.qubit === qIndex || g.targetQubit === qIndex)
                .map((g) => (
                  <div
                    key={g.id}
                    onClick={() => removeGate(g.id)}
                    className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-plaquette bg-ink-950 font-mono text-xs font-bold text-plaquette cursor-pointer shadow-md hover:border-syndrome hover:text-syndrome"
                    title="Click to remove gate"
                  >
                    {g.type === 'CX' ? (g.qubit === qIndex ? '●' : '⊕') : g.type}
                  </div>
                ))}

              {/* Add Gate Buttons */}
              <div className="relative z-10 flex items-center gap-1.5 ml-auto">
                {(['H', 'X', 'Z', 'S', 'T', 'CX'] as GateType[]).map((gt) => (
                  <button
                    key={gt}
                    type="button"
                    onClick={() => addGate(gt, qIndex)}
                    className="h-6 w-6 rounded bg-ink-800 text-[10px] font-mono font-bold text-text-mid hover:bg-plaquette/20 hover:text-plaquette"
                    title={`Add ${gt} gate to q[${qIndex}]`}
                  >
                    +{gt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Statevector Simulation Output */}
        <div className="mt-4 rounded-lg border border-stabilizer/40 bg-stabilizer/10 p-4 font-mono text-xs">
          <span className="text-[10px] uppercase text-text-low block">Statevector |Ψ⟩ (exact):</span>
          <span className="font-bold text-sm text-stabilizer block mt-1 break-words">{output.vec}</span>
          {output.probs && (
            <span className="mt-2 block text-[11px] text-text-mid break-words">{output.probs}</span>
          )}
        </div>
      </div>
    </div>
  );
}

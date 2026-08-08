import { useState, useId } from 'react';
import { Calculator, Cpu, ShieldAlert, Clock, Database } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function QECOverheadCalculator() {
  const [logicalQubits, setLogicalQubits] = useState<number>(100);
  const [tGateCountLog10, setTGateCountLog10] = useState<number>(8); // 10^8 T gates
  const [physicalErrorRate, setPhysicalErrorRate] = useState<number>(0.001); // 0.1%

  const slider1Id = useId();
  const slider2Id = useId();

  // Calculations
  const tGates = Math.pow(10, tGateCountLog10);
  
  // Estimate required code distance d for P_L <= 1 / (K * N_T)
  const targetP_L = 1 / (logicalQubits * tGates);
  // P_L ≈ (p / p_th)^((d+1)/2)  with p_th = 0.01
  const pRatio = physicalErrorRate / 0.01;
  const rawDistance = Math.ceil((2 * Math.log(targetP_L)) / Math.log(pRatio) - 1);
  const distance = Math.max(3, rawDistance % 2 === 0 ? rawDistance + 1 : rawDistance);

  // Qubits per distance-d rotated patch = 2 * d^2
  const qubitsPerPatch = 2 * Math.pow(distance, 2);

  // Magic state distillation factory overhead (~15-to-1 factory requires ~12 * d^2 qubits)
  const factoryQubits = Math.ceil(logicalQubits * 0.4) * (12 * Math.pow(distance, 2));

  const totalPhysicalQubits = logicalQubits * qubitsPerPatch + factoryQubits;

  // Surface code cycle time ~1 microsecond (1 μs) per round
  // Total execution time ≈ N_T * d * 1 μs
  const executionTimeSeconds = (tGates * distance * 1e-6);

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec.toFixed(1)} seconds`;
    if (sec < 3600) return `${(sec / 60).toFixed(1)} minutes`;
    if (sec < 86400) return `${(sec / 3600).toFixed(1)} hours`;
    return `${(sec / 86400).toFixed(1)} days`;
  };

  return (
    <div className="rounded-2xl border border-magic/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// FAULT-TOLERANT QEC RESOURCE BUDGETING</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] text-magic font-bold">HARDWARE ESTIMATOR</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">FTQC QEC Overhead & Resource Calculator</h3>
        </div>

        <span className="rounded bg-plaquette/20 px-2.5 py-1 font-mono text-xs font-bold text-plaquette flex items-center gap-1">
          <Calculator className="h-3.5 w-3.5" /> OVERHEAD ENGINE
        </span>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Estimate the physical hardware scale (qubit count, code distance $d$, magic state distillation factories, and execution time) required for fault-tolerant algorithms based on physical error rates.
      </p>

      {/* Calculator Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Left Inputs */}
        <div className="space-y-5 rounded-xl border border-ink-700 bg-ink-950 p-5 font-mono text-xs">
          <div>
            <div className="flex justify-between text-text-low mb-1">
              <label htmlFor={slider1Id}>Algorithm Logical Qubits (K):</label>
              <span className="text-plaquette font-bold text-sm">{logicalQubits} qubits</span>
            </div>
            <input
              id={slider1Id}
              type="range"
              min="10"
              max="1000"
              step="10"
              value={logicalQubits}
              onChange={(e) => {
                sound.playDecoderLock();
                setLogicalQubits(Number(e.target.value));
              }}
              className="w-full accent-plaquette cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-low mb-1">
              <label htmlFor={slider2Id}>Required T-Gate Depth (10^N):</label>
              <span className="text-star font-bold text-sm">10^{tGateCountLog10} ({tGates.toExponential(0)} T gates)</span>
            </div>
            <input
              id={slider2Id}
              type="range"
              min="4"
              max="12"
              step="1"
              value={tGateCountLog10}
              onChange={(e) => {
                sound.playDecoderLock();
                setTGateCountLog10(Number(e.target.value));
              }}
              className="w-full accent-star cursor-pointer"
            />
          </div>

          <div>
            <span className="text-text-low block mb-2">Physical Error Rate (p):</span>
            <div className="grid grid-cols-3 gap-2">
              {[0.001, 0.0005, 0.0001].map((pVal) => (
                <button
                  key={pVal}
                  type="button"
                  onClick={() => {
                    sound.playDecoderLock();
                    setPhysicalErrorRate(pVal);
                  }}
                  className={`py-1.5 px-2 rounded border text-center font-bold transition-colors ${
                    physicalErrorRate === pVal
                      ? 'border-magic bg-magic/20 text-magic'
                      : 'border-ink-800 bg-ink-900 text-text-mid'
                  }`}
                >
                  {(pVal * 100).toFixed(2)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Budget Metrics */}
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="rounded-xl border border-plaquette/40 bg-plaquette/10 p-4 flex flex-col justify-between">
            <span className="text-text-low text-[10px] uppercase flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-plaquette" /> Required Distance
            </span>
            <div>
              <span className="text-2xl font-bold text-plaquette block">d = {distance}</span>
              <span className="text-[10px] text-text-low">{(qubitsPerPatch)} physical qubits/patch</span>
            </div>
          </div>

          <div className="rounded-xl border border-star/40 bg-star/10 p-4 flex flex-col justify-between">
            <span className="text-text-low text-[10px] uppercase flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-star" /> Total Qubits
            </span>
            <div>
              <span className="text-xl font-bold text-star block">{totalPhysicalQubits.toLocaleString()}</span>
              <span className="text-[10px] text-text-low">incl. 15-to-1 T-factories</span>
            </div>
          </div>

          <div className="rounded-xl border border-magic/40 bg-magic/10 p-4 flex flex-col justify-between">
            <span className="text-text-low text-[10px] uppercase flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-magic" /> Runtime
            </span>
            <div>
              <span className="text-base font-bold text-magic block">{formatSeconds(executionTimeSeconds)}</span>
              <span className="text-[10px] text-text-low">@ 1 μs surface cycle</span>
            </div>
          </div>

          <div className="rounded-xl border border-stabilizer/40 bg-stabilizer/10 p-4 flex flex-col justify-between">
            <span className="text-text-low text-[10px] uppercase flex items-center gap-1">
              <Database className="h-3.5 w-3.5 text-stabilizer" /> Target Logical Error
            </span>
            <div>
              <span className="text-xs font-bold text-stabilizer block">{targetP_L.toExponential(2)}</span>
              <span className="text-[10px] text-text-low">P_L per algorithm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

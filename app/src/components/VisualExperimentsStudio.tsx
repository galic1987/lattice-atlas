import { useState, useEffect } from 'react';
import { Sparkles, Shield, Play, Pause, Flame, Layers, RotateCcw } from 'lucide-react';
import { sound } from '@/lib/sound';

type ExperimentTab = 'fibonacci-anyon' | 'color-code' | 'defect-em-duality' | 'fault-emitter';

export default function VisualExperimentsStudio() {
  const [activeTab, setActiveTab] = useState<ExperimentTab>('fibonacci-anyon');

  // --- EXPERIMENT 1: FIBONACCI ANYON BRAIDING ---
  const [anyonPositions, setAnyonPositions] = useState<Array<{ id: number; x: number; y: number }>>([
    { id: 1, x: 100, y: 150 },
    { id: 2, x: 170, y: 150 },
    { id: 3, x: 240, y: 150 },
    { id: 4, x: 310, y: 150 },
  ]);
  const [braidHistory, setBraidHistory] = useState<string[]>([]);

  const handleBraid = (i1: number, i2: number) => {
    setAnyonPositions((prev) => {
      const next = [...prev];
      const tmpX = next[i1].x;
      next[i1] = { ...next[i1], x: next[i2].x };
      next[i2] = { ...next[i2], x: tmpX };
      return next;
    });
    setBraidHistory((prev) => [...prev, `B_${i1 + 1}`]);
    sound.playSyndromeTick();
  };

  const resetBraids = () => {
    setAnyonPositions([
      { id: 1, x: 100, y: 150 },
      { id: 2, x: 170, y: 150 },
      { id: 3, x: 240, y: 150 },
      { id: 4, x: 310, y: 150 },
    ]);
    setBraidHistory([]);
    sound.playDecoderLock();
  };

  // --- EXPERIMENT 2: COLOR CODE TRANSVERSAL GATES ---
  const [colorCodeGate, setColorCodeGate] = useState<'I' | 'H' | 'S' | 'T'>('I');

  const applyTransversalGate = (gate: 'I' | 'H' | 'S' | 'T') => {
    setColorCodeGate(gate);
    sound.playSyndromeTick();
  };

  // --- EXPERIMENT 3: DEFECT PINNING & E-M DUALITY ---
  const [chargeType, setChargeType] = useState<'e' | 'm'>('e');
  const [crossedWall, setCrossedWall] = useState<boolean>(false);

  const toggleDomainWallPassage = () => {
    setCrossedWall((prev) => !prev);
    setChargeType((prev) => (prev === 'e' ? 'm' : 'e'));
    sound.playErrorFlip();
  };

  // --- EXPERIMENT 4: REAL-TIME FAULT EMITTER MACHINE ---
  const [emitterActive, setEmitterActive] = useState<boolean>(false);
  const [errorRate, setErrorRate] = useState<number>(0.02); // 2%
  const [faultCount, setFaultCount] = useState<number>(0);
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [heatMap, setHeatMap] = useState<number[]>(() => new Array(16).fill(0));

  useEffect(() => {
    if (!emitterActive) return;
    const interval = setInterval(() => {
      setSurvivalTime((t) => t + 0.1);
      // Spawn faults based on error rate
      const newFaults = Math.floor(Math.random() * 4 * (errorRate / 0.01));
      if (newFaults > 0) {
        setFaultCount((f) => f + newFaults);
        setHeatMap((prev) => {
          const next = [...prev];
          const idx = Math.floor(Math.random() * 16);
          next[idx] = Math.min(10, next[idx] + 1);
          return next;
        });
        sound.playErrorFlip();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [emitterActive, errorRate]);

  const resetEmitter = () => {
    setEmitterActive(false);
    setFaultCount(0);
    setSurvivalTime(0);
    setHeatMap(new Array(16).fill(0));
    sound.playDecoderLock();
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-plaquette" />
            <h2 className="font-display text-xl font-bold text-text-hi">
              Interactive Topological &amp; QEC Visual Experiments
            </h2>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Four interactive physics experiments: Fibonacci anyon braiding, 3D color code gates, e-m duality domain walls, &amp; fault emitters.
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          4 Visual Experiments
        </span>
      </div>

      {/* Experiment Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('fibonacci-anyon');
            sound.playSyndromeTick();
          }}
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
            activeTab === 'fibonacci-anyon'
              ? 'border-plaquette bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
              : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-plaquette" />
          <span>1. Fibonacci Anyon Braiding</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('color-code');
            sound.playSyndromeTick();
          }}
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
            activeTab === 'color-code'
              ? 'border-magic bg-magic/15 font-semibold text-text-hi shadow-glow-violet'
              : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
          }`}
        >
          <Shield className="h-3.5 w-3.5 text-magic" />
          <span>2. 3D Color Code Transversal Gates</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('defect-em-duality');
            sound.playSyndromeTick();
          }}
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
            activeTab === 'defect-em-duality'
              ? 'border-stabilizer bg-stabilizer/15 font-semibold text-text-hi'
              : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-stabilizer" />
          <span>3. Defect &amp; e-m Duality Walls</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('fault-emitter');
            sound.playSyndromeTick();
          }}
          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
            activeTab === 'fault-emitter'
              ? 'border-syndrome bg-syndrome/15 font-semibold text-text-hi'
              : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-syndrome" />
          <span>4. Fault Emitter Machine</span>
        </button>
      </div>

      {/* EXPERIMENT 1: FIBONACCI ANYON BRAIDING */}
      {activeTab === 'fibonacci-anyon' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-4 min-h-[380px]">
            <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
              <span className="text-text-hi font-bold">SU(2)_3 Fibonacci Anyons ($\tau$)</span> · Quantum Dimension $d_\tau = \phi \approx 1.618$
            </div>

            <div className="relative w-full max-w-[420px] aspect-[4/3] my-4">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* World-Line Spacetime Trails */}
                <line x1="50" y1="260" x2="350" y2="260" stroke="#3D5178" strokeWidth="1" strokeDasharray="3 3" />
                <text x="50" y="275" fill="#8491AD" fontSize="10" fontFamily="monospace">Space (x)</text>

                {/* Spacetime worldlines for each anyon */}
                {anyonPositions.map((a) => (
                  <g key={a.id}>
                    <line x1={a.x} y1="250" x2={a.x} y2="150" stroke="#22D3EE" strokeWidth="2.5" strokeOpacity="0.7" />
                    <circle cx={a.x} cy="150" r="16" fill="#0F172A" stroke="#22D3EE" strokeWidth="2.5" />
                    <text x={a.x} y="154" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      τ{a.id}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => handleBraid(0, 1)} className="btn-secondary text-xs">
                Braid B₁ (τ₁ ⊗ τ₂)
              </button>
              <button type="button" onClick={() => handleBraid(1, 2)} className="btn-secondary text-xs">
                Braid B₂ (τ₂ ⊗ τ₃)
              </button>
              <button type="button" onClick={() => handleBraid(2, 3)} className="btn-secondary text-xs">
                Braid B₃ (τ₃ ⊗ τ₄)
              </button>
              <button type="button" onClick={resetBraids} className="btn-secondary text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <h4 className="eyebrow mb-2 !text-plaquette">// NON-ABELIAN BRAID SEQUENCE</h4>
              <div className="rounded-lg bg-ink-900 p-3 border border-ink-700 font-bold text-plaquette">
                {braidHistory.length === 0 ? 'No braids applied yet. Click B_1 or B_2 above!' : braidHistory.join(' · ')}
              </div>
            </div>

            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <h4 className="eyebrow mb-2 !text-magic">// FIBONACCI FUSION RULE</h4>
              <p className="text-text-mid font-sans text-xs leading-relaxed">
                Fibonacci anyons obey $\tau \otimes \tau = I \oplus \tau$. Braiding anyons carries out non-Abelian quantum logic matrix multiplications $B_1 B_2 \neq B_2 B_1$ protected by topology!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EXPERIMENT 2: 3D COLOR CODE TRANSVERSAL GATES */}
      {activeTab === 'color-code' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-4 min-h-[380px]">
            <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
              <span className="text-text-hi font-bold">[[7,1,3]] Steane &amp; 3D Color Code Lattice</span> · Transversal Gate Suite
            </div>

            <div className="relative w-full max-w-[360px] aspect-square my-4">
              <svg viewBox="0 0 300 300" className="w-full h-full">
                {/* 3-Colorable Triangular Plaquettes */}
                <polygon points="150,40 50,220 250,220" fill="#F43F5E" fillOpacity="0.2" stroke="#F43F5E" strokeWidth="2" />
                <polygon points="150,40 150,160 50,220" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="2" />
                <polygon points="150,40 150,160 250,220" fill="#22D3EE" fillOpacity="0.25" stroke="#22D3EE" strokeWidth="2" />

                {/* Physical Qubit Vertices */}
                {[[150, 40], [50, 220], [250, 220], [150, 160], [100, 130], [200, 130], [150, 220]].map(([x, y], idx) => (
                  <circle key={idx} cx={x} cy={y} r="10" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
                ))}
              </svg>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => applyTransversalGate('H')} className="btn-secondary text-xs">
                Transversal H (Hadamard)
              </button>
              <button type="button" onClick={() => applyTransversalGate('S')} className="btn-secondary text-xs">
                Transversal S (Phase)
              </button>
              <button type="button" onClick={() => applyTransversalGate('T')} className="btn-secondary text-xs">
                Transversal T (3D Code)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <h4 className="eyebrow mb-2 !text-magic">// ACTIVE TRANSVERSAL GATE</h4>
              <div className="rounded-lg bg-ink-900 p-3 border border-ink-700 font-bold text-2xl text-plaquette">
                {colorCodeGate === 'I' ? 'Identity (I)' : `${colorCodeGate} Gate Transversal`}
              </div>
            </div>

            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 font-sans text-xs text-text-mid leading-relaxed">
              Color codes allow transversal implementation of all Clifford gates (H, S, CNOT) without distillation. 3D Color Codes extend transversality to non-Clifford T-gates!
            </div>
          </div>
        </div>
      )}

      {/* EXPERIMENT 3: DEFECT PINNING & E-M DUALITY */}
      {activeTab === 'defect-em-duality' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-4 min-h-[380px]">
            <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
              <span className="text-text-hi font-bold">Electric-Magnetic (e-m) Duality Domain Wall</span>
            </div>

            <div className="relative w-full max-w-[380px] aspect-[4/3] my-4">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Domain Wall Line */}
                <line x1="200" y1="20" x2="200" y2="280" stroke="#F5B83D" strokeWidth="3" strokeDasharray="6 6" />
                <text x="200" y="15" textAnchor="middle" fill="#F5B83D" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  e-m Duality Wall
                </text>

                {/* Charge Particle */}
                <circle
                  cx={crossedWall ? 280 : 120}
                  cy="150"
                  r="18"
                  fill={chargeType === 'e' ? '#22D3EE' : '#8B5CF6'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                <text
                  x={crossedWall ? 280 : 120}
                  y="155"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {chargeType}
                </text>
              </svg>
            </div>

            <button type="button" onClick={toggleDomainWallPassage} className="btn-primary text-xs">
              Pass Anyon Through Domain Wall (e ↔ m Shift)
            </button>
          </div>

          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <h4 className="eyebrow mb-2 !text-stabilizer">// ANYON SPECIES STATUS</h4>
              <div className="rounded-lg bg-ink-900 p-3 border border-ink-700 font-bold text-lg text-plaquette">
                {chargeType === 'e' ? 'Electric Charge (e-anyon)' : 'Magnetic Monopole (m-anyon)'}
              </div>
            </div>

            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 font-sans text-xs text-text-mid leading-relaxed">
              Passing an electric charge (e) through a domain wall transforms it into a magnetic monopole (m), demonstrating Z2 symmetry twisting in topological order.
            </div>
          </div>
        </div>
      )}

      {/* EXPERIMENT 4: REAL-TIME FAULT EMITTER MACHINE */}
      {activeTab === 'fault-emitter' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-4 min-h-[380px]">
            <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
              <span className="text-text-hi font-bold">Continuous Particle Stream Fault Emitter</span> · random fault accumulation (no decoder)
            </div>

            <div className="relative w-full max-w-[360px] aspect-square my-4 grid grid-cols-4 gap-2 p-2 bg-ink-950 rounded-xl border border-ink-700">
              {heatMap.map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all duration-200"
                  style={{
                    backgroundColor: val > 0 ? `rgba(244, 63, 94, ${Math.min(1, val * 0.2)})` : '#0F172A',
                    borderColor: val > 0 ? '#F43F5E' : '#3D5178',
                    borderWidth: '1px',
                    color: val > 0 ? '#FFFFFF' : '#8491AD',
                  }}
                >
                  q{idx}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEmitterActive((prev) => !prev)}
                className="btn-primary text-xs"
              >
                {emitterActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {emitterActive ? 'Pause Emitter' : 'Start Fault Emitter'}
              </button>
              <button type="button" onClick={resetEmitter} className="btn-secondary text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 font-mono text-xs">
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <h4 className="eyebrow mb-2 !text-syndrome">// FAULT EMITTER — RANDOM ACCUMULATION (NO DECODER)</h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-ink-900 p-2.5 rounded-lg border border-ink-700">
                  <span>Survival Time:</span>
                  <span className="font-bold text-plaquette">{survivalTime.toFixed(1)}s</span>
                </div>

                <div className="flex justify-between items-center bg-ink-900 p-2.5 rounded-lg border border-ink-700">
                  <span>Faults emitted:</span>
                  <span className="font-bold text-syndrome">{faultCount} Pauli errors</span>
                </div>

                <p className="text-[11px] leading-relaxed text-text-low">
                  This is a random fault emitter for intuition — no decoder runs here, and nothing is
                  neutralized. The real MWPM decoder and Monte Carlo live in the Lab, the Experiment Bench,
                  and the Threshold Sandbox.
                </p>

                <div>
                  <div className="flex justify-between text-text-mid mb-1">
                    <span>Noise Rate (p):</span>
                    <span className="font-bold text-text-hi">{(errorRate * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.005"
                    max="0.05"
                    step="0.005"
                    value={errorRate}
                    onChange={(e) => setErrorRate(parseFloat(e.target.value))}
                    className="w-full accent-syndrome"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

type Pauli = 'I' | 'X' | 'Y' | 'Z';

interface CodeDefinition {
  id: string;
  name: string;
  n: number;
  k: number;
  d: number;
  category: 'classical' | 'repetition' | 'concatenated' | 'css' | 'perfect';
  description: string;
  transversalGates: string[];
}

const CODES: CodeDefinition[] = [
  {
    id: 'steane-7',
    name: 'Steane 7-Qubit CSS Code',
    n: 7,
    k: 1,
    d: 3,
    category: 'css',
    description: 'Derived from Hamming [7,4,3] via CSS construction. Features 7-point Fano Plane geometry and supports transversal Clifford gates (H, S, CNOT).',
    transversalGates: ['H', 'S', 'CNOT', 'X', 'Z'],
  },
  {
    id: 'shor-9',
    name: 'Shor 9-Qubit Concatenated Code',
    n: 9,
    k: 1,
    d: 3,
    category: 'concatenated',
    description: 'The first QEC code discovered by Peter Shor (1995). Concatenates a 3-qubit phase-flip code with 3-qubit bit-flip codes to protect against any single-qubit error.',
    transversalGates: ['X', 'Z', 'CNOT'],
  },
  {
    id: 'perfect-5',
    name: '5-Qubit Perfect Code',
    n: 5,
    k: 1,
    d: 3,
    category: 'perfect',
    description: 'The smallest possible quantum code capable of protecting 1 logical qubit against any arbitrary single-qubit error (X, Y, or Z) using cyclic stabilizers.',
    transversalGates: ['X', 'Z'],
  },
  {
    id: 'quantum-rep-3',
    name: '3-Qubit Quantum Repetition Code',
    n: 3,
    k: 1,
    d: 1,
    category: 'repetition',
    description: 'Protects against bit-flip (X) OR phase-flip (Z) errors individually (distance 1 against arbitrary errors, distance 3 against pure bit-flips).',
    transversalGates: ['X', 'Z', 'CNOT'],
  },
  {
    id: 'hamming-7',
    name: 'Classical Hamming [7,4,3] Code',
    n: 7,
    k: 4,
    d: 3,
    category: 'classical',
    description: 'The foundational classical linear error-correcting code encoding 4 data bits into 7 code bits with single-bit error correction capability (s = H · r^T).',
    transversalGates: ['NOT'],
  },
];

// Fano Plane layout coordinates (7 points)
const FANO_POINTS = [
  { id: 0, label: 'q0', x: 160, y: 35, role: 'Top Vertex' },
  { id: 1, label: 'q1', x: 45, y: 235, role: 'Left Vertex' },
  { id: 2, label: 'q2', x: 275, y: 235, role: 'Right Vertex' },
  { id: 3, label: 'q3', x: 102, y: 135, role: 'Left Edge Mid' },
  { id: 4, label: 'q4', x: 218, y: 135, role: 'Right Edge Mid' },
  { id: 5, label: 'q5', x: 160, y: 235, role: 'Base Mid' },
  { id: 6, label: 'q6', x: 160, y: 170, role: 'Center Circle' },
];

// Steane 6 Generators: 3 X-generators and 3 Z-generators
const STEANE_GENERATORS = [
  { id: 'X1', type: 'X', qubits: [0, 3, 4, 6], color: '#22D3EE', label: 'X_0 X_3 X_4 X_6' },
  { id: 'X2', type: 'X', qubits: [1, 3, 5, 6], color: '#22D3EE', label: 'X_1 X_3 X_5 X_6' },
  { id: 'X3', type: 'X', qubits: [2, 4, 5, 6], color: '#22D3EE', label: 'X_2 X_4 X_5 X_6' },
  { id: 'Z1', type: 'Z', qubits: [0, 3, 4, 6], color: '#8B5CF6', label: 'Z_0 Z_3 Z_4 Z_6' },
  { id: 'Z2', type: 'Z', qubits: [1, 3, 5, 6], color: '#8B5CF6', label: 'Z_1 Z_3 Z_5 Z_6' },
  { id: 'Z3', type: 'Z', qubits: [2, 4, 5, 6], color: '#8B5CF6', label: 'Z_2 Z_4 Z_5 Z_6' },
];

// 5-Qubit cyclic generators
const PERFECT_5_GENERATORS = [
  { id: 'g1', qubits: [0, 1, 2, 3, 4], pauli: ['X', 'Z', 'Z', 'X', 'I'], label: 'XZZX I' },
  { id: 'g2', qubits: [0, 1, 2, 3, 4], pauli: ['I', 'X', 'Z', 'Z', 'X'], label: 'I XZZX' },
  { id: 'g3', qubits: [0, 1, 2, 3, 4], pauli: ['X', 'I', 'X', 'Z', 'Z'], label: 'X IXZZ' },
  { id: 'g4', qubits: [0, 1, 2, 3, 4], pauli: ['Z', 'X', 'I', 'X', 'Z'], label: 'ZX IXZ' },
];

export default function StandardCodeZooStudio() {
  const [selectedCodeId, setSelectedCodeId] = useState<string>('steane-7');
  const [qubitErrors, setQubitErrors] = useState<Pauli[]>(() => new Array(9).fill('I'));

  const code = useMemo(() => CODES.find((c) => c.id === selectedCodeId) ?? CODES[0], [selectedCodeId]);

  const togglePauli = (idx: number) => {
    setQubitErrors((prev) => {
      const next = [...prev];
      const cur = next[idx];
      const seq: Pauli[] = ['I', 'X', 'Z', 'Y'];
      const nextP = seq[(seq.indexOf(cur) + 1) % seq.length];
      next[idx] = nextP;
      return next;
    });
    sound.playSyndromeTick();
  };

  const clearAllErrors = () => {
    setQubitErrors(new Array(9).fill('I'));
    sound.playDecoderLock();
  };

  // Compute exact syndromes for Steane 7-qubit code
  const steaneSyndrome = useMemo(() => {
    if (code.id !== 'steane-7') return { xSyndromes: [], zSyndromes: [], totalFires: 0 };
    
    // X-syndrome measures Z errors (anticommutes)
    const xSyndromes = STEANE_GENERATORS.filter((g) => g.type === 'X').map((g) => {
      let fires = false;
      for (const qIdx of g.qubits) {
        const err = qubitErrors[qIdx];
        if (err === 'Z' || err === 'Y') fires = !fires;
      }
      return { id: g.id, label: g.label, fires };
    });

    // Z-syndrome measures X errors (anticommutes)
    const zSyndromes = STEANE_GENERATORS.filter((g) => g.type === 'Z').map((g) => {
      let fires = false;
      for (const qIdx of g.qubits) {
        const err = qubitErrors[qIdx];
        if (err === 'X' || err === 'Y') fires = !fires;
      }
      return { id: g.id, label: g.label, fires };
    });

    const totalFires = xSyndromes.filter((s) => s.fires).length + zSyndromes.filter((s) => s.fires).length;
    return { xSyndromes, zSyndromes, totalFires };
  }, [code.id, qubitErrors]);

  // Compute Shor 9-qubit code syndromes
  const shorSyndrome = useMemo(() => {
    if (code.id !== 'shor-9') return { bitFlipChecks: [], phaseFlipChecks: [], totalFires: 0 };

    // Bit-flip checks within 3 blocks: (0,1), (1,2), (3,4), (4,5), (6,7), (7,8)
    const bitFlipChecks = [
      { id: 'Z01', q1: 0, q2: 1, fires: (qubitErrors[0] === 'X' || qubitErrors[0] === 'Y') !== (qubitErrors[1] === 'X' || qubitErrors[1] === 'Y') },
      { id: 'Z12', q1: 1, q2: 2, fires: (qubitErrors[1] === 'X' || qubitErrors[1] === 'Y') !== (qubitErrors[2] === 'X' || qubitErrors[2] === 'Y') },
      { id: 'Z34', q1: 3, q2: 4, fires: (qubitErrors[3] === 'X' || qubitErrors[3] === 'Y') !== (qubitErrors[4] === 'X' || qubitErrors[4] === 'Y') },
      { id: 'Z45', q1: 4, q2: 5, fires: (qubitErrors[4] === 'X' || qubitErrors[4] === 'Y') !== (qubitErrors[5] === 'X' || qubitErrors[5] === 'Y') },
      { id: 'Z67', q1: 6, q2: 7, fires: (qubitErrors[6] === 'X' || qubitErrors[6] === 'Y') !== (qubitErrors[7] === 'X' || qubitErrors[7] === 'Y') },
      { id: 'Z78', q1: 7, q2: 8, fires: (qubitErrors[7] === 'X' || qubitErrors[7] === 'Y') !== (qubitErrors[8] === 'X' || qubitErrors[8] === 'Y') },
    ];

    // Phase-flip checks between block 1-2 and block 2-3
    const phaseCount1 = [0,1,2].filter(i => qubitErrors[i] === 'Z' || qubitErrors[i] === 'Y').length % 2;
    const phaseCount2 = [3,4,5].filter(i => qubitErrors[i] === 'Z' || qubitErrors[i] === 'Y').length % 2;
    const phaseCount3 = [6,7,8].filter(i => qubitErrors[i] === 'Z' || qubitErrors[i] === 'Y').length % 2;

    const phaseFlipChecks = [
      { id: 'X_1_2', label: 'X_1...6 (Block 1-2 parity)', fires: phaseCount1 !== phaseCount2 },
      { id: 'X_2_3', label: 'X_4...9 (Block 2-3 parity)', fires: phaseCount2 !== phaseCount3 },
    ];

    const totalFires = bitFlipChecks.filter(c => c.fires).length + phaseFlipChecks.filter(c => c.fires).length;
    return { bitFlipChecks, phaseFlipChecks, totalFires };
  }, [code.id, qubitErrors]);

  const activeErrorCount = qubitErrors.slice(0, code.n).filter((p) => p !== 'I').length;

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-850 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-plaquette" />
            <h2 className="font-display text-xl font-bold text-text-hi">Standard Quantum Code Zoo Studio</h2>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Interactive, 100% physically accurate visualizer for canonical quantum and classical error-correcting codes.
          </p>
        </div>

        <button
          type="button"
          onClick={clearAllErrors}
          className="flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-plaquette/50 hover:text-text-hi"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Clear Faults
        </button>
      </div>

      {/* Code Selector Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CODES.map((c) => {
          const active = c.id === code.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCodeId(c.id);
                setQubitErrors(new Array(9).fill('I'));
                sound.playSyndromeTick();
              }}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                active
                  ? 'border-plaquette/70 bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
                  : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <span className="font-mono text-[11px] font-bold text-plaquette">
                [[{c.n}, {c.k}, {c.d}]]
              </span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Viewport */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Visual Canvas Area */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900/90 p-6 min-h-[380px]">
          {/* Code Header Info */}
          <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
            <span className="text-text-hi font-bold">[[n={code.n}, k={code.k}, d={code.d}]]</span> · {code.category.toUpperCase()} CODE
          </div>

          {/* Steane 7 Fano Plane Visualizer */}
          {code.id === 'steane-7' && (
            <div className="relative w-full max-w-[340px] aspect-square my-4">
              <svg viewBox="0 0 320 280" className="w-full h-full">
                {/* Fano Triangle Outer Lines */}
                <line x1="160" y1="35" x2="45" y2="235" stroke="#3D5178" strokeWidth="2" />
                <line x1="45" y1="235" x2="275" y2="235" stroke="#3D5178" strokeWidth="2" />
                <line x1="275" y1="235" x2="160" y2="35" stroke="#3D5178" strokeWidth="2" />

                {/* Fano Internal Altitudes */}
                <line x1="160" y1="35" x2="160" y2="235" stroke="#3D5178" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="45" y1="235" x2="218" y2="135" stroke="#3D5178" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="275" y1="235" x2="102" y2="135" stroke="#3D5178" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Fano Inscribed Circle */}
                <circle cx="160" cy="170" r="65" fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.3" />

                {/* Fano Qubit Nodes */}
                {FANO_POINTS.map((pt) => {
                  const err = qubitErrors[pt.id];
                  const hasErr = err !== 'I';
                  return (
                    <g key={pt.id} className="cursor-pointer" onClick={() => togglePauli(pt.id)} role="button" tabIndex={0} aria-label="Toggle element" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const h = () => togglePauli(pt.id); h(); } }}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hasErr ? '18' : '14'}
                        fill={hasErr ? (err === 'X' ? '#F43F5E' : err === 'Z' ? '#8B5CF6' : '#F5B83D') : '#121A2D'}
                        stroke={hasErr ? '#FFFFFF' : '#22D3EE'}
                        strokeWidth={hasErr ? '3' : '2'}
                        className="transition-all duration-200 hover:scale-110"
                      />
                      <text
                        x={pt.x}
                        y={pt.y + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {hasErr ? err : pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="text-center font-mono text-[11px] text-text-low mt-2">
                Click any node (q0..q6) to cycle Pauli errors: <span className="text-rose-400">X</span> → <span className="text-violet-400">Z</span> → <span className="text-amber-400">Y</span> → <span className="text-text-mid">I</span>
              </div>
            </div>
          )}

          {/* Shor 9-Qubit Matrix Visualizer */}
          {code.id === 'shor-9' && (
            <div className="flex flex-col items-center gap-6 my-4 w-full max-w-md">
              <div className="grid grid-cols-3 gap-4 w-full">
                {[0, 1, 2].map((blockIdx) => (
                  <div key={blockIdx} className="rounded-lg border border-ink-600 bg-ink-800/80 p-3 flex flex-col items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-plaquette">BLOCK {blockIdx + 1}</span>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => {
                        const qIdx = blockIdx * 3 + i;
                        const err = qubitErrors[qIdx];
                        const hasErr = err !== 'I';
                        return (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => togglePauli(qIdx)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-200 ${
                              hasErr
                                ? err === 'X'
                                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                  : err === 'Z'
                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                                    : 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                : 'border border-plaquette/50 bg-ink-900 text-text-hi hover:border-plaquette'
                            }`}
                          >
                            {hasErr ? err : `q${qIdx}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center font-mono text-[11px] text-text-low">
                Click any qubit to inject <span className="text-rose-400">X (Bit-flip)</span> or <span className="text-violet-400">Z (Phase-flip)</span> errors across the 3 concatenated blocks.
              </div>
            </div>
          )}

          {/* 5-Qubit Pentagon Visualizer */}
          {code.id === 'perfect-5' && (
            <div className="relative w-full max-w-[280px] aspect-square my-4">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                {/* Pentagon Ring Lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const angle1 = (i * 72 - 90) * (Math.PI / 180);
                  const angle2 = (((i + 1) % 5) * 72 - 90) * (Math.PI / 180);
                  const x1 = 120 + 80 * Math.cos(angle1);
                  const y1 = 120 + 80 * Math.sin(angle1);
                  const x2 = 120 + 80 * Math.cos(angle2);
                  const y2 = 120 + 80 * Math.sin(angle2);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3D5178" strokeWidth="2" />;
                })}

                {/* Pentagon Nodes */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const angle = (i * 72 - 90) * (Math.PI / 180);
                  const x = 120 + 80 * Math.cos(angle);
                  const y = 120 + 80 * Math.sin(angle);
                  const err = qubitErrors[i];
                  const hasErr = err !== 'I';
                  return (
                    <g key={i} className="cursor-pointer" onClick={() => togglePauli(i)} role="button" tabIndex={0} aria-label="Toggle element" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const h = () => togglePauli(i); h(); } }}>
                      <circle
                        cx={x}
                        cy={y}
                        r={hasErr ? '18' : '14'}
                        fill={hasErr ? (err === 'X' ? '#F43F5E' : err === 'Z' ? '#8B5CF6' : '#F5B83D') : '#121A2D'}
                        stroke={hasErr ? '#FFFFFF' : '#F5B83D'}
                        strokeWidth={hasErr ? '3' : '2'}
                      />
                      <text x={x} y={y + 4} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
                        {hasErr ? err : `q${i}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* 3-Qubit Repetition / Classical Hamming */}
          {(code.id === 'quantum-rep-3' || code.id === 'hamming-7') && (
            <div className="flex flex-wrap items-center justify-center gap-3 my-8">
              {Array.from({ length: code.n }).map((_, i) => {
                const err = qubitErrors[i];
                const hasErr = err !== 'I';
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePauli(i)}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl font-mono text-sm font-bold transition-all duration-200 ${
                      hasErr
                        ? err === 'X'
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'border border-ink-600 bg-ink-800 text-text-hi hover:border-plaquette'
                    }`}
                  >
                    {hasErr ? err : `q${i}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Syndrome & Physics Inspector */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <h3 className="eyebrow mb-3 !text-plaquette">// SYNDROME INSPECTOR</h3>

            <div className="mb-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-text-mid">Active Faults:</span>
                <span className={`font-bold ${activeErrorCount > 0 ? 'text-syndrome' : 'text-stabilizer'}`}>
                  {activeErrorCount} Pauli error{activeErrorCount === 1 ? '' : 's'}
                </span>
              </div>

              {code.id === 'steane-7' && (
                <>
                  <div className="text-[11px] font-bold uppercase text-text-low pt-2">X-Checks (Z Errors):</div>
                  {steaneSyndrome.xSyndromes.map((s) => (
                    <div key={s.id} className="flex justify-between items-center rounded bg-ink-900/60 px-2.5 py-1.5">
                      <span className="text-text-mid">{s.label}</span>
                      <span className={`font-bold ${s.fires ? 'text-rose-400' : 'text-text-low'}`}>
                        {s.fires ? '■ FIRE (-1)' : '□ PASS (+1)'}
                      </span>
                    </div>
                  ))}

                  <div className="text-[11px] font-bold uppercase text-text-low pt-2">Z-Checks (X Errors):</div>
                  {steaneSyndrome.zSyndromes.map((s) => (
                    <div key={s.id} className="flex justify-between items-center rounded bg-ink-900/60 px-2.5 py-1.5">
                      <span className="text-text-mid">{s.label}</span>
                      <span className={`font-bold ${s.fires ? 'text-violet-400' : 'text-text-low'}`}>
                        {s.fires ? '■ FIRE (-1)' : '□ PASS (+1)'}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {code.id === 'shor-9' && (
                <>
                  <div className="text-[11px] font-bold uppercase text-text-low pt-2">Bit-Flip Parity Checks:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {shorSyndrome.bitFlipChecks.map((c) => (
                      <div key={c.id} className="flex justify-between items-center rounded bg-ink-900/60 px-2 py-1 text-[11px]">
                        <span>q{c.q1}-q{c.q2}</span>
                        <span className={c.fires ? 'text-rose-400 font-bold' : 'text-text-low'}>
                          {c.fires ? 'FIRE' : 'OK'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {code.id === 'perfect-5' && (
                <>
                  <div className="text-[11px] font-bold uppercase text-text-low pt-2">Cyclic Stabilizer Generators:</div>
                  <div className="space-y-1.5">
                    {PERFECT_5_GENERATORS.map((g) => (
                      <div key={g.id} className="flex justify-between items-center rounded bg-ink-900/60 px-2.5 py-1.5 text-[11px]">
                        <span className="text-amber-300 font-bold">{g.id.toUpperCase()}</span>
                        <span className="text-text-mid font-mono">{g.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Transversal Gates Property */}
            <div className="border-t border-ink-700 pt-3 mt-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-magic font-bold">
                Transversal Gates:
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {code.transversalGates.map((gate) => (
                  <span key={gate} className="rounded border border-magic/40 bg-magic/10 px-2 py-0.5 font-mono text-[11px] text-magic">
                    {gate}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 font-mono text-xs">
            <p className="eyebrow mb-2 !text-stabilizer">// CODE PHYSICS SUMMARY</p>
            <p className="text-text-mid leading-relaxed font-sans text-xs">
              {code.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

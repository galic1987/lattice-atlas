import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { sound } from '@/lib/sound';

interface QuantumChip {
  id: string;
  name: string;
  vendor: string;
  qubitCount: number;
  architecture: string;
  twoQubitFidelityPercent: number; // e.g. 99.87%
  gateTimeNs: number;
  lambdaSuppression: number;
  distanceSupported: number;
  scores: {
    fidelity: number; // 0..100
    connectivity: number;
    speed: number;
    suppression: number;
    scale: number;
  };
  highlights: string[];
}

const HARDWARE_CHIPS: QuantumChip[] = [
  {
    id: 'google-willow',
    name: 'Willow (105-Qubit)',
    vendor: 'Google Quantum AI (2024)',
    qubitCount: 105,
    architecture: 'Superconducting Transmon (Square Grid)',
    twoQubitFidelityPercent: 99.87,
    gateTimeNs: 24,
    lambdaSuppression: 2.14,
    distanceSupported: 7,
    scores: {
      fidelity: 95,
      connectivity: 65,
      speed: 90,
      suppression: 98,
      scale: 75,
    },
    highlights: [
      'First memory scaling below threshold up to distance 7 (Lambda = 2.14).',
      'Real-time decoding latency of 63μs sustaining a 1.1μs cycle stream.',
      'Distance-7 physical error rate 0.143% per cycle.',
    ],
  },
  {
    id: 'ibm-heron',
    name: 'Heron (133-Qubit)',
    vendor: 'IBM Quantum (2023)',
    qubitCount: 133,
    architecture: 'Superconducting Transmon (Heavy-Hex Lattice)',
    twoQubitFidelityPercent: 99.60,
    gateTimeNs: 68,
    lambdaSuppression: 1.45,
    distanceSupported: 5,
    scores: {
      fidelity: 88,
      connectivity: 55,
      speed: 80,
      suppression: 70,
      scale: 85,
    },
    highlights: [
      'Heavy-hex planar layout reducing crosstalk & frequency collisions.',
      'Tunable couplers delivering 5x error reduction over Eagle architecture.',
      '133 physical qubits supporting distance-5 rotated surface code patches.',
    ],
  },
  {
    id: 'quantinuum-h2',
    name: 'H2-1 (56-Qubit)',
    vendor: 'Quantinuum (2024)',
    qubitCount: 56,
    architecture: 'Trapped Ytterbium Ion Shuttle (QCCD)',
    twoQubitFidelityPercent: 99.95,
    gateTimeNs: 10000, // 10μs
    lambdaSuppression: 3.20,
    distanceSupported: 5,
    scores: {
      fidelity: 99,
      connectivity: 100,
      speed: 30,
      suppression: 92,
      scale: 50,
    },
    highlights: [
      'World-record 99.95% 2-qubit gate fidelity with all-to-all QCCD shuttle routing.',
      'Demonstrated 48 logical qubits using color code and surface code encoding.',
      'Zero crosstalk with state detection fidelity >99.9%.',
    ],
  },
  {
    id: 'quera-aquila',
    name: 'Aquila (256-Atom)',
    vendor: 'QuEra / Harvard (2023)',
    qubitCount: 256,
    architecture: 'Neutral Atom Array (Optical Tweezers)',
    twoQubitFidelityPercent: 99.50,
    gateTimeNs: 1000, // 1μs
    lambdaSuppression: 1.80,
    distanceSupported: 5,
    scores: {
      fidelity: 85,
      connectivity: 80,
      speed: 70,
      suppression: 78,
      scale: 95,
    },
    highlights: [
      'Dynamic 2D/3D atomic array repositioning with Rydberg laser blockades.',
      'Demonstrated transversal 48-logical-qubit GHZ state generation.',
      'Scalable to 1,000+ neutral Rubidium atoms in a single vacuum chamber.',
    ],
  },
];

export default function HardwareChipBenchmarkMatrix() {
  const [selectedChipId, setSelectedChipId] = useState<string>('google-willow');
  const chip = HARDWARE_CHIPS.find((c) => c.id === selectedChipId) ?? HARDWARE_CHIPS[0];

  const handleSelect = (id: string) => {
    setSelectedChipId(id);
    sound.playSyndromeTick();
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-magic" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              TQEC Hardware Chip Benchmark &amp; Radar Matrix
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Comprehensive benchmark specs for Google Willow, IBM Heron, Quantinuum H2, &amp; QuEra Aquila chips.
          </p>
        </div>

        <span className="rounded-full border border-magic/40 bg-magic/10 px-3 py-1 font-mono text-xs font-bold text-magic">
          2024-2026 Chip Architecture Matrix
        </span>
      </div>

      {/* Chip Selection Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {HARDWARE_CHIPS.map((c) => {
          const active = c.id === chip.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c.id)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                active
                  ? 'border-magic bg-magic/15 font-semibold text-text-hi shadow-glow-violet'
                  : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <Cpu className={`h-3.5 w-3.5 ${active ? 'text-magic' : 'text-text-low'}`} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Detailed Benchmark Dashboard & Interactive SVG Radar Chart */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Interactive SVG Radar Chart */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-4 min-h-[360px]">
          <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
            <span className="text-text-hi font-bold">{chip.vendor}</span>
          </div>

          <div className="relative w-full max-w-[320px] aspect-square my-4">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Concentric Radar Grid Rings */}
              {[30, 60, 90, 120].map((r, idx) => (
                <circle key={idx} cx="150" cy="150" r={r} fill="none" stroke="#3D5178" strokeWidth="1" strokeDasharray="3 3" />
              ))}

              {/* Radar Axes: Fidelity, Connectivity, Speed, Suppression, Scale */}
              {Array.from({ length: 5 }).map((_, idx) => {
                const angle = (idx * 72 - 90) * (Math.PI / 180);
                const x2 = 150 + 120 * Math.cos(angle);
                const y2 = 150 + 120 * Math.sin(angle);
                return <line key={idx} x1="150" y1="150" x2={x2} y2={y2} stroke="#3D5178" strokeWidth="1.5" />;
              })}

              {/* Radar Polygon for Active Chip */}
              {(() => {
                const s = chip.scores;
                const vals = [s.fidelity, s.connectivity, s.speed, s.suppression, s.scale];
                const pts = vals.map((val, idx) => {
                  const angle = (idx * 72 - 90) * (Math.PI / 180);
                  const r = (val / 100) * 120;
                  return `${150 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`;
                });
                return (
                  <polygon
                    points={pts.join(' ')}
                    fill="#8B5CF6"
                    fillOpacity="0.3"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                  />
                );
              })()}

              {/* Labels */}
              <text x="150" y="15" textAnchor="middle" fill="#22D3EE" fontSize="10" fontWeight="bold" fontFamily="monospace">Fidelity</text>
              <text x="275" y="115" textAnchor="start" fill="#22D3EE" fontSize="10" fontWeight="bold" fontFamily="monospace">Connectivity</text>
              <text x="235" y="275" textAnchor="start" fill="#22D3EE" fontSize="10" fontWeight="bold" fontFamily="monospace">Speed</text>
              <text x="65" y="275" textAnchor="end" fill="#22D3EE" fontSize="10" fontWeight="bold" fontFamily="monospace">Suppression (Λ)</text>
              <text x="25" y="115" textAnchor="end" fill="#22D3EE" fontSize="10" fontWeight="bold" fontFamily="monospace">Scale</text>
            </svg>
          </div>

          <div className="text-center font-mono text-[11px] text-plaquette font-bold">
            2-Qubit Fidelity: {chip.twoQubitFidelityPercent}% · Λ = {chip.lambdaSuppression}
          </div>
        </div>

        {/* Hardware Specs & Highlights */}
        <div className="flex flex-col justify-between rounded-xl border border-ink-600 bg-ink-800 p-5 font-mono text-xs">
          <div>
            <span className="eyebrow text-magic mb-2">// HARDWARE ARCHITECTURE SPECS</span>
            <h4 className="font-display text-lg font-bold text-text-hi mb-1">{chip.name}</h4>
            <div className="text-text-mid text-xs mb-4 font-sans">{chip.architecture}</div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-[10px] text-text-low uppercase block">Physical Qubits</span>
                <span className="text-base font-bold text-plaquette">{chip.qubitCount} Qubits</span>
              </div>
              <div className="rounded-lg bg-ink-900 p-2.5 border border-ink-700">
                <span className="text-[10px] text-text-low uppercase block">Gate Cycle Time</span>
                <span className="text-base font-bold text-amber-400">
                  {chip.gateTimeNs >= 1000 ? `${chip.gateTimeNs / 1000}μs` : `${chip.gateTimeNs}ns`}
                </span>
              </div>
            </div>

            <div className="border-t border-ink-700 pt-3">
              <span className="text-[10px] text-text-low uppercase tracking-wider block mb-2 font-bold">
                Key Architectural Milestones:
              </span>
              <ul className="space-y-2">
                {chip.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-text-mid">
                    <span className="text-magic text-[10px] mt-0.5">◆</span>
                    <span className="leading-relaxed font-sans text-xs">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

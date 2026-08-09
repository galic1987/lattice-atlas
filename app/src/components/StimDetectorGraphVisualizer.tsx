import { useState, useMemo } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

export interface DetectorNode {
  id: string;
  x: number;
  y: number;
  t: number;
  label: string;
  fired: boolean;
}

export interface FaultEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  errorType: 'X' | 'Z' | 'Measurement';
  active: boolean;
}

const DEFAULT_DETECTORS: DetectorNode[] = [
  { id: 'D0', x: 80, y: 80, t: 1, label: 'D0 (Z-check 1, t=1)', fired: false },
  { id: 'D1', x: 220, y: 80, t: 1, label: 'D1 (X-check 1, t=1)', fired: false },
  { id: 'D2', x: 360, y: 80, t: 1, label: 'D2 (Z-check 2, t=1)', fired: false },
  { id: 'D3', x: 80, y: 220, t: 2, label: 'D3 (Z-check 1, t=2)', fired: false },
  { id: 'D4', x: 220, y: 220, t: 2, label: 'D4 (X-check 1, t=2)', fired: false },
  { id: 'D5', x: 360, y: 220, t: 2, label: 'D5 (Z-check 2, t=2)', fired: false },
];

const DEFAULT_FAULTS: FaultEdge[] = [
  { id: 'F0', from: 'D0', to: 'D1', weight: 1.2, errorType: 'X', active: false },
  { id: 'F1', from: 'D1', to: 'D2', weight: 1.2, errorType: 'Z', active: false },
  { id: 'F2', from: 'D0', to: 'D3', weight: 2.1, errorType: 'Measurement', active: false },
  { id: 'F3', from: 'D1', to: 'D4', weight: 2.1, errorType: 'Measurement', active: false },
  { id: 'F4', from: 'D2', to: 'D5', weight: 2.1, errorType: 'Measurement', active: false },
  { id: 'F5', from: 'D3', to: 'D4', weight: 1.2, errorType: 'X', active: false },
  { id: 'F6', from: 'D4', to: 'D5', weight: 1.2, errorType: 'Z', active: false },
];

export default function StimDetectorGraphVisualizer() {
  const [detectors, setDetectors] = useState<DetectorNode[]>(DEFAULT_DETECTORS);
  const [faults, setFaults] = useState<FaultEdge[]>(DEFAULT_FAULTS);
  const [activeFaultId, setActiveFaultId] = useState<string | null>(null);
  const [decodingPath, setDecodingPath] = useState<string[]>([]);

  const injectRandomNoise = () => {
    sound.playSyndromeTick();
    const newFaults = faults.map((f) => ({
      ...f,
      active: Math.random() < 0.35,
    }));

    // Recompute detector fires (odd parity of incident active faults)
    const firedIds = new Set<string>();
    newFaults.forEach((f) => {
      if (f.active) {
        if (firedIds.has(f.from)) firedIds.delete(f.from);
        else firedIds.add(f.from);

        if (firedIds.has(f.to)) firedIds.delete(f.to);
        else firedIds.add(f.to);
      }
    });

    setFaults(newFaults);
    setDetectors((prev) =>
      prev.map((d) => ({
        ...d,
        fired: firedIds.has(d.id),
      }))
    );

    // MWPM pairing
    const firedArray = Array.from(firedIds);
    if (firedArray.length >= 2) {
      setDecodingPath([firedArray[0], firedArray[1]]);
    } else {
      setDecodingPath([]);
    }
  };

  const resetGraph = () => {
    sound.playDecoderLock();
    setDetectors(DEFAULT_DETECTORS);
    setFaults(DEFAULT_FAULTS);
    setActiveFaultId(null);
    setDecodingPath([]);
  };

  const handleFaultClick = (faultId: string) => {
    sound.playDecoderLock();
    setActiveFaultId((prev) => (prev === faultId ? null : faultId));
    setFaults((prev) =>
      prev.map((f) => (f.id === faultId ? { ...f, active: !f.active } : f))
    );

    // Recalculate detector parity
    setTimeout(() => {
      setFaults((currFaults) => {
        const firedIds = new Set<string>();
        currFaults.forEach((f) => {
          if (f.active) {
            if (firedIds.has(f.from)) firedIds.delete(f.from);
            else firedIds.add(f.from);

            if (firedIds.has(f.to)) firedIds.delete(f.to);
            else firedIds.add(f.to);
          }
        });
        setDetectors((prevD) =>
          prevD.map((d) => ({
            ...d,
            fired: firedIds.has(d.id),
          }))
        );
        return currFaults;
      });
    }, 10);
  };

  const firedCount = useMemo(() => detectors.filter((d) => d.fired).length, [detectors]);
  const activeFaultCount = useMemo(() => faults.filter((f) => f.active).length, [faults]);

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// STIM DETECTOR ERROR MODEL (.DEM)</span>
            <span className="rounded bg-syndrome/20 px-2 py-0.5 font-mono text-[10px] text-syndrome font-bold">GRAPH VISUALIZER</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Interactive Syndrome & Fault Graph Studio</h3>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={injectRandomNoise}
            className="btn-primary text-xs !px-4 !py-2 flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" /> Inject Noise Event
          </button>
          <button
            type="button"
            onClick={resetGraph}
            className="rounded-lg border border-ink-700 bg-ink-950 p-2 text-text-low hover:text-text-hi flex items-center gap-1 font-mono text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Explore Stim Detector Error Model (DEM) graph structures. Click on any error edge to simulate physical Pauli faults ($X, Z$) or measurement flips, and watch how detector nodes trigger odd-parity syndrome events for MWPM decoding.
      </p>

      {/* Main Canvas Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Graph Viewport */}
        <div className="lg:col-span-2 rounded-xl border border-ink-700 bg-ink-950 p-4 relative overflow-hidden flex items-center justify-center min-h-[320px]">
          <svg viewBox="0 0 440 300" className="w-full h-full max-h-[320px]">
            {/* Background Grid Lines */}
            <defs>
              <pattern id="demGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="440" height="300" fill="url(#demGrid)" />

            {/* Time Round Guides */}
            <line x1="20" y1="80" x2="420" y2="80" stroke="rgba(0,240,255,0.15)" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="20" y1="220" x2="420" y2="220" stroke="rgba(0,240,255,0.15)" strokeDasharray="4 4" strokeWidth="1" />
            <text x="30" y="72" fill="#7B89A7" fontSize="10" fontFamily="monospace">Round t=1</text>
            <text x="30" y="212" fill="#7B89A7" fontSize="10" fontFamily="monospace">Round t=2</text>

            {/* MWPM Match Pairing Path */}
            {decodingPath.length === 2 && (
              <line
                x1={detectors.find((d) => d.id === decodingPath[0])?.x || 0}
                y1={detectors.find((d) => d.id === decodingPath[0])?.y || 0}
                x2={detectors.find((d) => d.id === decodingPath[1])?.x || 0}
                y2={detectors.find((d) => d.id === decodingPath[1])?.y || 0}
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            )}

            {/* Fault Edges */}
            {faults.map((fault) => {
              const dFrom = detectors.find((d) => d.id === fault.from);
              const dTo = detectors.find((d) => d.id === fault.to);
              if (!dFrom || !dTo) return null;

              const isSelected = activeFaultId === fault.id;

              return (
                <g key={fault.id} onClick={() => handleFaultClick(fault.id)} className="cursor-pointer group">
                  <line
                    x1={dFrom.x}
                    y1={dFrom.y}
                    x2={dTo.x}
                    y2={dTo.y}
                    stroke={
                      fault.active
                        ? '#FF2A6D'
                        : isSelected
                        ? '#00F0FF'
                        : fault.errorType === 'Measurement'
                        ? '#A855F7'
                        : '#3B82F6'
                    }
                    strokeWidth={fault.active ? '3.5' : '2'}
                    opacity={fault.active ? 1 : 0.6}
                  />
                  {/* Invisible thicker line for easy clicking */}
                  <line
                    x1={dFrom.x}
                    y1={dFrom.y}
                    x2={dTo.x}
                    y2={dTo.y}
                    stroke="transparent"
                    strokeWidth="14"
                  />
                  {/* Edge Weight Label */}
                  <rect
                    x={(dFrom.x + dTo.x) / 2 - 12}
                    y={(dFrom.y + dTo.y) / 2 - 8}
                    width="24"
                    height="16"
                    rx="4"
                    fill="#0D1322"
                    stroke={fault.active ? '#FF2A6D' : '#1F293D'}
                  />
                  <text
                    x={(dFrom.x + dTo.x) / 2}
                    y={(dFrom.y + dTo.y) / 2 + 3}
                    textAnchor="middle"
                    fill={fault.active ? '#FF2A6D' : '#7B89A7'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {fault.errorType[0]}
                  </text>
                </g>
              );
            })}

            {/* Detector Nodes */}
            {detectors.map((d) => (
              <g key={d.id} transform={`translate(${d.x}, ${d.y})`}>
                {d.fired && (
                  <circle r="18" fill="none" stroke="#FF2A6D" strokeWidth="2" className="animate-ping opacity-75" />
                )}
                <circle
                  r="12"
                  fill={d.fired ? '#FF2A6D' : '#0D1322'}
                  stroke={d.fired ? '#FF2A6D' : '#00F0FF'}
                  strokeWidth="2.5"
                  className="transition-colors duration-200"
                />
                <text
                  y="4"
                  textAnchor="middle"
                  fill={d.fired ? '#FFFFFF' : '#00F0FF'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {d.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Analytics & Control Panel */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-text-low">// DETECTOR EVENTS</span>
              <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">MWPM ACTIVE</span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-lg bg-ink-900 border border-ink-800">
                  <span className="text-[9px] text-text-low uppercase block">Fired Detectors</span>
                  <span className={`text-xl font-bold block mt-0.5 ${firedCount > 0 ? 'text-syndrome' : 'text-stabilizer'}`}>
                    {firedCount}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-ink-900 border border-ink-800">
                  <span className="text-[9px] text-text-low uppercase block">Active Faults</span>
                  <span className="text-xl font-bold text-star block mt-0.5">
                    {activeFaultCount}
                  </span>
                </div>
              </div>

              {decodingPath.length === 2 && (
                <div className="p-3 rounded-lg bg-stabilizer/10 border border-stabilizer/30 text-xs">
                  <span className="text-stabilizer font-bold block mb-1">✓ MWPM Match Found:</span>
                  <span className="text-text-mid block">Pairing {decodingPath[0]} ↔ {decodingPath[1]} via shortest graph path.</span>
                </div>
              )}

              <div className="pt-2 border-t border-ink-800 space-y-2">
                <span className="text-text-low block font-bold">Detector Status:</span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {detectors.map((d) => (
                    <div key={d.id} className="flex justify-between items-center text-[11px] p-1 rounded bg-ink-900">
                      <span>{d.label}</span>
                      <span className={`font-bold ${d.fired ? 'text-syndrome' : 'text-text-low'}`}>
                        {d.fired ? 'FIRED (1)' : '0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-ink-800 text-[10px] font-mono text-text-low">
            💡 Click any edge line to toggle physical error events and test syndrome parity matching.
          </div>
        </div>
      </div>
    </div>
  );
}

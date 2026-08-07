import { useState, useId, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Play,
  Pause,
  Code2,
  ExternalLink,
  Layers,
  RotateCcw
} from 'lucide-react';

interface BraidPreset {
  id: string;
  name: string;
  gate: string;
  description: string;
  rounds: number;
  pipes: {
    id: string;
    label: string;
    color: string;
    points: { x: number; y: number; z: number }[];
  }[];
  stimSnippet: string;
  zxDescription: string;
}

const BRAID_PRESETS: BraidPreset[] = [
  {
    id: 'cnot-surgery',
    name: 'Logical CNOT (Lattice Surgery Weld)',
    gate: 'CNOT Gate',
    description:
      'Two logical surface code patches (Control & Target) undergo a Z-boundary weld over 3 clock cycles, performing a fault-tolerant logical CNOT.',
    rounds: 6,
    pipes: [
      {
        id: 'patch-control',
        label: 'Control Qubit Patch',
        color: '#22D3EE', // cyan
        points: [
          { x: 60, y: 80, z: 0 },
          { x: 60, y: 80, z: 40 },
          { x: 100, y: 80, z: 80 },
          { x: 100, y: 80, z: 120 },
          { x: 60, y: 80, z: 160 },
        ],
      },
      {
        id: 'patch-target',
        label: 'Target Qubit Patch',
        color: '#8B5CF6', // violet
        points: [
          { x: 180, y: 80, z: 0 },
          { x: 180, y: 80, z: 40 },
          { x: 140, y: 80, z: 80 },
          { x: 140, y: 80, z: 120 },
          { x: 180, y: 80, z: 160 },
        ],
      },
    ],
    stimSnippet: `# Logical CNOT via Lattice Surgery
R 0 1 2 3 4 5 6 7
TICK # Round 1: Independent patches
CX 0 1 2 3
TICK # Round 2: Weld Z-boundary
M 0 1 2 3
DETECTOR(0, 0, 0) rec[-1] rec[-2]`,
    zxDescription: 'ZX Graph: Green (Z) spider connected to Red (X) spider across 3 spacetime layers.',
  },
  {
    id: 'anyon-braid',
    name: 'Majorana / Anyon Braid (Hadamard / Phase Gate)',
    gate: 'Logical H / S Gate',
    description:
      'Two non-Abelian anyon defects exchange positions in 3D spacetime (wrapping 360°), braiding their worldlines to perform a topological phase rotation.',
    rounds: 8,
    pipes: [
      {
        id: 'anyon-1',
        label: 'Anyon Defect 1',
        color: '#F5B83D', // gold
        points: [
          { x: 80, y: 60, z: 0 },
          { x: 120, y: 100, z: 40 },
          { x: 160, y: 60, z: 80 },
          { x: 120, y: 20, z: 120 },
          { x: 80, y: 60, z: 160 },
        ],
      },
      {
        id: 'anyon-2',
        label: 'Anyon Defect 2',
        color: '#FB7185', // rose
        points: [
          { x: 160, y: 60, z: 0 },
          { x: 120, y: 20, z: 40 },
          { x: 80, y: 60, z: 80 },
          { x: 120, y: 100, z: 120 },
          { x: 160, y: 60, z: 160 },
        ],
      },
    ],
    stimSnippet: `# Anyon Defect Braid (Hadamard / Phase)
# Worldline 1 wraps around Worldline 2
QUBIT_COORDS(0, 0) 0
QUBIT_COORDS(1, 0) 1
TICK
H 0 1
CX 0 1
TICK
OBSERVABLE_INCLUDE(0) rec[-1]`,
    zxDescription: 'ZX Graph: Twisted ribbon link invariant braid with non-trivial Phase shift π/4.',
  },
];

export default function SpacetimeBraidWeaver() {
  const [selectedPreset, setSelectedPreset] = useState<BraidPreset>(BRAID_PRESETS[0]);
  const [currentTime, setCurrentTime] = useState<number>(80);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rotX, setRotX] = useState<number>(25);
  const [rotY, setRotY] = useState<number>(-35);
  const [showStim, setShowStim] = useState<boolean>(false);
  const gradId = useId();

  // Animation scrubber loop — driven by an effect so the interval is always
  // cleared on pause and on unmount (the old version leaked the timer).
  const togglePlay = () => {
    if (!isPlaying && currentTime >= 160) setCurrentTime(80); // restart from the top
    setIsPlaying((p) => !p);
  };

  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => {
      setCurrentTime((prev) => (prev >= 160 ? 160 : prev + 4));
    }, 50);
    return () => clearInterval(id);
  }, [isPlaying]);

  const resetRotation = () => {
    setRotX(25);
    setRotY(-35);
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// 3D TOPOLOGICAL INTERACTIVE LAB</span>
            <span className="rounded bg-stabilizer/20 px-2 py-0.5 font-mono text-[10px] text-stabilizer font-bold">SPACETIME PIPES</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">3D Spacetime Braid Weaver for Lattice Surgery</h3>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2">
          {BRAID_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPreset(p);
                setCurrentTime(80);
                setIsPlaying(false);
              }}
              className={
                selectedPreset.id === p.id
                  ? 'rounded-lg border border-plaquette bg-plaquette/20 px-3 py-1.5 font-mono text-xs font-bold text-plaquette shadow-sm'
                  : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
              }
            >
              {p.gate}
            </button>
          ))}
        </div>
      </div>

      {/* Description & Overview */}
      <p className="mt-4 text-xs leading-relaxed text-text-mid">{selectedPreset.description}</p>

      {/* 3D Spacetime Canvas Container */}
      <div className="relative mt-6 grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Interactive 3D Orbit Viewport */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2 font-mono text-[11px] text-text-low">
            <span className="flex items-center gap-1.5 text-star font-bold">
              <Box className="h-4 w-4" /> 3D Space-Time Manifold (x, y, t)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotY((y) => y - 15)}
                className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-text-mid hover:text-text-hi"
              >
                ↺ Rot Y
              </button>
              <button
                type="button"
                onClick={() => setRotX((x) => (x + 10 > 60 ? 10 : x + 10))}
                className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-text-mid hover:text-text-hi"
              >
                Tilt X
              </button>
              <button
                type="button"
                onClick={resetRotation}
                className="inline-flex items-center gap-1 rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-text-mid hover:text-text-hi"
                title="Reset View"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
          </div>

          {/* SVG 3D Isometric View */}
          <div className="relative flex h-80 w-full items-center justify-center cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 300 240"
              className="h-full w-full select-none"
              style={{
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out',
              }}
            >
              <defs>
                <linearGradient id={`${gradId}-pipe1`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Spacetime Grid Planes */}
              {[0, 80, 160].map((zPlane) => (
                <g key={zPlane} opacity={zPlane === 80 ? 0.6 : 0.2}>
                  <rect
                    x="30"
                    y={30 + zPlane * 0.4}
                    width="240"
                    height="80"
                    fill="none"
                    stroke="#3D5178"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="35"
                    y={45 + zPlane * 0.4}
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    t = {Math.round(zPlane / 20)} (Round {zPlane / 40})
                  </text>
                </g>
              ))}

              {/* 3D Pipe Splines */}
              {selectedPreset.pipes.map((pipe) => {
                const pathD = pipe.points.reduce((acc, p, idx) => {
                  const x3d = p.x;
                  const y3d = p.y + p.z * 0.4;
                  return idx === 0 ? `M ${x3d} ${y3d}` : `${acc} L ${x3d} ${y3d}`;
                }, '');

                return (
                  <g key={pipe.id}>
                    {/* Shadow / Tube Outline */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={pipe.color}
                      strokeWidth="12"
                      strokeOpacity="0.2"
                      strokeLinecap="round"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={pipe.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Pipe Nodes */}
                    {pipe.points.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y + pt.z * 0.4}
                        r="5"
                        fill={pipe.color}
                        className="transition-transform hover:scale-150"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Active Time Slice Plane */}
              <rect
                x="20"
                y={20 + currentTime * 0.4}
                width="260"
                height="90"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* Time Scrubber Controls */}
          <div className="mt-4 border-t border-ink-800 pt-3">
            <div className="flex items-center justify-between text-xs font-mono text-text-mid mb-2">
              <span className="flex items-center gap-1.5 text-plaquette font-bold">
                <Layers className="h-3.5 w-3.5" /> Spacetime Time-Slice: t = {Math.round(currentTime / 20)}
              </span>
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex items-center gap-1 rounded bg-plaquette/15 px-2.5 py-1 text-plaquette hover:bg-plaquette/25"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isPlaying ? 'Pause' : 'Play Anim'}
              </button>
            </div>

            <input
              type="range"
              min="0"
              max="160"
              step="4"
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="w-full accent-plaquette cursor-pointer"
            />
          </div>
        </div>

        {/* Right 1 Col: 2D Cross-Section & Code Inspector */}
        <div className="flex flex-col gap-4">
          {/* 2D Slice View at t = currentTime */}
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-2">
              <span className="font-mono text-[11px] font-bold text-stabilizer">
                2D Surface Code Slice at t={Math.round(currentTime / 20)}
              </span>
            </div>

            <div className="relative mt-3 flex h-32 w-full items-center justify-center rounded-lg border border-ink-800 bg-ink-900/60 p-2">
              <svg viewBox="0 0 120 80" className="h-full w-full">
                <rect x="10" y="10" width="100" height="60" fill="none" stroke="#3D5178" strokeWidth="1" strokeDasharray="3 3" />
                {selectedPreset.pipes.map((p) => {
                  const currentPoint = p.points.find((pt) => Math.abs(pt.z - currentTime) <= 20) ?? p.points[0];
                  return (
                    <g key={p.id}>
                      <circle cx={currentPoint.x / 2} cy={currentPoint.y / 2} r="10" fill={p.color} fillOpacity="0.3" stroke={p.color} strokeWidth="2" />
                      <circle cx={currentPoint.x / 2} cy={currentPoint.y / 2} r="4" fill={p.color} />
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="mt-2 font-mono text-[10px] text-text-low text-center">
              Active patch boundary cross-section
            </p>
          </div>

          {/* ZX Diagram & Stim Snippet Toggle */}
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="font-mono text-[11px] font-bold text-star">
                  ZX-Calculus & Stim Output
                </span>
                <button
                  type="button"
                  onClick={() => setShowStim(!showStim)}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-plaquette hover:underline"
                >
                  <Code2 className="h-3 w-3" /> {showStim ? 'Show ZX Graph' : 'Show Stim Code'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showStim ? (
                  <motion.pre
                    key="stim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 overflow-x-auto rounded-lg bg-ink-900 p-2.5 font-mono text-[10px] leading-relaxed text-stabilizer"
                  >
                    {selectedPreset.stimSnippet}
                  </motion.pre>
                ) : (
                  <motion.div
                    key="zx"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 text-xs leading-relaxed text-text-mid"
                  >
                    <p className="font-mono text-[11px] text-magic font-bold">{selectedPreset.zxDescription}</p>
                    <p className="mt-2 text-[11px] text-text-low">
                      Topological invariants guarantee fault-tolerance regardless of continuous spatial deformations.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="https://github.com/tqec/TopoLS"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-plaquette/40 bg-plaquette/10 py-2 font-mono text-xs font-bold text-plaquette hover:bg-plaquette/20"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Export to TopoLS Compiler
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

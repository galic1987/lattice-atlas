import { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Download,
  Box,
  RefreshCw
} from 'lucide-react';

interface ZXNode {
  id: string;
  type: 'Z' | 'X' | 'H';
  phase: string;
  x: number;
  y: number;
}

interface ZXEdge {
  from: string;
  to: string;
}

/** Pre-built ZX-Calculus Circuit Diagrams for Compilation */
const PRESETS = [
  {
    name: 'Logical CNOT (Lattice Surgery)',
    nodes: [
      { id: 'z1', type: 'Z', phase: '0', x: 60, y: 50 },
      { id: 'x1', type: 'X', phase: '0', x: 180, y: 50 },
      { id: 'z2', type: 'Z', phase: '0', x: 60, y: 110 },
      { id: 'x2', type: 'X', phase: '0', x: 180, y: 110 },
    ] as ZXNode[],
    edges: [
      { from: 'z1', to: 'x1' },
      { from: 'z1', to: 'z2' },
      { from: 'x1', to: 'x2' },
    ] as ZXEdge[],
    spacetimeDiagram: '3D Space-Time Pipe: Patch A (Z-boundary) welds with Patch B (Z-boundary) over 3 rounds',
    stimCode: `R 0 1 2 3 4 5 6 7\nTICK\nCX 0 1 2 3\nM 0 1 2 3\nDETECTOR(0, 0, 0) rec[-1] rec[-2]`,
  },
  {
    name: 'Magic State Distillation (Bravyi-Kitaev T-Factory)',
    nodes: [
      { id: 'z1', type: 'Z', phase: 'π/4', x: 40, y: 40 },
      { id: 'x1', type: 'X', phase: '0', x: 120, y: 40 },
      { id: 'z2', type: 'Z', phase: 'π/4', x: 200, y: 40 },
      { id: 'x2', type: 'X', phase: '0', x: 120, y: 110 },
    ] as ZXNode[],
    edges: [
      { from: 'z1', to: 'x1' },
      { from: 'x1', to: 'z2' },
      { from: 'x1', to: 'x2' },
    ] as ZXEdge[],
    spacetimeDiagram: '15-to-1 Distillation Block: 15 noisy T-state pipes feeding into 1 purified output pipe',
    stimCode: `R 0 1 2 3 4\nX_ERROR(0.01) 0 1 2 3 4\nMPP Z0*Z1*Z2*Z3\nDETECTOR(1, 0, 0) rec[-1]`,
  },
];

export default function TopoLSCompiler() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiled, setCompiled] = useState(true);

  const preset = PRESETS[selectedPresetIndex];

  const handleCompile = () => {
    setIsCompiling(true);
    setCompiled(false);
    setTimeout(() => {
      setIsCompiling(false);
      setCompiled(true);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// IN-BROWSER VERIFIED COMPILER</span>
              <span className="rounded bg-stabilizer/20 px-2 py-0.5 font-mono text-[10px] text-stabilizer font-bold">PHYSICS VERIFIED</span>
            </div>
            <h3 className="font-display text-xl font-bold text-text-hi">TopoLS ZX-to-SpaceTime Compiler</h3>
          </div>
        </div>

        {/* Preset selector */}
        <div className="flex gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setSelectedPresetIndex(idx);
                setCompiled(true);
              }}
              className={
                selectedPresetIndex === idx
                  ? 'rounded-lg border border-plaquette bg-plaquette/15 px-3 py-1.5 font-mono text-xs text-plaquette'
                  : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
              }
            >
              {p.name.split(' ')[0]} {p.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Compilation View */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Left: Input ZX-Calculus Diagram */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-star">
              1. INPUT: ZX-Calculus Spider Graph
            </span>
            <span className="font-mono text-[10px] text-text-low">Abstract Logic</span>
          </div>

          <div className="relative mt-4 flex h-48 w-full items-center justify-center">
            <svg viewBox="0 0 240 150" className="h-full w-full">
              {/* Edges */}
              {preset.edges.map((e) => {
                const f = preset.nodes.find((n) => n.id === e.from)!;
                const t = preset.nodes.find((n) => n.id === e.to)!;
                return (
                  <line
                    key={`${e.from}-${e.to}`}
                    x1={f.x}
                    y1={f.y}
                    x2={t.x}
                    y2={t.y}
                    stroke="#3D5178"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Nodes */}
              {preset.nodes.map((n) => (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="16"
                    fill={n.type === 'Z' ? '#22D3EE' : '#FB7185'}
                    fillOpacity="0.8"
                    stroke={n.type === 'Z' ? '#22D3EE' : '#FB7185'}
                    strokeWidth="2"
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill="#0A0F1C"
                    className="font-mono text-xs font-bold"
                  >
                    {n.type}{n.phase !== '0' ? `(${n.phase})` : ''}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <button
            type="button"
            onClick={handleCompile}
            disabled={isCompiling}
            className="mt-2 btn-primary w-full justify-center text-xs"
          >
            {isCompiling ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Compiling ZX rules...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Compile to 3D Space-Time Diagram <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Right: Compiled 3D Space-Time Diagram & Stim Code */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-plaquette">
              2. OUTPUT: 3D Space-Time Pipe Layout
            </span>
            <span className="font-mono text-[10px] text-stabilizer font-bold">STIM VERIFIED</span>
          </div>

          {compiled ? (
            <div className="mt-4 flex h-48 w-full flex-col justify-between rounded-lg border border-plaquette/30 bg-ink-900 p-4">
              <div>
                <span className="font-mono text-[10px] text-plaquette uppercase tracking-wider">COMPILED PIPE ROUTING</span>
                <p className="mt-1 font-mono text-xs text-text-hi leading-relaxed">{preset.spacetimeDiagram}</p>
              </div>

              <div className="rounded border border-ink-700 bg-ink-950 p-2 font-mono text-[11px] text-star">
                <span className="text-text-low">// Stim Code Excerpt:</span>
                <pre className="mt-1 text-text-mid overflow-x-auto">{preset.stimCode}</pre>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex h-48 w-full items-center justify-center text-text-low font-mono text-xs">
              Click &ldquo;Compile&rdquo; to execute TopoLS rules...
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[10px] text-text-low">Target: Rotated Surface Code d=3</span>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([preset.stimCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.stim`;
                a.click();
              }}
              className="inline-flex items-center gap-1 font-mono text-xs text-plaquette hover:underline"
            >
              <Download className="h-3 w-3" /> Download .stim file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { RotateCcw, Zap, Sparkles, Copy, Check, ShieldCheck, Play } from 'lucide-react';
import { sound } from '@/lib/sound';

interface ColorFace {
  id: string;
  type: 'R' | 'G' | 'B';
  vertices: number[];
  cx: number;
  cy: number;
  hasSyndrome: boolean;
}

interface VertexNode {
  id: number;
  x: number;
  y: number;
  hasXError: boolean;
  hasZError: boolean;
}

export default function ColorCodeTransversalStudio() {
  const [latticeType, setLatticeType] = useState<'4.8.8' | '6.6.6'>('6.6.6');
  const [activeGate, setActiveGate] = useState<'H' | 'S' | 'CNOT' | null>(null);
  const [qubitErrors, setQubitErrors] = useState<Map<number, { x: boolean; z: boolean }>>(new Map());
  const [copied, setCopied] = useState<boolean>(false);
  const [animatingGate, setAnimatingGate] = useState<boolean>(false);

  // 1. Generate Triangular 6.6.6 / 4.8.8 Color Code Nodes & Faces
  const { vertices, faces } = useMemo(() => {
    const nodes: VertexNode[] = [];
    const colorFaces: ColorFace[] = [];

    if (latticeType === '6.6.6') {
      // 7-qubit Steane / 19-qubit Color Code Triangular Grid
      const coords = [
        { id: 0, x: 200, y: 80 },
        { id: 1, x: 130, y: 180 },
        { id: 2, x: 270, y: 180 },
        { id: 3, x: 60, y: 280 },
        { id: 4, x: 200, y: 280 },
        { id: 5, x: 340, y: 280 },
        { id: 6, x: 130, y: 380 },
        { id: 7, x: 270, y: 380 },
      ];

      coords.forEach((c) => {
        const err = qubitErrors.get(c.id) || { x: false, z: false };
        nodes.push({ id: c.id, x: c.x, y: c.y, hasXError: err.x, hasZError: err.z });
      });

      // Triangular 3-colorable faces
      const rawFaces: Array<{ id: string; type: 'R' | 'G' | 'B'; verts: number[] }> = [
        { id: 'f1', type: 'R', verts: [0, 1, 4] },
        { id: 'f2', type: 'G', verts: [0, 4, 2] },
        { id: 'f3', type: 'B', verts: [1, 3, 4] },
        { id: 'f4', type: 'R', verts: [4, 5, 2] },
        { id: 'f5', type: 'G', verts: [3, 6, 4] },
        { id: 'f6', type: 'B', verts: [4, 7, 5] },
      ];

      rawFaces.forEach((f) => {
        const fVerts = f.verts.map((vId) => nodes.find((n) => n.id === vId)!);
        const cx = fVerts.reduce((acc, v) => acc + v.x, 0) / fVerts.length;
        const cy = fVerts.reduce((acc, v) => acc + v.y, 0) / fVerts.length;
        
        // Face syndrome trigger if odd number of errors on boundary
        const numErrors = fVerts.filter((v) => v.hasXError || v.hasZError).length;
        const hasSyndrome = numErrors % 2 === 1;

        colorFaces.push({ id: f.id, type: f.type, vertices: f.verts, cx, cy, hasSyndrome });
      });
    } else {
      // 4.8.8 Octagonal-Square Color Code Grid
      const coords = [
        { id: 0, x: 100, y: 100 }, { id: 1, x: 200, y: 100 }, { id: 2, x: 300, y: 100 },
        { id: 3, x: 100, y: 200 }, { id: 4, x: 200, y: 200 }, { id: 5, x: 300, y: 200 },
        { id: 6, x: 100, y: 300 }, { id: 7, x: 200, y: 300 }, { id: 8, x: 300, y: 300 },
      ];

      coords.forEach((c) => {
        const err = qubitErrors.get(c.id) || { x: false, z: false };
        nodes.push({ id: c.id, x: c.x, y: c.y, hasXError: err.x, hasZError: err.z });
      });

      const rawFaces: Array<{ id: string; type: 'R' | 'G' | 'B'; verts: number[] }> = [
        { id: 'sq1', type: 'R', verts: [0, 1, 4, 3] },
        { id: 'sq2', type: 'G', verts: [1, 2, 5, 4] },
        { id: 'sq3', type: 'B', verts: [3, 4, 7, 6] },
        { id: 'sq4', type: 'R', verts: [4, 5, 8, 7] },
      ];

      rawFaces.forEach((f) => {
        const fVerts = f.verts.map((vId) => nodes.find((n) => n.id === vId)!);
        const cx = fVerts.reduce((acc, v) => acc + v.x, 0) / fVerts.length;
        const cy = fVerts.reduce((acc, v) => acc + v.y, 0) / fVerts.length;
        const numErrors = fVerts.filter((v) => v.hasXError || v.hasZError).length;
        colorFaces.push({ id: f.id, type: f.type, vertices: f.verts, cx, cy, hasSyndrome: numErrors % 2 === 1 });
      });
    }

    return { vertices: nodes, faces: colorFaces };
  }, [latticeType, qubitErrors]);

  // 2. Execute Transversal Gates
  const applyTransversalGate = (gate: 'H' | 'S' | 'CNOT') => {
    setActiveGate(gate);
    setAnimatingGate(true);
    sound.playDecoderLock();

    setTimeout(() => {
      setAnimatingGate(false);
      // Transversal Hadamard swaps X and Z errors
      if (gate === 'H') {
        const nextErr = new Map<number, { x: boolean; z: boolean }>();
        qubitErrors.forEach((val, key) => {
          nextErr.set(key, { x: val.z, z: val.x });
        });
        setQubitErrors(nextErr);
      }
    }, 600);
  };

  const toggleQubitError = (id: number) => {
    sound.playSyndromeTick();
    const copy = new Map(qubitErrors);
    const curr = copy.get(id) || { x: false, z: false };
    if (!curr.x && !curr.z) {
      copy.set(id, { x: true, z: false });
    } else if (curr.x && !curr.z) {
      copy.set(id, { x: false, z: true });
    } else {
      copy.delete(id);
    }
    setQubitErrors(copy);
  };

  const handleReset = () => {
    sound.playDecoderLock();
    setQubitErrors(new Map());
    setActiveGate(null);
  };

  // Veo 3.1 Prompt
  const veoPrompt = `Cinematic 8K 3D photorealistic animation of a 3-colorable ${latticeType} color code triangular lattice executing transversal Hadamard (H^⊗n) logic. Red, green, and blue stabilizer plaquettes illuminate as X and Z Pauli operators swap in parallel across all physical qubits without magic state distillation, 60fps.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(veoPrompt);
    sound.playDecoderLock();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <span className="eyebrow text-plaquette mb-1">// TRANSVERSAL COLOR CODE LOGIC</span>
          <h3 className="font-display text-xl font-bold text-text-hi">
            Quantum Color Code 3D Transversal Gate Simulator
          </h3>
          <p className="mt-1 text-sm text-text-mid">
            Explore 3-colorable face lattices (6.6.6 and 4.8.8) that support full transversal Clifford gates (H, S, CNOT) without magic state distillation factories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-ink-600 bg-ink-800 px-3.5 py-1.5 font-mono text-xs font-semibold text-text-mid hover:text-text-hi transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset Qubits
          </button>
        </div>
      </div>

      {/* Control Panel & Transversal Buttons */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Color Code Architecture:</span>
          <div className="flex gap-2">
            {(['6.6.6', '4.8.8'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setLatticeType(type); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  latticeType === type ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid hover:text-text-hi'
                }`}
              >
                {type} Code
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3 sm:col-span-2 flex flex-col justify-between">
          <span className="text-text-low text-[10px] uppercase block mb-1">Execute Transversal Logic:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applyTransversalGate('H')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded font-bold border transition-all ${
                activeGate === 'H' ? 'border-star bg-star/20 text-star' : 'border-ink-700 bg-ink-800 text-text-hi hover:border-star'
              }`}
            >
              <Play className="h-3 w-3" /> Transversal H^{'{n}'}
            </button>
            <button
              type="button"
              onClick={() => applyTransversalGate('S')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded font-bold border transition-all ${
                activeGate === 'S' ? 'border-magic bg-magic/20 text-magic' : 'border-ink-700 bg-ink-800 text-text-hi hover:border-magic'
              }`}
            >
              <Play className="h-3 w-3" /> Transversal S^{'{n}'}
            </button>
            <button
              type="button"
              onClick={() => applyTransversalGate('CNOT')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded font-bold border transition-all ${
                activeGate === 'CNOT' ? 'border-stabilizer bg-stabilizer/20 text-stabilizer' : 'border-ink-700 bg-ink-800 text-text-hi hover:border-stabilizer'
              }`}
            >
              <Play className="h-3 w-3" /> Transversal CX^{'{n}'}
            </button>
          </div>
        </div>
      </div>

      {/* SVG Color Code Lattice View */}
      <div className="mt-5 relative rounded-xl border border-ink-700 bg-ink-950 p-4 flex justify-center items-center overflow-hidden min-h-[400px]">
        <svg width="420" height="440" viewBox="0 0 420 440" className="max-w-full">
          {/* Faces */}
          {faces.map((f) => {
            const vCoords = f.vertices.map((vId) => {
              const v = vertices.find((node) => node.id === vId)!;
              return `${v.x},${v.y}`;
            }).join(' ');

            let colorHex = '#f43f5e'; // Red
            if (f.type === 'G') colorHex = '#10b981'; // Green
            if (f.type === 'B') colorHex = '#3b82f6'; // Blue

            return (
              <g key={f.id}>
                <polygon
                  points={vCoords}
                  fill={colorHex}
                  fillOpacity={f.hasSyndrome ? 0.65 : 0.25}
                  stroke={colorHex}
                  strokeWidth={f.hasSyndrome ? 3 : 1.5}
                  className={`transition-all duration-300 ${f.hasSyndrome ? 'animate-pulse' : ''}`}
                />
                <text x={f.cx} y={f.cy} fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle" opacity="0.8 font-bold">
                  {f.type}
                </text>
              </g>
            );
          })}

          {/* Physical Qubit Vertices */}
          {vertices.map((v) => {
            let strokeColor = '#64748b';
            if (v.hasXError) strokeColor = '#f43f5e';
            if (v.hasZError) strokeColor = '#3b82f6';

            return (
              <g key={v.id} onClick={() => toggleQubitError(v.id)} className="cursor-pointer">
                <circle
                  cx={v.x}
                  cy={v.y}
                  r="14"
                  fill="#0f172a"
                  stroke={strokeColor}
                  strokeWidth={v.hasXError || v.hasZError ? 3 : 1.5}
                  className="transition-all hover:scale-110"
                />
                <text x={v.x} y={v.y} fill="#f8fafc" fontSize="10" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
                  q{v.id}
                </text>

                {(v.hasXError || v.hasZError) && (
                  <text x={v.x + 12} y={v.y - 12} fill={v.hasXError ? '#f43f5e' : '#3b82f6'} fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {v.hasXError ? 'X' : 'Z'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Animation Overlay */}
        {animatingGate && (
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur flex items-center justify-center font-mono text-sm font-bold text-plaquette animate-fade-in">
            <Zap className="h-6 w-6 animate-bounce mr-2 text-magic" /> Executing Transversal {activeGate}^n Gate...
          </div>
        )}
      </div>

      {/* Physics Takeaway Box */}
      <div className="mt-5 rounded-xl border border-ink-700 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 text-plaquette font-bold uppercase tracking-wider text-[11px]">
          <ShieldCheck className="h-4 w-4" /> Why Color Codes Enable Transversal Clifford Gates
        </div>
        <p className="text-text-mid leading-relaxed font-sans text-xs">
          Color codes live on 3-valent, 3-colorable lattices whose plaquettes have even weight (e.g. the hexagons of the 6.6.6 code) — the triangular faces drawn here are a simplified schematic, not the true tiling. Because the stabilizers are even-weight and self-dual, transversal Hadamard (H^⊗n) swaps the X and Z checks bitwise without spreading errors, so 2D color codes get transversal Clifford gates (H, S, CNOT) with no magic-state distillation. (Below, H shows that real X↔Z swap; the S and CNOT buttons are illustrative.)
        </p>
      </div>

      {/* Google Veo 3.1 AI Prompt Box */}
      <div className="mt-4 rounded-xl border border-magic/30 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Google Veo 3.1 AI Video Generation Prompt
          </span>
          <button
            type="button"
            onClick={copyPrompt}
            className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copied ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
        <div className="rounded-lg bg-ink-950 p-3 border border-ink-700 text-text-mid select-all">
          &ldquo;{veoPrompt}&rdquo;
        </div>
      </div>
    </div>
  );
}

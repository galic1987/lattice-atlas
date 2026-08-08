import { useState, useId } from 'react';
import {
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ShieldCheck,
} from 'lucide-react';

export type SurfaceType = 'torus' | 'double-torus' | 'klein' | 'mobius';

export interface SurfaceMeta {
  id: SurfaceType;
  name: string;
  genus: string;
  orientable: boolean;
  logicalQubits: number;
  eulerChar: number;
  description: string;
}

const SURFACES: SurfaceMeta[] = [
  {
    id: 'torus',
    name: 'Genus-1 Torus (Donut)',
    genus: 'g = 1',
    orientable: true,
    logicalQubits: 2,
    eulerChar: 0,
    description: 'Kitaev’s 1998 Toric Code embeds periodic boundary conditions on a single donut. Non-contractible meridian and longitude loops encode 2 logical qubits.',
  },
  {
    id: 'double-torus',
    name: 'Genus-2 Double Torus',
    genus: 'g = 2',
    orientable: true,
    logicalQubits: 4,
    eulerChar: -2,
    description: 'A 2-hole torus surface. The 1st homology group H₁(M, ℤ₂) has dimension 2g = 4, encoding 4 logical qubits in non-contractible cycles.',
  },
  {
    id: 'klein',
    name: 'Klein Bottle (Non-orientable)',
    genus: 'g = 1 (non-orientable)',
    orientable: false,
    logicalQubits: 2,
    eulerChar: 0,
    description: 'A closed surface with no inside or outside! Passing a Pauli X error loop through the non-orientable twist flips its orientation operator.',
  },
  {
    id: 'mobius',
    name: 'Möbius Strip (1 Boundary)',
    genus: 'g = 1 (boundary)',
    orientable: false,
    logicalQubits: 1,
    eulerChar: 0,
    description: 'A single-sided topological surface with 1 boundary edge. Logical information is protected between the single boundary and the central non-contractible loop.',
  },
];

export default function MultiManifoldExplorer() {
  const [selectedType, setSelectedType] = useState<SurfaceType>('torus');
  const [rotX, setRotX] = useState<number>(30);
  const [rotY, setRotY] = useState<number>(45);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(true);

  const gradId = useId();
  const surface = SURFACES.find((s) => s.id === selectedType) ?? SURFACES[0];

  const resetView = () => {
    setRotX(30);
    setRotY(45);
    setIsAutoSpin(false);
  };

  return (
    <div className="rounded-2xl border border-magic/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// MULTI-MANIFOLD HOMOLOGY EXPLORER</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] text-magic font-bold">TOPOLOGICAL SURFACES</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Multi-Genus Surface Code Topology</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {SURFACES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedType(s.id)}
              className={
                selectedType === s.id
                  ? 'rounded-lg border border-plaquette bg-plaquette/20 px-3 py-1.5 font-mono text-xs font-bold text-plaquette shadow-sm'
                  : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
              }
            >
              {s.name.split(' ')[0]} ({s.genus})
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        {surface.description}
      </p>

      {/* 3D Manifold Viewport */}
      <div className="relative mt-6 grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Interactive SVG Parametric Render */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2 font-mono text-[11px] text-text-low">
            <span className="flex items-center gap-1.5 text-star font-bold">
              <Sparkles className="h-4 w-4" /> 3D Topology: {surface.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoSpin(!isAutoSpin)}
                className="inline-flex items-center gap-1 rounded bg-plaquette/15 px-2 py-0.5 font-mono text-[10px] text-plaquette hover:bg-plaquette/25"
              >
                {isAutoSpin ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                {isAutoSpin ? 'Pause Spin' : 'Auto Spin'}
              </button>
              <button
                type="button"
                onClick={resetView}
                className="inline-flex items-center gap-1 rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-text-mid hover:text-text-hi"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
          </div>

          <div className="relative flex h-80 w-full items-center justify-center cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 340 240"
              className="h-full w-full select-none"
              style={{
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transformStyle: 'preserve-3d',
                transition: isAutoSpin ? 'transform 0.5s linear' : 'transform 0.1s ease-out',
              }}
            >
              <defs>
                <radialGradient id={`${gradId}-glow`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="170" cy="120" r="105" fill={`url(#${gradId}-glow)`} />

              {/* Parametric Manifold Geometry Render */}
              {selectedType === 'torus' && (
                <g>
                  <ellipse cx="170" cy="120" rx="95" ry="42" fill="none" stroke="#3D5178" strokeWidth="2.5" strokeDasharray="4 4" />
                  <ellipse cx="170" cy="120" rx="55" ry="24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeDasharray="3 3" />
                  <ellipse cx="115" cy="120" rx="16" ry="36" fill="none" stroke="#22D3EE" strokeWidth="4" className="animate-pulse" />
                  <ellipse cx="170" cy="120" rx="76" ry="33" fill="none" stroke="#8B5CF6" strokeWidth="4" className="animate-pulse" />
                </g>
              )}

              {selectedType === 'double-torus' && (
                <g>
                  <ellipse cx="110" cy="120" rx="55" ry="38" fill="none" stroke="#3D5178" strokeWidth="2.5" strokeDasharray="4 4" />
                  <ellipse cx="110" cy="120" rx="22" ry="16" fill="none" stroke="#22D3EE" strokeWidth="2" />
                  <ellipse cx="230" cy="120" rx="55" ry="38" fill="none" stroke="#3D5178" strokeWidth="2.5" strokeDasharray="4 4" />
                  <ellipse cx="230" cy="120" rx="22" ry="16" fill="none" stroke="#22D3EE" strokeWidth="2" />
                  <g>
                    <ellipse cx="110" cy="120" rx="36" ry="28" fill="none" stroke="#22D3EE" strokeWidth="3.5" className="animate-pulse" />
                    <ellipse cx="230" cy="120" rx="36" ry="28" fill="none" stroke="#22D3EE" strokeWidth="3.5" className="animate-pulse" />
                  </g>
                  <ellipse cx="170" cy="120" rx="110" ry="36" fill="none" stroke="#8B5CF6" strokeWidth="4" className="animate-pulse" />
                </g>
              )}

              {selectedType === 'klein' && (
                <g>
                  <path d="M 90 120 C 90 50, 250 50, 250 120 C 250 190, 150 180, 170 120 C 180 80, 110 90, 90 120 Z" fill="none" stroke="#F5B83D" strokeWidth="3" strokeDasharray="5 3" />
                  <ellipse cx="130" cy="120" rx="24" ry="40" fill="none" stroke="#22D3EE" strokeWidth="4" className="animate-pulse" />
                  <ellipse cx="210" cy="120" rx="24" ry="40" fill="none" stroke="#8B5CF6" strokeWidth="4" className="animate-pulse" />
                </g>
              )}

              {selectedType === 'mobius' && (
                <g>
                  <path d="M 80 120 Q 170 40 260 120 Q 170 200 80 120 Z" fill="none" stroke="#FB7185" strokeWidth="3" strokeDasharray="4 2" />
                  <ellipse cx="170" cy="120" rx="65" ry="28" fill="none" stroke="#34D399" strokeWidth="2.5" />
                  <circle cx="170" cy="120" r="35" fill="none" stroke="#22D3EE" strokeWidth="4" className="animate-pulse" />
                </g>
              )}
            </svg>
          </div>

          <div className="mt-4 border-t border-ink-800 pt-3 grid grid-cols-2 gap-4">
            <div>
              <span className="font-mono text-[10px] text-text-low">Pitch X: {rotX}°</span>
              <input
                type="range"
                min="0"
                max="90"
                value={rotX}
                onChange={(e) => {
                  setIsAutoSpin(false);
                  setRotX(Number(e.target.value));
                }}
                className="w-full accent-plaquette cursor-pointer"
              />
            </div>
            <div>
              <span className="font-mono text-[10px] text-text-low">Yaw Y: {rotY}°</span>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotY}
                onChange={(e) => {
                  setIsAutoSpin(false);
                  setRotY(Number(e.target.value));
                }}
                className="w-full accent-star cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Invariant Info */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <span className="font-mono text-[11px] font-bold text-stabilizer flex items-center gap-1 border-b border-ink-800 pb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Topological Invariants
            </span>

            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded bg-ink-900 p-2.5 border border-ink-800 font-mono">
                <p className="text-text-low">Genus: <span className="text-text-hi font-bold">{surface.genus}</span></p>
                <p className="mt-1 text-text-low">Euler Characteristic: <span className="text-magic font-bold">χ = {surface.eulerChar}</span></p>
                <p className="mt-1 text-plaquette font-bold">Logical Qubits: k = {surface.logicalQubits}</p>
                <p className="mt-1 text-star font-bold">Orientable: {surface.orientable ? 'Yes' : 'No (Non-orientable)'}</p>
              </div>

              <p className="text-[11px] leading-relaxed text-text-mid">
                Non-contractible 1-cycles ($\gamma \in H_1(M, Z_2)$) that wrap around topological handles store logical qubits without physical reference frames.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

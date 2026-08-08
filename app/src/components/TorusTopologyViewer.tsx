import { useState, useId } from 'react';
import {
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export interface TorusLoopConfig {
  showZ1: boolean;
  showX1: boolean;
  showErrorLoop: boolean;
}

export default function TorusTopologyViewer() {
  const [rotX, setRotX] = useState<number>(30);
  const [rotY, setRotY] = useState<number>(45);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(true);
  const [showZ1, setShowZ1] = useState<boolean>(true);
  const [showX1, setShowX1] = useState<boolean>(true);
  const [showContractible, setShowContractible] = useState<boolean>(false);

  const gradId = useId();

  const toggleAutoSpin = () => setIsAutoSpin(!isAutoSpin);

  const resetView = () => {
    setRotX(30);
    setRotY(45);
    setIsAutoSpin(false);
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// TOPOLOGICAL HOMOLOGY VIEWER</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] text-magic font-bold">GENUS-1 MANIFOLD</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Interactive 3D Torus Code Topology</h3>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowZ1(!showZ1)}
            className={
              showZ1
                ? 'rounded-lg border border-plaquette bg-plaquette/20 px-3 py-1.5 font-mono text-xs font-bold text-plaquette shadow-sm'
                : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
            }
          >
            Logical Z₁ (Meridian Loop)
          </button>

          <button
            type="button"
            onClick={() => setShowX1(!showX1)}
            className={
              showX1
                ? 'rounded-lg border border-star bg-star/20 px-3 py-1.5 font-mono text-xs font-bold text-star shadow-sm'
                : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
            }
          >
            Logical X₁ (Longitude Loop)
          </button>

          <button
            type="button"
            onClick={() => setShowContractible(!showContractible)}
            className={
              showContractible
                ? 'rounded-lg border border-syndrome bg-syndrome/20 px-3 py-1.5 font-mono text-xs font-bold text-syndrome shadow-sm'
                : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
            }
          >
            Contractible Error Loop
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Kitaev’s original 1997 Toric Code embeds physical qubits on a 2D periodic lattice. Topologically, a closed periodic surface forms a <strong>Genus-1 Torus</strong>. Unlike planar surface codes (1 logical qubit), a Torus stores <strong>2 logical qubits</strong> in non-contractible 1-cycles (γ₁, γ₂) that wrap completely around the donut.
      </p>

      {/* 3D Torus Interactive WebGL / Canvas Container */}
      <div className="relative mt-6 grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Interactive 3D Torus Orbit Viewport */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2 font-mono text-[11px] text-text-low">
            <span className="flex items-center gap-1.5 text-star font-bold">
              <Sparkles className="h-4 w-4" /> Torus Homology Schematic
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAutoSpin}
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

          {/* SVG Parametric 3D Torus Representation */}
          <div className="relative flex h-80 w-full items-center justify-center cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 320 240"
              className="h-full w-full select-none"
              style={{
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transformStyle: 'preserve-3d',
                transition: isAutoSpin ? 'transform 0.5s linear' : 'transform 0.1s ease-out',
              }}
            >
              <defs>
                <radialGradient id={`${gradId}-torusGlow`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Ambient Glow */}
              <circle cx="160" cy="120" r="100" fill={`url(#${gradId}-torusGlow)`} />

              {/* Outer Donut Rim Lines */}
              <ellipse cx="160" cy="120" rx="100" ry="45" fill="none" stroke="#3D5178" strokeWidth="2" strokeDasharray="4 4" />
              <ellipse cx="160" cy="120" rx="60" ry="25" fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Logical Z1 Meridian Loop */}
              {showZ1 && (
                <g>
                  <ellipse cx="100" cy="120" rx="18" ry="38" fill="none" stroke="#22D3EE" strokeWidth="4" className="animate-pulse" />
                  <ellipse cx="220" cy="120" rx="18" ry="38" fill="none" stroke="#22D3EE" strokeWidth="4" className="animate-pulse" />
                  <text x="75" y="80" fill="#22D3EE" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Z₁ Meridian
                  </text>
                </g>
              )}

              {/* Logical X1 Longitude Loop */}
              {showX1 && (
                <g>
                  <ellipse cx="160" cy="120" rx="80" ry="35" fill="none" stroke="#8B5CF6" strokeWidth="4" className="animate-pulse" />
                  <text x="160" y="170" fill="#8B5CF6" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    X₁ Longitude Loop
                  </text>
                </g>
              )}

              {/* Contractible Error Loop */}
              {showContractible && (
                <g>
                  <circle cx="160" cy="95" r="12" fill="#FB7185" fillOpacity="0.2" stroke="#FB7185" strokeWidth="2.5" strokeDasharray="2 2" />
                  <text x="160" y="75" fill="#FB7185" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    ∂e = 0 (Contractible)
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Manual Rotation Sliders */}
          <div className="mt-4 border-t border-ink-800 pt-3 grid grid-cols-2 gap-4">
            <div>
              <span className="font-mono text-[10px] text-text-low">Pitch X Angle: {rotX}°</span>
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
              <span className="font-mono text-[10px] text-text-low">Yaw Y Angle: {rotY}°</span>
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

        {/* Right 1 Col: Homological Invariant & Mathematical Insight */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-2">
              <span className="font-mono text-[11px] font-bold text-stabilizer flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Homological Code Space
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs leading-relaxed text-text-mid">
              <div className="rounded bg-ink-900 p-2.5 border border-ink-800 font-mono text-[11px]">
                <p className="text-star font-bold">Euler Characteristic χ = 2 - 2g</p>
                <p className="mt-1 text-text-low">For Genus g=1 (Torus): χ = 0</p>
                <p className="mt-1 text-plaquette">k = 2g = 2 Logical Qubits</p>
              </div>

              <p className="text-[11px] leading-relaxed text-text-mid">
                Any local error loop that does not wrap around the Torus can be continuously contracted to a point (∂e = 0). It is equal to a product of stabilizer operators and leaves the logical qubit untouched!
              </p>
            </div>
          </div>

          {/* Reference Link */}
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 flex-1 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">HISTORICAL ORIGIN</span>
              <h4 className="font-display text-sm font-bold text-text-hi mt-1">Kitaev (1997) Toric Code Paper</h4>
              <p className="mt-2 text-xs leading-relaxed text-text-mid">
                A. Yu. Kitaev introduced topological quantum memory on 2D closed manifolds in “Fault-tolerant quantum computation by anyons” — posted to arXiv in 1997, published in <i>Annals of Physics</i> in 2003.
              </p>
            </div>

            <a
              href="https://arxiv.org/abs/quant-ph/9707021"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-magic/40 bg-magic/10 py-2 font-mono text-xs font-bold text-magic hover:bg-magic/20"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Read Kitaev 1997 Paper
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

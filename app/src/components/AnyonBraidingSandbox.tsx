import { useState } from 'react';
import { Sparkles, RotateCcw, Orbit } from 'lucide-react';
import { sound } from '@/lib/sound';

export type AnyonType = 'e' | 'm' | 'epsilon' | 'vacuum';

// Each toric-code anyon carries a charge bit and a flux bit: vacuum (0,0),
// e (1,0), m (0,1), ε (1,1). The full mutual monodromy phase of x around y is
// π·(qe_x·qm_y + qm_x·qe_y) mod 2π — i.e. exactly −1 when one carries charge and
// the other the flux it sees, +1 otherwise. (These anyons are abelian, so the
// phase is always ±1.)
const ANYON_BITS: Record<AnyonType, [number, number]> = {
  vacuum: [0, 0],
  e: [1, 0],
  m: [0, 1],
  epsilon: [1, 1],
};
const monodromyUnits = (a: AnyonType, b: AnyonType): number => {
  const [ae, am] = ANYON_BITS[a];
  const [be, bm] = ANYON_BITS[b];
  return (ae * bm + am * be) % 2; // 0 or 1, in units of π
};

export default function AnyonBraidingSandbox() {
  const [anyonA, setAnyonA] = useState<AnyonType>('e');
  const [anyonB, setAnyonB] = useState<AnyonType>('m');
  const [braidAngle, setBraidAngle] = useState<number>(0);
  const [fusionResult, setFusionResult] = useState<string>('e × m = ε (Fermion)');

  const triggerBraid = () => {
    sound.playDecoderLock();
    setBraidAngle((prev) => prev + 360);
  };

  const calculateFusion = (a: AnyonType, b: AnyonType) => {
    sound.playErrorFlip();
    setAnyonA(a);
    setAnyonB(b);

    if (a === 'vacuum' || b === 'vacuum') {
      setFusionResult(`${a} × ${b} = ${a === 'vacuum' ? b : a}`);
    } else if (a === b) {
      setFusionResult(`${a} × ${b} = 1 (Vacuum Annihilation)`);
    } else if ((a === 'e' && b === 'm') || (a === 'm' && b === 'e')) {
      setFusionResult('e × m = ε (Fermion Bound State)');
    } else if ((a === 'e' && b === 'epsilon') || (a === 'epsilon' && b === 'e')) {
      setFusionResult('e × ε = m (Magnetic Fluxon)');
    } else if ((a === 'm' && b === 'epsilon') || (a === 'epsilon' && b === 'm')) {
      setFusionResult('m × ε = e (Electric Charge)');
    }
  };

  return (
    <div className="rounded-2xl border border-star/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// TOPOLOGICAL ANYON DYNAMICS</span>
            <span className="rounded bg-star/20 px-2 py-0.5 font-mono text-[10px] text-star font-bold">ABELIAN ANYON STATISTICS</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Anyon Braiding & Fusion Rules Sandbox</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={triggerBraid}
            className="btn-primary text-xs !px-3 !py-1.5"
          >
            <Orbit className="h-3.5 w-3.5" /> Perform 360° Braid
          </button>
          <button
            type="button"
            onClick={() => {
              setBraidAngle(0);
              calculateFusion('e', 'm');
            }}
            className="rounded-lg border border-ink-700 bg-ink-950 p-1.5 text-text-low hover:text-text-hi"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        In 2D, quasiparticles need not be bosons or fermions — they are <strong>anyons</strong>. The toric
        code’s e, m, and ε are <strong>abelian</strong>: taking an electric charge (e) fully around a
        magnetic fluxon (m) multiplies the state by a mutual −1 (Aharonov–Bohm phase θ = π), while e and m
        are each individually bosonic.
      </p>

      {/* 2D Interactive Braiding Arena */}
      <div className="relative mt-6 grid gap-6 md:grid-cols-3">
        <div className="col-span-2 relative h-72 rounded-xl border border-ink-700 bg-ink-950 p-4 flex flex-col items-center justify-center overflow-hidden">
          <span className="absolute top-3 left-3 font-mono text-[10px] text-text-low">// 2D ANYON BRAIDING ARENA</span>

          <svg viewBox="0 0 300 200" className="h-full w-full select-none">
            {/* Orbital Path */}
            <circle cx="150" cy="100" r="60" fill="none" stroke="#3D5178" strokeWidth="2" strokeDasharray="4 4" />

            {/* Anyon A (Center or Orbiting) */}
            <g style={{ transform: `rotate(${braidAngle}deg)`, transformOrigin: '150px 100px', transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <circle cx="210" cy="100" r="16" fill="#22D3EE" opacity="0.8" className="animate-pulse" />
              <text x="210" y="104" textAnchor="middle" fill="#0B132B" fontWeight="bold" fontSize="12 font-mono">
                {anyonA}
              </text>
            </g>

            {/* Anyon B (Center) */}
            <circle cx="150" cy="100" r="18" fill="#8B5CF6" opacity="0.8" />
            <text x="150" y="104" textAnchor="middle" fill="#FFFFFF" fontWeight="bold" fontSize="12 font-mono">
              {anyonB}
            </text>
          </svg>

          {(() => {
            const loops = braidAngle / 360; // each braid is one full encirclement
            const units = monodromyUnits(anyonA, anyonB); // 0 or 1 (× π)
            const exponent = units * loops; // integer multiple of π
            const sign = units === 0 || loops % 2 === 0 ? '+1' : '−1';
            return (
              <div className="mt-2 font-mono text-xs text-plaquette">
                Encirclements: <span className="font-bold text-text-hi">{loops}</span> · mutual monodromy
                phase e^(i·{exponent}π) = <span className="font-bold text-text-hi">{sign}</span>
                {units === 1 && (
                  <span className="text-text-low"> — {anyonA} around {anyonB} are mutual semions (−1 per loop)</span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Fusion Rules Table */}
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold text-star flex items-center gap-1 border-b border-ink-800 pb-2">
              <Sparkles className="h-3.5 w-3.5" /> Fusion Rules (Z₂ Algebra)
            </span>

            <div className="mt-3 space-y-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => calculateFusion('e', 'm')}
                className="w-full text-left rounded bg-ink-900 p-2 border border-ink-800 hover:border-plaquette text-text-hi"
              >
                e × m → ε (Fermion)
              </button>
              <button
                type="button"
                onClick={() => calculateFusion('e', 'e')}
                className="w-full text-left rounded bg-ink-900 p-2 border border-ink-800 hover:border-plaquette text-text-hi"
              >
                e × e → 1 (Annihilation)
              </button>
              <button
                type="button"
                onClick={() => calculateFusion('m', 'm')}
                className="w-full text-left rounded bg-ink-900 p-2 border border-ink-800 hover:border-plaquette text-text-hi"
              >
                m × m → 1 (Annihilation)
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-magic/40 bg-magic/10 p-3 font-mono text-xs text-magic">
            <span className="block text-[10px] uppercase text-text-low">Fusion Outcome:</span>
            <span className="font-bold text-sm block mt-0.5">{fusionResult}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

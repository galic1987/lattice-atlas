import { useId, useMemo, useState } from 'react';
import { Layers, Infinity as InfinityIcon, TriangleAlert } from 'lucide-react';

/**
 * GenusExplorer — extends the single-torus picture to a family of closed
 * orientable surfaces (sphere → triple torus) and shows why a genus-g surface
 * code encodes k = 2g logical qubits.
 *
 * Physics kept honest:
 *  - k = 2g, χ = 2 − 2g, b₁ = 2g hold ONLY for closed *orientable* surfaces.
 *  - The non-orientable aside (Klein bottle, Möbius strip) is captioned as a
 *    boundary of the formula, not an extension of it, with the correct (and
 *    different) counts — see NON_ORIENTABLE below.
 */

const A_CYCLE = '#8B5CF6'; // longitude — around the hole (star / violet)
const B_CYCLE = '#22D3EE'; // meridian  — through the hole (plaquette / cyan)

interface OrientableSurface {
  g: number;
  name: string;
  short: string;
}

const SURFACES: OrientableSurface[] = [
  { g: 0, name: 'Sphere', short: 'S²' },
  { g: 1, name: 'Torus', short: 'T²' },
  { g: 2, name: 'Double torus', short: 'Σ₂' },
  { g: 3, name: 'Triple torus', short: 'Σ₃' },
];

/** Evenly spaced hole centres for a genus-g handlebody schematic. */
function holeCentres(g: number): number[] {
  if (g <= 0) return [];
  const spacing = 92;
  const cx = 200;
  return Array.from({ length: g }, (_, i) => cx + (i - (g - 1) / 2) * spacing);
}

export default function GenusExplorer() {
  const [g, setG] = useState<number>(1);
  const [showCycles, setShowCycles] = useState<boolean>(true);
  const gradId = useId().replace(/:/g, '');

  const holes = useMemo(() => holeCentres(g), [g]);
  const chi = 2 - 2 * g;
  const k = 2 * g;
  const bodyRx = Math.min(70 + g * 46, 185);

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// GENUS EXPLORER</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] font-bold text-magic">k = 2g</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">How many logical qubits fit on a surface?</h3>
        </div>

        <label className="flex items-center gap-2 font-mono text-[11px] text-text-mid">
          <input
            type="checkbox"
            checked={showCycles}
            onChange={() => setShowCycles((v) => !v)}
            className="accent-plaquette"
          />
          Show the 2g cycles
        </label>
      </div>

      {/* Surface selector */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SURFACES.map((s) => (
          <button
            key={s.g}
            type="button"
            onClick={() => setG(s.g)}
            aria-pressed={g === s.g}
            className={
              g === s.g
                ? 'rounded-lg border border-plaquette bg-plaquette/20 px-3 py-1.5 font-mono text-xs font-bold text-plaquette shadow-sm'
                : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
            }
          >
            <span className="mr-1.5 text-text-mid">g={s.g}</span>
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Left: schematic */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2 font-mono text-[11px] text-text-low">
            <span className="flex items-center gap-1.5 font-bold text-star">
              <Layers className="h-4 w-4" /> {SURFACES[g].name} · genus {g}
            </span>
            <span>{k === 0 ? 'no protected loops' : `${k} independent 1-cycles`}</span>
          </div>

          <div className="flex h-72 w-full items-center justify-center">
            <svg viewBox="0 0 400 220" className="h-full w-full select-none" role="img" aria-label={`Schematic of a genus-${g} ${SURFACES[g].name.toLowerCase()} carrying ${k} logical qubits`}>
              <defs>
                <radialGradient id={`${gradId}-body`} cx="45%" cy="35%" r="75%">
                  <stop offset="0%" stopColor="#3A2E6E" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#141C33" stopOpacity="0.95" />
                </radialGradient>
              </defs>

              {/* Body: rounded blob spanning all handles (a sphere when g=0) */}
              <ellipse
                cx={200}
                cy={110}
                rx={bodyRx}
                ry={72}
                fill={`url(#${gradId}-body)`}
                stroke="#4C5A85"
                strokeWidth={2}
              />
              {/* soft specular */}
              <ellipse cx={200 - bodyRx * 0.35} cy={80} rx={bodyRx * 0.32} ry={20} fill="#8B5CF6" fillOpacity={0.14} />

              {/* Holes (handles) */}
              {holes.map((hx, i) => (
                <g key={i}>
                  <ellipse cx={hx} cy={112} rx={26} ry={34} fill="#05080F" stroke="#4C5A85" strokeWidth={2} />
                  <ellipse cx={hx} cy={108} rx={26} ry={34} fill="none" stroke="#2A3554" strokeWidth={1} />
                </g>
              ))}

              {/* 2g cycles: per handle, one longitude (around hole) + one meridian (through hole) */}
              {showCycles &&
                holes.map((hx, i) => (
                  <g key={`c-${i}`}>
                    {/* a-cycle: longitude, wraps around the hole */}
                    <ellipse
                      cx={hx}
                      cy={110}
                      rx={40}
                      ry={52}
                      fill="none"
                      stroke={A_CYCLE}
                      strokeWidth={3}
                      className="animate-pulse"
                    />
                    {/* b-cycle: meridian, threads through the hole around the tube */}
                    <ellipse
                      cx={hx}
                      cy={78}
                      rx={30}
                      ry={13}
                      fill="none"
                      stroke={B_CYCLE}
                      strokeWidth={3}
                      className="animate-pulse"
                    />
                    <text x={hx} y={182} textAnchor="middle" fill={A_CYCLE} fontSize={9} fontFamily="monospace">
                      a{g > 1 ? <tspan baselineShift="sub" fontSize={7}>{i + 1}</tspan> : null}
                    </text>
                    <text x={hx} y={62} textAnchor="middle" fill={B_CYCLE} fontSize={9} fontFamily="monospace">
                      b{g > 1 ? <tspan baselineShift="sub" fontSize={7}>{i + 1}</tspan> : null}
                    </text>
                  </g>
                ))}

              {/* Sphere: show a contractible loop to make "k=0" tangible */}
              {g === 0 && (
                <g>
                  <circle cx={200} cy={104} r={26} fill="none" stroke="#FB7185" strokeWidth={2.5} strokeDasharray="3 3" />
                  <text x={200} y={150} textAnchor="middle" fill="#FB7185" fontSize={9} fontFamily="monospace">
                    every loop contracts → ∂ = 0
                  </text>
                </g>
              )}
            </svg>
          </div>

          <p className="mt-1 border-t border-ink-800 pt-2 font-mono text-[10px] leading-relaxed text-text-low">
            <span style={{ color: A_CYCLE }}>a-cycles</span> wrap around each hole;{' '}
            <span style={{ color: B_CYCLE }}>b-cycles</span> thread through it. Each handle adds one
            independent pair — two logical operators no local error can erase.
          </p>
        </div>

        {/* Right: invariants */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <span className="font-mono text-[11px] font-bold text-stabilizer">Homological code space</span>
            <div className="mt-3 space-y-2 font-mono text-[11px]">
              <Row label="Genus" value={`g = ${g}`} />
              <Row label="Euler characteristic" value={`χ = 2 − 2g = ${chi}`} />
              <Row label="First Betti number" value={`b₁ = 2g = ${2 * g}`} />
              <div className="rounded bg-ink-900 p-2.5 text-center">
                <span className="text-plaquette font-bold">k = 2g = {k} logical qubit{k === 1 ? '' : 's'}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-text-mid">
              {g === 0
                ? 'A sphere has no handles: every cycle bounds a disk, so there is nothing for a logical operator to hide in. k = 0.'
                : `Each of the ${g} handle${g === 1 ? '' : 's'} contributes two independent non-contractible cycles (an a/b pair), and each pair carries one logical qubit — so k = 2g = ${k}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Non-orientable aside — the honest boundary of the formula */}
      <div className="mt-6 rounded-xl border border-syndrome/40 bg-syndrome/[0.06] p-4">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-syndrome" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-syndrome">
            Where k = 2g stops working
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-text-mid">
          The formula above is for <strong>closed, orientable</strong> surfaces only. Non-orientable
          surfaces break it — shown here to mark the boundary, not to extend the rule:
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {NON_ORIENTABLE.map((n) => (
            <div key={n.name} className="rounded-lg border border-ink-700 bg-ink-950 p-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-text-hi">
                <InfinityIcon className="h-3.5 w-3.5 text-text-low" /> {n.name}
              </div>
              <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-text-low">{n.homology}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-text-mid">{n.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-text-low">{label}</span>
      <span className="text-text-hi">{value}</span>
    </div>
  );
}

const NON_ORIENTABLE: { name: string; homology: string; note: string }[] = [
  {
    name: 'Klein bottle',
    homology: 'χ = 0 · H₁(ℤ) = ℤ ⊕ ℤ/2 · dim H₁(ℤ₂) = 2',
    note: 'Closed but non-orientable, so it has no genus g and k ≠ 2g. Its integer homology even carries torsion (ℤ/2). Over the ℤ₂ coefficients that qubit codes actually use, dim H₁ = 2 — so a Klein-bottle code does encode 2 qubits, but by a different route than the orientable formula.',
  },
  {
    name: 'Möbius strip',
    homology: 'χ = 0 · has a boundary · b₁ = 1',
    note: 'Not a closed manifold at all — it has an edge — so the toric-code construction (which needs a closed surface) does not apply directly. It deformation-retracts to a single circle, so b₁ = 1, again not 2g.',
  },
];

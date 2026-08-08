import { useMemo, useState } from 'react';
import { ExternalLink, GitMerge, Orbit, ScanLine } from 'lucide-react';

type SketchId = 'surgery-cnot' | 'mutual-braid';

interface Sketch {
  id: SketchId;
  tab: string;
  title: string;
  invariant: string;
  boundary: string;
  steps: ReadonlyArray<{ title: string; body: string }>;
  source: { label: string; href: string };
}

const SKETCHES: ReadonlyArray<Sketch> = [
  {
    id: 'surgery-cnot',
    tab: 'CNOT measurement pattern',
    title: 'Ancilla-assisted lattice-surgery CNOT',
    invariant:
      'One standard convention prepares a logical ancilla in |+⟩, measures ZCZA, then XAXT, then ZA, and uses the outcomes to update the Pauli frame.',
    boundary:
      'This is a logical measurement pattern—not a compiled patch layout or a three-cycle hardware circuit. A fault-tolerant implementation repeats syndrome extraction for a distance-dependent schedule and must specify boundaries, noise, decoding, and feed-forward.',
    steps: [
      {
        title: 'Prepare the mediator',
        body: 'Prepare logical ancilla A in |+⟩. Control C and target T remain separate logical patches.',
      },
      {
        title: 'Measure ZCZA',
        body: 'A merge/split pattern extracts the joint logical Z parity of control and ancilla; it does not reveal either logical value alone.',
      },
      {
        title: 'Measure XAXT',
        body: 'A second merge/split pattern extracts the joint logical X parity of ancilla and target.',
      },
      {
        title: 'Measure ZA + update frame',
        body: 'Measure the ancilla in Z and combine all three classical outcomes into the prescribed Pauli-frame corrections. The resulting logical channel is CNOT.',
      },
    ],
    source: {
      label: 'Lattice-surgery construction (Horsman et al.)',
      href: 'https://arxiv.org/abs/1111.4022',
    },
  },
  {
    id: 'mutual-braid',
    tab: 'e around m',
    title: 'Mutual braiding in the toric-code model',
    invariant:
      'A closed e path that winds once around an m excitation contributes a relative phase −1 compared with an otherwise equivalent unlinked reference path.',
    boundary:
      'Toric/surface-code e and m excitations are Abelian. This sketch is not a non-Abelian exchange, not a universal H/S/T gate recipe, and not an executable defect schedule. Excitations are created in pairs or absorbed at compatible boundaries; the diagram isolates only the linked portion of a larger process.',
    steps: [
      {
        title: 'Choose two coherent branches',
        body: 'Use a reference branch that does not enclose m and a braid branch in which e will travel around m. A relative phase needs both branches to be observable.',
      },
      {
        title: 'Move e halfway around m',
        body: 'Local string operations move the e endpoint. The path itself is spatial; stacking the frames supplies the time direction.',
      },
      {
        title: 'Close the linked path',
        body: 'Return e to its starting configuration after one winding. The braid branch is now topologically linked with the m worldline.',
      },
      {
        title: 'Interfere with the reference',
        body: 'The linked branch has relative phase −1. Measurement statistics reveal that phase only after a later operation recombines the two branches.',
      },
    ],
    source: {
      label: 'Toric-code model (Kitaev)',
      href: 'https://arxiv.org/abs/quant-ph/9707021',
    },
  },
];

const SURGERY_Y = [310, 232, 154, 76] as const;
const BRAID_POSITIONS = [
  { x: 360, y: 278 },
  { x: 494, y: 180 },
  { x: 360, y: 82 },
  { x: 226, y: 180 },
] as const;

function SurgeryDiagram({ step }: { step: number }) {
  const activeY = SURGERY_Y[step];
  return (
    <svg
      viewBox="0 0 720 360"
      className="min-w-[620px] w-full"
      role="img"
      aria-label={`Lattice-surgery CNOT logical measurement pattern, stage ${step + 1}: ${SKETCHES[0].steps[step].title}`}
    >
      <defs>
        <marker id="time-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0L8 4L0 8Z" fill="#7B89A7" />
        </marker>
      </defs>
      <line x1="55" y1="322" x2="55" y2="38" stroke="#7B89A7" strokeWidth="2" markerEnd="url(#time-arrow)" />
      <text x="34" y="178" transform="rotate(-90 34 178)" fill="#A9B4CC" fontSize="12" fontFamily="JetBrains Mono">logical time</text>

      {[
        { x: 210, label: 'C · control', color: '#22D3EE' },
        { x: 360, label: 'A · ancilla', color: '#F5B83D' },
        { x: 510, label: 'T · target', color: '#9B7BFA' },
      ].map((rail) => (
        <g key={rail.label}>
          <rect x={rail.x - 34} y="38" width="68" height="286" rx="18" fill={rail.color} fillOpacity="0.08" stroke={rail.color} strokeOpacity="0.55" />
          <line x1={rail.x} y1="314" x2={rail.x} y2="48" stroke={rail.color} strokeWidth="5" strokeLinecap="round" />
          <text x={rail.x} y="347" textAnchor="middle" fill={rail.color} fontSize="13" fontFamily="JetBrains Mono">{rail.label}</text>
        </g>
      ))}

      <rect x="210" y="216" width="150" height="32" rx="14" fill="#22D3EE" fillOpacity="0.18" stroke="#22D3EE" strokeWidth="2" />
      <text x="285" y="237" textAnchor="middle" fill="#EAF0FB" fontSize="13" fontFamily="JetBrains Mono">measure ZCZA</text>
      <rect x="360" y="138" width="150" height="32" rx="14" fill="#9B7BFA" fillOpacity="0.18" stroke="#9B7BFA" strokeWidth="2" />
      <text x="435" y="159" textAnchor="middle" fill="#EAF0FB" fontSize="13" fontFamily="JetBrains Mono">measure XAXT</text>
      <rect x="326" y="60" width="68" height="32" rx="14" fill="#F5B83D" fillOpacity="0.18" stroke="#F5B83D" strokeWidth="2" />
      <text x="360" y="81" textAnchor="middle" fill="#EAF0FB" fontSize="13" fontFamily="JetBrains Mono">ZA</text>

      <line x1="92" y1={activeY} x2="600" y2={activeY} stroke="#FB7185" strokeWidth="2.5" strokeDasharray="7 5" />
      <rect x="604" y={activeY - 15} width="90" height="30" rx="10" fill="#FB7185" fillOpacity="0.14" stroke="#FB7185" />
      <text x="649" y={activeY + 5} textAnchor="middle" fill="#FB7185" fontSize="12" fontFamily="JetBrains Mono">stage {step + 1}</text>
    </svg>
  );
}

function BraidDiagram({ step }: { step: number }) {
  const moving = BRAID_POSITIONS[step];
  return (
    <svg
      viewBox="0 0 720 360"
      className="min-w-[620px] w-full"
      role="img"
      aria-label={`Four-frame spatial braid sketch, stage ${step + 1}: ${SKETCHES[1].steps[step].title}`}
    >
      <defs>
        <marker id="braid-direction" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0L8 4L0 8Z" fill="#9B7BFA" />
        </marker>
      </defs>
      <text x="42" y="34" fill="#A9B4CC" fontSize="12" fontFamily="JetBrains Mono">one spatial frame · time advances with the stage control</text>
      <ellipse cx="360" cy="180" rx="134" ry="98" fill="#111A2E" stroke="#3D5178" strokeWidth="2" />
      <path d="M360 278C510 278 548 106 390 82" fill="none" stroke="#9B7BFA" strokeOpacity="0.45" strokeWidth="3" strokeDasharray="7 6" markerEnd="url(#braid-direction)" />
      <path d="M330 82C172 106 210 278 360 278" fill="none" stroke="#9B7BFA" strokeOpacity="0.45" strokeWidth="3" strokeDasharray="7 6" markerEnd="url(#braid-direction)" />
      <circle cx="360" cy="180" r="26" fill="#22D3EE" fillOpacity="0.18" stroke="#22D3EE" strokeWidth="3" />
      <text x="360" y="185" textAnchor="middle" fill="#22D3EE" fontSize="16" fontWeight="700" fontFamily="JetBrains Mono">m</text>
      <circle cx={moving.x} cy={moving.y} r="22" fill="#9B7BFA" fillOpacity="0.22" stroke="#9B7BFA" strokeWidth="3" />
      <text x={moving.x} y={moving.y + 5} textAnchor="middle" fill="#EAF0FB" fontSize="16" fontWeight="700" fontFamily="JetBrains Mono">e</text>
      <path d="M116 278V82" stroke="#7B89A7" strokeWidth="2" strokeDasharray="5 5" />
      <text x="116" y="304" textAnchor="middle" fill="#A9B4CC" fontSize="12" fontFamily="JetBrains Mono">unlinked reference</text>
      <text x="360" y="333" textAnchor="middle" fill="#FB7185" fontSize="13" fontFamily="JetBrains Mono">linked branch / reference branch = −1 after one closed winding</text>
    </svg>
  );
}

export default function SpacetimeBraidWeaver() {
  const [sketchId, setSketchId] = useState<SketchId>('surgery-cnot');
  const [step, setStep] = useState(0);
  const sketch = useMemo(
    () => SKETCHES.find((candidate) => candidate.id === sketchId) ?? SKETCHES[0],
    [sketchId],
  );
  const Icon = sketch.id === 'surgery-cnot' ? GitMerge : Orbit;

  const chooseSketch = (id: SketchId) => {
    setSketchId(id);
    setStep(0);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-plaquette/40 bg-ink-900 p-5 shadow-glow-cyan md:p-6" aria-labelledby="spacetime-sketch-title">
      <div className="flex flex-col gap-4 border-b border-ink-700 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="shrink-0 rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
            <ScanLine className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// CONCEPTUAL · NOT EXECUTED</span>
            <h3 id="spacetime-sketch-title" className="font-display text-xl font-bold text-text-hi">Spacetime sketches: what each line actually means</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Choose a spacetime sketch">
          {SKETCHES.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidate.id === sketch.id}
              onClick={() => chooseSketch(candidate.id)}
              className={candidate.id === sketch.id
                ? 'rounded-lg border border-plaquette bg-plaquette/15 px-3 py-2 font-mono text-xs font-bold text-plaquette'
                : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 font-mono text-xs text-text-mid hover:border-ink-500 hover:text-text-hi'}
            >
              {candidate.tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-stabilizer/35 bg-stabilizer/[0.07] p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-stabilizer" aria-hidden="true" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-stabilizer">Invariant claim</p>
          <p className="mt-1 text-sm leading-6 text-text-hi">{sketch.invariant}</p>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1.5fr_0.75fr]">
        <figure className="min-w-0 rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="overflow-x-auto" role="region" aria-label={`${sketch.title} diagram; scroll horizontally on a small screen`} tabIndex={0}>
            {sketch.id === 'surgery-cnot' ? <SurgeryDiagram step={step} /> : <BraidDiagram step={step} />}
          </div>
          <figcaption className="mt-3 border-t border-ink-800 pt-3 text-xs leading-5 text-text-low">
            Diagram boundary: {sketch.boundary}
          </figcaption>
        </figure>

        <div className="min-w-0 rounded-xl border border-ink-700 bg-ink-950 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">Stage {step + 1} of {sketch.steps.length}</p>
          <h4 className="mt-1 font-display text-lg font-bold text-text-hi">{sketch.steps[step].title}</h4>
          <p className="mt-3 text-sm leading-6 text-text-mid">{sketch.steps[step].body}</p>

          <label className="mt-6 block font-mono text-xs text-text-mid">
            Walk through the declared stages
            <input
              type="range"
              min="0"
              max={sketch.steps.length - 1}
              step="1"
              value={step}
              onChange={(event) => setStep(Number(event.target.value))}
              aria-valuetext={`Stage ${step + 1}: ${sketch.steps[step].title}`}
              className="mt-3 w-full accent-plaquette"
            />
          </label>
          <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Stage controls">
            {sketch.steps.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  aria-label={`Show stage ${index + 1}: ${item.title}`}
                  aria-pressed={step === index}
                  className={step === index
                    ? 'flex h-9 w-full items-center justify-center rounded border border-plaquette bg-plaquette/15 font-mono text-xs font-bold text-plaquette'
                    : 'flex h-9 w-full items-center justify-center rounded border border-ink-600 bg-ink-850 font-mono text-xs text-text-low hover:text-text-hi'}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ol>

          <a href={sketch.source.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-plaquette hover:underline">
            {sketch.source.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a href="https://github.com/tqec/TopoLS" target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1.5 font-mono text-xs text-star hover:underline">
            Open the real TopoLS compiler repository <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

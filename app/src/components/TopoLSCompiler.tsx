import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  Braces,
  Circle,
  ExternalLink,
  FileCheck2,
  FlaskConical,
  GitBranch,
  Map,
  Route,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

type SpiderKind = 'Z' | 'X';

interface SchematicExample {
  id: string;
  shortLabel: string;
  title: string;
  kind: SpiderKind;
  direction: 'merge' | 'split';
  semantic: string;
  logicalPlan: string;
  scheduleObligation: string;
  boundary: string;
}

interface PipelineStage {
  title: string;
  shortTitle: string;
  responsibility: string;
  artifact: string;
  icon: typeof Braces;
}

const SCHEMATIC_EXAMPLES: SchematicExample[] = [
  {
    id: 'z-spider-merge',
    shortLabel: 'Z · 2→1',
    title: 'Phase-zero Z-spider · two inputs to one output',
    kind: 'Z',
    direction: 'merge',
    semantic:
      'A phase-zero Z-spider imposes an equality relation in the computational basis. Its arity and open ports are part of the linear-map meaning—not drawing decoration.',
    logicalPlan:
      'A compiler must preserve that Z-basis relation while expressing it as supported logical parity operations and explicit Pauli-frame updates.',
    scheduleObligation:
      'Bind every port to a logical patch, choose a documented boundary convention, schedule repeated joint checks for the selected code distance, and retain the measurement record.',
    boundary:
      'This sketch does not determine patch orientation, code distance, check circuits, timing, noise, or normalization conventions. Those choices are required before it becomes an executable construction.',
  },
  {
    id: 'x-spider-split',
    shortLabel: 'X · 1→2',
    title: 'Phase-zero X-spider · one input to two outputs',
    kind: 'X',
    direction: 'split',
    semantic:
      'A phase-zero X-spider is the color-dual relation in the X basis. It correlates the plus/minus basis labels across its open ports.',
    logicalPlan:
      'A compiler must preserve that X-basis relation using supported parity operations, preparations or measurements, plus any outcome-dependent frame update.',
    scheduleObligation:
      'Choose compatible logical boundaries, allocate the output patches, schedule distance-preserving check changes, and expose every outcome needed by later feed-forward.',
    boundary:
      'Color duality at the ZX layer does not automatically supply a legal hardware layout. Boundary orientation, hook-error ordering, distance, and detector definitions still need construction and testing.',
  },
];

const PIPELINE: PipelineStage[] = [
  {
    title: 'Typed ZX graph and circuit semantics',
    shortTitle: 'Typed ZX',
    responsibility:
      'Parse a versioned input schema, type every open port, record spider phases and arities, and establish that the graph denotes the intended source circuit or linear map.',
    artifact:
      'Typed graph + source-to-ZX equivalence evidence',
    icon: Braces,
  },
  {
    title: 'Logical parity-operation plan',
    shortTitle: 'Parity plan',
    responsibility:
      'Lower the ZX structure into supported logical preparations, multi-patch Pauli measurements, destructive measurements, and outcome-dependent frame updates.',
    artifact:
      'Ordered logical operations + classical dependencies',
    icon: GitBranch,
  },
  {
    title: 'Distance-aware patch schedule',
    shortTitle: 'Patch schedule',
    responsibility:
      'Assign patches and boundaries, route interactions, avoid spatial conflicts, and repeat code deformations for enough rounds to meet a declared distance target.',
    artifact:
      'Patch geometry per code cycle + resource counts',
    icon: Route,
  },
  {
    title: 'Detector-circuit construction',
    shortTitle: 'Detectors',
    responsibility:
      'Expand the schedule into physical checks, measurement records, detectors, logical observables, coordinates, and an explicit circuit-level noise model.',
    artifact:
      'Executable detector circuit with declared conventions',
    icon: Workflow,
  },
  {
    title: 'Parse, model, and invariant evidence',
    shortTitle: 'Evidence',
    responsibility:
      'Parse the circuit in Stim, derive its detector error model where supported, and test detector determinism, logical equivalence, fault distance, and resource invariants.',
    artifact:
      'Reproducible logs, fixtures, versions, and pass/fail results',
    icon: ShieldCheck,
  },
];

const RECEIPT_ROWS = [
  ['Curated ZX schematic', 'Shown', 'The two examples are explanatory data stored in this component.'],
  ['Compiler invocation', 'Not run', 'This page does not load or execute TopoLS or another compiler.'],
  ['Patch schedule', 'Not generated', 'No geometry, code distance, or round schedule is produced.'],
  ['Stim circuit / detector error model', 'Not generated', 'There is no downloadable circuit and no hidden simulation.'],
  ['Equivalence and fault-distance tests', 'Not run', 'No physics-verification badge is awarded by this interaction.'],
] as const;

function SpiderSchematic({ example }: { example: SchematicExample }) {
  const titleId = useId();
  const descriptionId = useId();
  const isZ = example.kind === 'Z';
  const isMerge = example.direction === 'merge';
  const spiderX = 160;
  const spiderY = 90;
  const leftPorts = isMerge ? [55, 125] : [90];
  const rightPorts = isMerge ? [90] : [55, 125];
  const color = isZ ? '#22D3EE' : '#FB7185';

  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full min-h-48 w-full"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>{example.title}</title>
      <desc id={descriptionId}>
        A schematic {example.kind}-spider with {leftPorts.length} input port
        {leftPorts.length === 1 ? '' : 's'} and {rightPorts.length} output port
        {rightPorts.length === 1 ? '' : 's'}. It is a semantic teaching diagram, not a compiled patch layout.
      </desc>

      <rect x="1" y="1" width="318" height="178" rx="16" fill="#080D19" stroke="#263653" />
      <text x="24" y="27" fill="#7181A3" fontSize="9" fontFamily="monospace" letterSpacing="1.4">
        OPEN INPUT PORTS
      </text>
      <text
        x="296"
        y="27"
        textAnchor="end"
        fill="#7181A3"
        fontSize="9"
        fontFamily="monospace"
        letterSpacing="1.4"
      >
        OPEN OUTPUT PORTS
      </text>

      {leftPorts.map((y, index) => (
        <g key={`left-${y}`}>
          <line x1="39" y1={y} x2={spiderX - 22} y2={spiderY} stroke="#60739A" strokeWidth="3" />
          <circle cx="34" cy={y} r="6" fill="#0E172A" stroke="#A9B5CF" strokeWidth="2" />
          <text x="22" y={y + 3} textAnchor="end" fill="#A9B5CF" fontSize="10" fontFamily="monospace">
            {isMerge ? String.fromCharCode(65 + index) : 'IN'}
          </text>
        </g>
      ))}

      {rightPorts.map((y, index) => (
        <g key={`right-${y}`}>
          <line x1={spiderX + 22} y1={spiderY} x2="281" y2={y} stroke="#60739A" strokeWidth="3" />
          <circle cx="286" cy={y} r="6" fill="#0E172A" stroke="#A9B5CF" strokeWidth="2" />
          <text x="298" y={y + 3} fill="#A9B5CF" fontSize="10" fontFamily="monospace">
            {isMerge ? 'OUT' : String.fromCharCode(65 + index)}
          </text>
        </g>
      ))}

      <circle cx={spiderX} cy={spiderY} r="25" fill={color} fillOpacity="0.17" stroke={color} strokeWidth="3" />
      <text
        x={spiderX}
        y={spiderY + 5}
        textAnchor="middle"
        fill={color}
        fontSize="18"
        fontWeight="700"
        fontFamily="monospace"
      >
        {example.kind}
      </text>
      <text
        x={spiderX}
        y="146"
        textAnchor="middle"
        fill="#A9B5CF"
        fontSize="10"
        fontFamily="monospace"
      >
        phase 0 · schematic
      </text>
    </svg>
  );
}

function stageExampleNote(stageIndex: number, example: SchematicExample) {
  if (stageIndex === 0) return example.semantic;
  if (stageIndex === 1) return example.logicalPlan;
  if (stageIndex === 2) return example.scheduleObligation;
  if (stageIndex === 3) {
    return 'Nothing at the ZX-sketch layer identifies individual data qubits, ancilla ordering, measurement records, detectors, or observables. A separate code-construction pass must create them.';
  }
  return 'Evidence must come from real artifacts and reproducible tests. A successful animation, a plausible picture, or a parseable circuit alone would not establish logical equivalence or fault distance.';
}

export default function TopoLSCompiler() {
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const example = SCHEMATIC_EXAMPLES[selectedExampleIndex];
  const stage = PIPELINE[selectedStageIndex];
  const StageIcon = stage.icon;

  return (
    <section
      className="rounded-2xl border border-plaquette/40 bg-ink-900 p-4 shadow-glow-cyan sm:p-6"
      aria-labelledby="compiler-blueprint-title"
    >
      <div className="border-b border-ink-700 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
              <Box className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">
                  // INTERACTIVE CONCEPT MAPPER
                </span>
                <span className="rounded border border-magic/35 bg-magic/10 px-2 py-0.5 font-mono text-[10px] font-bold text-magic">
                  NO CODE EXECUTION
                </span>
              </div>
              <h3 id="compiler-blueprint-title" className="mt-1 font-display text-xl font-bold text-text-hi sm:text-2xl">
                ZX → lattice-surgery compiler blueprint
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-mid">
                Follow the information a real toolchain must preserve. Selecting an example only changes curated teaching data;
                it does not invoke TopoLS, generate a layout, call Stim, or contact quantum hardware.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Choose a schematic ZX example">
            {SCHEMATIC_EXAMPLES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selectedExampleIndex === index}
                onClick={() => {
                  setSelectedExampleIndex(index);
                  setSelectedStageIndex(0);
                }}
                className={
                  selectedExampleIndex === index
                    ? 'min-h-11 rounded-lg border border-plaquette bg-plaquette/15 px-3 py-2 font-mono text-xs text-plaquette focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette'
                    : 'min-h-11 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 font-mono text-xs text-text-mid transition-colors hover:border-ink-500 hover:text-text-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette'
                }
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-800 pb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-star">Curated semantic sketch</span>
            <span className="rounded border border-star/25 bg-star/10 px-2 py-1 font-mono text-[10px] text-star">
              NOT A FLOOR PLAN
            </span>
          </div>
          <div className="mt-4 h-52">
            <SpiderSchematic example={example} />
          </div>
          <h4 className="mt-4 font-display text-base font-semibold text-text-hi">{example.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-text-mid">{example.semantic}</p>
          <div className="mt-4 rounded-lg border border-magic/30 bg-magic/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-magic">Analogy boundary</p>
            <p className="mt-1 text-xs leading-relaxed text-text-mid">{example.boundary}</p>
          </div>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="border-b border-ink-800 pb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-plaquette">Five obligations, not five animations</span>
            <p className="mt-1 text-xs leading-relaxed text-text-low">
              Choose a stage to inspect what must be represented and what evidence it should emit.
            </p>
          </div>

          <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label="Compiler evidence pipeline">
            {PIPELINE.map((item, index) => {
              const Icon = item.icon;
              const active = selectedStageIndex === index;
              return (
                <li key={item.shortTitle} className="min-w-0">
                  <button
                    type="button"
                    aria-current={active ? 'step' : undefined}
                    aria-controls={panelId}
                    onClick={() => setSelectedStageIndex(index)}
                    className={
                      active
                        ? 'flex min-h-20 w-full flex-col items-start rounded-lg border border-plaquette bg-plaquette/10 p-3 text-left text-plaquette focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette'
                        : 'flex min-h-20 w-full flex-col items-start rounded-lg border border-ink-700 bg-ink-900 p-3 text-left text-text-low transition-colors hover:border-ink-500 hover:text-text-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette'
                    }
                  >
                    <span className="flex w-full items-center justify-between gap-2 font-mono text-[10px]">
                      0{index + 1}
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-xs font-semibold leading-tight text-current">{item.shortTitle}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <motion.div
            id={panelId}
            key={`${example.id}-${selectedStageIndex}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="mt-4 rounded-xl border border-plaquette/25 bg-ink-900 p-4"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-plaquette/25 bg-plaquette/10 p-2 text-plaquette">
                <StageIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-plaquette">Stage {selectedStageIndex + 1}</p>
                <h4 className="mt-1 font-display text-lg font-semibold text-text-hi">{stage.title}</h4>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-ink-700 bg-ink-950 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">Real responsibility</p>
                <p className="mt-2 text-sm leading-relaxed text-text-mid">{stage.responsibility}</p>
              </div>
              <div className="rounded-lg border border-star/25 bg-star/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-star">For this schematic</p>
                <p className="mt-2 text-sm leading-relaxed text-text-mid">{stageExampleNote(selectedStageIndex, example)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg border border-ink-700 bg-ink-950 p-3">
              <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-stabilizer" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-text-mid">
                <span className="font-mono uppercase tracking-wider text-stabilizer">Required artifact: </span>
                {stage.artifact}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-magic/30 bg-magic/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-magic" aria-hidden="true" />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-magic">Evidence receipt · this browser interaction</p>
            <p className="mt-1 text-xs leading-relaxed text-text-mid">
              A receipt is useful even when every execution field says “not run”: it prevents a teaching sketch from being
              mistaken for a compiled or verified result.
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-2">
          {RECEIPT_ROWS.map(([term, status, detail]) => (
            <div
              key={term}
              className="grid gap-2 rounded-lg border border-ink-700 bg-ink-950 p-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(7rem,0.35fr)_minmax(0,1.8fr)] sm:items-center"
            >
              <dt className="text-xs font-semibold text-text-hi">{term}</dt>
              <dd>
                <span
                  className={
                    status === 'Shown'
                      ? 'inline-flex rounded border border-plaquette/30 bg-plaquette/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-plaquette'
                      : 'inline-flex rounded border border-magic/30 bg-magic/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-magic'
                  }
                >
                  {status}
                </span>
              </dd>
              <dd className="text-xs leading-relaxed text-text-low">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-ink-700 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/map?topic=zx-calculus-basics"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-star/30 bg-star/10 px-3 py-2 font-mono text-xs text-star hover:border-star/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star"
          >
            <Map className="h-3.5 w-3.5" aria-hidden="true" />
            Study ZX calculus
          </Link>
          <Link
            to="/map?topic=lattice-surgery"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-plaquette/30 bg-plaquette/10 px-3 py-2 font-mono text-xs text-plaquette hover:border-plaquette/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette"
          >
            <Map className="h-3.5 w-3.5" aria-hidden="true" />
            Study lattice surgery
          </Link>
          <Link
            to="/lab"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stabilizer/30 bg-stabilizer/10 px-3 py-2 font-mono text-xs text-stabilizer hover:border-stabilizer/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stabilizer"
          >
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            Open code lab
          </Link>
        </div>

        <a
          href="https://github.com/tqec/TopoLS"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-ink-600 px-3 py-2 font-mono text-xs text-text-mid hover:border-plaquette/50 hover:text-plaquette focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette lg:self-auto"
        >
          Explore the real TopoLS project
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-text-low">
        <Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-current text-text-low" aria-hidden="true" />
        TopoLS is an external research project. Lattice Atlas is showing a learning blueprint here, not embedding, certifying,
        or reproducing that project’s compiler results.
        <ArrowRight className="mt-0.5 hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden="true" />
      </p>
    </section>
  );
}

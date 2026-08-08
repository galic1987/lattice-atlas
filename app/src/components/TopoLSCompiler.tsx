import { useState } from 'react';
import {
  ArrowRight,
  Box,
  ExternalLink,
  GitBranch,
  Network,
  Route,
} from 'lucide-react';

const TOPOLS_REPO = 'https://github.com/tqec/TopoLS';
const TOPOLS_PAPER = 'https://arxiv.org/abs/2601.23109';

const STAGES = [
  {
    title: 'ZX-level topological optimization',
    short: 'ZX transform',
    body: 'TopoLS converts the circuit to a ZX diagram, applies spider fusion, and slices the graph by topological connectivity so merge–split structure is explicit.',
    icon: Network,
    output: 'Layered ZX graph',
  },
  {
    title: '3D layout search with MCTS',
    short: 'MCTS layout',
    body: 'Monte Carlo Tree Search explores candidate three-dimensional embeddings. This is an optimization search over space–time volume, not a fixed one-click rewrite.',
    icon: Route,
    output: 'Candidate 3D embeddings',
  },
  {
    title: 'Topology-aware partitioning',
    short: 'Partition',
    body: 'Large circuits are partitioned using spider connectivity to keep each layer tractable while preserving the topological structure used by the layout search.',
    icon: GitBranch,
    output: 'Lattice-surgery pipe diagram',
  },
] as const;

const EXAMPLES = [
  {
    id: 'ghz16',
    label: '16-qubit GHZ',
    note: 'Official repository example',
    command: 'uv run prog.py -f ghz_16 -b 20 -zx 1 -dir 1 -l 4 -r 0 -s 2 -t 2 -i 1000 -csv result -sp 0 -b0 0',
  },
  {
    id: 'random500',
    label: '500-qubit random circuit',
    note: 'Reported benchmark family; consult the repository for parameters',
    command: '# See docs/tutorial.ipynb and docs/exp.py in the pinned TopoLS checkout.',
  },
] as const;

export default function TopoLSCompiler() {
  const [stageIndex, setStageIndex] = useState(0);
  const [exampleId, setExampleId] = useState<(typeof EXAMPLES)[number]['id']>(EXAMPLES[0].id);
  const stage = STAGES[stageIndex];
  const example = EXAMPLES.find((item) => item.id === exampleId) ?? EXAMPLES[0];
  const Icon = stage.icon;

  return (
    <section className="rounded-2xl border border-plaquette/40 bg-ink-900 p-5 shadow-glow-cyan md:p-6" aria-labelledby="topols-title">
      <div className="flex flex-col gap-3 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette"><Box className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// CONCEPTUAL PIPELINE WALKTHROUGH</span>
            <h3 id="topols-title" className="font-display text-xl font-bold text-text-hi">How TopoLS compiles lattice surgery</h3>
          </div>
        </div>
        <span className="rounded border border-magic/40 bg-magic/10 px-3 py-1 font-mono text-xs text-magic">COMPILER NOT RUN HERE</span>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-6 text-text-mid">
        This interactive card explains the three stages documented by the TopoLS project. Changing a card only changes the explanation: this website does not import TopoLS, run MCTS, produce a pipe diagram, invoke TQEC, or verify an output with Stim.
      </p>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="min-w-0 rounded-xl border border-ink-700 bg-ink-950 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">Official pipeline</p>
          <ol className="mt-3 space-y-2">
            {STAGES.map((item, index) => (
              <li key={item.title}>
                <button type="button" onClick={() => setStageIndex(index)} aria-pressed={stageIndex === index} className={stageIndex === index ? 'flex w-full items-center gap-3 rounded-lg border border-plaquette bg-plaquette/10 p-3 text-left text-plaquette' : 'flex w-full items-center gap-3 rounded-lg border border-ink-700 bg-ink-900 p-3 text-left text-text-mid hover:border-ink-500 hover:text-text-hi'}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current font-mono text-xs">{index + 1}</span>
                  <span className="font-display text-sm font-semibold">{item.short}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0 rounded-xl border border-plaquette/30 bg-ink-950 p-5" role="region" aria-live="polite" aria-labelledby="topols-stage-title">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-star/40 bg-star/10 p-2 text-star"><Icon className="h-6 w-6" aria-hidden="true" /></div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-star">Stage {stageIndex + 1} of {STAGES.length}</p>
              <h4 id="topols-stage-title" className="font-display text-lg font-bold text-text-hi">{stage.title}</h4>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-text-mid">{stage.body}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-ink-700 bg-ink-900 p-4 font-mono text-xs">
            <span className="text-text-low">declared stage output</span>
            <ArrowRight className="h-4 w-4 text-text-low" aria-hidden="true" />
            <span className="text-stabilizer">{stage.output}</span>
          </div>
          {stageIndex < STAGES.length - 1 && (
            <button type="button" onClick={() => setStageIndex(stageIndex + 1)} className="btn-secondary mt-5">Next documented stage <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">Reproduce outside this website</p>
            <p className="mt-1 text-sm text-text-hi">Choose an example described by the official repository.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((item) => (
              <button key={item.id} type="button" onClick={() => setExampleId(item.id)} aria-pressed={exampleId === item.id} className={exampleId === item.id ? 'rounded-lg border border-star bg-star/15 px-3 py-2 font-mono text-xs text-star' : 'rounded-lg border border-ink-600 px-3 py-2 font-mono text-xs text-text-mid hover:text-text-hi'}>{item.label}</button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-text-low">{example.note}</p>
        <pre className="mt-3 max-w-full overflow-x-auto rounded border border-ink-700 bg-ink-900 p-3 font-mono text-[11px] text-text-mid">{example.command}</pre>
        <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs">
          <a href={TOPOLS_REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-plaquette hover:underline">Official TopoLS repository <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
          <a href={TOPOLS_PAPER} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-star hover:underline">Primary preprint <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

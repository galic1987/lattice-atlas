import { useState } from 'react';
import { Video, Sparkles } from 'lucide-react';
import { asset } from '@/lib/asset';
import { sound } from '@/lib/sound';

interface VideoExplainer {
  id: string;
  title: string;
  filename: string;
  description: string;
  keyTakeaways: string[];
}

const VIDEOS: VideoExplainer[] = [
  {
    id: 'stabilizer-check',
    title: 'Stabilizer Check Mechanics (ZZZZ Parity)',
    filename: 'animations/stabilizer_check.mp4',
    description: 'Manim vector animation demonstrating 4-qubit stabilizer check entangling pulses (CNOT) projecting ancilla measurements to +1 (pass) or -1 (error fire).',
    keyTakeaways: [
      'Entangling CNOT gates pulse from ancilla qubit to data qubits.',
      'Measures 4-qubit parity without collapsing individual superposition amplitudes.',
      'Anticommuting Pauli errors flip ancilla measurement outcome to -1.',
    ],
  },
  {
    id: 'mwpm-matching',
    title: 'Minimum Weight Perfect Matching (MWPM) Decoder',
    filename: 'animations/mwpm_matching.mp4',
    description: 'Manim vector animation displaying 2D syndrome detector graph matching, edge weight evaluation, and Blossom V minimum-weight pairing lines.',
    keyTakeaways: [
      'Detector fires form nodes on a 2D/3D syndrome graph.',
      'Edge weights represent logarithmic error probability paths.',
      'MWPM pairs detector fires to find the most likely error chain.',
    ],
  },
  {
    id: 'lattice-surgery',
    title: 'Lattice Surgery Boundary Weld',
    filename: 'animations/lattice_surgery.mp4',
    description: 'Manim vector animation showing smooth Z-boundary welding between two planar surface code patches for fault-tolerant logical CNOT gates.',
    keyTakeaways: [
      'Merges smooth boundaries to measure joint operator Z_L1 · Z_L2.',
      'Generates fault-tolerant logical Bell states without non-transversal gates.',
      'Split & merge cycles form the foundation of topological quantum computation.',
    ],
  },
  {
    id: 'topological-braiding',
    title: 'Fibonacci Anyon Non-Abelian Braiding',
    filename: 'animations/topological_braiding.mp4',
    description: 'Manim vector animation displaying Fibonacci anyon world-line trajectories in (2+1)D spacetime and non-Abelian braid matrix B1 B2 ≠ B2 B1 logic.',
    keyTakeaways: [
      'Braiding world-lines in 2+1D spacetime applies non-Abelian quantum logic.',
      'Topological protection renders logic gates immune to local geometric perturbations.',
      'Fibonacci anyons exhibit golden ratio quantum dimension d_τ = ϕ ≈ 1.618.',
    ],
  },
  {
    id: 'color-code-transversal',
    title: 'Color Code Transversal Gate Execution',
    filename: 'animations/color_code_transversal.mp4',
    description: 'Manim vector animation demonstrating 3-colorable face lattices and parallel transversal Hadamard (H) gate execution without distillation.',
    keyTakeaways: [
      'Color codes allow transversal implementation of all Clifford gates (H, S, CNOT).',
      '3-colorable red, green, and blue faces act as both X and Z parity checks.',
      '3D color codes extend transversality to non-Clifford T-gates.',
    ],
  },
  {
    id: 'quantum-ldpc-bipartite',
    title: 'qLDPC Bipartite Tanner Graph & Belief Propagation',
    filename: 'animations/quantum_ldpc_bipartite.mp4',
    description: 'Manim vector animation demonstrating sparse Tanner graphs with degree-6 connectivity and Belief Propagation (BP) message-passing decoding.',
    keyTakeaways: [
      'Bipartite Tanner graphs link data qubits (V-nodes) to parity checks (C-nodes).',
      'Log-likelihood ratio (LLR) messages flow along graph edges to converge on errors.',
      'Enables high encoding rates (k/n > 0.1) with 10x fewer physical qubits than surface codes.',
    ],
  },
];

export default function ManimExplainerGallery() {
  const [selectedId, setSelectedId] = useState<string>('stabilizer-check');

  const video = VIDEOS.find((v) => v.id === selectedId) ?? VIDEOS[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    sound.playSyndromeTick();
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-850 p-6 shadow-glow-cyan">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-plaquette" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              Manim Mathematical Animation Gallery
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Mathematical 60fps vector animations generated with Manim Community v0.19.0.
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          {VIDEOS.length} Vector Animations
        </span>
      </div>

      {/* Video Selector Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {VIDEOS.map((v) => {
          const active = v.id === video.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => handleSelect(v.id)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                active
                  ? 'border-plaquette/70 bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
                  : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${active ? 'text-plaquette' : 'text-text-low'}`} />
              <span>{v.title}</span>
            </button>
          );
        })}
      </div>

      {/* Video Viewport Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-950 shadow-2xl">
          <video
            key={video.id}
            src={asset(video.filename)}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto aspect-video object-cover"
          />
        </div>

        {/* Video Explanation & Physics Insights */}
        <div className="flex flex-col justify-between rounded-xl border border-ink-600 bg-ink-900 p-5 font-mono text-xs">
          <div>
            <span className="eyebrow text-plaquette mb-2">// ANIMATION EXPLORER</span>
            <h4 className="font-display text-base font-bold text-text-hi mb-2">{video.title}</h4>
            <p className="text-text-mid leading-relaxed font-sans text-xs mb-4">{video.description}</p>

            <div className="border-t border-ink-700 pt-3">
              <span className="text-[11px] font-bold text-text-low uppercase tracking-wider mb-2 block">
                Key Physical Takeaways:
              </span>
              <ul className="space-y-2">
                {video.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-text-mid">
                    <span className="text-plaquette text-[10px] mt-0.5">◆</span>
                    <span className="leading-relaxed font-sans text-xs">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

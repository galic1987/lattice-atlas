import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Video, Sparkles } from 'lucide-react';
import { asset } from '@/lib/asset';
import { sound } from '@/lib/sound';

interface VideoExplainer {
  id: string;
  title: string;
  filename: string;
  description: string;
  keyTakeaways: string[];
  /**
   * Path (repo-relative) to the committed Manim scene this clip was rendered from.
   * Only clips with a real, in-repo source may carry the strong "rendered from the
   * real code" provenance badge; clips without one are labelled as a plain vector
   * animation whose source isn't in the repo — we don't claim provenance we can't show.
   */
  sourceScene?: string;
}

const VIDEOS: VideoExplainer[] = [
  {
    id: 'stabilizer-check',
    title: 'Stabilizer Check Mechanics (ZZZZ Parity)',
    filename: 'animations/stabilizer_check.mp4',
    description: 'Manim vector animation demonstrating a 4-qubit Z-stabilizer (ZZZZ) check: CNOTs from the data qubits into the ancilla record their parity, measured to +1 (pass) or -1 (error fire).',
    keyTakeaways: [
      'CNOTs run from the data qubits into the ancilla (data = control), so the ancilla accumulates their Z-parity.',
      'Measures 4-qubit parity without collapsing individual superposition amplitudes.',
      'Anticommuting Pauli errors flip ancilla measurement outcome to -1.',
    ],
    sourceScene: 'manim/tqec_scenes.py :: StabilizerCheck',
  },
  {
    id: 'mwpm-matching',
    title: 'Minimum Weight Perfect Matching (MWPM) Decoder',
    filename: 'animations/mwpm_matching.mp4',
    description: 'Manim vector animation displaying 2D syndrome detector graph matching, edge weight evaluation, and minimum-weight pairing lines.',
    keyTakeaways: [
      'Detector fires form nodes on a 2D/3D syndrome graph.',
      'Edge weights represent logarithmic error probability paths.',
      'MWPM pairs detector fires to find the most likely error chain.',
    ],
    sourceScene: 'manim/tqec_scenes.py :: SyndromeMatching',
  },
  {
    id: 'lattice-surgery',
    title: 'Lattice Surgery: Merge, Measure Joint Parity, Split',
    filename: 'animations/lattice_surgery.mp4',
    description: 'Manim vector animation: two surface-code patches merge along their facing smooth Z-boundaries to measure the joint parity Z_L1 · Z_L2, then split — the move that (with single-patch operations) realises a logical CNOT without moving a qubit. Schematic of the protocol, not a full stabilizer simulation.',
    keyTakeaways: [
      'Merging the smooth boundaries measures the joint operator Z_L1 · Z_L2 — the outcome is a single classical parity bit.',
      'The patches stay encoded throughout; only a boundary is welded and unwelded.',
      'Merge → measure → split, combined with single-patch operations, composes a logical CNOT — no qubit is physically moved.',
    ],
    sourceScene: 'manim/tqec_scenes.py :: LatticeSurgery',
  },
  {
    id: 'topological-braiding',
    title: 'Fibonacci Anyon Non-Abelian Braiding (beyond the core codes)',
    filename: 'animations/topological_braiding.mp4',
    description: 'Vector animation of Fibonacci anyon world-lines in (2+1)D spacetime and non-Abelian braiding (B1 B2 ≠ B2 B1). NOTE: this is an adjacent topic — the surface/toric codes this atlas teaches use ABELIAN (e, m) anyons; Fibonacci/non-abelian anyons are a different, universal-by-braiding model shown here for contrast.',
    keyTakeaways: [
      'Braiding world-lines in 2+1D spacetime applies non-Abelian quantum logic — unlike the abelian surface-code anyons.',
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
    sourceScene: 'manim/gallery/color_code_transversal_scene.py :: ColorCodeTransversalScene',
  },
  {
    id: 'threshold-suppression',
    title: 'Below Threshold: Bigger Codes Suppress Errors',
    filename: 'animations/threshold_suppression.mp4',
    description: 'Manim vector animation of logical error P_L vs physical error p for d=3,5,7. Below p_th the curves fan down (larger d wins); they cross at threshold; above p_th the order REVERSES and larger d is worse.',
    keyTakeaways: [
      'Below threshold, increasing code distance drives the logical error rate down exponentially.',
      'All distances cross at the threshold p_th — the break-even point.',
      'Above threshold the effect inverts: bigger codes decode worse, because noise outruns correction.',
    ],
    sourceScene: 'manim/tqec_scenes.py :: ThresholdSuppression',
  },
  {
    id: 'toric-code-logicals',
    title: 'Logical Operators Are Loops That Wrap the Torus',
    filename: 'animations/toric_code_logicals.mp4',
    description: 'Manim vector animation of the toric code: the two logical operators are non-contractible loops — Z̄ around the tube (meridian), X̄ the long way (longitude) — while a local error loop shrinks to nothing.',
    keyTakeaways: [
      'A logical qubit is stored in loops that wrap the torus the two independent ways.',
      'Z̄ (meridian) and X̄ (longitude) are non-contractible — no local operation removes them.',
      'A contractible local loop is a stabilizer: it shrinks to nothing and does no logical harm.',
    ],
    sourceScene: 'manim/tqec_scenes.py :: ToricCodeLogicals',
  },
  {
    id: 'quantum-ldpc-bipartite',
    title: 'qLDPC Tanner Graph & Belief Propagation',
    filename: 'animations/quantum_ldpc_bipartite.mp4',
    description: 'Manim vector animation: an error on a qubit fires exactly the parity checks that touch it, then belief-propagation messages pass along the sparse Tanner-graph edges until the qubit’s marginal flips and the error is localised. Schematic — the connectivity is thinned so the flow reads clearly (a real bivariate-bicycle qLDPC code has weight-6 checks).',
    keyTakeaways: [
      'A bipartite Tanner graph links qubit (variable) nodes to parity checks by sparse edges.',
      'An error fires only the checks in its support — that pattern is the syndrome.',
      'Belief propagation passes log-likelihood messages along the edges until the error is localised; sparse checks are what make high-rate (k/n > 0.1) qLDPC codes decodable.',
    ],
    sourceScene: 'manim/tqec_scenes.py :: QuantumLdpcBipartite',
  },
  {
    id: 'google-willow-veo31',
    title: 'Google Willow Superconducting Chip (Google Veo 3.1 AI Generation)',
    filename: 'animations/google_willow_veo31.mp4',
    description: 'High-definition 8K 3D photorealistic video pre-rendered with Google Veo 3.1 AI (illustrative) displaying the 105-qubit chip operating at 15mK.',
    keyTakeaways: [
      'Pre-rendered Veo 3.1 clip (illustrative — not an accurate depiction).',
      'Renders the 105-transmon grid inside dilution refrigerator at 15mK.',
      'The paper behind it: Willow measured Λ = 2.14 ± 0.02 error suppression below threshold (Nature 638, 2024).',
    ],
  },
  {
    id: 'kitaev-toric-code-veo31',
    title: 'Kitaev Anyon Weaving & Toric Code (Google Veo 3.1 AI Generation)',
    filename: 'animations/kitaev_toric_code_veo31.mp4',
    description: 'Cinematic 8K 3D photorealistic video pre-rendered with Google Veo 3.1 AI (illustrative) displaying Abelian electric & magnetic anyon ribbons in 2+1D spacetime.',
    keyTakeaways: [
      'Pre-rendered Veo 3.1 clip (illustrative — not an accurate depiction).',
      'Renders electric (e) and magnetic (m) quasiparticle world-lines in (2+1)D spacetime.',
      'The paper behind it: Kitaev\u2019s toric code protects quantum memory in the lattice topology — small local perturbations cannot change it (Annals Phys. 303, 2003).',
    ],
  },
  {
    id: 'magic-state-distillation-veo31',
    title: '15-to-1 Magic State Distillation Factory (Google Veo 3.1 AI Generation)',
    filename: 'animations/magic_state_distillation_veo31.mp4',
    description: 'Cinematic 8K 3D photorealistic video pre-rendered with Google Veo 3.1 AI (illustrative) displaying crystal pyramids purifying noisy ancillas into pristine T-gate states.',
    keyTakeaways: [
      'Pre-rendered Veo 3.1 clip (illustrative — not an accurate depiction).',
      'Visualizes 15 noisy T-states purified through Reed-Muller [[15,1,3]] code block.',
      'The paper behind it: 15-to-1 distillation suppresses the error rate cubically, O(ε³) (Bravyi & Kitaev, 2005).',
    ],
  },
];

export default function ManimExplainerGallery() {
  // Default to the first entry — an accurate Manim film, not an illustrative Veo
  // clip. (The previous literal 'google-willow' matched no id and only worked via
  // the VIDEOS[0] fallback below; make the honest default explicit and robust.)
  const [selectedId, setSelectedId] = useState<string>(VIDEOS[0].id);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const reduce = useReducedMotion();

  const video = VIDEOS.find((v) => v.id === selectedId) || VIDEOS[0];

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
            Exact vector animations rendered from the real code with Manim Community v0.19.0 — plus a few
            clearly-marked illustrative AI (Veo 3.1) atmospheric clips.
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          {VIDEOS.length} Clips
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
          {video.filename.includes('veo31') ? (
            <div className="border-b border-syndrome/40 bg-syndrome/15 px-3 py-1.5 font-mono text-[10px] font-bold text-syndrome">
              ⚠ ILLUSTRATIVE · AI-GENERATED (Veo 3.1) — atmospheric mood only, NOT an accurate depiction
            </div>
          ) : video.sourceScene ? (
            <div className="border-b border-stabilizer/30 bg-stabilizer/10 px-3 py-1.5 font-mono text-[10px] font-bold text-stabilizer">
              ✓ MANIM · rendered from the real code ({video.sourceScene})
            </div>
          ) : (
            <div className="border-b border-star/30 bg-star/10 px-3 py-1.5 font-mono text-[10px] font-bold text-star">
              ◆ VECTOR ANIMATION · concept illustration — source scene not in this repo (provenance unverified)
            </div>
          )}
          <video
            key={video.id}
            ref={(el) => {
              if (el) el.playbackRate = playbackRate;
            }}
            src={asset(video.filename)}
            autoPlay={!reduce}
            loop
            muted
            playsInline
            className="w-full h-auto aspect-video object-cover"
          />

          {/* Speed & Controls Bar */}
          <div className="flex items-center justify-between border-t border-ink-700 bg-ink-900 px-4 py-2 font-mono text-xs">
            <span className="text-text-low text-[10px] uppercase font-bold">Playback Speed:</span>
            <div className="flex gap-1.5">
              {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(rate);
                    sound.playSyndromeTick();
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    playbackRate === rate
                      ? 'border-plaquette bg-plaquette/20 text-plaquette'
                      : 'border-ink-700 bg-ink-950 text-text-mid hover:text-text-hi'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
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

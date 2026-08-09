import { useState } from 'react';
import { Video, BookOpen, Film, Copy, Check } from 'lucide-react';
import { sound } from '@/lib/sound';

interface PaperVideoMeta {
  paperId: string;
  paperTitle: string;
  authors: string;
  year: number;
  arxivOrDoi: string;
  conceptSummary: string;
  veoPrompt: string;
  keyEquation: string;
}

const PAPER_VIDEOS: PaperVideoMeta[] = [
  {
    paperId: 'shor-1995',
    paperTitle: 'Scheme for Reducing Decoherence in Quantum Computer Memory',
    authors: 'Peter W. Shor',
    year: 1995,
    arxivOrDoi: 'Phys. Rev. A 52, R2493',
    conceptSummary: 'Proves quantum error correction is physically possible by encoding 1 logical qubit into 9 physical qubits to protect against arbitrary single-qubit X, Z, and Y errors.',
    veoPrompt: 'Cinematic 8K video, photorealistic quantum circuit visualization of Shor 9-qubit code disentangling bit-flips and phase-flips in a glowing cyan energy grid, high-definition particles, Google Veo quality.',
    keyEquation: '|0_L⟩ = 1/2√2 (|000⟩+|111⟩)(|000⟩+|111⟩)(|000⟩+|111⟩)',
  },
  {
    paperId: 'kitaev-1997',
    paperTitle: 'Fault-Tolerant Quantum Computation by Anyons',
    authors: 'Alexei Yu. Kitaev',
    year: 1997,
    arxivOrDoi: 'Annals Phys. 303 (2003) 2-30',
    conceptSummary: 'Introduces the Toric Code and topological quantum memory, demonstrating that non-Abelian anyon braiding in 2D space yields fault-tolerant logic immune to local noise.',
    veoPrompt: 'Hyperrealistic 3D rendering of non-Abelian electric and magnetic anyon quasiparticles braiding world-lines in a 2+1D spacetime lattice, luminous cyan and violet energy ribbons, 60fps.',
    keyEquation: 'H = -J_e ∑_v A_v - J_m ∑_p B_p',
  },
  {
    paperId: 'bravyi-kitaev-1998',
    paperTitle: 'Quantum Codes on a Lattice with Boundary',
    authors: 'Sergey Bravyi, Alexei Kitaev',
    year: 1998,
    arxivOrDoi: 'arXiv:quant-ph/9811052',
    conceptSummary: 'Transforms the Toric code torus into a practical 2D planar Surface Code with rough (X) and smooth (Z) boundaries, removing the requirement for periodic boundary conditions.',
    veoPrompt: 'Cinematic 3D animation of planar surface code grid with rough and smooth boundaries, glowing red and blue plaquettes measuring stabilizer parities, photorealistic 8K render.',
    keyEquation: 'd = \\min(\\text{dist}_X, \\text{dist}_Z)',
  },
  {
    paperId: 'bravyi-kitaev-2005',
    paperTitle: 'Universal Quantum Computation with Ideal Clifford Gates and Noisy Ancillas',
    authors: 'Sergey Bravyi, Alexei Kitaev',
    year: 2005,
    arxivOrDoi: 'Phys. Rev. A 71, 022316',
    conceptSummary: 'Invents Magic State Distillation (15-to-1 T-factories), showing how noisy ancilla states |T⟩ = 1/√2(|0⟩ + e^{iπ/4}|1⟩) can be purified into fault-tolerant T-gates.',
    veoPrompt: 'Cinematic video of 15-to-1 magic state distillation factory, glowing crystal pyramids purifying noisy quantum states into pristine T-gate ancillas, high resolution.',
    keyEquation: '|T⟩ = 1/√2 (|0⟩ + e^{iπ/4}|1⟩)',
  },
  {
    paperId: 'fowler-2012',
    paperTitle: 'Surface Codes: Towards Practical Large-Scale Quantum Computation',
    authors: 'Austin G. Fowler et al.',
    year: 2012,
    arxivOrDoi: 'Phys. Rev. A 86, 032324',
    conceptSummary: 'The canonical blueprint for surface-code architecture, establishing MWPM threshold p_th ≈ 1.0% under realistic circuit noise and lattice surgery routing.',
    veoPrompt: '3D architectural visualization of a 2D superconducting quantum processor grid executing surface-code cycles, glowing pulse pipelines and MWPM syndrome matching.',
    keyEquation: 'P_L \\approx 0.03 (p / p_{th})^{(d+1)/2}',
  },
  {
    paperId: 'google-willow-2024',
    paperTitle: 'Quantum Error Correction Below the Surface Code Threshold',
    authors: 'Google Quantum AI (Willow Team)',
    year: 2024,
    arxivOrDoi: 'Nature 638 (2025)',
    conceptSummary: 'Demonstrates exponential error suppression below threshold up to distance-7 (105 transmons) with Lambda = 2.14 and 63μs real-time MWPM decoding latency.',
    veoPrompt: 'Photorealistic rendering of Google Willow 105-qubit superconducting quantum chip inside a dilution refrigerator at 15mK, glowing cyan surface-code lattice layers.',
    keyEquation: 'Λ = ε(d) / ε(d+2) = 2.14 ± 0.02',
  },
];

export default function PaperVeoVideoGallery() {
  const [selectedId, setSelectedId] = useState<string>('google-willow-2024');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const paper = PAPER_VIDEOS.find((p) => p.paperId === selectedId) ?? PAPER_VIDEOS[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    sound.playSyndromeTick();
  };

  const copyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    sound.playDecoderLock();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-plaquette" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              Landmark Research Paper Google Veo 3 Video Studio
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Cinematic AI video generation prompts &amp; visual breakdowns for seminal quantum error correction papers.
          </p>
        </div>

        <span className="rounded-full border border-plaquette/40 bg-plaquette/10 px-3 py-1 font-mono text-xs font-bold text-plaquette">
          Google Veo 3 AI Prompts
        </span>
      </div>

      {/* Paper Selection Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {PAPER_VIDEOS.map((p) => {
          const active = p.paperId === paper.paperId;
          return (
            <button
              key={p.paperId}
              type="button"
              onClick={() => handleSelect(p.paperId)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all duration-200 ${
                active
                  ? 'border-plaquette bg-plaquette/15 font-semibold text-text-hi shadow-glow-cyan'
                  : 'border-ink-600 bg-ink-900 text-text-mid hover:border-ink-500 hover:text-text-hi'
              }`}
            >
              <BookOpen className={`h-3.5 w-3.5 ${active ? 'text-plaquette' : 'text-text-low'}`} />
              <span>{p.paperTitle.split(':')[0]} ({p.year})</span>
            </button>
          );
        })}
      </div>

      {/* Main Video & Prompt Card */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Animated Canvas Simulation for Selected Paper */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900 p-6 min-h-[380px]">
          <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
            <span className="text-text-hi font-bold">{paper.authors}</span> ({paper.year})
          </div>

          <div className="relative w-full max-w-[380px] aspect-[4/3] my-4 flex flex-col items-center justify-center bg-ink-950 rounded-xl border border-ink-700 p-5">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl border-2 border-plaquette/40 animate-pulse" />
              <div className="absolute inset-4 rounded-xl border-2 border-magic/40 animate-spin" />
              <div className="relative z-10 font-mono text-xs font-bold text-text-hi text-center bg-ink-900/90 p-3 rounded-lg border border-ink-600">
                {paper.keyEquation}
              </div>
            </div>

            <div className="mt-4 font-mono text-[11px] text-stabilizer text-center font-bold">
              {paper.arxivOrDoi}
            </div>
          </div>
        </div>

        {/* Paper Summary & Veo 3 Video Prompt Card */}
        <div className="flex flex-col justify-between rounded-xl border border-ink-600 bg-ink-800 p-5 font-mono text-xs">
          <div>
            <span className="eyebrow text-plaquette mb-2">// SEMINAL PAPER BREAKTHROUGH</span>
            <h4 className="font-display text-base font-bold text-text-hi mb-1">{paper.paperTitle}</h4>
            <div className="text-text-low text-[11px] mb-3">{paper.authors} · {paper.year}</div>

            <p className="text-text-mid leading-relaxed font-sans text-xs mb-4">{paper.conceptSummary}</p>

            {/* Google Veo 3 Video Generation Prompt Box */}
            <div className="border-t border-ink-700 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" /> Google Veo 3 AI Video Generation Prompt
                </span>
                <button
                  type="button"
                  onClick={() => copyPrompt(paper.veoPrompt, paper.paperId)}
                  className="flex items-center gap-1 rounded bg-ink-900 px-2 py-1 text-[10px] text-plaquette hover:bg-ink-700"
                >
                  {copiedId === paper.paperId ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
                  {copiedId === paper.paperId ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>

              <div className="rounded-lg bg-ink-950 p-3.5 border border-magic/30 font-mono text-[11px] text-text-mid leading-relaxed select-all">
                &ldquo;{paper.veoPrompt}&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

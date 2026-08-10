import { useState } from 'react';
import { Sparkles, Copy, Check, Sliders, Cpu, Eye, Zap } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function VideoPromptRefinerStudio() {
  const [topic, setTopic] = useState<string>('Google Willow 105-Qubit Transmon Chip');
  const [cameraAngle, setCameraAngle] = useState<string>('Cinematic 360-degree slow orbit macro lens');
  const [lighting, setLighting] = useState<string>('Cryogenic 15mK frosted glow with neon cyan X-checks & violet Z-checks');
  const [style] = useState<string>('Photorealistic 8K 3D Octane render, ultra-detailed raytracing');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [copied, setCopied] = useState<boolean>(false);

  const customPrompt = `${style} of ${topic}. ${cameraAngle}, ${lighting}. High resolution, 60fps, crisp details, no artifacts.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(customPrompt);
    sound.playDecoderLock();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <span className="eyebrow text-plaquette mb-1">// GOOGLE VEO 3.1 PROMPT REFINER</span>
          <h3 className="font-display text-xl font-bold text-text-hi">
            Custom Veo 3.1 AI Video Prompt Generator
          </h3>
          <p className="mt-1 text-sm text-text-mid">
            Tune cinematic camera motion, cryogenic lighting, and physical topic parameters to construct optimized Google Veo 3.1 AI video generation API payloads.
          </p>
        </div>

        <span className="rounded-full border border-magic/40 bg-magic/10 px-3 py-1 font-mono text-xs font-bold text-magic">
          Veo 3.1 API Ready
        </span>
      </div>

      {/* Preset Topics */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        {[
          'Google Willow 105-Qubit Transmon Chip',
          'Kitaev Toric Code Anyon Spacetime Weaving',
          '15-to-1 Reed-Muller Magic State Distillation Factory',
          'Lattice Surgery Z-Boundary Weld CNOT Logic',
          'qLDPC Bipartite Tanner Graph Belief Propagation',
          'Surface Code 3D Spacetime Detector Graph',
        ].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTopic(t); sound.playSyndromeTick(); }}
            className={`p-3 rounded-xl border text-left transition-all ${
              topic === t
                ? 'border-plaquette bg-plaquette/10 text-plaquette font-bold shadow-glow-cyan'
                : 'border-ink-700 bg-ink-900/60 text-text-mid hover:border-ink-500 hover:text-text-hi'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 font-bold text-[11px]">
              <Cpu className="h-3.5 w-3.5 text-plaquette" /> Topic Preset
            </div>
            <div className="line-clamp-2">{t}</div>
          </button>
        ))}
      </div>

      {/* Parameter Controls */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3.5">
          <span className="text-text-low text-[10px] uppercase font-bold block mb-2 flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-star" /> Camera Motion:
          </span>
          <select
            value={cameraAngle}
            onChange={(e) => setCameraAngle(e.target.value)}
            className="w-full rounded bg-ink-950 border border-ink-700 p-2 text-text-hi focus:border-star focus:outline-none"
          >
            <option value="Cinematic 360-degree slow orbit macro lens">Cinematic 360° Slow Orbit</option>
            <option value="Extreme close-up macro tracking shot along qubit trace">Macro Tracking Shot</option>
            <option value="Top-down orthographic architectural flythrough">Top-Down Flythrough</option>
            <option value="Dynamic slow-motion zoom into stabilizer plaquette">Slow-Motion Zoom</option>
          </select>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3.5">
          <span className="text-text-low text-[10px] uppercase font-bold block mb-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-syndrome" /> Lighting & Illumination:
          </span>
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value)}
            className="w-full rounded bg-ink-950 border border-ink-700 p-2 text-text-hi focus:border-syndrome focus:outline-none"
          >
            <option value="Cryogenic 15mK frosted glow with neon cyan X-checks & violet Z-checks">Cryo 15mK Cyan/Violet Glow</option>
            <option value="Volumetric laser excitation pulses flowing across gold wiring">Volumetric Gold Laser Pulses</option>
            <option value="Deep space dark navy contrast with pulsating red defect fires">Deep Space Red Defect Fires</option>
            <option value="Bioluminescent emerald and amber energy ribbons">Emerald & Amber Energy Ribbons</option>
          </select>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3.5">
          <span className="text-text-low text-[10px] uppercase font-bold block mb-2 flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-magic" /> Aspect Ratio & Resolution:
          </span>
          <div className="flex gap-2">
            {['16:9', '9:16', '1:1'].map((ar) => (
              <button
                key={ar}
                type="button"
                onClick={() => { setAspectRatio(ar); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1.5 font-bold ${
                  aspectRatio === ar ? 'bg-magic text-ink-950' : 'bg-ink-950 text-text-mid hover:text-text-hi border border-ink-700'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Prompt Result Box */}
      <div className="mt-5 rounded-xl border border-magic/40 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Generated Veo 3.1 AI API Prompt
          </span>
          <button
            type="button"
            onClick={copyPrompt}
            className="flex items-center gap-1 rounded bg-ink-800 px-3 py-1 text-[11px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-stabilizer" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied Prompt!' : 'Copy API Prompt'}
          </button>
        </div>
        <div className="rounded-lg bg-ink-950 p-3.5 border border-ink-700 text-text-hi leading-relaxed select-all">
          &ldquo;{customPrompt}&rdquo;
        </div>
      </div>
    </div>
  );
}

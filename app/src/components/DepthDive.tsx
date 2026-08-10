/**
 * Depth dive — the explanation depth rendered as a camera dive.
 * A continuous descent clip (chip → lattice → qubits, AI-generated, decorative)
 * is scrubbed so each explanation depth (story → verify) holds a deeper frame.
 * Moving between depths animates the camera diving; reduced-motion users get
 * the matching still frame instead. The zoom is illustrative mood, not content —
 * the level text beside it carries the actual explanation.
 */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { asset } from '@/lib/asset';
import { useProgress, type ExplanationDepth } from '@/store/progress';

const DEPTHS: ExplanationDepth[] = ['story', 'cause', 'model', 'formal', 'verify'];
const LEVEL_NAMES = ['Story', 'Cause', 'Model', 'Formal', 'Verify'];
/** Scrub targets (seconds) inside the 5.4s descent clip — one per depth. */
const LEVEL_TIMES = [0.1, 1.35, 2.6, 3.9, 5.2];

export default function DepthDive() {
  const { explanationDepth, setExplanationDepth } = useProgress();
  const reduce = useReducedMotion();
  const idx = Math.max(0, DEPTHS.indexOf(explanationDepth));
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scrub the clip toward the active depth's timestamp, then hold the frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;
    const target = LEVEL_TIMES[idx];
    let raf = 0;
    const tick = () => {
      const cur = video.currentTime;
      const delta = target - cur;
      if (Math.abs(delta) > 0.03) {
        video.currentTime = cur + Math.sign(delta) * Math.min(Math.abs(delta), 0.025);
        raf = requestAnimationFrame(tick);
      } else {
        video.currentTime = target;
        video.pause();
      }
    };
    video.pause();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, reduce]);

  return (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-xl border border-ink-600">
        {reduce ? (
          <img
            src={asset(`clips/descent-level-${idx}.jpg`)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="aspect-[21/9] w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={asset('clips/metaphor-descent.mp4')}
            poster={asset('clips/descent-level-0.jpg')}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="aspect-[21/9] w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-wider text-text-low">
          // Depth dive — AI visualization, decorative
        </span>
        <span className="absolute bottom-2 right-3 rounded bg-ink-900/80 px-2 py-0.5 font-mono text-[11px] font-bold text-plaquette">
          {LEVEL_NAMES[idx]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">Surface</span>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={idx}
          onChange={(e) => setExplanationDepth(DEPTHS[Number(e.target.value)])}
          aria-label="Explanation depth"
          aria-valuetext={LEVEL_NAMES[idx]}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-700 accent-plaquette"
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">Bedrock</span>
      </div>
    </div>
  );
}

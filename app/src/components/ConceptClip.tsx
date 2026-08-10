/**
 * Decorative AI-generated concept clip (Higgsfield/Veo, validated + compressed
 * offline — see tools/README.md). Renders a muted looping video with a poster;
 * under prefers-reduced-motion it renders only the poster image. Decorative by
 * doctrine: aria-hidden, empty alt, never carries scientific claims.
 *
 * Playback is viewport-gated: the video only plays while at least a quarter of
 * it is on screen, so stacked clips (a drawer can show several) never decode
 * off-screen.
 */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { asset } from '@/lib/asset';

export default function ConceptClip({
  name,
  className,
}: {
  /** Clip basename without extension, e.g. 'concept-toric-loops-v3'. */
  name: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const poster = asset(`clips/${name}.jpg`);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduce]);

  if (reduce) {
    return (
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }
  return (
    <video
      ref={videoRef}
      className={className}
      src={asset(`clips/${name}.mp4`)}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}

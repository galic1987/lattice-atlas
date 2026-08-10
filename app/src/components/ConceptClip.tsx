/**
 * Decorative AI-generated concept clip (Higgsfield/Veo, validated + compressed
 * offline — see tools/README.md). Renders a muted looping video with a poster;
 * under prefers-reduced-motion it renders only the poster image. Decorative by
 * doctrine: aria-hidden, empty alt, never carries scientific claims.
 */
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
  const poster = asset(`clips/${name}.jpg`);

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
      className={className}
      src={asset(`clips/${name}.mp4`)}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="none"
      aria-hidden="true"
    />
  );
}

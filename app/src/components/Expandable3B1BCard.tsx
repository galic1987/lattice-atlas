import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Video
} from 'lucide-react';
import type { ParsedResource } from '@/data';

export default function Expandable3B1BCard({ resource }: { resource: ParsedResource }) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const embedUrl = resource.youtubeId
    ? resource.isPlaylist
      ? `https://www.youtube.com/embed/videoseries?list=${resource.youtubeId}`
      : `https://www.youtube.com/embed/${resource.youtubeId}`
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-plaquette/50 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 shadow-md transition-all duration-200 hover:border-plaquette">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-ink-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plaquette"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-plaquette/40 bg-plaquette/15 text-plaquette">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-plaquette">
                3BLUE1BROWN VISUAL LESSON
              </span>
              <span className="rounded bg-star/20 px-2 py-0.5 font-mono text-[9px] text-star font-bold">
                EXPANDABLE VIDEO
              </span>
            </div>
            <h4 className="font-display text-sm font-bold text-text-hi mt-0.5">
              {resource.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resource.link && (
            <a
              href={resource.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg p-1.5 text-text-mid transition-colors hover:bg-ink-800 hover:text-plaquette"
              title="Open full URL"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <span className="rounded-lg p-1 text-text-mid transition-transform">
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180 text-plaquette' : ''}`} />
          </span>
        </div>
      </button>

      {/* Expandable Video Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-ink-800 bg-ink-950 p-4"
          >
            {embedUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-ink-700 bg-black shadow-inner">
                <iframe
                  src={embedUrl}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-ink-800 bg-ink-900 p-6 text-center">
                <Play className="h-8 w-8 text-plaquette mb-2 animate-pulse" />
                <p className="text-xs text-text-mid">
                  Full 3Blue1Brown visual lesson available directly on 3Blue1Brown.com
                </p>
              </div>
            )}

            {/* Visual Takeaways & Full Link Footer */}
            <div className="mt-4 flex flex-col gap-3 font-mono text-xs border-t border-ink-850 pt-3">
              <div className="flex items-center justify-between text-text-low text-[11px]">
                <span className="flex items-center gap-1 text-star">
                  <Sparkles className="h-3 w-3" /> Grant Sanderson / 3Blue1Brown Visual Mathematics
                </span>
                <span className="text-text-mid font-semibold truncate max-w-[200px]" title={resource.link || undefined}>Full URL: {resource.link}</span>
              </div>

              {resource.link && (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-plaquette/50 bg-plaquette/10 py-2 font-display text-xs font-semibold text-plaquette transition-all hover:bg-plaquette/20"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Full Lesson on {resource.link.includes('youtube') ? 'YouTube' : '3Blue1Brown.com'}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

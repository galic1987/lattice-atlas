import { useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';

/**
 * A one-line "super TL;DR" strip shown under the header on every page. Keyed by
 * route path (React Router pathname, already stripped of the base). Each line is
 * the single most compressed, accurate statement of what that page is for.
 */
const PAGE_TLDR: Record<string, string> = {
  '/':
    'How quantum computers fix their own errors — the surface code, from linear algebra to Google Willow, every claim checkable.',
  '/foundations':
    'The prerequisite physics from scratch: waves, qubits, superposition, and measurement — before any error correction.',
  '/map':
    'The whole field as a dependency graph — 26 topics across 6 tiers; click a node to see what it needs and what it unlocks.',
  '/path':
    'A guided, prerequisite-ordered route from the foundations to the frontier — the shortest honest path through TQEC.',
  '/altitudes':
    'The same idea at five zoom levels, from a 5-year-old’s story to the formal math — pick the altitude that fits you.',
  '/lab':
    'Paint errors on a real distance-3 surface code, watch the decoder match them, and see why bigger codes suppress errors — plus a multi-tool exploration workbench.',
  '/duel':
    'A daily puzzle: read the syndrome, paint the correction, and try to beat the matching decoder — with a shareable score.',
  '/papers':
    'The seminal TQEC papers in reading order, each with its prerequisites, a one-sentence takeaway, and why it mattered.',
  '/glossary':
    'Every term you’ll hit, defined plainly and cross-linked to the topics and papers that use it.',
  '/field-today':
    'Where the field actually stands now — the recent milestones (Willow’s Λ > 1) and what is still unsolved.',
  '/review':
    'Spaced-repetition review of what you’ve marked understood — a few cards a day to make it stick.',
  '/capstone':
    'One transfer task that ties it together: read the pattern, repair the model, name the bound — with an honest evidence label.',
};

export default function SuperTLDR() {
  const { pathname } = useLocation();
  const text = PAGE_TLDR[pathname];
  if (!text) return null;

  return (
    <div className="border-b border-ink-800 bg-ink-950/60">
      <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-6 py-2.5 md:px-8">
        <span className="mt-px flex shrink-0 items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-plaquette">
          <Zap className="h-3 w-3" aria-hidden="true" /> TL;DR
        </span>
        <p className="text-xs leading-relaxed text-text-mid">{text}</p>
      </div>
    </div>
  );
}

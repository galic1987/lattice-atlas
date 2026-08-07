import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Map as MapIcon, Route as RouteIcon } from 'lucide-react';
import MultiAgeCognitiveLens from '@/components/MultiAgeCognitiveLens';
import { ALTITUDE_CONCEPTS } from '@/data/altitudes';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Flagship page for the age-ladder: one core idea explained at five
 * altitudes, with every level explicitly repairing the previous level's
 * simplification. The honest version of "explain it to a five-year-old."
 */
export default function Altitudes() {
  const [conceptId, setConceptId] = useState(ALTITUDE_CONCEPTS[0].id);
  const concept =
    ALTITUDE_CONCEPTS.find((c) => c.id === conceptId) ?? ALTITUDE_CONCEPTS[0];

  useEffect(() => {
    document.title = 'Five Altitudes — Lattice Atlas';
  }, []);

  return (
    <div className="bg-ink-900">
      <header className="lattice-bg">
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [...EASE] }}
            className="eyebrow"
          >
            {'// HOW EXPLANATION SCALES'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [...EASE] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Five altitudes, one truth.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [...EASE] }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-text-mid"
          >
            Every explanation of a deep idea is a simplification — a lie that
            teaches. Most teaching hides this. Here we do the opposite: each
            altitude begins by confessing exactly what the level below it got
            wrong, so you can watch the lens change as you climb. By the top,
            the explanation stops being words at all — you measure the claim
            yourself.
          </motion.p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10 md:px-8">
        {/* Concept switcher */}
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Concept">
          {ALTITUDE_CONCEPTS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={conceptId === c.id}
              onClick={() => setConceptId(c.id)}
              className={
                conceptId === c.id
                  ? 'rounded-full border border-magic bg-magic/15 px-4 py-1.5 text-sm font-semibold text-magic'
                  : 'rounded-full border border-ink-600 bg-ink-800 px-4 py-1.5 text-sm text-text-mid transition-colors hover:border-ink-500 hover:text-text-hi'
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <MultiAgeCognitiveLens key={concept.id} concept={concept} />
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-700 pt-8 text-sm text-text-low">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            Ready to climb for real:
          </span>
          <Link
            to="/path"
            className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette"
          >
            <RouteIcon className="h-3.5 w-3.5" /> The guided path
          </Link>
          <Link
            to="/map"
            className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette"
          >
            <MapIcon className="h-3.5 w-3.5" /> The knowledge map
          </Link>
          <Link
            to="/lab"
            className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette"
          >
            <ArrowRight className="h-3.5 w-3.5" /> The lab
          </Link>
        </div>
      </section>
    </div>
  );
}

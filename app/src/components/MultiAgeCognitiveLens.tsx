import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Atom,
  Baby,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { asset } from '@/lib/asset';
import { ALTITUDE_CONCEPTS, type AltitudeConcept } from '@/data/altitudes';

/**
 * One concept told at five altitudes. The pedagogical engine is the
 * `revises` field: every level opens by confessing exactly what the
 * previous level oversimplified. Content lives in src/data/altitudes.ts.
 */

const LEVEL_ICONS = [Baby, Gamepad2, Atom, GraduationCap, FlaskConical];

export default function MultiAgeCognitiveLens({
  concept = ALTITUDE_CONCEPTS[0],
}: {
  concept?: AltitudeConcept;
}) {
  const [levelIndex, setLevelIndex] = useState(0);
  const lens = concept.levels[levelIndex];
  const Icon = LEVEL_ICONS[Math.min(levelIndex, LEVEL_ICONS.length - 1)];
  const isPro = levelIndex === concept.levels.length - 1;

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">
              {'// ONE IDEA, FIVE ALTITUDES'}
            </span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-magic">
              {concept.label}
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">{concept.title}</h3>
        </div>

        {/* Altitude selector */}
        <div className="flex flex-wrap gap-2">
          {concept.levels.map((item, i) => {
            const active = levelIndex === i;
            return (
              <button
                key={item.badge}
                type="button"
                onClick={() => setLevelIndex(i)}
                aria-pressed={active}
                className={
                  active
                    ? 'rounded-lg border border-plaquette bg-plaquette/20 px-3 py-1.5 font-mono text-xs font-bold text-plaquette shadow-sm'
                    : 'rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500'
                }
              >
                {item.badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual banner (per-concept art lands via data — see design/art-directions-altitudes.md) */}
      <div className="relative mt-6 h-40 w-full overflow-hidden rounded-xl border border-plaquette/30">
        {concept.banner ? (
          <img
            src={asset(concept.banner)}
            alt={concept.bannerAlt ?? ''}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="lattice-bg h-full w-full bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent p-4">
          <div className="flex items-center gap-2 font-mono text-xs text-star">
            <Sparkles className="h-4 w-4" aria-hidden /> Altitude {levelIndex + 1} of{' '}
            {concept.levels.length} · {lens.ageLabel}
          </div>
        </div>
      </div>

      {/* Active level */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${concept.id}-${levelIndex}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-6"
        >
          <div className="flex items-center justify-between border-b border-ink-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs text-text-low">{lens.ageLabel}</span>
                <h4 className="font-display text-lg font-bold text-text-hi">{lens.title}</h4>
              </div>
            </div>
          </div>

          {lens.revises && (
            <div className="mt-4 rounded-lg border border-syndrome/40 bg-syndrome/[0.07] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-syndrome">
                What the last level got wrong
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-mid">{lens.revises}</p>
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-text-hi">{lens.explanation}</p>

          {isPro && (
            <div className="mt-4 flex flex-wrap gap-2">
              {concept.proLinks.map((l) =>
                l.external ? (
                  <a
                    key={l.label}
                    href={l.to}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stabilizer/40 bg-stabilizer/10 px-3 py-1.5 font-mono text-[12px] text-stabilizer transition-colors hover:border-stabilizer"
                  >
                    {l.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stabilizer/40 bg-stabilizer/10 px-3 py-1.5 font-mono text-[12px] text-stabilizer transition-colors hover:border-stabilizer"
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-stabilizer/40 bg-stabilizer/10 p-3 font-mono text-xs text-stabilizer">
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span>{lens.takeaway}</span>
          </div>

          {!isPro && (
            <button
              type="button"
              onClick={() => setLevelIndex(levelIndex + 1)}
              className="btn-primary mt-5"
            >
              Climb to the next altitude <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

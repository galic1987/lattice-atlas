import { useId } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Atom,
  Baby,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Swords,
} from 'lucide-react';
import type { AltitudeConcept } from '@/data/altitudes';
import { useProgress, type ExplanationDepth } from '@/store/progress';

const LEVEL_NAMES = ['STORY', 'CAUSE', 'MODEL', 'FORMAL', 'VERIFY'] as const;
const LEVEL_DEPTHS: ExplanationDepth[] = ['story', 'cause', 'model', 'formal', 'verify'];
const LEVEL_MARKERS = ['~5', '~10', '~15', '20+', 'EVIDENCE'] as const;
const LEVEL_ICONS = [Baby, Gamepad2, Atom, GraduationCap, FlaskConical] as const;
const STATION_COLORS = ['#22D3EE', '#34D399', '#8B5CF6', '#F5B83D', '#FB7185'] as const;

function AltitudeLadderVisual({ activeIndex, conceptLabel }: { activeIndex: number; conceptLabel: string }) {
  const gradientId = useId().replace(/:/g, '');
  const stations = [
    { x: 72, y: 142 },
    { x: 212, y: 118 },
    { x: 352, y: 94 },
    { x: 492, y: 70 },
    { x: 632, y: 44 },
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-plaquette/30 bg-ink-950 p-3">
      <svg
        viewBox="0 0 704 172"
        className="w-full"
        role="img"
        aria-label={`${conceptLabel} shown at five ascending explanation depths: story, cause, model, formalism, and evidence`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1">
            <stop stopColor="#22D3EE" />
            <stop offset="0.5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#FB7185" />
          </linearGradient>
        </defs>
        <path
          d="M72 142 C150 142 145 118 212 118 S290 94 352 94 S430 70 492 70 S570 44 632 44"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeDasharray="7 6"
        />
        {stations.map((station, index) => {
          const active = index === activeIndex;
          const color = STATION_COLORS[index];
          return (
            <g key={LEVEL_NAMES[index]} opacity={active ? 1 : 0.42}>
              <circle
                cx={station.x}
                cy={station.y}
                r={active ? 22 : 16}
                fill={color}
                fillOpacity={active ? 0.2 : 0.08}
                stroke={color}
                strokeWidth={active ? 3 : 1.5}
              />
              <circle cx={station.x} cy={station.y} r={active ? 6 : 4} fill={color} />
              {active && (
                <circle cx={station.x} cy={station.y} r="30" fill="none" stroke={color} strokeOpacity="0.22" />
              )}
            </g>
          );
        })}
        <path d="M616 19h32v38h-32zM622 31l4 4 9-10M622 45h19" fill="none" stroke="#FB7185" strokeWidth="2" />
      </svg>
      <div className="grid grid-cols-5 gap-1 border-t border-ink-700 pt-2 text-center font-mono text-[9px] uppercase tracking-wider text-text-low" aria-hidden="true">
        {LEVEL_NAMES.map((name, index) => (
          <span key={name} className={index === activeIndex ? 'text-text-hi' : undefined}>{name}</span>
        ))}
      </div>
    </div>
  );
}

export default function MultiAgeCognitiveLens({ concept }: { concept: AltitudeConcept }) {
  const { explanationDepth, setExplanationDepth } = useProgress();
  const preferredIndex = LEVEL_DEPTHS.indexOf(explanationDepth);
  const activeIndex = Math.min(concept.levels.length - 1, Math.max(0, preferredIndex));
  const reduce = useReducedMotion();
  const level = concept.levels[activeIndex] ?? concept.levels[0];
  const Icon = LEVEL_ICONS[activeIndex] ?? Baby;

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-4 shadow-glow-cyan md:p-6">
      <div className="flex flex-col gap-4 border-b border-ink-700 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// ONE IDEA, FIVE ALTITUDES</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-magic">{concept.label}</span>
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-text-hi">{concept.title}</h2>
          <p className="mt-1 text-xs leading-5 text-text-low">
            The invariant stays fixed. Each depth adds a causal or mathematical layer and names what the previous view compressed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label={`Choose ${concept.label} explanation depth`}>
          {concept.levels.map((item, index) => {
            const active = activeIndex === index;
            return (
              <button
                key={`${concept.id}-${LEVEL_NAMES[index] ?? index}`}
                type="button"
                onClick={() => setExplanationDepth(LEVEL_DEPTHS[index] ?? 'story')}
                aria-pressed={active}
                aria-label={`${item.ageLabel}; ${LEVEL_NAMES[index] ?? item.badge} depth, ${LEVEL_MARKERS[index] ?? ''}`}
                className={active
                  ? 'min-h-11 rounded-lg border border-plaquette bg-plaquette/20 px-2 py-2 font-mono text-[11px] font-bold text-plaquette shadow-sm'
                  : 'min-h-11 rounded-lg border border-ink-600 bg-ink-800 px-2 py-2 font-mono text-[11px] text-text-mid hover:border-ink-500'}
              >
                <span className="block">{LEVEL_NAMES[index] ?? item.badge}</span>
                <span className="mt-0.5 block text-[9px] font-normal">{LEVEL_MARKERS[index]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-magic/45 bg-magic/[0.08] p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-magic">
          Invariant at every altitude
        </p>
        <p className="mt-2 text-sm leading-6 text-text-hi">{concept.invariant}</p>
      </div>

      <AltitudeLadderVisual activeIndex={activeIndex} conceptLabel={concept.label} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${concept.id}-${activeIndex}`}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-4 md:p-6"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 border-b border-ink-800 pb-3">
            <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="font-mono text-xs text-text-low">{level.ageLabel}</span>
              <h3 className="font-display text-lg font-bold text-text-hi">{level.title}</h3>
            </div>
          </div>

          {level.revises && (
            <div className="mt-4 rounded-lg border border-syndrome/40 bg-syndrome/[0.07] p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-syndrome">What the previous view hid</p>
              <p className="mt-1 text-sm leading-relaxed text-text-mid">{level.revises}</p>
            </div>
          )}

          <p className="mt-4 text-sm leading-6 text-text-hi">{level.explanation}</p>

          {activeIndex === concept.levels.length - 1 && concept.proLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {concept.proLinks.map((link) => link.external ? (
                <a key={link.label} href={link.to} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-stabilizer/40 bg-stabilizer/10 px-3 py-1.5 font-mono text-[11px] text-stabilizer transition-colors hover:border-stabilizer">
                  {link.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="inline-flex items-center gap-1.5 rounded-full border border-stabilizer/40 bg-stabilizer/10 px-3 py-1.5 font-mono text-[11px] text-stabilizer transition-colors hover:border-stabilizer">
                  {link.label} {link.to === '/duel' && <Swords className="h-3 w-3" aria-hidden="true" />}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-stabilizer/40 bg-stabilizer/10 p-3 font-mono text-xs leading-5 text-stabilizer">
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{level.takeaway}</span>
          </div>

          {activeIndex < concept.levels.length - 1 && (
            <button type="button" onClick={() => setExplanationDepth(LEVEL_DEPTHS[activeIndex + 1] ?? 'verify')} className="btn-primary mt-5">
              Add the next layer <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

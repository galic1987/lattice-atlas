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
  Swords,
} from 'lucide-react';
import { asset } from '@/lib/asset';

/**
 * One idea — quantum error correction — told at five altitudes.
 * The pedagogical engine is the `revises` field: every level opens by
 * confessing exactly what the previous level oversimplified. Honest
 * lies-to-children, with the lie always repaid one level up.
 */

type CognitiveAgeLevel = '5yr' | '10yr' | '15yr' | '20yr' | 'pro';

interface AgeLensContent {
  level: CognitiveAgeLevel;
  ageLabel: string;
  badge: string;
  icon: typeof Baby;
  analogyTitle: string;
  /** What the previous level got wrong — the lens change, made explicit. */
  revises: string | null;
  metaphor: string;
  keyTakeaway: string;
}

const AGE_LENS_MAP: Record<CognitiveAgeLevel, AgeLensContent> = {
  '5yr': {
    level: '5yr',
    ageLabel: 'Age 5 · Playful wonder',
    badge: 'TOY BLOCKS',
    icon: Baby,
    analogyTitle: 'The Toy Block Wall & the Mischievous Ghosts',
    revises: null,
    metaphor:
      'Imagine a magic wall of toy blocks keeping a secret picture. Mischievous ghosts sneak in and nudge blocks when you aren’t looking! But the wall has smoke detectors between the blocks, and they beep wherever a ghost has been — so you can fix the wall without ever opening the secret box.',
    keyTakeaway: 'Alarms find the mischief without anyone peeking at the secret.',
  },
  '10yr': {
    level: '10yr',
    ageLabel: 'Age 10 · Puzzle game',
    badge: 'PUZZLE GRID',
    icon: Gamepad2,
    analogyTitle: 'The Parity Alarm Puzzle',
    revises:
      'At five we said the beeps tell you exactly which block to fix. Not true — each alarm only says “something changed near me.”',
    metaphor:
      'Now it’s a puzzle grid: when noise flips a qubit, the two detector tiles touching it turn red — the flip itself stays invisible. Errors make chains, and only the chain’s two endpoints glow. Your job is to connect red endpoints in pairs with the shortest strings you can. Choose well and the grid heals; choose a path that wraps across the whole board and you’ve lost without any alarm going off.',
    keyTakeaway: 'Pairs of alarms are endpoints of hidden chains — decoding is connect-the-dots with consequences.',
  },
  '15yr': {
    level: '15yr',
    ageLabel: 'Age 15 · Real vocabulary',
    badge: 'PARITY CHECKS',
    icon: Atom,
    analogyTitle: 'Syndromes, Distance & the Unreliable Referee',
    revises:
      'The puzzle pretended the red tiles are perfectly reliable. They aren’t — the detectors are built from the same faulty parts as everything else.',
    metaphor:
      'The “tiles” are parity checks: measurements that ask a group of qubits “is your parity even or odd?” without asking any qubit its value. The answer pattern is called the syndrome. Because a check can itself misfire, the machine measures every check again and again, and the decoder works on the whole history in time. The code’s strength is its distance d: the smallest number of little errors that can chain into an invisible big one.',
    keyTakeaway: 'Syndrome = the pattern of failed parity checks, re-measured forever because the referees are fallible too.',
  },
  '20yr': {
    level: '20yr',
    ageLabel: 'Age 20 · The formalism',
    badge: 'STABILIZERS',
    icon: GraduationCap,
    analogyTitle: 'Stabilizers, Matching & the Threshold',
    revises:
      '“The grid heals” hid an assumption: the decoder never knows the true error. It infers the most likely one — and can be fooled silently.',
    metaphor:
      'The checks are stabilizers: commuting Pauli products with S|ψ⟩ = +|ψ⟩ on every code state. An error that anticommutes with a stabilizer flips its outcome to −1; measurement projects into a syndrome eigenspace, and correction returns the state to the code space. Decoding is minimum-weight matching of detection events across space and time — an inference, not an observation. Below the threshold error rate, growing d suppresses the logical error rate exponentially; the suppression factor per distance step is Λ.',
    keyTakeaway: 'S|ψ⟩ = +|ψ⟩ · anticommutation makes syndromes · matching infers · below p_th, bigger d wins by Λ per step.',
  },
  pro: {
    level: 'pro',
    ageLabel: 'Practitioner · No trust required',
    badge: 'VERIFY IT',
    icon: FlaskConical,
    analogyTitle: 'Stop Believing — Measure',
    revises:
      'Every level so far asked you to take our word for something. This one doesn’t.',
    metaphor:
      'The full picture is homological: errors are chains, syndromes are their boundaries, and logical operators are the non-contractible cycles the decoder must never complete. But at this altitude the explanation stops being words at all — you reproduce the claims yourself, from a browser toy model to a research simulator to actual superconducting hardware.',
    keyTakeaway: 'The final form of understanding is a measurement you ran yourself.',
  },
};

const LEVEL_ORDER: CognitiveAgeLevel[] = ['5yr', '10yr', '15yr', '20yr', 'pro'];

const PRO_LINKS = [
  { label: 'Run the threshold experiment', to: '/lab', external: false },
  { label: 'Be the decoder (Duel)', to: '/duel', external: false },
  {
    label: 'Stim + PyMatching notebook',
    to: 'https://github.com/galic1987/lattice-atlas/blob/main/notebooks/first-threshold-curve.ipynb',
    external: true,
  },
  {
    label: 'Measure it on IBM hardware',
    to: 'https://github.com/galic1987/lattice-atlas/blob/main/notebooks/real-hardware-error-suppression.ipynb',
    external: true,
  },
  { label: 'Google’s below-threshold paper', to: '/papers#2408.13687', external: false },
];

export default function MultiAgeCognitiveLens() {
  const [activeLevel, setActiveLevel] = useState<CognitiveAgeLevel>('5yr');

  const lens = AGE_LENS_MAP[activeLevel];
  const Icon = lens.icon;
  const levelIndex = LEVEL_ORDER.indexOf(activeLevel);

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">
              {'// ONE IDEA, FIVE ALTITUDES'}
            </span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] font-bold text-magic">
              QUANTUM ERROR CORRECTION
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">
            The same truth, five heights — each level repairs the last one&apos;s lie
          </h3>
        </div>

        {/* Altitude selector */}
        <div className="flex flex-wrap gap-2">
          {LEVEL_ORDER.map((lvl) => {
            const item = AGE_LENS_MAP[lvl];
            const active = activeLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevel(lvl)}
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

      {/* Visual banner */}
      <div className="relative mt-6 h-40 w-full overflow-hidden rounded-xl border border-plaquette/30">
        <img
          src={asset('multi_age_cognitive_prism.jpg')}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent p-4">
          <div className="flex items-center gap-2 font-mono text-xs text-star">
            <Sparkles className="h-4 w-4" aria-hidden /> Altitude {levelIndex + 1} of{' '}
            {LEVEL_ORDER.length} · {lens.ageLabel}
          </div>
        </div>
      </div>

      {/* Active level */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
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
                <h4 className="font-display text-lg font-bold text-text-hi">{lens.analogyTitle}</h4>
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

          <p className="mt-4 text-sm leading-relaxed text-text-hi">{lens.metaphor}</p>

          {activeLevel === 'pro' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {PRO_LINKS.map((l) =>
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
                    {l.label} {l.to === '/duel' && <Swords className="h-3 w-3" />}
                  </Link>
                ),
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-stabilizer/40 bg-stabilizer/10 p-3 font-mono text-xs text-stabilizer">
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span>{lens.keyTakeaway}</span>
          </div>

          {levelIndex < LEVEL_ORDER.length - 1 && (
            <button
              type="button"
              onClick={() => setActiveLevel(LEVEL_ORDER[levelIndex + 1])}
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

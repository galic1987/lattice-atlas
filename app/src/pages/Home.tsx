import { asset } from '@/lib/asset';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import {
  ArrowRight,
  Gamepad2,
  Layers3,
  Map as MapIcon,
  MoveRight,
  Route as RouteIcon,
  ScrollText,
  Sparkles,
  Telescope,
} from 'lucide-react';
import InteractiveTour from '@/components/InteractiveTour';
import {
  papers,
  tierColors,
  topics,
  eraOrder as ERA_ORDER,
  eraColors as ERA_COLORS,
  eraNames as ERA_DISPLAY,
  eraYearRange,
} from '@/data';
import { useProgress } from '@/store/progress';

/* ------------------------------------------------------------------ */
/* Shared motion vocabulary (design.md §5)                             */
/* ------------------------------------------------------------------ */

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const riseChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
};

/** Cursor-tracking ripple glow coordinates for `.ripple-card` (design.md §5). */
function trackRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/** Character-split reveal for one hero headline line (design.md §1 animation). */
function SplitLine({
  text,
  delay,
  className = '',
}: {
  text: string;
  delay: number;
  className?: string;
}) {
  const words = text.trim().split(/\s+/);
  const wordOffsets = words.reduce<number[]>((acc, _, idx) => {
    const prev = idx === 0 ? 0 : acc[idx - 1] + words[idx - 1].length + 1;
    acc.push(prev);
    return acc;
  }, []);

  return (
    <span className={`block ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, wordIndex) => {
          const start = wordOffsets[wordIndex];
          return (
            <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
              {word.split('').map((character, characterIndex) => (
                <motion.span
                  key={`${character}-${characterIndex}`}
                  className="inline-block"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: delay + (start + characterIndex) * 0.02,
                    duration: 0.7,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  {character}
                </motion.span>
              ))}
              {wordIndex < words.length - 1 && ' '}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function Hero() {
  const [tourOpen, setTourOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      {/* Torus poster backdrop using generated high-res visual artwork */}
      <div className="absolute inset-0" aria-hidden>
        <motion.img
          src={asset('hero_quantum_lattice.jpg')}
          alt=""
          className="h-full w-full object-cover opacity-60"
          initial={reduce ? false : { scale: 1.02 }}
          animate={reduce ? { scale: 1.02 } : { scale: [1.02, 1.06, 1.02] }}
          transition={reduce ? { duration: 0 } : { duration: 36, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* lattice texture overlay at 20% */}
        <div className="lattice-bg absolute inset-0 opacity-20" />
        {/* bottom scrim into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-900" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 md:px-8">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {'// A LEARNING COMPANION FOR QUANTUM ERROR CORRECTION'}
        </motion.p>

        <h1 className="mt-6 font-display text-[42px] font-bold leading-[1.02] tracking-[-0.02em] text-text-hi md:text-display-xl">
          <SplitLine text="Quantum information," delay={0.3} />
          <span className="block">
            <SplitLine text="woven into" delay={0.72} />
            <motion.span
              className="text-gradient-cyan-violet -mt-[0.15em] block md:ml-[0.22em] md:mt-0 md:inline"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 + 'woven into '.length * 0.02, duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              topology.
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="mt-8 max-w-xl text-[17px] leading-[1.7] text-text-mid md:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5, ease: EASE_OUT_EXPO }}
        >
          Topological Quantum Error Correction protects fragile quantum states by
          encoding them into the global properties of qubit lattices. This is your
          guided path from the prerequisites to the research frontier — 26 topics,
          23 landmark papers, one map.
        </motion.p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            <Link to="/foundations" className="btn-primary">
              Start from zero <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            <Link to="/path" className="btn-secondary">
              I know the basics
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-plaquette/50 bg-plaquette/10 px-5 py-3 font-display text-sm font-semibold text-plaquette transition-all duration-200 hover:border-plaquette hover:bg-plaquette/20"
            >
              <Sparkles className={`h-4 w-4 text-plaquette ${reduce ? '' : 'animate-pulse'}`} />
              60-Sec Guided Tour
            </button>
          </motion.div>

        </div>

        <InteractiveTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />

        <motion.p
          className="mt-16 font-mono text-[13px] text-text-low md:absolute md:bottom-10 md:right-8 md:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.3 }}
        >
          23 papers · 26 topics · 6 tiers · 1998 → 2026
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 2 — What is TQEC?                                           */
/* ------------------------------------------------------------------ */

function WhatIsTqec() {
  return (
    <section className="relative">
      <img
        src={asset('braid-divider.svg')}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="mx-auto w-full max-w-6xl px-6 opacity-60 md:px-8"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.p variants={riseChild} className="eyebrow">
            {'// THE IDEA'}
          </motion.p>
          <motion.h2
            variants={riseChild}
            className="mt-4 font-display text-[32px] font-semibold leading-[1.1] text-text-hi md:text-[44px]"
          >
            Errors are local. Topology is global.
          </motion.h2>
          <motion.p variants={riseChild} className="mt-6 leading-[1.7] text-text-mid">
            Qubits decohere constantly — stray interactions flip them, shift their
            phase, or make them leak. A quantum computer that can&apos;t correct errors is a very
            expensive random number generator.
          </motion.p>
          <motion.p variants={riseChild} className="mt-4 leading-[1.7] text-text-mid">
            Topological quantum error correction fights back with geometry.
            The code encodes the information non-locally. It spreads the
            information across a lattice of physical qubits, so no single local
            error can destroy it. The logical qubit
            lives in the topology of the lattice — a small deformation cannot
            remove a hole in a torus, and a small error cannot remove it.
          </motion.p>
          <motion.p variants={riseChild} className="mt-4 leading-[1.7] text-text-mid">
            The surface code is a leading architecture because it uses local
            interactions on a 2D grid. In commonly studied circuit-level noise
            models, threshold estimates are often roughly <span className="mono-pill">0.5–1%</span>;
            the value depends on the circuit, noise, leakage handling, and decoder.
          </motion.p>
          <motion.p variants={riseChild} className="mt-6 flex flex-wrap gap-2">
            <span className="mono-pill">[[n, k, d]]</span>
            <span className="mono-pill-violet">d = 3</span>
            <span className="mono-pill">X ⊗ Z</span>
          </motion.p>
        </motion.div>

        <motion.figure
          className="group"
          initial={{ opacity: 0, x: 40, rotate: 0.5 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-800">
            <img
              src={asset('surface-code-diagram.svg')}
              alt="Distance-3 rotated surface-code patch: nine data qubits and eight checks. A center X error flips exactly the two adjacent Z checks, Z2 and Z3."
              loading="lazy"
              decoding="async"
              className="w-full transition group-hover:animate-error-pulse motion-reduce:animate-none"
            />
          </div>
          <motion.figcaption
            className="mt-3 font-mono text-[13px] leading-relaxed text-text-mid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Exact distance-3 geometry used by the browser lab: 9 data qubits,
            4 X checks, and 4 Z checks. Four boundary checks touch 2 data qubits;
            four interior checks touch 4. Here one X error on D4 produces the
            two rose-ringed outcomes Z2 = −1 and Z3 = −1.
          </motion.figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 3 — Stats band                                              */
/* ------------------------------------------------------------------ */

function Stat({
  value,
  label,
  colorClass,
  sub,
  delay,
}: {
  value: number;
  label: string;
  colorClass: string;
  sub?: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      delay,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <div ref={ref} className="px-6 py-10 text-center md:py-14">
      <p className={`font-display text-5xl font-bold ${colorClass}`}>{display}</p>
      <motion.p
        className="mt-3 font-mono text-[13px] uppercase tracking-[0.18em] text-text-mid"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
      >
        {label}
      </motion.p>
      {sub && (
        <motion.p
          className="mt-1 font-mono text-[13px] text-text-low"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ delay: delay + 0.45, duration: 0.4 }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

function StatsBand() {
  return (
    <section className="relative border-y border-ink-600 bg-ink-850">
      {/* cyan line draws across the top border on entry */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px origin-left bg-plaquette"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      />
      <div className="lattice-bg absolute inset-0 opacity-15" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
        <Stat value={26} label="Prerequisite Topics" colorClass="text-plaquette" delay={0} />
        <Stat value={23} label="Landmark Papers" colorClass="text-star" delay={0.15} />
        <Stat value={6} label="Knowledge Tiers" colorClass="text-stabilizer" delay={0.3} />
        <Stat value={28} label="Years of Research" colorClass="text-magic" sub="1998 → 2026" delay={0.45} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 4 — The Journey (six tiers)                                 */
/* ------------------------------------------------------------------ */

const JOURNEY: {
  tier: number;
  name: string;
  blurb: string;
  topicList: string;
  unlocks: string;
}[] = [
  {
    tier: 1,
    name: 'Math & Physics Foundations',
    blurb: 'Vectors, complex amplitudes, and the language of quantum states.',
    topicList: 'linear algebra · complex numbers & Dirac notation · quantum mechanics basics',
    unlocks: '→ unlocks the 1998 toric code paper',
  },
  {
    tier: 2,
    name: 'Quantum Computing Basics',
    blurb: 'The qubit, its Pauli algebra, and the circuits that move it around.',
    topicList: 'qubits & Pauli operators · gates & circuits',
    unlocks: '→ unlocks stabilizer language',
  },
  {
    tier: 3,
    name: 'QEC Fundamentals',
    blurb: 'How classical codes become quantum codes, and why thresholds matter.',
    topicList: 'classical codes · stabilizer formalism · quantum codes · fault tolerance & thresholds',
    unlocks: '→ unlocks the threshold theorem era',
  },
  {
    tier: 4,
    name: 'Topological Codes Core',
    blurb: 'Anyons, the toric code, and the surface code lattice itself.',
    topicList: 'topological order & anyons · toric code · surface code · syndrome extraction',
    unlocks: '→ unlocks the 2D lattice papers',
  },
  {
    tier: 5,
    name: 'Computation & Decoding',
    blurb: 'Turning a protected memory into a computer: decoding, braiding, lattice surgery, magic states.',
    topicList:
      'MWPM decoding · defects & braiding · lattice surgery · cluster states/MBQC · magic states · flag FT · ZX-calculus',
    unlocks: '→ unlocks the architecture era',
  },
  {
    tier: 6,
    name: 'Frontier',
    blurb: 'Where the field is right now — the papers are still warm.',
    topicList:
      'advanced & real-time decoding · magic state cultivation · compilers · hybrid simulation · below-threshold experiments',
    unlocks: "→ unlocks today's research news",
  },
];

function TierCard({
  item,
  index,
  onActive,
}: {
  item: (typeof JOURNEY)[number];
  index: number;
  onActive: (tier: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  const color = tierColors[item.tier];

  useEffect(() => {
    if (inView) onActive(item.tier);
  }, [inView, item.tier, onActive]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={trackRipple}
      className="ripple-card relative w-full rounded-xl border border-ink-600 bg-ink-800 p-6 transition-colors duration-200 hover:border-ink-500 md:p-8"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{
            color,
            borderColor: `${color}59`,
            backgroundColor: `${color}24`,
          }}
        >
          Tier {item.tier}
        </span>
        <span className="font-mono text-[13px] text-text-low">TIER {item.tier}/6</span>
      </div>
      <h3 className="mt-4 font-display text-[26px] font-semibold leading-[1.15] md:text-[32px]" style={{ color }}>
        {item.name}
      </h3>
      <p className="mt-3 leading-[1.7] text-text-mid">{item.blurb}</p>
      <p className="mt-4 font-mono text-[13px] leading-relaxed text-text-low">{item.topicList}</p>
      <p className="mt-4 text-sm text-plaquette">{item.unlocks}</p>
      <span className="sr-only">{`Step ${index + 1} of 6`}</span>
    </motion.div>
  );
}

function Journey() {
  const [activeTier, setActiveTier] = useState(0);

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.p variants={riseChild} className="eyebrow">
          {'// THE JOURNEY'}
        </motion.p>
        <motion.h2
          variants={riseChild}
          className="mt-4 max-w-2xl font-display text-[32px] font-semibold leading-[1.1] text-text-hi md:text-[44px]"
        >
          Six tiers from linear algebra to the frontier.
        </motion.h2>
      </motion.div>

      <div className="mt-14 flex gap-8 md:gap-14">
        {/* Ladder of lattice dots — fills tier-color as you pass each tier */}
        <div className="hidden flex-col items-center justify-between py-4 md:flex" aria-hidden>
          {JOURNEY.map((item) => {
            const reached = activeTier >= item.tier;
            const color = tierColors[item.tier];
            return (
              <div key={item.tier} className="flex flex-1 flex-col items-center">
                <div
                  className="h-3 w-3 rounded-full border transition-all duration-300"
                  style={{
                    borderColor: reached ? color : '#2A3A5F',
                    backgroundColor: reached ? color : 'transparent',
                    boxShadow: reached ? `0 0 12px ${color}66` : 'none',
                  }}
                />
                {item.tier < 6 && (
                  <div
                    className="w-px flex-1 transition-colors duration-300"
                    style={{ backgroundColor: reached && activeTier > item.tier ? color : '#2A3A5F' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col gap-6 md:gap-10">
          {JOURNEY.map((item, i) => (
            <TierCard key={item.tier} item={item} index={i} onActive={setActiveTier} />
          ))}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            <Link to="/map" className="btn-secondary">
              See the full map <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 5 — The Canon (era overview)                                */
/* ------------------------------------------------------------------ */

const ERA_BLURBS: Record<string, string> = {
  foundations: 'Toric-code memory and the planar code with boundaries.',
  'cluster-state schemes': '3D cluster states and measurement-based routes to fault tolerance.',
  'defect-based surface code':
    'This era braids defects and holes, makes the 2D lattice practical, and introduces matching decoders and thresholds.',
  'lattice surgery era': 'Merges, splits, twists, compact logical gates, and magic-state factories.',
  'experimental era':
    'Superconducting-qubit proposals, below-threshold hardware, and the latest syndrome-extraction circuits.',
};

function eraLandmarks(era: string): string[] {
  const sorted = papers
    .filter((p) => p.era === era)
    .slice()
    .sort((a, b) => a.year - b.year);
  const picks = [...sorted.slice(0, 2), sorted[sorted.length - 1]];
  const seen = new Set<string>();
  return picks
    .filter((p) => p && !seen.has(p.arxiv_id) && seen.add(p.arxiv_id))
    .map((p) => p.title);
}

function Canon() {
  return (
    <section className="relative overflow-hidden border-t border-ink-600">
      <img
        src={asset('era-strip.svg')}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p variants={riseChild} className="eyebrow">
            {'// THE CANON'}
          </motion.p>
          <motion.h2
            variants={riseChild}
            className="mt-4 font-display text-[32px] font-semibold leading-[1.1] text-text-hi md:text-[44px]"
          >
            Twenty-three papers that built a field.
          </motion.h2>
          <motion.p
            variants={riseChild}
            className="mt-6 max-w-2xl text-[17px] leading-[1.7] text-text-mid md:text-lg"
          >
            These are the papers that every TQEC researcher must read. They run
            from Bravyi &amp; Kitaev&apos;s 1998 planar lattice code to below-threshold
            hardware experiments and the latest surface-code circuits. Each comes
            with a plain-English summary and a list of the prerequisites
            you&apos;ll need.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {ERA_ORDER.map((era) => {
            const color = ERA_COLORS[era];
            const count = papers.filter((p) => p.era === era).length;
            return (
              <motion.div
                key={era}
                variants={{
                  hidden: { opacity: 0, x: 60 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                }}
                className="w-[300px] shrink-0 snap-start md:w-[320px]"
              >
                <Link
                  to={`/papers?era=${encodeURIComponent(era)}`}
                  onMouseMove={trackRipple}
                  className="ripple-card group block h-full rounded-xl border border-ink-600 bg-ink-800 p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    borderTopWidth: 3,
                    borderTopColor: color,
                  }}
                >
                  <p className="font-mono text-[13px]" style={{ color }}>
                    {eraYearRange(era)}
                  </p>
                  <h3 className="mt-2 font-display text-[22px] font-semibold leading-[1.25]" style={{ color }}>
                    {ERA_DISPLAY[era]}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.6] text-text-mid">{ERA_BLURBS[era]}</p>
                  <p className="mt-4 font-mono text-[13px] text-text-low">
                    {count} paper{count === 1 ? '' : 's'}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-ink-700 pt-4">
                    {eraLandmarks(era).map((title) => (
                      <li key={title} className="truncate text-sm text-text-low" title={title}>
                        · {title}
                      </li>
                    ))}
                  </ul>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-2 hidden items-center gap-2 font-mono text-[13px] text-text-low md:flex" aria-hidden>
          scroll <MoveRight className="h-4 w-4 animate-nudge-x" />
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 6 — Entry points                                            */
/* ------------------------------------------------------------------ */

function EntryPoints() {
  const { understoodCount, readCount } = useProgress();

  const cards = [
    {
      icon: Sparkles,
      color: '#F5B83D',
      title: 'Waves to Qubits',
      body: 'Build quantum intuition from tangible wave and compass experiments, then translate each picture into the mathematics it represents.',
      cta: 'Start from zero',
      to: '/foundations',
      stat: null,
    },
    {
      icon: Layers3,
      color: '#9B7BFA',
      title: 'Five Explanation Depths',
      body: 'Hold one scientific claim steady while moving from a concrete story through causes and models to formal evidence.',
      cta: 'Change the depth',
      to: '/altitudes',
      stat: null,
    },
    {
      icon: Gamepad2,
      color: '#FB7185',
      title: 'Decoder Duel',
      body: 'Predict syndrome patterns, repair error chains, and compare your correction with a decoder in a scored surface-code challenge.',
      cta: 'Play the challenge',
      to: '/duel',
      stat: null,
    },
    {
      icon: MapIcon,
      color: '#22D3EE',
      title: 'The Map',
      body: 'See the whole prerequisite tree. Click any topic for explanations, key points, and resources.',
      cta: 'Explore the map',
      to: '/map',
      stat: understoodCount > 0 ? `${understoodCount}/${topics.length} self-marked` : null,
    },
    {
      icon: RouteIcon,
      color: '#34D399',
      title: 'The Path',
      body: 'A guided, ordered walk through every topic with progress tracking and papers unlocked at each step.',
      cta: 'Follow the path',
      to: '/path',
      stat: understoodCount > 0 ? `Next checklist item: ${Math.min(understoodCount + 1, topics.length)} of ${topics.length}` : null,
    },
    {
      icon: ScrollText,
      color: '#9B7BFA',
      title: 'The Papers',
      body: 'The 23-paper canon on a chronological timeline, with plain-English summaries and difficulty ratings.',
      cta: 'Browse the timeline',
      to: '/papers',
      stat: readCount > 0 ? `${readCount}/${papers.length} read` : null,
    },
    {
      icon: Telescope,
      color: '#F5B83D',
      title: 'The Frontier',
      body: "What's happening now: magic-state cultivation, TQEC compilers, real-time decoding, and below-threshold experiments.",
      cta: 'Visit the frontier',
      to: '/field-today',
      stat: null,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.p variants={riseChild} className="eyebrow">
          {'// START HERE'}
        </motion.p>
        <motion.h2
          variants={riseChild}
          className="mt-4 font-display text-[32px] font-semibold leading-[1.1] text-text-hi md:text-[44px]"
        >
          Choose your route.
        </motion.h2>
      </motion.div>

      <motion.div
        className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        {cards.map(({ icon: Icon, color, title, body, cta, to, stat }) => (
          <motion.div
            key={title}
            variants={{
              hidden: { opacity: 0, y: 32 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
            }}
          >
            <Link
              to={to}
              onMouseMove={trackRipple}
              className="ripple-card group flex h-full flex-col rounded-xl border border-ink-600 bg-ink-800 p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow-cyan"
              style={{ borderColor: undefined }}
            >
              <Icon className="h-7 w-7" style={{ color }} aria-hidden />
              <h3 className="mt-5 font-display text-[22px] font-semibold text-text-hi">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-[1.6] text-text-mid">{body}</p>
              {stat && (
                <p className="mt-4 font-mono text-[13px]" style={{ color }}>
                  {stat}
                </p>
              )}
              <p
                className="link-slide mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium"
                style={{ color }}
              >
                {cta} <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <img
        src={asset('braid-divider.svg')}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="mx-auto mt-20 w-full opacity-60 md:mt-28"
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  useDocumentTitle('Topological Quantum Error Correction Atlas');

  return (
    <MotionConfig reducedMotion="user">
      <Hero />
      <WhatIsTqec />
      <StatsBand />
      <Journey />
      <Canon />
      <EntryPoints />
    </MotionConfig>
  );
}

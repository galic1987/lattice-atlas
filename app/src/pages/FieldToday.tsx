import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { ArrowRight, BookOpen, Check, ExternalLink, FlaskConical } from 'lucide-react';
import { papers, topics, topicById, shortName } from '@/data';
import { useProgress } from '@/store/progress';
import DifficultyMeter from '@/components/DifficultyMeter';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------------------------------- shared ---------------------------------- */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BraidDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8" aria-hidden="true">
      <img src="/braid-divider.svg" alt="" className="h-16 w-full object-cover opacity-70" />
    </div>
  );
}

/** Cross-link chip to a topic on the knowledge map or a paper on the timeline. */
function CrossLinkChip({
  kind,
  id,
  label,
  accent,
}: {
  kind: 'topic' | 'paper';
  id: string;
  label: string;
  accent: string;
}) {
  const to = kind === 'topic' ? `/map?topic=${id}` : `/papers#${id}`;
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm text-text-mid transition-all duration-200 hover:border-plaquette/60 hover:text-text-hi"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <span className="max-w-[280px] truncate">{label}</span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-text-low">
        {kind === 'topic' ? 'topic' : 'paper'}
      </span>
    </Link>
  );
}

function TopicChip({ id, accent }: { id: string; accent: string }) {
  const topic = topicById.get(id);
  if (!topic) return null;
  return <CrossLinkChip kind="topic" id={id} label={shortName(topic)} accent={accent} />;
}

/* ----------------------------------- hero ----------------------------------- */

const HERO_ANCHORS = [
  { href: '#magic-states', label: 'magic states' },
  { href: '#compilers', label: 'compilers' },
  { href: '#simulation', label: 'simulation' },
  { href: '#decoding', label: 'decoding' },
  { href: '#flag-ft', label: 'flag FT' },
  { href: '#experiments', label: 'experiments' },
];

function Hero() {
  const reduce = useReducedMotion();
  const words = ['The', 'frontier', 'is', 'a'];
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      {/* Ken Burns background */}
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { scale: [1, 1.06] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
        aria-hidden="true"
      >
        <img
          src="/frontier-hero.svg"
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>
      {/* 65% scrim + bottom gradient to ink-900 */}
      <div className="absolute inset-0 bg-ink-900/65" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-900/30 via-transparent to-ink-900"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="eyebrow text-magic"
        >
          {'// THE FIELD TODAY — 2024 → 2026'}
        </motion.p>

        <h1 className="mt-6 font-display text-display-lg text-text-hi max-sm:text-4xl">
          {words.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.03, ease: EASE }}
              className="inline-block"
            >
              {w}&nbsp;
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + words.length * 0.03, ease: EASE }}
            className="inline-block bg-gradient-to-r from-magic to-syndrome bg-clip-text text-transparent"
          >
            factory.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-text-mid max-sm:text-[17px]"
        >
          Topological error correction crossed from theory into engineering. The questions
          are no longer &lsquo;does it work?&rsquo; The questions now are: How fast can we
          decode it? How cheaply can we distill magic states? How automatically can we
          compile a whole algorithm onto a lattice? This is what researchers and
          tool-builders are working on right now.
        </motion.p>

        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
          className="mt-10 flex flex-wrap gap-x-5 gap-y-2"
          aria-label="Section shortcuts"
        >
          {HERO_ANCHORS.map((a, i) => (
            <motion.a
              key={a.href}
              href={a.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.06, ease: EASE }}
              className="link-slide font-mono text-[13px] text-magic/90 decoration-magic hover:text-magic"
            >
              {a.label}
            </motion.a>
          ))}
        </motion.nav>
      </div>
    </section>
  );
}

/* ------------------------------- big picture -------------------------------- */

const SIGNALS = [
  {
    label: 'THRESHOLD',
    value: 'p_th ≈ 1%',
    color: '#F5B83D',
    explainer: 'physical error rate the surface code tolerates',
  },
  {
    label: 'STATUS',
    value: 'below threshold (2024)',
    color: '#F5B83D',
    explainer: 'logical error ↓ as code distance ↑',
  },
  {
    label: 'HOTTEST PROBLEM',
    value: 'magic states',
    color: '#8B5CF6',
    explainer: 'the non-Clifford bottleneck',
  },
  {
    label: 'NEW FRONTIER',
    value: 'compilation & real-time decoding',
    color: '#8B5CF6',
    explainer: 'the toolchain above the qubit',
  },
];

function BigPicture() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:px-8">
      <div className="grid gap-12 md:grid-cols-5">
        <div className="space-y-8 md:col-span-3">
          <Reveal>
            <p className="leading-[1.7] text-text-mid">
              <span
                className="float-left mr-3 mt-1 font-display text-[64px] font-bold leading-[0.8] text-magic"
                aria-hidden="true"
              >
                G
              </span>
              oogle&rsquo;s 2024 below-threshold result changed the conversation. For the
              first time, a larger surface code outperformed a smaller one on real
              hardware. Logical error rates fell as the code distance grew. Error
              correction is now compounding like an engineering technology, not a physics
              bet.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="leading-[1.7] text-text-mid">
              The bottleneck moved up the stack. Protecting a qubit is increasingly a
              solved problem; the expensive part is computation: (1) prepare high-fidelity
              non-Clifford resources, (2) route logical qubits through space-time, and (3)
              decode syndromes fast enough to keep pace with hardware.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="leading-[1.7] text-text-mid">
              A design-automation ecosystem grew around this result. Compilers turn
              quantum algorithms into lattice-surgery instructions. Simulators verify
              fault-tolerant circuits exactly, over billions of shots. Layout tools let
              you draw, optimize, and debug space-time diagrams.
            </p>
          </Reveal>
        </div>

        {/* Signal board */}
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="md:col-span-2"
        >
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-6 md:sticky md:top-24">
            <p className="eyebrow text-magic">{'// SIGNALS'}</p>
            <dl className="mt-6 space-y-6">
              {SIGNALS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE }}
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-low">
                    {s.label}
                  </dt>
                  <dd
                    className="mt-1 font-mono text-[13px] transition-[text-shadow] duration-300 hover:[text-shadow:0_0_14px_rgba(245,184,61,0.55)]"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </dd>
                  <dd className="mt-1 text-sm text-text-low">{s.explainer}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

/* ------------------------------- SVG vignettes ------------------------------ */

function VignetteFrame({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="rounded-xl border border-ink-600 bg-ink-800 p-6"
    >
      {children}
      <figcaption className="mt-4 font-mono text-[13px] text-text-low">{caption}</figcaption>
    </motion.figure>
  );
}

const DOTS_5X5 = Array.from({ length: 25 }, (_, i) => ({
  x: 30 + (i % 5) * 35,
  y: 30 + Math.floor(i / 5) * 35,
}));

function MagicVignette() {
  return (
    <VignetteFrame caption="fig. 01 — a magic state grown in place, not shipped in from a factory">
      <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[280px]" role="img" aria-label="A glowing magic state growing inside a dim lattice cell">
        {DOTS_5X5.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={2} fill="#3D5178" opacity={0.7} />
        ))}
        {/* plaquette cell outline */}
        <rect x={65} y={65} width={70} height={70} fill="none" stroke="#2A3A5F" strokeWidth={1.5} />
        {/* pulsing rings */}
        {[0, 1].map((i) => (
          <motion.circle
            key={i}
            cx={100}
            cy={100}
            r={34}
            fill="none"
            stroke="#F5B83D"
            strokeWidth={1}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={{ scale: [0.4, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 1.25, ease: 'easeOut' }}
          />
        ))}
        {/* the cultivated |T⟩ diamond */}
        <motion.rect
          x={92}
          y={92}
          width={16}
          height={16}
          rx={2}
          fill="#F5B83D"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', rotate: 45 }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </svg>
    </VignetteFrame>
  );
}

function CompilerVignette() {
  return (
    <VignetteFrame caption="fig. 02 — a ZX diagram compiled into lattice-surgery space-time tubes">
      <svg viewBox="0 0 320 200" className="mx-auto w-full max-w-[340px]" role="img" aria-label="A ZX graph morphing into stacked space-time tubes">
        {/* ZX graph (left) */}
        <motion.path
          d="M50 60 L90 100 L50 140 M90 100 L130 70"
          fill="none"
          stroke="#3D5178"
          strokeWidth={1.5}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: EASE }}
        />
        {[
          { x: 50, y: 60, c: '#22D3EE' },
          { x: 90, y: 100, c: '#8B5CF6' },
          { x: 50, y: 140, c: '#22D3EE' },
          { x: 130, y: 70, c: '#8B5CF6' },
        ].map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={6}
            fill={n.c}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}
        {/* compile arrow */}
        <motion.path
          d="M150 100 L185 100"
          fill="none"
          stroke="#64708E"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        />
        <path d="M185 96 L193 100 L185 104 Z" fill="#64708E" />
        {/* space-time tubes (right) */}
        {[
          { y: 50, c: '#22D3EE' },
          { y: 95, c: '#8B5CF6' },
          { y: 140, c: '#22D3EE' },
        ].map((t, i) => (
          <motion.rect
            key={i}
            x={210}
            y={t.y}
            width={90}
            height={18}
            rx={9}
            fill="none"
            stroke={t.c}
            strokeWidth={1.5}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: EASE }}
          />
        ))}
      </svg>
    </VignetteFrame>
  );
}

function SimVignette() {
  const nodes = [
    { x: 40, y: 100, r: 8 },
    { x: 110, y: 55, r: 6 },
    { x: 110, y: 145, r: 6 },
    { x: 185, y: 30, r: 5 },
    { x: 185, y: 80, r: 5 },
    { x: 185, y: 120, r: 5 },
    { x: 185, y: 170, r: 5 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  return (
    <VignetteFrame caption="fig. 03 — factorization: one big statevector becomes many small factors">
      <svg viewBox="0 0 230 200" className="mx-auto w-full max-w-[300px]" role="img" aria-label="A branching factorization tree splitting a tensor into small factors">
        {edges.map(([a, b], i) => (
          <motion.path
            key={i}
            d={`M${nodes[a].x} ${nodes[a].y} L${nodes[b].x} ${nodes[b].y}`}
            fill="none"
            stroke="#3D5178"
            strokeWidth={1.5}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: EASE }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={i === 0 ? '#22D3EE' : '#121B31'}
            stroke="#22D3EE"
            strokeWidth={1.5}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.05, ease: EASE }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}
      </svg>
    </VignetteFrame>
  );
}

function DecoderVignette() {
  const syndromes = [20, 45, 70, 95, 120, 145, 170, 195, 220, 245, 270];
  return (
    <VignetteFrame caption="fig. 04 — the decoder chases the syndrome stream; the gap is latency">
      <svg viewBox="0 0 320 160" className="mx-auto w-full max-w-[360px]" role="img" aria-label="A strip chart of syndrome dots arriving with a decoder line chasing them">
        {/* latency gap */}
        <motion.rect
          x={205}
          y={20}
          width={85}
          height={110}
          fill="#FB7185"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.08 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        />
        {/* incoming syndrome dots */}
        {syndromes.map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={45 + (i % 3) * 8}
            r={3.5}
            fill="#FB7185"
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: EASE }}
          />
        ))}
        {/* decoder line chasing */}
        <motion.path
          d="M20 120 L60 112 L100 118 L140 108 L180 114 L205 110"
          fill="none"
          stroke="#22D3EE"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
        />
        {/* baseline */}
        <path d="M10 140 L310 140" stroke="#2A3A5F" strokeWidth={1} />
        <text x={248} y={106} fill="#FB7185" fontSize={10} fontFamily="'JetBrains Mono', monospace">
          backlog
        </text>
        <text x={20} y={30} fill="#64708E" fontSize={10} fontFamily="'JetBrains Mono', monospace">
          syndromes →
        </text>
      </svg>
    </VignetteFrame>
  );
}

function ExperimentVignette() {
  const pts = [
    { x: 60, y: 45, label: 'd=3' },
    { x: 160, y: 80, label: 'd=5' },
    { x: 260, y: 115, label: 'd=7' },
  ];
  return (
    <VignetteFrame caption="fig. 05 — logical error rate falls as distance grows: the below-threshold signature">
      <svg viewBox="0 0 320 160" className="mx-auto w-full max-w-[360px]" role="img" aria-label="A descending line chart of logical error versus code distance">
        <path d="M30 10 L30 140 L300 140" fill="none" stroke="#2A3A5F" strokeWidth={1.5} />
        <motion.path
          d={`M${pts[0].x} ${pts[0].y} L${pts[1].x} ${pts[1].y} L${pts[2].x} ${pts[2].y}`}
          fill="none"
          stroke="#34D399"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: EASE }}
        />
        {pts.map((p, i) => (
          <g key={p.label}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={4.5}
              fill="#34D399"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.25, ease: EASE }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fill="#A9B4CC"
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
            >
              {p.label}
            </text>
          </g>
        ))}
        <text x={12} y={24} fill="#64708E" fontSize={10} fontFamily="'JetBrains Mono', monospace" transform="rotate(-90 14 24)">
          ε_L
        </text>
      </svg>
    </VignetteFrame>
  );
}

/* ------------------------------ frontier blocks ----------------------------- */

interface FrontierBlockData {
  id: string;
  num: string;
  accent: string;
  eyebrow: string;
  title: string;
  body: string;
  keyPoints: string[];
  links: ReactNode;
  vignette: ReactNode;
}

function FrontierBlock({ block, flip }: { block: FrontierBlockData; flip: boolean }) {
  return (
    <section id={block.id} className="relative scroll-mt-24 py-20">
      {/* ghost numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -ml-6 -mt-10 select-none font-display text-[160px] font-bold leading-none text-ink-700/40"
      >
        {block.num}
      </span>
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2 md:px-8">
        <div className={flip ? 'md:order-2' : ''}>
          <Reveal>
            <p className="eyebrow" style={{ color: block.accent }}>
              {'// '}
              {block.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.07}>
            <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] text-text-hi max-sm:text-[26px]">
              {block.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 leading-[1.7] text-text-mid">{block.body}</p>
          </Reveal>
          <Reveal delay={0.21}>
            <ul className="mt-6 space-y-2.5">
              {block.keyPoints.map((kp) => (
                <li key={kp} className="flex items-start gap-2.5 text-sm text-text-mid">
                  <span className="mt-1 text-[10px] text-plaquette" aria-hidden="true">
                    ◆
                  </span>
                  {kp}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-7 flex flex-wrap gap-2.5">{block.links}</div>
          </Reveal>
        </div>
        <div className={flip ? 'md:order-1' : ''}>{block.vignette}</div>
      </div>
    </section>
  );
}

/* --------------------------- jargon strip (pinned) --------------------------- */

const JARGON = [
  {
    term: 'magic state',
    color: '#F5B83D',
    def: 'the distilled resource that powers non-Clifford T gates',
    slug: 'magic-state',
  },
  {
    term: 'lattice surgery',
    color: '#8B5CF6',
    def: 'merging and splitting code patches to perform logical gates',
    slug: 'lattice-surgery',
  },
  {
    term: 'space-time diagram',
    color: '#22D3EE',
    def: 'the 3D blueprint of a fault-tolerant computation',
    slug: 'space-time-diagram',
  },
  {
    term: 'real-time decoding',
    color: '#FB7185',
    def: 'correcting syndromes as fast as the hardware produces them',
    slug: 'real-time-decoding',
  },
  {
    term: 'flag qubit',
    color: '#34D399',
    def: 'a sentinel ancilla that catches correlated hook errors',
    slug: 'flag-qubit',
  },
];

function JargonStage({ active }: { active: number }) {
  const j = JARGON[active];
  return (
    <div className="flex h-full items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={j.term}
          initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -30, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: EASE }}
          className="text-center"
        >
          <p
            className="font-display text-display-lg max-sm:text-4xl"
            style={{ color: j.color }}
          >
            {j.term}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-[1.7] text-text-mid">{j.def}</p>
          <Link
            to={`/glossary#${j.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800 px-4 py-2 font-mono text-[13px] text-text-mid transition-colors duration-200 hover:border-plaquette/60 hover:text-plaquette"
          >
            read the glossary entry
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function JargonStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(JARGON.length - 1, Math.max(0, Math.floor(v * JARGON.length))));
  });

  return (
    <>
      {/* Desktop: sticky pinned scene over 250vh */}
      <div ref={ref} className="relative hidden md:block" style={{ height: '250vh' }}>
        <div className="sticky top-0 flex h-screen items-stretch">
          {/* progress rail */}
          <div className="flex w-64 shrink-0 flex-col justify-center gap-5 border-r border-ink-600 pl-8">
            <p className="eyebrow mb-2">{'// FIELD JARGON'}</p>
            {JARGON.map((j, i) => (
              <p
                key={j.term}
                className={`font-mono text-[13px] transition-all duration-300 ${
                  i === active ? 'translate-x-1' : 'text-text-low'
                }`}
                style={i === active ? { color: j.color } : undefined}
              >
                {String(i + 1).padStart(2, '0')} · {j.term}
              </p>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <JargonStage active={active} />
          </div>
        </div>
      </div>

      {/* Mobile: static stacked list */}
      <div className="mx-auto max-w-6xl px-6 py-20 md:hidden">
        <p className="eyebrow">{'// FIELD JARGON'}</p>
        <h2 className="mt-4 font-display text-[26px] font-semibold text-text-hi">
          How to read the frontier.
        </h2>
        <div className="mt-8 space-y-4">
          {JARGON.map((j) => (
            <div key={j.term} className="rounded-xl border border-ink-600 bg-ink-800 p-5">
              <p className="font-display text-xl font-semibold" style={{ color: j.color }}>
                {j.term}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">{j.def}</p>
              <Link
                to={`/glossary#${j.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-plaquette link-slide"
              >
                glossary <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------ frontier shelf ------------------------------ */

function FrontierPaperCard({ paper, index }: { paper: (typeof papers)[number]; index: number }) {
  const { isRead, toggleRead } = useProgress();
  const read = isRead(paper.arxiv_id);
  return (
    <motion.article
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
      className="flex w-[320px] shrink-0 snap-start flex-col rounded-xl border border-ink-600 bg-ink-800 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-syndrome/50 hover:shadow-glow-cyan"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-3xl font-bold text-syndrome">{paper.year}</p>
        <DifficultyMeter level={paper.difficulty} />
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-text-hi">
        {paper.title}
      </h3>
      <p className="mt-1.5 line-clamp-1 text-sm text-text-low">{paper.authors}</p>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-text-mid">
        {paper.one_sentence}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-700 pt-4">
        <a
          href={`https://arxiv.org/abs/${paper.arxiv_id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] text-plaquette link-slide"
        >
          arXiv:{paper.arxiv_id}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          onClick={() => toggleRead(paper.arxiv_id)}
          aria-pressed={read}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors duration-200 ${
            read
              ? 'border-stabilizer/50 bg-stabilizer/10 text-stabilizer'
              : 'border-ink-600 text-text-mid hover:border-stabilizer/50 hover:text-stabilizer'
          }`}
        >
          {read ? <Check className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
          {read ? 'read' : 'mark read'}
        </button>
      </div>
    </motion.article>
  );
}

function FrontierShelf() {
  const shelf = papers
    .filter((p) => p.era === 'experimental era')
    .sort((a, b) => a.year - b.year);
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <p className="eyebrow">{'// KEEP READING'}</p>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] text-text-hi max-sm:text-[26px]">
            Papers of the experimental era.
          </h2>
        </Reveal>
      </div>
      <div className="mt-10 overflow-x-auto pb-4">
        <div className="mx-auto flex w-max max-w-none snap-x snap-mandatory gap-4 px-6 md:gap-6 md:px-8">
          {shelf.map((p, i) => (
            <FrontierPaperCard key={p.arxiv_id} paper={p} index={i} />
          ))}
          {/* capstone card */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: shelf.length * 0.1, ease: EASE }}
            className="w-[260px] shrink-0 snap-start"
          >
            <Link
              to="/papers?era=experimental%20era"
              className="group flex h-full min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-syndrome/60 p-6 text-center transition-colors duration-200 hover:border-syndrome hover:bg-syndrome/5"
            >
              <FlaskConical className="h-7 w-7 text-syndrome" />
              <span className="font-display text-lg font-semibold text-text-hi">
                See all experimental-era papers
              </span>
              <ArrowRight className="h-5 w-5 text-syndrome animate-nudge-x" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- closing CTA ------------------------------- */

function ClosingCta() {
  const { understoodCount } = useProgress();
  const done = understoodCount >= topics.length;
  return (
    <section className="py-24">
      <BraidDivider />
      <div className="mx-auto max-w-3xl px-6 pt-20 text-center md:px-8">
        <Reveal>
          <h2 className="font-display text-[32px] font-semibold leading-[1.15] text-text-hi max-sm:text-[26px]">
            {done ? "You've already climbed the tree — stay curious." : 'Ready to understand all of it?'}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 leading-[1.7] text-text-mid">
            Everything on this page traces back through the knowledge tree. Climb it step
            by step and the frontier stops being jargon.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 rgba(34,211,238,0)',
                  '0 0 24px rgba(34,211,238,0.25)',
                  '0 0 0 rgba(34,211,238,0)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-lg"
            >
              <Link to={done ? '/papers' : '/path'} className="btn-primary">
                {done ? 'Revisit the papers' : 'Start the learning path'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <Link to="/map" className="btn-secondary">
              Open the knowledge map
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- page ----------------------------------- */

export default function FieldToday() {
  const blocks: FrontierBlockData[] = [
    {
      id: 'magic-states',
      num: '01',
      accent: '#F5B83D',
      eyebrow: 'THE BOTTLENECK',
      title: 'Growing T gates in a Clifford world.',
      body: "Clifford operations are cheap on a surface code; the T gate is not. It requires distilled 'magic states' — and distillation factories consumed most of the qubits in a fault-tolerant algorithm. Magic state cultivation grows high-quality |T⟩ states directly inside the code with dramatically less overhead, turning the factory into a garden plot.",
      keyPoints: [
        'why non-Clifford gates need magic states',
        'distillation → cultivation: the overhead collapse',
        'cultivation as the current highest-leverage research problem',
      ],
      links: (
        <>
          <TopicChip id="magic-state-cultivation" accent="#F5B83D" />
          <CrossLinkChip kind="paper" id="1812.01238" label="Efficient magic state factories…" accent="#F5B83D" />
        </>
      ),
      vignette: <MagicVignette />,
    },
    {
      id: 'compilers',
      num: '02',
      accent: '#8B5CF6',
      eyebrow: 'THE TOOLCHAIN',
      title: 'From algorithm to lattice, automatically.',
      body: 'A surface-code computation is a 3D space-time object — tubes and blocks of lattice surgery weaving through time. A new compiler ecosystem builds these objects automatically. TopoLS translates ZX-calculus diagrams into lattice-surgery space-time layouts. Pathfinding tools (in the Topologiq / qelebrimbor lineage) route block-graphs through space. Visual editors (SketchUp-style) let designers draw and inspect constructions by hand.',
      keyPoints: [
        'ZX-calculus → lattice surgery compilation',
        'space-time block-graph pathfinding',
        'visual, debuggable layout tools',
      ],
      links: (
        <>
          <TopicChip id="tqec-compilers-automation" accent="#8B5CF6" />
          <TopicChip id="zx-calculus-basics" accent="#8B5CF6" />
        </>
      ),
      vignette: <CompilerVignette />,
    },
    {
      id: 'simulation',
      num: '03',
      accent: '#22D3EE',
      eyebrow: 'TRUST BUT VERIFY',
      title: 'Simulating the uncorrectable, exactly.',
      body: 'How do you validate a fault-tolerant circuit before hardware exists? Clifford simulators are fast but blind to non-Clifford physics. Hybrid simulators like Clifft carry a Clifford frame and factorize the residual statevector. They give exact results over billions of shots, for circuits too large for brute-force statevector methods.',
      keyPoints: [
        'stabilizer simulation vs statevector limits',
        'Clifford-frame + factorization trick',
        'verification workflow for new code constructions',
      ],
      links: <TopicChip id="clifford-simulation-hybrid" accent="#22D3EE" />,
      vignette: <SimVignette />,
    },
    {
      id: 'decoding',
      num: '04',
      accent: '#FB7185',
      eyebrow: 'THE CLOCK',
      title: 'Decoding faster than the noise.',
      body: "A decoder that runs in post-processing is a science experiment; a decoder that runs in real time is a computer. Latency matters because undecoded syndromes pile up exponentially — and because non-Clifford gates need feed-forward decisions. Meanwhile, flag fault-tolerance shrinks syndrome extraction itself: a few extra 'flag' qubits catch hook errors, so small codes stay fault-tolerant without full-distance circuits.",
      keyPoints: [
        'latency vs decoherence race',
        'streaming/hierarchical real-time decoders',
        'flag qubits: cheap fault-tolerance for small codes',
      ],
      links: (
        <>
          <TopicChip id="real-time-decoding-control" accent="#FB7185" />
          <TopicChip id="advanced-decoding" accent="#FB7185" />
          <span id="flag-ft" className="scroll-mt-24">
            <TopicChip id="flag-fault-tolerance" accent="#FB7185" />
          </span>
          <CrossLinkChip kind="paper" id="1110.5133" label="Towards practical classical processing…" accent="#FB7185" />
        </>
      ),
      vignette: <DecoderVignette />,
    },
    {
      id: 'experiments',
      num: '05',
      accent: '#34D399',
      eyebrow: 'THE HARDWARE',
      title: 'Error correction that compounds.',
      body: "The experimental era's defining plot: logical error rate vs code distance, bending downward. Google's 2024 below-threshold demonstration on superconducting hardware showed distance-7 beating distance-5, and distance-5 beating distance-3. This is the scaling signature the field chased since 1998. The roadmap question is now 'how many qubits to factoring-scale machines?'",
      keyPoints: [
        'Λ (lambda): the error-suppression factor per distance step',
        'logical qubit lifetime > physical lifetime',
        'roadmap: millions of physical qubits',
      ],
      links: (
        <>
          <TopicChip id="below-threshold-experiments" accent="#34D399" />
          <CrossLinkChip kind="paper" id="2207.06431" label="Suppressing quantum errors by scaling… (2022)" accent="#34D399" />
          <CrossLinkChip kind="paper" id="2408.13687" label="QEC below the surface code threshold (2024)" accent="#34D399" />
        </>
      ),
      vignette: <ExperimentVignette />,
    },
  ];

  return (
    <div className="bg-ink-900">
      <Hero />
      <BigPicture />
      <div>
        {blocks.map((b, i) => (
          <div key={b.id}>
            {i > 0 && <BraidDivider />}
            <FrontierBlock block={b} flip={i % 2 === 1} />
          </div>
        ))}
      </div>
      <JargonStrip />
      <FrontierShelf />
      <ClosingCta />
    </div>
  );
}

import { asset } from '@/lib/asset';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  FlaskConical,
  Gauge,
  Layers,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { papers, topics, topicById, shortName } from '@/data';
import { useProgress } from '@/store/progress';
import TopoLSCompiler from '@/components/TopoLSCompiler';
import SpacetimeBraidWeaver from '@/components/SpacetimeBraidWeaver';
import RealQuantumEndpoint from '@/components/RealQuantumEndpoint';
import DifficultyMeter from '@/components/DifficultyMeter';

function formatSci(val: number): string {
  if (val === 0) return '0';
  if (val >= 0.01) return val.toFixed(4);
  const exp = Math.floor(Math.log10(val));
  const mant = (val / Math.pow(10, exp)).toFixed(2);
  const supMap: Record<string, string> = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  const supExp = String(exp).split('').map(c => supMap[c] || c).join('');
  return `${mant} × 10${supExp}`;
}

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
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0 } : { duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BraidDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8" aria-hidden="true">
      <img src={asset('braid-divider.svg')} alt="" loading="lazy" decoding="async" className="h-16 w-full object-cover opacity-70" />
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
          src={asset('frontier-hero.svg')}
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
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
          className="eyebrow text-magic"
        >
          {'// THE FIELD TODAY — 2024 → 2026'}
        </motion.p>

        <h1 className="mt-6 font-display text-display-lg text-text-hi max-sm:text-4xl">
          {words.map((w, i) => (
            <motion.span
              key={w}
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.1 + i * 0.03, ease: EASE }}
              className="inline-block"
            >
              {w}&nbsp;
            </motion.span>
          ))}
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.1 + words.length * 0.03, ease: EASE }}
            className="inline-block bg-gradient-to-r from-magic to-syndrome bg-clip-text text-transparent"
          >
            factory.
          </motion.span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.35, ease: EASE }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-text-mid max-sm:text-[17px]"
        >
          Topological error correction crossed from theory into engineering. The questions
          are no longer &lsquo;does it work?&rsquo; The questions now are: How fast can we
          decode it? How cheaply can we distill magic states? How automatically can we
          compile a whole algorithm onto a lattice? This is what researchers and
          tool-builders are working on right now.
        </motion.p>

        <motion.nav
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.55, ease: EASE }}
          className="mt-10 flex flex-wrap gap-x-5 gap-y-2"
          aria-label="Section shortcuts"
        >
          {HERO_ANCHORS.map((a, i) => (
            <motion.a
              key={a.href}
              href={a.href}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.4, delay: 0.6 + i * 0.06, ease: EASE }}
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
    value: 'model-dependent',
    color: '#F5B83D',
    explainer: 'often ≈0.5–1% in specified circuit-level studies',
  },
  {
    label: 'STATUS',
    value: 'memory scaling (2024)',
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
              oogle&rsquo;s 2022 experiment reported a small average distance-5 improvement
              over distance 3. Its 2024 Willow memory then showed a clear distance-3, 5,
              and 7 scaling trend for the tested task and decoders. That is strong evidence
              of below-threshold memory scaling—not yet an end-to-end fault-tolerant gate
              set or algorithm.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="leading-[1.7] text-text-mid">
              The bottleneck spans the whole stack. A useful machine must preserve logical
              memory while it (1) prepares high-fidelity non-Clifford resources, (2) routes
              and operates logical patches through space-time, and (3) decodes detector
              data with adequate accuracy, sustained throughput, and control latency.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="leading-[1.7] text-text-mid">
              A design-automation ecosystem is growing around these requirements. Research
              compilers can produce candidate logical layouts under declared constraints.
              Simulators can reproduce a represented circuit and noise model, sometimes
              exactly per sampled trajectory, but cannot certify omitted hardware effects.
              Layout tools help draw, optimize, and inspect space-time constructions.
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
  const reduce = useReducedMotion();
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
            animate={reduce ? { scale: 1, opacity: 0.25 } : { scale: [0.4, 1.6], opacity: [0.6, 0] }}
            transition={reduce ? { duration: 0 } : { duration: 2.5, repeat: Infinity, delay: i * 1.25, ease: 'easeOut' }}
          />
        ))}
        {/* the cultivated |A⟩ diamond */}
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
          stroke="#7B89A7"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        />
        <path d="M185 96 L193 100 L185 104 Z" fill="#7B89A7" />
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
  const reduce = useReducedMotion();
  const syndromes = [20, 45, 70, 95, 120, 145, 170, 195, 220, 245, 270];
  return (
    <VignetteFrame caption="fig. 04 — a decoder pipeline can trail each round while still keeping pace with the stream">
      <svg viewBox="0 0 320 160" className="mx-auto w-full max-w-[360px]" role="img" aria-label="A strip chart separating the arriving syndrome stream from delayed decoder decisions">
        {/* decision-latency window */}
        <motion.rect
          x={205}
          y={20}
          width={85}
          height={110}
          fill="#FB7185"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 0.08 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.8 }}
        />
        {/* incoming syndrome dots */}
        {syndromes.map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={45 + (i % 3) * 8}
            r={3.5}
            fill="#FB7185"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, delay: i * 0.06, ease: EASE }}
          />
        ))}
        {/* decoder line chasing */}
        <motion.path
          d="M20 120 L60 112 L100 118 L140 108 L180 114 L205 110"
          fill="none"
          stroke="#22D3EE"
          strokeWidth={2}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reduce ? { duration: 0 } : { duration: 1, delay: 0.3, ease: EASE }}
        />
        {/* baseline */}
        <path d="M10 140 L310 140" stroke="#2A3A5F" strokeWidth={1} />
        <text x={248} y={106} fill="#FB7185" fontSize={10} fontFamily="'JetBrains Mono', monospace">
          latency
        </text>
        <text x={20} y={30} fill="#7B89A7" fontSize={10} fontFamily="'JetBrains Mono', monospace">
          detector rounds →
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
        <text x={12} y={24} fill="#7B89A7" fontSize={10} fontFamily="'JetBrains Mono', monospace" transform="rotate(-90 14 24)">
          ε_L
        </text>
      </svg>
    </VignetteFrame>
  );
}

/* -------------------------------------------------------------------------- */
/*                1. Idealized magic-state protocol arithmetic                */
/* -------------------------------------------------------------------------- */

type ProtocolKey = '15-1' | '20-4' | '8-2';

interface ProtocolMeta {
  name: string;
  shortName: string;
  inputs: number;
  outputs: number;
  formula: (p: number) => number;
  formulaLabel: string;
  description: string;
  caveat: string;
  sourceLabel: string;
  sourceHref: string;
  color: string;
}

const PROTOCOLS: Record<ProtocolKey, ProtocolMeta> = {
  '15-1': {
    name: '15-to-1 (Bravyi–Kitaev)',
    shortName: '15→1 BK',
    inputs: 15,
    outputs: 1,
    formula: (p: number) => 35 * Math.pow(p, 3),
    formulaLabel: 'p_out = 35p³ + O(p⁴)',
    description: 'One accepted output from 15 inputs, with cubic leading marginal error in the standard ideal input model.',
    caveat: 'Acceptance probability and all logical Clifford-circuit faults are omitted.',
    sourceLabel: 'Bravyi–Kitaev 15-to-1',
    sourceHref: 'https://arxiv.org/abs/quant-ph/0403025',
    color: '#F5B83D',
  },
  '20-4': {
    name: '20-to-4 (Bravyi–Haah)',
    shortName: '20→4 BH',
    inputs: 20,
    outputs: 4,
    formula: (p: number) => 13 * Math.pow(p, 2),
    formulaLabel: 'p_out = 13p² + O(p³)',
    description: 'The k=4 member of the Bravyi–Haah 3k+8-to-k family: five nominal inputs per accepted marginal output.',
    caveat: 'The four outputs can be correlated; treating them as independent inputs to another level is an extra approximation.',
    sourceLabel: 'Bravyi–Haah triorthogonal codes',
    sourceHref: 'https://arxiv.org/abs/1209.2426',
    color: '#8B5CF6',
  },
  '8-2': {
    name: 'Catalyzed 8-to-2 (Gidney–Fowler)',
    shortName: '8→2 catalyzed',
    inputs: 8,
    outputs: 2,
    formula: (p: number) => 28 * Math.pow(p, 2),
    formulaLabel: 'headline p_out ≈ 28p²',
    description: 'Eight inputs feed a CCZ factory whose output is catalytically converted into two T-type outputs.',
    caveat: 'This headline marginal model omits catalyst startup, catalyst poisoning, correlated outputs, and the conversion circuit’s own faults.',
    sourceLabel: 'Gidney–Fowler catalyzed factory',
    sourceHref: 'https://arxiv.org/abs/1812.01238',
    color: '#22D3EE',
  },
};

interface FactoryStage {
  round: number;
  pIn: number;
  pOut: number;
  inputsPerOutput: number;
  cumulativeRaw: number;
  improves: boolean;
}

function MagicStateCalculatorWidget() {
  const [pInLog, setPInLog] = useState<number>(-3); // 10^-3 = 0.001 (0.1%)
  const [pTargetLog, setPTargetLog] = useState<number>(-10); // 10^-10
  const [protocol, setProtocol] = useState<ProtocolKey>('15-1');

  const pIn = Math.pow(10, pInLog);
  const pTarget = Math.pow(10, pTargetLog);
  const meta = PROTOCOLS[protocol];

  // Deliberately simple leading-order marginal cascade. It is not a factory simulation.
  const stages: FactoryStage[] = [];
  let currP = pIn;
  let cumRaw = 1;
  let roundCount = 0;
  let nonConvergent = false;
  const maxRounds = 6;
  const inputsPerOutput = meta.inputs / meta.outputs;

  while (currP > pTarget && roundCount < maxRounds) {
    roundCount++;
    cumRaw *= inputsPerOutput;
    const nextP = meta.formula(currP);
    const improves = Number.isFinite(nextP) && nextP < currP;
    stages.push({
      round: roundCount,
      pIn: currP,
      pOut: nextP,
      inputsPerOutput,
      cumulativeRaw: cumRaw,
      improves,
    });
    currP = nextP;
    if (!improves) {
      nonConvergent = true;
      break;
    }
  }

  const finalPOut = currP;
  const totalRawNeeded = cumRaw;
  const targetMet = finalPOut <= pTarget;
  const hitRoundLimit = !targetMet && !nonConvergent && roundCount === maxRounds;

  const applyPreset = (inLog: number, targetLog: number, prot: ProtocolKey) => {
    setPInLog(inLog);
    setPTargetLog(targetLog);
    setProtocol(prot);
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-800/90 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-magic">
            <Sparkles className="h-5 w-5" />
            <span className="eyebrow font-mono uppercase tracking-wider text-magic">
              INTERACTIVE TOOL // IDEALIZED PROTOCOL ARITHMETIC
            </span>
          </div>
          <h3 className="mt-1 font-display text-2xl font-semibold text-text-hi">
            Compare leading-order magic-state protocols
          </h3>
          <p className="mt-1 text-sm text-text-mid max-w-2xl">
            Apply published small-p marginal formulas level by level. This checks arithmetic under explicit assumptions; it does not estimate a physical factory.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            type="button"
            onClick={() => applyPreset(-3, -10, '15-1')}
            className="rounded-lg border border-ink-600 bg-ink-900/60 px-3 py-1.5 font-mono text-xs text-text-mid transition-all hover:border-magic/60 hover:text-magic"
          >
            15→1 example
          </button>
          <button
            type="button"
            onClick={() => applyPreset(-3, -10, '20-4')}
            className="rounded-lg border border-ink-600 bg-ink-900/60 px-3 py-1.5 font-mono text-xs text-text-mid transition-all hover:border-star/60 hover:text-star"
          >
            20→4 comparison
          </button>
          <button
            type="button"
            onClick={() => applyPreset(-1.3, -8, '8-2')}
            className="rounded-lg border border-ink-600 bg-ink-900/60 px-3 py-1.5 font-mono text-xs text-text-mid transition-all hover:border-plaquette/60 hover:text-plaquette"
          >
            Show non-convergence
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Summary Cards */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-5 rounded-xl border border-ink-700 bg-ink-900/50 p-5">
          {/* Input Error Rate Slider */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs">
              <label htmlFor="p-in-slider" className="text-text-mid flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-magic" />
                Input-state marginal error (p):
              </label>
              <span className="font-semibold text-magic">
                {(pIn * 100).toFixed(2)}% ({formatSci(pIn)})
              </span>
            </div>
            <input
              id="p-in-slider"
              type="range"
              min="-4"
              max="-1.3"
              step="0.05"
              value={pInLog}
              onChange={(e) => setPInLog(parseFloat(e.target.value))}
              className="mt-3 w-full accent-magic cursor-pointer h-2 rounded-lg bg-ink-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
              <span>0.01% (10⁻⁴)</span>
              <span>0.10% (10⁻³)</span>
              <span>1.00% (10⁻²)</span>
              <span>5.00%</span>
            </div>
          </div>

          {/* Target Error Rate Slider */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs">
              <label htmlFor="p-target-slider" className="text-text-mid flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-syndrome" />
                Target Output Error (p_target):
              </label>
              <span className="font-semibold text-syndrome">
                {formatSci(pTarget)}
              </span>
            </div>
            <input
              id="p-target-slider"
              type="range"
              min="-15"
              max="-6"
              step="1"
              value={pTargetLog}
              onChange={(e) => setPTargetLog(parseInt(e.target.value))}
              className="mt-3 w-full accent-syndrome cursor-pointer h-2 rounded-lg bg-ink-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
              <span>10⁻⁶</span>
              <span>10⁻¹⁰</span>
              <span>10⁻¹⁵</span>
            </div>
          </div>

          {/* Protocol Selection */}
          <div>
            <span id="magic-protocol-label" className="mb-2.5 block font-mono text-xs text-text-mid">
              Published protocol model:
            </span>
            <div
              className="grid gap-2 sm:grid-cols-3"
              role="group"
              aria-labelledby="magic-protocol-label"
            >
              {(Object.keys(PROTOCOLS) as ProtocolKey[]).map((key) => {
                const p = PROTOCOLS[key];
                const active = protocol === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProtocol(key)}
                    aria-pressed={active}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      active
                        ? 'border-magic bg-magic/10 text-text-hi shadow-glow-amber'
                        : 'border-ink-700 bg-ink-800/60 text-text-mid hover:border-ink-600 hover:text-text-hi'
                    }`}
                  >
                    <p className="font-mono text-xs font-semibold" style={{ color: p.color }}>
                      {p.shortName}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-text-low">{p.name}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-ink-700 bg-ink-800/80 p-3 text-xs leading-relaxed text-text-mid">
              <p>{meta.description}</p>
              <p className="mt-2 font-mono text-text-hi">{meta.formulaLabel}</p>
              <p className="mt-2 text-text-low">Scope: {meta.caveat}</p>
              <a
                href={meta.sourceHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-plaquette hover:text-text-hi"
              >
                {meta.sourceLabel}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Output Metrics Column */}
        <div className="space-y-6 lg:col-span-7 flex flex-col justify-between">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Nominal raw / output
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-magic">
                {totalRawNeeded.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-text-mid">ignores rejection and retries</p>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Modeled levels
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-syndrome">
                {roundCount} {roundCount === 1 ? 'Round' : 'Rounds'}
              </p>
              <p className="mt-1 text-[11px] text-text-mid">same marginal law reapplied</p>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Marginal output
              </p>
              <p className="mt-2 whitespace-nowrap font-mono text-[13px] font-bold text-stabilizer sm:text-lg">
                {formatSci(finalPOut)}
              </p>
              <p className="mt-1 text-[11px] text-text-mid">requested ≤ {formatSci(pTarget)}</p>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Model status
              </p>
              <p className={`mt-2 font-display text-xl font-bold ${targetMet ? 'text-stabilizer' : 'text-syndrome'}`}>
                {targetMet ? 'TARGET MET' : nonConvergent ? 'NO IMPROVEMENT' : 'NOT REACHED'}
              </p>
              <p className="mt-1 text-[11px] text-text-mid">
                {targetMet ? 'inside this idealized model' : hitRoundLimit ? `${maxRounds}-level display limit` : 'leading law does not converge'}
              </p>
            </div>
          </div>

          {/* Distillation Flow Pipeline */}
          <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-text-mid flex items-center gap-2">
                <Layers className="h-4 w-4 text-magic" />
                Leading-order cascade
              </h4>
              <span className="font-mono text-[11px] text-magic bg-magic/10 px-2 py-0.5 rounded border border-magic/30">
                {meta.inputs} inputs → {meta.outputs} outputs per batch
              </span>
            </div>

            {/* Pipeline Stage Cards */}
            <div className="mt-4 space-y-3">
              {/* Input raw stage */}
              <div className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-800/80 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-xs font-bold text-amber-400">
                  RAW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-text-hi">Input |A_noisy⟩, with |A⟩ = T|+⟩</span>
                    <span className="text-amber-400">p_in = {formatSci(pIn)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>

              {/* Rounds */}
              {stages.map((stg) => (
                <div key={stg.round} className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-800/80 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-syndrome/40 bg-syndrome/10 font-mono text-xs font-bold text-syndrome">
                    R{stg.round}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-semibold text-text-hi">
                        Level {stg.round} ({stg.inputsPerOutput}:1 nominal inputs/output)
                      </span>
                      <span className="text-syndrome">p_{stg.round} = {formatSci(stg.pOut)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-syndrome to-stabilizer"
                        style={{ width: `${Math.min(100, 30 + stg.round * 25)}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
                      <span>Cum. nominal ratio: {stg.cumulativeRaw}:1</span>
                      <span>{stg.improves ? `Modeled reduction: ${(stg.pIn / Math.max(1e-25, stg.pOut)).toExponential(1)}x` : 'No modeled improvement at this p'}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className={`flex flex-col gap-1 rounded-lg border px-4 py-2.5 font-mono text-xs sm:flex-row sm:items-center sm:justify-between ${targetMet ? 'border-stabilizer/40 bg-stabilizer/10 text-stabilizer' : 'border-syndrome/40 bg-syndrome/10 text-syndrome'}`}>
                <span className="flex items-center gap-2 font-semibold">
                  {targetMet ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {targetMet ? 'Target reached in the leading-order model' : nonConvergent ? 'Selected recurrence does not improve this input' : `Target not reached within ${maxRounds} displayed levels`}
                </span>
                <span>
                  modeled p_out = {formatSci(finalPOut)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-plaquette/30 bg-plaquette/5 p-4 text-xs leading-relaxed text-text-mid">
            <p className="font-mono font-semibold uppercase tracking-wider text-plaquette">What this comparison omits</p>
            <p className="mt-2">
              It reapplies a published leading marginal term and divides batch inputs by outputs. It assumes small, independent, identically distributed twirled input errors and ideal checks. It omits acceptance probability, retries, output correlations, catalyst history, logical-circuit faults, routing, storage, code distance, physical qubits, wall-clock time, and spacetime volume. Multi-output batches are not generally independent streams, so later levels are illustrative arithmetic—not a factory design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*             2. Illustrative real-time decoder queue model                  */
/* -------------------------------------------------------------------------- */

interface DecoderPreset {
  name: string;
  serviceUs: number;
  cycleUs: number;
  workers: number;
  decisionUs: number;
  deadlineUs: number;
  rounds: number;
  desc: string;
}

const DECODER_PRESETS: DecoderPreset[] = [
  {
    name: 'Queue clears',
    serviceUs: 0.8,
    cycleUs: 1.0,
    workers: 1,
    decisionUs: 35,
    deadlineUs: 50,
    rounds: 10000,
    desc: 'One worker has enough sustained capacity, and the illustrative decision path meets its deadline.',
  },
  {
    name: 'Parallel capacity',
    serviceUs: 3.0,
    cycleUs: 1.0,
    workers: 4,
    decisionUs: 60,
    deadlineUs: 80,
    rounds: 10000,
    desc: 'Each worker is slower than the arrival cadence, but four workers provide enough aggregate throughput.',
  },
  {
    name: 'Rate deficit',
    serviceUs: 1.4,
    cycleUs: 1.0,
    workers: 1,
    decisionUs: 20,
    deadlineUs: 100,
    rounds: 10000,
    desc: 'Arrivals outpace aggregate service, so this deterministic queue grows approximately linearly.',
  },
  {
    name: 'Deadline miss',
    serviceUs: 0.7,
    cycleUs: 1.0,
    workers: 1,
    decisionUs: 80,
    deadlineUs: 50,
    rounds: 5000,
    desc: 'Throughput keeps the queue empty, but the independent feed-forward decision deadline is missed.',
  },
];

function DecoderLatencySimulatorWidget() {
  const [serviceUs, setServiceUs] = useState<number>(0.8);
  const [cycleUs, setCycleUs] = useState<number>(1.0);
  const [workers, setWorkers] = useState<number>(1);
  const [decisionUs, setDecisionUs] = useState<number>(35);
  const [deadlineUs, setDeadlineUs] = useState<number>(50);
  const [numRounds, setNumRounds] = useState<number>(10000);

  const arrivalRate = 1 / cycleUs;
  const serviceRate = workers / serviceUs;
  const capacityRatio = serviceRate / arrivalRate;
  const keepsPace = capacityRatio >= 1;
  const elapsedUs = numRounds * cycleUs;
  const serviceCapacity = Math.floor(elapsedUs * serviceRate);
  const completedRounds = Math.min(numRounds, serviceCapacity);
  const backlogRounds = Math.min(numRounds, Math.max(0, numRounds - completedRounds));
  const queueDelayUs = backlogRounds / serviceRate;
  const feedForwardLatencyUs = decisionUs + queueDelayUs;
  const deadlineMet = feedForwardLatencyUs <= deadlineUs;

  const applyDecoderPreset = (preset: DecoderPreset) => {
    setServiceUs(preset.serviceUs);
    setCycleUs(preset.cycleUs);
    setWorkers(preset.workers);
    setDecisionUs(preset.decisionUs);
    setDeadlineUs(preset.deadlineUs);
    setNumRounds(preset.rounds);
  };

  const generateQueueGraphPoints = () => {
    const points: string[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const x = 30 + frac * 260;
      const arrivals = frac * numRounds;
      const capacity = frac * elapsedUs * serviceRate;
      const currentBacklog = Math.min(arrivals, Math.max(0, arrivals - capacity));
      const graphMaximum = Math.max(1, backlogRounds);
      const y = 140 - Math.min(110, (currentBacklog / graphMaximum) * 110);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const activePreset = DECODER_PRESETS.find(
    (preset) =>
      preset.serviceUs === serviceUs &&
      preset.cycleUs === cycleUs &&
      preset.workers === workers &&
      preset.decisionUs === decisionUs &&
      preset.deadlineUs === deadlineUs &&
      preset.rounds === numRounds,
  );

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-800/90 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-rose-400">
            <Activity className="h-5 w-5" />
            <span className="eyebrow font-mono uppercase tracking-wider text-rose-400">
              ILLUSTRATIVE MODEL // STREAMING DECODER QUEUE
            </span>
          </div>
          <h3 className="mt-1 font-display text-2xl font-semibold text-text-hi">
            Can the classical pipeline keep pace?
          </h3>
          <p className="mt-1 text-sm text-text-mid max-w-2xl">
            Detector rounds arrive at a fixed cadence. Workers process them at a declared aggregate rate. Throughput determines queue growth; decision latency and a feed-forward deadline are tracked separately.
          </p>
        </div>

        {/* Status Badge */}
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div
            role="status"
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xs font-bold ${
              keepsPace
                ? 'border-stabilizer/60 bg-stabilizer/10 text-stabilizer shadow-glow-green'
                : 'border-rose-500/60 bg-rose-500/10 text-rose-400 shadow-glow-rose'
            }`}
          >
            {keepsPace ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-stabilizer" />
                CAPACITY KEEPS PACE
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                QUEUE GROWS LINEARLY
              </>
            )}
          </div>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-b border-ink-700 py-3">
        <span className="font-mono text-xs text-text-low mr-2">Illustrative presets:</span>
        {DECODER_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => applyDecoderPreset(p)}
            aria-pressed={activePreset?.name === p.name}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              activePreset?.name === p.name
                ? 'border-rose-400 bg-rose-400/10 text-rose-300'
                : 'border-ink-700 bg-ink-900/40 text-text-mid hover:border-ink-600 hover:text-text-hi'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Sliders + Dashboard */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-5 lg:col-span-5 rounded-xl border border-ink-700 bg-ink-900/50 p-5">
          {/* Service interval slider */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs">
              <label htmlFor="service-interval-slider" className="text-text-mid flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                Service interval per worker:
              </label>
              <span className="font-semibold text-rose-400">
                {serviceUs >= 1.0 ? `${serviceUs.toFixed(2)} µs/round` : `${(serviceUs * 1000).toFixed(0)} ns/round`}
              </span>
            </div>
            <input
              id="service-interval-slider"
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={serviceUs}
              onChange={(e) => setServiceUs(parseFloat(e.target.value))}
              aria-valuetext={`${serviceUs.toFixed(1)} microseconds per round per worker`}
              className="mt-2.5 w-full accent-rose-400 cursor-pointer h-2 rounded-lg bg-ink-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
              <span>0.1 µs</span>
              <span>2.5 µs</span>
              <span>5.0 µs</span>
            </div>
          </div>

          {/* Detector-round arrival interval */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs">
              <label htmlFor="cycle-time-slider" className="text-text-mid flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-syndrome" />
                Detector-round arrival interval:
              </label>
              <span className="font-semibold text-syndrome">
                {cycleUs >= 1.0 ? `${cycleUs.toFixed(2)} µs/round` : `${(cycleUs * 1000).toFixed(0)} ns/round`}
              </span>
            </div>
            <input
              id="cycle-time-slider"
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={cycleUs}
              onChange={(e) => setCycleUs(parseFloat(e.target.value))}
              aria-valuetext={`${cycleUs.toFixed(1)} microseconds between arriving detector rounds`}
              className="mt-2.5 w-full accent-syndrome cursor-pointer h-2 rounded-lg bg-ink-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
              <span>0.2 µs</span>
              <span>2.5 µs</span>
              <span>5.0 µs</span>
            </div>
          </div>

          {/* Aggregate workers */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs">
              <label htmlFor="worker-slider" className="text-text-mid flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-magic" />
                Parallel service workers:
              </label>
              <span className="font-semibold text-magic">
                {workers}
              </span>
            </div>
            <input
              id="worker-slider"
              type="range"
              min="1"
              max="8"
              step="1"
              value={workers}
              onChange={(e) => setWorkers(parseInt(e.target.value))}
              aria-valuetext={`${workers} parallel ${workers === 1 ? 'worker' : 'workers'}`}
              className="mt-2.5 w-full accent-magic cursor-pointer h-2 rounded-lg bg-ink-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-text-low">
              <span>1 worker</span>
              <span>4 workers</span>
              <span>8 workers</span>
            </div>
          </div>

          {/* Latency and deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="decision-latency-input" className="block font-mono text-xs text-text-mid mb-1">
                Pipeline decision latency:
              </label>
              <input
                id="decision-latency-input"
                type="number"
                min="1"
                max="500"
                step="1"
                value={decisionUs}
                onChange={(e) => setDecisionUs(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-hi"
              />
              <p className="mt-1 font-mono text-[10px] text-text-low">µs, independent of throughput</p>
            </div>

            <div>
              <label htmlFor="deadline-input" className="block font-mono text-xs text-text-mid mb-1">
                Feed-forward deadline:
              </label>
              <input
                id="deadline-input"
                type="number"
                min="1"
                max="500"
                step="1"
                value={deadlineUs}
                onChange={(e) => setDeadlineUs(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-hi"
              />
              <p className="mt-1 font-mono text-[10px] text-text-low">µs before control must branch</p>
            </div>
          </div>

          <div>
            <label htmlFor="rounds-input" className="block font-mono text-xs text-text-mid mb-1">
              Observation window:
            </label>
            <select
              id="rounds-input"
              value={numRounds}
              onChange={(e) => setNumRounds(parseInt(e.target.value))}
              className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-hi"
            >
              <option value={1000}>1,000 arriving rounds</option>
              <option value={5000}>5,000 arriving rounds</option>
              <option value={10000}>10,000 arriving rounds</option>
              <option value={50000}>50,000 arriving rounds</option>
              <option value={100000}>100,000 arriving rounds</option>
            </select>
          </div>

          <div className="rounded-lg border border-ink-700 bg-ink-800/70 p-3 text-xs leading-relaxed text-text-mid">
            <p className="font-mono text-text-hi">Deterministic fluid-queue model</p>
            <p className="mt-1">
              It assumes evenly spaced arrivals and identical workers. It does not estimate decoder accuracy, physical-qubit coherence, burstiness, communication overhead, or a particular hardware implementation.
            </p>
          </div>

          {activePreset && (
            <p className="text-xs leading-relaxed text-text-low" aria-live="polite">
              {activePreset.desc}
            </p>
          )}
        </div>

        {/* Visual Dashboard Column */}
        <div className="space-y-6 lg:col-span-7 flex flex-col justify-between">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Capacity / arrivals
              </p>
              <p
                className={`mt-2 font-display text-2xl font-bold ${
                  keepsPace ? 'text-stabilizer' : 'text-rose-400'
                }`}
              >
                {capacityRatio.toFixed(2)}x
              </p>
              <p className="mt-1 text-[11px] text-text-mid">
                {serviceRate.toFixed(2)} served / {arrivalRate.toFixed(2)} arriving per µs
              </p>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Detector-round queue
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-rose-400">
                {backlogRounds.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-text-mid">undecoded rounds</p>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Queue drain delay
              </p>
              <p className="mt-2 font-mono text-lg font-bold text-magic">
                {queueDelayUs >= 1000
                  ? `${(queueDelayUs / 1000).toFixed(2)} ms`
                  : `${queueDelayUs.toFixed(1)} µs`}
              </p>
              <p className="mt-1 text-[11px] text-text-mid">to clear the terminal queue</p>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-low">
                Feed-forward path
              </p>
              <p
                className={`mt-2 font-mono text-lg font-bold ${
                  deadlineMet ? 'text-stabilizer' : 'text-rose-400'
                }`}
              >
                {feedForwardLatencyUs >= 1000
                  ? `${(feedForwardLatencyUs / 1000).toFixed(2)} ms`
                  : `${feedForwardLatencyUs.toFixed(1)} µs`}
              </p>
              <p className="mt-1 text-[11px] text-text-mid" role="status" aria-live="polite">
                {deadlineMet ? `within ${deadlineUs} µs deadline` : `misses ${deadlineUs} µs deadline`}
              </p>
            </div>
          </div>

          {/* Syndrome Backlog Graph SVG */}
          <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-text-mid flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" />
                Deterministic queue vs arriving rounds
              </h4>
              <span className="font-mono text-[11px] text-text-low">
                Rounds: 0 → {numRounds.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 relative bg-ink-950/80 rounded-lg p-3 border border-ink-800">
              <svg
                viewBox="0 0 320 160"
                className="w-full h-44"
                role="img"
                aria-label={`Queue chart: ${backlogRounds.toLocaleString()} of ${numRounds.toLocaleString()} arriving rounds remain after the observation window.`}
              >
                <line x1="30" y1="30" x2="290" y2="30" stroke="#2A3A5F" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="30" y1="85" x2="290" y2="85" stroke="#2A3A5F" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="30" y1="140" x2="290" y2="140" stroke="#2A3A5F" strokeWidth="1.5" />
                <line x1="30" y1="20" x2="30" y2="140" stroke="#2A3A5F" strokeWidth="1.5" />

                <text x="35" y="26" fill="#34D399" fontSize="9" fontFamily="monospace">
                  Stable baseline (0 queued)
                </text>

                {!keepsPace && (
                  <polygon
                    points={`30,140 ${generateQueueGraphPoints()} 290,140`}
                    fill="url(#roseGradient)"
                    opacity="0.35"
                  />
                )}

                <polyline
                  fill="none"
                  stroke={keepsPace ? '#34D399' : '#FB7185'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={generateQueueGraphPoints()}
                />

                <defs>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FB7185" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <text x="160" y="156" textAnchor="middle" fill="#7B89A7" fontSize="10" fontFamily="monospace">
                  Arriving Detector Rounds →
                </text>
                <text x="12" y="85" textAnchor="middle" fill="#7B89A7" fontSize="10" fontFamily="monospace" transform="rotate(-90 12 85)">
                  Queue Backlog (Q)
                </text>
              </svg>

              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-ink-700 bg-ink-900/90 p-3 text-xs leading-relaxed text-text-mid">
                {keepsPace ? (
                  <p className="text-stabilizer font-mono">
                    ✓ Aggregate service capacity ({serviceRate.toFixed(2)} rounds/µs) meets the arrival rate ({arrivalRate.toFixed(2)} rounds/µs), so this idealized queue stays empty. The separate {decisionUs} µs pipeline latency {deadlineMet ? 'meets' : 'misses'} the {deadlineUs} µs feed-forward deadline.
                  </p>
                ) : (
                  <p className="text-rose-300 font-mono">
                    ⚠ Arrivals exceed aggregate service capacity. After {numRounds.toLocaleString()} arrivals, {backlogRounds.toLocaleString()} rounds remain (never more than arrived); with a steady rate deficit, the queue grows approximately linearly. The terminal queue would take about {queueDelayUs.toFixed(1)} µs to drain.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-plaquette/30 bg-plaquette/5 p-4 text-sm leading-relaxed text-text-mid">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-plaquette">
              Throughput is not latency
            </p>
            <p className="mt-2">
              Google reported about 63 µs average decoder latency while sustaining a 1.1 µs cycle stream: many rounds can be in a pipeline at once. Pauli-frame updates can often wait; a control branch that needs feed-forward cannot outlive its deadline.
            </p>
          </div>
        </div>
      </div>
    </div>
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
  interactiveWidget?: ReactNode;
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

      {block.interactiveWidget && (
        <Reveal delay={0.35} className="relative mx-auto max-w-6xl px-6 pt-12 md:px-8">
          {block.interactiveWidget}
        </Reveal>
      )}
    </section>
  );
}

/* --------------------------- jargon strip (pinned) --------------------------- */

const JARGON = [
  {
    term: 'magic state',
    color: '#F5B83D',
    def: 'a prepared resource consumed to enact a non-Clifford gate such as T',
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
  const reduce = useReducedMotion();
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
              animate={reduce ? undefined : {
                boxShadow: [
                  '0 0 0 rgba(34,211,238,0)',
                  '0 0 24px rgba(34,211,238,0.25)',
                  '0 0 0 rgba(34,211,238,0)',
                ],
              }}
              transition={reduce ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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
  useDocumentTitle('Research Frontier & Hardware Roadmaps');
  const blocks: FrontierBlockData[] = [
    {
      id: 'magic-states',
      num: '01',
      accent: '#F5B83D',
      eyebrow: 'THE BOTTLENECK',
      title: 'Growing T gates in a Clifford world.',
      body: "Surface-code schemes commonly enact T by consuming a prepared |A⟩ = T|+⟩ resource in a Clifford-and-measurement gadget. Distillation postselects cleaner outputs from noisy inputs; cultivation instead injects into a small color code, checks and grows it with postselection, then escapes into a larger matchable code. Published savings are model- and target-regime-specific, and escape errors, rejection, routing, and logical circuitry remain part of the cost.",
      keyPoints: [
        'why this surface-code scheme injects a non-Clifford resource',
        'distillation laws versus complete factory cost',
        'cultivation: inject → check/grow/postselect → escape',
      ],
      links: (
        <>
          <TopicChip id="magic-state-cultivation" accent="#F5B83D" />
          <CrossLinkChip kind="paper" id="1812.01238" label="Efficient magic state factories…" accent="#F5B83D" />
        </>
      ),
      vignette: <MagicVignette />,
      interactiveWidget: <MagicStateCalculatorWidget />,
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
      interactiveWidget: (
        <div className="flex flex-col gap-8">
          <SpacetimeBraidWeaver />
          <TopoLSCompiler />
        </div>
      ),
    },
    {
      id: 'simulation',
      num: '03',
      accent: '#22D3EE',
      eyebrow: 'TRUST BUT VERIFY',
      title: 'Testing the model before hardware.',
      body: 'Stabilizer simulators efficiently handle declared Clifford circuits, preparations, measurements, and noise. Hybrid methods can carry a Clifford frame while representing a smaller non-Clifford residue. Some implementations sample exact trajectories for the circuit and model they represent; runtime remains structure-dependent, finite sampling remains, and model agreement is not hardware certification.',
      keyPoints: [
        'stabilizer simulation vs statevector limits',
        'Clifford-frame + factorization trick',
        'model validation versus hardware certification',
      ],
      links: <TopicChip id="clifford-simulation-hybrid" accent="#22D3EE" />,
      vignette: <SimVignette />,
    },
    {
      id: 'decoding',
      num: '04',
      accent: '#FB7185',
      eyebrow: 'THE CLOCK',
      title: 'Decoding at the speed of the stream.',
      body: "A decoder that runs in post-processing can validate an experiment; a fault-tolerant computer needs a sustained streaming service. If detector rounds arrive faster than aggregate service, a fixed rate deficit makes the queue grow approximately linearly. Latency is separate: Google reported about 63 µs average decoder latency while sustaining a 1.1 µs cycle stream through pipelining. Pauli frames can often wait, while declared feed-forward branches have deadlines. In proved flag circuits, extra ancilla outcomes help distinguish a designed class of dangerous propagated faults; a flag is not a universal fault sensor.",
      keyPoints: [
        'aggregate throughput controls queue growth',
        'pipeline latency and feed-forward deadlines are separate',
        'streaming, windowed, and hierarchical decoder architectures',
        'flags: circuit-specific evidence for designed fault classes',
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
      interactiveWidget: <DecoderLatencySimulatorWidget />,
    },
    {
      id: 'experiments',
      num: '05',
      accent: '#34D399',
      eyebrow: 'THE HARDWARE',
      title: 'Error correction that compounds.',
      body: "Google's 2024 Willow memory experiment showed lower error per cycle at distance 7 than 5, and at 5 than 3, for its tested memories and decoders. It reported Λ = ε(d)/ε(d+2) = 2.14 ± 0.02, so Λ > 1 means suppression in this convention. A separate 2.4 ± 0.3 result compared logical-memory lifetime with the best constituent physical qubit. Neither metric alone demonstrates universal logical gates or fixes one machine-size roadmap.",
      keyPoints: [
        'Λ: error suppression per +2 distance in the declared memory test',
        'suppression factor and lifetime advantage are different metrics',
        'resource needs depend on algorithm, architecture, and error budget',
      ],
      links: (
        <>
          <TopicChip id="below-threshold-experiments" accent="#34D399" />
          <CrossLinkChip kind="paper" id="2207.06431" label="Suppressing quantum errors by scaling… (2022)" accent="#34D399" />
          <CrossLinkChip kind="paper" id="2408.13687" label="QEC below the surface code threshold (2024)" accent="#34D399" />
        </>
      ),
      vignette: <ExperimentVignette />,
      interactiveWidget: <RealQuantumEndpoint />,
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

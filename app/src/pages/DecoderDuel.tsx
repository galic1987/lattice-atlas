import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Flag, Play, RotateCcw, Share2, Swords } from 'lucide-react';
import {
  DAILY_PLAN,
  POINTS,
  OUTCOME_EMOJI,
  dayNumber,
  generateRound,
  judge,
  loadDuelRecord,
  mulberry32,
  practicePlan,
  saveDuelRecord,
  shareText,
  type DuelRound,
  type Judgment,
  type RoundOutcome,
} from '@/lib/duel';
import { computeSyndrome, type Lattice, type Pauli, type Stabilizer } from '@/lib/surfaceCode';

const EASE = [0.22, 1, 0.36, 1] as const;
const X_COLOR = '#8B5CF6';
const Z_COLOR = '#22D3EE';
const SYNDROME = '#FB7185';
const OK = '#34D399';
const CELL = 58;
const PAD = 46;

/* ---------------- lattice rendering (independent of the Lab page) ---------------- */

const qPoint = (d: number, q: number) => ({ x: PAD + (q % d) * CELL, y: PAD + Math.floor(q / d) * CELL });
const fCenter = (s: Stabilizer) => ({ x: PAD + (s.fc - 0.5) * CELL, y: PAD + (s.fr - 0.5) * CELL });

function facePath(lat: Lattice, s: Stabilizer): string {
  const pts = s.qubits.map((q) => qPoint(lat.d, q));
  if (!s.boundary) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[3].x} ${pts[3].y} L ${pts[2].x} ${pts[2].y} Z`;
  }
  const sweep = s.fr === 0 || s.fc === lat.d ? 1 : 0;
  return `M ${pts[0].x} ${pts[0].y} A ${CELL / 2} ${CELL / 2} 0 0 ${sweep} ${pts[1].x} ${pts[1].y} Z`;
}

function DuelLattice({
  round,
  guess,
  revealed,
  onQubitClick,
}: {
  round: DuelRound;
  guess: Pauli[];
  revealed: boolean;
  onQubitClick: (q: number) => void;
}) {
  const reduce = useReducedMotion();
  const { lat } = round;
  const size = (lat.d - 1) * CELL + 2 * PAD;
  // The live view: syndrome of hidden ⊕ guess — defects move as you paint.
  const liveSyndrome = useMemo(() => {
    const residual = round.hidden.map((e, q) => (e ^ guess[q]) as Pauli);
    return computeSyndrome(lat, residual);
  }, [round, guess, lat]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img" aria-label={`Distance-${lat.d} duel lattice`}>
      {lat.stabilizers.map((s) => {
        const hot = liveSyndrome.has(s.id);
        const base = s.type === 'X' ? X_COLOR : Z_COLOR;
        return (
          <g key={s.id}>
            <path
              d={facePath(lat, s)}
              fill={hot ? SYNDROME : base}
              fillOpacity={hot ? 0.42 : 0.11}
              stroke={hot ? SYNDROME : base}
              strokeOpacity={hot ? 0.9 : 0.28}
              strokeWidth={hot ? 1.5 : 1}
              className={hot && !reduce ? 'animate-pulse' : undefined}
            />
            <text
              x={fCenter(s).x}
              y={fCenter(s).y + 3.5}
              textAnchor="middle"
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
              fill={hot ? SYNDROME : base}
              fillOpacity={hot ? 1 : 0.5}
            >
              {s.type}
            </text>
          </g>
        );
      })}
      {guess.map((g, q) => {
        const { x, y } = qPoint(lat.d, q);
        const hidden = round.hidden[q];
        return (
          <g key={q} onClick={() => onQubitClick(q)} className="cursor-pointer">
            {revealed && hidden !== 0 && (
              <circle cx={x} cy={y} r={15} fill="none" stroke={SYNDROME} strokeWidth={2} strokeDasharray="3 3" />
            )}
            <circle
              cx={x}
              cy={y}
              r={10}
              fill={g === 0 ? '#1B2743' : g === 1 ? X_COLOR : Z_COLOR}
              stroke={g === 0 ? '#3D5178' : OK}
              strokeWidth={g === 0 ? 1.5 : 2}
              className="transition-[fill,stroke] duration-150 hover:stroke-[#EAF0FB]"
            />
            {(g !== 0 || (revealed && hidden !== 0)) && (
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fontFamily="'JetBrains Mono', monospace"
                fill={g !== 0 ? '#05080F' : SYNDROME}
                pointerEvents="none"
              >
                {g !== 0 ? (g === 1 ? 'X' : 'Z') : hidden === 1 ? 'x' : hidden === 2 ? 'z' : ''}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- page ---------------- */

type Mode = 'daily' | 'practice';
type Phase = 'menu' | 'play' | 'post' | 'end';

export default function DecoderDuel() {
  const day = dayNumber();
  const [record, setRecord] = useState(loadDuelRecord);
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('menu');
  const [roundIdx, setRoundIdx] = useState(0);
  const [seedTick, setSeedTick] = useState(0); // varies practice runs
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [outcomes, setOutcomes] = useState<RoundOutcome[]>([]);
  const [guess, setGuess] = useState<Pauli[]>([]);
  const [brush, setBrush] = useState<1 | 2>(1);
  const [verdict, setVerdict] = useState<Judgment | null>(null);
  const [copied, setCopied] = useState(false);

  const dailyPlayed = record.daily[day] !== undefined;

  const round = useMemo(() => {
    if (phase === 'menu') return null;
    const plan = mode === 'daily' ? DAILY_PLAN[roundIdx] : practicePlan(roundIdx);
    const seed = mode === 'daily' ? day * 7919 + roundIdx * 104729 : (day + seedTick) * 31 + roundIdx * 977 + 13;
    return generateRound(plan, mulberry32(seed));
  }, [phase, mode, roundIdx, day, seedTick]);

  const defectsLeft = useMemo(() => {
    if (!round) return 0;
    const residual = round.hidden.map((e, q) => (e ^ guess[q]) as Pauli);
    return computeSyndrome(round.lat, residual).size;
  }, [round, guess]);

  const start = (m: Mode) => {
    setMode(m);
    setPhase('play');
    setRoundIdx(0);
    setScore(0);
    setLives(3);
    setOutcomes([]);
    setVerdict(null);
    setCopied(false);
    if (m === 'practice') setSeedTick((t) => t + 1);
    setGuess(new Array<Pauli>((m === 'daily' ? DAILY_PLAN[0] : practicePlan(0)).d ** 2).fill(0));
  };

  const paint = (q: number) => {
    if (phase !== 'play') return;
    setGuess((prev) => {
      const next = [...prev];
      next[q] = (next[q] ^ brush) as Pauli;
      return next;
    });
  };

  const finishRun = (finalOutcomes: RoundOutcome[], finalScore: number) => {
    setPhase('end');
    const next = { ...record, daily: { ...record.daily } };
    if (mode === 'daily') {
      next.daily[day] = { score: finalScore, outcomes: finalOutcomes };
    } else if (!next.bestPractice || finalScore > next.bestPractice.score) {
      next.bestPractice = { score: finalScore, rounds: finalOutcomes.length };
    }
    setRecord(next);
    saveDuelRecord(next);
  };

  const settle = (j: Judgment) => {
    const newOutcomes = [...outcomes, j.outcome];
    const newScore = score + j.points;
    const newLives = j.outcome === 'fail' ? lives - 1 : lives;
    setVerdict(j);
    setOutcomes(newOutcomes);
    setScore(newScore);
    setLives(newLives);
    setPhase('post');
    const dailyOver = mode === 'daily' && newOutcomes.length >= DAILY_PLAN.length;
    const practiceOver = mode === 'practice' && newLives <= 0;
    if (dailyOver || practiceOver) {
      // show post-mortem first; End screen reached via the Next button.
      return;
    }
  };

  const submit = () => {
    if (!round || defectsLeft > 0) return;
    settle(judge(round, guess));
  };

  const forfeit = () => {
    if (!round) return;
    settle({ outcome: 'fail', cleared: false, logicalX: false, logicalZ: false, guessWeight: 0, points: 0 });
  };

  const nextRound = () => {
    const dailyOver = mode === 'daily' && outcomes.length >= DAILY_PLAN.length;
    const practiceOver = mode === 'practice' && lives <= 0;
    if (dailyOver || practiceOver) {
      finishRun(outcomes, score);
      return;
    }
    const idx = roundIdx + 1;
    setRoundIdx(idx);
    setVerdict(null);
    setPhase('play');
    const plan = mode === 'daily' ? DAILY_PLAN[idx] : practicePlan(idx);
    setGuess(new Array<Pauli>(plan.d ** 2).fill(0));
  };

  const share = async () => {
    const text = shareText(day, outcomes, score);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.share?.({ text });
      } catch {
        /* user cancelled */
      }
    }
  };

  const maxDaily = DAILY_PLAN.length * POINTS.clean;

  return (
    <div className="bg-ink-900">
      <header className="lattice-bg">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-16 md:px-8">
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [...EASE] }} className="eyebrow !text-syndrome">
            {'// THE GAME'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [...EASE] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Decoder Duel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [...EASE] }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-text-mid"
          >
            You are the decoder. Errors struck the lattice — you see only the
            syndrome they left behind. Paint a correction that clears every
            detector without crossing the lattice, and match the real decoder&apos;s
            efficiency for full points. Every verdict is computed by the same
            verified engine as the Lab.
          </motion.p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        {phase === 'menu' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-6">
              <p className="eyebrow !text-magic">{'// DAILY DUEL'}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text-hi">Puzzle #{day}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">
                Ten rounds, d=3 → d=7, identical for every player today. One
                official attempt — make it count, then share your line.
              </p>
              {dailyPlayed ? (
                <div className="mt-4 rounded-lg border border-ink-700 bg-ink-850 p-4">
                  <p className="font-mono text-[12px] text-text-low">your result today</p>
                  <p className="mt-1 text-xl">{record.daily[day].outcomes.map((o) => OUTCOME_EMOJI[o]).join('')}</p>
                  <p className="mt-1 font-mono text-[13px] text-text-hi">
                    {record.daily[day].score}/{maxDaily}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const text = shareText(day, record.daily[day].outcomes, record.daily[day].score);
                      try {
                        await navigator.clipboard.writeText(text);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                      } catch {
                        try {
                          await navigator.share?.({ text });
                        } catch {
                          /* cancelled */
                        }
                      }
                    }}
                    className="btn-secondary mt-3"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Share result'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => start('daily')} className="btn-primary mt-4">
                  <Swords className="h-4 w-4" /> Play today&apos;s duel
                </button>
              )}
            </div>
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-6">
              <p className="eyebrow">{'// PRACTICE'}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text-hi">Endless mode</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">
                Random rounds that keep ramping. Three lives. High score saved
                on this device.
              </p>
              {record.bestPractice && (
                <p className="mt-3 font-mono text-[13px] text-magic">
                  best: {record.bestPractice.score} pts · {record.bestPractice.rounds} rounds
                </p>
              )}
              <button type="button" onClick={() => start('practice')} className="btn-secondary mt-4">
                <Play className="h-4 w-4" /> Start practice
              </button>
            </div>
            <div className="rounded-lg border border-ink-700 bg-ink-850 p-4 md:col-span-2">
              <p className="font-mono text-[12px] leading-relaxed text-text-low">
                scoring: 🟩 clean solve (≤ decoder&apos;s weight) {POINTS.clean} pts · 🟨 solved
                but heavier {POINTS.heavy} pts · 🟥 logical error or forfeit 0 pts. Learn the
                moves in the <Link to="/lab" className="text-plaquette hover:underline">Lab</Link>{' '}
                and the <Link to="/map?topic=decoding-mwpm" className="text-plaquette hover:underline">decoding topic</Link>.
              </p>
            </div>
          </div>
        )}

        {phase !== 'menu' && round && (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="rounded-xl border border-ink-600 bg-ink-850 p-4 md:p-6">
              <DuelLattice round={round} guess={guess} revealed={phase !== 'play'} onQubitClick={paint} />
            </div>
            <aside className="flex flex-col gap-5">
              <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
                <div className="flex items-baseline justify-between">
                  <p className="eyebrow !mb-0">
                    {mode === 'daily' ? `ROUND ${outcomes.length + (phase === 'post' ? 0 : 1)}/${DAILY_PLAN.length}` : `ROUND ${roundIdx + 1}`}
                  </p>
                  <p className="font-mono text-[13px] text-text-hi">{score} pts</p>
                </div>
                <p className="mt-2 font-mono text-[12px] text-text-mid">
                  d={round.plan.d} · {round.plan.errors} hidden error{round.plan.errors === 1 ? '' : 's'}
                  {round.plan.allowZ ? ' (X and Z)' : ' (X only)'}
                </p>
                {mode === 'practice' && (
                  <p className="mt-1 font-mono text-[12px] text-syndrome">{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</p>
                )}
                <p className="mt-2 text-lg">{outcomes.map((o) => OUTCOME_EMOJI[o]).join('')}</p>
              </div>

              {phase === 'play' && (
                <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
                  <p className="eyebrow mb-3">{'// YOUR CORRECTION'}</p>
                  <div className="flex gap-2">
                    {([1, 2] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBrush(b)}
                        aria-pressed={brush === b}
                        className="flex-1 rounded-lg border px-3 py-2 font-mono text-sm font-bold transition-all"
                        style={
                          brush === b
                            ? { borderColor: b === 1 ? X_COLOR : Z_COLOR, backgroundColor: `${b === 1 ? X_COLOR : Z_COLOR}24`, color: b === 1 ? X_COLOR : Z_COLOR }
                            : { borderColor: 'var(--ink-600)', color: 'var(--text-mid)' }
                        }
                      >
                        {b === 1 ? 'X' : 'Z'}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 font-mono text-[12px] text-text-mid">
                    <span className={defectsLeft > 0 ? 'text-syndrome' : 'text-stabilizer'}>
                      {defectsLeft} detector{defectsLeft === 1 ? '' : 's'} still firing
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={defectsLeft > 0}
                    className="btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Submit correction
                  </button>
                  <button type="button" onClick={forfeit} className="btn-ghost mt-2 w-full text-[13px]">
                    <Flag className="h-3.5 w-3.5" /> Forfeit round
                  </button>
                </div>
              )}

              <AnimatePresence>
                {phase === 'post' && verdict && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [...EASE] }}
                    className={`rounded-xl border p-5 ${
                      verdict.outcome === 'fail' ? 'border-syndrome/50 bg-syndrome/[0.07]' : 'border-stabilizer/50 bg-stabilizer/[0.07]'
                    }`}
                  >
                    <p className={`font-mono text-[12px] font-semibold uppercase tracking-wider ${verdict.outcome === 'fail' ? 'text-syndrome' : 'text-stabilizer'}`}>
                      {OUTCOME_EMOJI[verdict.outcome]}{' '}
                      {verdict.outcome === 'clean' ? 'clean solve' : verdict.outcome === 'heavy' ? 'solved — heavier than par' : verdict.cleared ? 'logical error' : 'forfeited'}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-text-mid">
                      {verdict.outcome === 'fail' && verdict.cleared
                        ? `Your correction cleared the syndrome but crossed the lattice — a logical ${[verdict.logicalX ? 'X' : '', verdict.logicalZ ? 'Z' : ''].filter(Boolean).join(' and ')} flip.`
                        : verdict.outcome === 'fail'
                          ? 'The hidden errors are now revealed (dashed rings).'
                          : `Your weight: ${verdict.guessWeight} · decoder's par: ${round.parWeight}.`}{' '}
                      Dashed rings show the true errors.
                      {!round.decoderSucceeds && ' (This round even fools the matching decoder.)'}
                    </p>
                    <p className="mt-2 font-mono text-[12px] text-text-hi">+{verdict.points} pts</p>
                    <button type="button" onClick={nextRound} className="btn-primary mt-3 w-full">
                      {(mode === 'daily' && outcomes.length >= DAILY_PLAN.length) || (mode === 'practice' && lives <= 0) ? 'See final score' : 'Next round'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </aside>
          </div>
        )}

        {phase === 'end' && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [...EASE] }}
            className="mx-auto max-w-lg rounded-xl border border-ink-600 bg-ink-850 p-8 text-center"
          >
            <p className="eyebrow !text-magic">{'// FINAL SCORE'}</p>
            <p className="mt-4 font-display text-5xl font-bold text-text-hi">{score}</p>
            <p className="mt-1 font-mono text-[12px] text-text-low">
              {mode === 'daily' ? `of ${maxDaily} · Daily #${day}` : `${outcomes.length} rounds survived`}
            </p>
            <p className="mt-4 text-2xl tracking-wider">{outcomes.map((o) => OUTCOME_EMOJI[o]).join('')}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {mode === 'daily' && (
                <button type="button" onClick={share} className="btn-primary">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied to clipboard' : 'Share your line'}
                </button>
              )}
              <button type="button" onClick={() => setPhase('menu')} className="btn-secondary">
                <RotateCcw className="h-4 w-4" /> Back to menu
              </button>
            </div>
            {mode === 'daily' && (
              <p className="mt-4 font-mono text-[11px] text-text-low">
                everyone plays the same seeded puzzle today — scores are comparable
              </p>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}

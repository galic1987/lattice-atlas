import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Check,
  Copy,
  Eraser,
  Flag,
  Lightbulb,
  Play,
  RotateCcw,
  Share2,
  Swords,
  Undo2,
} from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useProgress } from '@/store/progress';
import {
  DAILY_PLAN,
  DAILY_MAX_SCORE,
  POINTS,
  OUTCOME_EMOJI,
  currentDailyResult,
  dailyChallengeUrl,
  dailyPuzzleId,
  dailyRoundSeed,
  dayNumber,
  generateRound,
  judge,
  loadDuelRecord,
  makeDailyResult,
  mulberry32,
  parseDailyPuzzleId,
  practicePlan,
  practiceShareText,
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
const Y_COLOR = '#F5B83D';
const CELL = 58;
const PAD = 46;
const PAULI_NAME = ['none', 'X', 'Z', 'Y'] as const;

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
  hintQubit,
  onQubitClick,
}: {
  round: DuelRound;
  guess: Pauli[];
  revealed: boolean;
  hintQubit: number | null;
  onQubitClick: (q: number) => void;
}) {
  const reduce = useReducedMotion();
  const gridId = useId().replace(/:/g, '');
  const [focusQubit, setFocusQubit] = useState(0);
  const { lat } = round;
  const size = (lat.d - 1) * CELL + 2 * PAD;
  // The live view: syndrome of hidden ⊕ guess — defects move as you paint.
  const liveSyndrome = useMemo(() => {
    const residual = round.hidden.map((e, q) => (e ^ guess[q]) as Pauli);
    return computeSyndrome(lat, residual);
  }, [round, guess, lat]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={lat.d >= 7 ? 'w-full min-w-[440px]' : 'w-full'} role="group" aria-label={`Interactive distance-${lat.d} duel lattice`}>
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
          <g
            key={q}
            id={`${gridId}-q-${q}`}
            role="button"
            tabIndex={revealed ? -1 : focusQubit === q ? 0 : -1}
            aria-disabled={revealed}
            aria-label={`Qubit ${q + 1}, painted ${PAULI_NAME[g]}${hintQubit === q ? ', practice hint location' : ''}`}
            onClick={() => onQubitClick(q)}
            onFocus={() => setFocusQubit(q)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onQubitClick(q);
                return;
              }
              const row = Math.floor(q / lat.d);
              const col = q % lat.d;
              let next = q;
              if (event.key === 'ArrowLeft') next = row * lat.d + Math.max(0, col - 1);
              else if (event.key === 'ArrowRight') next = row * lat.d + Math.min(lat.d - 1, col + 1);
              else if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * lat.d + col;
              else if (event.key === 'ArrowDown') next = Math.min(lat.d - 1, row + 1) * lat.d + col;
              else if (event.key === 'Home') next = row * lat.d;
              else if (event.key === 'End') next = row * lat.d + lat.d - 1;
              else return;
              event.preventDefault();
              setFocusQubit(next);
              window.requestAnimationFrame(() => document.getElementById(`${gridId}-q-${next}`)?.focus());
            }}
            className={`group outline-none ${revealed ? '' : 'cursor-pointer'}`}
          >
            <circle cx={x} cy={y} r={21} fill="transparent" />
            {hintQubit === q && !revealed && (
              <circle
                cx={x}
                cy={y}
                r={17}
                fill="none"
                stroke={Y_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
                className={reduce ? undefined : 'animate-pulse'}
                pointerEvents="none"
              />
            )}
            {revealed && hidden !== 0 && (
              <circle cx={x} cy={y} r={15} fill="none" stroke={SYNDROME} strokeWidth={2} strokeDasharray="3 3" />
            )}
            <circle
              cx={x}
              cy={y}
              r={10}
              fill={g === 0 ? '#1B2743' : g === 1 ? X_COLOR : g === 2 ? Z_COLOR : Y_COLOR}
              stroke={g === 0 ? '#3D5178' : OK}
              strokeWidth={g === 0 ? 1.5 : 2}
              className="transition-[fill,stroke] duration-150 group-hover:stroke-[#EAF0FB] group-focus-visible:stroke-[#EAF0FB] group-focus-visible:stroke-[3px]"
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
                {g !== 0 ? PAULI_NAME[g] : hidden === 1 ? 'x' : hidden === 2 ? 'z' : hidden === 3 ? 'y' : ''}
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

function patternSummary(pattern: Pauli[], d: number): string {
  const entries = pattern.flatMap((pauli, index) => {
    if (pauli === 0) return [];
    const row = Math.floor(index / d) + 1;
    const col = (index % d) + 1;
    return [`${PAULI_NAME[pauli]}@r${row}c${col}`];
  });
  if (entries.length === 0) return 'identity (weight 0)';
  const shown = entries.slice(0, 7).join(', ');
  return `weight ${entries.length}: ${shown}${entries.length > 7 ? `, +${entries.length - 7} more` : ''}`;
}

function DuelFieldGuide({ compact = false, onDone }: { compact?: boolean; onDone: () => void }) {
  return (
    <section
      aria-labelledby={compact ? 'duel-coach-title' : 'duel-guide-title'}
      className="rounded-xl border border-magic/45 bg-magic/[0.06] p-5"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-magic/15 p-2 text-magic" aria-hidden="true">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <p className="eyebrow !mb-0 !text-magic">{compact ? '// FIRST-ROUND COACH' : '// 60-SECOND FIELD GUIDE'}</p>
          <h2
            id={compact ? 'duel-coach-title' : 'duel-guide-title'}
            className={`${compact ? 'mt-1 text-lg' : 'mt-2 text-xl'} font-display font-semibold text-text-hi`}
          >
            The glowing faces are clues, not error locations
          </h2>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? '' : 'sm:grid-cols-3'}`}>
        <div className="rounded-lg border border-ink-600 bg-ink-900/65 p-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded border border-star/60 bg-star/15 px-2 py-1 font-bold text-star">X brush</span>
            <span className="text-text-low" aria-hidden="true">→</span>
            <span className="text-plaquette">toggles adjacent Z checks</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-text-low">Use X when you need to change the parity reported by nearby Z-type faces.</p>
        </div>
        <div className="rounded-lg border border-ink-600 bg-ink-900/65 p-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded border border-plaquette/60 bg-plaquette/15 px-2 py-1 font-bold text-plaquette">Z brush</span>
            <span className="text-text-low" aria-hidden="true">→</span>
            <span className="text-star">toggles adjacent X checks</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-text-low">Use Z when you need to change the parity reported by nearby X-type faces.</p>
        </div>
        <div className="rounded-lg border border-ink-600 bg-ink-900/65 p-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="rounded border border-magic/60 bg-magic/15 px-2 py-1 font-bold text-magic">X ⊕ Z = Y</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-text-low">In this phase-ignored Pauli-frame view, painting both toggles both check types; applying the same brush again removes that component.</p>
        </div>
      </div>

      <ol className="mt-4 grid gap-2 text-sm leading-6 text-text-mid">
        <li><span className="mr-2 font-mono text-magic">1.</span>Choose a brush, then click or press Enter/Space on a data qubit.</li>
        <li><span className="mr-2 font-mono text-magic">2.</span>Watch the rose detectors update. One detector does not identify one unique bad qubit; reason about a whole correction path.</li>
        <li><span className="mr-2 font-mono text-magic">3.</span>Zero firing detectors unlocks Submit—but only the hidden logical test can tell whether the cleared path was harmless.</li>
      </ol>
      <p className="mt-3 border-l-2 border-syndrome/60 pl-3 text-xs leading-5 text-text-low">
        Physical invariant: the game judges <span className="font-mono text-text-mid">hidden error ⊕ your correction</span>. A silent syndrome is necessary, not sufficient: a residual logical path can be invisible to every local check.
      </p>
      <button type="button" onClick={onDone} className="btn-secondary mt-4 w-full sm:w-auto">
        <Check className="h-4 w-4" /> Got it — let me decode
      </button>
    </section>
  );
}

function DuelResultCard({
  mode,
  score,
  outcomes,
  day,
}: {
  mode: Mode;
  score: number;
  outcomes: RoundOutcome[];
  day: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-plaquette/45 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_48%),linear-gradient(145deg,#111B31,#080D19)] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-plaquette">Lattice Atlas</p>
          <p className="mt-1 font-display text-xl font-semibold text-text-hi">Decoder Duel</p>
        </div>
        <span className="rounded-full border border-ink-500 bg-ink-900/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-mid">
          {mode === 'daily' ? 'Daily challenge' : 'Endless practice'}
        </span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl font-bold text-text-hi">{score}</p>
          <p className="font-mono text-[11px] text-text-low">
            {mode === 'daily' ? `of ${DAILY_MAX_SCORE} points` : `${outcomes.length} round${outcomes.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <p className="max-w-[58%] break-words text-right text-xl leading-relaxed tracking-wider" aria-label={outcomes.join(', ')}>
          {outcomes.map((outcome) => OUTCOME_EMOJI[outcome]).join('')}
        </p>
      </div>
      {mode === 'daily' && (
        <p className="mt-5 break-all border-t border-ink-600 pt-3 font-mono text-[10px] text-text-low">
          {dailyPuzzleId(day)} · compare only matching ids
        </p>
      )}
      <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-text-low">
        Local browser result · unverified
      </p>
    </div>
  );
}

export default function DecoderDuel() {
  useDocumentTitle('Decoder Duel');
  const reduce = useReducedMotion();
  const { evidenceFor, recordEvidence } = useProgress();
  const [searchParams] = useSearchParams();
  const requestedChallengeId = searchParams.get('challenge');
  const compatibleChallengeDay = parseDailyPuzzleId(requestedChallengeId);
  const [today] = useState(dayNumber);
  const day = compatibleChallengeDay ?? today;
  const [record, setRecord] = useState(loadDuelRecord);
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('menu');
  const [roundIdx, setRoundIdx] = useState(0);
  const [seedTick, setSeedTick] = useState(0); // varies practice runs
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [outcomes, setOutcomes] = useState<RoundOutcome[]>([]);
  const [guess, setGuess] = useState<Pauli[]>([]);
  const [guessHistory, setGuessHistory] = useState<Pauli[][]>([]);
  const [brush, setBrush] = useState<1 | 2>(1);
  const [verdict, setVerdict] = useState<Judgment | null>(null);
  const [guideOpen, setGuideOpen] = useState(() => !record.guideSeen);
  const [hintQubit, setHintQubit] = useState<number | null>(null);
  const [hintMessage, setHintMessage] = useState('');
  const [usedHintThisRound, setUsedHintThisRound] = useState(false);
  const [copied, setCopied] = useState(false);
  const finalizedRun = useRef(false);
  const practiceRunId = useRef('');
  const verdictRef = useRef<HTMLDivElement>(null);

  const dailyResult = currentDailyResult(record, day);
  const ledgerDailyResult = evidenceFor('duel-result')
    .filter((entry) => entry.mode === 'daily' && entry.compatible === true && entry.puzzleId === dailyPuzzleId(day))
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))[0];
  const dailyPlayed = dailyResult !== undefined || ledgerDailyResult !== undefined;
  const challengeUrl = useMemo(() => {
    const base = new URL(`${import.meta.env.BASE_URL}duel`, window.location.origin).toString();
    return dailyChallengeUrl(day, base);
  }, [day]);

  const previousDay = useRef(day);
  useEffect(() => {
    if (previousDay.current === day) return;
    previousDay.current = day;
    finalizedRun.current = false;
    setPhase('menu');
    setRoundIdx(0);
    setScore(0);
    setLives(3);
    setOutcomes([]);
    setVerdict(null);
    setGuess([]);
    setGuessHistory([]);
    setHintQubit(null);
    setHintMessage('');
  }, [day]);

  useEffect(() => {
    if (phase !== 'post') return;
    const frame = window.requestAnimationFrame(() => verdictRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [phase, verdict]);

  const round = useMemo(() => {
    if (phase === 'menu') return null;
    const plan = mode === 'daily' ? DAILY_PLAN[roundIdx] : practicePlan(roundIdx);
    const seed = mode === 'daily'
      ? dailyRoundSeed(day, roundIdx)
      : (day + seedTick) * 31 + roundIdx * 977 + 13;
    return generateRound(plan, mulberry32(seed));
  }, [phase, mode, roundIdx, day, seedTick]);

  const defectsLeft = useMemo(() => {
    if (!round) return 0;
    const residual = round.hidden.map((e, q) => (e ^ guess[q]) as Pauli);
    return computeSyndrome(round.lat, residual).size;
  }, [round, guess]);

  const residual = useMemo(() => {
    if (!round) return [] as Pauli[];
    return round.hidden.map((error, qubit) => (error ^ guess[qubit]) as Pauli);
  }, [round, guess]);

  const start = (m: Mode) => {
    finalizedRun.current = false;
    setMode(m);
    setPhase('play');
    setRoundIdx(0);
    setScore(0);
    setLives(3);
    setOutcomes([]);
    setVerdict(null);
    setGuessHistory([]);
    setHintQubit(null);
    setHintMessage('');
    setCopied(false);
    if (m === 'practice') {
      const suffix = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      practiceRunId.current = `practice-${day}-${suffix}`;
      setSeedTick((t) => t + 1);
    }
    setGuess(new Array<Pauli>((m === 'daily' ? DAILY_PLAN[0] : practicePlan(0)).d ** 2).fill(0));
  };

  const paint = (q: number) => {
    if (phase !== 'play') return;
    setGuessHistory((previous) => [...previous.slice(-49), guess]);
    setGuess((prev) => {
      const next = [...prev];
      next[q] = (next[q] ^ brush) as Pauli;
      return next;
    });
    setHintQubit(null);
    setHintMessage('');
  };

  const undo = () => {
    const previous = guessHistory.at(-1);
    if (!previous || phase !== 'play') return;
    setGuess(previous);
    setGuessHistory((history) => history.slice(0, -1));
    setHintQubit(null);
    setHintMessage('Undid the last paint action.');
  };

  const clearGuess = () => {
    if (phase !== 'play' || guess.every((pauli) => pauli === 0)) return;
    setGuessHistory((previous) => [...previous.slice(-49), guess]);
    setGuess(new Array<Pauli>(guess.length).fill(0));
    setHintQubit(null);
    setHintMessage('Cleared your correction. You can undo to restore it.');
  };

  const requestHint = () => {
    if (!round || phase !== 'play') return;
    if (mode === 'daily') {
      setHintQubit(null);
      setHintMessage('Reference hints stay in Practice so matching daily puzzle ids remain meaningfully comparable.');
      return;
    }

    const referenceMove = round.reference.findIndex((pauli, qubit) => pauli !== 0 && guess[qubit] !== pauli);
    if (referenceMove >= 0) {
      const row = Math.floor(referenceMove / round.lat.d) + 1;
      const col = (referenceMove % round.lat.d) + 1;
      setHintQubit(referenceMove);
      setUsedHintThisRound(true);
      setHintMessage(
        `The built-in decoder uses ${PAULI_NAME[round.reference[referenceMove]]} at row ${row}, column ${col} (Assisted Solve). This is one move in its complete correction, not proof of a unique answer.`,
      );
      return;
    }

    const extraMove = guess.findIndex((pauli, qubit) => pauli !== 0 && round.reference[qubit] === 0);
    if (extraMove >= 0) {
      const row = Math.floor(extraMove / round.lat.d) + 1;
      const col = (extraMove % round.lat.d) + 1;
      setHintQubit(extraMove);
      setUsedHintThisRound(true);
      setHintMessage(`Your guess already contains every reference move. Inspect extra paint at row ${row}, column ${col} (Assisted Solve).`);
      return;
    }

    setHintQubit(null);
    setHintMessage('Your paint matches the built-in reference correction. Submit once the detector count reaches zero.');
  };

  const closeGuide = () => {
    const next = { ...record, guideSeen: true };
    setRecord(next);
    saveDuelRecord(next);
    setGuideOpen(false);
  };

  const finishRun = (finalOutcomes: RoundOutcome[], finalScore: number, showEnd = true) => {
    if (showEnd) setPhase('end');
    if (finalizedRun.current) return;
    finalizedRun.current = true;
    const next = { ...record, daily: { ...record.daily } };
    if (mode === 'daily') {
      const result = makeDailyResult(day, finalOutcomes, finalScore);
      next.daily[result.puzzleId] = result;
      recordEvidence({
        kind: 'duel-result',
        mode: 'daily',
        puzzleId: result.puzzleId,
        score: result.score,
        maxScore: DAILY_MAX_SCORE,
        rounds: result.outcomes.length,
        manifestId: result.manifestId,
        schemaVersion: result.schemaVersion,
        compatible: true,
      });
    } else if (
      mode === 'practice' &&
      (!record.bestPractice || finalScore > record.bestPractice.score)
    ) {
      next.bestPractice = { score: finalScore, rounds: finalOutcomes.length };
    }
    if (mode === 'practice') {
      recordEvidence({
        kind: 'duel-result',
        mode: 'practice',
        puzzleId: practiceRunId.current || `practice-${day}-${seedTick}`,
        score: finalScore,
        maxScore: Math.max(POINTS.clean, finalOutcomes.length * POINTS.clean),
        rounds: finalOutcomes.length,
      });
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
      // Persist the completed run before the learner can navigate away, while
      // leaving the post-mortem visible until they request the result card.
      finishRun(newOutcomes, newScore, false);
      return;
    }
  };

  const submit = () => {
    if (!round || defectsLeft > 0) return;
    settle(judge(round, guess, usedHintThisRound));
  };

  const forfeit = () => {
    if (!round) return;
    settle({
      outcome: 'fail',
      cleared: false,
      logicalX: false,
      logicalZ: false,
      guessWeight: guess.filter((pauli) => pauli !== 0).length,
      points: 0,
      usedHint: usedHintThisRound,
    });
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
    setUsedHintThisRound(false);
    setPhase('play');
    const plan = mode === 'daily' ? DAILY_PLAN[idx] : practicePlan(idx);
    setGuess(new Array<Pauli>(plan.d ** 2).fill(0));
    setGuessHistory([]);
    setHintQubit(null);
    setHintMessage('');
  };

  const copyCard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareCard = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copyCard(text);
  };

  const dailyCardText = (resultOutcomes = outcomes, resultScore = score) =>
    shareText(day, resultOutcomes, resultScore, challengeUrl);

  const practiceCardText = (best = record.bestPractice) =>
    best ? practiceShareText(best.score, best.rounds, new URL(`${import.meta.env.BASE_URL}duel`, window.location.origin).toString()) : '';

  const maxDaily = DAILY_MAX_SCORE;

  return (
    <div className="bg-ink-900">
      <header className="lattice-bg">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-16 md:px-8">
          <motion.p initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.5, ease: [...EASE] }} className="eyebrow !text-syndrome">
            {'// THE GAME'}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.08, ease: [...EASE] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Decoder Duel
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.16, ease: [...EASE] }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-text-mid"
          >
            You are the decoder. Errors struck the lattice — you see only the
            syndrome they left behind. Paint a correction that clears every
            detector without leaving a logical error, and match the built-in
            matching decoder&apos;s correction weight for full points. Every verdict
            is computed locally by the same invariant-tested model as the Lab.
          </motion.p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        {phase === 'menu' && (
          <div className="space-y-6">
            {requestedChallengeId && compatibleChallengeDay !== null && (
              <div className="flex flex-col gap-3 rounded-xl border border-plaquette/50 bg-plaquette/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-plaquette">Challenge received</p>
                  <p className="mt-1 text-sm leading-6 text-text-mid">
                    You opened <span className="font-mono text-text-hi">{dailyPuzzleId(day)}</span>. Your seeded rounds match the shared puzzle id on this compatible build.
                  </p>
                </div>
                {!dailyPlayed && (
                  <button type="button" onClick={() => start('daily')} className="btn-primary shrink-0">
                    <Swords className="h-4 w-4" /> Accept challenge
                  </button>
                )}
              </div>
            )}
            {requestedChallengeId && compatibleChallengeDay === null && (
              <div className="rounded-xl border border-syndrome/45 bg-syndrome/[0.07] p-4" role="status">
                <p className="font-mono text-[11px] uppercase tracking-wider text-syndrome">Challenge cannot be matched</p>
                <p className="mt-1 text-sm leading-6 text-text-mid">
                  That link uses an invalid, older, or incompatible puzzle id. Today&apos;s duel is available below, but its score must not be compared with the shared result.
                </p>
              </div>
            )}

            {guideOpen && <DuelFieldGuide onDone={closeGuide} />}
            {!guideOpen && (
              <button type="button" onClick={() => setGuideOpen(true)} className="btn-ghost">
                <BookOpen className="h-4 w-4" /> Reopen the field guide
              </button>
            )}

            <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-6">
              <p className="eyebrow !text-magic">{'// DAILY DUEL'}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text-hi">Puzzle {dailyPuzzleId(day)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">
                Ten rounds, d=3 → d=7. Matching full puzzle ids generate the
                same seeded rounds on a compatible build. One browser-saved attempt, then challenge a friend.
              </p>
              {dailyResult ? (
                <div className="mt-4 rounded-lg border border-ink-700 bg-ink-850 p-4">
                  <p className="font-mono text-[12px] text-text-low">your result for this puzzle</p>
                  <p className="mt-1 text-xl">{dailyResult.outcomes.map((o) => OUTCOME_EMOJI[o]).join('')}</p>
                  <p className="mt-1 font-mono text-[13px] text-text-hi">
                    {dailyResult.score}/{maxDaily}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => shareCard(dailyCardText(dailyResult.outcomes, dailyResult.score), 'Decoder Duel challenge')}
                      className="btn-secondary"
                    >
                      <Share2 className="h-4 w-4" /> Share challenge
                    </button>
                    <button
                      type="button"
                      onClick={() => copyCard(dailyCardText(dailyResult.outcomes, dailyResult.score))}
                      className="btn-ghost"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy card'}
                    </button>
                  </div>
                </div>
              ) : ledgerDailyResult ? (
                <div className="mt-4 rounded-lg border border-ink-700 bg-ink-850 p-4">
                  <p className="font-mono text-[12px] text-text-low">compatible result imported in the learning record</p>
                  <p className="mt-1 font-mono text-[13px] text-text-hi">
                    {ledgerDailyResult.score}/{ledgerDailyResult.maxScore} · {ledgerDailyResult.rounds} rounds
                  </p>
                  <p className="mt-2 text-xs leading-5 text-text-low">
                    The portable record does not contain round outcomes, so this browser will not reconstruct or share an emoji card. Replaying the same puzzle is disabled to avoid duplicate evidence.
                  </p>
                </div>
              ) : (
                <button type="button" onClick={() => start('daily')} className="btn-primary mt-4">
                  <Swords className="h-4 w-4" /> {compatibleChallengeDay !== null ? 'Accept this challenge' : 'Play today\'s duel'}
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
                <div className="mt-3 rounded-lg border border-ink-700 bg-ink-850 p-3">
                  <p className="font-mono text-[13px] text-magic">
                    best: {record.bestPractice.score} pts · {record.bestPractice.rounds} rounds
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => shareCard(practiceCardText(), 'Decoder Duel practice best')}
                      className="btn-ghost text-[12px]"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share best
                    </button>
                    <button
                      type="button"
                      onClick={() => copyCard(practiceCardText())}
                      className="btn-ghost text-[12px]"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy card'}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-text-low">Local and unverified. Random practice runs are not same-puzzle comparisons.</p>
                </div>
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
              <p className="mt-3 border-l-2 border-magic/60 pl-3 text-xs leading-5 text-text-low">
                The puzzle id includes the UTC day, schema version, and a manually maintained manifest id. A representative golden-vector check catches drift in sampled generator/reference behavior and core judge outcomes. Scores are comparable only when the full puzzle id matches, and remain local and unverified: there is no identity check, server replay, or signed leaderboard.
              </p>
            </div>
            </div>
          </div>
        )}

        {phase !== 'menu' && round && (
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 rounded-xl border border-ink-600 bg-ink-850 p-4 md:p-6">
              <div
                className="overflow-x-auto"
                role="region"
                aria-label={`Distance-${round.lat.d} decoder grid; scroll horizontally on small screens`}
                tabIndex={round.lat.d >= 7 ? 0 : -1}
              >
                <DuelLattice
                  key={`${mode}-${day}-${seedTick}-${roundIdx}`}
                  round={round}
                  guess={guess}
                  revealed={phase !== 'play'}
                  hintQubit={hintQubit}
                  onQubitClick={paint}
                />
              </div>
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

              {phase === 'play' && guideOpen && <DuelFieldGuide compact onDone={closeGuide} />}

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
                  <p className="mt-2 text-[11px] leading-5 text-text-low">
                    Click a painted qubit with the same brush to remove that component. X then Z paints Y in this phase-ignored Pauli frame.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={undo}
                      disabled={guessHistory.length === 0}
                      className="btn-ghost min-w-0 px-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Undo2 className="h-3.5 w-3.5" /> Undo
                    </button>
                    <button
                      type="button"
                      onClick={clearGuess}
                      disabled={guess.every((pauli) => pauli === 0)}
                      className="btn-ghost min-w-0 px-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Eraser className="h-3.5 w-3.5" /> Clear
                    </button>
                    <button type="button" onClick={requestHint} className="btn-ghost min-w-0 px-2 text-[11px]">
                      <Lightbulb className="h-3.5 w-3.5" /> Hint
                    </button>
                  </div>
                  {hintMessage && (
                    <p className="mt-3 rounded-lg border border-magic/35 bg-magic/[0.06] p-3 text-xs leading-5 text-text-mid" role="status" aria-live="polite">
                      {hintMessage}
                    </p>
                  )}
                  <p className="mt-3 font-mono text-[12px] text-text-mid" role="status" aria-live="polite">
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
                    <Flag className="h-3.5 w-3.5" /> Reveal and forfeit
                  </button>
                  {!guideOpen && (
                    <button type="button" onClick={() => setGuideOpen(true)} className="btn-ghost mt-1 w-full text-[12px]">
                      <BookOpen className="h-3.5 w-3.5" /> Show field guide
                    </button>
                  )}
                  <p className="mt-2 text-center text-[10px] leading-4 text-text-low">
                    Practice hints reveal one reference move. Daily hints do not reveal moves, preserving puzzle comparability.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {phase === 'post' && verdict && (
                  <motion.div
                    ref={verdictRef}
                    tabIndex={-1}
                    role="status"
                    aria-live="polite"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25, ease: [...EASE] }}
                    className={`rounded-xl border p-5 outline-none ${
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
                    <dl className="mt-4 space-y-2 rounded-lg border border-ink-600 bg-ink-900/60 p-3 font-mono text-[11px] leading-5">
                      <div>
                        <dt className="text-syndrome">Hidden error</dt>
                        <dd className="break-words text-text-mid">{patternSummary(round.hidden, round.lat.d)}</dd>
                      </div>
                      <div>
                        <dt className="text-plaquette">Your correction</dt>
                        <dd className="break-words text-text-mid">{patternSummary(guess, round.lat.d)}</dd>
                      </div>
                      <div>
                        <dt className="text-star">Reference correction</dt>
                        <dd className="break-words text-text-mid">{patternSummary(round.reference, round.lat.d)}</dd>
                      </div>
                      <div>
                        <dt className="text-magic">Residual = hidden ⊕ yours</dt>
                        <dd className="break-words text-text-mid">{patternSummary(residual, round.lat.d)}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs leading-5 text-text-low">
                      A cleared syndrome only says the residual commutes with every check. The logical test then asks whether that residual is harmless or a non-trivial path across the code.
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
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: [...EASE] }}
            className="mx-auto max-w-2xl"
          >
            <DuelResultCard mode={mode} score={score} outcomes={outcomes} day={day} />

            <div className="mt-5 rounded-xl border border-ink-600 bg-ink-850 p-5 text-center">
              <p className="eyebrow !text-magic">{'// SHARE THE RUN'}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {mode === 'daily' ? (
                  <>
                    <button type="button" onClick={() => shareCard(dailyCardText(), 'Decoder Duel challenge')} className="btn-primary">
                      <Share2 className="h-4 w-4" /> Share same-puzzle challenge
                    </button>
                    <button type="button" onClick={() => copyCard(dailyCardText())} className="btn-secondary">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Card copied' : 'Copy text card'}
                    </button>
                  </>
                ) : record.bestPractice ? (
                  <>
                    <button type="button" onClick={() => shareCard(practiceCardText(), 'Decoder Duel practice best')} className="btn-primary">
                      <Share2 className="h-4 w-4" /> Share personal best
                    </button>
                    <button type="button" onClick={() => copyCard(practiceCardText())} className="btn-secondary">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Best copied' : 'Copy best card'}
                    </button>
                  </>
                ) : null}
              </div>
              <p className="mt-4 font-mono text-[10px] leading-5 text-text-low">
                {mode === 'daily'
                  ? 'The link loads this exact puzzle id. Compare only matching ids; results remain local and unverified.'
                  : 'Practice bests are local and unverified. Random runs are motivational milestones, not head-to-head evidence.'}
              </p>
            </div>

            <section className="mt-5 rounded-xl border border-plaquette/35 bg-plaquette/[0.05] p-5 text-left" aria-labelledby="duel-next-title">
              <p className="eyebrow !text-plaquette">{'// TURN THE SCORE INTO MEMORY'}</p>
              <h2 id="duel-next-title" className="mt-2 font-display text-xl font-semibold text-text-hi">
                Follow the detector trail one level deeper
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-mid">
                {outcomes.includes('fail')
                  ? 'A miss is most useful when you can explain whether the syndrome stayed active or vanished behind a logical path.'
                  : 'You cleared the local evidence. Now connect that move-by-move intuition to the decoder and logical-class model.'}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link to="/lab" className="rounded-lg border border-ink-600 bg-ink-900/55 p-4 transition-colors hover:border-plaquette/60">
                  <span className="flex items-center gap-2 font-display text-sm font-semibold text-text-hi"><Play className="h-4 w-4 text-plaquette" /> Rebuild it in the Lab</span>
                  <span className="mt-1 block text-xs leading-5 text-text-low">Inject known errors, inspect syndrome changes, and compare a decoded correction.</span>
                </Link>
                <Link to="/map?topic=decoding-mwpm" className="rounded-lg border border-ink-600 bg-ink-900/55 p-4 transition-colors hover:border-star/60">
                  <span className="flex items-center gap-2 font-display text-sm font-semibold text-text-hi"><BookOpen className="h-4 w-4 text-star" /> Explain matching</span>
                  <span className="mt-1 block text-xs leading-5 text-text-low">Learn why pairings, boundaries, degeneracy, and logical classes all matter.</span>
                </Link>
              </div>
            </section>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {mode === 'practice' && (
                <button type="button" onClick={() => start('practice')} className="btn-primary">
                  <Play className="h-4 w-4" /> Practice again
                </button>
              )}
              <button type="button" onClick={() => setPhase('menu')} className="btn-secondary">
                <RotateCcw className="h-4 w-4" /> Back to menu
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}

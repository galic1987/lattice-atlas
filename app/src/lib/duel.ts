/**
 * Decoder Duel — game logic.
 *
 * The player IS the decoder: they see only the syndrome of a hidden error
 * pattern and must paint a correction that clears it without creating a
 * logical error. Rounds are generated from a seeded PRNG so the daily
 * puzzle is identical for matching puzzle ids on a compatible build, and
 * every judgment comes from the same invariant-tested local surface-code model.
 */
import {
  buildLattice,
  computeSyndrome,
  decode,
  logicalFlips,
  type Lattice,
  type Pauli,
} from './surfaceCode';

/** Deterministic PRNG (mulberry32) so daily puzzles are identical for everyone. */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Day number since the Unix epoch (UTC) — the daily puzzle id. */
export const dayNumber = () => Math.floor(Date.now() / 86_400_000);

export interface RoundPlan {
  d: number;
  errors: number;
  allowZ: boolean;
}

/** Ten daily rounds, ramping distance and error weight. */
export const DAILY_PLAN: RoundPlan[] = [
  { d: 3, errors: 1, allowZ: false },
  { d: 3, errors: 2, allowZ: false },
  { d: 3, errors: 2, allowZ: true },
  { d: 5, errors: 2, allowZ: false },
  { d: 5, errors: 3, allowZ: true },
  { d: 5, errors: 4, allowZ: true },
  { d: 7, errors: 4, allowZ: true },
  { d: 7, errors: 5, allowZ: true },
  { d: 7, errors: 5, allowZ: true },
  { d: 7, errors: 6, allowZ: true },
];

export const DUEL_SCHEMA_VERSION = 2;
/**
 * A manually maintained compatibility manifest for shared daily puzzles.
 *
 * Its id fingerprints these labels and the round plan only; it is not a hash
 * of executable source code. The golden-vector assertion below is what keeps
 * the labels aligned with the generator, judge, and reference decoder.
 */
const DUEL_COMPATIBILITY_MANIFEST = JSON.stringify({
  schema: DUEL_SCHEMA_VERSION,
  generator: 'mulberry32-hidden-pauli-v2',
  judge: 'residual-syndrome-logicals-v2',
  reference: 'surface-code-matching-v2',
  plan: DAILY_PLAN,
});

function hash32(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export const DUEL_MANIFEST_ID = hash32(DUEL_COMPATIBILITY_MANIFEST).toString(16).padStart(8, '0');
export const dailyPuzzleId = (day: number) => `d${day}-v${DUEL_SCHEMA_VERSION}-${DUEL_MANIFEST_ID}`;
export const dailyRoundSeed = (day: number, round: number) => hash32(`${dailyPuzzleId(day)}:r${round}`);

/**
 * Accept a shared puzzle id only when it targets this exact compatible game
 * schema/manifest. This lets an old challenge fail closed instead of silently
 * loading a different set of rounds under a familiar-looking day number.
 */
export function parseDailyPuzzleId(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^d(\d+)-v(\d+)-([0-9a-f]{8})$/.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const schema = Number(match[2]);
  if (!Number.isSafeInteger(day) || day < 0) return null;
  if (schema !== DUEL_SCHEMA_VERSION || match[3] !== DUEL_MANIFEST_ID) return null;
  return dailyPuzzleId(day) === value ? day : null;
}

/** Endless practice: keep ramping past the daily plan. */
export function practicePlan(round: number): RoundPlan {
  if (round < DAILY_PLAN.length) return DAILY_PLAN[round];
  const extra = round - DAILY_PLAN.length;
  return { d: 7, errors: Math.min(6 + extra, 12), allowZ: true };
}

export interface DuelRound {
  plan: RoundPlan;
  lat: Lattice;
  hidden: Pauli[];
  syndrome: Set<string>;
  /** Weight of the reference (matching-decoder) correction — the par score. */
  parWeight: number;
  /** Reference correction returned by the built-in matching decoder. */
  reference: Pauli[];
  /** Whether the reference decoder itself succeeds on this round. */
  decoderSucceeds: boolean;
}

/**
 * Generate one round: sample a hidden pattern whose syndrome is non-empty
 * (a silent pattern would be unplayable), and compute the decoder's par.
 */
export function generateRound(plan: RoundPlan, rng: () => number): DuelRound {
  const lat = buildLattice(plan.d);
  for (let attempt = 0; attempt < 50; attempt++) {
    const hidden: Pauli[] = new Array<Pauli>(lat.n).fill(0);
    const chosen = new Set<number>();
    while (chosen.size < plan.errors) chosen.add(Math.floor(rng() * lat.n));
    for (const q of chosen) hidden[q] = plan.allowZ && rng() < 0.4 ? 2 : 1;
    const syndrome = computeSyndrome(lat, hidden);
    if (syndrome.size === 0) continue;
    const res = decode(lat, hidden);
    const parWeight = res.correction.filter((p) => p !== 0).length;
    return {
      plan,
      lat,
      hidden,
      syndrome,
      parWeight,
      reference: res.correction,
      decoderSucceeds: res.success,
    };
  }
  // Statistically unreachable; keep types honest.
  throw new Error('could not generate a round with a visible syndrome');
}

export type RoundOutcome = 'clean' | 'heavy' | 'fail';

export interface Judgment {
  outcome: RoundOutcome;
  cleared: boolean;
  logicalX: boolean;
  logicalZ: boolean;
  guessWeight: number;
  points: number;
}

export const POINTS: Record<RoundOutcome, number> = { clean: 15, heavy: 10, fail: 0 };
export const DAILY_MAX_SCORE = DAILY_PLAN.length * POINTS.clean;

/** Judge a submitted correction against the hidden truth. */
export function judge(round: DuelRound, guess: Pauli[]): Judgment {
  const residual = round.hidden.map((e, q) => (e ^ guess[q]) as Pauli);
  const cleared = computeSyndrome(round.lat, residual).size === 0;
  const guessWeight = guess.filter((p) => p !== 0).length;
  if (!cleared) {
    return { outcome: 'fail', cleared, logicalX: false, logicalZ: false, guessWeight, points: 0 };
  }
  const flips = logicalFlips(round.lat, residual);
  const success = !flips.x && !flips.z;
  const outcome: RoundOutcome = success ? (guessWeight <= round.parWeight ? 'clean' : 'heavy') : 'fail';
  return {
    outcome,
    cleared,
    logicalX: flips.x,
    logicalZ: flips.z,
    guessWeight,
    points: POINTS[outcome],
  };
}

export const OUTCOME_EMOJI: Record<RoundOutcome, string> = {
  clean: '🟩',
  heavy: '🟨',
  fail: '🟥',
};

const compactPattern = (pattern: Pauli[]) => pattern
  .flatMap((pauli, qubit) => (pauli === 0 ? [] : [`${qubit}:${pauli}`]))
  .join(',');

const compactJudgment = (result: Judgment) => [
  result.outcome,
  Number(result.cleared),
  Number(result.logicalX),
  Number(result.logicalZ),
  result.guessWeight,
  result.points,
].join(':');

/**
 * Deterministic behavior snapshot used to catch silent compatibility drift.
 * Updating generator/judge/decoder behavior requires an intentional manifest
 * label or schema bump plus a reviewed update to this golden vector.
 */
export function computeDuelGoldenVector(): string {
  const day = 20_000;
  const rounds = [0, 2, 5, 9].map((roundIndex) => {
    const round = generateRound(DAILY_PLAN[roundIndex], mulberry32(dailyRoundSeed(day, roundIndex)));
    return {
      round: roundIndex,
      hidden: compactPattern(round.hidden),
      syndrome: [...round.syndrome].sort().join(','),
      par: round.parWeight,
      reference: compactPattern(round.reference),
      referenceSucceeds: round.decoderSucceeds,
    };
  });

  const judgeRound = generateRound(DAILY_PLAN[0], mulberry32(dailyRoundSeed(day, 0)));
  const empty = new Array<Pauli>(judgeRound.lat.n).fill(0);
  const logical = [...judgeRound.reference];
  for (const qubit of judgeRound.lat.logicalX) logical[qubit] = (logical[qubit] ^ 1) as Pauli;
  const heavy = judgeRound.lat.stabilizers
    .map((stabilizer) => {
      const candidate = [...judgeRound.reference];
      const pauli: Pauli = stabilizer.type === 'X' ? 1 : 2;
      for (const qubit of stabilizer.qubits) candidate[qubit] = (candidate[qubit] ^ pauli) as Pauli;
      return candidate;
    })
    .find((candidate) => judge(judgeRound, candidate).outcome === 'heavy');
  if (!heavy) throw new Error('Decoder Duel golden-vector setup could not find a heavy correction');

  return JSON.stringify({
    puzzleId: dailyPuzzleId(day),
    rounds,
    judgments: {
      reference: compactJudgment(judge(judgeRound, judgeRound.reference)),
      empty: compactJudgment(judge(judgeRound, empty)),
      logical: compactJudgment(judge(judgeRound, logical)),
      heavy: compactJudgment(judge(judgeRound, heavy)),
    },
  });
}

// Kept as data rather than a source-code hash so a mismatch says which actual
// game behavior changed. This fixture covers X-only and mixed-Pauli rounds at
// d=3/5/7 plus clean, uncleared, logical-failure, and heavy judgments.
export const DUEL_GOLDEN_VECTOR = '{"puzzleId":"d20000-v2-371b5a21","rounds":[{"round":0,"hidden":"6:1","syndrome":"Z:2,1","par":1,"reference":"7:1","referenceSucceeds":true},{"round":2,"hidden":"3:2,7:2","syndrome":"X:1,1,X:2,2,X:3,1","par":2,"reference":"3:2,7:2","referenceSucceeds":true},{"round":5,"hidden":"1:1,9:1,19:2,24:1","syndrome":"X:4,4,Z:1,2,Z:1,4,Z:2,5,Z:4,5","par":3,"reference":"2:1,9:1,24:3","referenceSucceeds":true},{"round":9,"hidden":"0:1,1:2,5:2,18:1,28:2,48:1","syndrome":"X:0,2,X:0,6,X:1,1,X:1,5,X:5,1,Z:1,0,Z:2,5,Z:3,4,Z:6,7","par":6,"reference":"0:1,1:2,5:2,18:1,35:2,48:1","referenceSucceeds":true}],"judgments":{"reference":"clean:1:0:0:1:15","empty":"fail:0:0:0:0:0","logical":"fail:1:1:0:4:0","heavy":"heavy:1:0:0:3:10"}}';

const observedGoldenVector = computeDuelGoldenVector();
if (observedGoldenVector !== DUEL_GOLDEN_VECTOR) {
  throw new Error(
    `Decoder Duel compatibility drift: bump the schema/manifest and review the golden vector. Observed: ${observedGoldenVector}`,
  );
}

export const PUBLIC_DUEL_URL = 'https://galic1987.github.io/lattice-atlas/duel';

export function dailyChallengeUrl(day: number, duelUrl = PUBLIC_DUEL_URL): string {
  const url = new URL(duelUrl);
  url.searchParams.set('challenge', dailyPuzzleId(day));
  return url.toString();
}

export function shareText(
  day: number,
  outcomes: RoundOutcome[],
  score: number,
  challengeUrl = dailyChallengeUrl(day),
): string {
  return [
    'LATTICE ATLAS · DECODER DUEL',
    outcomes.map((o) => OUTCOME_EMOJI[o]).join(''),
    `Score: ${score}/${DAILY_MAX_SCORE}`,
    `Puzzle: ${dailyPuzzleId(day)}`,
    'Can you beat this score on the same puzzle?',
    challengeUrl,
    'Compare only when the full puzzle id matches.',
    'Local, unverified browser result — no account, identity check, replay, or server signature.',
  ].join('\n');
}

export function practiceShareText(
  score: number,
  rounds: number,
  duelUrl = PUBLIC_DUEL_URL,
): string {
  return [
    'LATTICE ATLAS · DECODER DUEL',
    'ENDLESS PRACTICE',
    `Personal best: ${score} points · ${rounds} round${rounds === 1 ? '' : 's'}`,
    'Can you survive longer?',
    duelUrl,
    'Local, unverified browser result. Practice rounds are random, so this is not a same-puzzle comparison.',
  ].join('\n');
}

/* ---------------- persistence ---------------- */

const DUEL_KEY = 'lattice-atlas-duel';

export interface DailyDuelResult {
  puzzleId: string;
  day: number;
  schemaVersion: number;
  manifestId: string;
  score: number;
  outcomes: RoundOutcome[];
}

export interface DuelRecord {
  schemaVersion: number;
  daily: Record<string, DailyDuelResult>;
  bestPractice: { score: number; rounds: number } | null;
  guideSeen: boolean;
}

const EMPTY_DUEL_RECORD: DuelRecord = {
  schemaVersion: DUEL_SCHEMA_VERSION,
  daily: {},
  bestPractice: null,
  guideSeen: false,
};

function validOutcomes(value: unknown): value is RoundOutcome[] {
  return Array.isArray(value) && value.every((item) => item === 'clean' || item === 'heavy' || item === 'fail');
}

function cleanDaily(value: unknown): Record<string, DailyDuelResult> {
  if (typeof value !== 'object' || value === null) return {};
  const clean: Record<string, DailyDuelResult> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const result = candidate as Partial<DailyDuelResult>;
    if (
      result.puzzleId !== key
      || !Number.isInteger(result.day)
      || !Number.isInteger(result.schemaVersion)
      || typeof result.manifestId !== 'string'
      || !Number.isFinite(result.score)
      || Number(result.score) < 0
      || !validOutcomes(result.outcomes)
    ) continue;
    if (key !== `d${result.day}-v${result.schemaVersion}-${result.manifestId}`) continue;
    clean[key] = {
      puzzleId: key,
      day: Number(result.day),
      schemaVersion: Number(result.schemaVersion),
      manifestId: result.manifestId,
      score: Math.min(DAILY_MAX_SCORE, Math.round(Number(result.score))),
      outcomes: result.outcomes.slice(0, DAILY_PLAN.length),
    };
  }
  return clean;
}

export function makeDailyResult(day: number, outcomes: RoundOutcome[], score: number): DailyDuelResult {
  return {
    puzzleId: dailyPuzzleId(day),
    day,
    schemaVersion: DUEL_SCHEMA_VERSION,
    manifestId: DUEL_MANIFEST_ID,
    score: Math.max(0, Math.min(DAILY_MAX_SCORE, Math.round(score))),
    outcomes: outcomes.slice(0, DAILY_PLAN.length),
  };
}

export function currentDailyResult(record: DuelRecord, day: number): DailyDuelResult | undefined {
  const result = record.daily[dailyPuzzleId(day)];
  return result
    && result.schemaVersion === DUEL_SCHEMA_VERSION
    && result.manifestId === DUEL_MANIFEST_ID
    && result.outcomes.length === DAILY_PLAN.length
    ? result
    : undefined;
}

export function latestCompatibleDailyResult(record: DuelRecord): DailyDuelResult | undefined {
  return Object.values(record.daily)
    .filter((result) =>
      result.schemaVersion === DUEL_SCHEMA_VERSION
      && result.manifestId === DUEL_MANIFEST_ID
      && result.outcomes.length === DAILY_PLAN.length,
    )
    .sort((a, b) => b.day - a.day)[0];
}

export function loadDuelRecord(): DuelRecord {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DUEL_KEY) ?? '{}');
    const rec = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Partial<DuelRecord>;
    const best = rec.bestPractice;
    return {
      schemaVersion: DUEL_SCHEMA_VERSION,
      daily: cleanDaily(rec.daily),
      bestPractice: best
        && Number.isFinite(best.score)
        && Number.isInteger(best.rounds)
        && best.score >= 0
        && best.rounds >= 0
        ? { score: Math.round(best.score), rounds: best.rounds }
        : null,
      guideSeen: rec.guideSeen === true,
    };
  } catch {
    return EMPTY_DUEL_RECORD;
  }
}

export function saveDuelRecord(rec: DuelRecord) {
  try {
    localStorage.setItem(DUEL_KEY, JSON.stringify(rec));
  } catch {
    /* storage unavailable */
  }
}

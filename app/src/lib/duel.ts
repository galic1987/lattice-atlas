/**
 * Decoder Duel — game logic.
 *
 * The player IS the decoder: they see only the syndrome of a hidden error
 * pattern and must paint a correction that clears it without creating a
 * logical error. Rounds are generated from a seeded PRNG so the daily
 * puzzle is identical for everyone (shareable, comparable scores), and
 * every judgment comes from the verified surface-code model.
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
    return { plan, lat, hidden, syndrome, parWeight, decoderSucceeds: res.success };
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

export function shareText(day: number, outcomes: RoundOutcome[], score: number): string {
  const max = DAILY_PLAN.length * POINTS.clean;
  return [
    `Lattice Atlas — Decoder Duel #${day}`,
    outcomes.map((o) => OUTCOME_EMOJI[o]).join(''),
    `${score}/${max} vs the matching decoder`,
    'https://galic1987.github.io/lattice-atlas/duel',
  ].join('\n');
}

/* ---------------- persistence ---------------- */

const DUEL_KEY = 'lattice-atlas-duel';

export interface DuelRecord {
  daily: Record<number, { score: number; outcomes: RoundOutcome[] }>;
  bestPractice: { score: number; rounds: number } | null;
}

export function loadDuelRecord(): DuelRecord {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DUEL_KEY) ?? '{}');
    const rec = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Partial<DuelRecord>;
    return { daily: rec.daily ?? {}, bestPractice: rec.bestPractice ?? null };
  } catch {
    return { daily: {}, bestPractice: null };
  }
}

export function saveDuelRecord(rec: DuelRecord) {
  try {
    localStorage.setItem(DUEL_KEY, JSON.stringify(rec));
  } catch {
    /* storage unavailable */
  }
}

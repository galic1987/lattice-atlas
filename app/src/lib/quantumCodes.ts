/**
 * Exact small quantum stabilizer codes — symplectic GF(2) engine, no
 * approximation. A Pauli error on n qubits is two bit vectors (x, z): X = (1,0),
 * Z = (0,1), Y = (1,1) per qubit, phases ignored. Syndrome bits are symplectic
 * inner products with the stabilizers; decoding is an exact lookup over all
 * single-qubit Pauli errors. Verified exhaustively by scripts/check-codes.mjs.
 *
 * Used by the Error-Correcting Code Explorer to make the quantum rows of the
 * code zoo playable: Steane [[7,1,3]] (CSS over the classical Hamming engine),
 * Shor [[9,1,3]] (concatenated repetition), and the five-qubit [[5,1,3]]
 * perfect code.
 */

import { HAMMING_CHECK_POSITIONS } from '@/lib/classicalCodes';

/* ---------------- symplectic primitives ---------------- */

export interface PauliError {
  x: number[];
  z: number[];
}

export interface Stabilizer {
  label: string;
  x: number[];
  z: number[];
}

export function identityError(n: number): PauliError {
  return { x: Array(n).fill(0), z: Array(n).fill(0) };
}

/** Single-qubit Pauli on `qubit` (0-indexed), identity elsewhere. */
export function pauliOn(n: number, qubit: number, kind: 'X' | 'Z' | 'Y'): PauliError {
  const e = identityError(n);
  if (kind !== 'Z') e.x[qubit] = 1;
  if (kind !== 'X') e.z[qubit] = 1;
  return e;
}

/** Pauli product, phase ignored (irrelevant for syndrome/decoding logic). */
export function pauliMultiply(a: PauliError, b: PauliError): PauliError {
  return {
    x: a.x.map((v, i) => v ^ b.x[i]),
    z: a.z.map((v, i) => v ^ b.z[i]),
  };
}

/** Symplectic inner product mod 2: 0 = commutes, 1 = anticommutes. */
export function symplecticProduct(s: Stabilizer, e: PauliError): number {
  let acc = 0;
  for (let i = 0; i < s.x.length; i++) acc += s.x[i] * e.z[i] + s.z[i] * e.x[i];
  return acc % 2;
}

/** One syndrome bit per stabilizer, in stabilizer order. */
export function syndromeOf(stabs: Stabilizer[], e: PauliError): number[] {
  return stabs.map((s) => symplecticProduct(s, e));
}

/* ---------------- GF(2) linear algebra ---------------- */

/** Is v in the GF(2) span of basis vectors? (Gaussian elimination on the fly.) */
export function inSpan(basis: number[][], v: number[]): boolean {
  const rows = basis.map((r) => r.slice());
  const target = v.slice();
  for (let col = 0; col < target.length; col++) {
    const pivot = rows.findIndex((r) => r[col] === 1);
    if (pivot === -1) {
      if (target[col] === 1) return false;
      continue;
    }
    const [row] = rows.splice(pivot, 1);
    for (const r of rows) if (r[col] === 1) r.forEach((_, j) => (r[j] ^= row[j]));
    if (target[col] === 1) target.forEach((_, j) => (target[j] ^= row[j]));
  }
  return target.every((b) => b === 0);
}

/** Flatten a PauliError to a single 2n vector for span tests. */
export function flatten(e: PauliError): number[] {
  return [...e.x, ...e.z];
}

/* ---------------- the code engine ---------------- */

export type ResidualClass = 'clean' | 'logical' | 'uncorrected';

export interface QuantumCode {
  id: 'steane' | 'shor' | 'five-qubit';
  name: string;
  notation: string;
  n: number;
  stabilizers: Stabilizer[];
  /** Correction for a measured syndrome, or null if it matches no single-qubit Pauli. */
  decode: (syndrome: number[]) => PauliError | null;
  /**
   * Classify (error, correction): 'clean' = product is a stabilizer (no logical
   * damage), 'logical' = commutes but is not a stabilizer (code fooled — a
   * logical operator slipped through), 'uncorrected' = syndrome still nonzero.
   */
  classify: (error: PauliError, correction: PauliError) => ResidualClass;
}

function buildCode(
  id: QuantumCode['id'],
  name: string,
  notation: string,
  n: number,
  stabilizers: Stabilizer[],
): QuantumCode {
  const stabVectors = stabilizers.map(flatten);
  const lookup = new Map<string, PauliError>();
  for (let q = 0; q < n; q++) {
    for (const kind of ['X', 'Z', 'Y'] as const) {
      const e = pauliOn(n, q, kind);
      const key = syndromeOf(stabilizers, e).join('');
      // First-seen wins: degenerate syndromes (e.g. Shor phase flips inside a
      // block) differ only by a stabilizer, so any representative corrects.
      if (!lookup.has(key)) lookup.set(key, e);
    }
  }
  return {
    id,
    name,
    notation,
    n,
    stabilizers,
    decode: (syndrome) => lookup.get(syndrome.join('')) ?? null,
    classify: (error, correction) => {
      const residual = pauliMultiply(error, correction);
      const syn = syndromeOf(stabilizers, residual);
      if (syn.some((b) => b === 1)) return 'uncorrected';
      return inSpan(stabVectors, flatten(residual)) ? 'clean' : 'logical';
    },
  };
}

/* ---------------- the three codes ---------------- */

function supportsToStab(label: string, kind: 'X' | 'Z', positions: number[], n: number): Stabilizer {
  const s: Stabilizer = { label, x: Array(n).fill(0), z: Array(n).fill(0) };
  for (const p of positions) s[kind === 'X' ? 'x' : 'z'][p - 1] = 1; // positions are 1-indexed
  return s;
}

/** Steane [[7,1,3]] — CSS: the three Hamming checks as X- and Z-stabilizers. */
export const STEANE = buildCode(
  'steane',
  'Steane',
  '[[7, 1, 3]]',
  7,
  [
    ...HAMMING_CHECK_POSITIONS.map((pos, i) => supportsToStab(`gˣ${i + 1}`, 'X', pos, 7)),
    ...HAMMING_CHECK_POSITIONS.map((pos, i) => supportsToStab(`gᶻ${i + 1}`, 'Z', pos, 7)),
  ],
);

/** Shor [[9,1,3]] — Z pairs inside each 3-qubit block + X⁶ across block pairs. */
export const SHOR = buildCode(
  'shor',
  'Shor',
  '[[9, 1, 3]]',
  9,
  [
    ...([1, 4, 7] as const).flatMap((b, bi) => [
      supportsToStab(`gᶻ${bi * 2 + 1}`, 'Z', [b, b + 1], 9),
      supportsToStab(`gᶻ${bi * 2 + 2}`, 'Z', [b + 1, b + 2], 9),
    ]),
    supportsToStab('gˣ₁', 'X', [1, 2, 3, 4, 5, 6], 9),
    supportsToStab('gˣ₂', 'X', [4, 5, 6, 7, 8, 9], 9),
  ],
);

/** Five-qubit [[5,1,3]] perfect code — cyclic X Z Z X I generators. */
export const FIVE_QUBIT = buildCode(
  'five-qubit',
  'Five-qubit',
  '[[5, 1, 3]]',
  5,
  [
    { label: 'g₁', x: [1, 0, 0, 1, 0], z: [0, 1, 1, 0, 0] },
    { label: 'g₂', x: [0, 1, 0, 0, 1], z: [0, 0, 1, 1, 0] },
    { label: 'g₃', x: [1, 0, 1, 0, 0], z: [0, 0, 0, 1, 1] },
    { label: 'g₄', x: [0, 1, 0, 1, 0], z: [1, 0, 0, 0, 1] },
  ],
);

export const QUANTUM_CODES: QuantumCode[] = [STEANE, SHOR, FIVE_QUBIT];

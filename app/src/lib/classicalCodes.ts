/**
 * Exact classical linear codes over GF(2) — real encode/syndrome/decode, no
 * approximation. Used by the Error-Correcting Code Explorer to show the
 * classical roots the surface code (a topological CSS code) grows from.
 */

/* ---------------- repetition code [n, 1, n] ---------------- */

export function repetitionEncode(bit: number, n: number): number[] {
  return Array.from({ length: n }, () => bit & 1);
}

export interface RepetitionResult {
  value: number; // majority-decoded bit
  corrected: number[]; // all cells forced to the majority value
  decisive: boolean; // false on an exact tie (an even n split 50/50)
}

export function repetitionDecode(bits: number[]): RepetitionResult {
  const ones = bits.reduce((a, b) => a + (b & 1), 0);
  const zeros = bits.length - ones;
  const value = ones > zeros ? 1 : 0;
  return {
    value,
    corrected: bits.map(() => value),
    decisive: ones !== zeros,
  };
}

/* ---------------- Hamming(7,4) code ---------------- */
// Positions 1..7 stored at array index 0..6. Parity bits at positions 1,2,4;
// data bits at positions 3,5,6,7. The parity-check matrix's columns are the
// binary numbers 1..7, so the 3-bit syndrome, read as a number, IS the position
// of the single flipped bit (0 = no error). This is the classic construction.

/** Encode 4 data bits (d3, d5, d6, d7) into the 7-bit codeword (positions 1..7). */
export function hammingEncode(data: number[]): number[] {
  const [d3, d5, d6, d7] = data.map((b) => b & 1);
  const p1 = d3 ^ d5 ^ d7; // covers positions 1,3,5,7
  const p2 = d3 ^ d6 ^ d7; // covers positions 2,3,6,7
  const p4 = d5 ^ d6 ^ d7; // covers positions 4,5,6,7
  return [p1, p2, d3, p4, d5, d6, d7];
}

/** The three parity checks (s1, s2, s4) on a received 7-bit word. */
export function hammingChecks(r: number[]): [number, number, number] {
  const s1 = r[0] ^ r[2] ^ r[4] ^ r[6]; // positions 1,3,5,7
  const s2 = r[1] ^ r[2] ^ r[5] ^ r[6]; // positions 2,3,6,7
  const s4 = r[3] ^ r[4] ^ r[5] ^ r[6]; // positions 4,5,6,7
  return [s1, s2, s4];
}

/** Syndrome as a position 0..7 (0 = no detected single-bit error). */
export function hammingSyndrome(r: number[]): number {
  const [s1, s2, s4] = hammingChecks(r);
  return s1 + 2 * s2 + 4 * s4;
}

export interface HammingResult {
  errorPos: number; // 1..7, or 0 for none
  checks: [number, number, number];
  corrected: number[];
  data: number[]; // recovered data bits (positions 3,5,6,7)
}

export function hammingDecode(r: number[]): HammingResult {
  const checks = hammingChecks(r);
  const errorPos = checks[0] + 2 * checks[1] + 4 * checks[2];
  const corrected = r.slice();
  if (errorPos !== 0) corrected[errorPos - 1] ^= 1;
  return {
    errorPos,
    checks,
    corrected,
    data: [corrected[2], corrected[4], corrected[5], corrected[6]],
  };
}

/** Which codeword positions (1..7) each parity check covers — for the UI. */
export const HAMMING_CHECK_POSITIONS: [number[], number[], number[]] = [
  [1, 3, 5, 7],
  [2, 3, 6, 7],
  [4, 5, 6, 7],
];

/**
 * |a ∩ b| mod 2 for two check supports. In the Steane CSS construction an
 * X-type stabilizer (from Hamming check a) and a Z-type stabilizer (from check
 * b) commute iff their supports overlap in an EVEN number of qubits. For the
 * Hamming(7,4) checks this is 0 for every pair — the code is dual-containing —
 * which is precisely why every X- and Z-stabilizer of the [[7,1,3]] Steane code
 * commutes, making it a valid CSS code.
 */
export function checkOverlapParity(a: number[], b: number[]): number {
  const setB = new Set(b);
  return a.reduce((acc, p) => acc + (setB.has(p) ? 1 : 0), 0) % 2;
}
export const HAMMING_PARITY_POSITIONS = [1, 2, 4];
export const HAMMING_DATA_POSITIONS = [3, 5, 6, 7];

/* ---------------- the code zoo (factual reference data) ---------------- */

export interface CodeEntry {
  name: string;
  notation: string;
  kind: 'Classical' | 'Quantum';
  n: number;
  k: number;
  d: number;
  rate: string;
  corrects: number; // guaranteed correctable errors = floor((d-1)/2)
  note: string;
}

export const CODE_ZOO: CodeEntry[] = [
  {
    name: 'Repetition',
    notation: '[3, 1, 3]',
    kind: 'Classical',
    n: 3,
    k: 1,
    d: 3,
    rate: '1/3',
    corrects: 1,
    note: 'The simplest code: copy the bit three times, decode by majority vote.',
  },
  {
    name: 'Hamming',
    notation: '[7, 4, 3]',
    kind: 'Classical',
    n: 7,
    k: 4,
    d: 3,
    rate: '4/7',
    corrects: 1,
    note: 'Four data + three parity bits; the syndrome names the flipped bit. Steane’s quantum code is built directly from it.',
  },
  {
    name: 'Shor',
    notation: '[[9, 1, 3]]',
    kind: 'Quantum',
    n: 9,
    k: 1,
    d: 3,
    rate: '1/9',
    corrects: 1,
    note: 'The first quantum code (1995): two concatenated 3-qubit repetition codes protect against any single-qubit error.',
  },
  {
    name: 'Steane',
    notation: '[[7, 1, 3]]',
    kind: 'Quantum',
    n: 7,
    k: 1,
    d: 3,
    rate: '1/7',
    corrects: 1,
    note: 'A CSS code built from two copies of the classical Hamming[7,4] — the same seven bits, now qubits.',
  },
  {
    name: 'Perfect',
    notation: '[[5, 1, 3]]',
    kind: 'Quantum',
    n: 5,
    k: 1,
    d: 3,
    rate: '1/5',
    corrects: 1,
    note: 'The smallest quantum code that corrects any single-qubit error.',
  },
  {
    name: 'Surface (d=5)',
    notation: '[[25, 1, 5]]',
    kind: 'Quantum',
    n: 25,
    k: 1,
    d: 5,
    rate: '1/25',
    corrects: 2,
    note: 'A topological CSS code on a 2D lattice — what this whole atlas is about. A rotated distance-d patch uses d² qubits and corrects ⌊(d−1)/2⌋ errors.',
  },
];

/**
 * Real bivariate-bicycle qLDPC code construction (Bravyi et al. 2024) —
 * the actual algebraic Tanner graphs, not a schematic stand-in.
 *
 * Over G = Z_l × Z_m the qubits are two copies L,R of G (n = 2lm). With A and
 * B as exponent sets of G, the CSS parity checks are
 *   H_X = [A | B]      H_Z = [Bᵀ | Aᵀ]
 * giving weight-(|A|+|B|) rows. Verified by scripts/check-codes.mjs:
 * X/Z commutation, k from GF(2) ranks, and row weights.
 */

export interface BicycleCode {
  n: number;
  l: number;
  m: number;
  /** X-type check rows: qubit supports (0..n-1). */
  xChecks: number[][];
  /** Z-type check rows: qubit supports. */
  zChecks: number[][];
}

export function buildBicycleCode(
  l: number,
  m: number,
  aTerms: Array<readonly [number, number]>,
  bTerms: Array<readonly [number, number]>,
): BicycleCode {
  const lm = l * m;
  const xChecks: number[][] = [];
  const zChecks: number[][] = [];
  for (let i = 0; i < l; i++) {
    for (let j = 0; j < m; j++) {
      const xRow = new Set<number>();
      for (const [a, b] of aTerms) xRow.add(((i + a) % l) * m + ((j + b) % m));
      for (const [a, b] of bTerms) xRow.add(lm + ((i + a) % l) * m + ((j + b) % m));
      xChecks.push([...xRow].sort((p, q) => p - q));
      const zRow = new Set<number>();
      for (const [a, b] of bTerms) zRow.add((((i - a) % l + l) % l) * m + (((j - b) % m + m) % m));
      for (const [a, b] of aTerms) zRow.add(lm + (((i - a) % l + l) % l) * m + (((j - b) % m + m) % m));
      zChecks.push([...zRow].sort((p, q) => p - q));
    }
  }
  return { n: 2 * lm, l, m, xChecks, zChecks };
}

/** GF(2) rank of check rows — the verifier uses this to prove k. */
export function gf2Rank(rows: number[][], n: number): number {
  const R = rows.map((r) => new Set(r));
  let rank = 0;
  for (let col = 0; col < n; col++) {
    const idx = R.findIndex((s) => s.has(col));
    if (idx === -1) continue;
    const [piv] = R.splice(idx, 1);
    rank++;
    for (const s of R) {
      if (s.has(col)) {
        for (const v of piv) {
          if (s.has(v)) s.delete(v);
          else s.add(v);
        }
      }
    }
  }
  return rank;
}

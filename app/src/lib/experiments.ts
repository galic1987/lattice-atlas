/**
 * Exact helpers for the Experiment Bench. Everything here is real, deterministic
 * computation — union-find percolation and GF(2) Pauli algebra — so each visual
 * experiment shows a phenomenon that emerges from the math, not a drawn curve.
 */

/* ---------------- percolation (threshold as a spanning transition) ---------------- */

export interface PercolationResult {
  labels: number[]; // component root per errored cell, or -1 if not errored
  spanning: boolean; // does one error cluster touch both the left and right edges?
  spanningLabel: number; // that cluster's root, or -1
  clusterCount: number;
}

/**
 * Union-find on the errored cells of an n×n grid (4-neighbour adjacency). A
 * left-to-right spanning cluster is an error chain that crosses the whole patch —
 * i.e. a logical failure. Watching spanning clusters appear as the error rate
 * rises is the threshold, shown as the percolation transition it really is.
 */
export function percolate(n: number, errored: boolean[]): PercolationResult {
  const parent = Array.from({ length: n * n }, (_, i) => i);
  const find = (x: number): number => {
    let r = x;
    while (parent[r] !== r) {
      parent[r] = parent[parent[r]];
      r = parent[r];
    }
    return r;
  };
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  const idx = (r: number, c: number) => r * n + c;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!errored[idx(r, c)]) continue;
      if (c + 1 < n && errored[idx(r, c + 1)]) union(idx(r, c), idx(r, c + 1));
      if (r + 1 < n && errored[idx(r + 1, c)]) union(idx(r + 1, c), idx(r, c));
    }
  }

  const labels = errored.map((e, i) => (e ? find(i) : -1));

  const leftRoots = new Set<number>();
  const rightRoots = new Set<number>();
  for (let r = 0; r < n; r++) {
    if (errored[idx(r, 0)]) leftRoots.add(find(idx(r, 0)));
    if (errored[idx(r, n - 1)]) rightRoots.add(find(idx(r, n - 1)));
  }
  let spanningLabel = -1;
  for (const root of leftRoots) {
    if (rightRoots.has(root)) {
      spanningLabel = root;
      break;
    }
  }

  const roots = new Set(labels.filter((l) => l !== -1));
  return { labels, spanning: spanningLabel !== -1, spanningLabel, clusterCount: roots.size };
}

/** Fraction of samples with a spanning cluster at rate p (a real Monte Carlo point). */
export function spanningProbability(n: number, p: number, samples: number, rng: () => number = Math.random): number {
  let spans = 0;
  for (let s = 0; s < samples; s++) {
    const errored = Array.from({ length: n * n }, () => rng() < p);
    if (percolate(n, errored).spanning) spans++;
  }
  return spans / samples;
}

/* ---------------- Pauli algebra (commutation) ---------------- */

export type PauliChar = 'I' | 'X' | 'Y' | 'Z';
export const PAULI_CHARS: PauliChar[] = ['I', 'X', 'Y', 'Z'];

/** Two single-qubit Paulis anticommute iff both are non-identity and different. */
export function sitesAnticommute(a: PauliChar, b: PauliChar): boolean {
  return a !== 'I' && b !== 'I' && a !== b;
}

/**
 * Multi-qubit Pauli strings commute iff an even number of sites anticommute
 * (the symplectic inner product over GF(2)). This is exactly the rule that
 * forces every pair of stabilizer generators to commute.
 */
export function pauliStringsCommute(a: PauliChar[], b: PauliChar[]): { commute: boolean; clashes: number[] } {
  const clashes: number[] = [];
  a.forEach((pa, i) => {
    if (sitesAnticommute(pa, b[i])) clashes.push(i);
  });
  return { commute: clashes.length % 2 === 0, clashes };
}

/* ---------------- single-qubit Bloch vector ---------------- */

export interface Complex2 {
  re: number;
  im: number;
}

/** Bloch coordinates (x,y,z) and measurement probabilities for α|0⟩ + β|1⟩. */
export function blochVector(alpha: Complex2, beta: Complex2): { x: number; y: number; z: number; p0: number; p1: number } {
  // ⟨X⟩ = 2 Re(ᾱβ), ⟨Y⟩ = 2 Im(ᾱβ), ⟨Z⟩ = |α|² − |β|².
  const x = 2 * (alpha.re * beta.re + alpha.im * beta.im);
  const y = 2 * (alpha.re * beta.im - alpha.im * beta.re);
  const p0 = alpha.re * alpha.re + alpha.im * alpha.im;
  const p1 = beta.re * beta.re + beta.im * beta.im;
  return { x, y, z: p0 - p1, p0, p1 };
}

/**
 * Rotated surface code model for the Surface Code Lab.
 *
 * Pure, framework-free logic: lattice geometry, syndrome computation, a
 * minimum-weight matching decoder (exact for ≤ MAX_EXACT_DEFECTS detection
 * events per type, greedy beyond), and a Stim circuit exporter.
 *
 * Layout (distance d, d odd):
 * - d×d data qubits at grid positions (r, c), r/c ∈ [0, d).
 * - Faces (fr, fc) ∈ [0, d]² touch the data qubits at their ≤4 corners.
 *   Interior faces checkerboard X/Z by (fr+fc) parity; the top/bottom
 *   boundaries keep only X half-faces, left/right only Z half-faces.
 *   Total stabilizers: d² − 1, half X-type and half Z-type.
 * - Logical Z = Z on row 0 (crosses the Z boundaries); logical X = X on
 *   column 0. They intersect in exactly one qubit (0,0).
 *
 * Invariants (stabilizer counts, pairwise commutation, logical operator
 * algebra, single-error correction) are verified by scripts/verify-lattice.mjs.
 */

/** Pauli as bits: I=0, X=1, Z=2, Y=3 (X|Z). Composition is XOR. */
export type Pauli = 0 | 1 | 2 | 3;

export const PAULI_LABEL: Record<Pauli, string> = { 0: '', 1: 'X', 2: 'Z', 3: 'Y' };

export interface Stabilizer {
  id: string;
  type: 'X' | 'Z';
  /** Face coordinates, fr/fc ∈ [0, d]. */
  fr: number;
  fc: number;
  /** Data qubit indices this stabilizer measures (2 on a boundary, else 4). */
  qubits: number[];
  boundary: boolean;
}

export interface Lattice {
  d: number;
  /** Number of data qubits (d²). */
  n: number;
  stabilizers: Stabilizer[];
  /** Data qubit indices of the logical Z operator (row 0). */
  logicalZ: number[];
  /** Data qubit indices of the logical X operator (column 0). */
  logicalX: number[];
}

export const qubitIndex = (d: number, r: number, c: number) => r * d + c;

export function buildLattice(d: number): Lattice {
  if (d < 3 || d % 2 === 0) throw new Error(`distance must be an odd number ≥ 3, got ${d}`);
  const stabilizers: Stabilizer[] = [];
  for (let fr = 0; fr <= d; fr++) {
    for (let fc = 0; fc <= d; fc++) {
      const qubits: number[] = [];
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [0, -1],
        [0, 0],
      ] as const) {
        const r = fr + dr;
        const c = fc + dc;
        if (r >= 0 && r < d && c >= 0 && c < d) qubits.push(qubitIndex(d, r, c));
      }
      const interior = fr >= 1 && fr <= d - 1 && fc >= 1 && fc <= d - 1;
      const type: 'X' | 'Z' = (fr + fc) % 2 === 0 ? 'X' : 'Z';
      let include = false;
      if (interior) include = true;
      else if ((fr === 0 || fr === d) && fc >= 1 && fc <= d - 1) include = type === 'X';
      else if ((fc === 0 || fc === d) && fr >= 1 && fr <= d - 1) include = type === 'Z';
      if (include) {
        stabilizers.push({ id: `${type}:${fr},${fc}`, type, fr, fc, qubits, boundary: !interior });
      }
    }
  }
  const logicalZ = Array.from({ length: d }, (_, c) => qubitIndex(d, 0, c));
  const logicalX = Array.from({ length: d }, (_, r) => qubitIndex(d, r, 0));
  return { d, n: d * d, stabilizers, logicalZ, logicalX };
}

/** Ids of stabilizers whose measurement flips (−1) under the given error pattern. */
export function computeSyndrome(lat: Lattice, errors: Pauli[]): Set<string> {
  const flipped = new Set<string>();
  for (const s of lat.stabilizers) {
    // An X stabilizer anticommutes with the Z component of the error, and vice versa.
    const bit = s.type === 'X' ? 2 : 1;
    let parity = 0;
    for (const q of s.qubits) if (errors[q] & bit) parity ^= 1;
    if (parity) flipped.add(s.id);
  }
  return flipped;
}

/** Sample i.i.d. depolarizing noise: each qubit gets X, Y, or Z with probability p/3. */
export function sampleDepolarizing(n: number, p: number, rng: () => number = Math.random): Pauli[] {
  const errors: Pauli[] = new Array<Pauli>(n).fill(0);
  for (let q = 0; q < n; q++) {
    if (rng() < p) errors[q] = (1 + Math.floor(rng() * 3)) as Pauli;
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Decoder                                                             */
/* ------------------------------------------------------------------ */

/**
 * Above this many detection events per type, fall back to greedy matching.
 *
 * IMPORTANT — this is a fixed count against a defect population that scales as
 * ~p·d². It is calibrated for the SHIPPED distances (d ≤ 7) and Monte-Carlo grid
 * (p ≤ 0.20): across that grid the greedy fallback fires in ≤ 0.1% of shots, so
 * the threshold plot is genuinely exact-decoded. It does NOT hold for larger
 * codes — by d = 9 a non-trivial fraction of shots fall back and by d = 11 the
 * decode is visibly sub-optimal (measured worse than d = 9). If you ever add a
 * d ≥ 9 option, this constant must scale with d (or the decoder swapped for a
 * blossom implementation) before the results can be trusted.
 */
export const MAX_EXACT_DEFECTS = 16;

interface TypeGraph {
  stabs: Stabilizer[];
  /** dist[i][j]: chain length (number of data-qubit flips) between stabs i and j. */
  dist: number[][];
  /** next[i][j]: neighbor of i on a shortest path toward j. */
  next: number[][];
  /** Shared data qubit used to step between adjacent stabs i, j. */
  stepQubit: Map<string, number>;
  /** distB[i]: chain length from stab i off the nearest boundary. */
  distB: number[];
  /** Boundary-exit qubit per stab (the final flip), for stabs with distB[i]===1. */
  exitQubit: (number | null)[];
  /** nextB[i]: neighbor of i on a shortest path toward the boundary (−1 = exit here). */
  nextB: number[];
}

function buildTypeGraph(lat: Lattice, type: 'X' | 'Z'): TypeGraph {
  const stabs = lat.stabilizers.filter((s) => s.type === type);
  const m = stabs.length;
  const owners = new Map<number, number[]>();
  stabs.forEach((s, i) => {
    for (const q of s.qubits) {
      const list = owners.get(q) ?? [];
      list.push(i);
      owners.set(q, list);
    }
  });

  const adj: number[][] = Array.from({ length: m }, () => []);
  const stepQubit = new Map<string, number>();
  const exitQubit: (number | null)[] = new Array<number | null>(m).fill(null);
  for (const [q, list] of owners) {
    if (list.length === 2) {
      const [a, b] = list;
      if (!stepQubit.has(`${a},${b}`)) {
        adj[a].push(b);
        adj[b].push(a);
        stepQubit.set(`${a},${b}`, q);
        stepQubit.set(`${b},${a}`, q);
      }
    } else if (list.length === 1) {
      // A qubit checked by only one stabilizer of this type: an error there
      // creates a single defect, so it is this stabilizer's boundary exit.
      exitQubit[list[0]] = q;
    }
  }

  // All-pairs BFS over the stabilizer adjacency graph.
  const dist: number[][] = [];
  const next: number[][] = [];
  for (let src = 0; src < m; src++) {
    const dSrc = new Array<number>(m).fill(Infinity);
    const parent = new Array<number>(m).fill(-1);
    dSrc[src] = 0;
    const queue = [src];
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head];
      for (const v of adj[u]) {
        if (dSrc[v] === Infinity) {
          dSrc[v] = dSrc[u] + 1;
          parent[v] = u;
          queue.push(v);
        }
      }
    }
    // next[src][j] = first hop from src toward j (walk j's parent chain back).
    const nSrc = new Array<number>(m).fill(-1);
    for (let j = 0; j < m; j++) {
      if (j === src || dSrc[j] === Infinity) continue;
      let hop = j;
      while (parent[hop] !== src) hop = parent[hop];
      nSrc[j] = hop;
    }
    dist.push(dSrc);
    next.push(nSrc);
  }

  // Boundary distances: distB[i] = min over exits e of dist[i][e] + 1.
  const distB = new Array<number>(m).fill(Infinity);
  const nextB = new Array<number>(m).fill(-1);
  for (let i = 0; i < m; i++) {
    for (let e = 0; e < m; e++) {
      if (exitQubit[e] === null) continue;
      const total = dist[i][e] + 1;
      if (total < distB[i]) {
        distB[i] = total;
        nextB[i] = i === e ? -1 : next[i][e];
      }
    }
  }

  return { stabs, dist, next, stepQubit, distB, exitQubit, nextB };
}

const typeGraphCache = new Map<string, TypeGraph>();
function typeGraph(lat: Lattice, type: 'X' | 'Z'): TypeGraph {
  const key = `${lat.d}:${type}`;
  let g = typeGraphCache.get(key);
  if (!g) {
    g = buildTypeGraph(lat, type);
    typeGraphCache.set(key, g);
  }
  return g;
}

export interface MatchPair {
  a: string;
  b: string | 'boundary';
  /** Data qubits flipped by the correction chain. */
  qubits: number[];
}

/**
 * Pair up defects minimizing total chain length; each defect may match another
 * defect or the boundary. Exact (bitmask DP) for ≤ MAX_EXACT_DEFECTS defects.
 */
function matchDefects(g: TypeGraph, defects: number[]): { pairs: [number, number | -1][]; exact: boolean } {
  const m = defects.length;
  if (m === 0) return { pairs: [], exact: true };
  const d = (i: number, j: number) => g.dist[defects[i]][defects[j]];
  const dB = (i: number) => g.distB[defects[i]];

  if (m <= MAX_EXACT_DEFECTS) {
    const memo = new Map<number, { cost: number; choice: number }>();
    const solve = (mask: number): number => {
      if (mask === 0) return 0;
      const hit = memo.get(mask);
      if (hit) return hit.cost;
      const i = 31 - Math.clz32(mask & -mask); // lowest set bit index
      let best = dB(i) + solve(mask & ~(1 << i));
      let choice = -1;
      for (let j = i + 1; j < m; j++) {
        if (!(mask & (1 << j))) continue;
        const cost = d(i, j) + solve(mask & ~(1 << i) & ~(1 << j));
        if (cost < best) {
          best = cost;
          choice = j;
        }
      }
      memo.set(mask, { cost: best, choice });
      return best;
    };
    solve((1 << m) - 1);
    const pairs: [number, number | -1][] = [];
    let mask = (1 << m) - 1;
    while (mask !== 0) {
      const i = 31 - Math.clz32(mask & -mask);
      const choice = memo.get(mask)!.choice;
      pairs.push([defects[i], choice === -1 ? -1 : defects[choice]]);
      mask &= ~(1 << i);
      if (choice !== -1) mask &= ~(1 << choice);
    }
    return { pairs, exact: true };
  }

  // Greedy fallback: repeatedly take the globally cheapest pairing.
  const alive = new Set(defects.map((_, i) => i));
  const pairs: [number, number | -1][] = [];
  while (alive.size > 0) {
    let bestCost = Infinity;
    let bestI = -1;
    let bestJ = -2; // -2 = unset, -1 = boundary
    for (const i of alive) {
      if (dB(i) < bestCost) {
        bestCost = dB(i);
        bestI = i;
        bestJ = -1;
      }
      for (const j of alive) {
        if (j <= i) continue;
        if (d(i, j) < bestCost) {
          bestCost = d(i, j);
          bestI = i;
          bestJ = j;
        }
      }
    }
    if (bestI === -1) {
      // Unreachable on a connected lattice (every defect has a finite boundary
      // distance), but guard the while-loop: match any stranded defects to the
      // boundary rather than spin forever on a no-op alive.delete(-1).
      for (const i of alive) pairs.push([defects[i], -1]);
      break;
    }
    alive.delete(bestI);
    pairs.push([defects[bestI], bestJ === -1 ? -1 : defects[bestJ]]);
    if (bestJ >= 0) alive.delete(bestJ);
  }
  return { pairs, exact: false };
}

/** Data qubits along a shortest correction chain between two stabs (or to the boundary). */
function chainQubits(g: TypeGraph, from: number, to: number | -1): number[] {
  const qubits: number[] = [];
  let u = from;
  if (to === -1) {
    while (g.exitQubit[u] === null || g.distB[u] > 1) {
      const v = g.nextB[u];
      if (v === -1) break;
      qubits.push(g.stepQubit.get(`${u},${v}`)!);
      u = v;
    }
    if (g.exitQubit[u] !== null) qubits.push(g.exitQubit[u]!);
  } else {
    while (u !== to) {
      const v = g.next[u][to];
      qubits.push(g.stepQubit.get(`${u},${v}`)!);
      u = v;
    }
  }
  return qubits;
}

export interface DecodeResult {
  /** Correction to apply (XOR with the error pattern). */
  correction: Pauli[];
  matches: MatchPair[];
  /** True if every defect count was small enough for exact matching. */
  exact: boolean;
  /** Residual after correction acts as logical X / logical Z. */
  logicalXFlip: boolean;
  logicalZFlip: boolean;
  success: boolean;
}

export function decode(lat: Lattice, errors: Pauli[]): DecodeResult {
  const syndrome = computeSyndrome(lat, errors);
  const correction: Pauli[] = new Array<Pauli>(lat.n).fill(0);
  const matches: MatchPair[] = [];
  let exact = true;

  // Z-type defects ← X errors, fixed with X chains; X-type defects ← Z errors.
  for (const type of ['Z', 'X'] as const) {
    const g = typeGraph(lat, type);
    const pauli: Pauli = type === 'Z' ? 1 : 2;
    const defects = g.stabs
      .map((s, i) => (syndrome.has(s.id) ? i : -1))
      .filter((i) => i !== -1);
    const { pairs, exact: ex } = matchDefects(g, defects);
    exact &&= ex;
    for (const [a, b] of pairs) {
      const qubits = chainQubits(g, a, b);
      for (const q of qubits) correction[q] = (correction[q] ^ pauli) as Pauli;
      matches.push({ a: g.stabs[a].id, b: b === -1 ? 'boundary' : g.stabs[b].id, qubits });
    }
  }

  const residual = errors.map((e, q) => (e ^ correction[q]) as Pauli);
  if (computeSyndrome(lat, residual).size !== 0) {
    // Should be impossible: every matching clears the syndrome by construction.
    throw new Error('decoder failed to clear the syndrome');
  }
  // Residual X-component anticommutes with logical Z on odd overlap → logical X flip.
  const overlapParity = (support: number[], bit: 1 | 2) =>
    support.reduce((acc, q) => acc ^ (residual[q] & bit ? 1 : 0), 0);
  const logicalXFlip = overlapParity(lat.logicalZ, 1) === 1;
  const logicalZFlip = overlapParity(lat.logicalX, 2) === 1;

  return {
    correction,
    matches,
    exact,
    logicalXFlip,
    logicalZFlip,
    success: !logicalXFlip && !logicalZFlip,
  };
}

/**
 * Whether a (syndrome-free) error pattern acts as a logical operator.
 * Only meaningful when the pattern commutes with all stabilizers.
 */
export function logicalFlips(lat: Lattice, pattern: Pauli[]): { x: boolean; z: boolean } {
  const parity = (support: number[], bit: 1 | 2) =>
    support.reduce((acc, q) => acc ^ (pattern[q] & bit ? 1 : 0), 0);
  return { x: parity(lat.logicalZ, 1) === 1, z: parity(lat.logicalX, 2) === 1 };
}

/* ------------------------------------------------------------------ */
/* Stim export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Export the lattice as a Stim memory-Z experiment (`d` noisy rounds of
 * syndrome extraction, depolarizing data noise + noisy ancilla measurement).
 *
 * Conventions match stim's generated rotated_memory_z circuits: data qubits
 * at odd (x, y) = (2c+1, 2r+1), ancillas at even (2fc, 2fr). CNOT schedule:
 * X ancillas touch corners in (dx,dy) order (1,1),(1,−1),(−1,1),(−1,−1) and
 * Z ancillas (1,1),(−1,1),(1,−1),(−1,−1) — the standard zigzag ordering.
 */
export function toStimCircuit(lat: Lattice, p: number, rounds: number = lat.d): string {
  const { d, n, stabilizers } = lat;
  const S = stabilizers.length;
  const ancIndex = (i: number) => n + i;
  const dataAt = new Map<string, number>();
  for (let r = 0; r < d; r++) for (let c = 0; c < d; c++) dataAt.set(`${2 * c + 1},${2 * r + 1}`, qubitIndex(d, r, c));

  const lines: string[] = [];
  const push = (s: string) => lines.push(s);
  const fmtP = Number(p.toFixed(6));

  push(`# Rotated surface code memory-Z experiment, distance ${d}, ${rounds} rounds.`);
  push(`# Generated by Lattice Atlas — Surface Code Lab (physical error rate p = ${fmtP}).`);
  push(`# Noise: DEPOLARIZE1(p) on data each round, X_ERROR(p) on ancillas before measurement.`);
  for (let r = 0; r < d; r++)
    for (let c = 0; c < d; c++) push(`QUBIT_COORDS(${2 * c + 1}, ${2 * r + 1}) ${qubitIndex(d, r, c)}`);
  stabilizers.forEach((s, i) => push(`QUBIT_COORDS(${2 * s.fc}, ${2 * s.fr}) ${ancIndex(i)}`));

  const dataIds = Array.from({ length: n }, (_, q) => q).join(' ');
  const ancIds = stabilizers.map((_, i) => ancIndex(i)).join(' ');
  const xAnc = stabilizers.flatMap((s, i) => (s.type === 'X' ? [ancIndex(i)] : []));

  push(`R ${dataIds} ${ancIds}`);
  push('TICK');

  const X_ORDER = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ] as const;
  const Z_ORDER = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ] as const;

  const roundBody = (first: boolean) => {
    push(`DEPOLARIZE1(${fmtP}) ${dataIds}`);
    if (xAnc.length > 0) push(`H ${xAnc.join(' ')}`);
    push('TICK');
    for (let layer = 0; layer < 4; layer++) {
      const cx: number[] = [];
      stabilizers.forEach((s, i) => {
        const [dx, dy] = (s.type === 'X' ? X_ORDER : Z_ORDER)[layer];
        const q = dataAt.get(`${2 * s.fc + dx},${2 * s.fr + dy}`);
        if (q === undefined) return; // boundary stabilizer: corner off the lattice
        if (s.type === 'X') cx.push(ancIndex(i), q);
        else cx.push(q, ancIndex(i));
      });
      if (cx.length > 0) push(`CX ${cx.join(' ')}`);
      push('TICK');
    }
    if (xAnc.length > 0) push(`H ${xAnc.join(' ')}`);
    push('TICK');
    push(`X_ERROR(${fmtP}) ${ancIds}`);
    push(`MR ${ancIds}`);
    // After MR, ancilla i is measurement record rec[-(S - i)].
    stabilizers.forEach((s, i) => {
      const cur = -(S - i);
      if (first) {
        // Data start in |0…0⟩: Z-stabilizer outcomes are deterministic.
        if (s.type === 'Z') push(`DETECTOR(${2 * s.fc}, ${2 * s.fr}, 0) rec[${cur}]`);
      } else {
        push(`DETECTOR(${2 * s.fc}, ${2 * s.fr}, 0) rec[${cur}] rec[${cur - S}]`);
      }
    });
  };

  roundBody(true);
  if (rounds > 1) {
    push(`REPEAT ${rounds - 1} {`);
    roundBody(false);
    push('}');
  }

  push(`M ${dataIds}`);
  // Data qubit q is rec[-(n - q)]; last-round ancilla i is rec[-(n + S - i)].
  stabilizers.forEach((s, i) => {
    if (s.type !== 'Z') return;
    const recs = s.qubits.map((q) => `rec[${-(n - q)}]`).join(' ');
    push(`DETECTOR(${2 * s.fc}, ${2 * s.fr}, 1) ${recs} rec[${-(n + S - i)}]`);
  });
  push(`OBSERVABLE_INCLUDE(0) ${lat.logicalZ.map((q) => `rec[${-(n - q)}]`).join(' ')}`);
  return lines.join('\n') + '\n';
}

/**
 * A small, exact statevector simulator for the Circuit Composer.
 *
 * This is real linear algebra — a full 2^n complex amplitude vector with the
 * standard gate operators applied in order — not a pattern-matched summary.
 * Convention: qubit 0 is the most-significant bit, so basis index i maps to the
 * bit string with qubit q at position (n-1-q). |q0 q1 … q(n-1)⟩ reads top wire
 * first, matching the UI.
 */

export interface Complex {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const mul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const prob = (a: Complex): number => a.re * a.re + a.im * a.im;

export type SingleGate = 'H' | 'X' | 'Z' | 'S' | 'T';
export type GateName = SingleGate | 'CX';

export interface SimGate {
  type: GateName;
  qubit: number;
  targetQubit?: number;
}

// 2×2 gate matrices as [m00, m01, m10, m11].
type Matrix2 = [Complex, Complex, Complex, Complex];
const R = Math.SQRT1_2; // 1/√2

const SINGLE: Record<SingleGate, Matrix2> = {
  H: [cx(R), cx(R), cx(R), cx(-R)],
  X: [cx(0), cx(1), cx(1), cx(0)],
  Z: [cx(1), cx(0), cx(0), cx(-1)],
  S: [cx(1), cx(0), cx(0), cx(0, 1)], // diag(1, i)
  T: [cx(1), cx(0), cx(0), cx(R, R)], // diag(1, e^{iπ/4})
};

function applySingle(state: Complex[], n: number, q: number, m: Matrix2): Complex[] {
  const out = state.slice();
  const shift = n - 1 - q;
  for (let i = 0; i < state.length; i++) {
    if (((i >> shift) & 1) === 0) {
      const j = i | (1 << shift);
      const a0 = state[i];
      const a1 = state[j];
      out[i] = add(mul(m[0], a0), mul(m[1], a1));
      out[j] = add(mul(m[2], a0), mul(m[3], a1));
    }
  }
  return out;
}

function applyCX(state: Complex[], n: number, control: number, target: number): Complex[] {
  const out = state.slice();
  const cShift = n - 1 - control;
  const tShift = n - 1 - target;
  for (let i = 0; i < state.length; i++) {
    // For each control=1, target=0 index, swap with its target=1 partner.
    if (((i >> cShift) & 1) === 1 && ((i >> tShift) & 1) === 0) {
      const j = i | (1 << tShift);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
  }
  return out;
}

/** Run the gate list on |0…0⟩ and return the resulting amplitude vector. */
export function simulate(gates: SimGate[], n: number): Complex[] {
  let state: Complex[] = Array.from({ length: 1 << n }, (_, i) => cx(i === 0 ? 1 : 0));
  for (const g of gates) {
    if (g.type === 'CX') {
      if (g.targetQubit === undefined || g.targetQubit === g.qubit) continue;
      state = applyCX(state, n, g.qubit, g.targetQubit);
    } else {
      state = applySingle(state, n, g.qubit, SINGLE[g.type]);
    }
  }
  return state;
}

function fmtNum(x: number): string {
  const r = Math.round(x * 1000) / 1000;
  return Number.isInteger(r) ? r.toString() : r.toFixed(3);
}

function fmtCoeff(a: Complex): string {
  const re = Math.abs(a.re) < 1e-6 ? 0 : a.re;
  const im = Math.abs(a.im) < 1e-6 ? 0 : a.im;
  if (im === 0) return fmtNum(re);
  if (re === 0) return `${fmtNum(im)}i`;
  return `(${fmtNum(re)} ${im >= 0 ? '+' : '−'} ${fmtNum(Math.abs(im))}i)`;
}

/** Human-readable superposition, e.g. "0.707·|000⟩ − 0.707·|011⟩". */
export function formatStatevector(state: Complex[], n: number): string {
  const terms: string[] = [];
  for (let i = 0; i < state.length; i++) {
    if (prob(state[i]) < 1e-9) continue;
    const bits = i.toString(2).padStart(n, '0');
    terms.push(`${fmtCoeff(state[i])}·|${bits}⟩`);
  }
  if (terms.length === 0) return '0';
  return terms.join('  +  ').replace(/\+\s+−/g, '−  ').replace(/\+\s+-/g, '−  ');
}

/** Measurement probabilities for the nonzero basis states. */
export function formatProbabilities(state: Complex[], n: number): string {
  const parts: string[] = [];
  for (let i = 0; i < state.length; i++) {
    const p = prob(state[i]);
    if (p < 1e-9) continue;
    const bits = i.toString(2).padStart(n, '0');
    parts.push(`P(|${bits}⟩) = ${(p * 100).toFixed(1)}%`);
  }
  return parts.join('   ');
}

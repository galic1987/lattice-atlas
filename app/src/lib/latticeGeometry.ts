import type { Lattice, Stabilizer } from './surfaceCode';

export function qubitPoint(d: number, q: number, cell: number, pad: number): { x: number; y: number } {
  return { x: pad + (q % d) * cell, y: pad + Math.floor(q / d) * cell };
}

export function faceCenter(s: Stabilizer, cell: number, pad: number): { x: number; y: number } {
  return { x: pad + (s.fc - 0.5) * cell, y: pad + (s.fr - 0.5) * cell };
}

export function facePath(lat: Lattice, s: Stabilizer, cell: number, pad: number): string {
  const pts = s.qubits.map((q) => qubitPoint(lat.d, q, cell, pad));
  if (!s.boundary) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[3].x} ${pts[3].y} L ${pts[2].x} ${pts[2].y} Z`;
  }
  const sweep = s.fr === 0 || s.fc === lat.d ? 1 : 0;
  return `M ${pts[0].x} ${pts[0].y} A ${cell / 2} ${cell / 2} 0 0 ${sweep} ${pts[1].x} ${pts[1].y} Z`;
}

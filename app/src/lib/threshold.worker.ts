/**
 * Monte Carlo threshold-sweep worker for the Surface Code Lab.
 *
 * Round-robins over (distance, p) cells: sample depolarizing noise, decode,
 * count logical failures. Posts a progress snapshot after each pass and
 * yields to the event loop so pause messages are honored promptly.
 */
import { buildLattice, decode, sampleDepolarizing, type Lattice } from './surfaceCode';

export interface McCell {
  d: number;
  p: number;
  trials: number;
  fails: number;
}

export interface McProgress {
  type: 'progress';
  cells: McCell[];
  trialsPerSec: number;
  done: boolean;
}

export type McCommand =
  | { cmd: 'start'; distances: number[]; pValues: number[]; maxTrials: number }
  | { cmd: 'pause' }
  | { cmd: 'resume' };

const BATCH = 150;

const ctx = self as unknown as {
  postMessage(msg: McProgress): void;
  onmessage: ((e: MessageEvent<McCommand>) => void) | null;
};

let cells: McCell[] = [];
let lattices = new Map<number, Lattice>();
let running = false;
let maxTrials = 50000;

async function loop() {
  while (running) {
    const t0 = performance.now();
    let did = 0;
    for (const cell of cells) {
      if (!running) break;
      if (cell.trials >= maxTrials) continue;
      const lat = lattices.get(cell.d)!;
      for (let i = 0; i < BATCH; i++) {
        if (!decode(lat, sampleDepolarizing(lat.n, cell.p)).success) cell.fails++;
        cell.trials++;
      }
      did += BATCH;
    }
    const dt = performance.now() - t0;
    const done = cells.every((c) => c.trials >= maxTrials);
    ctx.postMessage({
      type: 'progress',
      cells: cells.map((c) => ({ ...c })),
      trialsPerSec: dt > 0 ? Math.round((did / dt) * 1000) : 0,
      done,
    });
    if (done || did === 0) {
      running = false;
      break;
    }
    // Yield so pause/start messages interleave with the sweep.
    await new Promise((r) => setTimeout(r, 0));
  }
}

ctx.onmessage = (e: MessageEvent<McCommand>) => {
  const msg = e.data;
  if (msg.cmd === 'start') {
    cells = msg.distances.flatMap((d) => msg.pValues.map((p) => ({ d, p, trials: 0, fails: 0 })));
    lattices = new Map(msg.distances.map((d) => [d, buildLattice(d)]));
    maxTrials = msg.maxTrials;
    running = true;
    void loop();
  } else if (msg.cmd === 'pause') {
    running = false;
  } else if (msg.cmd === 'resume' && !running && cells.length > 0) {
    running = true;
    void loop();
  }
};

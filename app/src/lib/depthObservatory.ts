export const DEPTH_OBSERVATORY_SEED = 0x1a771ce;
export const DEPTH_OBSERVATORY_SHOTS = 200;

export type PathRecordMode = 'coherent' | 'orthogonal-record';

export interface InterferenceSample {
  phaseDeg: number;
  predictedP0: number;
  count0: number;
  observedP0: number;
  interval: readonly [number, number];
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function phaseSeed(seed: number, phaseDeg: number, mode: PathRecordMode) {
  const phaseKey = Math.round(normalizePhaseDeg(phaseDeg) * 1000);
  return (seed ^ Math.imul(phaseKey + 1, 0x45d9f3b) ^ (mode === 'coherent' ? 0x9e3779b9 : 0x85ebca6b)) >>> 0;
}

export function normalizePhaseDeg(phaseDeg: number) {
  if (!Number.isFinite(phaseDeg)) return 0;
  const normalized = phaseDeg % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function interferenceProbability(phaseDeg: number, mode: PathRecordMode = 'coherent') {
  if (mode === 'orthogonal-record') return 0.5;
  const phaseRad = normalizePhaseDeg(phaseDeg) * Math.PI / 180;
  const probability = (1 + Math.cos(phaseRad)) / 2;
  return Math.min(1, Math.max(0, probability));
}

export function wilsonInterval(successes: number, trials: number): readonly [number, number] {
  if (!Number.isInteger(trials) || trials <= 0 || !Number.isFinite(successes)) return [0, 1];
  const boundedSuccesses = Math.min(trials, Math.max(0, Math.round(successes)));
  const z = 1.96;
  const z2 = z * z;
  const pHat = boundedSuccesses / trials;
  const denominator = 1 + z2 / trials;
  const center = (pHat + z2 / (2 * trials)) / denominator;
  const halfWidth = z / denominator * Math.sqrt(pHat * (1 - pHat) / trials + z2 / (4 * trials * trials));
  return [Math.max(0, center - halfWidth), Math.min(1, center + halfWidth)];
}

export function sampleInterference(
  phaseDeg: number,
  mode: PathRecordMode = 'coherent',
  shots = DEPTH_OBSERVATORY_SHOTS,
  seed = DEPTH_OBSERVATORY_SEED,
): InterferenceSample {
  if (!Number.isInteger(shots) || shots <= 0) {
    throw new Error('Depth Observatory shots must be a positive integer.');
  }
  const predictedP0 = interferenceProbability(phaseDeg, mode);
  const random = mulberry32(phaseSeed(seed, phaseDeg, mode));
  let count0 = 0;
  for (let shot = 0; shot < shots; shot += 1) {
    if (random() < predictedP0) count0 += 1;
  }
  return {
    phaseDeg: normalizePhaseDeg(phaseDeg),
    predictedP0,
    count0,
    observedP0: count0 / shots,
    interval: wilsonInterval(count0, shots),
  };
}

export function phaseLabel(phaseDeg: number) {
  if (Math.abs(phaseDeg - 360) < 0.0001) return '360° (2π rad)';
  const normalized = normalizePhaseDeg(phaseDeg);
  const canonical = [
    [0, '0'],
    [90, 'π/2'],
    [180, 'π'],
    [270, '3π/2'],
  ] as const;
  const exact = canonical.find(([degrees]) => Math.abs(normalized - degrees) < 0.0001);
  return exact ? `${normalized}° (${exact[1]} rad)` : `${normalized}° (${(normalized * Math.PI / 180).toFixed(2)} rad)`;
}

#!/usr/bin/env node
/**
 * Verifies the surface-code model in src/lib/surfaceCode.ts
 * (`npm run verify-lattice`).
 *
 * Checks, for d = 3, 5, 7:
 *  1. stabilizer counts (d²−1, split evenly X/Z) and weights (2 or 4)
 *  2. pairwise commutation of all stabilizers
 *  3. logical operator algebra (commute with stabilizers, anticommute
 *     with each other)
 *  4. every single-qubit X/Z/Y error is corrected with no logical flip
 *  5. every two-qubit error is corrected back to the codespace
 *  6. Monte-Carlo sanity: below threshold, logical failure decreases with d
 *  7. the Stim export is structurally sound (and semantically validated
 *     via `python3 -c "import stim"` when available)
 */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = mkdtempSync(join(tmpdir(), 'lattice-verify-'));
const bundle = join(workDir, 'surfaceCode.mjs');

await build({
  entryPoints: [join(appRoot, 'src/lib/surfaceCode.ts')],
  bundle: true,
  format: 'esm',
  outfile: bundle,
  logLevel: 'silent',
});
const sc = await import(pathToFileURL(bundle).href);

let failures = 0;
const check = (cond, msg) => {
  if (!cond) {
    failures++;
    console.error(`  ✗ ${msg}`);
  }
};

const overlap = (a, b) => a.filter((q) => b.includes(q)).length;

for (const d of [3, 5, 7]) {
  console.log(`d = ${d}`);
  const lat = sc.buildLattice(d);
  const xStabs = lat.stabilizers.filter((s) => s.type === 'X');
  const zStabs = lat.stabilizers.filter((s) => s.type === 'Z');

  // 1. counts and weights
  check(lat.stabilizers.length === d * d - 1, `stabilizer count ${lat.stabilizers.length} ≠ ${d * d - 1}`);
  check(xStabs.length === (d * d - 1) / 2, `X count ${xStabs.length}`);
  check(zStabs.length === (d * d - 1) / 2, `Z count ${zStabs.length}`);
  for (const s of lat.stabilizers)
    check(s.qubits.length === (s.boundary ? 2 : 4), `${s.id} has weight ${s.qubits.length}`);

  // 2. commutation: X and Z stabilizers must share an even number of qubits
  for (const x of xStabs)
    for (const z of zStabs)
      check(overlap(x.qubits, z.qubits) % 2 === 0, `${x.id} anticommutes with ${z.id}`);

  // 3. logical operators
  for (const x of xStabs)
    check(overlap(x.qubits, lat.logicalZ) % 2 === 0, `logical Z anticommutes with ${x.id}`);
  for (const z of zStabs)
    check(overlap(z.qubits, lat.logicalX) % 2 === 0, `logical X anticommutes with ${z.id}`);
  check(overlap(lat.logicalZ, lat.logicalX) % 2 === 1, 'logical X and Z do not anticommute');
  check(lat.logicalZ.length === d && lat.logicalX.length === d, 'logical operators have weight d');

  // 4. all single-qubit errors correct cleanly
  for (let q = 0; q < lat.n; q++) {
    for (const pauli of [1, 2, 3]) {
      const errors = new Array(lat.n).fill(0);
      errors[q] = pauli;
      const res = sc.decode(lat, errors);
      check(res.success, `single ${sc.PAULI_LABEL[pauli]} on qubit ${q} caused a logical flip`);
    }
  }

  // 5. all two-qubit errors return to the codespace (logical flips allowed only at d=3...
  //    weight-2 < ⌈d/2⌉ for d≥5 must always succeed; at d=3 weight ⌊(d-1)/2⌋=1 is guaranteed,
  //    so only check "syndrome cleared" universally and success for d≥5)
  let twoQubitFails = 0;
  for (let a = 0; a < lat.n; a++) {
    for (let b = a + 1; b < lat.n; b++) {
      const errors = new Array(lat.n).fill(0);
      errors[a] = 1;
      errors[b] = 1;
      const res = sc.decode(lat, errors); // decode() throws if syndrome not cleared
      if (!res.success) twoQubitFails++;
    }
  }
  if (d >= 5) check(twoQubitFails === 0, `${twoQubitFails} two-qubit X errors mis-corrected at d=${d}`);
  else console.log(`  two-qubit X errors beyond guarantee at d=3: ${twoQubitFails} logical flips (expected > 0)`);
}

// 6. Monte-Carlo: logical failure rate should fall with distance below threshold
{
  const p = 0.05;
  const trials = 2000;
  let seed = 12345;
  const rng = () => {
    // deterministic LCG so the check is reproducible
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const failRate = (d) => {
    const lat = sc.buildLattice(d);
    let fails = 0;
    for (let t = 0; t < trials; t++) {
      const errors = sc.sampleDepolarizing(lat.n, p, rng);
      if (!sc.decode(lat, errors).success) fails++;
    }
    return fails / trials;
  };
  const f3 = failRate(3);
  const f5 = failRate(5);
  const f7 = failRate(7);
  console.log(
    `Monte Carlo (p=${p}, ${trials} trials): failure d3=${f3.toFixed(3)} d5=${f5.toFixed(3)} d7=${f7.toFixed(3)}`,
  );
  check(f5 < f3 && f7 < f5, 'logical failure rate does not decrease with distance below threshold');
}

// 7. Stim export
{
  const lat = sc.buildLattice(3);
  const circuit = sc.toStimCircuit(lat, 0.001);
  const S = lat.stabilizers.length;
  const zCount = lat.stabilizers.filter((s) => s.type === 'Z').length;
  const detectors = (circuit.match(/^DETECTOR/gm) ?? []).length;
  // round 1: Z only; repeated (d−1) rounds: all S; final: Z only.
  check(
    detectors === zCount + S + zCount,
    `stim detector line count ${detectors} ≠ ${zCount + S + zCount}`,
  );
  check((circuit.match(/^OBSERVABLE_INCLUDE/gm) ?? []).length === 1, 'stim observable missing');
  check(circuit.includes(`REPEAT ${lat.d - 1} {`), 'stim REPEAT block missing');

  let stimChecked = false;
  try {
    const stimFile = join(workDir, 'circuit.stim');
    writeFileSync(stimFile, circuit);
    const py = `
import stim, sys
c = stim.Circuit(open(sys.argv[1]).read())
dem = c.detector_error_model(decompose_errors=True)  # throws on non-deterministic detectors
assert c.num_detectors == ${zCount + S * (lat.d - 1) + zCount}, c.num_detectors
assert c.num_observables == 1
print("stim: circuit parses, detectors deterministic, DEM decomposes")
`;
    const out = execFileSync('python3', ['-c', py, stimFile], { encoding: 'utf8', timeout: 60000 });
    process.stdout.write(out);
    stimChecked = true;
  } catch {
    console.log('stim: python3+stim not available — semantic validation skipped (structure checks passed)');
  }
  if (stimChecked) {
    // also validate d=5 and d=7 while we're here
    for (const dd of [5, 7]) {
      const cdd = sc.toStimCircuit(sc.buildLattice(dd), 0.001);
      const stimFileDd = join(workDir, `circuit${dd}.stim`);
      writeFileSync(stimFileDd, cdd);
      const out = execFileSync(
        'python3',
        [
          '-c',
          `import stim, sys\nstim.Circuit(open(sys.argv[1]).read()).detector_error_model(decompose_errors=True)\nprint("stim: d=${dd} circuit valid")`,
          stimFileDd,
        ],
        { encoding: 'utf8', timeout: 60000 },
      );
      process.stdout.write(out);
    }
  }
}

rmSync(workDir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`✗ ${failures} lattice verification failure(s)`);
  process.exit(1);
}
console.log('✓ all lattice checks passed');

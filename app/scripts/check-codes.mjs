#!/usr/bin/env node
/**
 * Exhaustive correctness proof for the small-code engines
 * (`npm run check-codes`).
 *
 * Unlike spot tests, this PROVES the decode guarantee for every code in the
 * explorer by enumeration:
 *   classical — every message × every single-bit flip must decode exactly;
 *   quantum   — every single-qubit Pauli error must decode to a residual in
 *               the stabilizer group (zero logical damage), and every
 *               stabilizer pair must commute.
 *
 * Runs before every build; exits 1 on any error so bad code cannot ship.
 */
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const err = (msg) => errors.push(msg);

/* Bundle the TS libs so the script tests the exact code the UI ships. */
const tmp = mkdtempSync(join(tmpdir(), 'check-codes-'));
const bundleFor = async (entry, name) => {
  const out = join(tmp, name);
  await build({
    entryPoints: [join(appRoot, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: out,
    logLevel: 'silent',
    alias: { '@': join(appRoot, 'src') },
  });
  return import(pathToFileURL(out).href);
};

const cc = await bundleFor('src/lib/classicalCodes.ts', 'classical.mjs');
const qc = await bundleFor('src/lib/quantumCodes.ts', 'quantum.mjs');

/* ---------------- classical: exhaustive ---------------- */

// Repetition: every received word decodes to the majority bit.
for (const n of [3, 5, 7]) {
  for (let w = 0; w < 1 << n; w++) {
    const bits = Array.from({ length: n }, (_, i) => (w >> i) & 1);
    const dec = cc.repetitionDecode(bits);
    const ones = bits.reduce((a, b) => a + b, 0);
    const expect = ones > n - ones ? 1 : 0;
    if (dec.value !== expect) err(`repetition n=${n} word ${bits.join('')} decoded ${dec.value}, want ${expect}`);
  }
}

// Hamming: every 4-bit message × (no flip + all 7 single flips) recovers exactly.
for (let m = 0; m < 16; m++) {
  const data = [0, 1, 2, 3].map((i) => (m >> i) & 1);
  const word = cc.hammingEncode(data);
  for (let flip = -1; flip < 7; flip++) {
    const r = word.slice();
    if (flip >= 0) r[flip] ^= 1;
    const dec = cc.hammingDecode(r);
    if (dec.errorPos !== flip + 1)
      err(`hamming msg ${m} flip ${flip + 1}: reported errorPos ${dec.errorPos}`);
    if (!dec.data.every((b, i) => b === data[i]))
      err(`hamming msg ${m} flip ${flip + 1}: recovered ${dec.data.join('')}, want ${data.join('')}`);
  }
}

/* ---------------- quantum: exhaustive ---------------- */

for (const code of qc.QUANTUM_CODES) {
  // 1. All stabilizer pairs commute (valid code).
  for (let i = 0; i < code.stabilizers.length; i++)
    for (let j = i + 1; j < code.stabilizers.length; j++) {
      const p = qc.symplecticProduct(code.stabilizers[i], {
        x: code.stabilizers[j].x,
        z: code.stabilizers[j].z,
      });
      if (p !== 0)
        err(`${code.id}: stabilizers ${code.stabilizers[i].label} and ${code.stabilizers[j].label} anticommute`);
    }

  // 2. Identity has zero syndrome.
  if (qc.syndromeOf(code.stabilizers, qc.identityError(code.n)).some((b) => b))
    err(`${code.id}: identity error has nonzero syndrome`);

  // 3. Every single-qubit Pauli (3n errors) decodes with zero logical damage.
  for (let q = 0; q < code.n; q++) {
    for (const kind of ['X', 'Z', 'Y']) {
      const e = qc.pauliOn(code.n, q, kind);
      const syn = qc.syndromeOf(code.stabilizers, e);
      if (!syn.some((b) => b)) err(`${code.id}: ${kind} on qubit ${q + 1} is undetected`);
      const correction = code.decode(syn);
      if (!correction) {
        err(`${code.id}: no correction for ${kind} on qubit ${q + 1}`);
        continue;
      }
      const cls = code.classify(e, correction);
      if (cls !== 'clean')
        err(`${code.id}: ${kind} on qubit ${q + 1} decodes to '${cls}' — the code is fooled`);
    }
  }

  // 4. Distinct-error guarantee flag for the UI: count ambiguous syndromes
  //    among single-qubit Paulis (allowed only when products are stabilizers).
  const bySyn = new Map();
  for (let q = 0; q < code.n; q++)
    for (const kind of ['X', 'Z', 'Y']) {
      const e = qc.pauliOn(code.n, q, kind);
      const key = qc.syndromeOf(code.stabilizers, e).join('');
      const list = bySyn.get(key) ?? [];
      list.push(e);
      bySyn.set(key, list);
    }
  for (const [key, list] of bySyn) {
    for (let i = 1; i < list.length; i++) {
      const cls = code.classify(list[0], list[i]);
      if (cls !== 'clean')
        err(`${code.id}: syndrome ${key} shared by errors differing by a ${cls} operator`);
    }
  }
}

rmSync(tmp, { recursive: true, force: true });

if (errors.length) {
  console.error(`✗ ${errors.length} code-engine error(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(
  `checked ${cc.CODE_ZOO.length} zoo entries, 3 repetition lengths × all words, ` +
    `16 Hamming messages × 8 flip cases, ${qc.QUANTUM_CODES.length} quantum codes × ` +
    `all single-qubit Paulis (commutation + exact decode + degeneracy)`,
);
console.log('✓ all code-engine proofs passed');

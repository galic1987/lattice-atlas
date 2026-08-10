#!/usr/bin/env node
/**
 * Generate paper visualization clips with Veo 3.1 (direct Gemini API).
 * One clip per landmark paper, using the curated prompts from
 * app/src/components/PaperVeoVideoGallery.tsx. Results land in
 * <repo>/video-inbox/ for review before any wiring.
 *
 * Credentials come from the environment only — never from disk:
 *   GEMINI_API_KEY="..." node generate.mjs [paperId...]
 *
 * With no arguments it runs the full manifest; with ids it runs just those.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(repoRoot, 'video-inbox');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const MODEL = 'veo-3.1-fast-generate-preview';
const NEGATIVE = 'text, letters, words, numbers, captions, labels, watermark, logo, people, faces';

/* Curated prompts (from PaperVeoVideoGallery.tsx), tuned with style + negative constraints. */
const JOBS = [
  {
    id: 'shor-1995',
    prompt:
      'Cinematic photorealistic quantum visualization: nine glowing qubits in a dark navy void grouping into three triplets, bit-flip and phase-flip errors appearing as small red sparks and being gently absorbed by the group, luminous cyan energy grid, soft bloom, dark navy background, no text.',
  },
  {
    id: 'kitaev-1997',
    prompt:
      'Hyperrealistic 3D render: electric and magnetic anyon quasiparticles as small glowing orbs braiding luminous world-line ribbons around each other in a 2+1D spacetime lattice, cyan and violet energy trails, dark navy background, soft bloom, no text.',
  },
  {
    id: 'bravyi-kitaev-1998',
    prompt:
      'Cinematic 3D animation of a planar surface code grid with two kinds of boundaries, glowing cyan and violet plaquettes pulsing softly as they measure parities, a flat dark navy lattice stretching to the horizon, soft bloom, no text.',
  },
  {
    id: 'bravyi-kitaev-2005',
    prompt:
      'Cinematic render of a magic state distillation factory: fifteen cloudy amber crystals feeding into a glowing refinery structure of light, one perfectly clear cyan crystal emerging at the output, dark navy background, soft bloom, no text.',
  },
  {
    id: 'fowler-2012',
    prompt:
      '3D architectural visualization of a vast 2D quantum processor grid executing synchronized measurement cycles, waves of glowing pulses rippling across the lattice in perfect rhythm, matching lines connecting error points, dark navy and cyan palette, no text.',
  },
  {
    id: 'google-willow-2024',
    prompt:
      'Photorealistic render of a superconducting quantum chip mounted inside a golden dilution refrigerator chandelier, its surface covered by a glowing cyan surface-code lattice, cold blue lighting, cables descending from above, cinematic, no text.',
  },
  /* ---- concept explainers (qualitative intuitions only) ---- */
  {
    id: 'concept-superposition',
    prompt:
      'A single glowing point of light hovering inside a translucent sphere of soft haze, the point splitting into a shimmering blur of two possibilities that coexist, cyan and violet tones on dark navy, ethereal, cinematic, no text.',
  },
  {
    id: 'concept-measurement-collapse',
    prompt:
      'A wide shimmering cloud of glowing possibilities floating in a dark navy void, a thin beam of observational light touches it and the cloud snaps instantly into one single bright point, cinematic slow motion, no text.',
  },
  {
    id: 'concept-entanglement',
    prompt:
      'Two small glowing orbs far apart in a dark navy void connected by a taut thread of light, one orb is gently nudged and both react instantly in perfect mirrored synchrony, cyan and violet glow, cinematic, no text.',
  },
  {
    id: 'concept-gate-pulses',
    prompt:
      'A glowing qubit point on the surface of a translucent sphere being smoothly steered along curved paths by soft pulses of light arriving from the side, each pulse rotating the point to a new position, dark navy background, cinematic, no text.',
  },
  {
    id: 'concept-decoherence',
    prompt:
      'A perfectly ordered glowing lattice of light in a dark void slowly fraying at its edges as chaotic stray particles bombard it, the crisp glow dissolving into fuzzy noise at the borders, melancholic cinematic mood, no text.',
  },
  {
    id: 'concept-redundancy-restore',
    prompt:
      'One bright spark of light copying itself into a circle of identical sparks, one copy flickering red and corrupted, the surrounding sparks glowing brighter and gently restoring the corrupted one back to cyan, dark navy background, cinematic, no text.',
  },
  {
    id: 'concept-merge-split-patches',
    prompt:
      'Two separate glowing square patches of lattice light floating in a dark navy void, slowly flowing together along one edge into a single larger patch, glowing seam bright along the join, then gently separating again, cinematic, no text.',
  },
  {
    id: 'concept-toric-loops',
    prompt:
      'A glowing wireframe torus in a dark navy starfield with two luminous ribbons of light looping around it in different directions, one through the hole and one around the rim, the ribbons trying to shrink but unable to contract, cinematic, no text.',
  },
  {
    id: 'concept-defect-holes',
    prompt:
      'A pristine glowing lattice grid with two smooth holes punched into it, each hole holding a small orb of captured light like a tiny lantern, the lattice glowing protectively around the holes, dark navy background, cinematic, no text.',
  },
  {
    id: 'concept-threshold-seawall',
    prompt:
      'Waves of chaotic glowing noise rolling toward a tall wall of ordered lattice light in a dark sea, small waves breaking harmlessly against the wall and dissolving, the lattice standing calm behind, cinematic wide shot, no text.',
  },
];

const requested = process.argv.slice(2);
const jobs = requested.length ? JOBS.filter((j) => requested.includes(j.id)) : JOBS;
if (!jobs.length) {
  console.error(`no matching jobs; available: ${JOBS.map((j) => j.id).join(', ')}`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function submit(prompt) {
  const res = await fetch(`${API}/models/${MODEL}:predictLongRunning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { aspectRatio: '16:9', resolution: '720p', negativePrompt: NEGATIVE },
    }),
  });
  if (!res.ok) throw new Error(`submit ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).name;
}

async function poll(opName, maxMs = 900000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await fetch(`${API}/${opName}`, { headers: { 'x-goog-api-key': KEY } });
    const body = await res.json();
    if (body.done) return body;
    await sleep(10000);
  }
  throw new Error('poll timeout');
}

/* Worker pool: the key allows ~3 concurrent generations. Submit with 429
 * backoff, and never run more than CONCURRENCY jobs at once. */
const CONCURRENCY = 3;

async function runJob(job) {
  let op = null;
  for (let attempt = 0; attempt < 6 && !op; attempt++) {
    try {
      op = await submit(job.prompt);
    } catch (e) {
      if (e.message.includes('429')) {
        console.log(`  ${job.id}: quota busy, retrying in 30s`);
        await sleep(30000);
      } else {
        throw e;
      }
    }
  }
  if (!op) throw new Error('submit failed after quota retries');
  console.log(`▶ ${job.id}: ${op}`);
  const done = await poll(op);
  const uri = done.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) throw new Error(`no video uri in response: ${JSON.stringify(done).slice(0, 200)}`);
  const res = await fetch(uri, { headers: { 'x-goog-api-key': KEY } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const out = join(outDir, `${job.id}.mp4`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${job.id}: saved ${out}`);
}

const queue = [...jobs];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const job = queue.shift();
      try {
        await runJob(job);
      } catch (e) {
        console.error(`✗ ${job.id}: ${e.message}`);
      }
    }
  }),
);

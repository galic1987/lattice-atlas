#!/usr/bin/env node
/**
 * Generate ambient video loops for Lattice Atlas via the Higgsfield DoP
 * (image-to-video) model. Source images are pulled from the live deployed
 * site; results land in <repo>/video-inbox/ for review before any wiring.
 *
 * The v2 SDK submits jobs but does not poll this endpoint's response shape
 * (no request_id on submit), so this script polls /requests/{id}/status
 * itself, using the same Key auth.
 *
 * Credentials come from the environment only — never from disk:
 *   HF_CREDENTIALS="KEY_ID:KEY_SECRET" node generate.mjs [jobName...]
 *
 * With no arguments it runs the full manifest; with names it runs just those.
 */
import { createHiggsfieldClient } from '@higgsfield/client/v2';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(repoRoot, 'video-inbox');
const SITE = 'https://galic1987.github.io/lattice-atlas';
const API = 'https://platform.higgsfield.ai';
const CREDENTIALS = process.env.HF_CREDENTIALS;
if (!CREDENTIALS) {
  console.error('HF_CREDENTIALS is not set (KEY_ID:KEY_SECRET)');
  process.exit(1);
}

/* Ambient, decorative mood motion — no text, no diagrams, no physics claims.
 * Jobs with `source` animate an existing site image; jobs with `imagePrompt`
 * first synthesize their source frame via text-to-image, then animate it. */
const JOBS = [
  {
    name: 'hero-torus-ambience',
    source: `${SITE}/hero_quantum_lattice.jpg`,
    prompt:
      'Extremely slow, calm ambient motion: the wireframe torus rotates almost imperceptibly while particles drift gently and the glow breathes softly. Seamless meditative loop, no camera cuts, no zoom, no text.',
  },
  {
    name: 'anyon-braiding-flow',
    source: `${SITE}/act4_anyon_braiding.jpg`,
    prompt:
      'The braided light strands flow slowly along their paths like gentle currents, subtle shimmer traveling along the weave, particles drifting. Very slow ambient loop, static camera, no text.',
  },
  {
    name: 'metaphor-topology-deformation',
    imagePrompt:
      'Dark navy starfield, a glowing cyan wireframe torus made of lattice lines floating in space, ethereal violet particles, soft bloom, cinematic, no text, no letters.',
    prompt:
      'Invisible forces slowly squash and stretch the torus — it bulges, flattens, and twists — but the central hole never closes and never changes. Slow continuous deformation, static camera, no text.',
  },
  {
    name: 'metaphor-snag-fabric',
    imagePrompt:
      'Dark navy background, a vast woven fabric made of glowing cyan and violet light threads stretching to the horizon, ethereal, soft bloom, cinematic, no text, no letters.',
    prompt:
      'One thread snags and frays slightly, the neighboring threads flare brighter around the snag, then the weave gently settles back to calm. Slow ambient motion, static camera, no text.',
  },
  {
    name: 'metaphor-watchers-box',
    imagePrompt:
      'Dark navy starfield, a sealed glowing box made of lattice panels floating in space, small emerald glowing orbs hovering around it like sentinel watchers, cinematic, soft bloom, no text, no letters.',
    prompt:
      'The emerald orbs pulse slowly as they watch the sealed box; one orb flashes amber in alarm a few times, then calms; the box stays sealed and untouched the whole time. Static camera, no text.',
  },
  {
    name: 'metaphor-persistent-braid',
    imagePrompt:
      'Dark navy background, two glowing ribbons of cyan and violet light braided around each other lying on a dark tilted board with a faint grid pattern, cinematic, soft bloom, no text, no letters.',
    prompt:
      'The board slowly tilts and shakes gently while the two ribbons stay perfectly braided the whole time; a subtle shimmer travels along the ribbons. Slow ambient motion, no text.',
  },
  {
    name: 'metaphor-refining-gems',
    imagePrompt:
      'Dark navy background, a vertical column of light with many cloudy rough amber gemstones floating inside it, one perfectly clear cyan-white gem glowing at the top, cinematic, soft bloom, no text, no letters.',
    prompt:
      'The cloudy amber gems drift slowly upward through the column of light, becoming clearer as they rise, while one perfect clear gem shines steadily at the top. Very slow motion, no text.',
  },
  {
    name: 'metaphor-descent',
    imagePrompt:
      'Dark navy starfield, a glowing microchip made of light seen from far above at an angle, its surface covered in a grid of luminous lattice patches, ethereal particles, cinematic, no text, no letters.',
    prompt:
      'One continuous slow zoom diving down into the chip: the lattice patches grow larger, individual glowing grid points become visible, ending close on softly rippling points of light. Smooth steady zoom, no cuts, no text.',
  },
  {
    name: 'concept-merge-split-patches',
    imagePrompt:
      'Dark navy void, two separate glowing square patches made of cyan lattice light floating apart from each other, soft bloom, cinematic, no text, no letters.',
    prompt:
      'The two glowing lattice patches slowly flow together along one edge into a single larger patch, the seam glowing bright along the join, then gently separate again. Slow smooth motion, static camera, no text.',
  },
  {
    name: 'concept-toric-loops',
    imagePrompt:
      'Dark navy starfield, a bright glowing cyan wireframe torus with two luminous ribbons of light looping around it, one ribbon through the central hole and one around the outer rim, violet accents, soft bloom, cinematic, no text, no letters.',
    prompt:
      'The two luminous ribbons slowly slide around the torus trying to shrink and contract but staying the same length, unable to contract, while the torus glows steadily. Very slow ambient motion, no text.',
  },
  {
    name: 'concept-defect-holes',
    imagePrompt:
      'Dark navy background, a pristine glowing cyan lattice grid with two smooth round holes punched into it, each hole holding a small orb of captured amber light like a tiny lantern, soft bloom, cinematic, no text, no letters.',
    prompt:
      'The lattice glows and pulses gently around the two holes, the small amber orbs inside the holes flicker softly like lanterns, everything else calm and still. Very slow ambient motion, no text.',
  },
  {
    name: 'concept-threshold-seawall',
    imagePrompt:
      'Dark scene, a tall glowing wall made of ordered cyan lattice light standing in a dark sea, small waves of chaotic violet glowing noise rolling toward the wall, cinematic wide shot, soft bloom, no text, no letters.',
    prompt:
      'Small waves of chaotic glowing noise roll against the tall lattice wall and break apart harmlessly, dissolving into sparks, while the wall stands calm and unmoved. Slow rhythmic motion, no text.',
  },
  {
    name: 'concept-toric-loops-v3',
    imagePrompt:
      'Dark navy starfield, a glowing cyan wireframe LIFE PRESERVER ring shape, a flat donut with a big obvious empty hole in the middle, seen at a three-quarter angle, two luminous violet ribbons wrapped around the ring, one passing through the obvious central hole, soft bloom, cinematic, no text, no letters.',
    prompt:
      'The glowing donut ring rotates very slowly showing its big empty central hole at all times, while two violet ribbons slide along its surface trying to shrink but staying the same length, unable to contract. The hole must stay clearly visible. Slow ambient motion, no text.',
  },
  {
    name: 'metaphor-persistent-braid-v3',
    imagePrompt:
      'Dark navy background, two glowing ribbons intertwined in an X-crossing braid on a dark board, one ribbon pure cyan and one ribbon pure violet, only these two colors, cinematic, soft bloom, no text, no letters.',
    prompt:
      'The board slowly tilts while the two ribbons stay perfectly intertwined in their braid. The cyan ribbon stays cyan for the entire video and the violet ribbon stays violet for the entire video, the colors never change, never turn green, never turn red. A subtle shimmer travels along the weave. Slow ambient motion, no text.',
  },
  /* ---- v2 re-prompts (validation rejects) ---- */
  {
    name: 'metaphor-snag-fabric-v2',
    imagePrompt:
      'Dark navy background, a vast woven fabric made ONLY of cyan and violet light threads stretching to the horizon, no other colors, ethereal, soft bloom, cinematic, no text, no letters.',
    prompt:
      'One single thread frays and glows amber while the neighboring cyan threads flare brighter around the frayed spot, then the weave gently settles back to calm. Only cyan, violet and one amber spot, no other colors. Slow ambient motion, static camera, no text.',
  },
  {
    name: 'metaphor-persistent-braid-v2',
    imagePrompt:
      'Dark navy background, two glowing ribbons of cyan and violet light clearly crossing over and under each other in an X-crossing braid pattern on a dark tilted board, the ribbons visibly intertwined, cinematic, soft bloom, no text, no letters.',
    prompt:
      'The board slowly tilts and shakes gently while the two ribbons stay perfectly intertwined in their braid, never uncrossing, a subtle shimmer traveling along the weave. Slow ambient motion, no text.',
  },
  {
    name: 'concept-merge-split-patches-v2',
    imagePrompt:
      'Dark navy void, two separate glowing square patches made ONLY of cyan lattice light floating apart, no other colors, soft bloom, cinematic, no text, no letters.',
    prompt:
      'The two cyan patches drift together and fully merge into ONE single larger glowing patch with a bright seam that fades away, hold one second, then the patch splits back into two patches. Only cyan light, no orange, no red. Slow smooth motion, static camera, no text.',
  },
  {
    name: 'concept-toric-loops-v2',
    imagePrompt:
      'Dark navy starfield, a bright glowing cyan wireframe DONUT shape with a clear central hole, a torus floating in space, two luminous violet ribbons looping around the donut, one ribbon passing through the hole and one around the outside rim, soft bloom, cinematic, no text, no letters.',
    prompt:
      'The two violet ribbons slowly slide along the donut surface trying to shrink smaller but staying the same length, unable to contract off the donut, while the glowing donut rotates very slowly. The donut shape and its hole stay clearly visible at all times. Slow ambient motion, no text.',
  },
];

const requested = process.argv.slice(2);
const jobs = requested.length ? JOBS.filter((j) => requested.includes(j.name)) : JOBS;
if (!jobs.length) {
  console.error(`no matching jobs; available: ${JOBS.map((j) => j.name).join(', ')}`);
  process.exit(1);
}

const client = createHiggsfieldClient({ credentials: CREDENTIALS });
const authHeaders = {
  Authorization: `Key ${CREDENTIALS}`,
  'User-Agent': 'higgsfield-server-js/2.0',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pollStatus(requestId, maxMs = 600000, intervalMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await fetch(`${API}/requests/${requestId}/status`, { headers: authHeaders });
    if (res.ok) {
      const body = await res.json();
      if (['completed', 'failed', 'nsfw'].includes(body.status)) return body;
    }
    await sleep(intervalMs);
  }
  return { status: 'timeout' };
}

mkdirSync(outDir, { recursive: true });

/** Text-to-image for jobs that need a synthesized source frame. Returns the image URL. */
async function generateSourceImage(name, prompt) {
  console.log(`  ${name}: generating source frame`);
  const jobSet = await client.subscribe('/v1/text2image/soul', {
    input: {
      params: { prompt, width_and_height: '1632x1088', quality: '1080p', batch_size: 1 },
    },
    withPolling: false,
  });
  if (!jobSet?.id) throw new Error('image submission returned no request id');
  const final = await pollStatus(jobSet.id);
  if (final.status !== 'completed') throw new Error(`image generation ${final.status}`);
  const url = final.images?.[0]?.url;
  if (!url) throw new Error('image completed but no URL in response');
  return url;
}

for (const job of jobs) {
  console.log(`▶ ${job.name}`);
  let source = job.source;
  try {
    source ??= await generateSourceImage(job.name, job.imagePrompt);
  } catch (e) {
    console.error(`✗ ${job.name}: source frame failed — ${e.message}`);
    continue;
  }
  console.log(`  submitting video (${source.slice(0, 80)}…)`);
  const jobSet = await client.subscribe('/v1/image2video/dop', {
    input: {
      params: {
        model: 'dop-turbo',
        prompt: job.prompt,
        input_images: [{ type: 'image_url', image_url: source }],
      },
    },
    withPolling: false,
  });
  if (!jobSet?.id) {
    console.error(`✗ ${job.name}: submission returned no request id`);
    continue;
  }
  console.log(`  request ${jobSet.id} — polling`);
  const final = await pollStatus(jobSet.id);
  if (final.status !== 'completed') {
    console.error(`✗ ${job.name}: ${final.status}`);
    continue;
  }
  const url = final.video?.url ?? final.images?.[0]?.url;
  if (!url) {
    console.error(`✗ ${job.name}: completed but no media URL in response`);
    continue;
  }
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${job.name}: download failed (${res.status})`);
    continue;
  }
  const out = join(outDir, `${job.name}.mp4`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${job.name}: saved ${out}`);
}

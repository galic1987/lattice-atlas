#!/usr/bin/env node
/**
 * Decorative-art image prep (`npm run prepare-images`).
 *
 * Takes generated images dropped into <repo>/asset-inbox/ (gitignored) and
 * prepares them for shipping in app/public/:
 *   - resamples to the manifest target dimensions via macOS `sips`
 *   - re-encodes JPEGs, stepping quality down until the file is ≤ 300 KiB
 *     (the raster budget enforced by check-bundles); og-image.png stays PNG
 *   - prints a coverage report: which of the 19 assets are present/missing
 *
 * The asset table comes from design/asset-manifest.md when present (any line
 * containing a `name.jpg|png` and a `WxH` size), else the embedded copy of the
 * 19-entry table from design/2026-08-08-decorative-art.md.
 *
 * Missing inbox files are reported, not fatal — the script only exits 1 when
 * an image that IS present fails to process or cannot get under the budget.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(appRoot, '..');
const inboxDir = join(repoRoot, 'asset-inbox');
const publicDir = join(appRoot, 'public');
const manifestPath = join(repoRoot, 'design', 'asset-manifest.md');

const MAX_BYTES = 300 * 1024; // 300 KiB raster budget (check-bundles)
const JPEG_QUALITIES = [85, 75, 65, 55, 45, 35, 25];

// Fallback copy of the 19-asset table (design/2026-08-08-decorative-art.md).
const EMBEDDED_ASSETS = [
  { file: 'tier-1.jpg', width: 1200, height: 675 },
  { file: 'tier-2.jpg', width: 1200, height: 675 },
  { file: 'tier-3.jpg', width: 1200, height: 675 },
  { file: 'tier-4.jpg', width: 1200, height: 675 },
  { file: 'tier-5.jpg', width: 1200, height: 675 },
  { file: 'tier-6.jpg', width: 1200, height: 675 },
  { file: 'era-foundations.jpg', width: 1600, height: 500 },
  { file: 'era-cluster-state.jpg', width: 1600, height: 500 },
  { file: 'era-defect-surface.jpg', width: 1600, height: 500 },
  { file: 'era-lattice-surgery.jpg', width: 1600, height: 500 },
  { file: 'era-experimental.jpg', width: 1600, height: 500 },
  { file: 'hero-altitudes.jpg', width: 1600, height: 900 },
  { file: 'hero-foundations-lab.jpg', width: 1600, height: 900 },
  { file: 'hero-surface-lab.jpg', width: 1600, height: 900 },
  { file: 'hero-decoder-duel.jpg', width: 1600, height: 900 },
  { file: 'hero-review.jpg', width: 1600, height: 900 },
  { file: 'hero-capstone.jpg', width: 1600, height: 900 },
  { file: 'fieldtoday-mood.jpg', width: 1600, height: 900 },
  { file: 'og-image.png', width: 1200, height: 630 },
];

/** Parse `filename.jpg|png … 1200x675` pairs out of the manifest, if present. */
function loadAssets() {
  if (!existsSync(manifestPath)) {
    console.log(`manifest not found at design/asset-manifest.md — using embedded ${EMBEDDED_ASSETS.length}-asset table`);
    return EMBEDDED_ASSETS;
  }
  const text = readFileSync(manifestPath, 'utf8');
  const assets = [];
  const seen = new Set();
  for (const line of text.split('\n')) {
    const m = line.match(/([a-z0-9][a-z0-9-]*\.(?:jpg|jpeg|png)).*?(\d{3,4})\s*[×xX]\s*(\d{3,4})/i);
    if (!m) continue;
    const file = m[1].toLowerCase();
    if (seen.has(file)) continue;
    seen.add(file);
    assets.push({ file, width: Number(m[2]), height: Number(m[3]) });
  }
  if (assets.length === 0) {
    console.log('design/asset-manifest.md had no parseable asset rows — using embedded table');
    return EMBEDDED_ASSETS;
  }
  console.log(`parsed ${assets.length} assets from design/asset-manifest.md`);
  return assets;
}

const fmtKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

/** Find the inbox file matching `name`, ignoring extension and case. */
function findInboxFile(inboxFiles, name) {
  const stem = name.replace(/\.[^.]+$/, '').toLowerCase();
  return inboxFiles.find((f) => f.replace(/\.[^.]+$/, '').toLowerCase() === stem);
}

/** Process one asset; returns { ok, outBytes?, note? }. Errors throw. */
function prepareAsset(asset, srcPath) {
  const outPath = join(publicDir, asset.file);
  const isPng = asset.file.endsWith('.png');
  // sips: -z height width resamples to exact target dimensions, -s format re-encodes.
  const base = ['-z', String(asset.height), String(asset.width)];

  if (isPng) {
    execFileSync('sips', [...base, '-s', 'format', 'png', srcPath, '--out', outPath], { stdio: 'pipe' });
    const bytes = statSync(outPath).size;
    return { outBytes: bytes, note: bytes > MAX_BYTES ? 'PNG over budget — recompress source' : undefined };
  }

  let lastBytes = 0;
  for (const q of JPEG_QUALITIES) {
    execFileSync(
      'sips',
      [...base, '-s', 'format', 'jpeg', '-s', 'formatOptions', String(q), srcPath, '--out', outPath],
      { stdio: 'pipe' },
    );
    lastBytes = statSync(outPath).size;
    if (lastBytes <= MAX_BYTES) return { outBytes: lastBytes, note: `jpeg q${q}` };
  }
  return { outBytes: lastBytes, note: `over budget even at q${JPEG_QUALITIES.at(-1)}` };
}

const assets = loadAssets();
mkdirSync(publicDir, { recursive: true });

const inboxFiles = existsSync(inboxDir)
  ? readdirSync(inboxDir).filter((f) => !f.startsWith('.'))
  : [];
if (!existsSync(inboxDir)) console.log(`\ninbox not found (expected ${inboxDir}) — nothing to process yet\n`);

const errors = [];
const rows = [];
for (const asset of assets) {
  const hit = findInboxFile(inboxFiles, asset.file);
  if (!hit) {
    rows.push({ file: asset.file, status: 'missing', detail: '' });
    continue;
  }
  const srcPath = join(inboxDir, hit);
  try {
    const { outBytes, note } = prepareAsset(asset, srcPath);
    const over = outBytes > MAX_BYTES;
    rows.push({
      file: asset.file,
      status: over ? 'over budget' : 'ok',
      detail: `${fmtKiB(outBytes)}${note ? ` (${note})` : ''}${hit !== asset.file ? ` [from ${hit}]` : ''}`,
    });
    if (over) errors.push(`${asset.file}: ${fmtKiB(outBytes)} exceeds the 300 KiB budget`);
  } catch (e) {
    rows.push({ file: asset.file, status: 'ERROR', detail: String(e.message || e).split('\n')[0] });
    errors.push(`${asset.file}: sips failed — ${String(e.message || e).split('\n')[0]}`);
  }
}

console.log('\nasset coverage:');
const width = Math.max(...assets.map((a) => a.file.length));
for (const r of rows) console.log(`  ${r.file.padEnd(width)}  ${r.status.padEnd(11)} ${r.detail}`);

const present = rows.filter((r) => r.status !== 'missing').length;
console.log(`\nsummary: ${present}/${assets.length} assets found in asset-inbox/, ${rows.filter((r) => r.status === 'ok').length} prepared into app/public/`);

if (errors.length > 0) {
  console.error('\nerrors:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('all present assets prepared successfully.');

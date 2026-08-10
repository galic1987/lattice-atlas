import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const DIST_DIR = new URL('../dist/', import.meta.url);
const KIB = 1024;

// These limits leave roughly 12–20% headroom over the 2026-08-07 production
// baseline. Keep them explicit: raising a limit should be a reviewed decision,
// not an automatic response to a larger build.
//
// 2026-08-09 (video wiring PR): decorative concept clips live in dist/clips/.
// They load lazily (preload="none", poster-first), so they are NOT part of the
// page-load budget — totalDistributionGzip excludes .mp4 and videos get their
// own explicit caps instead: 4 MiB raw per clip, 45,000 KiB gzip for the whole set.
const LIMITS = Object.freeze({
  entryJavaScriptGzip: 160 * KIB,
  initialJavaScriptGraphGzip: 230 * KIB,
  surfaceLabJavaScriptGzip: 175 * KIB,
  totalJavaScriptGzip: 640 * KIB,
  totalDistributionGzip: 70000 * KIB,
  rasterAssetRaw: 300 * KIB,
  videoClipRaw: 4 * 1024 * KIB,
  totalVideoClipsGzip: 45000 * KIB,
});

if (!existsSync(DIST_DIR)) {
  console.error('Release budget check needs app/dist. Run `npm run build:e2e` first.');
  process.exit(1);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const target = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
      return entry.isDirectory() ? walk(target) : [target];
    });
}

function measure(file) {
  const bytes = readFileSync(file);
  return {
    file,
    path: relative(new URL('../', DIST_DIR).pathname, file.pathname),
    raw: bytes.byteLength,
    gzip: gzipSync(bytes, { level: 9 }).byteLength,
  };
}

function format(bytes) {
  return `${(bytes / KIB).toFixed(1)} KiB`;
}

const files = walk(DIST_DIR).map(measure);
const javascript = files.filter(({ file }) => extname(file.pathname) === '.js');
const rasters = files.filter(({ file }) => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file.pathname));
const videos = files.filter(({ file }) => extname(file.pathname) === '.mp4');
const nonVideo = files.filter(({ file }) => extname(file.pathname) !== '.mp4');
const indexHtml = readFileSync(new URL('index.html', DIST_DIR), 'utf8');
const entryMatch = indexHtml.match(/<script\b[^>]*\bsrc=["']([^"']+\.js)["'][^>]*>/i);

if (!entryMatch) {
  console.error('Could not identify the production entry script in dist/index.html.');
  process.exit(1);
}

const entryName = entryMatch[1].split('/').at(-1);
const entry = javascript.find(({ file }) => file.pathname.endsWith(`/${entryName}`));
const surfaceLab = javascript.find(({ file }) => /\/SurfaceCodeLab-[^/]+\.js$/.test(file.pathname));

if (!entry || !surfaceLab) {
  console.error('Expected entry and SurfaceCodeLab chunks were not both present in app/dist/assets.');
  process.exit(1);
}

const javascriptByPath = new Map(javascript.map((file) => [file.file.pathname, file]));
const initialGraph = new Map();
const pending = [entry];
while (pending.length > 0) {
  const current = pending.pop();
  if (!current || initialGraph.has(current.file.pathname)) continue;
  initialGraph.set(current.file.pathname, current);
  const source = readFileSync(current.file, 'utf8');
  const staticImport = /\b(?:import|export)(?!\s*\()[^;"'\n]*?(?:from\s*)?["']([^"']+\.js)["']/g;
  for (const match of source.matchAll(staticImport)) {
    const dependency = javascriptByPath.get(new URL(match[1], current.file).pathname);
    if (dependency) pending.push(dependency);
  }
}

const totalJavaScriptGzip = javascript.reduce((sum, file) => sum + file.gzip, 0);
const initialJavaScriptGraphGzip = [...initialGraph.values()].reduce((sum, file) => sum + file.gzip, 0);
const totalDistributionGzip = nonVideo.reduce((sum, file) => sum + file.gzip, 0);
const totalVideoClipsGzip = videos.reduce((sum, file) => sum + file.gzip, 0);
const oversizedRasters = rasters.filter(({ raw }) => raw > LIMITS.rasterAssetRaw);
const oversizedVideos = videos.filter(({ raw }) => raw > LIMITS.videoClipRaw);
const failures = [];

function check(label, actual, limit) {
  const ok = actual <= limit;
  console.log(`${ok ? '✓' : '✗'} ${label}: ${format(actual)} / ${format(limit)}`);
  if (!ok) failures.push(`${label} exceeds its budget by ${format(actual - limit)}`);
}

check('entry JavaScript (gzip)', entry.gzip, LIMITS.entryJavaScriptGzip);
check('initial static JavaScript graph (gzip)', initialJavaScriptGraphGzip, LIMITS.initialJavaScriptGraphGzip);
check('Surface Code Lab chunk (gzip)', surfaceLab.gzip, LIMITS.surfaceLabJavaScriptGzip);
check('all JavaScript (gzip)', totalJavaScriptGzip, LIMITS.totalJavaScriptGzip);
check('complete distribution excl. video (gzip)', totalDistributionGzip, LIMITS.totalDistributionGzip);
check('video clips total (gzip)', totalVideoClipsGzip, LIMITS.totalVideoClipsGzip);

console.log(
  `${oversizedRasters.length === 0 ? '✓' : '✗'} raster assets: ${rasters.length} checked, `
  + `limit ${format(LIMITS.rasterAssetRaw)} each`,
);
for (const raster of oversizedRasters) {
  failures.push(`${raster.path} is ${format(raster.raw)} raw`);
}

console.log(
  `${oversizedVideos.length === 0 ? '✓' : '✗'} video clips: ${videos.length} checked, `
  + `limit ${format(LIMITS.videoClipRaw)} each`,
);
for (const video of oversizedVideos) {
  failures.push(`${video.path} is ${format(video.raw)} raw`);
}

if (failures.length > 0) {
  console.error('\nRelease budget failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\n✓ deterministic production bundle budgets passed');

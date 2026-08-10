#!/usr/bin/env node
/**
 * GitHub Pages has no history-API fallback. Give every public SPA route a real
 * index.html so shared deep links return HTTP 200 before React takes over.
 *
 * Each shell also gets ROUTE-SPECIFIC head tags (title, description, canonical,
 * og:url/og:title/og:description/og:image:alt). Social scrapers and crawlers read
 * the STATIC HTML, so without this every route shared the homepage card and the
 * site had 13 duplicate-title pages. Also emits sitemap.xml + robots.txt.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(appRoot, 'dist');
const source = join(dist, 'index.html');

/** Canonical production origin (project Pages site). */
const SITE = 'https://galic1987.github.io/lattice-atlas';
const OG_IMAGE_ALT = 'Lattice Atlas — an interactive map of topological quantum error correction.';

/**
 * Per-route head metadata. The empty-string key is the home page. Titles and
 * descriptions are written to match each page's actual content, not the homepage.
 */
const ROUTE_META = {
  '': {
    title: 'Lattice Atlas — Learn Topological Quantum Error Correction',
    description:
      'An interactive learning companion for Topological Quantum Error Correction: a knowledge map of 26 prerequisite topics, a guided learning path, and a timeline of 23 seminal papers (1998–2026).',
  },
  // Keys are quoted so the check-trust route-shell sentinel (which scans this
  // file's source for each `'route'` literal) still matches every route.
  'foundations': {
    title: 'Foundations — Lattice Atlas',
    description:
      'The prerequisite ground floor of topological quantum error correction: qubits, superposition, measurement, and the linear algebra the rest of the atlas builds on, with hands-on mini-labs.',
  },
  'altitudes': {
    title: 'Altitudes — Six Tiers of Understanding — Lattice Atlas',
    description:
      'The same ideas of topological quantum error correction retold at six rising altitudes, from plain-language intuition up to the research frontier, so you can meet each concept at your level.',
  },
  'map': {
    title: 'Knowledge Map — Lattice Atlas',
    description:
      'A dependency map of the 26 prerequisite topics behind topological quantum error correction — see what each idea rests on and chart your own route through them.',
  },
  'path': {
    title: 'Guided Learning Path — Lattice Atlas',
    description:
      'A structured, act-by-act path through topological quantum error correction, from linear algebra and stabilizers to surface-code decoding and the frontier.',
  },
  'lab': {
    title: 'Surface Code Lab — Lattice Atlas',
    description:
      'A hands-on surface-code lab that runs real computation in your browser: paint errors, watch stabilizers fire, run an exact minimum-weight matching decoder, and sweep the threshold.',
  },
  'experiments': {
    title: 'Experiment Bench — Lattice Atlas',
    description:
      'Interactive experiments in topological quantum error correction — percolation and clusters, stabilizer commutation, and Bloch-sphere state exploration, all computed live.',
  },
  'duel': {
    title: 'Decoder Duel — Lattice Atlas',
    description:
      'A daily puzzle where you play the decoder: read the syndrome, correct the surface-code errors, and race an exact matcher. Keyboard-playable, with a non-revealing hint.',
  },
  'papers': {
    title: 'Papers Timeline — Lattice Atlas',
    description:
      'A timeline of 23 seminal topological quantum error correction papers (1998–2026), from Kitaev’s toric code to the qLDPC and hardware milestones of the present.',
  },
  'field-today': {
    title: 'Field Today — Lattice Atlas',
    description:
      'Where topological quantum error correction stands now: the recent hardware and code milestones, with honest, model-scoped framing of what has and hasn’t been demonstrated.',
  },
  'glossary': {
    title: 'Glossary — Lattice Atlas',
    description:
      'Plain-language definitions of the 61 core terms of topological quantum error correction, cross-linked into the knowledge map and learning path.',
  },
  'review': {
    title: 'Review Deck — Lattice Atlas',
    description:
      'A spaced-review deck that turns the atlas’s topics into recall prompts, so the prerequisites of topological quantum error correction actually stick.',
  },
  'capstone': {
    title: 'Capstone — Lattice Atlas',
    description:
      'The capstone of the Lattice Atlas path: teach the surface code back, from physical qubits to a decoded logical memory, and record what you can explain.',
  },
};

const routes = Object.keys(ROUTE_META).filter((r) => r !== '');

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Rewrite the head of the built index.html for one route. */
function shellFor(html, routePath, meta) {
  const url = routePath ? `${SITE}/${routePath}/` : `${SITE}/`;
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(meta.title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/?>)/,
      `$1${escAttr(meta.description)}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[\s\S]*?("\s*\/?>)/,
      `$1${escAttr(meta.title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[\s\S]*?("\s*\/?>)/,
      `$1${escAttr(meta.description)}$2`,
    );

  // Inject canonical + og:url + og:image:alt just before </head> (idempotent).
  const injected =
    `    <link rel="canonical" href="${url}" />\n` +
    `    <meta property="og:url" content="${url}" />\n` +
    `    <meta property="og:image:alt" content="${escAttr(OG_IMAGE_ALT)}" />\n` +
    `  </head>`;
  out = out.replace('</head>', injected);
  return out;
}

const source_html = readFileSync(source, 'utf8');

// Home page: rewrite dist/index.html in place with canonical/og:url for the root.
writeFileSync(source, shellFor(source_html, '', ROUTE_META['']));

for (const route of routes) {
  const directory = join(dist, route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), shellFor(source_html, route, ROUTE_META[route]));
}

// 404 fallback keeps the homepage head (it is not a canonical page).
copyFileSync(source, join(dist, '404.html'));

// sitemap.xml over the home page + every public route.
const allUrls = ['', ...routes].map((r) => (r ? `${SITE}/${r}/` : `${SITE}/`));
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  allUrls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
  '\n</urlset>\n';
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

// robots.txt — allow all, point at the sitemap.
writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(
  `created ${routes.length} per-route shells (route-specific head), 404 fallback, sitemap.xml (${allUrls.length} urls), robots.txt`,
);

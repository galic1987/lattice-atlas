#!/usr/bin/env node
/**
 * Static trust regressions for claims that ordinary type/data checks cannot catch.
 * Keep these assertions narrow: they guard previously shipped false labels and
 * fabricated execution states, while physics behavior remains covered by
 * verify-lattice.mjs and source review.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(appRoot, path), 'utf8');
const repoRoot = join(appRoot, '..');
const readRepo = (path) => readFileSync(join(repoRoot, path), 'utf8');

let failures = 0;
const check = (condition, message) => {
  if (!condition) {
    failures += 1;
    console.error(`  ✗ ${message}`);
  }
};

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});

const sourceFiles = walk(join(appRoot, 'src')).filter((path) => ['.ts', '.tsx', '.json'].includes(extname(path)));
const sourceEntries = sourceFiles.map((path) => ({ path, source: readFileSync(path, 'utf8') }));

console.log('Trust language');
for (const phrase of [
  'VERIFICATION PASSED: Google Willow',
  'Suppressive Lambda factor Λ = 0.53',
  'WebAssembly / Web Worker Active',
  'IN-BROWSER VERIFIED COMPILER',
  'PHYSICS VERIFIED',
  'STIM VERIFIED',
  'backlog grows exponentially',
  'accumulates backlog exponentially',
  '15-to-1 protocol gives quadratic',
  'collapse the instant a whisper of environment noise strikes',
  'Topological state memory is immune to local physical noise',
  'Star checks detect bit flips (X); plaquette checks detect phase flips (Z)',
  'The code state is restored with 100% fidelity',
  'Export to TopoLS Compiler',
  'Two non-Abelian anyon defects',
  'logical operators are vectors in a quotient space',
  'correcting Pauli errors corrects everything',
  'with an energy gap protecting the ground space',
  'Run a surface code through time and you get exactly a 3D cluster state',
  'The ZX rewrite rules are complete: every equality of linear maps',
  'Raussendorf-Harrington-Gottesman',
  'it saves real overhead',
  "Magic State Distillation: Not as Costly as You Think', arXiv:1905.08916",
  "How do triorthogonal codes beat the 15-to-1 protocol's ratio",
  'Sampling Stim...',
  'Set Google Willow Hardware Preset',
  'proving below-threshold scaling for the first time on hardware!',
]) {
  const hit = sourceEntries.find(({ source }) => source.includes(phrase));
  check(!hit, `retired false claim returned: ${phrase}${hit ? ` (${hit.path.slice(appRoot.length + 1)})` : ''}`);
}

const endpoint = read('src/components/RealQuantumEndpoint.tsx');
check(endpoint.includes('willow_pink'), 'public Willow QVM id is missing');
check(endpoint.includes('classical noisy simulation'), 'QVM is not explicitly labeled classical simulation');
check(endpoint.includes('physical_google_qpu_accessed": false'), 'evidence receipt does not deny physical-QPU access');
check(!endpoint.includes('setTimeout'), 'Willow endpoint contains simulated execution timing');

const sandbox = read('src/components/WasmQuantumSandbox.tsx');
check(sandbox.includes('NOT WASM · NOT A WORKER · NOT HARDWARE'), 'browser sandbox execution label regressed');
check(sandbox.includes('Wilson 95% interval'), 'browser sandbox lost its sampling interval');
check(sandbox.includes('Generated Stim text—not executed here'), 'generated Stim text is not scoped');

const compiler = read('src/components/TopoLSCompiler.tsx');
check(compiler.includes('COMPILER NOT RUN HERE'), 'TopoLS walkthrough is not labeled non-executing');
check(!compiler.includes('setTimeout'), 'TopoLS walkthrough simulates a compiler run');

const field = read('src/pages/FieldToday.tsx');
for (const required of ['35p³', '13p²', '28p²', 'targetMet']) {
  check(field.includes(required), `magic-state model is missing ${required}`);
}
check(!field.includes('450 physical'), 'unsupported fixed physical-qubit estimate returned');

const spacetime = read('src/components/SpacetimeView3D.tsx');
check(spacetime.includes('data faults accumulate'), 'spacetime model is not cumulative');
check(spacetime.includes('measurement faults'), 'spacetime model omits measurement faults');
check(spacetime.includes('No spacetime MWPM is run'), '2D correction overlay is not disclosed');
check(!spacetime.includes('MWPM Matching Chain'), '2D overlay is mislabeled as spacetime MWPM');

const braidSketch = read('src/components/SpacetimeBraidWeaver.tsx');
check(braidSketch.includes('logical ancilla in |+⟩'), 'lattice-surgery CNOT sketch lost its ancilla convention');
check(braidSketch.includes('not a compiled patch layout'), 'lattice-surgery sketch is not scoped as conceptual');
check(braidSketch.includes('e and m excitations are Abelian'), 'mutual-braid sketch lost the Abelian surface-code boundary');
check(braidSketch.includes('not an executable defect schedule'), 'mutual-braid sketch is not scoped as non-executing');

const surgeryComposer = read('src/components/LatticeSurgeryComposerStudio.tsx');
check(
  surgeryComposer.includes('Illustrative sequence — no stabilizer simulation or circuit execution'),
  'lattice-surgery composer lost its illustrative evidence boundary',
);
check(
  !surgeryComposer.includes('parity measured (+1)'),
  'lattice-surgery composer reinstated a fabricated measured-parity outcome',
);
check(
  !surgeryComposer.includes('Run Joint Parity Check'),
  'lattice-surgery composer relabeled the preview as an executable parity check',
);
check(
  surgeryComposer.includes('not executed or validated'),
  'lattice-surgery composer no longer scopes its Stim snippet as unexecuted',
);
check(
  !surgeryComposer.includes('R 0..'),
  'lattice-surgery composer emits invalid Stim range pseudo-syntax (R 0..N) it tells users to run',
);

const tour = read('src/components/InteractiveTour.tsx');
check(tour.includes('both adjacent Z checks'), 'guided toy lost the two-check X-error invariant');
check(tour.includes('does not run MWPM'), 'guided toy falsely implies a decoder run');
check(tour.includes('does not prove fidelity'), 'guided toy lost its evidence boundary');

const explainer = read('src/components/UniversalExplainer.tsx');
check(explainer.includes('Closed, non-contractible loop') && explainer.includes('Q 150 30 50 80 Z'), 'topology visual lost its closed winding path');
check(explainer.includes('two adjacent Z checks') && explainer.includes('flipping both check outcomes to minus one'), 'stabilizer visual lost the two-check X-error invariant');
check(explainer.includes('For the normalized state') && explainer.includes('|α|² + |β|² = 1'), 'Born visual lost its normalization condition');

const surfaceAsset = read('public/surface-code-diagram.svg');
const dataQubitGroup = surfaceAsset.split('<!-- Nine data qubits')[1]?.split('</g>')[0] ?? '';
check((dataQubitGroup.match(/<circle\b/g) ?? []).length === 9, 'distance-3 home diagram must contain exactly nine data-qubit circles');
check(surfaceAsset.includes('Z2 = −1') && surfaceAsset.includes('Z3 = −1'), 'home diagram lost the center-X syndrome pair');

const app = read('src/App.tsx');
check(app.includes('lazyPage(<NotFound />)'), 'wildcard route does not render a real not-found page');
check(!app.includes('path="*" element={lazyPage(<Home />)}'), 'unknown routes silently render Home');

for (const retired of [
  'public/act2_superposition_paradox.jpg',
  'public/multi_age_cognitive_prism.jpg',
  'public/hero-torus-fallback.svg',
]) {
  check(!existsSync(join(appRoot, retired)), `retired misleading asset still ships: ${retired}`);
}
check(!existsSync(join(appRoot, 'src/components/QuantumArcade.tsx')), 'retired click-the-visible-error arcade returned');

for (const path of sourceFiles.filter((file) => ['.ts', '.tsx'].includes(extname(file)))) {
  const source = readFileSync(path, 'utf8');
  check(!/src\s*=\s*["']\//.test(source), `base-path-unsafe public asset reference in ${path.slice(appRoot.length + 1)}`);
}

const packageJson = JSON.parse(read('package.json'));
const allowedRuntime = new Set(['framer-motion', 'lucide-react', 'react', 'react-dom', 'react-router-dom', 'sonner', 'three']);
for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
  check(allowedRuntime.has(dependency), `unused runtime dependency returned: ${dependency}`);
}

console.log('Release engineering');
check(!existsSync(join(appRoot, 'src/components/DynamicThresholdPlotter.tsx')), 'retired synthetic threshold plotter returned');
const viteConfig = read('vite.config.ts');
check(viteConfig.includes("base: '/'"), 'ordinary production builds must use a root base before any deploy override');
check(!viteConfig.includes('inspectAttr') && !viteConfig.includes('plugin-inspect'), 'production inspector instrumentation returned');

const main = read('src/main.tsx');
check(main.includes("configuredBase === '/' ? undefined"), 'BrowserRouter root-base handling regressed');
check(main.includes('<Toaster '), 'copy and error feedback has no mounted Toaster');
for (const rscApi of ['RSCHydratedRouter', 'RSCStaticRouter', 'matchRSCServerRequest', 'routeRSCServerRequest']) {
  check(!sourceEntries.some(({ source }) => source.includes(rscApi)), `documented static-SPA security boundary regressed: unstable ${rscApi} is now used`);
}

check(packageJson.scripts?.build?.includes('npm run check-trust'), 'production build no longer runs the trust gate');
check(packageJson.scripts?.postbuild === 'node scripts/create-route-shells.mjs', 'production build no longer creates deep-route shells');

const routeShells = read('scripts/create-route-shells.mjs');
for (const route of ['altitudes', 'capstone', 'duel', 'field-today', 'foundations', 'glossary', 'lab', 'map', 'papers', 'path', 'review']) {
  check(app.includes(`path="${route}"`), `public route is missing from App: ${route}`);
  check(routeShells.includes(`'${route}'`), `HTTP-200 route shell is missing: ${route}`);
}
check(routeShells.includes("join(dist, '404.html')"), 'static-host 404 fallback is missing');

for (const workflow of ['.github/workflows/ci.yml', '.github/workflows/deploy.yml']) {
  const source = readRepo(workflow);
  check(source.includes('actions/setup-python@v5'), `${workflow} does not install Python`);
  check(source.includes('stim==1.16.0'), `${workflow} does not pin the Stim verifier`);
  check(source.includes('npm run verify-lattice -- --require-stim'), `${workflow} does not fail closed when Stim is absent`);
  check(source.includes('npx eslint src scripts tests'), `${workflow} does not lint release tests`);
  check(source.includes('npm run check-bundles'), `${workflow} does not enforce production bundle budgets`);
  check(source.includes('npm run test:e2e'), `${workflow} does not run browser release gates`);
}

const latticeVerifier = read('scripts/verify-lattice.mjs');
check(latticeVerifier.includes("process.argv.includes('--require-stim')"), 'lattice verifier lost its required-Stim mode');
check(latticeVerifier.includes('if (stimAvailable)'), 'Stim capability detection and semantic execution are no longer separated');
check(latticeVerifier.includes('Stim semantic validation failed'), 'Stim semantic failures can no longer be distinguished from missing dependencies');
check(latticeVerifier.includes('for (const pauliA of [1, 2, 3])') && latticeVerifier.includes('for (const pauliB of [1, 2, 3])'), 'two-qubit verification no longer covers all Pauli pairs');

console.log('Evidence and share integrity');
const repoClaims = [
  readRepo('README.md'),
  readRepo('notebooks/README.md'),
  readRepo('notebooks/first-threshold-curve.ipynb'),
  readRepo('notebooks/real-hardware-error-suppression.ipynb'),
];
for (const phrase of [
  'measured on actual superconducting qubits',
  'Bigger codes win — measured on actual qubits',
  'Verified end-to-end',
  'PR flow verified end-to-end',
]) {
  check(!repoClaims.some((source) => source.includes(phrase)), `unexecuted evidence overclaim returned: ${phrase}`);
}
check(readRepo('README.md').includes('An unexecuted Stim + PyMatching exercise'), 'README no longer labels the simulator notebook as unexecuted');
check(readRepo('notebooks/README.md').includes('reproduction exercises, not committed execution receipts'), 'notebook evidence boundary regressed');

for (const notebookPath of ['notebooks/first-threshold-curve.ipynb', 'notebooks/real-hardware-error-suppression.ipynb']) {
  const notebook = JSON.parse(readRepo(notebookPath));
  const codeCells = notebook.cells.filter((cell) => cell.cell_type === 'code');
  check(codeCells.length > 0, `${notebookPath} contains no runnable code cells`);
  check(
    codeCells.every((cell) => cell.execution_count == null && Array.isArray(cell.outputs) && cell.outputs.length === 0),
    `${notebookPath} claims an unexecuted state but contains committed execution output`,
  );
  check(!JSON.stringify(notebook).includes('if r > 0 else 0'), `${notebookPath} returned zero-width uncertainty for zero failures`);
}

const certificate = read('src/components/Certificate.tsx');
check(certificate.includes('exploredCount === topics.length'), 'activity record does not condition full-path wording on completion');
check(certificate.includes('self-marked ${exploredCount} of ${topics.length}'), 'partial activity record does not quantify explored topics');

const home = read('src/pages/Home.tsx');
check(home.includes("title: 'Five Explanation Depths'"), 'Home no longer exposes the multi-depth learning route');
check(home.includes('${understoodCount}/${topics.length} self-marked'), 'Home presents self-marked exploration as demonstrated understanding');
const altitudeLens = read('src/components/MultiAgeCognitiveLens.tsx');
check(altitudeLens.includes('{concept.invariant}'), 'altitude lens does not keep its invariant claim visible');

const lessonEmbed = read('src/components/Expandable3B1BCard.tsx');
check(lessonEmbed.includes('youtube-nocookie.com/embed'), 'lesson video does not use the privacy-enhanced YouTube domain');
check(!lessonEmbed.includes('www.youtube.com/embed'), 'standard tracking YouTube embed returned');

const duel = read('src/lib/duel.ts');
check(duel.includes('DUEL_MANIFEST_ID'), 'daily game still mislabels a manual manifest as a content hash');
check(duel.includes('golden vector'), 'daily game compatibility has no deterministic drift sentinel');

const designFiles = walk(join(repoRoot, 'design')).filter((path) => extname(path) === '.md');
const designSource = designFiles.map((path) => readFileSync(path, 'utf8')).join('\n');
for (const retired of ['hero-torus-fallback', '@react-three/fiber', '@react-three/drei', 'GSAP', 'Lenis']) {
  check(!designSource.includes(retired), `retired design dependency or asset returned to authority docs: ${retired}`);
}

if (failures > 0) {
  console.error(`\n${failures} trust regression${failures === 1 ? '' : 's'} found.`);
  process.exit(1);
}

console.log('  ✓ narrow trust regression sentinels passed (this is not a general semantic proof)');

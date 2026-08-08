import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = Number.parseInt(process.env.LATTICE_RELEASE_PORT ?? '4174', 10);
const BASE_PATH = '/lattice-atlas';
const DIST_DIR = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const NOT_FOUND = resolve(DIST_DIR, '404.html');

const MIME = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
});

if (!existsSync(resolve(DIST_DIR, 'index.html'))) {
  console.error('Release server needs app/dist. Run `npm run build:e2e` first.');
  process.exit(1);
}

function insideDist(target) {
  return target === DIST_DIR || target.startsWith(`${DIST_DIR}${sep}`);
}

function resolveRequest(pathname) {
  if (pathname !== BASE_PATH && !pathname.startsWith(`${BASE_PATH}/`)) return null;

  const relativePath = decodeURIComponent(pathname.slice(BASE_PATH.length)).replace(/^\/+/, '');
  let target = resolve(DIST_DIR, relativePath || 'index.html');
  if (!insideDist(target)) return null;

  if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, 'index.html');
  if (!existsSync(target) && extname(target) === '') target = resolve(target, 'index.html');
  return existsSync(target) && statSync(target).isFile() ? target : null;
}

const server = createServer((request, response) => {
  const method = request.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url ?? '/', `http://${HOST}:${PORT}`).pathname;
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  const target = resolveRequest(pathname);
  const fallback = pathname.startsWith(`${BASE_PATH}/`) && existsSync(NOT_FOUND) ? NOT_FOUND : null;
  const file = target ?? fallback;
  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(target ? 200 : 404, {
    'Cache-Control': 'no-store',
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
  });
  if (method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`Serving release build at http://${HOST}:${PORT}${BASE_PATH}/`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

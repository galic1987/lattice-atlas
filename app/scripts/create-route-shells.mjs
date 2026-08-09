#!/usr/bin/env node
/**
 * GitHub Pages has no history-API fallback. Give every public SPA route a real
 * index.html so shared deep links return HTTP 200 before React takes over.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(appRoot, 'dist');
const source = join(dist, 'index.html');
const routes = [
  'altitudes',
  'capstone',
  'duel',
  'experiments',
  'field-today',
  'foundations',
  'glossary',
  'lab',
  'map',
  'papers',
  'path',
  'review',
];

for (const route of routes) {
  const directory = join(dist, route);
  mkdirSync(directory, { recursive: true });
  copyFileSync(source, join(directory, 'index.html'));
}

copyFileSync(source, join(dist, '404.html'));
console.log(`created ${routes.length} route shells and 404 fallback`);

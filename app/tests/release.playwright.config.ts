import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const port = Number.parseInt(process.env.LATTICE_RELEASE_PORT ?? '4174', 10);
const baseURL = `http://127.0.0.1:${port}/lattice-atlas/`;
const appDirectory = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: '../test-results/release-playwright',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1365, height: 900 },
    colorScheme: 'dark',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node scripts/serve-release-build.mjs',
    cwd: appDirectory,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});

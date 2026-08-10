import { expect, test } from '@playwright/test';

const BASE_PATH = '/lattice-atlas/';

const LAB_TOOLS = [
  'lattice-surgery-composer',
  'veo-prompt-refiner',
  'color-code-transversal',
  'spacetime-3d-decoder',
  'ftqc-resource-estimator',
  'code-zoo',
  'surface-3d',
  'braid-3d',
  'circuit-composer',
  'executable-simulator',
  'stim-dem-graph',
  'standard-code-zoo',
  'pipeline-walkthrough',
  'qldpc-tanner-graph',
  'visual-experiments',
  'qft-visualizer',
  'chip-benchmarks',
  'cognitive-prism',
  'manim-gallery',
  'ftqc-compiler',
  'stim-threshold',
  'surgery-welder',
  'multi-manifold',
  'anyon-braid',
  'qec-overhead',
  'stim-uploader',
  't-distillation',
  'mastery-cert',
] as const;

test.describe('Exploration Workbench Smoke & Integration Suite', () => {
  for (const tool of LAB_TOOLS) {
    test(`lab tool ${tool} loads without runtime failures`, async ({ page }) => {
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];

      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });

      const response = await page.goto(`${BASE_PATH}lab/?tab=${tool}`);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      expect(pageErrors, `${tool}: uncaught page errors`).toEqual([]);
      expect(consoleErrors, `${tool}: console errors`).toEqual([]);
    });
  }
});

test.describe('Lattice Surgery Visualizer & Circuit Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_PATH}lab/?tab=lattice-surgery-composer`);
    await expect(page.locator('[data-surgery-canvas]')).toBeVisible({ timeout: 15000 });
  });

  test('all four patches fit inside the workspace without clipping', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add Surface Patch/ });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await addBtn.click();

    const patches = page.locator('[data-surface-patch]');
    await expect(patches).toHaveCount(4);

    const canvasBox = await page.locator('[data-surgery-canvas]').boundingBox();
    expect(canvasBox).not.toBeNull();

    for (const patch of await patches.all()) {
      const box = await patch.boundingBox();
      expect(box).not.toBeNull();

      expect(box!.x).toBeGreaterThanOrEqual(canvasBox!.x - 5);
      expect(box!.y).toBeGreaterThanOrEqual(canvasBox!.y - 5);
      expect(box!.x + box!.width).toBeLessThanOrEqual(canvasBox!.x + canvasBox!.width + 10);
    }
  });

  test('selected operation is represented consistently across UI and Stim code', async ({ page }) => {
    const xWeldBtn = page.getByRole('button', { name: 'X-Weld', exact: true });
    await expect(xWeldBtn).toBeVisible();
    await xWeldBtn.click();

    await expect(xWeldBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-weld-type]')).toHaveAttribute('data-weld-type', 'X-Weld');

    const circuit = await page.locator('pre').innerText();
    expect(circuit).toContain('X_L1_X_L2');
    expect(circuit).toContain('MXX');
    expect(circuit).not.toContain('undefined');
  });
});

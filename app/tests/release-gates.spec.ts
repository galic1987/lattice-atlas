import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const BASE_PATH = '/lattice-atlas/';

test.beforeEach(async ({ page }) => {
  // The application works without remote fonts. Blocking them keeps the release
  // gate deterministic and guarantees the tests never depend on a third party.
  await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, (route) => route.abort());
});

test('base-path routes render and client navigation announces and focuses the page', async ({ page }) => {
  const deepResponse = await page.goto(`${BASE_PATH}altitudes/`);
  expect(deepResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.goto(BASE_PATH);
  const mainNavigation = page.getByRole('navigation', { name: 'Main' });
  await mainNavigation.getByRole('link', { name: 'Glossary', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`${BASE_PATH}glossary/?$`));
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(
    page.locator('[role="status"][aria-live="polite"]').filter({ hasText: 'Glossary page loaded' }),
  ).toHaveText('Glossary page loaded');
});

test('share dialog traps keyboard focus, closes with Escape, and restores its trigger', async ({ page }) => {
  await page.goto(BASE_PATH);
  const trigger = page.getByRole('button', { name: 'Share progress' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Shareable learning snapshot' });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: 'Close learning snapshot' });
  await expect(close).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('reduced-motion preference disables long CSS animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE_PATH);

  const motion = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.animationDuration = '4s';
    probe.style.animationIterationCount = 'infinite';
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const result = {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      durationSeconds: Number.parseFloat(style.animationDuration),
      iterations: style.animationIterationCount,
    };
    probe.remove();
    return result;
  });

  expect(motion.mediaMatches).toBe(true);
  expect(motion.durationSeconds).toBeLessThanOrEqual(0.001);
  expect(motion.iterations).toBe('1');
});

test('Surface Code Lab core loop: paint error -> syndrome -> decode -> challenge credit', async ({ page }) => {
  await page.goto(`${BASE_PATH}lab/`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Paint error by clicking first qubit
  const qubit = page.locator('[role="button"][aria-label*="Data qubit"]').first();
  await qubit.click();

  // Click Decode & correct
  const decodeBtn = page.getByRole('button', { name: /Decode & correct/ });
  await decodeBtn.click();

  // Assert decoder output
  await expect(page.locator('text=✓ corrected — logical sector preserved')).toBeVisible();
});

test('Concept Lookup: all suggested questions resolve without fallback warning', async ({ page }) => {
  await page.goto(BASE_PATH);
  const lookupBtn = page.locator('#concept-lookup-btn');
  await expect(lookupBtn).toBeVisible({ timeout: 15000 });
  await lookupBtn.click();

  const dialog = page.getByRole('dialog', { name: 'TQEC concept lookup' });
  await expect(dialog).toBeVisible();

  const prompts = [
    'What is Topological Quantum Error Correction in 1 sentence?',
    'Why does a distance-5 surface code need 49 physical qubits?',
    'What is Minimum Weight Perfect Matching (MWPM) decoding?',
    'What is Google Willow’s Λ = 2.14 error suppression factor?',
  ];

  for (const promptText of prompts) {
    const promptBtn = dialog.getByText(promptText, { exact: true });
    await promptBtn.click();
    await expect(page.locator('text=I don’t have a reference entry matching that phrasing')).toHaveCount(0);
  }
});

test('representative routes do not create horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of [
    '',
    'foundations/',
    'altitudes/',
    'map/',
    'path/',
    'lab/',
    'duel/',
    'papers/',
    'field-today/',
    'glossary/',
    'review/',
    'capstone/',
  ]) {
    await page.goto(`${BASE_PATH}${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document, `${route || 'home'} document overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.body, `${route || 'home'} body overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test('explanation depth and an Altitude teach-back persist in the unified learning record', async ({ page }) => {
  await page.goto(`${BASE_PATH}altitudes/`);

  const formalDepth = page.getByRole('button', { name: /FORMAL depth/ });
  await formalDepth.click();
  await expect(formalDepth).toHaveAttribute('aria-pressed', 'true');

  await page.getByLabel('Your explanation').fill(
    'The invariant is that a syndrome constrains possible faults; this view leaves out noisy repeated measurements.',
  );
  await page.getByRole('button', { name: 'Save to learning record' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Teach-back completion added' })).toBeVisible();

  await expect.poll(() => page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('lattice-atlas-progress') ?? '{}');
    return {
      depth: record.profile?.explanationDepth,
      teachbacks: record.evidence?.filter((entry: { kind?: string }) => entry.kind === 'altitude-study').length ?? 0,
    };
  })).toEqual({ depth: 'formal', teachbacks: 1 });

  await page.reload();
  await expect(page.getByRole('button', { name: /FORMAL depth/ })).toHaveAttribute('aria-pressed', 'true');
});

test('five-card Review caps a larger due deck without changing the deferred count mid-session', async ({ page }) => {
  await page.addInitScript(() => {
    const now = new Date().toISOString();
    const stages = ['bit-amplitude', 'interference', 'ket-born', 'phase', 'two-qubit'];
    localStorage.setItem('lattice-atlas-progress', JSON.stringify({
      format: 'lattice-atlas-learning-record',
      schemaVersion: 1,
      updatedAt: now,
      migrations: ['legacy-browser-records-v1'],
      profile: { displayName: '', explanationDepth: 'story' },
      activity: { exploredTopics: [], papersRead: [] },
      topicChecks: {},
      evidence: stages.map((stageId, index) => ({
        id: `test-foundation-${index}`,
        recordedAt: now,
        verification: 'local-unsigned',
        kind: 'foundation-prediction',
        stageId,
        selected: 0,
        correct: true,
      })),
    }));
  });

  await page.goto(`${BASE_PATH}review/`);
  await expect(page.getByText('5-card session · about 3 minutes')).toBeVisible();
  await expect(page.getByText('5 deferred to another session')).toBeVisible();

  await page.getByLabel('Recall first: explain it in your own words').fill('A usable recalled definition.');
  await page.getByRole('button', { name: 'Compare with reference' }).click();
  await page.getByRole('button', { name: /Missed it/ }).click();
  await expect(page.getByText('5 deferred to another session')).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('lattice-atlas-progress') ?? '{}');
    return Object.keys(record.reviewSchedule ?? {}).length;
  })).toBe(1);
});

test('capstone records objective checks and an explicitly ungraded two-depth teach-back', async ({ page }) => {
  await page.goto(`${BASE_PATH}capstone/`);

  for (const answer of [
    'An X component on the center data qubit',
    'No—multiple faults or equivalent chains can share a syndrome',
    'That the residual syndrome clears and the chosen logical support is not flipped',
    'Local browser evidence for one explicit idealized model',
  ]) {
    await page.getByRole('button', { name: answer, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Check the declared model' }).click();
  await page.getByLabel(/Story \/ Cause/).fill(
    'Two alarms narrow the possible broken paths, but they are clues rather than a photograph of one exact fault.',
  );
  await page.getByLabel(/Formal \/ Verify/).fill(
    'An X component anticommutes with adjacent Z checks; a correction must clear the residual syndrome without a logical flip.',
  );

  await expect(page.getByRole('heading', { name: 'Transfer task complete.' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('lattice-atlas-progress') ?? '{}');
    const capstones = record.evidence?.filter((entry: { kind?: string }) => entry.kind === 'capstone') ?? [];
    return capstones.at(-1)?.passed;
  })).toBe(true);

  await page.getByRole('button', { name: 'Share progress' }).click();
  const snapshot = page.getByRole('dialog', { name: 'Shareable learning snapshot' });
  await expect(snapshot.getByText(/Best integrative capstone \(4\/4\)/)).toBeVisible();
});

test('an older tab preserves a newer learning-record schema instead of overwriting it', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('lattice-atlas-progress', JSON.stringify({
      format: 'lattice-atlas-learning-record',
      schemaVersion: 999,
      sentinel: 'preserve-me',
    }));
  });
  await page.goto(BASE_PATH);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForTimeout(50);
  await expect.poll(() => page.evaluate(() => {
    const record = JSON.parse(localStorage.getItem('lattice-atlas-progress') ?? '{}');
    return `${record.schemaVersion}:${record.sentinel}`;
  })).toBe('999:preserve-me');
});

test('portable record import restores an empty profile while sanitizing inflated evidence', async ({ page }) => {
  await page.goto(BASE_PATH);
  await page.getByRole('button', { name: 'Share progress' }).click();

  const imported = {
    format: 'lattice-atlas-learning-record',
    schemaVersion: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    migrations: ['legacy-browser-records-v1'],
    profile: { displayName: 'Ada', explanationDepth: 'verify' },
    activity: { exploredTopics: [], papersRead: [] },
    topicChecks: { 'linear-algebra': { correct: 1, total: 1, attempts: 1, checkedAt: '2026-01-01T00:00:00.000Z' } },
    reviewSchedule: { amplitude: { due: '2026-12-01', interval: 4, attempts: 2, recalled: 1 } },
    evidence: [
      { id: 'valid-stage', recordedAt: '2026-01-01T00:00:00.000Z', verification: 'local-unsigned', kind: 'foundation-prediction', stageId: 'bit-amplitude', selected: 0, correct: true },
      { id: 'invented-stage', recordedAt: '2026-01-01T00:00:01.000Z', verification: 'local-unsigned', kind: 'foundation-prediction', stageId: 'invented-sixth-stage', selected: 0, correct: true },
      { id: 'inflated-capstone', recordedAt: '2026-01-01T00:00:02.000Z', verification: 'local-unsigned', kind: 'capstone', capstoneId: 'surface-code-synthesis-v1', correct: 2, total: 4, passed: true },
      { id: 'fake-compatible-duel', recordedAt: '2026-01-01T00:00:03.000Z', verification: 'local-unsigned', kind: 'duel-result', mode: 'daily', puzzleId: 'd20000-v2-deadbeef', score: 150, maxScore: 150, rounds: 10, manifestId: 'deadbeef', schemaVersion: 2, compatible: true },
      { id: 'forged-review', recordedAt: '2026-01-01T00:00:04.000Z', verification: 'local-unsigned', kind: 'review-recall', termSlug: 'forged-term', rating: 'easy', responseProvided: true, attempts: 10 },
    ],
  };

  await page.getByLabel('Import a Lattice Atlas learning record').setInputFiles({
    name: 'learning-record.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await expect(page.getByRole('status').filter({ hasText: 'Merged without deleting' })).toBeVisible();
  await expect(page.getByLabel('Display name')).toHaveValue('Ada');
  await expect(page.getByText('Foundations predictions correct (0/5)')).toBeVisible();
  await expect(page.getByText('Latest compatible Daily Duel (0/150)')).toBeVisible();

  const sanitized = await page.evaluate(() => JSON.parse(localStorage.getItem('lattice-atlas-progress') ?? '{}'));
  expect(sanitized.profile.explanationDepth).toBe('verify');
  expect(sanitized.reviewSchedule.amplitude.interval).toBe(4);
  expect(sanitized.evidence.some((entry: { stageId?: string }) => entry.stageId === 'invented-sixth-stage')).toBe(false);
  expect(sanitized.evidence.find((entry: { id?: string }) => entry.id === 'valid-stage').correct).toBe(false);
  expect(sanitized.evidence.find((entry: { id?: string }) => entry.id === 'inflated-capstone').passed).toBe(false);
  expect(sanitized.evidence.find((entry: { id?: string }) => entry.id === 'fake-compatible-duel').compatible).toBe(false);
  expect(sanitized.evidence.some((entry: { id?: string }) => entry.id === 'forged-review')).toBe(false);
  expect(sanitized.topicChecks['linear-algebra']).toBeUndefined();

  await page.getByLabel('Import a Lattice Atlas learning record').setInputFiles({
    name: 'incomplete-newer.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      format: 'lattice-atlas-learning-record',
      schemaVersion: 1,
      updatedAt: '2099-01-01T00:00:00.000Z',
    })),
  });
  await expect(page.getByRole('status').filter({ hasText: 'required profile, activity, schedule, or evidence fields are missing' })).toBeVisible();
  await expect(page.getByLabel('Display name')).toHaveValue('Ada');
});

test('Decoder Duel guides a fresh player through keyboard play, hints, and a shareable finish', async ({ page }) => {
  await page.goto(`${BASE_PATH}duel/`);
  await expect(page.getByRole('heading', { name: 'The glowing faces are clues, not error locations' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it — let me decode' }).click();
  await page.getByRole('button', { name: 'Start practice' }).click();

  const firstQubit = page.getByRole('button', { name: 'Qubit 1, painted none' });
  await firstQubit.focus();
  await expect(firstQubit).toBeFocused();
  await firstQubit.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Qubit 2, painted none' })).toBeFocused();
  await page.getByRole('button', { name: 'Qubit 2, painted none' }).press('ArrowLeft');
  await expect(firstQubit).toBeFocused();
  await firstQubit.press('Enter');
  await expect(page.getByRole('button', { name: 'Qubit 1, painted X' })).toBeFocused();
  await page.getByRole('button', { name: 'Qubit 1, painted X' }).press('Space');
  await expect(page.getByRole('button', { name: 'Qubit 1, painted none' })).toBeFocused();

  await firstQubit.press('Enter');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: 'Qubit 1, painted none' })).toBeVisible();
  await firstQubit.press('Enter');
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByRole('button', { name: 'Qubit 1, painted none' })).toBeVisible();

  await page.getByRole('button', { name: 'Hint' }).click();
  await expect(page.locator('[role="button"][aria-label*="practice hint location"]')).toHaveCount(1);
  await expect(
    page.locator('[role="status"][aria-live="polite"]').filter({ hasText: 'built-in decoder uses' }),
  ).toBeVisible();

  for (let round = 0; round < 3; round += 1) {
    await page.getByRole('button', { name: 'Reveal and forfeit' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'forfeited' })).toBeFocused();
    if (round === 2) {
      await expect.poll(() => page.evaluate(() => {
        const record = JSON.parse(localStorage.getItem('lattice-atlas-progress') ?? '{}');
        return record.evidence?.filter((entry: { kind?: string; mode?: string }) => entry.kind === 'duel-result' && entry.mode === 'practice').length ?? 0;
      })).toBe(1);
    }
    await page.getByRole('button', { name: round === 2 ? 'See final score' : 'Next round' }).click();
  }
  await expect(page.getByRole('button', { name: 'Share personal best' })).toBeVisible();
  await expect(page.getByText('Local browser result · unverified')).toBeVisible();
});

test('Decoder Duel keeps Daily hints non-revealing', async ({ page }) => {
  await page.goto(`${BASE_PATH}duel/`);
  await page.getByRole('button', { name: 'Got it — let me decode' }).click();
  await page.getByRole('button', { name: "Play today's duel" }).click();
  await page.getByRole('button', { name: 'Hint' }).click();

  await expect(
    page.locator('[role="status"][aria-live="polite"]').filter({ hasText: 'Reference hints stay in Practice' }),
  ).toBeVisible();
  await expect(page.locator('[role="button"][aria-label*="practice hint location"]')).toHaveCount(0);
});

test('Decoder Duel challenge links accept only a compatible full puzzle id', async ({ page }) => {
  await page.goto(`${BASE_PATH}duel/?challenge=d20000-v2-371b5a21`);
  await expect(page.getByText('Challenge received', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept challenge', exact: true })).toBeVisible();

  await page.evaluate(() => {
    history.pushState({}, '', '/lattice-atlas/duel/?challenge=d20001-v2-371b5a21');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByText('d20001-v2-371b5a21', { exact: true }).first()).toBeVisible();

  await page.goto(`${BASE_PATH}duel/?challenge=d20000-v1-incompatible`);
  await expect(
    page.getByRole('status').filter({ hasText: 'Challenge cannot be matched' }),
  ).toBeVisible();
});

test('key pages have no serious/critical WCAG A/AA violations (axe)', async ({ page }) => {
  // Locks the accessibility fixes: every previously-failing page must stay free of
  // serious or critical WCAG 2.0/2.1 A/AA violations. This covers colour-contrast
  // and heading-order (the E2E audit) plus nested-interactive, missing labels,
  // link-in-text-block, and scrollable-region-focusable (found via a full scan).
  // axe-core is injected from node_modules so the check needs no network.
  const axeSource = readFileSync(
    fileURLToPath(new URL('../node_modules/axe-core/axe.min.js', import.meta.url)),
    'utf8',
  );
  // Test the SETTLED DOM under reduced motion: entrance/scroll animations are
  // disabled, so axe can't catch a transient mid-fade contrast state (a fading-in
  // label is momentarily low-contrast even when its resting state passes AA). This
  // keeps the gate deterministic — it asserts the accessibility of what the user
  // actually reads, not a frame in the middle of an animation.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['', 'foundations/', 'altitudes/', 'map/', 'lab/', 'path/', 'experiments/', 'duel/', 'papers/', 'field-today/']) {
    await page.goto(`${BASE_PATH}${route}`, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as { axe: { run: (d: Document, o: unknown) => Promise<{ violations: { id: string; impact: string; nodes: unknown[] }[] }> } }).axe.run(
        document,
        { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } },
      );
      return result.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id} (${v.impact}, ${v.nodes.length})`);
    });
    expect(violations, `serious/critical axe violations on /${route || '(home)'}`).toEqual([]);
  }
});

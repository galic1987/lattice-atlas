const fs = require('fs');

// Update duel.ts
let duelContent = fs.readFileSync('app/src/lib/duel.ts', 'utf8');

const biasedPlanStr = `
export const BIASED_PLAN: RoundPlan[] = [
  { d: 3, errors: 2, allowZ: false },
  { d: 5, errors: 4, allowZ: false },
  { d: 7, errors: 6, allowZ: false },
  { d: 7, errors: 8, allowZ: false },
  { d: 9, errors: 10, allowZ: false },
];
`;

if (!duelContent.includes('BIASED_PLAN')) {
  duelContent = duelContent.replace(
    'export const DAILY_PLAN: RoundPlan[] = [',
    biasedPlanStr + '\nexport const DAILY_PLAN: RoundPlan[] = ['
  );
}

fs.writeFileSync('app/src/lib/duel.ts', duelContent);

// Update DecoderDuel.tsx
let uiContent = fs.readFileSync('app/src/pages/DecoderDuel.tsx', 'utf8');

// Update Mode
uiContent = uiContent.replace(
  "type Mode = 'daily' | 'practice';",
  "type Mode = 'daily' | 'practice' | 'biased';"
);

// Import BIASED_PLAN
if (!uiContent.includes('BIASED_PLAN')) {
  uiContent = uiContent.replace('DAILY_PLAN,', 'BIASED_PLAN,\n  DAILY_PLAN,');
}

// Update max daily score logic (we just need max biased score logic too, maybe just handle it via DAILY_MAX_SCORE or similar)
uiContent = uiContent.replace(
  "const plan = mode === 'daily' ? DAILY_PLAN[roundIdx] : practicePlan(roundIdx);",
  "const plan = mode === 'daily' ? DAILY_PLAN[roundIdx] : mode === 'biased' ? BIASED_PLAN[roundIdx] : practicePlan(roundIdx);"
);

uiContent = uiContent.replace(
  "setGuess(new Array<Pauli>((m === 'daily' ? DAILY_PLAN[0] : practicePlan(0)).d ** 2).fill(0));",
  "setGuess(new Array<Pauli>((m === 'daily' ? DAILY_PLAN[0] : m === 'biased' ? BIASED_PLAN[0] : practicePlan(0)).d ** 2).fill(0));"
);

uiContent = uiContent.replace(
  "const dailyOver = mode === 'daily' && outcomes.length >= DAILY_PLAN.length;",
  "const dailyOver = (mode === 'daily' && outcomes.length >= DAILY_PLAN.length) || (mode === 'biased' && outcomes.length >= BIASED_PLAN.length);"
);

// Just replace multiple instances of dailyOver computation
uiContent = uiContent.replace(
  /const dailyOver = mode === 'daily' && outcomes\.length >= DAILY_PLAN\.length;/g,
  "const dailyOver = (mode === 'daily' && outcomes.length >= DAILY_PLAN.length) || (mode === 'biased' && outcomes.length >= BIASED_PLAN.length);"
);

uiContent = uiContent.replace(
  "const plan = mode === 'daily' ? DAILY_PLAN[idx] : practicePlan(idx);",
  "const plan = mode === 'daily' ? DAILY_PLAN[idx] : mode === 'biased' ? BIASED_PLAN[idx] : practicePlan(idx);"
);

uiContent = uiContent.replace(
  "(mode === 'daily' && outcomes.length >= DAILY_PLAN.length)",
  "((mode === 'daily' && outcomes.length >= DAILY_PLAN.length) || (mode === 'biased' && outcomes.length >= BIASED_PLAN.length))"
);

// Add the Biased card in UI
const biasedCardStr = `
            <div className="rounded-xl border border-ink-600 bg-ink-800 p-6">
              <p className="eyebrow !text-syndrome">{'// CHALLENGE'}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text-hi">Biased Noise</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-mid">
                5 rounds of pure X errors (Z-type syndrome only). High bias means more clustered defects. Can you clear it?
              </p>
              <button type="button" onClick={() => start('biased')} className="btn-primary mt-4 bg-syndrome hover:bg-syndrome/80">
                <Play className="h-4 w-4" /> Start Biased
              </button>
            </div>
`;

if (!uiContent.includes('Start Biased')) {
  uiContent = uiContent.replace(
    'className="grid gap-6 md:grid-cols-2">',
    'className="grid gap-6 md:grid-cols-3">\n' + biasedCardStr
  );
}

fs.writeFileSync('app/src/pages/DecoderDuel.tsx', uiContent);

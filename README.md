# Lattice Atlas

**An interactive learning companion for Topological Quantum Error Correction —
from linear algebra to the research frontier, with claims labeled by their evidence.**

**Live site: https://galic1987.github.io/lattice-atlas/**

![Lattice Atlas](app/public/og-image.png)

Quantum error correction is how quantum computers will survive their own
noise — and it's taught almost entirely through papers that assume you already
understand it. Lattice Atlas is a structured route in: 26 prerequisite topics
across 6 tiers, the 23 papers that built the field (1998 → 2026), and a set of
interactive instruments that let you *do* the physics instead of reading about
it.

## What's inside

- **Knowledge Map & Learning Path** — the full prerequisite tree with
  dependencies, self-check questions, misconception cards, physical-metaphor
  intuitions, five-card spaced review, notes, and a portable versioned learning
  record (all local and unsigned; no accounts or analytics).
- **The Surface Code Lab** — a live rotated surface-code toy (d = 3/5/7): paint
  errors, watch ideal syndromes, run the built-in exact-small/greedy decoder, solve challenges
  (including building an undetectable logical error by hand), and run a
  1.5-million-trial Monte Carlo threshold experiment in your browser.
- **Decoder Duel** — a daily puzzle where *you* are the decoder: same versioned,
  seeded syndrome for every player, judged against the built-in decoder's par, with
  a shareable score line.
- **Paper Explorer** — the canon on a timeline with plain-English summaries,
  reading goals, prerequisite links, and per-paper study plans.
- **Five Altitudes** — five core concepts each explained at five levels
  (age 5 → practitioner), where every level begins by confessing what the
  previous level oversimplified.
- **Synthesis Capstone** — one transfer task that joins the exact d=3 visual,
  stabilizer reasoning, a two-depth teach-back, and an explicit model/evidence
  boundary before adding the attempt to the local record.

## Evidence and reproduction ladder

Selected claims have progressively more realistic reproduction paths. These
levels are not interchangeable: a browser toy, a simulator, and hardware each
support different conclusions.

| Rung | Where | What it verifies |
|---|---|---|
| 1 | [The Lab](https://galic1987.github.io/lattice-atlas/lab) | Ideal-check, i.i.d. data-Pauli toy behavior in the browser; not a circuit-level threshold |
| 2 | [`notebooks/first-threshold-curve.ipynb`](notebooks/first-threshold-curve.ipynb) | An unexecuted Stim + PyMatching exercise for estimating a circuit-model threshold with uncertainty |
| 3 | [`notebooks/real-hardware-error-suppression.ipynb`](notebooks/real-hardware-error-suppression.ipynb) | A credential-gated repetition-code protocol; it becomes hardware evidence only after a run receipt and outcomes are saved |

The in-browser lattice model is CI-checked on every commit: stabilizer
algebra invariants, exhaustive single/two-qubit error correction, Monte-Carlo
error suppression, and fail-closed semantic validation of exported circuits with Python
Stim (`app/scripts/verify-lattice.mjs`).

## How it's built

React + TypeScript + Vite + Tailwind, fully static (GitHub Pages), no backend,
no analytics. Physics content is data (`app/src/data/`) with integrity checks
(`npm run check-data`) enforcing that every cross-reference resolves and every
topic has full coverage — CI blocks any merge that breaks them.

An unusual detail: this site is largely built by **two AI coding agents
(Claude and Gemini) working concurrently** under branch protection, required
CI gates, per-agent git worktrees, and a shared coordination contract —
see [`AGENTS.md`](AGENTS.md). Every change lands through a pull request whose
gates include the physics test suite.

### Dependency audit note

`npm audit` and `npm audit --omit=dev` currently report zero vulnerabilities.
React Router 7.18.2 includes the fix for
[`GHSA-qwww-vcr4-c8h2`](https://github.com/advisories/GHSA-qwww-vcr4-c8h2);
the application remains a static, declarative `BrowserRouter` SPA with no RSC
handler, server actions, loaders, or server runtime.

## Develop

```bash
cd app
npm ci
npm run dev          # local dev server
npm run check-data   # content integrity
npm run verify-lattice -- --require-stim  # physics invariants + fail-closed Stim validation
npx eslint src scripts tests  # source, script, and release-test lint
npm run build        # data/trust/type checks + production build
npm run build:e2e && npm run check-bundles && npm run test:e2e  # deploy-base release gates
```

## Contributing / feedback

Issues and PRs welcome — corrections to physics content are especially
valued (every claim should be checkable; if you find one that isn't, that's
a bug). Open an issue: https://github.com/galic1987/lattice-atlas/issues

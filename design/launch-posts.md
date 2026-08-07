# Launch post drafts

For Ivo to review, edit into his own voice, and post. Both are written to be
credible to experts — every claim in them is true and checkable.

---

## Show HN

**Title:** Show HN: Lattice Atlas – learn quantum error correction by running
the actual experiments

**Body:**

I built an interactive course for topological quantum error correction — the
thing quantum computers need to survive their own noise, and one of the most
paper-gated subjects in physics.

The part I care most about: nothing asks for your trust. The browser has a
live surface code where you paint errors, watch syndromes, and run a real
minimum-weight matching decoder — the in-browser model is CI-tested against
Stim (Google's research simulator) on every commit. You can run a
1.5M-trial Monte Carlo threshold experiment in a tab and watch the famous
"bigger codes win below threshold" curves cross. Then the same experiment
escalates through companion notebooks: Stim+PyMatching (crossing drops to
~1% under circuit noise), and finally a repetition-code memory you run on
IBM's free quantum hardware and measure error suppression yourself.

There's also a daily puzzle (Decoder Duel) where you ARE the decoder — you
see only the syndrome, get judged against the matching decoder's par, same
seeded puzzle worldwide each day.

Honest scoping: the browser lab uses code-capacity noise (perfect
measurements, ~15% threshold) and says so; the notebooks are where circuit
noise and real hardware live. The repetition-code hardware experiment is
the QEC hello-world, not a surface code.

One more oddity: most of the site was built by two AI agents (Claude and
Gemini) working concurrently under branch protection and a CI gate that
includes the physics test suite — the coordination contract is AGENTS.md in
the repo.

Site: https://galic1987.github.io/lattice-atlas/
Repo: https://github.com/galic1987/lattice-atlas

---

## r/QuantumComputing

**Title:** I made a free interactive course for surface codes & QEC — with a
browser lab that's CI-validated against Stim, and a notebook that measures
error suppression on real IBM hardware

**Body:**

Lattice Atlas: 26 prerequisite topics (linear algebra → magic state
cultivation), the 23-paper canon on a timeline with plain-English
summaries and reading goals, a glossary, spaced review, and a set of
interactive instruments:

- **Surface Code Lab**: d=3/5/7 rotated code, paint X/Z/Y errors, run MWPM,
  challenges like "build an undetectable logical error by hand", plus an
  in-browser Monte Carlo threshold sweep (~160k decodes/sec in a worker).
- **Decoder Duel**: daily seeded syndrome puzzle — you decode, the real
  matching decoder sets par.
- **Five Altitudes**: each core concept explained at five levels, where
  every level starts by correcting the previous level's simplification.
- **Verification ladder**: browser model → Stim+PyMatching notebook → a
  free-tier IBM hardware run where you measure Λ yourself.

No accounts, no tracking, no backend — progress lives in your browser.
Everything's open source, and the content pipeline has CI checks so broken
cross-references or physics-test failures can't deploy.

I'd genuinely value corrections from people who work on this — the site's
standard is that every claim should be checkable, so "this claim is wrong /
uncheckable" is exactly the bug report I want.

https://galic1987.github.io/lattice-atlas/

---

## Note for tqec community outreach (email/Discord, not a post)

Keep it short: link the site, mention the Stim-validated in-browser lab and
the art/steppers roadmap, and ask whether a browser TopoLS demo (Pyodide;
core is pure Python per pyproject) would be welcome as an upstream
contribution — that's the collaboration opener, not a launch blast.

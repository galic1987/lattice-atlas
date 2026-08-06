# ASD-STE100 Review — Lattice Atlas

Review of all user-facing English text in `app/`, applying the ASD-STE100-inspired rule set from https://github.com/danyuchn/asd-ste100-skill (one word one meaning, active voice, simple tenses, one instruction per sentence, ≤20 words per instruction / ≤25 per description, ≤3-word noun clusters, no ellipsis, lists for sequences).

Physics domain terms (qubit, stabilizer, syndrome, anyon, lattice surgery, magic state, …) are treated as approved vocabulary. Short UI labels (1–3 words) are exempt.

---

## app/src/components/Layout.tsx

**Verdict:** Very clear — only 2 wording fixes worth making.

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| L1 | footer tagline (line 152) | Figurative "frontier" | "A self-study companion for topological quantum error correction — from linear algebra to the research frontier." | "A self-study companion for topological quantum error correction — from linear algebra to current research." |
| L2 | footer bottom (line 181) | Rare words ("seminal", "curated") | "Content curated from the seminal TQEC literature." | "Content selected from the foundational TQEC literature." |

Left as-is: nav labels, stats line, "Progress is stored locally in your browser. No account, no tracking." (legitimate passive/ellipsis in UI shorthand).

---

## app/src/pages/Home.tsx

**Verdict:** Already clear; ~4 sentences genuinely need changes + 4 word-choice tightenings.

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| H1 | `WhatIsTqec` ¶3 (L209–213) | 36 words, two facts, dangling "which is why" | "The surface code — the workhorse of the field — needs only nearest-neighbor interactions on a 2D grid and tolerates error rates near p_th ≈ 1%, which is why Google, IBM, and dozens of startups are betting on it." | "The surface code is the workhorse of the field. It needs only nearest-neighbor interactions on a 2D grid, and it tolerates error rates near p_th ≈ 1%. That is why Google, IBM, and dozens of startups are betting on it." |
| H2 | `Canon` intro (L594–597) | 26 words + present perfect | "From Bravyi & Kitaev's 1998 planar lattice code to below-threshold hardware experiments and the latest surface-code circuits, these are the papers every TQEC researcher has read." | "These are the papers that every TQEC researcher must read. They run from Bravyi & Kitaev's 1998 planar lattice code to below-threshold hardware experiments and the latest surface-code circuits." |
| H3 | `WhatIsTqec` ¶2 (L203–205) | Passive, actor available | "Information is encoded non-locally — spread across a lattice of physical qubits so that no single local error can destroy it." | "The code encodes the information non-locally. It spreads the information across a lattice of physical qubits, so no single local error can destroy it." |
| H4 | `WhatIsTqec` ¶2 (L205–207) | Passive with stated actor | "The logical qubit lives in the topology of the lattice, the way a hole in a torus can't be removed by a small deformation." | "The logical qubit lives in the topology of the lattice — a small deformation cannot remove a hole in a torus, and a small error cannot remove it." |
| H5 | hero (L130) + `StatsBand` (L322) | Rare word "seminal" | "23 seminal papers" / "Seminal Papers" | "23 landmark papers" / "Landmark Papers" |
| H6 | `WhatIsTqec` ¶1 (L197) | Noun "phase" used as verb | "stray interactions flip them, phase them, leak them" | "stray interactions flip them, shift their phase, or make them leak" |
| H7 | `JOURNEY` tier 5 blurb (L372) | Ambiguous "surgery"/"magic" without domain nouns | "Turning a protected memory into a computer: decoding, braiding, surgery, magic." | "Turning a protected memory into a computer: decoding, braiding, lattice surgery, magic states." |
| H8 | era blurb (L539–540) | Ellipsis, stacked fragments | "Braiding defects and holes; the 2D lattice becomes practical; matching decoders and thresholds." | "This era braids defects and holes, makes the 2D lattice practical, and introduces matching decoders and thresholds." |

Left as-is: topic-list jargon previews (defined on target pages), eyebrows, CTA labels, headline fragments ("Errors are local. Topology is global." — voice copy, excluded from strict STE).

---

## app/src/pages/KnowledgeMap.tsx

**Verdict:** ~90% compliant; 7 strings to change, 4 of them single-word/idiom fixes.

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| K1 | line 229 | Ellipsis — "remembers" what? | "Mark topics understood as you master them; the map remembers." | "Mark topics as understood when you master them. The map saves your marks." |
| K2 | line 226 | Rare word "seminal" | "Every concept you need before the seminal papers make sense" | "Every concept you need before the key papers make sense" |
| K3 | line 146 | Ellipsis, fragment tooltip | "marked understood ✓ — click to unmark" | "Marked as understood ✓ — click to unmark" |
| K4 | line 971 | Informal idiom "deep dive" | "// DEEP DIVE" | "// FULL EXPLANATION" |
| K5 | line 1015 | Metaphor "unlocks" (metadata line already uses "required by") | "// THIS UNLOCKS:" | "// REQUIRED FOR THESE PAPERS:" |
| K6 | line 1097 | Ellipsis fragment question | "Rather follow a guided route?" | "Do you prefer a guided route?" |
| K7 | lines 1100–1101 | Metaphor "walks" | "The learning path walks these same 26 topics in dependency order — one step at a time, with papers unlocked as you go." | "The learning path shows the same 26 topics in dependency order. You learn one topic at a time, and papers unlock as you go." |

Left as-is: stat counters, metadata lines, eyebrow labels, short buttons.

---

## app/src/pages/LearningPath.tsx

**Verdict:** Clear overall; ~9 sentences to change (passive hero/heads-up strings, present-perfect slips, two jargon items).

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| P1 | hero paragraph (line 917) | Passive + two actions | "Your progress is saved locally; leave and come back any time." | "The app saves your progress on this device. You can leave and come back any time." |
| P2 | `MILESTONE_COPY[1]` (line 58) | Ambiguous "freely" | "Vectors, bras and kets are now tools, not obstacles — everything above this line assumes them freely." | "Vectors, bras and kets are now tools, not obstacles. Every step above this line uses them." |
| P3 | `MILESTONE_COPY[2]` (line 59) | Undefined abbreviation "QC" | "QC basics done. You can read circuit diagrams and reason about gates, Paulis and measurements." | "Quantum computing basics done. You can read circuit diagrams and reason about gates, Paulis and measurements." |
| P4 | `MILESTONE_COPY[3]` (line 60) | Present perfect | "You've finished Tier 3." | "You finished Tier 3." |
| P5 | step card heads-up (lines 531–532) | Passive, hard to parse | "heads-up: 2 prerequisites above aren't marked understood yet" | "heads-up: you did not mark {N} prerequisite(s) above as understood yet" |
| P6 | step card empty-unlocks (lines 558–559) | Jargon "load-bearing" | "No paper lists this as a direct prerequisite — it's load-bearing for what comes next." | "No paper lists this topic as a direct prerequisite, but later topics build on it." |
| P7 | PapersPanel empty state (line 737) | "gate" as non-standard verb | "Mark topics understood to unlock the papers they gate." | "Mark topics as understood to unlock the papers that depend on them." |
| P8 | CompletionBand heading (line 818) | Present perfect + mixed metaphor | "You've climbed the whole tree." | "You finished the whole path." |
| P9 | CompletionBand body (lines 821–822) | Fragment + ambiguous "canon" | "Every prerequisite understood. The 23-paper canon and today's research frontier are fully unlocked." | "You understood every prerequisite. The 23 core papers and today's research frontier are fully unlocked." |

Systematic pattern (optional): 5 of 6 milestone entries open with a verbless fragment ("Foundations done."). Recipe if uniformity is wanted: prepend "You finished" / convert to a short clause.

Left as-is: button labels, "The practical literature is open.", reset-confirm wording.

---

## app/src/pages/Papers.tsx

**Verdict:** Clear; ~5 sentences to change (header intro, empty state, bottom CTA).

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| R1 | header sub, sentence 1 (lines 557–559) | Fragment + rare "seminal" | "From the 1998 lattice code with boundaries to below-threshold quantum hardware — the seminal results of topological quantum error correction in chronological order." | "These are the key results of topological quantum error correction, in chronological order. They run from the 1998 lattice code with boundaries to below-threshold quantum hardware." |
| R2 | header sub, sentence 2 (lines 559–561) | Passive, actor clear | "Every summary is written in plain English, rated for difficulty, and cross-linked to the prerequisites it assumes." | "Each summary uses plain English, shows a difficulty rating, and links to the prerequisites it assumes." |
| R3 | readiness ribbon (line 245) | Undefined abbreviation | "`N prereq(s) left`" | "`N prerequisite(s) left`" |
| R4 | empty state (line 719) | Idioms ("loosen a filter", "isn't going anywhere") | "Loosen a filter or two — the canon isn't going anywhere." | "Remove one or two filters. The full list of papers will still be here." |
| R5 | bottom CTA body (lines 783–786) | Multiple instructions in one sentence + passive | "Every prerequisite chip on these cards links back to the knowledge map — learn the topic, mark it understood, and the paper's readiness ribbon updates." | "Every prerequisite chip on these cards links to the knowledge map. Learn the topic there. Mark it understood. The paper's readiness ribbon then updates." |
| R6 | bottom CTA heading (line 781) | Ambiguous "Missing" (minor) | "Missing the background for a paper?" | "Don't have the background for a paper?" |

Left as-is: era summary taglines, "// THE CANON" eyebrow, mini-map legend notation.

---

## app/src/pages/FieldToday.tsx

**Verdict:** Well-written vivid prose; ~12 sentences to change (5 present-perfect, 3 buried enumerations, 4 -ing tails / word choice).

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| F1 | hero paragraph (L168–171) | 34 words, buried 3-item enumeration | "The questions are no longer 'does it work?' but 'how fast can we decode it, how cheaply can we distill magic states, and how automatically can we compile a whole algorithm onto a lattice?'" | "The questions are no longer 'does it work?' The questions now are: How fast can we decode it? How cheaply can we distill magic states? How automatically can we compile a whole algorithm onto a lattice?" |
| F2 | big picture ¶1 (L242–245) | 31 words, rare "demonstrably" | "a larger surface code demonstrably outperformed a smaller one on real hardware, with logical error rates falling as distance grew." | "a larger surface code outperformed a smaller one on real hardware. Logical error rates fell as the code distance grew." |
| F3 | big picture ¶2 (L250–253) | Buried 3-item enumeration, stacked gerunds | "the expensive part is computation — preparing high-fidelity non-Clifford resources, routing logical qubits through space-time, and decoding syndromes fast enough to keep pace with hardware." | "The expensive part is computation: (1) prepare high-fidelity non-Clifford resources, (2) route logical qubits through space-time, (3) decode syndromes fast enough to keep pace with hardware." |
| F4 | big picture ¶3 (L258–261) | Inverted word order + 41 words | "Around this has grown a design-automation ecosystem: compilers that turn… simulators that verify… and layout tools that make space-time diagrams something you can draw, optimize, and debug." | "A design-automation ecosystem grew around this result. Compilers turn quantum algorithms into lattice-surgery instructions. Simulators verify fault-tolerant circuits exactly, over billions of shots. Layout tools let you draw, optimize, and debug space-time diagrams." |
| F5 | fig. 01 caption (L335) | Latin jargon "in situ" | "a magic state cultivated in situ, not shipped in from a factory" | "a magic state grown in place, not shipped in from a factory" |
| F6 | block 02 body (L1008) | ~45 words, semicolon-chained | "A new compiler ecosystem builds these objects automatically: TopoLS translates ZX-calculus diagrams into lattice-surgery space-time layouts; pathfinding tools (in the Topologiq / qelebrimbor lineage) route block-graphs through space; visual layout environments (SketchUp-style editors) let designers draw and inspect constructions by hand." | "A new compiler ecosystem builds these objects automatically. TopoLS translates ZX-calculus diagrams into lattice-surgery space-time layouts. Pathfinding tools (in the Topologiq / qelebrimbor lineage) route block-graphs through space. Visual editors (SketchUp-style) let designers draw and inspect constructions by hand." |
| F7 | block 03 body (L1028) | 30 words + idiom "could never touch" | "Hybrid simulators like Clifft carry a Clifford frame and factorize the residual statevector, reaching exact results over billions of shots for circuits that brute-force statevector methods could never touch." | "Hybrid simulators like Clifft carry a Clifford frame and factorize the residual statevector. They give exact results over billions of shots, for circuits too large for brute-force statevector methods." |
| F8 | block 04 body (L1043) | Noun "backlog" as verb | "Latency matters because undecoded syndromes backlog exponentially" | "Latency matters because undecoded syndromes pile up exponentially" |
| F9 | block 04 body (L1043) | -ing clause tail | "a few extra 'flag' qubits catch hook errors, letting small codes stay fault-tolerant without full-distance circuits." | "a few extra 'flag' qubits catch hook errors, so small codes stay fault-tolerant without full-distance circuits." |
| F10 | block 05 body (L1067) | -ing chain + 26 words | "showed distance-7 beating distance-5 beating distance-3 — the scaling signature the field has chased since 1998." | "showed distance-7 beating distance-5, and distance-5 beating distance-3. This is the scaling signature the field chased since 1998." |

Systematic pattern: present perfect for finished events ×5 (L167 "has crossed" → "crossed", L250 "has moved" → "moved", L258 "has grown" → "grew", L988 "have historically consumed" → "consumed", L1067 "has chased" → "chased"). Do not touch the CTA's casual "You've already climbed the tree".

Left as-is: parallel rhetoric ("A decoder that runs in post-processing is a science experiment…"), section titles, symbolic stat notation, jargon-strip definitions.

---

## app/src/pages/Glossary.tsx

**Verdict:** `short` definitions almost fully compliant; problems concentrate in `long` definitions — ~17 of ~90 sentences need changes.

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| G1 | `ancilla-qubit` long s1 (line 53) | Passive, 28 words | "In every syndrome-extraction round, ancillas are entangled with their neighboring data qubits and then measured, reading out one stabilizer each without ever touching the encoded state directly." | "In every syndrome-extraction round, the circuit entangles each ancilla with its neighboring data qubits and then measures it. Each measurement reads out one stabilizer and never touches the encoded state directly." |
| G2 | `ancilla-qubit` long s2 (line 53) | 30 words, which-clause tail | "Because ancillas sit in the middle of the extraction circuit, their own faults are a primary source of correlated errors — which is why flag qubits and careful measurement schedules exist to keep those faults contained." | "Ancillas sit in the middle of the extraction circuit, so their own faults are a primary source of correlated errors. Flag qubits and careful measurement schedules keep those faults contained." |
| G3 | `clifford-gate` short (line 87) | Ellipsis in final fragment | "A gate from the group mapping Pauli operators to Pauli operators — H, S, CNOT — powerful, but efficiently simulable classically." | "A gate from the group that maps Pauli operators to Pauli operators — H, S, CNOT. Clifford gates are powerful, but a classical computer can simulate them efficiently." |
| G4 | `clifford-gate` long s2 (line 89) | 30 words, two em-dash asides | "In surface codes most Clifford operations are cheap — transversal or achievable by lattice surgery and even by tracking Pauli frames in software — but universal computation requires a non-Clifford gate supplied from outside the group." | "In surface codes, most Clifford operations are cheap: they are transversal, achievable by lattice surgery, or even trackable as Pauli frames in software. But universal computation also needs a non-Clifford gate supplied from outside the group." |
| G5 | `code-distance` long s2 (line 114) | 34 words, which-clause tail | "Distance is the single most important code parameter: below threshold, the logical error rate falls exponentially as d grows, which is why experiments race to demonstrate that scaling d from 3 to 5 to 7 actually suppresses errors." | "Distance is the single most important code parameter. Below threshold, the logical error rate falls exponentially as d grows. That is why experiments work hard to show that raising d from 3 to 5 to 7 actually suppresses errors." |
| G6 | `fault-tolerance` long s1 (line 164) | Passive with known actor, 30 words | "A code alone is not enough: the circuits that extract the syndrome are themselves noisy, so they must be designed so that single faults cause at most a correctable amount of damage." | "A code alone is not enough. The circuits that extract the syndrome are themselves noisy. You must design them so that a single fault causes at most a correctable amount of damage." |
| G7 | `flag-qubit` long s1 (line 176) | Passive, 35 words, two actions | "Flag fault tolerance buys protection with very few extra qubits: a flag is entangled with the syndrome ancilla, and if it "raises", the decoder knows a dangerous multi-qubit error may have occurred and can correct it." | "Flag fault tolerance buys protection with very few extra qubits. The circuit entangles a flag with the syndrome ancilla. If the flag "raises", the decoder knows a dangerous multi-qubit error may have occurred, and it can correct that error." |
| G8 | `magic-state` long s2 (line 236) | Passive, 32 words, em-dash aside | "Because injected magic states are noisy, they are purified by distillation factories — circuits that turn many rough copies into a few excellent ones — or, more recently, cultivated directly on the lattice at dramatically lower overhead." | "Injected magic states are noisy, so distillation factories purify them. These circuits turn many noisy copies into a few high-quality ones. A newer method, cultivation, grows magic states directly on the lattice at much lower overhead." |
| G9 | `mbqc` long s2 (line 249) | 37 words, undefined "foliating", metaphor "native languages" | "Deep results show that foliating a surface-code computation in time produces exactly a cluster-state scheme — so MBQC is not a rival to topological computing but one of its native languages, and the highest known thresholds come from topological cluster states." | "A deep result connects MBQC to surface codes: if you unfold a surface-code computation through time, you get exactly a cluster-state scheme. So MBQC is not a rival to topological computing; it is another way to describe it. The highest known thresholds come from topological cluster states." |
| G10 | `stabilizer` long s2 (line 321) | 33 words, metaphor "operational life" | "Measuring the stabilizers — repeatedly, fault-tolerantly — is the entire operational life of a quantum error-correcting code: their outcomes are the syndrome, and everything from decoding to logical gates is built on top of them." | "Measuring the stabilizers, repeatedly and fault-tolerantly, is the central task of a quantum error-correcting code. Their outcomes are the syndrome. Decoding and logical gates are both built on these outcomes." |
| G11 | `surface-code` long s1 (line 333) | 34 words, embedded 4-item list | "The surface code needs only nearest-neighbor gates on a 2D grid, tolerates error rates just below one percent, and supports a complete toolkit — initialization, measurement, lattice surgery, magic-state injection — built from the same repeated stabilizer circuit." | "The surface code needs only nearest-neighbor gates on a 2D grid, and it tolerates error rates just below one percent. Initialization, measurement, lattice surgery, and magic-state injection all use the same repeated stabilizer circuit." |
| G12 | `syndrome` long s1 (line 345) | 28 words, two facts + condition | "The syndrome is the code's error report: it tells you that something happened, and roughly where, while commuting with the logical state so the measurement itself does no harm." | "The syndrome is the code's error report. It tells you that an error happened, and roughly where. It commutes with the logical state, so the measurement itself does no harm." |
| G13 | `toric-code` long s2 (line 382) | 30 words, metaphor "graduating" | "The toric code has no boundaries, so it is the cleanest setting to meet stabilizers, anyons, and logical operators for the first time — before graduating to the planar surface code that real hardware implements." | "The toric code has no boundaries, so it is the cleanest setting to learn stabilizers, anyons, and logical operators for the first time. Real hardware instead implements the planar surface code." |
| G14 | `zx-calculus` long s2 (line 394) | 30 words, chained participle | "Because lattice surgery is itself a ZX-friendly structure, compilers use the calculus to simplify a computation graphically before laying it out as patches and merges — turning circuit design into rigorous picture-reasoning with real overhead savings." | "Lattice surgery is itself a ZX-friendly structure, so compilers use the calculus to simplify a computation graphically. They then lay it out as patches and merges. This turns circuit design into rigorous picture-reasoning, and it saves real overhead." |
| G15 | `logical-qubit` long s3 (line 224) | Present perfect | "Recent below-threshold experiments have crossed the first of those milestones." | "Recent below-threshold experiments crossed the first of those milestones." |

Systematic patterns: (A) ~14 `long` entries end with a 28–37-word compound closer — split at colon/em-dash/"which" boundaries; (B) ~6 passive-with-known-actor instances — name the actor ("the circuit", "you"); (C) ~8 rhetorical metaphors ("native languages", "operational life", "the failure every decoder fears", "experiments race to demonstrate", "graduating to", "buys protection") — replace with the literal claim.

Left as-is: almost all `short` definitions (dense but one fact each; density is required precision), proper nouns/theorems, cross-link card bodies and UI labels.

---

## app/src/data/knowledge_tree.json

**Verdict:** Disciplined vocabulary, active voice; the one systemic issue is sentence length in `detail` paragraphs — ~45–50 of ~110 sentences exceed 25 words. Plus ~10 idiom swaps and 3 one-time term definitions (Hilbert space, GF(2), FT).

| # | Location | Rule | Original | Simplified |
|---|----------|------|----------|------------|
| T1 | `linear-algebra` detail | Metaphor "native grammar" | "so linear algebra is not optional background but the native grammar of the field" | "so you cannot work in quantum mechanics without it" |
| T2 | `linear-algebra` detail | Idiom "pays off" | "so comfort with bases, inner products, projections, and spectral decompositions pays off at every tier of this tree" | "so you will use bases, inner products, projections, and spectral decompositions at every tier of this tree" |
| T3 | `linear-algebra` detail | Undefined jargon (only occurrence) | "vectors in a complex Hilbert space" | "vectors in a complex Hilbert space (a vector space with an inner product)" |
| T4 | `complex-numbers-dirac-notation` detail | 4-item sequence in one 40-word sentence | "You must be fluent converting between ket notation and column vectors, computing adjoints (dagger), reading \|0>+\|1> superpositions, and parsing expressions like <0\|X\|1> that appear constantly in stabilizer and surface-code literature." | "You must be able to convert between ket notation and column vectors. You must compute adjoints (dagger). You must read \|0>+\|1> superpositions. Expressions like <0\|X\|1> appear constantly in stabilizer and surface-code literature." |
| T5 | `complex-numbers-dirac-notation` detail | Figurative "machinery" | "both rely on this machinery." | "both rely on this mathematics." |
| T6 | `quantum-mechanics-basics` detail | ~45 words, 3 ideas | "Measurement is not passive observation: measuring in a basis projects the state onto an outcome with Born-rule probabilities and destroys the amplitudes you did not observe, which is why quantum error correction must diagnose errors indirectly through ancilla-assisted parity checks rather than by looking at the data." | "Measurement is not passive observation. Measuring in a basis projects the state onto one outcome, with Born-rule probabilities, and destroys the amplitudes you did not observe. This is why quantum error correction diagnoses errors indirectly, through ancilla-assisted parity checks, instead of reading the data." |
| T7 | `qubits-pauli-operators` short | Metaphor "alphabet" | "are the alphabet in which quantum errors and stabilizer codes are written." | "are the basic operators used to describe quantum errors and stabilizer codes." |
| T8 | `qubits-pauli-operators` detail | Idiom "non-negotiable" | "so mastering Pauli multiplication and commutation is non-negotiable." | "so you must learn Pauli multiplication and commutation." |
| T9 | `quantum-gates-circuits` short | Passive, unclear actor; idiom | "Quantum computation is described as circuits of unitary gates" … "is the whole point of TQEC" | "Quantum computers run circuits of unitary gates" … "is the main goal of TQEC" |
| T10 | `quantum-gates-circuits` detail | 4-item sequence in ~45 words | "You need fluency in reading circuits, in identities like CNOT propagation rules, in state preparation and measurement conventions, and in the fact that syndrome extraction, lattice surgery, and the space-time diagrams of compilers are all just circuits in this language." | "You need to read circuits fluently. You need identities like the CNOT propagation rules. You need the conventions for state preparation and measurement. Syndrome extraction, lattice surgery, and compiler space-time diagrams are all circuits in this language." |
| T11 | `quantum-codes-basics` detail | Ambiguous verb "imports" | "CSS codes are why classical coding theory imports so cleanly." | "CSS codes are why ideas from classical coding theory transfer so easily to quantum codes." |
| T12 | `classical-error-correction` + `stabilizer-formalism` details | Undefined jargon | "linear codes over GF(2)" | First use: "linear codes over GF(2) (arithmetic with only 0 and 1)" |
| T13 | `syndrome-extraction-circuits` detail | ~55 words, 4 ideas, passive | "Each surface-code stabilizer is measured by preparing an ancilla in \|+>, entangling it with the four (or two) neighboring data qubits via CNOTs, and measuring; the CNOT ordering (e.g., an N- or Z-shaped schedule) matters because a bad order can let ancilla errors propagate into hook errors that align with logical strings and effectively halve the distance." | "To measure each surface-code stabilizer, the circuit prepares an ancilla in \|+>, entangles it with the four (or two) neighboring data qubits via CNOTs, and measures it. The CNOT ordering (e.g., an N- or Z-shaped schedule) matters. A bad order lets ancilla errors propagate into hook errors that align with logical strings and effectively halve the distance." |
| T14 | `syndrome-extraction-circuits` detail | Abbreviation before expansion | "the substrate for MWPM decoding" | "the substrate for minimum-weight perfect matching (MWPM) decoding" |
| T15 | `defects-braiding` short | Rare verb "adiabatically"/"enact" | "then braid them by adiabatically moving boundaries to enact logical gates." | "then braid them by slowly moving boundaries to perform logical gates." |
| T16 | `lattice-surgery` detail | Latin phrase | "Lattice surgery is the lingua franca of the frontier:" | "Lattice surgery is the common language of current research:" |
| T17 | `flag-fault-tolerance` detail | Undefined abbreviation + rare verb | "Flags now permeate practical FT design:" | "Flag qubits are now common in practical fault-tolerant design:" |
| T18 | `magic-state-cultivation` detail | Idiom "overnight" + rare "exemplifies" | "cultivation reshaped resource estimates overnight and exemplifies the modern co-design of codes, circuits, and compilers in TQEC." | "cultivation quickly changed resource estimates and shows how modern TQEC designs codes, circuits, and compilers together." |
| T19 | `tqec-compilers-automation` detail | 6-step sequence in ~50 words | "translate an algorithm into Clifford+T, synthesize Pauli-product rotations, commute Clifford gates to the end (Litinski's framework), then lay the resulting measurement sequence out as 3D space-time pipes of surface-code patches, schedule merges and splits, insert magic-state factories, and estimate physical qubit and time budgets." | "The compiler: (1) translates an algorithm into Clifford+T, (2) synthesizes Pauli-product rotations, (3) commutes Clifford gates to the end (Litinski's framework), (4) lays the resulting measurement sequence out as 3D space-time pipes of surface-code patches, (5) schedules merges and splits and inserts magic-state factories, and (6) estimates physical qubit and time budgets." |
| T20 | `clifford-simulation-hybrid` detail | Figurative idiom "load-bearing pillar" | "making simulation methodology a load-bearing pillar of current TQEC research." | "making simulation methodology essential to current TQEC research." |
| T21 | `below-threshold-experiments` detail | Idiom "set the agenda" | "They also set the agenda:" | "These experiments also set the research goals:" |

Systematic pattern 1 — long `detail` sentences (~50 occurrences, the dominant issue). Recipe: split at every ";", " — ", "which is why", and "so that"; one idea per sentence, ≤25 words; keep all technical nouns, numbers, qualifiers. Representative rewrites:
- `defects-braiding` detail (~60 words) → "This scheme requires large holes (circumference ~d) and long move schedules, so it uses many qubits. This is why lattice surgery largely replaced it. But braiding remains essential for understanding the topological meaning of logical gates and twist defects. In the 3D cluster-state (Raussendorf-Harrington) viewpoint, braiding becomes plumbing of tubes in a foliated code."
- `real-time-decoding-control` detail (~60 words) → "Google's 2024 experiment demonstrated real-time decoding operating alongside the quantum processor. The broader control problem — cryogenic wiring limits, latency budgets, decoder-quantum co-design — is now a central systems challenge on the road to millions of qubits. It sits at the intersection of computer architecture and quantum error correction."

Systematic pattern 2 — figurative metaphors (~10): "native grammar", "alphabet", "the whole point", "the workhorse of all practical TQEC" (line 248), "lingua franca", "load-bearing pillar", "set the agenda", "overnight", "pays off", "cemented" (line 383), "a first-class design axis, not an afterthought" (line 450). Replace with literal equivalents.

Left as-is: `toric-code` "as long as" conditional chain (splitting risks losing the dependency), `stabilizer-formalism` definition (definitional precision must stay in one sentence), `key_points` fragments (bulleted fragments are standard and unambiguous).

---

## app/src/data/papers.json

**Verdict:** Plainer than typical abstracts; the problem concentrates in `contribution` — ~20 of ~70 sentences run 30–57 words with multiple actions. Plus ~8 passive-voice fixes.

| # | Location | Rule | Original → Simplified |
|---|----------|------|------------------------|
| J1 | line 8, `contribution` (9811052) | >25 words | "…with two types of boundary conditions (rough and smooth edges), where logical operators correspond to relative homology classes rather than non-contractible loops of a closed surface." → "…with two types of boundary conditions: rough and smooth edges. On these lattices, logical operators correspond to relative homology classes instead of non-contractible loops of a closed surface." |
| J2 | line 45, `contribution` (0510135) | >25 words, embedded parenthetical | Split into 3 sentences: connection claim / defect claim / region definitions. |
| J3 | line 46, `why_it_matters` (0510135) | >25 words, two ideas | Split after "spacetime picture." |
| J4 | line 65, `contribution` (0610082) | >25 words, passive "is ever needed" | "Converts the one-way quantum computer into a sequential scheme that builds the 3D cluster one slice at a time. This scheme only ever needs a 2D physical lattice with nearest-neighbor interactions, plus single-qubit preparation and measurement." |
| J5 | line 85, `contribution` (0703143) | >25 words, two actions | Split into 3 sentences (transformations / what they enable / 3D→2D-plus-time reduction). |
| J6 | line 104, `contribution` (0803.0272) | >25 words, passive ×2 | Split after "surface code." and after "(defects)." |
| J7 | line 124, `contribution` (0805.3202) | ~50 words | Split into 3 sentences (review claim / described items / assumed background). |
| J8 | line 143, `contribution` (1009.3686) | >25 words, three actions | Split into 3 sentences (simulations / feeding probabilities / simplified gate sequence). |
| J9 | line 160, `contribution` (1110.5133) | ~57 words | Split into 3 sentences (O(n²) decoding / O(1) parallelization / both optimal). |
| J10 | line 177, `contribution` (1111.4022) | >25 words, two actions | Split into 3 sentences (technique / merge-split implements gates / preserves 2D structure). |
| J11 | line 196, `contribution` (1206.0800) | >25 words, buried enumeration | Split into 3 sentences (proof claim / realistic assumptions / decoding method). |
| J12 | line 215, `contribution` (1208.0928) | ~48 words, long enumeration | Split into 5 sentences (tutorial / estimates / builds up / explains / appendices). |
| J13 | line 252, `contribution` (1210.4626) | >25 words, nested clauses | Split into 2 sentences (gadgets / what they execute). |
| J14 | line 271, `contribution` (1307.1740) | ~48 words, passive | Split into 2 sentences (proof scope / 2-D array performs it in O(1)). |
| J15 | line 290, `contribution` (1310.0863) | >25 words, passive ×2 | Split into 3 sentences with "the decoder" as actor. |
| J16 | line 290, `contribution` (1310.0863) | Awkward "near asymptotically optimal" | "The algorithm retains optimal complexity (linear, parallelizable to O(1)). For depolarizing error rates below ~2 x 10^-4, it performs almost as well as the asymptotically optimal decoder." |
| J17 | line 309, `contribution` (1402.4848) | >25 words | Split into 2 sentences (gate set demonstration / benchmarking results). |
| J18 | line 327, `contribution` (1808.06709) | >25 words, two actions | Split after "merge/split." |
| J19 | line 327, `contribution` (1808.06709) | >25 words, two facts | Split into 3 sentences (storage drop / overhead fall / enabled scale). |
| J20 | line 346, `contribution` (1812.01238) | >25 words, two actions | Split into 3 sentences (CCZ factory / footprint & rate / catalyzed phasing circuit). |
| J21 | line 364, `one_sentence` (1905.08916) | >25 words, two actions | Split after "fixups." |
| J22 | line 365, `contribution` (1905.08916) | >25 words, two actions | Split after "superconducting-qubit assumptions." |
| J23 | line 384, `contribution` (2207.06431) | >25 words | Split into 3 sentences (implementation / measurement / d5 vs d3 result). |
| J24 | line 403, `contribution` (2408.13687) | ~40 words | Split into 2 sentences (realization / measured factors). |
| J25 | line 403, `contribution` (2408.13687) | >25 words, two facts | Split into 2 sentences (beyond break-even / real-time decoding latency). |
| J26 | line 422, `contribution` (2602.09099) | ~55 words | Split into 4 sentences (schedule proposal / diagonal gates / hook-error property / distance preservation). |
| J27 | line 422, `contribution` (2602.09099) | >25 words, two facts | Split into 2 sentences (uniformity benefit / 6-step period). |
| J28 | line 422, `contribution` (2602.09099) | Passive, actor unclear | "Simulations demonstrate its effectiveness for memory, spatial junctions, spatial Hadamard gates, and patch rotation, with equal or better logical error rates." |

Systematic pattern: ~20 of 23 papers open `contribution` with a 30–57-word multi-action sentence. Recipe: split at every colon / "and [verb]" boundary; give each new sentence an explicit subject (keep the established implied-"This paper" verb-first style, or insert "The authors / The decoder / This scheme" where passive); move fact-carrying parentheticals into their own short sentence; keep all numbers and thresholds untouched.

Left as-is: domain jargon (defined inline or approved terms), verb-first `one_sentence` fragments (consistent abstract style), 25–28-word sentences that read cleanly, all numeric strings.

---

## Totals

| File | Sentences needing changes | Main issue |
|------|---------------------------|------------|
| Layout.tsx | 2 | word choice |
| Home.tsx | ~8 | 2 long sentences + word choice |
| KnowledgeMap.tsx | 7 | idioms/ellipsis |
| LearningPath.tsx | ~9 (+5 optional milestone fragments) | passive + tense |
| Papers.tsx | ~6 | passive + multi-instruction |
| FieldToday.tsx | ~12 | present perfect + buried enumerations |
| Glossary.tsx | ~17 | long closers in `long` definitions |
| knowledge_tree.json | ~50 + ~10 idioms + 3 definitions | sentence length (dominant) |
| papers.json | ~28 | sentence length in `contribution` |

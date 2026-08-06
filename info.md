# Research Findings — TQEC Learning Companion

## Product
An interactive learning web app that teaches the prerequisite knowledge needed to understand Topological Quantum Error Correction (TQEC), then guides the learner through a curated canon of 23 seminal papers. Target user: technically-minded learner (programmer/engineer/physics-curious) who wants a structured path from "basic linear algebra" to "current magic-state-cultivation research".

## Available data (will be embedded as JSON in the app)
- `/mnt/agents/output/tqec/data/knowledge_tree.json` — 26 prerequisite topics in 6 tiers. Each topic: id, name, tier, short (1-2 sentences), detail (paragraph), key_points (4-6 bullets), depends_on (ids), resources (1-3 real references).
  - Tier 1 Math/physics foundations (3): linear algebra; complex numbers & Dirac notation; quantum mechanics basics
  - Tier 2 Quantum computing basics (2): qubits & Pauli operators; quantum gates & circuits
  - Tier 3 QEC fundamentals (4): classical error correction; stabilizer formalism; quantum codes basics; fault tolerance & thresholds
  - Tier 4 Topological codes core (4): topological order & anyons; toric code; surface code; syndrome extraction circuits
  - Tier 5 Computation & decoding (7): decoding/MWPM; defects & braiding; lattice surgery; cluster states/MBQC; magic states & distillation; flag fault-tolerance; ZX-calculus basics
  - Tier 6 Frontier (6): advanced decoding; real-time decoding & control; magic state cultivation; TQEC compilers & automation; Clifford+statevector hybrid simulation; below-threshold experiments
- `/mnt/agents/output/tqec/data/papers.json` — 23 papers (1998→2026). Each: arxiv_id, title, authors, year, one_sentence, contribution, why_it_matters, prerequisites (topic names from the tree vocabulary), difficulty 1-5, era (foundations / cluster-state schemes / defect-based surface code / lattice surgery era / experimental era).

## Site concept (content requirements, not visual direction)
1. **Home** — what TQEC is (quantum info protected in topology of qubit lattices; surface code), the learning journey pitch, stats (23 papers, 26 topics, 6 tiers, 1998→2026), entry points.
2. **Knowledge map / prerequisite tree** — interactive graph or tiered columns of the 26 topics; clicking a topic opens a detail view (short, detail, key points, resources, dependencies); ability to mark topics as "understood" (localStorage progress).
3. **Learning path** — guided ordered route through the topics, step-by-step, with progress tracking; each step links to the papers unlocked by that knowledge.
4. **Paper timeline / explorer** — the 23 papers on a chronological timeline grouped by era; each paper card shows title, authors, year, one-sentence summary, contribution, why it matters, difficulty, prerequisite chips that link to the knowledge map, and a link to the arXiv PDF. Filterable by era/difficulty.
5. **Field today** — current focus of the TQEC design automation community: magic state cultivation (non-Clifford T-gates need distilled "magic states"; most resource-intensive part of the stack); tooling (TopoLS compiler ZX-calculus→lattice surgery space-time diagrams; Topologiq/qelebrimbor blockgraph pathfinding; Clifft exact simulator via Clifford frame + statevector factorization over billions of shots; SketchUp visual layouts); error-correction methodology (real-time decoding vs post-processing, decoder latency vs decoherence; flag fault-tolerance); below-threshold experiments (Google 2024).
6. **Glossary** — key terms (stabilizer, syndrome, logical qubit, code distance, threshold, anyon, braiding, lattice surgery, magic state, Clifford/non-Clifford, MWPM, defect, rotated code...).

## Tone
Educational, encouraging, precise. This is a study tool: content clarity > marketing. Dense information presented cleanly.

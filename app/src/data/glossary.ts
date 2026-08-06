/**
 * Glossary data (design/glossary.md §4 — 29 terms, 5 categories).
 * Lives here (not in the page) so the review deck and inline term
 * popovers share it, and scripts/check-data.mjs validates it.
 */

export type Category =
  | 'code theory'
  | 'topology & anyons'
  | 'computation'
  | 'decoding'
  | 'hardware & experiment';

export interface GlossaryTerm {
  term: string;
  slug: string;
  category: Category;
  short: string;
  long: string;
  notation?: string;
  related_terms: string[];
  related_topics: string[];
  related_papers: string[];
}

export const CATEGORIES: Category[] = [
  'code theory',
  'topology & anyons',
  'computation',
  'decoding',
  'hardware & experiment',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'code theory': '#22D3EE',
  'topology & anyons': '#8B5CF6',
  computation: '#F5B83D',
  decoding: '#FB7185',
  'hardware & experiment': '#34D399',
};

export const TERMS: GlossaryTerm[] = [
  {
    term: 'ancilla qubit',
    slug: 'ancilla-qubit',
    category: 'hardware & experiment',
    short:
      'A helper qubit that stores no logical information but mediates the stabilizer measurements of the data qubits around it.',
    long:
      'In every syndrome-extraction round, the circuit entangles each ancilla with its neighboring data qubits and then measures it. Each measurement reads out one stabilizer and never touches the encoded state directly. Ancillas sit in the middle of the extraction circuit, so their own faults are a primary source of correlated errors. Flag qubits and careful measurement schedules keep those faults contained.',
    related_terms: ['syndrome', 'stabilizer', 'flag-qubit'],
    related_topics: ['syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'anyon',
    slug: 'anyon',
    category: 'topology & anyons',
    short:
      'A quasiparticle of a two-dimensional system whose exchange statistics are neither bosonic nor fermionic.',
    long:
      'Swapping two anyons, or winding one around another, transforms the quantum state in ways that depend only on the topology of the path — not its details. In the toric and surface codes, the e and m anyons are exactly the endpoint excitations of error chains, and braiding them is the original route to logical gates. This path-independence is the physical origin of topological protection.',
    related_terms: ['braiding', 'topological-order', 'toric-code'],
    related_topics: ['topological-order-anyons', 'toric-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'braiding',
    slug: 'braiding',
    category: 'computation',
    short:
      'Moving anyons or defects around one another so their world-lines tangle, enacting a logical operation through topology alone.',
    long:
      'A braid is robust because only the winding pattern matters: small wobbles in the path leave the logical operation unchanged. Early surface-code schemes computed by braiding defects (holes) around each other, with a CNOT for every full wind. Braiding is elegant but space-hungry — modern architectures mostly replace it with lattice surgery, which achieves the same gates by merging and splitting patches.',
    related_terms: ['anyon', 'defect-hole', 'lattice-surgery'],
    related_topics: ['defects-braiding'],
    related_papers: ['0803.0272'],
  },
  {
    term: 'Clifford gate',
    slug: 'clifford-gate',
    category: 'computation',
    short:
      'A gate from the group that maps Pauli operators to Pauli operators — H, S, CNOT. Clifford gates are powerful, but a classical computer can simulate them efficiently.',
    long:
      'By the Gottesman–Knill theorem, circuits of Clifford gates alone can never outperform a classical computer. This is also why you can simulate Clifford-only error-correction schemes at scale. In surface codes, most Clifford operations are cheap: they are transversal, achievable by lattice surgery, or even trackable as Pauli frames in software. But universal computation also needs a non-Clifford gate supplied from outside the group.',
    related_terms: ['non-clifford-gate', 'magic-state', 'stabilizer'],
    related_topics: ['quantum-gates-circuits', 'clifford-simulation-hybrid'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'non-Clifford gate',
    slug: 'non-clifford-gate',
    category: 'computation',
    short:
      'A gate outside the Clifford group — like the T (π/8) gate — required for universal, classically intractable quantum computation.',
    long:
      'Surface codes cannot implement a T gate transversally, so the scheme injects it indirectly. The circuit prepares a magic state, then consumes it by gate teleportation to apply T to the data. This indirection is why the cost of a fault-tolerant algorithm is often quoted as its T-count — non-Clifford gates dominate the resource budget of realistic machines.',
    notation: 'T',
    related_terms: ['clifford-gate', 'magic-state'],
    related_topics: ['magic-states-distillation'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'code distance',
    slug: 'code-distance',
    category: 'code theory',
    short:
      'The minimum number of physical qubit errors that can combine into an undetectable logical error.',
    long:
      'A distance-d code can correct any ⌊(d−1)/2⌋ errors, because no error chain shorter than d can mimic a logical operator. Distance is the single most important code parameter. Below threshold, the logical error rate falls exponentially as d grows. That is why experiments work hard to show that raising d from 3 to 5 to 7 actually suppresses errors.',
    notation: 'd',
    related_terms: ['logical-operator', 'surface-code', 'threshold-theorem'],
    related_topics: ['quantum-codes-basics', 'surface-code'],
    related_papers: ['2207.06431'],
  },
  {
    term: 'CSS code',
    slug: 'css-code',
    category: 'code theory',
    short:
      'A stabilizer code built from two classical codes, whose X-type and Z-type checks can be designed and decoded separately.',
    long:
      'CSS codes are named for Calderbank, Shor, and Steane. The construction lets you import mature classical coding theory into the quantum world: correct bit flips with one classical code and phase flips with another. The surface code is CSS, so decoders can handle its X- and Z-syndromes (mostly) independently — a huge practical simplification.',
    notation: '[[n,k,d]]',
    related_terms: ['stabilizer', 'code-distance', 'syndrome'],
    related_topics: ['quantum-codes-basics'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'defect / hole',
    slug: 'defect-hole',
    category: 'topology & anyons',
    short:
      'A region of the lattice where stabilizer measurements are switched off, punching a hole that encodes a logical qubit.',
    long:
      'A defect creates an interior boundary, and the new edge degree of freedom becomes a logical qubit. Smooth and rough defects come in dual flavors, and braiding one around another — or around a lattice boundary — applies logical gates. Defect schemes were the original vision for surface-code computation before the denser, boundary-driven lattice-surgery approach took over.',
    related_terms: ['braiding', 'surface-code', 'plaquette'],
    related_topics: ['defects-braiding'],
    related_papers: ['0803.0272'],
  },
  {
    term: 'error chain',
    slug: 'error-chain',
    category: 'code theory',
    short:
      'A connected path of physical errors on the lattice whose two endpoints are the only places the syndrome can detect.',
    long:
      'Errors on the surface code form strings. A chain of Pauli errors anticommutes only with the stabilizers at its ends, so the bulk of the chain stays invisible. Decoding is the art of guessing which chains produced the observed endpoints. A chain that stretches from boundary to boundary (or winds a defect) has no endpoints at all. It is a logical operator — the failure that every decoder must avoid.',
    related_terms: ['syndrome', 'mwpm-decoder', 'logical-operator'],
    related_topics: ['decoding-mwpm'],
    related_papers: ['1307.1740'],
  },
  {
    term: 'fault tolerance',
    slug: 'fault-tolerance',
    category: 'code theory',
    short:
      'The property that no single component failure — gate, qubit, or measurement — can spread into an uncorrectable logical error.',
    long:
      'A code alone is not enough. The circuits that extract the syndrome are themselves noisy. You must design them so that a single fault causes at most a correctable amount of damage. Fault-tolerant circuit design — careful gate ordering, flags, repeated measurement rounds — is what turns an ideal threshold theorem into a number you can actually meet in hardware.',
    related_terms: ['threshold-theorem', 'hook-error', 'flag-qubit'],
    related_topics: ['fault-tolerance-thresholds'],
    related_papers: ['1206.0800'],
  },
  {
    term: 'flag qubit',
    slug: 'flag-qubit',
    category: 'hardware & experiment',
    short:
      'An extra ancilla that signals when a correlated fault has spread from the extraction circuit onto the data qubits.',
    long:
      'Flag fault tolerance gives protection with very few extra qubits. The circuit entangles a flag with the syndrome ancilla. If the flag "raises", the decoder knows a dangerous multi-qubit error may have occurred, and it can correct that error. Flag schemes shrink the overhead of fault-tolerant syndrome extraction, which matters enormously for the small, near-term devices where every qubit counts.',
    related_terms: ['ancilla-qubit', 'hook-error', 'fault-tolerance'],
    related_topics: ['flag-fault-tolerance'],
    related_papers: ['1402.4848'],
  },
  {
    term: 'hook error',
    slug: 'hook-error',
    category: 'hardware & experiment',
    short:
      'A single ancilla fault that propagates through the extraction circuit into two data-qubit errors — sometimes aligned with the logical operator.',
    long:
      'Whether a hook error is dangerous depends on its orientation. A hook perpendicular to the logical operator is harmless. A hook parallel to it can cut the effective code distance in half. Clever measurement scheduling — such as the diagonal "off-the-hook" extraction order — rotates hooks into the harmless direction, recovering the full distance at zero hardware cost.',
    related_terms: ['flag-qubit', 'ancilla-qubit', 'fault-tolerance'],
    related_topics: ['syndrome-extraction-circuits'],
    related_papers: ['2602.09099'],
  },
  {
    term: 'lattice surgery',
    slug: 'lattice-surgery',
    category: 'computation',
    short:
      'Logical operations performed by merging code patches along their boundaries and splitting them apart again.',
    long:
      'Merging two surface-code patches measures a joint logical operator; splitting them afterwards preserves the encoded states. CNOTs, Hadamards, and multi-qubit Pauli measurements all reduce to sequences of merges and splits. So an entire algorithm becomes a layout-and-scheduling problem on a 2D grid of patches. Lattice surgery is the dominant paradigm for fault-tolerant computation because it is planar, local, and space-efficient.',
    related_terms: ['surface-code', 'rotated-surface-code', 'logical-qubit'],
    related_topics: ['lattice-surgery'],
    related_papers: ['1111.4022', '1808.06709'],
  },
  {
    term: 'logical operator',
    slug: 'logical-operator',
    category: 'code theory',
    short:
      'An operator that acts on the encoded qubit: a chain of Paulis that commutes with every stabilizer but is not itself a stabilizer.',
    long:
      'On the surface code, logical X and Z are strings of physical Paulis stretching from boundary to boundary (or winding a hole). Their minimum weight equals the code distance, which is exactly why distance bounds how much error the code can absorb. Applying a logical operator intentionally performs a gate; having one sneak in undetected is a logical error.',
    related_terms: ['code-distance', 'logical-qubit', 'error-chain'],
    related_topics: ['toric-code', 'surface-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'logical qubit',
    slug: 'logical-qubit',
    category: 'code theory',
    short:
      'The protected qubit encoded collectively across many noisy physical qubits of an error-correcting code.',
    long:
      'No single physical qubit holds the logical state — it lives in the correlations of the whole lattice, invisible to local errors. The goal of the field is a logical qubit whose error rate falls below that of its physical constituents. Adding more physical qubits then makes the rate fall exponentially. Recent below-threshold experiments crossed the first of those milestones.',
    related_terms: ['logical-operator', 'code-distance', 'stabilizer'],
    related_topics: ['quantum-codes-basics', 'below-threshold-experiments'],
    related_papers: ['2207.06431', '2408.13687'],
  },
  {
    term: 'magic state',
    slug: 'magic-state',
    category: 'computation',
    short:
      'A specially prepared resource state that, consumed by gate teleportation, supplies the non-Clifford power a surface code lacks natively.',
    long:
      'Clifford operations plus magic states are universal. Injected magic states are noisy, so distillation factories purify them. These circuits turn many noisy copies into a few high-quality ones. A newer method, cultivation, grows magic states directly on the lattice at much lower overhead. Magic-state production is usually the single largest cost center of a fault-tolerant algorithm.',
    notation: '|T⟩',
    related_terms: ['non-clifford-gate', 'clifford-gate'],
    related_topics: ['magic-states-distillation', 'magic-state-cultivation'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'measurement-based QC (MBQC)',
    slug: 'mbqc',
    category: 'computation',
    short:
      'A model of computation where entanglement is prepared up front as a cluster state, and adaptive single-qubit measurements do the computing.',
    long:
      'MBQC replaces gates with measurements: each measurement consumes part of the cluster state and steers the rest. A deep result connects MBQC to surface codes: if you unfold a surface-code computation through time, you get exactly a cluster-state scheme. So MBQC is not a rival to topological computing; it is another way to describe it. The highest known thresholds come from topological cluster states.',
    related_terms: ['stabilizer', 'fault-tolerance', 'lattice-surgery'],
    related_topics: ['cluster-states-mbqc'],
    related_papers: ['quant-ph/0510135', '0805.3202'],
  },
  {
    term: 'MWPM decoder',
    slug: 'mwpm-decoder',
    category: 'decoding',
    short:
      'A decoder that pairs up syndrome defects by minimum-weight perfect matching, reconstructing the most likely error chains.',
    long:
      'Minimum-weight perfect matching, implemented with Edmonds\' blossom algorithm, treats the syndrome as a graph problem: connect the detection events in pairs with the shortest total chain length. It achieves thresholds near the theoretical optimum and decodes in near-linear time in practice. Researchers still measure every faster, smarter, or more correlated decoder against it.',
    related_terms: ['error-chain', 'syndrome', 'real-time-decoding'],
    related_topics: ['decoding-mwpm'],
    related_papers: ['1110.5133', '1307.1740'],
  },
  {
    term: 'plaquette',
    slug: 'plaquette',
    category: 'topology & anyons',
    short:
      'A face of the lattice whose bordering qubits are measured by one stabilizer check — the basic tile of error detection.',
    long:
      'The surface code is a checkerboard of two stabilizer flavors: Z-type plaquettes catch bit-flip errors, X-type stars (vertices) catch phase flips. A plaquette "lights up" — its measurement returns −1 — when an odd number of error-chain endpoints sit on it. This site\'s whole visual identity borrows the duality: cyan for plaquettes, violet for stars.',
    related_terms: ['stabilizer', 'syndrome', 'surface-code'],
    related_topics: ['toric-code', 'surface-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'real-time decoding',
    slug: 'real-time-decoding',
    category: 'decoding',
    short:
      'Decoding fast enough to keep pace with the hardware\'s measurement stream, so the backlog of undecoded syndromes never grows.',
    long:
      'A superconducting device produces a syndrome round about every microsecond; the decoder must average one round per microsecond forever, or the backlog grows exponentially (the "backlog problem"). Real-time decoding demands streaming, parallelized algorithms on FPGAs or ASICs sitting next to the cryostat — one of the hardest classical-engineering challenges on the road to large machines.',
    related_terms: ['mwpm-decoder', 'syndrome', 'space-time-diagram'],
    related_topics: ['real-time-decoding-control'],
    related_papers: ['2408.13687'],
  },
  {
    term: 'rotated surface code',
    slug: 'rotated-surface-code',
    category: 'code theory',
    short:
      'A 45°-rotated surface-code layout that encodes one logical qubit in d² data qubits — half the footprint of the unrotated patch.',
    long:
      'Rotating the lattice aligns the boundaries diagonally, trimming away roughly half the physical qubits while keeping the same distance. The rotated code is the standard unit cell of modern fault-tolerant architectures. Experiments actually build distance-3, 5, and 7 rotated patches, and lattice-surgery blueprints tile them across the chip.',
    related_terms: ['surface-code', 'code-distance', 'lattice-surgery'],
    related_topics: ['surface-code'],
    related_papers: ['1808.06709'],
  },
  {
    term: 'space-time diagram',
    slug: 'space-time-diagram',
    category: 'decoding',
    short:
      'A three-dimensional picture — two of space, one of time — of repeated syndrome rounds, forming the graph a decoder actually works on.',
    long:
      'Stack successive syndrome snapshots vertically and every detection event becomes a vertex; spatial edges represent data-qubit errors, vertical edges represent measurement errors. Decoding is then matching or inference on this space-time graph. The diagram is the graph the decoder works on, and the clearest way to see why you must correct measurement noise and qubit noise jointly.',
    related_terms: ['syndrome', 'error-chain', 'mwpm-decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'stabilizer',
    slug: 'stabilizer',
    category: 'code theory',
    short:
      'A Pauli product that returns +1 on every valid code state and flips to −1 when an error anticommutes with it.',
    long:
      'The stabilizer formalism describes a code by the operators that leave it unchanged rather than by its states, turning code design into group theory. Measuring the stabilizers, repeatedly and fault-tolerantly, is the central task of a quantum error-correcting code. Their outcomes are the syndrome. Decoding and logical gates are both built on these outcomes.',
    related_terms: ['syndrome', 'plaquette', 'css-code'],
    related_topics: ['stabilizer-formalism'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'surface code',
    slug: 'surface-code',
    category: 'topology & anyons',
    short:
      'Kitaev\'s toric code flattened onto a planar patch with boundaries — the leading architecture for fault-tolerant quantum computing.',
    long:
      'The surface code needs only nearest-neighbor gates on a 2D grid, and it tolerates error rates just below one percent. Initialization, measurement, lattice surgery, and magic-state injection all use the same repeated stabilizer circuit. These properties are why essentially every serious hardware roadmap, from superconducting qubits to neutral atoms, converges on some flavor of surface code.',
    related_terms: ['toric-code', 'plaquette', 'rotated-surface-code'],
    related_topics: ['surface-code'],
    related_papers: ['quant-ph/9811052', '1208.0928'],
  },
  {
    term: 'syndrome',
    slug: 'syndrome',
    category: 'code theory',
    short:
      'The pattern of stabilizer outcomes that report −1, revealing where errors struck without collapsing the logical information.',
    long:
      'The syndrome is the code\'s error report. It tells you that an error happened, and roughly where. It commutes with the logical state, so the measurement itself does no harm. Decoders consume streams of syndromes — comparing rounds to find detection events — and infer the underlying error chains. Everything in quantum error correction is downstream of getting the syndrome out cleanly and quickly.',
    related_terms: ['stabilizer', 'error-chain', 'mwpm-decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1110.5133'],
  },
  {
    term: 'threshold theorem',
    slug: 'threshold-theorem',
    category: 'code theory',
    short:
      'If the physical error rate is below a threshold, growing the code distance suppresses the logical error rate without bound.',
    long:
      'The threshold theorem converts error correction from a delaying tactic into a scalable solution: below p_th, each increment of distance gives exponential protection. For the surface code with realistic circuit-level noise the threshold sits around 0.5–1% — the famous "one percent" that set the target for two decades of hardware development.',
    notation: 'p_th ≈ 1%',
    related_terms: ['fault-tolerance', 'code-distance'],
    related_topics: ['fault-tolerance-thresholds'],
    related_papers: ['1206.0800', '2408.13687'],
  },
  {
    term: 'topological order',
    slug: 'topological-order',
    category: 'topology & anyons',
    short:
      'A phase of matter characterized not by symmetry but by topology-dependent ground-state degeneracy and anyonic excitations.',
    long:
      'A topologically ordered system encodes information in global, non-local degrees of freedom, so no local perturbation can distinguish or corrupt the encoded states. This is the deep reason topological codes protect quantum information. The topology of the many-body ground state hides the logical qubit exactly where small errors cannot reach it.',
    related_terms: ['anyon', 'toric-code', 'surface-code'],
    related_topics: ['topological-order-anyons'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'toric code',
    slug: 'toric-code',
    category: 'topology & anyons',
    short:
      'Kitaev\'s original topological code: qubits on the edges of a lattice wrapped around a torus, encoding two logical qubits in its topology.',
    long:
      'On a torus there are two independent non-contractible loops, giving two logical qubits whose operators wind the donut\'s hole and body. The toric code has no boundaries, so it is the cleanest setting to learn stabilizers, anyons, and logical operators for the first time. Real hardware instead implements the planar surface code.',
    related_terms: ['surface-code', 'anyon', 'topological-order'],
    related_topics: ['toric-code'],
    related_papers: ['quant-ph/9811052', 'quant-ph/0110143'],
  },
  {
    term: 'ZX-calculus',
    slug: 'zx-calculus',
    category: 'computation',
    short:
      'A graphical language of spiders and wires for reasoning about quantum circuits — and for compiling them onto the lattice.',
    long:
      'ZX-diagrams represent linear maps as networks of Z- and X-phase spiders fused by rewriting rules. Lattice surgery is itself a ZX-friendly structure, so compilers use the calculus to simplify a computation graphically. They then lay it out as patches and merges. This turns circuit design into rigorous picture-reasoning, and it saves real overhead.',
    related_terms: ['lattice-surgery', 'stabilizer'],
    related_topics: ['zx-calculus-basics', 'tqec-compilers-automation'],
    related_papers: ['1905.08916'],
  },
];

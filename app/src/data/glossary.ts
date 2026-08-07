/**
 * Glossary data (design/glossary.md §4 — 46 terms, 6 categories).
 * Lives here (not in the page) so the review deck, inline term popovers,
 * and the selection explainer share it, and scripts/check-data.mjs
 * validates it.
 */

/** Loose-match a free-text selection against glossary terms (name, alias, plural). */
export function matchGlossaryTerm(text: string): GlossaryTerm | undefined {
  const q = text.trim().toLowerCase().replace(/[.,;:!?]+$/, '').replace(/s$/, '');
  if (!q) return undefined;
  return TERMS.find((t) => {
    const names = [t.term];
    const paren = t.term.match(/\(([^)]+)\)/);
    if (paren) names.push(paren[1]);
    names.push(t.term.replace(/\s*\([^)]*\)/, '').trim());
    return names.some((n) => {
      const nn = n.toLowerCase().replace(/s$/, '');
      return nn === q;
    });
  });
}

export type Category =
  | 'foundations'
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
  'foundations',
  'code theory',
  'topology & anyons',
  'computation',
  'decoding',
  'hardware & experiment',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  foundations: '#60A5FA',
  'code theory': '#22D3EE',
  'topology & anyons': '#8B5CF6',
  computation: '#F5B83D',
  decoding: '#FB7185',
  'hardware & experiment': '#34D399',
};

export const TERMS: GlossaryTerm[] = [
  {
    term: 'basis',
    slug: 'basis',
    category: 'foundations',
    short:
      'A complete set of independent reference vectors used as coordinates for writing states; measurement bases are normally orthonormal.',
    long:
      'A basis is the quantum analogue of choosing coordinate axes. Once a basis is chosen, a state vector has one complex amplitude for each basis vector. For an ideal projective measurement, the basis vectors are orthonormal and label the possible outcomes. Changing coordinates does not change the physical state, and saying that a state is a “superposition” is therefore incomplete unless the basis is named.',
    notation: '{|0⟩, |1⟩}',
    related_terms: ['state-vector', 'inner-product', 'superposition'],
    related_topics: ['linear-algebra', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'Born rule',
    slug: 'born-rule',
    category: 'foundations',
    short:
      'The rule that turns a quantum amplitude into an outcome probability by taking the squared magnitude of the relevant projection.',
    long:
      'For a normalized pure state |ψ⟩ measured in an orthonormal basis {|i⟩}, the probability of outcome i is |⟨i|ψ⟩|². More generally, projectors or POVM elements describe measurements, and density operators describe mixed states. The Born rule maps the state and measurement to probabilities; it does not mean the amplitudes themselves are probabilities or that the system secretly carried one definite basis answer before measurement.',
    notation: 'p(i) = |⟨i|ψ⟩|²',
    related_terms: ['complex-amplitude', 'inner-product', 'observable'],
    related_topics: ['quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'bra-ket notation (Dirac notation)',
    slug: 'bra-ket-notation',
    category: 'foundations',
    short:
      'A compact notation in which |ψ⟩ is a vector (ket), ⟨ψ| is its conjugate dual (bra), and ⟨φ|ψ⟩ is an inner product.',
    long:
      'Dirac notation keeps vectors, dual vectors, inner products, and operators visually distinct. Taking the adjoint of |ψ⟩ produces ⟨ψ|; the bra is not an unrelated second state. Joining a bra and ket in one order gives a complex number, while reversing the order gives an outer-product operator. The brackets are notation for linear algebra, not a physical container around a particle.',
    notation: '|ψ⟩, ⟨ψ|, ⟨φ|ψ⟩, |ψ⟩⟨ψ|',
    related_terms: ['state-vector', 'inner-product', 'complex-amplitude'],
    related_topics: ['complex-numbers-dirac-notation', 'linear-algebra'],
    related_papers: [],
  },
  {
    term: 'commute (anticommute)',
    slug: 'commute-anticommute',
    category: 'foundations',
    short:
      'Two operators commute when order does not matter, AB = BA; they anticommute when swapping the order contributes a minus sign, AB = −BA.',
    long:
      'Commuting Hermitian operators in finite dimensions can be represented with a common eigenbasis, which is why compatible stabilizer checks can have simultaneous definite values. Anticommuting Pauli operators cannot share an eigenstate: applying one flips the eigenvalue associated with the other, letting a stabilizer reveal an error. Noncommutation by itself does not imply entanglement, and it does not force uncertainty for every possible state; those conclusions require the state and observables too.',
    notation: '[A,B] = 0; {A,B} = 0',
    related_terms: ['pauli-operator', 'observable', 'stabilizer'],
    related_topics: ['linear-algebra', 'stabilizer-formalism'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'complex amplitude (probability amplitude)',
    slug: 'complex-amplitude',
    category: 'foundations',
    short:
      'A complex coefficient of a basis state whose magnitude and phase determine probabilities and interference.',
    long:
      'In a pure state |ψ⟩ = Σᵢ αᵢ|i⟩, each αᵢ is a complex amplitude. Its squared magnitude contributes the Born-rule probability for outcome i in that basis, while its phase matters only relative to other amplitudes and can change interference. An amplitude is not a probability: it can be negative or complex, and amplitudes combine before squared magnitudes are taken. A single state vector and its amplitudes describe a pure state; general statistical mixtures require a density operator.',
    notation: 'αᵢ ∈ ℂ; Σᵢ|αᵢ|² = 1',
    related_terms: ['born-rule', 'relative-phase', 'state-vector'],
    related_topics: ['complex-numbers-dirac-notation', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'eigenstate (eigenvalue)',
    slug: 'eigenstate-eigenvalue',
    category: 'foundations',
    short:
      'An eigenstate is a nonzero vector whose direction an operator leaves unchanged; the corresponding scale factor is its eigenvalue.',
    long:
      'The equation A|a⟩ = a|a⟩ says that |a⟩ is an eigenstate of A with eigenvalue a. For an ideal measurement of an observable, its eigenvalues label possible results, and a state wholly inside one eigenspace gives that result with certainty. Degenerate eigenvalues may correspond to more than one independent eigenstate. An eigenvalue is a number, not a state, and being an eigenstate of one observable does not make the state definite for every other observable.',
    notation: 'A|a⟩ = a|a⟩',
    related_terms: ['observable', 'basis', 'unitary'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'entanglement',
    slug: 'entanglement',
    category: 'foundations',
    short:
      'A property of a joint quantum state that cannot be assembled from independent states of its parts, even with shared classical randomness.',
    long:
      'A pure bipartite state is entangled when it cannot be factored as |ψ⟩A ⊗ |φ⟩B. For mixed states, the stricter test is whether the density operator can be written as a probabilistic mixture of product states; if it can, it is separable. Correlation alone is not evidence of entanglement because ordinary shared randomness can also correlate outcomes, and Bell-inequality violation is a stronger condition than entanglement. Entanglement does not allow controllable faster-than-light communication.',
    notation: '|Ψ⟩AB ≠ |ψ⟩A ⊗ |φ⟩B',
    related_terms: ['tensor-product', 'state-vector', 'superposition'],
    related_topics: ['quantum-mechanics-basics', 'cluster-states-mbqc'],
    related_papers: ['quant-ph/0510135'],
  },
  {
    term: 'Hilbert space',
    slug: 'hilbert-space',
    category: 'foundations',
    short:
      'A complex vector space with an inner product and the completeness needed for limits; quantum state vectors live in it.',
    long:
      'For a finite register of n qubits, the state space is the 2ⁿ-dimensional complex Hilbert space (ℂ²)⊗ⁿ. Its inner product defines lengths, angles, orthogonality, and ultimately measurement probabilities. “Space” here is mathematical state space, not the three-dimensional room around the device. Physical pure states are normalized rays in the Hilbert space, while mixed states are density operators on it rather than additional state vectors.',
    notation: 'ℋ; ℋₙ = (ℂ²)⊗ⁿ',
    related_terms: ['state-vector', 'inner-product', 'tensor-product'],
    related_topics: ['linear-algebra', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'inner product',
    slug: 'inner-product',
    category: 'foundations',
    short:
      'A complex-valued overlap between two vectors that defines their angle, norm, and orthogonality.',
    long:
      'In Dirac notation, ⟨φ|ψ⟩ is conjugate-linear in the bra and linear in the ket. Orthogonal vectors have zero overlap, and a normalized vector has ⟨ψ|ψ⟩ = 1. For normalized pure states, |⟨φ|ψ⟩|² is the probability of projecting |ψ⟩ onto |φ⟩. It resembles a dot product but complex conjugation is essential, so treating it as an ordinary component-by-component product gives wrong phases and probabilities.',
    notation: '⟨φ|ψ⟩; ‖ψ‖² = ⟨ψ|ψ⟩',
    related_terms: ['bra-ket-notation', 'hilbert-space', 'born-rule'],
    related_topics: ['linear-algebra', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'observable',
    slug: 'observable',
    category: 'foundations',
    short:
      'A Hermitian operator whose eigenvalues represent the possible outcomes of an ideal projective measurement.',
    long:
      'An observable A has real eigenvalues and orthogonal eigenspaces. The state and the associated projectors determine outcome probabilities through the Born rule, while ⟨ψ|A|ψ⟩ is the expectation value for a pure state—not necessarily a result seen in one trial. Not every operator is an observable: unitary gates describe reversible evolution, and general laboratory measurements may require POVMs rather than a single projective observable.',
    notation: 'A = A†; ⟨A⟩ψ = ⟨ψ|A|ψ⟩',
    related_terms: ['eigenstate-eigenvalue', 'born-rule', 'unitary'],
    related_topics: ['quantum-mechanics-basics', 'linear-algebra'],
    related_papers: [],
  },
  {
    term: 'Pauli operator (Pauli)',
    slug: 'pauli-operator',
    category: 'foundations',
    short:
      'One of I, X, Y, and Z: four single-qubit operators that form a basis for qubit operators and label standard error components.',
    long:
      'X swaps |0⟩ and |1⟩, Z changes their relative sign, and Y combines both actions with phases; I does nothing. Pauli products provide the language of stabilizers, logical operators, and many noise models because any qubit operator can be expanded in this operator basis. Calling X a “bit flip” and Z a “phase flip” refers to the computational basis and is not a claim that every physical noise event is literally one discrete Pauli fault.',
    notation: 'I, X, Y, Z; Y = iXZ',
    related_terms: ['qubit', 'commute-anticommute', 'stabilizer'],
    related_topics: ['qubits-pauli-operators', 'stabilizer-formalism'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'qubit',
    slug: 'qubit',
    category: 'foundations',
    short:
      'A quantum two-level degree of freedom whose pure state is a normalized combination of two basis states.',
    long:
      'Relative to a chosen basis, a pure qubit state is α|0⟩ + β|1⟩ with |α|² + |β|² = 1. The two complex amplitudes contain a measurable population balance and relative phase; a shared global phase changes no predictions. A qubit is not a classical bit secretly holding 0 or 1: coherent superpositions can interfere. Nor does one vector describe every qubit preparation—classical uncertainty and a subsystem of an entangled state generally require a density matrix.',
    notation: '|ψ⟩ = α|0⟩ + β|1⟩',
    related_terms: ['complex-amplitude', 'relative-phase', 'superposition'],
    related_topics: ['quantum-mechanics-basics', 'qubits-pauli-operators'],
    related_papers: [],
  },
  {
    term: 'relative phase',
    slug: 'relative-phase',
    category: 'foundations',
    short:
      'The difference between the complex phases of state components—the phase information that can affect interference.',
    long:
      'For α|0⟩ + β|1⟩, the phase difference arg(β) − arg(α) can change probabilities after the components are recombined or measured in another basis. Multiplying the entire state vector by one common phase leaves every physical prediction unchanged, so global phase is not observable for an isolated state. Relative phase is not a separately readable label attached to one component; it is revealed through comparisons and interference.',
    notation: 'Δφ = arg(β) − arg(α)',
    related_terms: ['complex-amplitude', 'superposition', 'unitary'],
    related_topics: ['complex-numbers-dirac-notation', 'quantum-gates-circuits'],
    related_papers: [],
  },
  {
    term: 'state vector (ket)',
    slug: 'state-vector',
    category: 'foundations',
    short:
      'A normalized vector that represents a pure quantum state, with physically equivalent vectors differing only by global phase.',
    long:
      'A state vector collects the complex amplitudes for every basis state and lets inner products, unitary evolution, and the Born rule be expressed as linear algebra. Normalization makes total probability one, while an overall complex phase has no observable effect, so a physical pure state is technically a ray rather than one unique vector. State vectors do not represent every physical state: a probabilistic mixture or a subsystem entangled with an environment requires a density operator.',
    notation: '|ψ⟩ ∈ ℋ; ⟨ψ|ψ⟩ = 1',
    related_terms: ['hilbert-space', 'complex-amplitude', 'bra-ket-notation'],
    related_topics: ['complex-numbers-dirac-notation', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'superposition',
    slug: 'superposition',
    category: 'foundations',
    short:
      'A coherent linear combination of basis states whose amplitudes can interfere.',
    long:
      'Because quantum states form a vector space, α|0⟩ + β|1⟩ is a valid pure state whenever it is normalized. Superposition is basis-dependent: |+⟩ is a superposition in the Z basis but a single basis state in the X basis. It is not merely classical ignorance about a hidden definite alternative; a coherent superposition can produce interference that the corresponding statistical mixture cannot. Saying “both at once” is a memory aid, not a literal classical picture.',
    notation: '|ψ⟩ = Σᵢ αᵢ|i⟩',
    related_terms: ['basis', 'complex-amplitude', 'relative-phase'],
    related_topics: ['quantum-mechanics-basics', 'qubits-pauli-operators'],
    related_papers: [],
  },
  {
    term: 'tensor product',
    slug: 'tensor-product',
    category: 'foundations',
    short:
      'The operation that builds the state space of a composite quantum system from the state spaces of its parts.',
    long:
      'If systems A and B have state spaces ℋA and ℋB, their joint state space is ℋA ⊗ ℋB, so dimensions multiply. Product states factor as |ψ⟩A ⊗ |φ⟩B, but the tensor-product space also contains entangled states that cannot be factored. The tensor product is not an ordinary scalar multiplication or a Cartesian list of two pre-existing local states; a joint state need not assign either subsystem its own pure state.',
    notation: 'ℋAB = ℋA ⊗ ℋB',
    related_terms: ['hilbert-space', 'entanglement', 'state-vector'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: ['quant-ph/0510135'],
  },
  {
    term: 'unitary',
    slug: 'unitary',
    category: 'foundations',
    short:
      'A reversible linear operator that preserves inner products, normalization, and therefore total probability.',
    long:
      'A unitary U obeys U†U = UU† = I. Ideal gates and the closed-system time evolution of pure states are unitary, so distinct inputs remain distinct and the operation has inverse U†. Measurement, reset, and noisy evolution of an observed subsystem are not generally unitary maps on that subsystem, even though a larger closed system can model them with unitary evolution plus an environment.',
    notation: 'U†U = I; |ψ′⟩ = U|ψ⟩',
    related_terms: ['state-vector', 'inner-product', 'observable'],
    related_topics: ['quantum-gates-circuits', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'ancilla qubit',
    slug: 'ancilla-qubit',
    category: 'hardware & experiment',
    short:
      'A helper qubit prepared and measured to extract information such as a stabilizer value without intentionally storing the logical state.',
    long:
      'In a standard syndrome-extraction round, gates couple an ancilla to neighboring data qubits before the ancilla is measured. Ideally this reveals a stabilizer eigenvalue while preserving every superposition inside the corresponding eigenspace, so it does not reveal the encoded logical amplitudes. The interaction is real, however: an ancilla fault can propagate to several data qubits. Gate ordering, repeated rounds, verification, and flag qubits are tools for limiting or exposing that propagation.',
    related_terms: ['syndrome', 'stabilizer', 'flag-qubit'],
    related_topics: ['syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'anyon',
    slug: 'anyon',
    category: 'topology & anyons',
    short:
      'A quasiparticle in two dimensions whose exchanges and windings can imprint topological phases or transformations on the quantum state.',
    long:
      'In the toric-code model, an e excitation is a violated star at the end of a Z-error string, while an m excitation is a violated plaquette at the end of an X-error string. Winding e around m contributes a −1 phase: they have nontrivial mutual statistics even though e and m each have bosonic self-statistics in this model (their composite is fermionic). The result is insensitive to smooth path deformations that avoid other excitations, not to every physical imperfection. Toric-code anyons are Abelian, and their braiding alone is not a universal gate set.',
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
      'A logical qubit is a two-dimensional degree of freedom inside a larger code space, so no designated physical qubit alone carries its full state. Errors below the code\'s correctable weight cannot implement a nontrivial logical operation, but local faults can accumulate into a logical error and syndrome measurements can themselves be faulty. For suitable code families operated below their noise threshold, increasing distance can suppress logical error rapidly—often exponentially in distance under a specified model. That behavior is conditional, not an automatic consequence of using more physical qubits.',
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
      'One common convention uses |A⟩ = T|+⟩ = (|0⟩ + e^{iπ/4}|1⟩)/√2; names such as “T state” vary across sources. A Clifford gate-teleportation circuit consumes the state to implement a non-Clifford operation. Noisy injected states can be distilled, turning many imperfect copies into fewer higher-fidelity copies. Cultivation is a newer family of protocols that grows an encoded magic state while checking it; its advantage depends on the physical noise model, target fidelity, and architecture rather than guaranteeing lower overhead in every regime.',
    notation: '|A⟩ = T|+⟩',
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
      'A decoder that pairs detection events (or boundaries) with minimum total weight and uses those paths to propose a correction.',
    long:
      'Minimum-weight perfect matching turns a syndrome history into a weighted graph, then chooses a perfect matching of detection events and eligible boundaries. Edge weights encode an assumed noise model, and paths associated with the matching define a correction or Pauli-frame update. The selected chain need not be the fault chain that actually occurred; many chains have the same syndrome, and successful decoding only requires the combined fault and correction to be logically trivial. Performance, threshold, and runtime depend on graph construction and noise correlations, so correlated-noise variants may need richer models than basic MWPM.',
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
      'Decoding with enough sustained throughput and bounded-enough latency to keep pace with a live stream of syndrome data.',
    long:
      'Fast hardware can emit a new syndrome round on a microsecond-scale cadence, although the number is platform- and experiment-dependent. A decoder needs average throughput at least as high as the arrival rate; a persistent deficit makes the backlog grow without bound, approximately linearly with time rather than exponentially. It must also deliver decisions before the control operation that consumes them, so a high-throughput decoder can still fail a latency deadline. Streaming CPUs, GPUs, FPGAs, ASICs, and hierarchical schemes are engineering options, not parts of the definition.',
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
      'A family of two-dimensional topological stabilizer codes with local checks and boundaries that can encode logical qubits.',
    long:
      'The surface code is closely related to Kitaev\'s toric code but replaces the closed surface with boundaries or defects, producing planar patches suitable for devices. Its checks can be measured using geometrically local interactions on a two-dimensional layout, and logical operations can be built with deformations or lattice surgery. Threshold values are not universal constants: they depend on the noise model, circuit, decoder, leakage, and connectivity, with order-one-percent figures applying only to particular common circuit-level models. The code is prominent across several hardware roadmaps, but it is not the only fault-tolerant architecture.',
    related_terms: ['toric-code', 'plaquette', 'rotated-surface-code'],
    related_topics: ['surface-code'],
    related_papers: ['quant-ph/9811052', '1208.0928'],
  },
  {
    term: 'syndrome',
    slug: 'syndrome',
    category: 'code theory',
    short:
      'The pattern of stabilizer measurement values that constrains which errors may have occurred without directly measuring the encoded logical observable.',
    long:
      'For an ideal stabilizer code, an error that anticommutes with a check flips that check\'s eigenvalue. The resulting syndrome does not uniquely identify the physical fault: errors that differ by a stabilizer can have the same action on the code, and distinct logical classes can share a trivial syndrome. In repeated noisy extraction, decoders usually consume changes between outcomes—detection events—rather than treating every −1 as a fresh fault. Ideal check measurement preserves coherence within a syndrome subspace, but faulty extraction can still damage data and must itself be decoded.',
    related_terms: ['stabilizer', 'error-chain', 'mwpm-decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1110.5133'],
  },
  {
    term: 'threshold theorem',
    slug: 'threshold-theorem',
    category: 'code theory',
    short:
      'Under stated assumptions, noise below a nonzero threshold permits arbitrarily reliable and long quantum computation with scalable error correction.',
    long:
      'A threshold result specifies a code or fault-tolerant construction, a noise model, and assumptions about operations and correlations. Below its threshold, increasing the protection level can make logical failure arbitrarily small with controlled overhead; above it, simply increasing code size need not help. Surface-code thresholds are often of order one percent in simplified circuit-level depolarizing models, but coherent noise, leakage, biased noise, connectivity, and decoder choice can move the number substantially. There is therefore no hardware-independent universal “one-percent threshold.”',
    notation: 'p < p_th',
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
      'In an ideal gapped topological phase, ground states can depend on the topology of the space and support excitations with anyonic statistics. Local operators cannot distinguish the ground states in the thermodynamic limit; in finite systems the protection is approximate, and sequences of local faults can form a nonlocal logical operator. This structure motivates topological quantum codes, but an actively measured surface-code device is an engineered error-correcting system and need not be a passive equilibrium topological material. “Topological” therefore means robust to specified local deformations or errors, not immune to all noise.',
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

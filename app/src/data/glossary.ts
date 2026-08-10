/**
 * Glossary data (design/glossary.md §4 — 61 terms, 5 categories).
 * Lives here (not in the page) so the review deck, inline term popovers,
 * and the selection explainer share it, and scripts/check-data.mjs
 * validates it.
 */

function normalizeGlossaryName(value: string): string {
  return value.trim().toLowerCase().replace(/[.,;:!?]+$/u, '').replace(/\s+/gu, ' ');
}

/** Exact-match a free-text selection against a term or an explicit alias. */
export function matchGlossaryTerm(text: string): GlossaryTerm | undefined {
  const q = normalizeGlossaryName(text);
  if (!q) return undefined;
  return TERMS.find((t) => {
    const names = [t.term, ...(t.aliases ?? [])  {
    term: 'qLDPC code',
    slug: 'qldpc-code',
    category: 'code theory',
    aliases: ['qLDPC', 'qLDPC codes', 'quantum Low-Density Parity-Check code'],
    short: 'Quantum Low-Density Parity-Check codes: a broad family of codes with bounded-weight stabilizers that can achieve much better encoding rates than surface codes.',
    long: 'Unlike surface codes which are constrained to a 2D local lattice and have a vanishing rate k/n, qLDPC codes use non-local connections. This allows them to encode many more logical qubits into the same number of physical qubits while maintaining bounded parity-check weights.',
    related_terms: ['bivariate-bicycle', 'tanner-graph', 'surface-code'],
    related_topics: ['qldpc-codes'],
    related_papers: ['2308.07915'],
  },
  {
    term: 'Bivariate Bicycle code',
    slug: 'bivariate-bicycle',
    category: 'code theory',
    aliases: ['Bivariate Bicycle codes', 'bivariate bicycle', 'BB code'],
    short: 'A specific, highly efficient family of qLDPC codes constructed from polynomials over finite fields.',
    long: 'Bivariate Bicycle codes offer an excellent trade-off between hardware connectivity requirements and encoding efficiency. They have recently been the focus of proposals for near-term qLDPC hardware implementations because they map relatively well to devices with limited long-range connections.',
    related_terms: ['qldpc-code', 'tanner-graph'],
    related_topics: ['qldpc-codes'],
    related_papers: ['2308.07915'],
  },
  {
    term: 'Tanner graph',
    slug: 'tanner-graph',
    category: 'code theory',
    aliases: ['Tanner graphs'],
    short: 'A bipartite graph representing an error-correcting code, with nodes for data qubits and nodes for parity checks.',
    long: 'In a Tanner graph, an edge connects a parity-check node to a data-qubit node if that qubit is part of that check. The degree of the nodes corresponds to the weight of the checks and the number of checks a qubit participates in. Low-density parity-check (LDPC) codes are defined by having sparse Tanner graphs.',
    related_terms: ['qldpc-code', 'parity'],
    related_topics: ['qldpc-codes', 'classical-error-correction'],
    related_papers: [],
  },
];
    const paren = t.term.match(/\(([^)]+)\)/);
    if (paren) names.push(paren[1]);
    names.push(t.term.replace(/\s*\([^)]*\)/, '').trim());
    return names.some((name) => normalizeGlossaryName(name) === q);
  });
}

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
  /** Exact selection-matcher names; include plurals and abbreviations deliberately. */
  aliases?: string[];
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
  'topology & anyons': '#9B7BFA',
  computation: '#F5B83D',
  decoding: '#FB7185',
  'hardware & experiment': '#34D399',
};

export const TERMS: GlossaryTerm[] = [
  {
    term: 'amplitude',
    slug: 'amplitude',
    category: 'computation',
    aliases: ['amplitudes', 'probability amplitude', 'probability amplitudes'],
    short:
      'A complex coefficient in a quantum state; its squared magnitude contributes a probability, while its phase controls interference.',
    long:
      'In |ψ⟩ = α|0⟩ + β|1⟩, α and β are amplitudes. An amplitude is not a probability: it may be negative or complex, and alternatives add as amplitudes before the Born rule takes a squared magnitude. Normalization requires |α|² + |β|² = 1 for this two-state basis. Relative phases between amplitudes can change later measurement statistics even when their magnitudes match.',
    notation: 'α ∈ ℂ',
    related_terms: ['probability', 'normalization', 'phase', 'born-rule'],
    related_topics: ['quantum-mechanics-basics', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'Born rule',
    slug: 'born-rule',
    category: 'computation',
    aliases: ["Born's rule"],
    short:
      'The rule that converts a normalized quantum state and a measurement into probabilities for its possible outcomes.',
    long:
      'For a pure state |ψ⟩ and projector P, the outcome probability is ⟨ψ|P|ψ⟩. For a density operator ρ, it is Tr(ρP); more general measurements replace P with a positive measurement effect. The rule predicts statistics across repeated preparations. A finite run only estimates those probabilities and does not by itself prove that a device prepared the claimed state.',
    notation: 'p = Tr(ρP)',
    related_terms: ['probability', 'amplitude', 'measurement', 'projector'],
    related_topics: ['quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'bra-ket notation',
    slug: 'bra-ket-notation',
    category: 'computation',
    aliases: ['Dirac notation', 'bra-ket', 'ket', 'bra', 'kets', 'bras'],
    short:
      'Dirac’s notation for vectors and their conjugate transposes: |ψ⟩ is a ket, ⟨ψ| is its bra, and ⟨φ|ψ⟩ is an inner product.',
    long:
      'A ket |ψ⟩ can be represented as a column vector after choosing a basis. Its bra ⟨ψ| is the conjugate-transposed row vector, so ⟨ψ|ψ⟩ is its squared norm and |ψ⟩⟨ψ| is a projector onto its direction. The notation is basis-independent; coordinates such as α and β appear only after expanding the ket in a chosen basis.',
    notation: '⟨φ|ψ⟩',
    related_terms: ['vector', 'complex-number', 'hilbert-space', 'projector'],
    related_topics: ['complex-numbers-dirac-notation', 'linear-algebra'],
    related_papers: [],
  },
  {
    term: 'codespace',
    slug: 'codespace',
    category: 'code theory',
    aliases: ['code space', 'code spaces', 'codespaces'],
    short:
      'The subspace of physical-qubit states designated to represent the protected logical information of a quantum code.',
    long:
      'For a stabilizer code, the codespace is the simultaneous +1 eigenspace of the chosen independent stabilizer generators. An error that anticommutes with a check can move the state into a different syndrome sector. A decoder estimates a correction or updates a Pauli frame so future logical predictions are interpreted consistently; it need not reveal which physical fault actually occurred.',
    related_terms: ['stabilizer', 'physical-vs-logical-qubit', 'syndrome', 'decoder'],
    related_topics: ['quantum-codes-basics', 'stabilizer-formalism'],
    related_papers: [],
  },
  {
    term: 'coherence and decoherence',
    slug: 'coherence-decoherence',
    category: 'hardware & experiment',
    aliases: ['coherence', 'decoherence', 'coherent', 'decoherent'],
    short:
      'Coherence is the phase relationship that enables interference; decoherence is its loss from uncontrolled coupling or averaging.',
    long:
      'In a chosen basis, coherence appears in off-diagonal entries of a density operator. When a system becomes entangled with an unobserved environment, its reduced state can lose those entries and therefore lose interference visibility. Coherence is basis- and task-dependent, and hardware times such as T₁ and T₂ summarize particular experiments rather than one universal lifetime.',
    related_terms: ['phase', 'density-operator', 'superposition', 'entanglement'],
    related_topics: ['quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'commutation and anticommutation',
    slug: 'commutation-anticommutation',
    category: 'code theory',
    aliases: ['commutation', 'anticommutation', 'commute', 'anticommute', 'commutator'],
    short:
      'Operators commute when AB = BA and anticommute when AB = −BA; the distinction controls compatibility and syndrome signs.',
    long:
      'Commuting observables admit compatible projective descriptions and can be measured without the order changing their algebraic product. Pauli operators either commute or anticommute. If an error E anticommutes with a stabilizer S, then SE = −ES, so E maps a +1 stabilizer eigenstate to a −1 sector. That sign change is what a stabilizer syndrome can expose.',
    notation: '[A,B] = AB − BA',
    related_terms: ['pauli-operator', 'stabilizer', 'observable', 'syndrome'],
    related_topics: ['qubits-pauli-operators', 'stabilizer-formalism'],
    related_papers: [],
  },
  {
    term: 'complex number',
    slug: 'complex-number',
    category: 'computation',
    aliases: ['complex numbers', 'imaginary number', 'imaginary numbers'],
    short:
      'A number a + bi with i² = −1, representable by a magnitude and an angle in a two-dimensional plane.',
    long:
      'Quantum amplitudes are complex because complex multiplication naturally tracks both magnitude and phase. The conjugate of a + bi is a − bi, and multiplying a number by its conjugate gives its squared magnitude a² + b². Probabilities depend on magnitudes, while relative complex phases determine interference. The imaginary part is mathematical structure, not an “imaginary probability.”',
    notation: 'z = a + bi',
    related_terms: ['amplitude', 'phase', 'square-root', 'bra-ket-notation'],
    related_topics: ['complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'decoder',
    slug: 'decoder',
    category: 'decoding',
    aliases: ['decoders', 'quantum decoder', 'quantum decoders'],
    short:
      'An inference algorithm that maps syndrome or detection-event evidence to a correction, Pauli-frame update, or logical prediction.',
    long:
      'A decoder does not observe the hidden physical error. It chooses among error classes consistent with the evidence using a declared model, objective, and approximation. Different errors can share a syndrome, and a correction can clear every check yet differ from the true error by a logical operator. Accuracy, throughput, latency, memory use, and calibration requirements are separate decoder properties.',
    related_terms: ['syndrome', 'detection-event', 'mwpm-decoder', 'logical-operator'],
    related_topics: ['decoding-mwpm', 'advanced-decoding'],
    related_papers: [],
  },
  {
    term: 'density operator',
    slug: 'density-operator',
    category: 'computation',
    aliases: ['density matrix', 'density matrices', 'density operators'],
    short:
      'A positive semidefinite, trace-one operator that represents pure states, classical mixtures, and reduced states of entangled systems.',
    long:
      'A pure state has ρ = |ψ⟩⟨ψ| and satisfies ρ² = ρ. A mixed state can be written as a probability-weighted sum of pure-state projectors and generally has Tr(ρ²) < 1. Density operators let one describe a subsystem without pretending the rest of an entangled system is known. Measurement probabilities follow p = Tr(ρE) for measurement effect E.',
    notation: 'ρ ≥ 0, Tr ρ = 1',
    related_terms: ['projector', 'probability', 'entanglement', 'coherence-decoherence'],
    related_topics: ['quantum-mechanics-basics', 'linear-algebra'],
    related_papers: [],
  },
  {
    term: 'determinant',
    slug: 'determinant',
    category: 'computation',
    aliases: ['determinants'],
    short:
      'A scalar assigned to a square matrix that tracks signed volume scaling and vanishes exactly when the matrix is non-invertible.',
    long:
      'For a 2×2 matrix [[a,b],[c,d]], det(A) = ad − bc. A zero determinant means at least one direction was collapsed, so the columns are linearly dependent and the matrix has less than full rank. A unitary matrix has determinant of magnitude one, but determinant alone does not determine whether a matrix is unitary or Hermitian.',
    notation: 'det(A)',
    related_terms: ['matrix', 'rank', 'unitary-operator', 'vector'],
    related_topics: ['linear-algebra'],
    related_papers: [],
  },
  {
    term: 'detection event',
    slug: 'detection-event',
    category: 'decoding',
    aliases: ['detection events', 'detector event', 'detector events'],
    short:
      'A violation of an expected parity relation among measurement results, often revealed by comparing a stabilizer check across rounds.',
    long:
      'A syndrome is a pattern of check outcomes for a state or round; a detection event is defined from a detector relation that should be deterministic when no relevant fault occurs. In repeated surface-code extraction, a changed check result between neighboring rounds is a common detector, with special boundary-time rules at initialization and final measurement. Decoding graphs use detection events as vertices. They should not be renamed “the syndrome,” because the two data objects differ.',
    related_terms: ['syndrome', 'space-time-diagram', 'decoder', 'parity'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'eigenvalue and eigenvector',
    slug: 'eigenvalue-eigenvector',
    category: 'computation',
    aliases: ['eigenvalue', 'eigenvalues', 'eigenvector', 'eigenvectors', 'eigenstate', 'eigenstates'],
    short:
      'An eigenvector keeps its direction under an operator A, changing only by the scalar eigenvalue λ: A|v⟩ = λ|v⟩.',
    long:
      'Eigenvectors identify directions on which a linear transformation acts simply. For a Hermitian observable, eigenvalues are real and label possible projective-measurement outcomes; degenerate eigenvalues can correspond to whole eigenspaces. A stabilizer has eigenvalues ±1, and its codespace is selected by the +1 eigenspace of every generator.',
    notation: 'A|v⟩ = λ|v⟩',
    related_terms: ['matrix', 'hermitian-operator', 'observable', 'stabilizer'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'entanglement',
    slug: 'entanglement',
    category: 'computation',
    aliases: ['entangled state', 'entangled states', 'entangled'],
    short:
      'A property of a composite quantum state that cannot be written as one independent state for each subsystem.',
    long:
      'The Bell state (|00⟩ + |11⟩)/√2 is entangled because no product |a⟩⊗|b⟩ reproduces it. Measurements can show correlations stronger than classical local-hidden-variable models allow, but those correlations cannot be used by themselves to signal faster than light. Entanglement is also why a subsystem may require a mixed density operator even when the full state is pure.',
    related_terms: ['tensor-product', 'superposition', 'density-operator', 'measurement'],
    related_topics: ['quantum-mechanics-basics', 'quantum-gates-circuits'],
    related_papers: [],
  },
  {
    term: 'global phase',
    slug: 'global-phase',
    category: 'computation',
    aliases: ['global phases', 'overall phase', 'overall phases'],
    short:
      'A common factor e^{iφ} multiplying an entire state vector; it leaves all isolated-system measurement probabilities unchanged.',
    long:
      '|ψ⟩ and e^{iφ}|ψ⟩ represent the same physical ray because bra and ket factors cancel in every expectation value. This differs from relative phase, where only one component or branch gains a phase and later interference can change. What looks global for one branch can become relative after introducing a coherent reference, so the system being modelled must be stated.',
    notation: '|ψ⟩ ∼ e^{iφ}|ψ⟩',
    related_terms: ['phase', 'amplitude', 'superposition', 'bra-ket-notation'],
    related_topics: ['complex-numbers-dirac-notation', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'Hermitian operator',
    slug: 'hermitian-operator',
    category: 'computation',
    aliases: ['Hermitian', 'Hermitian matrix', 'Hermitian matrices', 'self-adjoint operator'],
    short:
      'An operator equal to its conjugate transpose, with real eigenvalues and orthogonal eigenspaces for distinct eigenvalues.',
    long:
      'Hermitian operators model observables in the standard projective formalism because their real eigenvalues can label outcomes. Pauli X, Y, and Z are Hermitian as well as unitary. Hermitian does not mean reversible: the words describe different algebraic properties, even though some operators — including Paulis — have both.',
    notation: 'A = A†',
    related_terms: ['matrix', 'eigenvalue-eigenvector', 'observable', 'unitary-operator'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'Hilbert space',
    slug: 'hilbert-space',
    category: 'computation',
    aliases: ['Hilbert spaces', 'state space', 'state spaces'],
    short:
      'A complex vector space with an inner product and suitable completeness; quantum states are represented by rays in it.',
    long:
      'For the finite systems used here, think of Hilbert space as a complex vector space where inner products define lengths, angles, and probabilities. One qubit has dimension 2; n qubits have dimension 2ⁿ because their spaces combine by tensor product. A basis supplies coordinates, but changing basis does not change the underlying physical state.',
    notation: '|ψ⟩ ∈ ℋ',
    related_terms: ['vector', 'bra-ket-notation', 'tensor-product', 'normalization'],
    related_topics: ['linear-algebra', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'matrix',
    slug: 'matrix',
    category: 'computation',
    aliases: ['matrices'],
    short:
      'A rectangular array of numbers that represents a linear map after input and output bases have been chosen.',
    long:
      'Multiplying a matrix by a vector combines the matrix columns according to the vector’s coordinates. Quantum gates are represented by unitary matrices, observables by Hermitian matrices, and density operators by positive trace-one matrices. The entries depend on the chosen basis even when the underlying linear operator does not.',
    related_terms: ['vector', 'rank', 'determinant', 'unitary-operator'],
    related_topics: ['linear-algebra'],
    related_papers: [],
  },
  {
    term: 'measurement',
    slug: 'measurement',
    category: 'computation',
    aliases: ['measurements', 'quantum measurement', 'quantum measurements'],
    short:
      'A physical operation with classical outcomes, outcome probabilities, and conditional updates to the quantum state.',
    long:
      'In a projective measurement, orthogonal projectors define possible eigenspaces: the Born rule gives each probability and the observed state is updated into the selected subspace. General quantum measurements use effects and measurement operators rather than only projectors. Measurement is not simply “looking,” and it need not destroy all information: a state already in the measured eigenspace can be left unchanged in the ideal model.',
    related_terms: ['projector', 'born-rule', 'observable', 'density-operator'],
    related_topics: ['quantum-mechanics-basics', 'qubits-pauli-operators'],
    related_papers: [],
  },
  {
    term: 'normalization',
    slug: 'normalization',
    category: 'computation',
    aliases: ['normalize', 'normalized', 'normalisation', 'normalise', 'normalised'],
    short:
      'Rescaling a state so its total probability is one, equivalently so its state vector has norm one.',
    long:
      'If |ψ⟩ = Σᵢ αᵢ|i⟩ in an orthonormal basis, normalization requires Σᵢ|αᵢ|² = 1. For two equal components, each amplitude is 1/√2 because each probability is its square, 1/2. Normalization fixes length but not global phase; normalized vectors that differ only by a global phase represent the same pure state.',
    notation: '⟨ψ|ψ⟩ = 1',
    related_terms: ['probability', 'amplitude', 'square-root', 'global-phase'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'observable',
    slug: 'observable',
    category: 'computation',
    aliases: ['observables', 'quantum observable', 'quantum observables'],
    short:
      'A measurable quantity represented, in the projective formalism, by a Hermitian operator whose eigenvalues label outcomes.',
    long:
      'Choosing an observable chooses a question and its eigenspaces. For state ρ, the expectation value is Tr(ρA), but a single measurement returns an outcome rather than the expectation value itself. Commuting observables can share an eigenbasis; non-commuting observables generally cannot be assigned simultaneously sharp projective outcomes. General measurements are broader than observables alone.',
    notation: '⟨A⟩ = Tr(ρA)',
    related_terms: ['hermitian-operator', 'measurement', 'eigenvalue-eigenvector', 'commutation-anticommutation'],
    related_topics: ['quantum-mechanics-basics', 'linear-algebra'],
    related_papers: [],
  },
  {
    term: 'parity',
    slug: 'parity',
    category: 'code theory',
    aliases: ['parities', 'parity check', 'parity checks'],
    short:
      'Whether a count is even or odd; in QEC a joint Pauli measurement reports a parity without revealing every individual data value.',
    long:
      'Classically, XOR is a parity operation: it is 0 for an even number of 1s and 1 for an odd number. In stabilizer QEC, a product such as Z₁Z₂Z₃Z₄ has eigenvalue +1 or −1 and acts as a parity check in the Z basis. Carefully designed ancilla circuits extract that joint sign while preserving logical superpositions inside a syndrome sector.',
    related_terms: ['stabilizer', 'syndrome', 'ancilla-qubit', 'commutation-anticommutation'],
    related_topics: ['classical-error-correction', 'stabilizer-formalism'],
    related_papers: [],
  },
  {
    term: 'Pauli operator',
    slug: 'pauli-operator',
    category: 'code theory',
    aliases: ['Pauli', 'Paulis', 'Pauli matrix', 'Pauli matrices', 'Pauli operators'],
    short:
      'One of the single-qubit operators I, X, Y, and Z; their products form the error and stabilizer language used throughout QEC.',
    long:
      'X swaps |0⟩ and |1⟩, Z changes the sign of |1⟩, and Y combines a bit and phase flip up to phase. These matrices are both Hermitian and unitary. Any single-qubit operator can be expanded in the Pauli basis, which is why correcting Pauli errors suffices to correct arbitrary errors on the same supported qubits under the standard linear error-correction argument.',
    notation: 'I, X, Y, Z',
    related_terms: ['commutation-anticommutation', 'stabilizer', 'logical-operator', 'unitary-operator'],
    related_topics: ['qubits-pauli-operators', 'stabilizer-formalism'],
    related_papers: [],
  },
  {
    term: 'phase',
    slug: 'phase',
    category: 'computation',
    aliases: ['phases', 'relative phase', 'relative phases'],
    short:
      'The angle of a complex amplitude; differences in phase determine whether quantum alternatives reinforce or cancel when they interfere.',
    long:
      'Multiplying one component by e^{iφ} rotates its complex amplitude without changing its magnitude. A measurement in the original basis may therefore see unchanged probabilities, while a later basis change converts relative phase into different outcome probabilities. Only phase relations inside the model are observable; a common global phase on the entire isolated state is not.',
    notation: 'e^{iφ}',
    related_terms: ['amplitude', 'complex-number', 'global-phase', 'superposition'],
    related_topics: ['complex-numbers-dirac-notation', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'physical vs logical qubit',
    slug: 'physical-vs-logical-qubit',
    category: 'code theory',
    aliases: ['physical qubit', 'physical qubits', 'physical and logical qubits', 'physical vs logical'],
    short:
      'A physical qubit is one device degree of freedom; a logical qubit is encoded in a protected subspace across multiple physical qubits.',
    long:
      'Physical gates, measurements, leakage, and noise occur on hardware components. A quantum code maps a smaller logical state space into correlations among those components. A physical fault is not automatically a logical fault: many are detected and corrected or tracked. Conversely, an undetected chain can enact a logical operator even when every final parity check is satisfied.',
    related_terms: ['logical-qubit', 'codespace', 'logical-operator', 'code-distance'],
    related_topics: ['quantum-codes-basics'],
    related_papers: [],
  },
  {
    term: 'probability',
    slug: 'probability',
    category: 'computation',
    aliases: ['probabilities', 'probabilistic'],
    short:
      'A number from 0 to 1 assigned by a model to an outcome, with mutually exclusive exhaustive outcomes summing to 1.',
    long:
      'Probability is not the same as certainty about one trial. Repeating comparable trials produces frequencies that can estimate a probability, with uncertainty that shrinks only statistically. In quantum mechanics the Born rule derives outcome probabilities from amplitudes or a density operator. In error correction, a quoted error rate is meaningful only with its event definition, sampling procedure, and uncertainty.',
    notation: '0 ≤ p ≤ 1',
    related_terms: ['amplitude', 'normalization', 'born-rule', 'density-operator'],
    related_topics: ['quantum-mechanics-basics', 'classical-error-correction'],
    related_papers: [],
  },
  {
    term: 'projector',
    slug: 'projector',
    category: 'computation',
    aliases: ['projectors', 'projection operator', 'projection operators'],
    short:
      'A Hermitian operator P with P² = P that keeps vectors in one subspace and removes components orthogonal to it.',
    long:
      'For a normalized vector |v⟩, P = |v⟩⟨v| projects onto its one-dimensional span. Projective measurements use mutually orthogonal projectors that sum to the identity. The Born probability is Tr(ρP), and after obtaining that outcome the ideal state update is proportional to PρP. A projector is a mathematical map; a physical measurement also includes an implementation and a recorded outcome.',
    notation: 'P² = P = P†',
    related_terms: ['measurement', 'born-rule', 'bra-ket-notation', 'codespace'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'rank',
    slug: 'rank',
    category: 'computation',
    aliases: ['matrix rank'],
    short:
      'The number of linearly independent output directions of a matrix, equal to the dimension of its column space.',
    long:
      'A square matrix has full rank exactly when it is invertible, equivalently when its determinant is nonzero. Rank also helps classify quantum states: a pure density operator has rank one, while a mixed state may have larger rank. Rank counts independent directions, not the number of nonzero entries.',
    notation: 'rank(A)',
    related_terms: ['matrix', 'vector', 'determinant', 'density-operator'],
    related_topics: ['linear-algebra'],
    related_papers: [],
  },
  {
    term: 'square root',
    slug: 'square-root',
    category: 'computation',
    aliases: ['square roots', 'principal square root'],
    short:
      'The principal square root √x is the nonnegative number whose square is x; quantum normalization often produces factors such as 1/√2.',
    long:
      'Because probabilities are squared magnitudes of amplitudes, equal probabilities of 1/2 require amplitude magnitudes √(1/2) = 1/√2. Over complex numbers, equations can have multiple roots, but the symbol √x for nonnegative real x conventionally means the principal nonnegative root. Squaring an amplitude and taking its magnitude are distinct operations when complex phases are present.',
    notation: '(√x)² = x',
    related_terms: ['normalization', 'amplitude', 'complex-number', 'probability'],
    related_topics: ['linear-algebra', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'superposition',
    slug: 'superposition',
    category: 'computation',
    aliases: ['superpositions', 'quantum superposition', 'quantum superpositions'],
    short:
      'A linear combination of quantum states; its amplitudes and relative phases determine outcomes in different measurement bases.',
    long:
      '|ψ⟩ = α|0⟩ + β|1⟩ is a superposition in the {|0⟩,|1⟩} basis. This does not mean a classical coin secretly chose one basis state: interference can reveal the relative phase. Superposition is basis-dependent — the same state may be one basis vector in another basis — and measurement generally updates it according to the measured observable.',
    notation: '|ψ⟩ = α|0⟩ + β|1⟩',
    related_terms: ['amplitude', 'phase', 'measurement', 'normalization'],
    related_topics: ['quantum-mechanics-basics', 'complex-numbers-dirac-notation'],
    related_papers: [],
  },
  {
    term: 'tensor product',
    slug: 'tensor-product',
    category: 'computation',
    aliases: ['tensor products', 'Kronecker product', 'Kronecker products'],
    short:
      'The operation ⊗ that combines state spaces or operators for separate quantum subsystems.',
    long:
      'If systems A and B have dimensions m and n, their joint Hilbert space has dimension mn. Product states have the form |a⟩⊗|b⟩, often shortened to |ab⟩. Not every joint state factors this way; the non-factorable states are entangled. Tensor product is different from an inner product, which combines two vectors into a scalar.',
    notation: 'ℋ_A ⊗ ℋ_B',
    related_terms: ['hilbert-space', 'entanglement', 'bra-ket-notation', 'vector'],
    related_topics: ['linear-algebra', 'quantum-mechanics-basics'],
    related_papers: [],
  },
  {
    term: 'unitary operator',
    slug: 'unitary-operator',
    category: 'computation',
    aliases: ['unitary', 'unitaries', 'unitary matrix', 'unitary matrices', 'unitary operators'],
    short:
      'A linear operator U with U†U = I, preserving inner products, norms, and therefore total probability.',
    long:
      'Unitary evolution is reversible: U⁻¹ = U†. Closed-system quantum gates are represented by unitary operators, so normalized states stay normalized. Projective measurement on the measured subsystem is not itself a unitary state update, although a larger system-plus-apparatus model can evolve unitarily before an outcome is recorded.',
    notation: 'U†U = I',
    related_terms: ['matrix', 'hermitian-operator', 'normalization', 'measurement'],
    related_topics: ['linear-algebra', 'quantum-gates-circuits'],
    related_papers: [],
  },
  {
    term: 'vector',
    slug: 'vector',
    category: 'computation',
    aliases: ['vectors', 'state vector', 'state vectors'],
    short:
      'An object that can be added and scaled; after choosing a basis, its coordinates are written as an ordered list of numbers.',
    long:
      'A vector is more than an arrow or list: those are representations of an element of a vector space. Quantum pure states use normalized complex vectors, with vectors differing only by global phase representing the same physical ray. A basis lets us write coordinates, while matrices describe linear maps between vector spaces.',
    related_terms: ['matrix', 'hilbert-space', 'normalization', 'global-phase'],
    related_topics: ['linear-algebra'],
    related_papers: [],
  },
  {
    term: 'ancilla qubit',
    slug: 'ancilla-qubit',
    category: 'hardware & experiment',
    aliases: ['ancilla', 'ancillas', 'ancilla qubits', 'syndrome ancilla', 'syndrome ancillas'],
    short:
      'A helper qubit prepared, coupled to data, and measured to extract check information without directly measuring each data value.',
    long:
      'A common Z-check circuit prepares |0⟩, uses data-controlled CNOTs into the ancilla, then measures Z. A common X-check circuit prepares |+⟩, uses ancilla-controlled CNOTs into the data, then measures X; equivalent basis-changed circuits also exist. The ancilla does interact with the encoded block, but an ideal check reveals only a joint stabilizer eigenvalue. Its faults can propagate through those gates, so ordering, flags, and decoder modelling matter.',
    related_terms: ['syndrome', 'stabilizer', 'flag-qubit', 'parity'],
    related_topics: ['syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'anyon',
    slug: 'anyon',
    category: 'topology & anyons',
    aliases: ['anyons'],
    short:
      'A quasiparticle of a two-dimensional system whose exchange statistics are neither bosonic nor fermionic.',
    long:
      'In an ideal toric-code Hamiltonian, violated star and plaquette terms are commonly described as e and m anyonic excitations at endpoints of Pauli strings. Their exchange and winding algebra depends on topological class. Planar surface-code boundaries can condense particular species, so a string may end there without a bulk excitation. In active syndrome-extraction circuits, “anyon” is a useful code-model language, not a claim that a hardware chip literally transports material particles.',
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
      'In an ideal topological model, deformations that preserve the braid’s topological class implement the same logical action. Surface-code proposals can braid holes or defects to enact gates such as CNOT. Many architecture studies instead use lattice surgery, where joint logical measurements replace spatial braids; which method is preferable depends on layout, timing, noise, and compiler constraints.',
    related_terms: ['anyon', 'defect-hole', 'lattice-surgery'],
    related_topics: ['defects-braiding'],
    related_papers: ['0803.0272'],
  },
  {
    term: 'Clifford gate',
    slug: 'clifford-gate',
    category: 'computation',
    aliases: ['Clifford', 'Cliffords', 'Clifford gates'],
    short:
      'A gate from the group that maps Pauli operators to Pauli operators — H, S, CNOT. Clifford gates are powerful, but a classical computer can simulate them efficiently.',
    long:
      'The Gottesman–Knill theorem efficiently simulates stabilizer-state preparations, Clifford gates, and Pauli measurements. The assumptions matter: a Clifford circuit supplied with non-stabilizer input is not covered merely because its gates are Clifford. In surface-code architectures, some Clifford actions use lattice surgery or code deformation and some Pauli corrections are tracked in software. A universal gate set also needs a non-Clifford resource.',
    related_terms: ['non-clifford-gate', 'magic-state', 'stabilizer'],
    related_topics: ['quantum-gates-circuits', 'clifford-simulation-hybrid'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'non-Clifford gate',
    slug: 'non-clifford-gate',
    category: 'computation',
    aliases: ['non-Clifford', 'non-Cliffords', 'non-Clifford gates'],
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
    aliases: ['distance', 'code distances'],
    short:
      'The minimum weight of an operator that acts non-trivially on the encoded information while escaping the code’s checks.',
    long:
      'An ideal distance-d code corrects arbitrary errors supported on at most ⌊(d−1)/2⌋ qubits. Distance alone does not give a hardware logical-error rate: extraction circuits, leakage, correlations, boundaries, decoder, and time all matter. For a specified scalable code family and noise model below its threshold, logical failure often decreases approximately exponentially with d; an experiment must measure that trend rather than assume it.',
    notation: 'd',
    related_terms: ['logical-operator', 'surface-code', 'threshold-theorem'],
    related_topics: ['quantum-codes-basics', 'surface-code'],
    related_papers: ['2207.06431'],
  },
  {
    term: 'CSS code',
    slug: 'css-code',
    category: 'code theory',
    aliases: ['CSS', 'CSS codes'],
    short:
      'A stabilizer code built from two classical codes, whose X-type and Z-type checks can be designed and decoded separately.',
    long:
      'CSS codes are named for Calderbank, Shor, and Steane. Their checks separate into X-type and Z-type sets constructed from compatible classical codes. This often permits separate decoding of the two syndrome components under a factorized noise approximation. Y errors and other X–Z correlations can couple those components, so a joint decoder may recover information that separate decoders discard.',
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
    aliases: ['error chains'],
    short:
      'A path-like product of physical errors whose bulk check flips cancel, leaving syndrome only at non-condensing endpoints.',
    long:
      'In ideal surface-code geometry, adjacent Pauli errors cancel their interior check violations. On a torus, a closed non-contractible chain can be logical. On a planar patch, a relative chain can end on compatible condensing boundaries and still act logically; saying it has “no endpoints” hides those boundary endpoints. Decoding chooses a compatible error class, and a silent logical failure occurs when error plus correction is a non-trivial representative.',
    related_terms: ['syndrome', 'mwpm-decoder', 'logical-operator'],
    related_topics: ['decoding-mwpm'],
    related_papers: ['1307.1740'],
  },
  {
    term: 'fault tolerance',
    slug: 'fault-tolerance',
    category: 'code theory',
    aliases: ['fault-tolerant', 'FT'],
    short:
      'Circuit design that limits how faults spread so a stated number of faults remains correctable under a specified fault model.',
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
    aliases: ['flag', 'flags', 'flag qubits'],
    short:
      'An extra ancilla that signals when a correlated fault has spread from the extraction circuit onto the data qubits.',
    long:
      'A flag is coupled so selected ancilla-fault propagation paths also change its outcome. A raised flag narrows the decoder’s candidate set; it does not identify or guarantee correction of one exact data error. Protection follows only when the full circuit, accepted fault set, follow-up measurements, and decoder satisfy the scheme’s fault-tolerance conditions.',
    related_terms: ['ancilla-qubit', 'hook-error', 'fault-tolerance'],
    related_topics: ['flag-fault-tolerance'],
    related_papers: ['1402.4848'],
  },
  {
    term: 'hook error',
    slug: 'hook-error',
    category: 'hardware & experiment',
    aliases: ['hook', 'hooks', 'hook errors'],
    short:
      'A single ancilla fault that propagates through the extraction circuit into two data-qubit errors — sometimes aligned with the logical operator.',
    long:
      'Which propagated pair is dangerous depends on the patch geometry, logical direction, CNOT convention, check type, and schedule. A poorly oriented hook can shorten a logical fault path and reduce circuit distance; a perpendicular pair is not automatically harmless in every circuit. Scheduling and flag constructions are methods for controlling these paths, and their claimed distance must be verified for the complete extraction circuit.',
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
    aliases: ['logical operators'],
    short:
      'An operator that acts on the encoded qubit: a chain of Paulis that commutes with every stabilizer but is not itself a stabilizer.',
    long:
      'On a planar surface-code patch, logical strings connect compatible boundaries or wind suitable holes; on a torus they are closed non-contractible cycles. Multiplying by a stabilizer changes the physical representative without changing its logical action. The minimum weight among non-trivial representatives defines the corresponding code distance.',
    related_terms: ['code-distance', 'logical-qubit', 'error-chain'],
    related_topics: ['toric-code', 'surface-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'logical qubit',
    slug: 'logical-qubit',
    category: 'code theory',
    aliases: ['logical qubits', 'encoded qubit', 'encoded qubits'],
    short:
      'The protected qubit encoded collectively across many noisy physical qubits of an error-correcting code.',
    long:
      'The logical state occupies a codespace rather than one designated component. Adding physical qubits helps only as part of a code family operated below the relevant threshold with suitable circuits and decoding. Experiments in 2022 compared smaller and larger surface-code memories, and later work extended distance and lifetime studies; each result is evidence under its own noise, cycle count, decoder, and logical metric rather than a universal milestone.',
    related_terms: ['logical-operator', 'code-distance', 'stabilizer', 'physical-vs-logical-qubit'],
    related_topics: ['quantum-codes-basics', 'below-threshold-experiments'],
    related_papers: ['2207.06431', '2408.13687'],
  },
  {
    term: 'magic state',
    slug: 'magic-state',
    category: 'computation',
    aliases: ['magic states', 'A state', 'A states'],
    short:
      'A specially prepared resource state that, consumed by gate teleportation, supplies the non-Clifford power a surface code lacks natively.',
    long:
      'With the convention |A⟩ = T|+⟩, a gate-teleportation gadget consumes the resource to enact T up to a measurement-dependent Clifford correction. Distillation postselects a few cleaner outputs from many noisy inputs. Cultivation instead injects into a small distance-3 color code, alternates checks with growth and postselection, then escapes into a larger matchable code. Its reported savings are simulation results for declared circuit-noise and target regimes; escape errors and discarded attempts remain part of the cost.',
    notation: '|A⟩ = T|+⟩',
    related_terms: ['non-clifford-gate', 'clifford-gate'],
    related_topics: ['magic-states-distillation', 'magic-state-cultivation'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'measurement-based QC (MBQC)',
    slug: 'mbqc',
    category: 'computation',
    aliases: ['MBQC', 'measurement-based quantum computing'],
    short:
      'A model of computation where entanglement is prepared up front as a cluster state, and adaptive single-qubit measurements do the computing.',
    long:
      'MBQC replaces a gate sequence with preparation of an entangled resource plus adaptive measurements and classical feed-forward. Particular three-dimensional cluster-state constructions are closely related to repeated surface-code syndrome extraction, but not every surface-code protocol is literally the same object as every MBQC scheme. Threshold values depend on noise model, loss assumptions, lattice, syndrome circuit, and decoder, so there is no context-free “highest threshold.”',
    related_terms: ['stabilizer', 'fault-tolerance', 'lattice-surgery'],
    related_topics: ['cluster-states-mbqc'],
    related_papers: ['quant-ph/0510135', '0805.3202'],
  },
  {
    term: 'MWPM decoder',
    slug: 'mwpm-decoder',
    category: 'decoding',
    aliases: ['MWPM', 'minimum-weight perfect matching', 'matching decoder', 'matching decoders'],
    short:
      'A decoder that pairs detection events or boundaries to minimize total weight on a declared decoding graph.',
    long:
      'Blossom-style methods solve the graph’s matching objective exactly. If edge weights encode independent candidate faults, low total weight can approximate a likely explanation. This is not generally exact maximum-likelihood decoding of a degenerate code: multiple chains can share a logical class, and correlations or hypergraph faults may be lost in the pair graph. Runtime and threshold depend on graph construction, implementation, code, and noise model.',
    related_terms: ['error-chain', 'detection-event', 'decoder', 'real-time-decoding'],
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
    aliases: ['real-time decoder', 'realtime decoding', 'realtime decoder'],
    short:
      'Decoding fast enough to keep pace with the hardware\'s measurement stream, so the backlog of undecoded syndromes never grows.',
    long:
      'Cycle times vary by platform and experiment. If evidence arrives at fixed rate a while a decoder services it at fixed rate s<a, the unresolved queue grows approximately (a−s)t — linearly, not exponentially — and waiting time increases. A sustainable average throughput is necessary but not sufficient: feedback operations can also impose tail-latency deadlines. CPU, GPU, FPGA, and ASIC approaches make different power, calibration, and integration trade-offs.',
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
    aliases: ['spacetime diagram', 'space-time diagrams', 'spacetime diagrams'],
    short:
      'A picture that stacks repeated check rounds along time so detection events and fault hypotheses can be represented jointly.',
    long:
      'In a simple phenomenological model, data faults often connect events across space and measurement faults across time. Circuit-level faults can create diagonal, boundary, or correlated patterns, so “horizontal equals data and vertical equals measurement” is only a first model. Matching decoders use a pair graph derived from this record; other decoders may use hypergraphs, tensors, neural representations, or the raw measurement history.',
    related_terms: ['syndrome', 'detection-event', 'mwpm-decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'stabilizer',
    slug: 'stabilizer',
    category: 'code theory',
    aliases: ['stabilizers', 'stabilizer generator', 'stabilizer generators'],
    short:
      'A Pauli product that returns +1 on every valid code state and flips to −1 when an error anticommutes with it.',
    long:
      'A stabilizer code is the simultaneous +1 eigenspace of an abelian Pauli subgroup that excludes −I. Measuring chosen generators yields a syndrome for that round. In repeated noisy extraction, decoders commonly derive detection events from relations among outcomes rather than treat every −1 as an event. Logical operators normalize the stabilizer group while acting non-trivially on the codespace.',
    related_terms: ['syndrome', 'plaquette', 'css-code'],
    related_topics: ['stabilizer-formalism'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'surface code',
    slug: 'surface-code',
    category: 'topology & anyons',
    aliases: ['surface codes', 'planar code', 'planar codes'],
    short:
      'Kitaev\'s toric code flattened onto a planar patch with boundaries — the leading architecture for fault-tolerant quantum computing.',
    long:
      'Surface-code checks can be implemented with local interactions on suitable 2D layouts. Thresholds are not one universal percent: code-capacity, phenomenological, and circuit-level models produce different values, and leakage or correlations can change them further. Several major hardware and architecture programs study surface-code variants, while others pursue different quantum LDPC, subsystem, bosonic, or concatenated codes.',
    related_terms: ['toric-code', 'plaquette', 'rotated-surface-code'],
    related_topics: ['surface-code'],
    related_papers: ['quant-ph/9811052', '1208.0928'],
  },
  {
    term: 'syndrome',
    slug: 'syndrome',
    category: 'code theory',
    aliases: ['syndromes', 'syndrome result', 'syndrome results'],
    short:
      'The collection of check eigenvalues or parity outcomes associated with an error sector; it constrains errors without identifying one.',
    long:
      'In an ideal stabilizer code, the syndrome records ±1 eigenvalues for selected generators. Many physical errors share it, including errors that differ by stabilizers. A properly designed ideal stabilizer measurement commutes with encoded logical observables, but a real extraction circuit can introduce faults. Repeated noisy measurements are compared through detector relations to produce detection events; one raw syndrome result is not itself a detection event.',
    related_terms: ['stabilizer', 'detection-event', 'error-chain', 'decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1110.5133'],
  },
  {
    term: 'threshold theorem',
    slug: 'threshold-theorem',
    category: 'code theory',
    aliases: ['accuracy threshold theorem', 'fault-tolerance threshold', 'fault-tolerance thresholds'],
    short:
      'Under stated locality, noise, gate-set, and architecture assumptions, sufficiently low physical fault rates permit arbitrarily accurate computation with controlled overhead.',
    long:
      'A threshold belongs to a complete protocol and noise model, not to “the surface code” alone. Code-capacity models assume perfect checks, phenomenological models add noisy syndrome bits, and circuit-level models include faulty gates, preparation, idle steps, and measurement. Numerical circuit-level studies often report surface-code thresholds on the order of 10⁻² for particular stochastic Pauli models, but that number is not a hardware certification or a theorem for arbitrary correlated noise.',
    notation: 'p < p_th',
    related_terms: ['fault-tolerance', 'code-distance'],
    related_topics: ['fault-tolerance-thresholds'],
    related_papers: ['1206.0800', '2408.13687'],
  },
  {
    term: 'topological order',
    slug: 'topological-order',
    category: 'topology & anyons',
    aliases: ['topologically ordered', 'topological phases'],
    short:
      'A phase of matter characterized not by symmetry but by topology-dependent ground-state degeneracy and anyonic excitations.',
    long:
      'In an ideal gapped topological phase, locally indistinguishable ground states and anyonic excitations give robustness to sufficiently weak local perturbations, often with finite-size corrections. This is not absolute immunity: extended error strings, thermal anyon motion, closing the gap, boundaries, or sustained noise can corrupt the encoded sector. Active surface-code error correction borrows this algebraic structure but still requires repeated measurement and decoding.',
    related_terms: ['anyon', 'toric-code', 'surface-code'],
    related_topics: ['topological-order-anyons'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'toric code',
    slug: 'toric-code',
    category: 'topology & anyons',
    aliases: ['toric codes'],
    short:
      'Kitaev\'s original topological code: qubits on the edges of a lattice wrapped around a torus, encoding two logical qubits in its topology.',
    long:
      'A torus has two independent homology-cycle directions. Each supports dual logical string types, producing two encoded qubits and four ground states for the usual toric code. Because it has no boundaries, its logical representatives are closed non-contractible cycles. Planar surface-code patches instead use boundaries and relative cycles; some experiments implement those patches, while hardware choices remain broader than one code family.',
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
      'ZX-diagrams represent linear maps as networks of Z- and X-phase spiders connected by wires. Sound rewrite rules preserve the represented map, and compilers can then translate a simplified diagram into patches, merges, and measurements. A particular rewrite may lower a declared cost for a specified input, optimizer, layout, and hardware model; diagram equality alone does not guarantee lower T-count or physical spacetime volume.',
    related_terms: ['lattice-surgery', 'stabilizer'],
    related_topics: ['zx-calculus-basics', 'tqec-compilers-automation'],
    related_papers: ['1905.08916'],
  },
];

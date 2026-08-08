/**
 * Cognitive Lens data providing dual-perspective narratives and insights:
 * 1. "Intuition & Analogy Mode" (real-world metaphors like smoke detectors, donut holes, balance scales)
 * 2. "Physics Rigor Mode" (formal bra-kets, Pauli algebra, stabilizer tableaus, MWPM graph weights)
 */

export interface ActNarrative {
  tier: number;
  actTitle: string;
  actSubtitle: string;
  keyFocus: string;
  metaphor: string;
  intuitionText: string;
  rigorText: string;
}

export interface TopicCognitiveLens {
  intuition: {
    analogyTitle: string;
    description: string;
    takeaway: string;
  };
  rigor: {
    formalismTitle: string;
    mathExpression: string;
    description: string;
  };
}

export const ACT_NARRATIVES: Record<number, ActNarrative> = {
  1: {
    tier: 1,
    actTitle: 'ACT I — The Vector Canvas & Hilbert Frontier',
    actSubtitle: 'Before you protect quantum information, you must lay down the geometric space where state vectors live.',
    keyFocus: 'Vector Spaces, Inner Products & State Kinematics',
    metaphor: 'A Phasor Mixing Board & Interference',
    intuitionText:
      'Picture a mixing board whose channels are basis states. Each channel carries an arrow: its length and angle map to an amplitude magnitude and phase, and arrows for indistinguishable alternatives can reinforce or cancel. The map is useful for addition and interference; it breaks if you imagine literal sound or a room in ordinary space. For n qubits the pure-state vector has 2^n complex coordinates, and closed-system gates preserve its norm.',
    rigorText:
      'A pure n-qubit state is a normalized ray represented in H = C^(2^n), with closed-system gates U satisfying U†U = I. For normalized |φ⟩ and |ψ⟩, a rank-one projection onto |φ⟩ has Born probability |⟨φ|ψ⟩|². A pure bipartite state is entangled when its vector does not factor across H_A ⊗ H_B.',
  },
  2: {
    tier: 2,
    actTitle: 'ACT II — The Fragile Superposition & The Measurement Paradox',
    actSubtitle: 'Relative phase changes interference; measurement and environmental decoherence are related but distinct processes.',
    keyFocus: 'Bloch Kinematics, Pauli Algebra & Gate Universality',
    metaphor: 'Two Ripple Paths & An Interference Screen',
    intuitionText:
      'Send two synchronized ripples around an obstacle and let them meet: aligned peaks reinforce while opposite peaks cancel. Path amplitude and timing map to quantum amplitude and relative phase; bright and dark regions map to outcome probabilities accumulated over repeated trials. The analogy stops at the water: amplitudes are not material waves, and one measurement gives one sample rather than displaying the whole pattern. Uncontrolled coupling can wash out phase coherence without being a deliberate readout.',
    rigorText:
      'A pure qubit may be written |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ on the Bloch sphere. Projective measurement samples Born probabilities and updates the state; decoherence is open-system loss of phase information. Pauli operators {I, X, Y, Z} span single-qubit errors, Clifford gates conjugate Paulis to Paulis, and a non-Clifford resource such as T enables universality.',
  },
  3: {
    tier: 3,
    actTitle: 'ACT III — The Stabilizer Shield & Parity Interrogations',
    actSubtitle: 'How do you detect error parities without directly revealing the secret quantum message?',
    keyFocus: 'Stabilizer Subgroups, Parity Check Matrices & Syndrome Algebra',
    metaphor: 'Smoke Detectors & Silent Room Sensors',
    intuitionText:
      'Treat each parity check as an alarm that compares a group of rooms without reading the artwork stored across them. An alarm maps to a changed stabilizer outcome, and the hidden artwork maps to logical information. The boundary matters: an alarm constrains possible faults but does not uniquely locate one, some logical faults trigger no alarm, and a faulty extraction circuit can create an alarm itself.',
    rigorText:
      'For an Abelian stabilizer subgroup S ⊂ P_n excluding -I, the code space is the joint +1 eigenspace of its generators. A Pauli error E flips check i when {E,S_i}=0. The syndrome identifies a coset, not a unique physical history: errors differing by a stabilizer share a syndrome, while a nontrivial logical in N(S) \\ S can have trivial syndrome.',
  },
  4: {
    tier: 4,
    actTitle: 'ACT IV — The Topological Realm of Anyons & Toric Geometry',
    actSubtitle: 'Storing quantum information non-locally so sufficiently short local fault chains remain correctable.',
    keyFocus: 'Toric/Surface Code Hamiltonians, Anyon Braiding & Topological Invariants',
    metaphor: 'Donut Holes, Fabric Loops & Topological Invariants',
    intuitionText:
      'A short scratch on a stitched fabric patch maps to a low-weight error chain; a seam crossing the whole patch maps to a logical operator. Small scratches usually create detectable endpoints and can be repaired. The metaphor breaks at “immune”: a long or correlated chain can span the code and change the logical state, so protection grows with distance rather than becoming absolute.',
    rigorText:
      'For the toric convention A_s = ∏_{i∈s} X_i and B_p = ∏_{j∈p} Z_j. A Z-string anticommutes with X-type stars at its endpoints, creating e excitations; an X-string anticommutes with Z-type plaquettes at its endpoints, creating m excitations. Their mutual winding phase is π. Noncontractible strings act logically, and finite-distance protection is not immunity to arbitrary local-noise histories.',
  },
  5: {
    tier: 5,
    actTitle: 'ACT V — The Quantum Engine & Algorithmic Decoder',
    actSubtitle: 'Processing real-time syndrome signals while computing across topologically stitched boundaries.',
    keyFocus: 'MWPM Graph Decoding, Spacetime Syndromes & Lattice Surgery',
    metaphor: 'Emergency Flare Trackers & Quantum Fabric Velcro',
    intuitionText:
      'Imagine a control center pairing distress flares using a map of likely routes. Flares map to detection events, route weights map to a noise model, and a chosen route maps to a correction class. The map cannot reveal the actual trail: many fault histories share the same endpoints. Lattice-surgery seams separately map to joint logical-parity measurements between patches.',
    rigorText:
      'Syndrome decoding can use MWPM on a spacetime detector graph G=(V,E), with weights derived from a noise model, often as negative log-likelihoods. Lattice-surgery merges and splits measure logical ZZ or XX parities. A 15-to-1 Reed-Muller distillation gadget can produce a higher-fidelity T-type state |A⟩ = T|+⟩; some sources instead call this state |T⟩.',
  },
  6: {
    tier: 6,
    actTitle: 'ACT VI — The Fault-Tolerant Horizon & Hardware Realizations',
    actSubtitle: 'Separating two milestones: distance scaling below a scheme threshold and break-even against a chosen physical reference.',
    keyFocus: 'Threshold Scaling, qLDPC Architectures & Experimental Milestones',
    metaphor: 'The Sub-Threshold Shield & Exponential Suppression',
    intuitionText:
      'Think of increasing code distance as adding depth to a filter: in a specified below-threshold noise regime, each larger layer can reduce logical failure. Filter depth maps to distance and leakage through it maps to logical error. The boundary is essential: the crossover and suppression factor depend on the code, circuit, decoder, correlations, and task; distance alone promises no universal runtime or machine size.',
    rigorText:
      'Under a specified sufficiently local or weak noise model and fault-tolerant construction, operation below a scheme-specific p_th permits arbitrarily low logical error with increasing overhead. Surface-code families often exhibit P_L ≈ A(p/p_th)^((d+1)/2) in fitted regimes, but p_th and A are not universal constants.',
  },
};

export const TOPIC_COGNITIVE_LENS: Record<string, TopicCognitiveLens> = {
  'linear-algebra': {
    intuition: {
      analogyTitle: 'Coordinate Room & Rigid Arrow Motions',
      description:
        'An arrow’s coordinates map to amplitudes in a chosen basis, and changing axes maps to a basis change. Tensor products combine subsystem coordinate spaces. The picture is not ordinary 3D space, and quantum gates on a closed system are rigid unitary motions—they do not stretch norms or inner products.',
      takeaway: 'Coordinates represent pure states; unitary gates preserve their norm and inner products.',
    },
    rigor: {
      formalismTitle: 'Complex Hilbert Space H & Unitary Maps',
      mathExpression: 'H = C^(2^n),  U^† U = I,  |ψ_AB⟩ ∈ H_A ⊗ H_B',
      description:
        'n qubits span a 2^n-dimensional complex Hilbert space. Closed-system evolution is represented by a norm-preserving unitary U; general open-system evolution is a quantum channel. Composite systems use tensor-product spaces.',
    },
  },
  'complex-numbers-dirac-notation': {
    intuition: {
      analogyTitle: 'Wave Phases & Bra-Ket Bracket Shorthand',
      description:
        'A rotating phasor’s length and angle map to amplitude magnitude and phase; only relative angles affect interference. A ket |ψ⟩ maps to a column vector and a bra ⟨φ| to its dual probe. The boundary: these arrows are abstract complex coordinates, not little waves inside a qubit.',
      takeaway: 'Interference comes from phase angles; inner product ⟨φ|ψ⟩ measures overlap.',
    },
    rigor: {
      formalismTitle: 'Dual Space Vectors & Projection Operators',
      mathExpression: '|ψ⟩ ∈ H,  ⟨φ| ∈ H^*,  P_k = |k⟩⟨k|,  e^(iθ)',
      description:
        'Kets are column vectors, bras are conjugate transpose row vectors. Outer product |ψ⟩⟨φ| forms linear operators, and Euler phase e^(iθ) accounts for interference phenomena.',
    },
  },
  'quantum-mechanics-basics': {
    intuition: {
      analogyTitle: 'Two Paths & An Interference Screen',
      description:
        'Two indistinguishable paths contribute amplitude arrows to the same detector. Aligned arrows raise the detection probability; opposed arrows cancel. Paths map to basis alternatives and arrow angle maps to relative phase. The analogy stops before material waves: each measurement gives one outcome, while the pattern appears only across repeated preparations.',
      takeaway: 'Relative phase controls interference; measurement samples an outcome and updates the state.',
    },
    rigor: {
      formalismTitle: 'Born Rule & Projective Measurement Postulates',
      mathExpression: 'p_i = ⟨ψ|P_i|ψ⟩,  |ψ′⟩ = P_i|ψ⟩ / √p_i  (p_i > 0)',
      description:
        'A projective measurement A = ∑_i λ_i P_i returns λ_i with probability ⟨ψ|P_i|ψ⟩ and updates the state to its normalized projection. Environmental decoherence is an open-system process and should not be equated with a deliberate projective readout.',
    },
  },
  'qubits-pauli-operators': {
    intuition: {
      analogyTitle: 'Bloch Sphere Globe & The Error Trio (X, Y, Z)',
      description:
        'A point on the Bloch-sphere surface maps to one pure, isolated qubit. X, Y, and Z are half-turns about its coordinate axes up to global phase. The globe cannot represent multi-qubit entanglement, and noisy mixed states sit inside rather than on its surface.',
      takeaway: 'Bit flips (X) and phase flips (Z) are the two fundamental quantum errors.',
    },
    rigor: {
      formalismTitle: 'Pauli Group Algebra & Binary Anticommutation',
      mathExpression: 'XZ = -ZX,  X^2 = Y^2 = Z^2 = I,  P_n = {±1, ±i} × {I,X,Y,Z}^⊗n',
      description:
        'Pauli operators form an orthogonal operator basis for M_2(C). Binary anticommutation between a Pauli error component E and check S_i determines whether that component flips the check. A physical channel need not be a stochastic Pauli mixture.',
    },
  },
  'quantum-gates-circuits': {
    intuition: {
      analogyTitle: 'Assembly Line & Gate Permutations',
      description:
        'A quantum circuit is a multi-lane highway of wires where gates act like traffic turns. Clifford gates act like clean 90-degree turns, while non-Clifford T gates add fine diagonal turns.',
      takeaway: 'Cliffords conjugate Paulis predictably; Clifford+T is a universal gate set.',
    },
    rigor: {
      formalismTitle: 'Clifford Group Conjugation & Gottesman-Knill Theorem',
      mathExpression: 'C(P_n) = { U ∈ U(2^n) : U P U^† ∈ P_n },  H X H^† = Z',
      description:
        'Clifford gates (H, S, CNOT) map Pauli operators to Pauli operators under conjugation. Stabilizer-state preparations, Clifford evolution, and Pauli measurements admit efficient tableau simulation; arbitrary non-stabilizer inputs fall outside that Gottesman-Knill guarantee.',
    },
  },
  'classical-error-correction': {
    intuition: {
      analogyTitle: 'Voting Trios & Majority Rule',
      description:
        'In classical systems, to send a 0 reliably, you transmit 000. If one bit flips to 010, a simple 2-out-of-3 majority vote corrects the error.',
      takeaway: 'Redundancy enables error detection through majority voting.',
    },
    rigor: {
      formalismTitle: 'Linear Codes, Generator Matrix G & Parity Check Matrix H',
      mathExpression: 'C = { x ∈ F_2^n : H x^T = 0 },  d = min wt(x ∈ C \\ {0})',
      description:
        'A binary linear code [n, k, d] embeds k bits into n bits. Parity check matrix H computes syndrome vector s = H y^T for received word y = x + e.',
    },
  },
  'stabilizer-formalism': {
    intuition: {
      analogyTitle: 'Silent Room Alarms & Parity Check Balance Scales',
      description:
        'A balance alarm maps to a parity-check eigenvalue, while the unopened contents map to logical information. A changed alarm constrains which faults are possible without identifying a unique fault; the picture also assumes an ideal alarm, whereas a real ancilla circuit can fail.',
      takeaway: 'Stabilizer outcomes constrain error classes without directly measuring logical observables.',
    },
    rigor: {
      formalismTitle: 'Abelian Group Generators & Projection to Code Space',
      mathExpression: 'S = ⟨S_1, ..., S_{n-k}⟩,  P_{code} = (1/|S|) ∑_{g ∈ S} g',
      description:
        'Code space V_S is the joint +1 eigenspace of commuting Pauli generators S_i. An error E that anticommutes with S_i flips its eigenvalue. Errors differing by a stabilizer share a syndrome, so decoding also needs a noise model.',
    },
  },
  'quantum-codes-basics': {
    intuition: {
      analogyTitle: 'Distributing Secrets Across Trios (Shor 9-Qubit)',
      description:
        'To protect a secret recipe from both water stains (phase flips) and torn pages (bit flips), you place copies inside nested envelopes.',
      takeaway: 'Concatenating bit-flip and phase-flip codes protects against arbitrary quantum noise.',
    },
    rigor: {
      formalismTitle: 'Shor 9-Qubit & Steane 7-Qubit CSS Code Structures',
      mathExpression: 'C_{CSS}(C_1, C_2) = span{|x + C_2⟩ : x ∈ C_1}',
      description:
        'CSS codes construct quantum codes from two classical codes C_1, C_2 using independent X-type and Z-type parity checks with H_X H_Z^T = 0.',
    },
  },
  'fault-tolerance-thresholds': {
    intuition: {
      analogyTitle: 'Vaccine Immunity & The Contagion Tipping Point',
      description:
        'Within one specified code, circuit, decoder, and noise model, distance acts like added filter depth: below the model’s crossover, larger filters can pass fewer logical faults. The boundary is that there is no universal threshold percentage, and correlations or leakage can change the scaling.',
      takeaway: 'Below a scheme-specific threshold, a suitable code family can suppress logical failure as distance grows.',
    },
    rigor: {
      formalismTitle: 'Threshold Scaling & Sub-Threshold Power Law',
      mathExpression: 'P_L(p) ≈ A (p / p_{th})^((d+1)/2),  p < p_{th}',
      description:
        'For suitable local stochastic noise and a specified fault-tolerant surface-code construction, P_L is often fit by an exponential-in-distance form below p_th. The threshold and fit parameters depend on the circuit, decoder, metric, and noise model.',
    },
  },
  'topological-order-anyons': {
    intuition: {
      analogyTitle: 'Knots in a Rope & Non-Local Memory',
      description:
        'A local wiggle maps to a short error operator, while a noncontractible loop maps to a logical action. Short faults cannot act logically by themselves, but the rope analogy breaks for long or correlated chains that span the code.',
      takeaway: 'Increasing distance raises the minimum weight of a logical fault; it does not create absolute immunity.',
    },
    rigor: {
      formalismTitle: 'Degenerate Ground Space & Anyonic Exchange Phases',
      mathExpression: 'ψ_1 ψ_2 = e^(iθ) ψ_2 ψ_1,  θ_{e,m} = π',
      description:
        'In ideal topological models, ground-space structure can depend on manifold topology and ground states are locally indistinguishable. Anyonic excitations carry Abelian or non-Abelian braid representations. Finite distance and an energy gap do not imply immunity or passive finite-temperature self-correction.',
    },
  },
  'toric-code': {
    intuition: {
      analogyTitle: '2D Grid Fabric & Plaquette Smoke Detectors',
      description:
        'On a woven torus, an X-type star check sits at each vertex and a Z-type plaquette check surrounds each face. A Z string ends on violated X stars; an X string ends on violated Z plaquettes. The fabric is a connectivity map, not literal material protection.',
      takeaway: 'X stars detect Z components; Z plaquettes detect X components.',
    },
    rigor: {
      formalismTitle: 'Toric Code Hamiltonian & Star/Plaquette Generators',
      mathExpression: 'H = -J_e ∑_v A_v - J_m ∑_p B_p,  A_v = ∏_{i ∈ v} X_i,  B_p = ∏_{j ∈ p} Z_j',
      description:
        'The ideal toric code places qubits on edges. Z-string endpoints violate X-star generators and create e excitations; X-string endpoints violate Z-plaquette generators and create m excitations. On a torus the ground space encodes two logical qubits.',
    },
  },
  'surface-code': {
    intuition: {
      analogyTitle: 'Planar Patch Cloth & Boundary Trim',
      description:
        'Flattening maps noncontractible toric loops to strings that join compatible patch boundaries. The cloth edge maps to a boundary where one excitation type can condense; it is not a physical tear, and rough/smooth naming conventions vary between sources.',
      takeaway: 'Planar boundaries allow logical qubits to fit on flat 2D physical hardware grids.',
    },
    rigor: {
      formalismTitle: 'Planar Surface Code Boundaries & Logical Operators L_X, L_Z',
      mathExpression: 'L_X = ∏_{i ∈ C_X} X_i,  L_Z = ∏_{j ∈ C_Z} Z_j,  d = min(|C_X|, |C_Z|)',
      description:
        'A planar surface-code patch uses lower-weight boundary checks and weight-4 bulk checks, with exact weights depending on layout. Logical strings join or connect the appropriate boundary types. Rough/smooth labels and which axis is drawn horizontal are convention-dependent, so operator supports should be stated explicitly.',
    },
  },
  'syndrome-extraction-circuits': {
    intuition: {
      analogyTitle: 'Ancilla Helper Messenger Qubits',
      description:
        'An ancilla is a parity meter: its final measurement maps to one multi-data-qubit check, not to any individual data value. This ideal meter picture breaks when ancilla faults propagate through later gates, which is why CNOT direction and ordering matter.',
      takeaway: 'X- and Z-check meters use different preparations, CNOT directions, and measurement bases.',
    },
    rigor: {
      formalismTitle: 'Ancilla-Assisted Parity Check Circuits & Hook Errors',
      mathExpression: 'Z check: |0⟩_a, CNOT_{data→a}, M_Z;  X check: |+⟩_a, CNOT_{a→data}, M_X',
      description:
        'In the standard CNOT construction, a Z-product check prepares |0⟩ on the ancilla, applies data-controlled CNOTs, then measures Z. An X-product check prepares |+⟩, applies ancilla-controlled CNOTs, then measures X. Equivalent CZ-based circuits exist. Gate order is chosen to orient hook errors so one fault does not reduce the intended effective distance.',
    },
  },
  'decoding-mwpm': {
    intuition: {
      analogyTitle: 'Connecting Distress Flares with Shortest Strings',
      description:
        'Detection events are flares; graph-edge weights are the map’s model of plausible fault mechanisms; a matching chooses a low-cost pairing or boundary connection. The selected paths are a correction hypothesis, not a reconstruction of the unique faults that occurred.',
      takeaway: 'MWPM chooses a likely correction class consistent with the detector data and noise model.',
    },
    rigor: {
      formalismTitle: 'Blossom V Algorithm on Spacetime Syndrome Graph G(V,E)',
      mathExpression: 'M* = argmin_M ∑_{e∈M} w_e,  w_e often ≈ -log P(e)',
      description:
        'A detector error model supplies weighted edges linking detection events and permitted boundaries in spacetime. MWPM minimizes total weight over compatible pairings. Implementations and graph constructions vary, and matching does not distinguish error histories in the same logical equivalence class.',
    },
  },
  'defects-braiding': {
    intuition: {
      analogyTitle: 'Cutting Holes & Dancing Defect Loops',
      description:
        'Turning off or changing specific checks creates boundaries that act like holes in the code. A verified sequence can move one defect around another; the ideal braid class maps to a logical operation, while schedule geometry and timing still control faults and overhead.',
      takeaway: 'Distance-preserving defect deformation can realize logical operations geometrically.',
    },
    rigor: {
      formalismTitle: 'Punctured Surface Code & Topological Braiding Permutations',
      mathExpression: 'L_{X,i} ↔ L_{Z,j},  Braid(d_1, d_2) ⇒ CNOT_{logical}',
      description:
        'Defect pairs can encode logical degrees of freedom. In a specified primal/dual construction, a verified distance-preserving winding realizes a logical CNOT; the physical path, round count, separation, and decoder boundaries determine circuit distance and cost.',
    },
  },
  'lattice-surgery': {
    intuition: {
      analogyTitle: 'Velcro Stitching & Unzipping Quantum Patches',
      description:
        'Instead of moving defects, lattice surgery temporarily sews two separate planar code patches together along their edges to perform parity checks.',
      takeaway: 'Lattice surgery measures joint logical Paulis by changing boundary checks.',
    },
    rigor: {
      formalismTitle: 'Boundary Patch Merging, Splitting & Parity Measurements M_XX, M_ZZ',
      mathExpression: 'Measure L_{Z,1}L_{Z,2} or L_{X,1}L_{X,2}; repeat checks for O(d) rounds',
      description:
        'A merge introduces boundary-spanning checks whose repeated outcomes determine a joint logical parity; a split restores separate patches but does not undo the measurement or its correlations. A standard CNOT uses an ancilla patch, two joint parities, final ancilla readout, and Pauli-frame updates. A distance-d implementation typically repeats new checks for order-d rounds.',
    },
  },
  'cluster-states-mbqc': {
    intuition: {
      analogyTitle: '3D Entangled Crystal & Sculpting by Measurement',
      description:
        'Start with a massive 3D grid of pre-entangled qubits, then measure individual qubits one by one to carve out computation paths like sculpting marble.',
      takeaway: 'Specific cluster-state constructions consume entanglement through measurements to realize a fault-tolerant logical process.',
    },
    rigor: {
      formalismTitle: '3D Raussendorf-Harrington-Goyal (RHG) Cluster State',
      mathExpression: '|C⟩ = ∏_{(u,v) ∈ E} CZ_{uv} |+⟩^⊗V;  Pauli layer + adaptive non-Pauli or magic resources',
      description:
        'Specific 3D RHG cluster constructions implement a topological Clifford and error-correction layer with prescribed single-qubit Pauli measurements. Universal MBQC adds adaptive non-Pauli measurements or injected/distilled magic resources and feed-forward; not every cluster state is exactly a surface-code history.',
    },
  },
  'magic-states-distillation': {
    intuition: {
      analogyTitle: 'Purifying Rough Ore into Pure Gold (15-to-1 Distillation)',
      description:
        'Treat distillation as a quality-control batch: fifteen noisy T-type resources map to inputs, stabilizer checks map to rejection tests, and one accepted output can have lower error. The boundary is that acceptance is probabilistic and the advertised suppression assumes a particular input-error model.',
      takeaway: 'Accepted |A⟩ resources let Clifford-and-measurement gadgets enact logical T gates.',
    },
    rigor: {
      formalismTitle: 'Bravyi-Kitaev 15-to-1 Reed-Muller Distillation Routine',
      mathExpression: '|A⟩ ≡ T|+⟩ = (|0⟩ + e^(iπ/4)|1⟩)/√2,  p_out = 35p_in^3 + O(p_in^4)',
      description:
        'Under the standard independent input-error model, the [[15, 1, 3]] punctured Reed-Muller protocol detects lower-weight faults and gives cubic leading-order suppression on acceptance. This atlas calls T|+⟩ the |A⟩ state; literature that calls it |T⟩ is using a different naming convention.',
    },
  },
  'flag-fault-tolerance': {
    intuition: {
      analogyTitle: 'Tripwire Security Sensors',
      description:
        'A flag is a tripwire wired for a specified circuit and fault set. Dangerous propagated errors must cause a flag or a distinguishing syndrome under the proof assumptions; the outcome does not identify every microscopic fault.',
      takeaway: 'Validated flag circuits expose dangerous propagation with code- and circuit-specific guarantees.',
    },
    rigor: {
      formalismTitle: 'Flag Qubit Circuits & Mid-Circuit Fault Detection',
      mathExpression: 'dangerous fault ⇒ flag outcome OR distinguishing syndrome  (under stated model)',
      description:
        'Flag fault tolerance uses extra ancillas and ordered gates so the allowed dangerous error set can be distinguished and recovered under a stated fault model. Ancilla savings and guarantees depend on the code, check, distance, and recovery procedure.',
    },
  },
  'zx-calculus-basics': {
    intuition: {
      analogyTitle: 'Spider Diagrams & Graphical Circuit Rewriting',
      description:
        'ZX-calculus represents qubit linear maps with colored spiders and phases. Sound rewrites preserve the represented map; whether a rewrite lowers a hardware cost is a separate optimizer question.',
      takeaway: 'ZX gives rigorous semantics-preserving diagram rewrites with fragment-specific completeness results.',
    },
    rigor: {
      formalismTitle: 'Dagger-Compact Symmetric Monoidal Category & Spider Generators',
      mathExpression: 'Z_n^m(α) : |0⟩^⊗n ⟨0|^⊗m + e^(iα)|1⟩^⊗n ⟨1|^⊗m',
      description:
        'ZX-calculus is a rigorous graphical language based on Z- and X-spiders. Completeness requires an appropriate axiom set for the chosen fragment: the small introductory rules alone are not complete for every arbitrary qubit linear-map equality.',
    },
  },
  'advanced-decoding': {
    intuition: {
      analogyTitle: 'Several Forecast Models for One Detector Stream',
      description:
        'Matching, union-find, belief propagation, tensor networks, and learned decoders use different approximations and data structures. None is universally fastest or most accurate; the winning tradeoff depends on the noise, code, latency target, and implementation.',
      takeaway: 'Decoder comparisons must report accuracy, throughput, latency, memory, and the tested noise model separately.',
    },
    rigor: {
      formalismTitle: 'Belief Propagation + Ordered Statistics Decoding (BP-OSD)',
      mathExpression: 'e* = argmax_{e : H e = s} P(e | s);  BP-OSD, union-find, tensor networks',
      description:
        'Advanced decoders use different structures: BP-OSD targets sparse parity constraints, union-find has almost-linear complexity in its analyzed topological setting, and tensor networks approximate likelihood sums. Willow used a matching-based decoder ensemble/synthesis, not belief propagation; reported Λ is scoped to that pipeline.',
    },
  },
  'real-time-decoding-control': {
    intuition: {
      analogyTitle: 'Streaming Dispatch Queue & Urgent Feed-Forward',
      description:
        'A dispatch center must process reports at least as fast as they arrive so backlog does not grow; that maps to decoder throughput. A particular ambulance may also need an answer before a deadline; that maps to latency. The analogy breaks if every correction is assumed urgent—Pauli-frame updates can often wait, while some feed-forward operations cannot.',
      takeaway: 'Sustained throughput and decision latency are separate decoder requirements.',
    },
    rigor: {
      formalismTitle: 'FPGA Stream Processing & Low-Latency Pipeline Architectures',
      mathExpression: 'R_decode ≥ R_syndrome;  L_decode + L_control ≤ L_feed-forward when feedback is required',
      description:
        'A streaming decoder needs aggregate throughput at least equal to detector-data production across the code. Separately, end-to-end latency must meet the relevant logical feed-forward deadline, which need not equal one QEC cycle or a qubit coherence time. CPUs, GPUs, FPGAs, or ASICs may implement different points in this trade space.',
    },
  },
  'magic-state-cultivation': {
    intuition: {
      analogyTitle: 'Grow, Inspect, Reject, Then Transplant',
      description:
        'A seed maps to a rough low-distance encoded |A⟩ state; repeated inspections and growth map to cross-checks plus postselection; transplanting maps to the escape stage into a larger code. The boundary is that failed inspections are discarded, so yield is below one and the cost advantage depends strongly on physical noise and target fidelity.',
      takeaway: 'Cultivation trades retries and postselection for low estimated |A⟩-state cost in studied regimes.',
    },
    rigor: {
      formalismTitle: 'Injection, Cultivation & Escape',
      mathExpression: '|A⟩ injection → check/grow/postselect → escape to a larger code,  P_accept < 1',
      description:
        'The original construction injects a rough T-type state into a distance-3 triangular color code at initial fault distance 1, raises accepted fault distance through cross-checks and growth with postselection, then escapes into a larger matchable surface-code-style encoding. Escape adds faults and can dominate rejection or cost. Reported savings are scoped to specified simulations, not a guaranteed yield or asymptotic advantage.',
    },
  },
  'tqec-compilers-automation': {
    intuition: {
      analogyTitle: '3D Spacetime Architect & Blueprint Compiler',
      description:
        'Compilers can turn high-level logical work into space-time candidates containing patches, parity measurements, routes, and resource factories. A blueprint still needs hardware mapping, timing, decoder integration, distance validation, and pulse generation before chip execution.',
      takeaway: 'TQEC compilation produces logical layout and schedule candidates, not automatically chip-ready controls.',
    },
    rigor: {
      formalismTitle: 'Logical Space-Time Layout & Multi-Objective Resource Estimation',
      mathExpression: 'candidate cost = f(area, cycles, routing, factories, distances, control constraints)',
      description:
        'One Litinski-style representation propagates many Cliffords into a tracked frame and expresses remaining work as Pauli-product measurements. ZX rewrites or routing heuristics may lower a declared cost but offer no universal optimum guarantee. A physical backend must add architecture-specific controls and an error budget.',
    },
  },
  'clifford-simulation-hybrid': {
    intuition: {
      analogyTitle: 'Hybrid Supercomputer Simulator',
      description:
        'Stabilizer circuits admit efficient bookkeeping, while hybrid methods isolate costly non-Clifford structure using decompositions, quasiprobabilities, tensors, or factorization. Runtime still depends on circuit structure, task, and target accuracy.',
      takeaway: 'Hybrid simulation extends tractable modeled regimes; it does not certify omitted hardware physics.',
    },
    rigor: {
      formalismTitle: 'Stabilizer Frame Tracking & Magic State Decomposition',
      mathExpression: 'χ(|ψ⟩) = min { k : |ψ⟩ = ∑_{i=1}^k c_i |S_i⟩ }',
      description:
        'Gottesman-Knill covers stabilizer preparations, Clifford evolution, and Pauli measurements. Hybrid simulators combine stabilizer frames with decompositions of non-Clifford resources. Exact trajectories are exact only for the represented model, and finite sampling leaves statistical uncertainty.',
    },
  },
  'below-threshold-experiments': {
    intuition: {
      analogyTitle: 'A Larger Net Lets Fewer Faults Through',
      description:
        'For one Willow memory experiment, increasing distance by two reduced error per cycle by a factor above two. Net size maps to code distance and escaped faults map to logical errors. This is evidence for below-threshold memory scaling in that experiment—not proof that all gates, algorithms, or hardware platforms are fault tolerant.',
      takeaway: 'Willow reported Λ = 2.14 ± 0.02 for its tested surface-code memories, with Λ > 1 meaning suppression.',
    },
    rigor: {
      formalismTitle: 'Willow Surface-Code Memory Scaling',
      mathExpression: 'Λ = ε_d / ε_(d+2) = 2.14 ± 0.02 > 1;  ε_7 = 0.143% ± 0.003% per cycle',
      description:
        'Google Quantum AI defined Λ = ε_d/ε_(d+2), so values above one mean lower logical error at the larger distance. The separate 2.4 ± 0.3 figure compared encoded lifetime with the best constituent physical qubit and was not Λ. The reported result is for an error-corrected memory, not a universal gate set or end-to-end algorithm.',
    },
  },
};

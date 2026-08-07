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
    metaphor: 'The Multidimensional Compass & Wave Interference',
    intuitionText:
      'Imagine an infinite multidimensional room where every quantum state is an arrow pointing from the origin. Linear operators are smooth rotations of these arrows, and complex amplitudes represent interfering waves. You cannot fix quantum errors until you understand how to navigate this geometric canvas.',
    rigorText:
      'State space H = C^(2^n) under unitary transformations U in U(2^n). Complex inner products ⟨φ|ψ⟩ determine projection probabilities via the Born rule. Entanglement corresponds to non-factorable tensor product states in H_A ⊗ H_B.',
  },
  2: {
    tier: 2,
    actTitle: 'ACT II — The Fragile Superposition & The Measurement Paradox',
    actSubtitle: 'Single qubits hold infinite possibilities—and collapse the instant a whisper of environment noise strikes.',
    keyFocus: 'Bloch Kinematics, Pauli Algebra & Gate Universality',
    metaphor: 'Spinning Coins & Indirect Whispers',
    intuitionText:
      'A spinning coin in mid-air holds heads and tails at once. Touch it with a finger and it collapses instantly to one flat outcome. To compute reliably, we must manipulate these spinning coins in unison without looking directly at their faces.',
    rigorText:
      'Qubit kinematics on the Bloch sphere S^2 with single-qubit states |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. Pauli algebra {I, X, Y, Z} generates single-qubit errors. Clifford operations conjugate Paulis into Paulis (HXH = Z, CNOT). Non-Clifford T gate breaks Gottesman-Knill classical simulation.',
  },
  3: {
    tier: 3,
    actTitle: 'ACT III — The Stabilizer Shield & Parity Interrogations',
    actSubtitle: 'How do you detect errors without reading—and destroying—the secret quantum message?',
    keyFocus: 'Stabilizer Subgroups, Parity Check Matrices & Syndrome Algebra',
    metaphor: 'Smoke Detectors & Silent Room Sensors',
    intuitionText:
      'Think of smoke detectors installed in ceiling tiles of adjacent rooms. When a fire breaks out, the smoke alarm sounds off without anyone having to open the door and expose the delicate artwork inside. Stabilizer checks act as silent room sensors that sound alarms only when an error occurs.',
    rigorText:
      'Abelian stabilizer subgroup S ⊂ P_n without -I. Code space V_S = {|ψ⟩ in H : S_i|ψ⟩ = |ψ⟩, ∀ S_i in S}. Error E in P_n produces syndrome vector s_i = 0 if [E, S_i]=0 and s_i = 1 if {E, S_i}=0. Code distance d = min wt(G in N(S) \\ S).',
  },
  4: {
    tier: 4,
    actTitle: 'ACT IV — The Topological Realm of Anyons & Toric Geometry',
    actSubtitle: 'Storing fragile quantum secrets inside global geometric shape, immune to local corruption.',
    keyFocus: 'Toric/Surface Code Hamiltonians, Anyon Braiding & Topological Invariants',
    metaphor: 'Donut Holes, Fabric Loops & Topological Invariants',
    intuitionText:
      'Cut a hole through a donut. A tiny scratch on the surface of the pastry cannot undo the presence of the hole in the middle. Information in topological codes is stored in non-local loops winding around the lattice—local noise scratches the surface, but cannot alter the global topology.',
    rigorText:
      '2D spin lattice on torus or planar surface. Star operators A_s = ∏_{i∈v} X_i and plaquette operators B_p = ∏_{j∈p} Z_j. Anyonic excitations: electric charges e (star violation) and magnetic fluxes m (plaquette violation). Non-trivial mutual statistics θ_{e,m} = π. Ground state degeneracy 2^(2g) topologically protected.',
  },
  5: {
    tier: 5,
    actTitle: 'ACT V — The Quantum Engine & Algorithmic Decoder',
    actSubtitle: 'Processing real-time syndrome signals while computing across topologically stitched boundaries.',
    keyFocus: 'MWPM Graph Decoding, Spacetime Syndromes & Lattice Surgery',
    metaphor: 'Emergency Flare Trackers & Quantum Fabric Velcro',
    intuitionText:
      'Imagine an emergency control center tracking glowing distress flares on a grid map. As errors pop up, an automated algorithm pairs neighboring flares to find the shortest path of faults. Simultaneously, quantum lattice surgery merges and snips patches of quantum fabric to perform logical logic gates.',
    rigorText:
      'Syndrome decoding via Minimum Weight Perfect Matching (MWPM) on 3D spacetime graph G=(V,E) with edge weights w_e = ln((1-p)/p). Fault-tolerant measurement of logical operators via lattice surgery patch merging/splitting (ZZ and XX parity measurements). Magic state distillation (15-to-1 Reed-Muller gadget) pumps high-fidelity |T⟩ states.',
  },
  6: {
    tier: 6,
    actTitle: 'ACT VI — The Fault-Tolerant Horizon & Hardware Realizations',
    actSubtitle: 'Crossing the threshold into logical error rates lower than any physical component.',
    keyFocus: 'Threshold Scaling, qLDPC Architectures & Experimental Milestones',
    metaphor: 'The Sub-Threshold Shield & Exponential Suppression',
    intuitionText:
      'When individual physical components fail 1 in 100 times, our collective lattice suppresses errors exponentially—allowing a 10,000-qubit computer to run for days without a single uncorrectable fault. This is the promised land of fault-tolerant quantum supremacy.',
    rigorText:
      'Fault-tolerant threshold theorem η < p_th ≈ 1%. Exponential sub-threshold logical error scaling P_L ~ A (p/p_th)^((d+1)/2). Frontier implementations spanning 2D/3D color codes, high-rate qLDPC codes (bipartite Tanner graphs), neutral-atom shuttling, and real-time FPGA decoding architectures.',
  },
};

export const TOPIC_COGNITIVE_LENS: Record<string, TopicCognitiveLens> = {
  'linear-algebra': {
    intuition: {
      analogyTitle: 'Multidimensional Room & Rotating Arrows',
      description:
        'Think of a state as an arrow pointing somewhere in a multi-dimensional room. Matrix multiplication smoothly turns and stretches this arrow, while tensor products combine two separate rooms into a single vast space.',
      takeaway: 'Vector directions store quantum state combinations; rotations represent reversible operations.',
    },
    rigor: {
      formalismTitle: 'Complex Hilbert Space H & Unitary Maps',
      mathExpression: 'H = C^(2^n),  U^† U = I,  |ψ_AB⟩ ∈ H_A ⊗ H_B',
      description:
        'n qubits span a 2^n dimensional complex Hilbert space. Physical evolutions are norm-preserving unitary operators U, and composite systems live in tensor product spaces.',
    },
  },
  'complex-numbers-dirac-notation': {
    intuition: {
      analogyTitle: 'Wave Phases & Bra-Ket Bracket Shorthand',
      description:
        'Complex numbers represent wave height and phase timing. Bra-ket notation |ψ⟩ is shorthand for an arrow vector, while ⟨φ| represents the receiver screen checking how much arrow |ψ⟩ matches screen ⟨φ|.',
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
      analogyTitle: 'Spinning Coins & The Unshakeable Glance',
      description:
        'A quantum state is like a spinning coin displaying a blur of heads and tails. Looking directly at it forces it to instantly drop into heads or tails, destroying the spinning blur forever.',
      takeaway: 'Measurement collapses superpositions; information must be measured indirectly.',
    },
    rigor: {
      formalismTitle: 'Born Rule & Projective Measurement Postulates',
      mathExpression: 'P(i) = |⟨i|ψ⟩|^2,  |ψ′⟩ = P_i|ψ⟩ / ||P_i|ψ⟩||',
      description:
        'Projective measurement with Hermitian observables A = ∑ λ_i P_i yields eigenvalue λ_i with Born probability |⟨i|ψ⟩|^2 and projects state to non-unitary eigenspace.',
    },
  },
  'qubits-pauli-operators': {
    intuition: {
      analogyTitle: 'Bloch Sphere Globe & The Error Trio (X, Y, Z)',
      description:
        'Picture a qubit as a location on a globe. X flips North and South poles (bit flip), Z spins the equator phase (phase flip), and Y does both at once.',
      takeaway: 'Bit flips (X) and phase flips (Z) are the two fundamental quantum errors.',
    },
    rigor: {
      formalismTitle: 'Pauli Group Algebra & Binary Anticommutation',
      mathExpression: 'XZ = -ZX,  X^2 = Y^2 = Z^2 = I,  P_n = {±1, ±i} × {I,X,Y,Z}^⊗n',
      description:
        'Pauli operators form a orthogonal basis for M_2(C). Binary anticommutation between error operators E and parity check operators S_i produces discrete syndrome signals.',
    },
  },
  'quantum-gates-circuits': {
    intuition: {
      analogyTitle: 'Assembly Line & Gate Permutations',
      description:
        'A quantum circuit is a multi-lane highway of wires where gates act like traffic turns. Clifford gates act like clean 90-degree turns, while non-Clifford T gates add fine diagonal turns.',
      takeaway: 'Clifford gates manipulate Pauli errors predictably; T gates provide universal power.',
    },
    rigor: {
      formalismTitle: 'Clifford Group Conjugation & Gottesman-Knill Theorem',
      mathExpression: 'C(P_n) = { U ∈ U(2^n) : U P U^† ∈ P_n },  H X H^† = Z',
      description:
        'Clifford gates (H, S, CNOT) map Pauli operators to Pauli operators under conjugation, enabling efficient classical simulation via stabilizer tracking.',
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
        'Imagine a balance scale that checks if two boxes weigh the same without opening either box. Stabilizer generators test whether qubit pairs match without revealing their individual contents.',
      takeaway: 'Stabilizers measure error syndromes while keeping logical data secret.',
    },
    rigor: {
      formalismTitle: 'Abelian Group Generators & Projection to Code Space',
      mathExpression: 'S = ⟨S_1, ..., S_{n-k}⟩,  P_{code} = (1/|S|) ∑_{g ∈ S} g',
      description:
        'Code space V_S is the joint +1 eigenspace of commuting Pauli generators S_i. Errors E anticommuting with S_i flip the eigenvalue to -1, producing syndrome s_i = 1.',
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
        'If physical error rate is below a critical threshold, adding more code layers suppresses errors exponentially—like herd immunity stopping a virus.',
      takeaway: 'Below the threshold, larger code distance drastically reduces logical failure rates.',
    },
    rigor: {
      formalismTitle: 'Threshold Scaling & Sub-Threshold Power Law',
      mathExpression: 'P_L(p) ≈ A (p / p_{th})^((d+1)/2),  p < p_{th}',
      description:
        'Fault-tolerance guarantees that provided physical error rate p < p_th, logical error rate P_L decays exponentially with code distance d.',
    },
  },
  'topological-order-anyons': {
    intuition: {
      analogyTitle: 'Knots in a Rope & Non-Local Memory',
      description:
        'Tying a knot in a rope creates a property that cannot be undone by wiggling a small local segment. Topological order stores quantum memory in global knot geometry.',
      takeaway: 'Topological state memory is immune to local physical noise.',
    },
    rigor: {
      formalismTitle: 'Degenerate Ground Space & Anyonic Exchange Phases',
      mathExpression: 'ψ_1 ψ_2 = e^(iθ) ψ_2 ψ_1,  θ_{e,m} = π',
      description:
        'Topological phases exhibit ground-state degeneracy dependent on manifold genus and non-Abelian/Abelian anyonic excitations governed by braid group representations.',
    },
  },
  'toric-code': {
    intuition: {
      analogyTitle: '2D Grid Fabric & Plaquette Smoke Detectors',
      description:
        'Imagine a woven grid on a donut surface. Cross-hair star detectors check vertex intersections, while square plaquette detectors monitor tile windows.',
      takeaway: 'X-type star checks detect phase flips (Z); Z-type plaquette checks detect bit flips (X).',
    },
    rigor: {
      formalismTitle: 'Toric Code Hamiltonian & Star/Plaquette Generators',
      mathExpression: 'H = -J_e ∑_v A_v - J_m ∑_p B_p,  A_v = ∏_{i ∈ v} X_i,  B_p = ∏_{j ∈ p} Z_j',
      description:
        'Exactly solvable 2D spin model on a torus grid with 4-qubit star and plaquette commuting Pauli operators. Ground state subspace has dimension 2^2 = 4.',
    },
  },
  'surface-code': {
    intuition: {
      analogyTitle: 'Planar Patch Cloth & Boundary Trim',
      description:
        'Planar surface codes flatten the toric donut onto a square cloth patch with rough and smooth borders, creating a practical 2D chip layout.',
      takeaway: 'Planar boundaries allow logical qubits to fit on flat 2D physical hardware grids.',
    },
    rigor: {
      formalismTitle: 'Planar Surface Code Boundaries & Logical Operators L_X, L_Z',
      mathExpression: 'L_X = ∏_{i ∈ C_X} X_i,  L_Z = ∏_{j ∈ C_Z} Z_j,  d = min(|C_X|, |C_Z|)',
      description:
        'Planar code uses alternating 3-qubit boundary checks and 4-qubit interior checks. Logical L_X stretches between smooth boundaries; L_Z stretches between rough boundaries.',
    },
  },
  'syndrome-extraction-circuits': {
    intuition: {
      analogyTitle: 'Ancilla Helper Messenger Qubits',
      description:
        'Helper ancilla qubits touch data qubits briefly, collect error warning signals, and report to sensors without touching data qubit values directly.',
      takeaway: 'Ancilla qubits extract parity checks without collapsing data superposition.',
    },
    rigor: {
      formalismTitle: 'Ancilla-Assisted Parity Check Circuits & Hook Errors',
      mathExpression: 'CNOT_{data→ancilla},  |0⟩ → H → CNOTs → H → Measure',
      description:
        'Syndrome extraction executes CNOT/CZ sequences between data qubits and ancilla qubits. Fault-tolerant design prevents single ancilla errors from propagating into weight-2 data errors.',
    },
  },
  'decoding-mwpm': {
    intuition: {
      analogyTitle: 'Connecting Distress Flares with Shortest Strings',
      description:
        'When error flares light up across a grid, the decoder connects pairs of flares with shortest string paths to identify where errors likely occurred.',
      takeaway: 'Minimum Weight Perfect Matching pairs syndrome defects to reverse physical errors.',
    },
    rigor: {
      formalismTitle: 'Blossom V Algorithm on Spacetime Syndrome Graph G(V,E)',
      mathExpression: 'min ∑_{(u,v) ∈ M} w_{uv},  w_{uv} = ln((1-p)/p) · dist(u,v)',
      description:
        'MWPM constructs a complete graph of syndrome defect vertices and finds a minimum-weight matching M in polynomial O(V^3) time using Edmonds Blossom algorithm.',
    },
  },
  'defects-braiding': {
    intuition: {
      analogyTitle: 'Cutting Holes & Dancing Defect Loops',
      description:
        'Turning off specific stabilizer checks creates holes (defects) in the quantum cloth. Walking one hole around another carries out a logical gate.',
      takeaway: 'Braiding defects executes fault-tolerant logical operations geometrically.',
    },
    rigor: {
      formalismTitle: 'Punctured Surface Code & Topological Braiding Permutations',
      mathExpression: 'L_{X,i} ↔ L_{Z,j},  Braid(d_1, d_2) ⇒ CNOT_{logical}',
      description:
        'Defect pairs (punctures) in planar surface code act as logical degrees of freedom. Winding a primal defect around a dual defect realizes a logical CNOT gate.',
    },
  },
  'lattice-surgery': {
    intuition: {
      analogyTitle: 'Velcro Stitching & Unzipping Quantum Patches',
      description:
        'Instead of moving defects, lattice surgery temporarily sews two separate planar code patches together along their edges to perform parity checks.',
      takeaway: 'Lattice surgery performs logical gates by merging and splitting code boundaries.',
    },
    rigor: {
      formalismTitle: 'Boundary Patch Merging, Splitting & Parity Measurements M_XX, M_ZZ',
      mathExpression: 'M_{ZZ} = L_{Z,1} · L_{Z,2}  (joint parity measured; code distance d preserved)',
      description:
        'Merging two planar code patches measures joint logical operators L_{Z,1} L_{Z,2} or L_{X,1} L_{X,2} in d clock cycles without moving physical qubits.',
    },
  },
  'cluster-states-mbqc': {
    intuition: {
      analogyTitle: '3D Entangled Crystal & Sculpting by Measurement',
      description:
        'Start with a massive 3D grid of pre-entangled qubits, then measure individual qubits one by one to carve out computation paths like sculpting marble.',
      takeaway: 'Measurement-based QEC replaces active gate execution with single-qubit measurements.',
    },
    rigor: {
      formalismTitle: '3D Raussendorf-Harrington-Goyal (RHG) Cluster State',
      mathExpression: '|C⟩ = ∏_{(u,v) ∈ E} CZ_{uv} |+⟩^⊗V,  M_X, M_Z',
      description:
        'Measurement-based quantum computation (MBQC) on 3D RHG cluster state performs fault-tolerant quantum computation via single-qubit Pauli measurements.',
    },
  },
  'magic-states-distillation': {
    intuition: {
      analogyTitle: 'Purifying Rough Ore into Pure Gold (15-to-1 Distillation)',
      description:
        'Clifford operations cannot execute non-Clifford T gates directly. Distillation takes 15 noisy helper states and refines them into 1 ultra-pure magic state.',
      takeaway: 'Magic state distillation supplies high-fidelity T gates for universal QEC.',
    },
    rigor: {
      formalismTitle: 'Bravyi-Kitaev 15-to-1 Reed-Muller Distillation Routine',
      mathExpression: '|T⟩ = (|0⟩ + e^(iπ/4)|1⟩)/√2,  ϵ_out ≈ 35 ϵ_in^3',
      description:
        '15-to-1 distillation gadget uses the [[15, 1, 3]] Reed-Muller code to measure error syndromes on noisy input |T⟩ states, suppressing error rate cubicly.',
    },
  },
  'flag-fault-tolerance': {
    intuition: {
      analogyTitle: 'Tripwire Security Sensors',
      description:
        'Tripwire flag qubits sit alongside syndrome extraction circuits. If a fault occurs mid-circuit, the flag trips immediately to warn the decoder.',
      takeaway: 'Flag qubits catch high-weight error propagation with minimal extra hardware.',
    },
    rigor: {
      formalismTitle: 'Flag Qubit Circuits & Mid-Circuit Fault Detection',
      mathExpression: 'State = |0⟩_flag,  Fault ⇒ |1⟩_flag',
      description:
        'Flag fault tolerance uses extra ancilla qubits in syndrome extraction to detect intermediate faults that could otherwise expand into uncorrectable data error chains.',
    },
  },
  'zx-calculus-basics': {
    intuition: {
      analogyTitle: 'Spider Diagrams & Graphical Circuit Rewriting',
      description:
        'ZX-calculus transforms complex quantum circuits into colorful spider graphs. Merging and popping spiders simplifies compiler optimization geometrically.',
      takeaway: 'Diagrammatic spider rules simplify quantum circuits visually.',
    },
    rigor: {
      formalismTitle: '†-Compact (Dagger-Compact) Symmetric Monoidal Category & Spider Generators',
      mathExpression: 'Z_n^m(α) : |0⟩^⊗n ⟨0|^⊗m + e^(iα)|1⟩^⊗n ⟨1|^⊗m',
      description:
        'ZX-calculus is a rigorous graphical language for quantum computing based on green (Z) and red (X) spiders satisfying rewiring graph transformation rules.',
    },
  },
  'advanced-decoding': {
    intuition: {
      analogyTitle: 'AI Weather Forecasting for Quantum Noise',
      description:
        'Advanced decoders use neural networks and belief propagation to predict complex correlated error storms faster than simple shortest-path matchers.',
      takeaway: 'Belief propagation and tensor networks improve decoding speed and accuracy.',
    },
    rigor: {
      formalismTitle: 'Belief Propagation + Ordered Statistics Decoding (BP-OSD)',
      mathExpression: 'P(e | s) = argmax_{e : H e = s} P(e),  BP-OSD, Tensor Network',
      description:
        'Advanced decoding algorithms leverage BP-OSD, Union-Find, and Tensor Network contractions to handle degenerate syndromes and high-degree parity matrices.',
    },
  },
  'real-time-decoding-control': {
    intuition: {
      analogyTitle: 'Sub-Microsecond FPGA Traffic Controller',
      description:
        'Quantum errors happen in nanoseconds. Real-time control hardware must decode syndrome flares and calculate corrections before the next gate cycle.',
      takeaway: 'Real-time decoding requires ultra-low latency hardware stream processing.',
    },
    rigor: {
      formalismTitle: 'FPGA Stream Processing & Low-Latency Pipeline Architectures',
      mathExpression: 'Latency < t_{cycle} ≈ 1 µs  (backlog constraint),  Throughput > 10^6 syndromes/sec',
      description:
        'Hardware control stacks deploy streaming decoders on FPGAs/ASICs to achieve sub-microsecond syndrome processing and feed-forward corrections.',
    },
  },
  'magic-state-cultivation': {
    intuition: {
      analogyTitle: 'High-Yield Magic State Factories',
      description:
        'Modern architectures build compact, high-yield magic state factories that cultivate pure T states with 10x less physical qubit space.',
      takeaway: 'Cultivation gadgets drastically reduce surface-code hardware overhead.',
    },
    rigor: {
      formalismTitle: 'Block-Code Distillation & Low-Overhead State Cultivation',
      mathExpression: 'Overhead: O(d^3) → O(d^2),  Yield η_{distill} > 99%',
      description:
        'Advanced state cultivation protocols replace traditional 15-to-1 factories with auto-correcting block codes and synthification gadgets.',
    },
  },
  'tqec-compilers-automation': {
    intuition: {
      analogyTitle: '3D Spacetime Architect & Blueprint Compiler',
      description:
        'Compilers take high-level code and convert it into 3D spacetime blueprints of braided pipes and lattice surgery blocks ready for chip execution.',
      takeaway: 'Compilers automate 3D spacetime layout and lattice surgery routing.',
    },
    rigor: {
      formalismTitle: '3D Spacetime Graph Synthesis & Topological Routing Optimization',
      mathExpression: 'Min Volume V = L_x × L_y × T_{time}',
      description:
        'TQEC compilers optimize 3D topological defect manifolds and lattice surgery schedules to minimize total spacetime volume (qubit-seconds).',
    },
  },
  'clifford-simulation-hybrid': {
    intuition: {
      analogyTitle: 'Hybrid Supercomputer Simulator',
      description:
        'Classically simulate millions of Clifford gates effortlessly on standard CPUs, focusing expensive quantum simulation power only on non-Clifford T gates.',
      takeaway: 'Hybrid simulation tracks massive stabilizer states at high speed.',
    },
    rigor: {
      formalismTitle: 'Stabilizer Frame Tracking & Magic State Decomposition',
      mathExpression: 'χ(|ψ⟩) = min { k : |ψ⟩ = ∑_{i=1}^k c_i |S_i⟩ }',
      description:
        'Hybrid simulators leverage Gottesman-Knill stabilizer frames combined with rank-decompositions of non-Clifford states to simulate large-scale QEC circuits.',
    },
  },
  'below-threshold-experiments': {
    intuition: {
      analogyTitle: 'The Sound Barrier Breakthrough (Supersonic QEC)',
      description:
        'In recent laboratory milestones, superconducting and neutral-atom quantum processors officially crossed below the error threshold, demonstrating logical qubits that outlive their physical parts.',
      takeaway: 'Real physical hardware has officially proven logical error suppression in labs.',
    },
    rigor: {
      formalismTitle: 'Experimental Logical Qubit Lifetime Milestones (Google Willow, Quantinuum, Harvard/QuEra)',
      mathExpression: 'Λ = ε_L(d) / ε_L(d+2) > 1  (Willow: Λ ≈ 2.14),  P_L(d=5) < P_L(d=3)',
      description:
        'Landmark physical experiments (Google Willow, Quantinuum H-series, Harvard/QuEra) demonstrate logical error suppression with d=3 and d=5 surface/color codes.',
    },
  },
};

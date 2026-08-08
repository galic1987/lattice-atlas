/**
 * Altitude ladders: five core concepts, each explained at five heights.
 * The engine is `revises` — every level opens by confessing exactly what
 * the previous level oversimplified. Honest lies-to-children, with each
 * lie repaid one level up. The final altitude always replaces explanation
 * with verification.
 */

export interface AltitudeLevel {
  ageLabel: string;
  badge: string;
  title: string;
  /** What the previous level got wrong — null on the first rung. */
  revises: string | null;
  explanation: string;
  takeaway: string;
}

export interface AltitudeLink {
  label: string;
  to: string;
  external: boolean;
}

export interface AltitudeConcept {
  id: string;
  label: string;
  title: string;
  /** Claim that remains true at every explanatory depth. */
  invariant: string;
  levels: AltitudeLevel[];
  proLinks: AltitudeLink[];
}

export const ALTITUDE_CONCEPTS: AltitudeConcept[] = [
  {
    id: 'error-correction',
    label: 'Error correction',
    title: 'How a quantum memory heals itself',
    invariant:
      'Parity evidence constrains possible error classes without revealing the encoded logical value; recovery is still inference under a declared model.',
    levels: [
      {
        ageLabel: 'Age 5 · Playful wonder',
        badge: 'TOY BLOCKS',
        title: 'The Toy Block Wall & the Mischievous Ghosts',
        revises: null,
        explanation:
          'Imagine a magic wall of toy blocks keeping a secret picture. Mischievous ghosts sneak in and nudge blocks when you aren’t looking! But the wall has smoke detectors between the blocks, and they beep wherever a ghost has been — so you can fix the wall without ever opening the secret box.',
        takeaway: 'Alarms find the mischief without anyone peeking at the secret.',
      },
      {
        ageLabel: 'Age 10 · Puzzle game',
        badge: 'PUZZLE GRID',
        title: 'The Parity Alarm Puzzle',
        revises:
          'At five we said the beeps tell you exactly which block to fix. Not true — each alarm only says “something changed near me.”',
        explanation:
          'Now it’s an ideal, one-round puzzle: noise flips a data qubit, nearby parity-check answers turn red, and the flip itself stays hidden. A whole chain of flips cancels in its middle, so only its endpoints mark the syndrome. You connect those marks in pairs or to a matching edge. Choose a wrong completion that joins the wrong boundaries and the secret can flip while every alarm is quiet.',
        takeaway: 'In the ideal 2D puzzle, syndrome marks are endpoints of hidden chains — not a map of the errors.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'PARITY CHECKS',
        title: 'Syndromes, Distance & the Unreliable Referee',
        revises:
          'The puzzle pretended the red tiles are perfectly reliable. They aren’t — the detectors are built from the same faulty parts as everything else.',
        explanation:
          'The “tiles” are parity checks: measurements that ask a group of qubits whether its parity is even or odd without revealing any one data value. One round’s check-result pattern is a syndrome. When measurement is noisy, the machine repeats the checks and compares results across rounds; an unexpected change in those comparisons is a detection event. The code distance d is the minimum weight of an undetectable logical operator, not the number of red marks.',
        takeaway: 'Syndrome results live in each round; detection events are unexpected changes across the repeated record.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'STABILIZERS',
        title: 'Stabilizers, Matching & the Threshold',
        revises:
          '“The grid heals” hid an assumption: the decoder never knows the true error. It infers the most likely one — and can be fooled silently.',
        explanation:
          'The checks are commuting Pauli stabilizers with S|ψ⟩ = +|ψ⟩ on the codespace. An error that anticommutes with S changes its eigenvalue; ideal measurement projects into the corresponding syndrome sector. A decoder infers a correction, which may be applied or tracked in a Pauli frame. For a specified noise model, extraction circuit, and decoder below their threshold, logical failure commonly falls approximately exponentially with distance. Here Λ = ε(d)/ε(d+2), so Λ > 1 means the larger code failed less often.',
        takeaway: 'Stabilizers expose commutation signs; decoding is inference; Λ > 1 is evidence of suppression only for the tested setup.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Stop Believing — Measure',
        revises: 'Every level so far asked you to take our word for something. This one doesn’t.',
        explanation:
          'The homological picture depends on the surface: logical operators are non-contractible closed cycles on a torus, but relative cycles joining compatible boundaries on a planar patch. Use the Lab to test the site’s idealized local model, then reproduce a declared circuit-noise experiment with Stim and a decoder such as PyMatching. Those simulations can verify their own assumptions; hardware behavior still requires hardware data.',
        takeaway: 'Name the geometry, noise model, circuit, decoder, and measured quantity before calling a result verified.',
      },
    ],
    proLinks: [
      { label: 'Run the threshold experiment', to: '/lab', external: false },
      { label: 'Be the decoder (Duel)', to: '/duel', external: false },
      { label: 'Stim simulator (primary repository)', to: 'https://github.com/quantumlib/Stim', external: true },
      { label: 'PyMatching decoder (primary repository)', to: 'https://github.com/oscarhiggott/PyMatching', external: true },
      { label: 'Google’s below-threshold paper', to: '/papers#2408.13687', external: false },
    ],
  },
  {
    id: 'superposition',
    label: 'Superposition',
    title: 'What a qubit actually is',
    invariant:
      'A quantum state assigns complex amplitudes; a declared measurement turns them into probabilities, while relative phase can change later interference.',
    levels: [
      {
        ageLabel: 'Age 5 · Playful wonder',
        badge: 'MEETING RIPPLES',
        title: 'When Two Ripples Meet',
        revises: null,
        explanation:
          'Make two little ripples in a tub. Where their crests meet, the water rises higher; where a crest meets a dip, they can flatten. A qubit carries number-arrows that can reinforce or cancel in a similar way before we ask a measurement question. It is not literally water, and one measurement gives one outcome—not a picture of the ripples.',
        takeaway: 'Quantum alternatives can reinforce or cancel before a measurement produces one outcome.',
      },
      {
        ageLabel: 'Age 10 · Puzzle game',
        badge: 'PHASE ARROWS',
        title: 'Arrows with Length and Direction',
        revises:
          'Water ripples live in ordinary space and can be watched continuously. A qubit’s components are mathematical amplitudes, and the measurement basis decides which combinations can interfere.',
        explanation:
          'Draw one arrow for the |0⟩ amplitude and one for |1⟩. Length records magnitude and direction records phase. A gate can rotate or recombine them. Add arrows that lead to the same detector first, then square the resulting length to predict how often that detector clicks.',
        takeaway: 'Amplitude arrows carry magnitude and phase; they are added before probabilities are calculated.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'INTERFERENCE',
        title: 'Amplitudes, Phase & Where the Blend Shows',
        revises:
          '“A blend with strengths” skipped the strangest ingredient: the timing between the two vibrations — the phase — which is invisible until vibrations meet.',
        explanation:
          'Each component carries a complex amplitude: its magnitude helps set outcome probabilities, while its phase sets how paths interfere. The normalized states (|0⟩+|1⟩)/√2 and (|0⟩−|1⟩)/√2 look identical in a Z-basis measurement yet give opposite X-basis outcomes. Measurement chooses an observable, samples an outcome by the Born rule, and generally changes superpositions between that observable’s eigenspaces.',
        takeaway: 'Relative phase has observable consequences when a later operation makes paths interfere.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'BORN RULE',
        title: '|ψ⟩ = α|0⟩ + β|1⟩ and What Asking Means',
        revises:
          '“The string picks a shape when touched” hid the rule for how: outcomes follow squared magnitudes, and “touching” is projection in a chosen basis.',
        explanation:
          'A pure qubit state is |ψ⟩ = α|0⟩ + β|1⟩ with complex amplitudes and |α|² + |β|² = 1. A projective measurement samples an eigenspace with probability ⟨ψ|P|ψ⟩ (the Born rule) and updates the state into that eigenspace. Global phase is unobservable; relative phase is not. An arbitrary unknown state cannot be cloned, and measuring a non-commuting observable generally disturbs it — so QEC measures joint parities that commute with the encoded information.',
        takeaway: 'Born rule + no-cloning + measurement-disturbance = why QEC must be indirect.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Stop Believing — Measure',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'Interference, phase, and measurement-disturbance are not metaphors — they are the daily working assumptions of every circuit in the Lab and every paper in the canon. Go handle them yourself: flip Paulis on real simulated states, then read how the foundations were nailed down.',
        takeaway: 'The blend is real because you can make it interfere on demand.',
      },
    ],
    proLinks: [
      { label: 'Foundations lab', to: '/foundations', external: false },
      { label: 'Qubits & Paulis on the map', to: '/map?topic=qubits-pauli-operators', external: false },
      { label: 'Quantum mechanics basics', to: '/map?topic=quantum-mechanics-basics', external: false },
      { label: 'Glossary: phase', to: '/glossary#phase', external: false },
    ],
  },
  {
    id: 'topology',
    label: 'Topology',
    title: 'Why shape protects information',
    invariant:
      'Logical operators occupy global path classes, so local faults must combine into a nontrivial class before they can become a logical error.',
    levels: [
      {
        ageLabel: 'Age 5 · Playful wonder',
        badge: 'PRETZEL',
        title: 'The Pretzel’s Holes',
        revises: null,
        explanation:
          'A pretzel has holes, and no single bite changes how many. Nibble the edges all you like — the holes are a fact about the whole pretzel, not about any piece of it. Hide your secret in the number of holes and crumbs can’t touch it.',
        takeaway: 'Some facts belong to the whole shape, and small bites can’t reach them.',
      },
      {
        ageLabel: 'Age 10 · Puzzle game',
        badge: 'RUBBER BAND',
        title: 'The Band Around the Donut',
        revises:
          'We said no bite can eat the hole. But a chain of bites all the way around can — the real rule is about complete paths, not single bites.',
        explanation:
          'Stretch a rubber band around a donut: you can slide it, wiggle it, stretch it — it stays wrapped. To unwrap it you must cut clear across. Errors are wiggles; a disaster is a full cut. The protection isn’t that damage is impossible, it’s that damage must be complete to matter — and complete damage takes many coordinated steps.',
        takeaway: 'Wiggles are free; only a path all the way across changes anything.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'LOOPS & CHAINS',
        title: 'Local Checks, Global Secrets',
        revises:
          'The rubber band was one object. In the code, the “band” is made of the errors themselves — chains of flipped qubits on the lattice.',
        explanation:
          'A contractible closed error loop that equals a stabilizer acts trivially on the logical state. An open chain normally leaves syndrome at its endpoints, but the right kind of endpoint can condense on a matching planar boundary. That makes a boundary-to-boundary chain a possible planar logical operator. On a torus there are no edges: the analogous danger is a closed loop that winds non-trivially around the surface. Distance d is the minimum weight among such logical representatives.',
        takeaway: 'Planar code: relative paths between compatible boundaries. Toric code: closed non-contractible loops.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'HOMOLOGY',
        title: 'Cycles, Boundaries & Degeneracy',
        revises:
          '“Crossing the lattice” is really an equivalence-class statement: what matters is never the chain itself, only its class up to adding harmless loops.',
        explanation:
          'For a closed toric geometry, logical strings are classes of cycles modulo stabilizer boundaries: absolute homology. A planar surface code instead uses relative homology, allowing endpoints on designated condensing boundaries. Corrections differing by a stabilizer act identically on the logical subspace; corrections differing by a logical representative do not. On a closed orientable genus-g surface, the toric code encodes 2g qubits and has ground-space dimension 2^(2g).',
        takeaway: 'Closed surfaces use cycles modulo boundaries; planar patches use relative cycles modulo boundaries.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Build the Invisible Error Yourself',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'The Lab has a challenge called “the invisible error”: paint a chain of errors clear across the lattice and watch the syndrome stay perfectly silent while the logical qubit flips. Thirty seconds of clicking teaches what three levels of prose approximated — then read Kitaev’s original construction.',
        takeaway: 'You can construct a planar boundary-to-boundary logical path with your own cursor.',
      },
    ],
    proLinks: [
      { label: 'Lab: the invisible-error challenge', to: '/lab', external: false },
      { label: 'Toric code on the map', to: '/map?topic=toric-code', external: false },
      { label: 'Topological order & anyons', to: '/map?topic=topological-order-anyons', external: false },
      { label: 'The 1998 planar-code paper', to: '/papers#quant-ph/9811052', external: false },
    ],
  },
  {
    id: 'decoding',
    label: 'Decoding',
    title: 'Finding errors you never see',
    invariant:
      'A decoder maps syndrome or detection evidence plus a noise model to a correction or frame hypothesis; it does not observe the hidden fault.',
    levels: [
      {
        ageLabel: 'Age 5 · Playful wonder',
        badge: 'PAW PRINTS',
        title: 'The Cat in the Snow',
        revises: null,
        explanation:
          'A cat walked through the fresh snow last night, but you never saw it. Its paw prints tell you where it went! Follow the prints, tidy the snow, and the garden looks perfect again — all without ever catching the cat.',
        takeaway: 'You can undo mischief you never witnessed, if it leaves tracks.',
      },
      {
        ageLabel: 'Age 10 · Puzzle game',
        badge: 'TRAIL ENDS',
        title: 'Only the Ends of the Trail',
        revises:
          'We said the prints show where the cat went. Trickier: this snow only keeps the first and last print of each trail — the middle vanishes.',
        explanation:
          'Now the game is real: pairs of lone prints, and you must guess the paths between them. The safest guess is the shortest one — cats are lazy. But two pairs close together can fool you: connect the wrong ends and your “tidying” makes a longer trail than the cat ever walked. Guess a path that crosses the whole garden and you’ve ruined it yourself.',
        takeaway: 'Decoding is guessing hidden paths from their endpoints — and the shortest guess is a bet, not a fact.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'MATCHING',
        title: 'Syndromes, Detection Events & Time',
        revises:
          'The snow itself was honest. In a real device the snow lies too — detectors misfire, printing tracks no cat ever made.',
        explanation:
          'A syndrome is a round’s pattern of parity-check outcomes. In an ideal single-round, code-capacity puzzle, its defects can be decoded on a 2D graph. With noisy repeated measurements, the decoder instead uses detection events: violations of expected relationships between results, often changes between rounds. Those events form a 3D space-time problem where data faults tend to make spatial edges and measurement faults tend to make time-like edges.',
        takeaway: 'Ideal one-shot decoding is 2D; repeated noisy measurement turns detection events into a space-time problem.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'MWPM',
        title: 'Graphs, Weights & the Race Against the Clock',
        revises:
          '“Fewest total errors” assumed all errors are equally likely. They aren’t — and the decoder must also finish before the next snowfall.',
        explanation:
          'Build a decoding graph whose vertices are detection events or permitted boundaries and whose edge weights encode a declared noise model, often as negative log-likelihoods. Blossom-style algorithms solve the minimum-weight perfect-matching objective exactly, but that objective is not generally exact maximum-likelihood decoding of a degenerate, correlated quantum code. Union-find decoders can have almost-linear complexity; their logical accuracy and latency trade-offs depend on the code, noise, graph, and implementation. If rounds arrive at fixed rate a and service runs at fixed rate s<a, backlog grows approximately (a−s)t: linearly, while individual wait time keeps increasing.',
        takeaway: 'MWPM exactly minimizes its graph weight; physical optimality and real-time performance remain model-dependent.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Out-Decode the Machine',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'Decoder Duel gives you a deliberately simplified, ideal single-round surface-code problem: you see syndrome defects, not the hidden errors, and compare correction weight with the built-in matcher. It demonstrates endpoint ambiguity and silent logical failure, but it does not benchmark a production decoder, measurement noise, correlated hardware noise, or wall-clock latency. Use the Lab’s Monte Carlo sweep only as evidence about its declared local model.',
        takeaway: 'A toy can verify an invariant of its model; it cannot establish hardware accuracy or decoder throughput.',
      },
    ],
    proLinks: [
      { label: 'Decoder Duel — daily puzzle', to: '/duel', external: false },
      { label: 'Lab: decode by hand', to: '/lab', external: false },
      { label: 'MWPM on the map', to: '/map?topic=decoding-mwpm', external: false },
      { label: 'O(1)-time matching paper', to: '/papers#1307.1740', external: false },
    ],
  },
  {
    id: 'magic-states',
    label: 'Magic states',
    title: 'The missing ingredient of quantum computing',
    invariant:
      'In stabilizer-based fault-tolerant schemes, a prepared non-Clifford resource such as |A⟩ = T|+⟩ is consumed to enact T, and its preparation cost depends on the model.',
    levels: [
      {
        ageLabel: 'Age 5 · Playful wonder',
        badge: 'VANILLA',
        title: 'The Kitchen Without Vanilla',
        revises: null,
        explanation:
          'Your magic kitchen can bake anything — except it has no vanilla, and the best cakes need vanilla. Little bottles of vanilla get delivered from outside, and each bottle is exactly one cake’s worth. No bottle, no cake.',
        takeaway: 'One special ingredient can’t be made in the kitchen — only delivered and used up.',
      },
      {
        ageLabel: 'Age 10 · Puzzle game',
        badge: 'MUDDY BOTTLES',
        title: 'Cleaning the Deliveries',
        revises:
          'We said bottles get delivered. We didn’t say the deliveries are muddy — every bottle arrives a little spoiled.',
        explanation:
          'One famous idealized cleaning block takes fifteen independently noisy bottles, checks them, and keeps one output only when the checks accept. For small input error p, that accepted output has leading error about 35p³. Feeding fifteen first-round outputs to a second block starts from 225 raw inputs before counting rejected attempts, circuit faults, routing, or storage — so 225 is a wiring count, not a guaranteed cost.',
        takeaway: 'Distillation trades many attempts for a cleaner accepted output; rejection and faulty circuits belong in the bill.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'T GATES',
        title: 'Clifford’s Limit & the T Gate',
        revises:
          '“Vanilla” has a name and a reason: the T gate — and the reason the kitchen can’t make it is a theorem, not a shortage.',
        explanation:
          'Stabilizer circuits built from Clifford operations, Pauli preparation, and Pauli measurement are efficiently classically simulable by the Gottesman–Knill theorem. Universal fault-tolerant schemes therefore add a non-Clifford resource such as T. In a common injection gadget, a prepared magic state is consumed to enact one T gate, with measurement-dependent Clifford correction. That is why T-count and T-depth are major — though not complete — resource metrics.',
        takeaway: 'Stabilizer operations are classically tractable; injected non-Clifford resources complete universality.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'DISTILL & GROW',
        title: '15-to-1, Overhead Scaling & Cultivation',
        revises:
          '“Most of the kitchen is cleaners” still depends on the algorithm, target error, architecture, and noise model. Cultivation is a promising alternative, not a universal replacement.',
        explanation:
          'Use the convention |A⟩ = T|+⟩ = (|0⟩ + e^{iπ/4}|1⟩)/√2. In the ideal independent-input model, 15-to-1 has leading accepted-output error 35p³. The cultivation proposal injects a state into a distance-3 triangular color code, alternates logical checks with code growth and postselection, then escapes by grafting into a larger matchable code. The escape can add errors and dominate discard or cost. Reported savings come from simulations under declared circuit-noise assumptions and target regimes; they are evidence for those models, not a universal yield or hardware guarantee.',
        takeaway: '|A⟩ supplies T; 15-to-1 has a scoped cubic law; cultivation is check–grow–postselect–escape with model-dependent evidence.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Count the Bottles Yourself',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'The claims here are quantitative, so read each source’s protocol, acceptance condition, input-noise assumptions, output metric, circuit-noise model, and confidence interval. The primary Bravyi–Haah, catalyzed-factory, and cultivation papers do not make interchangeable claims. Recompute their headline arithmetic, then keep ideal protocol laws separate from full fault-tolerant resource estimates.',
        takeaway: 'A resource claim is reproducible only when its protocol, scope, omissions, and acceptance rule travel with the number.',
      },
    ],
    proLinks: [
      { label: 'Magic states on the map', to: '/map?topic=magic-states-distillation', external: false },
      { label: 'Cultivation (frontier)', to: '/map?topic=magic-state-cultivation', external: false },
      { label: 'Bravyi–Haah triorthogonal distillation', to: 'https://arxiv.org/abs/1209.2426', external: true },
      { label: 'Catalyzed CCZ factories', to: '/papers#1812.01238', external: false },
      { label: 'Magic-state cultivation (primary paper)', to: 'https://arxiv.org/abs/2409.17595', external: true },
      { label: 'Field Today: the bottleneck', to: '/field-today', external: false },
    ],
  },
];

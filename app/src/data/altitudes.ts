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
  /** Optional banner image in public/ (see design/art-directions-altitudes.md). */
  banner?: string;
  bannerAlt?: string;
  levels: AltitudeLevel[];
  proLinks: AltitudeLink[];
}

const NB = 'https://github.com/galic1987/lattice-atlas/blob/main/notebooks';

export const ALTITUDE_CONCEPTS: AltitudeConcept[] = [
  {
    id: 'error-correction',
    label: 'Error correction',
    title: 'How a quantum memory heals itself',
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
          'Now it’s a puzzle grid: when noise flips a qubit, the two detector tiles touching it turn red — the flip itself stays invisible. Errors make chains, and only the chain’s two endpoints glow. Your job is to connect red endpoints in pairs with the shortest strings you can. Choose well and the grid heals; choose a path that wraps across the whole board and you’ve lost without any alarm going off.',
        takeaway: 'Pairs of alarms are endpoints of hidden chains — decoding is connect-the-dots with consequences.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'PARITY CHECKS',
        title: 'Syndromes, Distance & the Unreliable Referee',
        revises:
          'The puzzle pretended the red tiles are perfectly reliable. They aren’t — the detectors are built from the same faulty parts as everything else.',
        explanation:
          'The “tiles” are parity checks: measurements that ask a group of qubits “is your parity even or odd?” without asking any qubit its value. The answer pattern is called the syndrome. Because a check can itself misfire, the machine measures every check again and again, and the decoder works on the whole history in time. The code’s strength is its distance d: the smallest number of little errors that can chain into an invisible big one.',
        takeaway: 'Syndrome = the pattern of failed parity checks, re-measured forever because the referees are fallible too.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'STABILIZERS',
        title: 'Stabilizers, Matching & the Threshold',
        revises:
          '“The grid heals” hid an assumption: the decoder never knows the true error. It infers the most likely one — and can be fooled silently.',
        explanation:
          'The checks are stabilizers: commuting Pauli products with S|ψ⟩ = +|ψ⟩ on every code state. An error that anticommutes with a stabilizer flips its outcome to −1; measurement projects into a syndrome eigenspace, and correction returns the state to the code space. Decoding is minimum-weight matching of detection events across space and time — an inference, not an observation. Below the threshold error rate, growing d suppresses the logical error rate exponentially; the suppression factor per distance step is Λ.',
        takeaway: 'S|ψ⟩ = +|ψ⟩ · anticommutation makes syndromes · matching infers · below p_th, bigger d wins by Λ per step.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Stop Believing — Measure',
        revises: 'Every level so far asked you to take our word for something. This one doesn’t.',
        explanation:
          'The full picture is homological: errors are chains, syndromes are their boundaries, and logical operators are the non-contractible cycles the decoder must never complete. But at this altitude the explanation stops being words at all — you reproduce the claims yourself, from a browser toy model to a research simulator to actual superconducting hardware.',
        takeaway: 'The final form of understanding is a measurement you ran yourself.',
      },
    ],
    proLinks: [
      { label: 'Run the threshold experiment', to: '/lab', external: false },
      { label: 'Be the decoder (Duel)', to: '/duel', external: false },
      { label: 'Stim + PyMatching notebook', to: `${NB}/first-threshold-curve.ipynb`, external: true },
      { label: 'Measure it on IBM hardware', to: `${NB}/real-hardware-error-suppression.ipynb`, external: true },
      { label: 'Google’s below-threshold paper', to: '/papers#2408.13687', external: false },
    ],
  },
  {
    id: 'superposition',
    label: 'Superposition',
    title: 'What a qubit actually is',
    levels: [
      {
        ageLabel: 'Age 5 · Playful wonder',
        badge: 'SPINNING COIN',
        title: 'The Coin That Hasn’t Landed',
        revises: null,
        explanation:
          'A coin spinning on the table isn’t heads or tails yet — it’s a silvery blur that only becomes one or the other when you slap it flat. A qubit is like the spinning: the answer doesn’t exist until you ask, and asking is the slap.',
        takeaway: 'Some questions don’t have an answer until the moment you ask them.',
      },
      {
        ageLabel: 'Age 10 · Puzzle game',
        badge: 'GUITAR STRING',
        title: 'Two Vibrations in One String',
        revises:
          'The coin picture whispers that the answer is secretly wobbling underneath, waiting. It isn’t — the qubit truly holds both possibilities at once, each with a definite strength.',
        explanation:
          'A guitar string can ring with two shapes of vibration at the same time — a deep one and a bright one, blended. The blend is real: pluck-and-listen at different spots and the mix changes what you hear. A qubit is the string, not the coin: two components coexisting with exact strengths and exact timing, not one hidden answer.',
        takeaway: 'Not a hidden answer — a real blend of two vibrations with definite strengths.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'INTERFERENCE',
        title: 'Amplitudes, Phase & Where the Blend Shows',
        revises:
          '“A blend with strengths” skipped the strangest ingredient: the timing between the two vibrations — the phase — which is invisible until vibrations meet.',
        explanation:
          'Each component carries an amplitude: a strength and a timing. Two states can have identical strengths — |0⟩+|1⟩ and |0⟩−|1⟩ look the same if you only ask “zero or one?” — yet behave oppositely the moment their parts are made to interfere, adding where they agree and cancelling where they clash. Measurement picks a question (a basis), returns one outcome with probability given by the amplitudes, and destroys the blend it asked about.',
        takeaway: 'Phase is physically real, but only interference ever reveals it.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'BORN RULE',
        title: '|ψ⟩ = α|0⟩ + β|1⟩ and What Asking Means',
        revises:
          '“The string picks a shape when touched” hid the rule for how: outcomes follow squared magnitudes, and “touching” is projection in a chosen basis.',
        explanation:
          'A pure state is |ψ⟩ = α|0⟩ + β|1⟩ with complex amplitudes and |α|² + |β|² = 1. Measuring in a basis projects onto one basis state with probability |amplitude|² (the Born rule); global phase is unobservable, relative phase is not. Two consequences run this whole field: an unknown state cannot be copied (no-cloning), and reading data destroys it — which is why error correction interrogates parities, never values.',
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
      { label: 'Glossary: relative phase', to: '/glossary#relative-phase', external: false },
    ],
  },
  {
    id: 'topology',
    label: 'Topology',
    title: 'Why shape protects information',
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
          'Error chains that close into small loops are harmless — they’re invisible to the logic. Chains with endpoints are detectable — the endpoints light detectors. The only dangerous thing is a chain that crosses the lattice boundary-to-boundary: no endpoints to detect, but the winding changes the stored value. The code distance d is the length of the shortest such crossing — the number of coordinated errors needed for a silent disaster.',
        takeaway: 'Loops: harmless. Open chains: detectable. Crossings: the silent enemy, at least d steps long.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'HOMOLOGY',
        title: 'Cycles, Boundaries & Degeneracy',
        revises:
          '“Crossing the lattice” is really an equivalence-class statement: what matters is never the chain itself, only its class up to adding harmless loops.',
        explanation:
          'Stabilizers measure boundaries; undetectable errors are cycles; harmless cycles are boundaries of something; logical operators are the non-contractible cycles — cycles that bound nothing. Two corrections that differ by a stabilizer loop are the same correction; two that differ by a logical cycle are catastrophically different. On a genus-g surface the toric code’s ground space is 2^2g-fold degenerate: topology, counted, is the memory.',
        takeaway: 'The logical qubit lives in homology: cycles modulo boundaries.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Build the Invisible Error Yourself',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'The Lab has a challenge called “the invisible error”: paint a chain of errors clear across the lattice and watch the syndrome stay perfectly silent while the logical qubit flips. Thirty seconds of clicking teaches what three levels of prose approximated — then read Kitaev’s original construction.',
        takeaway: 'You can construct the non-contractible cycle with your own cursor.',
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
        title: 'Syndrome, Matching & the Time Dimension',
        revises:
          'The snow itself was honest. In a real device the snow lies too — detectors misfire, printing tracks no cat ever made.',
        explanation:
          'The lone prints are the syndrome: detection events where a parity check changed. The decoder pairs them up — minimum-weight matching — choosing the explanation with the fewest total errors. Because checks also fail, each round of measurement is a new layer of snow, and matching runs through a 3D stack of space and time, pairing events between layers (measurement errors) as readily as within them (qubit errors).',
        takeaway: 'Match detection events across space AND time; measurement noise is just another kind of track.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'MWPM',
        title: 'Graphs, Weights & the Race Against the Clock',
        revises:
          '“Fewest total errors” assumed all errors are equally likely. They aren’t — and the decoder must also finish before the next snowfall.',
        explanation:
          'Build a graph: vertices are detection events, edge weights are −log(probability) of the error connecting them; minimum-weight perfect matching then maximizes likelihood under independent noise. Blossom does it near-optimally; union-find does it in near-linear time with almost no accuracy loss — and speed is not a luxury: a decoder slower than the syndrome rate accumulates backlog exponentially. Failure is homological and silent: error plus correction forming a non-trivial cycle.',
        takeaway: 'Matching = maximum likelihood on a weighted graph, under a hard real-time deadline.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Out-Decode the Machine',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'Decoder Duel gives you exactly the real problem: a syndrome, no errors, a par score set by the matching decoder. Play ten rounds and you will feel the endpoint ambiguity, the lazy-cat bet, and the silent failure personally. Then run a million decodes in the Lab and watch the statistics vindicate the algorithm.',
        takeaway: 'Lose to the decoder a few times — it is the fastest possible lesson in why it works.',
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
          'The trick is a cleaning machine: pour in fifteen muddy bottles, and out comes one much cleaner bottle. Chain the machines — the output of fifteen cleaners feeds one super-cleaner — and you can get vanilla as pure as you like. But look at the cost: making one perfect bottle ate two hundred twenty-five muddy ones, and most of your kitchen is now cleaning machines.',
        takeaway: 'Purity is bought with quantity — and the cleaning factory dwarfs the bakery.',
      },
      {
        ageLabel: 'Age 15 · Real vocabulary',
        badge: 'T GATES',
        title: 'Clifford’s Limit & the T Gate',
        revises:
          '“Vanilla” has a name and a reason: the T gate — and the reason the kitchen can’t make it is a theorem, not a shortage.',
        explanation:
          'The gates a surface code performs natively — the Clifford gates — can be simulated efficiently by a classical computer (Gottesman–Knill), so they alone can never outcompute your laptop. Quantum advantage enters through non-Clifford gates like T. The code can’t apply T directly; instead it consumes a prepared magic state via teleportation, one state per gate. That’s why algorithm costs are quoted in T-count: every T is one bottle from the factory.',
        takeaway: 'Clifford-only = classically simulable; every T gate spends one magic state.',
      },
      {
        ageLabel: 'Age 20 · The formalism',
        badge: 'DISTILL & GROW',
        title: '15-to-1, Overhead Scaling & Cultivation',
        revises:
          '“Most of the kitchen is cleaners” was the old economics. The newest technique changed the whole budget — the factory became a garden plot.',
        explanation:
          'The state is |T⟩ = (|0⟩ + e^{iπ/4}|1⟩)/√2. The 15-to-1 protocol suppresses error cubically (p → ~35p³) per round, with overhead compounding per level — historically the dominant cost of fault-tolerant machines, which triorthogonal codes then improved. Magic state cultivation (2024–25) instead grows a high-fidelity |T⟩ inside a small code and expands the code around it, cutting the spacetime cost dramatically and rewriting whole-machine resource estimates.',
        takeaway: '|T⟩ powers universality; distillation buys purity at polynomial cost; cultivation collapsed that cost.',
      },
      {
        ageLabel: 'Practitioner · No trust required',
        badge: 'VERIFY IT',
        title: 'Count the Bottles Yourself',
        revises: 'Every level so far asked for trust. This one doesn’t.',
        explanation:
          'The claims here are quantitative — factory footprints, error-suppression exponents, T-counts — and they live in papers you can now read: the Bravyi–Haah overhead paper and the catalyzed-factory constructions. The Field Today page tracks cultivation as it reshapes the roadmaps in real time.',
        takeaway: 'Resource estimates are checkable arithmetic — check them.',
      },
    ],
    proLinks: [
      { label: 'Magic states on the map', to: '/map?topic=magic-states-distillation', external: false },
      { label: 'Cultivation (frontier)', to: '/map?topic=magic-state-cultivation', external: false },
      { label: 'Bravyi–Haah overhead paper', to: '/papers#1209.0510', external: false },
      { label: 'Catalyzed CCZ factories', to: '/papers#1812.01238', external: false },
      { label: 'Field Today: the bottleneck', to: '/field-today', external: false },
    ],
  },
];

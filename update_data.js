const fs = require('fs');

// 1. Update knowledge_tree.json
const ktPath = 'app/src/data/knowledge_tree.json';
const ktData = JSON.parse(fs.readFileSync(ktPath, 'utf8'));

ktData.push({
  "id": "qldpc-codes",
  "name": "qLDPC & Bivariate Bicycle Codes",
  "tier": 4,
  "short": "Quantum Low-Density Parity-Check codes generalize surface codes, offering better encoding rates. Bivariate Bicycle codes are a prominent recent family.",
  "detail": "While surface codes require physical qubits to scale quadratically with distance (yielding a vanishing rate k/n), qLDPC codes allow constant or higher rates by using non-local connectivity. The Tanner graph of a qLDPC code has bounded degree, meaning each qubit participates in a small number of checks. Bivariate Bicycle codes, a specific construction of qLDPC codes, have recently shown high performance and have been proposed for near-term implementation on architectures with suitable long-range connectivity, bridging the gap between hardware constraints and the asymptotic benefits of qLDPC.",
  "key_points": [
    "qLDPC codes generalize surface codes with bounded-weight checks but non-local connectivity",
    "They can achieve constant encoding rates (k/n) as distance increases",
    "Tanner graphs visualize the connections between data qubits and parity checks",
    "Bivariate Bicycle codes are a high-performance family of qLDPC codes recently proposed for hardware"
  ],
  "depends_on": [
    "quantum-codes-basics",
    "classical-error-correction"
  ],
  "resources": [
    "Bravyi et al., 'High-threshold and low-overhead fault-tolerant quantum memory', arXiv:2308.07915"
  ]
});

fs.writeFileSync(ktPath, JSON.stringify(ktData, null, 2) + '\n');

// 2. Update glossary.ts
const glPath = 'app/src/data/glossary.ts';
let glData = fs.readFileSync(glPath, 'utf8');

const newTerms = `  {
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
];`;

glData = glData.replace('];\n', newTerms + '\n');
fs.writeFileSync(glPath, glData);
console.log('done');

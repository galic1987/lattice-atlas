const fs = require('fs');

// 1. Add to papers.json
const papersPath = 'src/data/papers.json';
const papersData = JSON.parse(fs.readFileSync(papersPath, 'utf8'));

papersData.push({
  "id": "2308.07915",
  "arxiv_id": "2308.07915",
  "title": "High-threshold and low-overhead fault-tolerant quantum memory",
  "authors": ["Sergey Bravyi", "Andrew W. Cross", "Jay M. Gambetta", "Dmitri Maslov", "Patrick Rall", "Theodore J. Yoder"],
  "date": "2023-08-15",
  "summary": "Introduces Bivariate Bicycle codes, a family of qLDPC codes with excellent performance and parameters suitable for near-term architectures.",
  "significance": "Demonstrated that qLDPC codes are not just asymptotic oddities but can be practically competitive with surface codes on realistic architectures.",
  "related_topics": ["qldpc-codes", "quantum-codes-basics", "classical-error-correction"],
  "prompts": [
    {
      "trigger": "Why are Bivariate Bicycle codes interesting?",
      "response": "They offer lower overhead than surface codes while maintaining properties that map well to proposed hardware."
    }
  ]
});

fs.writeFileSync(papersPath, JSON.stringify(papersData, null, 2) + '\n');

// 2. Add to topic_questions.json
const questionsPath = 'src/data/topic_questions.json';
const qData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

qData["qldpc-codes"] = [
  {
    "question": "What is the primary advantage of qLDPC codes over surface codes?",
    "options": [
      "They only require linear nearest-neighbor connectivity.",
      "They achieve a higher encoding rate (k/n) as distance increases.",
      "They do not require syndrome extraction.",
      "They can be decoded in polynomial time."
    ],
    "correct": 1,
    "explanation": "Surface codes have a vanishing rate (k/n) because n scales with d^2 for a single logical qubit, whereas qLDPC codes can maintain a constant or better rate due to their non-local connections."
  }
];

fs.writeFileSync(questionsPath, JSON.stringify(qData, null, 2) + '\n');

// 3. Add to topic_insights.json
const insightsPath = 'src/data/topic_insights.json';
const insightsData = JSON.parse(fs.readFileSync(insightsPath, 'utf8'));

insightsData["qldpc-codes"] = {
  "insight": "By trading local geometric constraints for sparse but non-local connections, qLDPC codes break the overhead barriers of 2D surface codes.",
  "intuitions": [
    "Just as classical LDPC codes dominate modern communications, their quantum counterparts offer vast efficiency gains.",
    "Bivariate Bicycle codes are a specific family constructed from polynomials."
  ],
  "misconceptions": [
    {
      "wrong": "qLDPC codes require all-to-all connectivity.",
      "reality": "They require specific non-local connections, but the Tanner graph remains sparse (bounded degree)."
    }
  ]
};

fs.writeFileSync(insightsPath, JSON.stringify(insightsData, null, 2) + '\n');
console.log('done');

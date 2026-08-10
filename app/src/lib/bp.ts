/**
 * A real min-sum belief-propagation decoder over a binary parity-check (Tanner)
 * graph — genuine LLR message passing, not a placeholder round counter.
 *
 * Given the check supports, a syndrome, and a per-qubit prior error probability,
 * it passes messages between qubit (variable) nodes and check nodes for up to
 * `maxIterations`, hard-decides each qubit's marginal, and reports whether the
 * estimated error reproduces the syndrome (H·ê = s). Suitable for the small
 * qLDPC examples in the Tanner-graph studio; exact/optimal decoding of a general
 * qLDPC code additionally needs OSD post-processing (noted honestly in the UI).
 */

export interface BpResult {
  estimate: number[]; // 0/1 per qubit — the estimated (Z-type) error pattern
  marginals: number[]; // posterior LLR per qubit (>0 favours no error)
  matched: boolean; // does H·estimate == syndrome? (a valid correction found)
  iterations: number; // iterations actually run
  converged: boolean; // matched before hitting the iteration cap
}

export function bpMinSumDecode(
  checks: number[][], // checks[c] = qubit indices in check c
  n: number,
  syndrome: number[], // syndrome[c] ∈ {0,1}
  p: number, // prior per-qubit error probability
  maxIterations: number,
): BpResult {
  const clampP = Math.min(0.49, Math.max(1e-3, p));
  const L0 = Math.log((1 - clampP) / clampP); // prior LLR (positive ⇒ no error)

  // qubit → checks it belongs to
  const qChecks: number[][] = Array.from({ length: n }, () => []);
  checks.forEach((qs, c) => qs.forEach((q) => qChecks[q].push(c)));

  // messages, keyed "c,q"
  const mqc = new Map<string, number>(); // qubit → check
  const mcq = new Map<string, number>(); // check → qubit
  checks.forEach((qs, c) =>
    qs.forEach((q) => {
      mqc.set(`${c},${q}`, L0);
      mcq.set(`${c},${q}`, 0);
    }),
  );

  const estimate = new Array<number>(n).fill(0);
  let iterations = 0;
  let matched = checks.every((qs, c) => qs.reduce((a, q) => a ^ estimate[q], 0) === syndrome[c]);

  for (let it = 0; it < maxIterations && !matched; it++) {
    iterations = it + 1;

    // check → qubit (min-sum)
    checks.forEach((qs, c) => {
      qs.forEach((q) => {
        let sign = syndrome[c] === 1 ? -1 : 1;
        let mag = Infinity;
        qs.forEach((q2) => {
          if (q2 === q) return;
          const v = mqc.get(`${c},${q2}`) ?? L0;
          if (v < 0) sign = -sign;
          mag = Math.min(mag, Math.abs(v));
        });
        mcq.set(`${c},${q}`, sign * (mag === Infinity ? L0 : mag));
      });
    });

    // qubit → check, plus marginal + hard decision
    for (let q = 0; q < n; q++) {
      let total = L0;
      qChecks[q].forEach((c) => {
        total += mcq.get(`${c},${q}`) ?? 0;
      });
      estimate[q] = total < 0 ? 1 : 0;
      qChecks[q].forEach((c) => {
        mqc.set(`${c},${q}`, total - (mcq.get(`${c},${q}`) ?? 0));
      });
    }

    matched = checks.every((qs, c) => qs.reduce((a, q) => a ^ estimate[q], 0) === syndrome[c]);
  }

  const marginals = new Array<number>(n).fill(L0);
  for (let q = 0; q < n; q++) {
    let total = L0;
    qChecks[q].forEach((c) => {
      total += mcq.get(`${c},${q}`) ?? 0;
    });
    marginals[q] = total;
  }

  return { estimate, marginals, matched, iterations, converged: matched };
}

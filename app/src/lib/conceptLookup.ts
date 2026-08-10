import { resolveTopic } from '@/data';
import { matchGlossaryTerm } from '@/data/glossary';

/**
 * The suggested questions shown in the Concept Lookup drawer. Every one of these
 * MUST resolve to a real answer (matched === true) — scripts/check-lookup.mjs
 * asserts exactly that, so a suggestion can never ship that the panel then can't
 * answer (the failure the E2E audit caught).
 */
export const CONCEPT_LOOKUP_PROMPTS = [
  'What is Topological Quantum Error Correction in 1 sentence?',
  'Why does a distance-5 surface code need 49 physical qubits?',
  'What is Minimum Weight Perfect Matching (MWPM) decoding?',
  'What is Google Willow’s Λ = 2.14 error suppression factor?',
] as const;

export interface ConceptLookupResult {
  /** The reference answer, or an honest "not found" message. */
  text: string;
  /** Topic to deep-link into, when the match came from a topic entry. */
  topicId?: string;
  /** False only when nothing matched and `text` is the honest fallback. */
  matched: boolean;
}

/**
 * Deterministic concept lookup over the atlas's own topic and glossary data,
 * then a small set of curated, fact-checked reference answers. Never fabricates:
 * if nothing matches it returns matched=false with an honest "not found" message.
 */
export function resolveConceptLookup(query: string): ConceptLookupResult {
  const qLower = query.toLowerCase();
  const topicMatch = resolveTopic(query);
  const termMatch = matchGlossaryTerm(query);

  if (topicMatch) {
    return {
      text: `${topicMatch.name} (Tier ${topicMatch.tier}): ${topicMatch.short}\n\n${topicMatch.detail.slice(0, 220)}…`,
      topicId: topicMatch.id,
      matched: true,
    };
  }
  if (termMatch) {
    return { text: `${termMatch.term}: ${termMatch.short}`, matched: true };
  }
  if (qLower.includes('topological quantum error correction') || qLower.includes('tqec')) {
    return {
      text: 'Topological Quantum Error Correction encodes each logical qubit into global, topological features of a 2D lattice of many physical qubits, so that only large, coordinated errors spanning the whole code can corrupt the information while local noise is caught and undone by repeatedly measuring stabilizers.',
      matched: true,
    };
  }
  if (qLower.includes('willow') || qLower.includes('lambda')) {
    return {
      text: 'Google Willow (Nature 638, 2024) reported a suppression factor Λ = 2.14 > 1 below threshold (p ≈ 0.3%): the logical error rate falls as the code distance grows from d=3 to d=5 to d=7.',
      matched: true,
    };
  }
  if (qLower.includes('mwpm') || qLower.includes('matching')) {
    return {
      text: 'Minimum-Weight Perfect Matching pairs detection events (checks that flipped to −1) on the syndrome graph with minimum total edge weight — classically via Edmonds’ Blossom algorithm (1965).',
      matched: true,
    };
  }
  if (qLower.includes('qubit') || qLower.includes('49')) {
    return {
      text: 'A distance-d rotated surface code uses N = d² + (d²−1) = 2d²−1 physical qubits — d² data qubits plus d²−1 syndrome ancillas. For d=5 that is 25 + 24 = 49.',
      matched: true,
    };
  }
  return {
    text: 'I don’t have a reference entry matching that phrasing. This panel only looks up the atlas’s own topics and glossary terms — it doesn’t generate answers — so try one of the suggested questions below, or browse the Glossary and Knowledge Map from the top nav.',
    matched: false,
  };
}

/**
 * Maps knowledge-tree topic ids to decorative concept clips (app/public/clips).
 * Multiple clips per topic render as a scroll row in the topic drawer.
 * Clips are validated offline (tools/README.md); names are basenames without
 * extension.
 */
export const TOPIC_CLIPS: Record<string, string[]> = {
  'quantum-mechanics-basics': [
    'concept-superposition',
    'concept-measurement-collapse',
    'concept-entanglement',
  ],
  'quantum-gates-circuits': ['concept-gate-pulses'],
  'classical-error-correction': ['concept-redundancy-restore'],
  'fault-tolerance-thresholds': ['concept-decoherence', 'concept-threshold-seawall'],
  'topological-order-anyons': ['metaphor-topology-deformation-v2', 'anyon-braiding-flow'],
  'toric-code': ['concept-toric-loops-v3'],
  'surface-code': ['metaphor-snag-fabric-v2'],
  'syndrome-extraction-circuits': ['metaphor-watchers-box'],
  'defects-braiding': ['metaphor-persistent-braid', 'concept-defect-holes'],
  'lattice-surgery': ['concept-merge-split-patches-v2'],
  'magic-states-distillation': ['metaphor-refining-gems'],
};

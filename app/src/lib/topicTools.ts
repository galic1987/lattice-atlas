/**
 * Curriculum ↔ workbench wiring: which interactive tool (if any) lets a
 * learner practice each knowledge-tree topic, and what to do there.
 * Rendered as "// TRY IT IN THE LAB" chips in the topic drawers.
 * `taskId` marks tasks whose completion is recorded as `lab-task` evidence.
 * Validated by scripts/check-tools.mjs (tool ids must exist in WORKBENCH_TOOLS).
 */
export interface TopicToolLink {
  /** Workbench ToolTab id (LabWorkbenchHub). */
  tool: string;
  /** Short chip label. */
  label: string;
  /** One-line task hint, plain English. */
  task: string;
  /** Present when completion records lab-task evidence. */
  taskId?: string;
}

export const TOPIC_TOOLS: Record<string, TopicToolLink[]> = {
  'classical-error-correction': [
    { tool: 'code-zoo', label: 'Code Zoo', task: 'Correct a Hamming(7,4) error by hand.' },
  ],
  'quantum-codes-basics': [
    {
      tool: 'code-zoo',
      label: 'Quantum Code Labs',
      task: 'Fix one Pauli error in each of the three quantum labs.',
      taskId: 'correct-single-pauli',
    },
  ],
  'toric-code': [
    { tool: 'surface-3d', label: 'Surface 3D', task: 'Rotate the patch and find the two logical loops.' },
  ],
  'surface-code': [
    { tool: 'surface-3d', label: 'Surface 3D', task: 'Inject an error and read the syndrome.' },
  ],
  'syndrome-extraction-circuits': [
    { tool: 'pipeline-walkthrough', label: 'Pipeline', task: 'Step through one full measurement round.' },
  ],
  'decoding-mwpm': [
    { tool: 'stim-threshold', label: 'Threshold Sandbox', task: 'Run a sweep and find the crossing.' },
  ],
  'lattice-surgery': [
    { tool: 'surgery-welder', label: 'Surgery Welder', task: 'Weld two patches and preview the parity measurement.' },
  ],
  'magic-states-distillation': [
    { tool: 't-distillation', label: 'T Factory', task: 'Run one 15-to-1 distillation round.' },
  ],
  'flag-fault-tolerance': [
    { tool: 'visual-experiments', label: 'Fault Emitter', task: 'Fire a flag qubit and watch it catch a hook error.' },
  ],
  'zx-calculus-basics': [
    { tool: 'pipeline-walkthrough', label: 'Pipeline', task: 'Follow a ZX diagram into lattice surgery.' },
  ],
};

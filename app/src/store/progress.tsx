import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { papers, topics } from '@/data';
import {
  appendEvidence,
  createEvidence,
  defaultDepthForLens,
  exportLearningRecord as serializeLearningRecord,
  lensForDepth,
  loadLearningRecord,
  mergeLearningRecords,
  normalizeDisplayName,
  parseLearningRecordImport,
  saveLearningRecord,
  type EvidenceInput,
  type EvidenceKind,
  type ExplanationDepth,
  type LearningEvidence,
  type LearningRecord,
  type LensMode,
  type RecordIoResult,
  type ReviewScheduleEntry,
  type StorageStatus,
  type TopicCheckEvidence,
  TOPIC_CHECK_TOTAL,
} from '@/lib/learningRecord';

export type {
  EvidenceInput,
  EvidenceKind,
  ExplanationDepth,
  LearningEvidence,
  LearningRecord,
  LensMode,
  RecordIoResult,
  ReviewScheduleEntry,
  StorageStatus,
  TopicCheckEvidence,
} from '@/lib/learningRecord';

export interface ProgressContextValue {
  /** Legacy alias: whether a topic is self-marked as explored. */
  isUnderstood: (id: string) => boolean;
  /** Legacy alias: toggle a topic's self-marked explored state. */
  toggleUnderstood: (id: string) => void;
  isExplored: (id: string) => boolean;
  toggleExplored: (id: string) => void;
  isRead: (arxivId: string) => boolean;
  toggleRead: (arxivId: string) => void;
  understoodCount: number;
  exploredCount: number;
  topicCheck: (id: string) => TopicCheckEvidence | undefined;
  recordTopicCheck: (id: string, correct: number, total: number) => void;
  checkedCount: number;
  readCount: number;
  /** Clear topic exploration/checks while preserving the learner profile and other evidence. */
  resetProgress: () => void;

  /** Canonical five-level explanation preference used across the Atlas. */
  explanationDepth: ExplanationDepth;
  setExplanationDepth: (depth: ExplanationDepth) => void;
  /** Two-state compatibility view derived from explanationDepth. */
  lensMode: LensMode;
  setLensMode: (mode: LensMode) => void;
  toggleLensMode: () => void;

  displayName: string;
  setDisplayName: (name: string) => void;
  learningRecord: Readonly<LearningRecord>;
  evidence: readonly LearningEvidence[];
  evidenceFor: <Kind extends EvidenceKind>(kind: Kind) => Array<Extract<LearningEvidence, { kind: Kind }>>;
  /** Append one validated, timestamped, local-unsigned evidence event. */
  recordEvidence: (input: EvidenceInput) => RecordIoResult;
  /** Remove local evidence of one kind (used by explicit practice resets). */
  clearEvidence: (kind: EvidenceKind) => void;
  /** Safe portable JSON. It contains no server signature and remains local/unsigned. */
  exportLearningRecord: () => string;
  /** Validate and merge a portable record without deleting current activity. */
  importLearningRecord: (json: string) => RecordIoResult;
  storageStatus: StorageStatus;
  reviewSchedule: Readonly<Record<string, ReviewScheduleEntry>>;
  setReviewScheduleEntry: (termSlug: string, entry: ReviewScheduleEntry) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);
const VALID_TOPIC_IDS = new Set(topics.map((topic) => topic.id));
const VALID_PAPER_IDS = new Set(papers.map((paper) => paper.arxiv_id));

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadLearningRecord);
  const [record, setRecord] = useState<LearningRecord>(initial.record);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(initial.storageStatus);
  const [persistenceLocked, setPersistenceLocked] = useState(initial.persistenceLocked);

  useEffect(() => {
    if (persistenceLocked) return undefined;
    let active = true;
    const result = saveLearningRecord(record);
    const next: StorageStatus = result.ok
      ? { state: 'saved', message: result.message }
      : { state: 'memory-only', message: result.message };
    queueMicrotask(() => {
      if (!active) return;
      setStorageStatus((previous) =>
        previous.state === next.state && previous.message === next.message ? previous : next,
      );
    });
    return () => {
      active = false;
    };
  }, [persistenceLocked, record]);

  // Synchronize the versioned record across tabs without trusting its shape.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'lattice-atlas-progress' && event.key !== null) return;
      const loaded = loadLearningRecord();
      setRecord(loaded.record);
      setStorageStatus(loaded.storageStatus);
      setPersistenceLocked(loaded.persistenceLocked);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleUnderstood = useCallback((id: string) => {
    if (!VALID_TOPIC_IDS.has(id)) return;
    setRecord((previous) => {
      if (!previous.activity.exploredTopics.includes(id)) {
        return {
          ...previous,
          updatedAt: new Date().toISOString(),
          activity: { ...previous.activity, exploredTopics: [...previous.activity.exploredTopics, id] },
        };
      }
      return {
        ...previous,
        updatedAt: new Date().toISOString(),
        activity: { ...previous.activity, exploredTopics: previous.activity.exploredTopics.filter((topicId) => topicId !== id) },
      };
    });
  }, []);

  const toggleRead = useCallback((arxivId: string) => {
    if (!VALID_PAPER_IDS.has(arxivId)) return;
    setRecord((previous) => {
      const papersRead = previous.activity.papersRead.includes(arxivId)
        ? previous.activity.papersRead.filter((id) => id !== arxivId)
        : [...previous.activity.papersRead, arxivId];
      return {
        ...previous,
        updatedAt: new Date().toISOString(),
        activity: { ...previous.activity, papersRead },
      };
    });
  }, []);

  const recordEvidence = useCallback((input: EvidenceInput): RecordIoResult => {
    const entry = createEvidence(input);
    if (!entry) return { ok: false, message: 'Evidence was not recorded because its fields were invalid.' };
    setRecord((previous) => appendEvidence(previous, entry));
    return { ok: true, message: 'Local unsigned evidence recorded.' };
  }, []);

  const recordTopicCheck = useCallback((id: string, correct: number, total: number) => {
    if (!VALID_TOPIC_IDS.has(id) || total !== TOPIC_CHECK_TOTAL) return;
    const boundedCorrect = Math.max(0, Math.min(Math.round(correct), total));
    setRecord((previous) => {
      const prior = previous.topicChecks[id];
      const attempt = (prior?.attempts ?? 0) + 1;
      const useNewResult = !prior || boundedCorrect / total >= prior.correct / prior.total;
      const entry = createEvidence({ kind: 'topic-check', topicId: id, correct: boundedCorrect, total, attempt });
      const next: LearningRecord = {
        ...previous,
        updatedAt: new Date().toISOString(),
        topicChecks: {
          ...previous.topicChecks,
          [id]: {
            correct: useNewResult ? boundedCorrect : prior.correct,
            total: useNewResult ? total : prior.total,
            attempts: attempt,
            checkedAt: new Date().toISOString(),
          },
        },
      };
      return entry ? appendEvidence(next, entry) : next;
    });
  }, []);

  const setExplanationDepth = useCallback((depth: ExplanationDepth) => {
    setRecord((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      profile: { ...previous.profile, explanationDepth: depth },
    }));
  }, []);

  const setLensMode = useCallback((mode: LensMode) => {
    setRecord((previous) => {
      if (lensForDepth(previous.profile.explanationDepth) === mode) return previous;
      return {
        ...previous,
        updatedAt: new Date().toISOString(),
        profile: { ...previous.profile, explanationDepth: defaultDepthForLens(mode) },
      };
    });
  }, []);

  const toggleLensMode = useCallback(() => {
    setRecord((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      profile: {
        ...previous.profile,
        explanationDepth: defaultDepthForLens(lensForDepth(previous.profile.explanationDepth) === 'rigor' ? 'intuition' : 'rigor'),
      },
    }));
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setRecord((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      profile: { ...previous.profile, displayName: normalizeDisplayName(name) },
    }));
  }, []);

  const clearEvidence = useCallback((kind: EvidenceKind) => {
    setRecord((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      evidence: previous.evidence.filter((entry) => entry.kind !== kind),
    }));
  }, []);

  const setReviewScheduleEntry = useCallback((termSlug: string, entry: ReviewScheduleEntry) => {
    setRecord((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      reviewSchedule: { ...previous.reviewSchedule, [termSlug]: entry },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setRecord((previous) => ({
      ...previous,
      updatedAt: new Date().toISOString(),
      activity: { ...previous.activity, exploredTopics: [] },
      topicChecks: {},
      evidence: previous.evidence.filter((entry) => entry.kind !== 'topic-check'),
    }));
  }, []);

  const exportRecord = useCallback(() => serializeLearningRecord(record), [record]);

  const importRecord = useCallback((json: string): RecordIoResult => {
    const parsed = parseLearningRecordImport(json);
    if (!parsed.record) return parsed.result;
    const currentById = new Map(record.evidence.map((entry) => [entry.id, JSON.stringify(entry)]));
    const conflicts = parsed.record.evidence.filter((entry) => {
      const existing = currentById.get(entry.id);
      return existing !== undefined && existing !== JSON.stringify(entry);
    }).length;
    setRecord((previous) => mergeLearningRecords(previous, parsed.record as LearningRecord));
    return {
      ok: true,
      message: `${parsed.result.message} Merged without deleting this browser's record.${conflicts > 0 ? ` Kept ${conflicts} current event${conflicts === 1 ? '' : 's'} whose imported ids conflicted.` : ''}`,
    };
  }, [record.evidence]);

  const checkedCount = Object.values(record.topicChecks).filter((check) => check.correct === check.total).length;

  const value = useMemo<ProgressContextValue>(() => ({
    isUnderstood: (id) => record.activity.exploredTopics.includes(id),
    toggleUnderstood,
    isExplored: (id) => record.activity.exploredTopics.includes(id),
    toggleExplored: toggleUnderstood,
    isRead: (arxivId) => record.activity.papersRead.includes(arxivId),
    toggleRead,
    understoodCount: record.activity.exploredTopics.length,
    exploredCount: record.activity.exploredTopics.length,
    topicCheck: (id) => record.topicChecks[id],
    recordTopicCheck,
    checkedCount,
    readCount: record.activity.papersRead.length,
    resetProgress,
    explanationDepth: record.profile.explanationDepth,
    setExplanationDepth,
    lensMode: lensForDepth(record.profile.explanationDepth),
    setLensMode,
    toggleLensMode,
    displayName: record.profile.displayName,
    setDisplayName,
    learningRecord: record,
    evidence: record.evidence,
    evidenceFor: <Kind extends EvidenceKind>(kind: Kind) => record.evidence.filter(
      (entry): entry is Extract<LearningEvidence, { kind: Kind }> => entry.kind === kind,
    ),
    recordEvidence,
    clearEvidence,
    exportLearningRecord: exportRecord,
    importLearningRecord: importRecord,
    storageStatus,
    reviewSchedule: record.reviewSchedule,
    setReviewScheduleEntry,
  }), [
    record,
    toggleUnderstood,
    toggleRead,
    recordTopicCheck,
    checkedCount,
    resetProgress,
    setExplanationDepth,
    setLensMode,
    toggleLensMode,
    setDisplayName,
    recordEvidence,
    clearEvidence,
    exportRecord,
    importRecord,
    storageStatus,
    setReviewScheduleEntry,
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook must live beside its provider
export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
}

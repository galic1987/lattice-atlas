import { papers, topics } from '@/data';
import { TERMS } from '@/data/glossary';
import {
  DAILY_MAX_SCORE,
  DAILY_PLAN,
  DUEL_MANIFEST_ID,
  DUEL_SCHEMA_VERSION,
  parseDailyPuzzleId,
} from '@/lib/duel';

export const LEARNING_RECORD_SCHEMA_VERSION = 1 as const;
export const LEARNING_RECORD_FORMAT = 'lattice-atlas-learning-record' as const;
export const LEARNING_RECORD_STORAGE_KEY = 'lattice-atlas-progress';

const LEGACY_FOUNDATIONS_KEY = 'lattice-atlas-waves-to-qubits-practice-v1';
const LEGACY_REVIEW_KEY = 'lattice-atlas-review';
const LEGACY_DUEL_KEY = 'lattice-atlas-duel';
const LEGACY_NAME_KEY = 'lattice-atlas-name';
const LEGACY_SCORE_NAME_KEY = 'lattice-atlas-user-name';
const LEGACY_MIGRATION = 'legacy-browser-records-v1';
const MAX_IMPORT_BYTES = 1_000_000;
const MAX_EVIDENCE_ENTRIES = 2_500;

export const FOUNDATION_STAGE_ANSWERS = Object.freeze({
  'bit-amplitude': 1,
  interference: 2,
  'ket-born': 1,
  phase: 3,
  'two-qubit': 2,
} as const);
export const FOUNDATION_STAGE_IDS = Object.freeze(Object.keys(FOUNDATION_STAGE_ANSWERS));
export const ALTITUDE_CONCEPT_IDS = Object.freeze([
  'error-correction',
  'superposition',
  'topology',
  'decoding',
  'magic-states',
] as const);
export const SURFACE_CODE_CAPSTONE_ID = 'surface-code-synthesis-v1' as const;
export const TOPIC_CHECK_TOTAL = 2 as const;

export type ExplanationDepth = 'story' | 'cause' | 'model' | 'formal' | 'verify';
export type LensMode = 'intuition' | 'rigor';
export type ReviewRating = 'again' | 'good' | 'easy';

export interface TopicCheckEvidence {
  correct: number;
  total: number;
  attempts: number;
  checkedAt: string;
}

export interface ReviewScheduleEntry {
  due: string;
  interval: number;
  attempts: number;
  recalled: number;
}

interface EvidenceBase {
  id: string;
  recordedAt: string;
  verification: 'local-unsigned';
}

export interface FoundationPredictionEvidence extends EvidenceBase {
  kind: 'foundation-prediction';
  stageId: string;
  selected: number;
  correct: boolean;
}

export interface ReviewRecallEvidence extends EvidenceBase {
  kind: 'review-recall';
  termSlug: string;
  rating: ReviewRating;
  responseProvided: boolean;
  /** An imported legacy aggregate may represent more than one attempt. */
  attempts: number;
  /** Exact recalled count when a legacy aggregate contains mixed outcomes. */
  successfulAttempts?: number;
}

export interface DuelResultEvidence extends EvidenceBase {
  kind: 'duel-result';
  mode: 'daily' | 'practice';
  puzzleId: string;
  score: number;
  maxScore: number;
  rounds: number;
  manifestId?: string;
  schemaVersion?: number;
  compatible?: boolean;
}

export interface CapstoneEvidence extends EvidenceBase {
  kind: 'capstone';
  capstoneId: string;
  correct: number;
  total: number;
  passed: boolean;
}

export interface AltitudeStudyEvidence extends EvidenceBase {
  kind: 'altitude-study';
  conceptId: string;
  depth: ExplanationDepth;
  activity: 'studied' | 'teachback';
  selfRating?: ReviewRating;
}

export interface TopicCheckLedgerEvidence extends EvidenceBase {
  kind: 'topic-check';
  topicId: string;
  correct: number;
  total: number;
  attempt: number;
}

export interface LabTaskEvidence extends EvidenceBase {
  kind: 'lab-task';
  topicId: string;
  toolId: string;
  taskId: string;
  completed: boolean;
}

export type LearningEvidence =
  | FoundationPredictionEvidence
  | ReviewRecallEvidence
  | DuelResultEvidence
  | CapstoneEvidence
  | AltitudeStudyEvidence
  | TopicCheckLedgerEvidence
  | LabTaskEvidence;

export type EvidenceKind = LearningEvidence['kind'];
export type EvidenceInput = LearningEvidence extends infer Entry
  ? Entry extends LearningEvidence
    ? Omit<Entry, keyof EvidenceBase>
    : never
  : never;

export interface LearningRecord {
  format: typeof LEARNING_RECORD_FORMAT;
  schemaVersion: typeof LEARNING_RECORD_SCHEMA_VERSION;
  updatedAt: string;
  migrations: string[];
  profile: {
    displayName: string;
    explanationDepth: ExplanationDepth;
  };
  activity: {
    exploredTopics: string[];
    papersRead: string[];
  };
  topicChecks: Record<string, TopicCheckEvidence>;
  reviewSchedule: Record<string, ReviewScheduleEntry>;
  evidence: LearningEvidence[];
}

export interface RecordIoResult {
  ok: boolean;
  message: string;
}

export type StorageStatus =
  | { state: 'saved'; message: string }
  | { state: 'memory-only'; message: string };

const VALID_TOPIC_IDS = new Set(topics.map((topic) => topic.id));
const VALID_PAPER_IDS = new Set(papers.map((paper) => paper.arxiv_id));
const VALID_TERM_SLUGS = new Set(TERMS.map((term) => term.slug));
const VALID_FOUNDATION_STAGE_IDS = new Set<string>(FOUNDATION_STAGE_IDS);
const VALID_ALTITUDE_CONCEPT_IDS = new Set<string>(ALTITUDE_CONCEPT_IDS);
const VALID_CAPSTONE_IDS = new Set<string>([SURFACE_CODE_CAPSTONE_ID]);
const DEPTHS = new Set<ExplanationDepth>(['story', 'cause', 'model', 'formal', 'verify']);
const RATINGS = new Set<ReviewRating>(['again', 'good', 'easy']);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanString = (value: unknown, maxLength = 160): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const clean = value.trim();
  return clean.length > 0 && clean.length <= maxLength ? clean : undefined;
};

export function normalizeDisplayName(value: string): string {
  return value.replace(/\p{Cc}/gu, ' ').replace(/ {2,}/g, ' ').trimStart().slice(0, 48);
}

const cleanIso = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.length > 40 || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
};

const cleanInteger = (value: unknown, minimum: number, maximum: number): number | undefined => {
  if (!Number.isInteger(value)) return undefined;
  const number = Number(value);
  return number >= minimum && number <= maximum ? number : undefined;
};

const cleanIds = (value: unknown, valid: ReadonlySet<string>): string[] => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && valid.has(item)))];
};

function cleanTopicChecks(value: unknown): Record<string, TopicCheckEvidence> {
  if (!isObject(value)) return {};
  const clean: Record<string, TopicCheckEvidence> = {};
  for (const [id, candidate] of Object.entries(value)) {
    if (!VALID_TOPIC_IDS.has(id) || !isObject(candidate)) continue;
    const total = cleanInteger(candidate.total, 1, 1_000);
    const attempts = cleanInteger(candidate.attempts, 1, 1_000_000);
    if (total !== TOPIC_CHECK_TOTAL) continue;
    const correct = cleanInteger(candidate.correct, 0, total) ?? 0;
    clean[id] = {
      correct,
      total,
      attempts: attempts ?? 1,
      checkedAt: cleanIso(candidate.checkedAt) ?? '',
    };
  }
  return clean;
}

function cleanReviewSchedule(value: unknown): Record<string, ReviewScheduleEntry> {
  if (!isObject(value)) return {};
  const clean: Record<string, ReviewScheduleEntry> = {};
  for (const [slug, candidate] of Object.entries(value)) {
    if (!VALID_TERM_SLUGS.has(slug) || !isObject(candidate)) continue;
    const due = typeof candidate.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(candidate.due)
      && !Number.isNaN(Date.parse(`${candidate.due}T00:00:00Z`))
      ? candidate.due
      : undefined;
    const interval = cleanInteger(candidate.interval, 0, 36_500);
    const attempts = candidate.attempts === undefined ? 0 : cleanInteger(candidate.attempts, 0, 1_000_000);
    const recalled = attempts === undefined
      ? undefined
      : candidate.recalled === undefined ? 0 : cleanInteger(candidate.recalled, 0, attempts);
    if (!due || interval === undefined || attempts === undefined || recalled === undefined) continue;
    clean[slug] = { due, interval, attempts, recalled };
  }
  return clean;
}

function cleanEvidenceBase(value: Record<string, unknown>): EvidenceBase | undefined {
  const id = cleanString(value.id, 220);
  const recordedAt = cleanIso(value.recordedAt);
  if (!id || !recordedAt || value.verification !== 'local-unsigned') return undefined;
  return { id, recordedAt, verification: 'local-unsigned' };
}

export function sanitizeEvidence(value: unknown): LearningEvidence | undefined {
  if (!isObject(value)) return undefined;
  const base = cleanEvidenceBase(value);
  if (!base) return undefined;

  if (value.kind === 'foundation-prediction') {
    const stageId = cleanString(value.stageId);
    const selected = cleanInteger(value.selected, 0, 10);
    if (!stageId || !VALID_FOUNDATION_STAGE_IDS.has(stageId) || selected === undefined) return undefined;
    return {
      ...base,
      kind: value.kind,
      stageId,
      selected,
      correct: selected === FOUNDATION_STAGE_ANSWERS[stageId as keyof typeof FOUNDATION_STAGE_ANSWERS],
    };
  }
  if (value.kind === 'review-recall') {
    const termSlug = cleanString(value.termSlug);
    const attempts = cleanInteger(value.attempts, 1, 1_000_000);
    if (!termSlug || !VALID_TERM_SLUGS.has(termSlug) || !RATINGS.has(value.rating as ReviewRating) || typeof value.responseProvided !== 'boolean' || attempts === undefined) return undefined;
    const successfulAttempts = value.successfulAttempts === undefined
      ? undefined
      : cleanInteger(value.successfulAttempts, 0, attempts);
    if (value.successfulAttempts !== undefined && successfulAttempts === undefined) return undefined;
    return { ...base, kind: value.kind, termSlug, rating: value.rating as ReviewRating, responseProvided: value.responseProvided, attempts, successfulAttempts };
  }
  if (value.kind === 'duel-result') {
    const puzzleId = cleanString(value.puzzleId, 220);
    const score = cleanInteger(value.score, 0, 1_000_000);
    const maxScore = cleanInteger(value.maxScore, 1, 1_000_000);
    const rounds = cleanInteger(value.rounds, 0, 100_000);
    if (!puzzleId || (value.mode !== 'daily' && value.mode !== 'practice') || score === undefined || maxScore === undefined || score > maxScore || rounds === undefined) return undefined;
    const manifestId = value.manifestId === undefined ? undefined : cleanString(value.manifestId, 100);
    const schemaVersion = value.schemaVersion === undefined ? undefined : cleanInteger(value.schemaVersion, 0, 10_000);
    const compatible = value.mode === 'daily'
      ? value.compatible === true
        && schemaVersion === DUEL_SCHEMA_VERSION
        && manifestId === DUEL_MANIFEST_ID
        && parseDailyPuzzleId(puzzleId) !== null
        && rounds === DAILY_PLAN.length
        && maxScore === DAILY_MAX_SCORE
      : undefined;
    return { ...base, kind: value.kind, mode: value.mode, puzzleId, score, maxScore, rounds, manifestId, schemaVersion, compatible };
  }
  if (value.kind === 'capstone') {
    const capstoneId = cleanString(value.capstoneId);
    const total = cleanInteger(value.total, 1, 10_000);
    if (!capstoneId || !VALID_CAPSTONE_IDS.has(capstoneId) || total !== 4 || typeof value.passed !== 'boolean') return undefined;
    const correct = cleanInteger(value.correct, 0, total);
    if (correct === undefined) return undefined;
    return { ...base, kind: value.kind, capstoneId, correct, total, passed: value.passed && correct >= 3 };
  }
  if (value.kind === 'altitude-study') {
    const conceptId = cleanString(value.conceptId);
    if (!conceptId || !VALID_ALTITUDE_CONCEPT_IDS.has(conceptId) || !DEPTHS.has(value.depth as ExplanationDepth) || (value.activity !== 'studied' && value.activity !== 'teachback')) return undefined;
    const selfRating = value.selfRating === undefined
      ? undefined
      : RATINGS.has(value.selfRating as ReviewRating) ? value.selfRating as ReviewRating : undefined;
    if (value.selfRating !== undefined && selfRating === undefined) return undefined;
    return { ...base, kind: value.kind, conceptId, depth: value.depth as ExplanationDepth, activity: value.activity, selfRating };
  }
  if (value.kind === 'topic-check') {
    const topicId = cleanString(value.topicId);
    const total = cleanInteger(value.total, 1, 1_000);
    const attempt = cleanInteger(value.attempt, 1, 1_000_000);
    if (!topicId || !VALID_TOPIC_IDS.has(topicId) || total !== TOPIC_CHECK_TOTAL || attempt === undefined) return undefined;
    const correct = cleanInteger(value.correct, 0, total);
    if (correct === undefined) return undefined;
    return { ...base, kind: value.kind, topicId, correct, total, attempt };
  }
  if (value.kind === 'lab-task') {
    const topicId = cleanString(value.topicId);
    const toolId = cleanString(value.toolId);
    const taskId = cleanString(value.taskId);
    if (!topicId || !VALID_TOPIC_IDS.has(topicId) || !toolId || !taskId) return undefined;
    return { ...base, kind: value.kind, topicId, toolId, taskId, completed: value.completed === true };
  }
  return undefined;
}

function cleanEvidence(value: unknown): LearningEvidence[] {
  if (!Array.isArray(value)) return [];
  const byId = new Map<string, LearningEvidence>();
  for (const candidate of value.slice(-MAX_EVIDENCE_ENTRIES * 4)) {
    const entry = sanitizeEvidence(candidate);
    if (entry) byId.set(entry.id, entry);
  }
  const sorted = [...byId.values()].sort((left, right) => left.recordedAt.localeCompare(right.recordedAt));
  if (sorted.length <= MAX_EVIDENCE_ENTRIES) return sorted;

  // Keep the latest durable milestone per subject even after years of Review
  // events. The remaining capacity stays a chronological recent-event window.
  const pinned = new Map<string, LearningEvidence>();
  for (const entry of sorted) {
    if (entry.kind === 'foundation-prediction') pinned.set(`foundation:${entry.stageId}`, entry);
    else if (entry.kind === 'altitude-study') pinned.set(`altitude:${entry.conceptId}`, entry);
    else if (entry.kind === 'capstone') {
      const best = pinned.get(`capstone:${entry.capstoneId}:best`);
      if (
        !best
        || best.kind !== 'capstone'
        || entry.correct / entry.total >= best.correct / best.total
      ) {
        pinned.set(`capstone:${entry.capstoneId}:best`, entry);
      }
      if (entry.passed) pinned.set(`capstone:${entry.capstoneId}:passed`, entry);
    }
    else if (entry.kind === 'topic-check') pinned.set(`topic:${entry.topicId}`, entry);
    else if (entry.kind === 'lab-task' && entry.completed) pinned.set(`lab:${entry.topicId}:${entry.taskId}`, entry);
    else if (entry.kind === 'duel-result' && entry.mode === 'daily' && entry.compatible === true) pinned.set('duel:latest-compatible-daily', entry);
  }
  const pinnedIds = new Set([...pinned.values()].map((entry) => entry.id));
  const recent = sorted
    .filter((entry) => !pinnedIds.has(entry.id))
    .slice(-(MAX_EVIDENCE_ENTRIES - pinnedIds.size));
  const retained = new Map([...recent, ...pinned.values()].map((entry) => [entry.id, entry]));
  return [...retained.values()].sort((left, right) => left.recordedAt.localeCompare(right.recordedAt));
}

export function emptyLearningRecord(): LearningRecord {
  return {
    format: LEARNING_RECORD_FORMAT,
    schemaVersion: LEARNING_RECORD_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    migrations: [],
    profile: { displayName: '', explanationDepth: 'story' },
    activity: { exploredTopics: [], papersRead: [] },
    topicChecks: {},
    reviewSchedule: {},
    evidence: [],
  };
}

function explanationDepthFrom(value: unknown, legacyLens: unknown): ExplanationDepth {
  if (DEPTHS.has(value as ExplanationDepth)) return value as ExplanationDepth;
  return legacyLens === 'rigor' ? 'formal' : 'story';
}

export function sanitizeLearningRecord(value: unknown): LearningRecord | undefined {
  if (!isObject(value)) return undefined;

  // Current record.
  if (value.format === LEARNING_RECORD_FORMAT && value.schemaVersion === LEARNING_RECORD_SCHEMA_VERSION) {
    const profile = isObject(value.profile) ? value.profile : {};
    const activity = isObject(value.activity) ? value.activity : {};
    return {
      ...emptyLearningRecord(),
      updatedAt: cleanIso(value.updatedAt) ?? new Date().toISOString(),
      migrations: Array.isArray(value.migrations)
        ? [...new Set(value.migrations.map((item) => cleanString(item, 100)).filter((item): item is string => Boolean(item)))].slice(0, 30)
        : [],
      profile: {
        displayName: typeof profile.displayName === 'string' ? normalizeDisplayName(profile.displayName) : '',
        explanationDepth: explanationDepthFrom(profile.explanationDepth, undefined),
      },
      activity: {
        exploredTopics: cleanIds(activity.exploredTopics, VALID_TOPIC_IDS),
        papersRead: cleanIds(activity.papersRead, VALID_PAPER_IDS),
      },
      topicChecks: cleanTopicChecks(value.topicChecks),
      reviewSchedule: cleanReviewSchedule(value.reviewSchedule),
      evidence: cleanEvidence(value.evidence),
    };
  }

  // Pre-ledger progress records are accepted only for migration, never exported.
  if (Array.isArray(value.understood) && Array.isArray(value.papersRead)) {
    const migrated = emptyLearningRecord();
    migrated.profile.explanationDepth = explanationDepthFrom(undefined, value.lensMode);
    migrated.activity.exploredTopics = cleanIds(value.understood, VALID_TOPIC_IDS);
    migrated.activity.papersRead = cleanIds(value.papersRead, VALID_PAPER_IDS);
    migrated.topicChecks = cleanTopicChecks(value.topicChecks);
    return migrated;
  }
  return undefined;
}

function makeLegacyEvidenceId(kind: string, subject: string): string {
  return `legacy:${kind}:${subject}`.slice(0, 220);
}

function legacyEvidenceFromStorage(storage: Storage): LearningEvidence[] {
  const evidence: LearningEvidence[] = [];
  const now = new Date().toISOString();
  try {
    const parsed: unknown = JSON.parse(storage.getItem(LEGACY_FOUNDATIONS_KEY) ?? '{}');
    if (isObject(parsed)) {
      for (const [stageId, answer] of Object.entries(FOUNDATION_STAGE_ANSWERS)) {
        const candidate = parsed[stageId];
        if (!isObject(candidate) || candidate.submitted !== true) continue;
        const selected = cleanInteger(candidate.selected, 0, 100);
        if (selected === undefined) continue;
        evidence.push({ id: makeLegacyEvidenceId('foundation', stageId), recordedAt: now, verification: 'local-unsigned', kind: 'foundation-prediction', stageId, selected, correct: selected === answer });
      }
    }
  } catch { /* malformed legacy data is ignored */ }

  try {
    const parsed: unknown = JSON.parse(storage.getItem(LEGACY_REVIEW_KEY) ?? '{}');
    if (isObject(parsed)) {
      for (const [termSlug, candidate] of Object.entries(parsed)) {
        if (!isObject(candidate)) continue;
        const attempts = cleanInteger(candidate.attempts, 1, 1_000_000) ?? 1;
        const recalled = cleanInteger(candidate.recalled, 0, attempts) ?? 0;
        const interval = typeof candidate.interval === 'number' && Number.isFinite(candidate.interval) ? candidate.interval : 0;
        const rating: ReviewRating = recalled > 0 ? 'easy' : interval > 0 ? 'good' : 'again';
        evidence.push({ id: makeLegacyEvidenceId('review', termSlug), recordedAt: now, verification: 'local-unsigned', kind: 'review-recall', termSlug, rating, responseProvided: true, attempts, successfulAttempts: recalled });
      }
    }
  } catch { /* malformed legacy data is ignored */ }

  try {
    const parsed: unknown = JSON.parse(storage.getItem(LEGACY_DUEL_KEY) ?? '{}');
    if (isObject(parsed) && isObject(parsed.daily)) {
      for (const [puzzleId, candidate] of Object.entries(parsed.daily)) {
        if (!isObject(candidate)) continue;
        const score = cleanInteger(candidate.score, 0, 1_000_000);
        const outcomes = Array.isArray(candidate.outcomes) ? candidate.outcomes : [];
        if (score === undefined || outcomes.length === 0) continue;
        const manifestId = cleanString(candidate.manifestId, 100);
        const schemaVersion = cleanInteger(candidate.schemaVersion, 0, 10_000);
        const storedDay = cleanInteger(candidate.day, 0, 100_000);
        const puzzleDay = /^d(\d+)-/.exec(puzzleId)?.[1];
        const day = storedDay ?? (puzzleDay ? cleanInteger(Number(puzzleDay), 0, 100_000) : undefined);
        const recordedAt = day === undefined ? now : new Date(day * 86_400_000).toISOString();
        evidence.push({
          id: makeLegacyEvidenceId('duel', puzzleId), recordedAt, verification: 'local-unsigned', kind: 'duel-result', mode: 'daily', puzzleId, score,
          maxScore: outcomes.length * 15, rounds: outcomes.length, manifestId, schemaVersion, compatible: true,
        });
      }
    }
  } catch { /* malformed legacy data is ignored */ }
  return evidence;
}

function legacyReviewScheduleFromStorage(storage: Storage): Record<string, ReviewScheduleEntry> {
  try {
    return cleanReviewSchedule(JSON.parse(storage.getItem(LEGACY_REVIEW_KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function loadLearningRecord(): {
  record: LearningRecord;
  storageStatus: StorageStatus;
  persistenceLocked: boolean;
} {
  const fallback = emptyLearningRecord();
  if (typeof window === 'undefined') {
    return {
      record: fallback,
      storageStatus: { state: 'memory-only', message: 'Browser storage is unavailable; this session is not persisted.' },
      persistenceLocked: false,
    };
  }
  try {
    const raw = window.localStorage.getItem(LEARNING_RECORD_STORAGE_KEY);
    let parsed: unknown;
    try {
      parsed = raw ? JSON.parse(raw) : undefined;
    } catch {
      parsed = undefined;
    }
    if (
      isObject(parsed)
      && parsed.format === LEARNING_RECORD_FORMAT
      && typeof parsed.schemaVersion === 'number'
      && parsed.schemaVersion > LEARNING_RECORD_SCHEMA_VERSION
    ) {
      return {
        record: fallback,
        storageStatus: {
          state: 'memory-only',
          message: `A newer learning-record schema (${parsed.schemaVersion}) is stored here. This older tab is read-only so it cannot overwrite that record.`,
        },
        persistenceLocked: true,
      };
    }
    const record = sanitizeLearningRecord(parsed) ?? fallback;
    if (!record.migrations.includes(LEGACY_MIGRATION)) {
      const legacyName = normalizeDisplayName(window.localStorage.getItem(LEGACY_NAME_KEY) || window.localStorage.getItem(LEGACY_SCORE_NAME_KEY) || '');
      if (!record.profile.displayName) record.profile.displayName = legacyName;
      record.evidence = cleanEvidence([...record.evidence, ...legacyEvidenceFromStorage(window.localStorage)]);
      record.reviewSchedule = {
        ...legacyReviewScheduleFromStorage(window.localStorage),
        ...record.reviewSchedule,
      };
      record.migrations.push(LEGACY_MIGRATION);
    }
    return {
      record,
      storageStatus: { state: 'saved', message: 'Learning record is saved in this browser.' },
      persistenceLocked: false,
    };
  } catch {
    return {
      record: fallback,
      storageStatus: { state: 'memory-only', message: 'Browser storage is blocked or unreadable. Changes remain in memory for this tab only.' },
      persistenceLocked: false,
    };
  }
}

export function saveLearningRecord(record: LearningRecord): RecordIoResult {
  if (typeof window === 'undefined') return { ok: false, message: 'Browser storage is unavailable.' };
  try {
    window.localStorage.setItem(LEARNING_RECORD_STORAGE_KEY, JSON.stringify(record));
    return { ok: true, message: 'Learning record saved in this browser.' };
  } catch {
    return { ok: false, message: 'Browser storage failed. Changes remain in memory for this tab only.' };
  }
}

export function createEvidence(input: EvidenceInput): LearningEvidence | undefined {
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return sanitizeEvidence({
    ...input,
    id: `${input.kind}:${suffix}`,
    recordedAt: new Date().toISOString(),
    verification: 'local-unsigned',
  });
}

export function appendEvidence(record: LearningRecord, entry: LearningEvidence): LearningRecord {
  return {
    ...record,
    updatedAt: new Date().toISOString(),
    evidence: cleanEvidence([...record.evidence, entry]),
  };
}

export function exportLearningRecord(record: LearningRecord): string {
  return JSON.stringify({ ...record, exportedAt: new Date().toISOString() }, null, 2);
}

export function parseLearningRecordImport(text: string): { record?: LearningRecord; result: RecordIoResult } {
  if (new Blob([text]).size > MAX_IMPORT_BYTES) return { result: { ok: false, message: 'Import rejected: file is larger than 1 MB.' } };
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isObject(parsed) || parsed.format !== LEARNING_RECORD_FORMAT || parsed.schemaVersion !== LEARNING_RECORD_SCHEMA_VERSION) {
      return { result: { ok: false, message: `Import rejected: expected ${LEARNING_RECORD_FORMAT} schema ${LEARNING_RECORD_SCHEMA_VERSION}.` } };
    }
    const profile = parsed.profile;
    const activity = parsed.activity;
    const portableShape = cleanIso(parsed.updatedAt) !== undefined
      && Array.isArray(parsed.migrations)
      && isObject(profile)
      && typeof profile.displayName === 'string'
      && DEPTHS.has(profile.explanationDepth as ExplanationDepth)
      && isObject(activity)
      && Array.isArray(activity.exploredTopics)
      && Array.isArray(activity.papersRead)
      && isObject(parsed.topicChecks)
      && (parsed.reviewSchedule === undefined || isObject(parsed.reviewSchedule))
      && Array.isArray(parsed.evidence);
    if (!portableShape) {
      return { result: { ok: false, message: 'Import rejected: required profile, activity, schedule, or evidence fields are missing.' } };
    }
    const record = sanitizeLearningRecord(parsed);
    if (!record) return { result: { ok: false, message: 'Import rejected: record structure is invalid.' } };
    return { record, result: { ok: true, message: `Validated schema ${record.schemaVersion}: ${record.evidence.length} local evidence entries.` } };
  } catch {
    return { result: { ok: false, message: 'Import rejected: the file is not valid JSON.' } };
  }
}

export function mergeLearningRecords(current: LearningRecord, imported: LearningRecord): LearningRecord {
  const currentIsEmpty = current.profile.displayName === ''
    && current.profile.explanationDepth === 'story'
    && current.activity.exploredTopics.length === 0
    && current.activity.papersRead.length === 0
    && Object.keys(current.topicChecks).length === 0
    && Object.keys(current.reviewSchedule).length === 0
    && current.evidence.length === 0;
  const topicChecks: Record<string, TopicCheckEvidence> = { ...current.topicChecks };
  for (const [topicId, candidate] of Object.entries(imported.topicChecks)) {
    const existing = topicChecks[topicId];
    if (!existing) {
      topicChecks[topicId] = candidate;
      continue;
    }
    const candidateIsBetter = candidate.correct / candidate.total > existing.correct / existing.total;
    const best = candidateIsBetter ? candidate : existing;
    topicChecks[topicId] = {
      ...best,
      attempts: Math.max(existing.attempts, candidate.attempts),
      checkedAt: existing.checkedAt.localeCompare(candidate.checkedAt) >= 0 ? existing.checkedAt : candidate.checkedAt,
    };
  }
  return {
    ...current,
    updatedAt: new Date().toISOString(),
    migrations: [...new Set([...current.migrations, ...imported.migrations])],
    profile: currentIsEmpty ? imported.profile : current.profile,
    activity: {
      exploredTopics: [...new Set([...current.activity.exploredTopics, ...imported.activity.exploredTopics])],
      papersRead: [...new Set([...current.activity.papersRead, ...imported.activity.papersRead])],
    },
    topicChecks,
    reviewSchedule: { ...imported.reviewSchedule, ...current.reviewSchedule },
    // Current-browser events win if an imported file reuses an id with
    // different content. Import remains additive instead of rewriting history.
    evidence: cleanEvidence([...imported.evidence, ...current.evidence]),
  };
}

export function lensForDepth(depth: ExplanationDepth): LensMode {
  return depth === 'story' || depth === 'cause' ? 'intuition' : 'rigor';
}

export function defaultDepthForLens(mode: LensMode): ExplanationDepth {
  return mode === 'intuition' ? 'cause' : 'formal';
}

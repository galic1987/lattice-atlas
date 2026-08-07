import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * localStorage schema (design.md §8):
 * { understood: topicId[], papersRead: arxivId[] }
 */
const STORAGE_KEY = 'lattice-atlas-progress';

export type LensMode = 'intuition' | 'rigor';

interface PersistedProgress {
  understood: string[];
  papersRead: string[];
  lensMode?: LensMode;
}

export interface ProgressContextValue {
  /** Whether a topic id is marked as understood. */
  isUnderstood: (id: string) => boolean;
  /** Toggle a topic's understood state. */
  toggleUnderstood: (id: string) => void;
  /** Whether a paper (by arXiv id) is marked as read. */
  isRead: (arxivId: string) => boolean;
  /** Toggle a paper's read state. */
  toggleRead: (arxivId: string) => void;
  /** Number of understood topics (out of 26). */
  understoodCount: number;
  /** Number of read papers (out of 23). */
  readCount: number;
  /** Clear all progress. */
  resetProgress: () => void;
  /** Active cognitive lens mode: 'intuition' (analogies) vs 'rigor' (formal physics). */
  lensMode: LensMode;
  /** Set cognitive lens mode directly. */
  setLensMode: (mode: LensMode) => void;
  /** Toggle cognitive lens mode. */
  toggleLensMode: () => void;
}

const EMPTY: PersistedProgress = { understood: [], papersRead: [], lensMode: 'intuition' };

function loadProgress(): PersistedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as PersistedProgress).understood) &&
      Array.isArray((parsed as PersistedProgress).papersRead)
    ) {
      const p = parsed as PersistedProgress;
      return {
        understood: p.understood.filter((x): x is string => typeof x === 'string'),
        papersRead: p.papersRead.filter((x): x is string => typeof x === 'string'),
        lensMode: p.lensMode === 'rigor' ? 'rigor' : 'intuition',
      };
    }
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<PersistedProgress>(loadProgress);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage unavailable (private mode etc.) — keep state in memory only.
    }
  }, [progress]);

  // Cross-tab / cross-page sync (design.md §8).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setProgress(loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleUnderstood = useCallback((id: string) => {
    setProgress((prev) => ({
      ...prev,
      understood: prev.understood.includes(id)
        ? prev.understood.filter((x) => x !== id)
        : [...prev.understood, id],
    }));
  }, []);

  const toggleRead = useCallback((arxivId: string) => {
    setProgress((prev) => ({
      ...prev,
      papersRead: prev.papersRead.includes(arxivId)
        ? prev.papersRead.filter((x) => x !== arxivId)
        : [...prev.papersRead, arxivId],
    }));
  }, []);

  const setLensMode = useCallback((mode: LensMode) => {
    setProgress((prev) => ({ ...prev, lensMode: mode }));
  }, []);

  const toggleLensMode = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      lensMode: prev.lensMode === 'rigor' ? 'intuition' : 'rigor',
    }));
  }, []);

  const resetProgress = useCallback(() => setProgress(EMPTY), []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      isUnderstood: (id) => progress.understood.includes(id),
      toggleUnderstood,
      isRead: (arxivId) => progress.papersRead.includes(arxivId),
      toggleRead,
      understoodCount: progress.understood.length,
      readCount: progress.papersRead.length,
      resetProgress,
      lensMode: progress.lensMode ?? 'intuition',
      setLensMode,
      toggleLensMode,
    }),
    [progress, toggleUnderstood, toggleRead, resetProgress, setLensMode, toggleLensMode],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook must live beside its provider; pages import it from here
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}

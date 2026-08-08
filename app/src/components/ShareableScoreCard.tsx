import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Copy, Download, HardDrive, Share2, Trophy, Upload, X } from 'lucide-react';
import { papers, topics } from '@/data';
import { useProgress } from '@/store/progress';
import { FOUNDATION_STAGE_IDS } from '@/lib/learningRecord';

const FOUNDATION_TOTAL = FOUNDATION_STAGE_IDS.length;
const REVIEW_TARGET = 10;

interface Metric {
  label: string;
  display?: string;
  count: number;
  total: number;
  points: number;
  maxPoints: number;
  ratio?: number;
  bar: string;
  color: string;
}

export default function ShareableScoreCard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    exploredCount,
    checkedCount,
    readCount,
    displayName,
    setDisplayName,
    evidenceFor,
    exportLearningRecord,
    importLearningRecord,
    storageStatus,
  } = useProgress();
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  const [shareStatus, setShareStatus] = useState('');
  const [recordStatus, setRecordStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const foundationEvents = evidenceFor('foundation-prediction');
  const latestFoundation = new Map(foundationEvents.map((entry) => [entry.stageId, entry]));
  const foundationCorrect = FOUNDATION_STAGE_IDS.filter((stageId) => latestFoundation.get(stageId)?.correct).length;
  const reviewEvents = evidenceFor('review-recall');
  const reviewAttempts = reviewEvents.reduce((sum, entry) => sum + entry.attempts, 0);
  const reviewSuccesses = reviewEvents.reduce(
    (sum, entry) => sum + (entry.successfulAttempts ?? (entry.rating === 'easy' ? entry.attempts : 0)),
    0,
  );
  const reviewRatio = reviewAttempts === 0
    ? 0
    : Math.min(1, reviewAttempts / REVIEW_TARGET) * (reviewSuccesses / reviewAttempts);
  const duel = evidenceFor('duel-result')
    .filter((entry) => entry.mode === 'daily' && entry.compatible === true)
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))[0];
  const capstone = evidenceFor('capstone')
    .sort((left, right) => (right.correct / right.total) - (left.correct / left.total))[0];
  const learnerName = displayName.trim() || 'Quantum Explorer';

  const activityMetrics: Metric[] = [
    {
      label: 'Topics self-marked explored',
      count: exploredCount,
      total: topics.length,
      points: Math.round((exploredCount / topics.length) * 280),
      maxPoints: 280,
      bar: 'bg-plaquette',
      color: 'text-plaquette',
    },
    {
      label: 'Papers self-marked read',
      count: readCount,
      total: papers.length,
      points: Math.round((readCount / papers.length) * 120),
      maxPoints: 120,
      bar: 'bg-star',
      color: 'text-star',
    },
  ];
  const evidenceMetrics: Metric[] = [
    {
      label: 'Topic self-checks passed',
      count: checkedCount,
      total: topics.length,
      points: Math.round((checkedCount / topics.length) * 240),
      maxPoints: 240,
      bar: 'bg-stabilizer',
      color: 'text-stabilizer',
    },
    {
      label: 'Foundations predictions correct',
      count: foundationCorrect,
      total: FOUNDATION_TOTAL,
      points: Math.round((foundationCorrect / FOUNDATION_TOTAL) * 120),
      maxPoints: 120,
      bar: 'bg-magic',
      color: 'text-magic',
    },
    {
      label: 'Review recalls after comparison',
      count: reviewSuccesses,
      total: Math.max(REVIEW_TARGET, reviewAttempts),
      ratio: reviewRatio,
      points: Math.round(reviewRatio * 80),
      maxPoints: 80,
      bar: 'bg-star',
      color: 'text-star',
    },
    {
      label: 'Latest compatible Daily Duel',
      count: duel?.score ?? 0,
      total: duel?.maxScore ?? 150,
      points: Math.round(((duel?.score ?? 0) / (duel?.maxScore ?? 150)) * 80),
      maxPoints: 80,
      bar: 'bg-syndrome',
      color: 'text-syndrome',
    },
    {
      label: 'Best integrative capstone',
      display: capstone ? undefined : 'not recorded',
      count: capstone?.correct ?? 0,
      total: capstone?.total ?? 1,
      points: Math.round(((capstone?.correct ?? 0) / (capstone?.total ?? 1)) * 80),
      maxPoints: 80,
      bar: 'bg-magic',
      color: 'text-magic',
    },
  ];
  const activityScore = activityMetrics.reduce((sum, metric) => sum + metric.points, 0);
  const evidenceScore = evidenceMetrics.reduce((sum, metric) => sum + metric.points, 0);
  const totalScore = activityScore + evidenceScore;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [isOpen]);

  const downloadRecord = () => {
    const blob = new Blob([exportLearningRecord()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lattice-atlas-learning-record.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setRecordStatus({ ok: true, message: 'Portable local record downloaded. It is unsigned JSON, not a credential.' });
  };

  const importRecord = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1_000_000) {
      setRecordStatus({ ok: false, message: 'Import rejected: file is larger than 1 MB.' });
      if (importRef.current) importRef.current.value = '';
      return;
    }
    try {
      const result = importLearningRecord(await file.text());
      setRecordStatus(result);
    } catch {
      setRecordStatus({ ok: false, message: 'Import failed while reading the selected file.' });
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const share = async () => {
    const text = [
      `Lattice Atlas — ${learnerName}'s local learning snapshot`,
      `${totalScore}/1000 learning points`,
      `Activity ${activityScore}/400: ${exploredCount}/${topics.length} topics explored · ${readCount}/${papers.length} papers read`,
      `Evidence ${evidenceScore}/600: ${checkedCount}/${topics.length} topic checks · ${foundationCorrect}/${FOUNDATION_TOTAL} Foundations predictions · ${reviewSuccesses}/${Math.max(REVIEW_TARGET, reviewAttempts)} review recalls · Daily Duel ${duel?.score ?? 0}/${duel?.maxScore ?? 150}${duel ? ` (${duel.puzzleId})` : ''} · Capstone ${capstone ? `${capstone.correct}/${capstone.total}` : 'not recorded'}`,
      'Local browser record. Activity is self-reported; evidence is unsigned and not independently verified. Not a credential.',
      'https://galic1987.github.io/lattice-atlas/',
    ].join('\n');
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Lattice Atlas learning snapshot', text });
        setShareStatus('Share sheet opened.');
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus('Learning snapshot copied.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('Sharing is unavailable in this browser.');
    }
  };

  const renderMetric = (metric: Metric) => (
    <div key={metric.label}>
      <div className="mb-1 flex justify-between gap-3 text-text-mid">
        <span>{metric.label} ({metric.display ?? `${metric.count}/${metric.total}`})</span>
        <span className={`font-bold ${metric.color}`}>{metric.points}/{metric.maxPoints}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
        <div className={`h-full ${metric.bar}`} style={{ width: `${Math.min(100, (metric.ratio ?? metric.count / metric.total) * 100)}%` }} />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-snapshot-title"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/20"
          >
            <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">Local record · not verified</span>
                  <h2 id="learning-snapshot-title" className="font-display text-lg font-bold text-text-hi">Shareable learning snapshot</h2>
                </div>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close learning snapshot" className="rounded-lg p-2 text-text-low transition-colors hover:bg-ink-800 hover:text-text-hi">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="relative overflow-hidden rounded-2xl border border-plaquette/50 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 p-5 shadow-glow-cyan md:p-6">
                <div className="lattice-bg absolute inset-0 opacity-20" aria-hidden="true" />
                <div className="relative z-10 flex items-center justify-between border-b border-ink-700/80 pb-4">
                  <span className="font-display text-base font-bold text-text-hi">Lattice Atlas</span>
                  <span className="flex items-center gap-1 rounded-full border border-magic/50 bg-magic/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-magic">
                    <HardDrive className="h-3 w-3" aria-hidden="true" /> LOCAL SNAPSHOT
                  </span>
                </div>

                <div className="relative z-10 mt-5">
                  <label htmlFor="learning-snapshot-name" className="font-mono text-[10px] uppercase tracking-wider text-text-low">Display name</label>
                  <input id="learning-snapshot-name" type="text" value={displayName} placeholder="Quantum Explorer" maxLength={48} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 font-display text-lg font-bold text-text-hi placeholder:text-text-low focus:border-plaquette focus:outline-none" />
                </div>

                <div className="relative z-10 mt-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">Learning points</span>
                    <div className="font-mono text-4xl font-extrabold tracking-tight text-plaquette">
                      {totalScore} <span className="text-base text-text-mid">/ 1000</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] leading-5">
                    <p className="text-plaquette">activity {activityScore}/400</p>
                    <p className="text-stabilizer">evidence {evidenceScore}/600</p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 space-y-4 font-mono text-xs">
                  <div>
                    <p className="mb-2 uppercase tracking-wider text-text-low">Activity · self-reported</p>
                    <div className="space-y-3">{activityMetrics.map(renderMetric)}</div>
                  </div>
                  <div className="border-t border-ink-700 pt-4">
                    <p className="mb-2 uppercase tracking-wider text-text-low">Evidence · local and unsigned</p>
                    <div className="space-y-3">{evidenceMetrics.map(renderMetric)}</div>
                  </div>
                </div>
              </div>

              <p className="mt-4 rounded-lg border border-ink-600 bg-ink-950/65 p-3 text-xs leading-5 text-text-low">
                Activity points come from your own marks. Evidence points come from local predictions, checks, retrieval ratings, a compatible Daily Duel, and the integrative capstone. Neither proves identity, retention, independent work, or mastery.
              </p>
              <div className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-xs leading-5 ${storageStatus.state === 'saved' ? 'border-stabilizer/30 bg-stabilizer/[0.06] text-text-low' : 'border-syndrome/40 bg-syndrome/[0.08] text-text-hi'}`} role="status">
                {storageStatus.state === 'memory-only' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-syndrome" aria-hidden="true" />}
                <span>{storageStatus.message}</span>
              </div>
              <button type="button" onClick={share} className="btn-primary mt-5 w-full justify-center text-sm">
                {typeof navigator.share === 'function' ? <Share2 className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                Share learning snapshot
              </button>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={downloadRecord} className="btn-secondary justify-center text-xs">
                  <Download className="h-4 w-4" aria-hidden="true" /> Export record JSON
                </button>
                <button type="button" onClick={() => importRef.current?.click()} className="btn-secondary justify-center text-xs">
                  <Upload className="h-4 w-4" aria-hidden="true" /> Validate & merge JSON
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => void importRecord(event.target.files?.[0])}
                  className="sr-only"
                  aria-label="Import a Lattice Atlas learning record"
                />
              </div>
              {shareStatus && <p className="mt-3 text-xs text-stabilizer" role="status" aria-live="polite">{shareStatus}</p>}
              {recordStatus && (
                <p className={`mt-3 text-xs ${recordStatus.ok ? 'text-stabilizer' : 'text-syndrome'}`} role="status" aria-live="polite">
                  {recordStatus.message}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

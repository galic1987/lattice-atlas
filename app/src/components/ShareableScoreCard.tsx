import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Copy, HardDrive, Share2, Trophy, X } from 'lucide-react';
import { papers, topics } from '@/data';
import { useProgress } from '@/store/progress';

const NAME_STORAGE_KEY = 'lattice-atlas-user-name';

export default function ShareableScoreCard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { understoodCount, readCount } = useProgress();
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) || 'Quantum Explorer';
    } catch {
      return 'Quantum Explorer';
    }
  });

  const topicPoints = Math.round((understoodCount / topics.length) * 700);
  const paperPoints = Math.round((readCount / papers.length) * 300);
  const totalScore = topicPoints + paperPoints;
  const pathLabel = totalScore >= 800
    ? 'Deep into the atlas'
    : totalScore >= 500
      ? 'Connecting the field'
      : totalScore >= 200
        ? 'Building fluency'
        : 'Starting a path';

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'));
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
  }, [isOpen, onClose]);

  const handleNameChange = (name: string) => {
    setUserName(name);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, name);
    } catch {
      // The card still works in memory when storage is unavailable.
    }
  };

  const share = async () => {
    const text = [
      `Lattice Atlas — ${userName}'s local learning snapshot`,
      `${totalScore}/1000 progress points · ${pathLabel}`,
      `${understoodCount}/${topics.length} topics marked understood · ${readCount}/${papers.length} papers marked read`,
      'Local, self-reported browser progress — not a credential or independently verified result.',
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
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/20"
          >
            <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">Local progress · not verified</span>
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
                  <input
                    id="learning-snapshot-name"
                    type="text"
                    value={userName}
                    maxLength={48}
                    onChange={(event) => handleNameChange(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 font-display text-lg font-bold text-text-hi focus:border-plaquette focus:outline-none"
                  />
                </div>

                <div className="relative z-10 mt-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">Progress points</span>
                    <div className="font-mono text-4xl font-extrabold tracking-tight text-plaquette">
                      {totalScore} <span className="text-base text-text-mid">/ 1000</span>
                    </div>
                  </div>
                  <p className="font-display text-sm font-semibold text-magic">{pathLabel}</p>
                </div>

                <div className="relative z-10 mt-6 space-y-4 font-mono text-xs">
                  {[
                    ['Topics marked understood', understoodCount, topics.length, topicPoints, 700, 'bg-plaquette', 'text-plaquette'],
                    ['Papers marked read', readCount, papers.length, paperPoints, 300, 'bg-star', 'text-star'],
                  ].map(([label, count, total, points, maxPoints, bar, color]) => (
                    <div key={String(label)}>
                      <div className="mb-1 flex justify-between gap-3 text-text-mid">
                        <span>{label} ({count}/{total})</span>
                        <span className={`font-bold ${color}`}>{points}/{maxPoints} pts</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
                        <div className={`h-full ${bar}`} style={{ width: `${(Number(count) / Number(total)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 rounded-lg border border-ink-600 bg-ink-950/65 p-3 text-xs leading-5 text-text-low">
                This playful score is calculated from local checkboxes: 700 points for topic marks and 300 for paper marks. It does not prove identity, completion, assessment performance, or mastery.
              </p>
              <button type="button" onClick={share} className="btn-primary mt-5 w-full justify-center text-sm">
                {typeof navigator.share === 'function' ? <Share2 className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                Share learning snapshot
              </button>
              {shareStatus && <p className="mt-3 text-xs text-stabilizer" role="status" aria-live="polite">{shareStatus}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

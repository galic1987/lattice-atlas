import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Compass, RotateCcw, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TourStep {
  title: string;
  subtitle: string;
  mapping: string;
  action: string;
}

const TOUR_STEPS: ReadonlyArray<TourStep> = [
  {
    title: '1. Declare one toy fault',
    subtitle: 'Apply a Pauli X component to the center data qubit D4.',
    mapping:
      'The colored X is the mathematical error component we deliberately insert. It is not a literal picture of heat, a cosmic ray, or a qubit “falling flat.”',
    action: 'Inject X on D4',
  },
  {
    title: '2. Read two parity alarms',
    subtitle: 'The X component anticommutes with both adjacent Z checks.',
    mapping:
      'Red faces map to −1 check outcomes. They constrain the hidden error but do not identify it uniquely; several chains can produce the same endpoints.',
    action: 'Reveal the two Z-check outcomes',
  },
  {
    title: '3. Choose one candidate correction',
    subtitle: 'For the fault we inserted, applying X to D4 is one valid correction.',
    mapping:
      'The green mark is a chosen toy correction, not a reconstructed fault. This 3×3 sketch has no weighted spacetime graph and does not run MWPM.',
    action: 'Apply the candidate X',
  },
  {
    title: '4. Inspect the residual',
    subtitle: 'In this declared case, X·X = I and the two highlighted checks clear.',
    mapping:
      'That verifies one local algebra example only. It does not prove fidelity, a threshold, hardware performance, or that every same-syndrome correction preserves the logical state.',
    action: 'Open the full Lab',
  },
];

export default function InteractiveTour({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [qubitHasError, setQubitHasError] = useState(false);
  const [syndromeActive, setSyndromeActive] = useState(false);
  const [correctionApplied, setCorrectionApplied] = useState(false);
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
      );
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
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [isOpen]);

  const resetTour = () => {
    setCurrentStep(0);
    setQubitHasError(false);
    setSyndromeActive(false);
    setCorrectionApplied(false);
  };

  const runCurrentAction = () => {
    if (currentStep === 0) setQubitHasError(true);
    if (currentStep === 1) setSyndromeActive(true);
    if (currentStep === 2) setCorrectionApplied(true);
  };

  const actionComplete =
    currentStep === 0
      ? qubitHasError
      : currentStep === 1
        ? syndromeActive
        : currentStep === 2
          ? correctionApplied
          : true;

  const errorVisible = qubitHasError || currentStep > 0;
  const alarmsVisible = syndromeActive || currentStep > 1;
  const corrected = correctionApplied || currentStep > 2;
  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="toy-tour-title"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/10"
          >
            <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                  <Compass className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">DECLARED TOY · {currentStep + 1}/4</span>
                  <h2 id="toy-tour-title" className="font-display text-lg font-bold text-text-hi">{step.title}</h2>
                </div>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close guided toy" className="rounded-lg p-2 text-text-low transition-colors hover:bg-ink-800 hover:text-text-hi">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 md:p-6">
              <p className="text-sm font-medium leading-6 text-plaquette" aria-live="polite">{step.subtitle}</p>
              <div className="mt-3 rounded-xl border border-ink-600 bg-ink-850 p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-stabilizer">Mapping + boundary</span>
                <p className="mt-1.5 text-sm leading-6 text-text-mid">{step.mapping}</p>
              </div>

              <figure className="mt-5 rounded-xl border border-ink-700 bg-ink-950 p-4">
                <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label="Center data qubit D4 with an X error touching two Z checks and two X checks; the two Z checks show minus one before the candidate correction and plus one afterward">
                  <rect x="70" y="25" width="90" height="65" fill="#22D3EE" fillOpacity={alarmsVisible && !corrected ? 0.3 : 0.1} stroke={alarmsVisible && !corrected ? '#FB7185' : '#22D3EE'} strokeWidth="3" />
                  <rect x="160" y="25" width="90" height="65" fill="#9B7BFA" fillOpacity="0.12" stroke="#9B7BFA" strokeWidth="2" />
                  <rect x="70" y="90" width="90" height="65" fill="#9B7BFA" fillOpacity="0.12" stroke="#9B7BFA" strokeWidth="2" />
                  <rect x="160" y="90" width="90" height="65" fill="#22D3EE" fillOpacity={alarmsVisible && !corrected ? 0.3 : 0.1} stroke={alarmsVisible && !corrected ? '#FB7185' : '#22D3EE'} strokeWidth="3" />
                  <text x="115" y="60" textAnchor="middle" fill={alarmsVisible && !corrected ? '#FB7185' : '#A9B4CC'} fontSize="13" fontFamily="JetBrains Mono">Z {alarmsVisible && !corrected ? '−1' : '+1'}</text>
                  <text x="205" y="60" textAnchor="middle" fill="#C8B8FF" fontSize="13" fontFamily="JetBrains Mono">X +1</text>
                  <text x="115" y="128" textAnchor="middle" fill="#C8B8FF" fontSize="13" fontFamily="JetBrains Mono">X +1</text>
                  <text x="205" y="128" textAnchor="middle" fill={alarmsVisible && !corrected ? '#FB7185' : '#A9B4CC'} fontSize="13" fontFamily="JetBrains Mono">Z {alarmsVisible && !corrected ? '−1' : '+1'}</text>
                  <circle cx="160" cy="90" r="15" fill={corrected ? '#34D399' : errorVisible ? '#FB7185' : '#22D3EE'} stroke="#EAF0FB" strokeWidth="2" />
                  <text x="160" y="95" textAnchor="middle" fill="#05080F" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">{errorVisible ? 'X' : 'D4'}</text>
                  <text x="160" y="180" textAnchor="middle" fill={corrected ? '#34D399' : '#A9B4CC'} fontSize="12" fontFamily="JetBrains Mono">{corrected ? 'declared residual: X · X = I' : 'one data qubit touches four checks'}</text>
                </svg>
                <figcaption className="mt-2 text-xs leading-5 text-text-low">
                  Checkerboard rule: diagonal faces share a type. An X component flips both adjacent Z checks and commutes with the X checks.
                </figcaption>
              </figure>

              {currentStep < 3 && (
                <button type="button" onClick={runCurrentAction} disabled={actionComplete} className="btn-secondary mt-4 w-full disabled:cursor-default disabled:opacity-60">
                  {actionComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  {actionComplete ? 'Action recorded' : step.action}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-ink-700 bg-ink-950 px-5 py-4 md:px-6">
              <button type="button" onClick={resetTour} className="inline-flex items-center gap-1 font-mono text-xs text-text-low hover:text-text-hi">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
              </button>
              {currentStep < 3 ? (
                <button type="button" disabled={!actionComplete} onClick={() => setCurrentStep((value) => Math.min(value + 1, 3))} className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-40">
                  Next explanation <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <Link to="/lab" onClick={onClose} className="btn-primary text-xs">
                  Open the full Lab <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

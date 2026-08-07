import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TourStep {
  id: number;
  title: string;
  subtitle: string;
  analogy: string;
  actionText: string;
  interactivePrompt: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Act 1: A Toy Noise Event',
    subtitle: 'A physical fault can introduce a Pauli error component.',
    analogy: 'Picture one kink appearing in a stitch of patterned fabric. Nearby parity checks can notice that the pattern changed.',
    actionText:
      'Center dot → one data qubit; X label → one toy Pauli component. Boundary: real noise can also be coherent, correlated, or leakage outside the qubit subspace.',
    interactivePrompt: 'Place a toy X component on the center qubit',
  },
  {
    id: 2,
    title: 'Act 2: Two Parity Alarms',
    subtitle: 'Checks reveal constraints without reading the encoded logical value.',
    analogy: 'Two seam gauges bordering the kink change sign. They report parity disagreement, not the hidden thread color.',
    actionText:
      'Pink tiles → two neighboring Z-check outcomes changed by the drawn X component. Boundary: the same alarm pair can have several fault-chain explanations, and faulty measurements add time-like possibilities.',
    interactivePrompt: 'Inspect the two Z-check alarms',
  },
  {
    id: 3,
    title: 'Act 3: A Decoder’s Guess',
    subtitle: 'A syndrome admits multiple compatible explanations.',
    analogy: 'Two closed subway stations can be connected by several routes. A decoder uses a noise-weighted map to choose a plausible correction class.',
    actionText:
      'Green segment → one candidate correction joining the alarm pair. Boundary: this 3×3 sketch has no weighted spacetime detector graph and does not run MWPM.',
    interactivePrompt: 'Show one candidate toy correction',
  },
  {
    id: 4,
    title: 'Act 4: This Toy Fault Is Cancelled',
    subtitle: 'The selected correction closes this one illustrated syndrome.',
    analogy: 'The chosen mend cancels the drawn kink while the non-local logical information stays unmeasured.',
    actionText:
      'Green center → this selected toy error and correction cancel. Boundary: one illustrated success does not prove perfect fidelity, a threshold, or decoder performance.',
    interactivePrompt: 'Continue to the full learning path',
  },
];

const QUBIT_POINTS = [
  [80, 30],
  [140, 30],
  [200, 30],
  [80, 70],
  [200, 70],
  [80, 110],
  [140, 110],
  [200, 110],
] as const;

export default function InteractiveTour({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [qubitHasError, setQubitHasError] = useState(false);
  const [syndromeActive, setSyndromeActive] = useState(false);
  const [correctionShown, setCorrectionShown] = useState(false);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const step = TOUR_STEPS[currentStep];
  const faultVisible = qubitHasError || currentStep >= 1;
  const alarmsVisible = syndromeActive || currentStep >= 1;
  const correctionVisible = correctionShown || currentStep === 3;

  const handleInteractiveClick = () => {
    if (currentStep === 0) {
      setQubitHasError(true);
    } else if (currentStep === 1) {
      setSyndromeActive(true);
    } else if (currentStep === 2) {
      setCorrectionShown(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
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
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [isOpen, onClose]);

  const resetTour = () => {
    setCurrentStep(0);
    setQubitHasError(false);
    setSyndromeActive(false);
    setCorrectionShown(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="interactive-tour-title"
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/10"
        >
          <div className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                <Compass className={reduce ? 'h-5 w-5' : 'h-5 w-5 animate-spin-slow'} />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">
                  INTERACTIVE GUIDED TOUR ({currentStep + 1}/4)
                </span>
                <h3 id="interactive-tour-title" className="font-display text-lg font-bold text-text-hi">{step.title}</h3>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-text-low transition-colors hover:bg-ink-800 hover:text-text-hi"
              aria-label="Close guided tour"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm font-medium text-plaquette">{step.subtitle}</p>

            <div className="mt-3 rounded-xl border border-ink-600 bg-ink-850 p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-stabilizer">
                💡 INTUITIVE MENTAL MODEL
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-text-mid">{step.analogy}</p>
              <div className="mt-3 border-t border-ink-700 pt-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-magic">MAP + BOUNDARY</span>
                <p className="mt-1 text-xs leading-relaxed text-text-mid">{step.actionText}</p>
              </div>
            </div>

            <div className="relative mt-6 flex h-52 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-4">
              <span className="absolute left-3 top-2 font-mono text-[9px] uppercase tracking-wider text-text-low">
                Conceptual rotated-code sketch · not to scale
              </span>
              <svg viewBox="0 0 280 140" className="h-full w-full" role="img" aria-label="Toy surface-code fault and parity-check sketch">
                <line x1="80" y1="30" x2="200" y2="30" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="80" y1="70" x2="200" y2="70" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="80" y1="110" x2="200" y2="110" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="80" y1="30" x2="80" y2="110" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="140" y1="30" x2="140" y2="110" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="200" y1="30" x2="200" y2="110" stroke="#2A3A5F" strokeWidth="2" />

                {[
                  [80, 30],
                  [140, 70],
                ].map(([x, y]) => (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width="60"
                    height="40"
                    fill={alarmsVisible ? '#FB7185' : '#22D3EE'}
                    fillOpacity={alarmsVisible ? 0.35 : 0.1}
                    stroke={alarmsVisible ? '#FB7185' : '#22D3EE'}
                    strokeWidth="2"
                  />
                ))}

                {correctionVisible && (
                  <line x1="110" y1="50" x2="170" y2="90" stroke="#34D399" strokeWidth="3" strokeDasharray="4 2" />
                )}

                {QUBIT_POINTS.map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#EAF0FB" />
                ))}

                <circle
                  cx="140"
                  cy="70"
                  r={faultVisible ? 9 : 7}
                  fill={correctionVisible ? '#34D399' : faultVisible ? '#FB7185' : '#22D3EE'}
                />

                <text x="110" y="45" textAnchor="middle" fill={alarmsVisible ? '#FFF1F2' : '#67E8F9'} className="font-mono text-[8px] font-bold">
                  Z CHECK
                </text>
                <text x="170" y="85" textAnchor="middle" fill={alarmsVisible ? '#FFF1F2' : '#67E8F9'} className="font-mono text-[8px] font-bold">
                  Z CHECK
                </text>

                {qubitHasError && currentStep === 0 && (
                  <text x="140" y="100" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px] font-bold">
                    Toy X component
                  </text>
                )}
                {alarmsVisible && currentStep === 1 && (
                  <text x="140" y="125" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px] font-bold">
                    Two Z-check alarms
                  </text>
                )}
                {correctionVisible && (
                  <text x="140" y="125" textAnchor="middle" fill="#34D399" className="font-mono text-[10px] font-bold">
                    Toy correction applied
                  </text>
                )}
              </svg>

              <button
                type="button"
                onClick={handleInteractiveClick}
                disabled={currentStep === 3}
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-plaquette/50 bg-ink-900 px-4 py-1.5 text-xs font-semibold text-plaquette shadow-glow-cyan transition-transform hover:scale-105 disabled:cursor-default disabled:opacity-70 disabled:hover:scale-100"
              >
                <Sparkles className={reduce ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 animate-pulse'} />
                {step.interactivePrompt}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-ink-700 bg-ink-950 px-6 py-4">
            <button
              type="button"
              onClick={resetTour}
              className="inline-flex items-center gap-1 font-mono text-xs text-text-low hover:text-text-hi"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset tour
            </button>

            <div className="flex items-center gap-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((current) => Math.min(current + 1, 3))}
                  className="btn-primary text-xs"
                >
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link to="/path" onClick={onClose} className="btn-primary text-xs">
                  Start Learning Path <CheckCircle2 className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

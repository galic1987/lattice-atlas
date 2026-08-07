import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TourStep {
  id: number;
  title: string;
  subtitle: string;
  analogy: string;
  actionText: string;
  visualType: 'noise' | 'syndrome' | 'decode' | 'topology';
  interactivePrompt: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Act 1: The Noise Strike',
    subtitle: 'Physical qubits are incredibly fragile.',
    analogy: 'Imagine a spinning coin suspended in mid-air. Heat or magnetic fields knock the coin flat.',
    actionText: 'Click the Qubit to simulate a stray cosmic ray error!',
    visualType: 'noise',
    interactivePrompt: 'Click Qubit #4 to inject a Pauli X error',
  },
  {
    id: 2,
    title: 'Act 2: The Silent Alarm (Syndrome)',
    subtitle: 'We cannot look at the qubit without destroying its quantum secret!',
    analogy: 'Instead of opening the door, ceiling sensors check if adjoining rooms agree on parity.',
    actionText: 'Stabilizers anti-commute with the error and sound an alarm.',
    visualType: 'syndrome',
    interactivePrompt: 'Observe the Z-Plaquette lighting up red',
  },
  {
    id: 3,
    title: 'Act 3: The Graph Detective (MWPM)',
    subtitle: 'Finding the minimal path between alarms.',
    analogy: 'An automated detective traces the footprints of anyons to locate where the fault occurred.',
    actionText: 'Run the Minimum-Weight Perfect Matching decoder!',
    visualType: 'decode',
    interactivePrompt: 'Click "Run Decoder" to compute correction path',
  },
  {
    id: 4,
    title: 'Act 4: Quantum Recovery Achieved!',
    subtitle: 'Information remains untouched inside topology.',
    analogy: 'Local noise pokes the fabric, but cannot untie the global topological loop.',
    actionText: 'The code state is restored with 100% fidelity!',
    visualType: 'topology',
    interactivePrompt: 'You are now ready to explore the 26-topic Knowledge Path!',
  },
];

export default function InteractiveTour({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [qubitHasError, setQubitHasError] = useState(false);
  const [syndromeActive, setSyndromeActive] = useState(false);
  const [decoderApplied, setDecoderApplied] = useState(false);

  const step = TOUR_STEPS[currentStep];

  const handleInteractiveClick = () => {
    if (currentStep === 0) {
      setQubitHasError(true);
      setTimeout(() => setCurrentStep(1), 1200);
    } else if (currentStep === 1) {
      setSyndromeActive(true);
      setTimeout(() => setCurrentStep(2), 1200);
    } else if (currentStep === 2) {
      setDecoderApplied(true);
      setTimeout(() => setCurrentStep(3), 1200);
    }
  };

  const resetTour = () => {
    setCurrentStep(0);
    setQubitHasError(false);
    setSyndromeActive(false);
    setDecoderApplied(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                <Compass className="h-5 w-5 animate-spin-slow" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">
                  INTERACTIVE GUIDED TOUR ({currentStep + 1}/4)
                </span>
                <h3 className="font-display text-lg font-bold text-text-hi">{step.title}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-text-low transition-colors hover:bg-ink-800 hover:text-text-hi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-sm font-medium text-plaquette">{step.subtitle}</p>

            {/* Analogy Box */}
            <div className="mt-3 rounded-xl border border-ink-600 bg-ink-850 p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-stabilizer">
                💡 INTUITIVE MENTAL MODEL
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-text-mid">{step.analogy}</p>
            </div>

            {/* Interactive Visual Toy Container */}
            <div className="mt-6 flex h-52 w-full flex-col items-center justify-center rounded-xl border border-ink-700 bg-ink-950 p-4 relative overflow-hidden">
              <svg viewBox="0 0 280 140" className="h-full w-full">
                {/* 3x3 Grid */}
                <line x1="80" y1="30" x2="200" y2="30" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="80" y1="70" x2="200" y2="70" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="80" y1="110" x2="200" y2="110" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="80" y1="30" x2="80" y2="110" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="140" y1="30" x2="140" y2="110" stroke="#2A3A5F" strokeWidth="2" />
                <line x1="200" y1="30" x2="200" y2="110" stroke="#2A3A5F" strokeWidth="2" />

                {/* Z Plaquette */}
                <rect
                  x="80"
                  y="30"
                  width="60"
                  height="40"
                  fill={syndromeActive || currentStep >= 1 ? '#FB7185' : '#22D3EE'}
                  fillOpacity={syndromeActive || currentStep >= 1 ? 0.4 : 0.15}
                  stroke={syndromeActive || currentStep >= 1 ? '#FB7185' : '#22D3EE'}
                  strokeWidth="2"
                />

                {/* Qubits */}
                <circle cx="80" cy="30" r="6" fill="#EAF0FB" />
                <circle cx="140" cy="30" r="6" fill="#EAF0FB" />
                <circle cx="200" cy="30" r="6" fill="#EAF0FB" />
                <circle cx="80" cy="70" r="6" fill="#EAF0FB" />

                {/* Middle target Qubit #4 */}
                <circle
                  cx="140"
                  cy="70"
                  r={qubitHasError || currentStep >= 1 ? 9 : 7}
                  fill={decoderApplied || currentStep === 3 ? '#34D399' : qubitHasError || currentStep >= 1 ? '#FB7185' : '#22D3EE'}
                  className="cursor-pointer transition-all duration-300 hover:scale-125"
                  onClick={handleInteractiveClick}
                />

                {/* MWPM Correction Path */}
                {(decoderApplied || currentStep === 3) && (
                  <line x1="140" y1="70" x2="140" y2="30" stroke="#34D399" strokeWidth="3" strokeDasharray="4 2" />
                )}

                {/* Labels */}
                {qubitHasError && currentStep === 0 && (
                  <text x="140" y="95" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px]">Pauli X Error Injected!</text>
                )}
                {(syndromeActive || currentStep === 1) && (
                  <text x="110" y="55" textAnchor="middle" fill="#FB7185" className="font-mono text-[10px] font-bold">Syndrome Alarm!</text>
                )}
                {(decoderApplied || currentStep === 3) && (
                  <text x="140" y="95" textAnchor="middle" fill="#34D399" className="font-mono text-[10px] font-bold">Recovery Complete ✓</text>
                )}
              </svg>

              {/* Interactive prompt button */}
              <button
                type="button"
                onClick={handleInteractiveClick}
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-plaquette/50 bg-ink-900 px-4 py-1.5 text-xs font-semibold text-plaquette shadow-glow-cyan hover:scale-105 transition-transform"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                {step.interactivePrompt}
              </button>
            </div>
          </div>

          {/* Footer Controls */}
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
                  onClick={() => setCurrentStep((s) => Math.min(s + 1, 3))}
                  className="btn-primary text-xs"
                >
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link
                  to="/path"
                  onClick={onClose}
                  className="btn-primary text-xs"
                >
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

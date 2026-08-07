import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  Zap,
  RotateCcw,
  Share2,
  Sparkles,
  Clock,
  Flame,
  Award,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const ARCADE_STORAGE_KEY = 'lattice-atlas-game-scores';

export default function QuantumArcade({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'game-over'>('idle');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [targetQubit, setTargetQubit] = useState<number>(4);

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(ARCADE_STORAGE_KEY);
      return saved ? JSON.parse(saved).highScore || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Game Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      if (timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((t) => Math.max(t - 1, 0));
        }, 1000);
      } else {
        const timeout = setTimeout(() => {
          setGameState('game-over');
          setHighScore((prevHigh) => {
            if (score > prevHigh) {
              try {
                localStorage.setItem(ARCADE_STORAGE_KEY, JSON.stringify({ highScore: score }));
              } catch {
                // ignore
              }
              toast.success(`🎉 New High Score: ${score} pts!`);
              return score;
            }
            return prevHigh;
          });
        }, 0);
        return () => clearTimeout(timeout);
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  const generateNextRound = useCallback(() => {
    const q = Math.floor(Math.random() * 9);
    setTargetQubit(q);
  }, []);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setGameState('playing');
    generateNextRound();
  };

  const handleQubitClick = (qIndex: number) => {
    if (gameState !== 'playing') return;

    if (qIndex === targetQubit) {
      const points = 100 + streak * 20;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      generateNextRound();
    } else {
      setStreak(0);
    }
  };

  const shareScore = () => {
    const text = `⚛️ I scored ${score} pts in the Quantum Arcade on Lattice Atlas! Can you decode faster than physical decoherence?\nhttps://galic1987.github.io/lattice-atlas/`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('High Score badge copied to clipboard!');
    } else {
      toast(text);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// QUANTUM ARCADE</span>
                <h3 className="font-display text-lg font-bold text-text-hi">Syndrome Speed-Decoder</h3>
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

          {/* Game Stats Bar */}
          <div className="flex items-center justify-between border-b border-ink-800 bg-ink-950 px-6 py-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-plaquette font-bold">
              <Trophy className="h-4 w-4" /> SCORE: {score}
            </div>
            <div className="flex items-center gap-1 text-magic font-bold">
              <Flame className="h-4 w-4" /> STREAK: {streak}x
            </div>
            <div className="flex items-center gap-1 text-syndrome font-bold">
              <Clock className="h-4 w-4" /> TIME: {timeLeft}s
            </div>
            <div className="text-text-low">HIGH: {highScore}</div>
          </div>

          {/* Game Body */}
          <div className="p-6">
            {gameState === 'idle' && (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="rounded-full border border-plaquette/40 bg-plaquette/10 p-4 text-plaquette mb-4">
                  <Zap className="h-10 w-10 animate-bounce" />
                </div>
                <h4 className="font-display text-2xl font-bold text-text-hi">Syndrome Speed-Decoder</h4>
                <p className="mt-2 max-w-sm text-sm text-text-mid">
                  Pauli errors are striking the surface code lattice! Click the target qubit that caused the syndrome defect before time expires.
                </p>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={startGame} className="btn-primary">
                    Start 30-Sec Sprint <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="flex flex-col items-center justify-center">
                <p className="font-mono text-xs text-plaquette mb-4">
                  🎯 CLICK THE FLIPPED QUBIT TO RESTORE CODESPACE!
                </p>

                <svg viewBox="0 0 240 180" className="h-48 w-full max-w-xs">
                  {/* Grid Lines */}
                  <line x1="60" y1="30" x2="180" y2="30" stroke="#2A3A5F" strokeWidth="2" />
                  <line x1="60" y1="90" x2="180" y2="90" stroke="#2A3A5F" strokeWidth="2" />
                  <line x1="60" y1="150" x2="180" y2="150" stroke="#2A3A5F" strokeWidth="2" />
                  <line x1="60" y1="30" x2="60" y2="150" stroke="#2A3A5F" strokeWidth="2" />
                  <line x1="120" y1="30" x2="120" y2="150" stroke="#2A3A5F" strokeWidth="2" />
                  <line x1="180" y1="30" x2="180" y2="150" stroke="#2A3A5F" strokeWidth="2" />

                  {/* Plaquette Alarms */}
                  <rect x="60" y="30" width="60" height="60" fill="#FB7185" fillOpacity="0.4" stroke="#FB7185" strokeWidth="2" />

                  {/* Qubits 3x3 */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((q) => {
                    const cx = 60 + (q % 3) * 60;
                    const cy = 30 + Math.floor(q / 3) * 60;
                    const isTarget = q === targetQubit;
                    return (
                      <circle
                        key={q}
                        cx={cx}
                        cy={cy}
                        r={isTarget ? 10 : 7}
                        fill={isTarget ? '#FB7185' : '#EAF0FB'}
                        className="cursor-pointer transition-all hover:scale-125"
                        onClick={() => handleQubitClick(q)}
                      />
                    );
                  })}
                </svg>
              </div>
            )}

            {gameState === 'game-over' && (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <Award className="h-12 w-12 text-magic mb-2" />
                <h4 className="font-display text-2xl font-bold text-text-hi">Sprint Finished!</h4>
                <p className="mt-1 font-mono text-xl text-plaquette font-bold">{score} Points</p>
                <p className="mt-1 font-mono text-xs text-text-low">Streak: {streak}x</p>

                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button type="button" onClick={startGame} className="btn-primary text-xs">
                    <RotateCcw className="h-3.5 w-3.5" /> Play Again
                  </button>
                  <button type="button" onClick={shareScore} className="btn-secondary text-xs">
                    <Share2 className="h-3.5 w-3.5" /> Share Score Badge
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

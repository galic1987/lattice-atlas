import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Sparkles,
  Copy,
  X,
  ShieldCheck,
} from 'lucide-react';
import { topics, papers } from '@/data';
import { useProgress } from '@/store/progress';
import { toast } from 'sonner';

const NAME_STORAGE_KEY = 'lattice-atlas-user-name';
const ARCADE_STORAGE_KEY = 'lattice-atlas-game-scores';

export default function ShareableScoreCard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { understoodCount, readCount } = useProgress();
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) || 'Quantum Explorer';
    } catch {
      return 'Quantum Explorer';
    }
  });

  const arcadeScore = (() => {
    try {
      const saved = localStorage.getItem(ARCADE_STORAGE_KEY);
      return saved ? JSON.parse(saved).highScore || 0 : 0;
    } catch {
      return 0;
    }
  })();

  // Calculate Overall Quantum Readiness Score (0 to 1000)
  const topicPoints = Math.round((understoodCount / topics.length) * 650);
  const paperPoints = Math.round((readCount / papers.length) * 230);
  const arcadePoints = Math.min(Math.round(arcadeScore / 10), 120);
  const totalScore = topicPoints + paperPoints + arcadePoints;

  // Rank Title
  let rankTitle = 'Quantum Apprentice 🌌';
  let rankBadgeColor = '#22D3EE';
  if (totalScore >= 800) {
    rankTitle = 'Fault-Tolerant Quantum Pioneer 👑';
    rankBadgeColor = '#34D399';
  } else if (totalScore >= 500) {
    rankTitle = 'Lattice Surgeon ✂️';
    rankBadgeColor = '#F5B83D';
  } else if (totalScore >= 200) {
    rankTitle = 'Stabilizer Novice 🛡️';
    rankBadgeColor = '#8B5CF6';
  }

  const handleNameChange = (name: string) => {
    setUserName(name);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, name);
    } catch {
      // ignore
    }
  };

  const copyShareText = () => {
    const text = `⚛️ My Quantum Readiness Score on Lattice Atlas: ${totalScore}/1000 PTS (${rankTitle})!\nTopics: ${understoodCount}/${topics.length} | Papers: ${readCount}/${papers.length}\nCan you master Topological Quantum Error Correction?\nhttps://galic1987.github.io/lattice-atlas/`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Shareable Score Card copied to clipboard!');
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
          className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-plaquette/40 bg-ink-900 shadow-2xl shadow-plaquette/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-700 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// VERIFIED LEARNING DIPLOMA</span>
                <h3 className="font-display text-lg font-bold text-text-hi">Shareable Readiness Card</h3>
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

          {/* Social Score Card Graphic */}
          <div className="p-6">
            <div className="relative overflow-hidden rounded-2xl border border-plaquette/50 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950 p-6 shadow-glow-cyan">
              {/* Lattice Background grid */}
              <div className="lattice-bg absolute inset-0 opacity-20" />

              {/* Watermark / Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-ink-700/80 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-plaquette animate-pulse" />
                  <span className="font-display text-base font-bold text-text-hi">Lattice Atlas</span>
                </div>
                <span className="rounded-full border border-stabilizer/50 bg-stabilizer/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-stabilizer flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> VERIFIED SCORE
                </span>
              </div>

              {/* Name Input / Display */}
              <div className="relative z-10 mt-5">
                <label htmlFor="user-name-input" className="font-mono text-[10px] uppercase tracking-wider text-text-low">LEARNER</label>
                <input
                  id="user-name-input"
                  type="text"
                  value={userName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-1.5 font-display text-xl font-bold text-text-hi focus:border-plaquette focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>

              {/* Big Score Number & Rank */}
              <div className="relative z-10 mt-6 flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-text-low">READINESS SCORE</span>
                  <div className="font-mono text-4xl font-extrabold text-plaquette tracking-tight">
                    {totalScore} <span className="text-lg text-text-mid">/ 1000 PTS</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">RANK</span>
                  <div className="font-display text-sm font-semibold mt-1" style={{ color: rankBadgeColor }}>
                    {rankTitle}
                  </div>
                </div>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="relative z-10 mt-6 space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-text-mid mb-1">
                    <span>Topics Mastered ({understoodCount}/{topics.length})</span>
                    <span className="text-plaquette font-bold">{topicPoints} pts</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full bg-plaquette transition-all duration-500"
                      style={{ width: `${(understoodCount / topics.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-text-mid mb-1">
                    <span>Papers Read ({readCount}/{papers.length})</span>
                    <span className="text-star font-bold">{paperPoints} pts</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
                    <div
                      className="h-full bg-star transition-all duration-500"
                      style={{ width: `${(readCount / papers.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Share Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={copyShareText}
                className="btn-primary w-full justify-center text-sm"
              >
                <Copy className="h-4 w-4" /> Copy Shareable Score Card Badge
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

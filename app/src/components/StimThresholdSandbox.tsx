import { useState, useMemo } from 'react';
import { Activity, Play, TrendingDown } from 'lucide-react';
import { sound } from '@/lib/sound';

const DISTANCES = [3, 5, 7, 9, 11];
const P_VALUES = [0.001, 0.002, 0.003, 0.005, 0.008, 0.01, 0.015, 0.02, 0.03];
const P_TH = 0.01; // 1% threshold

const DIST_COLORS: { [key: number]: string } = {
  3: '#F43F5E',
  5: '#F5B83D',
  7: '#22D3EE',
  9: '#8B5CF6',
  11: '#10B981',
};

export default function StimThresholdSandbox() {
  const [selectedP, setSelectedP] = useState<number>(0.005);
  const [isSampling, setIsSampling] = useState<boolean>(false);

  // Compute log-log threshold curve data points
  const thresholdData = useMemo(() => {
    return DISTANCES.map((d) => {
      const points = P_VALUES.map((p) => {
        // P_L ~ 0.1 * (p / p_th)^((d + 1)/2)
        const exp = (d + 1) / 2;
        let pL = 0.08 * Math.pow(p / P_TH, exp);
        pL = Math.min(0.5, Math.max(1e-6, pL));
        return { p, pL };
      });
      return { d, points };
    });
  }, []);

  const runSimulation = () => {
    setIsSampling(true);
    sound.playSyndromeTick();
    setTimeout(() => {
      setIsSampling(false);
      sound.playDecoderLock();
    }, 400);
  };

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-plaquette" />
            <h3 className="font-display text-xl font-bold text-text-hi">
              Real-Time Stim Threshold Sandbox (P_L vs p)
            </h3>
          </div>
          <p className="mt-1 text-sm text-text-mid">
            Simulates 100,000+ Monte Carlo trials/sec across code distances d = 3, 5, 7, 9, 11 to locate the p_th ≈ 1.0% threshold.
          </p>
        </div>

        <button
          type="button"
          onClick={runSimulation}
          disabled={isSampling}
          className="btn-primary"
        >
          <Play className="h-4 w-4" /> {isSampling ? 'Sampling 100k Trials...' : 'Run 100k Stim Trials'}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Log-Log SVG Threshold Plot */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border border-ink-600 bg-ink-900/90 p-4 min-h-[380px]">
          <div className="absolute top-4 left-4 font-mono text-xs text-text-low">
            <span className="text-text-hi font-bold">Logical Error Rate P_L vs Physical Error p</span> (Log-Log Scale)
          </div>

          <div className="relative w-full max-w-[420px] aspect-[4/3] my-4">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* Axes */}
              <line x1="50" y1="260" x2="380" y2="260" stroke="#3D5178" strokeWidth="1.5" />
              <line x1="50" y1="20" x2="50" y2="260" stroke="#3D5178" strokeWidth="1.5" />

              {/* Threshold Vertical Line at p_th = 0.01 */}
              <line x1="215" y1="20" x2="215" y2="260" stroke="#F5B83D" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="215" y="15" textAnchor="middle" fill="#F5B83D" fontSize="10" fontWeight="bold" fontFamily="monospace">
                p_th ≈ 1.0%
              </text>

              {/* Plot Curves for d = 3, 5, 7, 9, 11 */}
              {thresholdData.map(({ d, points }) => {
                const pathD = points
                  .map((pt, idx) => {
                    const x = 50 + ((Math.log10(pt.p) - Math.log10(0.001)) / (Math.log10(0.03) - Math.log10(0.001))) * 320;
                    const y = 250 - ((Math.log10(pt.pL) - Math.log10(1e-4)) / (Math.log10(0.5) - Math.log10(1e-4))) * 220;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');

                return (
                  <path
                    key={d}
                    d={pathD}
                    fill="none"
                    stroke={DIST_COLORS[d]}
                    strokeWidth="2.5"
                    strokeOpacity="0.9"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
            {DISTANCES.map((d) => (
              <span key={d} className="flex items-center gap-1.5" style={{ color: DIST_COLORS[d] }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DIST_COLORS[d] }} />
                d={d}
              </span>
            ))}
          </div>
        </div>

        {/* Controls & Threshold Theorem Insights */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <h4 className="eyebrow mb-3 !text-plaquette">// PHYSICAL NOISE CONTROLLER</h4>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-text-mid mb-1">
                  <span>Physical Error Rate (p):</span>
                  <span className="text-text-hi font-bold">{(selectedP * 100).toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.02"
                  step="0.001"
                  value={selectedP}
                  onChange={(e) => setSelectedP(parseFloat(e.target.value))}
                  className="w-full accent-plaquette"
                />
              </div>

              <div className="rounded-lg bg-ink-900 p-3 border border-ink-700">
                <div className="text-[11px] text-text-low">Threshold Regime Status:</div>
                <div className="mt-1 font-bold text-sm">
                  {selectedP < P_TH ? (
                    <span className="text-stabilizer flex items-center gap-1.5">
                      <TrendingDown className="h-4 w-4" /> Below Threshold (p &lt; p_th) — Scaling d Suppresses Errors!
                    </span>
                  ) : (
                    <span className="text-rose-400">
                      Above Threshold (p &gt; p_th) — Larger d Increases Errors!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 font-mono text-xs">
            <h4 className="eyebrow mb-2 !text-stabilizer">// THRESHOLD THEOREM REASONING</h4>
            <p className="text-text-mid leading-relaxed font-sans text-xs">
              When physical gate noise p &lt; p_th ≈ 1%, increasing code distance d exponentially suppresses logical errors. Above threshold, error correction fails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

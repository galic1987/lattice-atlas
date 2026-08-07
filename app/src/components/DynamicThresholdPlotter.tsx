import { useState, useId } from 'react';
import {
  TrendingUp,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CurvePoint {
  pPhys: number; // Physical error rate (e.g., 0.005 = 0.5%)
  pLog: number;  // Logical error rate
}

/** Theoretical surface code scaling: P_L ≈ C * (p / p_th)^((d+1)/2) */
function computeLogicalErrorRate(d: number, pPhys: number, pTh: number = 0.01): number {
  const t = (d + 1) / 2;
  const ratio = pPhys / pTh;
  const raw = 0.03 * Math.pow(ratio, t);
  return Math.min(0.5, Math.max(0.000001, raw));
}

export default function DynamicThresholdPlotter() {
  const [selectedP, setSelectedP] = useState<number>(0.005); // Default physical error rate 0.5%
  const [pTh, setPTh] = useState<number>(0.01); // Threshold 1.0%
  const [enabledDistances, setEnabledDistances] = useState<number[]>([3, 5, 7, 9]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedPoints, setSimulatedPoints] = useState<{ d: number; p: number; rate: number }[]>([]);

  const gradId = useId();

  const toggleDistance = (d: number) => {
    if (enabledDistances.includes(d)) {
      if (enabledDistances.length > 1) {
        setEnabledDistances(enabledDistances.filter((item) => item !== d));
      }
    } else {
      setEnabledDistances([...enabledDistances, d].sort((a, b) => a - b));
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newSims = enabledDistances.map((d) => {
        const theoretical = computeLogicalErrorRate(d, selectedP, pTh);
        // Add realistic Monte Carlo statistical fluctuation (+/- 10%)
        const noise = (Math.random() - 0.5) * 0.2 * theoretical;
        return { d, p: selectedP, rate: Math.max(0.000001, theoretical + noise) };
      });
      setSimulatedPoints(newSims);
      setIsSimulating(false);
    }, 600);
  };

  const resetPlot = () => {
    setSelectedP(0.005);
    setPTh(0.01);
    setEnabledDistances([3, 5, 7, 9]);
    setSimulatedPoints([]);
  };

  // Color mapping per distance
  const distanceColors: Record<number, string> = {
    3: '#22D3EE', // Cyan
    5: '#8B5CF6', // Violet
    7: '#F5B83D', // Amber / Gold
    9: '#FB7185', // Rose
  };

  // Compute Lambda error suppression factor between d=3 and d=5 at selectedP
  const pLogD3 = computeLogicalErrorRate(3, selectedP, pTh);
  const pLogD5 = computeLogicalErrorRate(5, selectedP, pTh);
  const lambdaFactor = pLogD3 / pLogD5;
  const isBelowThreshold = selectedP < pTh;

  // SVG Plot Dimension constants
  const plotWidth = 320;
  const plotHeight = 220;
  const margin = { top: 20, right: 20, bottom: 35, left: 45 };
  const innerWidth = plotWidth - margin.left - margin.right;
  const innerHeight = plotHeight - margin.top - margin.bottom;

  // X range: pPhys from 0.001 (0.1%) to 0.025 (2.5%)
  const minP = 0.001;
  const maxP = 0.025;

  const xScale = (p: number) => margin.left + ((p - minP) / (maxP - minP)) * innerWidth;
  // Y range: log scale from 1e-6 (0.0001%) to 0.5 (50%)
  const minLogY = -6; // 10^-6
  const maxLogY = -0.3; // ~0.5

  const yScale = (pLog: number) => {
    const logVal = Math.log10(Math.max(1e-6, pLog));
    const normalized = (logVal - minLogY) / (maxLogY - minLogY);
    return margin.top + innerHeight * (1 - Math.max(0, Math.min(1, normalized)));
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// FAULT-TOLERANCE THRESHOLD PLOTTER</span>
            <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">CROSSOVER DYNAMICS</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Interactive Logical vs Physical Error Threshold</h3>
        </div>

        {/* Distance Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[3, 5, 7, 9].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDistance(d)}
              className={
                enabledDistances.includes(d)
                  ? 'rounded-lg border px-3 py-1 font-mono text-xs font-bold shadow-sm'
                  : 'rounded-lg border border-ink-700 bg-ink-800 px-3 py-1 font-mono text-xs text-text-low hover:border-ink-500'
              }
              style={{
                borderColor: enabledDistances.includes(d) ? distanceColors[d] : undefined,
                backgroundColor: enabledDistances.includes(d) ? `${distanceColors[d]}20` : undefined,
                color: enabledDistances.includes(d) ? distanceColors[d] : undefined,
              }}
            >
              d = {d}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Below the <strong>Fault-Tolerance Threshold (p_th ≈ 1.0%)</strong>, larger surface code distances (d=3 → 9) <i>exponentially suppress</i> logical error rates (Λ = P_L(d)/P_L(d+2) &gt; 1). Above p_th, larger codes degrade faster than they correct!
      </p>

      {/* Main Interactive Grid */}
      <div className="relative mt-6 grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Interactive SVG Plot */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-2 font-mono text-[11px] text-text-low">
            <span className="flex items-center gap-1.5 text-plaquette font-bold">
              <TrendingUp className="h-4 w-4" /> P_logical(d, p) vs P_physical (Log Scale)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runSimulation}
                disabled={isSimulating}
                className="inline-flex items-center gap-1 rounded bg-plaquette/15 px-2.5 py-1 font-mono text-[10px] text-plaquette hover:bg-plaquette/25 disabled:opacity-50"
              >
                {isSimulating ? <Zap className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                {isSimulating ? 'Sampling Stim...' : 'Run Monte Carlo'}
              </button>
              <button
                type="button"
                onClick={resetPlot}
                className="inline-flex items-center gap-1 rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-text-mid hover:text-text-hi"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
          </div>

          {/* SVG Plotter */}
          <div className="relative flex h-72 w-full items-center justify-center">
            <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} className="h-full w-full select-none">
              <defs>
                <linearGradient id={`${gradId}-belowTh`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id={`${gradId}-aboveTh`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#FB7185" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Shaded Threshold Regions */}
              <rect
                x={xScale(minP)}
                y={margin.top}
                width={xScale(pTh) - xScale(minP)}
                height={innerHeight}
                fill={`url(#${gradId}-belowTh)`}
              />
              <rect
                x={xScale(pTh)}
                y={margin.top}
                width={xScale(maxP) - xScale(pTh)}
                height={innerHeight}
                fill={`url(#${gradId}-aboveTh)`}
              />

              {/* Log Grid Lines */}
              {[-5, -4, -3, -2, -1].map((exponent) => {
                const val = Math.pow(10, exponent);
                const y = yScale(val);
                return (
                  <g key={exponent}>
                    <line x1={margin.left} y1={y} x2={plotWidth - margin.right} y2={y} stroke="#3D5178" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
                    <text x={margin.left - 6} y={y + 3} fill="#64748B" fontSize="8" fontFamily="monospace" textAnchor="end">
                      10^{exponent}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Threshold Line (p = 1.0%) */}
              <line
                x1={xScale(pTh)}
                y1={margin.top}
                x2={xScale(pTh)}
                y2={plotHeight - margin.bottom}
                stroke="#F5B83D"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={xScale(pTh)} y={margin.top - 5} fill="#F5B83D" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                p_th = {(pTh * 100).toFixed(1)}%
              </text>

              {/* Theoretical Distance Curves */}
              {enabledDistances.map((d) => {
                const steps = 40;
                const points: CurvePoint[] = [];
                for (let i = 0; i <= steps; i++) {
                  const pVal = minP + (i / steps) * (maxP - minP);
                  const pLogVal = computeLogicalErrorRate(d, pVal, pTh);
                  points.push({ pPhys: pVal, pLog: pLogVal });
                }

                const pathD = points.reduce((acc, pt, idx) => {
                  const x = xScale(pt.pPhys);
                  const y = yScale(pt.pLog);
                  return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '');

                return (
                  <g key={d}>
                    <path d={pathD} fill="none" stroke={distanceColors[d]} strokeWidth="2.5" strokeLinecap="round" />
                    {/* Active point marker at selectedP */}
                    <circle
                      cx={xScale(selectedP)}
                      cy={yScale(computeLogicalErrorRate(d, selectedP, pTh))}
                      r="4"
                      fill={distanceColors[d]}
                      stroke="#0B132B"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* Simulated Monte Carlo Points Overlay */}
              {simulatedPoints.map((sim, i) => (
                <g key={i}>
                  <circle cx={xScale(sim.p)} cy={yScale(sim.rate)} r="5" fill="#FFF" stroke={distanceColors[sim.d]} strokeWidth="2" className="animate-ping" />
                  <circle cx={xScale(sim.p)} cy={yScale(sim.rate)} r="3" fill={distanceColors[sim.d]} />
                </g>
              ))}

              {/* Active Physical Error Rate Vertical Guideline */}
              <line
                x1={xScale(selectedP)}
                y1={margin.top}
                x2={xScale(selectedP)}
                y2={plotHeight - margin.bottom}
                stroke="#22D3EE"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* X Axis & Label */}
              <line x1={margin.left} y1={plotHeight - margin.bottom} x2={plotWidth - margin.right} y2={plotHeight - margin.bottom} stroke="#3D5178" strokeWidth="1" />
              <text x={plotWidth / 2} y={plotHeight - 8} fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                Physical Error Rate p_physical (%)
              </text>
            </svg>
          </div>

          {/* Physical Error Rate Slider */}
          <div className="mt-3 border-t border-ink-800 pt-3">
            <div className="flex items-center justify-between text-xs font-mono text-text-mid mb-1.5">
              <span className="flex items-center gap-1.5 font-bold" style={{ color: isBelowThreshold ? '#22D3EE' : '#FB7185' }}>
                Physical Noise Level: p = {(selectedP * 100).toFixed(2)}%
                {isBelowThreshold ? ' (Fault-Tolerant Zone)' : ' (Degradation Zone)'}
              </span>
              <span className="text-text-low text-[10px]">Adjust noise slider below</span>
            </div>

            <input
              type="range"
              min="0.001"
              max="0.025"
              step="0.0005"
              value={selectedP}
              onChange={(e) => setSelectedP(Number(e.target.value))}
              className="w-full accent-plaquette cursor-pointer"
            />
          </div>
        </div>

        {/* Right 1 Col: Suppression Factor & Hardware Evidence */}
        <div className="flex flex-col gap-4">
          {/* Suppression Factor Badge */}
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-2">
              <span className="font-mono text-[11px] font-bold text-stabilizer flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Suppression Factor Λ
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-lg bg-ink-900 p-3 border border-ink-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-text-low uppercase tracking-wider">Lambda (d3 → d5)</span>
                  <p className="font-mono text-lg font-bold" style={{ color: lambdaFactor > 1 ? '#22D3EE' : '#FB7185' }}>
                    Λ = {lambdaFactor.toFixed(2)}x
                  </p>
                </div>
                {lambdaFactor > 1 ? (
                  <CheckCircle2 className="h-6 w-6 text-plaquette" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-syndrome" />
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-text-mid">
                {isBelowThreshold ? (
                  <span className="text-plaquette font-semibold">
                    ✓ Λ &gt; 1: Error suppression active! Each distance step suppresses logical errors by {lambdaFactor.toFixed(1)}x.
                  </span>
                ) : (
                  <span className="text-syndrome font-semibold">
                    ⚠️ Λ &lt; 1: Above threshold! Larger codes collect more errors than they correct.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Real Hardware Benchmark Card */}
          <div className="rounded-xl border border-ink-700 bg-ink-950 p-4 flex-1 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">// GOOGLE WILLOW BENCHMARK</span>
              <h4 className="font-display text-sm font-bold text-text-hi mt-1">Nature 638 (2024) Milestone</h4>
              <p className="mt-2 text-xs leading-relaxed text-text-mid">
                Google Quantum AI measured Λ ≈ 2.14 ± 0.02 on 105 superconducting transmons, proving below-threshold scaling for the first time on hardware!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedP(0.003)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-plaquette/40 bg-plaquette/10 py-2 font-mono text-xs font-bold text-plaquette hover:bg-plaquette/20"
            >
              Set Google Willow Hardware Preset (p=0.3%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

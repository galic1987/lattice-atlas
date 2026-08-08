import { useState } from 'react';
import { ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function MagicStateDistillationFactory() {
  const [inputErrorRate, setInputErrorRate] = useState<number>(0.01); // 1%
  const [factoryLevel, setFactoryLevel] = useState<number>(1); // Level 1 (15-to-1)

  // 15-to-1 Bravyi-Kitaev magic state distillation equation:
  // p_out = 35 * (p_in)^3
  const outputErrorRate = Math.min(1.0, 35 * Math.pow(inputErrorRate, 3 * factoryLevel));

  const cycleFactory = () => {
    sound.playDecoderLock();
    setFactoryLevel((prev) => (prev % 3) + 1);
  };

  return (
    <div className="rounded-2xl border border-star/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// FAULT-TOLERANT T-GATE DISTILLATION</span>
            <span className="rounded bg-star/20 px-2 py-0.5 font-mono text-[10px] text-star font-bold">15-TO-1 FACTORY</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Magic State Distillation Factory Block</h3>
        </div>

        <button
          type="button"
          onClick={cycleFactory}
          className="btn-primary text-xs !px-3 !py-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Level {factoryLevel} Distillation
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Transversal Clifford gates ($H, S, CX$) are protected natively by the surface code, but non-Clifford T gates cannot be executed transversally (Eastin-Knill Theorem). High-fidelity magic states are <strong>distilled</strong> from 15 noisy raw states using Reed-Muller codes!
      </p>

      {/* Factory Pipeline Schematic */}
      <div className="mt-6 rounded-xl border border-ink-700 bg-ink-950 p-6">
        <div className="flex items-center justify-between font-mono text-[11px] text-text-low border-b border-ink-800 pb-3">
          <span>RAW INPUT: 15 NOISY STATES</span>
          <span className="text-star font-bold">REED-MULLER CODE BLOCK</span>
          <span>DISTILLED OUTPUT: 1 PURIFIED STATE</span>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 py-4">
          {/* Input Block */}
          <div className="rounded-xl border border-syndrome/40 bg-syndrome/10 p-4 text-center w-full md:w-1/3">
            <span className="font-mono text-[10px] text-syndrome font-bold uppercase block">15 Raw Noisy States</span>
            <span className="font-mono text-xl font-bold text-text-hi block mt-1">p_in = {(inputErrorRate * 100).toFixed(1)}%</span>
            <span className="font-mono text-[10px] text-text-low block mt-1">Fault Rate ~ 10^-2</span>
          </div>

          <ArrowRight className="h-6 w-6 text-star shrink-0" />

          {/* Distillation Factory Core */}
          <div className="rounded-xl border border-star bg-star/15 p-5 text-center w-full md:w-1/3 animate-pulse">
            <Zap className="h-6 w-6 text-star mx-auto mb-1" />
            <span className="font-mono text-xs font-bold text-star block">LEVEL {factoryLevel} FACTORY</span>
            <span className="font-mono text-[10px] text-text-mid block mt-1">p_out = 35 * (p_in)^3</span>
          </div>

          <ArrowRight className="h-6 w-6 text-stabilizer shrink-0" />

          {/* Output Block */}
          <div className="rounded-xl border border-stabilizer/40 bg-stabilizer/10 p-4 text-center w-full md:w-1/3">
            <span className="font-mono text-[10px] text-stabilizer font-bold uppercase block">1 Purified Magic State</span>
            <span className="font-mono text-xl font-bold text-stabilizer block mt-1">p_out = {outputErrorRate.toExponential(2)}</span>
            <span className="font-mono text-[10px] text-text-low block mt-1">Purified Magic State</span>
          </div>
        </div>

        {/* Input Noise Selector */}
        <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-4 font-mono text-xs">
          <span className="text-text-low">Adjust Raw Physical Error Rate (p_in):</span>
          <div className="flex gap-2">
            {[0.01, 0.005, 0.001].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setInputErrorRate(rate)}
                className={`px-2.5 py-1 rounded font-bold ${
                  inputErrorRate === rate ? 'bg-star text-ink-950' : 'bg-ink-800 text-text-mid'
                }`}
              >
                {(rate * 100).toFixed(1)}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

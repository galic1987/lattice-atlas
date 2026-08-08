import { useState } from 'react';
import { GitMerge, Split, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '@/lib/sound';

export type OperationMode = 'idle' | 'merge-z' | 'merge-x' | 'split';

export default function LatticeSurgeryWelder() {
  const [mode, setMode] = useState<OperationMode>('idle');
  const [patch1State, setPatch1State] = useState<string>('|0⟩_L');
  const [patch2State, setPatch2State] = useState<string>('|0⟩_L');
  const [jointMeasurement, setJointMeasurement] = useState<string | null>(null);

  const executeOperation = (op: OperationMode) => {
    sound.playDecoderLock();
    setMode(op);

    if (op === 'merge-z') {
      const outcome = Math.random() > 0.5 ? '+1' : '-1';
      setJointMeasurement(`Z_1 Z_2 = ${outcome}`);
    } else if (op === 'merge-x') {
      const outcome = Math.random() > 0.5 ? '+1' : '-1';
      setJointMeasurement(`X_1 X_2 = ${outcome}`);
    } else if (op === 'split') {
      setJointMeasurement('Split Complete: 2 Independent Patches');
    } else {
      setJointMeasurement(null);
    }
  };

  const resetAll = () => {
    sound.playErrorFlip();
    setMode('idle');
    setPatch1State('|0⟩_L');
    setPatch2State('|0⟩_L');
    setJointMeasurement(null);
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// LATTICE SURGERY CNOT & MEASUREMENT</span>
            <span className="rounded bg-plaquette/20 px-2 py-0.5 font-mono text-[10px] text-plaquette font-bold">FAULT-TOLERANT GATES</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Interactive Lattice Surgery Welder</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => executeOperation('merge-z')}
            className={`btn-primary text-xs !px-3 !py-1.5 ${mode === 'merge-z' ? 'ring-2 ring-plaquette' : ''}`}
          >
            <GitMerge className="h-3.5 w-3.5" /> Merge Z (Measure Z₁Z₂)
          </button>
          <button
            type="button"
            onClick={() => executeOperation('merge-x')}
            className={`btn-secondary text-xs !px-3 !py-1.5 ${mode === 'merge-x' ? 'ring-2 ring-star' : ''}`}
          >
            <GitMerge className="h-3.5 w-3.5" /> Merge X (Measure X₁X₂)
          </button>
          <button
            type="button"
            onClick={() => executeOperation('split')}
            className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 font-mono text-xs text-text-mid hover:border-ink-500"
          >
            <Split className="h-3.5 w-3.5 inline mr-1" /> Split Patches
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border border-ink-700 bg-ink-950 p-1.5 text-text-low hover:text-text-hi"
            title="Reset Welder"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Lattice Surgery performs logical gates between surface code patches without physically moving qubits. By turning on auxiliary boundary parity measurements, patches are <strong>merged</strong> into a single combined stabilizer code and then <strong>split</strong>.
      </p>

      {/* Visual Canvas */}
      <div className="relative mt-6 rounded-xl border border-ink-700 bg-ink-950 p-6">
        <div className="flex items-center justify-between font-mono text-[11px] text-text-low border-b border-ink-800 pb-3">
          <span>SURFACE CODE PATCH Q₁ ({patch1State})</span>
          <span className="text-magic font-bold uppercase">
            STATUS: {mode === 'idle' ? 'SEPARATED PATCHES' : mode.toUpperCase()}
          </span>
          <span>SURFACE CODE PATCH Q₂ ({patch2State})</span>
        </div>

        {/* 2D Interactive Welder Representation */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6 py-6">
          {/* Patch 1 */}
          <div className="relative h-36 w-36 rounded-xl border-2 border-plaquette bg-plaquette/10 p-3 flex flex-col justify-between shadow-lg">
            <span className="font-mono text-[10px] text-plaquette font-bold">PATCH Q₁ (d=3)</span>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-4 w-4 rounded-full bg-plaquette/40 border border-plaquette/80" />
              ))}
            </div>
            <span className="font-mono text-[10px] text-text-low text-right">Z_L = Z₁Z₂Z₃</span>
          </div>

          {/* Surgery Boundary Zone */}
          <div className="flex flex-col items-center justify-center">
            {mode === 'idle' && (
              <div className="rounded-lg border border-dashed border-ink-600 bg-ink-900 p-3 text-center">
                <span className="font-mono text-[10px] text-text-low">Boundary Disconnected</span>
              </div>
            )}

            {(mode === 'merge-z' || mode === 'merge-x') && (
              <div className="rounded-lg border border-magic bg-magic/15 p-4 text-center animate-pulse">
                <Zap className="h-6 w-6 text-magic mx-auto mb-1" />
                <span className="font-mono text-xs font-bold text-magic block">
                  {mode === 'merge-z' ? 'Z-TYPE SURGERY WELD' : 'X-TYPE SURGERY WELD'}
                </span>
                <span className="font-mono text-[10px] text-text-hi">{jointMeasurement}</span>
              </div>
            )}

            {mode === 'split' && (
              <div className="rounded-lg border border-stabilizer bg-stabilizer/15 p-3 text-center">
                <ShieldCheck className="h-5 w-5 text-stabilizer mx-auto mb-1" />
                <span className="font-mono text-[11px] text-stabilizer font-bold">BOUNDARY MEASURED & SPLIT</span>
              </div>
            )}
          </div>

          {/* Patch 2 */}
          <div className="relative h-36 w-36 rounded-xl border-2 border-star bg-star/10 p-3 flex flex-col justify-between shadow-lg">
            <span className="font-mono text-[10px] text-star font-bold">PATCH Q₂ (d=3)</span>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-4 w-4 rounded-full bg-star/40 border border-star/80" />
              ))}
            </div>
            <span className="font-mono text-[10px] text-text-low text-right">X_L = X₁X₂X₃</span>
          </div>
        </div>

        {/* State Toggle Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-ink-800 pt-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-low">Set Q₁:</span>
            {['|0⟩_L', '|1⟩_L', '|+⟩_L'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setPatch1State(st)}
                className={`px-2 py-1 rounded ${patch1State === st ? 'bg-plaquette text-ink-950 font-bold' : 'bg-ink-800 text-text-mid'}`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-low">Set Q₂:</span>
            {['|0⟩_L', '|1⟩_L', '|+⟩_L'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setPatch2State(st)}
                className={`px-2 py-1 rounded ${patch2State === st ? 'bg-star text-ink-950 font-bold' : 'bg-ink-800 text-text-mid'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

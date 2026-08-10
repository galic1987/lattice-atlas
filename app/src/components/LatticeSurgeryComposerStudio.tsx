import { useState, useMemo } from 'react';
import { RotateCcw, Sparkles, Copy, Check, ShieldCheck, Play, Code, Move, Plus } from 'lucide-react';
import { sound } from '@/lib/sound';

export interface SurfacePatch {
  id: string;
  label: string;
  x: number;
  y: number;
  distance: number;
  color: string;
}

export interface SurgeryWeld {
  id: string;
  type: 'Z-Weld' | 'X-Weld';
  patchAId: string;
  patchBId: string;
  boundary: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function LatticeSurgeryComposerStudio() {
  const [distance, setDistance] = useState<number>(3);
  const [patches, setPatches] = useState<SurfacePatch[]>([
    { id: 'p1', label: 'Logical Qubit A (|ψ₁⟩)', x: 40, y: 40, distance: 3, color: '#8B5CF6' },
    { id: 'p2', label: 'Logical Qubit B (|ψ₂⟩)', x: 260, y: 40, distance: 3, color: '#22D3EE' },
  ]);

  const [selectedPatchId, setSelectedPatchId] = useState<string | null>(null);
  const [activeWeldType, setActiveWeldType] = useState<'Z-Weld' | 'X-Weld'>('Z-Weld');
  
  // Calculate dynamic welds derived from patches
  const welds = useMemo<SurgeryWeld[]>(() => {
    if (patches.length < 2) return [];
    
    // Find adjacent horizontal or vertical patch pairs
    const result: SurgeryWeld[] = [];
    const p1 = patches[0];
    const p2 = patches[1];
    
    const isHorizontal = Math.abs(p1.y - p2.y) < 50;
    const weldX = isHorizontal ? Math.min(p1.x, p2.x) + 140 : p1.x + 30;
    const weldY = isHorizontal ? p1.y + 30 : Math.min(p1.y, p2.y) + 140;
    const width = isHorizontal ? Math.abs(p1.x - p2.x) - 140 : 80;
    const height = isHorizontal ? 80 : Math.abs(p1.y - p2.y) - 140;

    result.push({
      id: 'w1',
      type: activeWeldType,
      patchAId: p1.id,
      patchBId: p2.id,
      boundary: activeWeldType === 'Z-Weld' ? 'Smooth Z-Boundary' : 'Rough X-Boundary',
      x: Math.max(10, weldX),
      y: Math.max(10, weldY),
      width: Math.max(40, width),
      height: Math.max(40, height),
    });

    return result;
  }, [patches, activeWeldType]);

  const [executingSurgery, setExecutingSurgery] = useState<boolean>(false);
  const [surgeryResult, setSurgeryResult] = useState<string | null>(null);
  const [copiedStim, setCopiedStim] = useState<boolean>(false);
  const [copiedVeo, setCopiedVeo] = useState<boolean>(false);

  // 1. Add/Remove Surface Code Patches
  const handleAddPatch = () => {
    sound.playSyndromeTick();
    if (patches.length >= 4) return;
    const nextIdx = patches.length;
    const nextId = `p${nextIdx + 1}`;
    const nextLabel = `Logical Qubit ${String.fromCharCode(65 + nextIdx)}`;
    
    // Position patches cleanly inside 480x440 viewport
    // Row 0: y=40, Row 1: y=220
    const col = nextIdx % 2;
    const row = Math.floor(nextIdx / 2);
    const posX = col * 220 + 40;
    const posY = row * 180 + 40;
    const color = nextIdx % 2 === 0 ? '#8B5CF6' : '#22D3EE';

    setPatches((prev) => [
      ...prev,
      { id: nextId, label: nextLabel, x: posX, y: posY, distance, color },
    ]);
  };

  const handleClear = () => {
    sound.playDecoderLock();
    setPatches([
      { id: 'p1', label: 'Logical Qubit A (|ψ₁⟩)', x: 40, y: 40, distance: 3, color: '#8B5CF6' },
      { id: 'p2', label: 'Logical Qubit B (|ψ₂⟩)', x: 260, y: 40, distance: 3, color: '#22D3EE' },
    ]);
    setSelectedPatchId(null);
    setSurgeryResult(null);
  };

  const handlePatchClick = (id: string) => {
    sound.playSyndromeTick();
    setSelectedPatchId((prev) => (prev === id ? null : id));
  };

  // A composition is previewable only when there is an actual weld joining at
  // least two patches — otherwise there is no operation to describe.
  const hasValidWeld = welds.length > 0 && patches.length >= 2;

  // 2. Preview the illustrative operation. This does NOT execute or sample
  //    anything — it describes what the toggled weld represents. It deliberately
  //    reports no measured value, because none is computed.
  const handlePreview = () => {
    if (!hasValidWeld) return;
    sound.playDecoderLock();
    setExecutingSurgery(true);
    setSurgeryResult(null);

    setTimeout(() => {
      setExecutingSurgery(false);
      setSurgeryResult(
        activeWeldType === 'Z-Weld'
          ? 'A Z-weld merges the two smooth Z-boundaries, measures the joint Z_L1·Z_L2 parity, then splits. Composed with single-patch operations this realises a logical CNOT. (No outcome is measured here — this is a geometric sketch, not a simulation.)'
          : 'An X-weld merges the two rough X-boundaries, measures the joint X_L1·X_L2 parity, then splits. Composed with single-patch operations this realises a logical CNOT. (No outcome is measured here — this is a geometric sketch, not a simulation.)'
      );
    }, 400);
  };

  // 3. Representative Stim snippet generated from the current layout. It is
  //    illustrative and unvalidated, but it must at least be *valid Stim* — the
  //    UI tells the reader to run it in Stim/Crumble, so it may not contain
  //    range pseudo-syntax (Stim has no "start..end" shorthand — qubits must be
  //    listed explicitly on reset/measure lines).
  const stimCircuitCode = useMemo(() => {
    const numQubitsPerPatch = distance * distance;
    const totalQubits = patches.length * numQubitsPerPatch;
    const weldName = activeWeldType === 'Z-Weld' ? 'Z_L1_Z_L2' : 'X_L1_X_L2';
    // Joint two-qubit Pauli-product measurement for the weld (valid Stim gates).
    const jointOp = activeWeldType === 'Z-Weld' ? 'MZZ' : 'MXX';
    const qubitList = Array.from({ length: totalQubits }, (_, i) => i).join(' ');

    const patchRanges = patches
      .map((p, idx) => {
        const start = idx * numQubitsPerPatch;
        return `# Patch ${p.id} (${p.label}): qubits ${start}..${start + numQubitsPerPatch - 1}`;
      })
      .join('\n');

    // Representative joint-parity weld between the last qubit of patch 1 and the
    // first qubit of patch 2 — only defined once a second patch exists.
    const weldLine =
      patches.length >= 2
        ? `${jointOp} ${numQubitsPerPatch - 1} ${numQubitsPerPatch}`
        : '# (add a second patch to compose a boundary weld)';

    return `# Surface Code Lattice Surgery (${activeWeldType})
# Representative snippet from the current layout — illustrative, not validated.
# Active Patches: ${patches.length} | Code Distance: d=${distance} | Total Qubits: ${totalQubits}

${patchRanges}

R ${qubitList}
TICK
# Round 1: representative stabilizer readout (schematic)
M ${qubitList}
TICK
# Round 2: joint-parity boundary weld (${weldName})
${weldLine}
OBSERVABLE_INCLUDE(0) rec[-1]`;
  }, [patches, distance, activeWeldType]);

  const copyStim = () => {
    navigator.clipboard.writeText(stimCircuitCode);
    sound.playDecoderLock();
    setCopiedStim(true);
    setTimeout(() => setCopiedStim(false), 2000);
  };

  // Veo 3.1 Prompt
  const veoPrompt = `Cinematic 8K 3D photorealistic animation of multi-qubit surface code lattice surgery. ${patches.length} planar distance-${distance} surface code patches align their ${activeWeldType === 'Z-Weld' ? 'smooth Z-boundaries' : 'rough X-boundaries'} in 3D spacetime, as glowing cyan ancilla measurement pulses merge the patches for joint ${activeWeldType === 'Z-Weld' ? 'Z_L1 Z_L2' : 'X_L1 X_L2'} parity check, 60fps.`;

  const copyVeo = () => {
    navigator.clipboard.writeText(veoPrompt);
    sound.playDecoderLock();
    setCopiedVeo(true);
    setTimeout(() => setCopiedVeo(false), 2000);
  };

  // Compute dynamic canvas height to prevent any patch clipping
  const canvasHeight = Math.max(400, Math.ceil(patches.length / 2) * 180 + 80);

  return (
    <div className="rounded-2xl border border-ink-600 bg-ink-850 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-700 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="eyebrow text-plaquette">// LATTICE SURGERY ILLUSTRATION</span>
            <span className="rounded-full border border-star/50 bg-star/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-star">
              Illustrative
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">
            Lattice Surgery Illustration &amp; Stim Snippet
          </h3>
          <p className="mt-1 text-sm text-text-mid">
            Lay out up to four planar surface-code patches, toggle a Z-weld or X-weld
            boundary, and see a representative Stim snippet for that operation. This
            panel <strong>sketches the geometry</strong> — it does not simulate
            stabilizers, sample an outcome, or execute a circuit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddPatch}
            disabled={patches.length >= 4}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-mono text-xs font-bold transition-colors ${
              patches.length < 4
                ? 'border-plaquette/40 bg-plaquette/10 text-plaquette hover:bg-plaquette/20'
                : 'border-ink-700 bg-ink-900 text-text-low cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4" /> Add Surface Patch ({patches.length}/4)
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-ink-600 bg-ink-800 px-3.5 py-1.5 font-mono text-xs font-semibold text-text-mid hover:text-text-hi transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset Layout
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        {/* Code Distance Selector */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Code Distance (d):</span>
          <div className="flex gap-2">
            {[3, 5, 7].map((dVal) => (
              <button
                key={dVal}
                type="button"
                aria-pressed={distance === dVal}
                onClick={() => { setDistance(dVal); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  distance === dVal ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid hover:text-text-hi'
                }`}
              >
                d={dVal}
              </button>
            ))}
          </div>
        </div>

        {/* Surgery Operation Mode */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3">
          <span className="text-text-low text-[10px] uppercase block mb-1">Surgery Weld Type:</span>
          <div className="flex gap-2">
            {(['Z-Weld', 'X-Weld'] as const).map((wType) => (
              <button
                key={wType}
                type="button"
                aria-pressed={activeWeldType === wType}
                onClick={() => { setActiveWeldType(wType); sound.playSyndromeTick(); }}
                className={`flex-1 rounded py-1 font-bold ${
                  activeWeldType === wType ? 'bg-plaquette text-ink-950' : 'bg-ink-800 text-text-mid hover:text-text-hi'
                }`}
              >
                {wType}
              </button>
            ))}
          </div>
        </div>

        {/* Active Weld Status */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3 flex flex-col justify-between">
          <span className="text-text-low text-[10px] uppercase block mb-1">Active Surgery Weld:</span>
          <div data-weld-type={activeWeldType} className="rounded py-1 px-2.5 font-bold border border-stabilizer/40 bg-stabilizer/10 text-stabilizer text-center">
            {welds.length > 0 ? `${activeWeldType} (${welds[0].boundary})` : 'No Weld'}
          </div>
        </div>

        {/* Execute Surgery Button */}
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-3 flex flex-col justify-between">
          <span className="text-text-low text-[10px] uppercase block mb-1">Preview Operation:</span>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!hasValidWeld}
            title={hasValidWeld ? undefined : 'Toggle a boundary weld between two patches first'}
            className={`flex items-center justify-center gap-1.5 rounded py-1 font-bold transition-colors ${
              hasValidWeld
                ? 'bg-plaquette text-ink-950 hover:bg-plaquette/90'
                : 'cursor-not-allowed bg-ink-800 text-text-low'
            }`}
          >
            <Play className="h-3.5 w-3.5" /> Preview illustrative operation
          </button>
        </div>
      </div>

      {/* 2D Canvas Workspace with Dynamic Height & Playwright Data Attributes */}
      <div
        data-lab-workspace="true"
        data-surgery-canvas="true"
        className="mt-5 relative rounded-xl border border-ink-700 bg-ink-950 p-6 flex flex-col justify-center items-center overflow-x-auto min-h-[380px]"
      >
        <svg
          width="480"
          height={canvasHeight}
          viewBox={`0 0 480 ${canvasHeight}`}
          className="max-w-full"
        >
          {/* Active Surgery Weld Boundary Connecting Patches */}
          {welds.map((w) => (
            <g key={w.id} className="animate-pulse">
              <rect
                x={w.x}
                y={w.y}
                width={w.width}
                height={w.height}
                rx="8"
                fill={w.type === 'Z-Weld' ? '#8B5CF6' : '#22D3EE'}
                fillOpacity="0.25"
                stroke={w.type === 'Z-Weld' ? '#8B5CF6' : '#22D3EE'}
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              <text
                x={w.x + w.width / 2}
                y={w.y + w.height / 2 + 3}
                fill="#ffffff"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="bold"
              >
                {w.type} ({w.boundary})
              </text>
            </g>
          ))}

          {/* Surface Code Patches */}
          {patches.map((p) => {
            const isSelected = selectedPatchId === p.id;
            return (
              <g
                key={p.id}
                data-surface-patch="true"
                transform={`translate(${p.x}, ${p.y})`}
                onClick={() => handlePatchClick(p.id)}
                className="cursor-pointer group"
              >
                <rect
                  width="140"
                  height="140"
                  rx="12"
                  fill="#0f172a"
                  stroke={isSelected ? '#34D399' : p.color}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="transition-all group-hover:stroke-plaquette"
                />
                <text x="70" y="24" fill="#f8fafc" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {p.label}
                </text>
                <text x="70" y="40" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  Distance d={distance} ({distance * distance} qubits)
                </text>

                {/* Data Qubits Grid Inside Patch */}
                {[
                  { cx: 35, cy: 68 }, { cx: 70, cy: 68 }, { cx: 105, cy: 68 },
                  { cx: 35, cy: 100 }, { cx: 70, cy: 100 }, { cx: 105, cy: 100 },
                ].map((q, qIdx) => (
                  <circle key={qIdx} cx={q.cx} cy={q.cy} r="5.5" fill={p.color} fillOpacity="0.85" />
                ))}

                {/* Boundary Type Marker */}
                <text x="70" y="128" fill={activeWeldType === 'Z-Weld' ? '#8B5CF6' : '#22D3EE'} fontSize="8.5" fontFamily="monospace" textAnchor="middle">
                  {activeWeldType === 'Z-Weld' ? 'Smooth Z-Boundary' : 'Rough X-Boundary'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Execution Loading Overlay */}
        {executingSurgery && (
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur flex items-center justify-center font-mono text-sm font-bold text-plaquette animate-fade-in">
            <Move className="h-6 w-6 animate-spin mr-2 text-magic" /> Sketching {activeWeldType} sequence…
          </div>
        )}

        {/* Execution Output Status with Live Region */}
        {surgeryResult && (
          <div className="mt-2 rounded-lg border border-star/40 bg-star/10 p-3 font-mono text-xs text-text-mid">
            <span className="mb-1 block font-bold uppercase tracking-wide text-star text-[10px]">
              Illustrative sequence — no stabilizer simulation or circuit execution
            </span>
            {surgeryResult}
          </div>
        )}
      </div>

      {/* Dynamic Auto-Generated Stim Circuit Box */}
      <div className="mt-5 rounded-xl border border-ink-700 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-plaquette font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5" /> Representative Stim snippet — illustrative, not executed or validated
          </span>
          <button
            type="button"
            onClick={copyStim}
            className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copiedStim ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
            {copiedStim ? 'Copied Stim Code!' : 'Copy Stim Code'}
          </button>
        </div>
        <pre className="rounded-lg bg-ink-950 p-3.5 border border-ink-700 text-text-hi leading-relaxed overflow-x-auto text-[11px]">
          {stimCircuitCode}
        </pre>
        <p className="mt-2 text-[10px] leading-relaxed text-text-low">
          A canonical d=3 {activeWeldType} snippet for reference — it is not compiled
          from the patch layout above and has not been parsed or validated. Take it to
          Stim/Crumble to run it.
        </p>
      </div>

      {/* Epistemic Disclosure & Physics Explanation */}
      <div className="mt-4 rounded-xl border border-ink-700 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 text-plaquette font-bold uppercase tracking-wider text-[11px]">
          <ShieldCheck className="h-4 w-4" /> Epistemic Disclosure & Physics Foundations
        </div>
        <p className="text-text-mid leading-relaxed font-sans text-xs">
          Lattice surgery executes multi-qubit logical gates (CNOT, CZ, multi-qubit Pauli measurements) by dynamically merging and splitting boundary ancillas between 2D planar surface code patches. This visualizer demonstrates the boundary weld geometry and generates the corresponding Stim circuit header; full shot-by-shot stabilizer simulation can be executed via PyMatching or Stim.
        </p>
      </div>

      {/* Google Veo 3.1 AI Prompt Box */}
      <div className="mt-4 rounded-xl border border-magic/30 bg-ink-900 p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-magic font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Google Veo 3.1 AI Video Generation Prompt
          </span>
          <button
            type="button"
            onClick={copyVeo}
            className="flex items-center gap-1 rounded bg-ink-800 px-2.5 py-1 text-[10px] text-plaquette hover:bg-ink-700 border border-ink-600"
          >
            {copiedVeo ? <Check className="h-3 w-3 text-stabilizer" /> : <Copy className="h-3 w-3" />}
            {copiedVeo ? 'Copied Prompt!' : 'Copy Prompt'}
          </button>
        </div>
        <div className="rounded-lg bg-ink-950 p-3 border border-ink-700 text-text-mid select-all">
          &ldquo;{veoPrompt}&rdquo;
        </div>
      </div>
    </div>
  );
}

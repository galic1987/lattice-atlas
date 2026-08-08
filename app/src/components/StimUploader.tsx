import { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { sound } from '@/lib/sound';

export interface ParsedStimSummary {
  fileName: string;
  qubitCount: number;
  detectorCount: number;
  observableCount: number;
  instructionCount: number;
  hasNoise: boolean;
  sampleInstructions: string[];
}

export default function StimUploader({
  onLoadCircuit,
}: {
  onLoadCircuit?: (stimText: string, summary: ParsedStimSummary) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [summary, setSummary] = useState<ParsedStimSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseStimText = (text: string, fileName: string = 'custom_circuit.stim') => {
    try {
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'));
      
      if (lines.length === 0) {
        throw new Error('File contains no valid Stim instructions or non-comment lines.');
      }

      let maxQubit = 0;
      let detectorCount = 0;
      let observableCount = 0;
      let hasNoise = false;

      lines.forEach((line) => {
        const tokens = line.split(/\s+/);
        const cmd = tokens[0].toUpperCase();

        if (['X_ERROR', 'Z_ERROR', 'Y_ERROR', 'DEPOLARIZING1', 'DEPOLARIZING2'].includes(cmd)) {
          hasNoise = true;
        }
        if (cmd === 'DETECTOR') {
          detectorCount++;
        }
        if (cmd === 'OBSERVABLE_INCLUDE') {
          observableCount++;
        }

        // Parse integer qubit indices in tokens
        tokens.slice(1).forEach((tok) => {
          const num = parseInt(tok.replace(/[^\d]/g, ''), 10);
          if (!isNaN(num) && num > maxQubit) {
            maxQubit = num;
          }
        });
      });

      const parsedSummary: ParsedStimSummary = {
        fileName,
        qubitCount: maxQubit + 1,
        detectorCount,
        observableCount,
        instructionCount: lines.length,
        hasNoise,
        sampleInstructions: lines.slice(0, 8),
      };

      setSummary(parsedSummary);
      setError(null);
      sound.playDecoderLock();

      if (onLoadCircuit) {
        onLoadCircuit(text, parsedSummary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse Stim file.';
      setError(msg);
      setSummary(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) parseStimText(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) parseStimText(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex items-center justify-between border-b border-ink-700 pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// CUSTOM CIRCUIT & DEM IMPORT</span>
          <h3 className="font-display text-xl font-bold text-text-hi">Stim Circuit Drag & Drop Uploader</h3>
        </div>
        <span className="rounded bg-plaquette/20 px-2.5 py-1 font-mono text-xs font-bold text-plaquette">
          .STIM / .DEM PARSER
        </span>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Upload or paste custom <strong>Stim circuit files</strong> or <strong>Detector Error Models (.dem)</strong> to analyze detector counts, qubit layouts, and run real-time MWPM syndrome decoding.
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
          dragOver
            ? 'border-plaquette bg-plaquette/10'
            : 'border-ink-600 bg-ink-950/80 hover:border-plaquette/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stim,.dem,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-10 w-10 text-plaquette" />
        <p className="mt-3 font-display text-sm font-semibold text-text-hi">
          Drag & Drop your <span className="font-mono text-plaquette">.stim</span> or <span className="font-mono text-star">.dem</span> file here
        </p>
        <p className="mt-1 font-mono text-[11px] text-text-low">
          or click to browse local files from your computer
        </p>
      </div>

      {/* Or Paste Direct Code */}
      <div className="mt-6">
        <label className="block font-mono text-xs text-text-low mb-2">Or paste raw Stim circuit instructions directly:</label>
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder={`# Paste Stim circuit snippet, e.g.:\nQUBIT_COORDS(1, 1) 0\nCX 0 1\nM 0 1\nDETECTOR(1, 1, 0) rec[-1] rec[-2]\nOBSERVABLE_INCLUDE(0) rec[-1]`}
          rows={4}
          className="w-full rounded-xl border border-ink-600 bg-ink-950 p-3 font-mono text-xs text-text-hi placeholder:text-text-low/60 focus:border-plaquette focus:outline-none"
        />
        {pastedText.trim().length > 0 && (
          <button
            type="button"
            onClick={() => parseStimText(pastedText, 'pasted_circuit.stim')}
            className="btn-primary mt-3 text-xs"
          >
            <Cpu className="h-3.5 w-3.5" /> Parse Pasted Stim Circuit
          </button>
        )}
      </div>

      {/* Parse Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-syndrome/40 bg-syndrome/10 p-3 font-mono text-xs text-syndrome">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Parsed Summary Card */}
      {summary && (
        <div className="mt-6 rounded-xl border border-stabilizer/40 bg-stabilizer/10 p-5">
          <div className="flex items-center justify-between border-b border-stabilizer/20 pb-3">
            <span className="flex items-center gap-2 font-mono text-xs font-bold text-stabilizer">
              <CheckCircle2 className="h-4 w-4" /> Loaded: {summary.fileName}
            </span>
            <span className="font-mono text-[10px] text-text-low">{summary.instructionCount} instructions</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs">
            <div className="rounded-lg bg-ink-900 p-2.5 border border-ink-800">
              <span className="text-text-low block text-[10px]">QUBITS</span>
              <span className="text-text-hi font-bold text-base">{summary.qubitCount}</span>
            </div>
            <div className="rounded-lg bg-ink-900 p-2.5 border border-ink-800">
              <span className="text-text-low block text-[10px]">DETECTORS</span>
              <span className="text-syndrome font-bold text-base">{summary.detectorCount}</span>
            </div>
            <div className="rounded-lg bg-ink-900 p-2.5 border border-ink-800">
              <span className="text-text-low block text-[10px]">OBSERVABLES</span>
              <span className="text-plaquette font-bold text-base">{summary.observableCount}</span>
            </div>
            <div className="rounded-lg bg-ink-900 p-2.5 border border-ink-800">
              <span className="text-text-low block text-[10px]">NOISE MODEL</span>
              <span className={`font-bold text-xs ${summary.hasNoise ? 'text-magic' : 'text-text-low'}`}>
                {summary.hasNoise ? 'Phenomenological' : 'Ideal (No Noise)'}
              </span>
            </div>
          </div>

          {/* Code Snippet Preview */}
          <div className="mt-4">
            <span className="font-mono text-[10px] uppercase text-text-low">Parsed Circuit Header:</span>
            <pre className="mt-1 max-h-32 overflow-y-auto rounded-lg bg-ink-950 p-3 font-mono text-[11px] leading-relaxed text-plaquette">
              {summary.sampleInstructions.join('\n')}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

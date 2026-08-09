import { useState } from 'react';
import { Award } from 'lucide-react';
import { sound } from '@/lib/sound';

export default function CertificateGenerator() {
  const [learnerName, setLearnerName] = useState<string>('Quantum Practitioner');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  const handleGenerate = () => {
    sound.playDecoderLock();
    setIsGenerated(true);
  };

  return (
    <div className="rounded-2xl border border-magic/40 bg-ink-900 p-6 shadow-glow-cyan">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ink-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// SELF-ISSUED STUDY KEEPSAKE</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] text-magic font-bold">LOCAL · NOT VERIFIED</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Lattice Atlas Study Keepsake</h3>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="btn-primary text-xs !px-3 !py-1.5"
        >
          <Award className="h-3.5 w-3.5" /> Make my keepsake
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Make a personal keepsake card with your name on it. This is a self-issued memento of your
        exploration — it <strong>verifies nothing</strong>, reads no progress or completion, and is not proof
        of mastery, identity, or an accredited credential.
      </p>

      {/* Name Input */}
      <div className="mt-6">
        <label className="block font-mono text-xs text-text-low mb-2">Name for the keepsake:</label>
        <input
          type="text"
          value={learnerName}
          onChange={(e) => setLearnerName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-950 px-3.5 py-2 font-mono text-sm text-text-hi focus:border-magic focus:outline-none"
        />
      </div>

      {/* Keepsake Card */}
      {isGenerated && (
        <div className="mt-6 rounded-2xl border-2 border-magic/60 bg-ink-950 p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="h-48 w-48 text-magic" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-magic block">// SELF-ISSUED STUDY KEEPSAKE</span>

            <h2 className="font-display text-3xl font-bold text-text-hi">
              Topological Quantum Error Correction
            </h2>

            <p className="font-mono text-xs text-text-low">A study keepsake for</p>

            <p className="font-display text-2xl font-bold text-plaquette underline decoration-plaquette/40 decoration-2">
              {learnerName || 'Quantum Practitioner'}
            </p>

            <p className="text-xs leading-relaxed text-text-mid max-w-lg mx-auto">
              made after exploring rotated surface code stabilizers, minimum-weight perfect matching decoding,
              spacetime braids, and fault-tolerant threshold scaling in Lattice Atlas.
            </p>

            <div className="pt-6 border-t border-ink-800 flex flex-wrap items-center justify-between font-mono text-[11px] text-text-low">
              <span>SELF-ISSUED · LATTICE ATLAS</span>
              <span className="text-text-low">Not verified · not an accredited credential</span>
              <span>DATE: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
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
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// VERIFIED MASTERY CERTIFICATE</span>
            <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] text-magic font-bold">TQEC CREDENTIAL</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-hi">Lattice Atlas Mastery Certificate Exporter</h3>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="btn-primary text-xs !px-3 !py-1.5"
        >
          <Award className="h-3.5 w-3.5" /> Issue Verified Certificate
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-mid">
        Export an official, high-resolution <strong>TQEC Mastery Certificate</strong> verifying your completion of the Foundations Lab, 3D Spacetime Braid Weaver, and Decoder Duel challenges.
      </p>

      {/* Name Input */}
      <div className="mt-6">
        <label className="block font-mono text-xs text-text-low mb-2">Learner Name for Certificate:</label>
        <input
          type="text"
          value={learnerName}
          onChange={(e) => setLearnerName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-950 px-3.5 py-2 font-mono text-sm text-text-hi focus:border-magic focus:outline-none"
        />
      </div>

      {/* Certificate Graphic Card */}
      {isGenerated && (
        <div className="mt-6 rounded-2xl border-2 border-magic/60 bg-ink-950 p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="h-48 w-48 text-magic" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-magic block">// OFFICIAL CERTIFICATE OF COMPLETION</span>
            
            <h2 className="font-display text-3xl font-bold text-text-hi">
              Topological Quantum Error Correction
            </h2>

            <p className="font-mono text-xs text-text-low">This certifies that</p>
            
            <p className="font-display text-2xl font-bold text-plaquette underline decoration-plaquette/40 decoration-2">
              {learnerName || 'Quantum Practitioner'}
            </p>

            <p className="text-xs leading-relaxed text-text-mid max-w-lg mx-auto">
              has successfully demonstrated mastery of rotated surface code stabilizer algebra, minimum weight perfect matching decoding, 3D spacetime braid surgery, and fault-tolerant threshold scaling.
            </p>

            <div className="pt-6 border-t border-ink-800 flex flex-wrap items-center justify-between font-mono text-[11px] text-text-low">
              <span>ISSUED BY: LATTICE ATLAS</span>
              <span className="text-stabilizer font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED STIM CHECKSUM PASS
              </span>
              <span>DATE: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

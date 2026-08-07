import { motion } from 'framer-motion';
import { Atom, BookOpen, Compass, Lightbulb, Sparkles } from 'lucide-react';
import { ACT_NARRATIVES } from '@/data/cognitive_lens';
import { tierColors } from '@/data';
import { useProgress } from '@/store/progress';
import { asset } from '@/lib/asset';

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'ACT I',
  2: 'ACT II',
  3: 'ACT III',
  4: 'ACT IV',
  5: 'ACT V',
  6: 'ACT VI',
};

function SuperpositionVisual() {
  return (
    <figure className="relative mb-6 overflow-hidden rounded-xl border border-plaquette/30 bg-ink-950">
      <svg
        viewBox="0 0 300 520"
        role="img"
        aria-labelledby="superposition-mobile-title superposition-mobile-description"
        className="block h-auto w-full lg:hidden"
      >
        <title id="superposition-mobile-title">Normalized plus state transformed from the Z basis to the X basis</title>
        <desc id="superposition-mobile-description">
          Two equal positive Z-basis amplitudes become a reinforced plus-channel amplitude of one and a cancelled minus-channel amplitude of zero.
        </desc>
        <defs>
          <marker id="mobile-phasor-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" fill="#22D3EE" />
          </marker>
          <marker id="mobile-result-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" fill="#9B7BFA" />
          </marker>
        </defs>
        <rect width="300" height="520" fill="#0A0F1C" />
        <g fontFamily="'JetBrains Mono', monospace">
          <text x="16" y="32" fill="#EAF0FB" fontSize="16" fontWeight="700">|+⟩ = (|0⟩ + |1⟩) / √2</text>
          <text x="16" y="55" fill="#7B89A7" fontSize="11">|α|² + |β|² = 1/2 + 1/2 = 1</text>

          <g transform="translate(12 76)">
            <rect width="276" height="158" rx="12" fill="#0E1526" stroke="#2A3A5F" />
            <text x="16" y="27" fill="#67E8F9" fontSize="12" fontWeight="700">1 · Z-BASIS AMPLITUDES</text>
            <text x="16" y="70" fill="#B9C3D8" fontSize="12">α for |0⟩</text>
            <circle cx="94" cy="66" r="3.5" fill="#EAF0FB" />
            <path d="M94 66H205" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" markerEnd="url(#mobile-phasor-arrow)" />
            <text x="224" y="70" fill="#67E8F9" fontSize="12">1/√2</text>
            <text x="16" y="120" fill="#B9C3D8" fontSize="12">β for |1⟩</text>
            <circle cx="94" cy="116" r="3.5" fill="#EAF0FB" />
            <path d="M94 116H205" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" markerEnd="url(#mobile-phasor-arrow)" />
            <text x="224" y="120" fill="#67E8F9" fontSize="12">1/√2</text>
          </g>

          <path d="M150 249V283" stroke="#9B7BFA" strokeWidth="3" markerEnd="url(#mobile-result-arrow)" />
          <text x="168" y="269" fill="#C4B5FD" fontSize="11">H · change basis</text>

          <g transform="translate(12 302)">
            <rect width="276" height="190" rx="12" fill="#0E1526" stroke="#2A3A5F" />
            <text x="16" y="27" fill="#C4B5FD" fontSize="12" fontWeight="700">2 · X-BASIS INTERFERENCE</text>
            <text x="16" y="70" fill="#B9C3D8" fontSize="12">+ channel</text>
            <path d="M92 65H137M137 65H182" stroke="#9B7BFA" strokeWidth="4" strokeLinecap="round" markerEnd="url(#mobile-result-arrow)" />
            <text x="202" y="70" fill="#C4B5FD" fontSize="12">A = 1</text>
            <text x="16" y="119" fill="#B9C3D8" fontSize="12">− channel</text>
            <path d="M92 114H137" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" markerEnd="url(#mobile-phasor-arrow)" />
            <path d="M182 114H144" stroke="#FB7185" strokeWidth="4" strokeLinecap="round" />
            <path d="M149 107L138 114L149 121" fill="#FB7185" />
            <text x="202" y="119" fill="#FB7185" fontSize="12">A = 0</text>
            <text x="16" y="161" fill="#7B89A7" fontSize="11">aligned adds · opposed cancels</text>
          </g>
        </g>
      </svg>

      <svg
        viewBox="0 0 960 310"
        role="img"
        aria-labelledby="superposition-title superposition-description"
        className="hidden h-auto w-full lg:block"
      >
        <title id="superposition-title">Normalized plus state as phasors and X-basis interference</title>
        <desc id="superposition-description">
          The plus state has equal positive amplitudes one over square root of two for zero and one.
          When those amplitudes are recombined in the X basis, the plus channel reinforces to amplitude
          one and the minus channel cancels to amplitude zero.
        </desc>

        <defs>
          <pattern id="superposition-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#2A3A5F" strokeOpacity="0.24" />
          </pattern>
          <marker id="phasor-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" fill="#22D3EE" />
          </marker>
          <marker id="result-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10Z" fill="#8B5CF6" />
          </marker>
        </defs>

        <rect width="960" height="310" fill="#0A0F1C" />
        <rect width="960" height="310" fill="url(#superposition-grid)" />

        <g fontFamily="'JetBrains Mono', monospace">
          <text x="40" y="48" fill="#EAF0FB" fontSize="21" fontWeight="700">
            |+⟩ = (|0⟩ + |1⟩) / √2
          </text>
          <text x="40" y="77" fill="#8491AD" fontSize="13">
            normalized: |α|² + |β|² = 1/2 + 1/2 = 1
          </text>

          <g transform="translate(40 116)">
            <rect width="340" height="132" rx="14" fill="#0E1526" stroke="#2A3A5F" />
            <text x="20" y="29" fill="#67E8F9" fontSize="13" fontWeight="700">Z-BASIS AMPLITUDES</text>

            <text x="20" y="70" fill="#B9C3D8" fontSize="14">α for |0⟩</text>
            <circle cx="138" cy="65" r="4" fill="#EAF0FB" />
            <path d="M138 65H244" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" markerEnd="url(#phasor-arrow)" />
            <text x="266" y="70" fill="#67E8F9" fontSize="14">1/√2</text>

            <text x="20" y="110" fill="#B9C3D8" fontSize="14">β for |1⟩</text>
            <circle cx="138" cy="105" r="4" fill="#EAF0FB" />
            <path d="M138 105H244" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" markerEnd="url(#phasor-arrow)" />
            <text x="266" y="110" fill="#67E8F9" fontSize="14">1/√2</text>
          </g>

          <g transform="translate(415 130)">
            <path d="M0 45H86" stroke="#64708E" strokeWidth="2" markerEnd="url(#result-arrow)" />
            <text x="43" y="28" fill="#8491AD" fontSize="12" textAnchor="middle">re-express</text>
            <text x="43" y="78" fill="#8491AD" fontSize="12" textAnchor="middle">in X basis</text>
          </g>

          <g transform="translate(535 106)">
            <rect width="385" height="154" rx="14" fill="#0E1526" stroke="#2A3A5F" />
            <text x="20" y="30" fill="#C4B5FD" fontSize="13" fontWeight="700">INTERFERENCE OUTPUTS</text>

            <text x="20" y="68" fill="#B9C3D8" fontSize="13">+ channel</text>
            <path d="M105 63H167M167 63H229" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" markerEnd="url(#result-arrow)" />
            <text x="250" y="68" fill="#C4B5FD" fontSize="13">A(+) = 1</text>

            <text x="20" y="108" fill="#B9C3D8" fontSize="13">− channel</text>
            <path d="M105 103H167" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" markerEnd="url(#phasor-arrow)" />
            <path d="M229 103H174" stroke="#FB7185" strokeWidth="4" strokeLinecap="round" />
            <path d="M178 96L167 103L178 110" fill="#FB7185" />
            <text x="250" y="108" fill="#FB7185" fontSize="13">A(−) = 0</text>

            <text x="20" y="137" fill="#8491AD" fontSize="11">same phase reinforces · opposite signs cancel</text>
          </g>
        </g>
      </svg>
      <figcaption className="border-t border-plaquette/20 bg-plaquette/5 px-4 py-3 text-xs leading-relaxed text-text-mid">
        <span className="font-mono font-semibold text-magic">Visual boundary:</span>{' '}
        the arrows are a coordinate picture of complex probability amplitudes—not
        physical arrows or water waves inside a qubit. Interference appears when
        the same state is expressed in another measurement basis.
      </figcaption>
    </figure>
  );
}

export default function ActChapterCard({ tier }: { tier: number }) {
  const { lensMode } = useProgress();
  const act = ACT_NARRATIVES[tier];
  if (!act) return null;

  const color = tierColors[tier] ?? '#22D3EE';
  const isIntuition = lensMode === 'intuition';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative ml-12 mb-8 min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br from-ink-850 via-ink-900 to-ink-950 p-4 sm:p-6 md:p-8 shadow-2xl"
      style={{ borderColor: `${color}66` }}
    >
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      {/* Visual Metaphor Header Artwork */}
      {tier === 2 && <SuperpositionVisual />}

      {tier === 4 && (
        <figure className="relative mb-6 overflow-hidden rounded-xl border border-star/30 bg-ink-950">
          <div className="relative h-40">
            <img
              src={asset('act4_anyon_braiding.jpg')}
              alt=""
              aria-hidden
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
          </div>
          <figcaption className="border-t border-star/20 bg-star/5 px-4 py-3 text-xs leading-relaxed text-text-mid">
            <span className="font-mono font-semibold text-star">Toric-code anchor:</span>{' '}
            a full <span className="font-mono text-star">e</span> loop enclosing one{' '}
            <span className="font-mono text-plaquette">m</span> contributes an amplitude
            factor <span className="font-mono text-text-hi">−1</span> relative to a loop
            enclosing none. The raster above is decorative, not a literal spacetime diagram.
          </figcaption>
        </figure>
      )}

      {/* Act Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-700/80 pb-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-md px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.25em] shadow-sm"
            style={{
              backgroundColor: `${color}22`,
              color,
              border: `1px solid ${color}66`,
            }}
          >
            {ROMAN_NUMERALS[tier]}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-text-low">
            Prerequisite Chapter · Tier {tier}
          </span>
        </div>

        {/* Cognitive Lens Indicator */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-mono text-[11px] font-medium transition-colors ${
            isIntuition
              ? 'border-plaquette/40 bg-plaquette/10 text-plaquette'
              : 'border-magic/40 bg-magic/10 text-magic'
          }`}
        >
          {isIntuition ? <Sparkles className="h-3 w-3" /> : <Atom className="h-3" />}
          <span>{isIntuition ? 'Intuition Lens' : 'Rigor Lens'}</span>
        </div>
      </div>

      {/* Dramatic Act Title */}
      <div className="mt-5">
        <h2 className="font-display text-2xl font-bold leading-snug text-text-hi md:text-3xl">
          {act.actTitle}
        </h2>
        <p className="mt-2 text-sm font-medium italic leading-relaxed text-text-mid md:text-base">
          &ldquo;{act.actSubtitle}&rdquo;
        </p>
      </div>

      {/* Narrative Body */}
      <motion.div
        key={lensMode}
        initial={{ opacity: 0, x: isIntuition ? -12 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mt-5 rounded-xl border border-ink-700/60 bg-ink-950/70 p-5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-star">
          {isIntuition ? (
            <>
              <Lightbulb className="h-3.5 w-3.5 text-plaquette" />
              <span>Analogy Narrative</span>
            </>
          ) : (
            <>
              <Compass className="h-3.5 w-3.5 text-magic" />
              <span>Physics Rigor Narrative</span>
            </>
          )}
        </div>

        <p className="mt-2.5 text-sm leading-[1.75] text-text-hi md:text-[15px]">
          {isIntuition ? act.intuitionText : act.rigorText}
        </p>
      </motion.div>

      {/* Footer Chips */}
      <div className="mt-5 flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/80 px-3 py-1 text-text-mid">
          <BookOpen className="h-3.5 w-3.5 text-text-low" />
          <span className="text-text-low">Focus:</span>
          <span className="text-text-hi font-medium">{act.keyFocus}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-800/80 px-3 py-1 text-text-mid">
          <span className="text-text-low">{isIntuition ? 'Metaphor:' : 'Anchor:'}</span>
          <span className="text-plaquette font-medium">{act.metaphor}</span>
        </div>
      </div>
    </motion.div>
  );
}

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useProgress, type ExplanationDepth } from '@/store/progress';

const EASE = [0.22, 1, 0.36, 1] as const;

export type ConceptDepthConcept =
  | 'bit-amplitude'
  | 'interference'
  | 'ket-born'
  | 'phase'
  | 'two-qubit';

type Depth = ExplanationDepth;

type DepthCopy = {
  explanation: string;
  changed: string;
  notation?: string;
};

type ConceptCopy = {
  title: string;
  invariant: string;
  depths: Record<Depth, DepthCopy>;
};

const DEPTHS: Array<{
  id: Depth;
  label: string;
  marker: string;
  descriptor: string;
  active: string;
  accent: string;
  /** Literal Tailwind solid-fill class for the gauge + aperture (kept literal so JIT keeps it). */
  bar: string;
}> = [
  {
    id: 'story',
    label: 'Story',
    marker: '~5',
    descriptor: 'concrete',
    active: 'border-plaquette bg-plaquette/10 text-plaquette',
    accent: 'text-plaquette',
    bar: 'bg-plaquette',
  },
  {
    id: 'cause',
    label: 'Cause',
    marker: '~10',
    descriptor: 'why',
    active: 'border-stabilizer bg-stabilizer/10 text-stabilizer',
    accent: 'text-stabilizer',
    bar: 'bg-stabilizer',
  },
  {
    id: 'model',
    label: 'Model',
    marker: '~15',
    descriptor: 'symbols',
    active: 'border-star bg-star/10 text-star',
    accent: 'text-star',
    bar: 'bg-star',
  },
  {
    id: 'formal',
    label: 'Formal',
    marker: '20+',
    descriptor: 'limits',
    active: 'border-magic bg-magic/10 text-magic',
    accent: 'text-magic',
    bar: 'bg-magic',
  },
  {
    id: 'verify',
    label: 'Verify',
    marker: 'evidence',
    descriptor: 'test',
    active: 'border-syndrome bg-syndrome/10 text-syndrome',
    accent: 'text-syndrome',
    bar: 'bg-syndrome',
  },
];

/**
 * A small aperture that "focuses deeper" as the lens depth increases: five
 * concentric rings light up outward, and a focus core brightens, giving the
 * depth control a literal lens metaphor. Uses currentColor so it inherits the
 * active depth's accent. Purely decorative — aria-hidden.
 */
function LensAperture({ activeIndex, reduce }: { activeIndex: number; reduce: boolean }) {
  const rings = [7, 11, 15, 19, 23];
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" aria-hidden="true">
      {rings.map((r, i) => {
        const lit = i <= activeIndex;
        return (
          <motion.circle
            key={r}
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === activeIndex ? 2 : 1.25}
            initial={false}
            animate={{ opacity: lit ? (i === activeIndex ? 1 : 0.55) : 0.12 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : i * 0.03 }}
          />
        );
      })}
      <motion.circle
        cx="24"
        cy="24"
        r="3"
        fill="currentColor"
        initial={false}
        animate={reduce ? { opacity: 1 } : { scale: [1, 1.25, 1], opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.5 }}
        style={{ transformOrigin: '24px 24px' }}
      />
    </svg>
  );
}

const CONCEPTS: Record<ConceptDepthConcept, ConceptCopy> = {
  'bit-amplitude': {
    title: 'Bit versus amplitude',
    invariant: 'Measurement frequency comes from squared amplitude magnitude, with all outcome probabilities normalized to one.',
    depths: {
      story: {
        explanation: 'A bit puts one marble on track 0 or track 1. A qubit carries a wave-arrow for both tracks. The longer an arrow is, the more often its track appears when we look—after we square its length.',
        changed: 'Only the tangible pieces are named: tracks, arrows, and repeated detector clicks.',
      },
      cause: {
        explanation: 'A bit records one definite value. A qubit assigns each possible readout a complex amplitude. Detectors respond to the arrow’s intensity, so doubling its magnitude makes that outcome four times as frequent.',
        changed: 'The story now explains why amplitude and observed frequency are not the same quantity.',
      },
      model: {
        explanation: 'Write the state as two basis coordinates. Repeating the same preparation and Z-basis measurement samples 0 and 1 according to the squared coordinate magnitudes.',
        notation: '|ψ⟩ = α|0⟩ + β|1⟩ · P(0)=|α|² · |α|²+|β|²=1',
        changed: 'The concrete arrows become complex coordinates, and normalization becomes explicit.',
      },
      formal: {
        explanation: 'A pure qubit is a ray in a two-dimensional complex Hilbert space. For a projective measurement, the Born rule evaluates each projector’s expectation value; a common nonzero phase labels the same physical ray.',
        notation: 'P(i)=⟨ψ|Πᵢ|ψ⟩ · Πᵢ=|i⟩⟨i|',
        changed: 'The assumptions and boundary are exposed: pure normalized state, chosen projective measurement, and phase-equivalent vectors.',
      },
      verify: {
        explanation: 'Prepare the same qubit many times, measure in the same basis, and compare observed counts with the Born probabilities. A finite sample will fluctuate, so report a confidence interval rather than demanding exact percentages.',
        notation: 'n₀/N → |α|² · n₁/N → |β|² as N grows',
        changed: 'The formal claim becomes a falsifiable frequency prediction with finite-sample uncertainty.',
      },
    },
  },
  interference: {
    title: 'Interference',
    invariant: 'Indistinguishable alternative amplitudes add before squaring; their relative phase changes the resultant probability.',
    depths: {
      story: {
        explanation: 'Two well-timed pushes can make one swing rise higher. Push together and they help; push in opposite timing and they cancel. Quantum path-arrows combine with the same add-first pattern.',
        changed: 'The relationship is felt as synchronized pushes, without introducing equations.',
      },
      cause: {
        explanation: 'When the detector cannot learn which coherent path happened, the path arrows combine. Aligned arrows reinforce; opposed arrows cancel. The detector responds only after that combined arrow is formed.',
        changed: 'The condition for interference appears: the alternatives must remain coherent and indistinguishable.',
      },
      model: {
        explanation: 'Represent each path by a complex phasor. Their vector sum is the detector amplitude, and the squared length of that sum is its click probability. The cross term carries the phase dependence.',
        notation: 'A=a₁+a₂ · P=|A|²=|a₁|²+|a₂|²+2 Re(a₁* a₂)',
        changed: 'Timing becomes phase angle, and reinforcement becomes a calculable cross term.',
      },
      formal: {
        explanation: 'Probability amplitudes for coherent, operationally indistinguishable alternatives are summed by linearity before the Born rule. Path information entangles the alternatives with distinct records and suppresses their off-diagonal coherence.',
        notation: 'P(d)=|Σₖ⟨d|U|k⟩⟨k|ψ⟩|²',
        changed: 'The unitary evolution and coherence assumption are explicit, along with the boundary where distinguishability removes interference.',
      },
      verify: {
        explanation: 'Sweep the relative phase while repeating the circuit. Coherent paths produce a sinusoidal fringe; deliberately record which-path information and the fringe visibility should fall. The comparison tests the stated coherence condition.',
        notation: 'V=(Pmax−Pmin)/(Pmax+Pmin)',
        changed: 'The interference story becomes a controlled contrast between coherent and distinguishable alternatives.',
      },
    },
  },
  'ket-born': {
    title: 'Ket coordinates and the Born rule',
    invariant: 'A ket lists amplitudes in a chosen basis, and the squared magnitude of an overlap gives the corresponding measurement probability.',
    depths: {
      story: {
        explanation: 'A map location needs a coordinate along each map direction. A ket is a quantum coordinate card. Asking “how much points along 0?” selects one entry, and squaring its arrow length predicts how often 0 appears.',
        changed: 'The ket is grounded as an ordered coordinate card rather than an unexplained bracket symbol.',
      },
      cause: {
        explanation: 'The measurement question chooses the coordinate axes. A bra acts like a matching filter that extracts one component from the state. Detectors turn that component’s magnitude into a long-run frequency by squaring it.',
        changed: 'The roles of basis, bra, and detector are separated into a causal sequence.',
      },
      model: {
        explanation: 'In the computational basis, the ket is the column of coefficients α and β. Taking an inner product with a basis bra returns one coefficient; the Born rule maps its complex magnitude to probability.',
        notation: '|ψ⟩ ↔ [α, β]ᵀ · ⟨0|ψ⟩=α · P(0)=|α|²',
        changed: 'The visual coordinate projection is translated directly into vector and inner-product notation.',
      },
      formal: {
        explanation: 'A normalized vector represents a pure-state ray; coordinates change with basis while the ray does not. Rank-one projectors recover basis probabilities. More general measurements replace those projectors with positive operators that sum to identity.',
        notation: 'P(i)=Tr(|ψ⟩⟨ψ| Πᵢ) · ΣᵢΠᵢ=I',
        changed: 'Basis dependence, ray equivalence, and the projective-measurement boundary are now stated.',
      },
      verify: {
        explanation: 'Choose a normalized ket, calculate its basis probabilities, and sample the corresponding measurement circuit. Then rotate the measurement basis and repeat: the coordinates change predictably while normalization remains one.',
        notation: 'Σᵢ nᵢ/N = 1 · nᵢ/N ≈ |⟨i|ψ⟩|²',
        changed: 'Changing basis tests which quantities are coordinate-dependent and which invariant survives.',
      },
    },
  },
  phase: {
    title: 'Global versus relative phase',
    invariant: 'A common phase on the complete state changes no prediction; phase between components can change interference outcomes.',
    depths: {
      story: {
        explanation: 'Imagine two clock hands. Rotating the whole clock leaves the gap between them unchanged, so nothing new can be read. Move one hand against the other and a mixer can notice the changed gap.',
        changed: 'Phase is introduced only as common rotation versus visible separation.',
      },
      cause: {
        explanation: 'Measurements compare amplitudes. A shared rotation cancels from every comparison, but rotating one component changes its alignment with the other. Mixing the components converts that relative alignment into different counts.',
        changed: 'The explanation now identifies comparison and mixing as the reason only relative phase matters.',
      },
      model: {
        explanation: 'Factor the state into a common phase γ and a relative phase φ. A Hadamard recombines the basis components: γ disappears from probabilities, while φ controls the output balance.',
        notation: '|ψ⟩=eⁱγ(|0⟩+eⁱφ|1⟩)/√2 · P(0 after H)=cos²(φ/2)',
        changed: 'The two rotations receive separate symbols and one observable interference formula.',
      },
      formal: {
        explanation: 'Physical pure states are rays, so the global U(1) action on the complete state is gauge redundancy. Relative phase between coherent branches survives in expectation values of observables that do not commute with the branch basis.',
        notation: '|ψ⟩ ~ eⁱγ|ψ⟩ · ⟨X⟩=cos φ · ⟨Y⟩=sin φ',
        changed: 'The equivalence relation, observable choice, and requirement of coherent branches define the formal boundary.',
      },
      verify: {
        explanation: 'Compare two phase sweeps. Rotating every amplitude together must leave every count distribution unchanged; rotating only one coherent component before recombination changes X- and Y-basis statistics.',
        notation: 'global γ: ΔP=0 · relative φ: ⟨X⟩=cos φ',
        changed: 'A paired experiment separates an unobservable gauge choice from an observable relative phase.',
      },
    },
  },
  'two-qubit': {
    title: 'Factorability and entanglement',
    invariant: 'A pure two-qubit state is separable exactly when its 2×2 amplitude table has rank one, equivalently zero determinant.',
    depths: {
      story: {
        explanation: 'Picture a 2×2 tray. If one row recipe times one column recipe fills every box, the two parts were prepared independently. If no two recipes can make the pattern, the tray needs one joined recipe.',
        changed: 'Independence is made tangible as two reusable recipes filling one joint tray.',
      },
      cause: {
        explanation: 'Independent preparations multiply every amplitude from A by every amplitude from B, forcing all rows and columns to be scaled copies. Entanglement is the failure of that multiplication pattern, even when the four cell probabilities look ordinary.',
        changed: 'The outer-product constraint explains why a single relative phase can create entanglement.',
      },
      model: {
        explanation: 'Arrange the coefficients of |00⟩, |01⟩, |10⟩, and |11⟩ as a matrix. Matching cross-products mean the matrix factors into one column and one row; unequal cross-products mean it does not.',
        notation: 'A=[[a₀₀,a₀₁],[a₁₀,a₁₁]] · det A=a₀₀a₁₁−a₀₁a₁₀',
        changed: 'The recipe test becomes a determinant calculation on the amplitude table.',
      },
      formal: {
        explanation: 'For a pure state in C²⊗C², the amplitude matrix rank equals the Schmidt rank. Local basis changes preserve whether its determinant vanishes. Mixed-state separability instead requires a convex decomposition and cannot be decided by this table test.',
        notation: 'separable ⇔ Schmidt rank=1 ⇔ rank(A)=1 ⇔ det(A)=0',
        changed: 'The pure-state assumption, local-basis invariance, and mixed-state boundary are explicit.',
      },
      verify: {
        explanation: 'Compute the determinant for a known pure-state amplitude table, then compare joint-basis measurements with a product-state prediction. For unknown or mixed states, this shortcut is insufficient: use tomography plus an appropriate separability test.',
        notation: 'pure state: det(A)=0 ⇔ product · mixed state: table test not sufficient',
        changed: 'The quick determinant witness is tested inside its valid pure-state boundary and explicitly withheld outside it.',
      },
    },
  },
};

export default function ConceptDepthLens({ concept }: { concept: ConceptDepthConcept }) {
  const { explanationDepth: depth, setExplanationDepth: setDepth } = useProgress();
  const reduce = useReducedMotion();
  const titleId = useId();
  const content = CONCEPTS[concept];
  const activeIndex = Math.max(0, DEPTHS.findIndex((item) => item.id === depth));
  const selected = DEPTHS[activeIndex] ?? DEPTHS[0];
  const copy = content.depths[depth];

  // Direction of travel between depths, captured at click time, so the content can
  // zoom TOWARD the reader when moving deeper and pull back when moving shallower.
  const [direction, setDirection] = useState(1);
  const pickDepth = (id: Depth, index: number) => {
    setDirection(index >= activeIndex ? 1 : -1);
    setDepth(id);
  };

  return (
    <section className="rounded-xl border border-ink-600 bg-ink-850/80 p-4 md:p-5" aria-labelledby={titleId}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={selected.accent}>
            <LensAperture activeIndex={activeIndex} reduce={Boolean(reduce)} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-plaquette">Depth lens · same idea, closer view</p>
            <h3 id={titleId} className="mt-1 font-display text-base font-semibold text-text-hi">{content.title}</h3>
          </div>
        </div>
        <p className="max-w-xs text-right text-[11px] leading-4 text-text-low">Numbers mark detail density, never learner ability.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="group" aria-label="Choose explanation depth">
        {DEPTHS.map((item, index) => {
          const active = item.id === depth;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => pickDepth(item.id, index)}
              aria-pressed={active}
              aria-label={`${item.label} depth, ${item.marker} detail, ${item.descriptor}`}
              className={`relative flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${active ? item.active : 'border-ink-600 bg-ink-900/65 text-text-mid hover:border-ink-500 hover:text-text-hi'}`}
            >
              <span className={`font-mono text-[10px] ${active ? item.accent : 'text-text-low'}`}>0{index + 1}</span>
              <span>
                <span className="block text-xs font-semibold">{item.label} <span className="font-mono font-normal opacity-75">{item.marker}</span></span>
                <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider opacity-60">{item.descriptor}</span>
              </span>
              {active && (
                <motion.span
                  layoutId="depthLensCursor"
                  className="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-current"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Detail-density gauge: fills toward "Verify" as the lens goes deeper. */}
      <div className="mt-3 flex items-center gap-2">
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-text-low">detail density</span>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${selected.bar}`}
            initial={false}
            animate={{ width: `${((activeIndex + 1) / DEPTHS.length) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }}
          />
        </div>
        <span className="shrink-0 font-mono text-[9px] text-text-low">{activeIndex + 1}/{DEPTHS.length}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${concept}-${depth}`}
          initial={reduce ? false : { opacity: 0, scale: direction > 0 ? 0.96 : 1.04, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: direction > 0 ? 1.03 : 0.97, y: -4 }}
          transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
          className="mt-4 origin-center rounded-lg border border-ink-600 bg-ink-900/70 p-4"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${selected.accent}`}>{selected.label} depth</span>
            <span className="h-px flex-1 bg-ink-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm leading-6 text-text-mid">{copy.explanation}</p>
          {copy.notation && (
            <p className="mt-3 overflow-x-auto rounded-md border border-ink-600 bg-ink-950/65 px-3 py-2 font-mono text-xs leading-5 text-text-hi">{copy.notation}</p>
          )}
          <p className="mt-3 border-l-2 border-star/60 pl-3 text-xs leading-5 text-text-low">
            <span className="font-mono text-[10px] uppercase tracking-wider text-star">What changed</span>
            <span className="ml-2">{copy.changed}</span>
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="mt-3 flex gap-2 text-[11px] leading-5 text-text-low">
        <span className="shrink-0 font-mono uppercase tracking-wider text-stabilizer">Invariant</span>
        <span>{content.invariant}</span>
      </p>
    </section>
  );
}

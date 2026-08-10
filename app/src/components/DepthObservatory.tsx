import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  ExternalLink,
  Eye,
  FlaskConical,
  GitBranch,
  Ghost,
  Pause,
  Play,
  RotateCcw,
  Sigma,
  Waves,
} from 'lucide-react';
import type { AltitudeConcept } from '@/data/altitudes';
import {
  DEPTH_OBSERVATORY_SEED,
  DEPTH_OBSERVATORY_SHOTS,
  phaseLabel,
  sampleInterference,
  type PathRecordMode,
} from '@/lib/depthObservatory';
import { useProgress, type ExplanationDepth } from '@/store/progress';

const DEPTHS: ExplanationDepth[] = ['story', 'cause', 'model', 'formal', 'verify'];

const DEPTH_META = [
  { id: 'story', label: 'STORY', marker: '~5', descriptor: 'concrete overview', color: '#22D3EE', Icon: BookOpen },
  { id: 'cause', label: 'CAUSE', marker: '~10', descriptor: 'causal mechanism', color: '#34D399', Icon: GitBranch },
  { id: 'model', label: 'MODEL', marker: '~15', descriptor: 'quantitative model', color: '#9B7BFA', Icon: Waves },
  { id: 'formal', label: 'FORMAL', marker: '20+', descriptor: 'assumptions and limits', color: '#F5B83D', Icon: Sigma },
  { id: 'verify', label: 'VERIFY', marker: 'EVIDENCE', descriptor: 'test against evidence', color: '#FB7185', Icon: BarChart3 },
] as const;

const WHAT_ADDS: Record<string, readonly string[]> = {
  'error-correction': [
    'parity alarms without reading the secret',
    'hidden chains and ambiguous endpoints',
    'syndrome versus detection events',
    'stabilizers, likelihoods, and scoped Lambda',
    'model receipts and independent tools',
  ],
  superposition: [
    'reinforcement as a tangible analogy',
    'coherent, indistinguishable alternatives',
    'complex amplitude and the cross term',
    'Born rule, basis, and ideal assumptions',
    'a phase sweep with finite-shot uncertainty',
  ],
  topology: [
    'global shape rather than local detail',
    'deformation without cutting',
    'planar relative paths versus toric loops',
    'homology classes and scoped k = 2g',
    'an invisible logical-path challenge',
  ],
  decoding: [
    'tracks left by an unseen fault',
    'ambiguous endpoint pairings',
    'space-time detection events',
    'weighted matching under a declared model',
    'Duel and Lab model checks',
  ],
  'magic-states': [
    'a consumed special ingredient',
    'cleaning with rejection',
    'Clifford operations plus injected T',
    'scoped 15-to-1 arithmetic',
    'primary-source arithmetic and receipts',
  ],
};

const FORMULAS: Record<string, readonly string[]> = {
  'error-correction': [
    'secret stays hidden',
    'chain → endpoint parity',
    'Dⱼ,ₜ = mⱼ,ₜ ⊕ mⱼ,ₜ₋₁',
    'Λ = ε(d) / ε(d+2)',
    'Stim + decoder + receipt',
  ],
  superposition: [
    'two pushes → one effect',
    'indistinguishable paths add',
    'A₀ = (1 + eⁱφ) / 2',
    'P(0) = |A₀|² = cos²(φ/2)',
    'k / N with a 95% interval',
  ],
  topology: [
    'small changes preserve the hole',
    'deform ≠ cut',
    'relative path / winding loop',
    'H₁(Σg; Z₂) ≅ Z₂²ᵍ',
    'construct a silent logical path',
  ],
  decoding: [
    'fault → tracks',
    'endpoints ≠ hidden path',
    'events become a graph',
    'wₑ = ln((1−pₑ)/pₑ)',
    'compare correction hypotheses',
  ],
  'magic-states': [
    'special state is consumed',
    '15 noisy inputs → 1 accepted output',
    '|A⟩ enables T injection',
    'pout ≈ 35p³ (scoped)',
    'rejection + circuit cost stay visible',
  ],
};

const RAIL_COPY: Record<string, readonly string[]> = {
  'error-correction': ['Alarms guard a secret.', 'Fault chains leave endpoints.', 'Checks become evidence.', 'Models set decoder meaning.', 'Reproduce the declared model.'],
  superposition: ['Two routes, one effect.', 'No record marks the route.', 'Add amplitudes first.', 'State the measurement assumptions.', 'Match prediction within uncertainty.'],
  topology: ['The hole survives small changes.', 'A loop can slide, not cut.', 'Classify paths by boundary.', 'Use homology in its scope.', 'Build the invisible path.'],
  decoding: ['Read tracks, not the fault.', 'Pairings can be ambiguous.', 'Decode a graph in space-time.', 'Weights encode a noise model.', 'Compare with model evidence.'],
  'magic-states': ['A special input is consumed.', 'Cleaning can reject.', 'Injection completes the gate set.', 'Count scoped protocol costs.', 'Check sources and arithmetic.'],
};

function safeConceptCopy(record: Record<string, readonly string[]>, conceptId: string) {
  return record[conceptId] ?? record.superposition;
}

function depthColor(index: number) {
  return DEPTH_META[index]?.color ?? '#22D3EE';
}

function DiagramFrame({
  concept,
  activeIndex,
  ghostEarlier,
  phaseDeg,
}: {
  concept: AltitudeConcept;
  activeIndex: number;
  ghostEarlier: boolean;
  phaseDeg: number;
}) {
  const titleId = useId();
  const descId = useId();
  const color = depthColor(activeIndex);
  const priorOpacity = ghostEarlier ? 0.18 : 0;
  const phaseRad = phaseDeg * Math.PI / 180;
  const phasorX = 566 + Math.cos(phaseRad) * 58;
  const phasorY = 150 - Math.sin(phaseRad) * 58;

  const common = (
    <>
      <defs>
        <filter id={`${titleId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`${titleId}-beam`} x1="0" x2="1">
          <stop stopColor="#22D3EE" />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor="#FB7185" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="718" height="338" rx="18" fill="#070C17" stroke={color} strokeOpacity="0.5" />
      <path d="M20 54H700M20 286H700" stroke="#1B2743" strokeWidth="1" />
    </>
  );

  let graphic: React.ReactNode;
  if (concept.id === 'superposition') {
    const viewLabels = [
      'Two ripples meet — analogy, not a qubit',
      'Two coherent routes lead to one detector',
      'Two coherent, indistinguishable paths',
      'Ideal balanced H–phase–H circuit',
      'Sweep relative phase; compare finite shots',
    ] as const;
    graphic = (
      <>
        <g opacity={priorOpacity} aria-hidden="true">
          <path d="M70 188Q180 84 306 172Q430 260 500 174" fill="none" stroke="#22D3EE" strokeWidth="12" strokeLinecap="round" />
          <path d="M70 188Q180 280 306 196Q430 112 500 174" fill="none" stroke="#34D399" strokeWidth="12" strokeLinecap="round" />
        </g>
        <circle cx="48" cy="174" r="7" fill="#EAF0FB" filter={`url(#${titleId}-glow)`} />
        <path d="M55 174H90" stroke="#7B89A7" strokeWidth="2" />
        <rect x="95" y="90" width="9" height="66" fill="#A9B4CC" />
        <rect x="95" y="192" width="9" height="66" fill="#A9B4CC" />
        <path d="M105 123C215 92 278 78 388 166C425 196 457 194 490 174" fill="none" stroke={activeIndex === 0 ? '#34D399' : '#9B7BFA'} strokeWidth={activeIndex === 0 ? 7 : 3} strokeOpacity={activeIndex === 0 ? 0.72 : 1} />
        <path d="M105 225C215 252 278 264 388 182C425 154 457 157 490 174" fill="none" stroke="#22D3EE" strokeWidth={activeIndex === 0 ? 7 : 3} strokeOpacity={activeIndex === 0 ? 0.72 : 1} />
        <path d="M108 123C210 91 300 118 387 166" fill="none" stroke="#9B7BFA" strokeOpacity="0.35" strokeDasharray="4 8" />
        <path d="M108 225C210 255 300 226 387 182" fill="none" stroke="#22D3EE" strokeOpacity="0.35" strokeDasharray="4 8" />
        <circle cx="492" cy="174" r="7" fill="#A9B4CC" />
        <rect x="510" y="68" width="18" height="212" fill={`url(#${titleId}-beam)`} opacity="0.55" />
        {activeIndex >= 2 && (
          <g>
            <line x1="590" y1="170" x2="590" y2="82" stroke="#A9B4CC" />
            <line x1="540" y1="170" x2="676" y2="170" stroke="#A9B4CC" />
            <circle cx="590" cy="170" r="58" fill="none" stroke="#3D5178" strokeDasharray="5 5" />
            <line x1="590" y1="170" x2="648" y2="170" stroke="#9B7BFA" strokeWidth="4" />
            <line x1="590" y1="170" x2={phasorX} y2={phasorY} stroke="#22D3EE" strokeWidth="4" />
            <text x="651" y="164" fill="#9B7BFA" fontSize="14" fontStyle="italic">a₀=1/2</text>
            <text x={Math.min(665, phasorX + 7)} y={Math.max(94, phasorY - 7)} fill="#22D3EE" fontSize="16" fontStyle="italic">a₁</text>
            <text x="545" y="236" fill="#9B7BFA" fontSize="18">A₀ = a₀ + a₁</text>
            <text x="545" y="268" fill="#EAF0FB" fontSize="18">P(0) = |A₀|²</text>
          </g>
        )}
        {activeIndex >= 3 && (
          <g>
            {['H', 'Rz(φ)', 'H', 'MZ'].map((gate, index) => <g key={`${gate}-${index}`}><rect x={124 + index * 68} y="284" width="52" height="30" rx="5" fill="#121B31" stroke="#F5B83D" /><text x={150 + index * 68} y="304" textAnchor="middle" fill="#F5B83D" fontSize="12">{gate}</text></g>)}
          </g>
        )}
        {activeIndex === 4 && <path d="M455 304C485 282 515 326 545 304S605 282 640 304" fill="none" stroke="#FB7185" strokeWidth="3" />}
        <text x="210" y="80" fill="#EAF0FB" fontSize="17">{viewLabels[activeIndex]}</text>
        <text x="110" y="327" fill="#7B89A7" fontSize="13">{activeIndex === 0 ? 'classical ripple analogy · measurement gives one outcome' : 'schematic amplitudes · not literal trajectories'}</text>
      </>
    );
  } else if (concept.id === 'error-correction') {
    const viewLabels = [
      'Alarm tiles guard a secret they never read',
      'A hidden chain leaves ambiguous endpoints',
      'One-round syndrome → repeated detection events',
      'Stabilizers and a declared likelihood model',
      'Lab → Stim → decoder → local receipt',
    ] as const;
    const checks = [[180, 112], [300, 112], [420, 112], [180, 230], [300, 230], [420, 230]];
    graphic = (
      <>
        <g opacity={priorOpacity} aria-hidden="true">
          <path d="M90 260L210 142L330 260L450 142L570 260" fill="none" stroke="#22D3EE" strokeWidth="10" />
        </g>
        {checks.map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <rect x={x - 38} y={y - 38} width="76" height="76" rx="10" fill="#121B31" stroke={index === 1 || index === 4 ? '#FB7185' : '#2A3A5F'} strokeWidth="2" />
            <circle cx={x} cy={y} r="7" fill={index === 1 || index === 4 ? '#FB7185' : '#34D399'} />
          </g>
        ))}
        {activeIndex >= 1 && <path d="M232 112C270 148 264 196 300 230" fill="none" stroke="#F5B83D" strokeWidth="5" strokeDasharray="8 6" />}
        {activeIndex >= 1 && <><circle cx="232" cy="112" r="10" fill="#F5B83D" /><circle cx="300" cy="230" r="10" fill="#F5B83D" /></>}
        <path d="M480 170H626" stroke={color} strokeWidth="3" />
        <path d="M620 164L634 170L620 176" fill="none" stroke={color} strokeWidth="3" />
        <text x="110" y="54" fill="#EAF0FB" fontSize="17">{viewLabels[activeIndex]}</text>
        <text x="488" y="147" fill="#A9B4CC" fontSize="14">{activeIndex === 0 ? 'alarms only' : activeIndex === 1 ? 'endpoint clues' : activeIndex === 2 ? 'time-indexed evidence' : activeIndex === 3 ? 'model-scoped inference' : 'reproducible handoff'}</text>
        <text x="488" y="193" fill="#EAF0FB" fontSize="16">{activeIndex < 2 ? 'secret remains unread' : activeIndex === 2 ? 'Dⱼ,ₜ = mⱼ,ₜ ⊕ mⱼ,ₜ₋₁' : activeIndex === 3 ? 'Λ = ε(d) / ε(d+2)' : 'no hardware claim'}</text>
      </>
    );
  } else if (concept.id === 'topology') {
    const viewLabels = [
      'A fact about the whole shape survives small changes',
      'A loop can slide and shrink without cutting',
      'Toric slice: contractible loop versus winding loop',
      'Homology class, with assumptions declared',
      'Planar Lab challenge: boundary-to-boundary path',
    ] as const;
    graphic = activeIndex === 4 ? (
      <>
        <rect x="95" y="72" width="520" height="212" rx="16" fill="#121B31" stroke="#2A3A5F" strokeWidth="3" />
        <rect x="95" y="72" width="14" height="212" fill="#F5B83D" /><rect x="601" y="72" width="14" height="212" fill="#F5B83D" />
        {Array.from({ length: 7 }, (_, row) => Array.from({ length: 11 }, (_, column) => <circle key={`${row}-${column}`} cx={125 + column * 46} cy={88 + row * 30} r="4" fill="#3D5178" />))}
        <path d="M106 194C186 142 252 224 332 172S480 132 604 182" fill="none" stroke="#FB7185" strokeWidth="6" strokeDasharray="8 6" />
        <text x="150" y="50" fill="#EAF0FB" fontSize="17">{viewLabels[activeIndex]}</text>
        <text x="256" y="308" fill="#FB7185" fontSize="14">silent logical representative</text>
        <text x="112" y="327" fill="#7B89A7" fontSize="12">planar teaching patch · compatible condensing boundaries · not hardware</text>
      </>
    ) : (
      <>
        <g opacity={priorOpacity} aria-hidden="true"><ellipse cx="340" cy="176" rx="230" ry="116" fill="none" stroke="#22D3EE" strokeWidth="13" /></g>
        <ellipse cx="320" cy="178" rx="205" ry="108" fill="#121B31" stroke="#2A3A5F" strokeWidth="3" />
        <ellipse cx="320" cy="178" rx="82" ry="48" fill="#05080F" stroke="#2A3A5F" strokeWidth="3" />
        {activeIndex >= 1 && <ellipse cx="190" cy="152" rx={activeIndex >= 2 ? 46 : 64} ry={activeIndex >= 2 ? 32 : 45} fill="none" stroke="#22D3EE" strokeWidth="4" strokeDasharray={activeIndex >= 2 ? '7 5' : undefined} />}
        {activeIndex >= 2 && <path d="M318 78C454 76 506 126 506 177C506 233 449 278 318 278" fill="none" stroke="#F5B83D" strokeWidth="5" />}
        <text x="110" y="45" fill="#EAF0FB" fontSize="17">{viewLabels[activeIndex]}</text>
        {activeIndex >= 2 && <text x="130" y="78" fill="#22D3EE" fontSize="15">contractible loop</text>}
        {activeIndex >= 2 && <text x="448" y="76" fill="#F5B83D" fontSize="15">winding class</text>}
        {activeIndex >= 3 && <text x="505" y="214" fill="#EAF0FB" fontSize="18">H₁</text>}
        <text x="112" y="316" fill="#7B89A7" fontSize="13">{activeIndex < 2 ? 'shape analogy · not a code geometry' : 'closed orientable torus slice · planar relative paths are described below'}</text>
      </>
    );
  } else if (concept.id === 'decoding') {
    const viewLabels = [
      'Tracks remain after an unseen fault passes',
      'The same endpoints allow different hidden paths',
      'Detection events form a space-time graph',
      'MWPM minimizes declared graph weight',
      'Compare a correction inside the declared model',
    ] as const;
    const nodes = [[130, 104], [230, 224], [360, 118], [480, 236], [590, 100]];
    graphic = (
      <>
        <g opacity={priorOpacity} aria-hidden="true"><path d="M80 275C180 226 206 104 330 176S535 235 646 74" fill="none" stroke="#22D3EE" strokeWidth="12" /></g>
        {activeIndex === 0 && <path d="M112 240C185 206 235 128 324 168S470 246 606 106" fill="none" stroke="#A9B4CC" strokeWidth="3" strokeDasharray="3 12" />}
        {nodes.slice(0, activeIndex === 0 ? 4 : 5).map(([x, y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r={activeIndex === 0 ? 7 : 13} fill={index === 4 ? '#F5B83D' : '#FB7185'} stroke="#EAF0FB" strokeWidth="2" />)}
        {activeIndex >= 1 && <path d="M130 104L230 224M230 224L360 118M360 118L480 236M480 236L590 100M130 104L360 118M230 224L480 236" fill="none" stroke="#3D5178" strokeWidth="2" />}
        {activeIndex >= 2 && <path d="M130 104L360 118M230 224L480 236" fill="none" stroke="#22D3EE" strokeWidth="5" />}
        {activeIndex >= 3 && <path d="M590 100L676 100" fill="none" stroke="#F5B83D" strokeWidth="5" />}
        <text x="105" y="54" fill="#EAF0FB" fontSize="17">{viewLabels[activeIndex]}</text>
        <text x="280" y="272" fill="#22D3EE" fontSize="15">{activeIndex === 0 ? 'tracks, not the event' : activeIndex === 1 ? 'two plausible pairings' : activeIndex === 2 ? 'space × time evidence' : activeIndex === 3 ? 'wₑ = ln((1−pₑ)/pₑ)' : 'Duel / Lab handoff'}</text>
        <text x="105" y="316" fill="#7B89A7" fontSize="13">the hidden fault is never revealed to the decoder</text>
      </>
    );
  } else {
    const viewLabels = [
      'One special ingredient is consumed',
      'A cleaning block can reject its attempt',
      'A prepared |A⟩ state enables T injection',
      '15-to-1 arithmetic inside its ideal scope',
      'Check assumptions, sources, and the receipt',
    ] as const;
    graphic = (
      <>
        <g opacity={priorOpacity} aria-hidden="true"><circle cx="190" cy="176" r="108" fill="none" stroke="#22D3EE" strokeWidth="12" /></g>
        {activeIndex === 0 ? (
          <g><circle cx="220" cy="176" r="62" fill="#121B31" stroke="#F5B83D" strokeWidth="4" /><text x="220" y="184" textAnchor="middle" fill="#F5B83D" fontSize="25">|A⟩</text><path d="M302 176H432" stroke="#F5B83D" strokeWidth="4" /><circle cx="510" cy="176" r="54" fill="#121B31" stroke="#34D399" strokeWidth="4" /><text x="510" y="182" textAnchor="middle" fill="#34D399" fontSize="18">used</text></g>
        ) : <g>
          {Array.from({ length: 15 }, (_, index) => {
            const angle = index / 15 * Math.PI * 2;
            const radius = 88 + (index % 3) * 12;
            return <circle key={index} cx={190 + Math.cos(angle) * radius} cy={176 + Math.sin(angle) * radius} r="9" fill={index % 4 === 0 ? '#FB7185' : '#9B7BFA'} />;
          })}
          <path d="M314 176H410" stroke="#F5B83D" strokeWidth="4" />
          <path d="M397 168L414 176L397 184" fill="none" stroke="#F5B83D" strokeWidth="4" />
          <circle cx="500" cy="176" r="58" fill="#121B31" stroke="#34D399" strokeWidth="4" />
          <text x="477" y="184" fill="#34D399" fontSize="24">|A⟩</text>
          {activeIndex === 1 && <><path d="M365 178L410 235" stroke="#FB7185" strokeWidth="3" /><circle cx="430" cy="254" r="24" fill="#121B31" stroke="#FB7185" strokeWidth="3" /><text x="430" y="258" textAnchor="middle" fill="#FB7185" fontSize="11">reject</text><text x="327" y="146" fill="#F5B83D" fontSize="12">checks accept?</text></>}
        </g>}
        <text x="108" y="45" fill="#EAF0FB" fontSize="17">{viewLabels[activeIndex]}</text>
        {activeIndex >= 2 && <text x="440" y="262" fill="#9B7BFA" fontSize="16">Clifford + |A⟩ → T</text>}
        {activeIndex >= 3 && <text x="440" y="292" fill="#F5B83D" fontSize="16">pout ≈ 35p³</text>}
        <text x="108" y="322" fill="#7B89A7" fontSize="13">{activeIndex < 3 ? 'conceptual resource flow' : 'accepted output · ideal independent-input small-p model'}</text>
      </>
    );
  }

  return (
    <figure className="min-w-0" data-depth-visual data-depth-state={DEPTHS[activeIndex]}>
      <svg viewBox="0 0 720 340" className="h-auto w-full md:h-[260px]" role="img" aria-labelledby={`${titleId} ${descId}`}>
        <title id={titleId}>{concept.label} at {DEPTH_META[activeIndex]?.label.toLowerCase()} depth</title>
        <desc id={descId}>{safeConceptCopy(WHAT_ADDS, concept.id)[activeIndex]}. The diagram is a declared teaching representation, not hardware data.</desc>
        {common}
        {graphic}
      </svg>
      <figcaption className="sr-only">
        {concept.invariant} Current representation adds {safeConceptCopy(WHAT_ADDS, concept.id)[activeIndex]}.
      </figcaption>
    </figure>
  );
}

function VerifyStepGlyph({ step, probability, phaseDeg }: { step: number; probability: number; phaseDeg: number }) {
  const markerX = 8 + phaseDeg / 360 * 72;
  if (step === 0) {
    return <svg viewBox="0 0 88 34" className="h-8 w-16" aria-hidden="true"><path d="M4 25C13 25 13 7 22 7S31 25 40 25S49 7 58 7S67 25 84 25" fill="none" stroke="#FB7185" strokeWidth="2" /><line x1="4" y1="30" x2="84" y2="30" stroke="#3D5178" /></svg>;
  }
  if (step === 1) {
    return <svg viewBox="0 0 88 34" className="h-8 w-16" aria-hidden="true"><line x1="8" y1="20" x2="80" y2="20" stroke="#3D5178" strokeWidth="2" /><line x1="8" y1="20" x2={markerX} y2="20" stroke="#FB7185" strokeWidth="3" /><circle cx={markerX} cy="20" r="5" fill="#FB7185" /></svg>;
  }
  if (step === 2) {
    return <svg viewBox="0 0 88 34" className="h-8 w-16" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <circle key={index} cx={8 + index % 6 * 14} cy={10 + Math.floor(index / 6) * 14} r="4" fill={index < Math.round(probability * 12) ? '#FB7185' : '#2A3A5F'} />)}</svg>;
  }
  return <svg viewBox="0 0 88 34" className="h-8 w-16" aria-hidden="true"><path d="M4 23C14 7 25 7 36 23S58 39 68 23S78 7 84 13" fill="none" stroke="#A9B4CC" strokeWidth="7" strokeOpacity="0.22" /><path d="M4 23C14 10 25 10 36 23S58 36 68 23S78 10 84 14" fill="none" stroke="#FB7185" strokeWidth="2" /></svg>;
}

function RailMiniVisual({ conceptId, depthIndex, color }: { conceptId: string; depthIndex: number; color: string }) {
  if (conceptId === 'superposition') {
    if (depthIndex === 0) return <svg viewBox="0 0 120 44" className="mt-3 h-11 w-full" aria-hidden="true"><circle cx="8" cy="22" r="3" fill={color} /><path d="M12 22Q38 2 60 22T108 22M12 22Q38 42 60 22T108 22" fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 3" /><circle cx="112" cy="22" r="3" fill={color} /></svg>;
    if (depthIndex === 1) return <svg viewBox="0 0 120 44" className="mt-3 h-11 w-full" aria-hidden="true"><circle cx="8" cy="22" r="3" fill={color} /><path d="M12 22L42 7H80L108 22M12 22L42 37H80L108 22" fill="none" stroke={color} strokeWidth="2" /><circle cx="112" cy="22" r="3" fill={color} /></svg>;
    if (depthIndex === 2) return <svg viewBox="0 0 120 44" className="mt-3 h-11 w-full" aria-hidden="true"><path d="M5 14C22 2 39 26 56 14S90 2 115 14M5 31C22 43 39 19 56 31S90 43 115 31" fill="none" stroke={color} strokeWidth="2" /><line x1="58" y1="4" x2="58" y2="40" stroke="#A9B4CC" strokeOpacity="0.4" /></svg>;
    if (depthIndex === 3) return <svg viewBox="0 0 120 44" className="mt-3 h-11 w-full" aria-hidden="true"><text x="60" y="18" textAnchor="middle" fill={color} fontSize="12">A₀ = a₀ + a₁</text><text x="60" y="36" textAnchor="middle" fill="#EAF0FB" fontSize="12">P(0) = |A₀|²</text></svg>;
    return <svg viewBox="0 0 120 44" className="mt-3 h-11 w-full" aria-hidden="true"><path d="M5 30C16 7 28 7 40 30S64 53 76 30S100 7 115 25" fill="none" stroke="#A9B4CC" strokeWidth="8" strokeOpacity="0.22" /><path d="M5 30C16 11 28 11 40 30S64 49 76 30S100 11 115 25" fill="none" stroke={color} strokeWidth="2" /></svg>;
  }
  const Icon = DEPTH_META[depthIndex]?.Icon ?? Eye;
  return <div className="mt-3 flex h-11 items-center justify-center rounded-lg border border-ink-700 bg-ink-950/60" aria-hidden="true"><Icon className="h-6 w-6" style={{ color }} /></div>;
}

function VerifyPreview({
  concept,
  expanded,
  openVerify,
  phaseDeg,
  setPhaseDeg,
  pathMode,
  setPathMode,
  playing,
  setPlaying,
  reduce,
}: {
  concept: AltitudeConcept;
  expanded: boolean;
  openVerify: () => void;
  phaseDeg: number;
  setPhaseDeg: (value: number) => void;
  pathMode: PathRecordMode;
  setPathMode: (value: PathRecordMode) => void;
  playing: boolean;
  setPlaying: (value: boolean) => void;
  reduce: boolean;
}) {
  const [prediction, setPrediction] = useState<'bright' | 'balanced' | 'dark' | null>(null);
  const sample = useMemo(() => sampleInterference(phaseDeg, pathMode), [phaseDeg, pathMode]);
  const expectedBand = sample.predictedP0 > 0.66 ? 'bright' : sample.predictedP0 < 0.34 ? 'dark' : 'balanced';
  const intervalText = `${(sample.interval[0] * 100).toFixed(1)}–${(sample.interval[1] * 100).toFixed(1)}%`;

  useEffect(() => {
    if (concept.id !== 'superposition' || !playing) return undefined;
    if (reduce) {
      setPhaseDeg(180);
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      if (phaseDeg >= 345) {
        setPhaseDeg(360);
        setPlaying(false);
      } else {
        setPhaseDeg(phaseDeg + 15);
      }
    }, 90);
    return () => window.clearTimeout(timer);
  }, [concept.id, phaseDeg, playing, reduce, setPhaseDeg, setPlaying]);

  if (concept.id === 'superposition' && !expanded) {
    const steps = [
      ['Predict', `${(sample.predictedP0 * 100).toFixed(0)}% at detector 0`],
      ['Sweep phase', phaseLabel(phaseDeg)],
      ['Observe', `${sample.count0}/${DEPTH_OBSERVATORY_SHOTS} seeded outcomes`],
      ['Compare', `95% interval ${intervalText}`],
    ] as const;
    return (
      <aside className="rounded-2xl border border-syndrome/55 bg-syndrome/[0.035] p-4 md:p-5" aria-labelledby="depth-verify-title">
        <div className="flex items-center gap-2 text-syndrome">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          <h3 id="depth-verify-title" className="font-display text-lg font-semibold">Verify preview</h3>
        </div>
        <ol className="mt-4 space-y-3">
          {steps.map(([label, value], index) => (
            <li key={label} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 rounded-xl border border-ink-700 bg-ink-950/55 p-2.5">
              <span className="font-mono text-xs text-syndrome">0{index + 1}</span>
              <span><strong className="block text-sm text-text-hi">{label}</strong><span className="mt-0.5 block text-xs text-text-low">{value}</span></span>
              <VerifyStepGlyph
                step={index}
                probability={index === 2 ? sample.observedP0 : sample.predictedP0}
                phaseDeg={phaseDeg}
              />
            </li>
          ))}
        </ol>
        <button type="button" onClick={openVerify} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-syndrome/55 px-3 py-2 text-sm font-semibold text-syndrome hover:bg-syndrome/10">
          <FlaskConical className="h-4 w-4" aria-hidden="true" /> Open the phase experiment
        </button>
        <p className="mt-4 border-t border-ink-700 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-syndrome">Seeded browser model · not hardware</p>
      </aside>
    );
  }

  if (concept.id !== 'superposition') {
    return (
      <aside className="rounded-2xl border border-syndrome/45 bg-syndrome/[0.035] p-4 md:p-5" aria-labelledby="depth-verify-title">
        <div className="flex items-center gap-2 text-syndrome">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          <h3 id="depth-verify-title" className="font-display text-lg font-semibold">Verify handoff</h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-text-mid">
          This Observatory has no executable {concept.label.toLowerCase()} model. Use the linked Lab or primary source instead of fabricated data.
        </p>
        <ol className="mt-4 space-y-3 text-sm text-text-hi">
          {['Predict a result', 'Open the declared model', 'Inspect its boundary', 'Keep the receipt'].map((step, index) => (
            <li key={step} className="flex gap-3"><span className="font-mono text-syndrome">0{index + 1}</span><span>{step}</span></li>
          ))}
        </ol>
        <div className="mt-5 space-y-2">
          {concept.proLinks.slice(0, 3).map((link) => link.external ? (
            <a key={link.label} href={link.to} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-text-mid hover:border-syndrome/60 hover:text-text-hi">
              {link.label}<ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <Link key={link.label} to={link.to} className="flex min-h-11 items-center justify-between rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-text-mid hover:border-syndrome/60 hover:text-text-hi">
              {link.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="mt-5 border-t border-ink-700 pt-4 font-mono text-[11px] uppercase tracking-wider text-syndrome">Evidence boundary · no invented observations</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-syndrome/55 bg-syndrome/[0.035] p-4 md:p-5" aria-labelledby="depth-verify-title">
      <div className="flex items-center justify-between gap-3 text-syndrome">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          <h3 id="depth-verify-title" className="font-display text-lg font-semibold">Verify preview</h3>
        </div>
        <span className="font-mono text-[10px]">N={DEPTH_OBSERVATORY_SHOTS}</span>
      </div>

      <div className="mt-4 space-y-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">01 · Predict detector 0</p>
          <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Predict detector zero frequency">
            {(['bright', 'balanced', 'dark'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={prediction === choice}
                onClick={() => setPrediction(choice)}
                className={prediction === choice
                  ? 'min-h-11 rounded-lg border border-syndrome bg-syndrome/15 px-2 text-xs font-semibold capitalize text-syndrome'
                  : 'min-h-11 rounded-lg border border-ink-600 bg-ink-900 px-2 text-xs capitalize text-text-mid hover:border-ink-500'}
              >
                {choice}
              </button>
            ))}
          </div>
          {prediction && <p className="mt-2 text-xs text-text-low">Your prediction: <span className={prediction === expectedBand ? 'text-stabilizer' : 'text-magic'}>{prediction}</span>. The model predicts {expectedBand} at this phase.</p>}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="depth-phase" className="font-mono text-[10px] uppercase tracking-wider text-text-low">02 · Sweep phase</label>
            <output htmlFor="depth-phase" className="font-mono text-xs text-syndrome">{phaseLabel(phaseDeg)}</output>
          </div>
          <input
            id="depth-phase"
            type="range"
            min="0"
            max="360"
            step="15"
            value={phaseDeg}
            onChange={(event) => {
              setPlaying(false);
              setPhaseDeg(Number(event.target.value));
            }}
            aria-label="Relative phase Δφ"
            aria-valuetext={`${phaseLabel(phaseDeg)}, predicted detector zero probability ${(sample.predictedP0 * 100).toFixed(1)} percent`}
            className="mt-3 w-full accent-syndrome"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => {
              if (!playing && phaseDeg >= 360) setPhaseDeg(0);
              setPlaying(!playing);
            }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-syndrome/50 px-3 py-2 text-xs font-semibold text-syndrome hover:bg-syndrome/10">
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? 'Pause sweep' : reduce ? 'Show reduced-motion result' : 'Run phase sweep'}
            </button>
            <button type="button" onClick={() => { setPlaying(false); setPhaseDeg(0); setPrediction(null); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-xs text-text-mid hover:border-ink-500">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </button>
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">03 · Observe seeded model shots</p>
          <div className="mt-2 grid grid-cols-10 gap-1" aria-hidden="true">
            {Array.from({ length: 50 }, (_, index) => (
              <span key={index} className={`aspect-square rounded-full ${index < Math.round(sample.observedP0 * 50) ? 'bg-syndrome' : 'bg-ink-600'}`} />
            ))}
          </div>
          <p className="mt-2 text-sm text-text-hi"><strong>{sample.count0}/{DEPTH_OBSERVATORY_SHOTS}</strong> detector-0 outcomes · {(sample.observedP0 * 100).toFixed(1)}%</p>
        </div>

        <div className="rounded-xl border border-ink-600 bg-ink-950/70 p-3" role={playing ? undefined : 'status'} aria-live={playing ? 'off' : 'polite'}>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">04 · Compare</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div><span className="text-xs text-text-low">Ideal prediction</span><strong className="block text-xl text-syndrome">{(sample.predictedP0 * 100).toFixed(1)}%</strong></div>
            <div className="text-right"><span className="text-xs text-text-low">95% Wilson interval</span><strong className="block text-sm text-text-hi">{intervalText}</strong></div>
          </div>
        </div>

        <fieldset className="rounded-xl border border-ink-600 p-3">
          <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-text-low">Which-path record</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['coherent', 'No record'],
              ['orthogonal-record', 'Orthogonal record'],
            ] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={pathMode === value} onClick={() => { setPathMode(value); setPlaying(false); }} className={pathMode === value ? 'min-h-11 rounded-lg border border-plaquette bg-plaquette/10 px-2 text-xs font-semibold text-plaquette' : 'min-h-11 rounded-lg border border-ink-600 px-2 text-xs text-text-mid'}>{label}</button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-text-low">Only an orthogonal path record removes the ideal fringe in this declared model.</p>
        </fieldset>
      </div>

      <p className="mt-5 border-t border-ink-700 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-syndrome">
        Seeded browser model · finite-sample evidence · not hardware
      </p>
      <p className="mt-1 font-mono text-[9px] text-text-low">seed 0x{DEPTH_OBSERVATORY_SEED.toString(16)} · ideal balanced H–phase–H model</p>
    </aside>
  );
}

function DepthOrbit({
  concept,
  activeIndex,
  selectDepth,
}: {
  concept: AltitudeConcept;
  activeIndex: number;
  selectDepth: (index: number, focus?: boolean) => void;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const orbitId = useId().replace(/:/g, '');

  const handleTabKey = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % DEPTHS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + DEPTHS.length) % DEPTHS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = DEPTHS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    event.stopPropagation();
    selectDepth(nextIndex);
    requestAnimationFrame(() => tabRefs.current[nextIndex ?? 0]?.focus());
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/80 px-2 pb-2 pt-4 md:px-6 md:pt-5">
      <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-5 top-2 h-[120px] w-[calc(100%-2.5rem)]" aria-hidden="true">
        <defs><linearGradient id={`${orbitId}-line`} x1="0" x2="1"><stop stopColor="#22D3EE" /><stop offset="0.5" stopColor="#9B7BFA" /><stop offset="1" stopColor="#FB7185" /></linearGradient></defs>
        <ellipse cx="500" cy="92" rx="465" ry="60" fill="none" stroke={`url(#${orbitId}-line)`} strokeOpacity="0.75" strokeWidth="2" />
      </svg>
      <div className="relative grid grid-cols-5 gap-1" role="tablist" aria-label={`${concept.label} explanation views`}>
        {DEPTH_META.map((item, index) => {
          const active = index === activeIndex;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              role="tab"
              id={`depth-tab-${item.id}`}
              aria-controls="depth-observatory-panel"
              aria-selected={active}
              aria-label={`${item.label} depth — ${item.descriptor}`}
              aria-keyshortcuts={`${index + 1}`}
              tabIndex={active ? 0 : -1}
              onClick={() => selectDepth(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
              className="group flex min-h-[100px] min-w-0 flex-col items-center justify-start rounded-xl px-1 py-1 text-center focus-visible:outline-offset-2"
              style={{ color: item.color }}
            >
              <motion.span
                initial={false}
                animate={{ scale: active ? 1.08 : 1, opacity: active ? 1 : 0.72 }}
                className="flex h-12 w-12 items-center justify-center rounded-full border bg-ink-950 shadow-lg md:h-16 md:w-16"
                style={{ borderColor: item.color, boxShadow: active ? `0 0 0 5px ${item.color}22, 0 0 28px ${item.color}55` : undefined }}
              >
                <Icon className="h-5 w-5 md:h-7 md:w-7" aria-hidden="true" />
              </motion.span>
              <span className="mt-2 truncate text-[10px] font-semibold md:text-sm">{item.label}</span>
              <span className="mt-0.5 hidden font-mono text-[9px] opacity-80 sm:block">{item.marker}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AllDepthRail({ concept, activeIndex }: { concept: AltitudeConcept; activeIndex: number }) {
  const summaries = safeConceptCopy(RAIL_COPY, concept.id);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/80 p-4 md:p-5" aria-labelledby="all-depths-title">
      <div className="pointer-events-none absolute left-[13%] right-5 top-[58%] hidden h-px bg-gradient-to-r from-plaquette via-star to-syndrome xl:block" aria-hidden="true" />
      <div className="relative grid grid-cols-2 gap-3 xl:grid-cols-6">
        <div className="col-span-2 rounded-xl border border-plaquette/40 bg-plaquette/[0.04] p-4 xl:col-span-1">
          <h3 id="all-depths-title" className="font-display text-lg font-semibold text-text-hi">All depths at once</h3>
          <p className="mt-2 text-xs leading-5 text-text-mid">One invariant passes through all five representations.</p>
          <span className="mt-4 inline-flex rounded-lg border border-plaquette/50 bg-ink-950 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-plaquette">Invariant</span>
        </div>
        {DEPTH_META.map((item, index) => (
          <article key={item.id} className="relative rounded-xl border bg-ink-900/90 p-4" style={{ borderColor: index === activeIndex ? item.color : `${item.color}55`, boxShadow: index === activeIndex ? `0 0 22px ${item.color}22` : undefined }}>
            <p className="font-display text-base font-semibold" style={{ color: item.color }}>{item.label[0]}{item.label.slice(1).toLowerCase()}</p>
            <p className="mt-2 min-h-10 text-xs leading-5 text-text-mid">{summaries[index]}</p>
            <RailMiniVisual conceptId={concept.id} depthIndex={index} color={item.color} />
            <p className="mt-3 overflow-x-auto font-mono text-[10px] leading-4 text-text-hi">{safeConceptCopy(FORMULAS, concept.id)[index]}</p>
          </article>
        ))}
      </div>
      <p className="relative mt-4 border-t border-ink-700 pt-3 text-xs leading-5 text-text-low"><span className="font-mono uppercase tracking-wider text-plaquette">Invariant</span><span className="ml-2">{concept.invariant}</span></p>
    </section>
  );
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches('input, textarea, select, [contenteditable="true"]');
}

export default function DepthObservatory({ concept }: { concept: AltitudeConcept }) {
  const { explanationDepth, setExplanationDepth } = useProgress();
  const activeIndex = Math.max(0, DEPTHS.indexOf(explanationDepth));
  const level = concept.levels[activeIndex] ?? concept.levels[0];
  const reduce = Boolean(useReducedMotion());
  const [ghostEarlier, setGhostEarlier] = useState(true);
  const [phaseDeg, setPhaseDegState] = useState(90);
  const [pathMode, setPathMode] = useState<PathRecordMode>('coherent');
  const [playing, setPlaying] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const observatoryLabel = concept.id === 'superposition' ? 'Superposition / interference' : concept.label;
  const ghostEnabled = activeIndex > 0;

  const setPhaseDeg = (value: number | ((current: number) => number)) => {
    setPhaseDegState((current) => {
      const next = typeof value === 'function' ? value(current) : value;
      if (!Number.isFinite(next)) return current;
      if (next > 360) {
        setPlaying(false);
        return 360;
      }
      return Math.max(0, Math.min(360, next));
    });
  };

  const selectDepth = (index: number, focus = false) => {
    const boundedIndex = Math.max(0, Math.min(DEPTHS.length - 1, index));
    const depth = DEPTHS[boundedIndex] ?? 'story';
    if (depth !== 'verify') setPlaying(false);
    setExplanationDepth(depth);
    if (focus) requestAnimationFrame(() => document.getElementById(`depth-tab-${depth}`)?.focus());
  };

  const reset = () => {
    setPlaying(false);
    setPhaseDeg(90);
    setPathMode('coherent');
  };

  const handleObservatoryKey = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (isEditableTarget(event.target)) return;
    if (/^[1-5]$/.test(event.key)) {
      event.preventDefault();
      selectDepth(Number(event.key) - 1, true);
      return;
    }
    if (event.key.toLowerCase() === 'g') {
      event.preventDefault();
      if (ghostEnabled) setGhostEarlier((current) => !current);
    }
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      panelRef.current?.focus();
    }
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      reset();
    }
  };

  if (concept.levels.length !== DEPTHS.length) {
    return (
      <section className="rounded-2xl border border-syndrome/50 bg-syndrome/[0.05] p-6" role="status">
        This concept cannot enter the five-view Observatory because its depth data is incomplete.
      </section>
    );
  }

  return (
    <section
      className="rounded-[1.35rem] border border-ink-600 bg-ink-900 p-3 shadow-glow-violet md:p-5"
      aria-labelledby={titleId}
      data-depth-observatory
      data-concept-id={concept.id}
      data-motion-state={reduce ? 'static' : 'animated'}
      onKeyDown={handleObservatoryKey}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="eyebrow">// DEPTH OBSERVATORY · {observatoryLabel}</p>
          <h2 id={titleId} className="mt-2 font-display text-2xl font-bold text-text-hi md:text-3xl">One idea. Five honest views.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-mid">Choose any view. The representation changes; the invariant does not. Depth marks explanatory detail, never learner ability.</p>
        </div>
        <span className="rounded-full border border-plaquette/40 bg-plaquette/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-plaquette">interactive teaching model</span>
      </div>

      <DepthOrbit concept={concept} activeIndex={activeIndex} selectDepth={selectDepth} />

      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_330px]">
        <aside className="space-y-3">
          <div className="rounded-xl border border-ink-600 bg-ink-950/75 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-low">Focus the explanation</p>
            <ol className="mt-3 space-y-1.5" aria-label="Depth focus summary">
              {DEPTH_META.map((item, index) => {
                const Icon = item.Icon;
                return (
                  <li key={item.id} className={`flex min-h-9 items-center gap-2 rounded-lg border px-2 text-xs ${index === activeIndex ? 'border-current bg-white/[0.04]' : 'border-transparent text-text-low'}`} style={index === activeIndex ? { color: item.color } : undefined}>
                    <Icon className="h-4 w-4" aria-hidden="true" /><span className="flex-1">{item.label[0]}{item.label.slice(1).toLowerCase()}</span><span className="h-2.5 w-2.5 rounded-full border" style={{ background: index === activeIndex ? item.color : 'transparent' }} aria-hidden="true" />
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="rounded-xl border border-ink-600 bg-ink-950/75 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-text-hi"><Ghost className="h-4 w-4" aria-hidden="true" /><span className="text-xs font-semibold">Ghost earlier layers</span></div>
              <button
                type="button"
                role="switch"
                aria-checked={ghostEnabled && ghostEarlier}
                aria-label="Show earlier depth layers"
                aria-keyshortcuts="G"
                disabled={!ghostEnabled}
                onClick={() => { if (ghostEnabled) setGhostEarlier((current) => !current); }}
                className={`relative h-7 w-12 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${ghostEnabled && ghostEarlier ? 'border-plaquette bg-plaquette/30' : 'border-ink-500 bg-ink-800'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-text-hi transition-transform ${ghostEnabled && ghostEarlier ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-text-low">{ghostEnabled ? 'Show prior representations faintly without mixing their claims.' : 'Story is the first view, so there is no earlier layer to ghost.'}</p>
          </div>
          <div className="rounded-xl border border-star/45 bg-star/[0.055] p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-star">What this view adds</p>
            <p className="mt-2 text-xs leading-5 text-text-mid">{safeConceptCopy(WHAT_ADDS, concept.id)[activeIndex]}</p>
          </div>
        </aside>

        <div
          id="depth-observatory-panel"
          ref={panelRef}
          role="tabpanel"
          aria-labelledby={`depth-tab-${DEPTHS[activeIndex]}`}
          tabIndex={-1}
          className="min-w-0 rounded-2xl border border-star/45 bg-ink-950/70 p-3 md:p-5"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${concept.id}-${explanationDepth}`}
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 1.01 }}
              transition={{ duration: reduce ? 0 : 0.24 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: depthColor(activeIndex) }}>{DEPTH_META[activeIndex]?.label} representation</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-text-hi">{level.title}</h3>
                </div>
                <code className="max-w-full overflow-x-auto rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 font-mono text-[11px] text-text-hi">{safeConceptCopy(FORMULAS, concept.id)[activeIndex]}</code>
              </div>

              <div className="mt-4"><DiagramFrame concept={concept} activeIndex={activeIndex} ghostEarlier={ghostEnabled && ghostEarlier} phaseDeg={phaseDeg} /></div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-stabilizer/35 bg-stabilizer/[0.05] p-3 text-xs leading-5 text-stabilizer">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{level.takeaway}</span>
              </div>
              <details className="mt-3 rounded-xl border border-ink-700 bg-ink-900/55 p-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-text-mid">Read this depth’s full explanation</summary>
                <p className="mt-3 text-sm leading-6 text-text-mid">{level.explanation}</p>
                {level.revises && (
                  <div className="mt-4 rounded-xl border border-syndrome/35 bg-syndrome/[0.045] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-syndrome">What the previous view hid</p>
                    <p className="mt-1 text-xs leading-5 text-text-mid">{level.revises}</p>
                  </div>
                )}
              </details>
            </motion.div>
          </AnimatePresence>
        </div>

        <VerifyPreview
          concept={concept}
          expanded={activeIndex === DEPTHS.length - 1}
          openVerify={() => selectDepth(DEPTHS.length - 1, true)}
          phaseDeg={phaseDeg}
          setPhaseDeg={setPhaseDeg}
          pathMode={pathMode}
          setPathMode={setPathMode}
          playing={playing}
          setPlaying={setPlaying}
          reduce={reduce}
        />
      </div>

      <div className="mt-4"><AllDepthRail concept={concept} activeIndex={activeIndex} /></div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-ink-700 bg-ink-950/75 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-low" aria-label="Depth Observatory keyboard shortcuts">
        <span className="inline-flex items-center gap-2"><kbd className="rounded border border-ink-500 px-1.5 py-0.5 text-text-hi">1–5</kbd> switch view</span>
        <span className="inline-flex items-center gap-2"><kbd className="rounded border border-ink-500 px-1.5 py-0.5 text-text-hi"><ArrowLeft className="inline h-3 w-3" /><ArrowRight className="inline h-3 w-3" /></kbd> navigate path</span>
        <span><kbd className="rounded border border-ink-500 px-1.5 py-0.5 text-text-hi">F</kbd> focus view</span>
        <span><kbd className="rounded border border-ink-500 px-1.5 py-0.5 text-text-hi">G</kbd> toggle ghost</span>
        <button type="button" onClick={reset} aria-keyshortcuts="R" className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink-600 px-3 py-2 text-text-mid hover:border-ink-500 hover:text-text-hi"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset demonstration</button>
      </div>

      <p className="mt-3 flex gap-2 px-1 text-[11px] leading-5 text-text-low">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-plaquette" aria-hidden="true" />
        <span><strong className="text-text-mid">Visual truth:</strong> representations are generated teaching models. The Superposition phase sweep is seeded browser evidence for an ideal balanced circuit, not a hardware measurement.</span>
      </p>
      <span className="sr-only" aria-live="polite">{DEPTH_META[activeIndex]?.label} depth loaded. {safeConceptCopy(WHAT_ADDS, concept.id)[activeIndex]}.</span>
    </section>
  );
}

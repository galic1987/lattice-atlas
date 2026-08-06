import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Map as MapIcon, ScrollText, Route } from 'lucide-react';
import { topicById, shortName } from '@/data';

/* ------------------------------------------------------------------ */
/* Glossary data (design/glossary.md §4 — 29 terms, 5 categories)      */
/* ------------------------------------------------------------------ */

type Category =
  | 'code theory'
  | 'topology & anyons'
  | 'computation'
  | 'decoding'
  | 'hardware & experiment';

interface GlossaryTerm {
  term: string;
  slug: string;
  category: Category;
  short: string;
  long: string;
  notation?: string;
  related_terms: string[];
  related_topics: string[];
  related_papers: string[];
}

const CATEGORIES: Category[] = [
  'code theory',
  'topology & anyons',
  'computation',
  'decoding',
  'hardware & experiment',
];

const CATEGORY_COLORS: Record<Category, string> = {
  'code theory': '#22D3EE',
  'topology & anyons': '#8B5CF6',
  computation: '#F5B83D',
  decoding: '#FB7185',
  'hardware & experiment': '#34D399',
};

const TERMS: GlossaryTerm[] = [
  {
    term: 'ancilla qubit',
    slug: 'ancilla-qubit',
    category: 'hardware & experiment',
    short:
      'A helper qubit that stores no logical information but mediates the stabilizer measurements of the data qubits around it.',
    long:
      'In every syndrome-extraction round, the circuit entangles each ancilla with its neighboring data qubits and then measures it. Each measurement reads out one stabilizer and never touches the encoded state directly. Ancillas sit in the middle of the extraction circuit, so their own faults are a primary source of correlated errors. Flag qubits and careful measurement schedules keep those faults contained.',
    related_terms: ['syndrome', 'stabilizer', 'flag-qubit'],
    related_topics: ['syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'anyon',
    slug: 'anyon',
    category: 'topology & anyons',
    short:
      'A quasiparticle of a two-dimensional system whose exchange statistics are neither bosonic nor fermionic.',
    long:
      'Swapping two anyons, or winding one around another, transforms the quantum state in ways that depend only on the topology of the path — not its details. In the toric and surface codes, the e and m anyons are exactly the endpoint excitations of error chains, and braiding them is the original route to logical gates. This path-independence is the physical origin of topological protection.',
    related_terms: ['braiding', 'topological-order', 'toric-code'],
    related_topics: ['topological-order-anyons', 'toric-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'braiding',
    slug: 'braiding',
    category: 'computation',
    short:
      'Moving anyons or defects around one another so their world-lines tangle, enacting a logical operation through topology alone.',
    long:
      'A braid is robust because only the winding pattern matters: small wobbles in the path leave the logical operation unchanged. Early surface-code schemes computed by braiding defects (holes) around each other, with a CNOT for every full wind. Braiding is elegant but space-hungry — modern architectures mostly replace it with lattice surgery, which achieves the same gates by merging and splitting patches.',
    related_terms: ['anyon', 'defect-hole', 'lattice-surgery'],
    related_topics: ['defects-braiding'],
    related_papers: ['0803.0272'],
  },
  {
    term: 'Clifford gate',
    slug: 'clifford-gate',
    category: 'computation',
    short:
      'A gate from the group that maps Pauli operators to Pauli operators — H, S, CNOT. Clifford gates are powerful, but a classical computer can simulate them efficiently.',
    long:
      'By the Gottesman–Knill theorem, circuits of Clifford gates alone can never outperform a classical computer. This is also why you can simulate Clifford-only error-correction schemes at scale. In surface codes, most Clifford operations are cheap: they are transversal, achievable by lattice surgery, or even trackable as Pauli frames in software. But universal computation also needs a non-Clifford gate supplied from outside the group.',
    related_terms: ['non-clifford-gate', 'magic-state', 'stabilizer'],
    related_topics: ['quantum-gates-circuits', 'clifford-simulation-hybrid'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'non-Clifford gate',
    slug: 'non-clifford-gate',
    category: 'computation',
    short:
      'A gate outside the Clifford group — like the T (π/8) gate — required for universal, classically intractable quantum computation.',
    long:
      'Surface codes cannot implement a T gate transversally, so the scheme injects it indirectly. The circuit prepares a magic state, then consumes it by gate teleportation to apply T to the data. This indirection is why the cost of a fault-tolerant algorithm is often quoted as its T-count — non-Clifford gates dominate the resource budget of realistic machines.',
    notation: 'T',
    related_terms: ['clifford-gate', 'magic-state'],
    related_topics: ['magic-states-distillation'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'code distance',
    slug: 'code-distance',
    category: 'code theory',
    short:
      'The minimum number of physical qubit errors that can combine into an undetectable logical error.',
    long:
      'A distance-d code can correct any ⌊(d−1)/2⌋ errors, because no error chain shorter than d can mimic a logical operator. Distance is the single most important code parameter. Below threshold, the logical error rate falls exponentially as d grows. That is why experiments work hard to show that raising d from 3 to 5 to 7 actually suppresses errors.',
    notation: 'd',
    related_terms: ['logical-operator', 'surface-code', 'threshold-theorem'],
    related_topics: ['quantum-codes-basics', 'surface-code'],
    related_papers: ['2207.06431'],
  },
  {
    term: 'CSS code',
    slug: 'css-code',
    category: 'code theory',
    short:
      'A stabilizer code built from two classical codes, whose X-type and Z-type checks can be designed and decoded separately.',
    long:
      'CSS codes are named for Calderbank, Shor, and Steane. The construction lets you import mature classical coding theory into the quantum world: correct bit flips with one classical code and phase flips with another. The surface code is CSS, so decoders can handle its X- and Z-syndromes (mostly) independently — a huge practical simplification.',
    notation: '[[n,k,d]]',
    related_terms: ['stabilizer', 'code-distance', 'syndrome'],
    related_topics: ['quantum-codes-basics'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'defect / hole',
    slug: 'defect-hole',
    category: 'topology & anyons',
    short:
      'A region of the lattice where stabilizer measurements are switched off, punching a hole that encodes a logical qubit.',
    long:
      'A defect creates an interior boundary, and the new edge degree of freedom becomes a logical qubit. Smooth and rough defects come in dual flavors, and braiding one around another — or around a lattice boundary — applies logical gates. Defect schemes were the original vision for surface-code computation before the denser, boundary-driven lattice-surgery approach took over.',
    related_terms: ['braiding', 'surface-code', 'plaquette'],
    related_topics: ['defects-braiding'],
    related_papers: ['0803.0272'],
  },
  {
    term: 'error chain',
    slug: 'error-chain',
    category: 'code theory',
    short:
      'A connected path of physical errors on the lattice whose two endpoints are the only places the syndrome can detect.',
    long:
      'Errors on the surface code form strings. A chain of Pauli errors anticommutes only with the stabilizers at its ends, so the bulk of the chain stays invisible. Decoding is the art of guessing which chains produced the observed endpoints. A chain that stretches from boundary to boundary (or winds a defect) has no endpoints at all. It is a logical operator — the failure that every decoder must avoid.',
    related_terms: ['syndrome', 'mwpm-decoder', 'logical-operator'],
    related_topics: ['decoding-mwpm'],
    related_papers: ['1307.1740'],
  },
  {
    term: 'fault tolerance',
    slug: 'fault-tolerance',
    category: 'code theory',
    short:
      'The property that no single component failure — gate, qubit, or measurement — can spread into an uncorrectable logical error.',
    long:
      'A code alone is not enough. The circuits that extract the syndrome are themselves noisy. You must design them so that a single fault causes at most a correctable amount of damage. Fault-tolerant circuit design — careful gate ordering, flags, repeated measurement rounds — is what turns an ideal threshold theorem into a number you can actually meet in hardware.',
    related_terms: ['threshold-theorem', 'hook-error', 'flag-qubit'],
    related_topics: ['fault-tolerance-thresholds'],
    related_papers: ['1206.0800'],
  },
  {
    term: 'flag qubit',
    slug: 'flag-qubit',
    category: 'hardware & experiment',
    short:
      'An extra ancilla that signals when a correlated fault has spread from the extraction circuit onto the data qubits.',
    long:
      'Flag fault tolerance gives protection with very few extra qubits. The circuit entangles a flag with the syndrome ancilla. If the flag "raises", the decoder knows a dangerous multi-qubit error may have occurred, and it can correct that error. Flag schemes shrink the overhead of fault-tolerant syndrome extraction, which matters enormously for the small, near-term devices where every qubit counts.',
    related_terms: ['ancilla-qubit', 'hook-error', 'fault-tolerance'],
    related_topics: ['flag-fault-tolerance'],
    related_papers: ['1402.4848'],
  },
  {
    term: 'hook error',
    slug: 'hook-error',
    category: 'hardware & experiment',
    short:
      'A single ancilla fault that propagates through the extraction circuit into two data-qubit errors — sometimes aligned with the logical operator.',
    long:
      'Whether a hook error is dangerous depends on its orientation. A hook perpendicular to the logical operator is harmless. A hook parallel to it can cut the effective code distance in half. Clever measurement scheduling — such as the diagonal "off-the-hook" extraction order — rotates hooks into the harmless direction, recovering the full distance at zero hardware cost.',
    related_terms: ['flag-qubit', 'ancilla-qubit', 'fault-tolerance'],
    related_topics: ['syndrome-extraction-circuits'],
    related_papers: ['2602.09099'],
  },
  {
    term: 'lattice surgery',
    slug: 'lattice-surgery',
    category: 'computation',
    short:
      'Logical operations performed by merging code patches along their boundaries and splitting them apart again.',
    long:
      'Merging two surface-code patches measures a joint logical operator; splitting them afterwards preserves the encoded states. CNOTs, Hadamards, and multi-qubit Pauli measurements all reduce to sequences of merges and splits. So an entire algorithm becomes a layout-and-scheduling problem on a 2D grid of patches. Lattice surgery is the dominant paradigm for fault-tolerant computation because it is planar, local, and space-efficient.',
    related_terms: ['surface-code', 'rotated-surface-code', 'logical-qubit'],
    related_topics: ['lattice-surgery'],
    related_papers: ['1111.4022', '1808.06709'],
  },
  {
    term: 'logical operator',
    slug: 'logical-operator',
    category: 'code theory',
    short:
      'An operator that acts on the encoded qubit: a chain of Paulis that commutes with every stabilizer but is not itself a stabilizer.',
    long:
      'On the surface code, logical X and Z are strings of physical Paulis stretching from boundary to boundary (or winding a hole). Their minimum weight equals the code distance, which is exactly why distance bounds how much error the code can absorb. Applying a logical operator intentionally performs a gate; having one sneak in undetected is a logical error.',
    related_terms: ['code-distance', 'logical-qubit', 'error-chain'],
    related_topics: ['toric-code', 'surface-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'logical qubit',
    slug: 'logical-qubit',
    category: 'code theory',
    short:
      'The protected qubit encoded collectively across many noisy physical qubits of an error-correcting code.',
    long:
      'No single physical qubit holds the logical state — it lives in the correlations of the whole lattice, invisible to local errors. The goal of the field is a logical qubit whose error rate falls below that of its physical constituents. Adding more physical qubits then makes the rate fall exponentially. Recent below-threshold experiments crossed the first of those milestones.',
    related_terms: ['logical-operator', 'code-distance', 'stabilizer'],
    related_topics: ['quantum-codes-basics', 'below-threshold-experiments'],
    related_papers: ['2207.06431', '2408.13687'],
  },
  {
    term: 'magic state',
    slug: 'magic-state',
    category: 'computation',
    short:
      'A specially prepared resource state that, consumed by gate teleportation, supplies the non-Clifford power a surface code lacks natively.',
    long:
      'Clifford operations plus magic states are universal. Injected magic states are noisy, so distillation factories purify them. These circuits turn many noisy copies into a few high-quality ones. A newer method, cultivation, grows magic states directly on the lattice at much lower overhead. Magic-state production is usually the single largest cost center of a fault-tolerant algorithm.',
    notation: '|T⟩',
    related_terms: ['non-clifford-gate', 'clifford-gate'],
    related_topics: ['magic-states-distillation', 'magic-state-cultivation'],
    related_papers: ['1812.01238'],
  },
  {
    term: 'measurement-based QC (MBQC)',
    slug: 'mbqc',
    category: 'computation',
    short:
      'A model of computation where entanglement is prepared up front as a cluster state, and adaptive single-qubit measurements do the computing.',
    long:
      'MBQC replaces gates with measurements: each measurement consumes part of the cluster state and steers the rest. A deep result connects MBQC to surface codes: if you unfold a surface-code computation through time, you get exactly a cluster-state scheme. So MBQC is not a rival to topological computing; it is another way to describe it. The highest known thresholds come from topological cluster states.',
    related_terms: ['stabilizer', 'fault-tolerance', 'lattice-surgery'],
    related_topics: ['cluster-states-mbqc'],
    related_papers: ['quant-ph/0510135', '0805.3202'],
  },
  {
    term: 'MWPM decoder',
    slug: 'mwpm-decoder',
    category: 'decoding',
    short:
      'A decoder that pairs up syndrome defects by minimum-weight perfect matching, reconstructing the most likely error chains.',
    long:
      'Minimum-weight perfect matching, implemented with Edmonds\' blossom algorithm, treats the syndrome as a graph problem: connect the detection events in pairs with the shortest total chain length. It achieves thresholds near the theoretical optimum and decodes in near-linear time in practice. Researchers still measure every faster, smarter, or more correlated decoder against it.',
    related_terms: ['error-chain', 'syndrome', 'real-time-decoding'],
    related_topics: ['decoding-mwpm'],
    related_papers: ['1110.5133', '1307.1740'],
  },
  {
    term: 'plaquette',
    slug: 'plaquette',
    category: 'topology & anyons',
    short:
      'A face of the lattice whose bordering qubits are measured by one stabilizer check — the basic tile of error detection.',
    long:
      'The surface code is a checkerboard of two stabilizer flavors: Z-type plaquettes catch bit-flip errors, X-type stars (vertices) catch phase flips. A plaquette "lights up" — its measurement returns −1 — when an odd number of error-chain endpoints sit on it. This site\'s whole visual identity borrows the duality: cyan for plaquettes, violet for stars.',
    related_terms: ['stabilizer', 'syndrome', 'surface-code'],
    related_topics: ['toric-code', 'surface-code'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'real-time decoding',
    slug: 'real-time-decoding',
    category: 'decoding',
    short:
      'Decoding fast enough to keep pace with the hardware\'s measurement stream, so the backlog of undecoded syndromes never grows.',
    long:
      'A superconducting device produces a syndrome round about every microsecond; the decoder must average one round per microsecond forever, or the backlog grows exponentially (the "backlog problem"). Real-time decoding demands streaming, parallelized algorithms on FPGAs or ASICs sitting next to the cryostat — one of the hardest classical-engineering challenges on the road to large machines.',
    related_terms: ['mwpm-decoder', 'syndrome', 'space-time-diagram'],
    related_topics: ['real-time-decoding-control'],
    related_papers: ['2408.13687'],
  },
  {
    term: 'rotated surface code',
    slug: 'rotated-surface-code',
    category: 'code theory',
    short:
      'A 45°-rotated surface-code layout that encodes one logical qubit in d² data qubits — half the footprint of the unrotated patch.',
    long:
      'Rotating the lattice aligns the boundaries diagonally, trimming away roughly half the physical qubits while keeping the same distance. The rotated code is the standard unit cell of modern fault-tolerant architectures. Experiments actually build distance-3, 5, and 7 rotated patches, and lattice-surgery blueprints tile them across the chip.',
    related_terms: ['surface-code', 'code-distance', 'lattice-surgery'],
    related_topics: ['surface-code'],
    related_papers: ['1808.06709'],
  },
  {
    term: 'space-time diagram',
    slug: 'space-time-diagram',
    category: 'decoding',
    short:
      'A three-dimensional picture — two of space, one of time — of repeated syndrome rounds, forming the graph a decoder actually works on.',
    long:
      'Stack successive syndrome snapshots vertically and every detection event becomes a vertex; spatial edges represent data-qubit errors, vertical edges represent measurement errors. Decoding is then matching or inference on this space-time graph. The diagram is the graph the decoder works on, and the clearest way to see why you must correct measurement noise and qubit noise jointly.',
    related_terms: ['syndrome', 'error-chain', 'mwpm-decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1208.0928'],
  },
  {
    term: 'stabilizer',
    slug: 'stabilizer',
    category: 'code theory',
    short:
      'A Pauli product that returns +1 on every valid code state and flips to −1 when an error anticommutes with it.',
    long:
      'The stabilizer formalism describes a code by the operators that leave it unchanged rather than by its states, turning code design into group theory. Measuring the stabilizers, repeatedly and fault-tolerantly, is the central task of a quantum error-correcting code. Their outcomes are the syndrome. Decoding and logical gates are both built on these outcomes.',
    related_terms: ['syndrome', 'plaquette', 'css-code'],
    related_topics: ['stabilizer-formalism'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'surface code',
    slug: 'surface-code',
    category: 'topology & anyons',
    short:
      'Kitaev\'s toric code flattened onto a planar patch with boundaries — the leading architecture for fault-tolerant quantum computing.',
    long:
      'The surface code needs only nearest-neighbor gates on a 2D grid, and it tolerates error rates just below one percent. Initialization, measurement, lattice surgery, and magic-state injection all use the same repeated stabilizer circuit. These properties are why essentially every serious hardware roadmap, from superconducting qubits to neutral atoms, converges on some flavor of surface code.',
    related_terms: ['toric-code', 'plaquette', 'rotated-surface-code'],
    related_topics: ['surface-code'],
    related_papers: ['quant-ph/9811052', '1208.0928'],
  },
  {
    term: 'syndrome',
    slug: 'syndrome',
    category: 'code theory',
    short:
      'The pattern of stabilizer outcomes that report −1, revealing where errors struck without collapsing the logical information.',
    long:
      'The syndrome is the code\'s error report. It tells you that an error happened, and roughly where. It commutes with the logical state, so the measurement itself does no harm. Decoders consume streams of syndromes — comparing rounds to find detection events — and infer the underlying error chains. Everything in quantum error correction is downstream of getting the syndrome out cleanly and quickly.',
    related_terms: ['stabilizer', 'error-chain', 'mwpm-decoder'],
    related_topics: ['decoding-mwpm', 'syndrome-extraction-circuits'],
    related_papers: ['1110.5133'],
  },
  {
    term: 'threshold theorem',
    slug: 'threshold-theorem',
    category: 'code theory',
    short:
      'If the physical error rate is below a threshold, growing the code distance suppresses the logical error rate without bound.',
    long:
      'The threshold theorem converts error correction from a delaying tactic into a scalable solution: below p_th, each increment of distance gives exponential protection. For the surface code with realistic circuit-level noise the threshold sits around 0.5–1% — the famous "one percent" that set the target for two decades of hardware development.',
    notation: 'p_th ≈ 1%',
    related_terms: ['fault-tolerance', 'code-distance'],
    related_topics: ['fault-tolerance-thresholds'],
    related_papers: ['1206.0800', '2408.13687'],
  },
  {
    term: 'topological order',
    slug: 'topological-order',
    category: 'topology & anyons',
    short:
      'A phase of matter characterized not by symmetry but by topology-dependent ground-state degeneracy and anyonic excitations.',
    long:
      'A topologically ordered system encodes information in global, non-local degrees of freedom, so no local perturbation can distinguish or corrupt the encoded states. This is the deep reason topological codes protect quantum information. The topology of the many-body ground state hides the logical qubit exactly where small errors cannot reach it.',
    related_terms: ['anyon', 'toric-code', 'surface-code'],
    related_topics: ['topological-order-anyons'],
    related_papers: ['quant-ph/0110143'],
  },
  {
    term: 'toric code',
    slug: 'toric-code',
    category: 'topology & anyons',
    short:
      'Kitaev\'s original topological code: qubits on the edges of a lattice wrapped around a torus, encoding two logical qubits in its topology.',
    long:
      'On a torus there are two independent non-contractible loops, giving two logical qubits whose operators wind the donut\'s hole and body. The toric code has no boundaries, so it is the cleanest setting to learn stabilizers, anyons, and logical operators for the first time. Real hardware instead implements the planar surface code.',
    related_terms: ['surface-code', 'anyon', 'topological-order'],
    related_topics: ['toric-code'],
    related_papers: ['quant-ph/9811052', 'quant-ph/0110143'],
  },
  {
    term: 'ZX-calculus',
    slug: 'zx-calculus',
    category: 'computation',
    short:
      'A graphical language of spiders and wires for reasoning about quantum circuits — and for compiling them onto the lattice.',
    long:
      'ZX-diagrams represent linear maps as networks of Z- and X-phase spiders fused by rewriting rules. Lattice surgery is itself a ZX-friendly structure, so compilers use the calculus to simplify a computation graphically. They then lay it out as patches and merges. This turns circuit design into rigorous picture-reasoning, and it saves real overhead.',
    related_terms: ['lattice-surgery', 'stabilizer'],
    related_topics: ['zx-calculus-basics', 'tqec-compilers-automation'],
    related_papers: ['1905.08916'],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SORTED_TERMS = [...TERMS].sort((a, b) =>
  a.term.toLowerCase().localeCompare(b.term.toLowerCase()),
);

const TERM_BY_SLUG = new Map(SORTED_TERMS.map((t) => [t.slug, t]));

function firstLetter(term: string): string {
  return term[0].toUpperCase();
}

/** Wrap matched query substrings in a cyan highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  for (;;) {
    const idx = rest.toLowerCase().indexOf(q);
    if (idx === -1) {
      parts.push(rest);
      break;
    }
    parts.push(rest.slice(0, idx));
    parts.push(
      <mark key={key++} className="bg-transparent text-plaquette">
        {rest.slice(idx, idx + q.length)}
      </mark>,
    );
    rest = rest.slice(idx + q.length);
  }
  return <>{parts}</>;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Glossary() {
  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pulseSlug, setPulseSlug] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* "/" focuses the search box */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Deep-link: /glossary#stabilizer scrolls, expands, pulses */
  useEffect(() => {
    const slug = window.location.hash.replace('#', '');
    if (!slug || !TERM_BY_SLUG.has(slug)) return;
    const timer = window.setTimeout(() => {
      setExpanded((prev) => new Set(prev).add(slug));
      document
        .getElementById(slug)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPulseSlug(slug);
      window.setTimeout(() => setPulseSlug(null), 2600);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SORTED_TERMS.filter((t) => {
      if (activeCategories.size > 0 && !activeCategories.has(t.category)) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.long.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategories]);

  const groups = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const l = firstLetter(t.term);
      if (!map.has(l)) map.set(l, []);
      map.get(l)!.push(t);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const activeLetters = useMemo(() => new Set(groups.map(([l]) => l)), [groups]);

  const toggleCategory = (c: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const toggleExpanded = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const scrollToTerm = (slug: string) => {
    setExpanded((prev) => new Set(prev).add(slug));
    window.history.replaceState(null, '', `#${slug}`);
    window.setTimeout(() => {
      document
        .getElementById(slug)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPulseSlug(slug);
      window.setTimeout(() => setPulseSlug(null), 2600);
    }, 80);
  };

  const scrollToLetter = (letter: string) => {
    document
      .getElementById(`letter-${letter}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Section 1 — page header */}
      <section className="lattice-bg">
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-32 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            // REFERENCE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Glossary
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-text-mid md:text-lg md:leading-[1.7]"
          >
            The vocabulary of topological quantum error correction, defined plainly.
            Terms cross-link to the knowledge map and the paper canon, so a definition
            is never a dead end.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.46 }}
            className="mt-6 font-mono text-[13px] text-text-low"
          >
            {TERMS.length} TERMS · {CATEGORIES.length} CATEGORIES
          </motion.p>
        </div>
      </section>

      {/* Section 2 — sticky search + category bar */}
      <div className="sticky top-16 z-30 border-b border-ink-600 bg-ink-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3 md:px-8">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-low" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search terms… ( / to focus )"
              aria-label="Search glossary terms"
              className="w-full rounded-lg border border-ink-600 bg-ink-800 py-2 pl-9 pr-10 font-mono text-sm text-text-hi placeholder:text-text-low transition-all duration-200 focus:border-plaquette focus:shadow-glow-cyan focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 font-mono text-[11px] text-text-low">
              /
            </kbd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategories(new Set())}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                activeCategories.size === 0
                  ? 'border-plaquette/60 bg-plaquette/10 text-text-hi'
                  : 'border-ink-600 text-text-mid hover:text-text-hi'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => {
              const active = activeCategories.has(c);
              const color = CATEGORY_COLORS[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ${
                    active
                      ? 'text-text-hi'
                      : 'border-ink-600 text-text-mid hover:text-text-hi'
                  }`}
                  style={
                    active
                      ? { borderColor: `${color}99`, backgroundColor: `${color}1F` }
                      : undefined
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {c}
                </button>
              );
            })}
          </div>
          <p className="ml-auto font-mono text-[13px] text-text-low">
            SHOWING {filtered.length} OF {TERMS.length}
          </p>
        </div>
      </div>

      {/* Section 3 — alphabet jump rail */}
      <div className="border-b border-ink-700">
        <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-6 py-3 md:px-8">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
            const active = activeLetters.has(letter);
            return active ? (
              <button
                key={letter}
                type="button"
                onClick={() => scrollToLetter(letter)}
                className="font-mono text-[13px] text-plaquette transition-colors duration-200 hover:text-text-hi"
              >
                {letter}
              </button>
            ) : (
              <span
                key={letter}
                aria-hidden
                className="font-mono text-[13px] text-text-low/25"
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>

      {/* Section 4 — term list */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        {groups.length === 0 && (
          <p className="py-16 text-center font-mono text-sm text-text-low">
            no terms match — try a different search or category
          </p>
        )}
        {groups.map(([letter, terms]) => (
          <motion.section
            key={letter}
            id={`letter-${letter}`}
            layout
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ staggerChildren: 0.05 }}
            className="scroll-mt-44"
          >
            <div
              aria-hidden
              className="-ml-1 select-none font-display text-[96px] font-bold leading-none text-ink-700/50"
            >
              {letter}
            </div>
            <div className="mt-2">
              {terms.map((t) => (
                <TermRow
                  key={t.slug}
                  term={t}
                  query={query}
                  isExpanded={expanded.has(t.slug)}
                  isPulsing={pulseSlug === t.slug}
                  onToggle={() => toggleExpanded(t.slug)}
                  onJumpToTerm={scrollToTerm}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </section>

      {/* Section 5 — cross-links band */}
      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-8">
        <img
          src="/braid-divider.svg"
          alt=""
          className="mx-auto mb-12 w-full max-w-3xl opacity-80"
        />
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {[
            {
              to: '/map',
              icon: MapIcon,
              color: 'text-plaquette',
              title: 'Terms → topics',
              body: 'Every glossary entry links to the topic that teaches it properly.',
            },
            {
              to: '/papers',
              icon: ScrollText,
              color: 'text-star',
              title: 'Terms → papers',
              body: 'See where each concept appears in the 23-paper canon.',
            },
            {
              to: '/path',
              icon: Route,
              color: 'text-stabilizer',
              title: 'Learn in order',
              body: 'The guided path introduces terms exactly when you need them.',
            },
          ].map(({ to, icon: Icon, color, title, body }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={to}
                className="ripple-card group block h-full rounded-xl border border-ink-600 bg-ink-800 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ink-500 hover:shadow-glow-cyan"
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <h3 className="mt-3 font-display text-lg font-semibold text-text-hi">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-mid">{body}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Term row                                                            */
/* ------------------------------------------------------------------ */

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

function TermRow({
  term,
  query,
  isExpanded,
  isPulsing,
  onToggle,
  onJumpToTerm,
}: {
  term: GlossaryTerm;
  query: string;
  isExpanded: boolean;
  isPulsing: boolean;
  onToggle: () => void;
  onJumpToTerm: (slug: string) => void;
}) {
  const catColor = CATEGORY_COLORS[term.category];

  return (
    <motion.article
      id={term.slug}
      layout
      variants={rowVariants}
      animate={
        isPulsing
          ? {
              boxShadow: [
                '0 0 0 0px rgba(34,211,238,0)',
                '0 0 0 2px rgba(34,211,238,0.9)',
                '0 0 0 0px rgba(34,211,238,0)',
                '0 0 0 2px rgba(34,211,238,0.9)',
                '0 0 0 0px rgba(34,211,238,0)',
              ],
            }
          : { boxShadow: '0 0 0 0px rgba(34,211,238,0)' }
      }
      transition={
        isPulsing
          ? { duration: 2.4, times: [0, 0.25, 0.5, 0.75, 1] }
          : { duration: 0.3 }
      }
      className="scroll-mt-44 rounded-lg border-b border-ink-600 py-6"
    >
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left — name, category, notation */}
        <div className="md:col-span-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold text-text-hi">
              <Highlight text={term.term} query={query} />
            </h3>
            {term.notation && <span className="mono-pill">{term.notation}</span>}
          </div>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[13px] text-text-low">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            {term.category}
          </p>
        </div>

        {/* Right — definition + expandable links */}
        <div className="md:col-span-8">
          <p className="leading-[1.7] text-text-mid">
            <Highlight text={term.short} query={query} />
          </p>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="btn-ghost mt-3"
          >
            Definition + links
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-250 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <p className="mt-3 leading-[1.7] text-text-mid">{term.long}</p>

                {term.related_terms.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-low">SEE ALSO:</span>
                    {term.related_terms.map((slug) => {
                      const related = TERM_BY_SLUG.get(slug);
                      if (!related) return null;
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => onJumpToTerm(slug)}
                          className="rounded-full border border-star/35 bg-star/[0.14] px-2.5 py-1 text-sm text-star transition-colors duration-200 hover:border-star hover:bg-star/20"
                        >
                          {related.term}
                        </button>
                      );
                    })}
                  </div>
                )}

                {term.related_topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-low">LEARN IT:</span>
                    {term.related_topics.map((topicId) => {
                      const topic = topicById.get(topicId);
                      return (
                        <Link
                          key={topicId}
                          to={`/map?topic=${topicId}`}
                          title={topic?.short}
                          className="rounded-full border border-plaquette/35 bg-plaquette/[0.14] px-2.5 py-1 text-sm text-plaquette transition-colors duration-200 hover:border-plaquette hover:bg-plaquette/20"
                        >
                          {topic ? shortName(topic) : topicId}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {term.related_papers.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-text-low">READ IT:</span>
                    {term.related_papers.map((arxivId) => (
                      <Link
                        key={arxivId}
                        to={`/papers#${arxivId}`}
                        className="rounded-full border border-syndrome/35 bg-syndrome/[0.14] px-2.5 py-1 font-mono text-[13px] text-syndrome transition-colors duration-200 hover:border-syndrome hover:bg-syndrome/20"
                      >
                        arXiv:{arxivId}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

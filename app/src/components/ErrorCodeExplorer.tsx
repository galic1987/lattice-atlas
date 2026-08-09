import { useMemo, useState } from 'react';
import { Binary, Zap, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  hammingEncode,
  hammingDecode,
  repetitionEncode,
  repetitionDecode,
  HAMMING_CHECK_POSITIONS,
  HAMMING_PARITY_POSITIONS,
  CODE_ZOO,
} from '@/lib/classicalCodes';

const DATA = '#22D3EE'; // data bits (plaquette / cyan)
const PARITY = '#8B5CF6'; // parity bits (star / violet)
const ERR = '#FB7185'; // error / violated check (syndrome / rose)
const OK = '#34D399'; // satisfied / success (stabilizer / green)

/* ---------------- Hamming(7,4) interactive ---------------- */

function HammingLab() {
  const [dataBits, setDataBits] = useState<number[]>([1, 0, 1, 1]);
  const [received, setReceived] = useState<number[]>(() => hammingEncode([1, 0, 1, 1]));

  const cleanCodeword = useMemo(() => hammingEncode(dataBits), [dataBits]);
  const dec = useMemo(() => hammingDecode(received), [received]);
  const injected = received.reduce((a, b, i) => a + (b !== cleanCodeword[i] ? 1 : 0), 0);
  const recovered = dec.data.every((b, i) => b === dataBits[i]);

  const setData = (i: number) => {
    const next = dataBits.slice();
    next[i] ^= 1;
    setDataBits(next);
    setReceived(hammingEncode(next)); // re-encode → clears any injected errors
  };
  const flipCell = (pos: number) => {
    const next = received.slice();
    next[pos - 1] ^= 1;
    setReceived(next);
  };
  const reset = () => setReceived(hammingEncode(dataBits));

  const isParity = (pos: number) => HAMMING_PARITY_POSITIONS.includes(pos);

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-950 p-5">
      <div className="flex items-center justify-between border-b border-ink-800 pb-3">
        <span className="font-mono text-[11px] font-bold text-plaquette">Hamming [7, 4, 3] · corrects 1 error</span>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-text-mid hover:text-text-hi"
        >
          <RotateCcw className="h-3 w-3" /> Reset word
        </button>
      </div>

      {/* Data-bit input */}
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-text-low">Set 4 data bits:</span>
        {dataBits.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setData(i)}
            className="h-7 w-7 rounded border font-bold"
            style={{ borderColor: DATA, color: b ? '#05080F' : DATA, background: b ? DATA : 'transparent' }}
            aria-label={`Toggle data bit ${i + 1}, currently ${b}`}
          >
            {b}
          </button>
        ))}
        <span className="text-text-low">→ encoder adds 3 parity bits</span>
      </div>

      {/* 7-bit codeword — click any cell to inject a channel error */}
      <div className="mt-4">
        <span className="font-mono text-[10px] uppercase text-text-low">Transmitted word (click a bit to flip it in the “channel”):</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {received.map((b, idx) => {
            const pos = idx + 1;
            const flipped = b !== cleanCodeword[idx];
            const pinpointed = dec.errorPos === pos && dec.errorPos !== 0;
            const base = isParity(pos) ? PARITY : DATA;
            return (
              <button
                key={pos}
                type="button"
                onClick={() => flipCell(pos)}
                className="relative flex h-11 w-11 flex-col items-center justify-center rounded-lg border-2 font-mono text-sm font-bold"
                style={{
                  borderColor: flipped ? ERR : base,
                  color: b ? '#05080F' : base,
                  background: b ? (flipped ? ERR : base) : 'transparent',
                  boxShadow: pinpointed ? `0 0 0 2px ${OK}` : undefined,
                }}
                aria-label={`Position ${pos} (${isParity(pos) ? 'parity' : 'data'}) = ${b}${flipped ? ', flipped' : ''}`}
              >
                {b}
                <span className="absolute -bottom-4 text-[8px] text-text-low">
                  {isParity(pos) ? `p${pos}` : 'd'}
                  {pos}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parity checks */}
      <div className="mt-8 grid gap-1.5 font-mono text-[11px]">
        {HAMMING_CHECK_POSITIONS.map((positions, ci) => {
          const violated = dec.checks[ci] === 1;
          return (
            <div key={ci} className="flex items-center gap-2">
              <span style={{ color: violated ? ERR : OK }} className="font-bold">
                {violated ? '✗' : '✓'} check {ci + 1}
              </span>
              <span className="text-text-low">covers {positions.join(', ')}</span>
              <span className="text-text-mid">→ parity {dec.checks[ci]}</span>
            </div>
          );
        })}
      </div>

      {/* Syndrome verdict */}
      <div
        className="mt-4 rounded-lg border p-3 font-mono text-xs"
        style={{
          borderColor: dec.errorPos === 0 ? OK : ERR,
          background: (dec.errorPos === 0 ? OK : ERR) + '14',
        }}
      >
        <span className="text-[10px] uppercase text-text-low block">Syndrome (s4 s2 s1) = position of the flipped bit</span>
        <span className="mt-1 block font-bold text-text-hi">
          {dec.checks[2]}{dec.checks[1]}{dec.checks[0]} = {dec.errorPos}
          {dec.errorPos === 0 ? ' → no error detected' : ` → correct bit at position ${dec.errorPos}`}
        </span>
        <span className="mt-2 flex items-center gap-1.5" style={{ color: recovered ? OK : ERR }}>
          {recovered ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {recovered
            ? `Data recovered: ${dec.data.join('')}`
            : `Wrong correction — data came out ${dec.data.join('')}, not ${dataBits.join('')}`}
        </span>
        {injected >= 2 && (
          <span className="mt-2 block text-[11px] text-text-mid">
            You injected {injected} errors. A distance-3 code only guarantees correcting one — so watch it
            confidently “fix” the wrong bit. That gap is exactly why quantum codes push the distance up.
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------- Repetition [n,1] interactive ---------------- */

function RepetitionLab() {
  const [n, setN] = useState(3);
  const [bit, setBit] = useState(1);
  const [word, setWord] = useState<number[]>(() => repetitionEncode(1, 3));

  const dec = useMemo(() => repetitionDecode(word), [word]);
  const setSource = (b: number) => {
    setBit(b);
    setWord(repetitionEncode(b, n));
  };
  const setLength = (len: number) => {
    setN(len);
    setWord(repetitionEncode(bit, len));
  };
  const flip = (i: number) => {
    const next = word.slice();
    next[i] ^= 1;
    setWord(next);
  };
  const success = dec.value === bit && dec.decisive;

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-950 p-5">
      <div className="flex items-center justify-between border-b border-ink-800 pb-3 font-mono text-[11px]">
        <span className="font-bold text-plaquette">Repetition [{n}, 1, {n}] · majority vote</span>
        <div className="flex gap-1">
          {[3, 5, 7].map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => setLength(len)}
              className={`rounded px-2 py-0.5 ${n === len ? 'bg-plaquette text-ink-950 font-bold' : 'bg-ink-800 text-text-mid'}`}
            >
              n={len}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 font-mono text-xs">
        <span className="text-text-low">Send bit:</span>
        {[0, 1].map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSource(b)}
            className={`h-7 w-7 rounded border font-bold ${bit === b ? 'bg-plaquette text-ink-950' : 'text-plaquette'}`}
            style={{ borderColor: DATA }}
          >
            {b}
          </button>
        ))}
        <span className="text-text-low">→ copied {n}×</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {word.map((b, i) => {
          const flipped = b !== bit;
          return (
            <button
              key={i}
              type="button"
              onClick={() => flip(i)}
              className="h-10 w-10 rounded-lg border-2 font-mono text-sm font-bold"
              style={{
                borderColor: flipped ? ERR : DATA,
                color: b ? '#05080F' : DATA,
                background: b ? (flipped ? ERR : DATA) : 'transparent',
              }}
              aria-label={`Copy ${i + 1} = ${b}${flipped ? ', flipped' : ''}`}
            >
              {b}
            </button>
          );
        })}
      </div>

      <div
        className="mt-4 rounded-lg border p-3 font-mono text-xs"
        style={{ borderColor: success ? OK : ERR, background: (success ? OK : ERR) + '14' }}
      >
        <span className="flex items-center gap-1.5" style={{ color: success ? OK : ERR }}>
          {success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          Majority vote → {dec.value}
          {success
            ? ' — recovered.'
            : dec.decisive
              ? ` — WRONG (sent ${bit}). Too many flips overwhelmed the code.`
              : ' — tie, undecidable.'}
        </span>
      </div>
    </div>
  );
}

/* ---------------- the explorer ---------------- */

export default function ErrorCodeExplorer() {
  return (
    <div className="rounded-2xl border border-plaquette/40 bg-ink-900 p-6 shadow-glow-cyan">
      <div className="flex flex-col gap-2 border-b border-ink-700 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// ERROR-CORRECTING CODE EXPLORER</span>
          <span className="rounded bg-magic/20 px-2 py-0.5 font-mono text-[10px] font-bold text-magic">EXACT · GF(2)</span>
        </div>
        <h3 className="font-display text-xl font-bold text-text-hi">The classical roots of the surface code</h3>
        <p className="text-xs leading-relaxed text-text-mid">
          Before qubits, classical codes already beat noise by adding redundancy. Everything below is real
          GF(2) linear algebra — encode, inject an error, and watch the syndrome pinpoint and fix it. The
          surface code is the topological quantum descendant of exactly these ideas.
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-text-low">
        <Binary className="h-4 w-4 text-plaquette" /> Two real codes you can break by hand:
      </div>

      <div className="mt-3 grid gap-5 lg:grid-cols-2">
        <HammingLab />
        <RepetitionLab />
      </div>

      {/* Code zoo comparison */}
      <div className="mt-6">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-star">
          <Zap className="h-3.5 w-3.5" /> Code zoo — classical roots to the quantum surface code
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-ink-700 text-left text-text-low">
                <th className="py-2 pr-3 font-medium">Code</th>
                <th className="py-2 pr-3 font-medium">[n, k, d]</th>
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">Rate</th>
                <th className="py-2 pr-3 font-medium">Corrects</th>
                <th className="py-2 font-medium">What it teaches</th>
              </tr>
            </thead>
            <tbody>
              {CODE_ZOO.map((c) => (
                <tr key={c.name} className="border-b border-ink-800 align-top">
                  <td className="py-2 pr-3 font-bold text-text-hi">{c.name}</td>
                  <td className="py-2 pr-3" style={{ color: c.kind === 'Quantum' ? PARITY : DATA }}>{c.notation}</td>
                  <td className="py-2 pr-3 text-text-mid">{c.kind}</td>
                  <td className="py-2 pr-3 text-text-mid">{c.rate}</td>
                  <td className="py-2 pr-3 text-text-mid">{c.corrects}</td>
                  <td className="py-2 text-text-mid">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-mono text-[10px] text-text-low">
          [n, k, d]: n physical bits/qubits, k logical, distance d (corrects ⌊(d−1)/2⌋ errors). Double brackets
          [[…]] denote quantum codes. Classical rows are computed live above; quantum rows are reference values.
        </p>
      </div>
    </div>
  );
}

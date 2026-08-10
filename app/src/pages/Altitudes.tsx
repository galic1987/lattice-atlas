import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Map as MapIcon, Route as RouteIcon } from 'lucide-react';
import MultiAgeCognitiveLens from '@/components/MultiAgeCognitiveLens';
import DepthDive from '@/components/DepthDive';
import SuperTLDR from '@/components/SuperTLDR';
import ConceptClip from '@/components/ConceptClip';
import { ALTITUDE_CONCEPTS } from '@/data/altitudes';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useProgress } from '@/store/progress';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Flagship page for the age-ladder: one core idea explained at five
 * altitudes, with every level explicitly repairing the previous level's
 * compression. The age labels are entry styles, not learner rankings.
 */
export default function Altitudes() {
  useDocumentTitle('Five Altitudes');
  const reduce = useReducedMotion();
  const { explanationDepth, recordEvidence } = useProgress();
  const [conceptId, setConceptId] = useState(ALTITUDE_CONCEPTS[0].id);
  const [teachback, setTeachback] = useState('');
  const [selfRating, setSelfRating] = useState<'again' | 'good' | 'easy'>('good');
  const [saveStatus, setSaveStatus] = useState('');
  const [savedSignature, setSavedSignature] = useState('');
  const concept = ALTITUDE_CONCEPTS.find((item) => item.id === conceptId) ?? ALTITUDE_CONCEPTS[0];
  const teachbackSignature = `${concept.id}|${explanationDepth}|${selfRating}|${teachback.trim()}`;

  const saveTeachback = () => {
    const result = recordEvidence({
      kind: 'altitude-study',
      conceptId: concept.id,
      depth: explanationDepth,
      activity: 'teachback',
      selfRating,
    });
    if (result.ok) setSavedSignature(teachbackSignature);
    setSaveStatus(result.ok
      ? 'Teach-back completion added to your local learning record and Review source.'
      : result.message);
  };

  return (
    <div className="bg-ink-900">
      <header className="lattice-bg">
        <div className="mx-auto max-w-4xl px-6 pb-10 pt-16 md:px-8">
          <SuperTLDR
            summary="Multi-age cognitive prism presenting quantum error correction across 5 distinct levels of detail (Story, Cause, Model, Formal, Verify)."
            takeaways={[
              'Story (~5 yrs): Tactile light-up tiles & physical metaphors.',
              'Cause (~10 yrs) & Model (~15 yrs): Interactive dot-connecting & stabilizer matrix models.',
              'Formal & Verify (20+ yrs): Rigorous math bounds (Λ), Stim circuit verification, and paper receipts.',
            ]}
          />
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [...EASE] }}
            className="eyebrow"
          >
            {'// HOW EXPLANATION SCALES'}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.08, ease: [...EASE] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Five altitudes, one truth.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.16, ease: [...EASE] }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-text-mid"
          >
            A useful explanation compresses reality. Here, each altitude names
            what the previous view left out, so you can watch one invariant idea
            move from story to cause, model, formalism, and evidence. The 5, 10,
            15, and 20+ markers describe detail—not intelligence. The final rung
            shows how to distinguish a browser model, a research simulation, a
            published hardware dataset, and direct hardware access.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.24, ease: [...EASE] }}
            className="mt-8"
          >
            <ConceptClip
              name="metaphor-descent"
              className="w-full rounded-xl border border-ink-600 object-cover"
            />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-low">
              // The descent: chip → lattice → qubits — AI visualization, decorative
            </p>
          </motion.div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10 md:px-8">
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Choose a concept">
          {ALTITUDE_CONCEPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={concept.id === item.id}
              onClick={() => {
                setConceptId(item.id);
                setTeachback('');
                setSaveStatus('');
              }}
              className={
                concept.id === item.id
                  ? 'min-h-11 rounded-full border border-magic bg-magic/15 px-4 py-2 text-sm font-semibold text-magic'
                  : 'min-h-11 rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-sm text-text-mid transition-colors hover:border-ink-500 hover:text-text-hi'
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <DepthDive />
        <MultiAgeCognitiveLens key={concept.id} concept={concept} />

        <div className="mt-6 rounded-2xl border border-star/35 bg-star/[0.05] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow !text-star">// RETRIEVAL BRIDGE</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text-hi">Teach this altitude back.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-mid">
                Close the explanation, state the invariant for <strong>{concept.label}</strong>,
                then name what the {explanationDepth} view compresses. Your words stay in this
                textarea; only completion and your self-rating enter the local evidence record.
              </p>
            </div>
            <span className="mono-pill capitalize">{explanationDepth}</span>
          </div>
          <label htmlFor="altitude-teachback" className="mt-5 block font-mono text-[11px] uppercase tracking-wider text-text-low">
            Your explanation
          </label>
          <textarea
            id="altitude-teachback"
            value={teachback}
            onChange={(event) => {
              setTeachback(event.target.value);
              setSaveStatus('');
            }}
            rows={4}
            maxLength={900}
            placeholder="The invariant is… This view helps because… It leaves out…"
            className="mt-2 w-full resize-y rounded-lg border border-ink-600 bg-ink-950 p-3 text-sm leading-6 text-text-hi placeholder:text-text-low focus:border-star focus:outline-none"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Rate your teach-back">
            {([
              ['again', 'Another pass'],
              ['good', 'Close'],
              ['easy', 'Recalled'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={selfRating === value}
                onClick={() => {
                  setSelfRating(value);
                  setSaveStatus('');
                }}
                className={selfRating === value
                  ? 'min-h-11 rounded-lg border border-star bg-star/15 px-3 py-2 text-sm font-semibold text-star'
                  : 'min-h-11 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-text-mid hover:border-ink-500'}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              disabled={teachback.trim().length < 40 || savedSignature === teachbackSignature}
              onClick={saveTeachback}
              className="btn-primary ml-auto disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save to learning record <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 font-mono text-[10px] text-text-low">{teachback.trim().length}/40 minimum characters</p>
          {saveStatus && savedSignature === teachbackSignature && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stabilizer/35 bg-stabilizer/[0.06] p-3 text-xs text-stabilizer" role="status" aria-live="polite">
              <span>{saveStatus}</span>
              <Link to="/review" className="font-semibold underline underline-offset-4">Open five-card Review</Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-700 pt-8 text-sm text-text-low">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            Ready to climb for real:
          </span>
          <Link
            to="/path"
            className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette"
          >
            <RouteIcon className="h-3.5 w-3.5" /> The guided path
          </Link>
          <Link
            to="/map"
            className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette"
          >
            <MapIcon className="h-3.5 w-3.5" /> The knowledge map
          </Link>
          <Link
            to="/lab"
            className="link-slide inline-flex items-center gap-1.5 text-text-mid hover:text-plaquette"
          >
            <ArrowRight className="h-3.5 w-3.5" /> The lab
          </Link>
        </div>
      </section>
    </div>
  );
}

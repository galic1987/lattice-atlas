import {
  Clipboard,
  Cpu,
  Database,
  ExternalLink,
  FileCheck2,
  FlaskConical,
  LockKeyhole,
} from 'lucide-react';
import { toast } from 'sonner';

const OFFICIAL_LINKS = {
  qvm: 'https://quantumai.google/cirq/simulate/quantum_virtual_machine',
  access: 'https://quantumai.google/cirq/google/access',
  paper: 'https://www.nature.com/articles/s41586-024-08449-y',
  correction: 'https://www.nature.com/articles/s41586-026-10559-8',
  data: 'https://zenodo.org/records/13273331',
} as const;

const QVM_SNIPPET = `# pip install cirq-google qsimcirq
import cirq
import cirq_google
import qsimcirq

# Public Willow-shaped QVM: classical noisy simulation, not hardware.
processor_id = "willow_pink"
noise_props = cirq_google.engine.load_device_noise_properties(processor_id)
noise_model = cirq_google.NoiseModelFromGoogleNoiseProperties(noise_props)
simulator = qsimcirq.QSimSimulator(noise=noise_model)

device = cirq_google.engine.create_device_from_processor_id(processor_id)
calibration = cirq_google.engine.load_median_device_calibration(processor_id)
processor = cirq_google.engine.SimulatedLocalProcessor(
    processor_id=processor_id,
    sampler=simulator,
    device=device,
    calibrations={calibration.timestamp // 1000: calibration},
)
engine = cirq_google.engine.SimulatedLocalEngine([processor])

q0, q1 = cirq.GridQubit(4, 4), cirq.GridQubit(4, 5)
circuit = cirq.Circuit(
    cirq.X(q0),
    cirq.X(q1) ** 0.5,
    cirq.CZ(q0, q1),
    cirq.X(q1) ** 0.5,
    cirq.measure(q0, q1, key="measure"),
)
result = engine.get_sampler(processor_id).run(circuit, repetitions=3000)
print(result.histogram(key="measure"))`;

const RECEIPT_TEMPLATE = `{
  "claim": "Willow below-threshold surface-code memory scaling",
  "reported_result": {
    "lambda_definition": "epsilon_L(d) / epsilon_L(d+2)",
    "lambda": "2.14 +/- 0.02",
    "distance_7_error_per_cycle": "0.143% +/- 0.003%"
  },
  "primary_source": "Nature s41586-024-08449-y",
  "evidence_record": "Zenodo 13273331",
  "reproduction": {
    "status": "not_run",
    "analysis_commit": "<git SHA>",
    "environment_lock_hash": "<sha256>",
    "dataset_hash": "<sha256>",
    "seed_and_shots": "<record these>",
    "calculated_value_and_interval": null
  },
  "execution_backend": {
    "id": "willow_pink",
    "kind": "classical noisy QVM simulation",
    "physical_google_qpu_accessed": false
  }
}`;

const RECEIPT_STEPS = [
  ['Pin the claim', 'Record the exact metric and convention: Λ = εL(d)/εL(d+2), so suppression with increasing distance means Λ > 1.'],
  ['Pin the evidence', 'Save paper and dataset versions, file hashes, the analysis commit, and the environment lock.'],
  ['Recompute uncertainty', 'Derive both logical error rates, Λ, and an interval using a reviewable script and declared acceptance rule.'],
  ['Label the backend', 'Separate cited hardware evidence, archived-data reproduction, QVM simulation, and live hardware execution.'],
] as const;

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

export default function RealQuantumEndpoint() {
  return (
    <section className="min-w-0 rounded-2xl border border-plaquette/40 bg-ink-900 p-5 shadow-glow-cyan md:p-6" aria-labelledby="willow-qvm-title">
      <div className="flex min-w-0 flex-col gap-3 border-b border-ink-700 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
            <Cpu className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-low">// PUBLIC SIMULATION BLUEPRINT</span>
              <span className="rounded bg-magic/15 px-2 py-0.5 font-mono text-[10px] font-bold text-magic">NO HARDWARE JOB</span>
            </div>
            <h3 id="willow-qvm-title" className="font-display text-xl font-bold text-text-hi">Willow QVM integration, with evidence receipts</h3>
          </div>
        </div>
        <a href={OFFICIAL_LINKS.qvm} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs text-plaquette hover:underline">
          Official Cirq QVM guide <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Public processor ID', 'willow_pink', 'Cirq virtual processor', 'text-plaquette'],
          ['What executes', 'qsim locally', 'Classical noisy simulation', 'text-text-hi'],
          ['Physical QPU access', 'Restricted', 'Approved programs only', 'text-magic'],
          ['Reported Λ', '2.14 ± 0.02', 'εL(d)/εL(d+2) > 1', 'text-stabilizer'],
        ].map(([label, value, note, tone]) => (
          <div key={label} className="min-w-0 rounded-xl border border-ink-700 bg-ink-950 p-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">{label}</span>
            <p className={`mt-1 break-words font-mono text-base font-bold ${tone}`}>{value}</p>
            <span className="font-mono text-[11px] text-text-mid">{note}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-magic/35 bg-magic/5 p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-magic" aria-hidden="true" />
          <div>
            <h4 className="font-display text-base font-bold text-text-hi">What this page can—and cannot—establish</h4>
            <p className="mt-1 text-sm leading-6 text-text-mid">
              Google&apos;s paper is the hardware evidence. The public <span className="font-mono text-plaquette">willow_pink</span> QVM uses published device structure and median noise information in a classical simulator. It can prepare a workflow; it is not a public Willow hardware endpoint and running the sample circuit does not reproduce the paper.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
          <a href={OFFICIAL_LINKS.access} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-magic hover:underline">Hardware access policy <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
          <a href={OFFICIAL_LINKS.paper} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-star hover:underline"><FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" /> Primary paper <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
          <a href={OFFICIAL_LINKS.data} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-star hover:underline"><Database className="h-3.5 w-3.5" aria-hidden="true" /> Archived data <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
          <a href={OFFICIAL_LINKS.correction} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-text-mid hover:underline">2026 author correction <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-plaquette/30 bg-ink-950 p-5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-plaquette">// END-TO-END CLAIM RECEIPT</span>
        <h4 className="font-display text-base font-bold text-text-hi">A result is verified only when its evidence trail is reproducible</h4>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {RECEIPT_STEPS.map(([title, body], index) => (
            <li key={title} className="rounded-lg border border-ink-700 bg-ink-900 p-3">
              <p className="font-mono text-xs font-bold text-star">{index + 1}. {title}</p>
              <p className="mt-1 text-xs leading-5 text-text-mid">{body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
        {[
          ['Public Cirq QVM blueprint', QVM_SNIPPET, 'QVM blueprint', 'text-plaquette'],
          ['Evidence receipt template', RECEIPT_TEMPLATE, 'Receipt template', 'text-star'],
        ].map(([title, value, label, tone]) => (
          <div key={title} className="min-w-0 max-w-full rounded-xl border border-ink-700 bg-ink-950 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-ink-800 pb-2 font-mono text-xs">
              <span className={`font-bold ${tone}`}>{title}</span>
              <button type="button" onClick={() => void copy(value, label)} className="inline-flex shrink-0 items-center gap-1 text-text-low hover:text-plaquette">
                <Clipboard className="h-3.5 w-3.5" aria-hidden="true" /> Copy
              </button>
            </div>
            <pre className="mt-3 max-h-72 max-w-full overflow-auto whitespace-pre rounded border border-ink-800 bg-ink-900 p-3 font-mono text-[11px] text-text-mid">{value}</pre>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-text-low">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        This website does not execute either artifact, receive its output, sign results, or submit jobs to Google hardware.
      </p>
    </section>
  );
}

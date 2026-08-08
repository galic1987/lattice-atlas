import { useEffect, useRef } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { topics, papers } from '@/data';
import { useProgress } from '@/store/progress';
import { FOUNDATION_STAGE_IDS } from '@/lib/learningRecord';

/**
 * Downloadable activity record for the learning path. It deliberately records
 * local actions and checks without claiming accreditation, mastery, identity,
 * retention, or independent work.
 */

const W = 1600;
const H = 1131; // ≈ A4 landscape ratio

function drawCertificate(
  canvas: HTMLCanvasElement,
  name: string,
  exploredCount: number,
  checkedCount: number,
  readCount: number,
  evidenceLine: string,
) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // background + faint qubit lattice
  ctx.fillStyle = '#0A0F1C';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(61, 81, 120, 0.30)';
  for (let x = 76; x < W - 60; x += 56) {
    for (let y = 76; y < H - 60; y += 56) {
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // double border
  ctx.strokeStyle = '#2A3A5F';
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  // logo mark: 3×3 lattice with a glowing center plaquette diamond
  const lx = W / 2;
  const ly = 150;
  ctx.fillStyle = '#A9B4CC';
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      ctx.beginPath();
      ctx.arc(lx + i * 26, ly + j * 26, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#22D3EE';
  ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
  ctx.shadowBlur = 18;
  ctx.fillRect(-9, -9, 18, 18);
  ctx.restore();

  const mono = (px: number) => `500 ${px}px "JetBrains Mono", monospace`;
  const display = (px: number, weight = 700) => `${weight} ${px}px "Space Grotesk", sans-serif`;
  const body = (px: number) => `400 ${px}px Inter, sans-serif`;
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  ctx.textAlign = 'center';

  // eyebrow
  if ('letterSpacing' in ctx) spaced.letterSpacing = '5px';
  ctx.fillStyle = '#22D3EE';
  ctx.font = mono(21);
  ctx.fillText('// LATTICE ATLAS — LOCAL SELF-STUDY RECORD', W / 2, 254);
  if ('letterSpacing' in ctx) spaced.letterSpacing = '0px';

  // title
  ctx.fillStyle = '#EAF0FB';
  ctx.font = display(74);
  ctx.fillText('Learning Activity Record', W / 2, 350);

  // certifies
  if ('letterSpacing' in ctx) spaced.letterSpacing = '4px';
  ctx.fillStyle = '#A9B4CC';
  ctx.font = mono(19);
  ctx.fillText('RECORDED LOCALLY FOR', W / 2, 452);
  if ('letterSpacing' in ctx) spaced.letterSpacing = '0px';

  // learner name + gradient rule
  ctx.fillStyle = '#EAF0FB';
  ctx.font = display(88);
  ctx.fillText(name || 'Your Name', W / 2, 560);
  const rule = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
  rule.addColorStop(0, '#22D3EE');
  rule.addColorStop(1, '#9B7BFA');
  ctx.fillStyle = rule;
  ctx.fillRect(W / 2 - 300, 596, 600, 3);

  // achievement
  ctx.fillStyle = '#A9B4CC';
  ctx.font = body(27);
  const explorationLine = exploredCount === topics.length
    ? 'self-marked all Lattice Atlas prerequisite topics as explored in'
    : `self-marked ${exploredCount} of ${topics.length} prerequisite topics as explored in`;
  ctx.fillText(explorationLine, W / 2, 676);
  ctx.fillStyle = '#EAF0FB';
  ctx.font = display(34, 600);
  ctx.fillText('Topological Quantum Error Correction', W / 2, 730);
  ctx.fillStyle = '#A9B4CC';
  ctx.font = body(27);
  ctx.fillText('activity is separated from the open-book checks recorded below', W / 2, 780);

  // stats
  if ('letterSpacing' in ctx) spaced.letterSpacing = '3px';
  ctx.fillStyle = '#F5B83D';
  ctx.font = mono(22);
  ctx.fillText(
    `${exploredCount}/${topics.length} EXPLORED · ${checkedCount}/${topics.length} CHECKED · ${readCount}/${papers.length} PAPERS READ`,
    W / 2,
    850,
  );

  ctx.fillStyle = '#34D399';
  ctx.font = mono(18);
  ctx.fillText(evidenceLine, W / 2, 894);

  // issue date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillStyle = '#A9B4CC';
  ctx.font = mono(18);
  ctx.fillText(`ISSUED ${date.toUpperCase()}`, W / 2, 944);
  if ('letterSpacing' in ctx) spaced.letterSpacing = '0px';

  // footer
  ctx.fillStyle = '#A9B4CC';
  ctx.font = body(17);
  ctx.fillText(
    'Self-reported activity + local unsigned checks · not proof of mastery, identity, or an accredited credential',
    W / 2,
    H - 96,
  );
}

export default function CertificatePanel() {
  const {
    exploredCount,
    checkedCount,
    readCount,
    displayName: name,
    setDisplayName,
    evidenceFor,
    storageStatus,
  } = useProgress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foundations = new Map(evidenceFor('foundation-prediction').map((entry) => [entry.stageId, entry]));
  const foundationCorrect = FOUNDATION_STAGE_IDS.filter((stageId) => foundations.get(stageId)?.correct).length;
  const reviews = evidenceFor('review-recall');
  const reviewAttempts = reviews.reduce((sum, entry) => sum + entry.attempts, 0);
  const reviewSuccesses = reviews.reduce(
    (sum, entry) => sum + (entry.successfulAttempts ?? (entry.rating === 'easy' ? entry.attempts : 0)),
    0,
  );
  const duel = evidenceFor('duel-result')
    .filter((entry) => entry.mode === 'daily' && entry.compatible === true)
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))[0];
  const capstone = evidenceFor('capstone')
    .sort((left, right) => (right.correct / right.total) - (left.correct / left.total))[0];
  const evidenceLine = `LOCAL EVIDENCE · FOUNDATIONS ${foundationCorrect}/${FOUNDATION_STAGE_IDS.length} · REVIEW ${reviewSuccesses}/${reviewAttempts} · DUEL ${duel?.score ?? 0}/${duel?.maxScore ?? 150} · CAPSTONE ${capstone?.correct ?? 0}/${capstone?.total ?? 0}`;

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready
      .then(() => {
        if (!cancelled && canvasRef.current) {
          drawCertificate(canvasRef.current, name, exploredCount, checkedCount, readCount, evidenceLine);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [name, exploredCount, checkedCount, readCount, evidenceLine]);

  const download = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug =
        (name || 'learner')
          .normalize('NFD')
          .replace(/\p{M}/gu, '') // strip diacritics: Galić → Galic
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'learner';
      a.download = `lattice-atlas-activity-record-${slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="mt-8 border-t border-ink-700 pt-6">
      <p className="eyebrow mb-3">{'// YOUR LOCAL ACTIVITY RECORD'}</p>
      <p className="mb-4 max-w-2xl text-sm leading-6 text-text-low">
        This download records self-marked exploration and local checks. It is not a certificate of mastery or an accredited credential.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 sm:max-w-xs">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-low">
            Name on the activity record
          </span>
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ada Lovelace"
            className="mt-1.5 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-text-hi placeholder:text-text-low focus:border-plaquette/60 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={download}
          disabled={name.trim() === ''}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Download PNG
        </button>
      </div>
      <div className={`mt-3 flex max-w-2xl items-start gap-2 rounded-lg border p-3 text-xs leading-5 ${storageStatus.state === 'saved' ? 'border-stabilizer/30 bg-stabilizer/[0.06] text-text-low' : 'border-syndrome/40 bg-syndrome/[0.08] text-text-hi'}`} role="status">
        {storageStatus.state === 'memory-only' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-syndrome" aria-hidden="true" />}
        <span>{storageStatus.message}</span>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Local Lattice Atlas learning activity record${name ? ` for ${name}` : ''}`}
        className="mt-4 w-full max-w-2xl rounded-lg border border-ink-600"
      />
    </div>
  );
}

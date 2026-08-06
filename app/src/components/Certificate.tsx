import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { topics, papers } from '@/data';
import { useProgress } from '@/store/progress';

/**
 * Completion certificate for the learning path (canvas-rendered, PNG export).
 * Client-side only, matching the app's no-backend design; the wording is
 * explicit that this is a self-study certificate tracked in the browser.
 */

const W = 1600;
const H = 1131; // ≈ A4 landscape ratio

const NAME_KEY = 'lattice-atlas-name';

function drawCertificate(canvas: HTMLCanvasElement, name: string, readCount: number) {
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
  ctx.fillStyle = '#64708E';
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
  ctx.fillText('// LATTICE ATLAS — SELF-STUDY CERTIFICATE', W / 2, 254);
  if ('letterSpacing' in ctx) spaced.letterSpacing = '0px';

  // title
  ctx.fillStyle = '#EAF0FB';
  ctx.font = display(74);
  ctx.fillText('Certificate of Completion', W / 2, 350);

  // certifies
  if ('letterSpacing' in ctx) spaced.letterSpacing = '4px';
  ctx.fillStyle = '#64708E';
  ctx.font = mono(19);
  ctx.fillText('THIS CERTIFIES THAT', W / 2, 452);
  if ('letterSpacing' in ctx) spaced.letterSpacing = '0px';

  // learner name + gradient rule
  ctx.fillStyle = '#EAF0FB';
  ctx.font = display(88);
  ctx.fillText(name || 'Your Name', W / 2, 560);
  const rule = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
  rule.addColorStop(0, '#22D3EE');
  rule.addColorStop(1, '#8B5CF6');
  ctx.fillStyle = rule;
  ctx.fillRect(W / 2 - 300, 596, 600, 3);

  // achievement
  ctx.fillStyle = '#A9B4CC';
  ctx.font = body(27);
  ctx.fillText('completed the full prerequisite tree of the Lattice Atlas learning path in', W / 2, 676);
  ctx.fillStyle = '#EAF0FB';
  ctx.font = display(34, 600);
  ctx.fillText('Topological Quantum Error Correction', W / 2, 730);
  ctx.fillStyle = '#A9B4CC';
  ctx.font = body(27);
  ctx.fillText('from linear algebra to the research frontier', W / 2, 780);

  // stats
  if ('letterSpacing' in ctx) spaced.letterSpacing = '3px';
  ctx.fillStyle = '#F5B83D';
  ctx.font = mono(22);
  ctx.fillText(
    `${topics.length} TOPICS · 6 TIERS · ${readCount}/${papers.length} PAPERS READ`,
    W / 2,
    866,
  );

  // issue date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillStyle = '#64708E';
  ctx.font = mono(18);
  ctx.fillText(`ISSUED ${date.toUpperCase()}`, W / 2, 920);
  if ('letterSpacing' in ctx) spaced.letterSpacing = '0px';

  // footer
  ctx.fillStyle = '#64708E';
  ctx.font = body(17);
  ctx.fillText(
    'Self-study achievement · progress tracked locally in the learner’s browser · not an accredited credential',
    W / 2,
    H - 96,
  );
}

export default function CertificatePanel() {
  const { readCount } = useProgress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {
      /* storage unavailable */
    }
    let cancelled = false;
    document.fonts.ready
      .then(() => {
        if (!cancelled && canvasRef.current) drawCertificate(canvasRef.current, name, readCount);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [name, readCount]);

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
      a.download = `lattice-atlas-certificate-${slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="mt-8 border-t border-ink-700 pt-6">
      <p className="eyebrow mb-3">{'// YOUR CERTIFICATE'}</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 sm:max-w-xs">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-low">
            Name on the certificate
          </span>
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
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
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Certificate of completion${name ? ` for ${name}` : ''}`}
        className="mt-4 w-full max-w-2xl rounded-lg border border-ink-600"
      />
    </div>
  );
}

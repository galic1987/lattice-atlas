import { asset } from '@/lib/asset';
import { useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  NavigationType,
  Outlet,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { Menu, Share2, X, Bot } from 'lucide-react';
import { useProgress } from '@/store/progress';
import { topics } from '@/data';
import UniversalExplainer from '@/components/UniversalExplainer';
import ShareableScoreCard from '@/components/ShareableScoreCard';
import SoundToggle from '@/components/SoundToggle';
import AITutorDrawer from '@/components/AITutorDrawer';
import CommandPalette from '@/components/CommandPalette';
import { FOUNDATION_STAGE_IDS } from '@/lib/learningRecord';

const NAV_ITEMS: ReadonlyArray<{ to: string; label: string; ariaLabel?: string }> = [
  { to: '/foundations', label: 'Start', ariaLabel: 'Start with quantum foundations' },
  { to: '/altitudes', label: 'Depths', ariaLabel: 'One concept at five explanation depths' },
  { to: '/map', label: 'Map', ariaLabel: 'Knowledge map' },
  { to: '/path', label: 'Path', ariaLabel: 'Learning path' },
  { to: '/lab', label: 'Lab', ariaLabel: 'Surface code lab' },
  { to: '/duel', label: 'Duel', ariaLabel: 'Decoder Duel game' },
  { to: '/papers', label: 'Papers' },
  { to: '/field-today', label: 'Frontier', ariaLabel: 'Field today' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/review', label: 'Review', ariaLabel: 'Daily spaced review' },
];

const ROUTE_NAMES = new Map<string, string>([
  ['/', 'Home'],
  ['/capstone', 'Synthesis capstone'],
  ...NAV_ITEMS.map(({ to, ariaLabel, label }) => [to, ariaLabel ?? label] as const),
]);

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img
        src={asset('logo.svg')}
        alt=""
        className="h-7 w-7 transition-transform duration-200 group-hover:scale-105"
      />
      <span className="font-display text-lg font-semibold tracking-tight text-text-hi">
        Lattice Atlas
      </span>
    </Link>
  );
}

function useResumeDestination() {
  const { understoodCount, evidenceFor } = useProgress();
  const latestFoundation = new Map(
    evidenceFor('foundation-prediction').map((event) => [event.stageId, event]),
  );
  const foundationCorrect = FOUNDATION_STAGE_IDS.filter(
    (stageId) => latestFoundation.get(stageId)?.correct,
  ).length;
  const altitudeStudied = evidenceFor('altitude-study').length > 0;
  const capstonePassed = evidenceFor('capstone').some((event) => event.passed);

  if (foundationCorrect < 5) return { to: '/foundations', label: 'Foundations' };
  if (!altitudeStudied) return { to: '/altitudes', label: 'Five depths' };
  if (understoodCount < topics.length) return { to: '/path', label: 'Learning path' };
  if (!capstonePassed) return { to: '/capstone', label: 'Capstone' };
  return { to: '/review', label: 'Daily review' };
}

function ProgressPill({ onShare }: { onShare: () => void }) {
  const { understoodCount } = useProgress();
  const resume = useResumeDestination();
  const pct = Math.max(0, Math.min(100, Math.round((understoodCount / topics.length) * 100)));
  const filled = Math.round(pct / 20);
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        to={resume.to}
        title={`Resume course at ${resume.label}. ${understoodCount} of ${topics.length} topics self-marked.`}
        aria-label={`Resume course at ${resume.label}`}
        className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1 font-mono text-xs text-text-mid transition-colors duration-200 hover:border-plaquette/50 hover:text-plaquette"
      >
        {'▓'.repeat(filled)}
        {'░'.repeat(5 - filled)} {pct}%
      </Link>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center gap-1 rounded-full border border-plaquette/50 bg-plaquette/10 px-3 py-1 font-mono text-xs font-semibold text-plaquette transition-transform hover:scale-105"
      >
        <Share2 className="h-3 w-3" aria-hidden /> Share progress
      </button>
    </div>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden items-center xl:flex" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, ...item }) => (
        <NavLink
          key={to}
          to={to}
          end={(to as string) === '/'}
          aria-label={'ariaLabel' in item ? item.ariaLabel : undefined}
          className={({ isActive }) =>
            `relative px-2 py-2 text-sm font-medium transition-colors duration-200 ${
              isActive ? 'text-plaquette' : 'text-text-mid hover:text-text-hi'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {label}
              <span
                className={`absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-plaquette transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function MobileNav({ open, onClose, onShare }: { open: boolean; onClose: () => void; onShare: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const resume = useResumeDestination();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div ref={dialogRef} className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/[0.98] xl:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="flex h-16 items-center justify-between px-6">
        <Logo />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-2 text-text-mid transition-colors hover:text-text-hi"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex flex-col gap-2 px-6 pb-8 pt-10" aria-label="Main">
        <Link
          to={resume.to}
          onClick={onClose}
          className="mb-5 inline-flex min-h-11 items-center justify-between rounded-xl border border-plaquette/50 bg-plaquette/10 px-4 py-3 font-display text-base font-semibold text-plaquette"
        >
          <span>Resume course</span>
          <span className="font-mono text-xs font-normal">{resume.label} →</span>
        </Link>
        {NAV_ITEMS.map(({ to, label, ...item }, i) => (
          <NavLink
            key={to}
            to={to}
            end={(to as string) === '/'}
            aria-label={'ariaLabel' in item ? item.ariaLabel : undefined}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-baseline gap-4 py-2 font-display text-[28px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-plaquette' : 'text-text-hi'
              }`
            }
          >
            <span className="font-mono text-sm font-normal text-text-low">
              {String(i + 1).padStart(2, '0')}
            </span>
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            onShare();
          }}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-plaquette/50 bg-plaquette/10 px-4 py-3 font-display text-base font-semibold text-plaquette"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" /> Share activity and evidence
        </button>
      </nav>
    </div>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const initialRoute = useRef(true);
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (initialRoute.current) {
      initialRoute.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) {
          target.scrollIntoView({ block: 'start' });
          if (target instanceof HTMLElement) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
        }
      } else {
        if (navigationType !== NavigationType.Pop) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
        mainRef.current?.focus({ preventScroll: true });
      }

      const routeName = ROUTE_NAMES.get(location.pathname) ?? 'Page not found';
      setRouteAnnouncement(`${routeName} page loaded`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname, navigationType]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-ink-900 text-text-mid selection:bg-plaquette/30 selection:text-plaquette">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-plaquette px-4 py-2 font-semibold text-ink-950 transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {routeAnnouncement}
      </p>
      <UniversalExplainer />
      <ShareableScoreCard isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      <AITutorDrawer isOpen={aiTutorOpen} onClose={() => setAiTutorOpen(false)} />
      <CommandPalette />
      <header className="fixed top-0 z-40 w-full border-b border-ink-600/80 bg-ink-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <DesktopNav />
            <SoundToggle />
            <button
              type="button"
              onClick={() => setAiTutorOpen(true)}
              title="Open TQEC AI Tutor"
              aria-label="Open TQEC AI Tutor"
              className="inline-flex items-center gap-1.5 rounded-full border border-plaquette/50 bg-plaquette/10 px-2.5 py-1 font-mono text-xs text-plaquette transition-colors hover:bg-plaquette/20"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI Tutor</span>
            </button>
            <ProgressPill onShare={() => setShareOpen(true)} />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-text-mid transition-colors hover:text-text-hi xl:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onShare={() => setShareOpen(true)}
      />

      <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 pt-16 outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-ink-600 bg-ink-950">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-mid">
                A self-study companion for topological quantum error correction —
                from linear algebra to current research.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-4">// SITE</p>
              <ul className="space-y-2">
                {NAV_ITEMS.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="link-slide text-sm text-text-mid transition-colors duration-200 hover:text-text-hi"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">// META</p>
              <p className="font-mono text-[13px] leading-relaxed text-text-low">
                23 papers · 26 topics · 6 tiers · 1998 → 2026
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-low">
                Progress is stored locally in your browser. No account or analytics;
                display fonts are fetched from Google Fonts. Opening an embedded visual lesson
                makes an on-demand request to YouTube&apos;s privacy-enhanced domain.
              </p>
            </div>
          </div>
          <p className="mt-10 border-t border-ink-700 pt-6 font-mono text-[13px] text-text-low">
            Built for learners. Content selected from the foundational TQEC literature. ·{' '}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

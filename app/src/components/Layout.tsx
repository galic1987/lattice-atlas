import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useProgress } from '@/store/progress';
import { topics } from '@/data';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/path', label: 'Path' },
  { to: '/papers', label: 'Papers' },
  { to: '/field-today', label: 'Field Today' },
  { to: '/glossary', label: 'Glossary' },
] as const;

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img
        src="/logo.svg"
        alt=""
        className="h-7 w-7 transition-transform duration-200 group-hover:scale-105"
      />
      <span className="font-display text-lg font-semibold tracking-tight text-text-hi">
        Lattice Atlas
      </span>
    </Link>
  );
}

function ProgressPill() {
  const { understoodCount } = useProgress();
  const pct = Math.round((understoodCount / topics.length) * 100);
  const filled = Math.round(pct / 20);
  return (
    <Link
      to="/path"
      title={`${understoodCount} of ${topics.length} topics understood`}
      className="hidden rounded-full border border-ink-600 bg-ink-800 px-3 py-1 font-mono text-xs text-text-mid transition-colors duration-200 hover:border-plaquette/50 hover:text-plaquette sm:block"
    >
      {'▓'.repeat(filled)}
      {'░'.repeat(5 - filled)} {pct}%
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
      {NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
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

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink-950/[0.98] md:hidden">
      <div className="flex h-16 items-center justify-between px-6">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-2 text-text-mid transition-colors hover:text-text-hi"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex flex-col gap-2 px-6 pt-10" aria-label="Main">
        {NAV_ITEMS.map(({ to, label }, i) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
      </nav>
    </div>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-ink-900">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-ink-600 bg-ink-900/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-8">
          <Logo />
          <div className="flex items-center gap-4">
            <DesktopNav />
            <ProgressPill />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-text-mid transition-colors hover:text-text-hi md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex-1 pt-16">
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
                Progress is stored locally in your browser. No account, no tracking.
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

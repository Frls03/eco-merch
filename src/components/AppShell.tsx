import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
}

export function AppShell({ children, navItems }: { children: ReactNode; navItems: NavItem[] }) {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-20 border-b-2 border-ink-800 bg-ink-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-2.5 py-3 sm:flex-nowrap sm:px-6">
          <Logo />

          <div className="order-2 flex shrink-0 items-center gap-3 sm:order-none">
            {profile && (
              <div className="hidden text-right sm:block">
                <p className="font-body text-sm font-semibold leading-tight text-paper">
                  {profile.full_name}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                  {profile.role}
                </p>
              </div>
            )}
            <button onClick={signOut} className="btn-secondary !px-3 !py-1.5 !text-xs">
              Salir
            </button>
          </div>

          {navItems.length > 0 && (
            <nav className="order-3 flex w-full items-center justify-center gap-1 rounded-chip border-2 border-ink-800 bg-ink-900 p-1 sm:order-none sm:w-auto sm:justify-start">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-chip px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide transition-colors sm:px-4 sm:text-sm ${
                      isActive
                        ? 'bg-amber-500 text-ink-950'
                        : 'text-paper/70 hover:text-paper'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-2.5 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

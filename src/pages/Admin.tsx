import { Route, Routes, NavLink } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminUsers from '@/pages/admin/AdminUsers';

const NAV_ITEMS = [
  { to: '/admin', label: 'Panel' },
  { to: '/bodega', label: 'Bodega' },
  { to: '/stand', label: 'Stand' },
];

const TABS = [
  { to: '/admin', label: 'Productos & stock', end: true },
  { to: '/admin/usuarios', label: 'Usuarios', end: false },
];

export default function Admin() {
  return (
    <AppShell navItems={NAV_ITEMS}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
          Panel de administrador
        </h1>
        <p className="mt-1 font-body text-sm text-paper/60">
          Carga productos, define el stock inicial por talla/color y gestiona al equipo.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `rounded-tag border-2 px-4 py-2 font-body text-sm font-bold uppercase tracking-wide transition-colors ${
                isActive
                  ? 'border-amber-500 bg-amber-500 text-ink-950'
                  : 'border-ink-800 bg-ink-900 text-paper/70 hover:text-paper'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<AdminProducts />} />
        <Route path="usuarios" element={<AdminUsers />} />
      </Routes>
    </AppShell>
  );
}

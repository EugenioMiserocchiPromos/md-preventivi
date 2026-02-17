import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/preventivi/fp', label: 'Fornitura e Posa (FP)' },
  { to: '/preventivi/as', label: 'Assistenza (AS)' },
  { to: '/preventivi/vm', label: 'Vendita Materiale (VM)' },
  { to: '/clienti', label: 'Clienti' },
  { to: '/prodotti', label: 'Prodotti' },
  { to: '/admin/import', label: 'Import CSV' },
];

export default function AppLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200/70">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">MD Preventivi</h1>
              {user ? (
                <p className="mt-1 text-xs text-slate-500">Connesso come {user.email}</p>
              ) : null}
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/quotes/new')}
                  className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Nuovo preventivo
                </button>
                <button
                  type="button"
                  onClick={logout}
                  disabled={loading}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-60"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
          <nav className="mt-4 flex flex-wrap gap-3 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-1.5 transition-colors',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ].join(' ')
                }
                end
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

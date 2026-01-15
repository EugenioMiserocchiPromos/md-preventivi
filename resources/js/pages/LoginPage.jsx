import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    navigate('/preventivi/fp', { replace: true });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login({ email, password });
    if (result.ok) {
      navigate('/preventivi/fp', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/95 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <div className="w-full space-y-6 rounded-3xl bg-slate-900/90 p-8 shadow-lg shadow-slate-950/40">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Accesso</p>
            <h1 className="text-2xl font-semibold">MD Preventivi</h1>
            <p className="text-sm text-slate-400">Inserisci le credenziali per continuare.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on">
            <label className="block text-sm">
              <span className="text-slate-300">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="on"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-300">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="on"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none"
                required
              />
            </label>
            {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

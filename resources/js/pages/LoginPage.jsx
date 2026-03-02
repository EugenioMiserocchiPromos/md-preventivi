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
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <div className="w-full space-y-6 rounded-3xl border border-slate-300/80 bg-[#f2f2f2]/90 p-10 shadow-xl shadow-slate-900/20 backdrop-blur">
          <div className="flex justify-center">
            <img
              src="/pdf/logo-md.png"
              alt="MD Italia"
              className="max-h-16 w-auto"
            />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on">
            <label className="block text-sm">
              <span className="text-slate-600">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="on"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="on"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-400 focus:outline-none"
                required
              />
            </label>
            {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#CD1619] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

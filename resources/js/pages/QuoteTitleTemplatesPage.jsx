import React, { useEffect, useState } from 'react';
import { fetchQuoteTitleTemplates } from '../api/client';

export default function QuoteTitleTemplatesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchQuoteTitleTemplates();
        if (active) {
          setItems(response.data || []);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Errore nel caricamento titoli.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold">Titoli preventivo</h1>
        <p className="text-sm text-slate-500">Lista read-only dei titoli disponibili.</p>
      </header>

      {loading ? <p className="text-sm text-slate-500">Caricamento...</p> : null}
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Titolo</th>
              <th className="px-4 py-3 font-medium">Attivo</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={2}>
                  Nessun titolo disponibile.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/60 text-slate-700">
                  <td className="px-4 py-3 font-medium">{item.label}</td>
                  <td className="px-4 py-3 text-slate-600">{item.is_active ? 'Si' : 'No'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

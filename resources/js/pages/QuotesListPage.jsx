import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuotes } from '../api/client';
import { protForUi } from '../lib/prot';
import { formatMoney } from '../lib/formatters';

const headers = ['PROT', 'Cliente', 'Titolo', 'Cantiere', 'Totale', 'Data', 'Azioni'];

export default function QuotesListPage({ type, label }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [state, setState] = useState({ data: [], meta: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (nextPage = 1, search = query) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchQuotes({ type, q: search, perPage, page: nextPage });
        setState({ data: response.data || [], meta: response.meta || null });
        setPage(response.meta?.current_page || nextPage);
      } catch (err) {
        setError(err?.message || 'Errore durante il caricamento preventivi.');
      } finally {
        setLoading(false);
      }
    },
    [perPage, query, type]
  );

  useEffect(() => {
    load(1, '');
  }, [load]);

  const handleSubmit = (event) => {
    event.preventDefault();
    load(1, query);
  };

  const rows = useMemo(() => state.data || [], [state.data]);
  const currentPage = state.meta?.current_page ?? page;
  const lastPage = state.meta?.last_page ?? 1;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Lista preventivi</p>
        <h2 className="text-xl font-semibold">
          {label} <span className="text-slate-500">({type})</span>
        </h2>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca per PROT, titolo, cliente o cantiere..."
          className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Ricerca...' : 'Cerca'}
        </button>
      </form>
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={headers.length}>
                  {loading ? 'Caricamento...' : 'Nessun preventivo trovato.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200/60 text-slate-700">
                  <td className="px-4 py-4" colSpan={headers.length}>
                    <div className="space-y-2">
                      <div className="grid gap-2 md:grid md:grid-cols-[20%_40%_40%] md:gap-3 items-start text-sm">
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            PROT
                          </span>
                          <p className="font-medium">{protForUi(row) || '—'}</p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Cliente
                          </span>
                          <p
                            className="truncate"
                            title={row.customer_title_snapshot || ''}
                          >
                            {row.customer_title_snapshot || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Cantiere
                          </span>
                          <p className="truncate" title={row.cantiere || ''}>
                            {row.cantiere || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid md:grid-cols-[50%_15%_15%_15%] md:gap-3 items-end">
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Titolo
                          </span>
                          <p className="truncate text-sm" title={row.title_text || ''}>
                            {row.title_text || '—'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Totale
                          </span>
                          <p className="text-sm font-semibold">{formatMoney(row.grand_total)}</p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wide text-slate-500">
                            Data
                          </span>
                          <p className="text-sm">{row.date || '—'}</p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(`/builder/${row.id}`)}
                            title="Apri preventivo"
                            aria-label="Apri preventivo"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-500">
        <button
          type="button"
          disabled={loading || currentPage <= 1}
          onClick={() => load(currentPage - 1, query)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-50"
        >
          Precedente
        </button>
        <span>
          Pagina {currentPage} di {lastPage}
        </span>
        <button
          type="button"
          disabled={loading || currentPage >= lastPage}
          onClick={() => load(currentPage + 1, query)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-50"
        >
          Successiva
        </button>
      </div>
    </section>
  );
}

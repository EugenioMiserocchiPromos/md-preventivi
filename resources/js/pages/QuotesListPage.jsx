import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuotes } from '../api/client';
import QuoteList from '../components/QuoteList';

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
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-6 text-slate-500">
          {loading ? 'Caricamento...' : 'Nessun preventivo trovato.'}
        </div>
      ) : (
        <QuoteList rows={rows} onOpen={(id) => navigate(`/builder/${id}`)} />
      )}

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

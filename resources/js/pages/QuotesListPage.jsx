import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteQuote, duplicateQuote, fetchQuotes } from '../api/client';
import QuoteList from '../components/QuoteList';

const QUOTE_TYPE_OPTIONS = [
  { value: 'FP', label: 'FP' },
  { value: 'AS', label: 'AS' },
  { value: 'VM', label: 'VM' },
];

export default function QuotesListPage({ type, label }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [state, setState] = useState({ data: [], meta: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [confirmRow, setConfirmRow] = useState(null);
  const [duplicateRow, setDuplicateRow] = useState(null);
  const [duplicateType, setDuplicateType] = useState(type);
  const isFirstSearch = useRef(true);

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

  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const timer = setTimeout(() => {
      load(1, query);
    }, 300);

    return () => clearTimeout(timer);
  }, [load, query]);

  const handleSubmit = (event) => {
    event.preventDefault();
    load(1, query);
  };

  const rows = useMemo(() => state.data || [], [state.data]);
  const currentPage = state.meta?.current_page ?? page;
  const lastPage = state.meta?.last_page ?? 1;

  const handleDelete = (row) => {
    setConfirmRow(row);
  };

  const handleConfirmDelete = async () => {
    if (!confirmRow) return;
    const id = confirmRow.id;
    setDeletingId(id);
    setError(null);
    try {
      await deleteQuote(id);
      setState((prev) => ({
        ...prev,
        data: (prev.data || []).filter((row) => row.id !== id),
      }));
    } catch (err) {
      setError(err?.message || 'Errore durante eliminazione preventivo.');
    } finally {
      setDeletingId(null);
      setConfirmRow(null);
    }
  };

  const handleDuplicate = async (row) => {
    if (!row?.id) return;
    setDuplicateRow(row);
    setDuplicateType(row.quote_type || type);
  };

  const handleConfirmDuplicate = async () => {
    if (!duplicateRow?.id) return;
    const row = duplicateRow;
    setDuplicatingId(row.id);
    setError(null);
    try {
      const response = await duplicateQuote(row.id, { quote_type: duplicateType });
      const data = response.data ?? response;
      if (data?.id) {
        navigate(`/builder/${data.id}`);
      } else if (response?.data?.id) {
        navigate(`/builder/${response.data.id}`);
      }
    } catch (err) {
      setError(err?.message || 'Errore durante duplicazione preventivo.');
    } finally {
      setDuplicatingId(null);
      setDuplicateRow(null);
    }
  };

  const handleCancelDuplicate = () => {
    if (duplicatingId) return;
    setDuplicateRow(null);
    setDuplicateType(type);
  };

  const handleDuplicateTypeChange = (event) => {
    setDuplicateType(event.target.value);
  };

  const handleDuplicateModalSubmit = async (event) => {
    event.preventDefault();
    await handleConfirmDuplicate();
  };

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
      </form>
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-6 text-slate-500">
          {loading ? 'Caricamento...' : 'Nessun preventivo trovato.'}
        </div>
      ) : (
        <QuoteList
          rows={rows}
          onOpen={(id) => navigate(`/builder/${id}`)}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          deletingId={deletingId}
          duplicatingId={duplicatingId}
        />
      )}

      {confirmRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Eliminare preventivo?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Stai per eliminare il preventivo{' '}
              <span className="font-semibold text-slate-800">
                {confirmRow.prot_display || confirmRow.id}
              </span>
              . Questa azione non può essere annullata.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRow(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId === confirmRow.id}
                className="rounded-lg bg-[#cd1619] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deletingId === confirmRow.id ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {duplicateRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <form
            onSubmit={handleDuplicateModalSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">Duplica preventivo</h3>
            <p className="mt-2 text-sm text-slate-600">
              Seleziona la categoria del nuovo preventivo da generare a partire da{' '}
              <span className="font-semibold text-slate-800">
                {duplicateRow.prot_display || duplicateRow.id}
              </span>
              .
            </p>
            <label className="mt-5 block text-sm">
              <span className="text-slate-600">Categoria nuovo preventivo</span>
              <select
                value={duplicateType}
                onChange={handleDuplicateTypeChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                {QUOTE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDuplicate}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={duplicatingId === duplicateRow.id}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {duplicatingId === duplicateRow.id ? 'Duplicazione...' : 'Duplica'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

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

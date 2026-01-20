import React, { useCallback, useEffect, useState } from 'react';
import { fetchProductComponents, fetchProducts } from '../api/client';
import { formatMoney } from '../lib/formatters';

const initialState = {
  data: [],
  meta: null,
};

export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [componentsState, setComponentsState] = useState({
    loading: false,
    error: null,
    data: [],
  });

  const load = useCallback(
    async (nextPage = 1, search = query) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProducts({ q: search, perPage, page: nextPage });
        setState({ data: response.data || [], meta: response.meta || null });
        setPage(response.meta?.current_page || nextPage);
      } catch (err) {
        setError(err?.message || 'Errore durante la ricerca prodotti.');
      } finally {
        setLoading(false);
      }
    },
    [perPage, query]
  );

  useEffect(() => {
    load(1, '');
  }, [load]);

  const handleSubmit = (event) => {
    event.preventDefault();
    load(1, query);
  };

  const currentPage = state.meta?.current_page ?? page;
  const lastPage = state.meta?.last_page ?? 1;

  const openComponents = async (product) => {
    setModalProduct(product);
    setComponentsState({ loading: true, error: null, data: [] });
    try {
      const response = await fetchProductComponents(product.id);
      setComponentsState({
        loading: false,
        error: null,
        data: response.data || [],
      });
    } catch (err) {
      setComponentsState({
        loading: false,
        error: err?.message || 'Errore nel caricamento componenti.',
        data: [],
      });
    }
  };

  const closeModal = () => {
    setModalProduct(null);
    setComponentsState({ loading: false, error: null, data: [] });
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Listino</p>
        <h1 className="text-2xl font-semibold">Prodotti</h1>
        <p className="text-sm text-slate-500">Ricerca rapida per codice, nome o categoria.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca per codice o nome..."
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
              <th className="px-4 py-3 font-medium">Codice</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">UM</th>
              <th className="px-4 py-3 font-medium">Prezzo</th>
              <th className="px-4 py-3 font-medium">Componenti</th>
            </tr>
          </thead>
          <tbody>
            {state.data.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  Nessun prodotto trovato.
                </td>
              </tr>
            ) : (
              state.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/60 text-slate-700">
                  <td className="px-4 py-3 font-medium">{item.code}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.category_name}</td>
                  <td className="px-4 py-3">{item.unit_default}</td>
                  <td className="px-4 py-3">{formatMoney(item.price_default)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openComponents(item)}
                      className="text-xs font-semibold text-slate-600 underline underline-offset-4"
                    >
                      Vedi
                    </button>
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

      {modalProduct ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Componenti prodotto</p>
                <h2 className="text-lg font-semibold">
                  {modalProduct.code} — {modalProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"
              >
                Chiudi
              </button>
            </div>
            <div className="px-6 py-4">
              {componentsState.loading ? (
                <p className="text-sm text-slate-500">Caricamento componenti...</p>
              ) : componentsState.error ? (
                <p className="text-sm text-amber-700">{componentsState.error}</p>
              ) : componentsState.data.length === 0 ? (
                <p className="text-sm text-slate-500">Nessun componente.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Ordine</th>
                        <th className="px-4 py-3 font-medium">Componente</th>
                        <th className="px-4 py-3 font-medium">UM</th>
                        <th className="px-4 py-3 font-medium">Qtà</th>
                        <th className="px-4 py-3 font-medium">Prezzo</th>
                        <th className="px-4 py-3 font-medium">Visibile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentsState.data.map((component) => (
                        <tr key={component.id} className="border-t border-slate-200/60">
                          <td className="px-4 py-3 text-slate-600">{component.sort_index}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {component.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{component.unit_default}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {component.qty_default ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {component.price_default ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {component.default_visible ? 'Si' : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

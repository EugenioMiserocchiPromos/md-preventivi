import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from '../api/client';

const initialState = {
  data: [],
  meta: null,
};

export default function CustomersPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ title: '', email: '', body: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const load = useCallback(
    async (nextPage = 1, search = query) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchCustomers({ q: search, perPage, page: nextPage });
        setState({ data: response.data || [], meta: response.meta || null });
        setPage(response.meta?.current_page || nextPage);
      } catch (err) {
        setError(err?.message || 'Errore durante la ricerca clienti.');
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

  const openCreate = () => {
    setEditing(null);
    setFormValues({ title: '', email: '', body: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setFormValues({
      title: customer.title || '',
      email: customer.email || '',
      body: customer.body || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setFormErrors({});
  };

  const validateForm = useCallback((values) => {
    const errors = {};
    if (!values.title.trim()) errors.title = 'Titolo richiesto.';
    if (!values.body.trim()) errors.body = 'Testo richiesto.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email non valida.';
    }
    return errors;
  }, []);

  const serverErrors = useMemo(() => {
    if (!formErrors.server) return [];
    return Array.isArray(formErrors.server) ? formErrors.server : [formErrors.server];
  }, [formErrors.server]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(formValues);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setFormErrors({});
    try {
      if (editing) {
        await updateCustomer(editing.id, {
          title: formValues.title,
          email: formValues.email || null,
          body: formValues.body,
        });
      } else {
        await createCustomer({
          title: formValues.title,
          email: formValues.email || null,
          body: formValues.body,
        });
      }
      await load(currentPage, query);
      setModalOpen(false);
    } catch (err) {
      if (err?.status === 422 && err?.data?.errors) {
        setFormErrors(err.data.errors);
      } else {
        setFormErrors({ server: err?.message || 'Salvataggio non riuscito.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customerId) => {
    setConfirmDeleteId(null);
    setLoading(true);
    setError(null);
    try {
      await deleteCustomer(customerId);
      await load(currentPage, query);
    } catch (err) {
      setError(err?.message || 'Eliminazione non riuscita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Anagrafiche</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Clienti</h1>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Nuovo cliente
          </button>
        </div>
        <p className="text-sm text-slate-500">Ricerca per titolo o email.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca per titolo o email..."
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
              <th className="px-4 py-3 font-medium">Titolo</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {state.data.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={3}>
                  Nessun cliente trovato.
                </td>
              </tr>
            ) : (
              state.data.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/60 text-slate-700">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-slate-600">{item.email || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="rounded-lg border border-rose-200 px-2 py-1 text-rose-600"
                      >
                        Elimina
                      </button>
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

      {confirmDeleteId ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Conferma eliminazione</h2>
            <p className="mt-2 text-sm text-slate-600">
              Vuoi eliminare questo cliente? L&apos;operazione non è reversibile.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {editing ? 'Modifica cliente' : 'Nuovo cliente'}
                </p>
                <h2 className="text-lg font-semibold">Anagrafica cliente</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"
              >
                Chiudi
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm">
                <span className="text-slate-600">Titolo</span>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                {formErrors.title ? (
                  <p className="mt-1 text-xs text-amber-700">{formErrors.title}</p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="text-slate-600">Email</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="opzionale"
                />
                {formErrors.email ? (
                  <p className="mt-1 text-xs text-amber-700">
                    {Array.isArray(formErrors.email) ? formErrors.email.join(', ') : formErrors.email}
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="text-slate-600">Anagrafica</span>
                <textarea
                  rows={4}
                  value={formValues.body}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, body: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                {formErrors.body ? (
                  <p className="mt-1 text-xs text-amber-700">{formErrors.body}</p>
                ) : null}
              </label>

              {serverErrors.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {serverErrors.map((msg, index) => (
                    <p key={`${msg}-${index}`}>{msg}</p>
                  ))}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

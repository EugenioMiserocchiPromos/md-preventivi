import React, { useEffect, useMemo, useState } from 'react';
import {
  createQuoteTitleTemplate,
  deleteQuoteTitleTemplate,
  fetchQuoteTitleTemplates,
  updateQuoteTitleTemplate,
} from '../api/client';

export default function QuoteTitleTemplatesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({ label: '', is_active: true, sort_index: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchQuoteTitleTemplates();
      setItems(response.data || []);
    } catch (err) {
      setError(err?.message || 'Errore nel caricamento titoli.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const serverErrors = useMemo(() => {
    if (!formErrors.server) return [];
    return Array.isArray(formErrors.server) ? formErrors.server : [formErrors.server];
  }, [formErrors.server]);

  const openCreate = () => {
    setEditing(null);
    setFormValues({ label: '', is_active: true, sort_index: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormValues({
      label: item.label || '',
      is_active: Boolean(item.is_active),
      sort_index: item.sort_index ?? '',
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});
    setDeleteError(null);

    const payload = {
      label: formValues.label,
      is_active: Boolean(formValues.is_active),
      sort_index:
        formValues.sort_index === '' ? undefined : Number(formValues.sort_index),
    };

    try {
      if (editing) {
        await updateQuoteTitleTemplate(editing.id, payload);
      } else {
        await createQuoteTitleTemplate(payload);
      }
      await load();
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

  const handleDelete = async (id) => {
    setConfirmDeleteId(null);
    setDeleteError(null);
    try {
      await deleteQuoteTitleTemplate(id);
      await load();
    } catch (err) {
      if (err?.status === 409) {
        setDeleteError(err?.data?.message || 'Template in uso.');
      } else {
        setDeleteError(err?.message || 'Eliminazione non riuscita.');
      }
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold">Titoli preventivo</h1>
        <p className="text-sm text-slate-500">Lista read-only dei titoli disponibili.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {loading ? <p className="text-sm text-slate-500">Caricamento...</p> : null}
          {error ? <p className="text-sm text-amber-700">{error}</p> : null}
          {deleteError ? <p className="text-sm text-amber-700">{deleteError}</p> : null}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Nuovo titolo
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Titolo</th>
              <th className="px-4 py-3 font-medium">Attivo</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={3}>
                  Nessun titolo disponibile.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/60 text-slate-700">
                  <td className="px-4 py-3 font-medium">{item.label}</td>
                  <td className="px-4 py-3 text-slate-600">{item.is_active ? 'Si' : 'No'}</td>
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
              Vuoi eliminare questo titolo? L&apos;operazione non è reversibile.
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
                  {editing ? 'Modifica titolo' : 'Nuovo titolo'}
                </p>
                <h2 className="text-lg font-semibold">Titolo preventivo</h2>
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
                  value={formValues.label}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, label: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                {formErrors.label ? (
                  <p className="mt-1 text-xs text-amber-700">
                    {Array.isArray(formErrors.label) ? formErrors.label.join(', ') : formErrors.label}
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="text-slate-600">Ordine</span>
                <input
                  type="number"
                  min="0"
                  value={formValues.sort_index}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, sort_index: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                {formErrors.sort_index ? (
                  <p className="mt-1 text-xs text-amber-700">
                    {Array.isArray(formErrors.sort_index)
                      ? formErrors.sort_index.join(', ')
                      : formErrors.sort_index}
                  </p>
                ) : null}
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formValues.is_active}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, is_active: event.target.checked }))
                  }
                />
                <span className="text-slate-600">Attivo</span>
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

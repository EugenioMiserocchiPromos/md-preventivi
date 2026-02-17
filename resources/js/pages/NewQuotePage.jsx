import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer, createQuote, fetchCustomers } from '../api/client';

const DEFAULT_TITLE_TEXT = 'Impermeabilizzazione con Sistema Penetron';

export default function NewQuotePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerFormValues, setCustomerFormValues] = useState({ title: '', email: '', body: '' });
  const [customerFormErrors, setCustomerFormErrors] = useState({});
  const [customerSaving, setCustomerSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    quote_type: 'FP',
    customer_id: '',
    date: new Date().toISOString().slice(0, 10),
    cantiere: '',
    title_text: DEFAULT_TITLE_TEXT,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const query = customerQuery.trim();
    if (!query) {
      setCustomerResults([]);
      setCustomerLoading(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const response = await fetchCustomers({ q: query, perPage: 20, page: 1 });
        if (active) {
          setCustomerResults(response.data || []);
        }
      } catch (err) {
        if (active) {
          setCustomerResults([]);
        }
      } finally {
        if (active) setCustomerLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerQuery]);

  const customerServerErrors = useMemo(() => {
    if (!customerFormErrors.server) return [];
    return Array.isArray(customerFormErrors.server)
      ? customerFormErrors.server
      : [customerFormErrors.server];
  }, [customerFormErrors.server]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomerInputChange = (event) => {
    const value = event.target.value;
    setCustomerQuery(value);
    setSelectedCustomer(null);
    setFormValues((prev) => ({ ...prev, customer_id: '' }));
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerQuery(customer.title || '');
    setCustomerResults([]);
    setFormValues((prev) => ({ ...prev, customer_id: String(customer.id) }));
    setFormErrors((prev) => ({ ...prev, customer_id: null }));
  };

  const openCustomerModal = () => {
    setCustomerFormValues({ title: '', email: '', body: '' });
    setCustomerFormErrors({});
    setCustomerModalOpen(true);
  };

  const closeCustomerModal = () => {
    if (customerSaving) return;
    setCustomerModalOpen(false);
    setCustomerFormErrors({});
  };

  const validateCustomerForm = (values) => {
    const errors = {};
    if (!values.title.trim()) errors.title = 'Titolo richiesto.';
    if (!values.body.trim()) errors.body = 'Testo richiesto.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email non valida.';
    }
    return errors;
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    const errors = validateCustomerForm(customerFormValues);
    if (Object.keys(errors).length) {
      setCustomerFormErrors(errors);
      return;
    }

    setCustomerSaving(true);
    setCustomerFormErrors({});
    try {
      const response = await createCustomer({
        title: customerFormValues.title,
        email: customerFormValues.email || null,
        body: customerFormValues.body,
      });
      const created = response.data ?? response;
      if (created?.id) {
        handleSelectCustomer(created);
      } else {
        setCustomerQuery(customerFormValues.title);
      }
      setCustomerModalOpen(false);
    } catch (err) {
      if (err?.status === 422 && err?.data?.errors) {
        setCustomerFormErrors(err.data.errors);
      } else {
        setCustomerFormErrors({ server: err?.message || 'Salvataggio non riuscito.' });
      }
    } finally {
      setCustomerSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFormErrors({});

    try {
      if (!formValues.customer_id) {
        setFormErrors({ customer_id: 'Seleziona un cliente valido.' });
        setSaving(false);
        return;
      }

      const payload = {
        quote_type: formValues.quote_type,
        customer_id: Number(formValues.customer_id),
        date: formValues.date,
        cantiere: formValues.cantiere,
        title_text: formValues.title_text?.trim() || DEFAULT_TITLE_TEXT,
      };

      const response = await createQuote(payload);
      const quote = response.data ?? response;
      navigate(`/builder/${quote.id}`);
    } catch (err) {
      if (err?.status === 422 && err?.data?.errors) {
        setFormErrors(err.data.errors);
      } else {
        setError(err?.message || 'Creazione preventivo non riuscita.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Preventivi</p>
        <h1 className="text-2xl font-semibold">Nuovo preventivo</h1>
        <p className="text-sm text-slate-500">Compila i dati base per creare il preventivo.</p>
      </header>

      {loading ? <p className="text-sm text-slate-500">Caricamento...</p> : null}
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-slate-600">Tipo preventivo</span>
            <select
              value={formValues.quote_type}
              onChange={(event) => handleChange('quote_type', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="FP">Fornitura e Posa (FP)</option>
              <option value="AS">Assistenza (AS)</option>
              <option value="VM">Vendita Materiale (VM)</option>
            </select>
            {formErrors.quote_type ? (
              <p className="mt-1 text-xs text-amber-700">
                {Array.isArray(formErrors.quote_type)
                  ? formErrors.quote_type.join(', ')
                  : formErrors.quote_type}
              </p>
            ) : null}
          </label>
          <div className="text-sm">
            <span className="text-slate-600">Cliente</span>
            <div className="mt-1 flex items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customerQuery}
                  onChange={handleCustomerInputChange}
                  placeholder="Cerca cliente per nome o email..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                {customerQuery.trim() && !selectedCustomer ? (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {customerLoading ? (
                      <div className="px-3 py-2 text-xs text-slate-500">Ricerca...</div>
                    ) : customerResults.length ? (
                      customerResults.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleSelectCustomer(customer)}
                          className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span className="font-medium">{customer.title}</span>
                          {customer.email ? (
                            <span className="text-xs text-slate-500">{customer.email}</span>
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-slate-500">Nessun cliente trovato.</div>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={openCustomerModal}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                title="Nuovo cliente"
              >
                +
              </button>
            </div>
            {selectedCustomer ? (
              <p className="mt-1 text-xs text-slate-500">
                Selezionato: <span className="font-medium text-slate-700">{selectedCustomer.title}</span>
              </p>
            ) : null}
            {formErrors.customer_id ? (
              <p className="mt-1 text-xs text-amber-700">
                {Array.isArray(formErrors.customer_id)
                  ? formErrors.customer_id.join(', ')
                  : formErrors.customer_id}
              </p>
            ) : null}
          </div>
          <label className="text-sm">
            <span className="text-slate-600">Data</span>
            <input
              type="date"
              value={formValues.date}
              onChange={(event) => handleChange('date', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
            {formErrors.date ? (
              <p className="mt-1 text-xs text-amber-700">
                {Array.isArray(formErrors.date)
                  ? formErrors.date.join(', ')
                  : formErrors.date}
              </p>
            ) : null}
          </label>
          <label className="text-sm">
            <span className="text-slate-600">Cantiere</span>
            <input
              type="text"
              value={formValues.cantiere}
              onChange={(event) => handleChange('cantiere', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
            {formErrors.cantiere ? (
              <p className="mt-1 text-xs text-amber-700">
                {Array.isArray(formErrors.cantiere)
                  ? formErrors.cantiere.join(', ')
                  : formErrors.cantiere}
              </p>
            ) : null}
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-slate-600">Titolo preventivo</span>
            <input
              type="text"
              value={formValues.title_text}
              onChange={(event) => handleChange('title_text', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
            {formErrors.title_text ? (
              <p className="mt-1 text-xs text-amber-700">
                {Array.isArray(formErrors.title_text)
                  ? formErrors.title_text.join(', ')
                  : formErrors.title_text}
              </p>
            ) : null}
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/preventivi/fp')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Creazione...' : 'Crea preventivo'}
          </button>
        </div>
      </form>

      {customerModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={closeCustomerModal}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Nuovo cliente</p>
                <h2 className="text-lg font-semibold">Anagrafica cliente</h2>
              </div>
              <button
                type="button"
                onClick={closeCustomerModal}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"
              >
                Chiudi
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleCreateCustomer}>
              <label className="block text-sm">
                <span className="text-slate-600">Titolo</span>
                <input
                  type="text"
                  value={customerFormValues.title}
                  onChange={(event) =>
                    setCustomerFormValues((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                {customerFormErrors.title ? (
                  <p className="mt-1 text-xs text-amber-700">{customerFormErrors.title}</p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="text-slate-600">Email</span>
                <input
                  type="email"
                  value={customerFormValues.email}
                  onChange={(event) =>
                    setCustomerFormValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="opzionale"
                />
                {customerFormErrors.email ? (
                  <p className="mt-1 text-xs text-amber-700">
                    {Array.isArray(customerFormErrors.email)
                      ? customerFormErrors.email.join(', ')
                      : customerFormErrors.email}
                  </p>
                ) : null}
              </label>

              <label className="block text-sm">
                <span className="text-slate-600">Anagrafica</span>
                <textarea
                  rows={4}
                  value={customerFormValues.body}
                  onChange={(event) =>
                    setCustomerFormValues((prev) => ({ ...prev, body: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                {customerFormErrors.body ? (
                  <p className="mt-1 text-xs text-amber-700">{customerFormErrors.body}</p>
                ) : null}
              </label>

              {customerServerErrors.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {customerServerErrors.map((msg, index) => (
                    <p key={`${msg}-${index}`}>{msg}</p>
                  ))}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCustomerModal}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={customerSaving}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {customerSaving ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

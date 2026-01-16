import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuote, fetchCustomers, fetchQuoteTitleTemplates } from '../api/client';

export default function NewQuotePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState({
    quote_type: 'FP',
    customer_id: '',
    date: new Date().toISOString().slice(0, 10),
    cantiere: '',
    title_template_id: '',
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [customersRes, templatesRes] = await Promise.all([
          fetchCustomers({ perPage: 50, page: 1 }),
          fetchQuoteTitleTemplates(),
        ]);

        if (active) {
          setCustomers(customersRes.data || []);
          setTemplates(templatesRes.data || []);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Errore nel caricamento dati.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        quote_type: formValues.quote_type,
        customer_id: Number(formValues.customer_id),
        date: formValues.date,
        cantiere: formValues.cantiere,
        title_template_id: formValues.title_template_id
          ? Number(formValues.title_template_id)
          : null,
      };

      const response = await createQuote(payload);
      const quote = response.data ?? response;
      navigate(`/builder/${quote.id}`);
    } catch (err) {
      setError(err?.message || 'Creazione preventivo non riuscita.');
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
          </label>
          <label className="text-sm">
            <span className="text-slate-600">Cliente</span>
            <select
              value={formValues.customer_id}
              onChange={(event) => handleChange('customer_id', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            >
              <option value="">Seleziona cliente...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-600">Data</span>
            <input
              type="date"
              value={formValues.date}
              onChange={(event) => handleChange('date', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
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
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-slate-600">Template titolo</span>
            <select
              value={formValues.title_template_id}
              onChange={(event) => handleChange('title_template_id', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            >
              <option value="">Seleziona template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
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
    </section>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { fetchCustomers, updateQuoteInfo } from '../api/client';

export default function QuoteInfoModal({ open, quote, onClose, onSaved }) {
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formValues, setFormValues] = useState({
    customer_id: '',
    cantiere: '',
    title_text: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !quote) return;
    setFormValues({
      customer_id: quote.customer_id ? String(quote.customer_id) : '',
      cantiere: quote.cantiere || '',
      title_text: quote.title_text || '',
    });
    if (quote.customer_id) {
      setSelectedCustomer({
        id: quote.customer_id,
        title: quote.customer_title_snapshot || '',
      });
      setCustomerQuery(quote.customer_title_snapshot || '');
    } else {
      setSelectedCustomer(null);
      setCustomerQuery('');
    }
    setFormErrors({});
  }, [open, quote]);

  useEffect(() => {
    if (!open) return;
    const query = customerQuery.trim();
    if (!query || selectedCustomer) {
      setCustomerResults([]);
      setCustomerLoading(false);
      return;
    }
    let active = true;
    setCustomerLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetchCustomers({ q: query, perPage: 20, page: 1 });
        if (active) {
          setCustomerResults(response.data || []);
        }
      } catch {
        if (active) setCustomerResults([]);
      } finally {
        if (active) setCustomerLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerQuery, open, selectedCustomer]);

  const customerServerErrors = useMemo(() => {
    if (!formErrors.server) return [];
    return Array.isArray(formErrors.server) ? formErrors.server : [formErrors.server];
  }, [formErrors.server]);

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

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!quote) return;
    setSaving(true);
    setFormErrors({});

    try {
      const response = await updateQuoteInfo(quote.id, {
        customer_id: Number(formValues.customer_id),
        cantiere: formValues.cantiere,
        title_text: formValues.title_text,
      });
      const data = response.data ?? response;
      onSaved?.(data);
    } catch (err) {
      if (err?.data?.errors) {
        setFormErrors(err.data.errors);
      } else {
        setFormErrors({ server: err?.message || 'Salvataggio non riuscito.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Modifica</p>
            <h2 className="text-lg font-semibold text-slate-900">Info preventivo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
          >
            Chiudi
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="text-sm">
            <span className="text-slate-600">Cliente</span>
            <div className="mt-1">
              <div className="relative">
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
                      <div className="px-3 py-2 text-xs text-slate-500">
                        Nessun cliente trovato.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            {selectedCustomer ? (
              <p className="mt-1 text-xs text-slate-500">
                Selezionato:{' '}
                <span className="font-medium text-slate-700">{selectedCustomer.title}</span>
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

          <label className="block text-sm">
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

          <label className="block text-sm">
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

          {customerServerErrors.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {customerServerErrors.map((msg, index) => (
                <div key={`${msg}-${index}`}>{msg}</div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              disabled={saving}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#cd1619] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

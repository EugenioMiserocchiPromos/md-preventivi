import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createQuoteExtra,
  deleteQuoteExtra,
  fetchQuote,
  fetchQuoteExtras,
  saveQuoteRevision,
  updateQuoteExtra,
  updateQuotePricing,
} from '../api/client';
import TotalsPanel from '../components/TotalsPanel';
import { protForUi } from '../lib/prot';
import { formatMoney } from '../lib/formatters';

const unitOptions = ['pz', 'mq', 'intervento', 'ml', 'mc', 'cad.', 'kg.'];

const normalizeUnit = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  const map = { cad: 'cad.', kg: 'kg.' };
  const unit = map[normalized] || normalized;
  return unitOptions.includes(unit) ? unit : 'ml';
};

const defaultNewExtra = {
  description: '',
  unit: 'ml',
  qty: 1,
  unit_price: 0,
  notes: '',
};

export default function QuoteExtrasPage() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowErrors, setRowErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [newExtra, setNewExtra] = useState(defaultNewExtra);
  const [createError, setCreateError] = useState(null);
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [pricingForm, setPricingForm] = useState({
    discount_type: 'none',
    discount_value: '',
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState(null);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState(null);

  const totals = quote
    ? {
        subtotal: Number(quote.subtotal ?? 0),
        discount_amount: Number(quote.discount_amount ?? 0),
        taxable_total: Number(quote.taxable_total ?? 0),
        vat_amount: Number(quote.vat_amount ?? 0),
        grand_total: Number(quote.grand_total ?? 0),
      }
    : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quoteResponse, extrasResponse] = await Promise.all([
        fetchQuote(quoteId),
        fetchQuoteExtras(quoteId),
      ]);
      const quoteData = quoteResponse.data ?? quoteResponse;
      const extrasPayload = extrasResponse.data ?? extrasResponse;
      const extrasList = Array.isArray(extrasPayload) ? extrasPayload : extrasPayload.data || [];
      setQuote(quoteData);
      setPricingForm({
        discount_type: quoteData.discount_type ?? 'none',
        discount_value:
          quoteData.discount_value !== null && quoteData.discount_value !== undefined
            ? String(quoteData.discount_value)
            : '',
      });
      setExtras(
        extrasList.map((extra) => {
          const isWarranty = extra.fixed_key === 'warranty_10y';
          return {
            ...extra,
            unit: normalizeUnit(extra.unit),
            is_included: isWarranty
              ? Boolean(extra.is_included)
              : Boolean(extra.is_included ?? true),
          };
        })
      );
    } catch (err) {
      setError(err?.message || 'Errore nel caricamento righe extra.');
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateExtraField = (id, field, value) => {
    setExtras((prev) =>
      prev.map((extra) => {
        if (extra.id !== id) return extra;
        const next = { ...extra, [field]: value };
        if (extra.fixed_key === 'warranty_10y' && field === 'unit_price') {
          const numeric = Number(value);
          next.is_included = numeric > 0;
          if (numeric <= 0) {
            next.qty = 1;
          }
        }
        if (extra.fixed_key === 'warranty_10y' && field === 'is_included') {
          if (!value) {
            next.unit_price = 0;
            next.qty = 1;
          }
        }
        return next;
      })
    );
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const toggleWarrantyIncluded = (extra) => {
    const nextIncluded = !extra.is_included;
    updateExtraField(extra.id, 'is_included', nextIncluded);
    if (!nextIncluded) {
      updateExtraField(extra.id, 'unit_price', 0);
      updateExtraField(extra.id, 'qty', 1);
    }
  };

  const handleDeleteExtra = async (extra) => {
    if (extra.is_fixed) return;
    setDeletingId(extra.id);
    setRowErrors((prev) => ({ ...prev, [extra.id]: null }));
    try {
      const response = await deleteQuoteExtra(extra.id);
      const data = response.data ?? response;
      setExtras((prev) => prev.filter((item) => item.id !== extra.id));
      if (data.totals) {
        setQuote((prev) => (prev ? { ...prev, ...data.totals } : prev));
      }
    } catch (err) {
      setRowErrors((prev) => ({
        ...prev,
        [extra.id]: err?.message || 'Errore durante eliminazione.',
      }));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateExtra = async (event) => {
    event.preventDefault();
    setCreateError(null);
    try {
      const payload = {
        description: newExtra.description,
        unit: normalizeUnit(newExtra.unit),
        qty: Number(newExtra.qty),
        unit_price: Number(newExtra.unit_price),
        notes: newExtra.notes || '',
      };
      const response = await createQuoteExtra(quoteId, payload);
      const data = response.data ?? response;
      if (data.extra) {
        setExtras((prev) => [...prev, data.extra]);
      }
      if (data.totals) {
        setQuote((prev) => (prev ? { ...prev, ...data.totals } : prev));
      }
      setNewExtra(defaultNewExtra);
    } catch (err) {
      setCreateError(err?.message || 'Errore durante creazione riga.');
    }
  };

  const saveDirtyExtras = async () => {
    const ids = Array.from(dirtyIds);
    if (ids.length === 0) return;
    const nextErrors = {};

    for (const id of ids) {
      const extra = extras.find((item) => item.id === id);
      if (!extra) continue;
      const isWarranty = extra.fixed_key === 'warranty_10y';
      if (isWarranty) {
        const normalizedIncluded = Number(extra.unit_price) > 0;
        if (extra.is_included !== normalizedIncluded) {
          updateExtraField(extra.id, 'is_included', normalizedIncluded);
        }
      }
      if (isWarranty && extra.is_included && Number(extra.unit_price) <= 0) {
        nextErrors[id] = 'Inserisci un prezzo valido per la garanzia.';
        continue;
      }
      if (isWarranty && !extra.is_included && Number(extra.unit_price) !== 0) {
        updateExtraField(extra.id, 'unit_price', 0);
      }
      try {
        const payload = {
          unit: normalizeUnit(extra.unit),
          qty: Number(extra.qty),
          unit_price: Number(extra.unit_price),
          notes: extra.notes || '',
          is_included: Boolean(extra.is_included),
        };
        if (!extra.is_fixed) {
          payload.description = extra.description;
        }
        const response = await updateQuoteExtra(extra.id, payload);
        const data = response.data ?? response;
        if (data.extra) {
          setExtras((prev) =>
            prev.map((item) => (item.id === extra.id ? data.extra : item))
          );
        }
        if (data.totals) {
          setQuote((prev) => (prev ? { ...prev, ...data.totals } : prev));
        }
      } catch (err) {
        nextErrors[id] =
          err?.data?.errors?.unit_price?.[0] || err?.message || 'Errore durante salvataggio.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setRowErrors((prev) => ({ ...prev, ...nextErrors }));
      throw new Error('Errore durante salvataggio righe extra.');
    }

    setDirtyIds(new Set());
  };

  const handlePricingSubmit = async (event) => {
    event.preventDefault();
    if (!quote) return;

    setPricingSaving(true);
    setPricingError(null);

    setRowErrors({});

    const payload = {
      discount_type: pricingForm.discount_type === 'none' ? null : pricingForm.discount_type,
      discount_value:
        pricingForm.discount_value === '' ? null : Number(pricingForm.discount_value),
    };

    try {
      await saveDirtyExtras();
      const response = await updateQuotePricing(quote.id, payload);
      const data = response.data ?? response;
      setQuote((prev) => {
        if (!prev) return data;
        return {
          ...prev,
          ...data,
        };
      });
      setPricingForm({
        discount_type: data.discount_type ?? 'none',
        discount_value:
          data.discount_value !== null && data.discount_value !== undefined
            ? String(data.discount_value)
            : '',
      });
    } catch (err) {
      setPricingError(err?.message || 'Errore durante aggiornamento totali.');
    } finally {
      setPricingSaving(false);
    }
  };

  const getListPath = (type) => {
    const key = String(type || '').toLowerCase();
    if (key === 'fp') return '/preventivi/fp';
    if (key === 'as') return '/preventivi/as';
    if (key === 'vm') return '/preventivi/vm';
    return '/preventivi/fp';
  };

  const handleSaveAndClose = async () => {
    if (!quote) return;
    setClosing(true);
    setCloseError(null);
    setRowErrors({});

    try {
      for (const extra of extras) {
        const payload = {
          unit: normalizeUnit(extra.unit),
          qty: Number(extra.qty),
          unit_price: Number(extra.unit_price),
          notes: extra.notes || '',
          is_included: Boolean(extra.is_included),
        };
        if (!extra.is_fixed) {
          payload.description = extra.description;
        }
        const response = await updateQuoteExtra(extra.id, payload);
        const data = response.data ?? response;
        if (data.extra) {
          setExtras((prev) =>
            prev.map((item) => (item.id === extra.id ? data.extra : item))
          );
        }
        if (data.totals) {
          setQuote((prev) => (prev ? { ...prev, ...data.totals } : prev));
        }
      }

      const pricingPayload = {
        discount_type: pricingForm.discount_type === 'none' ? null : pricingForm.discount_type,
        discount_value:
          pricingForm.discount_value === '' ? null : Number(pricingForm.discount_value),
      };
      const pricingResponse = await updateQuotePricing(quote.id, pricingPayload);
      const pricingData = pricingResponse.data ?? pricingResponse;
      setQuote((prev) => (prev ? { ...prev, ...pricingData } : prev));

      const revisionResponse = await saveQuoteRevision(quote.id);
      const revisionData = revisionResponse.data ?? revisionResponse;
      setQuote((prev) => (prev ? { ...prev, ...revisionData } : prev));

      navigate(getListPath(quote.quote_type));
    } catch (err) {
      const message =
        err?.data?.errors?.unit_price?.[0] || err?.message || 'Errore durante salvataggio.';
      setCloseError(message);
    } finally {
      setClosing(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-slate-500">Step</div>
          <h1 className="text-3xl font-semibold leading-tight">Righe extra</h1>
          {quote ? (
            <p className="text-sm text-slate-600 leading-snug">
              PROT: {protForUi(quote) || '—'} — {quote.customer_title_snapshot}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/builder/${quoteId}`)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Indietro
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            disabled={closing}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {closing ? 'Salvataggio...' : 'Salva e chiudi'}
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Caricamento...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {extras.length === 0 ? (
            <p className="text-sm text-slate-500">Nessuna riga extra presente.</p>
          ) : null}
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
            <table className="min-w-full text-left text-sm">
              <tbody>
                {extras.map((extra) => {
                  const isWarranty = extra.fixed_key === 'warranty_10y';
                  const warrantyExcluded = isWarranty && !extra.is_included;
                  const qtyValue = Number(extra.qty || 0);
                  const priceValue = Number(extra.unit_price || 0);
                  const lineTotal = qtyValue * priceValue;
                  return (
                    <React.Fragment key={extra.id}>
                      <tr
                        className={`border-t border-slate-200/60 ${
                          warrantyExcluded ? 'bg-slate-100/70' : ''
                        }`}
                      >
                        <td className="px-3 py-3" colSpan={6}>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Descrizione
                          </p>
                          {extra.is_fixed ? (
                            <p className="mt-1 font-medium text-slate-700">{extra.description}</p>
                          ) : (
                            <input
                              value={extra.description}
                              onChange={(event) =>
                                updateExtraField(extra.id, 'description', event.target.value)
                              }
                              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                          )}
                        </td>
                      </tr>
                      <tr
                        className={`border-t border-slate-200/60 ${
                          warrantyExcluded ? 'bg-slate-100/70' : ''
                        }`}
                      >
                        <td className="px-3 py-3" colSpan={6}>
                          {isWarranty ? (
                            <div className="mt-1 grid gap-3 md:grid-cols-3">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={warrantyExcluded}
                                  onChange={() => toggleWarrantyIncluded(extra)}
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-slate-700">Non compresa</span>
                              </label>
                              <label className="text-sm">
                                <span className="text-slate-600">Prezzo</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extra.unit_price}
                                  onChange={(event) =>
                                    updateExtraField(extra.id, 'unit_price', event.target.value)
                                  }
                                  disabled={warrantyExcluded}
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
                                />
                              </label>
                              <div className="text-sm">
                                <span className="text-slate-600">Totale riga</span>
                                <p className="mt-2 text-base font-semibold text-slate-800">
                                  {formatMoney(lineTotal)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1 grid gap-3 md:grid-cols-4">
                              <label className="text-sm">
                                <span className="text-slate-600">Qtà</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extra.qty}
                                  onChange={(event) =>
                                    updateExtraField(extra.id, 'qty', event.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                />
                              </label>
                              <label className="text-sm">
                                <span className="text-slate-600">UM</span>
                                <select
                                  value={extra.unit}
                                  onChange={(event) =>
                                    updateExtraField(extra.id, 'unit', event.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                >
                                  {unitOptions.map((unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="text-sm">
                                <span className="text-slate-600">Prezzo</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={extra.unit_price}
                                  onChange={(event) =>
                                    updateExtraField(extra.id, 'unit_price', event.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                                />
                              </label>
                              <div className="text-sm">
                                <span className="text-slate-600">Totale riga</span>
                                <p className="mt-2 text-base font-semibold text-slate-800">
                                  {formatMoney(lineTotal)}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {!extra.is_fixed ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteExtra(extra)}
                                disabled={deletingId === extra.id}
                                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 disabled:opacity-60"
                              >
                                Elimina
                              </button>
                            ) : null}
                          </div>
                          {rowErrors[extra.id] ? (
                            <p className="mt-2 text-xs text-rose-600">{rowErrors[extra.id]}</p>
                          ) : null}
                          {isWarranty && Number(extra.unit_price) === 0 ? (
                            <p className="mt-2 text-xs text-slate-500">
                              Nota: prezzo 0 → Garanzia non compresa.
                            </p>
                          ) : null}
                        </td>
                      </tr>
                      {!isWarranty ? (
                        <tr className="border-t border-slate-200/60">
                          <td className="px-3 py-3" colSpan={6}>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Note</p>
                            <input
                              value={extra.notes || ''}
                              onChange={(event) =>
                                updateExtraField(extra.id, 'notes', event.target.value)
                              }
                              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={handleCreateExtra}
            className="rounded-2xl border border-slate-200/70 bg-white p-4"
          >
            <p className="text-sm font-semibold text-slate-700">Nuova riga extra</p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Descrizione</p>
                <input
                  placeholder="Descrizione"
                  value={newExtra.description}
                  onChange={(event) =>
                    setNewExtra((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  required
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="text-sm">
                  <span className="text-slate-600">Qtà</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newExtra.qty}
                    onChange={(event) =>
                      setNewExtra((prev) => ({ ...prev, qty: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">UM</span>
                  <select
                    value={newExtra.unit}
                    onChange={(event) =>
                      setNewExtra((prev) => ({ ...prev, unit: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">Prezzo</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newExtra.unit_price}
                    onChange={(event) =>
                      setNewExtra((prev) => ({ ...prev, unit_price: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                  />
                </label>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Note</p>
                <input
                  placeholder="Note"
                  value={newExtra.notes}
                  onChange={(event) =>
                    setNewExtra((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Aggiungi
              </button>
            </div>
            {createError ? <p className="mt-2 text-sm text-rose-600">{createError}</p> : null}
          </form>
        </div>
      ) : null}
      {closeError ? <p className="text-sm text-rose-600">{closeError}</p> : null}

      <TotalsPanel
        totals={totals}
        pricingForm={pricingForm}
        onPricingChange={setPricingForm}
        onSubmit={handlePricingSubmit}
        saving={pricingSaving}
        error={pricingError}
      />
    </section>
  );
}

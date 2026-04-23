import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createQuoteExtra,
  deleteQuoteExtra,
  fetchQuote,
  fetchQuotePricingOptions,
  fetchQuoteExtras,
  fetchUnits,
  saveQuoteRevision,
  updateQuoteExtra,
  updateQuotePricing,
} from '../api/client';
import { EmptyState, ErrorAlert, LoadingState } from '../components/Feedback';
import TotalsPanel from '../components/TotalsPanel';
import QuoteInfoModal from '../components/QuoteInfoModal';
import { protForUi } from '../lib/prot';
import { formatMoney } from '../lib/formatters';
import {
  fallbackDefaultPaymentMethod,
  fallbackNoIbanPaymentMethod,
  fallbackPaymentMethodOptions,
  shouldShowPaymentIban,
} from '../lib/quotePricing';
import { setFlashMessage } from '../lib/flash';
import { defaultQuoteListPath, getQuoteListPath } from '../lib/quoteTypes';
import { fallbackUnitOptions, normalizeUnitValue } from '../lib/units';

const defaultNewExtra = {
  description: '',
  unit: 'ml',
  qty: 1,
  unit_price: 0,
  notes: '',
};

const getWarrantyValidationError = (extra) => {
  if (extra?.fixed_key !== 'warranty_10y') return null;
  return Boolean(extra.is_included) && Number(extra.unit_price) <= 0
    ? 'Per includere la garanzia decennale devi inserire un prezzo maggiore di 0 oppure attivare "Non compresa".'
    : null;
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
  const autosaveTimers = useRef({});
  const autosaveInflight = useRef(new Set());
  const extrasRef = useRef([]);
  const [pricingForm, setPricingForm] = useState({
    discount_type: 'none',
    discount_value: '',
    payment_method: fallbackDefaultPaymentMethod,
    payment_iban: '',
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [revising, setRevising] = useState(false);
  const [closeError, setCloseError] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [unitOptions, setUnitOptions] = useState(fallbackUnitOptions);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState(fallbackPaymentMethodOptions);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(fallbackDefaultPaymentMethod);
  const [noIbanPaymentMethod, setNoIbanPaymentMethod] = useState(fallbackNoIbanPaymentMethod);

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
          quoteData.discount_type === null || quoteData.discount_type === 'none'
            ? '0'
            : quoteData.discount_value !== null && quoteData.discount_value !== undefined
              ? String(quoteData.discount_value)
              : '',
        payment_method: quoteData.payment_method || defaultPaymentMethod,
        payment_iban: quoteData.payment_iban || '',
      });
      setExtras(
        extrasList.map((extra) => {
          const isWarranty = extra.fixed_key === 'warranty_10y';
          return {
            ...extra,
            unit: normalizeUnitValue(extra.unit, unitOptions),
            is_included: isWarranty
              ? Boolean(extra.is_included)
              : Boolean(extra.is_included ?? true),
          };
        })
      );
    } catch (err) {
      if (err?.status === 404) {
        setFlashMessage('Il preventivo richiesto non esiste o non è piu disponibile.', {
          title: 'Preventivo non trovato',
          variant: 'warning',
        });
        navigate(defaultQuoteListPath, { replace: true });
        return;
      }
      setError(err?.message || 'Errore nel caricamento righe extra.');
    } finally {
      setLoading(false);
    }
  }, [navigate, quoteId, unitOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([fetchUnits(), fetchQuotePricingOptions()]).then((results) => {
      if (cancelled) return;

      const unitsResult = results[0];
      if (unitsResult.status === 'fulfilled' && Array.isArray(unitsResult.value) && unitsResult.value.length > 0) {
        setUnitOptions(unitsResult.value);
      }

      const pricingResult = results[1];
      if (pricingResult.status === 'fulfilled' && pricingResult.value) {
        const methods = Array.isArray(pricingResult.value.payment_methods)
          ? pricingResult.value.payment_methods
          : fallbackPaymentMethodOptions;
        const defaultMethod = pricingResult.value.default_payment_method || methods[0] || fallbackDefaultPaymentMethod;
        const noIbanMethod = pricingResult.value.no_iban_payment_method || defaultMethod;

        setPaymentMethodOptions(methods);
        setDefaultPaymentMethod(defaultMethod);
        setNoIbanPaymentMethod(noIbanMethod);
        setPricingForm((prev) => ({
          ...prev,
          payment_method: prev.payment_method || defaultMethod,
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(autosaveTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    extrasRef.current = extras;
  }, [extras]);

  const autoSaveExtra = useCallback(async (id) => {
    if (autosaveInflight.current.has(id)) return;
    const extra = extrasRef.current.find((item) => item.id === id);
    if (!extra) return;

    const isWarranty = extra.fixed_key === 'warranty_10y';
    const payloadExtra = { ...extra };
    const snapshot = {
      description: extra.description,
      unit: extra.unit,
      qty: Number(extra.qty),
      unit_price: Number(extra.unit_price),
      notes: extra.notes || '',
      is_included: Boolean(extra.is_included),
    };
    if (isWarranty) {
      const validationError = getWarrantyValidationError(payloadExtra);
      if (validationError) {
        setRowErrors((prev) => ({
          ...prev,
          [id]: validationError,
        }));
        return;
      }
    }

    autosaveInflight.current.add(id);
    try {
      const payload = {
        unit: normalizeUnitValue(payloadExtra.unit, unitOptions),
        qty: Number(payloadExtra.qty),
        unit_price: Number(payloadExtra.unit_price),
        notes: payloadExtra.notes || '',
        is_included: Boolean(payloadExtra.is_included),
      };
      if (!payloadExtra.is_fixed) {
        payload.description = payloadExtra.description;
      }
      const response = await updateQuoteExtra(payloadExtra.id, payload);
      const data = response.data ?? response;
      if (data.extra) {
        setExtras((prev) =>
          prev.map((item) => {
            if (item.id !== extra.id) return item;
            const currentSnapshot = {
              description: item.description,
              unit: item.unit,
              qty: Number(item.qty),
              unit_price: Number(item.unit_price),
              notes: item.notes || '',
              is_included: Boolean(item.is_included),
            };
            const matches =
              JSON.stringify(currentSnapshot) === JSON.stringify(snapshot);
            return matches ? data.extra : item;
          })
        );
      }
      if (data.totals) {
        setQuote((prev) => (prev ? { ...prev, ...data.totals } : prev));
      }
      setRowErrors((prev) => ({ ...prev, [id]: null }));
    } catch (err) {
      setRowErrors((prev) => ({
        ...prev,
        [id]: err?.data?.errors?.unit_price?.[0] || err?.message || 'Errore durante salvataggio.',
      }));
    } finally {
      autosaveInflight.current.delete(id);
    }
  }, []);

  const clearAutoSave = (id) => {
    if (autosaveTimers.current[id]) {
      clearTimeout(autosaveTimers.current[id]);
    }
  };

  const scheduleAutoSave = (id) => {
    clearAutoSave(id);
    autosaveTimers.current[id] = setTimeout(() => {
      autoSaveExtra(id);
    }, 500);
  };

  const updateExtraField = (id, field, value, options = {}) => {
    const { schedule = true } = options;
    let nextWarrantyError = null;
    setExtras((prev) =>
      prev.map((extra) => {
        if (extra.id !== id) return extra;
        const next = { ...extra, [field]: value };
        if (extra.fixed_key === 'warranty_10y' && field === 'is_included') {
          if (!value) {
            next.unit_price = 0;
            next.qty = 1;
          }
        }
        nextWarrantyError = getWarrantyValidationError(next);
        return next;
      })
    );
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setRowErrors((prev) => ({ ...prev, [id]: nextWarrantyError }));
    if (schedule) {
      scheduleAutoSave(id);
    } else {
      clearAutoSave(id);
    }
  };

  const toggleWarrantyIncluded = (extra) => {
    const nextIncluded = !extra.is_included;
    updateExtraField(extra.id, 'is_included', nextIncluded, { schedule: !nextIncluded });
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
        unit: normalizeUnitValue(newExtra.unit, unitOptions),
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
        const validationError = getWarrantyValidationError(extra);
        if (validationError) {
          nextErrors[id] = validationError;
          continue;
        }
      }
      if (isWarranty && !extra.is_included && Number(extra.unit_price) !== 0) {
        updateExtraField(extra.id, 'unit_price', 0);
      }
      try {
        const payload = {
          unit: normalizeUnitValue(extra.unit, unitOptions),
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
      payment_method: pricingForm.payment_method || defaultPaymentMethod,
      payment_iban:
        shouldShowPaymentIban(pricingForm.payment_method, noIbanPaymentMethod)
          ? pricingForm.payment_iban || ''
          : '',
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
          data.discount_type === null || data.discount_type === 'none'
            ? '0'
            : data.discount_value !== null && data.discount_value !== undefined
              ? String(data.discount_value)
              : '',
        payment_method: data.payment_method || defaultPaymentMethod,
        payment_iban: data.payment_iban || '',
      });
    } catch (err) {
      setPricingError(err?.message || 'Errore durante aggiornamento totali.');
    } finally {
      setPricingSaving(false);
    }
  };


  const handlePricingChange = (updater) => {
    setPricingForm((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.discount_type === 'none') {
        next.discount_value = '0';
      }
      if (!shouldShowPaymentIban(next.payment_method, noIbanPaymentMethod)) {
        next.payment_iban = '';
      }
      return { ...next };
    });
  };

  const flushBeforeExit = async () => {
    if (!quote) return;
    setCloseError(null);
    setRowErrors({});

    for (const extra of extras) {
      const isWarranty = extra.fixed_key === 'warranty_10y';
      if (isWarranty) {
        const validationError = getWarrantyValidationError(extra);
        if (validationError) {
          setRowErrors((prev) => ({ ...prev, [extra.id]: validationError }));
          throw new Error(
            'Non puoi completare il salvataggio: la garanzia decennale e\' inclusa ma il prezzo e\' ancora 0.'
          );
        }
      }

      const payload = {
        unit: normalizeUnitValue(extra.unit, unitOptions),
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

    setDirtyIds(new Set());

    const pricingPayload = {
      discount_type: pricingForm.discount_type === 'none' ? null : pricingForm.discount_type,
      discount_value:
        pricingForm.discount_value === '' ? null : Number(pricingForm.discount_value),
      payment_method: pricingForm.payment_method || defaultPaymentMethod,
      payment_iban:
        shouldShowPaymentIban(pricingForm.payment_method, noIbanPaymentMethod)
          ? pricingForm.payment_iban || ''
          : '',
    };
    const pricingResponse = await updateQuotePricing(quote.id, pricingPayload);
    const pricingData = pricingResponse.data ?? pricingResponse;
    setQuote((prev) => (prev ? { ...prev, ...pricingData } : prev));
    setPricingForm({
      discount_type: pricingData.discount_type ?? 'none',
      discount_value:
        pricingData.discount_type === null || pricingData.discount_type === 'none'
          ? '0'
          : pricingData.discount_value !== null && pricingData.discount_value !== undefined
            ? String(pricingData.discount_value)
            : '',
      payment_method: pricingData.payment_method || defaultPaymentMethod,
      payment_iban: pricingData.payment_iban || '',
    });
  };

  const handleSave = async () => {
    if (!quote) return;

    setSaving(true);
    try {
      await flushBeforeExit();
      navigate(getQuoteListPath(quote.quote_type));
    } catch (err) {
      const message =
        err?.data?.errors?.unit_price?.[0] || err?.message || 'Errore durante salvataggio.';
      setCloseError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndRevise = async () => {
    if (!quote) return;

    setRevising(true);
    try {
      await flushBeforeExit();

      const revisionResponse = await saveQuoteRevision(quote.id);
      const revisionData = revisionResponse.data ?? revisionResponse;
      setQuote((prev) => (prev ? { ...prev, ...revisionData } : prev));

      navigate(getQuoteListPath(quote.quote_type));
    } catch (err) {
      const message =
        err?.data?.errors?.unit_price?.[0] || err?.message || 'Errore durante salvataggio.';
      setCloseError(message);
    } finally {
      setRevising(false);
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
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setInfoModalOpen(true)}
            className="shrink-0 whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Modifica info
          </button>
          <button
            type="button"
            onClick={() => navigate(`/builder/${quoteId}`)}
            className="shrink-0 whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Indietro
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || revising}
            className="min-w-[8.5rem] shrink-0 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
          <button
            type="button"
            onClick={handleSaveAndRevise}
            disabled={saving || revising}
            className="min-w-[10.5rem] shrink-0 whitespace-nowrap rounded-xl bg-[#cd1619] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {revising ? 'Salvataggio...' : 'Salva e revisiona'}
          </button>
        </div>
      </div>

      {loading ? <LoadingState label="Caricamento righe extra..." /> : null}
      {error ? (
        <ErrorAlert
          title="Righe extra"
          message={error}
          variant="error"
          actions={[{ label: 'Riprova', onClick: loadData }]}
        />
      ) : null}
      {closeError ? <ErrorAlert message={closeError} variant="error" /> : null}

      {!loading && !error ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Pagamenti</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                <span className="text-slate-600">Metodo</span>
                <select
                  value={pricingForm.payment_method || defaultPaymentMethod}
                  onChange={(event) =>
                    handlePricingChange((prev) => ({
                      ...prev,
                      payment_method: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  {paymentMethodOptions.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>
              {shouldShowPaymentIban(pricingForm.payment_method, noIbanPaymentMethod) ? (
                <label className="text-sm">
                  <span className="text-slate-600">IBAN</span>
                  <input
                    value={pricingForm.payment_iban || ''}
                    onChange={(event) =>
                      handlePricingChange((prev) => ({
                        ...prev,
                        payment_iban: event.target.value,
                      }))
                    }
                    placeholder="Inserisci IBAN"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              ) : null}
          </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handlePricingSubmit}
                disabled={pricingSaving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {pricingSaving ? 'Salvataggio...' : 'Salva pagamenti'}
              </button>
              {pricingError ? <ErrorAlert className="mt-3" message={pricingError} variant="error" /> : null}
            </div>
          </div>
          {extras.length === 0 ? (
            <EmptyState
              title="Nessuna riga extra presente."
              description="Aggiungi una riga extra oppure continua con i totali attuali."
            />
          ) : null}
          <div className="space-y-4">
            {extras.map((extra) => {
              const isWarranty = extra.fixed_key === 'warranty_10y';
              const warrantyExcluded = isWarranty && !extra.is_included;
              const warrantyValidationError = getWarrantyValidationError(extra);
              const qtyValue = Number(extra.qty || 0);
              const priceValue = Number(extra.unit_price || 0);
              const lineTotal = qtyValue * priceValue;
              return (
                <div
                  key={extra.id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm ${
                    warrantyValidationError
                      ? 'border-rose-300 bg-rose-50/70 ring-1 ring-rose-200'
                      : 'border-slate-200/70'
                  } ${
                    warrantyExcluded ? 'bg-slate-50/70' : ''
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">Descrizione</p>
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

                  <div className="mt-4">
                    {isWarranty ? (
                      <div className="grid gap-3 md:grid-cols-3">
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
                            className={`mt-1 w-full rounded-xl border px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400 ${
                              warrantyValidationError
                                ? 'border-rose-400 bg-rose-50 text-rose-900'
                                : 'border-slate-200'
                            }`}
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
                      <div className="grid gap-3 md:grid-cols-4">
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
                          {extra.fixed_key === 'extra_3' ? (
                            <input
                              value="nº"
                              disabled
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                            />
                          ) : (
                            <select
                              value={extra.unit}
                              onChange={(event) =>
                                updateExtraField(extra.id, 'unit', event.target.value)
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                            >
                              {unitOptions.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.label}
                                </option>
                              ))}
                            </select>
                          )}
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
                  </div>

                  {!isWarranty ? (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Note</p>
                      <input
                        value={extra.notes || ''}
                        onChange={(event) =>
                          updateExtraField(extra.id, 'notes', event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
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
                  {warrantyValidationError ? (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-100 px-3 py-2">
                      <p className="text-sm font-medium text-rose-800">{warrantyValidationError}</p>
                    </div>
                  ) : null}
                  {rowErrors[extra.id] && !warrantyValidationError ? (
                    <p className="mt-2 text-xs text-rose-600">{rowErrors[extra.id]}</p>
                  ) : null}
                  {isWarranty && Number(extra.unit_price) === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Nota: prezzo 0 → Garanzia non compresa.
                    </p>
                  ) : null}
                </div>
              );
            })}
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
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
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
            {createError ? <ErrorAlert className="mt-2" message={createError} variant="error" /> : null}
          </form>
        </div>
      ) : null}

      <QuoteInfoModal
        open={infoModalOpen}
        quote={quote}
        onClose={() => setInfoModalOpen(false)}
        onSaved={(data) => {
          setQuote((prev) => (prev ? { ...prev, ...data } : data));
          setInfoModalOpen(false);
        }}
      />
      <TotalsPanel
        totals={totals}
        pricingForm={pricingForm}
        onPricingChange={handlePricingChange}
        onSubmit={handlePricingSubmit}
        saving={pricingSaving}
        error={pricingError}
        paymentMethodOptions={paymentMethodOptions}
        defaultPaymentMethod={defaultPaymentMethod}
        noIbanPaymentMethod={noIbanPaymentMethod}
      />
    </section>
  );
}

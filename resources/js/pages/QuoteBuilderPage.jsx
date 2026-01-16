import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createQuoteItem,
  deleteQuoteItem,
  deleteQuoteItemPose,
  fetchProducts,
  fetchQuote,
  updateQuoteItem,
  updateQuoteItemComponent,
  upsertQuoteItemPose,
  updateQuotePricing,
} from '../api/client';

const defaultPose = {
  pose_type: 'Posa in opera',
  unit: 'intervento',
  qty: 1,
  unit_price: 0,
  is_included: false,
};

const unitOptions = ['pz', 'mq', 'intervento', 'ml', 'mc', 'cad.', 'kg.'];
const poseTypeOptions = [
  'Posa in opera',
  "Posa di competenza dell'impresa",
  'Fornitura e posa in opera',
];

const normalizeUnit = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  const map = { cad: 'cad.', kg: 'kg.' };
  const unit = map[normalized] || normalized;
  return unitOptions.includes(unit) ? unit : 'ml';
};

function QuoteItemCard({
  item,
  isOpen,
  onOpen,
  onUpdateItem,
  onDeleteItem,
  onUpdateComponent,
  onUpsertPose,
  onDeletePose,
  onSaveAll,
}) {
  const [itemDraft, setItemDraft] = useState({
    qty: item.qty,
    unit_override: normalizeUnit(item.unit_override),
    unit_price_override: item.unit_price_override,
    note_shared: item.note_shared || '',
  });
  const [componentDrafts, setComponentDrafts] = useState(() =>
    Object.fromEntries(
      (item.components || []).map((component) => [
        component.id,
        {
          qty: component.qty,
          unit_override: normalizeUnit(component.unit_override),
          unit_price_override: component.unit_price_override,
          is_visible: component.is_visible,
        },
      ])
    )
  );
  const [poseDraft, setPoseDraft] = useState(
    item.pose?.id ? { ...item.pose, unit: normalizeUnit(item.pose.unit) } : defaultPose
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItemDraft({
      qty: item.qty,
      unit_override: normalizeUnit(item.unit_override),
      unit_price_override: item.unit_price_override,
      note_shared: item.note_shared || '',
    });
    setComponentDrafts(
      Object.fromEntries(
        (item.components || []).map((component) => [
          component.id,
          {
            qty: component.qty,
            unit_override: normalizeUnit(component.unit_override),
            unit_price_override: component.unit_price_override,
            is_visible: component.is_visible,
          },
        ])
      )
    );
    setPoseDraft(item.pose?.id ? { ...item.pose, unit: normalizeUnit(item.pose.unit) } : defaultPose);
  }, [item]);

  const saveItem = async () => {
    setSaving(true);
    await onUpdateItem(item.id, {
      qty: Number(itemDraft.qty),
      unit_override: itemDraft.unit_override,
      unit_price_override: Number(itemDraft.unit_price_override),
      note_shared: itemDraft.note_shared,
    });
    setSaving(false);
  };

  const saveComponent = async (componentId) => {
    const draft = componentDrafts[componentId];
    if (!draft) return;
    await onUpdateComponent(componentId, {
      qty: Number(draft.qty),
      unit_override: draft.unit_override,
      unit_price_override: Number(draft.unit_price_override),
      is_visible: Boolean(draft.is_visible),
    });
  };

  const savePose = async () => {
    await onUpsertPose(item.id, {
      pose_type: poseDraft.pose_type,
      unit: poseDraft.unit,
      qty: Number(poseDraft.qty),
      unit_price: Number(poseDraft.unit_price),
      is_included: Boolean(poseDraft.is_included),
    });
  };

  const handleSaveAll = async (mode) => {
    setSaving(true);
    await onSaveAll(item.id, {
      item: {
        qty: Number(itemDraft.qty),
        unit_override: itemDraft.unit_override,
        unit_price_override: Number(itemDraft.unit_price_override),
        note_shared: itemDraft.note_shared,
      },
      pose: item.pose
        ? {
            pose_type: poseDraft.pose_type,
            unit: poseDraft.unit,
            qty: Number(poseDraft.qty),
            unit_price: Number(poseDraft.unit_price),
            is_included: Boolean(poseDraft.is_included),
          }
        : null,
    }, mode);
    setSaving(false);
  };

  if (!isOpen) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Prodotto</p>
            <h3 className="text-lg font-semibold">
              {item.product_code_snapshot} — {item.name_snapshot}
            </h3>
            <p className="text-xs text-slate-500">Categoria: {item.category_name_snapshot}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            Modifica
          </button>
        </div>
        <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">Qta</span>
            <p className="font-semibold text-slate-800">{item.qty}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">UM</span>
            <p className="font-semibold text-slate-800">{item.unit_override}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">Prezzo</span>
            <p className="font-semibold text-slate-800">{item.unit_price_override}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">Totale</span>
            <p className="font-semibold text-slate-800">{item.line_total}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Prodotto</p>
          <h3 className="text-lg font-semibold">
            {item.product_code_snapshot} — {item.name_snapshot}
          </h3>
          <p className="text-xs text-slate-500">Categoria: {item.category_name_snapshot}</p>
        </div>
          <button
            type="button"
            onClick={() => onDeleteItem(item.id)}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
          >
            Elimina riga
          </button>
        </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="text-sm">
          <span className="text-slate-600">Qta</span>
          <input
            type="number"
            step="0.01"
            value={itemDraft.qty}
            onChange={(event) =>
              setItemDraft((prev) => ({ ...prev, qty: event.target.value }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">UM</span>
          <select
            value={itemDraft.unit_override}
            onChange={(event) =>
              setItemDraft((prev) => ({ ...prev, unit_override: event.target.value }))
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
            value={itemDraft.unit_price_override}
            onChange={(event) =>
              setItemDraft((prev) => ({ ...prev, unit_price_override: event.target.value }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <div className="text-sm">
          <span className="text-slate-600">Totale riga</span>
          <p className="mt-2 text-base font-semibold text-slate-800">{item.line_total}</p>
        </div>
      </div>

      <label className="mt-4 block text-sm">
        <span className="text-slate-600">Note condivise</span>
        <textarea
          rows={3}
          value={itemDraft.note_shared}
          onChange={(event) =>
            setItemDraft((prev) => ({ ...prev, note_shared: event.target.value }))
          }
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Sottovoci</h4>
        {item.components && item.components.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">Qta</th>
                  <th className="px-3 py-2 font-medium">UM</th>
                  <th className="px-3 py-2 font-medium">Prezzo</th>
                  <th className="px-3 py-2 font-medium">Visibile</th>
                  <th className="px-3 py-2 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {item.components.map((component) => {
                  const draft = componentDrafts[component.id] || {};
                  return (
                    <tr key={component.id} className="border-t border-slate-200/60">
                      <td className="px-3 py-2 font-medium text-slate-700">
                        {component.name_snapshot}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={draft.qty ?? ''}
                          onChange={(event) =>
                            setComponentDrafts((prev) => ({
                              ...prev,
                              [component.id]: { ...prev[component.id], qty: event.target.value },
                            }))
                          }
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={draft.unit_override ?? 'ml'}
                          onChange={(event) =>
                            setComponentDrafts((prev) => ({
                              ...prev,
                              [component.id]: {
                                ...prev[component.id],
                                unit_override: event.target.value,
                              },
                            }))
                          }
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={draft.unit_price_override ?? ''}
                          onChange={(event) =>
                            setComponentDrafts((prev) => ({
                              ...prev,
                              [component.id]: {
                                ...prev[component.id],
                                unit_price_override: event.target.value,
                              },
                            }))
                          }
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={Boolean(draft.is_visible)}
                          onChange={(event) =>
                            setComponentDrafts((prev) => ({
                              ...prev,
                              [component.id]: {
                                ...prev[component.id],
                                is_visible: event.target.checked,
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => saveComponent(component.id)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                        >
                          Salva
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nessuna sottovoce per questa riga.</p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">Posa</h4>
          {item.pose ? (
            <button
              type="button"
              onClick={() => onDeletePose(item.id)}
              className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-600"
            >
              Rimuovi posa
            </button>
          ) : (
            <button
              type="button"
              onClick={savePose}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600"
            >
              Aggiungi posa
            </button>
          )}
        </div>

        {item.pose ? (
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="text-slate-600">Tipo</span>
              <select
                value={poseDraft.pose_type}
                onChange={(event) =>
                  setPoseDraft((prev) => ({ ...prev, pose_type: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                {poseTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-slate-600">UM</span>
              <select
                value={poseDraft.unit}
                onChange={(event) =>
                  setPoseDraft((prev) => ({ ...prev, unit: event.target.value }))
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
              <span className="text-slate-600">Qta</span>
              <input
                type="number"
                step="0.01"
                value={poseDraft.qty}
                onChange={(event) =>
                  setPoseDraft((prev) => ({ ...prev, qty: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="text-slate-600">Prezzo</span>
              <input
                type="number"
                step="0.01"
                value={poseDraft.unit_price}
                onChange={(event) =>
                  setPoseDraft((prev) => ({ ...prev, unit_price: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(poseDraft.is_included)}
                onChange={(event) =>
                  setPoseDraft((prev) => ({ ...prev, is_included: event.target.checked }))
                }
              />
              <span className="text-slate-600">Compreso</span>
            </label>
            <div className="flex items-end" />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nessuna posa associata.</p>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => handleSaveAll('update')}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-60"
        >
          Aggiorna
        </button>
        <button
          type="button"
          onClick={() => handleSaveAll('save')}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Salva
        </button>
      </div>
    </div>
  );
}

export default function QuoteBuilderPage() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [openItemId, setOpenItemId] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    discount_type: 'none',
    discount_value: '',
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  const loadQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchQuote(quoteId);
      const data = response.data ?? response;
      setQuote(data);
      setPricingForm({
        discount_type: data.discount_type ?? 'none',
        discount_value:
          data.discount_value !== null && data.discount_value !== undefined
            ? String(data.discount_value)
            : '',
      });
    } catch (err) {
      setError(err?.message || 'Errore nel caricamento preventivo.');
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  useEffect(() => {
    if (!quote?.items?.length) return;
    if (openItemId === null) {
      setOpenItemId(quote.items[0].id);
    }
  }, [quote, openItemId]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await fetchProducts({ q: searchQuery, perPage: 10, page: 1 });
      setSearchResults(response.data || []);
    } catch (err) {
      setSearchError(err?.message || 'Errore nella ricerca prodotti.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddProduct = async (productId) => {
    if (!quote) return;
    setAdding(true);
    try {
      await createQuoteItem(quote.id, { product_id: productId, qty: 1 });
      await loadQuote();
    } catch (err) {
      setError(err?.message || 'Errore durante aggiunta prodotto.');
    } finally {
      setAdding(false);
    }
  };

  const updateItem = async (itemId, payload) => {
    try {
      await updateQuoteItem(itemId, payload);
      await loadQuote();
    } catch (err) {
      setError(err?.message || 'Errore durante aggiornamento riga.');
    }
  };

  const updateComponent = async (componentId, payload) => {
    try {
      await updateQuoteItemComponent(componentId, payload);
      await loadQuote();
    } catch (err) {
      setError(err?.message || 'Errore durante aggiornamento componente.');
    }
  };

  const upsertPose = async (itemId, payload) => {
    try {
      await upsertQuoteItemPose(itemId, payload);
      await loadQuote();
    } catch (err) {
      setError(err?.message || 'Errore durante aggiornamento posa.');
    }
  };

  const removePose = async (itemId) => {
    try {
      await deleteQuoteItemPose(itemId);
      await loadQuote();
    } catch (err) {
      setError(err?.message || 'Errore durante rimozione posa.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await deleteQuoteItem(itemId);
      await loadQuote();
      if (openItemId === itemId) {
        setOpenItemId(null);
      }
    } catch (err) {
      setError(err?.message || 'Errore durante eliminazione riga.');
    }
  };

  const saveAll = async (itemId, payload, mode) => {
    try {
      await updateQuoteItem(itemId, payload.item);
      if (payload.pose) {
        await upsertQuoteItemPose(itemId, payload.pose);
      }
      await loadQuote();
      if (mode === 'save') {
        setOpenItemId(null);
      }
    } catch (err) {
      setError(err?.message || 'Errore durante aggiornamento riga.');
    }
  };

  const sortedItems = useMemo(() => {
    if (!quote?.items) return [];
    return [...quote.items].sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));
  }, [quote]);

  const totals = quote
    ? {
        subtotal: Number(quote.subtotal ?? 0),
        discount_amount: Number(quote.discount_amount ?? 0),
        taxable_total: Number(quote.taxable_total ?? 0),
        vat_amount: Number(quote.vat_amount ?? 0),
        grand_total: Number(quote.grand_total ?? 0),
      }
    : null;

  const formatMoney = (value) => value.toFixed(2);

  const handlePricingSubmit = async (event) => {
    event.preventDefault();
    if (!quote) return;

    setPricingSaving(true);
    setPricingError(null);

    const payload = {
      discount_type: pricingForm.discount_type === 'none' ? null : pricingForm.discount_type,
      discount_value:
        pricingForm.discount_value === '' ? null : Number(pricingForm.discount_value),
    };

    try {
      const response = await updateQuotePricing(quote.id, payload);
      const data = response.data ?? response;
      setQuote((prev) => {
        if (!prev) return data;
        return {
          ...prev,
          ...data,
          items: data.items ?? prev.items,
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

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Builder</p>
        <h1 className="text-2xl font-semibold">Preventivo</h1>
        {quote ? (
          <p className="text-sm text-slate-500">
            PROT: {quote.prot_display || '—'} — {quote.customer_title_snapshot}
          </p>
        ) : null}
      </header>

      {loading ? <p className="text-sm text-slate-500">Caricamento preventivo...</p> : null}
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Aggiungi prodotto</h2>
        <form onSubmit={handleSearchSubmit} className="mt-3 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cerca prodotto per codice o nome..."
            className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {searchLoading ? 'Ricerca...' : 'Cerca'}
          </button>
        </form>
        {searchError ? <p className="mt-2 text-sm text-amber-700">{searchError}</p> : null}
        {searchResults.length ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Codice</th>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">Prezzo</th>
                  <th className="px-3 py-2 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200/60">
                    <td className="px-3 py-2 font-medium">{product.code}</td>
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2">{product.price_default}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product.id)}
                        disabled={adding}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 disabled:opacity-60"
                      >
                        Aggiungi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Righe preventivo</h2>
        {!loading && sortedItems.length === 0 ? (
          <p className="text-sm text-slate-500">Nessuna riga presente.</p>
        ) : null}
        {sortedItems.map((item) => (
          <QuoteItemCard
            key={item.id}
            item={item}
            isOpen={openItemId === item.id}
            onOpen={(id) => setOpenItemId(id)}
            onUpdateItem={updateItem}
            onDeleteItem={removeItem}
            onUpdateComponent={updateComponent}
            onUpsertPose={upsertPose}
            onDeletePose={removePose}
            onSaveAll={saveAll}
          />
        ))}
      </section>

      <div className="sticky bottom-0 z-20 -mx-6 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Subtotale</p>
              <p className="text-lg font-semibold">
                {totals ? formatMoney(totals.subtotal) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Sconto</p>
              <p className="text-lg font-semibold">
                {totals ? formatMoney(totals.discount_amount) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Imponibile</p>
              <p className="text-lg font-semibold">
                {totals ? formatMoney(totals.taxable_total) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Totale</p>
              <p className="text-lg font-semibold">
                {totals ? formatMoney(totals.grand_total) : '0.00'}
              </p>
            </div>
          </div>

          <form onSubmit={handlePricingSubmit} className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="text-slate-600">Tipo sconto</span>
              <select
                value={pricingForm.discount_type}
                onChange={(event) =>
                  setPricingForm((prev) => ({ ...prev, discount_type: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="none">Nessuno</option>
                <option value="percent">Percentuale</option>
                <option value="amount">Importo</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-slate-600">Valore sconto</span>
              <input
                type="number"
                step="0.01"
                value={pricingForm.discount_value}
                onChange={(event) =>
                  setPricingForm((prev) => ({ ...prev, discount_value: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={pricingSaving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pricingSaving ? 'Salvataggio...' : 'Applica'}
              </button>
              {pricingError ? (
                <span className="text-xs text-amber-700">{pricingError}</span>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

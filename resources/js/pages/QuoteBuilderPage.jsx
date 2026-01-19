import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  saveQuoteRevision,
} from '../api/client';
import TotalsPanel from '../components/TotalsPanel';
import { protForUi } from '../lib/prot';
import { formatMoney } from '../lib/formatters';

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
  onRegisterSave,
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
  const [saveError, setSaveError] = useState(null);

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

  const savePose = async () => {
    await onUpsertPose(item.id, {
      pose_type: poseDraft.pose_type,
      unit: poseDraft.unit,
      qty: Number(poseDraft.qty),
      unit_price: Number(poseDraft.unit_price),
      is_included: Boolean(poseDraft.is_included),
    });
  };

  const normalizeNumber = (value) => Number(value || 0);
  const componentTotals = (item.components || []).map((component) => {
    const draft = componentDrafts[component.id] || {};
    const qty = normalizeNumber(draft.qty);
    const price = normalizeNumber(draft.unit_price_override);
    const isVisible = Boolean(draft.is_visible);
    return {
      id: component.id,
      total: isVisible ? qty * price : 0,
    };
  });

  const componentsTotal = componentTotals.reduce((sum, row) => sum + row.total, 0);
  const poseTotal = item.pose
    ? poseDraft.is_included
      ? 0
      : normalizeNumber(poseDraft.qty) * normalizeNumber(poseDraft.unit_price)
    : 0;
  const itemTotal = normalizeNumber(itemDraft.qty) * normalizeNumber(itemDraft.unit_price_override);
  const cardTotal = itemTotal + componentsTotal + poseTotal;

  const handleSaveAll = useCallback(async (mode) => {
    setSaving(true);
    setSaveError(null);
    await onSaveAll(
      item.id,
      {
        item: {
          qty: Number(itemDraft.qty),
          unit_override: itemDraft.unit_override,
          unit_price_override: Number(itemDraft.unit_price_override),
          note_shared: itemDraft.note_shared,
        },
        components: (item.components || []).map((component) => {
          const draft = componentDrafts[component.id] || {};
          return {
            id: component.id,
            payload: {
              qty: Number(draft.qty),
              unit_override: draft.unit_override,
              unit_price_override: Number(draft.unit_price_override),
              is_visible: Boolean(draft.is_visible),
            },
          };
        }),
        pose: item.pose
          ? {
              pose_type: poseDraft.pose_type,
              unit: poseDraft.unit,
              qty: Number(poseDraft.qty),
              unit_price: Number(poseDraft.unit_price),
              is_included: Boolean(poseDraft.is_included),
            }
          : null,
      },
      mode,
      setSaveError
    );
    setSaving(false);
  }, [item.id, item.components, item.pose, itemDraft, componentDrafts, poseDraft, onSaveAll]);

  useEffect(() => {
    if (onRegisterSave) {
      onRegisterSave(item.id, handleSaveAll);
      return () => onRegisterSave(item.id, null);
    }
    return undefined;
  }, [item.id, handleSaveAll, onRegisterSave]);

  if (!isOpen) {
    const collapsedComponentsTotal = (item.components || []).reduce((sum, component) => {
      if (!component.is_visible) {
        return sum;
      }
      const qty = normalizeNumber(component.qty);
      const price = normalizeNumber(component.unit_price_override);
      return sum + qty * price;
    }, 0);
    const collapsedPoseTotal = item.pose
      ? item.pose.is_included
        ? 0
        : normalizeNumber(item.pose.qty) * normalizeNumber(item.pose.unit_price)
      : 0;
    const collapsedItemTotal =
      normalizeNumber(item.qty) * normalizeNumber(item.unit_price_override);
    const collapsedTotal = collapsedItemTotal + collapsedComponentsTotal + collapsedPoseTotal;

    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-500">PRODOTTO</p>
            <h3 className="text-lg font-semibold truncate">
              {item.product_code_snapshot} — {item.name_snapshot}
            </h3>
            <p className="text-xs text-slate-500">Categoria: {item.category_name_snapshot}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <div className="whitespace-nowrap">
              <span className="text-xs uppercase tracking-wide text-slate-500">TOTALE RIGA</span>
              <p className="text-sm font-semibold text-slate-800">{formatMoney(collapsedTotal)}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Modifica
            </button>
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
          <span className="text-slate-600">Qtà</span>
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
          <p className="mt-2 text-base font-semibold text-slate-800">{formatMoney(item.line_total)}</p>
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
                  <th className="px-3 py-2 font-medium">Qtà</th>
                  <th className="px-3 py-2 font-medium">UM</th>
                  <th className="px-3 py-2 font-medium">Prezzo</th>
                  <th className="px-3 py-2 font-medium">Totale</th>
                  <th className="px-3 py-2 font-medium">Visibile</th>
                </tr>
              </thead>
              <tbody>
                {item.components.map((component) => {
                  const draft = componentDrafts[component.id] || {};
                  const rowTotal =
                    draft.is_visible
                      ? normalizeNumber(draft.qty) * normalizeNumber(draft.unit_price_override)
                      : 0;
                  return (
                    <tr
                      key={component.id}
                      className={[
                        'border-t border-slate-200/60',
                        draft.is_visible ? 'text-slate-700' : 'bg-slate-50 text-slate-400',
                      ].join(' ')}
                    >
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
                      <td className="px-3 py-2 text-slate-600">{formatMoney(rowTotal)}</td>
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
              <span className="text-slate-600">Qtà</span>
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
            <div className="text-sm">
              <span className="text-slate-600">Totale posa</span>
              <p className="mt-2 font-semibold text-slate-800">{formatMoney(poseTotal)}</p>
            </div>
            <div className="flex items-end" />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nessuna posa associata.</p>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <div className="mr-auto text-sm">
          <span className="text-slate-600">Totale prodotto</span>
          <p className="mt-1 text-lg font-semibold text-slate-800">{formatMoney(cardTotal)}</p>
        </div>
        {saveError ? <span className="text-xs text-amber-700">{saveError}</span> : null}
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
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [openItemId, setOpenItemId] = useState(null);
  const saveHandlersRef = useRef({});
  const [pricingForm, setPricingForm] = useState({
    discount_type: 'none',
    discount_value: '',
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState(null);
  const [closeSaving, setCloseSaving] = useState(false);
  const [closeError, setCloseError] = useState(null);

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
    if (openItemId !== null && !quote.items.some((item) => item.id === openItemId)) {
      setOpenItemId(null);
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
      if (openItemId !== null) {
        const saveHandler = saveHandlersRef.current[openItemId];
        if (saveHandler) {
          await saveHandler('save');
        }
      }

      const response = await createQuoteItem(quote.id, { product_id: productId, qty: 1 });
      const createdItem =
        response.item?.data ?? response.item ?? response.data?.item ?? response.data ?? null;
      await loadQuote();
      if (createdItem?.id) {
        setOpenItemId(createdItem.id);
      } else {
        setOpenItemId(null);
      }
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

  const saveAll = async (itemId, payload, mode, setLocalError) => {
    try {
      await updateQuoteItem(itemId, payload.item);
      if (payload.components?.length) {
        for (const component of payload.components) {
          await updateQuoteItemComponent(component.id, component.payload);
        }
      }
      if (payload.pose) {
        await upsertQuoteItemPose(itemId, payload.pose);
      }
      await loadQuote();
      if (mode === 'save') {
        setOpenItemId(null);
      }
    } catch (err) {
      setLocalError?.(err?.message || 'Errore durante aggiornamento riga.');
      setError(err?.message || 'Errore durante aggiornamento riga.');
    }
  };

  const registerSaveHandler = useCallback((itemId, handler) => {
    if (handler) {
      saveHandlersRef.current[itemId] = handler;
    } else {
      delete saveHandlersRef.current[itemId];
    }
  }, []);

  const sortedItems = useMemo(() => {
    if (!quote?.items) return [];
    return [...quote.items].sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));
  }, [quote]);

  const groupedItems = useMemo(() => {
    const map = new Map();
    sortedItems.forEach((item) => {
      const key = item.category_name_snapshot || 'Senza categoria';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });
    const categories = Array.from(map.keys());
    const colorMap = new Map();
    categories.forEach((category, index) => {
      const hue = Math.round((index * 360) / Math.max(categories.length, 1));
      colorMap.set(category, hue);
    });
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
      color: colorMap.get(category),
    }));
  }, [sortedItems]);

  const totals = quote
    ? {
        subtotal: Number(quote.subtotal ?? 0),
        discount_amount: Number(quote.discount_amount ?? 0),
        taxable_total: Number(quote.taxable_total ?? 0),
        vat_amount: Number(quote.vat_amount ?? 0),
        grand_total: Number(quote.grand_total ?? 0),
      }
    : null;

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

  const getListPath = (type) => {
    const key = String(type || '').toLowerCase();
    if (key === 'fp') return '/preventivi/fp';
    if (key === 'as') return '/preventivi/as';
    if (key === 'vm') return '/preventivi/vm';
    return '/preventivi/fp';
  };

  const handleSaveAndClose = async () => {
    if (!quote) return;
    setCloseSaving(true);
    setCloseError(null);
    try {
      const response = await saveQuoteRevision(quote.id);
      const data = response.data ?? response;
      setQuote((prev) => (prev ? { ...prev, ...data } : data));
      navigate(getListPath(quote.quote_type));
    } catch (err) {
      setCloseError(err?.message || 'Errore durante salvataggio revisione.');
    } finally {
      setCloseSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">Builder</p>
          <h1 className="text-2xl font-semibold">Preventivo</h1>
          {quote ? (
            <p className="text-sm text-slate-500">
              PROT: {protForUi(quote) || '—'} — {quote.customer_title_snapshot}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleSaveAndClose}
          disabled={!quote || closeSaving}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          {closeSaving ? 'Salvataggio...' : 'Salva e chiudi'}
        </button>
      </header>
      {closeError ? <p className="text-sm text-rose-600">{closeError}</p> : null}

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
        {groupedItems.map((group) => (
          <div key={group.category} className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: `hsl(${group.color} 70% 45%)` }}
              />
              <h3 className="text-sm font-semibold text-slate-700">{group.category}</h3>
            </div>
            {group.items.map((item) => (
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
                onRegisterSave={registerSaveHandler}
              />
            ))}
          </div>
        ))}
      </section>

      <TotalsPanel
        totals={totals}
        pricingForm={pricingForm}
        onPricingChange={setPricingForm}
        onSubmit={handlePricingSubmit}
        saving={pricingSaving}
        error={pricingError}
        secondaryAction={
          <button
            type="button"
            onClick={() => navigate(`/builder/${quoteId}/extras`)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Continua
          </button>
        }
      />
    </section>
  );
}

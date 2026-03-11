import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createQuoteCategoryItems,
  deleteQuoteItem,
  duplicateQuoteItem,
  fetchProductCategories,
  fetchQuote,
  updateQuoteItem,
  updateQuoteItemComponent,
  updateQuotePricing,
} from '../api/client';
import QuoteInfoModal from '../components/QuoteInfoModal';
import TotalsPanel from '../components/TotalsPanel';
import { protForUi } from '../lib/prot';
import { formatMoney } from '../lib/formatters';

const unitOptions = ['pz', 'mq', 'nº', 'ml', 'mc', 'cad.', 'kg.'];

const normalizeUnit = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  const map = { cad: 'cad.', kg: 'kg.', intervento: 'nº' };
  const unit = map[normalized] || normalized;
  return unitOptions.includes(unit) ? unit : 'ml';
};

const renderProductName = (item) => {
  if (item?.name_snapshot_html) {
    return <span dangerouslySetInnerHTML={{ __html: item.name_snapshot_html }} />;
  }
  return <span>{item?.name_snapshot || '—'}</span>;
};

function QuoteItemCard({
  item,
  isOpen,
  onOpen,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  duplicating,
  onUpdateComponent,
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
  const itemTotal = normalizeNumber(itemDraft.qty) * normalizeNumber(itemDraft.unit_price_override);
  const cardTotal = itemTotal + componentsTotal;

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
      },
      mode,
      setSaveError
    );
    setSaving(false);
  }, [item.id, item.components, itemDraft, componentDrafts, onSaveAll]);

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
    const collapsedItemTotal =
      normalizeNumber(item.qty) * normalizeNumber(item.unit_price_override);
    const collapsedTotal = collapsedItemTotal + collapsedComponentsTotal;

    return (
      <div className="w-full rounded-3xl border border-slate-200/70 bg-white text-left shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            className="flex min-w-0 flex-1 items-center justify-between gap-4 p-5 text-left cursor-pointer"
          >
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-500">PRODOTTO</p>
            <h3 className="text-lg font-semibold truncate">
              {item.product_code_snapshot} — {renderProductName(item)}
            </h3>
            <p className="text-xs text-slate-500">Categoria: {item.category_name_snapshot}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <div className="whitespace-nowrap">
              <span className="text-xs uppercase tracking-wide text-slate-500">TOTALE RIGA</span>
              <p className="text-sm font-semibold text-slate-800">{formatMoney(collapsedTotal)}</p>
            </div>
          </div>
          </button>
          <div className="m-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicateItem(item.id)}
              title="Duplica"
              aria-label="Duplica riga"
              disabled={duplicating}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              title="Elimina"
              aria-label="Elimina riga"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
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
            {item.product_code_snapshot} — {renderProductName(item)}
          </h3>
          <p className="text-xs text-slate-500">Categoria: {item.category_name_snapshot}</p>
        </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDuplicateItem(item.id)}
              disabled={duplicating}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
            >
              Duplica
            </button>
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
            >
              Elimina riga
            </button>
          </div>
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
          <p className="mt-2 text-base font-semibold text-slate-800">{formatMoney(itemTotal)}</p>
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

      <div className="mt-4 flex justify-end gap-2">
        <div className="mr-auto text-sm">
          <span className="text-slate-600">Totale prodotto</span>
          <p className="mt-1 text-lg font-semibold text-slate-800">{formatMoney(cardTotal)}</p>
        </div>
        {saveError ? <span className="text-xs text-amber-700">{saveError}</span> : null}
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
  const isFirstSearch = useRef(true);
  const [adding, setAdding] = useState(false);
  const [openItemId, setOpenItemId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const itemRefs = useRef({});
  const saveHandlersRef = useRef({});
  const existingProductIds = useMemo(() => {
    const ids = new Set();
    (quote?.items || []).forEach((item) => {
      const id = item?.product_id ?? item?.product?.id ?? null;
      if (id) ids.add(id);
    });
    return ids;
  }, [quote?.items]);
  const [pricingForm, setPricingForm] = useState({
    discount_type: 'none',
    discount_value: '',
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

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

  useEffect(() => {
    if (!openItemId) return;
    const target = itemRefs.current[openItemId];
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [openItemId, quote?.items?.length]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    const term = searchQuery.trim();
    if (!term) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await fetchProductCategories({ q: term, perPage: 10 });
        setSearchResults(response.data || response || []);
      } catch (err) {
        setSearchError(err?.message || 'Errore nella ricerca categorie.');
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddCategory = async (categoryName) => {
    if (!quote) return;
    setAdding(true);
    try {
      if (openItemId !== null) {
        const saveHandler = saveHandlersRef.current[openItemId];
        if (saveHandler) {
          await saveHandler('save');
        }
      }

      const response = await createQuoteCategoryItems(quote.id, { category_name: categoryName });
      await loadQuote();
      if (!response?.added) {
        setOpenItemId(null);
      }
    } catch (err) {
      setError(err?.message || 'Errore durante aggiunta categoria.');
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

  const renderProductName = (item) => {
    if (item?.name_snapshot_html) {
      return <span dangerouslySetInnerHTML={{ __html: item.name_snapshot_html }} />;
    }
    return <span>{item?.name_snapshot || '—'}</span>;
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

  const duplicateItem = async (itemId) => {
    if (duplicatingId) return;
    try {
      setDuplicatingId(itemId);
      if (openItemId !== null) {
        const saveHandler = saveHandlersRef.current[openItemId];
        if (saveHandler) {
          await saveHandler('save');
        }
      }
      const response = await duplicateQuoteItem(itemId);
      const createdItem =
        response.item?.data ?? response.item ?? response.data?.item ?? response.data ?? null;
      await loadQuote();
      if (createdItem?.id) {
        setOpenItemId(createdItem.id);
      }
    } catch (err) {
      setError(err?.message || 'Errore durante duplicazione riga.');
    } finally {
      setDuplicatingId(null);
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
    categories.forEach((category) => {
      colorMap.set(category, '#95817b');
    });
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) =>
        String(a.product_code_snapshot || '').localeCompare(
          String(b.product_code_snapshot || ''),
          'it',
          { numeric: true }
        )
      ),
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

  return (
    <section className="space-y-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-slate-500">Builder</div>
          <h1 className="text-3xl font-semibold leading-tight">Preventivo</h1>
          {quote ? (
            <p className="text-sm text-slate-600 leading-snug">
              PROT: {protForUi(quote) || '—'} — {quote.customer_title_snapshot}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInfoModalOpen(true)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Modifica info
          </button>
          <button
            type="button"
            onClick={() => navigate(`/builder/${quoteId}/extras`)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Continua
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Caricamento preventivo...</p> : null}
      {error ? <p className="text-sm text-amber-700">{error}</p> : null}

      <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Aggiungi categoria</h2>
        <form onSubmit={handleSearchSubmit} className="mt-3 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cerca categoria per nome..."
            className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          {searchLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Ricerca...
            </div>
          ) : null}
          {adding ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Aggiunta categoria...
            </div>
          ) : null}
        </form>
        {searchError ? <p className="mt-2 text-sm text-amber-700">{searchError}</p> : null}
      {searchResults.length ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Categoria</th>
                  <th className="px-3 py-2 font-medium">Prodotti</th>
                  <th className="px-3 py-2 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((category) => {
                  const productIds = category.product_ids || [];
                  const missingIds = productIds.filter((id) => !existingProductIds.has(id));
                  const isComplete = productIds.length > 0 && missingIds.length === 0;
                  const isPartial = productIds.length > 0 && missingIds.length < productIds.length;
                  return (
                    <tr
                      key={category.name}
                      className={`border-t border-slate-200/60 ${
                        isComplete ? 'bg-slate-50 text-slate-400' : ''
                      }`}
                    >
                      <td className="px-3 py-2 font-medium">{category.name}</td>
                      <td className="px-3 py-2">{category.product_count}</td>
                      <td className="px-3 py-2">
                        {isComplete ? (
                          <span className="text-xs font-semibold text-slate-400">Già presente</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddCategory(category.name)}
                            disabled={adding}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 disabled:opacity-60"
                          >
                            {isPartial ? 'Riaggiungi' : 'Aggiungi'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : searchQuery.trim() && !searchLoading ? (
          <p className="mt-4 text-sm text-slate-500">Nessuna categoria trovata.</p>
        ) : null}
      </section>
      <QuoteInfoModal
        open={infoModalOpen}
        quote={quote}
        onClose={() => setInfoModalOpen(false)}
        onSaved={(data) => {
          setQuote((prev) => (prev ? { ...prev, ...data } : data));
          setInfoModalOpen(false);
        }}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Righe preventivo</h2>
        {!loading && sortedItems.length === 0 ? (
          <p className="text-sm text-slate-500">Nessuna riga presente.</p>
        ) : null}
        {groupedItems.map((group) => (
          <div key={group.category} className="space-y-3">
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{ backgroundColor: group.color }}
            >
              <h3 className="text-lg font-regular text-white">{group.category}</h3>
            </div>
            {group.items.map((item) => (
              <div
                key={item.id}
                ref={(node) => {
                  if (node) itemRefs.current[item.id] = node;
                }}
              >
                <QuoteItemCard
                  item={item}
                  isOpen={openItemId === item.id}
                  onOpen={(id) => setOpenItemId(id)}
                  onUpdateItem={updateItem}
                  onDeleteItem={removeItem}
                  onDuplicateItem={duplicateItem}
                  duplicating={duplicatingId === item.id}
                  onUpdateComponent={updateComponent}
                  onSaveAll={saveAll}
                  onRegisterSave={registerSaveHandler}
                />
              </div>
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
        showDiscount
        showDiscountForm={false}
      />
    </section>
  );
}

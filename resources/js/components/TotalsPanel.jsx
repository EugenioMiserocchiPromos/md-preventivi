import React from 'react';
import { formatMoney } from '../lib/formatters';

export default function TotalsPanel({
  totals,
  pricingForm,
  onPricingChange,
  onSubmit,
  saving,
  error,
  showDiscount = true,
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto max-w-5xl space-y-4">
        <div
          className={
            showDiscount
              ? 'flex flex-wrap items-start justify-between gap-4'
              : 'flex flex-wrap items-start justify-between gap-4'
          }
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Subtotale</p>
            <p className="text-lg font-semibold">
              {totals ? formatMoney(totals.subtotal) : formatMoney(0)}
            </p>
          </div>
          {showDiscount ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Sconto</p>
              <p className="text-lg font-semibold">
                {totals ? formatMoney(totals.discount_amount) : formatMoney(0)}
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Totale</p>
            <p className="text-lg font-semibold">
              {totals ? formatMoney(totals.grand_total) : formatMoney(0)}
            </p>
          </div>
        </div>

        {showDiscount ? (
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-slate-600">Tipo sconto</span>
              <select
                value={pricingForm.discount_type}
                onChange={(event) =>
                  onPricingChange((prev) => ({ ...prev, discount_type: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="none">Nessuno</option>
                <option value="percent">Percentuale</option>
                <option value="amount">Importo</option>
              </select>
            </label>
            <div className="text-sm">
              <span className="text-slate-600">Valore sconto</span>
              <div className="mt-1 flex">
                <input
                  type="number"
                  step="0.01"
                  value={pricingForm.discount_value}
                  onChange={(event) =>
                    onPricingChange((prev) => ({ ...prev, discount_value: event.target.value }))
                  }
                  className="w-full rounded-l-xl border border-slate-200 px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-r-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Salvataggio...' : 'Applica'}
                </button>
              </div>
            </div>
          </form>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}

import React from 'react';
import { formatMoney } from '../lib/formatters';
import { protForUi } from '../lib/prot';

function QuoteRow({ row, onOpen }) {
  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="grid grid-cols-1 gap-y-2 gap-x-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">PROT</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="font-medium">{protForUi(row) || '—'}</p>
            <p
              className="truncate text-sm text-slate-600"
              title={row.customer_title_snapshot || ''}
            >
              {row.customer_title_snapshot || '—'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 md:text-right">Totale</p>
          <p className="text-left md:text-right font-semibold tabular-nums whitespace-nowrap">
            {formatMoney(row.grand_total)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Cantiere</p>
          <p className="truncate" title={row.cantiere || ''}>
            {row.cantiere || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 md:text-right">Data</p>
          <p className="text-left md:text-right tabular-nums whitespace-nowrap">
            {row.date || '—'}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Titolo</p>
          <p className="line-clamp-2 text-sm" title={row.title_text || ''}>
            {row.title_text || '—'}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onOpen(row.id)}
            title="Modifica"
            aria-label="Modifica preventivo"
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuoteList({ rows, onOpen }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <QuoteRow key={row.id} row={row} onOpen={onOpen} />
      ))}
    </div>
  );
}

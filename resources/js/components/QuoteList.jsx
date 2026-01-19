import React from 'react';
import { formatMoney } from '../lib/formatters';
import { protForUi } from '../lib/prot';

function QuoteListHeader() {
  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-[20%_40%_40%] gap-3 text-xs uppercase tracking-wide text-slate-500">
        <span>PROT</span>
        <span>Cliente</span>
        <span>Cantiere</span>
      </div>
      <div className="mt-2 grid grid-cols-[50%_15%_15%_15%] gap-3 text-xs uppercase tracking-wide text-slate-500">
        <span>Titolo</span>
        <span className="text-right">Totale</span>
        <span className="text-right">Data</span>
        <span className="text-right">Azioni</span>
      </div>
    </div>
  );
}

function QuoteRow({ row, onOpen }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm transition hover:shadow-md">
      <div className="space-y-3 md:space-y-2">
        <div className="md:hidden space-y-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">PROT</p>
            <p className="font-medium">{protForUi(row) || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Cliente</p>
            <p>{row.customer_title_snapshot || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Cantiere</p>
            <p>{row.cantiere || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Titolo</p>
            <p>{row.title_text || '—'}</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Totale</p>
              <p className="font-semibold">{formatMoney(row.grand_total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">Data</p>
              <p className="tabular-nums">{row.date || '—'}</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                title="Apri preventivo"
                aria-label="Apri preventivo"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900"
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

        <div className="hidden md:grid md:grid-cols-[20%_40%_40%] md:gap-3 md:items-start text-sm">
          <p className="font-medium">{protForUi(row) || '—'}</p>
          <p className="truncate" title={row.customer_title_snapshot || ''}>
            {row.customer_title_snapshot || '—'}
          </p>
          <p className="truncate" title={row.cantiere || ''}>
            {row.cantiere || '—'}
          </p>
        </div>
        <div className="hidden md:grid md:grid-cols-[50%_15%_15%_15%] md:gap-3 md:items-end">
          <p className="truncate text-sm" title={row.title_text || ''}>
            {row.title_text || '—'}
          </p>
          <p className="text-right text-sm font-semibold tabular-nums">
            {formatMoney(row.grand_total)}
          </p>
          <p className="text-right text-sm tabular-nums">{row.date || '—'}</p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onOpen(row.id)}
              title="Apri preventivo"
              aria-label="Apri preventivo"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900"
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
    </div>
  );
}

export default function QuoteList({ rows, onOpen }) {
  return (
    <div className="space-y-3">
      <QuoteListHeader />
      {rows.map((row) => (
        <QuoteRow key={row.id} row={row} onOpen={onOpen} />
      ))}
    </div>
  );
}

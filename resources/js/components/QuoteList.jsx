import React, { useState } from 'react';
import { formatMoney } from '../lib/formatters';
import { protForUi } from '../lib/prot';

function QuoteRow({ row, onOpen }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/quotes/${row.id}/pdf/full`, {
        headers: { Accept: 'application/pdf' },
      });

      if (!response.ok) {
        throw new Error('Download non riuscito.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filenameBase = `Preventivo-${row.prot_display || row.id}`
        .toString()
        .replace(/\//g, '-')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filenameBase || 'preventivo'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {downloading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              Download PDF in corso...
            </div>
          </div>
        </div>
      ) : null}
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDownload}
            title="Scarica PDF"
            aria-label="Scarica PDF preventivo"
            disabled={downloading}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60"
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
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </button>
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
    </>
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

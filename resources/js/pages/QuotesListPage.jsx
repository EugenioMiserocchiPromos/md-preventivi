import React from 'react';

const headers = ['PROT', 'Cliente', 'Titolo', 'Totale', 'Data', 'Azioni'];

const mockRowsByType = {
  FP: [
    {
      prot: 'MD/FP 0001-26',
      cliente: 'Edil Casa Srl',
      titolo: 'Ristrutturazione Cucina',
      totale: '€ 12.450,00',
      data: '12/02/2026',
    },
  ],
  AS: [
    {
      prot: 'MD/AS 0002-26',
      cliente: 'Condominio Aurora',
      titolo: 'Assistenza Impianto',
      totale: '€ 980,00',
      data: '18/02/2026',
    },
  ],
  VM: [
    {
      prot: 'MD/VM 0003-26',
      cliente: 'Ferramenta Riva',
      titolo: 'Vendita Materiale',
      totale: '€ 2.150,00',
      data: '21/02/2026',
    },
  ],
};

export default function QuotesListPage({ type, label }) {
  const rows = mockRowsByType[type] ?? [];

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Lista preventivi</p>
        <h2 className="text-xl font-semibold">
          {label} <span className="text-slate-500">({type})</span>
        </h2>
      </header>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={headers.length}>
                  Nessun preventivo per ora. Placeholder UI.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.prot} className="border-t border-slate-200/60 text-slate-700">
                  <td className="px-4 py-3 font-medium">{row.prot}</td>
                  <td className="px-4 py-3">{row.cliente}</td>
                  <td className="px-4 py-3">{row.titolo}</td>
                  <td className="px-4 py-3">{row.totale}</td>
                  <td className="px-4 py-3">{row.data}</td>
                  <td className="px-4 py-3 text-slate-400">--</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

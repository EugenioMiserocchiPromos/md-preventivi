import React, { useState } from 'react';
import { uploadFile } from '../api/client';

const initialState = {
  loading: false,
  result: null,
  error: null,
};

function ResultSummary({ result }) {
  if (!result) return null;

  const errors = Array.isArray(result.errors) ? result.errors.slice(0, 5) : [];

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-700">
      <div className="flex flex-wrap gap-3">
        <span>Creati: {result.created ?? 0}</span>
        {typeof result.updated === 'number' ? <span>Aggiornati: {result.updated}</span> : null}
        <span>Saltati: {result.skipped ?? 0}</span>
      </div>
      {errors.length ? (
        <ul className="space-y-1 text-xs text-amber-700">
          {errors.map((item, index) => (
            <li key={`${item.row}-${index}`}>Riga {item.row}: {item.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ImportSection({ title, description, endpoint }) {
  const [file, setFile] = useState(null);
  const [state, setState] = useState(initialState);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setState({ loading: false, result: null, error: 'Seleziona un file CSV.' });
      return;
    }

    setState({ loading: true, result: null, error: null });
    try {
      const result = await uploadFile(endpoint, file);
      setState({ loading: false, result, error: null });
    } catch (error) {
      setState({
        loading: false,
        result: null,
        error: error?.message || 'Import non riuscito.',
      });
    }
  };

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 text-sm">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={state.loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {state.loading ? 'Import in corso...' : 'Importa'}
        </button>
      </form>
      {state.error ? <p className="text-sm text-amber-700">{state.error}</p> : null}
      <ResultSummary result={state.result} />
    </section>
  );
}

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
        <h1 className="text-2xl font-semibold">Import CSV</h1>
        <p className="text-sm text-slate-500">
          Carica i template CSV per aggiornare il listino prodotti e le componenti.
        </p>
      </header>

      <ImportSection
        title="Import prodotti"
        description="Carica il CSV con intestazioni canoniche o equivalenti (es. category_name/categoria, name/descrizione, unit_default/um, price_default/prezzo). Supportati CSV con ',' o ';'. Opzionale: note/nota."
        endpoint="/api/products/import"
      />
      <ImportSection
        title="Import componenti"
        description="Carica il CSV con product_code, component_name e campi opzionali. Supportati CSV con ',' o ';'."
        endpoint="/api/products/components/import"
      />
    </div>
  );
}

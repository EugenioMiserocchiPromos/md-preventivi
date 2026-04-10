import React, { useEffect, useMemo, useState } from 'react';
import { fetchLatestImportFile, uploadFile } from '../api/client';
import { ErrorAlert } from '../components/Feedback';

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
      {result.warning ? <p className="text-xs text-amber-700">{result.warning}</p> : null}
    </div>
  );
}

function formatImportedAt(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatSize(sizeBytes) {
  if (typeof sizeBytes !== 'number' || Number.isNaN(sizeBytes)) return null;
  if (sizeBytes < 1024) return `${sizeBytes} B`;

  return `${(sizeBytes / 1024).toFixed(1)} KB`;
}

function ImportSection({ title, description, endpoint, latestEndpoint, downloadPath }) {
  const [file, setFile] = useState(null);
  const [state, setState] = useState(initialState);
  const [latestFile, setLatestFile] = useState(null);
  const [latestFileError, setLatestFileError] = useState(null);

  useEffect(() => {
    let active = true;

    fetchLatestImportFile(latestEndpoint)
      .then((data) => {
        if (active) {
          setLatestFile(data);
          setLatestFileError(null);
        }
      })
      .catch(() => {
        if (active) {
          setLatestFile(null);
          setLatestFileError('Impossibile recuperare l’ultimo file importato.');
        }
      });

    return () => {
      active = false;
    };
  }, [latestEndpoint]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setState({ loading: false, result: null, error: 'Seleziona un file CSV.' });
      return;
    }

    setState({ loading: true, result: null, error: null });
    try {
      const result = await uploadFile(endpoint, file);
      if (result?.latest_file) {
        setLatestFile(result.latest_file);
      }
      setState({ loading: false, result, error: null });
    } catch (error) {
      setState({
        loading: false,
        result: null,
        error: error?.message || 'Import non riuscito.',
      });
    }
  };

  const latestFileLabel = useMemo(() => {
    if (!latestFile) return null;

    const parts = [latestFile.original_name];
    const importedAt = formatImportedAt(latestFile.imported_at);
    const size = formatSize(latestFile.size_bytes);

    if (importedAt) parts.push(importedAt);
    if (size) parts.push(size);

    return parts.join(' · ');
  }, [latestFile]);

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={state.loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {state.loading ? 'Import in corso...' : 'Importa'}
          </button>
          {latestFile ? (
            <a
              href={downloadPath}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Scarica ultimo CSV
            </a>
          ) : null}
        </div>
      </form>
      {latestFileLabel ? <p className="text-xs text-slate-500">Ultimo file: {latestFileLabel}</p> : null}
      {latestFileError ? <ErrorAlert message={latestFileError} variant="warning" /> : null}
      {state.error ? <ErrorAlert message={state.error} variant="error" /> : null}
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
        latestEndpoint="/api/products/import/latest"
        downloadPath="/api/products/import/latest/download"
      />
      <ImportSection
        title="Import componenti"
        description="Carica il CSV con product_code, component_name e campi opzionali. Supportati CSV con ',' o ';'."
        endpoint="/api/products/components/import"
        latestEndpoint="/api/products/components/import/latest"
        downloadPath="/api/products/components/import/latest/download"
      />
      <ImportSection
        title="Import clienti"
        description="CSV con titolo,email,anagrafica (email opzionale, multipla con virgola). Supporta ',' o ';'."
        endpoint="/api/customers/import"
        latestEndpoint="/api/customers/import/latest"
        downloadPath="/api/customers/import/latest/download"
      />
    </div>
  );
}

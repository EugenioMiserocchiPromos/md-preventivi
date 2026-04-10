import React from 'react';
import { defaultQuoteListPath } from '../lib/quoteTypes';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign(defaultQuoteListPath);
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-white px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Errore applicativo
            </p>
            <h1 className="text-2xl font-semibold text-rose-950">
              Si e verificato un errore imprevisto.
            </h1>
            <p className="text-sm text-rose-700">
              Ricarica la pagina oppure torna alla lista preventivi per continuare a lavorare.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Ricarica pagina
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-900"
            >
              Torna alla lista preventivi
            </button>
          </div>
        </div>
      </div>
    );
  }
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import QuotesListPage from './pages/QuotesListPage';

function Home() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Seleziona una lista preventivi.
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="underline underline-offset-4" to="/preventivi/fp">
          Fornitura e Posa
        </Link>
        <Link className="underline underline-offset-4" to="/preventivi/as">
          Assistenza
        </Link>
        <Link className="underline underline-offset-4" to="/preventivi/vm">
          Vendita Materiale
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/preventivi/fp"
          element={<QuotesListPage label="Fornitura e Posa in opera" type="FP" />}
        />
        <Route
          path="/preventivi/as"
          element={<QuotesListPage label="Assistenza" type="AS" />}
        />
        <Route
          path="/preventivi/vm"
          element={<QuotesListPage label="Vendita Materiale" type="VM" />}
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </AppLayout>
  );
}

const el = document.getElementById('app');
if (el) {
  createRoot(el).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

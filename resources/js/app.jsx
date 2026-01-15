import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';

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

function PreventiviList({ label, code }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{label}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Lista preventivi {code}. Placeholder UI minimale.
      </p>
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
          element={<PreventiviList label="Fornitura e Posa in opera" code="FP" />}
        />
        <Route path="/preventivi/as" element={<PreventiviList label="Assistenza" code="AS" />} />
        <Route
          path="/preventivi/vm"
          element={<PreventiviList label="Vendita Materiale" code="VM" />}
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

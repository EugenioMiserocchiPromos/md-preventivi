import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

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
    <div className="min-h-screen p-6 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">MD Preventivi</h1>
        <nav className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link className="underline underline-offset-4" to="/">
            Home
          </Link>
          <Link className="underline underline-offset-4" to="/preventivi/fp">
            FP
          </Link>
          <Link className="underline underline-offset-4" to="/preventivi/as">
            AS
          </Link>
          <Link className="underline underline-offset-4" to="/preventivi/vm">
            VM
          </Link>
        </nav>
      </header>
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
    </div>
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

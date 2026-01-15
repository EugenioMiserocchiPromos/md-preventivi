import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div className="min-h-screen p-6 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-2xl font-semibold">MD Preventivi</h1>
      <p className="mt-2">Ciao Mondo</p>
    </div>
  );
}

const el = document.getElementById('app');
if (el) createRoot(el).render(<App />);

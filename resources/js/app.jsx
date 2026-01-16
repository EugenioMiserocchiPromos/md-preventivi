import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminImportPage from './pages/AdminImportPage';
import QuotesListPage from './pages/QuotesListPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import QuoteTitleTemplatesPage from './pages/QuoteTitleTemplatesPage';
import QuoteBuilderPage from './pages/QuoteBuilderPage';
import NewQuotePage from './pages/NewQuotePage';
import LoginPage from './pages/LoginPage';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="px-6 py-10 text-sm text-slate-500">Caricamento...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="px-6 py-10 text-sm text-slate-500">Caricamento...</div>;
  }

  if (user) {
    return <Navigate to="/preventivi/fp" replace />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout>
              <Navigate to="/preventivi/fp" replace />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/preventivi/fp"
        element={
          <RequireAuth>
            <AppLayout>
              <QuotesListPage label="Fornitura e Posa in opera" type="FP" />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/preventivi/as"
        element={
          <RequireAuth>
            <AppLayout>
              <QuotesListPage label="Assistenza" type="AS" />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/preventivi/vm"
        element={
          <RequireAuth>
            <AppLayout>
              <QuotesListPage label="Vendita Materiale" type="VM" />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/import"
        element={
          <RequireAuth>
            <AppLayout>
              <AdminImportPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/prodotti"
        element={
          <RequireAuth>
            <AppLayout>
              <ProductsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/clienti"
        element={
          <RequireAuth>
            <AppLayout>
              <CustomersPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/titoli"
        element={
          <RequireAuth>
            <AppLayout>
              <QuoteTitleTemplatesPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/builder/:quoteId"
        element={
          <RequireAuth>
            <AppLayout>
              <QuoteBuilderPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/quotes/new"
        element={
          <RequireAuth>
            <AppLayout>
              <NewQuotePage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/preventivi/fp" replace />} />
    </Routes>
  );
}

const el = document.getElementById('app');
if (el) {
  createRoot(el).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

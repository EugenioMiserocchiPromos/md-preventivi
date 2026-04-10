import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import AppErrorBoundary from './components/AppErrorBoundary';
import { LoadingState } from './components/Feedback';
import AppLayout from './layouts/AppLayout';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminImportPage from './pages/AdminImportPage';
import QuotesListPage from './pages/QuotesListPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import QuoteBuilderPage from './pages/QuoteBuilderPage';
import QuoteExtrasPage from './pages/QuoteExtrasPage';
import NewQuotePage from './pages/NewQuotePage';
import LoginPage from './pages/LoginPage';
import { defaultQuoteListPath, quoteTypeOptions } from './lib/quoteTypes';
import { setFlashMessage } from './lib/flash';

function RedirectWithFlash({ to, message, variant = 'warning' }) {
  React.useEffect(() => {
    setFlashMessage(message, { variant });
  }, [message, variant]);

  return <Navigate to={to} replace />;
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verifica sessione in corso..." className="mx-6 my-10" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Verifica sessione in corso..." className="mx-6 my-10" />;
  }

  if (user) {
    return <Navigate to={defaultQuoteListPath} replace />;
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
              <Navigate to={defaultQuoteListPath} replace />
            </AppLayout>
          </RequireAuth>
        }
      />
      {quoteTypeOptions.map((option) => (
        <Route
          key={option.value}
          path={option.listPath}
          element={
            <RequireAuth>
              <AppLayout>
                <QuotesListPage label={option.label} type={option.value} />
              </AppLayout>
            </RequireAuth>
          }
        />
      ))}
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
        path="/builder/:quoteId/extras"
        element={
          <RequireAuth>
            <AppLayout>
              <QuoteExtrasPage />
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
      <Route
        path="*"
        element={
          <RedirectWithFlash
            to={defaultQuoteListPath}
            message="La pagina richiesta non esiste. Sei stato reindirizzato alla lista preventivi."
          />
        }
      />
    </Routes>
  );
}

const el = document.getElementById('app');
if (el) {
  createRoot(el).render(
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

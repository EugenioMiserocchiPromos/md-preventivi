import { setFlashMessage } from '../lib/flash';

function createError(message, extra = {}) {
  const error = new Error(message);
  error.status = extra.status ?? null;
  error.data = extra.data ?? null;
  error.code = extra.code ?? null;
  return error;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function notifySessionExpired() {
  setFlashMessage('Sessione scaduta, effettua di nuovo l’accesso.', {
    title: 'Accesso richiesto',
    variant: 'warning',
  });
  window.dispatchEvent(new CustomEvent('app:auth-invalidated'));

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

async function parseResponse(response, options = {}) {
  let data = null;
  if (response.status !== 204) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.message || 'Richiesta non riuscita.';
    const error = createError(message, { status: response.status, data });

    if (response.status === 401 && !options.suppressUnauthorizedRedirect) {
      error.code = 'session_expired';
      notifySessionExpired();
    }

    throw error;
  }

  return data;
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const needsXsrf = !['GET', 'HEAD'].includes(method);
  const { suppressUnauthorizedRedirect = false, ...fetchOptions } = options;

  const performRequest = async () => {
    const xsrfToken = getCookie('XSRF-TOKEN');

    try {
      return await fetch(path, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(needsXsrf && xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
          ...(fetchOptions.headers || {}),
        },
        ...fetchOptions,
      });
    } catch {
      throw createError('Connessione al server non riuscita. Riprova.', {
        code: 'network_error',
      });
    }
  };

  if (needsXsrf && !getCookie('XSRF-TOKEN')) {
    await getCsrfCookie();
  }

  let response = await performRequest();

  if (needsXsrf && response.status === 419) {
    await getCsrfCookie();
    response = await performRequest();
  }

  return parseResponse(response, { suppressUnauthorizedRedirect });
}

export async function getCsrfCookie() {
  await fetch('/sanctum/csrf-cookie', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
}

export async function login(payload) {
  await getCsrfCookie();
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    suppressUnauthorizedRedirect: true,
  });
}

export async function logout() {
  return request('/api/auth/logout', {
    method: 'POST',
    suppressUnauthorizedRedirect: true,
  });
}

export async function fetchMe() {
  return request('/api/me', {
    method: 'GET',
    suppressUnauthorizedRedirect: true,
  });
}

export async function fetchProducts({ q, perPage = 10, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (perPage) params.set('per_page', String(perPage));
  if (page) params.set('page', String(page));

  const suffix = params.toString();
  return request(`/api/products${suffix ? `?${suffix}` : ''}`, { method: 'GET' });
}

export async function fetchProductCategories({ q, perPage = 10 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (perPage) params.set('per_page', String(perPage));

  const suffix = params.toString();
  return request(`/api/product-categories${suffix ? `?${suffix}` : ''}`, { method: 'GET' });
}

export async function fetchUnits() {
  return request('/api/units', { method: 'GET' });
}

export async function fetchQuotePricingOptions() {
  return request('/api/quote-pricing-options', { method: 'GET' });
}

export async function updateProduct(productId, payload) {
  return request(`/api/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchProductComponents(productId) {
  return request(`/api/products/${productId}/components`, { method: 'GET' });
}

export async function fetchCustomers({ q, perPage = 20, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (perPage) params.set('per_page', String(perPage));
  if (page) params.set('page', String(page));

  const suffix = params.toString();
  return request(`/api/customers${suffix ? `?${suffix}` : ''}`, { method: 'GET' });
}

export async function createCustomer(payload) {
  return request('/api/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCustomer(id, payload) {
  return request(`/api/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomer(id) {
  return request(`/api/customers/${id}`, { method: 'DELETE' });
}

export async function fetchQuote(quoteId) {
  return request(`/api/quotes/${quoteId}`, { method: 'GET' });
}

export async function updateQuoteInfo(quoteId, payload) {
  return request(`/api/quotes/${quoteId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchQuotes({ type, q, perPage = 20, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (q) params.set('q', q);
  if (perPage) params.set('per_page', String(perPage));
  if (page) params.set('page', String(page));

  const suffix = params.toString();
  return request(`/api/quotes${suffix ? `?${suffix}` : ''}`, { method: 'GET' });
}

export async function deleteQuote(quoteId) {
  return request(`/api/quotes/${quoteId}`, { method: 'DELETE' });
}

export async function duplicateQuote(quoteId, payload = {}) {
  return request(`/api/quotes/${quoteId}/duplicate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createQuoteItem(quoteId, payload) {
  return request(`/api/quotes/${quoteId}/items`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createQuoteCategoryItems(quoteId, payload) {
  return request(`/api/quotes/${quoteId}/items/category`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function moveQuoteCategory(quoteId, payload) {
  return request(`/api/quotes/${quoteId}/items/category/move`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateQuoteItem(itemId, payload) {
  return request(`/api/quote-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteQuoteItem(itemId) {
  return request(`/api/quote-items/${itemId}`, { method: 'DELETE' });
}

export async function duplicateQuoteItem(itemId) {
  return request(`/api/quote-items/${itemId}/duplicate`, { method: 'POST' });
}

export async function updateQuoteItemComponent(componentId, payload) {
  return request(`/api/quote-item-components/${componentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateQuotePricing(quoteId, payload) {
  return request(`/api/quotes/${quoteId}/pricing`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function saveQuoteRevision(quoteId) {
  return request(`/api/quotes/${quoteId}/revision`, { method: 'POST' });
}

export async function fetchQuoteExtras(quoteId) {
  return request(`/api/quotes/${quoteId}/extras`, { method: 'GET' });
}

export async function createQuoteExtra(quoteId, payload) {
  return request(`/api/quotes/${quoteId}/extras`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateQuoteExtra(extraId, payload) {
  return request(`/api/quote-extras/${extraId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteQuoteExtra(extraId) {
  return request(`/api/quote-extras/${extraId}`, { method: 'DELETE' });
}

export async function createQuote(payload) {
  return request('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadFile(path, file) {
  await getCsrfCookie();

  const formData = new FormData();
  formData.append('file', file);

  const xsrfToken = getCookie('XSRF-TOKEN');
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    },
    body: formData,
  });

  return parseResponse(response);
}

export async function fetchLatestImportFile(path) {
  try {
    return await request(path, { method: 'GET' });
  } catch (error) {
    if (error?.status === 404) {
      return null;
    }

    throw error;
  }
}

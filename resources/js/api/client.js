function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

async function parseResponse(response) {
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
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const xsrfToken = getCookie('XSRF-TOKEN');
  const needsXsrf = !['GET', 'HEAD'].includes(method);

  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(needsXsrf && xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  return parseResponse(response);
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
  });
}

export async function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

export async function fetchMe() {
  return request('/api/me', { method: 'GET' });
}

export async function fetchProducts({ q, perPage = 10, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (perPage) params.set('per_page', String(perPage));
  if (page) params.set('page', String(page));

  const suffix = params.toString();
  return request(`/api/products${suffix ? `?${suffix}` : ''}`, { method: 'GET' });
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

export async function fetchQuoteTitleTemplates() {
  return request('/api/quote-title-templates', { method: 'GET' });
}

export async function createQuoteTitleTemplate(payload) {
  return request('/api/quote-title-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateQuoteTitleTemplate(id, payload) {
  return request(`/api/quote-title-templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteQuoteTitleTemplate(id) {
  return request(`/api/quote-title-templates/${id}`, { method: 'DELETE' });
}

export async function fetchQuote(quoteId) {
  return request(`/api/quotes/${quoteId}`, { method: 'GET' });
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

export async function createQuoteItem(quoteId, payload) {
  return request(`/api/quotes/${quoteId}/items`, {
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

export async function updateQuoteItemComponent(componentId, payload) {
  return request(`/api/quote-item-components/${componentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function upsertQuoteItemPose(itemId, payload) {
  return request(`/api/quote-items/${itemId}/pose`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteQuoteItemPose(itemId) {
  return request(`/api/quote-items/${itemId}/pose`, { method: 'DELETE' });
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

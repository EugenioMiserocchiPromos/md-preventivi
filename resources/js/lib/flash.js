const FLASH_STORAGE_KEY = 'md-preventivi:flash';

export function setFlashMessage(message, options = {}) {
  if (!message || typeof window === 'undefined') return;

  const payload = {
    message,
    variant: options.variant || 'warning',
    title: options.title || null,
  };

  window.sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify(payload));
}

export function consumeFlashMessage() {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(FLASH_STORAGE_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(FLASH_STORAGE_KEY);

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

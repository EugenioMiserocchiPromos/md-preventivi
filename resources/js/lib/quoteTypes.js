export const quoteTypeOptions = [
  { value: 'FP', shortLabel: 'FP', label: 'Fornitura e Posa in opera', listPath: '/preventivi/fp' },
  { value: 'AS', shortLabel: 'AS', label: 'Assistenza', listPath: '/preventivi/as' },
  { value: 'VM', shortLabel: 'VM', label: 'Vendita Materiale', listPath: '/preventivi/vm' },
];

export const defaultQuoteType = quoteTypeOptions[0].value;
export const defaultQuoteListPath = quoteTypeOptions[0].listPath;

export function getQuoteListPath(type) {
  const normalized = String(type || '').toUpperCase();
  return quoteTypeOptions.find((option) => option.value === normalized)?.listPath ?? defaultQuoteListPath;
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '€ 0,00';
  }

  const numberValue =
    typeof value === 'number' ? value : Number(String(value).replace(',', '.'));

  if (Number.isNaN(numberValue)) {
    return '€ 0,00';
  }

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(numberValue);
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '€ 0,00';
  }

  const numberValue =
    typeof value === 'number' ? value : Number(String(value).replace(',', '.'));

  if (Number.isNaN(numberValue)) {
    return '€ 0,00';
  }

  const formatted = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(numberValue);

  return `€ ${formatted}`;
}

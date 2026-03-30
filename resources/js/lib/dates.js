export function formatDateForUi(value) {
  if (!value || typeof value !== 'string') return '';

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const italianMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (italianMatch) {
    return value;
  }

  return value;
}

export function parseItalianDateInput(value) {
  const trimmed = (value || '').trim();
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== Number(year)) return null;
  if (date.getMonth() + 1 !== Number(month)) return null;
  if (date.getDate() !== Number(day)) return null;

  return iso;
}

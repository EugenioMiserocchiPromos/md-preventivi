export const fallbackUnitOptions = [
  { value: 'pz', label: 'pz' },
  { value: 'mq', label: 'mq' },
  { value: 'intervento', label: 'nº' },
  { value: 'ml', label: 'ml' },
  { value: 'mc', label: 'mc' },
  { value: 'a corpo', label: 'a corpo' },
  { value: 'cad.', label: 'cad.' },
  { value: 'kg.', label: 'kg.' },
  { value: 'ora', label: 'ora' },
];

const legacyValueMap = {
  cad: 'cad.',
  kg: 'kg.',
  'nº': 'intervento',
};

export function normalizeUnitValue(value, options = fallbackUnitOptions) {
  const normalized = String(value || '').trim().toLowerCase();
  const unit = legacyValueMap[normalized] || normalized;
  const allowedValues = new Set(options.map((option) => option.value));

  return allowedValues.has(unit) ? unit : 'ml';
}

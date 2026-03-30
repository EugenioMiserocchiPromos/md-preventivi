export const discountTypeOptions = [
  { value: 'none', label: 'Nessuno' },
  { value: 'percent', label: 'Percentuale' },
  { value: 'amount', label: 'Importo' },
];

export const paymentMethodOptions = [
  'da Concordare',
  'Vista fattura',
  '30/60/90 gg D.F.',
  'Bonifico bancario',
  'Ri.Ba.',
];

export const defaultPaymentMethod = paymentMethodOptions[0];
export const ibanPaymentMethod = 'Ri.Ba.';

export const discountTypeOptions = [
  { value: 'none', label: 'Nessuno' },
  { value: 'percent', label: 'Percentuale' },
  { value: 'amount', label: 'Importo' },
];

export const fallbackPaymentMethodOptions = ['da Concordare'];
export const fallbackDefaultPaymentMethod = fallbackPaymentMethodOptions[0];
export const fallbackNoIbanPaymentMethod = fallbackDefaultPaymentMethod;

export function shouldShowPaymentIban(paymentMethod, noIbanPaymentMethod = fallbackNoIbanPaymentMethod) {
  return Boolean(paymentMethod) && paymentMethod !== noIbanPaymentMethod;
}

export function protForUi(quote) {
  if (quote?.prot_internal) return quote.prot_internal;
  if (quote?.prot_display && quote?.revision_number) {
    return `${quote.prot_display}-REV${quote.revision_number}`;
  }
  return quote?.prot_display ?? '';
}

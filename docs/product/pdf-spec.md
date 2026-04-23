# PDF Spec

Specifica funzionale del PDF preventivo generato dall'app.

## Obiettivo

Produrre un PDF coerente con il formato aziendale, leggibile in stampa e stabile rispetto ai dati salvati sul preventivo.

## Struttura documento

Il PDF completo e composto da:

1. frontespizio
2. pagine righe prodotto
3. pagina note e clausole finali

La generazione e server-side. Il backend compone HTML Blade e lo converte in PDF tramite WeasyPrint.

## Dati mostrati

### Frontespizio

Mostra:

- `prot_display` senza suffisso revisione
- titolo preventivo
- cliente
- data preventivo
- cantiere

### Pagine righe

Header per pagina:

- dati azienda e loghi
- `prot_display`
- data
- cliente
- cantiere
- titolo

Corpo:

- righe raggruppate per categoria
- riga prodotto
- componenti visibili
- nota condivisa della riga se presente

Footer:

- spazio firma sempre presente

### Pagina finale

Mostra:

- clausole e testo finale
- riepilogo economico
- metodo pagamento
- IBAN solo quando previsto dalla modalita di pagamento
- area firma

## Regole di rendering

- `prot_internal` non deve comparire nel PDF
- i componenti con `is_visible = false` non devono essere stampati
- le note condivise appartengono alla riga prodotto e seguono la riga nel PDF
- il layout deve restare stabile anche con preventivi lunghi e categorie multiple
- il contenuto HTML prodotto deve essere gia sanificato lato backend

## Dipendenze tecniche

- template Blade in `resources/views/pdf/`
- servizio orchestratore in `app/Services/QuotePdfService.php`
- binario configurato da `WEASYPRINT_BIN`

## Verifiche minime

- frontespizio corretto
- dati cliente corretti
- PROT mostrato senza REV
- righe e componenti coerenti con il builder
- totali coerenti con il preventivo
- PDF generabile senza errori nel runtime configurato

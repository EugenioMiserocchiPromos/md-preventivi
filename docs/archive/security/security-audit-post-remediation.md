# Security Audit Post Remediation

Audit di follow-up eseguito dopo l'implementazione delle misure concordate.

## Ambito

- Modello operativo: tutti gli utenti autenticati possono fare tutto.
- Obiettivo: verificare che i rischi principali individuati nel primo audit siano stati affrontati e isolare gli eventuali residui.

## Stato generale

La remediation ha chiuso i temi principali:

- sanificazione server-side dell'HTML prodotto
- copertura del vettore import prodotti
- bonifica dei dati storici
- difesa aggiuntiva nel rendering PDF
- rate limiting sul login
- hardening base di sessione e cookie
- security headers e CSP prudente
- riduzione dei campi API esposti
- limiti e logging sugli import

## Verifiche effettuate sul codice

- Presenza di sanitizer centralizzato in [ProductNameHtmlSanitizer.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Support/ProductNameHtmlSanitizer.php)
- Uso del sanitizer nel salvataggio prodotto in [ProductsController.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Controllers/Api/ProductsController.php)
- Uso del sanitizer nell'import prodotti in [ProductImportService.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Services/ProductImportService.php)
- Bonifica storica in [2026_04_03_000001_sanitize_existing_product_and_quote_item_html.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/database/migrations/2026_04_03_000001_sanitize_existing_product_and_quote_item_html.php)
- Sanificazione difensiva nel PDF in [quote_rows.blade.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/views/pdf/quote_rows.blade.php)
- Limiter login in [AppServiceProvider.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Providers/AppServiceProvider.php)
- Throttle route login in [api.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/routes/api.php)
- Cookie sessione piu sicuro in [session.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/config/session.php)
- Security headers in [SecurityHeadersMiddleware.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Middleware/SecurityHeadersMiddleware.php)
- Riduzione payload API in [QuoteResource.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Resources/QuoteResource.php)
- Hardening import e limiti in [ProductImportService.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Services/ProductImportService.php), [ProductComponentsImportService.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Services/ProductComponentsImportService.php) e [CustomerImportService.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Services/CustomerImportService.php)
- Logging eventi chiave in [AuthController.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Controllers/Api/AuthController.php), [ProductImportController.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Controllers/Api/ProductImportController.php), [ProductComponentsImportController.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Controllers/Api/ProductComponentsImportController.php) e [CustomerImportController.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Controllers/Api/CustomerImportController.php)

## Findings residui

### Medio: verifica manuale ancora necessaria su headers e regressioni frontend

I due punti ancora aperti nel piano restano reali:

- `12. Verificare manualmente headers e compatibilita frontend`
- `14. Verificare regressioni sui flussi frontend principali`

Sono tracciati in [security-remediation.md](security-remediation.md). Non sono bug certi del codice, ma senza questa verifica non chiuderei il deploy.

### Basso/Medio: resta rendering HTML controllato nel frontend e nel PDF

Restano punti di rendering raw:

- [ProductsPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/ProductsPage.jsx)
- [QuoteBuilderPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/QuoteBuilderPage.jsx)
- [quote_rows.blade.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/views/pdf/quote_rows.blade.php)

Oggi il rischio e molto ridotto perche il dato passa da sanitizzazione server-side, migration di bonifica e sanificazione difensiva nel PDF. Rimane comunque una superficie da tenere monitorata: se in futuro un altro flusso scrive HTML senza usare il sanitizer, questi punti tornano sensibili.

### Basso: esposizione di `payment_iban` ancora necessaria ma sensibile

`payment_iban` e ancora esposto in [QuoteResource.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Resources/QuoteResource.php) e usato dal frontend per extras/totali. Nel tuo modello operativo e coerente con il funzionamento dell'app, quindi non lo classifico come vulnerabilita. Resta pero un dato da verificare bene in UI e PDF durante il test manuale.

### Basso: il PDF continua a mostrare il PROT interno se presente

Le view PDF usano ancora `prot_internal ?? prot_display` in:

- [frontespizio.blade.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/views/pdf/frontespizio.blade.php)
- [quote_rows.blade.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/views/pdf/quote_rows.blade.php)

Non e un problema di sicurezza tecnica nel tuo scenario, ma e un punto da confermare lato business: se nel PDF deve uscire solo il PROT finale/esposto, questo va rivisto.

### Basso: copertura test ancora incompleta su import hardening e log

Ci sono test per XSS, rate limiting e headers, ma non vedo ancora test automatici specifici su:

- limiti righe/colonne import
- presenza/forma dei log
- regressioni di payload API lato frontend

Non e un buco immediato, ma e un gap di robustezza.

## Rischi iniziali ora considerati chiusi o fortemente ridotti

- Stored XSS via import prodotti: fortemente ridotto
- Stored XSS su update manuale prodotto: fortemente ridotto
- Propagazione di HTML malevolo nel PDF: fortemente ridotta
- Brute force login semplice: ridotto
- Assenza di hardening header HTTP: ridotta
- Eccessiva esposizione di campi secondari nelle resource principali: ridotta
- Superficie import senza limiti minimi: ridotta

## Limiti di questo audit

- Non ho potuto eseguire i test qui: `php` non e disponibile nel sandbox e Sail richiede Docker attivo.
- Non ho potuto effettuare la verifica browser manuale su localhost.
- Le conclusioni su headers, cookie e regressioni frontend vanno quindi confermate con la checklist manuale.

## Valutazione finale

La linea di sicurezza concordata e stata affrontata bene lato codice. Prima del deploy online, io considererei bloccanti solo questi due step:

1. eseguire la checklist manuale in localhost o staging
2. confermare che non emergano regressioni su CSP, builder, import e PDF

Se questi due passaggi vanno bene, non vedo al momento finding critici residui nel modello operativo che hai descritto.

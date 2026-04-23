# Title Template Audit

Audit mirato per capire lo stato reale della funzione `title_template` nell'app.

## Obiettivo

Chiarire:

- dove il concetto di `title_template` esiste ancora
- dove invece il prodotto usa solo `title_text`
- se oggi `title_template` ha un ruolo applicativo reale oppure e un residuo di design/schema

## Sintesi esecutiva

Al momento `title_template` non e una feature attiva.

Lo stato reale e questo:

- a livello documentale il PRD lo prevede come dropdown preimpostato
- a livello database esiste ancora la tabella `quote_title_templates`
- a livello schema `quotes` mantiene ancora `title_template_id`
- a livello backend applicativo non viene validato, letto, salvato o esposto
- a livello frontend non esiste alcuna UI che carica template o fa scegliere un template
- il prodotto usa oggi solo `title_text` come stringa libera salvata sul preventivo

Conclusione pratica: `title_template` oggi e schema inattivo, mentre la feature operativa reale e `title_text`.

## Decisione presa

Il progetto e stato riallineato al comportamento reale:

- `title_template` e fuori scope
- `title_text` resta l'unica fonte del titolo preventivo
- lo schema residuo viene rimosso con migration dedicata

Riferimento implementativo:

- [database/migrations/2026_04_10_000001_remove_quote_title_templates.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/database/migrations/2026_04_10_000001_remove_quote_title_templates.php)

## Fonti trovate

### Documentazione

- PRD: [../../product/prd.md](../../product/prd.md)
- Data model: [../../architecture/data-model.md](../../architecture/data-model.md)

### Schema database

- Tabella template: [database/migrations/2025_02_14_000005_create_quote_title_templates_table.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/database/migrations/2025_02_14_000005_create_quote_title_templates_table.php)
- FK su quote: [database/migrations/2025_02_14_000006_create_quotes_table.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/database/migrations/2025_02_14_000006_create_quotes_table.php)
- Vincolo univocita label: [database/migrations/2025_02_14_000012_add_unique_label_to_quote_title_templates_table.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/database/migrations/2025_02_14_000012_add_unique_label_to_quote_title_templates_table.php)

### Backend e API

- Creazione quote: [app/Http/Controllers/Api/QuotesController.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Controllers/Api/QuotesController.php)
- Validazione create: [app/Http/Requests/Quotes/StoreQuoteRequest.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Requests/Quotes/StoreQuoteRequest.php)
- Validazione update: [app/Http/Requests/Quotes/UpdateQuoteInfoRequest.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Requests/Quotes/UpdateQuoteInfoRequest.php)
- Resource dettaglio: [app/Http/Resources/QuoteResource.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Resources/QuoteResource.php)
- Resource lista: [app/Http/Resources/QuoteListResource.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Http/Resources/QuoteListResource.php)
- Model quote: [app/Models/Quote.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/app/Models/Quote.php)

### Frontend e PDF

- Nuovo preventivo: [resources/js/pages/NewQuotePage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/NewQuotePage.jsx)
- Modifica info preventivo: [resources/js/components/QuoteInfoModal.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/components/QuoteInfoModal.jsx)
- Lista preventivi: [resources/js/components/QuoteList.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/components/QuoteList.jsx)
- PDF: [resources/views/pdf/quote_rows.blade.php](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/views/pdf/quote_rows.blade.php)

## Cosa dice il design originario

Nel PRD il titolo del preventivo doveva essere:

- selezionato da un dropdown preimpostato
- associato opzionalmente a una tabella `quote_title_templates`
- salvato anche come snapshot testuale nel campo `title_text`

Questo modello e coerente con il data model:

- `quote_title_templates` contiene i titoli selezionabili
- `quotes.title_template_id` conserva il riferimento al template
- `quotes.title_text` conserva il testo usato al momento della selezione

Questo e un design sensato se vuoi:

- controllare i titoli ammessi
- riutilizzare titoli standardizzati
- mantenere comunque uno snapshot stabile sul preventivo

## Stato implementativo reale

### 1. Database: presente ma passivo

La parte database esiste:

- tabella `quote_title_templates`
- colonna `quotes.title_template_id`
- colonna `quotes.title_text`
- vincolo di unicita su `quote_title_templates.label`

Pero non ho trovato:

- seeder dei template
- model dedicato `QuoteTitleTemplate`
- relation Eloquent tra `Quote` e template
- endpoint API per leggere/gestire i template

Quindi il database e predisposto, ma non agganciato al resto dell'app.

### 2. Backend: usa solo `title_text`

Nel backend applicativo la creazione e modifica del preventivo usa solo `title_text`.

Osservazioni:

- `StoreQuoteRequest` valida `title_text` obbligatorio, ma non `title_template_id`
- `UpdateQuoteInfoRequest` valida `title_text` obbligatorio, ma non `title_template_id`
- `QuotesController@store` salva `title_text`, ma non salva `title_template_id`
- `QuotesController@update` aggiorna `title_text`, ma non `title_template_id`
- `QuotesController@index` cerca per `title_text`
- `QuoteResource` e `QuoteListResource` espongono `title_text`, ma non `title_template_id`

Effetto pratico: anche se la colonna `title_template_id` esiste, l'applicazione non la popola e non la usa.

### 3. Frontend: input libero, nessun template

Nel frontend la UI mostra un semplice input testo:

- in creazione preventivo
- in modifica info preventivo

Non ho trovato:

- fetch template
- select template
- autocomplete template
- pagina admin per gestire i template

Il titolo quindi oggi e completamente libero lato operatore.

### 4. PDF e liste: leggono solo lo snapshot testuale

Il rendering utente-consumabile usa `title_text`:

- lista preventivi
- dettaglio preventivo
- PDF

Questo conferma che il dato realmente significativo per il prodotto oggi e lo snapshot testuale, non il template.

## Dove `title_template` non compare

Non ho trovato utilizzo concreto di `title_template_id` in:

- route API
- controller dedicati
- resource JSON
- model relation
- form request
- componenti React
- PDF
- test automatici
- seed iniziali

Questo e il segnale principale: non e una feature parzialmente usata, e una feature mai completata oltre il livello schema/documentazione.

## Rischi e impatti attuali

### Rischio funzionale

Basso.

L'app funziona perche usa `title_text`, che e sufficiente a creare, mostrare, cercare, duplicare e stampare il titolo del preventivo.

### Rischio di manutenzione

Medio.

Chi entra nel progetto vede:

- documentazione che parla di dropdown preimpostato
- schema DB con `title_template_id`
- tabella dedicata ai template

ma il comportamento reale e diverso.

Questo crea ambiguita su:

- feature realmente supportate
- campi da mantenere
- scope effettivo del prodotto

### Rischio dati

Basso.

Il fatto che `title_template_id` sia inutilizzato non rompe i preventivi esistenti, perche il dato realmente usato e `title_text`.

## Interpretazione corretta dello stato attuale

La situazione piu probabile e questa:

1. il progetto era stato modellato per avere titoli standardizzati
2. e stata creata la base dati per supportarli
3. durante lo sviluppo operativo si e scelto o semplificato verso input libero
4. la parte template e rimasta come residuo incompleto

## Decisioni possibili

### Opzione A: ufficializzare il modello attuale

Tenere solo `title_text` come feature reale e considerare `title_template` fuori scope.

Implica:

- aggiornare PRD e data model
- dichiarare obsoleto `title_template_id`
- eventualmente rimuovere tabella e FK in una migration futura

Questa e la strada scelta.

### Opzione B: completare davvero la feature

Implementare il flusso previsto originariamente.

Implica almeno:

- model `QuoteTitleTemplate`
- seeder iniziale template
- endpoint lista template
- eventuale CRUD admin template
- select nel form nuovo preventivo
- select/modifica nel modal info preventivo
- validazione e persistenza di `title_template_id`
- snapshot automatico di `title_text` dal template scelto

Questa e la strada corretta se volete coerenza operativa sui titoli.

### Opzione C: modello ibrido

Usare template come suggerimenti rapidi, ma lasciare comunque editabile `title_text`.

E probabilmente il compromesso migliore se il team vuole velocita senza perdere standardizzazione.

## Raccomandazione

Ad oggi consiglierei di prendere una decisione esplicita:

- se i titoli standardizzati non servono, conviene rimuovere il residuo `title_template`
- se servono davvero, conviene completarli end-to-end invece di lasciarli nello stato attuale

La situazione attuale non e critica, ma e ambigua.

## Verdetto finale

`title_template` oggi non e utilizzato dall'applicazione.

E presente solo come:

- requisito documentale
- predisposizione di schema database

La feature effettiva in produzione, per come il codice e scritto oggi, e `title_text` libero.

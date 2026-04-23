# App Structure

Mappa rapida della codebase per orientare un developer nuovo.

## Stack applicativo

- Laravel gestisce routing, API, sessione, validazioni, servizi e PDF
- React gestisce la SPA amministrativa
- Sanctum gestisce autenticazione session-based
- WeasyPrint genera i PDF dal backend

## Aree principali

### Backend Laravel

- `routes/api.php`: API della SPA
- `routes/web.php`: entrypoint SPA
- `app/Http/Controllers/Api/`: controller REST applicativi
- `app/Http/Requests/`: validazioni input
- `app/Http/Resources/`: shape JSON risposta
- `app/Services/`: logica applicativa, import, totali, PROT, PDF
- `app/Models/`: modelli Eloquent
- `resources/views/pdf/`: template HTML per PDF

### Frontend React

- `resources/js/app.jsx`: bootstrap SPA e routing
- `resources/js/pages/`: pagine principali
- `resources/js/components/`: componenti condivisi
- `resources/js/api/client.js`: client fetch centrale
- `resources/js/auth/`: stato auth SPA
- `resources/js/lib/`: helper di dominio e formattazione

### Dati e infrastruttura

- `database/migrations/`: schema DB
- `database/seeders/`: seed locali
- `compose.yaml`: ambiente Sail locale
- `config/`: config Laravel e integrazioni

## Flussi core

### Preventivi

- creazione in `NewQuotePage`
- editing righe in `QuoteBuilderPage`
- pricing ed extra in `QuoteExtrasPage`
- lista e duplicazione in `QuotesListPage`

### Import

- UI in `AdminImportPage`
- controller API dedicati per prodotti, componenti e clienti
- servizi import in `app/Services/*ImportService.php`

### PDF

- download da lista preventivi
- endpoint backend su `QuotesController`
- composizione finale in `QuotePdfService`

## Dove intervenire per feature comuni

- nuova validazione API: `app/Http/Requests/`
- nuovo payload risposta: `app/Http/Resources/`
- nuova regola business: `app/Services/` e docs in `docs/product/`
- nuova pagina SPA: `resources/js/pages/` + route SPA
- nuovo flusso import/export: `app/Services/` + `docs/operations/`

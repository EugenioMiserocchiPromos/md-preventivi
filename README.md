# MD Preventivi

Applicazione interna per la creazione, revisione, duplicazione e stampa PDF di preventivi edilizi.

## Stack

- Backend: Laravel 12, Sanctum, MySQL
- Frontend: React 19, React Router, Vite, Tailwind 4
- Ambiente locale standard: Laravel Sail
- PDF: WeasyPrint invocato dal backend PHP

## Cosa fa

- gestisce clienti, prodotti, componenti e preventivi
- costruisce preventivi con righe prodotto, sottovoci ed extra finali
- genera PDF strutturati secondo layout aziendale
- importa listino prodotti, componenti e clienti via CSV

## Quick Start

Prerequisiti consigliati:

- Docker Desktop attivo
- Node.js e npm disponibili se vuoi eseguire build fuori da Sail

Setup locale tipico:

```bash
cp .env.example .env
composer install
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

App:

- SPA Laravel: `http://localhost`
- Vite HMR: `http://localhost:5173`

Utente seed locale:

- email: `test@example.com`
- password: `secret`

## PDF / WeasyPrint

La generazione PDF richiede WeasyPrint disponibile nel runtime PHP.

In locale con Sail:

- installare WeasyPrint dentro il container
- impostare `WEASYPRINT_BIN`
- pulire la cache config

Guida completa: [docs/deploy/weasyprint.md](docs/deploy/weasyprint.md)

## Import demo

Template CSV disponibili in:

- [docs/reference/templates/listino_prodotti_template.csv](docs/reference/templates/listino_prodotti_template.csv)
- [docs/reference/templates/listino_componenti_template.csv](docs/reference/templates/listino_componenti_template.csv)

Flusso QA import: [docs/operations/import-qa.md](docs/operations/import-qa.md)

## Documentazione

Punto di ingresso wiki: [docs/README.md](docs/README.md)

Percorsi principali:

- Prodotto e regole business: [docs/product/](docs/product)
- Architettura e struttura codice: [docs/architecture/](docs/architecture)
- Setup e sviluppo locale: [docs/development/](docs/development)
- Deploy e produzione: [docs/deploy/](docs/deploy)
- Operazioni e import: [docs/operations/](docs/operations)
- Guide per agenti/AI: [docs/ai/](docs/ai)
- Materiale storico: [docs/archive/](docs/archive)

## Note importanti

- Il modello operativo attuale non prevede ruoli separati: tutti gli utenti autenticati possono usare tutte le funzioni applicative.
- La timezone applicativa prevista è `Europe/Rome`.
- La documentazione in `docs/` descrive lo stato reale dell'app, non il progetto teorico originario.

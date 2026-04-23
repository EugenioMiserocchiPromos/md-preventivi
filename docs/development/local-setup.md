# Local Setup

Setup locale consigliato per lavorare sul progetto.

## Prerequisiti

- Docker Desktop attivo
- Composer disponibile sul host, oppure uso di container gia preparati
- Node.js e npm opzionali se lavori sempre via Sail

## Bootstrap

```bash
cp .env.example .env
composer install
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail npm install
```

## Avvio sviluppo

Backend + container:

```bash
./vendor/bin/sail up -d
```

Frontend HMR:

```bash
./vendor/bin/sail npm run dev
```

URL utili:

- app: `http://localhost`
- vite: `http://localhost:5173`
- mailpit UI: `http://localhost:8025`
- meilisearch: `http://localhost:7700`

## Utente locale seed

- email: `test@example.com`
- password: `secret`

Seed definito in `database/seeders/UsersSeeder.php`.

## Database

Comandi comuni:

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan db:seed
./vendor/bin/sail artisan migrate:fresh --seed
```

## WeasyPrint

Per generare PDF in locale, WeasyPrint deve esistere dentro il container PHP.

Guida: [../deploy/weasyprint.md](../deploy/weasyprint.md)

## Primo smoke test consigliato

1. login con utente seed
2. aprire lista preventivi
3. importare CSV demo
4. verificare pagina prodotti
5. generare almeno un PDF

# Release Checklist

Checklist pratica per mettere online o aggiornare una VPS.

## Prima del deploy

- codice allineato e worktree pulito
- `APP_URL` corretto
- `APP_TIMEZONE=Europe/Rome`
- `WEASYPRINT_BIN` configurato
- credenziali DB corrette
- permessi `storage/` e `bootstrap/cache` verificati

## Build e setup

```bash
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

## Verifiche post-deploy

- login funzionante
- navigazione SPA senza errori JS
- import CSV raggiungibile
- generazione PDF funzionante
- header di sicurezza presenti
- cookie coerenti con HTTPS

## Problemi frequenti

### PDF fallisce

- WeasyPrint non installato
- `WEASYPRINT_BIN` errato
- cache config non pulita

### Permessi storage

- verificare ownership e permessi su `storage/` e `bootstrap/cache`

## Riferimenti

- setup server: [vps-setup.md](vps-setup.md)
- sicurezza produzione: [security-production.md](security-production.md)
- weasyprint: [weasyprint.md](weasyprint.md)

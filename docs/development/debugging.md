# Debugging

Problemi ricorrenti e controlli rapidi.

## Docker / Sail

Container non attivi:

```bash
./vendor/bin/sail ps
./vendor/bin/sail up -d
./vendor/bin/sail logs -f
```

## Cache Laravel

Quando config, route o env non sembrano aggiornati:

```bash
./vendor/bin/sail artisan optimize:clear
```

## PDF non generato

Controllare:

- `WEASYPRINT_BIN` corretto
- WeasyPrint installato nel runtime PHP
- log applicativi

Guida: [../deploy/weasyprint.md](../deploy/weasyprint.md)

## 419 / problemi sessione

- ricaricare la pagina
- verificare cookie Sanctum/XSRF
- controllare `APP_URL`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`

## Build frontend

Se la SPA non si comporta come atteso:

```bash
./vendor/bin/sail npm run build
```

Controllare anche:

- errori console browser
- network tab
- mismatch tra shape API e codice frontend

## Import CSV

Se un import fallisce:

- verificare header del CSV
- verificare limiti file
- controllare il riepilogo errori in UI
- controllare i log backend

Riferimenti:

- [../operations/imports.md](../operations/imports.md)
- [../operations/import-qa.md](../operations/import-qa.md)

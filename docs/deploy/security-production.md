# Security Production

Checklist e note operative per portare l'app online con configurazione coerente.

## Stato applicativo attuale

Il codice include gia:

- autenticazione Sanctum session-based
- rigenerazione sessione al login
- logout con invalidazione sessione
- rate limiting login
- security headers applicativi
- sanificazione HTML prodotti
- limiti e logging sugli import
- `robots.txt` e `X-Robots-Tag` per evitare indicizzazione

Restano comunque necessarie verifiche manuali e una configurazione di produzione corretta.

## Config produzione da verificare

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://dominio.tld`
- `APP_TIMEZONE=Europe/Rome`
- `SESSION_DRIVER=database`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax` o valore coerente col dominio
- `SESSION_DOMAIN` coerente col dominio reale
- `SANCTUM_STATEFUL_DOMAINS` coerente col dominio reale
- `CACHE_STORE=database` o store scelto
- `QUEUE_CONNECTION=database` o altra coda realmente gestita
- `WEASYPRINT_BIN` corretto

## Requisiti infrastrutturali

- HTTPS reale con certificato valido
- reverse proxy o web server production-grade
- permessi corretti su `storage/` e `bootstrap/cache`
- backup DB e rotazione log

## Comandi utili post-config

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Verifiche minime prima del go-live

1. login/logout funzionanti
2. cookie `Secure` e `HttpOnly` su ambiente HTTPS
3. accesso anonimo alle API protette negato
4. builder preventivo funzionante
5. import CSV funzionante
6. PDF generato correttamente
7. assenza di errori CSP o regressioni frontend nei flussi principali

## Riferimenti

- checklist release: [release-checklist.md](release-checklist.md)
- setup VPS: [vps-setup.md](vps-setup.md)
- installazione WeasyPrint: [weasyprint.md](weasyprint.md)
- audit storici sicurezza: [../archive/security/](../archive/security)

# MISURE SICUREZZA

Documento di promemoria per chiudere i principali rischi di sicurezza prima del go-live pubblico.

Stato attuale: l'app e` utilizzabile in ambiente di test, ma non va ancora considerata pronta per una esposizione pubblica completa.

## Obiettivo

Portare la web app a uno stato "production-ready" dal punto di vista di:

- trasporto sicuro dei dati
- protezione sessioni e login
- runtime applicativo affidabile
- riduzione superfici di attacco evidenti

## Priorita 1: HTTPS reale

### Problema

Se l'app gira su HTTP, cookie di sessione, login e dati applicativi possono transitare in chiaro.

### Cosa fare

1. Associare un dominio reale alla VPS.
2. Configurare un reverse proxy con TLS valido.
3. Installare certificato pubblico trusted, ad esempio Let's Encrypt.
4. Forzare redirect HTTP -> HTTPS.

### Config applicativa da aggiornare

- `APP_URL=https://dominio.tld`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_DOMAIN=dominio.tld` oppure valore coerente con il dominio reale
- `SANCTUM_STATEFUL_DOMAINS=dominio.tld[,eventuali-subdomini]`

### Verifiche finali

- Il browser deve vedere solo `https://...`
- I cookie di sessione devono risultare `Secure` e `HttpOnly`
- Le API devono continuare a rispondere correttamente con autenticazione Sanctum

## Priorita 2: Runtime web da produzione

### Problema

L'immagine attuale avvia l'app con:

`php -S 0.0.0.0:80 -t public`

Questo e` adatto a demo/test, non a una produzione seria.

### Cosa fare

Sostituire il runtime con una delle seguenti soluzioni:

- `nginx + php-fpm`
- `Caddy + php-fpm`
- `Traefik + php-fpm`

### Obiettivo tecnico

- gestione corretta concorrenza
- gestione timeouts e buffering
- miglior gestione file statici
- logging e reverse proxy piu solidi

### File probabilmente da toccare

- `docker/production.Dockerfile`
- `compose.prod.yaml`
- eventuali file di configurazione `nginx`/`caddy`

### Verifiche finali

- container applicativo parte senza `php -S`
- le route Laravel continuano a funzionare
- gli asset `public/build` vengono serviti correttamente
- il download PDF continua a funzionare

## Priorita 3: Rate limiting login

### Problema

Il login oggi non ha una protezione esplicita contro brute-force.

### Cosa fare

Applicare rate limiting sul login, per esempio:

- limite per IP
- limite per email + IP
- messaggio coerente lato frontend in caso di troppi tentativi

### Possibili implementazioni

- `RateLimiter` in stile Laravel
- middleware `throttle` dedicato alla route login
- eventuale lock temporaneo dopo N tentativi

### File probabilmente da toccare

- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Requests/Auth/LoginRequest.php`
- `routes/api.php`
- eventuale bootstrap/provider per registrare il limiter

### Verifiche finali

- dopo troppi tentativi il login deve rispondere con errore coerente
- il login corretto deve continuare a funzionare normalmente

## Priorita 4: Config produzione coerente

### Config da verificare in prod

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://dominio.tld`
- `SESSION_DRIVER=database`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax` o valore coerente col dominio reale
- `CACHE_STORE=database` o store scelto per la produzione
- `QUEUE_CONNECTION=database` o altra coda realmente gestita
- `WEASYPRINT_BIN=/opt/weasyprint/venv/bin/weasyprint`

### Comandi utili dopo deploy/config update

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Nota: usare `route:cache` solo se tutte le route sono compatibili.

## Priorita 5: Hardening operativo

### Da verificare

- permessi corretti su `storage` e `bootstrap/cache`
- backup DB regolari
- rotazione log
- politica aggiornamento immagini Docker e dipendenze
- monitoraggio container e spazio disco

### Extra consigliati

- header di sicurezza lato reverse proxy:
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - CSP da valutare con attenzione

## Stato gia positivo

Le seguenti misure risultano gia presenti o ragionevolmente a posto:

- API business dietro `auth:sanctum`
- session regeneration al login
- invalidate + regenerate token al logout
- `robots.txt` con `Disallow: /`
- header `X-Robots-Tag: noindex, nofollow`

Nota: noindex e robots non sono misure di sicurezza, servono solo contro indicizzazione.

## Ordine consigliato di esecuzione

1. Preparare runtime production-grade
2. Collegare dominio e HTTPS
3. Sistemare env produzione e cookie secure
4. Aggiungere rate limit login
5. Pulizia cache/config e test completo

## Test minimi dopo hardening

1. Login/logout da browser pulito
2. Refresh pagina con sessione attiva
3. Accesso anonimo a `/api/me` e `/api/quotes` deve restare negato
4. Download PDF completo
5. Creazione/modifica preventivo
6. Import prodotti/clienti
7. Verifica cookie `Secure`, `HttpOnly`, `SameSite`
8. Verifica redirect automatico da HTTP a HTTPS

## Come richiamare questo documento in futuro

In chat puoi scrivere ad esempio:

- `Apri docs/MISURE_SICUREZZA.md e implementiamo le priorita 1 e 2`
- `Segui docs/MISURE_SICUREZZA.md e facciamo il rate limiting login`
- `Partiamo dal documento MISURE_SICUREZZA e chiudiamo i punti per il go-live`


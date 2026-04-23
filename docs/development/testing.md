# Testing

Come verificare modifiche e regressioni nel progetto.

## Verifiche automatiche

Se PHP e disponibile nel runtime usato:

```bash
./vendor/bin/sail artisan test
./vendor/bin/sail npm run build
```

Se lavori fuori da Sail, usa il runtime locale solo se compatibile con il progetto.

## Stato attuale della suite

La suite copre soprattutto:

- security headers
- rate limiting login
- sanificazione HTML prodotto

I flussi business principali hanno ancora copertura limitata. Per modifiche su preventivi, pricing, PDF o import affidarsi anche a test manuali.

## Smoke test consigliato

1. login/logout
2. lista preventivi
3. creazione nuovo preventivo
4. modifica builder e salvataggi
5. extra e pricing
6. duplicazione preventivo
7. download PDF
8. import CSV se tocchi il catalogo

## Quando aggiungere test

Aggiungere test automatici se cambi:

- regole di pricing
- regole PROT o revisione
- sanificazione o sicurezza
- import CSV
- shape API usate dalla SPA

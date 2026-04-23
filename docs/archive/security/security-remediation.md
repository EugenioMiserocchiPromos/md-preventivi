# MD Preventivi - Security Remediation

Questo documento traccia i sottotask di remediation sicurezza concordati e il loro stato.

## Contesto

- Modello operativo: tutti gli utenti autenticati possono usare tutte le funzioni applicative.
- Obiettivo sicurezza: proteggere perimetro, sessioni e input malevoli, non separare i dati tra utenti.

## Sottotask

### Fase 1 - XSS e sanificazione contenuti

- [x] 1. Creare un sanitizer HTML centralizzato lato backend
- [x] 2. Allineare l'update manuale prodotto al sanitizer centralizzato
- [x] 3. Applicare il sanitizer all'import prodotti
- [x] 4. Bonificare i dati esistenti nel database
- [x] 5. Rendere sicuro il rendering PDF dei nomi prodotto
- [x] 6. Aggiungere test automatici sui payload XSS

### Fase 2 - Login e sessione

- [x] 7. Aggiungere rate limiting al login
- [x] 8. Aggiungere test su throttling login
- [x] 9. Rivedere configurazione sessione/cookie per produzione

### Fase 3 - Hardening HTTP

- [x] 10. Aggiungere security headers di base
- [x] 11. Introdurre una CSP prudente e compatibile
- [ ] 12. Verificare manualmente headers e compatibilita frontend

### Fase 4 - Riduzione superficie dati

- [x] 13. Ridurre i campi API non necessari
- [ ] 14. Verificare regressioni sui flussi frontend principali

### Fase 5 - Import e osservabilita

- [x] 15. Irrigidire temporaneamente la superficie import
- [x] 16. Aggiungere logging degli eventi di sicurezza essenziali

## Log avanzamento

### 2026-04-03

- Creato il documento di tracking.
- Introdotto un sanitizer HTML centralizzato riusabile lato backend.
- Allineato il controller prodotti a usare il sanitizer centralizzato al posto della logica inline.
- Allineato l'import prodotti a usare il sanitizer centralizzato per il campo `name_html`.
- Aggiunta migration di bonifica per sanificare i campi HTML storici in `products` e `quote_items`.
- Aggiunta una sanificazione difensiva anche nel template PDF delle righe preventivo.
- Aggiunto un test unitario sul comportamento atteso del sanitizer.
- Aggiunti test feature per verificare la sanificazione su update manuale prodotto e import CSV.
- Aggiunto un limiter dedicato al login con soglia di 5 tentativi al minuto per combinazione email/IP.
- Aggiunto un test feature sul throttling login.
- Reso il cookie di sessione `secure` di default in produzione, salvo override esplicito da env.
- Aggiunto un middleware di security headers su `web` e `api`.
- Introdotta una CSP prudente e compatibile con SPA/Vite locale.
- Aggiunti test feature per verificare i security headers base e l'invio di HSTS su richieste HTTPS in produzione.
- Ridotti i campi superflui esposti dalle resource di quote, liste quote, clienti, righe ed extra.
- Corretto il fallback UI del PROT per non dipendere da `prot_internal`.
- Introdotti limiti temporanei su righe e colonne dei file CSV di import per ridurre input anomali o eccessivi.
- Aggiunto logging server-side per login falliti e per il completamento degli import prodotti, componenti e clienti.
- Verifica automatica non completata in questo ambiente: `php` assente nel sandbox e Docker non attivo per Sail.
- Aggiunti una checklist manuale di pre-deploy e un audit post-remediation per chiudere la validazione finale.

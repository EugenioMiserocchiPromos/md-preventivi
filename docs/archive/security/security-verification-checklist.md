# Security Verification Checklist

Checklist manuale da eseguire in localhost prima del deploy online.

## Preparazione

- [ ] Verificare che il database locale contenga almeno:
  - un preventivo completo con righe, extra, sconto e pagamento
  - un prodotto normale
  - un prodotto con nome formattato (`<strong>`, `<b>`)
  - un prodotto/import di test con payload malevolo neutralizzato
- [ ] Verificare che le migration siano allineate e applicate.
- [ ] Verificare che l'app giri in HTTPS o, se in locale usi HTTP, ricordarti che HSTS verra verificato solo in produzione/HTTPS.
- [ ] Tenere aperti browser devtools su:
  - tab `Network`
  - tab `Application` o `Storage`
  - console JavaScript

## 1. Smoke test generale

- [ ] Aprire la login page e verificare che la UI carichi senza errori in console.
- [ ] Effettuare login con credenziali corrette.
- [ ] Verificare che dopo il login:
  - l'app navighi correttamente
  - non ci siano errori JavaScript
  - le principali richieste API rispondano `200`
- [ ] Effettuare logout e nuovo login.

## 2. Rate limiting login

- [ ] Effettuare almeno 5 tentativi di login falliti con la stessa email.
- [ ] Verificare che il tentativo successivo venga bloccato con risposta `429` o messaggio equivalente di throttling.
- [ ] Attendere la finestra di sblocco oppure usare una combinazione email/IP diversa e verificare che il login corretto torni a funzionare.
- [ ] Controllare i log applicativi e verificare la presenza degli eventi `login_failed`.

## 3. Sessione e cookie

- [ ] In devtools, verificare che il cookie di sessione sia `HttpOnly`.
- [ ] Verificare che esista il cookie CSRF/XSRF previsto dalla SPA.
- [ ] In ambiente produzione o staging HTTPS, verificare anche che il cookie sessione abbia flag `Secure`.
- [ ] Verificare che il logout invalidi la sessione:
  - refresh dopo logout
  - accesso API autenticato non piu consentito

## 4. Security headers

- [ ] Su una risposta HTML dell'app, verificare la presenza di:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy`
- [ ] In staging/produzione HTTPS, verificare anche:
  - `Strict-Transport-Security`
- [ ] Confermare che con questi header:
  - la SPA carichi correttamente
  - Vite/HMR locale funzioni ancora in sviluppo
  - non ci siano errori CSP in console

## 5. XSS su prodotti

- [ ] Aprire un prodotto esistente con formattazione lecita e verificare che continui a renderizzare correttamente.
- [ ] Modificare un prodotto inserendo un payload di test, ad esempio:
  - `<script>alert(1)</script>`
  - `<img src=x onerror=alert(1)>`
  - `<strong>Test</strong><script>alert(1)</script>`
- [ ] Salvare e verificare che:
  - non parta alcun alert o script
  - rimangano solo i tag consentiti
  - il nome in lista prodotti non si rompa
- [ ] Aprire il builder di un preventivo che usa quel prodotto e verificare che:
  - il nome riga sia visibile
  - non ci siano errori console
  - non si esegua codice
- [ ] Generare il PDF e verificare che il contenuto appaia corretto e non contenga markup pericoloso eseguito o stampato male.

## 6. Import prodotti

- [ ] Importare un CSV valido e piccolo.
- [ ] Verificare che il riepilogo import mostri conteggi coerenti.
- [ ] Controllare i log per l'evento di import completato.
- [ ] Importare un CSV con payload HTML malevolo nel nome prodotto.
- [ ] Verificare che dopo l'import:
  - il prodotto sia salvato
  - il campo HTML sia sanificato
  - il builder e il PDF non eseguano codice
- [ ] Importare un file con troppe righe.
- [ ] Verificare che venga rifiutato con errore chiaro.
- [ ] Importare un file con troppe colonne.
- [ ] Verificare che venga rifiutato con errore chiaro.

## 7. Import componenti e clienti

- [ ] Importare un CSV clienti valido.
- [ ] Importare un CSV componenti valido.
- [ ] Verificare che i limiti su righe/colonne si applichino anche qui.
- [ ] Verificare la presenza dei log di completamento import.

## 8. Regressioni frontend principali

- [ ] Lista preventivi: caricamento, ricerca, duplicazione, download PDF.
- [ ] Nuovo preventivo: creazione corretta.
- [ ] Builder: aggiunta prodotto, modifica quantita, modifica prezzi, cancellazione riga.
- [ ] Extra e totali: sconto, metodo pagamento, IBAN, IVA, totale finale.
- [ ] Clienti: lista, creazione, modifica.
- [ ] Prodotti: lista, modifica, import.
- [ ] Verificare che non ci siano dipendenze rotte da campi API rimossi.

## 9. Verifiche PDF

- [ ] Frontespizio corretto.
- [ ] PROT mostrato correttamente.
- [ ] Dati cliente corretti.
- [ ] Righe preventivo corrette.
- [ ] Totali e pagamento corretti.
- [ ] IBAN visibile solo quando previsto.

## 10. Log e osservabilita

- [ ] Verificare che i log non contengano password o payload sensibili completi.
- [ ] Verificare che siano presenti eventi utili per:
  - login falliti
  - import prodotti
  - import componenti
  - import clienti
- [ ] Verificare che i log siano leggibili e non eccessivamente rumorosi.

## 11. Checklist pre-deploy finale

- [ ] Nessun errore JavaScript in console nei flussi principali.
- [ ] Nessun errore CSP nei flussi principali.
- [ ] Nessuna regressione visiva evidente su builder o PDF.
- [ ] Login throttling verificato.
- [ ] Sanitizzazione prodotti verificata.
- [ ] Import validi e import anomali verificati.
- [ ] Headers verificati su almeno una risposta HTML e una API.
- [ ] Cookie/sessione verificati nell'ambiente che andra online.

# API Overview

Panoramica ad alto livello delle API usate dalla SPA.

## Principi

- tutte le API business sono protette da `auth:sanctum`
- il frontend usa `resources/js/api/client.js` come entrypoint unico
- le risposte JSON passano da Resource Laravel quando serve shape stabile

## Aree endpoint

### Auth

- login
- logout
- recupero utente corrente

### Catalogo

- lista prodotti
- categorie prodotto
- componenti prodotto
- import prodotti e componenti

### Clienti

- lista
- creazione
- modifica
- eliminazione
- import clienti

### Preventivi

- lista filtrata per `quote_type`
- creazione
- modifica testata
- eliminazione
- duplicazione
- salvataggio revisione
- download PDF completo

### Righe e pricing

- aggiunta riga prodotto
- aggiunta blocco per categoria
- update/delete/duplicate riga
- update componenti riga
- update pricing e pagamento
- CRUD extra finali

## Dove leggere il dettaglio

- routing: `routes/api.php`
- controller: `app/Http/Controllers/Api/`
- client SPA: `resources/js/api/client.js`

## Regola pratica

Se una modifica cambia input, output o comportamento di un endpoint, aggiornare:

1. codice backend
2. client frontend
3. documentazione canonica in `docs/product/` o `docs/operations/` se la modifica tocca flussi business

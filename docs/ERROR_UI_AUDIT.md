# Error UI Audit

Audit della gestione visiva degli errori lato frontend.

## Obiettivo

Capire con precisione:

- quali errori vengono gia mostrati in UI
- con quali pattern visivi
- dove gli errori sono silenziosi, poco chiari o incoerenti
- quali sono i gap strutturali da chiudere

## Sintesi esecutiva

La gestione errori esiste gia, ma e distribuita in modo locale e non uniforme.

Stato reale:

- quasi tutte le pagine hanno almeno un messaggio errore inline
- i form gestiscono discretamente gli errori `422`
- gli errori di caricamento e salvataggio sono spesso mostrati come semplice testo
- manca del tutto una strategia globale per errori runtime, route errate, `404`, `403`, sessione scaduta e fallimenti di rete
- esistono ancora casi di errore silenzioso o solo in console

Conclusione pratica:

la "gestione grafica degli errori" non e assente, ma oggi e incompleta, incoerente e soprattutto non sistemica.

## Fonti principali

- Entry app e routing: [resources/js/app.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/app.jsx)
- Client API: [resources/js/api/client.js](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/api/client.js)
- Auth context: [resources/js/auth/AuthContext.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/auth/AuthContext.jsx)
- Login: [resources/js/pages/LoginPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/LoginPage.jsx)
- Lista preventivi: [resources/js/pages/QuotesListPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/QuotesListPage.jsx)
- Download PDF lista: [resources/js/components/QuoteList.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/components/QuoteList.jsx)
- Nuovo preventivo: [resources/js/pages/NewQuotePage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/NewQuotePage.jsx)
- Builder: [resources/js/pages/QuoteBuilderPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/QuoteBuilderPage.jsx)
- Extra e totali: [resources/js/pages/QuoteExtrasPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/QuoteExtrasPage.jsx)
- Totals panel: [resources/js/components/TotalsPanel.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/components/TotalsPanel.jsx)
- Clienti: [resources/js/pages/CustomersPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/CustomersPage.jsx)
- Prodotti: [resources/js/pages/ProductsPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/ProductsPage.jsx)
- Import CSV: [resources/js/pages/AdminImportPage.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/pages/AdminImportPage.jsx)
- Modifica info preventivo: [resources/js/components/QuoteInfoModal.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/components/QuoteInfoModal.jsx)

## Pattern attuali rilevati

### 1. Messaggi inline pagina

Pattern piu comune.

Forma tipica:

- stato locale `error`
- render con `<p className="text-sm text-amber-700">...`

Usato in:

- liste
- ricerca
- create/update/delete semplici
- caricamenti falliti

Pro:

- semplice
- veloce da implementare
- leggibile

Contro:

- stile non sempre coerente
- poco evidente nei flussi complessi
- non distingue severita o origine errore

### 2. Errori campo per form `422`

Presenza buona nei form principali.

Pattern:

- backend ritorna `errors`
- il frontend li salva in `formErrors`
- il messaggio viene mostrato sotto il campo

Usato in:

- creazione cliente
- modifica cliente
- nuovo preventivo
- modifica info preventivo

Questo e il pattern piu corretto oggi presente.

### 3. Errori riga o per record

Presente soprattutto in `QuoteExtrasPage`.

Pattern:

- oggetto `rowErrors`
- validazione o errore API associato all'id riga
- resa direttamente vicino alla riga interessata

Questo e un buon livello di granularita, migliore rispetto ai soli errori globali di pagina.

### 4. Loading states locali

Presenti quasi ovunque, ma minimali.

Pattern:

- testo "Caricamento..."
- talvolta spinner semplice
- talvolta bottone disabilitato con label in corso

Funziona, ma non sempre e accompagnato da una gestione vuoto/errore ben distinta.

## Mappa stato attuale per area

### Login

Stato:

- errore login mostrato in pagina
- bottone disabilitato durante submit
- redirect su login riuscito

Limiti:

- colore errore poco semantico, non da stato critico
- nessuna gestione dedicata per rate limiting oltre al semplice testo restituito
- nessuna differenziazione tra credenziali errate, rete assente o errore server

Valutazione:

copertura base presente, UX migliorabile.

### Auth globale

Stato:

- `AuthContext` tiene `error`
- `refreshMe`, `login`, `logout` impostano messaggi

Limiti:

- non esiste un banner globale che mostri errori di sessione/app shell
- un errore su `refreshMe()` fuori dalla login non ha un contenitore UI dedicato
- mancano flussi espliciti per sessione scaduta e retry

Valutazione:

gestione logica presente, resa visiva globale assente.

### Routing e shell applicativa

Stato:

- `RequireAuth` e `LoginRoute` mostrano solo "Caricamento..."
- route sconosciute fanno redirect automatico

Limiti:

- nessuna pagina `404`
- nessuna pagina `403`
- nessuna pagina errore generica applicativa
- un path sbagliato viene nascosto con redirect, non spiegato

Valutazione:

gap strutturale netto.

### Liste semplici: preventivi, clienti, prodotti

Stato:

- errore fetch mostrato inline
- loading su bottone o testo
- paginazione disabilitata durante loading

Limiti:

- nessun componente condiviso per error banner
- empty state ed error state sono resi in modo diverso a seconda della pagina
- scarsa gerarchia visiva tra errore bloccante e warning leggero

Valutazione:

accettabile per MVP, non rifinito.

### Form principali

Stato:

- buona gestione `422`
- messaggi campo localizzati
- messaggio server generico in box o testo

Limiti:

- pattern non riusato tramite componenti comuni
- form server error a volte e box, a volte testo semplice
- nessun focus automatico sul primo errore

Valutazione:

area relativamente migliore del frontend.

### Builder preventivo

Stato:

- errore globale pagina `error`
- errore ricerca categorie `searchError`
- errore pricing `pricingError`
- errore locale card `saveError`

Limiti:

- troppi livelli di errore senza gerarchia visiva unificata
- stessa pagina puo avere errori globali, locali e sticky panel separati senza una regola chiara
- assenza di fallback dedicato per quote non trovata
- nessun recovery action esplicita tipo "Riprova"

Valutazione:

funziona, ma e una delle aree con maggiore incoerenza visiva.

### Extra e totali

Stato:

- `QuoteExtrasPage` e l'area piu ricca di feedback
- errori per riga
- errori globali pagina
- errori create, pricing e close separati
- evidenziazione visiva su garanzia con errore

Punti forti:

- granularita buona
- errore vicino alla riga/problem area
- uso di colore e bordo su caso invalidante

Limiti:

- e molto piu evoluta del resto dell'app, quindi aumenta l'incoerenza complessiva
- alcuni errori nascono da `throw new Error(...)` locali e poi vengono solo trasformati in testo
- messaggi tecnici e business rule si mescolano

Valutazione:

e l'area migliore come feedback contestuale, ma non e un pattern sistematizzato.

### Import CSV

Stato:

- errore globale mostrato
- summary con warning e prime 5 righe errore

Punti forti:

- buona resa dei risultati import
- errore funzionale visibile

Limiti:

- se fallisce il fetch del "latest file", la UI tace e mette `null`
- nessuna differenza visiva tra errore bloccante dell'import e warning del file

Valutazione:

discreta copertura, con un caso silenzioso secondario.

### Download PDF

Stato:

- spinner/modale di "Download PDF in corso..."

Limite critico:

- se il download fallisce, l'errore va solo in `console.error`
- l'utente non vede alcun messaggio

Valutazione:

questo e il caso piu netto di errore visivamente non gestito.

## Findings principali

### 1. Medio/Alto: manca una strategia globale di error handling UI

Non esiste un layer condiviso per:

- error banner standard
- toast/notifiche
- fallback page globali
- error boundary runtime

Effetto:

- ogni pagina risolve per conto proprio
- UX incoerente
- maggior costo manutentivo

Impatto:

- medio oggi
- alto nel tempo se l'app cresce

### 2. Alto: mancano `ErrorBoundary` e fallback runtime React

Non ho trovato alcun `ErrorBoundary` in [resources/js/app.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/app.jsx) o altrove.

Effetto:

- un errore runtime di rendering puo rompere una porzione ampia della SPA senza UI di recupero

Impatto:

- alto per robustezza percepita

### 3. Medio: route errate o stati eccezionali vengono nascosti da redirect, non spiegati

La wildcard route fa redirect automatico alla lista default.

Effetto:

- nessuna pagina `404`
- nessun feedback se l'utente arriva a un path non valido

Impatto:

- medio

### 4. Medio: il caso download PDF fallito e silenzioso per l'utente

In [resources/js/components/QuoteList.jsx](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/components/QuoteList.jsx) il catch fa solo `console.error`.

Effetto:

- l'utente percepisce un "non succede nulla"

Impatto:

- medio alto per UX

### 5. Medio: errori di rete e errori applicativi non sono normalizzati

Il client API in [resources/js/api/client.js](/Users/promos15/Desktop/CODING/Web App MD ITALIA/md-preventivi/resources/js/api/client.js) costruisce bene gli errori HTTP JSON, ma non normalizza:

- assenza rete
- timeout percepiti
- backend non JSON
- errori browser/fetch

Effetto:

- possono emergere messaggi grezzi o incoerenti
- la UI non distingue "server ha risposto con errore" da "non riesco a contattare il server"

Impatto:

- medio

### 6. Medio: semantica visiva incoerente tra pagine

Oggi convivono:

- `text-amber-700`
- `text-rose-600`
- box warning
- testo semplice
- errori locali piccoli

Senza regole condivise.

Effetto:

- l'utente non capisce a colpo d'occhio la gravita
- l'app non ha una grammatica visiva degli errori

Impatto:

- medio

### 7. Basso/Medio: mancano azioni di recupero esplicite

Quasi nessun errore offre CTA tipo:

- `Riprova`
- `Torna alla lista`
- `Ricarica dati`

Effetto:

- il messaggio informa ma non guida

Impatto:

- basso medio

### 8. Basso/Medio: i loading state sono presenti ma non standardizzati

Esistono testi "Caricamento..." e spinner locali, ma senza componenti comuni.

Effetto:

- UX disomogenea
- manutenzione piu dispersiva

Impatto:

- basso medio

## Aree gia buone

### Validazioni form `422`

Sono gia in uno stato buono e non rappresentano la priorita principale.

### Errori contestuali per riga in `QuoteExtrasPage`

Sono il pattern migliore trovato nel progetto.

### Disable durante azioni in corso

Molte interazioni bloccano submit o doppio click correttamente.

## Quadro complessivo per priorita

### Priorita 1

- introdurre un `ErrorBoundary` applicativo
- gestire visivamente il fallimento download PDF
- aggiungere una pagina `404` reale
- definire un componente shared tipo `ErrorAlert`

### Priorita 2

- normalizzare gli errori nel client API
- introdurre banner o toast globali per errori non di campo
- uniformare colori e pattern visivi

### Priorita 3

- aggiungere CTA di recovery
- standardizzare loading, empty e error state
- rifinire copy e tono dei messaggi

## Raccomandazione operativa

La strada piu pragmatica non e riscrivere tutto subito, ma introdurre un sistema minimo comune:

1. componente `ErrorAlert`
2. componente `EmptyState` e `LoadingState`
3. `AppErrorBoundary`
4. pagina `NotFound`
5. gestione errore utente nel download PDF
6. normalizzazione errori fetch in `api/client.js`

Con questi sei punti il livello percepito dell'app salirebbe molto, senza toccare pesantemente la logica business.

## Verdetto finale

Se la domanda e "rimane solo la gestione grafica degli errori?", la risposta corretta e:

quasi.

La logica funzionale c'e, ma il layer di esperienza utente sugli errori e ancora uno dei principali lavori residui, soprattutto per:

- coerenza
- robustezza percepita
- fallback globali
- casi silenziosi

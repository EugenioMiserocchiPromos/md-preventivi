# MD Preventivi — PRD (Product Requirements Document)

## 1) Scopo del prodotto
MD Preventivi è una web app interna (uso aziendale) per la creazione e gestione di preventivi in ambito edilizia, con esportazione in PDF secondo un formato definito.

L’app è destinata a pochi utenti interni (da 1 a pochi), con autenticazione semplice. Non è un portale clienti.

## 2) Obiettivi
- Creare preventivi rapidamente tramite builder con listino prodotti importato.
- Gestire anagrafiche cliente.
- Generare PDF con struttura: **Frontespizio + Pagine righe + Pagina clausole**.
- Consultare l’elenco preventivi diviso in 3 macro-categorie.
- Duplicare un preventivo per modificarne rapidamente quantità/prezzi.

## 3) Non-obiettivi (fuori scope MVP)
- Stati preventivo (bozza/inviato/accettato).
- Approvazioni, workflow complessi.
- Versioning con storico modifiche (si gestisce solo un numero revisione incrementale, senza storico).
- Invio email preventivi dal sistema (previsto come estensione futura, non implementare ora).
- Gestione evoluta listino (CRUD completo, versioni listino, validazioni business avanzate) oltre a import iniziale.

## 4) Utenti e permessi
- **User interno**: può creare/modificare preventivi, anagrafiche, esportare PDF.
- **Admin** (opzionale): può importare il listino prodotti e gestire titoli template.

Autenticazione:
- login/password (Laravel standard).
- Ogni utente ha:
  - nome
  - iniziali (es. "MD") per composizione del PROT

## 5) Macro-categorie preventivo (quote_type)
In creazione preventivo è obbligatorio selezionare una tipologia:

1. **Fornitura e Posa in opera** (sigla: FP)
2. **Assistenza** (sigla: AS)
3. **Vendita Materiale** (sigla: VM)

La tipologia determina:
- in quale lista appare il preventivo
- sigla nel PROT

## 6) Anagrafiche clienti (Customers)
Il cliente è composto da:
- `title`: nome/titolo cliente (string)
- `body`: testo libero multilinea con anagrafica completa (text)
- `email`: email cliente (string)

Funzioni:
- Lista + ricerca semplice (title/email)
- Crea/Modifica con modal popup
- Creazione rapida da builder preventivo (pulsante “+”)

Nota:
- Il preventivo salva anche uno snapshot del cliente (almeno body+email) per evitare modifiche retroattive.

## 7) Listino prodotti (Products) e sottovoci template
Il listino è importato da Excel/CSV inizialmente (file non ancora definito, serve import flessibile).

**Prodotto**:
- `code` progressivo 3 cifre string (es. "001", "002"...) univoco
- `category_name` (categoria)
- `name`
- `unit_default`
- `price_default`

Nota: possono esistere prodotti quasi identici, ma diversi nelle sottovoci → sono considerati **prodotti distinti** (code diverse).

**Sottovoci template per prodotto**:
Ogni prodotto ha sottovoci predefinite (non aggiungibili dal builder):
- nome
- unità di misura
- quantità default (opzionale)
- prezzo default (opzionale)
- visibilità default (boolean)

Nel builder:
- vengono clonate nella riga preventivo
- l’utente può modificare valori e visibilità singola

## 8) Preventivo (Quote) — campi testata
- `quote_type`: FP / AS / VM
- `prot_display`: es. "MD/FP 0001-26" (stampato in PDF)
- `prot_internal`: es. "MD/FP 0001-26-REV1" (solo backend)
- `revision_number`: 1..N
- `date`: default oggi, modificabile
- cliente selezionato
- `cantiere`: testo libero
- `title_template`: titolo selezionato da dropdown preimpostato

## 9) PROT e revisioni (regola fondamentale)
Formato PROT interno:
`INIZIALI/SIGLA 0001-26-REV1`

- Iniziali: dall’utente (es. MD)
- Sigla: FP/AS/VM
- Progressivo: 4 cifre, unico per anno, condiviso tra tutte le macro-categorie
- Anno: 2 cifre
- REV: incrementa ad ogni “salvataggio revisione” controllato (no autosave)

Nel PDF si stampa **senza REV**:
`INIZIALI/SIGLA 0001-26`

## 10) Builder righe preventivo
Nel preventivo esistono:

### 10.1 Righe prodotto (Quote Items)
Ogni riga contiene:
- prodotto scelto dal listino (dropdown con ricerca)
- quantità
- unità di misura (default da prodotto ma modificabile)
- prezzo unitario (default da prodotto ma modificabile)
- totale riga calcolato
- **NOTE condivise**: una nota unica per prodotto + sottovoci + posa
- sottovoci clonate (componenti)
- variabile posa opzionale

### 10.2 Sottovoci su riga (Quote Item Components)
- clonate dal template prodotto
- editabili (qty/unit/prezzo)
- calcolo totale sottovoce
- flag `is_visible` per stampa PDF (singolarmente)

### 10.3 Variabile posa (Quote Item Pose) — opzionale
Campo extra per la riga prodotto:
- `pose_type` (valori predefiniti, almeno "Posa in opera")
- unità, quantità, prezzo, totale
- `is_included` (Compreso): totale 0
- `is_visible` per stampa

### 10.4 Righe extra finali (Quote Extras)
Righe fuori listino, a fine preventivo:
- descrizione
- importo
- ordine di inserimento

## 11) Calcoli (MVP)
- Totale riga prodotto = qty * unit_price
- Totale sottovoce = qty * unit_price
- Totale posa:
  - se included -> 0
  - altrimenti qty * unit_price
- Subtotale imponibile = somma(righe prodotto + sottovoci + posa + righe extra)
- Sconto pre-IVA:
  - percentuale o importo fisso
- IVA unica sul totale (vat_rate)
- Totale finale = (imponibile - sconto) + IVA

Nota: `is_visible` influenza solo la stampa, non il calcolo.

## 12) PDF (struttura finale)
Il PDF è composto da:

A) **Frontespizio** (1 pagina)
- PROT (display, senza REV)
- Titolo preventivo
- Nome cliente (title)
- Data
- Cantiere

B) **Pagine righe prodotti** (1+ pagine)
Header per pagina:
- sinistra: anagrafica azienda emittente fissa + loghi
- destra: PROT (display), Data, Cliente (blocco), Cantiere, Titolo

Corpo:
- tabella righe raggruppate per categoria (ordine deterministico)
- riga prodotto + sottovoci visibili + posa visibile
- note condivise come blocco

Footer:
- spazio firme (sempre presente)

C) **Pagina clausole** (ultima)
- testo clausole (template)
- spazio firma

## 13) Pagine UI richieste
1. Nuovo / Modifica preventivo (Builder)
2. Lista preventivi FP
3. Lista preventivi AS
4. Lista preventivi VM
5. Anagrafiche clienti

## 14) Requisiti non funzionali
- UI minimal moderna, Tailwind.
- Performance adeguata: liste paginare, query ottimizzate, eager loading.
- Robustezza: transazioni su clonazione e salvataggi complessi.
- Sicurezza base: accesso autenticato, CSRF, validazioni lato server.

## 15) Assunzioni MVP
- DB: MySQL (Sail)
- Export PDF: generazione server-side con template HTML -> PDF (scelta tecnica nel progetto)
- Titoli preventivo: una lista predefinita gestita da config o tabella.

## 16) Future extensions (non ora)
- Invio email preventivo
- Firma digitale
- Gestione listino evoluta
- Verbali cantiere

# MD Preventivi — Regole PROT & Revisione

## 1) Formato PROT (interno e PDF)
PROT interno (backend):
`INIZIALI/SIGLA 0001-26-REV1`

Esempio:
`MD/FP 0001-26-REV1`

PROT stampato nel PDF (display):
`INIZIALI/SIGLA 0001-26`

Esempio:
`MD/FP 0001-26`

## 2) Componenti del PROT
- INIZIALI: derivate da `name + surname` dell’utente loggato (salvate in `users.initials`)
- SIGLA: dipende da quote_type:
  - FP = Fornitura e Posa in opera
  - AS = Assistenza
  - VM = Vendita Materiale
- PROGRESSIVO: numero a 4 cifre (0001..9999)
- ANNO: ultime 2 cifre dell’anno (es: 2026 -> 26)
- REV: revisione incrementale (solo backend)

## 3) Contatore progressivo annuo globale
Il progressivo:
- è unico per anno
- è condiviso tra tutte le macro-categorie (FP/AS/VM)
- si resetta ogni anno (0001-26, poi 0001-27)

Implementazione consigliata:
Tabella `quote_counters` con:
- `year`
- `current_number`

### Algoritmo sicuro (anti-concorrenza)
In fase creazione preventivo:
1. `BEGIN TRANSACTION`
2. `SELECT ... FOR UPDATE` sulla riga `quote_counters` dell’anno corrente
   - se non esiste, creala con current_number = 0
3. incrementa `current_number += 1`
4. salva quote con:
   - prot_year = anno corrente
   - prot_number = current_number
   - revision_number = 1
5. `COMMIT`

Render:
- progressivo 4 cifre = prot_number padded (`str_pad($n, 4, '0', STR_PAD_LEFT)`)
- anno 2 cifre = `substr($year, -2)`

## 4) Revisione
La revisione serve SOLO per differenziare internamente le modifiche nel tempo.
Non è richiesto storico revisioni o differenze.

Regole:
- Alla creazione: `revision_number = 1` -> REV1
- Ad ogni modifica “effettiva” controllata -> incrementa `revision_number += 1`

### Importante: evitare incremento su autosave
La revisione deve incrementare solo su un’azione esplicita, ad esempio:
- pulsante “Salva Revisione”
oppure:
- “Salva” che incrementa revisione solo se quote già esistente e ci sono cambiamenti

Scelta consigliata MVP:
- “Salva” per quote esistente incrementa revisione **solo quando l’utente conferma** (modal “Incrementare revisione?”).
- “Genera PDF” NON incrementa revisione da sola, usa solo prot_display.

## 5) Campi quote consigliati
- prot_year (2026)
- prot_number (1)
- revision_number (1)
- prot_display ("MD/FP 0001-26")
- prot_internal ("MD/FP 0001-26-REV1")

Nota:
`prot_display` è derivabile, ma salvarlo semplifica export PDF e UI.

## 6) Vincoli e univocità
DB constraint:
- unique(prot_year, prot_number)

In UI:
- prot_internal visibile solo backend
- prot_display visibile nel builder e PDF

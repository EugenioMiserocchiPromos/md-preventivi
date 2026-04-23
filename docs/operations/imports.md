# Imports

Guida funzionale e tecnica agli import CSV di prodotti, componenti e clienti.

## Tipi di import supportati

- prodotti
- componenti prodotto
- clienti

La UI di import e disponibile nella pagina `Import CSV` della SPA.

## Template di riferimento

- [../reference/templates/listino_prodotti_template.csv](../reference/templates/listino_prodotti_template.csv)
- [../reference/templates/listino_componenti_template.csv](../reference/templates/listino_componenti_template.csv)

## Prodotti

Campi minimi attesi:

- categoria
- nome
- unita di misura
- prezzo

Campo opzionale supportato:

- `note_default`

Note:

- il `code` puo essere presente nel file oppure generato progressivamente
- l'import normalizza e valida i dati lato backend
- `name_html` viene sanificato prima del salvataggio
- `note_default` puo essere importato quando presente nel CSV

## Componenti

Campi tipici:

- `product_code`
- `component_name`
- `unit_default`
- `qty_default` opzionale
- `price_default` opzionale
- `default_visible`
- `sort_index`

## Clienti

Campi tipici:

- titolo
- email opzionale
- anagrafica/body

## Regole operative

- gli import avvengono via CSV
- il backend applica limiti su dimensione e struttura file
- al termine viene restituito un riepilogo con creati, aggiornati, saltati ed errori
- l'ultimo file importato viene tracciato e puo essere riscaricato

## Dove sta il codice

- controller import: `app/Http/Controllers/Api/*ImportController.php`
- servizi import: `app/Services/*ImportService.php`
- storage metadata ultimo file: `app/Services/ImportFileService.php`

## Quando aggiornare questo documento

Aggiornarlo se cambiano:

- formato CSV atteso
- mapping supportati
- regole di validazione
- comportamento di archiviazione ultimo file

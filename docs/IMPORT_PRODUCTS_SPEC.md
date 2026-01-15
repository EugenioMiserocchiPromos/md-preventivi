# Import Listino Prodotti — Specifica

## Obiettivo
Importare listino prodotti iniziale da Excel/CSV.

Il file non è ancora definito, quindi l’import deve supportare mapping flessibile.

## Dati minimi per product
- category_name
- name
- unit_default
- price_default

## Code prodotto (3 cifre)
- Se nel file manca il code, generarlo progressivo:
  - primo = "001"
  - poi "002", ecc.
- Deve essere univoco

## Sottovoci template per prodotto
Opzione 1 (consigliata): import in un file separato:
- product_code
- component_name
- unit_default
- qty_default (opzionale)
- price_default (opzionale)
- default_visible (true/false)
- sort_index

Opzione 2: import unico con righe duplicate (meno pulito)

## Validazioni
- Nessun prodotto senza name/category/unit
- price_default numeric
- code sempre unico

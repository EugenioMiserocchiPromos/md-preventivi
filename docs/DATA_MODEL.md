# MD Preventivi — Data Model (Database & Relations)

## 1) Obiettivo
Definire lo schema dati per:
- clienti
- listino prodotti e sottovoci template
- preventivi, righe e sottovoci clonate
- righe extra finali
- contatore PROT annuo globale

DB target: MySQL (Sail)

## 2) Convenzioni
- ID primari: BIGINT auto-increment
- FK con constraint e cascade su children
- Decimali: usare `DECIMAL(12,2)` per importi, `DECIMAL(12,2)` per quantità (o `DECIMAL(12,3)` se serve)
- Date: `DATE` (data preventivo) + `timestamps`
- Enum: usare stringhe (`FP|AS|VM`, `percent|amount`) oppure enum DB (opzionale)

## 3) Tabelle

### 3.1 users (Laravel standard + estensioni)
Aggiungere:
- `initials` VARCHAR(8) NOT NULL (es. "MD")

Indice:
- initials

---

### 3.2 customers
Anagrafiche cliente.

Campi:
- id
- title VARCHAR(255) NOT NULL
- body TEXT NOT NULL
- email VARCHAR(255) NULL
- created_at, updated_at

Indici:
- index(title)
- index(email)

---

### 3.3 products
Listino prodotti importato.

Campi:
- id
- code CHAR(3) NOT NULL UNIQUE  -- "001"
- category_name VARCHAR(255) NOT NULL
- name VARCHAR(255) NOT NULL
- unit_default VARCHAR(32) NOT NULL
- price_default DECIMAL(12,2) NOT NULL DEFAULT 0
- note_default TEXT NULL
- is_active BOOLEAN NOT NULL DEFAULT 1
- created_at, updated_at

Indici:
- index(category_name)
- index(name)

---

### 3.4 product_components
Sottovoci template predefinite per prodotto.

Campi:
- id
- product_id (FK products.id) NOT NULL
- name VARCHAR(255) NOT NULL
- unit_default VARCHAR(32) NOT NULL
- qty_default DECIMAL(12,2) NULL
- price_default DECIMAL(12,2) NULL
- default_visible BOOLEAN NOT NULL DEFAULT 1
- sort_index INT NOT NULL DEFAULT 0
- created_at, updated_at

Constraint:
- FK product_id ON DELETE CASCADE
Indici:
- index(product_id)
- index(sort_index)

---

### 3.5 quote_counters
Contatore progressivo annuo globale (unico per tutte le macro-categorie).

Campi:
- id
- year SMALLINT NOT NULL UNIQUE  -- es 2026
- current_number INT NOT NULL DEFAULT 0
- created_at, updated_at

Uso:
- per generare nuovo progressivo: incrementare in transazione con row lock.

---

### 3.6 quote_title_templates (opzionale ma consigliata)
Titoli preventivo selezionabili da dropdown.

Campi:
- id
- label VARCHAR(255) NOT NULL
- is_active BOOLEAN NOT NULL DEFAULT 1
- sort_index INT NOT NULL DEFAULT 0

---

### 3.7 quotes
Preventivi (testata + totali).

Campi:
- id
- quote_type CHAR(2) NOT NULL  -- FP, AS, VM
- customer_id (FK customers.id) NOT NULL
- customer_title_snapshot VARCHAR(255) NOT NULL
- customer_body_snapshot TEXT NOT NULL
- customer_email_snapshot VARCHAR(255) NULL

- prot_display VARCHAR(32) NOT NULL  -- "MD/FP 0001-26"
- prot_internal VARCHAR(40) NOT NULL -- "MD/FP 0001-26-REV1"
- prot_year SMALLINT NOT NULL        -- 2026
- prot_number INT NOT NULL           -- 1 (render 0001)
- revision_number INT NOT NULL       -- 1..N

- date DATE NOT NULL
- cantiere VARCHAR(255) NOT NULL
- title_template_id (FK quote_title_templates.id) NULL
- title_text VARCHAR(255) NOT NULL   -- label selezionata al momento (snapshot)

- discount_type VARCHAR(16) NULL     -- percent|amount
- discount_value DECIMAL(12,2) NULL  -- percent in 0..100 o importo
- vat_rate DECIMAL(5,2) NOT NULL DEFAULT 22.00

- subtotal DECIMAL(12,2) NOT NULL DEFAULT 0
- discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0
- taxable_total DECIMAL(12,2) NOT NULL DEFAULT 0
- vat_amount DECIMAL(12,2) NOT NULL DEFAULT 0
- grand_total DECIMAL(12,2) NOT NULL DEFAULT 0

- created_by_user_id (FK users.id) NOT NULL
- created_at, updated_at

Constraint:
- unique(prot_year, prot_number)  -- global annual unique
Indici:
- index(quote_type)
- index(customer_id)
- index(date)

---

### 3.8 quote_items
Righe prodotto.

Campi:
- id
- quote_id (FK quotes.id) NOT NULL
- product_id (FK products.id) NOT NULL

- category_name_snapshot VARCHAR(255) NOT NULL
- product_code_snapshot CHAR(3) NOT NULL
- name_snapshot VARCHAR(255) NOT NULL

- unit_override VARCHAR(32) NOT NULL
- qty DECIMAL(12,2) NOT NULL DEFAULT 0
- unit_price_override DECIMAL(12,2) NOT NULL DEFAULT 0
- line_total DECIMAL(12,2) NOT NULL DEFAULT 0

- note_shared TEXT NULL
- sort_index INT NOT NULL DEFAULT 0

- created_at, updated_at

Constraint:
- FK quote_id ON DELETE CASCADE
- FK product_id RESTRICT (o SET NULL se preferisci)
Indici:
- index(quote_id)
- index(sort_index)

---

### 3.9 quote_item_components
Sottovoci clonate e modificabili per riga.

Campi:
- id
- quote_item_id (FK quote_items.id) NOT NULL
- name_snapshot VARCHAR(255) NOT NULL
- unit_override VARCHAR(32) NOT NULL
- qty DECIMAL(12,2) NOT NULL DEFAULT 0
- unit_price_override DECIMAL(12,2) NOT NULL DEFAULT 0
- component_total DECIMAL(12,2) NOT NULL DEFAULT 0
- is_visible BOOLEAN NOT NULL DEFAULT 1
- sort_index INT NOT NULL DEFAULT 0
- created_at, updated_at

Constraint:
- FK quote_item_id ON DELETE CASCADE
Indici:
- index(quote_item_id)
- index(sort_index)

---

### 3.10 quote_extras
Righe extra finali fuori listino.

Campi:
- id
- quote_id (FK quotes.id) NOT NULL
- description VARCHAR(255) NOT NULL
- amount DECIMAL(12,2) NOT NULL DEFAULT 0
- sort_index INT NOT NULL DEFAULT 0
- created_at, updated_at

Constraint:
- FK quote_id ON DELETE CASCADE
Indici:
- index(quote_id)
- index(sort_index)

## 4) Relazioni
- Customer 1—N Quotes
- Quote 1—N QuoteItems
- QuoteItem 1—N QuoteItemComponents
- Quote 1—N QuoteExtras
- Product 1—N ProductComponents (template)
- QuoteItemComponents sono copie derivate dai template ProductComponents

## 5) Note tecniche
- Le query lista preventivi devono essere paginabili e con eager-loading mirato.
- Le transazioni sono richieste per:
  - generazione PROT progressivo annuo
  - duplicazione preventivo
  - salvataggi complessi righe+componenti+extra


---

# (Extra) `docs/UI_STYLE_GUIDE.md`

```md
# MD Preventivi — UI Style Guide

## Design goals
- Minimal, moderna, leggibile
- Focus su velocità operativa (data-entry)
- Componenti consistenti e riutilizzabili

## Brand colors (tokens)
- Primary: #d6490d
- Secondary: #21219c
- Neutral: #50504e
- Accent: #ee8118

## Tailwind usage
- Definire CSS variables in `resources/css/app.css` e usarle con Tailwind (via classi custom o inline style).
- Layout:
  - sidebar/topbar (opzionale)
  - contenuti centrati e spaziosi
- Componenti:
  - Buttons: primary/secondary/destructive
  - Table: righe preventivo con hover e focus
  - Modal: anagrafiche create/edit
  - Inputs: coerenti, grandi, comodi per numeri

## UX patterns
- Dropdown prodotto con ricerca
- Azione “+ nuovo cliente” vicino alla select cliente
- Totali sempre visibili (sticky bottom panel nel builder)
- Conferma su eliminazioni
- Duplica preventivo: feedback chiaro (“Creato clone …”)

## Accessibility base
- Contrasto sufficiente
- Focus states
- Tastiera: tab order sensato

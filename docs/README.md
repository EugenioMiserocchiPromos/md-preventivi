# MD Preventivi Docs

Wiki tecnica del progetto, orientata a developer esterni e futuri maintainer.

## Da dove iniziare

Se stai entrando ora nel progetto, leggi in questo ordine:

1. [../README.md](../README.md)
2. [development/local-setup.md](development/local-setup.md)
3. [architecture/app-structure.md](architecture/app-structure.md)
4. [product/prd.md](product/prd.md)
5. [product/prot-rules.md](product/prot-rules.md)

## Mappa sezioni

### Product

Descrive il comportamento applicativo e le regole di business.

- [product/prd.md](product/prd.md)
- [product/prot-rules.md](product/prot-rules.md)
- [product/pdf-spec.md](product/pdf-spec.md)
- [product/ui-style-guide.md](product/ui-style-guide.md)

### Architecture

Spiega come è organizzato il codice e dove intervenire.

- [architecture/data-model.md](architecture/data-model.md)
- [architecture/app-structure.md](architecture/app-structure.md)
- [architecture/api-overview.md](architecture/api-overview.md)

### Development

Setup locale, workflow e manutenzione quotidiana.

- [development/local-setup.md](development/local-setup.md)
- [development/workflow.md](development/workflow.md)
- [development/testing.md](development/testing.md)
- [development/debugging.md](development/debugging.md)

### Deploy

Runbook e checklist per ambienti VPS e rilascio.

- [deploy/vps-setup.md](deploy/vps-setup.md)
- [deploy/release-checklist.md](deploy/release-checklist.md)
- [deploy/weasyprint.md](deploy/weasyprint.md)
- [deploy/security-production.md](deploy/security-production.md)

### Operations

Procedure operative e flussi CSV.

- [operations/imports.md](operations/imports.md)
- [operations/import-qa.md](operations/import-qa.md)

### AI

Documenti dedicati a Codex e ad altri agenti.

- [ai/codex-task-template.md](ai/codex-task-template.md)
- [ai/ai-contribution-guide.md](ai/ai-contribution-guide.md)

### Reference

Asset e template di supporto.

- [reference/templates/](reference/templates)

### Archive

Materiale storico, audit e decisioni non piu operative come fonte primaria.

- [archive/](archive)

## Convenzioni documentali

- Ogni tema deve avere una sola fonte primaria.
- I documenti vivi stanno nelle sezioni tematiche, non in root.
- Audit, remediation e analisi una tantum vanno in `archive/`.
- I file usano naming coerente `lowercase-kebab-case`.
- I documenti AI restano separati dai documenti per umani.
- Quando cambia una regola di business, aggiornare prima il documento canonico e poi gli eventuali riferimenti secondari.

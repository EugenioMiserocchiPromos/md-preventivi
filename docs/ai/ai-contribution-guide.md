# AI Contribution Guide

Guida operativa per Codex o altri agenti che lavorano sul repo.

## Documenti canonici da leggere prima di cambiare codice

- [../product/prd.md](../product/prd.md)
- [../product/prot-rules.md](../product/prot-rules.md)
- [../product/pdf-spec.md](../product/pdf-spec.md)
- [../architecture/data-model.md](../architecture/data-model.md)
- [../development/workflow.md](../development/workflow.md)

## Regole pratiche

- descrivere sempre lo stato reale dell'app, non feature immaginate
- non introdurre ruoli o permessi non presenti senza richiesta esplicita
- se cambi una regola business, aggiornare anche il documento canonico in `docs/product/`
- se cambi setup, deploy o comandi, aggiornare i documenti in `docs/development/` o `docs/deploy/`
- se il task genera un audit o una nota temporanea, archiviarla in `docs/archive/`

## Checklist minima dopo un task

1. verificare se servono update docs
2. verificare se ci sono test o build da eseguire
3. riportare file toccati
4. riportare limiti o blocchi ambientali

## Quando creare nuovi documenti

Creare un nuovo doc solo se:

- il tema non ha gia una fonte primaria
- la modifica introduce un nuovo runbook o un nuovo flusso stabile
- il contenuto non e solo temporaneo o investigativo

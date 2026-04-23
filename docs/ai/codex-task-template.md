# Codex Task Template

Template rapido per chiedere lavoro a Codex sul repo.

## Prompt base

```text
Repo: MD Preventivi (Laravel + React + Vite + Sail).
Task: <TITOLO TASK>.

Contesto:
- Allinea il lavoro allo stato reale dell'app.
- Consulta prima i documenti canonici:
  - docs/product/prd.md
  - docs/product/prot-rules.md
  - docs/product/pdf-spec.md
  - docs/architecture/data-model.md
  - docs/development/workflow.md

Acceptance Criteria:
- <AC1>
- <AC2>
- <AC3>

Vincoli:
- Patch piccola e coerente.
- Se tocchi DB: migrations + verifica seed/compatibilita.
- Se tocchi API: Request + Resource + client frontend allineati.
- Se tocchi UI: verificare il flusso reale in SPA.
- Aggiorna la documentazione se cambi regole business o setup.

Verifica:
- ./vendor/bin/sail npm run build
- ./vendor/bin/sail artisan optimize:clear
- eventuali test pertinenti
- checklist manuale: <azioni utente>

Output richiesto:
- file modificati
- sintesi tecnica
- come testare end-to-end
- eventuali limiti o edge case
```

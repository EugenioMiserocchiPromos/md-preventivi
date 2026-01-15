
---

# `docs/CODEX_TASK_TEMPLATE.md`

```md
# Template task per Codex (VS Code)

Usare SEMPRE questo template quando chiedi a Codex di lavorare sul repo.

---

## Prompt (copiaincolla)

```text
Repo: MD Preventivi (Laravel + React + Vite + Sail).
Task: <TITOLO TASK>.

Contesto:
- Segui i documenti in /docs: PRD.md, DATA_MODEL.md, PROT_RULES.md, PDF_SPEC.md.
- Non introdurre feature extra fuori scope.

Acceptance Criteria:
- <AC1>
- <AC2>
- <AC3>

Vincoli:
- Patch piccola e coerente.
- Se tocchi DB: migrations + seeder minimo.
- Se tocchi API: FormRequest + Resource + validazioni.
- Se tocchi UI: componenti modulari + Tailwind minimal.

Verifica:
- ./vendor/bin/sail npm run build
- ./vendor/bin/sail artisan optimize:clear
- Checklist manuale: <azioni utente / route da aprire>

Output richiesto:
- elenco file modificati
- spiegazione sintetica
- come testare end-to-end
- note su edge case

# MD Preventivi — WORKFLOW.md
> Workflow operativo completo (Sail + Vite + Laravel + Git/GitHub + Codex).  
> Copia/incolla questo file in: `docs/WORKFLOW.md`

---

## 0) Contesto progetto (stack e ambiente)
- Progetto: **MD Preventivi**
- Stack: **Laravel + React + Vite + Tailwind**
- Ambiente locale: **Docker tramite Laravel Sail**
- Repo: collegata a **GitHub** (push su `main` completato)

---

## 1) Comandi essenziali (Laravel Sail)

### 1.1 Avvio containers (background)
```bash
./vendor/bin/sail up -d
1.2 Stop containers
./vendor/bin/sail down
1.3 Verifica containers attivi
./vendor/bin/sail ps
1.4 Log containers (debug)
./vendor/bin/sail logs -f
1.5 Eseguire comandi “dentro” Sail
Usa sempre Sail per evitare mismatch di versione PHP/Node.

Artisan

./vendor/bin/sail artisan <command>
Composer

./vendor/bin/sail composer <command>
NPM

./vendor/bin/sail npm <command>
2) Frontend (Vite + React)
2.1 Avvio dev server (HMR)
./vendor/bin/sail npm run dev
2.2 Build produzione (controllo errori)
./vendor/bin/sail npm run build
2.3 URL utili
Laravel (app): http://localhost

Vite dev (se usato separatamente): http://localhost:5173

Nota: con Blade @vite(...) normalmente accedi da http://localhost e Vite serve gli asset.

3) Backend (Laravel)
3.1 Migrazioni
./vendor/bin/sail artisan migrate
3.2 Seed database
./vendor/bin/sail artisan db:seed
3.3 Reset totale DB (DISTRUTTIVO)
./vendor/bin/sail artisan migrate:fresh --seed
3.4 Cache clear (quando qualcosa “non torna”)
./vendor/bin/sail artisan optimize:clear
3.5 Link storage (se servono file pubblici)
./vendor/bin/sail artisan storage:link
4) Git & GitHub — Standard di progetto (OBBLIGATORIO)
4.1 Regole base
main deve essere sempre stabile (niente commit diretti se non hotfix piccoli).

Ogni lavoro si fa su un branch dedicato:

feature/... per nuove feature

fix/... per bug fix

chore/... per docs/config/cleanup

Commit piccoli, descrittivi e frequenti.

Prima del merge in main, fare sempre:

npm run build (minimo)

eventuali test Laravel se presenti

5) Flusso Git consigliato (checkout → commit → push → merge)
5.1 Allineati a main (inizio giornata)
git checkout main
git pull
5.2 Crea branch per task/feature
Esempi:

git checkout -b fix/vite-jsx-entry
# oppure
git checkout -b feature/db-schema
# oppure
git checkout -b chore/project-docs
5.3 Lavoro (Codex o manuale)
Durante lo sviluppo:

git status
git diff
5.4 Commit
git add .
git commit -m "fix: align Vite entry to app.jsx"
5.5 Push branch su GitHub
git push -u origin fix/vite-jsx-entry
5.6 Verifiche minime prima del merge
./vendor/bin/sail npm run build
./vendor/bin/sail artisan optimize:clear
5.7 Merge su main (modo semplice, locale)
git checkout main
git pull
git merge fix/vite-jsx-entry
git push
Alternativa consigliata: creare Pull Request su GitHub (utile per review diff).

5.8 Pulizia branch locale (opzionale)
git branch -d fix/vite-jsx-entry
6) Best practice operative (per essere veloci e puliti)
6.1 Dimensione patch
Preferire micro-task (20–60 min)

Un branch = un obiettivo chiaro

6.2 Revisione codice
Prima di commit:

leggi i diff (git diff)

cerca duplicazioni e “hack” temporanei

verifica naming coerente con /docs

6.3 DB e dati
Usare transazioni per:

generazione PROT (contatore annuo)

clonazione preventivo

salvataggi complessi con righe + sottovoci + posa

Indici DB su campi di filtro/lista (quote_type, prot_year, prot_number, quote_id…)

6.4 Performance
Liste preventivi paginate

Eager loading (evitare N+1)

PDF: generazione solo quando richiesta (no rigenerazioni inutili)

7) Codex in VS Code — modalità d’uso consigliata
7.1 Regola: 1 task alla volta
Codex rende meglio con task piccoli e ben definiti.

7.2 Prompt template “standard”
Copia/incolla nel prompt di Codex per ogni task:

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
- Checklist manuale: <azioni>

Output richiesto:
- elenco file modificati
- come testare end-to-end
- note su edge case
8) Troubleshooting rapido
8.1 Errore Vite entry (app.js vs app.jsx)
Sintomo: Blade carica app.jsx ma Vite è configurato su app.js.

Controlla:

vite.config.js → laravel({ input: [...] })

welcome.blade.php → @vite([...])

8.2 Problemi cache/config
./vendor/bin/sail artisan optimize:clear
8.3 Storage permessi / link mancante
./vendor/bin/sail artisan storage:link
8.4 Container non risponde
./vendor/bin/sail down
./vendor/bin/sail up -d
./vendor/bin/sail ps
./vendor/bin/sail logs -f
9) Checklist “fine giornata”
git status pulito (o almeno commit fatto)

branch pushato su GitHub

npm run build ok su task principali

note aggiornate in /docs se sono cambiate regole/requisiti

10) Nota Deploy (placeholder)
Hosting ancora da definire.
Opzione consigliata: VPS + Nginx + PHP-FPM + MySQL + backup.
Se serve async (future): queue + scheduler.

::contentReference[oaicite:0]{index=0}
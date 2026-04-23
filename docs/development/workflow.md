# Development Workflow

Workflow consigliato per lavorare sul repo in modo consistente.

## Principi

- `main` deve restare stabile
- preferire branch piccoli e focalizzati
- una modifica tecnica deve includere anche l'eventuale aggiornamento docs
- prima di chiudere un task, fare almeno build frontend e smoke test coerente con il cambiamento

## Comandi Sail essenziali

```bash
./vendor/bin/sail up -d
./vendor/bin/sail down
./vendor/bin/sail ps
./vendor/bin/sail logs -f
./vendor/bin/sail artisan <command>
./vendor/bin/sail composer <command>
./vendor/bin/sail npm <command>
```

## Flusso Git consigliato

```bash
git checkout main
git pull
git checkout -b feature/nome-task
```

Durante il lavoro:

```bash
git status
git diff
```

Prima del merge:

```bash
./vendor/bin/sail npm run build
./vendor/bin/sail artisan optimize:clear
```

Poi:

```bash
git add .
git commit -m "feat: descrizione sintetica"
git push -u origin feature/nome-task
```

## Regole operative

- se tocchi DB: verificare migration, seed e impatto sui dati
- se tocchi API: verificare Request, Resource, client frontend e documentazione
- se tocchi frontend: verificare almeno il flusso UI principale coinvolto
- se tocchi regole business: aggiornare `docs/product/`
- se tocchi setup/deploy: aggiornare `docs/development/` o `docs/deploy/`

## Best practice

- patch piccole e leggibili
- evitare duplicazioni
- non lasciare documenti investigativi in aree vive della wiki
- usare `docs/archive/` per audit e analisi storiche

## Prompt rapido per Codex

Usare il template aggiornato in [../ai/codex-task-template.md](../ai/codex-task-template.md).

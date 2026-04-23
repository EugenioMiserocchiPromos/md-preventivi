# Import QA

Checklist rapida per verificare i flussi di import in locale.

## Setup

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

Login:

- email: `test@example.com`
- password: `secret`

## Test prodotti

1. aprire `http://localhost/admin/import`
2. importare [../reference/templates/listino_prodotti_template.csv](../reference/templates/listino_prodotti_template.csv)
3. verificare riepilogo import
4. aprire pagina prodotti e controllare che i record siano presenti

## Test componenti

1. importare [../reference/templates/listino_componenti_template.csv](../reference/templates/listino_componenti_template.csv)
2. aprire pagina prodotti
3. verificare che le componenti siano visibili sul prodotto corretto

## Test clienti

1. importare un CSV clienti valido
2. verificare presenza record in lista clienti

## Note rapide

- se ottieni `419`, ricarica la pagina e riprova
- se non vedi dati, controlla i log backend e il riepilogo errori in UI

# Import CSV — QA Checklist

1) Avvia i container:
   `./vendor/bin/sail up -d`
2) Applica migrazioni + seed:
   `./vendor/bin/sail artisan migrate:fresh --seed`
3) Build assets:
   `./vendor/bin/sail npm run build`
4) Avvia dev server:
   `./vendor/bin/sail npm run dev`
5) Login con user seed:
   - email: `test@example.com`
   - password: `secret`
6) Import prodotti:
   - vai su `http://localhost/admin/import`
   - carica `docs/templates/listino_prodotti_template.csv`
7) Import componenti:
   - stesso pannello
   - carica `docs/templates/listino_componenti_template.csv`
8) Verifica modal componenti:
   - vai su `http://localhost/prodotti`
   - cerca `001` (se serve)
   - click "Vedi" → controlla tabella componenti ordinata

Note rapide:
- Se ottieni 419, ricarica la pagina e riprova (CSRF cookie).
- Se non vedi dati, ripeti import o controlla i CSV.

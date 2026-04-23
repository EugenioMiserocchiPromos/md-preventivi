# WeasyPrint Setup

Il progetto genera PDF tramite WeasyPrint, invocato dal backend Laravel.

## Config applicativa

Variabile richiesta:

```env
WEASYPRINT_BIN=/percorso/al/binario/weasyprint
```

Dopo una modifica config:

```bash
php artisan optimize:clear
```

## Locale con Sail

WeasyPrint deve essere installato dentro il container PHP.

```bash
./vendor/bin/sail exec -u root laravel.test bash
apt-get update
apt-get install -y python3 python3-venv libpangocairo-1.0-0 libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi8 libjpeg-turbo8 libpng16-16t64
python3 -m venv /opt/weasy-venv
/opt/weasy-venv/bin/pip install weasyprint
exit
```

`.env`:

```env
WEASYPRINT_BIN=/opt/weasy-venv/bin/weasyprint
```

## VPS

Installazione tipica:

```bash
sudo apt-get install -y python3 python3-venv libpangocairo-1.0-0 libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi8 libjpeg-turbo8 libpng16-16t64
sudo python3 -m venv /opt/weasy-venv
sudo /opt/weasy-venv/bin/pip install weasyprint
```

## Verifica

```bash
/opt/weasy-venv/bin/weasyprint --version
```

Poi generare almeno un PDF dall'app.

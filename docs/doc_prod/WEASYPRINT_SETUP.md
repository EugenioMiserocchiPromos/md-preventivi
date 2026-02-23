# WeasyPrint Setup (Local + VPS)

This project generates PDFs using WeasyPrint. The PHP backend calls the WeasyPrint binary specified by `WEASYPRINT_BIN` in `.env`.

## Local (Sail / Docker)

WeasyPrint must be installed inside the Sail container because PHP runs there.

### Install inside container

```bash
./vendor/bin/sail exec -u root laravel.test bash
```

```bash
mv /etc/apt/sources.list.d/yarn.list /etc/apt/sources.list.d/yarn.list.disabled
apt-get update
apt-get install -y python3 python3-venv libpangocairo-1.0-0 libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi8 libjpeg-turbo8 libpng16-16t64
python3 -m venv /opt/weasy-venv
/opt/weasy-venv/bin/pip install weasyprint
/opt/weasy-venv/bin/weasyprint --version
exit
```

### .env

Add/update:

```
WEASYPRINT_BIN=/opt/weasy-venv/bin/weasyprint
```

Then:

```bash
./vendor/bin/sail artisan optimize:clear
```

## VPS (non-Docker)

Install system deps + create a venv and keep it in a stable path (example: `/opt/weasy-venv`).

### Suggested install commands (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-venv libpangocairo-1.0-0 libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi8 libjpeg-turbo8 libpng16-16t64
sudo python3 -m venv /opt/weasy-venv
sudo /opt/weasy-venv/bin/pip install weasyprint
/opt/weasy-venv/bin/weasyprint --version
```

### .env

Set in the app:

```
WEASYPRINT_BIN=/opt/weasy-venv/bin/weasyprint
```

Then:

```bash
php artisan optimize:clear
```

## VPS (Docker)

If you deploy using Docker, add the same apt + venv steps to your Dockerfile (or a provisioning script), so containers always have WeasyPrint installed.

## Fonts & Images

WeasyPrint in this project uses absolute file paths:

- Fonts: `public/fonts/...` referenced as `file:///var/www/html/public/fonts/...` (via `public_path`)
- Images: `public/pdf/...` referenced as `file:///var/www/html/public/pdf/...`

Make sure those assets exist on the server and are readable by the PHP process.

## Troubleshooting

**Error: `weasyprint: not found`**
- The binary path is missing or `WEASYPRINT_BIN` is wrong.
- Reinstall inside the container/host and update `.env`, then run `optimize:clear`.

**Error: missing fonts**
- Ensure `public/fonts` exists and the font files are present.
- Fonts must be referenced using `file://` URLs in CSS.


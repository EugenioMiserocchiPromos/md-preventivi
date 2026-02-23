# Prod Release - Hostinger VPS (Checklist + Scripts)

This document groups the typical steps for deploying the MD Preventivi app on a VPS (Hostinger or similar).

## 1) Base System Packages (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y git curl unzip nginx
```

### PHP + Extensions

```bash
sudo apt-get install -y php-cli php-fpm php-mbstring php-xml php-curl php-zip php-bcmath php-pgsql php-mysql
```

### Composer

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### Node (for build)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

## 2) App Deploy

```bash
cd /var/www
sudo git clone <YOUR_REPO_URL> md-preventivi
cd md-preventivi
```

Set permissions:

```bash
sudo chown -R www-data:www-data /var/www/md-preventivi
sudo chmod -R 775 /var/www/md-preventivi/storage /var/www/md-preventivi/bootstrap/cache
```

## 3) Environment & Keys

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env`:
- DB credentials
- APP_URL
- MAIL settings
- `WEASYPRINT_BIN` (see next section)

## 4) WeasyPrint (PDF engine)

See `docs/doc_prod/WEASYPRINT_SETUP.md` for full details.

Quick install:

```bash
sudo apt-get install -y python3 python3-venv libpangocairo-1.0-0 libpango-1.0-0 libcairo2 libgdk-pixbuf2.0-0 libffi8 libjpeg-turbo8 libpng16-16t64
sudo python3 -m venv /opt/weasy-venv
sudo /opt/weasy-venv/bin/pip install weasyprint
/opt/weasy-venv/bin/weasyprint --version
```

`.env`:

```
WEASYPRINT_BIN=/opt/weasy-venv/bin/weasyprint
```

## 5) Install PHP deps & build frontend

```bash
composer install --no-dev --optimize-autoloader
npm install
npm run build
```

## 6) Database

```bash
php artisan migrate --force
php artisan optimize:clear
```

## 7) Nginx (example)

Example Nginx server block:

```
server {
  listen 80;
  server_name example.com;
  root /var/www/md-preventivi/public;
  index index.php index.html;

  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
  }
}
```

Restart:

```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
```

## 8) Post‑Deploy Checks

```bash
php artisan optimize:clear
php artisan route:cache
php artisan config:cache
```

- Open the app and test login
- Generate a PDF

## 9) Common Issues

**500 on PDF**
- WeasyPrint binary missing or `WEASYPRINT_BIN` is wrong.
- Run `php artisan optimize:clear`.

**Storage permission**
- Ensure `storage/` and `bootstrap/cache` are writable by web user.


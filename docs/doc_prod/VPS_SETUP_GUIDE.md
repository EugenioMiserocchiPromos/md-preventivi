# MD Preventivi - Guida Completa Setup VPS (Nuova Installazione)

Questo documento descrive, in modo dettagliato e completo, tutti i passaggi per installare e far girare il progetto **MD Preventivi** su una VPS nuova di zecca, senza usare Docker/Sail.

## Obiettivo
Avere il progetto funzionante in produzione con:
- PHP + PHP-FPM
- Nginx (o Apache, ma qui usiamo Nginx)
- MySQL/MariaDB
- Node.js per build assets
- WeasyPrint per la generazione PDF
- Configurazioni .env corrette
- Worker/cron opzionali (se usi queue o scheduled tasks)

---

## 1) Aggiornamento sistema

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 2) Utente di deploy (opzionale ma consigliato)

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

Entra con l’utente:
```bash
su - deploy
```

---

## 3) Installazione pacchetti di base

```bash
sudo apt install -y curl zip unzip git software-properties-common ca-certificates gnupg
```

---

## 4) Installazione PHP + estensioni richieste

Installa PHP (consigliato 8.2+ o 8.3):

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3 php8.3-fpm php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-mysql php8.3-gd php8.3-intl php8.3-bcmath
```

Verifica:
```bash
php -v
```

---

## 5) Installazione Composer

```bash
cd ~
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

---

## 6) Installazione Node.js (per build assets)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## 7) Installazione MySQL/MariaDB

### Opzione MySQL
```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
```

Crea DB e utente:
```bash
sudo mysql
```

```sql
CREATE DATABASE md_preventivi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'md_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON md_preventivi.* TO 'md_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 8) Installazione Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 9) Installazione WeasyPrint (PDF)

WeasyPrint richiede Python + librerie grafiche.

```bash
sudo apt install -y python3 python3-venv python3-pip libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf-2.0-0 libffi8 libjpeg-turbo8 libpng16-16
```

Crea un venv globale (consigliato):

```bash
sudo mkdir -p /opt/weasyprint
sudo python3 -m venv /opt/weasyprint/venv
sudo /opt/weasyprint/venv/bin/pip install --upgrade pip
sudo /opt/weasyprint/venv/bin/pip install weasyprint
```

Crea symlink in PATH:
```bash
sudo ln -s /opt/weasyprint/venv/bin/weasyprint /usr/local/bin/weasyprint
```

Test:
```bash
weasyprint --version
```

---

## 10) Clone del progetto

```bash
cd /var/www
sudo git clone <REPO_URL> md-preventivi
sudo chown -R deploy:www-data /var/www/md-preventivi
cd /var/www/md-preventivi
```

---

## 11) Configurazione .env

Copia e configura:

```bash
cp .env.example .env
```

Modifica i parametri:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tuodominio.it

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=md_preventivi
DB_USERNAME=md_user
DB_PASSWORD=STRONG_PASSWORD
```

Se usi storage pubblici:
```bash
php artisan storage:link
```

---

## 12) Installazione dipendenze PHP

```bash
composer install --no-dev --optimize-autoloader
```

---

## 13) Build assets frontend

```bash
npm install
npm run build
```

---

## 14) Generazione chiavi e cache

```bash
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 15) Migrazioni + seed (solo se necessario)

```bash
php artisan migrate --force
```

Se vuoi seedare utente dev:
```bash
php artisan db:seed --force
```

---

## 16) Configurazione Nginx

Esempio vhost:

```nginx
server {
    listen 80;
    server_name tuodominio.it;

    root /var/www/md-preventivi/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Attiva:
```bash
sudo ln -s /etc/nginx/sites-available/md-preventivi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 17) Permessi cartelle

```bash
sudo chown -R deploy:www-data /var/www/md-preventivi
sudo chmod -R 775 /var/www/md-preventivi/storage /var/www/md-preventivi/bootstrap/cache
```

---

## 18) HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tuodominio.it
```

---

## 19) Queue/Worker (se usati)

Se usi queue:
```bash
php artisan queue:work --daemon
```

Consigliato usare Supervisor:
```bash
sudo apt install -y supervisor
```

Config:
```
[program:md-preventivi-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/md-preventivi/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=1
user=deploy
redirect_stderr=true
stdout_logfile=/var/www/md-preventivi/storage/logs/queue.log
```

---

## 20) Cron (scheduler Laravel)

```bash
crontab -e
```

Aggiungi:
```
* * * * * cd /var/www/md-preventivi && php artisan schedule:run >> /dev/null 2>&1
```

---

## 21) Verifiche finali

```bash
php artisan optimize:clear
php artisan config:cache
```

Controlla:
- login
- generazione PDF
- upload asset / immagini

---

## 22) Backup consigliati

- Backup DB giornaliero
- Backup `storage/` se contiene file utente

---

## 23) Note WeasyPrint

- `weasyprint` deve essere disponibile in PATH (`/usr/local/bin/weasyprint`).
- Se dà errore “not found”, controlla venv e symlink.

---

## 24) Checklist rapida (riassunto)

1. Sistema aggiornato
2. PHP + estensioni
3. Composer
4. Node + build assets
5. MySQL + DB
6. WeasyPrint + librerie
7. Config `.env`
8. `composer install` + `npm run build`
9. Migrazioni
10. Nginx vhost
11. Permessi
12. HTTPS

---

Se vuoi, posso aggiungere anche una sezione “Deploy aggiornamenti” (git pull + build + cache reset) e una sezione “Rollback”.

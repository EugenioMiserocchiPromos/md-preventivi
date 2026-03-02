# Production image for Laravel (demo/prod)

FROM node:20-alpine AS node-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.js ./
COPY public ./public
RUN npm run build

FROM php:8.4-alpine AS base

# System deps for common Laravel needs
RUN apk add --no-cache \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libxml2-dev \
    zlib-dev \
    zip \
    unzip \
    bash

# WeasyPrint deps (Alpine)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-virtualenv \
    cairo \
    pango \
    gdk-pixbuf \
    libffi \
    libjpeg-turbo \
    libpng

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql intl zip gd mbstring xml

# Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

FROM base AS composer-build
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts

FROM base AS app

WORKDIR /var/www/html

# Copy app source
COPY . .

# Copy vendor and built assets
COPY --from=composer-build /app/vendor ./vendor
COPY --from=node-build /app/public/build ./public/build

# Install WeasyPrint in venv (kept inside image)
RUN mkdir -p /opt/weasyprint \
    && python3 -m venv /opt/weasyprint/venv \
    && /opt/weasyprint/venv/bin/pip install --upgrade pip \
    && /opt/weasyprint/venv/bin/pip install weasyprint

ENV WEASYPRINT_BIN=/opt/weasyprint/venv/bin/weasyprint

# Run Laravel package discovery after vendor and source are present
RUN php artisan package:discover --ansi

# Permissions for storage and cache
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]

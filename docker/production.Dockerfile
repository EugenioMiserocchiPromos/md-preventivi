# Production image for Laravel (demo/prod)

FROM node:20-alpine AS node-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.js ./
COPY public ./public
RUN npm run build

FROM composer:2 AS composer-build
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

FROM php:8.3-alpine AS app

# System deps for common Laravel needs
RUN apk add --no-cache \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zlib-dev \
    zip \
    unzip \
    bash

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql intl zip gd

WORKDIR /var/www/html

# Copy app source
COPY . .

# Copy vendor and built assets
COPY --from=composer-build /app/vendor ./vendor
COPY --from=node-build /app/public/build ./public/build

# Permissions for storage and cache
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]

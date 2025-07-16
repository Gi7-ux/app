# PHP 8.3 with Apache, SQLite extension
FROM php:8.3-apache

# Install SQLite extensions
RUN docker-php-ext-install pdo pdo_sqlite sqlite3

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy API code
COPY . /var/www/html

# Set permissions for SQLite database directory
RUN chown -R www-data:www-data /var/www/html/data \
    && chmod -R 775 /var/www/html/data

# Expose Apache port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]

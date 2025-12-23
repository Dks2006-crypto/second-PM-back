#!/bin/sh
set -e

echo "Starting application..."

# Запускаем миграции
echo "Running database migrations..."
npx prisma migrate deploy

# Запускаем приложение
echo "Starting application server..."
node dist/src/main.js
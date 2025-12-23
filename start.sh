#!/bin/sh
set -e

echo "Starting application..."

# Применяем миграции
echo "Running database migrations..."
npx prisma migrate deploy

# Запускаем приложение
echo "Starting NestJS application..."
exec node dist/main
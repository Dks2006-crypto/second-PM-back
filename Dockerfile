# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Устанавливаем переменную окружения для базы данных
ENV DATABASE_URL=file:/app/data/dev.db

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Создаем .env файл для миграций
RUN echo "DATABASE_URL=$DATABASE_URL" > .env && cat .env

# Проверяем содержимое schema.prisma
RUN cat prisma/schema.prisma | grep -A2 "datasource db"

# Применяем миграции (url читается из schema.prisma)
RUN npx prisma migrate deploy

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
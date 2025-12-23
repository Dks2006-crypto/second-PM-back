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
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Устанавливаем зависимости для prisma
RUN npm install --production

# Устанавливаем prisma CLI
RUN npm install -g prisma

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Создаем .env файл для миграций
RUN echo "DATABASE_URL=$DATABASE_URL" > .env

# Проверяем конфигурацию
RUN cat .env
RUN cat prisma.config.ts

# Копируем скрипт запуска
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3000

# Запускаем скрипт
CMD ["./start.sh"]
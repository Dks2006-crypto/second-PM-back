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

# Устанавливаем переменные окружения
ENV DATABASE_URL=file:/app/data/dev.db
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3000
ENV MAIL_HOST=smtp.gmail.com
ENV MAIL_PORT=587
ENV MAIL_SECURE=false
ENV JWT_SECRET=your-secret-key
ENV BCRYPT_SALT_ROUNDS=10
ENV CORS_ORIGIN=http://localhost:3000
ENV UPLOAD_PATH=/app/public
ENV BACKGROUND_PATH=/app/public/backgrounds
ENV CARD_PATH=/app/public/cards
ENV PHOTO_PATH=/app/public/photos
ENV TEMPLATE_PATH=/app/public/templates

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
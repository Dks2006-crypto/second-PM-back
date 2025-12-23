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

# Устанавливаем адаптер для SQLite
RUN npm install @prisma/adapter-better-sqlite3

# Устанавливаем better-sqlite3
RUN npm install better-sqlite3

# Устанавливаем canvas
RUN npm install @napi-rs/canvas

# Устанавливаем sharp
RUN npm install sharp

# Устанавливаем nodemailer
RUN npm install nodemailer

# Устанавливаем bullmq
RUN npm install bullmq

# Устанавливаем ioredis
RUN npm install ioredis

# Устанавливаем multer
RUN npm install multer

# Устанавливаем bcrypt
RUN npm install bcrypt

# Устанавливаем class-validator и class-transformer
RUN npm install class-validator class-transformer

# Устанавливаем passport-jwt
RUN npm install passport-jwt

# Устанавливаем reflect-metadata
RUN npm install reflect-metadata

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Создаем .env файл для миграций
RUN echo "DATABASE_URL=$DATABASE_URL" > .env

# Проверяем конфигурацию
RUN cat .env
RUN cat prisma.config.ts

# Применяем миграции (url читается из prisma.config.ts)
RUN DATABASE_URL=$DATABASE_URL npx prisma migrate deploy

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
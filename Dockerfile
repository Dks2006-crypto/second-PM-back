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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Создаем необходимые директории
RUN mkdir -p /app/data
RUN mkdir -p /app/public/backgrounds
RUN mkdir -p /app/public/cards
RUN mkdir -p /app/public/photos
RUN mkdir -p /app/public/templates

# Копируем public если есть
COPY --from=builder /app/public ./public 2>/dev/null || true

# Генерируем Prisma Client в production образе
RUN npx prisma generate

EXPOSE 3000

# Запускаем приложение напрямую
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
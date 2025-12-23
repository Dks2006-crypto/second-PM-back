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

# Создаем необходимые директории
RUN mkdir -p /app/data
RUN mkdir -p /app/public/backgrounds
RUN mkdir -p /app/public/cards
RUN mkdir -p /app/public/photos
RUN mkdir -p /app/public/templates

# Копируем prisma
COPY --from=builder /app/prisma ./prisma

# Генерируем Prisma Client в production образе
RUN npx prisma generate

EXPOSE 3000

# Запускаем приложение
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
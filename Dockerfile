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
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Создаём директорию и БД
RUN mkdir -p /app/data && touch /app/data/dev.db

# Устанавливаем DATABASE_URL
ENV DATABASE_URL=file:/app/data/dev.db

# Применяем схему (db push)
RUN npx prisma db push --schema ./prisma/schema.prisma --force-reset

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
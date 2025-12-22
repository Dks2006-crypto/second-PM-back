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

# Создаём директорию и пустой файл БД
RUN mkdir -p /app/data && touch /app/data/dev.db

# Применяем схему с прямым url (без ENV)
RUN npx prisma db push --schema ./prisma/schema.prisma --url file:/app/data/dev.db --force-reset

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
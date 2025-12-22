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

# Создаём директорию для БД
RUN mkdir -p /app/data

# Применяем схему (для SQLite — db push вместо migrate)
ENV DATABASE_URL=file:/app/data/dev.db
RUN npx prisma db push --schema ./prisma/schema.prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
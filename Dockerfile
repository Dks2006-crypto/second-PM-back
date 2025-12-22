# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci

# Генерация Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Копирование исходников
COPY . .

# Билд NestJS
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Копируем только необходимое
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public  # Для открыток

# Prisma client уже в node_modules
EXPOSE 3000

CMD ["node", "dist/main.js"]
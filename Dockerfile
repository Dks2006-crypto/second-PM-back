# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build  # Создаёт dist/main.js

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Копируем dist, node_modules, package.json и public
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public  # Для открыток

EXPOSE 3000

CMD ["node", "dist/main.js"]  # Точно dist/main.js
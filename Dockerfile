# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package файлы
COPY package*.json ./
RUN npm ci

# Копируем Prisma schema для generate
COPY prisma ./prisma
RUN npx prisma generate

# Копируем исходники
COPY . .

# Билдим NestJS
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Копируем необходимые файлы из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Если нужны статические файлы (public для открыток)
COPY --from=builder /app/public ./public

# Prisma client уже в node_modules
EXPOSE 3000

CMD ["node", "dist/main.js"]
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY package.json ./

# Используем npm install вместо npm ci
RUN npm install --legacy-peer-deps

# Копируем остальные файлы
COPY . .

# Собираем приложение
RUN npm run build

# Production образ
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
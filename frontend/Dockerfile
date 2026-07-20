FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY package*.json ./

RUN npm install

# Копируем все файлы проекта
COPY . .

# Собираем приложение
RUN npm run build

# Проверяем что сборка создалась
RUN ls -la dist/

# Финальный образ
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx если есть
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
FROM node:20-alpine

WORKDIR /app

# Системные зависимости для сборки
RUN apk add --no-cache python3 make g++

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем исходники
COPY . .

# Собираем NestJS и клиентский бандл
RUN npm run build

EXPOSE 3002

CMD ["node", "dist/main.js"]
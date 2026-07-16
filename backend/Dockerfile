FROM node:20-alpine

WORKDIR /app

# Устанавливаем необходимые системные зависимости
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Используем npm install вместо npm ci
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
FROM node:20-alpine

WORKDIR /app

# Устанавливаем необходимые системные зависимости
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
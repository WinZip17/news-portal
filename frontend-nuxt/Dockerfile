FROM node:24.18.0 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:24.18.0

WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3004

CMD ["node", ".output/server/index.mjs"]
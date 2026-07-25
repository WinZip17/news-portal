FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NUXT_PORT=3004
ENV NUXT_HOST=0.0.0.0
EXPOSE 3004

CMD ["node", ".output/server/index.mjs"]
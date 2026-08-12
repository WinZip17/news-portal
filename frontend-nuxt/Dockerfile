FROM node:24-alpine AS builder

WORKDIR /app

COPY packages/types ./packages/types
RUN cd packages/types && npm install && npm run build

WORKDIR /app/frontend-nuxt

COPY frontend-nuxt/package*.json ./
RUN npm install

COPY frontend-nuxt .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3004

COPY --from=builder /app/frontend-nuxt/.output ./.output

EXPOSE 3004

CMD ["node", ".output/server/index.mjs"]

FROM node:24-alpine AS builder

WORKDIR /app

COPY packages/types ./packages/types
RUN cd packages/types && npm install && npm run build

WORKDIR /app/frontend-next

COPY frontend-next/package*.json ./
RUN npm ci

COPY frontend-next .
RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/frontend-next/package*.json ./
COPY --from=builder /app/frontend-next/.next ./.next
COPY --from=builder /app/frontend-next/public ./public
COPY --from=builder /app/frontend-next/node_modules ./node_modules

EXPOSE 3003

CMD ["npm", "start"]

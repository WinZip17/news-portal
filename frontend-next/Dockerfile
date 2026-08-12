# Build context: repository root (docker compose / CI).
# IDE deploy: use workspace root as context (see .vscode/settings.json).
FROM node:24-alpine AS builder

WORKDIR /app

COPY packages/types ./packages/types
RUN cd packages/types && npm install && npm run build

WORKDIR /app/frontend-next

COPY frontend-next/package*.json ./

# Turbopack resolves @news-portal/types only inside the Next.js project root.
# Copy happens inside the image — not in the repo on disk.
RUN mkdir -p ./packages && cp -r /app/packages/types ./packages/types && \
    npm pkg set dependencies.@news-portal/types="file:./packages/types" && \
    npm install

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

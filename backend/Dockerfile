FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

# Shared types (local workspace package)
COPY packages/types ./packages/types
RUN cd packages/types && npm install && npm run build

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend .
RUN npx rimraf dist && npx nest build

EXPOSE 3001

CMD ["node", "dist/main"]

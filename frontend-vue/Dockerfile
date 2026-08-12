FROM node:24-alpine AS builder

WORKDIR /app

COPY packages/types ./packages/types
RUN cd packages/types && npm install && npm run build

WORKDIR /app/frontend-vue

COPY frontend-vue/package*.json ./
RUN npm install

COPY frontend-vue .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/frontend-vue/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

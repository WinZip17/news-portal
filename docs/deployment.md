# 🚀 Деплой и DevOps

## Инфраструктура

Проект разворачивается на VPS через Docker Compose.

## Контейнеры

| Сервис | Порт | Описание |
|--------|------|----------|
| postgres | 5432 | База данных PostgreSQL |
| redis | 6379 | Кэширование |
| backend | 3001 | NestJS API |
| frontend | 80/443 | React SPA + Nginx |
| frontend-next | 3003 | Next.js SSR |
| frontend-nuxt | 3004 | Nuxt SSR |
| frontend-vue | 80 (внутри) | Vue SPA |
| prometheus | 9090 | Сбор метрик |
| grafana | 3000 | Дашборды |

## Домены

| Поддомен | Фронтенд |
|----------|----------|
| short-news.ru | React SPA |
| next.short-news.ru | Next.js |
| nuxt.short-news.ru | Nuxt |
| vue.short-news.ru | Vue |

## CI/CD

GitHub Actions автоматически деплоит при пуше в ветку `master`:

1. Копирует файлы на VPS
2. Останавливает старые контейнеры
3. Запускает инфраструктуру (PostgreSQL, Redis, Prometheus, Grafana)
4. Собирает и запускает backend
5. Собирает и запускает все фронтенды
6. Очищает старые образы

> **Типы:** backend в `prebuild` собирает `@news-portal/types`. При ручной сборке Docker убедитесь, что в корне выполнен `npm install` (workspace-пакет должен быть доступен).

## Docker команды

```bash
# Запуск всех сервисов
docker compose up -d --build

# Остановка
docker compose down

# Логи конкретного сервиса
docker compose logs -f backend

# Перезапуск одного сервиса
docker compose restart frontend

# Очистка неиспользуемых образов
docker image prune -f
```

## Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# База данных
DB_PASSWORD=strong_password
DB_DATABASE=news_portal
DB_USERNAME=postgres

# JWT
JWT_SECRET=your_jwt_secret_key

# AI
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=deepseek-chat
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000

# Grafana
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin

# Google Analytics / Metrika
NUXT_PUBLIC_GTM_ID=G-XXXXXXXXXX
```

## Бэкапы

Автоматический бэкап базы данных каждый день в 3:00. Хранится 30 дней.

```bash
# Ручной бэкап
/opt/news-portal/backup.sh

# Восстановление из бэкапа
gunzip -c /opt/backups/news_portal_20250101_030000.sql.gz | docker compose exec -T postgres psql -U postgres news_portal
```

## SSL сертификаты

Let's Encrypt с автообновлением через Certbot.

```bash
# Добавление нового поддомена
certbot certonly --standalone -d short-news.ru -d www.short-news.ru -d next.short-news.ru -d nuxt.short-news.ru -d vue.short-news.ru

# Проверка статуса
certbot certificates
```

## Мониторинг

- **Grafana**: http://localhost:3000 (admin/admin, внутренняя сеть)
- **Grafana**: http://short-news.ru/grafana (внешняя сеть)
- **Prometheus**: http://localhost:9090 (внутренняя сеть)
- **Метрики**: http://localhost/api/metrics

## Логи

```bash
# Все сервисы
docker compose logs --tail=50

# Конкретный сервис
docker compose logs -f backend

# Поиск ошибок
docker compose logs backend | grep ERROR
```

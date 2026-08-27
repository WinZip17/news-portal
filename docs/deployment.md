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

SSH-шаг на VPS может занимать **30–60 минут** (пять Docker-сборок подряд). У `appleboy/ssh-action` по умолчанию `command_timeout: 10m` — при превышении появляется `Run Command Timeout`. В workflow задано `command_timeout: 60m`, у job — `timeout-minutes: 90`.

## Docker-сборка и `@news-portal/types`

Пакет `@news-portal/types` **не публикуется в npm**. В `package.json` указано `"file:../packages/types"`. При изолированной сборке в Docker registry отдаёт 404 — типы копируются из `packages/types` **внутри образа**, а не из дубликатов во фронтендах.

**Источник правды один:** `packages/types/` в корне монорепозитория. В каталогах фронтендов папок `packages/` быть не должно.

### Контекст сборки

Все сервисы (включая `frontend-next`) собираются с **контекстом корня репозитория** (`.`):

| Сервис | Dockerfile |
|--------|------------|
| backend | `backend/Dockerfile` |
| frontend | `frontend/Dockerfile` |
| frontend-next | `frontend-next/Dockerfile` |
| frontend-nuxt | `frontend-nuxt/Dockerfile` |
| frontend-vue | `frontend-vue/Dockerfile` |

При сборке из IDE контекст тоже должен быть **корень репозитория**, иначе `COPY packages/types` и `COPY frontend-next` не найдут файлы. Сборка из каталога `frontend-next/` не поддерживается.

```bash
# из корня репозитория
docker build -f frontend-next/Dockerfile -t news-portal-next .
docker compose build frontend-next
```

### Порядок в Dockerfile

1. `COPY packages/types` → сборка типов (`npm install && npm run build`)
2. `COPY <app>/package*.json` → `npm install` (подтягивается `file:../packages/types`)
3. `COPY <app>` → сборка приложения

Backend в Docker собирается через `npx nest build` (без workspace prebuild из корня).

### WebSocket (`/api/datetime`)

Socket.io слушает namespace `/api/datetime`, engine path **`/api/socket.io`** (не `/socket.io` в корне).

Nginx проксирует `/api/` на backend с заголовками `Upgrade` / `Connection` для WebSocket. Клиент на `next.short-news.ru` подключается к тому же origin:

```javascript
io('https://next.short-news.ru/api/datetime', { path: '/api/socket.io' });
```

**Проверка на проде** (после деплоя backend + frontend + nginx):

```bash
# polling-handshake (должен вернуть JSON с sid)
curl -s "https://next.short-news.ru/api/socket.io/?EIO=4&transport=polling"

# логи backend
docker compose logs backend --tail=30 | grep -i datetime
```

В DevTools → Network фильтр `socket.io` — статус **101 Switching Protocols** для WebSocket.

### Особенность `frontend-next` (Turbopack)

**Turbopack** (Next.js 16) не резолвит `@news-portal/types`, если зависимость указывает **вне** корня Next.js (`file:../packages/types`). Поэтому в Dockerfile, уже **внутри контейнера**, типы копируются в `frontend-next/packages/types` и путь временно меняется на `file:./packages/types`. Это не попадает в git и не дублирует типы в репозитории.

В `packages/types/tsconfig.build.json` не используется `ignoreDeprecations: "6.0"` — в Docker ставится TypeScript 5.x, эта опция поддерживается только в TS 6+.

## Docker команды

```bash
# Запуск всех сервисов
docker compose up -d --build

# Сборка только Next.js
docker compose build frontend-next

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

Скрипт `backup.sh` перед `docker compose` переходит в `/opt/news-portal` — без этого cron не находит контейнер postgres.

```bash
# На VPS: права и проверка вручную
chmod +x /opt/news-portal/backup.sh
/opt/news-portal/backup.sh
ls -lh /opt/backups/

# Cron (обычно от root, если docker доступен только root)
sudo crontab -e
# строка:
# 0 3 * * * /opt/news-portal/backup.sh >> /var/log/news-portal-backup.log 2>&1

# Лог последнего запуска
tail -50 /var/log/news-portal-backup.log

# Ручной бэкап
/opt/news-portal/backup.sh

# Восстановление из бэкапа
cd /opt/news-portal
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

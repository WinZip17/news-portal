# 🏗 Архитектура проекта

## Монорепозиторий

Проект построен как монорепозиторий с npm workspaces:

```markdown
news-portal/
├── backend/          # NestJS API + PostgreSQL
├── frontend/         # React SPA (основной)
├── frontend-next/    # Next.js + MUI
├── frontend-nuxt/    # Nuxt + PrimeVue
├── frontend-vue/     # Vue + Vuetify (газетная главная /, лента /news)
├── packages/
│   └── types/        # @news-portal/types — общая типизация
├── docs/             # Документация
├── prometheus/       # Мониторинг
├── grafana/          # Дашборды
└── docker-compose.yml
```

## Слои приложения

```
┌─────────────────────────────────────────┐
│              Nginx (порт 80/443)        │
│         Маршрутизация по поддоменам     │
├─────────────────────────────────────────┤
│  React SPA  │ Next.js │ Nuxt │ Vue SPA  │
│  :80/:443   │  :3003  │ :3004│  :80     │
├─────────────────────────────────────────┤
│           Backend API (NestJS)          │
│               Порт :3001                │
├─────────────────────────────────────────┤
│              PostgreSQL :5432           │
│              Redis :6379                │
└─────────────────────────────────────────┘
```

## База данных

- **PostgreSQL** — основные данные (новости, пользователи, настройки)
- **Redis** — кэширование API-ответов

## Ключевые сущности

- **News** — новости (заголовок, контент, категория, статус модерации)
- **User** — пользователи (email, роль, настройки)
- **Favorite** — избранное пользователей
- **Like** — лайки новостей
- **Settings** — настройки системы (cron-расписание)

## Поток данных

1. **AI генерация** → RSS источники → DeepSeek API → рерайт → PENDING
2. **Модерация** → PENDING → PUBLISHED / REJECTED
3. **Автоподтверждение** → PENDING > 1 час → PUBLISHED
4. **Архивация** → PUBLISHED > 30 дней → ARCHIVED

## Поиск новостей

```
GET /api/news?search=...     → PostgreSQL FTS (search_vector, GIN)
POST /api/news/smart-search  → DeepSeek → NewsFilter JSON → sanitize → findAll()
```

- FTS индексирует **title + summary + tags** (конфиг `russian`).
- Умный поиск **не генерирует SQL** — только whitelist полей `NewsFilter`.
- Подробнее: [search.md](search.md).

## WebSocket: серверное время

Модуль `backend/src/modules/datetime/` — Socket.io namespace `/api/datetime`, engine path `/api/socket.io`. Клиенты (frontend-next) получают событие `datetime` каждую секунду.

## Аутентификация

- JWT токены (access + refresh)
- Роли: user, moderator, admin, super_admin
- Guard на эндпоинтах
- Auto-refresh при 401

## Мониторинг

- **Prometheus** — сбор метрик с backend
- **Grafana** — дашборды (HTTP запросы, CPU, память, алерты)

## Тестирование

| Пакет | Unit/integration | E2E |
|-------|------------------|-----|
| `backend` | Jest | Jest + supertest (`test:e2e`) |
| `frontend` | Vitest + MSW + Testing Library | Playwright (`e2e/`, мок API в браузере) |
| `frontend-next` | Vitest | — |
| `frontend-vue` | Vitest (~122) | Playwright (`e2e/`, порт 5174, мок API) |

Подробнее: [testing.md](testing.md).

## Общая типизация

Контракт данных между API и клиентами описан в пакете **`@news-portal/types`** (`packages/types/`):

- enum'ы: `NewsCategory`, `NewsStatus`, `UserRole`
- сущности: `User`, `News`, фильтры, paginated-ответы
- поиск: `SmartSearchRequest`, `SmartSearchResponse`
- AI: `AutoGenerateResponse`, `CronScheduleResponse`

Фронтенды импортируют типы через локальные `types/` (реэкспорт). Backend подключает пакет в runtime (CommonJS `dist/`) и хранит server-only типы в `backend/src/types/internal.ts`.

См. [types.md](types.md) · [search.md](search.md).

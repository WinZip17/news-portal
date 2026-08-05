## `docs/architecture.md`:

# 🏗 Архитектура проекта

## Монорепозиторий

Проект построен как монорепозиторий с npm workspaces:

```markdown
news-portal/
├── backend/          # NestJS API + PostgreSQL
├── frontend/         # React SPA (основной)
├── frontend-next/    # Next.js + MUI
├── frontend-nuxt/    # Nuxt + PrimeVue
├── frontend-vue/     # Vue + Vuetify
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

## Аутентификация

- JWT токены (access + refresh)
- Роли: user, moderator, admin, super_admin
- Guard на эндпоинтах
- Auto-refresh при 401

## Мониторинг

- **Prometheus** — сбор метрик с backend
- **Grafana** — дашборды (HTTP запросы, CPU, память, алерты)

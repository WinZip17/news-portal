# AGENTS.md — контекст для AI-агентов

Новостной портал: RSS → AI-рерайт (DeepSeek) → модерация → публикация.

Полная документация: [docs/README.md](docs/README.md)

## Монорепозиторий

| Пакет | Путь | Стек |
|-------|------|------|
| Backend | `backend/` | NestJS, TypeORM, PostgreSQL, JWT, Socket.io |
| React SPA | `frontend/` | Ant Design, Redux, Vite — **prod UI** |
| Next.js | `frontend-next/` | MUI, App Router, SSR |
| Nuxt | `frontend-nuxt/` | PrimeVue, SSR |
| Vue SPA | `frontend-vue/` | Vuetify, Pinia |
| Типы | `packages/types/` | `@news-portal/types` — единый контракт API |

→ [docs/architecture.md](docs/architecture.md) · [docs/frontends.md](docs/frontends.md)

## Dev-порты

| Сервис | Порт |
|--------|------|
| React | `:5173` |
| Next.js | `:3003` |
| Nuxt | `:3004` |
| Vue | `:5173` |
| Backend | `:3001` |

Prod: React — `short-news.ru`, Next — `next.short-news.ru`, Nuxt — `nuxt.short-news.ru`, Vue — `vue.short-news.ru`; API — `/api` через nginx.

## Backend

```
backend/src/modules/
├── auth/       # JWT; роли: user | moderator | admin | super_admin
├── news/       # CRUD, FTS, smart-search, модерация, NewsGateway (WS)
├── ai/         # RSS + DeepSeek, cron, auto-generate
├── datetime/   # WS namespace /api/datetime
└── metrics/    # Prometheus
```

- REST: `/api`, Swagger: `/api/docs`
- WebSocket engine: `/api/socket.io`
- Namespaces: `/api/datetime`, `/api/news` — события `news:published`, `news:pending`
- Статусы новости: `draft → pending → published | rejected → archived`

→ [docs/api.md](docs/api.md) · [docs/ai-generation.md](docs/ai-generation.md)

## Поиск и фильтры ленты

- `GET /api/news?search=&fromDate=&toDate=&category=&isAiGenerated=&tags=`
- FTS: PostgreSQL `search_vector` (title + summary + tags, `russian`)
- `POST /api/news/smart-search` — NL → AI → `NewsFilter`

**UX на всех фронтах** (`NewsListFilters` в каждом пакете):
- видимо: поиск + сортировка
- в выпадающей панели: категория, тип (AI), даты

**Лента `/news`:**
- React, Next, Nuxt, Vue — **infinite scroll** (IntersectionObserver + append страниц)
- React, Next, Nuxt — компактные карточки на **всю ширину** (`NewsListCard` / аналог)
- Nuxt: `NewsCard` (с превью) — главная; `NewsListCard` — `/news`

→ [docs/search.md](docs/search.md) · [docs/frontends.md](docs/frontends.md)

## Аналитика (Яндекс.Метрика)

Счётчик **110884229**, только **production** (в dev не загружается).

| Фронт | Файл |
|-------|------|
| React | `frontend/src/components/YandexMetrika.tsx` |
| Next.js | `frontend-next/src/components/YandexMetrika.tsx` |
| Nuxt | `frontend-nuxt/app/plugins/yandex-metrika.client.ts` |
| Vue | `frontend-vue/src/plugins/yandexMetrika.ts` |

Параметры: webvisor, clickmap, trackLinks, accurateTrackBounce, `ssr: true`.

## Типизация

- Источник правды: `packages/types/src/`
- Локальные `types/` — реэкспорты, **не дублировать** интерфейсы
- WS: `NEWS_WS_EVENTS`, `NewsNotificationPayload` в `packages/types/src/news.ts`
- После правок типов: `npm -w @news-portal/types run build`

→ [docs/types.md](docs/types.md)

## Docker и деплой

- Сборка из **корня** репозитория: `docker compose build`
- **frontend-next:** Turbopack не резолвит `file:../packages/types` — в Dockerfile типы копируются в `frontend-next/packages/types` и подключаются как `file:./packages/types` (только в образе)
- Jest в Next Docker: зафиксирован `30.4.2`; после `npm pkg set` — `npm install`, не `npm ci`

→ [docs/deployment.md](docs/deployment.md)

## Тесты

```bash
npm test                      # backend + React + Next + Nuxt
npm run test:e2e:frontend     # React Playwright
npm run test:e2e              # backend E2E
```

→ [docs/testing.md](docs/testing.md)

## Правила для агента

1. **Минимальный diff** — менять только то, что просят; повторять паттерны соседнего кода в том же пакете.
2. **Типы** — только в `packages/types/src/`, затем rebuild пакета.
3. **Коммиты** — только по явной просьбе пользователя.
4. **Nuxt client API** — всегда `/api` (не `NUXT_PUBLIC_API_BASE` на клиенте).
5. **Next Docker** — не убирать in-container копию `@news-portal/types`.
6. **Мультифронт** — при изменении API/фильтров/типов проверить, какие фронты затронуты; не переносить UI-паттерны между стеками буквально (Ant Design ≠ MUI ≠ PrimeVue ≠ Vuetify).
7. **Backend** — DTO + Swagger на эндпоинтах; server-only типы в `backend/src/types/internal.ts`.

→ [docs/contributing.md](docs/contributing.md)

## Быстрый старт

```bash
npm install
docker compose up -d postgres redis
npm run dev          # или отдельно backend + нужный frontend
```

## Карта docs

| Тема | Файл |
|------|------|
| Архитектура | [docs/architecture.md](docs/architecture.md) |
| API | [docs/api.md](docs/api.md) |
| Поиск / FTS | [docs/search.md](docs/search.md) |
| Фронтенды | [docs/frontends.md](docs/frontends.md) |
| Типы | [docs/types.md](docs/types.md) |
| Деплой | [docs/deployment.md](docs/deployment.md) |
| AI / cron | [docs/ai-generation.md](docs/ai-generation.md) |
| Тесты | [docs/testing.md](docs/testing.md) |
| Contributing | [docs/contributing.md](docs/contributing.md) |

См. также `.cursor/rules/project-map.mdc` — краткая карта с `alwaysApply` для Cursor.

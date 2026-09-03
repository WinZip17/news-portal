# 🔍 Поиск новостей

Два уровня поиска: **обычный** (FTS по API) и **умный** (NL → AI → фильтры → FTS).

## Обычный поиск

**Endpoint:** `GET /api/news`

| Параметр | Описание |
|----------|----------|
| `search` | Полнотекстовый поиск по **заголовку, summary и тегам** (PostgreSQL FTS, конфиг `russian`) |
| `tags` | Фильтр по тегам (один или несколько: `?tags=ai&tags=экономика` или `?tags=ai,экономика`) |
| `category` | Категория (`politics`, `economy`, `technology`, …) |
| `isAiGenerated` | `true` / `false` — только AI или только оригиналы |
| `fromDate`, `toDate` | Период публикации по календарной дате (`YYYY-MM-DD`). Параметры **необязательны** и работают **независимо** друг от друга: можно указать только начало, только конец или диапазон. `toDate` включает указанный день. Сравнение идёт по `publishedAt` в часовом поясе **Europe/Moscow** (как в UI `ru-RU`). |
| `sortBy` | `publishedAt`, `views`, `likes`, `createdAt` |
| `sortOrder` | `ASC` / `DESC` |
| `page`, `limit` | Пагинация |

### PostgreSQL FTS

При старте backend создаётся:

- колонка `news.search_vector` (GENERATED STORED);
- GIN-индекс `idx_news_search_vector`.

Запрос: `search_vector @@ plainto_tsquery('russian', :search)`.

Реализация: `backend/src/modules/news/news.service.ts`, `news-search-index.service.ts`.

## Умный поиск

**Endpoint:** `POST /api/news/smart-search`

Пользователь описывает запрос своими словами. **DeepSeek** (через OpenAI SDK) возвращает JSON с фильтрами; backend **валидирует** их (`sanitizeNewsFilter`) и вызывает тот же `findAll` — **без генерации SQL от модели**.

### Запрос

```json
{
  "query": "AI новости про технологии за последнюю неделю",
  "page": 1,
  "limit": 20
}
```

### Ответ

```json
{
  "data": [...],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 2,
  "appliedFilters": {
    "status": "published",
    "search": "озон",
    "searchVariants": ["Ozon", "ozon", "Озон"],
    "category": "technology",
    "isAiGenerated": true,
    "fromDate": "2026-03-08",
    "toDate": "2026-03-15"
  },
  "source": "ai"
}
```

| Поле | Значение |
|------|----------|
| `appliedFilters` | Фильтры после whitelist (для отладки и UI) |
| `source` | `ai` — распознано моделью; `fallback` — AI недоступен, использован FTS по всему запросу |

### Безопасность

- LLM **не** пишет SQL.
- Разрешены только поля `NewsFilter`: `search`, `searchVariants`, `category`, `tags`, `fromDate`, `toDate`, `isAiGenerated`, `sortBy`, `sortOrder`.
- `searchVariants` — альтернативные написания брендов и имён (кириллица/латиница); в FTS ищутся через **OR** вместе с `search`.
- Backend дополнительно расширяет запрос транслитерацией и известными алиасами (Озон ↔ Ozon, Сбер ↔ Sber и т.д.).
- `status` всегда принудительно `published` для публичного поиска.

### Требования

- `OPENAI_API_KEY` в `.env` backend (DeepSeek API).
- Без ключа работает fallback (`source: "fallback"`).

### Реализация

| Файл | Назначение |
|------|------------|
| `backend/src/modules/news/news-search-ai.service.ts` | Промпт + вызов API |
| `backend/src/modules/news/parse-news-filter.ts` | Whitelist фильтров |
| `packages/types/src/news.ts` | `SmartSearchRequest`, `SmartSearchResponse` |

## Фильтрация по дате

**Query-параметры:** `fromDate`, `toDate` — строки в формате **`YYYY-MM-DD`**.

| Правило | Описание |
|---------|----------|
| Формат | Только календарная дата (`2026-08-19`). ISO-время (`2026-08-19T00:00:00.000Z`) на `GET /api/news` **отклоняется** валидацией DTO |
| Независимость | Можно передать только `fromDate`, только `toDate` или оба |
| `toDate` | Включительно: новости за указанный день попадают в выборку |
| Часовой пояс | Календарная дата считается в **Europe/Moscow** (совпадает с отображением в UI) |
| Поле БД | `publishedAt` |

**Примеры:**

```http
GET /api/news?fromDate=2026-08-01&toDate=2026-08-31
GET /api/news?fromDate=2026-08-19
GET /api/news?toDate=2026-08-19
```

Реализация: `backend/src/modules/news/news-search.utils.ts` (`buildNewsDateRangeSql`, `parseCalendarDate`).

## Фронтенды

| Фронтенд | Обычный поиск | Фильтры `/news` | Infinite scroll | Умный поиск |
|----------|---------------|-----------------|-----------------|-------------|
| React SPA | `GET /api/news?search=` | popover: категория, AI, даты | ✅ | `/search` |
| Next.js | FTS + фильтры | popover (MUI) | ✅ | `/search` |
| Nuxt | FTS на `/news` | popover (OverlayPanel) | ✅ | `/search` |
| Vue SPA | поле «Поиск» | popover (v-menu) | ✅ | — |

## WebSocket

| Namespace | События | Где используется |
|-----------|---------|------------------|
| `/api/datetime` | `datetime` | backend broadcast (демо WS; футер Next — локальное время браузера) |
| `/api/news` | `news:published`, `news:pending` | toast **frontend-next** (`useNewsNotifications`) |

Engine path: `/api/socket.io`. Типы: `NEWS_WS_EVENTS`, `NewsNotificationPayload` в `@news-portal/types`.

Подробнее: [api.md](api.md#websocket), [deployment.md](deployment.md#websocket-apidatetime).

## Связанные документы

- [API](api.md)
- [AI генерация](ai-generation.md)
- [Типизация](types.md)

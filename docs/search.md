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
| `fromDate`, `toDate` | Период публикации (оба параметра обязательны) |
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
    "search": "технологии",
    "category": "technology",
    "isAiGenerated": true,
    "fromDate": "2026-03-08T00:00:00.000Z",
    "toDate": "2026-03-15T23:59:59.999Z"
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
- Разрешены только поля `NewsFilter`: `search`, `category`, `tags`, `fromDate`, `toDate`, `isAiGenerated`, `sortBy`, `sortOrder`.
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

## Фронтенды

| Фронтенд | Обычный поиск | Умный поиск |
|----------|---------------|-------------|
| React SPA | `/news` — поле «Поиск» → `GET /api/news?search=` | — |
| **Next.js** | `/news` — фильтры и FTS | **`/search`** — страница умного поиска |
| Nuxt | `/news` | — |
| Vue SPA | лента без поля поиска | — |

## WebSocket: серверное время

Отдельно от поиска: namespace **`/api/datetime`**, событие `datetime`, формат `DD.MM.YYYY HH:mm:ss`.

Используется в футере **frontend-next** (`useServerDatetime`). Подробнее: [deployment.md](deployment.md#websocket-apidatetime).

## Связанные документы

- [API](api.md)
- [AI генерация](ai-generation.md)
- [Типизация](types.md)

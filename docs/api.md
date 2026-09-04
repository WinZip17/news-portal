# 📡 API Endpoints

TypeScript-контракты запросов и ответов описаны в пакете **`@news-portal/types`**. См. [types.md](types.md).

## Аутентификация

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| POST | /api/auth/register | Регистрация | Все |
| POST | /api/auth/login | Вход | Все |
| POST | /api/auth/refresh | Обновление токена | Все |
| POST | /api/auth/logout | Выход | 🔒 |
| GET | /api/auth/me | Текущий пользователь | 🔒 |
| PUT | /api/auth/profile | Обновление профиля | 🔒 |
| PUT | /api/auth/preferences | Обновление настроек | 🔒 |
| POST | /api/auth/change-password | Смена пароля | 🔒 |
| GET | /api/auth/users | Список пользователей | 🔒 Админ |
| PUT | /api/auth/users/:id | Обновление пользователя | 🔒 Админ |
| DELETE | /api/auth/users/:id | Удаление пользователя | 🔒 Админ |

## Новости

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| GET | /api/news | Список новостей (FTS, фильтры) | Все |
| POST | /api/news/smart-search | Умный поиск (NL → NewsFilter → FTS) | Все |
| GET | /api/news/stats | Статистика | Все |
| GET | /api/news/favorites | Избранное | 🔒 |
| GET | /api/news/:id | Новость по ID | Все |
| POST | /api/news | Создание новости | 🔒 |
| PUT | /api/news/:id | Обновление новости | 🔒 Админ |
| DELETE | /api/news/:id | Удаление новости | 🔒 Админ |
| PATCH | /api/news/:id/moderate | Модерация новости | 🔒 Модер |
| POST | /api/news/:id/like | Лайк/дизлайк | 🔒 |
| GET | /api/news/:id/like/check | Проверка лайка | 🔒 |
| POST | /api/news/:id/favorite | В избранное | 🔒 |
| GET | /api/news/:id/favorite/check | Проверка избранного | 🔒 |
| POST | /api/news/personalized | Персональная лента | 🔒 |

## WebSocket

| Протокол | Путь / namespace | Описание | Доступ |
|----------|------------------|----------|--------|
| Socket.io | `/api/datetime` (engine: `/api/socket.io`) | Серверное время, событие `datetime` каждую 1 с | Все |
| Socket.io | `/api/news` (engine: `/api/socket.io`) | `news:published` — всем; `news:pending` — moderators+ | JWT |

События и payload: `NEWS_WS_EVENTS`, `NewsNotificationPayload` в `packages/types/src/news.ts`.

Подробнее: [deployment.md](deployment.md#websocket-apidatetime), [search.md](search.md#websocket).

## AI Генерация

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| POST | /api/ai/generate | Генерация по категории | 🔒 Админ |
| POST | /api/ai/auto-generate | Генерация по всем категориям | 🔒 Админ |
| GET | /api/ai/status | Статус AI сервиса | 🔒 Админ |
| GET | /api/ai/cron | Текущее расписание крона | 🔒 Суперадмин |
| PUT | /api/ai/cron | Обновление расписания крона | 🔒 Суперадмин |

## Системные

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/health | Проверка работоспособности |
| GET | /api/docs | Swagger документация |
| GET | /api/docs-json | Swagger JSON |
| GET | /api/news/sitemap.xml | Sitemap для поисковиков |
| GET | /api/metrics | Prometheus метрики |

## Параметры фильтрации новостей

| Параметр | Тип | Описание |
|----------|-----|----------|
| page | number | Номер страницы |
| limit | number | Новостей на странице |
| category | string | Категория (politics, economy, technology, science, sports, entertainment, health, world) |
| status | string | Статус (draft, pending, published, rejected, archived) |
| search | string | FTS по **title, summary, tags** (`plainto_tsquery`, russian) |
| tags | string / string[] | Фильтр по тегам (пересечение) |
| sortBy | string | Сортировка (publishedAt, views, likes, createdAt) |
| sortOrder | string | Порядок (ASC, DESC) |
| isAiGenerated | boolean | Только AI-новости |
| hasImage | boolean | Только материалы с реальным `imageUrl` (без SVG-заглушек категорий) |
| fromDate | string | Начало периода включительно (`YYYY-MM-DD`, календарная дата в Europe/Moscow) |
| toDate | string | Конец периода включительно (`YYYY-MM-DD`, календарная дата в Europe/Moscow) |

`fromDate` и `toDate` необязательны и могут использоваться по отдельности. Подробнее: [search.md](search.md#фильтрация-по-дате).

## Умный поиск

**POST** `/api/news/smart-search`

Тело запроса (`SmartSearchRequest`):

```json
{
  "query": "AI новости про технологии за неделю",
  "page": 1,
  "limit": 20
}
```

Ответ (`SmartSearchResponse`): стандартная пагинация + поля `appliedFilters` (распознанные фильтры) и `source` (`ai` | `fallback`).

Подробнее: [search.md](search.md).

## Роли пользователей

| Роль | Права |
|------|-------|
| user | Чтение новостей, лайки, избранное, персонализация |
| moderator | Управление новостями, модерация, AI генерация |
| admin | Полный доступ, управление пользователями |
| super_admin | Всё + управление cron + неудаляемость |

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешно |
| 201 | Создано |
| 400 | Ошибка запроса |
| 401 | Не авторизован |
| 403 | Нет прав |
| 404 | Не найдено |
| 409 | Конфликт (дубликат) |
| 422 | Ошибка валидации |
| 500 | Ошибка сервера |
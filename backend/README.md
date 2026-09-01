# 📰 News Portal - Backend API

Бэкенд для новостного портала с AI-рерайтом контента на основе реальных новостей из RSS источников.

## 🛠 Технологии

- **NestJS** — фреймворк для Node.js
- **TypeScript** — типизация
- **TypeORM** — ORM для работы с базой данных
- **PostgreSQL** — база данных
- **JWT** — аутентификация
- **OpenAI / DeepSeek** — AI генерация контента и умный поиск
- **Socket.io** — WebSocket серверное время
- **RSS Parser** — получение новостей из источников
- **Swagger** — документация API
- **Docker** — контейнеризация
- **@news-portal/types** — общая типизация с фронтендами

## 📦 Установка

npm install — установка зависимостей
cp .env.example .env — создание .env файла
nano .env — настройка переменных окружения

## 🚀 Запуск

npm run start:dev — запуск в режиме разработки
npm run build — продакшн сборка
npm run start:prod — запуск продакшн версии

## 🧪 Тестирование

```bash
npm test              # unit-тесты (Jest)
npm run test:watch    # watch-режим
npm run test:cov      # с покрытием
npm run test:e2e      # E2E (test/jest-e2e.json)
```

Из корня репозитория: `npm run test:backend`, `npm run test:e2e`.  
Общая документация: [docs/testing.md](../docs/testing.md).

## 📡 API Endpoints

### Аутентификация

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| POST | /api/auth/register | Регистрация | Все |
| POST | /api/auth/login | Вход | Все |
| POST | /api/auth/refresh | Обновление токена | Все |
| POST | /api/auth/logout | Выход | 🔒 |
| GET | /api/auth/me | Текущий пользователь | 🔒 |
| PUT | /api/auth/profile | Обновление профиля | 🔒 |
| PUT | /api/auth/preferences | Обновление настроек | 🔒 |
| GET | /api/auth/users | Список пользователей | 🔒 Админ |
| PUT | /api/auth/users/:id | Обновление пользователя | 🔒 Админ |
| DELETE | /api/auth/users/:id | Удаление пользователя | 🔒 Админ |

### Новости

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| GET | /api/news | Список новостей (FTS, фильтры, теги, `fromDate`/`toDate`) | Все |
| POST | /api/news/smart-search | Умный поиск (NL → NewsFilter) | Все |
| GET | /api/news/stats | Статистика | Все |
| GET | /api/news/favorites | Избранное | 🔒 |
| GET | /api/news/:id | Новость по ID | Все |
| POST | /api/news | Создание новости | 🔒 |
| PUT | /api/news/:id | Обновление новости | 🔒 Модер |
| DELETE | /api/news/:id | Удаление новости | 🔒 Админ |
| PATCH | /api/news/:id/moderate | Модерация новости | 🔒 Модер |
| POST | /api/news/:id/like | Лайк/дизлайк | 🔒 |
| GET | /api/news/:id/like/check | Проверка лайка | 🔒 |
| POST | /api/news/:id/favorite | В избранное | 🔒 |
| GET | /api/news/:id/favorite/check | Проверка избранного | 🔒 |
| POST | /api/news/personalized | Персональная лента | 🔒 |

### WebSocket

| Протокол | Namespace | Описание |
|----------|-----------|----------|
| Socket.io | `/api/datetime` | Серверное время, событие `datetime`, engine `/api/socket.io` |
| Socket.io | `/api/news` | Уведомления о новостях, engine `/api/socket.io` |

**Подключение к `/api/news`:**

```javascript
import { io } from 'socket.io-client';

const socket = io('https://short-news.ru/api/news', {
  path: '/api/socket.io',
  auth: { token: accessToken }, // опционально; для модераторов — обязательно
});
```

| Событие | Получатели | Когда |
|---------|------------|-------|
| `news:published` | все подключённые клиенты | новость опубликована (модерация / авто-approve) |
| `news:pending` | moderator, admin, super_admin (комната `moderators`) | создана новость со статусом `pending` |

Payload — тип `NewsNotificationPayload` из `@news-portal/types`: `id`, `title`, `summary`, `category`, `status`, `isAiGenerated`, `publishedAt`, `createdAt` (ISO-строки). Константы событий: `NEWS_WS_EVENTS`.

### AI Генерация

| Метод | Путь | Описание | Доступ |
|-------|------|----------|--------|
| POST | /api/ai/generate | Генерация по категории | 🔒 Админ |
| POST | /api/ai/auto-generate | Генерация по всем категориям | 🔒 Админ |
| GET | /api/ai/status | Статус AI сервиса | 🔒 Админ |

### Системные

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/health | Проверка работоспособности |
| GET | /api/docs | Swagger документация |

### Фильтрация новостей (`GET /api/news`)

Помимо `search`, `category`, `tags`, `isAiGenerated`, `sortBy`, `page`, `limit` поддерживаются **`fromDate`** и **`toDate`** — календарные даты `YYYY-MM-DD` (Europe/Moscow), необязательны и независимы друг от друга. Подробнее: [docs/search.md](../docs/search.md#фильтрация-по-дате).

## 🔑 Роли пользователей

| Роль | Права |
|------|-------|
| user | Чтение новостей, лайки, избранное, персонализация |
| moderator | Управление новостями, модерация, AI генерация |
| admin | Полный доступ, управление пользователями |

## 📰 RSS Источники

Новости собираются из следующих источников:

| Категория | Источники |
|-----------|-----------|
| Технологии | Habr, 3DNews, IXBT |
| Политика | Lenta.ru, РИА Новости, ТАСС |
| Экономика | РБК, Коммерсантъ, Ведомости |
| Наука | N+1, Элементы, Scientific Russia |
| Спорт | Спорт-Экспресс, Чемпионат, Sports.ru |
| Мир | Интерфакс, BBC Russian |

## 🤖 AI Генерация

- Модель: DeepSeek Chat / GPT-3.5-turbo
- Частота: Каждый час по 2 новости на категорию
- Процесс: RSS → проверка дубликатов → AI рерайт → модерация → публикация
- Автоподтверждение: Новости старше 1 часа подтверждаются автоматически

## 🌍 Переменные окружения

```text
DB_HOST=localhost — хост базы данных
DB_PORT=5432 — порт базы данных
DB_USERNAME=postgres — пользователь базы данных
DB_PASSWORD=postgres — пароль базы данных
DB_DATABASE=news_portal — название базы данных
JWT_SECRET=your-secret-key — секретный ключ JWT
JWT_EXPIRES_IN=1d — срок действия токена
JWT_REFRESH_EXPIRES_IN=7d — срок действия рефреш токена
PORT=3001 — порт приложения
NODE_ENV=development — окружение
OPENAI_API_KEY=sk-your-key — ключ API AI
OPENAI_MODEL=deepseek-chat — модель AI
AI_TEMPERATURE=0.7 — температура генерации
AI_MAX_TOKENS=2000 — максимум токенов
AI_GENERATION_INTERVAL=3600000 — интервал генерации (мс)
```

## 📁 Структура проекта

```text
backend/
├── src/
│   ├── config/              # Конфигурации
│   ├── entities/            # Сущности БД
│   │   ├── user.entity.ts   # Пользователь
│   │   ├── news.entity.ts   # Новость
│   │   ├── favorite.entity.ts # Избранное
│   │   └── like.entity.ts   # Лайки
│   ├── modules/
│   │   ├── auth/            # Аутентификация
│   │   ├── news/            # Новости, FTS, smart-search
│   │   │   ├── news-search-index.service.ts  # search_vector + GIN
│   │   │   ├── news-search-ai.service.ts     # NL → NewsFilter
│   │   │   ├── news-search.utils.ts          # FTS, фильтр по дате (Europe/Moscow)
│   │   │   └── parse-news-filter.ts          # whitelist фильтров
│   │   ├── datetime/        # WebSocket /api/datetime
│   │   └── ai/              # AI генерация
│   │       ├── config/      # Конфигурация AI
│   │       ├── dto/         # DTO
│   │       └── services/    # Сервисы RSS, дедупликации
│   ├── types/               # @news-portal/types + internal.ts (RSS, Express)
│   ├── app.module.ts        # Главный модуль
│   ├── app.controller.ts    # Главный контроллер
│   ├── app.service.ts       # Главный сервис
│   └── main.ts              # Точка входа
├── .env                     # Переменные окружения
├── Dockerfile               # Docker образ
├── nest-cli.json            # NestJS CLI конфиг
├── tsconfig.json            # TypeScript конфиг
└── package.json             # Зависимости
```

## 📐 Типизация

Backend использует workspace-пакет **`@news-portal/types`**. Файл `src/types/index.ts` реэкспортирует общие типы; server-only типы (`RssArticle`, `RequestWithUser`, …) — в `src/types/internal.ts`.

Перед сборкой автоматически выполняется `npm -w @news-portal/types run build` (см. `prebuild` в `package.json`).

Документация: [docs/types.md](../docs/types.md) · [docs/search.md](../docs/search.md)

## 🐳 Docker

```text
docker build -t news-portal-backend . — сборка образа
docker run -p 3001:3001 --env-file .env news-portal-backend — запуск контейнера
```
## 📝 Лицензия
MIT
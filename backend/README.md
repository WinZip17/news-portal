# 📰 News Portal - Backend API

Бэкенд для новостного портала с AI-рерайтом контента на основе реальных новостей из RSS источников.

## 🛠 Технологии

- **NestJS** — фреймворк для Node.js
- **TypeScript** — типизация
- **TypeORM** — ORM для работы с базой данных
- **PostgreSQL** — база данных
- **JWT** — аутентификация
- **OpenAI / DeepSeek** — AI генерация контента
- **RSS Parser** — получение новостей из источников
- **Swagger** — документация API
- **Docker** — контейнеризация

## 📦 Установка

npm install — установка зависимостей
cp .env.example .env — создание .env файла
nano .env — настройка переменных окружения

## 🚀 Запуск

npm run start:dev — запуск в режиме разработки
npm run build — продакшн сборка
npm run start:prod — запуск продакшн версии

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
| GET | /api/news | Список новостей | Все |
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
│   │   ├── news/            # Новости
│   │   └── ai/              # AI генерация
│   │       ├── config/      # Конфигурация AI
│   │       ├── dto/         # DTO
│   │       └── services/    # Сервисы RSS, дедупликации
│   ├── types/               # TypeScript типы
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

## 🐳 Docker

```text
docker build -t news-portal-backend . — сборка образа
docker run -p 3001:3001 --env-file .env news-portal-backend — запуск контейнера
```
## 📝 Лицензия

MIT
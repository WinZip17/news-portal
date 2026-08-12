## Настройка окружения

### Требования

- Node.js >= 24
- npm >= 10
- Docker и Docker Compose
- Git

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/WinZip17/news-portal.git
cd news-portal

# Установить все зависимости
npm install

# Запустить базу данных
docker compose up -d postgres redis

# Запустить backend
cd backend
npm run start:dev

# Запустить нужный фронтенд (в другом терминале)
cd frontend
npm run dev
```

## Структура проекта

Монорепозиторий с npm workspaces. Каждый пакет независим:

- `backend/` — NestJS API
- `frontend/` — React SPA
- `frontend-next/` — Next.js
- `frontend-nuxt/` — Nuxt
- `frontend-vue/` — Vue SPA
- `packages/types/` — `@news-portal/types` (общая типизация)

## Типизация

Все клиенты и backend используют пакет **`@news-portal/types`**. Не дублируйте интерфейсы в отдельных фронтендах — добавляйте и меняйте типы в `packages/types/src/`.

```bash
npm -w @news-portal/types run build   # перед сборкой backend
```

Docker-сборка: контекст — **корень репозитория**, типы не дублируются во фронтендах. См. [docs/deployment.md](deployment.md#docker-сборка-и-news-portaltypes).

Документация: [docs/types.md](types.md).

## Правила кода

### Общие

- TypeScript строгий режим
- ESLint + Prettier в каждом пакете
- Именование веток: `feature/описание`, `fix/описание`
- Коммиты на русском или английском

### Backend

- NestJS модульная архитектура
- DTO для всех входных данных
- Swagger декораторы на всех эндпоинтах
- Общие типы — в `@news-portal/types`; server-only — в `backend/src/types/internal.ts`

### Frontend

- Компоненты в папке `components/`
- Страницы в папке `pages/` (или `app/` для Next.js)
- API-запросы через сервисы, не напрямую
- Стили через UI-библиотеку (не CSS модули)
- Импорт типов из `@/types` / `~/types` (реэкспорт `@news-portal/types`)

## Процесс разработки

1. Форкнуть репозиторий
2. Создать ветку от `master`
3. Внести изменения
4. Проверить линтером: `npm run lint`
5. Проверить форматирование: `npm run format`
6. Создать Pull Request

## Тестирование

```bash
# Backend
cd backend
npm test

# Frontend (React)
cd frontend
npm test

# Frontend (Next.js)
cd frontend-next
npm test

# Frontend (Vue)
cd frontend-vue
npm run test:unit
```

## Документация

- API изменения отражать в `docs/api.md`
- Новые фичи описывать в соответствующем разделе документации
- Архитектурные изменения — в `docs/architecture.md`
- Изменения типов API — в `docs/types.md` и `packages/types/`

## Лицензия

MIT

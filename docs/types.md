# 📐 Общая типизация (`@news-portal/types`)

Единый пакет TypeScript-типов для всех фронтендов и backend. Источник правды для контракта API между клиентами и NestJS.

## Расположение

```text
packages/types/
├── package.json
├── tsconfig.build.json
└── src/
    ├── index.ts      # barrel-экспорт
    ├── enums.ts      # NewsCategory, NewsStatus, UserRole
    ├── auth.ts       # User, AuthResponse, DTO пользователя
    ├── news.ts       # News, NewsFilter, NewsStats, ...
    ├── api.ts        # ApiResponse, PaginationParams, ErrorResponse
    └── ai.ts         # AutoGenerateResponse, CronScheduleResponse, ...
```

Пакет подключён как npm workspace. В `package.json` приложений: `"@news-portal/types": "file:../packages/types"`.

## Кто использует

| Пакет | Импорт | Локальная папка `types/` |
|-------|--------|----------------------------|
| `frontend` | `@/types`, `@/types/auth`, `@/types/news` | реэкспорт из `@news-portal/types` |
| `frontend-next` | `@/types` | реэкспорт |
| `frontend-nuxt` | `~/types` | реэкспорт |
| `frontend-vue` | `@/types`, `@/types/auth`, `@/types/news` | реэкспорт |
| `backend` | `../../types` (из `src/types/`) | реэкспорт + backend-only типы |

## Основные типы

### Auth

- `User`, `UserResponse` (алиас), `UsersResponse`
- `LoginCredentials` / `LoginDto` (алиас)
- `RegisterData` / `RegisterDto` (алиас)
- `AuthResponse`, `TokenResponse`, `AuthState`
- `UserPreferences`, `UpdateUserDto`, `JwtPayload`

### News

- `News`, `NewsItem` (алиас)
- `NewsCategory`, `NewsStatus` (enum)
- `NewsFilter`, `NewsResponse`, `NewsStats` / `StatsResponse` (алиас)
  - `NewsFilter.searchVariants?` — альтернативные написания брендов (умный поиск)
- `SmartSearchRequest`, `SmartSearchResponse` — умный поиск (`POST /api/news/smart-search`)
- `ModerationBody`, `CreateNewsDto`

### API / AI

- `ApiResponse<T>`, `PaginationParams`, `ErrorResponse`
- `AutoGenerateResponse`, `CronScheduleResponse`, `AiStatusResponse`

## Примеры импорта

```typescript
// React / Next.js
import type { News, NewsStatus, User } from '@/types';
import type { AutoGenerateResponse } from '@news-portal/types/ai';

// Nuxt
import type { NewsItem, UserResponse } from '~/types';
import { NewsStatus } from '~/types';

// Vue SPA
import type { User } from '@/types/auth';
import { NewsCategory } from '@/types/news';

// Backend (NestJS)
import { NewsFilter, NewsStatus, UserResponse } from '../../types';
```

## Backend-only типы

Специфичные для сервера типы остаются в `backend/src/types/internal.ts`:

- `RequestWithUser`
- `AiRewriteResult`
- `RssFeedItem`, `RssArticle`

Они реэкспортируются через `backend/src/types/index.ts` вместе с `@news-portal/types`.

## Сборка

Фронтенды резолвят исходники из `src/` (Vite, Next, Nuxt).

Backend использует скомпилированный CommonJS из `dist/` (enum'ы нужны в runtime):

```bash
# Сборка типов
npm -w @news-portal/types run build

# Backend собирает типы автоматически в prebuild
npm -w backend run build
```

## Docker и деплой

`@news-portal/types` **не берётся из npm registry**. При `npm install` внутри контейнера без `COPY packages/types` будет ошибка 404.

**Единственный источник типов в репозитории:** `packages/types/`. Во фронтендах нет своих копий пакета — локальные папки `types/` только реэкспортируют `@news-portal/types`.

| Окружение | Как подключаются типы |
|-----------|------------------------|
| Монорепозиторий (`npm install` в корне) | `file:../packages/types` через workspace |
| Docker (backend, React, Nuxt, Vue) | `COPY packages/types` из корня репозитория |
| Docker (**frontend-next**) | то же + **внутри образа** копия в `frontend-next/packages/types` для Turbopack |

### Почему у Next.js дополнительный шаг в Dockerfile

Turbopack не резолвит зависимость, если она указывает **вне** корня Next.js (`../packages/types`). В Dockerfile типы копируются внутрь контейнера (`cp -r /app/packages/types ./packages/types`), путь меняется на `file:./packages/types`. На диске разработчика и в git этого каталога нет.

Подробнее: [deployment.md](deployment.md#docker-сборка-и-news-portaltypes).

### TypeScript в Docker

В `packages/types` используется TypeScript 5.x. Опция `"ignoreDeprecations": "6.0"` в `tsconfig.build.json` не применяется — она доступна только в TS 6+.

## Правила изменений

1. **Новые поля API** — добавлять в `packages/types/src/`, не дублировать в каждом фронтенде.
2. **Алиасы** — сохранять для совместимости (`UserResponse`, `NewsItem`, `LoginDto`).
3. **Enum'ы** — только в `enums.ts`; реэкспортировать из `auth.ts` / `news.ts` при необходимости.
4. **Backend-only** — RSS, Express, внутренние DTO сервера — в `backend/src/types/internal.ts`.
5. **Проверка** — после изменений запускать type-check / build затронутых пакетов.

## Связанные документы

- [Архитектура](architecture.md)
- [Поиск новостей](search.md)
- [Фронтенды](frontends.md)
- [Как помочь проекту](contributing.md)
- [Деплой](deployment.md)

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

Пакет подключён как npm workspace: `"@news-portal/types": "1.0.0"`.

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

При деплое `@news-portal/types` **не берётся из npm registry** — пакет копируется из `packages/types` (Docker-контекст — корень репозитория). Зависимость: `"file:../packages/types"`.

## Правила изменений

1. **Новые поля API** — добавлять в `packages/types/src/`, не дублировать в каждом фронтенде.
2. **Алиасы** — сохранять для совместимости (`UserResponse`, `NewsItem`, `LoginDto`).
3. **Enum'ы** — только в `enums.ts`; реэкспортировать из `auth.ts` / `news.ts` при необходимости.
4. **Backend-only** — RSS, Express, внутренние DTO сервера — в `backend/src/types/internal.ts`.
5. **Проверка** — после изменений запускать type-check / build затронутых пакетов.

## Связанные документы

- [Архитектура](architecture.md)
- [Фронтенды](frontends.md)
- [Как помочь проекту](contributing.md)
- [Деплой](deployment.md)

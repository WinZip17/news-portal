# 🧪 Тестирование

В проекте используются unit/integration-тесты (Jest, Vitest) и E2E-тесты (Playwright для React SPA, Jest для backend).

## Быстрые команды (корень репозитория)

```bash
npm test                    # backend (Jest) + frontend (Vitest) + frontend-next (Jest)
npm run test:backend        # только backend
npm run test:frontend       # только frontend (Vitest, watch по умолчанию)
npm run test:frontend-next  # только frontend-next (Jest, CI-режим)
npm run test:e2e            # backend E2E (Jest + supertest)
npm run test:e2e:frontend   # React SPA E2E (Playwright)
npm run test:e2e:frontend-next   # Next.js E2E (Playwright)
```

## Backend (NestJS + Jest)

```bash
cd backend
npm test              # unit-тесты
npm run test:watch    # watch-режим
npm run test:cov      # с покрытием
npm run test:e2e      # E2E через test/jest-e2e.json
```

Тесты лежат рядом с кодом (`*.spec.ts`) и в каталоге `test/`.

## React SPA (Vitest + Playwright)

Основной фронтенд (`frontend/`) покрыт двумя уровнями тестов.

### Unit и integration (Vitest)

- **Vitest** + **Testing Library** + **jsdom**
- **MSW** — мок HTTP API (`src/test-utils/msw/`)
- **renderWithProviders** — обёртка с Redux, Router, QueryClient (`src/test-utils/renderWithProviders.tsx`)
- Настройка окружения: `src/test-setup.ts` (ResizeObserver, matchMedia, IntersectionObserver для Ant Design)

```bash
cd frontend
npm test              # Vitest (интерактивный)
npm run test:watch    # watch-режим
npm run test:ci       # один прогон (CI)
npm run test:cov      # с покрытием (v8)
```

Покрытие: slices, services, hooks, компоненты, страницы (`src/**/__tests__/`).

### E2E (Playwright)

- Каталог: `frontend/e2e/`
- Конфиг: `playwright.config.ts`
- Vite поднимается автоматически (`webServer` на `127.0.0.1:5173`)
- API мокается в браузере через `page.route` — **backend не нужен** (`e2e/mocks/`)

```bash
cd frontend
npm run test:e2e:install   # скачать Chromium (один раз после установки)
npm run test:e2e           # install chromium + прогон 8 тестов
npm run test:e2e:ui        # UI-режим Playwright
npm run test:e2e:report    # HTML-отчёт
```

Сценарии E2E:

| Файл | Что проверяет |
|------|----------------|
| `e2e/login.spec.ts` | Валидация формы, успешный вход, ошибка API |
| `e2e/home-modal.spec.ts` | Модалка новости с карточки и по deep link `?news=id` |
| `e2e/smart-search.spec.ts` | Страница `/search`, умный поиск, примеры запросов |

Артефакты Playwright (`playwright-report/`, `test-results/`, `*.tsbuildinfo`) в git не коммитятся — см. `frontend/.gitignore`.

> **Windows:** при ошибке `Executable doesn't exist` выполните `npm run test:e2e:install` в каталоге `frontend`.

## Next.js (Jest)

Next.js фронтенд (`frontend-next/`) покрыт unit/integration-тестами на **Jest**.

- **Jest** + **next/jest** + **jest-fixed-jsdom**
- **Testing Library** + **user-event**
- **axios-mock-adapter** — мок HTTP API (`src/test-utils/mockApi.ts`)
- **renderWithProviders** — обёртка с Redux и MUI ThemeProvider (`src/test-utils/renderWithProviders.tsx`)
- Настройка окружения: `jest.setup.ts` (jest-dom, ResizeObserver, matchMedia, localStorage)

```bash
cd frontend-next
npm test              # Jest (интерактивный)
npm run test:watch    # watch-режим
npm run test:ci       # один прогон (CI)
npm run test:cov      # с покрытием
```

Покрытие: utils, Redux slices, services, hooks, компоненты, все страницы App Router (`src/app/**/__tests__/`).

### E2E (Playwright)

```bash
cd frontend-next
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:ui        # UI-режим (trace: on, страница видна в превью)
```

Каталог `frontend-next/e2e/`, API мокается через `page.route` — backend не нужен.

| Файл | Что проверяет |
|------|----------------|
| `e2e/login.spec.ts` | Валидация, вход, ошибка API |
| `e2e/home-modal.spec.ts` | Модалка новости с главной |
| `e2e/smart-search.spec.ts` | Умный поиск |
| `e2e/news.spec.ts` | Лента новостей и фильтры |

## Nuxt, Vue

| Пакет | Команда | Стек |
|-------|---------|------|
| `frontend-vue` | `npm run test:unit` | Vitest |
| `frontend-nuxt` | `npm run test:ci` | Vitest + `@nuxt/test-utils` (unit + stores/middleware) |

## CI и pre-commit

Перед Pull Request:

```bash
npm run lint
npm run format:check
npm run test:frontend -- --run   # или cd frontend && npm run test:ci
npm run test:frontend-next       # при изменениях Next.js
npm run test:e2e:frontend        # при изменениях UI/E2E (React SPA)
npm run test:e2e:frontend-next   # при изменениях UI/E2E (Next.js)
```

Корневой `npm test` не запускает Playwright E2E — используйте `test:e2e:frontend` и `test:e2e:frontend-next`.

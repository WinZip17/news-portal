# 📰 News Portal - Frontend

Фронтенд для новостного портала с AI-рерайтом. Быстрые и короткие новости без манипуляций.

## 🛠 Технологии

- **React 19** + **TypeScript**
- **Vite** — сборка и dev-сервер
- **Redux Toolkit** — управление состоянием
- **TanStack Query** — серверное состояние
- **Ant Design 6** — UI-компоненты
- **Axios** — HTTP-клиент
- **React Router 7** — маршрутизация
- **Vitest** + **Testing Library** + **MSW** — unit/integration-тесты
- **Playwright** — E2E-тесты

## 🚀 Быстрый старт

```bash
npm install          # установка зависимостей
npm run dev          # режим разработки → http://localhost:5173
npm run build        # сборка для продакшена
npm run preview      # предпросмотр сборки
```

## 📁 Структура проекта

```text
frontend/
├── e2e/                     # Playwright E2E-тесты
│   ├── mocks/               # page.route — мок API в браузере
│   ├── login.spec.ts
│   ├── home-modal.spec.ts
│   └── smart-search.spec.ts
├── public/
│   ├── favicon.svg
│   └── manifest.json        # PWA
├── src/
│   ├── components/          # Переиспользуемые компоненты (NewsListFilters, YandexMetrika, …)
│   ├── config/              # Роуты
│   ├── hooks/               # Пользовательские хуки
│   ├── pages/               # Страницы (+ __tests__/)
│   ├── services/            # API-сервисы
│   ├── store/               # Redux (auth, news, ui)
│   ├── test-utils/          # renderWithProviders, MSW handlers
│   ├── types/               # Реэкспорт @news-portal/types
│   ├── test-setup.ts        # Vitest: MSW, DOM polyfills
│   ├── App.tsx
│   └── main.tsx
├── playwright.config.ts     # Playwright (webServer + Chromium)
├── tsconfig.node.json       # TS для vite.config, playwright, e2e
├── vite.config.ts
└── package.json
```

## 📄 Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | Главная | Все |
| /news | Лента: фильтры (popover), infinite scroll, FTS, даты | Все |
| /news?news=id | Новость в модалке | Все |
| /search | Умный поиск (NL → `POST /api/news/smart-search`) | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Админ/Модер |

## 🧪 Тестирование

Подробнее: [docs/testing.md](../docs/testing.md)

### Unit / integration (Vitest)

```bash
npm test              # интерактивный Vitest
npm run test:watch    # watch-режим
npm run test:ci       # один прогон (CI)
npm run test:cov      # с покрытием
```

MSW перехватывает `/api/**` в тестах; компоненты рендерятся через `renderWithProviders`.

## 📊 Аналитика

Яндекс.Метрика (`YandexMetrika.tsx`, счётчик **110884229**) — только в production-сборке.

### E2E (Playwright)

```bash
npm run test:e2e:install   # Chromium (после npm install)
npm run test:e2e           # 8 сценариев, backend не нужен
npm run test:e2e:ui        # UI Playwright
npm run test:e2e:report    # HTML-отчёт
```

Vite стартует автоматически; API мокается в `e2e/mocks/api.ts`.

## 📐 Типизация

TypeScript-типы импортируются из **`@news-portal/types`** (монорепозиторий, `packages/types/`). Локальная папка `src/types/` — реэкспорт для алиаса `@/types`.

```typescript
import type { News, User } from '@/types';
```

Документация: [docs/types.md](../docs/types.md) · [docs/search.md](../docs/search.md)

## 🔧 Разработка

```bash
npm run dev           # dev-сервер
npm run lint          # ESLint
npm run format        # Prettier
npm run build         # production-сборка
```

## 🐳 Docker

```bash
docker build -t news-portal-frontend .
docker run -p 80:80 news-portal-frontend
```

## 📝 Лицензия

MIT

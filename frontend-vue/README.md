# 💚 News Portal - Vue SPA Frontend

Фронтенд на Vue 3 для новостного портала. Четвёртый по счёту фронтенд в монорепозитории.

## 🛠 Технологии

- **Vue 3** — Composition API + `<script setup>`
- **TypeScript** — типизация
- **Vite** — сборка
- **Pinia** — управление состоянием
- **Vue Router 5** — маршрутизация
- **Vuetify 4** — UI компоненты (Material Design)
- **Axios** — HTTP клиент
- **@unhead/vue** — SEO мета-теги

## 🚀 Быстрый старт

```text
npm install — установка зависимостей
npm run dev — запуск в режиме разработки (порт 5173)
npm run build — сборка для продакшена
npm run preview — предпросмотр сборки

Приложение будет доступно на http://localhost:5173
```

## 📁 Структура проекта

```text
frontend-vue/
├── public/                  # Статические файлы
├── src/
│   ├── api/                 # HTTP клиент и интерсепторы
│   │   ├── client.ts        # Axios инстанс
│   │   └── interceptors.ts  # Перехватчики запросов
│   ├── assets/
│   │   ├── main.css         # Глобальные стили
│   │   ├── utilities.css    # Утилитарные классы
│   │   └── newspaper.css    # Газетная тема (только главная /)
│   ├── components/
│   │   ├── common/          # Общие (FrameworkSwitcher)
│   │   ├── newspaper/       # Masthead, Nav, Teaser, Lead, Article, Brief, DetailDialog
│   │   └── news/            # NewsCard, NewsListFilters, NewsDetailModal (/news)
│   ├── composables/
│   │   └── useHomeNews.ts   # hasImage=true, stats, provide/inject для HomeLayout
│   ├── constants/
│   │   ├── homeNews.ts      # HOME_NEWS_TARGET = 15
│   │   └── theme.ts         # Material + watchDark (газета)
│   ├── layouts/
│   │   ├── HomeLayout.vue   # Газетная оболочка (/)
│   │   └── MainLayout.vue   # Vuetify sidebar (остальные маршруты)
│   ├── pages/
│   │   ├── HomeView.vue     # Вёрстка газетного выпуска
│   │   ├── NewsView.vue     # Лента новостей
│   │   ├── SearchView.vue   # Умный поиск
│   │   ├── LoginView.vue    # Вход
│   │   ├── RegisterView.vue # Регистрация
│   │   ├── ProfileView.vue  # Личный кабинет
│   │   ├── AdminView.vue    # Админ-панель
│   │   └── NotFoundView.vue # 404
│   ├── plugins/
│   │   ├── theme.ts         # Vuetify Material light/dark
│   │   ├── vuetify.ts       # Конфигурация Vuetify
│   │   └── yandexMetrika.ts # Яндекс.Метрика (prod-only)
│   ├── router/              # Маршруты и guards
│   ├── services/            # auth.service, news.service
│   ├── stores/              # auth, news, ui
│   ├── types/               # Реэкспорт @news-portal/types
│   ├── App.vue              # HomeLayout vs MainLayout + sync Vuetify theme
│   └── main.ts              # Точка входа
├── e2e/                     # Playwright (порт 5174)
├── test/                    # Vitest (~122 теста)
├── Dockerfile
├── nginx.conf
├── vite.config.ts
└── package.json
```

## 📄 Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | **Газетная главная** — lead, тизеры, колонки, stats в masthead | Все |
| /news | Лента: NewsListFilters (popover), infinite scroll, FTS, даты | Все |
| /search | Умный поиск (NL → AI → фильтры) | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Модер/Админ |

## 🗞 Газетная главная (`/`)

Главная — отдельный UI, не Vuetify-карточки:

- **`HomeLayout`** — masthead, nav, footer; stats через `NewspaperMastheadStats`
- **`useHomeNews()`** — один запрос `GET /api/news?hasImage=true&limit=15&sortBy=publishedAt&sortOrder=DESC` + параллельно `/api/news/stats`
- **Тема newsprint / watch** — только на `/` (класс `.newspaper-layout--watch`); на `/news` и др. — стандартный Vuetify Material light/dark
- **`NewspaperDetailDialog`** — модалка материала (teleport; локальные CSS-переменные)
- **Адаптив** — mobile-first: lead → тизеры → колонки → «Коротко»

Подробнее: [docs/frontends.md](../docs/frontends.md)

## 📐 Типизация

Используется **`@news-portal/types`**. Локальные `@/types/auth` и `@/types/news` — реэкспорты.

```typescript
import type { User } from '@/types/auth';
import { NewsStatus, type News } from '@/types/news';
```

Документация: [docs/types.md](../docs/types.md) · [docs/search.md](../docs/search.md)

## 🔧 Особенности

- **Два layout:** `HomeLayout` (/) и `MainLayout` (остальное) — переключение в `App.vue`
- Material Design (Vuetify 4) на `/news`, `/search`, профиле, админке
- Тёмная «watch»-газета **только на главной**; Vuetify dark/light — на остальных страницах
- Адаптивный сайдбар в `MainLayout` (постоянный на десктопе, временный на мобильных)
- JWT авторизация с автообновлением токена
- Infinite scroll в ленте `/news` (IntersectionObserver + `loadMore` в store)
- Фильтры: поиск + сортировка видимо; категория, AI, даты — в v-menu
- Яндекс.Метрика (prod, счётчик 110884229)
- SEO через @unhead/vue

## 🧪 Тестирование

```bash
npm test              # Vitest, один прогон (~122 теста)
npm run test:watch    # watch-режим
npm run test:ci       # CI
npm run test:e2e      # Playwright E2E (9 тестов, порт 5174)
npm run test:e2e:ui   # UI-режим Playwright
```

Структура `test/`:

- `unit/` — утилиты, theme (Material vs watch), Metrika
- `composables/` — `hasNewsImage`
- `stores/` — Pinia (`auth`, `news`, `ui`)
- `services/` — `auth.service`, `news.service`
- `router/` — guards
- `components/` — `NewsListFilters`, `NewsCard`, `NewsDetailModal`, `NewspaperMastheadStats`
- `layouts/` — `MainLayout`
- `pages/` — `HomeView` (газета), `NewsView`, `SearchView`, …
- `fixtures/mocks.ts`, `utils/mountWithProviders.ts`

E2E (`e2e/`): login, газетная главная + modal, smart search, news feed — API мокается в браузере, backend не нужен.

Подробнее: [docs/testing.md](../docs/testing.md)

## 🐳 Docker

```text
docker build -t news-portal-vue . — сборка образа
docker run -p 80:80 news-portal-vue — запуск контейнера
```

## 📝 Лицензия

MIT

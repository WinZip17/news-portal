# 🎨 Фронтенды

Проект включает 4 фронтенда на разных технологиях. Все используют один API и **общий пакет типов** `@news-portal/types`.

> 📐 Подробнее о типизации: [types.md](types.md)

## Сравнение

| | React SPA | Next.js | Nuxt | Vue SPA |
|---|---|---|---|---|
| **Порт** | 80/443 | 3003 | 3004 | 80 (внутри) |
| **Домен** | short-news.ru | next.short-news.ru | nuxt.short-news.ru | vue.short-news.ru |
| **UI библиотека** | Ant Design 5 | MUI 6 | PrimeVue 4 | Vuetify 4 |
| **State management** | Redux Toolkit | Redux Toolkit | Pinia | Pinia |
| **Роутинг** | React Router 7 | Next.js App Router | Vue Router 5 | Vue Router 5 |
| **Сборка** | Vite | Next.js | Nuxt | Vite |
| **SSR** | ❌ | ✅ | ✅ | ❌ |
| **CSS решение** | Ant Design | MUI System | PrimeVue + CSS | Vuetify + CSS |
| **Типы** | `@/types` → `@news-portal/types` | `@/types` | `~/types` | `@/types` |
| **Поиск** | FTS `/news` + умный `/search` + фильтр по дате | FTS `/news` + умный `/search` + фильтр по дате | FTS `/news` + умный `/search` + фильтр по дате | FTS `/news` + фильтр по дате |
| **Лента `/news`** | Infinite scroll, full-width cards | Infinite scroll, full-width cards | Infinite scroll, `NewsListCard` | Infinite scroll, full-width cards |
| **WS toast** | — | `news:published` / `news:pending` | — | — |
| **Яндекс.Метрика** | ✅ prod | ✅ prod | ✅ prod | ✅ prod |
| **Тесты** | Vitest + Playwright E2E | Jest + Playwright E2E | Vitest | Vitest (unit + stores + components) |

> 🔍 Подробнее: [search.md](search.md)

## React SPA (основной)

- Статус: **production**
- Домен: https://short-news.ru
- Стек: React 19, TypeScript, Redux Toolkit, Ant Design 5, Vite, PWA

### Особенности
- Полноценный админ-интерфейс с модерацией
- Поиск по ленте (`/news?search=`) — FTS через `GET /api/news`
- Фильтр по дате публикации на `/news` (`fromDate`, `toDate` в формате `YYYY-MM-DD`)
- Умный поиск на `/search` — `POST /api/news/smart-search`
- Инфинити-скролл в ленте новостей
- Фильтры: поиск + сортировка видимо; категория, AI, даты — в выпадающей панели (`NewsListFilters`)
- Ленивая загрузка страниц (React.lazy)
- Service Worker для PWA
- SEO через react-helmet-async
- **Яндекс.Метрика** (prod, `YandexMetrika.tsx`, счётчик 110884229)
- **Тесты:** Vitest + MSW (unit/integration), Playwright E2E — см. [testing.md](testing.md)

### Структура
```
frontend/
├── e2e/              # Playwright E2E
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── test-utils/   # renderWithProviders, MSW
│   ├── types/
│   └── utils/
└── playwright.config.ts
```

## Next.js

- Статус: **production**
- Домен: https://next.short-news.ru
- Стек: Next.js 16, TypeScript, Redux Toolkit, MUI 6

### Особенности
- Server-Side Rendering (SSR)
- App Router
- Material Design (MUI)
- **`/search`** — умный поиск (NL → `POST /api/news/smart-search`)
- **`/news`** — FTS, фильтры (popover), infinite scroll, full-width cards
- Toast-уведомления о новых/опубликованных новостях (WS `/api/news`, `NewsNotifications`)
- Локальное время пользователя в футере (хук `useServerDatetime`)
- **Яндекс.Метрика** (prod, `YandexMetrika.tsx`)
- Клиентский layout отделён от серверного
- CSS-in-JS через MUI
- **Docker:** общий контекст корня репозитория; копия типов только внутри образа из‑за Turbopack ([deployment.md](deployment.md#docker-сборка-и-news-portaltypes))

### Структура
```
frontend-next/src/
├── app/           # App Router страницы (/, /news, /search, …)
├── components/    # NewsListFilters, NewsNotifications, YandexMetrika, …
├── hooks/         # useServerDatetime, useNewsNotifications
├── services/      # API сервисы (newsService.smartSearch)
├── store/         # Redux store
├── types/         # Реэкспорт @news-portal/types
└── theme.ts       # MUI тема
```

## Nuxt

- Статус: **production**
- Домен: https://nuxt.short-news.ru
- Стек: Nuxt 4, Vue 3, Pinia, PrimeVue 4

### Особенности
- Server-Side Rendering (SSR)
- Автоимпорты компонентов
- Тема через CSS-переменные PrimeVue
- Pinia Plugin Persistedstate
- Лента `/news`: FTS, `NewsListFilters` (popover), infinite scroll, **`NewsListCard`** (полная ширина)
- Главная `/`: сетка **`NewsCard`** с превью изображений
- Умный поиск `/search` (infinite scroll)
- Теги новостей: нейтральная схема `.news-tag` / `--news-tag-*` (light + dark)
- **Яндекс.Метрика** (prod, `app/plugins/yandex-metrika.client.ts`)

### Структура
```
frontend-nuxt/
├── app/
│   ├── components/news/
│   │   ├── NewsCard.vue         # карточка с превью (главная)
│   │   ├── NewsListCard.vue     # компактная карточка (/news)
│   │   ├── NewsListFilters.vue
│   │   └── NewsDetailModal.vue
│   ├── plugins/yandex-metrika.client.ts
│   └── pages/news/index.vue
├── composables/
├── services/
├── stores/
└── app/types/     # Реэкспорт @news-portal/types
```

## Vue SPA

- Статус: **development**
- Домен: https://vue.short-news.ru
- Стек: Vue 3, Pinia, Vuetify 4, Vite

### Особенности
- Material Design (Vuetify)
- Pinia для управления состоянием
- Адаптивный сайдбар
- Поддержка тёмной темы
- Лента `/news`: `NewsListFilters` (popover), infinite scroll, full-width cards
- **Яндекс.Метрика** (prod, `src/plugins/yandexMetrika.ts`)

### Структура
```
frontend-vue/src/
├── components/news/   # NewsCard, NewsListFilters, NewsDetailModal
├── plugins/yandexMetrika.ts
├── pages/         # Страницы
├── plugins/       # Плагины
├── router/        # Vue Router
├── services/      # API сервисы
├── stores/        # Pinia stores
├── types/         # Реэкспорт @news-portal/types
└── utils/         # Утилиты
```

## Переключение между фронтендами

Каждый фронтенд содержит компонент `FrameworkSwitcher` — нативный `<select>` для переключения между версиями. Выбранный фронтенд передаётся через проп `current`.

```html
<select aria-label="Выбор фреймворка">
  <option value="react">⚛️ React SPA</option>
  <option value="next">🔵 Next.js</option>
  <option value="nuxt">🟣 Nuxt</option>
  <option value="vue">💚 Vue SPA</option>
</select>
```
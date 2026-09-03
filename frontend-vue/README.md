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
│   ├── assets/              # Стили
│   │   ├── main.css         # Глобальные стили
│   │   └── utilities.css    # Утилитарные классы
│   ├── components/          # Vue компоненты
│   │   ├── common/          # Общие (FrameworkSwitcher)
│   │   └── news/            # NewsCard, NewsListFilters, NewsDetailModal
│   ├── constants/           # Константы
│   │   └── theme.ts         # Цвета темы
│   ├── layouts/             # Layout компоненты
│   │   └── MainLayout.vue   # Главный layout
│   ├── pages/               # Страницы
│   │   ├── HomeView.vue     # Главная
│   │   ├── NewsView.vue     # Лента новостей
│   │   ├── LoginView.vue    # Вход
│   │   ├── RegisterView.vue # Регистрация
│   │   ├── ProfileView.vue  # Личный кабинет
│   │   ├── AdminView.vue    # Админ-панель
│   │   └── NotFoundView.vue # 404
│   ├── plugins/             # Плагины
│   │   ├── theme.ts         # Тема Vuetify
│   │   ├── vuetify.ts       # Конфигурация Vuetify
│   │   └── yandexMetrika.ts # Яндекс.Метрика (prod-only)
│   ├── router/              # Vue Router
│   │   └── index.ts         # Маршруты и guards
│   ├── services/            # API сервисы
│   │   ├── auth.service.ts  # Авторизация
│   │   └── news.service.ts  # Новости
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts          # Авторизация
│   │   ├── news.ts          # Новости
│   │   └── ui.ts            # UI (тема)
│   ├── types/               # Реэкспорт @news-portal/types
│   │   ├── auth.ts
│   │   └── news.ts
│   ├── App.vue              # Корневой компонент
│   └── main.ts              # Точка входа
├── Dockerfile               # Docker образ
├── nginx.conf               # Nginx конфиг
├── vite.config.ts           # Vite конфиг
├── tsconfig.json            # TypeScript конфиг
└── package.json             # Зависимости
```

## 📄 Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | Главная | Все |
| /news | Лента: NewsListFilters (popover), infinite scroll, FTS, даты | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Модер/Админ |

## 📐 Типизация

Используется **`@news-portal/types`**. Локальные `@/types/auth` и `@/types/news` — реэкспорты.

```typescript
import type { User } from '@/types/auth';
import { NewsStatus, type News } from '@/types/news';
```

Документация: [docs/types.md](../docs/types.md) · [docs/search.md](../docs/search.md)

## 🔧 Особенности

- Material Design (Vuetify 4)
- Тёмная/светлая тема с синхронизацией через Pinia
- Адаптивный сайдбар (постоянный на десктопе, временный на мобильных)
- JWT авторизация с автообновлением токена
- Infinite scroll в ленте `/news` (IntersectionObserver + `loadMore` в store)
- Фильтры: поиск + сортировка видимо; категория, AI, даты — в v-menu
- Яндекс.Метрика (prod, счётчик 110884229)
- SEO через @unhead/vue

## 🧪 Тестирование

```bash
npm test              # Vitest, один прогон
npm run test:watch    # watch-режим
npm run test:ci       # CI
```

Структура `test/`:

- `unit/` — утилиты (`formatDate`, категории, Metrika)
- `stores/` — Pinia (`auth`, `news` с infinite scroll, `ui`)
- `components/` — `NewsListFilters` (Vuetify stubs)
- `fixtures/mocks.ts` — общие моки API-типов
- `utils/mountWithProviders.ts` — mount с Pinia + Router

Подробнее: [docs/testing.md](../docs/testing.md)

## 🐳 Docker

```text
docker build -t news-portal-vue . — сборка образа
docker run -p 80:80 news-portal-vue — запуск контейнера
```

## 📝 Лицензия

MIT
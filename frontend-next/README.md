# 🔵 News Portal - Next.js Frontend

Фронтенд на Next.js с Material-UI для новостного портала. Третий по счёту фронтенд в монорепозитории.

## 🛠 Технологии

- **Next.js 16** — React фреймворк с App Router
- **TypeScript** — типизация
- **Redux Toolkit** — управление состоянием
- **Material-UI (MUI) 6** — UI компоненты
- **Axios** — HTTP клиент
- **ESLint + Prettier** — линтинг и форматирование

## 🚀 Быстрый старт

```text
npm install — установка зависимостей
npm run dev — запуск в режиме разработки (порт 3003)
npm run build — сборка для продакшена
npm start — запуск продакшен версии
npm test — unit-тесты (Jest)
npm run test:ci — один прогон для CI
npm run test:cov — с покрытием
```

Приложение будет доступно на http://localhost:3003

## 📁 Структура проекта
```text

frontend-next/
├── public/                  # Статические файлы
├── src/
│   ├── app/                 # App Router страницы
│   │   ├── layout.tsx       # Корневой layout с темой и Redux
│   │   ├── page.tsx         # Главная страница
│   │   ├── news/page.tsx    # Лента новостей (FTS, фильтры)
│   │   ├── search/page.tsx  # Умный поиск (NL)
│   │   ├── login/page.tsx   # Вход
│   │   ├── register/page.tsx # Регистрация
│   │   ├── profile/page.tsx # Личный кабинет
│   │   └── admin/page.tsx   # Админ-панель
│   ├── components/          # React компоненты
│   │   ├── MainLayout.tsx        # Layout + серверное время в футере
│   │   ├── NewsDetail.tsx        # Детальный просмотр новости
│   │   └── FrameworkSwitcher.tsx  # Переключатель фреймворков
│   ├── hooks/               # React хуки
│   │   └── useServerDatetime.ts  # WebSocket /api/datetime
│   ├── services/            # API сервисы
│   │   ├── api.ts                # HTTP клиент (Axios)
│   │   ├── authService.ts        # Авторизация
│   │   └── newsService.ts        # Новости
│   ├── store/               # Redux Toolkit
│   │   ├── index.ts              # Конфигурация store
│   │   ├── auth/authSlice.ts     # Авторизация
│   │   ├── news/newsSlice.ts     # Новости
│   │   └── ui/uiSlice.ts         # UI (тема)
│   ├── types/               # Реэкспорт @news-portal/types
│   ├── utils/               # Утилиты
│   ├── test-utils/          # Jest: mockApi, fixtures, renderWithProviders
│   └── theme.ts             # MUI тема (light/dark)
├── jest.config.ts           # Jest + next/jest
├── jest.setup.ts            # jest-dom, jsdom polyfills
├── tsconfig.spec.json       # типы Jest для IDE
├── Dockerfile               # Docker образ
├── next.config.ts           # Конфигурация Next.js
├── .prettierrc              # Настройки Prettier
├── eslint.config.mjs        # Конфигурация ESLint
├── tsconfig.json            # TypeScript конфиг
└── package.json             # Зависимости

```
## 📄 Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | Главная | Все |
| /news | Лента новостей (FTS, фильтры) | Все |
| /search | Умный поиск (NL → AI) | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Модер/Админ |

## 📐 Типизация

Общие типы — пакет **`@news-portal/types`**. Импорт через `@/types`:

```typescript
import type { News, NewsStatus, User } from '@/types';
```

Документация: [docs/types.md](../docs/types.md) · [docs/search.md](../docs/search.md)

## 🔌 WebSocket и API

- **Серверное время** — футер через `useServerDatetime`: Socket.io namespace `/api/datetime`, path `/api/socket.io`
- **Умный поиск** — `newsService.smartSearch()` → `POST /api/news/smart-search`
- **Обычный поиск** — `GET /api/news?search=&tags=&category=...` на странице `/news`

## 🎨 Особенности дизайна

- Material-UI с кастомной темой
- Тёмный/светлый режим
- Адаптивный сайдбар с мобильным меню
- Карточки новостей с чипсами категорий
- Модальные окна для редактирования
- Тулы для длинных заголовков

## 🔧 Прокси API

В next.config.ts настроены rewrites:

/api/:path* → http://localhost:3001/api/:path*

На проде запросы идут через nginx на основном домене.

## 🧪 Тестирование

Unit/integration-тесты на **Jest** + **Testing Library**. E2E — **Playwright**. HTTP API мокается в unit-тестах через `axios-mock-adapter`, в E2E — через `page.route`.

```bash
npm test              # Jest (интерактивный)
npm run test:ci       # Jest, один прогон (CI)
npm run test:cov      # Jest с покрытием
npm run test:e2e      # Playwright E2E
npm run test:e2e:ui   # Playwright UI-режим
```

Подробнее: [docs/testing.md](../docs/testing.md)

## 🐳 Docker

```text
docker build -t news-portal-next . — сборка образа
docker run -p 3003:3003 news-portal-next — запуск контейнера
```

## 📝 Лицензия

MIT
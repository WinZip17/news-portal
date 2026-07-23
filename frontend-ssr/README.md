# 🟢 News Portal - NestJS SSR Frontend

Server-Side Rendering фронтенд на NestJS для новостного портала. Отображает те же страницы что и React SPA, но с серверным рендерингом.

## 🛠 Технологии

- **NestJS 11** — Node.js фреймворк
- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Zustand** — управление состоянием
- **Ant Design 5** — UI компоненты
- **React Router 7** — маршрутизация
- **Webpack** — сборка клиентского бандла
- **@ant-design/cssinjs** — извлечение стилей на сервере

## 🚀 Быстрый старт

```text
npm install — установка зависимостей
npm run start:dev — запуск в режиме разработки
npm run build — сборка (сервер + клиент)
npm run start — запуск продакшен версии
```

Приложение будет доступно на http://localhost:3002

## 📁 Структура проекта

```text
frontend-ssr/
├── public/                  # Статические файлы
│   ├── index.html           # Базовый HTML
│   └── favicon.svg          # Иконка
├── src/
│   ├── components/          # React компоненты
│   │   ├── FrameworkSwitcher.tsx  # Переключатель фреймворков
│   │   └── NewsDetailModal.tsx    # Модалка новости
│   ├── controllers/         # NestJS контроллеры
│   │   ├── app.controller.ts      # SSR контроллер
│   │   └── proxy.controller.ts    # Прокси для API
│   ├── layouts/             # Layout компоненты
│   │   └── MainLayout.tsx         # Главный layout
│   ├── pages/               # Страницы
│   │   ├── Home.tsx               # Главная
│   │   ├── NewsList.tsx           # Лента новостей
│   │   ├── Login.tsx              # Вход
│   │   ├── Register.tsx           # Регистрация
│   │   ├── Profile.tsx            # Личный кабинет
│   │   └── admin/                 # Админ-панель
│   ├── services/            # API сервисы
│   │   ├── api.ts                 # HTTP клиент
│   │   ├── auth.service.ts        # Авторизация
│   │   └── news.service.ts        # Новости
│   ├── store/               # Zustand сторы
│   │   ├── newsStore.ts           # Новости
│   │   ├── userStore.ts           # Пользователь
│   │   └── uiStore.ts             # UI (тема)
│   ├── types/               # TypeScript типы
│   ├── App.tsx              # Корневой компонент
│   ├── client.tsx           # Точка входа клиента
│   ├── main.ts              # Точка входа сервера
│   └── app.module.ts        # NestJS модуль
├── Dockerfile               # Docker образ
├── webpack.config.js        # Конфигурация Webpack
├── tsconfig.json            # TypeScript конфиг
└── package.json             # Зависимости
```

## 📄 Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | Главная | Все |
| /news | Лента новостей | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Админ/Модер |

## 🔧 Как это работает

1. NestJS принимает запрос
2. Загружает данные через API (новости)
3. Рендерит React в HTML через renderToString
4. Извлекает стили Ant Design через @ant-design/cssinjs
5. Отдаёт готовый HTML со вшитыми стилями и данными
6. Клиентский JS гидратирует страницу

## 🌍 Переменные окружения

API_URL=http://localhost:3001 — URL бэкенда
PORT=3002 — порт приложения

## 📝 Отличия от React SPA

- Первый рендер на сервере (SSR) — быстрее для SEO
- Нет Redux — используется Zustand
- Нет Vite — используется Webpack
- API запросы через встроенный прокси
- Стили вшиваются в HTML на сервере

## 🐳 Docker

docker build -t news-portal-ssr . — сборка образа
docker run -p 3002:3002 news-portal-ssr — запуск контейнера

## 📝 Лицензия

MIT
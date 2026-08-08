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
│   │   └── news/            # Новости (NewsCard, NewsDetailModal)
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
│   │   └── vuetify.ts       # Конфигурация Vuetify
│   ├── router/              # Vue Router
│   │   └── index.ts         # Маршруты и guards
│   ├── services/            # API сервисы
│   │   ├── auth.service.ts  # Авторизация
│   │   └── news.service.ts  # Новости
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts          # Авторизация
│   │   ├── news.ts          # Новости
│   │   └── ui.ts            # UI (тема)
│   ├── types/               # TypeScript типы
│   │   ├── auth.ts          # Типы авторизации
│   │   └── news.ts          # Типы новостей
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
| /news | Лента новостей | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Модер/Админ |

## 🔧 Особенности

- Material Design (Vuetify 4)
- Тёмная/светлая тема с синхронизацией через Pinia
- Адаптивный сайдбар (постоянный на десктопе, временный на мобильных)
- JWT авторизация с автообновлением токена
- Инфинити-скролл в ленте новостей
- SEO через @unhead/vue

## 🐳 Docker

```text
docker build -t news-portal-vue . — сборка образа
docker run -p 80:80 news-portal-vue — запуск контейнера
```

## 📝 Лицензия

MIT
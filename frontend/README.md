# 📰 News Portal - Frontend

Фронтенд для новостного портала с AI-рерайтом. Быстрые и короткие новости без манипуляций.

## 🛠 Технологии

- **React 18** + **TypeScript**
- **Vite** — быстрая сборка
- **Redux Toolkit** — управление состоянием
- **Ant Design 5** — UI компоненты
- **Axios** — HTTP клиент
- **React Router 6** — маршрутизация

## 🚀 Быстрый старт

```text
npm install — установка зависимостей
npm run dev — запуск в режиме разработки
npm run build — сборка для продакшена
npm run preview — предпросмотр сборки

Приложение будет доступно на http://localhost:5173
```

## 📁 Структура проекта

```text
frontend/
├── public/
│   ├── favicon.svg          # Иконка сайта
│   └── manifest.json        # PWA манифест
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── auth/            # Компоненты авторизации
│   │   ├── common/          # Общие компоненты (ErrorBoundary)
│   │   └── layout/          # Layout компоненты
│   ├── config/              # Конфигурация (роуты)
│   ├── hooks/               # Пользовательские хуки
│   ├── pages/               # Страницы
│   │   └── admin/           # Админ-панель
│   ├── services/            # API сервисы
│   ├── store/               # Redux хранилище
│   │   ├── auth/            # Авторизация
│   │   ├── news/            # Новости
│   │   └── ui/              # UI состояние
│   ├── types/               # TypeScript типы
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Глобальные стили
├── .env                     # Переменные окружения
├── Dockerfile               # Docker образ
├── nginx.conf               # Nginx конфиг
├── tsconfig.json            # TypeScript конфиг
├── vite.config.ts           # Vite конфиг
└── package.json             # Зависимости
```

## 📄 Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | Главная | Все |
| /news | Лента новостей | Все |
| /news?news=id | Новость в модалке | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет | 🔒 |
| /admin | Админ-панель | 🔒 Админ/Модер |

## 🔧 Разработка

```text
npm run dev — запуск в dev режиме
npm run lint — линтинг
npm run build — сборка
```

## 🐳 Docker

```text
docker build -t news-portal-frontend . — сборка образа
docker run -p 80:80 news-portal-frontend — запуск контейнера
```

## 📝 Лицензия

MIT
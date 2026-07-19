# News Portal 🚀
Монорепозиторий новостного портала с AI-рерайтом. Быстрые и короткие новости без манипуляций из проверенных источников.

### Frontend
- **React 18** + **TypeScript** — UI библиотека с типизацией
- **Vite** — быстрая сборка
- **Redux Toolkit** — управление состоянием
- **Ant Design 5** — UI компоненты
- **Axios** — HTTP клиент
- **React Router 6** — маршрутизация

### Backend
- **NestJS** — фреймворк для Node.js
- **TypeORM** — ORM для PostgreSQL
- **JWT** — аутентификация и авторизация
- **DeepSeek / OpenAI** — AI генерация контента
- **RSS Parser** — получение новостей из источников
- **Swagger** — документация API

### DevOps & Monitoring
- **Docker** + **Docker Compose** — контейнеризация
- **GitHub Actions** — CI/CD деплой на VPS
- **Prometheus** — сбор метрик
- **Grafana** — визуализация и алерты

## 🏗 Структура проекта
```text
news-portal/
├── frontend/ # React + Vite + Redux + Ant Design
├── backend/ # NestJS + TypeORM + PostgreSQL
├── prometheus/ # Конфигурация Prometheus
├── grafana/ # Конфигурация Grafana
├── docker-compose.yml # Контейнеры для продакшена
├── docker-compose.dev.yml # Контейнеры для разработки
└── package.json # Root workspaces
```

## 🚀 Быстрый старт

### Установка

```text
npm install — установка всех зависимостей
```

### Разработка

```text
npm run dev — запуск фронтенда и бэкенда
npm run dev:monitoring — запуск Prometheus + Grafana
npm run dev:all — запуск всего включая мониторинг
```

### Продакшен

```text
npm run start:prod — запуск всех сервисов через Docker
npm run stop — остановка всех сервисов
```

## 📡 Сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:5173 | Разработка |
| Frontend | http://localhost:80 | Продакшен |
| Backend API | http://localhost:3001 | API |
| Swagger | http://localhost:3001/api/docs | Документация API |
| Prometheus | http://localhost:9090 | Метрики |
| Grafana | http://localhost:3000 | Дашборды (admin/admin) |
| PostgreSQL | localhost:5432 | База данных |

## 📰 Как это работает

1. **RSS источники** — каждый час собираются новости из Lenta.ru, РИА, ТАСС, РБК, Habr и других
2. **AI рерайт** — DeepSeek/GPT переписывает новость, сохраняя факты
3. **Дедупликация** — проверка на повторы по заголовкам и ключевым словам
4. **Модерация** — новости попадают в очередь на проверку
5. **Автоподтверждение** — через 1 час непроверенные новости публикуются автоматически
6. **Персонализация** — пользователи настраивают категории и сохраняют избранное

## 📊 Мониторинг

Grafana дашборд показывает:
- Статус бэкенда (Up/Down)
- Rate HTTP запросов
- Время ответа (p50, p95)
- Error Rate
- Использование CPU и памяти
- Активные соединения
- Алерты

## 🔑 Роли пользователей

| Роль | Права |
|------|-------|
| user | Чтение новостей, лайки, избранное, настройки |
| moderator | Управление новостями, модерация, AI генерация |
| admin | Полный доступ, управление пользователями |

## 📁 Frontend страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| / | Главная со статистикой | Все |
| /news | Лента новостей с фильтрами | Все |
| /news?news=id | Новость в модальном окне | Все |
| /login | Вход | Гость |
| /register | Регистрация | Гость |
| /profile | Личный кабинет (профиль, настройки, избранное) | 🔒 |
| /admin | Админ-панель (новости, пользователи) | 🔒 Админ/Модер |

## 🐳 Деплой на VPS

```text
При пуше в master ветку GitHub Actions:
1. Копирует файлы на VPS
2. Останавливает старые контейнеры
3. Запускает базу данных
4. Собирает и запускает backend
5. Собирает и запускает frontend
6. Проверяет статус контейнеров
```

## 📝 Переменные окружения

Бэкенд (.env):

```text
DB_HOST=localhost — хост базы данных
DB_PORT=5432 — порт базы данных
DB_USERNAME=postgres — пользователь БД
DB_PASSWORD=postgres — пароль БД
DB_DATABASE=news_portal — название БД
JWT_SECRET=your-secret-key — ключ JWT
JWT_EXPIRES_IN=1d — срок токена
JWT_REFRESH_EXPIRES_IN=7d — срок рефреш токена
PORT=3001 — порт приложения
NODE_ENV=development — окружение
OPENAI_API_KEY=sk-your-key — ключ AI
OPENAI_MODEL=deepseek-chat — модель AI
AI_TEMPERATURE=0.7 — температура генерации
AI_MAX_TOKENS=2000 — макс токенов
```


## Запуск через Docker
```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Остановка
docker-compose down
```
## 📦 Скрипты
```text
npm run dev               # Только фронт + бэк
npm run dev:monitoring    # Только Prometheus + Grafana
npm run dev:all           # Всё вместе
npm run stop:monitoring   # Остановить мониторинг
```

## 📝 Лицензия

MIT
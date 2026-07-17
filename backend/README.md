# 📰 News Portal - Backend API

Бэкенд для новостного портала с AI-генерацией контента на основе реальных новостей из RSS источников.

## 🛠 Технологии

- **NestJS** - фреймворк для Node.js
- **TypeScript** - типизация
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **OpenAI** - AI генерация контента
- **RSS Parser** - получение новостей из источников
- **Swagger** - документация API
- **Docker** - контейнеризация

## 📦 Установка

```bash
# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env

# Настройка переменных окружения
nano .env
```

## 🚀 Запуск
# Локальная разработка
```bash
# Запуск в режиме разработки
npm run start:dev

# Продакшн сборка
npm run build
npm run start:prod
```

## 🌍 Переменные окружения
```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=news_portal

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Приложение
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
AI_GENERATION_INTERVAL=3600000
```


## 📁 Структура проекта
```text
backend/
├── src/
│   ├── config/           # Конфигурации
│   ├── entities/         # Сущности БД
│   ├── modules/
│   │   ├── auth/         # Аутентификация
│   │   ├── news/         # Новости
│   │   └── ai/           # AI генерация
│   │       ├── config/   # Конфигурация AI
│   │       ├── dto/      # DTO
│   │       └── services/ # Сервисы RSS, AI
│   ├── types/            # Типы TypeScript
│   ├── app.module.ts     # Главный модуль
│   └── main.ts           # Точка входа
├── .env                  # Переменные окружения
├── Dockerfile            # Docker образ
└── package.json          # Зависимости
```

## 🔧 Разработка
```bash
# Установка зависимостей
npm install

# Запуск в dev режиме
npm run start:dev

# Линтинг
npm run lint

# Сборка
npm run build
```
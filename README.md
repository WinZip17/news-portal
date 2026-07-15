# News Portal 🚀

Монорепозиторий новостного портала с AI-генерацией контента.

## 🏗 Структура проекта
news-portal/
├── .gitignore
├── README.md
├── docker-compose.yml
├── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── store/
│       │   └── index.ts
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── assets/
└── backend/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
├── main.ts
├── app.module.ts
└── ...


## 🛠 Технологический стек

### Frontend
- ⚡️ [Vite](https://vitejs.dev/) - Быстрая сборка
- ⚛️ [React 18](https://react.dev/) - UI библиотека
- 📘 [TypeScript](https://www.typescriptlang.org/) - Типизация
- 🎨 [Ant Design](https://ant.design/) - UI компоненты
- 🔄 [Redux Toolkit](https://redux-toolkit.js.org/) - Управление состоянием

### Backend
- 🚀 [NestJS](https://nestjs.com/) - Node.js фреймворк
- 📘 [TypeScript](https://www.typescriptlang.org/) - Типизация
- 🗄 [TypeORM](https://typeorm.io/) - ORM
- 🐘 [PostgreSQL](https://www.postgresql.org/) - База данных
- 🔐 JWT - Аутентификация

### DevOps
- 🐳 [Docker](https://www.docker.com/) - Контейнеризация
- 🔄 GitHub Actions - CI/CD

## 🚀 Быстрый старт

### Для разработки

```bash
# Установка всех зависимостей
npm install

# Запуск базы данных
docker-compose up -d postgres

# Запуск в режиме разработки
npm run dev
```

## Запуск через Docker
```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Остановка
docker-compose down
```
## 📦 Скрипты
npm run dev - Запуск frontend и backend для разработки
npm run build - Сборка проекта
npm run lint - Проверка кода

## 🔗 Порты
Frontend: http://localhost:5173 (dev) / http://localhost (prod)
Backend API: http://localhost:3001
База данных: localhost:5432


### 1.7 Инициализация репозитория

```bash
# Возвращаемся в корень проекта
cd ..

# Устанавливаем корневые зависимости
npm install

# Добавляем файлы в git
git add .
git commit -m "Initial commit: monorepo with Vite + React frontend and NestJS backend"

# Создаем репозиторий на GitHub (вручную через веб-интерфейс)
# и связываем:
git remote add origin https://github.com/YOUR_USERNAME/news-portal.git
git branch -M main
git push -u origin main
```

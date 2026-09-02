# 📰 News Portal — Документация

Новостной портал с AI-рерайтом из проверенных источников.

## Содержание

- [Архитектура](architecture.md)
- [API](api.md)
- [Поиск новостей](search.md)
- [Деплой](deployment.md)
- [AI генерация](ai-generation.md)
- [Фронтенды](frontends.md)
- [Общая типизация](types.md)
- [Тестирование](testing.md)
- [Как помочь проекту](contributing.md)

Краткая карта для AI-агентов: [AGENTS.md](../AGENTS.md) (корень репозитория).

## Быстрый старт

```bash
npm install
npm run dev          # PostgreSQL + backend + React SPA
```

| Фронтенд | Dev URL |
|----------|---------|
| React SPA | http://localhost:5173 |
| Next.js | http://localhost:3003 |
| Nuxt | http://localhost:3004 |
| Vue SPA | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |

> React и Vue по умолчанию используют порт **5173** — запускайте один SPA за раз или смените `port` в `vite.config.ts`.

Отдельные фронты: `npm run dev:frontend:nuxt`, `npm run dev:frontend:vue`, `npm -w frontend-next run dev`.

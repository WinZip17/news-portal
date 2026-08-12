# @news-portal/types

Общая TypeScript-типизация для монорепозитория news-portal.

## Установка

Пакет подключается через npm workspaces. В `package.json` зависимого проекта:

```json
"@news-portal/types": "1.0.0"
```

Из корня репозитория: `npm install`.

## Сборка

```bash
npm run build
```

Результат — `dist/` (CommonJS + `.d.ts`). Нужен для backend; фронтенды импортируют `src/` напрямую.

## Экспорты

| Путь | Содержимое |
|------|------------|
| `@news-portal/types` | все типы |
| `@news-portal/types/auth` | пользователь, auth, DTO |
| `@news-portal/types/news` | новости, фильтры, статистика |
| `@news-portal/types/api` | обёртки API |
| `@news-portal/types/ai` | AI и cron |

Подробная документация: [docs/types.md](../../docs/types.md).

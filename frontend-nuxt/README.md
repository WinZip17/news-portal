# 🟣 Short News — Nuxt Frontend

Новостной портал с AI-генерацией контента на **Nuxt 4** с **SSR**.

## 📦 Стек

- **Nuxt 4** — фреймворк (SSR, Auto Imports)
- **Vue 3** — Composition API + `<script setup>`
- **TypeScript** — строгая типизация
- **PrimeVue 4** — UI-компоненты (DataTable, Dialog, Card, ...)
- **PrimeIcons 7** — иконки
- **Pinia** — state management
- **VueUse** — утилиты (useStorage, useDebounceFn, usePreferredDark)
- **ESLint + Prettier** — линтинг и форматирование

## 🚀 Запуск
```text
npm install          # Установка зависимостей
npm run dev          # Режим разработки (порт 3004)
npm run build        # Сборка для продакшена
npm run start        # Продакшен-сервер
npm run type-check   # Проверка типов
npm run lint         # Линтинг
npm run lint:fix     # Автоисправление
npm run format       # Форматирование Prettier
```

## 📁 Структура

```text
frontend-nuxt/
├── app/
│   ├── app.vue                  # Корневой компонент
│   ├── assets/styles/
│   │   ├── main.css             # Глобальные стили
│   │   └── primevue-variables.css  # CSS-переменные темы
│   ├── components/
│   │   ├── admin/AdminSidebar.vue
│   │   ├── common/FrameworkSwitcher.vue
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   └── AppFooter.vue
│   │   └── news/
│   │       ├── NewsCard.vue
│   │       └── NewsDetailModal.vue
│   ├── composables/
│   │   ├── useApi.ts
│   │   ├── useAppToast.ts
│   │   └── useUtils.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   └── admin.vue
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── guest.ts
│   ├── pages/
│   │   ├── index.vue            # Главная
│   │   ├── login.vue            # Вход
│   │   ├── register.vue         # Регистрация
│   │   ├── [...slug].vue        # 404
│   │   ├── news/index.vue       # Лента новостей
│   │   ├── profile/index.vue    # Личный кабинет
│   │   └── admin/
│   │       ├── index.vue        # Дашборд
│   │       ├── moderation.vue   # Модерация
│   │       ├── users.vue        # Пользователи
│   │       ├── news.vue         # Все новости (CRUD)
│   │       └── ai-generate.vue  # AI-генерация
│   ├── plugins/primevue.ts
│   ├── services/
│   │   ├── ai.service.ts
│   │   ├── auth.service.ts
│   │   └── news.service.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── news.ts
│   │   └── ui.ts
│   └── types/index.ts
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

## 🎨 Темы

```text
- Светлая/тёмная — управляется классом .p-dark на <html>
- Переменные PrimeVue — определены в primevue-variables.css
- Переключение — uiStore.toggleTheme(), синхронизация с профилем пользователя
```

## 🔐 Аутентификация

```text
- JWT — access + refresh токены
- Хранение — localStorage через useStorage
- Автообновление — при 401 пробует обновить токен
- Роли — user, moderator, admin, super_admin
```

## 🧩 API

```text
Проксирование через Nitro в nuxt.config.ts:
nitro: { devProxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } } }
```

Все запросы через useApi() composable — apiFetch<T>().

## 📄 Страницы

```text
/ — Главная, статистика, последние новости — Все
/news — Лента с фильтрацией, поиском, сортировкой — Все
/login — Вход — Гости
/register — Регистрация — Гости
/profile — Профиль, смена пароля, избранное — Юзеры
/admin — Дашборд админки — Модератор+
/admin/moderation — Модерация новостей — Модератор+
/admin/users — Управление пользователями — Админ+
/admin/news — Полный CRUD новостей — Супер-админ
/admin/ai-generate — AI-генерация новостей — Супер-админ
/* — 404 — Все
```

## 🟣 Framework Switcher

```text
Селект в хедере для переключения между фронтендами:
- ⚛️ React SPA (порт 80)
- 🟢 NestJS SSR + React (порт 3002)
- 🔵 Next.js (порт 3003)
- 🟣 Nuxt (порт 3004) — текущий
```

## 📝 Лицензия

MIT
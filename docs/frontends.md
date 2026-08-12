# 🎨 Фронтенды

Проект включает 4 фронтенда на разных технологиях. Все используют один API и **общий пакет типов** `@news-portal/types`.

> 📐 Подробнее о типизации: [types.md](types.md)

## Сравнение

| | React SPA | Next.js | Nuxt | Vue SPA |
|---|---|---|---|---|
| **Порт** | 80/443 | 3003 | 3004 | 80 (внутри) |
| **Домен** | short-news.ru | next.short-news.ru | nuxt.short-news.ru | vue.short-news.ru |
| **UI библиотека** | Ant Design 5 | MUI 6 | PrimeVue 4 | Vuetify 4 |
| **State management** | Redux Toolkit | Redux Toolkit | Pinia | Pinia |
| **Роутинг** | React Router 7 | Next.js App Router | Vue Router 5 | Vue Router 5 |
| **Сборка** | Vite | Next.js | Nuxt | Vite |
| **SSR** | ❌ | ✅ | ✅ | ❌ |
| **CSS решение** | Ant Design | MUI System | PrimeVue + CSS | Vuetify + CSS |
| **Типы** | `@/types` → `@news-portal/types` | `@/types` | `~/types` | `@/types` |

## React SPA (основной)

- Статус: **production**
- Домен: https://short-news.ru
- Стек: React 19, TypeScript, Redux Toolkit, Ant Design 5, Vite, PWA

### Особенности
- Полноценный админ-интерфейс с модерацией
- Инфинити-скролл в ленте новостей
- Ленивая загрузка страниц (React.lazy)
- Service Worker для PWA
- SEO через react-helmet-async

### Структура
```
frontend/src/
├── components/    # Переиспользуемые компоненты
├── hooks/         # Пользовательские хуки
├── pages/         # Страницы
├── services/      # API сервисы
├── store/         # Redux store
├── types/         # Реэкспорт @news-portal/types
└── utils/         # Утилиты
```

## Next.js

- Статус: **production**
- Домен: https://next.short-news.ru
- Стек: Next.js 16, TypeScript, Redux Toolkit, MUI 6

### Особенности
- Server-Side Rendering (SSR)
- App Router
- Material Design (MUI)
- Клиентский layout отделён от серверного
- CSS-in-JS через MUI
- **Docker:** общий контекст корня репозитория; копия типов только внутри образа из‑за Turbopack ([deployment.md](deployment.md#docker-сборка-и-news-portaltypes))

### Структура
```
frontend-next/src/
├── app/           # App Router страницы
├── components/    # React компоненты
├── services/      # API сервисы
├── store/         # Redux store
├── types/         # Реэкспорт @news-portal/types
└── theme.ts       # MUI тема
```

## Nuxt

- Статус: **production**
- Домен: https://nuxt.short-news.ru
- Стек: Nuxt 4, Vue 3, Pinia, PrimeVue 4

### Особенности
- Server-Side Rendering (SSR)
- Автоимпорты компонентов
- Тема через CSS-переменные PrimeVue
- Pinia Plugin Persistedstate

### Структура
```
frontend-nuxt/
├── app/           # Страницы
├── components/    # Vue компоненты
├── composables/   # Компосаблы
├── services/      # API сервисы
├── stores/        # Pinia stores
├── server/        # Серверная часть
└── app/types/     # Реэкспорт @news-portal/types
```

## Vue SPA

- Статус: **development**
- Домен: https://vue.short-news.ru
- Стек: Vue 3, Pinia, Vuetify 4, Vite

### Особенности
- Material Design (Vuetify)
- Pinia для управления состоянием
- Адаптивный сайдбар
- Поддержка тёмной темы

### Структура
```
frontend-vue/src/
├── api/           # HTTP клиент
├── components/    # Vue компоненты
├── pages/         # Страницы
├── plugins/       # Плагины
├── router/        # Vue Router
├── services/      # API сервисы
├── stores/        # Pinia stores
├── types/         # Реэкспорт @news-portal/types
└── utils/         # Утилиты
```

## Переключение между фронтендами

Каждый фронтенд содержит компонент `FrameworkSwitcher` — нативный `<select>` для переключения между версиями. Выбранный фронтенд передаётся через проп `current`.

```html
<select aria-label="Выбор фреймворка">
  <option value="react">⚛️ React SPA</option>
  <option value="next">🔵 Next.js</option>
  <option value="nuxt">🟣 Nuxt</option>
  <option value="vue">💚 Vue SPA</option>
</select>
```
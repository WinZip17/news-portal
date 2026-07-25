# 📰 News Portal

Новостной портал с AI-рерайтом. Короткие новости без манипуляций из проверенных источников.

## 🎯 Что это

Каждый час AI собирает новости из RSS-лент ведущих изданий (РИА, ТАСС, РБК, Habr и других), переписывает их с сохранением фактов и публикует на сайте. Пользователи получают краткую суть новости за 30 секунд без кликбейта и эмоциональных манипуляций.

## ✨ Возможности

- 🤖 **AI-рерайт** — новости переписываются с сохранением фактов
- 📰 **Реальные источники** — РИА Новости, ТАСС, Интерфакс, РБК, Habr
- ⚡ **Каждый час** — автоматическое обновление ленты
- 👤 **Персонализация** — настройка категорий, избранное, тёмная тема
- 🛡 **Модерация** — все новости проходят проверку перед публикацией
- 📱 **PWA** — можно установить как приложение на телефон
- 🔍 **SEO** — мета-теги, Open Graph, sitemap для поисковиков

## 🛠 Технологии

| Слой | Стек |
|------|------|
| Бэкенд | NestJS, TypeORM, PostgreSQL, JWT, Swagger |
| AI | DeepSeek API, RSS Parser |
| Фронтенды | React SPA, Next.js (MUI), NestJS SSR (Ant Design), Nuxt (PrimeVue) |
| DevOps | Docker, GitHub Actions, Nginx, Let's Encrypt |
| Мониторинг | Prometheus, Grafana |

## 🌐 Демо

| Фреймворк | URL |
|-----------|-----|
| React SPA | https://short-news.ru |
| NestJS SSR | https://nest.short-news.ru |
| Next.js | https://next.short-news.ru |
| Nuxt | https://nuxt.short-news.ru |

## 🚀 Запуск
```text
npm install — установка зависимостей
npm run dev — запуск всего в dev-режиме
npm run start:prod — запуск в Docker (продакшен)
```

## 📊 Мониторинг
Grafana с дашбордом на http://short-news.ru/grafana

## 📡 Сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:5173 | Разработка |
| Frontend | http://localhost:80 | Продакшен |
| Backend API | http://localhost:3001 | API |
| Swagger | http://localhost:3001/api/docs | Документация API |
| Prometheus | http://localhost:9090 | Метрики |
| Grafana | http://localhost:3000 | Дашборды  |
| PostgreSQL | localhost:5432 | База данных |
## 📝 Лицензия

MIT

---

**Автор:** WinZip

**Репозиторий:** https://github.com/WinZip17/news-portal
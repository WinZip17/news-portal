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
- 🔎 **Поиск** — PostgreSQL FTS; фильтр по дате и `hasImage`; умный поиск (NL → AI) на React, Next, Nuxt и Vue
- 📊 **Аналитика** — Яндекс.Метрика на всех prod-фронтах

## 🛠 Технологии

| Слой | Стек                                                     |
|------|----------------------------------------------------------|
| Бэкенд | NestJS, TypeORM, PostgreSQL, JWT, Swagger                |
| AI | DeepSeek API, RSS Parser                                 |
| Фронтенды | React SPA, Next.js (MUI), Nuxt (PrimeVue), Vue (vuetify) |
| DevOps | Docker, GitHub Actions, Nginx, Let's Encrypt             |
| Мониторинг | Prometheus, Grafana                                      |
| Типизация | `@news-portal/types` (общий пакет для всех клиентов и API) |

## 🌐 Демо

| Фреймворк | URL                        |
|----------|----------------------------|
| React SPA | https://short-news.ru      |
| Next.js  | https://next.short-news.ru |
| Nuxt     | https://nuxt.short-news.ru |
| Vue      | https://vue.short-news.ru  |

> **Vue SPA:** главная `/` — газетная вёрстка (newsprint / watch); лента и поиск — стандартный Vuetify UI.

## 🚀 Запуск

```bash
npm install          # установка зависимостей
npm run dev          # PostgreSQL + backend + React SPA
npm run start:prod   # Docker Compose (продакшен)
```

## 🖥 Требования к VPS

Проект в продакшене поднимается одним `docker compose up` (см. [docs/deployment.md](docs/deployment.md)). Ниже — оценка для **всех** сервисов из `docker-compose.yml`: PostgreSQL, Redis, backend, React (nginx), Next.js SSR, Nuxt SSR, Vue (nginx); опционально Prometheus + Grafana (`--profile monitoring`).

### Состав и RAM (runtime)

| Сервис | Назначение | RAM (ориентир) |
|--------|------------|----------------|
| PostgreSQL 15 | БД, FTS | 384–512 MB |
| Redis 7 | кэш | 64–128 MB |
| Backend (NestJS) | API, AI cron, WebSocket | 256–512 MB (+ до ~300 MB при генерации) |
| frontend (nginx) | React SPA, TLS, reverse proxy | 32–64 MB |
| frontend-next (Node) | Next.js SSR | 384–768 MB |
| frontend-nuxt (Node) | Nuxt SSR | 256–512 MB |
| frontend-vue (nginx) | Vue SPA | 32–64 MB |
| Prometheus + Grafana | мониторинг (опционально) | 512–896 MB |
| ОС + Docker | служебные процессы | 512–768 MB |

**Итого в работе:** ~1.8–2.5 GB без мониторинга, ~2.5–3.5 GB с Grafana/Prometheus.

### Рекомендуемые конфигурации

| Профиль | vCPU | RAM | Диск | Для кого |
|---------|------|-----|------|----------|
| **Минимум** | 2 | 2 GB | 40 GB SSD | малый трафик, без `--profile monitoring`; **обязателен swap 2 GB** |
| **Рекомендуется** | 4 | 4 GB | 80 GB SSD | prod как на short-news.ru: все 4 фронта + API + БД + мониторинг |
| **С запасом** | 4–8 | 8 GB | 100+ GB SSD | рост базы, пики SSR, комфортный деплой без swap |

### CPU и диск

- **CPU:** 2 vCPU хватает для низкой нагрузки; **4 vCPU** — для одновременных SSR-запросов, cron AI-генерации и админки.
- **Диск:** 20–30 GB — Docker-образы (Next/Nuxt/backend — самые тяжёлые); 10–20 GB — PostgreSQL и рост новостей; 10–20 GB — запас под логи, метрики и `docker build` на сервере. На минимальном тарифе следите за `docker system prune`.
- **Сборка на VPS:** `docker compose build` для пяти приложений может кратковременно потреблять **6–8 GB RAM**; деплой через GitHub Actions идёт последовательно (30–60 мин). На VPS с 2 GB лучше собирать образы в CI и только `pull`/`up`, либо добавить swap.

### Прочее

| Параметр | Значение |
|----------|----------|
| ОС | Linux amd64 (Ubuntu 22.04/24.04 LTS) |
| Сеть | исходящий HTTPS (DeepSeek API, RSS), входящий 80/443 |
| Порты наружу | 80, 443 (nginx в контейнере `frontend`); остальное — внутренняя сеть Docker |

Подробнее про контейнеры и CI/CD: [docs/deployment.md](docs/deployment.md).

## 🧪 Тестирование

```bash
npm test                    # backend + все фронтенды (Vitest/Jest)
npm run test:e2e:frontend   # React E2E (Playwright)
npm run test:e2e:frontend-vue # Vue E2E (газетная главная, login, /news, /search)
npm run test:e2e            # backend E2E
```

Подробнее: [docs/testing.md](docs/testing.md)

## 📐 Общая типизация

TypeScript-типы вынесены в workspace-пакет **`@news-portal/types`** (`packages/types/`). Все четыре фронтенда и backend импортируют типы оттуда; локальные папки `types/` — тонкие реэкспорты.

Подробнее: [docs/types.md](docs/types.md) · [docs/search.md](docs/search.md) · [docs/frontends.md](docs/frontends.md)

Карта для AI-агентов: [AGENTS.md](AGENTS.md)

## 📊 Мониторинг
Grafana с дашбордом на http://short-news.ru/grafana

## 📡 Сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend (React) | http://localhost:5173 | Разработка |
| Frontend (Next) | http://localhost:3003 | Разработка |
| Frontend (Nuxt) | http://localhost:3004 | Разработка |
| Frontend (Vue) | http://localhost:5173 | Разработка (не одновременно с React) |
| Frontend | http://localhost:80 | Продакшен (nginx) |
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
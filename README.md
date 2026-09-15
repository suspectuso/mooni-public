# Mooni / Луми

Telegram-суперапп городской жизни СПб. Ядро v1: **свайп мест → AI-маршрут под настроение**.

> ### 🤖 AI-ассистенту: начни отсюда
> **Что это.** Mooni (персона — «Луми») — Telegram Mini App: AI-подруга-проводник по Санкт-Петербургу.
> Ядро-петля: **настроение → свайп мест → AI-маршрут на карте**. Луми — центральная точка входа, свайп мест — один из флоу.
>
> **Читай по порядку, потом действуй:**
> 1. [`AGENTS.md`](AGENTS.md) — стек, команды (`pnpm dev`, `pnpm ci`), архитектура, правила git/CI. **Обязательно целиком перед любой правкой.**
> 2. [`agents/`](agents/) — профили ролевых сессий (`dev` / `positioning` / `design`): кто чем владеет и куда эскалировать.
> 3. Дальше этот README — как поднять локально и потоки экранов.
>
> **Стек одним взглядом.** Монорепо pnpm: `apps/web` (Next.js 16, Telegram Mini App) · `apps/api` (NestJS + Prisma + PostgreSQL) · `packages/shared` (zod-контракты). LLM — Ollama (OpenAI-совместимый API). Карта — MapLibre GL + OpenFreeMap.
>
> **Ключевое для правок.** `apps/api/src/compat` — мост фронт↔бэк по протоколу `?userId=<telegramId>`; деньги и чувствительное — строго по Telegram `initData`. Дизайн-канон — тёплый светлый + бирюза (`#65FFF7` / `#0E9E86`), общение на «ты».

Монорепо (pnpm). Ключевой контекст для людей и AI — в [`AGENTS.md`](AGENTS.md) и [`agents/`](agents/).

## Структура

```
apps/
  api/     NestJS + Prisma + PostgreSQL — Core API (auth, feed, swipe, routes, ai)
  web/     Next.js 16 — Telegram Mini App (свайп-лента, маршрут)
packages/
  shared/  общие zod-контракты (DTO фронт↔бэк)
infra/     docker-compose (postgres, redis)
```

## Стек
- Фронт: Next.js 16, React 19, Telegram WebApp (`window.Telegram.WebApp`)
- Бэк: NestJS 10, Prisma 5, PostgreSQL 16, Redis
- LLM: **локальный Ollama** на сервере sus (модель `qwen2.5:14b-instruct`), OpenAI-совместимый API

## Запуск (dev)

```bash
# 1. зависимости
pnpm install

# 2. база
docker compose -f infra/docker-compose.yml up -d
cp .env.example .env            # при необходимости поправить

# 3. схема + сид
pnpm db:migrate                 # создаст таблицы
pnpm db:seed                    # категории, ~12 мест СПб, ачивки, demo-юзер

# 4. LLM-туннель к Ollama (для сборки маршрута)
#    ssh -p <PORT> -L 11434:127.0.0.1:11434 <user>@<GPU_HOST>
#    (или укажи в .env LLM_BASE_URL на play2go-прокси)

# 5. запуск
pnpm dev                        # api :8001 + web :3030
```

Открыть `http://localhost:3030`. Вне Telegram фронт логинится демо-пользователем
(`telegramId=1`, благодаря `AUTH_SKIP_TELEGRAM_VALIDATION=true`).

## Поток v1
выбор настроения → свайп мест (`/feed` → `/swipe`) → ≥2 лайка → `Собрать маршрут`
(`/routes/build`, LLM упорядочивает + пишет истории) → экран маршрута, отметка точек (+XP).

## Команды

| Команда | Что делает |
|---|---|
| `pnpm install` | установить зависимости |
| `pnpm dev` | запустить api (:8001) + web (:3030) |
| `pnpm build` | продакшн-сборка всех пакетов |
| `pnpm test` | тесты (Vitest) |
| `pnpm typecheck` | проверка типов (tsc, strict) |
| `pnpm lint` | линтер веб-фронта (ESLint / next lint) |
| `pnpm format` / `pnpm format:check` | код-стайл (Prettier) |
| `pnpm ci` | весь набор проверок локально (format + lint + types + test) |
| `pnpm db:seed` | сид БД (категории, места СПб, события, слоты) |

## Тесты
[Vitest](https://vitest.dev/) — юнит-тесты контрактов (`@mooni/shared`, zod-схемы свайпа/маршрута/ленты).
Запуск: `pnpm test`.

## Линтеры / код-стайл
- **Prettier** — единый код-стайл нашего кода (`packages/shared`, `apps/api`). Проверка: `pnpm format:check`.
- **ESLint** (`eslint-config-next`) — фронт `apps/web`. Проверка: `pnpm lint`.
- **TypeScript strict** — `pnpm typecheck` во всех пакетах.

## CI / CD
Основной приватный репозиторий: `git@git.suspectuso.ru:suspectuso/mooni.git`.

Исторический пайплайн лежит в [GitHub Actions](.github/workflows/ci.yml):
1. **CI** — `format:check` + `lint` + `typecheck` + `test` + `build`.
2. **CD** — при зелёном CI деплой по SSH на play2go: `git pull` → `pnpm install` → `prisma db push` → сборка api+web → рестарт systemd-сервисов → health-check.

Сейчас рабочие пуши идут в GitLab. Пока CI/CD не перенесён на GitLab или зеркало GitHub, push в GitLab не
запускает этот GitHub Actions деплой автоматически.
Сервер (`/opt/mooni`) — git-клон проекта, тянет `main` при деплое.

## Прод
- Домен: **https://mooni.suspectuso.ru** (play2go), SSL Let's Encrypt (авто-renew).
- Сервисы: `mooni-api` (:8001), `mooni-web` (:3030), `nginx` (`/api`→8001, `/`→3030).

## Что дальше (см. arhitektura.md §11)
v1.1 — ingestion (seed→n8n), афиша. v2 — коммьюнити-слоты. v3 — QR/susCoin, маркет, 2D-персонаж.

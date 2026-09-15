# AGENTS.md — Mooni / Луми

Telegram-суперапп для молодёжи СПб. Персона — Луми, девушка-подруга-проводник по городу.
**Ядро-петля:** настроение → свайп мест → AI-маршрут на карте. Подробности — `README.md`.

> **Команда сессий.** Проект ведут три ролевые сессии — их профили в `agents/`:
> [`dev.md`](agents/dev.md) (код/инфра), [`positioning.md`](agents/positioning.md) (позиционирование/IA),
> [`design.md`](agents/design.md) (визуал/канон C2). Перед правкой фичи прочитай профиль профильной сессии.

## Что это и стек
Монорепо (pnpm workspaces), TypeScript full-stack.
- `apps/api` — **NestJS + Prisma + PostgreSQL**, модуль на домен (`auth users profile feed swipe routes ai
  compat events experiences slots coffee city season memories missions relationship rewards payments
  ledger gamification ingestion admin npc bot asr monitoring`). Плюс Telegram-бот (grammy).
- `apps/web` — **Next.js 16 (App Router)**, Telegram Mini App. Кодовая база форка **Match** — постепенно
  перестиливаем под канон C2. Наши экраны: `/`, `/v2` (главные), плюс `/networking` (свайп), `/scenarios` и др.
- `packages/shared` — zod-контракты (DTO фронт↔бэк).
- `infra` — systemd-юниты, nginx, n8n, asr (Parakeet, отложено).

## Команды (из корня)
```bash
pnpm install
pnpm dev:api        # API :8001
pnpm dev:web        # web :3030
pnpm db:migrate     # prisma
pnpm db:seed        # категории + места СПб + demo-юзер
pnpm typecheck      # pnpm -r typecheck
pnpm test           # vitest (юнит)
pnpm test:e2e       # playwright (против прода)
pnpm ci             # format:check + lint + typecheck + test  ← гонять перед коммитом
```
LLM-маршруты требуют туннель к Ollama (см. README) — без него `route/build` не соберётся.

## Архитектура связности (важно понять до правок)
- **compat-слой** (`apps/api/src/compat`) — адаптер «фронт Match ↔ наши данные». Фронт ходит на
  `/api/networking/*` с протоколом `?userId=<telegramId>`; контроллер мапит наши `Place`/`Route` в формы
  Match (`toNetworkingCard` и т.п.). Это точка связности — правки фронт↔бэк часто идут через него.
- **Деньги — строго по `initData`** (не по `?userId=`): `payments`, бронь. Хардненинг: initData TTL +
  timing-safe, rate-limit, CORS-whitelist. Не ослаблять.
- **Подбор мест** — 3 слоя: эмбеддинги настроения (Ollama nomic-embed) → интересы → moodTags-фолбэк.

## Конвенции
- **Дизайн-канон C2**: тёплый светлый фон (`#FFF1E6→#E4F8F3`), бирюза `#65FFF7` (highlight) / `#0E9E86`
  (deep) — цвет бренда/ИИ Луми, шрифты Fredoka + Nunito, lucide-react, обращение на «ты». Тёмная тема
  Match — легаси, перестиливаем.
- **Telegram WebView НЕ поддерживает `backdrop-filter`** — стеклянный блюр рендерится плоским. Проверяй
  верстку в Telegram/на проде, а не только в браузере.
- Код пиши под стиль соседних файлов (отступы табами в web, см. существующие компоненты).
- **aislop**-хук гоняется после каждой правки (PostToolUse) — `error`/`fixable warning` чинить сразу,
  не отключать правила.

## Деплой / окружение
- Прод **play2go** (`<user>@<PROD_HOST>`): systemd `mooni-api`:8001, `mooni-web`:3030, nginx (`/api`→8001,
  `/`→3030), Postgres 18. Исторический CI/CD лежит в `.github/workflows`: push в `main` на GitHub запускал
  GitHub Actions → SSH-деплой (prisma db push + build + restart).
- **Источник истины теперь GitLab:** `git@git.suspectuso.ru:suspectuso/mooni.git` (private). Локальный `origin`
  должен смотреть туда; коммиты/пуши — только в GitLab. GitHub не использовать как рабочий remote.
- ⚠️ Пока деплой-пайплайн не перенесён на GitLab CI/CD или зеркало GitHub, push в GitLab **не равен выкатке в прод**.
- LLM — Ollama на сервере **sus** (GPU, туннель). Единственный GPU = точка отказа маршрутов.
- `WEBAPP_URL` (env) — используется в return-URL платежей. **НЕ менять.** Telegram-бот открывает Mini App
  на `/v2` (формируется в `bot.service` отдельно от `WEBAPP_URL`).

## Рабочий процесс (CI/CD — как пушим)
GitLab — основной приватный репозиторий. Ветка `main` трекает `origin/main` на
`git@git.suspectuso.ru:suspectuso/mooni.git`.

Легаси GitHub Actions, workflow `.github/workflows/ci.yml` (имя «CI/CD»):
- **На push И pull_request в `main`** → job `test`: install → `prisma generate` → `format:check` (Prettier,
  **падает на расхождении** — гоняй `pnpm format` перед коммитом) → `lint` (web, `continue-on-error`) →
  `typecheck` → `test` (vitest) → `build`.
- **Только на push в `main`** (после зелёного `test`) → job `deploy`: SSH на play2go →
  `git reset --hard origin/main` → `pnpm install` → `prisma generate` →
  **`prisma db push --accept-data-loss`** → build api+web → `systemctl restart mooni-api mooni-web` →
  health-check `:8001/api/health`.
- E2E (`.github/workflows/e2e.yml`, Playwright против прода) — **только на PR** и вручную, не блокирует деплой.

**Как мы работаем:**
1. Нетривиальное → ветка + PR (на PR гоняются `test` + `e2e`, деплоя нет — безопасно ревьюить).
2. Перед коммитом локально: **`pnpm ci`** (= format:check + lint + typecheck + test, зеркало job `test`).
3. **Пушим только в GitLab.** До переноса CI/CD на GitLab push в `main` сохраняет код в приватном репо, но
   сам по себе не деплоит прод.
4. Если деплой включён/перенесён: после пуша убеждаемся, что `git rev-parse HEAD` локально совпал с тем, что
   задеплоено (HEAD сервера == local HEAD), прежде чем говорить «в проде».
5. ⚠️ **`prisma db push --accept-data-loss`** — изменения `schema.prisma` могут УДАЛИТЬ данные на проде.
   Меняешь схему — предупреждай и проверяй миграцию заранее.

## Git
- Ветка по умолчанию `main`; основной remote — GitLab `origin`. Для нетривиальных правок заводи ветку.
- Старый GitHub remote не использовать; если он есть локально, это только архив/запасной источник чтения.
- **Не добавлять AI-атрибуцию в коммиты** (никаких `Co-Authored-By`/`Generated with`).
- Git-юзер: `suspectuso <classgk@gmail.com>`.
- Коммить/пушь только когда попросили; не подхватывай несвязанные изменения (`.aislop/*` не трогать).

## Где лежат наши ПЛАНЫ и спеки (читать перед билдом)
В репо: `README.md` (запуск/стек), `PLAN.md` (бэклог), `agents/*.md` (роли сессий).

**Продуктовый «мозг» — ОТДЕЛЬНЫЙ git-репозиторий вне кода:** `/Users/suspectuso/dnevnik/mooni/`
(там своя история решений; читать можно по абсолютным путям). Ключевое:
- `позиционирование/материалы/карта-приложения-Луми.md` — **главный вход**: IA, все экраны (роут → зачем →
  элементы → куда ведёт → эндпоинты → статус), два флоу, приоритет сборки.
- `позиционирование/материалы/пайплайн-навигация-и-связь.md` — таблицы «элемент → действие → эндпоинт → статус».
- `позиционирование/материалы/передача-в-разработку-главный.md` — ТЗ + токены C2 главного экрана.
- `позиционирование/материалы/экран-свайп-и-маршрут.md` — ядро-петля (mood→feed→swipe→AI-маршрут), сверено с кодом.
- `позиционирование/материалы/экран-впечатления-и-бронь.md` — деньги-туристы (каталог→бронь→оплата).
- `позиционирование/материалы/дизайн-система-луми.md` + `как-вышел-дизайн.md` — канон C2 (стиль + метод).
- `позиционирование/CHANGELOG-дизайн.md` + `позиционирование/история/` — актуальные/прошлые решения (что отвергнуто).
- `позиционирование/01..27` — PM-досье (позиционирование, JTBD, персоны, roadmap, приоритизация, PoL…).
- `arhitektura.md` (в корне `dnevnik/mooni/`) — архитектура v1.

**Порядок для билда экрана:** 1) `карта-приложения-Луми.md` (общая картина + приоритет) → 2) спека нужного
экрана (`экран-*.md`) → 3) `пайплайн-навигация-и-связь.md` (эндпоинты) → 4) канон `дизайн-система-луми.md`.
Стиль/визуал — сессия Дизайн (`agents/design.md`), смысл/приоритет — Позиционирование (`agents/positioning.md`).

# Mooni — план и статус

Живой документ: что сделано и что дальше. Обновлять по ходу.
Прод: **https://mooni.suspectuso.ru** · Репо: **git@git.suspectuso.ru:suspectuso/mooni.git** (private) · Бот: **@MooniAppbot**

---

## 1. Что это

Telegram-суперапп городской жизни СПб для молодёжи 16–35.
Ядро: **свайп мест («тиндер мест») → AI-маршрут под настроение**. Дальше — афиша, слоты,
геймификация (susCoin/ачивки), маркет впечатлений, премиум, 2D-проводник «Муни».

Главный принцип: **Активность = место + время + тип + формат**, любая активность даёт ачивку.

---

## 2. Архитектура (как есть)

Монорепо (pnpm workspaces), деплой bare-metal + systemd на play2go.

```
apps/
  api/    NestJS + Prisma + PostgreSQL — Core API
  web/    Next.js 16 — фронт = кодовая база Match (адаптирована под Mooni)
packages/
  shared/ zod-контракты (DTO фронт↔бэк)
infra/    docker-compose (pg/redis для dev), nginx, systemd-юниты
e2e/      Playwright
.github/  CI/CD
```

- **Фронт** — это **полная копия Match** (`match_front`), правим её под нас. Дизайн Match сохраняем
  целиком (шрифты Coolvetica/LT Superior/Oks, палитра #121212/#65fff7/#e6f43f/#fc2a0d).
- **Подключение фронта к нашему бэку** — через **compat-слой** (`src/compat`): экраны Match зовут
  свои эндпоинты (`/networking/*`, `/sprints/*`, `/courses`, `/events/upcoming`, `?userId=`), а
  бэкенд отдаёт НАШИ данные в их форме. Так дизайн не трогаем, логика — наша.
- **LLM** — локальный **Ollama** на сервере sus (модель `qwen2.5:14b-instruct`), доступен на play2go
  через `ollama-tunnel.service` → `localhost:11434`. Маршруты и сторителлинг генерит он.

### Прод-инфра
- Сервер play2go: `ssh <user>@<PROD_HOST>`, Ubuntu 26.04.
- Код: `/opt/mooni` (git-клон, тянет `main` по read-only deploy key).
- Сервисы: `mooni-api` (:8001), `mooni-web` (:3030), `nginx` (`/api`→8001, `/`→3030), SSL Let's Encrypt.
- БД: локальный Postgres 18, база `mooni`. Секреты — `/opt/mooni/.env` (gitignored).
- LLM: env `LLM_BASE_URL=http://localhost:11434/v1`.
- n8n: сервис `n8n.service` (:5678 на localhost), данные `/opt/n8n`, конфиг `/opt/n8n/n8n.env`;
  публично — `https://n8n.suspectuso.ru` через nginx + basic-auth (юзер `mooni`).

### CI/CD
- Основной private remote теперь GitLab: `git@git.suspectuso.ru:suspectuso/mooni.git`. Коммиты/пуши —
  туда; GitHub не используем как рабочий remote.
- Исторический GitHub Actions pipeline (`.github/workflows`) оставлен в репо: CI (format + lint + typecheck
  + test + build) → CD по SSH на play2go. Пока пайплайн не перенесён на GitLab CI/CD или зеркало GitHub,
  push в GitLab не запускает деплой автоматически.
- При включённом деплое схема та же: `git pull` → install → `prisma db push` → build → restart →
  health-check с ретраями. ⚠️ `prisma db push --accept-data-loss` опасен для данных при правках схемы.

---

## 3. Что сделано ✅

### Ядро (v1)
- Свайп мест (механика перенесена из Match `networking`), AI-маршрут из лайков.
- Экран «Мои места» (`/networking/likes`) → «Собрать маршрут» → маршрут с историями от LLM.

### Контент (v1.1)
- Афиша — карусель «События» на главной (`/events/upcoming`).
- Профиль (`/tracker/profile`) — XP / ачивки / лайки / маршруты.
- Геймификация — авто-выдача ачивок (first_swipe / first_route / explorer_3_districts).
- Ingestion-вебхук (`POST /api/ingestion/raw`, заголовок `X-Ingest-Secret`) + очередь модерации.

### Коммьюнити (v2)
- Слоты (сбор людей на активность) на экране спринтов Match (`/sprints`): список, детали,
  join/leave, лидерборд, **авто-подтверждение при наборе min** + уведомление через бота.

### Монетизация (v3)
- susCoin + QR-чек-ин у партнёров (`/qr/redeem`, идемпотентно).
- Маркет впечатлений (`/experiences`, `/courses` для экрана education), бронь.
- Премиум-подписка (выдаётся только после оплаты).
- **Платежи**: ЮKassa (как в Match) + xRocket крипта USDT (как в crocopay). create + вебхуки +
  фулфилмент (premium/booking/topup), атомарно и идемпотентно. UI: страница `/premium`.

### Платформа
- Telegram-бот @MooniAppbot (grammy, long-polling): /start + уведомления слотов.
- Весь фронт = дизайн Match; навигация, шрифты, палитра.
- CI/CD + 56 юнит-тестов (Vitest) + 4 e2e (Playwright) + Prettier/ESLint.
- 2D-проводник «Муни» (анимированный SVG, реплики по контексту/настроению, Live2D-ready шов).
- Каталог: 27 реальных мест СПб с фото из Wikimedia.

### Безопасность (аудит по чек-листу чужого мини-аппа, всё закрыто)
- CORS без `*` при credentials; rate-limit (throttler 120/мин); initData TTL + timing-safe;
  деньги строго по initData (не доверяем `?userId=`); xRocket-вебхук — проверка подписи;
  `markPaid` атомарный; убрана бесплатная выдача премиума; nginx security-заголовки.

---

## 4. План дальше (по приоритету)

### P0 — блокеры на пользователе
- [ ] **Реальные платежи** — добавить в `/opt/mooni/.env`: `YOOKASSA_SHOP_ID`, `YOOKASSA_API_KEY`,
      `XROCKET_TOKEN`. Зарегистрировать вебхук ЮKassa на `/api/payments/yookassa-webhook`.
      После — проверить полный цикл оплаты (create → оплата → вебхук → фулфилмент).
- [x] **Live2D-модель** для «Муни» — подключён `pixi-live2d-display` (Cubism 4 + Cubism Core с CDN)
      в `components/guide/Live2DStage.tsx`; `GuideAvatar` рендерит Live2D с graceful-фолбэком на SVG.
      По умолчанию вшит бесплатный сэмпл Live2D «Haru» (Free Material License). Своя модель —
      через `NEXT_PUBLIC_LIVE2D_MODEL` (URL до `.model3.json`). Дальше: кастомный арт Mooni + липсинк
      по реальному TTS, выражения под настроение.

### P1 — наполнение и управление
- [x] **Админка** (v1) — `/admin` в web (токен-логин) + бэкенд `src/admin` под `AdminGuard`
      (`X-Admin-Token` === `ADMIN_TOKEN`, deny by default). Статистика, CRUD мест, модерация
      ingestion (approve/reject), категории. Токен — в `/opt/mooni/.env`. Дальше можно: CRUD
      событий/партнёров/впечатлений, просмотр платежей/броней, отдельное admin-приложение.
- [x] **n8n на сервере** — развёрнут: **https://n8n.suspectuso.ru** (npm-глобал + systemd `n8n.service`,
      данные `/opt/n8n`, env `/opt/n8n/n8n.env` с `N8N_ENCRYPTION_KEY`, nginx-сабдомен + Let's Encrypt +
      basic-auth `mooni`; вебхук-пути открыты для входящих триггеров). Дальше: собрать workflow
      IG/TG → AI-структуризация → HTTP-нода `POST https://mooni.suspectuso.ru/api/ingestion/raw`
      (заголовок `X-Ingest-Secret`) → модерация в админке → `place`.
- [x] **n8n workflow** — собран и проверен end-to-end: workflow `MooniIngest00001` (в репо
      `infra/n8n/`): сырой пост → Ollama `qwen2.5:14b-instruct` (`format:json`) структурирует в
      `{name,description,district,categorySlug,tags,moodTags}` → `POST /api/ingestion/raw`.
- [x] **Реальный источник + структурная ingestion** — `RawPost.suggestion Json?`, ingest принимает
      `suggestion`, админка `approve-suggested` (создать место из подсказки одним кликом).
      Workflow `MooniOSMPlaces01` (Schedule раз в день): **OpenStreetMap/Overpass** (кафе центра СПб,
      бесплатно, без ключей) → Ollama (описание+moodTags+район) → ingestion с подсказкой (name/
      categorySlug/гео). Проверено: 15 реальных кафе СПб в очередь модерации, approve-suggested
      создаёт место с координатами. Каталог растёт сам (модератор апрувит в /admin). Дальше:
      другие категории/районы (bbox), Telegram/IG-источники, фото-нода.
- [x] **Фильтры колоды** — compat `/networking/feed` принимает `mood/district/category`
      (проверено: romance→7, park→9). Дальше: UI-фильтры на свайп-экране.
- [ ] **Больше мест** — расширять каталог (сейчас 27) через ingestion/n8n.

### P2 — продуктовые фичи
- [x] **Random Coffee** — модель `CoffeeRequest`, модуль `coffee` (join/status/leave, подбор
      `pickMatch`, уведомление пары через бота), экран `/coffee`. Проверено: два юзера → пара.
      Дальше: вход из хаба/нав, фильтр по интересам при подборе.
- [x] **Ачивка-как-память** — модуль `memories` (`GET/POST /memories`), экран `/memories` (альбом
      ачивок с фото+заметкой+настроением). Проверено: добавление и список. Дальше: вход из профиля.
- [x] **Сезоны** — `Achievement.season`, `currentSeason` (по месяцу) + тесты, модуль `season`
      (`GET /season/current` — сезон + челленджи с прогрессом), экран `/season` + ссылка на хабе.
      Сезонные ачивки в сиде. Проверено: «Белые ночи», 2 челленджа.
- [x] **Лента города «TikTok города»** — модуль `city` (`GET /city/feed`, агрегирует слоты+события+
      места), экран `/city`. Проверено: 24 элемента (3 слота/6 событий/15 мест). Дальше: вход из
      нав, бесконечная прокрутка, действия/квесты в ленте.

### P3 — качество и масштаб
- [x] **Recommendation 2.0** — семантический подбор колоды: `Place.embedding` (nomic-embed-text),
      `AiService.embed`, `cosineSimilarity`/`rankByEmbedding` (+тесты). compat feed при `mood`
      ранжирует места по косинусу к эмбеддингу запроса настроения (кэш), фолбэк на moodTags.
      Backfill — `POST /admin/embed-places`. Проверено: 27/27, колода меняется под настроение.
      Дальше: учёт истории/времени/гео, дотюнить mood-запросы (качество на коротких RU-текстах).
- [x] **Хардненинг** — `AUTH_SKIP_TELEGRAM_VALIDATION=false` в проде. Общий резолвер
      `trustedTelegramId` (auth/trusted-user) во всех `?userId`-сервисах (compat/coffee/experiences/
      memories/season): при skip=false — строго из подтверждённого initData, `?userId` игнорируется.
      Фронт шлёт `X-Telegram-Init-Data` везде (axios-интерсептор + глобальный патч fetch). Проверено
      в проде: без initData→403, с валидным подписанным→200, с битым→403. ⚠️ Браузерное демо закрыто
      (вход только через Telegram). Откат: `AUTH_SKIP_TELEGRAM_VALIDATION="true"` в `/opt/mooni/.env`
      + `systemctl restart mooni-api`.
      Дальше (опц.): systemd от непривилегированного юзера.
- [x] **Audit-ledger susCoin/xp** — модель `BalanceLedger` (kind/delta/reason/refId), глобальный
      `LedgerService.record`, запись в точках мутации (qr_redeem, topup, route_progress) +
      `GET /admin/ledger`. Проверено в проде: QR-redeem → 2 записи (susCoin+15, xp+5, reason qr_redeem).
- [x] **E2E шире** — добавлены тесты на город/кофе/сезон/альбом/премиум (всего 9 e2e). Дальше:
      слот-join и оплата (с PAYMENTS_SKIP_INITDATA на стейджинге).
- [x] **Мониторинг** — `MonitoringService` (@nestjs/schedule, крон 5 мин): проверка БД+LLM,
      алерт в Telegram на переходе healthy↔down. `ADMIN_CHAT_ID` задан в проде (алерты приходят,
      тест-сообщение доставлено). Дальше: Sentry/Prometheus при желании.

### Технический долг
- [x] **Разнесён `compat.controller.ts`** (был >560 строк) на 4 под-контроллера
      (`compat-networking/users/sprints/content`) + `CompatService` (resolveUser, moodVector,
      toNetworkingCard, slotToSprint). Поведение 1:1, 69 тестов зелёные, проверено в проде
      (profile/sprints/events/users/liked/unread отвечают как раньше).
- [ ] **aislop по проекту** (ОТЛОЖЕНО): `aislop fix` применён (−412 строк console/комментариев).
      Остаток — ~675 варнингов в унаследованном фронте Match (`apps/web`: unused-vars, дубль-блоки,
      unsafe-касты) + 8 security-ошибок по dev/build-зависимостям (vite/vitest/esbuild/glob/tmp/
      picomatch/multer). Варианты: добавить `apps/web` в ignore `.aislop` (скорить только наш код)
      или чистить по мере переписывания экранов. Бамп уязвимых deps (vitest→3 + overrides) —
      аккуратно отдельным заходом, рискованно на живом проде.
- [x] Детальный экран впечатления (`/education/courses/:id`) — добавлены compat-эндпоинты
      `GET /courses/:id`, `GET /courses/:id/check-purchase`, `POST /bot/send-course-payment-message`
      (фиксирует бронь + уведомление в боте). Проверено в проде. Реальной оплаты пока нет (creds).
- [ ] Реальные фото для оставшихся ~6 мест (кофейни/бары/коворкинг — нет на Wikimedia) — через
      ingestion/n8n с mediaUrls. Места-памятники с фото закрыты (Площадь Искусств добавлена).
### Собственный дизайн Mooni (НАДО — самое сложное, делаем в конце)
- [x] **Онбординг в стиле Mooni** — радужно-минималистичный экран `/onboarding` («Привет 👋»
      градиентом, gradient-чипы, blobs), задаёт визуальный язык бренда. Первый Mooni-экран не от Match.
- [ ] **Остальной UI = дизайн Match** (вордмарк «МЭТЧ BIZ», тайлы Работа/Нетворкинг/Радар/Обучение,
      баннер «АНОМАЛИЯ × МЭТЧ»). Распространить радужный стиль Mooni на хаб/свайп/разделы. Брендовые
      тайлы-картинки — нужны арт-ассеты.
- [x] **Карта маршрута** — `RouteMap` (leaflet, тёмные тайлы Carto): линия через нумерованные точки-
      места + попапы. На экране маршрута (`/networking/likes`). Бэкенд отдаёт lat/lng точек. Проверено
      в проде: 5 маркеров + линия по карте СПб.

### Пробелы относительно видения (дневник) — НАДО (кроме памятников)
Полное сравнение в чате. По приоритету:
- [x] **Персонализация** — психотип + интересы. Модуль `profile` (`GET/POST /me/profile`),
      экран `/onboarding` (психотип + чипы интересов) + вход с хаба «⚙️ Настроить». Колода без mood
      ранжируется по совпадению интересов с тегами места; `ai.buildRoute` получает психотип+интересы
      в промпт. Проверено в проде: интересы [архитектура,кофе] → вся топ-колода по теме. e2e добавлен.
      Дальше: учитывать психотип в подборе (интроверт→тихие места), смешивать с mood.
- [x] **Сценарии (вайб)** — экран `/scenarios` (вход «🎭 Вайб» с хаба): 7 сценариев → ключ настроения
      → `localStorage.mooniMood` → колода свайпа (оба fetch) и сборка маршрута строятся под вайб
      (семантика по эмбеддингам). Проверено в проде: «Свидание» → feed `&mood=romance`.
- [x] **Маршруты под погоду/время** — `ContextService` (open-meteo, бесплатно): погода СПб + время
      суток в промпт `buildRoute` («в дождь — крытые, вечером — атмосферные»). `GET /city/context`.
      Проверено в проде: `{облачно, 18.6°, вечер}`.
- [~] **Голосовой ввод маршрута** — APP-ЧАСТЬ ГОТОВА и задеплоена: `AsrService` (шлёт аудио на
      `ASR_URL`), голос-хендлер бота (`message:voice`→транскрипт→`parseMood`→маршрут), `parseMood`+тесты,
      `infra/asr/parakeet_server.py`. ⚠️ ASR-СЕРВЕР НЕ ПОДНЯТ (отложено): на sus драйвер 535 не тянет
      CUDA13-torch (NeMo) → только CPU; NeMo 2.7.3 не грузит `parakeet-tdt-0.6b-v3` (abstract ASRModel).
      Резюме: либо обновить GPU-драйвер на sus (есть sudo, но нужен РЕБУТ — sus хостит Ollama+git!),
      либо faster-whisper на CPU. Когда сервер будет — задать `ASR_URL` в `/opt/mooni/.env` +
      `parakeet-tunnel.service` на play2go (копия ollama-tunnel, порт 9001). Детали: `infra/asr/README.md`.
- [x] **Финтех LTV/Cashback** — механика заложена: на `markPaid` возвращаем 5% траты в susCoin
      (ledger reason `cashback`), конвертация USDT→₽. Сработает на реальных платежах (ждёт креды).
- [ ] **Билеты с наценкой** — интеграция афиша-API (KudaGo/Timepad), продажа с комиссией.
- [x] **Афиша-агрегатор** — `AfishaService` тянет реальные события СПб из **KudaGo** (публичный API,
      бесплатно) → upsert в `Event` (дедуп source+externalId), крон раз в день + `POST /admin/afisha/sync`.
      `Event.imageUrl/placeName/externalId` добавлены; compat `/events/upcoming` отдаёт фото. Проверено
      в проде: 16 событий (Театр/Концерт/Вечеринка) с картинками на главной. Дальше: фильтр гео/интересы,
      пагинация, ещё источники (Timepad).
- [x] **Контекстный подбор впечатлений** — `asCourses` ранжирует впечатления по совпадению интересов
      пользователя с названием/описанием/категорией; экран education шлёт userId. Дальше: учёт погоды/
      настроения, сертификаты-впечатления.
- [x] **Расширенное коммьюнити (типы)** — Random Coffee теперь с типом активности (кофе/прогулка/
      знакомство/бадди), матч только в рамках одного типа (`CoffeeRequest.kind`), UI-чипы на `/coffee`.
      Проверено в проде. Дальше: районные банды, Speed Friending как групповой формат.
- [x] **Трекер настроения** — вайб сохраняется при свайпе (`Swipe.moodAt` из `mooniMood`),
      `GET /me/profile/vibes` (распределение + топ), экран `/vibes` («📊 Вайбы» с хаба, бирюзовые бары).
      Проверено в проде: свайп romance → top=romance. Дальше: паттерны во времени («в дождь — тишина»).
- [x] **Уровни доверия + секретные места** — `cityLevel(xp)` (пороги 0/30/80/150/250/400) + тесты,
      `Place.minLevel`, колода фильтрует `minLevel<=уровень`, профиль-статы отдают level+xpToNext.
      2 секретных места в сиде/проде. Проверено: на уровне 1 видно 26/28. Дальше: «секрет разблокирован» UI.
- [x] **Каталог локальных услуг** — модель `LocalService` (гид/фото/крыши/площадка/экскурсия),
      `GET /services`, экран `/services` («🛎 Услуги» с хаба), сид 4 услуги. В проде.
- [x] **Помощь в отношениях** (à la Between) — `src/relationship`: 12 вопросов для двоих +
      AI-идея свидания (`POST /relationship/date-idea`), экран `/couple` («💞 Для двоих»). В проде.
- [x] **City Missions** — `UserMission` + `src/missions`: 4 миссии (свайпы/маршрут/кофе/уровень),
      выполнение из данных юзера, claim→награда susCoin/xp (ledger `mission:*`, один раз), экран
      `/missions` («🎯 Миссии»). Проверено: claim swipe_5 → +5/+5, повтор → 409.
      (Вишлисты ≈ уже реализованы лайками мест → маршрут; отдельный не делаем.)
      Дальше (опц.): ежедневный сброс миссий, Deep Talks.
- [ ] **2D-Муни активный** — ведёт сценарий (спросить настроение → подбор → поздравить с ачивкой),
      «городские герои» (бариста→художник→гид).
- [x] ~~Распознавание памятников по фото (СасХистory)~~ — **НЕ делаем** (решение пользователя).

---

## 5. Шпаргалка по разработке

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d   # pg/redis (dev)
pnpm db:push && pnpm db:seed
ssh -p <PORT> -L 11434:127.0.0.1:11434 <user>@<GPU_HOST>   # туннель к Ollama для AI
pnpm dev            # api :8001 + web :3030
pnpm ci             # format + lint + typecheck + test
pnpm test:e2e       # Playwright против прода
git push            # = деплой (CI/CD)
```

Наполнение реальными фото: `python3 /tmp/wiki_*.py` (ru.wikipedia pageimages, нужен User-Agent) →
вставить в `apps/api/prisma/seed.ts` (`places.push` + `Object.assign(photoMap, …)`) → `db:seed`.

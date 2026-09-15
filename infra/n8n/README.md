# n8n — ingestion-пайплайн Mooni

n8n развёрнут на сервере play2go: **https://n8n.suspectuso.ru** (basic-auth, юзер `mooni`).
Сервис `n8n.service` (systemd), слушает `127.0.0.1:5678`, данные в `/opt/n8n`,
конфиг `/opt/n8n/n8n.env` (там же `N8N_ENCRYPTION_KEY` — не терять, иначе слетят креды нод).

## Workflow «Mooni — ingestion (IG/TG → AI → модерация)»

Файл: [`mooni-ingestion.workflow.json`](./mooni-ingestion.workflow.json) (id `MooniIngest00001`).

Ноды:
1. **Запуск (тест)** — Manual Trigger (для прода заменить на источник: Telegram/IG-триггер или Schedule + чтение каналов).
2. **Сырой пост** — пример входных данных `{source, externalId, text}`.
3. **AI-структуризация (Ollama)** — `POST http://127.0.0.1:11434/api/generate`, модель `qwen2.5:14b-instruct`,
   `format: json` → возвращает `{name, description, district, categorySlug, tags, moodTags}`.
4. **Сборка payload** — кладёт AI-структуру в `text` (модератор увидит подсказку).
5. **→ Mooni ingestion** — `POST https://mooni.suspectuso.ru/api/ingestion/raw`,
   заголовок `X-Ingest-Secret` (значение из `/opt/mooni/.env`, `INGEST_SECRET`).

Дальше пост попадает в очередь `raw_post (status=new)` и проходит **ручную модерацию в админке**
(`/admin`): approve → создаётся `place`, reject → отклоняется. В боевой каталог n8n напрямую НЕ пишет.

## Workflow «Mooni — места из OpenStreetMap»

Файл: [`mooni-osm-places.workflow.json`](./mooni-osm-places.workflow.json) (id `MooniOSMPlaces01`).
**Реальный источник, растит каталог сам** (бесплатно, без ключей):
1. **Расписание (раз в день)** + Manual Trigger для теста.
2. **OSM Overpass** — `POST overpass-api.de/api/interpreter`, кафе центра СПб с названием (bbox + `out 15`). Retry ×3 (Overpass иногда перегружен).
3. **Парсинг OSM** (Code) — элементы → `{externalId: osm-<id>, name, lat, lng, categorySlug}`.
4. **AI-описание (Ollama)** — на каждое место генерит описание + `moodTags` + район (`format:json`).
5. **Сборка suggestion** (Code, режим «по каждому элементу») — структурная подсказка.
6. **→ Mooni ingestion** — `POST /api/ingestion/raw` с полем `suggestion`.

В админке (`/admin`) модератор апрувит подсказку **одним кликом**:
`POST /api/admin/ingestion/:id/approve-suggested` → место создаётся с координатами/категорией/настроением.
Проверено: 15 кафе СПб → очередь модерации; approve-suggested создаёт место с гео.
Чтобы тянуть другие категории/районы — поменять `amenity`/bbox в ноде Overpass.

## Импорт / обновление на сервере

```bash
scp infra/n8n/mooni-ingestion.workflow.json <user>@<PROD_HOST>:/tmp/
ssh <user>@<PROD_HOST>
set -a; . /opt/n8n/n8n.env; set +a
node /usr/lib/node_modules/n8n/bin/n8n import:workflow --input=/tmp/mooni-ingestion.workflow.json
```

Тестовый прогон из CLI (конфликтует с работающим сервисом — остановить на время):
```bash
systemctl stop n8n && node /usr/lib/node_modules/n8n/bin/n8n execute --id MooniIngest00001 ; systemctl start n8n
```
В обычном режиме workflow запускается/редактируется в UI https://n8n.suspectuso.ru.

import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'

const KUDAGO_CAT: Record<string, string> = {
  concert: 'Концерт',
  exhibition: 'Выставка',
  theater: 'Театр',
  party: 'Вечеринка',
  festival: 'Фестиваль',
  education: 'Лекция',
  tour: 'Экскурсия',
  kids: 'Детям',
  cinema: 'Кино',
  stock: 'Акция',
  entertainment: 'Развлечение',
  quest: 'Квест',
  show: 'Шоу',
  fashion: 'Мода',
  yarmarka: 'Ярмарка',
}

interface KudaGoEvent {
  id: number
  title: string
  dates?: { start: number; end: number }[]
  place?: { title?: string; coords?: { lat?: number; lon?: number } } | null
  categories?: string[]
  images?: { image?: string }[]
}

/**
 * Афиша-агрегатор (СасАфиша): тянет реальные события СПб из публичного API KudaGo
 * (бесплатно, без ключей) → upsert в `Event` (дедуп по source+externalId). Раз в день + ручной триггер.
 */
@Injectable()
export class AfishaService {
  private readonly logger = new Logger(AfishaService.name)

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async daily() {
    try {
      const n = await this.sync()
      this.logger.log(`KudaGo sync: ${n} событий`)
    } catch (e) {
      this.logger.warn(`KudaGo sync failed: ${String(e)}`)
    }
  }

  /** Забирает ближайшие события СПб и сохраняет. Возвращает число обработанных. */
  async sync(limit = 60): Promise<number> {
    const now = Math.floor(Date.now() / 1000)
    const base =
      process.env.KUDAGO_BASE_URL ?? 'https://kudago.com/public-api/v1.4'
    const url =
      `${base}/events/?lang=ru&location=spb` +
      `&page_size=${limit}&actual_since=${now}&order_by=date&text_format=text` +
      `&fields=id,title,dates,place,categories,images`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MooniBot/1.0 (classgk@gmail.com)' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`KudaGo ${res.status}`)
    const data = (await res.json()) as { results?: KudaGoEvent[] }
    const events = data.results ?? []

    let saved = 0
    for (const e of events) {
      const startUnix = (e.dates ?? [])
        .map((d) => d.start)
        .filter((s) => s && s >= now)
        .sort((a, b) => a - b)[0]
      if (!startUnix) continue // нет будущей даты — пропускаем

      const category = KUDAGO_CAT[e.categories?.[0] ?? ''] ?? 'Событие'
      const coords = e.place?.coords
      const payload = {
        title: e.title
          ? e.title[0].toUpperCase() + e.title.slice(1)
          : 'Событие',
        category,
        placeName: e.place?.title ?? null,
        startsAt: new Date(startUnix * 1000),
        lat: coords?.lat ?? null,
        lng: coords?.lon ?? null,
        imageUrl: e.images?.[0]?.image ?? null,
        source: 'kudago',
      }
      await this.prisma.event.upsert({
        where: {
          source_externalId: { source: 'kudago', externalId: String(e.id) },
        },
        update: payload,
        create: { ...payload, externalId: String(e.id) },
      })
      saved++
    }
    return saved
  }
}

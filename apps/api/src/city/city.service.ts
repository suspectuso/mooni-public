import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface CityItem {
  type: 'slot' | 'event' | 'place'
  id: string
  title: string
  subtitle: string
  photo: string | null
  at: string | null
}

/**
 * «TikTok города» (fichi_i_mehaniki): единая лента реальной городской активности —
 * слоты-сборы, события афиши, новые места.
 */
@Injectable()
export class CityService {
  async feed(): Promise<CityItem[]> {
    const now = new Date()
    const [slots, events, places] = await Promise.all([
      this.prisma.activitySlot.findMany({
        where: {
          status: { in: ['open', 'confirmed'] },
          startsAt: { gte: now },
        },
        orderBy: { startsAt: 'asc' },
        include: { participants: { where: { status: 'joined' } } },
        take: 15,
      }),
      this.prisma.event.findMany({
        where: { startsAt: { gte: now } },
        orderBy: { startsAt: 'asc' },
        take: 15,
      }),
      this.prisma.place.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
        include: { category: true },
        take: 15,
      }),
    ])

    const items: CityItem[] = [
      ...slots.map((s) => ({
        type: 'slot' as const,
        id: s.id,
        title: s.title,
        subtitle:
          `Сбор · ${s.participants.length}/${s.maxParticipants}` +
          (s.district ? ` · ${s.district}` : ''),
        photo: null,
        at: s.startsAt.toISOString(),
      })),
      ...events.map((e) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        subtitle:
          `Событие · ${e.category}` + (e.district ? ` · ${e.district}` : ''),
        photo: null,
        at: e.startsAt.toISOString(),
      })),
      ...places.map((p) => ({
        type: 'place' as const,
        id: p.id,
        title: p.name,
        subtitle:
          `Место · ${p.category.title}` +
          (p.district ? ` · ${p.district}` : ''),
        photo: p.photos[0] ?? null,
        at: p.createdAt.toISOString(),
      })),
    ]

    // перемешиваем типы, чтобы лента была разнообразной (детерминированно — по хешу id)
    return items.sort((a, b) => this.rank(a) - this.rank(b))
  }

  // ближайшие по времени слоты/события — выше; места — вперемешку
  private rank(i: CityItem): number {
    if (i.type === 'place') return 1
    return 0
  }

  constructor(private prisma: PrismaService) {}
}

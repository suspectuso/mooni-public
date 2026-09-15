import { Injectable } from '@nestjs/common'
import type { EventCard, EventsQuery } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /** Афиша: ближайшие события, опционально по категории. */
  async upcoming(query: EventsQuery): Promise<EventCard[]> {
    const events = await this.prisma.event.findMany({
      where: {
        startsAt: { gte: new Date() },
        ...(query.category ? { category: query.category } : {}),
      },
      orderBy: { startsAt: 'asc' },
      take: query.limit,
    })
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      startsAt: e.startsAt.toISOString(),
      district: e.district,
      lat: e.lat,
      lng: e.lng,
    }))
  }
}

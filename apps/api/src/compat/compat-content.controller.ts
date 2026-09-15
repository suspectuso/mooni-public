import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Совместимость с фронтом Match: афиша для главной (`/events/upcoming`) и
 * заглушка счётчика непрочитанных (убирает 404 на входе).
 */
@Controller()
export class CompatContentController {
  constructor(private prisma: PrismaService) {}

  // Афиша: главная зовёт /events/upcoming, форма Match {id,title,imageUrl,postUrl,eventDate,isActive}
  @Get('events/upcoming')
  async eventsUpcoming() {
    const events = await this.prisma.event.findMany({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: 20,
    })
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      imageUrl: e.imageUrl,
      postUrl: null,
      category: e.category,
      placeName: e.placeName,
      eventDate: e.startsAt.toISOString(),
      isActive: true,
      // координаты для раздела «Карта» (/map); есть не у всех событий
      lat: e.lat,
      lng: e.lng,
    }))
  }

  // Счётчик непрочитанных — заглушка (убирает 404 на главной)
  @Get('notifications/unread-count')
  unreadCount() {
    return { count: 0 }
  }
}

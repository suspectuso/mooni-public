import { Injectable } from '@nestjs/common'
import type { SwipeInput } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'
import { GamificationService } from '../gamification/gamification.service'

@Injectable()
export class SwipeService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  /** Записывает свайп. Лайк не создаёт мэтч — просто помечает место кандидатом. */
  async swipe(userId: string, input: SwipeInput) {
    await this.prisma.swipe.upsert({
      where: { userId_placeId: { userId, placeId: input.placeId } },
      update: { liked: input.liked, moodAt: input.moodAt ?? null },
      create: {
        userId,
        placeId: input.placeId,
        liked: input.liked,
        moodAt: input.moodAt ?? null,
      },
    })
    await this.gamification.grant(userId, 'first_swipe', 'swipe')
    const likedCount = await this.prisma.swipe.count({
      where: { userId, liked: true },
    })
    return { ok: true, likedCount }
  }

  /** Лайкнутые места — кандидаты в маршрут. */
  async likedPlaces(userId: string) {
    const swipes = await this.prisma.swipe.findMany({
      where: { userId, liked: true },
      orderBy: { createdAt: 'desc' },
      include: { place: { include: { category: true } } },
    })
    return swipes.map((s) => ({
      id: s.place.id,
      name: s.place.name,
      description: s.place.description,
      category: s.place.category.slug,
      district: s.place.district,
      lat: s.place.lat,
      lng: s.place.lng,
      tags: s.place.tags,
      moodTags: s.place.moodTags,
      photos: s.place.photos,
      priceLevel: s.place.priceLevel,
    }))
  }

  /** Откат последнего свайпа (rewind). */
  async rewind(userId: string, placeId: string) {
    await this.prisma.swipe.deleteMany({ where: { userId, placeId } })
    return { ok: true }
  }
}

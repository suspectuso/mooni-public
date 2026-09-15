import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { trustedTelegramId } from '../auth/trusted-user'

export interface ProfileInput {
  psychotype?: string | null
  interests?: string[]
}

/**
 * Персонализация (ядро видения): психотип + интересы пользователя.
 * Используются в подборе колоды (compat feed) и в сборке AI-маршрута.
 */
@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  private async resolve(userId?: string, initData?: string) {
    const telegramId = trustedTelegramId(userId, initData)
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  async get(userId?: string, initData?: string) {
    const user = await this.resolve(userId, initData)
    const interests = await this.prisma.userInterest.findMany({
      where: { userId: user.id },
      select: { tag: true },
    })
    return {
      psychotype: user.psychotype,
      interests: interests.map((i) => i.tag),
    }
  }

  /** Трекер настроения: распределение вайбов по свайпам пользователя. */
  async vibes(userId?: string, initData?: string) {
    const user = await this.resolve(userId, initData)
    const grouped = await this.prisma.swipe.groupBy({
      by: ['moodAt'],
      where: { userId: user.id, moodAt: { not: null } },
      _count: { moodAt: true },
    })
    const items = grouped
      .map((g) => ({ mood: g.moodAt as string, count: g._count.moodAt }))
      .sort((a, b) => b.count - a.count)
    const total = items.reduce((s, i) => s + i.count, 0)
    return { total, top: items[0]?.mood ?? null, items }
  }

  async set(userId: string, input: ProfileInput, initData?: string) {
    const user = await this.resolve(userId, initData)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { psychotype: input.psychotype ?? null },
    })
    if (input.interests) {
      const tags = [
        ...new Set(input.interests.map((t) => t.trim()).filter(Boolean)),
      ]
      await this.prisma.userInterest.deleteMany({ where: { userId: user.id } })
      if (tags.length) {
        await this.prisma.userInterest.createMany({
          data: tags.map((tag) => ({ userId: user.id, tag })),
        })
      }
    }
    return this.get(userId, initData)
  }
}

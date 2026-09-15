import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { trustedTelegramId } from '../auth/trusted-user'
import { currentSeason } from './season.logic'

@Injectable()
export class SeasonService {
  constructor(private prisma: PrismaService) {}

  private async resolveUser(userId?: string, initData?: string) {
    const skip = process.env.AUTH_SKIP_TELEGRAM_VALIDATION === 'true'
    if (!userId && (skip || !initData)) return null // анонимный просмотр сезона
    const telegramId = trustedTelegramId(userId, initData)
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  /** Текущий сезон + его челленджи с отметкой «получено» для пользователя. */
  async current(userId?: string, initData?: string) {
    const season = currentSeason()
    const user = await this.resolveUser(userId, initData)

    const achievements = await this.prisma.achievement.findMany({
      where: { season: season.key },
      orderBy: { level: 'asc' },
    })
    const earned = user
      ? new Set(
          (
            await this.prisma.userAchievement.findMany({
              where: { userId: user.id },
              select: { achievementId: true },
            })
          ).map((e) => e.achievementId),
        )
      : new Set<string>()

    return {
      ...season,
      challenges: achievements.map((a) => ({
        key: a.key,
        title: a.title,
        level: a.level,
        earned: earned.has(a.id),
      })),
    }
  }
}

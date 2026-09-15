import { Injectable, NotFoundException } from '@nestjs/common'
import type { Profile } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Профиль-альбом: XP, счётчики и все ачивки (полученные + ещё нет). */
  async profile(userId: string): Promise<Profile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const [likedCount, routesCount, allAchievements, earned] =
      await Promise.all([
        this.prisma.swipe.count({ where: { userId, liked: true } }),
        this.prisma.route.count({ where: { userId } }),
        this.prisma.achievement.findMany({ orderBy: { level: 'asc' } }),
        this.prisma.userAchievement.findMany({ where: { userId } }),
      ])

    const earnedMap = new Map(
      earned.map((e) => [e.achievementId, e.earnedAt.toISOString()]),
    )

    const levelRank: Record<string, number> = { base: 0, advanced: 1, epic: 2 }
    const achievements = allAchievements
      .map((a) => ({
        key: a.key,
        title: a.title,
        level: a.level,
        earnedAt: earnedMap.get(a.id) ?? null,
      }))
      .sort((a, b) => (levelRank[a.level] ?? 9) - (levelRank[b.level] ?? 9))

    return {
      id: user.id,
      firstName: user.firstName,
      username: user.username,
      xp: user.xp,
      likedCount,
      routesCount,
      achievements,
    }
  }
}

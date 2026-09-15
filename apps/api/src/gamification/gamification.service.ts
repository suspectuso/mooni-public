import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/** Выдача ачивок. Прозрачно: ачивка существует в БД (сид), выдаём связку user↔achievement. */
@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name)

  constructor(private prisma: PrismaService) {}

  /** Выдать ачивку по ключу, если она есть и ещё не выдана. Идемпотентно. */
  async grant(userId: string, key: string, source?: string) {
    const ach = await this.prisma.achievement.findUnique({ where: { key } })
    if (!ach) return
    try {
      await this.prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: ach.id },
        },
        update: {},
        create: { userId, achievementId: ach.id, source: source ?? null },
      })
    } catch (e) {
      this.logger.warn(`grant ${key} failed: ${String(e)}`)
    }
  }

  /** Проверка «Исследователь Петербурга»: ≥3 разных района среди пройденных точек. */
  async checkExplorer(userId: string) {
    const donePoints = await this.prisma.routePoint.findMany({
      where: { done: true, route: { userId } },
      include: { place: { select: { district: true } } },
    })
    const districts = new Set(
      donePoints.map((p) => p.place.district).filter(Boolean),
    )
    if (districts.size >= 3) {
      await this.grant(userId, 'explorer_3_districts', 'route')
    }
  }
}

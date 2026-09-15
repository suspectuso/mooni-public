import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { trustedTelegramId } from '../auth/trusted-user'

export interface MemoryInput {
  achievementKey: string
  note?: string
  photo?: string
  mood?: string
}

/**
 * Ачивка-как-память (fichi_i_mehaniki): к полученной ачивке прикрепляем
 * фото/заметку/настроение — профиль листается как «альбом жизни».
 */
@Injectable()
export class MemoriesService {
  constructor(private prisma: PrismaService) {}

  private async resolveUser(userId: string, initData?: string) {
    const telegramId = trustedTelegramId(userId, initData)
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  /** Альбом: полученные ачивки с воспоминаниями, новые сверху. */
  async list(userId: string, initData?: string) {
    const user = await this.resolveUser(userId, initData)
    const earned = await this.prisma.userAchievement.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: 'desc' },
      include: {
        achievement: { select: { key: true, title: true, level: true } },
      },
    })
    return earned.map((e) => ({
      key: e.achievement.key,
      title: e.achievement.title,
      level: e.achievement.level,
      earnedAt: e.earnedAt.toISOString(),
      note: e.memoryNote,
      photo: e.memoryPhoto,
      mood: e.mood,
    }))
  }

  /** Привязать воспоминание к уже полученной ачивке. */
  async add(userId: string, input: MemoryInput, initData?: string) {
    const user = await this.resolveUser(userId, initData)
    const ach = await this.prisma.achievement.findUnique({
      where: { key: input.achievementKey },
    })
    if (!ach) throw new NotFoundException('Ачивка не найдена')

    const ua = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId: user.id, achievementId: ach.id },
      },
    })
    if (!ua) throw new NotFoundException('Сначала получи эту ачивку')

    await this.prisma.userAchievement.update({
      where: { id: ua.id },
      data: {
        memoryNote: input.note ?? ua.memoryNote,
        memoryPhoto: input.photo ?? ua.memoryPhoto,
        mood: input.mood ?? ua.mood,
      },
    })
    return { ok: true }
  }
}

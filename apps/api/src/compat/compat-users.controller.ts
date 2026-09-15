import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { isPremium } from '../experiences/market.logic'
import { trustedTelegramId } from '../auth/trusted-user'
import { cityLevel, xpToNext } from '../profile/city-level'
import { CompatService } from './compat.service'

/**
 * Совместимость с фронтом Match: апсёрт юзера (telegram-init) и профиль-трекер
 * (статы/предсказание/цвет дня — заглушки гимиков + наш XP/susCoin/ачивки).
 */
@Controller()
export class CompatUsersController {
  constructor(
    private prisma: PrismaService,
    private compat: CompatService,
  ) {}

  // telegram-init.tsx → создать/обновить пользователя
  @Post('users')
  async upsertUser(
    @Body()
    body: {
      telegramId: string
      username?: string | null
      firstName?: string | null
      lastName?: string | null
      avatarUrl?: string | null
    },
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const telegramId = trustedTelegramId(body.telegramId, initData)
    const user = await this.prisma.user.upsert({
      where: { telegramId },
      update: {
        username: body.username ?? undefined,
        firstName: body.firstName ?? undefined,
      },
      create: {
        telegramId,
        username: body.username ?? null,
        firstName: body.firstName ?? null,
      },
    })
    return { id: user.id, telegramId: user.telegramId.toString() }
  }

  @Get('users/telegram/:tgId')
  async userByTelegram(
    @Param('tgId') tgId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(tgId, initData)
    let achievementsText = ''
    if (user) {
      const ua = await this.prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: { select: { title: true } } },
      })
      achievementsText = ua.map((a) => a.achievement.title).join(', ')
    }
    return {
      id: user?.id ?? '',
      telegramId: tgId,
      firstName: user?.firstName ?? null,
      username: user?.username ?? null,
      avatarUrl: null,
      xp: user?.xp ?? 0,
      susCoin: user?.susCoin ?? 0,
      premiumUntil: user?.premiumUntil ?? null,
      isPremium: isPremium(user?.premiumUntil),
      achievements: achievementsText,
    }
  }

  // Профиль-трекер Match: статы/предсказание/цвет — заглушки + наш XP
  @Get('users/:id/stats')
  async userStats(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    const likedCount = user
      ? await this.prisma.swipe.count({ where: { userId: id, liked: true } })
      : 0
    const routesCount = user
      ? await this.prisma.route.count({ where: { userId: id } })
      : 0
    const xp = user?.xp ?? 0
    return {
      weekStats: [],
      xp,
      susCoin: user?.susCoin ?? 0,
      level: cityLevel(xp),
      xpToNext: xpToNext(xp),
      streak: 0,
      likedCount,
      routesCount,
    }
  }

  @Get('users/:id/prediction')
  userPrediction() {
    return { prediction: '' }
  }

  @Get('users/:id/daily-color')
  userDailyColor() {
    return { colorHex: '#65fff7' }
  }
}

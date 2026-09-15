import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { rankByEmbedding } from '../ai/embedding'
import { ProfileService } from '../profile/profile.service'
import { cityLevel } from '../profile/city-level'
import { CompatService } from './compat.service'

/**
 * Совместимость с фронтом Match (UID-протокол `?userId=<telegramId>`, без JWT):
 * колода мест в форме NetworkingProfile, свайп и сборка маршрута из лайков.
 * Эндпоинты НЕ под JwtAuthGuard — авторизация по userId, как в Match.
 */
@Controller()
export class CompatNetworkingController {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private compat: CompatService,
    private profileSvc: ProfileService,
  ) {}

  // Гейт «профиль заполнен» — возвращаем синтетически полный профиль,
  // чтобы свайп-экран не редиректил на онбординг знакомств.
  @Get('networking/profile')
  async profile(
    @Query('userId') userId?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)
    return {
      id: user?.id ?? 'guest',
      networkingName: user?.firstName ?? 'Гость',
      networkingPhoto: '',
      networkingLocation: 'Санкт-Петербург',
      networkingAge: 25,
      networkingGender: 'NONE',
      networkingAbout: 'Исследую город с Mooni',
      networkingSkills: [{ name: 'город' }],
      networkingValues: [{ name: 'впечатления' }],
      networkingLookingFor: ['places'],
      networkingAura: 'NONE',
      networkingCases: [],
      hasWorkProfile: false,
      primarySkill: null,
    }
  }

  // Колода мест в форме NetworkingProfile
  @Get('networking/feed')
  async feed(
    @Query('userId') userId?: string,
    @Query('mood') mood?: string,
    @Query('district') district?: string,
    @Query('category') category?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)

    let excludeIds: string[] = []
    if (user) {
      const swiped = await this.prisma.swipe.findMany({
        where: { userId: user.id },
        select: { placeId: true },
      })
      excludeIds = swiped.map((s) => s.placeId)
    }

    // городской уровень доверия: секретные места видны не ниже уровня юзера
    const level = cityLevel(user?.xp ?? 0)

    const baseWhere = {
      active: true,
      id: { notIn: excludeIds },
      minLevel: { lte: level },
      ...(district ? { district } : {}),
      ...(category ? { category: { slug: category } } : {}),
    }

    // Recommendation 2.0: при настроении — семантический подбор по эмбеддингам
    const moodVec = mood ? await this.compat.moodVector(mood) : null
    if (moodVec) {
      const candidates = await this.prisma.place.findMany({
        where: baseWhere,
        include: { category: true },
        take: 200,
      })
      const ranked = rankByEmbedding(
        candidates.map((p) => ({
          item: p,
          embedding: (p.embedding as number[] | null) ?? null,
        })),
        moodVec,
        20,
      )
      return ranked.map((p) => this.compat.toNetworkingCard(p))
    }

    // персонализация по интересам: без настроения ранжируем по совпадению тегов
    const interests = user
      ? (await this.profileSvc.get(userId, initData)).interests
      : []
    if (!mood && interests.length) {
      const wanted = new Set(interests.map((t) => t.toLowerCase()))
      const candidates = await this.prisma.place.findMany({
        where: baseWhere,
        include: { category: true },
        take: 200,
      })
      const scored = candidates
        .map((p) => ({
          p,
          score: [...p.tags, ...p.moodTags].filter((t) =>
            wanted.has(t.toLowerCase()),
          ).length,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
      return scored.map((s) => this.compat.toNetworkingCard(s.p))
    }

    // фолбэк: фильтр по moodTags (или без настроения)
    const places = await this.prisma.place.findMany({
      where: { ...baseWhere, ...(mood ? { moodTags: { has: mood } } : {}) },
      include: { category: true },
      take: 20,
    })
    return places.map((p) => this.compat.toNetworkingCard(p))
  }

  // Свайп места. Места не лайкают в ответ → isMatch всегда false.
  @Post('networking/swipe')
  async swipe(
    @Query('userId') userId: string,
    @Query('mood') mood: string | undefined,
    @Body() body: { candidateId: string; action: 'like' | 'skip' },
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)
    if (!user) return { isMatch: false }
    const liked = body.action === 'like'
    const moodAt = mood || null
    await this.prisma.swipe.upsert({
      where: { userId_placeId: { userId: user.id, placeId: body.candidateId } },
      update: { liked, moodAt },
      create: { userId: user.id, placeId: body.candidateId, liked, moodAt },
    })
    return { isMatch: false }
  }

  // Откат свайпа (rewind «назад»)
  @Delete('networking/unlike/:placeId')
  async unlike(
    @Query('userId') userId: string,
    @Param('placeId') placeId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)
    if (user) {
      await this.prisma.swipe.deleteMany({
        where: { userId: user.id, placeId },
      })
    }
    return { ok: true }
  }

  // Лимиты rewind — заглушки (без подписочной механики Match)
  @Get('networking/rewind')
  rewindStatus() {
    return { rewindCount: 0, rewindLimit: 999, remaining: 999, resetAt: null }
  }

  @Post('networking/rewind/use')
  rewindUse() {
    return { rewindCount: 0, remaining: 999 }
  }

  // ── Маршрут из лайкнутых мест (замыкаем ядро свайп→маршрут) ──

  @Get('networking/liked')
  async liked(
    @Query('userId') userId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)
    if (!user) return []
    const swipes = await this.prisma.swipe.findMany({
      where: { userId: user.id, liked: true },
      orderBy: { createdAt: 'desc' },
      include: { place: { include: { category: true } } },
    })
    return swipes.map((s) => ({
      id: s.place.id,
      name: s.place.name,
      photo: s.place.photos[0] ?? '',
      district: s.place.district,
      category: s.place.category.title,
      tags: s.place.tags,
    }))
  }

  @Post('networking/route/build')
  async buildRoute(
    @Query('userId') userId: string,
    @Body() body: { mood?: string },
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)
    if (!user) return { error: 'no user' }

    const swipes = await this.prisma.swipe.findMany({
      where: { userId: user.id, liked: true },
      include: { place: true },
    })
    if (swipes.length === 0) return { error: 'no liked places' }

    const places = swipes.map((s) => ({
      id: s.place.id,
      name: s.place.name,
      description: s.place.description,
      district: s.place.district,
      tags: s.place.tags,
      lat: s.place.lat,
      lng: s.place.lng,
    }))

    const prof = await this.profileSvc.get(userId, initData)
    const ordered = await this.ai.buildRoute(places, body.mood, prof)

    const route = await this.prisma.route.create({
      data: {
        userId: user.id,
        title: ordered.title,
        mood: body.mood ?? null,
        status: 'active',
        points: {
          create: ordered.points.map((p, idx) => ({
            placeId: p.id,
            order: idx,
            note: p.note || null,
          })),
        },
      },
    })
    return this.getRoute(userId, route.id, initData)
  }

  @Get('networking/route/:id')
  async getRoute(
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    const user = await this.compat.resolveUser(userId, initData)
    const route = await this.prisma.route.findFirst({
      where: { id, userId: user?.id },
      include: {
        points: {
          orderBy: { order: 'asc' },
          include: { place: { include: { category: true } } },
        },
      },
    })
    if (!route) return { error: 'not found' }
    return {
      id: route.id,
      title: route.title,
      points: route.points.map((pt) => ({
        order: pt.order,
        note: pt.note,
        name: pt.place.name,
        district: pt.place.district,
        photo: pt.place.photos[0] ?? '',
        lat: pt.place.lat,
        lng: pt.place.lng,
      })),
    }
  }
}

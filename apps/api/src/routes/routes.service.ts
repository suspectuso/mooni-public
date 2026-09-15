import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { BuildRouteInput, Route } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { GamificationService } from '../gamification/gamification.service'
import { LedgerService } from '../ledger/ledger.service'

@Injectable()
export class RoutesService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private gamification: GamificationService,
    private ledger: LedgerService,
  ) {}

  /** Собирает маршрут из лайкнутых мест (или из переданного списка) через LLM. */
  async build(userId: string, input: BuildRouteInput): Promise<Route> {
    const where = input.placeIds?.length
      ? { userId, liked: true, placeId: { in: input.placeIds } }
      : { userId, liked: true }

    const swipes = await this.prisma.swipe.findMany({
      where,
      include: { place: true },
    })
    if (swipes.length === 0) {
      throw new BadRequestException('Нет лайкнутых мест для маршрута')
    }

    const places = swipes.map((s) => ({
      id: s.place.id,
      name: s.place.name,
      description: s.place.description,
      district: s.place.district,
      tags: s.place.tags,
      lat: s.place.lat,
      lng: s.place.lng,
    }))

    const ordered = await this.ai.buildRoute(places, input.mood)

    const route = await this.prisma.route.create({
      data: {
        userId,
        title: ordered.title,
        mood: input.mood ?? null,
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

    await this.gamification.grant(userId, 'first_route', 'route')

    return this.get(userId, route.id)
  }

  async list(userId: string) {
    const routes = await this.prisma.route.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, mood: true, status: true },
    })
    return routes
  }

  async get(userId: string, routeId: string): Promise<Route> {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, userId },
      include: {
        points: {
          orderBy: { order: 'asc' },
          include: { place: { include: { category: true } } },
        },
      },
    })
    if (!route) throw new NotFoundException('Route not found')

    return {
      id: route.id,
      title: route.title,
      mood: route.mood as Route['mood'],
      status: route.status as Route['status'],
      points: route.points.map((pt) => ({
        order: pt.order,
        note: pt.note,
        done: pt.done,
        place: {
          id: pt.place.id,
          name: pt.place.name,
          description: pt.place.description,
          category: pt.place.category.slug,
          district: pt.place.district,
          lat: pt.place.lat,
          lng: pt.place.lng,
          tags: pt.place.tags,
          moodTags: pt.place.moodTags,
          photos: pt.place.photos,
          priceLevel: pt.place.priceLevel,
        },
      })),
    }
  }

  /** Отметить точку пройденной → начислить XP. */
  async completePoint(userId: string, routeId: string, order: number) {
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, userId },
    })
    if (!route) throw new NotFoundException('Route not found')

    await this.prisma.routePoint.updateMany({
      where: { routeId, order },
      data: { done: true },
    })
    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: 10 } },
    })
    await this.ledger.record(
      userId,
      [{ kind: 'xp', delta: 10 }],
      'route_progress',
      routeId,
    )
    await this.gamification.checkExplorer(userId)

    return this.get(userId, routeId)
  }
}

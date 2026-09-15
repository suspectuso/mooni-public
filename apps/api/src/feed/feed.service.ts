import { Injectable, NotFoundException } from '@nestjs/common'
import type { FeedQuery, PlaceCard } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'
import { scorePlace } from './feed.scoring'

interface Scored {
  id: string
  score: number
}

/**
 * Колода мест для свайпа. Адаптация match_back feed.service:
 * - буфер ID на User (feedBuffer/recentSeenIds/lastSeenMap/seenCounts)
 * - cooldown на повторный показ
 * - скоринг под Mooni: mood-теги + гео-близость + интересы (вместо job-категории)
 * - НЕТ mutual-match: места не лайкают в ответ
 */
@Injectable()
export class FeedService {
  private readonly BUFFER_SIZE = 50
  private readonly REFILL_THRESHOLD = 5
  private readonly COOLDOWN_DAYS = 14
  private readonly MAX_RECENT_SEEN = 500

  constructor(private prisma: PrismaService) {}

  async getNextBatch(userId: string, query: FeedQuery): Promise<PlaceCard[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    let buffer = (user.feedBuffer as string[]) ?? []
    if (buffer.length < this.REFILL_THRESHOLD) {
      buffer = await this.buildBuffer(userId, query)
    }

    const batchIds = buffer.slice(0, query.limit)
    const remaining = buffer.slice(query.limit)

    await this.markSeen(userId, batchIds, remaining)

    const places = await this.prisma.place.findMany({
      where: { id: { in: batchIds }, active: true },
      include: { category: true },
    })

    // сохраняем порядок из буфера
    const byId = new Map(places.map((p) => [p.id, p]))
    return batchIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => this.toCard(p))
  }

  async refill(userId: string, query: FeedQuery) {
    const buffer = await this.buildBuffer(userId, query)
    return { refilled: true, size: buffer.length }
  }

  private async buildBuffer(
    userId: string,
    query: FeedQuery,
  ): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { interests: true },
    })
    if (!user) throw new NotFoundException('User not found')

    const recentSeen = (user.recentSeenIds as string[]) ?? []
    const lastSeenMap = (user.lastSeenMap as Record<string, string>) ?? {}
    const seenCounts = (user.seenCounts as Record<string, number>) ?? {}
    const interestTags = user.interests.map((i) => i.tag)

    // уже свайпнутые места — исключаем всегда
    const swiped = await this.prisma.swipe.findMany({
      where: { userId },
      select: { placeId: true },
    })
    const swipedIds = swiped.map((s) => s.placeId)

    const candidates = await this.prisma.place.findMany({
      where: {
        active: true,
        id: { notIn: swipedIds },
        ...(query.district ? { district: query.district } : {}),
        ...(query.category ? { category: { slug: query.category } } : {}),
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        tags: true,
        moodTags: true,
      },
      take: 300,
    })

    const now = Date.now()
    const cooldownMs = this.COOLDOWN_DAYS * 24 * 60 * 60 * 1000

    const scored: Scored[] = candidates.map((c) => ({
      id: c.id,
      // детерминированный скоринг + лёгкая рандомизация
      score:
        scorePlace(c, {
          mood: query.mood,
          interestTags,
          seenCounts,
          lastSeenMap,
          now,
          cooldownMs,
        }) +
        Math.random() * 5,
    }))

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, this.BUFFER_SIZE)

    // перемешиваем первые 15, чтобы лента не была детерминированной
    const head = top.slice(0, 15)
    const tail = top.slice(15)
    for (let i = head.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[head[i], head[j]] = [head[j], head[i]]
    }

    const buffer = [...head, ...tail].map((s) => s.id)
    await this.prisma.user.update({
      where: { id: userId },
      data: { feedBuffer: buffer, feedUpdatedAt: new Date() },
    })
    void recentSeen
    return buffer
  }

  private async markSeen(
    userId: string,
    seenIds: string[],
    remainingBuffer: string[],
  ) {
    if (seenIds.length === 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { feedBuffer: remainingBuffer },
      })
      return
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    const recentSeen = new Set((user.recentSeenIds as string[]) ?? [])
    const lastSeenMap = (user.lastSeenMap as Record<string, string>) ?? {}
    const seenCounts = (user.seenCounts as Record<string, number>) ?? {}
    const nowIso = new Date().toISOString()

    for (const id of seenIds) {
      recentSeen.add(id)
      lastSeenMap[id] = nowIso
      seenCounts[id] = (seenCounts[id] ?? 0) + 1
    }

    const trimmed = [...recentSeen].slice(-this.MAX_RECENT_SEEN)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        feedBuffer: remainingBuffer,
        recentSeenIds: trimmed,
        lastSeenMap,
        seenCounts,
      },
    })
  }

  private toCard(p: {
    id: string
    name: string
    description: string | null
    category: { slug: string }
    district: string | null
    lat: number | null
    lng: number | null
    tags: string[]
    moodTags: string[]
    photos: string[]
    priceLevel: number | null
  }): PlaceCard {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category.slug,
      district: p.district,
      lat: p.lat,
      lng: p.lng,
      tags: p.tags,
      moodTags: p.moodTags,
      photos: p.photos,
      priceLevel: p.priceLevel,
    }
  }
}

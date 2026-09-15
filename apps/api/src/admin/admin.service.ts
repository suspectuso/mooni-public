import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { AfishaService } from '../events/afisha.service'

export interface PlaceInput {
  name: string
  description?: string
  categorySlug: string
  district?: string
  lat?: number
  lng?: number
  tags?: string[]
  moodTags?: string[]
  photos?: string[]
  priceLevel?: number
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private afisha: AfishaService,
  ) {}

  /** Ручной запуск синка афиши (KudaGo → Event). */
  async syncAfisha() {
    const count = await this.afisha.sync()
    return { ok: true, synced: count }
  }

  /** Считает эмбеддинги для активных мест без вектора (Recommendation 2.0). */
  async embedPlaces() {
    const all = await this.prisma.place.findMany({ where: { active: true } })
    const places = all.filter((p) => !p.embedding)
    let done = 0
    for (const p of places) {
      const text = [p.name, p.description, ...p.tags, ...p.moodTags]
        .filter(Boolean)
        .join('. ')
      const vec = await this.ai.embed(text)
      if (vec) {
        await this.prisma.place.update({
          where: { id: p.id },
          data: { embedding: vec },
        })
        done++
      }
    }
    return { embedded: done, skipped: places.length - done }
  }

  async stats() {
    const [users, places, swipes, routes, slots, paidPayments] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.place.count({ where: { active: true } }),
        this.prisma.swipe.count(),
        this.prisma.route.count(),
        this.prisma.activitySlot.count(),
        this.prisma.payment.findMany({
          where: { status: 'paid' },
          select: { amount: true, currency: true },
        }),
      ])
    const revenueRub = paidPayments
      .filter((p) => p.currency === 'RUB')
      .reduce((s, p) => s + p.amount, 0)
    const revenueUsdtCents = paidPayments
      .filter((p) => p.currency === 'USDT')
      .reduce((s, p) => s + p.amount, 0)
    return {
      users,
      places,
      swipes,
      routes,
      slots,
      payments: paidPayments.length,
      revenueRub,
      revenueUsdt: revenueUsdtCents / 100,
    }
  }

  async listPlaces() {
    return this.prisma.place.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { slug: true, title: true } } },
    })
  }

  private async categoryId(slug: string) {
    const c = await this.prisma.placeCategory.findUnique({ where: { slug } })
    if (!c) throw new NotFoundException(`Категория не найдена: ${slug}`)
    return c.id
  }

  async createPlace(input: PlaceInput) {
    return this.prisma.place.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        categoryId: await this.categoryId(input.categorySlug),
        district: input.district ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        tags: input.tags ?? [],
        moodTags: input.moodTags ?? [],
        photos: input.photos ?? [],
        priceLevel: input.priceLevel ?? null,
        source: 'admin',
      },
    })
  }

  async updatePlace(id: string, input: Partial<PlaceInput>) {
    const data: Record<string, unknown> = { ...input }
    delete data.categorySlug
    if (input.categorySlug)
      data.categoryId = await this.categoryId(input.categorySlug)
    return this.prisma.place.update({ where: { id }, data })
  }

  async deletePlace(id: string) {
    await this.prisma.place.update({ where: { id }, data: { active: false } })
    return { ok: true }
  }

  // ── Модерация ingestion ──
  async pending() {
    return this.prisma.rawPost.findMany({
      where: { status: 'new' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async approve(rawPostId: string, place: PlaceInput) {
    const created = await this.createPlace(place)
    await this.prisma.rawPost.update({
      where: { id: rawPostId },
      data: { status: 'processed', placeId: created.id },
    })
    return { ok: true, placeId: created.id }
  }

  /** Апрув по структурной подсказке (n8n AI/OSM) одним кликом — без ручного ввода. */
  async approveSuggested(rawPostId: string) {
    const post = await this.prisma.rawPost.findUnique({
      where: { id: rawPostId },
    })
    if (!post) throw new NotFoundException('Пост не найден')
    const s = post.suggestion as Partial<PlaceInput> | null
    if (!s?.name || !s?.categorySlug) {
      throw new BadRequestException(
        'У поста нет структурной подсказки (name/categorySlug)',
      )
    }
    const created = await this.createPlace({
      name: s.name,
      description: s.description,
      categorySlug: s.categorySlug,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      tags: s.tags,
      moodTags: s.moodTags,
      photos: s.photos,
      priceLevel: s.priceLevel,
    })
    await this.prisma.rawPost.update({
      where: { id: rawPostId },
      data: { status: 'processed', placeId: created.id },
    })
    return { ok: true, placeId: created.id }
  }

  async reject(rawPostId: string) {
    await this.prisma.rawPost.update({
      where: { id: rawPostId },
      data: { status: 'rejected' },
    })
    return { ok: true }
  }

  async categories() {
    return this.prisma.placeCategory.findMany({
      select: { slug: true, title: true },
    })
  }

  /** Аудит-леджер изменений баланса (susCoin/xp), новые сверху. */
  async ledger(userId?: string) {
    return this.prisma.balanceLedger.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }
}

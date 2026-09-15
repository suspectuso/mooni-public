import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BotService } from '../bot/bot.service'
import { trustedTelegramId } from '../auth/trusted-user'
import { isPremium } from './market.logic'

/** Совпадение интересов с текстом впечатления (контекстный подбор). */
function score(
  e: { title: string; description: string | null; category: string | null },
  interests: string[],
): number {
  const hay =
    `${e.title} ${e.description ?? ''} ${e.category ?? ''}`.toLowerCase()
  return interests.filter((tag) => hay.includes(tag)).length
}

@Injectable()
export class ExperiencesService {
  constructor(
    private prisma: PrismaService,
    private bot: BotService,
  ) {}

  private async resolveUser(userId: string, initData?: string) {
    const telegramId = trustedTelegramId(userId, initData)
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  /** Одно впечатление в форме «курса» Match (экран /education/courses/:id). */
  async asCourse(id: string) {
    const e = await this.prisma.experience.findUnique({ where: { id } })
    if (!e) throw new NotFoundException('Впечатление не найдено')
    return {
      id: e.id,
      title: e.title,
      description: e.description ?? '',
      price: e.price,
      imageUrl: e.photo,
    }
  }

  /** Куплено ли впечатление (бронь подтверждена оплатой). */
  async checkPurchase(userId: string, experienceId: string, initData?: string) {
    const user = await this.resolveUser(userId, initData)
    const booking = await this.prisma.booking.findFirst({
      where: { userId: user.id, experienceId, status: 'confirmed' },
    })
    return { purchased: !!booking, inviteLink: null }
  }

  /** Кнопка «Купить» на детали: фиксируем бронь и уведомляем юзера в боте. */
  async requestCoursePayment(
    userId: string,
    experienceId: string,
    initData?: string,
  ) {
    const user = await this.resolveUser(userId, initData)
    const exp = await this.prisma.experience.findUnique({
      where: { id: experienceId },
    })
    if (!exp) throw new NotFoundException('Впечатление не найдено')

    const existing = await this.prisma.booking.findFirst({
      where: { userId: user.id, experienceId, status: { not: 'canceled' } },
    })
    const booking =
      existing ??
      (await this.prisma.booking.create({
        data: { userId: user.id, experienceId },
      }))

    try {
      await this.bot.sendMessage(
        userId,
        `📩 Заявка на «${exp.title}» принята (${exp.price}₽). Для оплаты откройте раздел впечатлений в Mooni — там доступны ЮKassa и крипта.`,
      )
    } catch {
      // бот может быть выключен (dev) — заявка всё равно зафиксирована
    }
    return { ok: true, bookingId: booking.id, status: booking.status }
  }

  /**
   * Каталог впечатлений в форме «курсов» Match. Если передан userId с интересами —
   * ранжируем по совпадению интересов с названием/описанием/категорией (контекстный подбор).
   */
  async asCourses(userId?: string, initData?: string) {
    const items = await this.prisma.experience.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    let interests: string[] = []
    if (userId) {
      try {
        const user = await this.resolveUser(userId, initData)
        const rows = await this.prisma.userInterest.findMany({
          where: { userId: user.id },
          select: { tag: true },
        })
        interests = rows.map((r) => r.tag.toLowerCase())
      } catch {
        interests = [] // нет валидного юзера — отдаём без персонализации
      }
    }

    const ranked = interests.length
      ? [...items].sort((a, b) => score(b, interests) - score(a, interests))
      : items

    return ranked.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description ?? '',
      price: e.price,
      imageUrl: e.photo,
    }))
  }

  async list() {
    return this.prisma.experience.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async get(id: string) {
    const e = await this.prisma.experience.findUnique({ where: { id } })
    if (!e) throw new NotFoundException('Впечатление не найдено')
    return e
  }

  async book(userId: string, experienceId: string, initData?: string) {
    const user = await this.resolveUser(userId, initData)
    const exp = await this.prisma.experience.findUnique({
      where: { id: experienceId },
    })
    if (!exp) throw new NotFoundException('Впечатление не найдено')
    const booking = await this.prisma.booking.create({
      data: { userId: user.id, experienceId },
    })
    return { ok: true, bookingId: booking.id, status: booking.status }
  }

  /** Премиум-подписка (без реальной оплаты — продлеваем на 30 дней). */
  async activatePremium(userId: string) {
    const user = await this.resolveUser(userId)
    const base =
      user.premiumUntil && user.premiumUntil > new Date()
        ? user.premiumUntil
        : new Date()
    const until = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { premiumUntil: until },
    })
    return {
      ok: true,
      premiumUntil: updated.premiumUntil,
      isPremium: isPremium(updated.premiumUntil),
    }
  }
}

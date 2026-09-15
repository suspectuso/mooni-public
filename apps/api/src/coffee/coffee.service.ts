import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BotService } from '../bot/bot.service'
import { trustedTelegramId } from '../auth/trusted-user'
import { pickMatch } from './coffee.logic'

@Injectable()
export class CoffeeService {
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

  /** Встать в очередь Random Coffee; если есть ожидающий того же типа — сразу пара. */
  async join(userId: string, kind = 'coffee', initData?: string) {
    const user = await this.resolveUser(userId, initData)

    const mine = await this.prisma.coffeeRequest.findFirst({
      where: { userId: user.id, status: { in: ['waiting', 'matched'] } },
      orderBy: { createdAt: 'desc' },
    })
    if (mine) return this.status(userId, initData)

    // пара только в рамках того же типа активности
    const waiting = await this.prisma.coffeeRequest.findMany({
      where: { status: 'waiting', kind },
    })
    const partner = pickMatch(waiting, user.id)

    const me = await this.prisma.coffeeRequest.create({
      data: { userId: user.id, kind, status: partner ? 'matched' : 'waiting' },
    })

    if (partner) {
      await this.prisma.coffeeRequest.update({
        where: { id: partner.id },
        data: { status: 'matched', matchedWith: user.id },
      })
      await this.prisma.coffeeRequest.update({
        where: { id: me.id },
        data: { matchedWith: partner.userId },
      })
      await this.notifyPair(user.id, partner.userId, kind)
    }
    return this.status(userId, initData)
  }

  async status(userId: string, initData?: string) {
    const user = await this.resolveUser(userId, initData)
    const req = await this.prisma.coffeeRequest.findFirst({
      where: { userId: user.id, status: { in: ['waiting', 'matched'] } },
      orderBy: { createdAt: 'desc' },
    })
    if (!req) return { status: 'none' as const }
    if (req.status === 'waiting')
      return { status: 'waiting' as const, kind: req.kind }

    const partner = req.matchedWith
      ? await this.prisma.user.findUnique({ where: { id: req.matchedWith } })
      : null
    return {
      status: 'matched' as const,
      kind: req.kind,
      partner: partner
        ? {
            username: partner.username,
            firstName: partner.firstName,
            telegramId: partner.telegramId.toString(),
          }
        : null,
    }
  }

  async leave(userId: string, initData?: string) {
    const user = await this.resolveUser(userId, initData)
    await this.prisma.coffeeRequest.updateMany({
      where: { userId: user.id, status: 'waiting' },
      data: { status: 'canceled' },
    })
    return { ok: true }
  }

  private async notifyPair(aId: string, bId: string, kind: string) {
    const [a, b] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: aId } }),
      this.prisma.user.findUnique({ where: { id: bId } }),
    ])
    if (!a || !b) return
    const KIND_LABEL: Record<string, string> = {
      coffee: 'кофе',
      walk: 'прогулки',
      friending: 'знакомства',
      buddy: 'спорта/коворкинга (buddy)',
    }
    const label = KIND_LABEL[kind] ?? 'встречи'
    const link = (u: { username: string | null; firstName: string | null }) =>
      u.username ? `@${u.username}` : u.firstName || 'собеседник'
    await Promise.all([
      this.bot.sendMessage(
        a.telegramId,
        `🤝 Нашёлся собеседник для ${label}: ${link(b)}. Напишите друг другу!`,
      ),
      this.bot.sendMessage(
        b.telegramId,
        `🤝 Нашёлся собеседник для ${label}: ${link(a)}. Напишите друг другу!`,
      ),
    ])
  }
}

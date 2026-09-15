import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { LedgerService } from '../ledger/ledger.service'
import { YooKassaService } from './yookassa.service'
import { XRocketService } from './xrocket.service'
import { verifyTelegramInitData } from '../auth/telegram.util'

type Provider = 'yookassa' | 'xrocket'
type Purpose = 'premium' | 'booking' | 'topup'

// Цены по назначению: [рубли, USDT]
const PRICING: Record<Purpose, { rub: number; usd: number }> = {
  premium: { rub: 299, usd: 3 },
  booking: { rub: 0, usd: 0 }, // берётся из впечатления
  topup: { rub: 100, usd: 1 },
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor(
    private prisma: PrismaService,
    private yookassa: YooKassaService,
    private xrocket: XRocketService,
    private ledger: LedgerService,
  ) {}

  private async resolveByTelegramId(telegramId: bigint) {
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  /**
   * Деньги — строго по подтверждённому Telegram initData, без доверия ?userId=.
   * AUTH_SKIP тут НЕ действует. Локально для тестов можно PAYMENTS_SKIP_INITDATA=true.
   */
  private async resolveSecure(userId: string, initData?: string) {
    if (process.env.PAYMENTS_SKIP_INITDATA === 'true') {
      return this.resolveByTelegramId(BigInt(userId))
    }
    const tgUser = verifyTelegramInitData(
      initData ?? '',
      process.env.TELEGRAM_BOT_TOKEN ?? '',
    )
    if (!tgUser)
      throw new ForbiddenException('Valid Telegram initData required')
    return this.resolveByTelegramId(BigInt(tgUser.id))
  }

  async create(
    userId: string,
    purpose: Purpose,
    provider: Provider,
    refId?: string,
    initData?: string,
  ) {
    const user = await this.resolveSecure(userId, initData)

    let rub = PRICING[purpose].rub
    let usd = PRICING[purpose].usd
    if (purpose === 'booking') {
      if (!refId) throw new NotFoundException('refId (experienceId) обязателен')
      const exp = await this.prisma.experience.findUnique({
        where: { id: refId },
      })
      if (!exp) throw new NotFoundException('Впечатление не найдено')
      rub = exp.price
      usd = Math.max(1, Math.round((exp.price / 90) * 100) / 100)
    }

    const amount = provider === 'yookassa' ? rub : Math.round(usd * 100)
    const payment = await this.prisma.payment.create({
      data: {
        userId: user.id,
        provider,
        purpose,
        amount,
        currency: provider === 'yookassa' ? 'RUB' : 'USDT',
        refId: refId ?? null,
        status: 'pending',
      },
    })

    const apiUrl = process.env.API_URL ?? 'https://mooni.suspectuso.ru/api'
    const webUrl = process.env.WEBAPP_URL ?? 'https://mooni.suspectuso.ru'

    try {
      if (provider === 'yookassa') {
        if (!this.yookassa.configured) {
          return { paymentId: payment.id, url: '', pending: true }
        }
        const r = await this.yookassa.createPayment(
          rub,
          `Mooni: ${purpose}`,
          { paymentId: payment.id },
          webUrl,
        )
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { externalId: r.paymentId },
        })
        return { paymentId: payment.id, url: r.paymentUrl }
      } else {
        if (!this.xrocket.configured) {
          return { paymentId: payment.id, url: '', pending: true }
        }
        const r = await this.xrocket.createInvoice(
          usd,
          payment.id,
          `${apiUrl}/payments/xrocket-webhook`,
          webUrl,
        )
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { externalId: r.invoiceId },
        })
        return { paymentId: payment.id, url: r.link }
      }
    } catch (e) {
      this.logger.error(`create payment failed: ${String(e)}`)
      return { paymentId: payment.id, url: '', error: true }
    }
  }

  /** Помечает платёж оплаченным и выполняет назначение. Атомарно и идемпотентно. */
  async markPaid(paymentId: string) {
    // атомарный переход pending→paid: только одна гонка получит count===1
    const res = await this.prisma.payment.updateMany({
      where: { id: paymentId, status: { not: 'paid' } },
      data: { status: 'paid' },
    })
    if (res.count === 0) return { ok: true, already: true }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    })
    if (!payment) return { ok: false }
    await this.fulfill(payment.userId, payment.purpose, payment.refId)
    await this.cashback(payment)
    return { ok: true }
  }

  /** Финтех LTV: возвращаем 5% траты в susCoin (лояльность, удержание). */
  private async cashback(payment: {
    id: string
    userId: string
    amount: number
    currency: string
  }) {
    const rub =
      payment.currency === 'RUB'
        ? payment.amount
        : Math.round((payment.amount / 100) * 90) // USDT-центы → ~рубли
    const coins = Math.round(rub * 0.05)
    if (coins <= 0) return
    await this.prisma.user.update({
      where: { id: payment.userId },
      data: { susCoin: { increment: coins } },
    })
    await this.ledger.record(
      payment.userId,
      [{ kind: 'susCoin', delta: coins }],
      'cashback',
      payment.id,
    )
  }

  private async fulfill(userId: string, purpose: string, refId: string | null) {
    if (purpose === 'premium') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      const base =
        user?.premiumUntil && user.premiumUntil > new Date()
          ? user.premiumUntil
          : new Date()
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          premiumUntil: new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    } else if (purpose === 'booking' && refId) {
      await this.prisma.booking.updateMany({
        where: { userId, experienceId: refId, status: 'requested' },
        data: { status: 'confirmed' },
      })
    } else if (purpose === 'topup') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { susCoin: { increment: 100 } },
      })
      await this.ledger.record(
        userId,
        [{ kind: 'susCoin', delta: 100 }],
        'topup',
      )
    }
  }
}

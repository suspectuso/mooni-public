import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { LedgerService } from '../ledger/ledger.service'
import { computeReward } from './reward.logic'
import { verifyTelegramInitData } from '../auth/telegram.util'

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  private async resolveByTelegramId(telegramId: bigint) {
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  // Начисление susCoin → только по подтверждённому Telegram initData.
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

  async redeem(userId: string, code: string, initData?: string) {
    const user = await this.resolveSecure(userId, initData)
    const qr = await this.prisma.qrCode.findUnique({
      where: { code },
      include: { partner: true },
    })
    if (!qr) throw new NotFoundException('QR не найден')

    const already = await this.prisma.qrRedemption.findUnique({
      where: { userId_qrCodeId: { userId: user.id, qrCodeId: qr.id } },
    })

    const reward = computeReward(qr, !!already)

    if (reward.reason !== 'ok') {
      return {
        ok: false,
        reason: reward.reason,
        balance: { susCoin: user.susCoin, xp: user.xp },
        partner: qr.partner.name,
      }
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          susCoin: { increment: reward.coins },
          xp: { increment: reward.xp },
        },
      }),
      this.prisma.qrRedemption.create({
        data: {
          userId: user.id,
          qrCodeId: qr.id,
          coins: reward.coins,
          xp: reward.xp,
        },
      }),
    ])
    await this.ledger.record(
      user.id,
      [
        { kind: 'susCoin', delta: reward.coins },
        { kind: 'xp', delta: reward.xp },
      ],
      'qr_redeem',
      qr.id,
    )

    return {
      ok: true,
      reason: 'ok',
      awarded: { susCoin: reward.coins, xp: reward.xp },
      balance: { susCoin: updated.susCoin, xp: updated.xp },
      partner: qr.partner.name,
    }
  }

  async partners() {
    const partners = await this.prisma.partner.findMany({
      include: { qrCodes: { where: { active: true }, select: { code: true } } },
    })
    return partners.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      district: p.district,
      codes: p.qrCodes.map((c) => c.code),
    }))
  }
}

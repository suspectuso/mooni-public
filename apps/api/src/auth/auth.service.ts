import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AuthResult } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'
import {
  parseTelegramInitDataUnsafe,
  verifyTelegramInitData,
} from './telegram.util'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async authViaTelegram(initData: string): Promise<AuthResult> {
    const skipValidation = process.env.AUTH_SKIP_TELEGRAM_VALIDATION === 'true'
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? ''

    const tgUser = skipValidation
      ? parseTelegramInitDataUnsafe(initData)
      : verifyTelegramInitData(initData, botToken)

    if (!tgUser) throw new UnauthorizedException('Invalid Telegram initData')

    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        username: tgUser.username ?? undefined,
        firstName: tgUser.first_name ?? undefined,
      },
      create: {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username ?? null,
        firstName: tgUser.first_name ?? null,
      },
    })

    const token = await this.jwt.signAsync({ sub: user.id })

    return {
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        firstName: user.firstName,
        username: user.username,
        xp: user.xp,
      },
    }
  }
}

import { ForbiddenException } from '@nestjs/common'
import { verifyTelegramInitData } from './telegram.util'

/**
 * Доверенный telegramId для эндпоинтов на протоколе `?userId=`.
 * При `AUTH_SKIP_TELEGRAM_VALIDATION=true` (dev/демо) берём `?userId` как есть.
 * В проде (skip=false) — строго из подтверждённого Telegram initData, `?userId` игнорируется.
 */
export function trustedTelegramId(userId?: string, initData?: string): bigint {
  if (process.env.AUTH_SKIP_TELEGRAM_VALIDATION === 'true') {
    if (!userId) throw new ForbiddenException('userId required')
    return BigInt(userId)
  }
  const tg = verifyTelegramInitData(
    initData ?? '',
    process.env.TELEGRAM_BOT_TOKEN ?? '',
  )
  if (!tg) throw new ForbiddenException('Valid Telegram initData required')
  return BigInt(tg.id)
}

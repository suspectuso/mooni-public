import { createHmac, timingSafeEqual } from 'crypto'

export interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

// TTL initData по умолчанию — 24 часа (защита от replay перехваченной initData).
const DEFAULT_MAX_AGE_SEC = 24 * 60 * 60

/**
 * Валидация Telegram WebApp initData по алгоритму из доков Telegram.
 * Проверяет HMAC-подпись (timing-safe) и свежесть auth_date.
 * Возвращает пользователя или null, если подпись неверна или initData протухла.
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSec: number = DEFAULT_MAX_AGE_SEC,
): TelegramUser | null {
  if (!initData || !botToken) return null
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  // timing-safe сравнение
  const a = Buffer.from(computedHash, 'hex')
  const b = Buffer.from(hash, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  // TTL: auth_date не старше maxAgeSec
  if (maxAgeSec > 0) {
    const authDate = Number(params.get('auth_date'))
    if (!authDate) return null
    const ageSec = Date.now() / 1000 - authDate
    if (ageSec > maxAgeSec || ageSec < -300) return null
  }

  const userRaw = params.get('user')
  if (!userRaw) return null
  try {
    return JSON.parse(userRaw) as TelegramUser
  } catch {
    return null
  }
}

/**
 * Dev-режим: достаём пользователя из initData без проверки подписи.
 * Включается AUTH_SKIP_TELEGRAM_VALIDATION=true.
 */
export function parseTelegramInitDataUnsafe(
  initData: string,
): TelegramUser | null {
  const params = new URLSearchParams(initData)
  const userRaw = params.get('user')
  if (!userRaw) return null
  try {
    return JSON.parse(userRaw) as TelegramUser
  } catch {
    return null
  }
}

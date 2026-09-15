import { createHash, createHmac, timingSafeEqual } from 'crypto'

/**
 * Проверка подписи вебхука xRocket.
 * Подпись = HMAC-SHA256(rawBody, secret), где secret = SHA256(apiToken),
 * присылается в заголовке `rocket-pay-signature` (hex).
 */
export function verifyXRocketSignature(
  rawBody: string,
  signature: string | undefined,
  token: string,
): boolean {
  if (!signature || !token) return false
  const secret = createHash('sha256').update(token).digest()
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(signature, 'hex')
  if (a.length !== b.length || a.length === 0) return false
  return timingSafeEqual(a, b)
}

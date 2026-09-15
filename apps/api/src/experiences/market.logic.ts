/**
 * Чистая логика маркета впечатлений — без БД, тестируемая.
 * Монетизация: комиссия маркета 5–15% (см. fichi_i_mehaniki §3).
 */

/** Комиссия маркета с цены впечатления (по умолчанию 10%), округляется вниз. */
export function marketCommission(price: number, rate = 0.1): number {
  if (price <= 0) return 0
  const clamped = Math.min(Math.max(rate, 0.05), 0.15)
  return Math.floor(price * clamped)
}

/** Сумма, которая уходит партнёру (цена минус комиссия). */
export function partnerPayout(price: number, rate = 0.1): number {
  return Math.max(0, price - marketCommission(price, rate))
}

/** Активна ли премиум-подписка на момент `now`. */
export function isPremium(
  premiumUntil: Date | null | undefined,
  now = new Date(),
): boolean {
  if (!premiumUntil) return false
  return new Date(premiumUntil).getTime() > now.getTime()
}

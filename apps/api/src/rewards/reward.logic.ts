/**
 * Чистая логика начисления награды за QR-чек-ин (без БД) — тестируемая.
 */

export interface QrReward {
  rewardCoins: number
  rewardXp: number
  perUserOnce: boolean
  active: boolean
}

export interface RewardResult {
  coins: number
  xp: number
  reason: 'ok' | 'inactive' | 'already'
}

/**
 * Считает награду за скан QR.
 * - неактивный QR → 0
 * - perUserOnce и уже сканировал → 0 (already)
 * - иначе → начисляем coins/xp
 */
export function computeReward(
  qr: QrReward,
  alreadyRedeemed: boolean,
): RewardResult {
  if (!qr.active) return { coins: 0, xp: 0, reason: 'inactive' }
  if (qr.perUserOnce && alreadyRedeemed) {
    return { coins: 0, xp: 0, reason: 'already' }
  }
  return { coins: qr.rewardCoins, xp: qr.rewardXp, reason: 'ok' }
}

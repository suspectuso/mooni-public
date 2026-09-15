import { describe, it, expect } from 'vitest'
import { computeReward } from './reward.logic'

const qr = { rewardCoins: 10, rewardXp: 5, perUserOnce: true, active: true }

describe('computeReward', () => {
  it('первый скан → начисляет coins и xp', () => {
    expect(computeReward(qr, false)).toEqual({ coins: 10, xp: 5, reason: 'ok' })
  })

  it('повторный скан при perUserOnce → 0 (already)', () => {
    expect(computeReward(qr, true)).toEqual({
      coins: 0,
      xp: 0,
      reason: 'already',
    })
  })

  it('повторный скан, если повтор разрешён → снова начисляет', () => {
    const repeatable = { ...qr, perUserOnce: false }
    expect(computeReward(repeatable, true).reason).toBe('ok')
    expect(computeReward(repeatable, true).coins).toBe(10)
  })

  it('неактивный QR → 0 (inactive)', () => {
    expect(computeReward({ ...qr, active: false }, false)).toEqual({
      coins: 0,
      xp: 0,
      reason: 'inactive',
    })
  })
})

import { describe, it, expect } from 'vitest'
import { marketCommission, partnerPayout, isPremium } from './market.logic'

describe('marketCommission', () => {
  it('10% по умолчанию, округление вниз', () => {
    expect(marketCommission(1000)).toBe(100)
    expect(marketCommission(999)).toBe(99)
  })
  it('бесплатное впечатление → 0', () => {
    expect(marketCommission(0)).toBe(0)
  })
  it('ставка ограничена 5–15%', () => {
    expect(marketCommission(1000, 0.01)).toBe(50) // < 5% → 5%
    expect(marketCommission(1000, 0.9)).toBe(150) // > 15% → 15%
  })
})

describe('partnerPayout', () => {
  it('цена минус комиссия', () => {
    expect(partnerPayout(1000)).toBe(900)
  })
})

describe('isPremium', () => {
  const now = new Date('2026-06-25T00:00:00Z')
  it('null → не премиум', () => {
    expect(isPremium(null, now)).toBe(false)
  })
  it('будущая дата → премиум', () => {
    expect(isPremium(new Date('2026-07-25T00:00:00Z'), now)).toBe(true)
  })
  it('прошедшая дата → не премиум', () => {
    expect(isPremium(new Date('2026-05-25T00:00:00Z'), now)).toBe(false)
  })
})

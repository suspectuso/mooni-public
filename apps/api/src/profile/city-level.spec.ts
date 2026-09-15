import { describe, it, expect } from 'vitest'
import { cityLevel, xpToNext } from './city-level'

describe('cityLevel', () => {
  it('старт — уровень 1', () => {
    expect(cityLevel(0)).toBe(1)
    expect(cityLevel(29)).toBe(1)
  })

  it('растёт по порогам', () => {
    expect(cityLevel(30)).toBe(2)
    expect(cityLevel(80)).toBe(3)
    expect(cityLevel(150)).toBe(4)
  })

  it('xpToNext считает остаток', () => {
    expect(xpToNext(0)).toBe(30)
    expect(xpToNext(30)).toBe(50)
  })

  it('на максимуме xpToNext = 0', () => {
    expect(xpToNext(10000)).toBe(0)
  })
})

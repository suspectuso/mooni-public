import { describe, it, expect } from 'vitest'
import { currentSeason } from './season.logic'

describe('currentSeason', () => {
  it('июнь → Белые ночи', () => {
    expect(currentSeason(new Date('2026-06-26')).key).toBe('white_nights')
  })
  it('январь → Зимний Питер', () => {
    expect(currentSeason(new Date('2026-01-15')).key).toBe('winter')
  })
  it('декабрь → Зимний Питер', () => {
    expect(currentSeason(new Date('2026-12-10')).key).toBe('winter')
  })
  it('апрель → Весенний Питер', () => {
    expect(currentSeason(new Date('2026-04-01')).key).toBe('spring')
  })
  it('октябрь → Золотая осень', () => {
    expect(currentSeason(new Date('2026-10-20')).key).toBe('autumn')
  })
})

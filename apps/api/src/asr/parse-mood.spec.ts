import { describe, it, expect } from 'vitest'
import { parseMood } from './parse-mood'

describe('parseMood', () => {
  it('ловит усталость → recharge', () => {
    expect(parseMood('я очень устал хочу отдохнуть')).toBe('recharge')
  })
  it('ловит свидание → romance', () => {
    expect(parseMood('хочу романтическое свидание')).toBe('romance')
  })
  it('ловит движ → social', () => {
    expect(parseMood('где сегодня движ и тусовки')).toBe('social')
  })
  it('без ключевых слов → null', () => {
    expect(parseMood('просто покажи город')).toBeNull()
  })
})

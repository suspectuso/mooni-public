import { describe, it, expect } from 'vitest'
import { scorePlace, type ScoreContext } from './feed.scoring'

const baseCtx = (over: Partial<ScoreContext> = {}): ScoreContext => ({
  mood: undefined,
  interestTags: [],
  seenCounts: {},
  lastSeenMap: {},
  now: Date.now(),
  cooldownMs: 14 * 24 * 60 * 60 * 1000,
  ...over,
})

describe('scorePlace', () => {
  it('нейтральное место без контекста = 0', () => {
    expect(scorePlace({ id: 'a', tags: [], moodTags: [] }, baseCtx())).toBe(0)
  })

  it('+20 за совпадение настроения', () => {
    const s = scorePlace(
      { id: 'a', tags: [], moodTags: ['recharge'] },
      baseCtx({ mood: 'recharge' }),
    )
    expect(s).toBe(20)
  })

  it('настроение не совпало → без бонуса', () => {
    const s = scorePlace(
      { id: 'a', tags: [], moodTags: ['social'] },
      baseCtx({ mood: 'recharge' }),
    )
    expect(s).toBe(0)
  })

  it('+6 за каждый совпавший интерес', () => {
    const s = scorePlace(
      { id: 'a', tags: ['кофе', 'искусство', 'движ'], moodTags: [] },
      baseCtx({ interestTags: ['кофе', 'искусство'] }),
    )
    expect(s).toBe(12)
  })

  it('штрафы за частоту показа', () => {
    const c = { id: 'a', tags: [], moodTags: [] }
    expect(scorePlace(c, baseCtx({ seenCounts: { a: 1 } }))).toBe(-8)
    expect(scorePlace(c, baseCtx({ seenCounts: { a: 2 } }))).toBe(-20)
    expect(scorePlace(c, baseCtx({ seenCounts: { a: 5 } }))).toBe(-100)
  })

  it('cooldown: недавно виденное штрафуется на 60', () => {
    const now = Date.now()
    const s = scorePlace(
      { id: 'a', tags: [], moodTags: [] },
      baseCtx({ now, lastSeenMap: { a: new Date(now - 1000).toISOString() } }),
    )
    expect(s).toBe(-60)
  })

  it('cooldown истёк → без штрафа', () => {
    const now = Date.now()
    const old = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
    const s = scorePlace(
      { id: 'a', tags: [], moodTags: [] },
      baseCtx({ now, lastSeenMap: { a: old } }),
    )
    expect(s).toBe(0)
  })

  it('комбинируется: настроение + интересы − cooldown', () => {
    const now = Date.now()
    const s = scorePlace(
      { id: 'a', tags: ['кофе'], moodTags: ['recharge'] },
      baseCtx({
        mood: 'recharge',
        interestTags: ['кофе'],
        now,
        lastSeenMap: { a: new Date(now - 1000).toISOString() },
      }),
    )
    expect(s).toBe(20 + 6 - 60)
  })
})

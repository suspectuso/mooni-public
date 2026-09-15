import { describe, it, expect } from 'vitest'
import { phrasesFor, npcPhrase } from './npc.logic'

describe('phrasesFor', () => {
  it('greeting → непустой банк', () => {
    expect(phrasesFor('greeting').length).toBeGreaterThan(0)
  })
  it('mood с известным настроением → специфичные реплики', () => {
    expect(phrasesFor('mood', 'romance')[0]).toMatch(/двоих|закат/i)
  })
  it('mood с неизвестным настроением → фолбэк на приветствия', () => {
    expect(phrasesFor('mood', 'nope')).toEqual(phrasesFor('greeting'))
  })
  it('idle/неизвестный контекст → idle-банк', () => {
    expect(phrasesFor('idle').length).toBeGreaterThan(0)
  })
})

describe('npcPhrase', () => {
  it('детерминированный выбор по rnd', () => {
    const first = phrasesFor('greeting')[0]
    expect(npcPhrase('greeting', undefined, () => 0)).toBe(first)
  })
  it('всегда возвращает строку', () => {
    expect(typeof npcPhrase('route_built')).toBe('string')
  })
})

import { describe, it, expect } from 'vitest'
import { cosineSimilarity, rankByEmbedding } from './embedding'

describe('cosineSimilarity', () => {
  it('идентичные векторы → 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1)
  })
  it('ортогональные → 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
  })
  it('разная размерность/пустые → 0', () => {
    expect(cosineSimilarity([1, 2], [1])).toBe(0)
    expect(cosineSimilarity([], [1])).toBe(0)
  })
})

describe('rankByEmbedding', () => {
  it('сортирует по близости к запросу', () => {
    const q = [1, 0]
    const out = rankByEmbedding(
      [
        { item: 'far', embedding: [0, 1] },
        { item: 'near', embedding: [0.9, 0.1] },
        { item: 'mid', embedding: [0.6, 0.6] },
      ],
      q,
      3,
    )
    expect(out[0]).toBe('near')
    expect(out[2]).toBe('far')
  })
  it('без эмбеддинга — в конец, limit соблюдается', () => {
    const out = rankByEmbedding(
      [
        { item: 'noemb', embedding: null },
        { item: 'good', embedding: [1, 0] },
      ],
      [1, 0],
      1,
    )
    expect(out).toEqual(['good'])
  })
})

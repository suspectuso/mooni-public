import { describe, it, expect } from 'vitest'
import { pickMatch } from './coffee.logic'

const w = (id: string, userId: string, t: string) => ({
  id,
  userId,
  createdAt: t,
})

describe('pickMatch', () => {
  it('берёт самого старого, кроме себя', () => {
    const list = [
      w('r1', 'me', '2026-01-01T10:00:00Z'),
      w('r2', 'b', '2026-01-01T09:00:00Z'),
      w('r3', 'c', '2026-01-01T09:30:00Z'),
    ]
    expect(pickMatch(list, 'me')?.userId).toBe('b')
  })
  it('исключает себя', () => {
    expect(pickMatch([w('r1', 'me', '2026-01-01T10:00:00Z')], 'me')).toBeNull()
  })
  it('пустая очередь → null', () => {
    expect(pickMatch([], 'me')).toBeNull()
  })
})

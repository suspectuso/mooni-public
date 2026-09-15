import { describe, it, expect } from 'vitest'
import {
  MoodSchema,
  SwipeInputSchema,
  FeedQuerySchema,
  BuildRouteInputSchema,
  PlaceCardSchema,
} from './index'

describe('MoodSchema', () => {
  it('принимает валидное настроение', () => {
    expect(MoodSchema.parse('recharge')).toBe('recharge')
  })
  it('отклоняет неизвестное настроение', () => {
    expect(MoodSchema.safeParse('party').success).toBe(false)
  })
})

describe('SwipeInputSchema', () => {
  it('валидирует лайк', () => {
    const r = SwipeInputSchema.parse({ placeId: 'p1', liked: true })
    expect(r.liked).toBe(true)
  })
  it('требует placeId', () => {
    expect(SwipeInputSchema.safeParse({ liked: true }).success).toBe(false)
  })
  it('moodAt опционален и проверяется', () => {
    expect(
      SwipeInputSchema.safeParse({
        placeId: 'p1',
        liked: false,
        moodAt: 'nope',
      }).success,
    ).toBe(false)
  })
})

describe('FeedQuerySchema', () => {
  it('limit по умолчанию = 10', () => {
    expect(FeedQuerySchema.parse({}).limit).toBe(10)
  })
  it('приводит строковый limit к числу', () => {
    expect(FeedQuerySchema.parse({ limit: '5' }).limit).toBe(5)
  })
  it('ограничивает limit сверху', () => {
    expect(FeedQuerySchema.safeParse({ limit: 999 }).success).toBe(false)
  })
})

describe('BuildRouteInputSchema', () => {
  it('пустой объект валиден (берём все лайки)', () => {
    expect(BuildRouteInputSchema.parse({})).toEqual({})
  })
  it('принимает placeIds', () => {
    expect(
      BuildRouteInputSchema.parse({ placeIds: ['a', 'b'] }).placeIds,
    ).toHaveLength(2)
  })
})

describe('PlaceCardSchema', () => {
  it('валидирует карточку места', () => {
    const card = {
      id: 'p1',
      name: 'Новая Голландия',
      description: null,
      category: 'park',
      district: 'Адмиралтейский',
      lat: 59.9,
      lng: 30.2,
      tags: ['кофе'],
      moodTags: ['recharge'],
      photos: [],
      priceLevel: 1,
    }
    expect(PlaceCardSchema.parse(card).name).toBe('Новая Голландия')
  })
  it('priceLevel вне диапазона отклоняется', () => {
    const bad = {
      id: 'p1',
      name: 'x',
      description: null,
      category: 'c',
      district: null,
      lat: null,
      lng: null,
      tags: [],
      moodTags: [],
      photos: [],
      priceLevel: 9,
    }
    expect(PlaceCardSchema.safeParse(bad).success).toBe(false)
  })
})

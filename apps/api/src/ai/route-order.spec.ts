import { describe, it, expect } from 'vitest'
import { geoOrder, defaultTitle } from './route-order'

describe('geoOrder', () => {
  it('сортирует с запада на восток (по lng)', () => {
    const out = geoOrder([
      { id: 'east', lng: 30.4 },
      { id: 'west', lng: 30.1 },
      { id: 'mid', lng: 30.25 },
    ])
    expect(out.map((p) => p.id)).toEqual(['west', 'mid', 'east'])
  })

  it('не мутирует исходный массив', () => {
    const input = [
      { id: 'b', lng: 2 },
      { id: 'a', lng: 1 },
    ]
    const out = geoOrder(input)
    expect(input.map((p) => p.id)).toEqual(['b', 'a'])
    expect(out.map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('места без lng считаются за 0', () => {
    const out = geoOrder([
      { id: 'has', lng: 5 },
      { id: 'none', lng: null },
    ])
    expect(out[0].id).toBe('none')
  })
})

describe('defaultTitle', () => {
  it('возвращает заголовок под настроение', () => {
    expect(defaultTitle('romance')).toBe('Романтический маршрут')
    expect(defaultTitle('recharge')).toBe('Маршрут на перезагрузку')
  })
  it('фолбэк без настроения', () => {
    expect(defaultTitle()).toBe('Твой маршрут по Питеру')
    expect(defaultTitle('unknown')).toBe('Твой маршрут по Питеру')
  })
})

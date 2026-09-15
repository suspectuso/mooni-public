import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyTelegramInitData } from './telegram.util'

const TOKEN = 'test:bot-token'

function makeInitData(authDateSec: number, userId = 42): string {
  const user = JSON.stringify({ id: userId, first_name: 'T' })
  const params: Record<string, string> = {
    auth_date: String(authDateSec),
    user,
  }
  const dcs = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(TOKEN).digest()
  const hash = createHmac('sha256', secret).update(dcs).digest('hex')
  const sp = new URLSearchParams(params)
  sp.set('hash', hash)
  return sp.toString()
}

describe('verifyTelegramInitData', () => {
  it('свежая валидная initData → пользователь', () => {
    const now = Math.floor(Date.now() / 1000)
    const u = verifyTelegramInitData(makeInitData(now), TOKEN)
    expect(u?.id).toBe(42)
  })

  it('протухшая initData (старше TTL) → null', () => {
    const old = Math.floor(Date.now() / 1000) - 48 * 3600
    expect(verifyTelegramInitData(makeInitData(old), TOKEN)).toBeNull()
  })

  it('неверный токен → null', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(verifyTelegramInitData(makeInitData(now), 'wrong')).toBeNull()
  })

  it('пустые аргументы → null', () => {
    expect(verifyTelegramInitData('', TOKEN)).toBeNull()
    expect(verifyTelegramInitData('x=1', '')).toBeNull()
  })
})

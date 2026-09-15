import { describe, it, expect } from 'vitest'
import { createHash, createHmac } from 'crypto'
import { verifyXRocketSignature } from './webhook-verify'

function sign(body: string, token: string) {
  const secret = createHash('sha256').update(token).digest()
  return createHmac('sha256', secret).update(body).digest('hex')
}

describe('verifyXRocketSignature', () => {
  const token = 'test-token'
  const body = JSON.stringify({ type: 'invoicePay', data: { status: 'paid' } })

  it('валидная подпись проходит', () => {
    expect(verifyXRocketSignature(body, sign(body, token), token)).toBe(true)
  })
  it('подделанная подпись отклоняется', () => {
    expect(verifyXRocketSignature(body, 'deadbeef', token)).toBe(false)
  })
  it('подпись от другого тела отклоняется', () => {
    expect(verifyXRocketSignature(body, sign('other', token), token)).toBe(
      false,
    )
  })
  it('без подписи/токена → false', () => {
    expect(verifyXRocketSignature(body, undefined, token)).toBe(false)
    expect(verifyXRocketSignature(body, sign(body, token), '')).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import {
  isYooKassaPaid,
  extractYooKassaPaymentId,
  isXRocketPaid,
  extractXRocketPaymentId,
} from './payments.logic'

describe('ЮKassa webhook', () => {
  it('payment.succeeded → оплачен', () => {
    expect(isYooKassaPaid({ event: 'payment.succeeded' })).toBe(true)
    expect(isYooKassaPaid({ object: { status: 'succeeded' } })).toBe(true)
  })
  it('pending → не оплачен', () => {
    expect(isYooKassaPaid({ object: { status: 'pending' } })).toBe(false)
  })
  it('paymentId из metadata', () => {
    expect(
      extractYooKassaPaymentId({ object: { metadata: { paymentId: 'p1' } } }),
    ).toBe('p1')
    expect(extractYooKassaPaymentId({})).toBeNull()
  })
})

describe('xRocket webhook', () => {
  it('invoicePay / paid → оплачен', () => {
    expect(isXRocketPaid({ type: 'invoicePay' })).toBe(true)
    expect(isXRocketPaid({ data: { status: 'paid' } })).toBe(true)
    expect(isXRocketPaid({ status: 'paid' })).toBe(true)
  })
  it('active → не оплачен', () => {
    expect(isXRocketPaid({ data: { status: 'active' } })).toBe(false)
  })
  it('paymentId из payload', () => {
    expect(extractXRocketPaymentId({ data: { payload: 'p2' } })).toBe('p2')
    expect(extractXRocketPaymentId({ payload: 'p3' })).toBe('p3')
    expect(extractXRocketPaymentId({})).toBeNull()
  })
})

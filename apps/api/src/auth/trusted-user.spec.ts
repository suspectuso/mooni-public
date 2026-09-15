import { describe, it, expect, afterEach } from 'vitest'
import { trustedTelegramId } from './trusted-user'

const ORIG = process.env.AUTH_SKIP_TELEGRAM_VALIDATION

afterEach(() => {
  process.env.AUTH_SKIP_TELEGRAM_VALIDATION = ORIG
})

describe('trustedTelegramId', () => {
  it('в демо-режиме (skip=true) доверяет userId', () => {
    process.env.AUTH_SKIP_TELEGRAM_VALIDATION = 'true'
    expect(trustedTelegramId('42', undefined)).toBe(42n)
  })

  it('в демо-режиме без userId — отказ', () => {
    process.env.AUTH_SKIP_TELEGRAM_VALIDATION = 'true'
    expect(() => trustedTelegramId(undefined, undefined)).toThrow()
  })

  it('в проде (skip=false) без валидного initData — отказ', () => {
    process.env.AUTH_SKIP_TELEGRAM_VALIDATION = 'false'
    expect(() => trustedTelegramId('42', undefined)).toThrow()
    expect(() => trustedTelegramId('42', 'garbage')).toThrow()
  })
})

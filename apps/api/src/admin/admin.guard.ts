import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import type { Request } from 'express'

/**
 * Простой admin-гейт: заголовок X-Admin-Token === ADMIN_TOKEN.
 * Если ADMIN_TOKEN не задан в env — все admin-роуты закрыты (deny by default).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const expected = process.env.ADMIN_TOKEN
    if (!expected) return false
    const req = ctx.switchToHttp().getRequest<Request>()
    const token = req.headers['x-admin-token'] as string | undefined
    return token === expected
  }
}

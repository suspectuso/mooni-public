import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthedRequest } from './jwt-auth.guard'

/** Достаёт userId, положенный JwtAuthGuard в request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>()
    return req.userId
  },
)

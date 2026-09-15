import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'

export interface AuthedRequest extends Request {
  userId: string
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>()
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token')
    }
    const token = header.slice(7)
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token)
      req.userId = payload.sub
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}

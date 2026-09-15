import { Body, Controller, Post } from '@nestjs/common'
import { AuthInputSchema } from '@mooni/shared'
import { AuthService } from './auth.service'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('telegram')
  async telegram(
    @Body(new ZodValidationPipe(AuthInputSchema))
    body: {
      initData: string
    },
  ) {
    return this.auth.authViaTelegram(body.initData)
  }
}

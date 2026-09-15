import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import type { RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'
import { PaymentsService } from './payments.service'
import { YooKassaService } from './yookassa.service'
import {
  extractXRocketPaymentId,
  extractYooKassaPaymentId,
  isXRocketPaid,
  isYooKassaPaid,
} from './payments.logic'
import { verifyXRocketSignature } from './webhook-verify'

@Controller('payments')
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private yookassa: YooKassaService,
  ) {}

  /** Создать платёж: ?userId=&purpose=premium|booking|topup&provider=yookassa|xrocket&refId= */
  @Post('create')
  create(
    @Req() req: Request,
    @Query('userId') userId: string,
    @Query('purpose') purpose: 'premium' | 'booking' | 'topup',
    @Query('provider') provider: 'yookassa' | 'xrocket',
    @Query('refId') refId?: string,
  ) {
    const initData =
      (req.headers['x-telegram-init-data'] as string) || undefined
    return this.payments.create(userId, purpose, provider, refId, initData)
  }

  @Post('yookassa-webhook')
  async yookassaWebhook(@Req() req: Request, @Body() body: any) {
    if (process.env.PAYMENTS_WEBHOOK_SKIP_IP !== 'true') {
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.ip ||
        ''
      if (!this.yookassa.verifyWebhookIp(ip)) {
        throw new ForbiddenException('bad ip')
      }
    }
    if (isYooKassaPaid(body)) {
      const id = extractYooKassaPaymentId(body)
      if (id) await this.payments.markPaid(id)
    }
    return { ok: true }
  }

  @Post('xrocket-webhook')
  async xrocketWebhook(@Req() req: RawBodyRequest<Request>, @Body() body: any) {
    const skipSig = process.env.PAYMENTS_WEBHOOK_SKIP_SIG === 'true'
    if (!skipSig) {
      const token = process.env.XROCKET_TOKEN ?? ''
      const raw = req.rawBody?.toString() ?? ''
      const sig = req.headers['rocket-pay-signature'] as string | undefined
      // нет токена → не можем проверить подпись → отклоняем (защита от форжа)
      if (!token || !verifyXRocketSignature(raw, sig, token)) {
        throw new ForbiddenException('bad signature')
      }
    }
    if (isXRocketPaid(body)) {
      const id = extractXRocketPaymentId(body)
      if (id) await this.payments.markPaid(id)
    }
    return { ok: true }
  }
}

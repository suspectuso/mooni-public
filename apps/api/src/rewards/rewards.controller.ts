import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common'
import type { Request } from 'express'
import { RewardsService } from './rewards.service'

/**
 * QR-чек-ин и партнёры (v3). Начисление susCoin → требуем подтверждённый Telegram initData.
 */
@Controller()
export class RewardsController {
  constructor(private rewards: RewardsService) {}

  @Post('qr/redeem')
  redeem(
    @Req() req: Request,
    @Query('userId') userId: string,
    @Body() body: { code: string },
  ) {
    const initData =
      (req.headers['x-telegram-init-data'] as string) || undefined
    return this.rewards.redeem(userId, body.code, initData)
  }

  @Get('qr/partners')
  partners() {
    return this.rewards.partners()
  }
}

import { Controller, Get, Headers, Param, Post, Query } from '@nestjs/common'
import { MissionsService } from './missions.service'

/** City Missions. Протокол как у compat (?userId=). */
@Controller('missions')
export class MissionsController {
  constructor(private missions: MissionsService) {}

  @Get()
  list(
    @Query('userId') userId?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.missions.list(userId, initData)
  }

  @Post(':key/claim')
  claim(
    @Param('key') key: string,
    @Query('userId') userId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.missions.claim(userId, key, initData)
  }
}

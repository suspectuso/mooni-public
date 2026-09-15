import { Controller, Get, Headers, Query } from '@nestjs/common'
import { SeasonService } from './season.service'

/** Текущий сезон Mooni и его челленджи. Протокол как у compat (?userId=). */
@Controller('season')
export class SeasonController {
  constructor(private season: SeasonService) {}

  @Get('current')
  current(
    @Query('userId') userId?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.season.current(userId, initData)
  }
}

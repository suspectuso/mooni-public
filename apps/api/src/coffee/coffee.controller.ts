import { Controller, Get, Headers, Post, Query } from '@nestjs/common'
import { CoffeeService } from './coffee.service'

/** Random Coffee — подбор случайного собеседника. Протокол как у compat (?userId=). */
@Controller('coffee')
export class CoffeeController {
  constructor(private coffee: CoffeeService) {}

  @Post('join')
  join(
    @Query('userId') userId: string,
    @Query('kind') kind?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.coffee.join(userId, kind ?? 'coffee', initData)
  }

  @Get('status')
  status(
    @Query('userId') userId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.coffee.status(userId, initData)
  }

  @Post('leave')
  leave(
    @Query('userId') userId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.coffee.leave(userId, initData)
  }
}

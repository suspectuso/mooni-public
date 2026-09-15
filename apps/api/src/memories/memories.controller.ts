import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common'
import { MemoriesService, type MemoryInput } from './memories.service'

/** Альбом «ачивка-как-память». Протокол как у compat (?userId=<telegramId>). */
@Controller('memories')
export class MemoriesController {
  constructor(private memories: MemoriesService) {}

  @Get()
  list(
    @Query('userId') userId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.memories.list(userId, initData)
  }

  @Post()
  add(
    @Query('userId') userId: string,
    @Body() body: MemoryInput,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.memories.add(userId, body, initData)
  }
}

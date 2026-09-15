import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common'
import { ProfileService, type ProfileInput } from './profile.service'

/** Профиль персонализации (психотип + интересы). Протокол как у compat (?userId=). */
@Controller('me/profile')
export class ProfileController {
  constructor(private profile: ProfileService) {}

  @Get()
  get(
    @Query('userId') userId?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.profile.get(userId, initData)
  }

  @Get('vibes')
  vibes(
    @Query('userId') userId?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.profile.vibes(userId, initData)
  }

  @Post()
  set(
    @Query('userId') userId: string,
    @Body() body: ProfileInput,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.profile.set(userId, body, initData)
  }
}

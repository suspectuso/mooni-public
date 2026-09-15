import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { SwipeInputSchema } from '@mooni/shared'
import { SwipeService } from './swipe.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller()
@UseGuards(JwtAuthGuard)
export class SwipeController {
  constructor(private swipeService: SwipeService) {}

  @Post('swipe')
  swipe(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(SwipeInputSchema))
    body: ReturnType<typeof SwipeInputSchema.parse>,
  ) {
    return this.swipeService.swipe(userId, body)
  }

  @Get('liked')
  liked(@CurrentUser() userId: string) {
    return this.swipeService.likedPlaces(userId)
  }

  @Delete('swipe/:placeId')
  rewind(@CurrentUser() userId: string, @Param('placeId') placeId: string) {
    return this.swipeService.rewind(userId, placeId)
  }
}

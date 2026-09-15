import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { FeedQuerySchema } from '@mooni/shared'
import { FeedService } from './feed.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private feed: FeedService) {}

  @Get()
  getFeed(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(FeedQuerySchema))
    query: ReturnType<typeof FeedQuerySchema.parse>,
  ) {
    return this.feed.getNextBatch(userId, query)
  }

  @Post('refill')
  refill(
    @CurrentUser() userId: string,
    @Query(new ZodValidationPipe(FeedQuerySchema))
    query: ReturnType<typeof FeedQuerySchema.parse>,
  ) {
    return this.feed.refill(userId, query)
  }
}

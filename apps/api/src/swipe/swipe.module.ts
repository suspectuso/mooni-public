import { Module } from '@nestjs/common'
import { SwipeService } from './swipe.service'
import { SwipeController } from './swipe.controller'

@Module({
  controllers: [SwipeController],
  providers: [SwipeService],
  exports: [SwipeService],
})
export class SwipeModule {}

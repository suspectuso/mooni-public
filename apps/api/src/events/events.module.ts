import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { AfishaService } from './afisha.service'

@Module({
  controllers: [EventsController],
  providers: [EventsService, AfishaService],
  exports: [AfishaService],
})
export class EventsModule {}

import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { EventsQuerySchema } from '@mooni/shared'
import { EventsService } from './events.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  upcoming(
    @Query(new ZodValidationPipe(EventsQuerySchema))
    query: ReturnType<typeof EventsQuerySchema.parse>,
  ) {
    return this.events.upcoming(query)
  }
}

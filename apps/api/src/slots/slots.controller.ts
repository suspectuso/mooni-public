import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CreateSlotInputSchema } from '@mooni/shared'
import { SlotsService } from './slots.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('slots')
@UseGuards(JwtAuthGuard)
export class SlotsController {
  constructor(private slots: SlotsService) {}

  @Get()
  listOpen(@CurrentUser() userId: string) {
    return this.slots.listOpen(userId)
  }

  @Get('mine')
  mine(@CurrentUser() userId: string) {
    return this.slots.mine(userId)
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(CreateSlotInputSchema))
    body: ReturnType<typeof CreateSlotInputSchema.parse>,
  ) {
    return this.slots.create(userId, body)
  }

  @Post(':id/join')
  join(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.slots.join(userId, id)
  }

  @Post(':id/leave')
  leave(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.slots.leave(userId, id)
  }
}

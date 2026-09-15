import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { BuildRouteInputSchema } from '@mooni/shared'
import { RoutesService } from './routes.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private routes: RoutesService) {}

  @Post('build')
  build(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(BuildRouteInputSchema))
    body: ReturnType<typeof BuildRouteInputSchema.parse>,
  ) {
    return this.routes.build(userId, body)
  }

  @Get()
  list(@CurrentUser() userId: string) {
    return this.routes.list(userId)
  }

  @Get(':id')
  get(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.routes.get(userId, id)
  }

  @Post(':id/points/:order/complete')
  complete(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Param('order', ParseIntPipe) order: number,
  ) {
    return this.routes.completePoint(userId, id, order)
  }
}

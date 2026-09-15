import { Module } from '@nestjs/common'
import { RoutesService } from './routes.service'
import { RoutesController } from './routes.controller'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [AiModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}

import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { AiModule } from '../ai/ai.module'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [AiModule, EventsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

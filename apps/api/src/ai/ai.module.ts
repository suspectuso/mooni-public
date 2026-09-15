import { Module } from '@nestjs/common'
import { AiService } from './ai.service'
import { ContextService } from './context.service'

@Module({
  providers: [AiService, ContextService],
  exports: [AiService, ContextService],
})
export class AiModule {}

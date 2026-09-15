import { Global, Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { AiModule } from '../ai/ai.module'

@Global()
@Module({
  imports: [AiModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}

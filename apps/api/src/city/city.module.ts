import { Module } from '@nestjs/common'
import { CityService } from './city.service'
import { CityController } from './city.controller'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [AiModule],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}

import { Module } from '@nestjs/common'
import { RelationshipController } from './relationship.controller'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [AiModule],
  controllers: [RelationshipController],
})
export class RelationshipModule {}

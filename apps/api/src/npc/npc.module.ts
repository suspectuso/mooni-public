import { Module } from '@nestjs/common'
import { NpcController } from './npc.controller'

@Module({
  controllers: [NpcController],
})
export class NpcModule {}

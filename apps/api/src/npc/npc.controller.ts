import { Controller, Get, Query } from '@nestjs/common'
import { npcPhrase, type NpcContext } from './npc.logic'

/** Реплики 2D-проводника. Публично (не чувствительно). */
@Controller('npc')
export class NpcController {
  @Get('phrase')
  phrase(
    @Query('context') context: NpcContext = 'greeting',
    @Query('mood') mood?: string,
  ) {
    return { text: npcPhrase(context, mood) }
  }
}

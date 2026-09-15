import { Controller, Get } from '@nestjs/common'
import { CityService } from './city.service'
import { ContextService } from '../ai/context.service'

/** «TikTok города» — общая лента активности (слоты/события/места). Публично. */
@Controller('city')
export class CityController {
  constructor(
    private city: CityService,
    private context: ContextService,
  ) {}

  @Get('feed')
  feed() {
    return this.city.feed()
  }

  // Погода + время суток СПб (для баннера «Город сейчас» и маршрутов под погоду)
  @Get('context')
  cityContext() {
    return this.context.get(Date.now())
  }
}

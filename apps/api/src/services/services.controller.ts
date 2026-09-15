import { Controller, Get, Query } from '@nestjs/common'
import { ServicesService } from './services.service'

/** Каталог локальных услуг СПб. Публично (контент). */
@Controller('services')
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.services.list(type)
  }
}

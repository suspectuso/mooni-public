import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ExperiencesService } from './experiences.service'

/**
 * Маркет впечатлений + премиум (v3). Протокол как у compat — ?userId=<telegramId>.
 * /courses — алиас под экран education Match (каталог + деталь + покупка).
 */
@Controller()
export class ExperiencesController {
  constructor(private experiences: ExperiencesService) {}

  @Get('courses')
  courses(
    @Query('userId') userId?: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.experiences.asCourses(userId, initData)
  }

  @Get('courses/:id')
  course(@Param('id') id: string) {
    return this.experiences.asCourse(id)
  }

  @Get('courses/:id/check-purchase')
  checkPurchase(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.experiences.checkPurchase(userId, id, initData)
  }

  @Post('bot/send-course-payment-message')
  sendCoursePayment(
    @Body() body: { userId: string; courseId: string },
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.experiences.requestCoursePayment(
      body.userId,
      body.courseId,
      initData,
    )
  }

  @Get('experiences')
  list() {
    return this.experiences.list()
  }

  @Get('experiences/:id')
  get(@Param('id') id: string) {
    return this.experiences.get(id)
  }

  @Post('experiences/:id/book')
  book(
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Headers('x-telegram-init-data') initData?: string,
  ) {
    return this.experiences.book(userId, id, initData)
  }
  // премиум активируется ТОЛЬКО после оплаты (payments → markPaid → fulfill),
  // публичной бесплатной выдачи /premium/activate больше нет.
}

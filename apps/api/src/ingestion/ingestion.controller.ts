import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  IngestionService,
  type ApprovePlaceInput,
  type RawPostInput,
} from './ingestion.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('ingestion')
export class IngestionController {
  constructor(private ingestion: IngestionService) {}

  /** Вебхук для n8n. Авторизация — общий секрет в заголовке X-Ingest-Secret. */
  @Post('raw')
  ingest(
    @Headers('x-ingest-secret') secret: string,
    @Body() body: RawPostInput,
  ) {
    const expected = process.env.INGEST_SECRET
    if (!expected || secret !== expected) {
      throw new ForbiddenException('Bad ingest secret')
    }
    return this.ingestion.ingest(body)
  }

  /** Очередь модерации (позже — админка). */
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  pending() {
    return this.ingestion.pending()
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id') id: string, @Body() place: ApprovePlaceInput) {
    return this.ingestion.approve(id, place)
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(@Param('id') id: string) {
    return this.ingestion.reject(id)
  }
}

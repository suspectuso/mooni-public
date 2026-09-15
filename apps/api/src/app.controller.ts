import { Controller, Get } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    let db = 'ok'
    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch {
      db = 'down'
    }
    return {
      status: db === 'ok' ? 'ok' : 'degraded',
      service: 'mooni-api',
      db,
      llm: process.env.LLM_BASE_URL ?? null,
    }
  }
}

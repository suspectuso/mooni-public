import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../prisma/prisma.service'
import { BotService } from '../bot/bot.service'

/**
 * Мониторинг прода: раз в 5 мин проверяет БД и LLM. На переходе healthy↔down
 * шлёт алерт в Telegram (ADMIN_CHAT_ID) через бота. Без ADMIN_CHAT_ID — только лог.
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name)
  private lastHealthy = true

  constructor(
    private prisma: PrismaService,
    private bot: BotService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async check() {
    const problems: string[] = []

    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch {
      problems.push('БД недоступна')
    }

    try {
      const base = process.env.LLM_EMBED_BASE_URL ?? 'http://localhost:11434'
      const res = await fetch(`${base}/api/tags`, {
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) problems.push(`LLM ${res.status}`)
    } catch {
      problems.push('LLM недоступен')
    }

    const healthy = problems.length === 0
    if (healthy === this.lastHealthy) return // статус не менялся — молчим
    this.lastHealthy = healthy

    const chat = process.env.ADMIN_CHAT_ID
    if (healthy) {
      this.logger.log('recovered: всё снова ок')
      if (chat)
        await this.bot.sendMessage(chat, '✅ Mooni: сервисы восстановлены')
    } else {
      const msg = `🔴 Mooni down: ${problems.join(', ')}`
      this.logger.error(msg)
      if (chat) await this.bot.sendMessage(chat, msg)
    }
  }
}

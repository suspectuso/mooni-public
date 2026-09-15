import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Bot, type Context } from 'grammy'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { AsrService } from '../asr/asr.service'
import { parseMood } from '../asr/parse-mood'

function openBtn(appUrl: string) {
  return {
    inline_keyboard: [[{ text: '🔥 Открыть Mooni', web_app: { url: appUrl } }]],
  }
}

/**
 * Telegram-бот Mooni (@MooniAppbot). Long-polling внутри API-процесса.
 * Стартует ТОЛЬКО при BOT_ENABLED=true и валидном токене — чтобы локальный dev
 * не перехватывал getUpdates у прода (одновременный polling двух инстансов конфликтует).
 */
@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name)
  private bot: Bot | null = null

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private asr: AsrService,
  ) {}

  onModuleInit() {
    const enabled = process.env.BOT_ENABLED === 'true'
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!enabled || !token || token === 'dev') {
      this.logger.log('Bot disabled (BOT_ENABLED!=true or no real token)')
      return
    }

    // Mini App открываем на /v2 (новый чат-формат). База — WEBAPP_URL (её не трогаем: её
    // использует возврат платежей).
    const base = process.env.WEBAPP_URL ?? 'https://mooni.suspectuso.ru'
    const appUrl = `${base}/v2`
    this.bot = new Bot(token)

    this.bot.command('start', async (ctx) => {
      await ctx.reply(
        'Привет! Я Mooni — собираю маршруты по Питеру под твоё настроение 🌃\n\n' +
          'Свайпай места, лайкай — и получишь готовый маршрут с историями. ' +
          'Можешь даже надиктовать голосом, чего хочешь 🎙',
        { reply_markup: openBtn(appUrl) },
      )
    })

    // Голосовой ввод: распознаём речь (Parakeet) → маршрут под настроение
    this.bot.on('message:voice', (ctx) =>
      this.handleVoice(ctx, token, appUrl).catch((e) =>
        this.logger.warn(`voice handler: ${String(e)}`),
      ),
    )

    this.bot.catch((err) => this.logger.error(`Bot error: ${String(err)}`))

    this.bot.start({
      onStart: (info) => this.logger.log(`Bot @${info.username} polling`),
    })
  }

  private async handleVoice(ctx: Context, token: string, appUrl: string) {
    const tgId = ctx.from?.id
    if (!tgId) return
    await ctx.replyWithChatAction('typing')

    const file = await ctx.getFile()
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`
    const audio = Buffer.from(await (await fetch(fileUrl)).arrayBuffer())
    const text = await this.asr.transcribe(audio)
    if (!text) {
      await ctx.reply('Не расслышал 🙉 Попробуй сказать ещё раз.')
      return
    }

    const mood = parseMood(text)
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(tgId) },
    })
    const likes = user
      ? await this.prisma.swipe.findMany({
          where: { userId: user.id, liked: true },
          include: { place: true },
        })
      : []

    if (likes.length === 0) {
      await ctx.reply(
        `Услышал: «${text}» 👂\nСначала полайкай места в приложении — соберу маршрут под это настроение.`,
        { reply_markup: openBtn(appUrl) },
      )
      return
    }

    const places = likes.map((s) => ({
      id: s.place.id,
      name: s.place.name,
      description: s.place.description,
      district: s.place.district,
      tags: s.place.tags,
      lat: s.place.lat,
      lng: s.place.lng,
    }))
    const route = await this.ai.buildRoute(places, mood ?? undefined)
    const lines = route.points.map((p, i) => {
      const pl = places.find((x) => x.id === p.id)
      return `${i + 1}. ${pl?.name ?? ''}${p.note ? ' — ' + p.note : ''}`
    })
    await ctx.reply(
      `Услышал: «${text}» 👂\n\n🗺️ ${route.title}\n${lines.join('\n')}`,
      { reply_markup: openBtn(appUrl) },
    )
  }

  /** Безопасная отправка: no-op, если бот выключен. */
  async sendMessage(telegramId: bigint | string, text: string) {
    if (!this.bot) return
    try {
      await this.bot.api.sendMessage(Number(telegramId), text)
    } catch (e) {
      this.logger.warn(`sendMessage to ${telegramId} failed: ${String(e)}`)
    }
  }
}

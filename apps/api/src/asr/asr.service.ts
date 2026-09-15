import { Injectable, Logger } from '@nestjs/common'

/**
 * Распознавание речи (голосовой ввод маршрута). Сырое Telegram-аудио (.oga/opus)
 * отправляется как есть на ASR-сервер (Parakeet v3 на sus) — он сам декодирует и распознаёт.
 * Эндпоинт в ASR_URL; без него — пусто (фича выключена).
 */
@Injectable()
export class AsrService {
  private readonly logger = new Logger(AsrService.name)

  async transcribe(audio: Buffer, filename = 'voice.oga'): Promise<string> {
    const url = process.env.ASR_URL
    if (!url) {
      this.logger.warn('ASR_URL не задан — распознавание выключено')
      return ''
    }
    try {
      const form = new FormData()
      form.append('file', new Blob([audio]), filename)
      const res = await fetch(url, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(60000),
      })
      if (!res.ok) {
        this.logger.warn(`ASR ${res.status}`)
        return ''
      }
      const data = (await res.json()) as { text?: string }
      return (data.text ?? '').trim()
    } catch (e) {
      this.logger.warn(`transcribe failed: ${String(e)}`)
      return ''
    }
  }
}

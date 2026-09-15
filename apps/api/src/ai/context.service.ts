import { Injectable, Logger } from '@nestjs/common'

export interface CityContext {
  weather: string // ясно | облачно | дождь | снег | туман | гроза | ?
  tempC: number | null
  timeOfDay: string // утро | день | вечер | ночь
}

function weatherFromCode(code: number): string {
  if (code === 0) return 'ясно'
  if ([1, 2, 3].includes(code)) return 'облачно'
  if ([45, 48].includes(code)) return 'туман'
  if (code >= 51 && code <= 67) return 'дождь'
  if ([80, 81, 82].includes(code)) return 'дождь'
  if ((code >= 71 && code <= 77) || [85, 86].includes(code)) return 'снег'
  if (code >= 95) return 'гроза'
  return '?'
}

function timeOfDay(hour: number): string {
  if (hour >= 5 && hour < 11) return 'утро'
  if (hour >= 11 && hour < 17) return 'день'
  if (hour >= 17 && hour < 23) return 'вечер'
  return 'ночь'
}

/**
 * Контекст города СПб: текущая погода (open-meteo, бесплатно без ключей) + время суток.
 * Маршрут под погоду/время («питер в дождь», «ночной маршрут»). Кэш на 30 минут.
 */
@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name)
  private cache: { value: CityContext; at: number } | null = null

  async get(nowMs: number): Promise<CityContext> {
    if (this.cache && nowMs - this.cache.at < 30 * 60 * 1000) {
      return this.cache.value
    }
    let value: CityContext = { weather: '?', tempC: null, timeOfDay: 'день' }
    try {
      const base =
        process.env.OPEN_METEO_URL ?? 'https://api.open-meteo.com/v1/forecast'
      const url = `${base}?latitude=59.94&longitude=30.31&current=temperature_2m,weather_code&timezone=Europe%2FMoscow`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const d = (await res.json()) as {
          current?: {
            temperature_2m?: number
            weather_code?: number
            time?: string
          }
        }
        const cur = d.current ?? {}
        const hour = cur.time ? Number(cur.time.slice(11, 13)) : 12
        value = {
          weather: weatherFromCode(cur.weather_code ?? -1),
          tempC: cur.temperature_2m ?? null,
          timeOfDay: timeOfDay(hour),
        }
      }
    } catch (e) {
      this.logger.warn(`weather fetch failed: ${String(e)}`)
    }
    this.cache = { value, at: nowMs }
    return value
  }
}

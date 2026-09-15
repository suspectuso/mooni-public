import { Injectable, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import { defaultTitle, geoOrder } from './route-order'
import { ContextService } from './context.service'

export interface RoutePlaceInput {
  id: string
  name: string
  description?: string | null
  district?: string | null
  tags: string[]
  lat?: number | null
  lng?: number | null
}

export interface OrderedRoutePoint {
  id: string
  note: string
}

export interface OrderedRoute {
  title: string
  points: OrderedRoutePoint[]
}

/**
 * Обёртка над локальным Ollama (sus, GPU RTX 3060) через OpenAI-совместимый API.
 * Эндпоинт/модель — из env (LLM_BASE_URL/LLM_MODEL), провайдер свапается.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private readonly client: OpenAI
  private readonly model: string

  constructor(private context: ContextService) {
    this.client = new OpenAI({
      baseURL: process.env.LLM_BASE_URL ?? 'http://localhost:11434/v1',
      apiKey: process.env.LLM_API_KEY ?? 'ollama',
    })
    this.model = process.env.LLM_MODEL ?? 'qwen2.5:14b-instruct'
  }

  private readonly embedModel =
    process.env.LLM_EMBED_MODEL ?? 'nomic-embed-text'
  private readonly embedBase =
    process.env.LLM_EMBED_BASE_URL ?? 'http://localhost:11434'

  /** Эмбеддинг текста через Ollama (nomic-embed-text). null при ошибке. */
  async embed(text: string): Promise<number[] | null> {
    try {
      const res = await fetch(`${this.embedBase}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.embedModel, prompt: text }),
      })
      const data: any = await res.json()
      const v = data?.embedding
      return Array.isArray(v) && v.length ? (v as number[]) : null
    } catch (e) {
      this.logger.warn(`embed failed: ${String(e)}`)
      return null
    }
  }

  /**
   * Упорядочивает лайкнутые места в маршрут и пишет к каждому короткую историю.
   * Если LLM недоступен или вернул мусор — мягкий фолбэк: гео-сортировка без историй.
   */
  async buildRoute(
    places: RoutePlaceInput[],
    mood?: string,
    profile?: { psychotype?: string | null; interests?: string[] },
  ): Promise<OrderedRoute> {
    if (places.length === 0) return { title: 'Пустой маршрут', points: [] }

    const ctx = await this.context.get(Date.now())

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Ты — городской гид по Санкт-Петербургу. Собираешь из списка мест ' +
              'логичный пеший маршрут: упорядочиваешь по географической близости и ' +
              'удобному ритму прогулки, к каждому месту пишешь одну живую фразу-историю ' +
              '(до 140 символов). Отвечай СТРОГО JSON.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              mood: mood ?? null,
              psychotype: profile?.psychotype ?? null,
              interests: profile?.interests ?? [],
              weather: ctx.weather,
              tempC: ctx.tempC,
              timeOfDay: ctx.timeOfDay,
              hint: 'учитывай психотип, интересы, погоду и время суток: в дождь — крытые места, вечером — атмосферные/с видом, утром — спокойные',
              places,
              format: {
                title: 'короткое название маршрута под настроение',
                points: [{ id: 'place id', note: 'фраза-история' }],
              },
            }),
          },
        ],
      })

      const raw = completion.choices[0]?.message?.content ?? '{}'
      const parsed = JSON.parse(raw) as Partial<OrderedRoute>

      const valid =
        parsed?.points?.filter((p) => places.some((pl) => pl.id === p.id)) ?? []

      if (valid.length === 0) return this.fallback(places, mood)

      return {
        title: parsed.title?.trim() || this.defaultTitle(mood),
        points: valid.map((p) => ({ id: p.id, note: p.note ?? '' })),
      }
    } catch (e) {
      this.logger.warn(`LLM buildRoute failed, using fallback: ${String(e)}`)
      return this.fallback(places, mood)
    }
  }

  /** Идея свидания в СПб (помощь в отношениях). Фолбэк — статичная идея. */
  async dateIdea(): Promise<{ title: string; steps: string[] }> {
    const FALLBACK = {
      title: 'Вечер на воде',
      steps: [
        'Прогулка по набережной к закату',
        'Кофе в уютной кофейне на двоих',
        'Развод мостов в финале вечера',
      ],
    }
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Ты придумываешь романтические свидания в Санкт-Петербурге. Верни СТРОГО JSON ' +
              '{title: короткое название, steps: массив из 3 шагов-активностей}. Кратко и атмосферно.',
          },
          { role: 'user', content: 'Придумай идею свидания на вечер.' },
        ],
      })
      const parsed = JSON.parse(
        completion.choices[0]?.message?.content ?? '{}',
      ) as { title?: string; steps?: string[] }
      if (parsed.title && Array.isArray(parsed.steps) && parsed.steps.length) {
        return { title: parsed.title, steps: parsed.steps.slice(0, 4) }
      }
      return FALLBACK
    } catch (e) {
      this.logger.warn(`dateIdea failed: ${String(e)}`)
      return FALLBACK
    }
  }

  private fallback(places: RoutePlaceInput[], mood?: string): OrderedRoute {
    return {
      title: defaultTitle(mood),
      points: geoOrder(places).map((p) => ({ id: p.id, note: '' })),
    }
  }

  private defaultTitle(mood?: string): string {
    return defaultTitle(mood)
  }
}

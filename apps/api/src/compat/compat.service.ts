import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AiService } from '../ai/ai.service'
import { trustedTelegramId } from '../auth/trusted-user'

// текст-запрос под настроение для семантического подбора (Recommendation 2.0)
const MOOD_QUERY: Record<string, string> = {
  recharge: 'тихое спокойное место отдохнуть и перезагрузиться',
  inspiration: 'вдохновляющее место, искусство и красота',
  social: 'людное место, компания и общение, движ',
  solitude: 'уединённое тихое место побыть одному',
  anxious: 'спокойное умиротворяющее безопасное место',
  romance: 'романтическое место для двоих, закат, набережная',
  active: 'активное место, спорт, движение, энергия',
}
// кэш эмбеддингов настроений (модульный, живёт пока жив процесс)
const moodVecCache = new Map<string, number[]>()

/**
 * Общие хелперы compat-слоя (резолв юзера по telegramId, маппинг наших сущностей
 * в формы фронта Match, семантический вектор настроения). Держим тут, чтобы тонкие
 * под-контроллеры (networking/users/sprints/content) не дублировали логику.
 */
@Injectable()
export class CompatService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async resolveUser(userId?: string, initData?: string) {
    const skip = process.env.AUTH_SKIP_TELEGRAM_VALIDATION === 'true'
    if (skip && !userId) return null // гость в демо-режиме
    const telegramId = trustedTelegramId(userId, initData)
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    if (existing) return existing
    return this.prisma.user.create({ data: { telegramId } })
  }

  async moodVector(mood: string): Promise<number[] | null> {
    const cached = moodVecCache.get(mood)
    if (cached) return cached
    const q = MOOD_QUERY[mood]
    if (!q) return null
    const vec = await this.ai.embed(q)
    if (vec) moodVecCache.set(mood, vec)
    return vec
  }

  toNetworkingCard(p: {
    id: string
    name: string
    photos: string[]
    district: string | null
    description: string | null
    tags: string[]
    moodTags: string[]
    lat: number | null
    lng: number | null
    category: { title: string }
  }) {
    return {
      id: p.id,
      networkingName: p.name,
      networkingPhoto: p.photos[0] ?? '',
      networkingLocation: p.district ?? 'Санкт-Петербург',
      networkingAbout: p.description ?? '',
      networkingSkills: p.tags.slice(0, 3).map((name) => ({ name })),
      networkingValues: p.moodTags.slice(0, 2).map((name) => ({ name })),
      networkingLookingFor: [],
      networkingAura: 'TURQUOISE', // аура всегда включена (бирюза = цвет Луми)
      networkingCases: [],
      hasWorkProfile: false,
      primarySkill: p.category.title,
      // координаты + теги для раздела «Карта» (/map)
      lat: p.lat,
      lng: p.lng,
      tags: p.tags,
      district: p.district,
    }
  }

  slotToSprint(s: {
    id: string
    title: string
    type: string
    district: string | null
    placeName: string | null
    startsAt: Date
    minParticipants: number
    maxParticipants: number
    status: string
    participants?: {
      userId: string
      user?: {
        id: string
        firstName: string | null
        username: string | null
      } | null
    }[]
  }) {
    const typeLabel: Record<string, string> = {
      sport: 'Спорт',
      boardgames: 'Настолки',
      walk: 'Прогулка',
      coworking: 'Коворкинг',
      photo: 'Фотосессия',
    }
    const count = s.participants?.length ?? 0
    const where = [s.district, s.placeName].filter(Boolean).join(' · ')
    return {
      id: s.id,
      title: s.title,
      description: `${typeLabel[s.type] ?? s.type}${where ? ' · ' + where : ''}`,
      taskTitle: `Участников: ${count}/${s.maxParticipants} (нужно ${s.minParticipants})`,
      taskDescription:
        s.status === 'confirmed' ? 'Группа собралась ✅' : 'Идёт набор',
      conditions: null,
      startDate: s.startsAt.toISOString(),
      endDate: s.startsAt.toISOString(),
      isActive: s.status === 'open' || s.status === 'confirmed',
      participants: (s.participants ?? []).map((p) => ({
        userId: p.userId,
        sprintId: s.id,
        points: 0,
        user: {
          id: p.userId,
          firstName: p.user?.firstName ?? null,
          username: p.user?.username ?? null,
          avatarUrl: null,
        },
      })),
    }
  }
}

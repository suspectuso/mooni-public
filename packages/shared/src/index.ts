import { z } from 'zod'

/**
 * Общие контракты Mooni (фронт ↔ бэк).
 * Единственный источник правды по DTO. Бэк валидирует вход этими схемами,
 * фронт импортирует типы.
 */

export const MOODS = [
  'recharge', // перезагрузка / отдых
  'inspiration', // вдохновение
  'social', // хочу к людям
  'solitude', // хочу одиночества
  'anxious', // тревожно, нужно успокоиться
  'romance', // романтика
  'active', // движ / спорт
] as const
export const MoodSchema = z.enum(MOODS)
export type Mood = z.infer<typeof MoodSchema>

export const SwipeInputSchema = z.object({
  placeId: z.string().min(1),
  liked: z.boolean(),
  moodAt: MoodSchema.optional(),
})
export type SwipeInput = z.infer<typeof SwipeInputSchema>

export const PlaceCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(), // slug категории
  district: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  tags: z.array(z.string()),
  moodTags: z.array(z.string()),
  photos: z.array(z.string()),
  priceLevel: z.number().int().min(0).max(3).nullable(),
})
export type PlaceCard = z.infer<typeof PlaceCardSchema>

export const FeedQuerySchema = z.object({
  mood: MoodSchema.optional(),
  district: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(10),
})
export type FeedQuery = z.infer<typeof FeedQuerySchema>

export const RoutePointSchema = z.object({
  order: z.number().int(),
  place: PlaceCardSchema,
  note: z.string().nullable(),
  done: z.boolean(),
})
export type RoutePoint = z.infer<typeof RoutePointSchema>

export const RouteSchema = z.object({
  id: z.string(),
  title: z.string(),
  mood: MoodSchema.nullable(),
  status: z.enum(['draft', 'active', 'completed']),
  points: z.array(RoutePointSchema),
})
export type Route = z.infer<typeof RouteSchema>

export const BuildRouteInputSchema = z.object({
  mood: MoodSchema.optional(),
  // если не передан — берём все лайкнутые места пользователя
  placeIds: z.array(z.string()).optional(),
})
export type BuildRouteInput = z.infer<typeof BuildRouteInputSchema>

export const SLOT_TYPES = [
  'sport',
  'boardgames',
  'walk',
  'coworking',
  'photo',
] as const
export const SlotTypeSchema = z.enum(SLOT_TYPES)
export type SlotType = z.infer<typeof SlotTypeSchema>

export const SlotCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: SlotTypeSchema,
  placeName: z.string().nullable(),
  district: z.string().nullable(),
  startsAt: z.string(),
  minParticipants: z.number().int(),
  maxParticipants: z.number().int(),
  status: z.enum(['open', 'confirmed', 'canceled', 'done']),
  participantsCount: z.number().int(),
  joined: z.boolean(),
  isCreator: z.boolean(),
})
export type SlotCard = z.infer<typeof SlotCardSchema>

export const CreateSlotInputSchema = z.object({
  title: z.string().min(2).max(80),
  type: SlotTypeSchema,
  placeName: z.string().max(120).optional(),
  district: z.string().max(80).optional(),
  startsAt: z.string(), // ISO
  minParticipants: z.number().int().min(2).max(50).default(2),
  maxParticipants: z.number().int().min(2).max(100).default(10),
})
export type CreateSlotInput = z.infer<typeof CreateSlotInputSchema>

export const AuthInputSchema = z.object({
  initData: z.string(), // Telegram WebApp.initData
})
export type AuthInput = z.infer<typeof AuthInputSchema>

export const EventCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  startsAt: z.string(), // ISO
  district: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
})
export type EventCard = z.infer<typeof EventCardSchema>

export const EventsQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
export type EventsQuery = z.infer<typeof EventsQuerySchema>

export const AchievementCardSchema = z.object({
  key: z.string(),
  title: z.string(),
  level: z.string(),
  earnedAt: z.string().nullable(), // null = ещё не получена
})
export type AchievementCard = z.infer<typeof AchievementCardSchema>

export const ProfileSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  username: z.string().nullable(),
  xp: z.number().int(),
  likedCount: z.number().int(),
  routesCount: z.number().int(),
  achievements: z.array(AchievementCardSchema),
})
export type Profile = z.infer<typeof ProfileSchema>

export const AuthResultSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    telegramId: z.string(),
    firstName: z.string().nullable(),
    username: z.string().nullable(),
    xp: z.number().int(),
  }),
})
export type AuthResult = z.infer<typeof AuthResultSchema>

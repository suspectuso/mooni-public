/**
 * Чистая (детерминированная) логика скоринга мест для колоды свайпа.
 * Вынесена из FeedService ради тестируемости — без Math.random и БД.
 */

export interface ScorableCandidate {
  id: string
  tags: string[]
  moodTags: string[]
}

export interface ScoreContext {
  mood?: string
  interestTags: string[]
  seenCounts: Record<string, number>
  lastSeenMap: Record<string, string>
  now: number
  cooldownMs: number
}

/** Детерминированная часть скоринга (рандом добавляется отдельно в сервисе). */
export function scorePlace(c: ScorableCandidate, ctx: ScoreContext): number {
  let score = 0

  // совпадение настроения
  if (ctx.mood && c.moodTags.includes(ctx.mood)) score += 20

  // совпадение интересов пользователя с тегами места
  const overlap = c.tags.filter((t) => ctx.interestTags.includes(t)).length
  score += overlap * 6

  // штраф за частоту показа
  const seen = ctx.seenCounts[c.id] ?? 0
  if (seen === 1) score -= 8
  else if (seen === 2) score -= 20
  else if (seen >= 3) score -= 100

  // cooldown на недавно виденные
  const last = ctx.lastSeenMap[c.id]
  if (last && ctx.now - new Date(last).getTime() < ctx.cooldownMs) score -= 60

  return score
}

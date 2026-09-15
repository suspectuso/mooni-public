/**
 * «Городской уровень доверия» — растёт с активностью (xp). Чем выше уровень,
 * тем больше секретных мест открывается в колоде. Чистая функция (без БД).
 */

// порог xp для входа на уровень N (индекс = уровень-1)
const THRESHOLDS = [0, 30, 80, 150, 250, 400]

export function cityLevel(xp: number): number {
  let level = 1
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (xp >= THRESHOLDS[i]) level = i + 1
  }
  return level
}

/** Сколько xp до следующего уровня (0 — максимум достигнут). */
export function xpToNext(xp: number): number {
  const next = THRESHOLDS.find((t) => t > xp)
  return next === undefined ? 0 : next - xp
}

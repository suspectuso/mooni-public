/**
 * Сезоны Mooni (fichi_i_mehaniki): каждые 3 месяца — новый сезон с набором ачивок/челленджей.
 * Чистая логика — определение текущего сезона по дате.
 */

export interface Season {
  key: string
  title: string
  emoji: string
}

const WINTER: Season = { key: 'winter', title: 'Зимний Питер', emoji: '❄️' }
const SPRING: Season = { key: 'spring', title: 'Весенний Питер', emoji: '🌸' }
const WHITE_NIGHTS: Season = {
  key: 'white_nights',
  title: 'Белые ночи',
  emoji: '🌃',
}
const AUTUMN: Season = { key: 'autumn', title: 'Золотая осень', emoji: '🍂' }

/** Текущий сезон по месяцу (0–11). Дек–Фев зима, Мар–Май весна, Июн–Авг белые ночи, Сен–Ноя осень. */
export function currentSeason(date = new Date()): Season {
  const m = date.getMonth()
  if (m === 11 || m <= 1) return WINTER
  if (m <= 4) return SPRING
  if (m <= 7) return WHITE_NIGHTS
  return AUTUMN
}

/**
 * Чистая логика фолбэка сборки маршрута — без LLM/сети, тестируемая.
 */

export interface GeoPlace {
  id: string
  lng?: number | null
}

/** Гео-сортировка маршрута: с запада на восток (по долготе). */
export function geoOrder<T extends GeoPlace>(places: T[]): T[] {
  return [...places].sort((a, b) => (a.lng ?? 0) - (b.lng ?? 0))
}

const TITLE_BY_MOOD: Record<string, string> = {
  recharge: 'Маршрут на перезагрузку',
  inspiration: 'Маршрут за вдохновением',
  social: 'Маршрут к людям',
  solitude: 'Маршрут для одного',
  anxious: 'Спокойный маршрут',
  romance: 'Романтический маршрут',
  active: 'Активный маршрут',
}

/** Заголовок маршрута по настроению (с фолбэком). */
export function defaultTitle(mood?: string): string {
  return (mood && TITLE_BY_MOOD[mood]) || 'Твой маршрут по Питеру'
}

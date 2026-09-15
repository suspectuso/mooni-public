/**
 * Грубое извлечение настроения из распознанной речи (голосовой запрос маршрута).
 * Ключевые слова → mood-ключ (как в MOOD_QUERY). Чистая функция.
 */
const RULES: { mood: string; words: string[] }[] = [
  {
    mood: 'recharge',
    words: ['устал', 'отдохн', 'перезагруз', 'выгор', 'расслаб'],
  },
  {
    mood: 'romance',
    words: ['свидан', 'романт', 'вдвоём', 'девушк', 'парн', 'закат'],
  },
  {
    mood: 'inspiration',
    words: ['вдохнов', 'искусств', 'красот', 'муз', 'творч'],
  },
  {
    mood: 'social',
    words: ['движ', 'тусов', 'компан', 'весел', 'друз', 'вечеринк'],
  },
  {
    mood: 'solitude',
    words: ['один', 'одиночеств', 'тишин', 'спокойн уголок'],
  },
  { mood: 'anxious', words: ['тревож', 'спокой', 'умиротвор', 'нерв'] },
  {
    mood: 'active',
    words: ['спорт', 'актив', 'энерг', 'побег', 'прогул', 'двигат'],
  },
]

export function parseMood(text: string): string | null {
  const t = text.toLowerCase()
  for (const r of RULES) {
    if (r.words.some((w) => t.includes(w))) return r.mood
  }
  return null
}

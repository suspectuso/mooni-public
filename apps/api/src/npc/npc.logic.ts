/**
 * Реплики 2D-проводника «Муни» по контексту (из arhitektura: content & storytelling / npc_phrases).
 * Чистая логика — без БД, тестируемая.
 */

export type NpcContext =
  | 'greeting'
  | 'mood'
  | 'route_built'
  | 'achievement'
  | 'idle'

const GREETINGS = [
  'Привет! Я Муни. Куда сегодня двинем по Питеру?',
  'Йо! Готов собрать тебе маршрут под настроение.',
  'Рад видеть! Свайпни пару мест — а я придумаю прогулку.',
]

const BY_MOOD: Record<string, string[]> = {
  recharge: [
    'Устал? Найдём тихий двор и кофе.',
    'Давай перезагрузимся у воды.',
  ],
  inspiration: ['Поймаем вдохновение — крыши и искусство ждут.'],
  social: ['Хочешь к людям? Есть движ и компании рядом.'],
  solitude: ['Иногда лучший спутник — тишина. Соберу маршрут для одного.'],
  anxious: ['Дыши. Поведу тебя спокойными местами.'],
  romance: ['Для двоих? Набережные и закаты — моя специальность.'],
  active: ['Энергия есть — погнали, где движение!'],
}

const ROUTE_BUILT = [
  'Маршрут готов! Поехали по точкам ✨',
  'Собрал лучшее — листай и в путь.',
]

const ACHIEVEMENT = [
  'Новая ачивка! Город открывается тебе 🔓',
  'Красава! Это пополнит твой альбом.',
]

const IDLE = [
  'Ткни на меня, если заскучал.',
  'Питер большой — а я знаю короткие пути.',
]

/** Банк реплик под контекст (и настроение для context=mood). */
export function phrasesFor(context: NpcContext, mood?: string): string[] {
  switch (context) {
    case 'greeting':
      return GREETINGS
    case 'mood':
      return (mood && BY_MOOD[mood]) || GREETINGS
    case 'route_built':
      return ROUTE_BUILT
    case 'achievement':
      return ACHIEVEMENT
    default:
      return IDLE
  }
}

/** Выбор одной реплики (rnd для детерминизма в тестах). */
export function npcPhrase(
  context: NpcContext,
  mood?: string,
  rnd: () => number = Math.random,
): string {
  const bank = phrasesFor(context, mood)
  return bank[Math.floor(rnd() * bank.length)] ?? bank[0]
}

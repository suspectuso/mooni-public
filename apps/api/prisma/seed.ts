import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { slug: 'cafe', title: 'Кафе' },
  { slug: 'park', title: 'Парк' },
  { slug: 'gallery', title: 'Галерея' },
  { slug: 'viewpoint', title: 'Видовая точка' },
  { slug: 'coworking', title: 'Коворкинг' },
  { slug: 'bar', title: 'Бар' },
  { slug: 'museum', title: 'Музей' },
]

// Mood-теги: recharge | inspiration | social | solitude | anxious | romance | active
const places: Array<{
  name: string
  description: string
  category: string
  district: string
  lat: number
  lng: number
  tags: string[]
  moodTags: string[]
  priceLevel: number
}> = [
  {
    name: 'Новая Голландия',
    description: 'Остров-парк с лужайками, кофейнями и видом на воду.',
    category: 'park',
    district: 'Адмиралтейский',
    lat: 59.929,
    lng: 30.288,
    tags: ['набережная', 'кофе', 'прогулка', 'архитектура'],
    moodTags: ['recharge', 'social', 'inspiration'],
    priceLevel: 1,
  },
  {
    name: 'Севкабель Порт',
    description: 'Бывший завод у залива — выставки, маркеты, закаты над водой.',
    category: 'viewpoint',
    district: 'Василеостровский',
    lat: 59.928,
    lng: 30.232,
    tags: ['набережная', 'закат', 'искусство', 'движ'],
    moodTags: ['inspiration', 'social', 'active'],
    priceLevel: 1,
  },
  {
    name: 'Смена (кофейня)',
    description: 'Тихая спешелти-кофейня для работы и одиночных раздумий.',
    category: 'cafe',
    district: 'Центральный',
    lat: 59.927,
    lng: 30.36,
    tags: ['кофе', 'тишина', 'работа'],
    moodTags: ['solitude', 'recharge', 'anxious'],
    priceLevel: 2,
  },
  {
    name: 'Эрарта',
    description:
      'Музей современного искусства — огромный, можно бродить часами.',
    category: 'gallery',
    district: 'Василеостровский',
    lat: 59.929,
    lng: 30.225,
    tags: ['искусство', 'архитектура', 'вдохновение'],
    moodTags: ['inspiration', 'solitude'],
    priceLevel: 2,
  },
  {
    name: 'Крыша на Лофт Проджект Этажи',
    description: 'Городская крыша с панорамой центра.',
    category: 'viewpoint',
    district: 'Центральный',
    lat: 59.927,
    lng: 30.354,
    tags: ['крыша', 'панорама', 'закат', 'романтика'],
    moodTags: ['romance', 'inspiration'],
    priceLevel: 1,
  },
  {
    name: 'Юсуповский сад',
    description: 'Спокойный сад с прудом в центре — отдышаться от города.',
    category: 'park',
    district: 'Адмиралтейский',
    lat: 59.921,
    lng: 30.314,
    tags: ['тишина', 'прогулка', 'зелень'],
    moodTags: ['recharge', 'solitude', 'anxious'],
    priceLevel: 0,
  },
  {
    name: 'Бар «Цоколь»',
    description: 'Концерты и шумные вечера в подвале — для движа с людьми.',
    category: 'bar',
    district: 'Центральный',
    lat: 59.927,
    lng: 30.357,
    tags: ['музыка', 'движ', 'компания'],
    moodTags: ['social', 'active'],
    priceLevel: 2,
  },
  {
    name: 'Дворцовая набережная',
    description: 'Классическая прогулка вдоль Невы мимо Эрмитажа.',
    category: 'viewpoint',
    district: 'Центральный',
    lat: 59.942,
    lng: 30.314,
    tags: ['набережная', 'архитектура', 'романтика', 'прогулка'],
    moodTags: ['romance', 'inspiration', 'recharge'],
    priceLevel: 0,
  },
  {
    name: 'Площадь Искусств',
    description: 'Сквер у Русского музея — тихий уголок классики.',
    category: 'museum',
    district: 'Центральный',
    lat: 59.937,
    lng: 30.331,
    tags: ['искусство', 'архитектура', 'тишина'],
    moodTags: ['solitude', 'inspiration'],
    priceLevel: 1,
  },
  {
    name: 'Коворкинг «Практик»',
    description: 'Светлый коворкинг для продуктивного дня.',
    category: 'coworking',
    district: 'Петроградский',
    lat: 59.962,
    lng: 30.31,
    tags: ['работа', 'тишина', 'кофе'],
    moodTags: ['recharge', 'solitude'],
    priceLevel: 2,
  },
  {
    name: 'Парк 300-летия',
    description: 'Большой парк у залива — пробежки, ролики, ветер с воды.',
    category: 'park',
    district: 'Приморский',
    lat: 59.985,
    lng: 30.2,
    tags: ['спорт', 'набережная', 'движ'],
    moodTags: ['active', 'recharge'],
    priceLevel: 0,
  },
  {
    name: 'Книжный «Подписные издания»',
    description: 'Легендарный книжный с кафе — вдохновиться и зависнуть.',
    category: 'cafe',
    district: 'Центральный',
    lat: 59.936,
    lng: 30.349,
    tags: ['книги', 'кофе', 'вдохновение'],
    moodTags: ['inspiration', 'solitude', 'recharge'],
    priceLevel: 1,
  },
]

// Реальные фото мест (Wikimedia Commons, свободная лицензия). Остальные — picsum-фолбэк.
const photoMap: Record<string, string> = {
  'Новая Голландия':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Spb_06-2017_img33_New_Holland.jpg/960px-Spb_06-2017_img33_New_Holland.jpg',
  'Севкабель Порт':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sevkabel.jpg/960px-Sevkabel.jpg',
  Эрарта:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Muziy_SPb_2010_3180.jpg/960px-Muziy_SPb_2010_3180.jpg',
  'Юсуповский сад':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Yusupovsky-0262.jpg/960px-Yusupovsky-0262.jpg',
  'Дворцовая набережная':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Admiralty_1_Island.jpg/960px-Admiralty_1_Island.jpg',
  'Книжный «Подписные издания»':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/%D0%9B%D0%B8%D1%82%D0%B5%D0%B9%D0%BD%D1%8B%D0%B9_57_04.jpg/960px-%D0%9B%D0%B8%D1%82%D0%B5%D0%B9%D0%BD%D1%8B%D0%B9_57_04.jpg',
}

// доп. реальные места СПб (фото — Wikimedia Commons, свободная лицензия)
Object.assign(photoMap, {
  'Площадь Искусств':
    'https://upload.wikimedia.org/wikipedia/commons/4/49/Spb_06-2017_img22_Arts_Square.jpg',
  'Летний сад':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/%D0%92%D1%85%D0%BE%D0%B4_%D0%B2_%D0%9B%D0%B5%D1%82%D0%BD%D0%B8%D0%B9_%D1%81%D0%B0%D0%B4.jpg/960px-%D0%92%D1%85%D0%BE%D0%B4_%D0%B2_%D0%9B%D0%B5%D1%82%D0%BD%D0%B8%D0%B9_%D1%81%D0%B0%D0%B4.jpg',
  'Михайловский замок':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/RUS-2016-Aerial-SPB-St_Michael%27s_Castle.jpg/960px-RUS-2016-Aerial-SPB-St_Michael%27s_Castle.jpg',
  'Смольный собор':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/%D0%A1%D0%BC%D0%BE%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_2.jpg/960px-%D0%A1%D0%BC%D0%BE%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_2.jpg',
  'Исаакиевский собор':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Saint_Isaac%27s_Cathedral_in_SPB.jpeg/960px-Saint_Isaac%27s_Cathedral_in_SPB.jpeg',
  'Казанский собор':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Kazan_Cathedral_Saint_Petersburg.jpg/960px-Kazan_Cathedral_Saint_Petersburg.jpg',
  'Петропавловская крепость':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/RUS-2016-Aerial-SPB-Peter_and_Paul_Fortress_02.jpg/960px-RUS-2016-Aerial-SPB-Peter_and_Paul_Fortress_02.jpg',
  'Марсово поле':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/RUS-2016-Aerial-SPB-Field_of_Mars.jpg/960px-RUS-2016-Aerial-SPB-Field_of_Mars.jpg',
  'Таврический сад':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Tauride_garden_%28Spb%29_Bridge_lake_obelisk.jpg/960px-Tauride_garden_%28Spb%29_Bridge_lake_obelisk.jpg',
  'Александровский парк':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Monument_to_torpedo_boat_%22Stereguschiy_Sain_Petersburg.jpg/960px-Monument_to_torpedo_boat_%22Stereguschiy_Sain_Petersburg.jpg',
  'Елагин остров':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Spb_06-2017_img38_Elagin_Island.jpg/960px-Spb_06-2017_img38_Elagin_Island.jpg',
  'Ботанический сад Петра Великого':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Spb_Aptekarsky_Island_Botanical_Garden_asv2019-09_img1.jpg/960px-Spb_Aptekarsky_Island_Botanical_Garden_asv2019-09_img1.jpg',
  'Лахта Центр':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/%D0%9B%D0%B0%D1%85%D1%82%D0%B0_%D1%86%D0%B5%D0%BD%D1%82%D1%80_2021.jpg/960px-%D0%9B%D0%B0%D1%85%D1%82%D0%B0_%D1%86%D0%B5%D0%BD%D1%82%D1%80_2021.jpg',
  'Зенит-Арена':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Spb_06-2017_img40_Krestovsky_Stadium_%28cropped%29.jpg/960px-Spb_06-2017_img40_Krestovsky_Stadium_%28cropped%29.jpg',
  'Летний дворец Петра I':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Summer_Palace_of_Peter_I.jpg/960px-Summer_Palace_of_Peter_I.jpg',
  'Аничков мост':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Anichkov_Bridge_SPB_%28img1%29.jpg/960px-Anichkov_Bridge_SPB_%28img1%29.jpg',
})
places.push(
  {
    name: 'Летний сад',
    description: 'Старейший сад города со скульптурами и аллеями.',
    category: 'park',
    district: 'Центральный',
    lat: 59.945,
    lng: 30.336,
    tags: ['прогулка', 'скульптуры', 'тишина'],
    moodTags: ['recharge', 'solitude', 'romance'],
    priceLevel: 0,
  },
  {
    name: 'Михайловский замок',
    description: 'Замок Павла I со рвами — мрачная романтика.',
    category: 'museum',
    district: 'Центральный',
    lat: 59.94,
    lng: 30.338,
    tags: ['архитектура', 'история', 'искусство'],
    moodTags: ['inspiration', 'solitude'],
    priceLevel: 1,
  },
  {
    name: 'Смольный собор',
    description: 'Бело-голубое барокко Растрелли, смотровая на звоннице.',
    category: 'viewpoint',
    district: 'Центральный',
    lat: 59.948,
    lng: 30.396,
    tags: ['архитектура', 'панорама', 'барокко'],
    moodTags: ['inspiration', 'romance'],
    priceLevel: 1,
  },
  {
    name: 'Исаакиевский собор',
    description: 'Колоннада с лучшей панорамой центра.',
    category: 'viewpoint',
    district: 'Адмиралтейский',
    lat: 59.934,
    lng: 30.306,
    tags: ['панорама', 'архитектура', 'закат'],
    moodTags: ['inspiration', 'romance', 'active'],
    priceLevel: 1,
  },
  {
    name: 'Казанский собор',
    description: 'Колоннада на Невском, тихо внутри.',
    category: 'museum',
    district: 'Центральный',
    lat: 59.934,
    lng: 30.324,
    tags: ['архитектура', 'история', 'тишина'],
    moodTags: ['solitude', 'inspiration'],
    priceLevel: 0,
  },
  {
    name: 'Петропавловская крепость',
    description: 'Сердце города, пляж у стен и полуденный выстрел.',
    category: 'museum',
    district: 'Петроградский',
    lat: 59.95,
    lng: 30.316,
    tags: ['история', 'набережная', 'пляж'],
    moodTags: ['inspiration', 'social', 'recharge'],
    priceLevel: 1,
  },
  {
    name: 'Марсово поле',
    description: 'Большой газон с вечным огнём — полежать на траве.',
    category: 'park',
    district: 'Центральный',
    lat: 59.944,
    lng: 30.332,
    tags: ['прогулка', 'зелень', 'тишина'],
    moodTags: ['recharge', 'social'],
    priceLevel: 0,
  },
  {
    name: 'Таврический сад',
    description: 'Уютный пейзажный парк с прудами.',
    category: 'park',
    district: 'Центральный',
    lat: 59.948,
    lng: 30.375,
    tags: ['прогулка', 'зелень', 'тишина'],
    moodTags: ['recharge', 'solitude', 'anxious'],
    priceLevel: 0,
  },
  {
    name: 'Александровский парк',
    description: 'Парк у крепости — фонтаны и мини-город.',
    category: 'park',
    district: 'Петроградский',
    lat: 59.955,
    lng: 30.315,
    tags: ['прогулка', 'фонтаны', 'семья'],
    moodTags: ['recharge', 'social'],
    priceLevel: 0,
  },
  {
    name: 'Елагин остров',
    description: 'ЦПКиО: пруды, белки, ролики и закаты.',
    category: 'park',
    district: 'Петроградский',
    lat: 59.98,
    lng: 30.26,
    tags: ['природа', 'спорт', 'закат'],
    moodTags: ['recharge', 'active', 'romance'],
    priceLevel: 0,
  },
  {
    name: 'Ботанический сад Петра Великого',
    description: 'Оранжереи и тропики посреди города.',
    category: 'park',
    district: 'Петроградский',
    lat: 59.972,
    lng: 30.323,
    tags: ['природа', 'оранжерея', 'тишина'],
    moodTags: ['recharge', 'inspiration', 'solitude'],
    priceLevel: 1,
  },
  {
    name: 'Лахта Центр',
    description: 'Самый высокий небоскрёб Европы у залива.',
    category: 'viewpoint',
    district: 'Приморский',
    lat: 59.987,
    lng: 30.178,
    tags: ['панорама', 'закат', 'современное'],
    moodTags: ['inspiration', 'active'],
    priceLevel: 1,
  },
  {
    name: 'Зенит-Арена',
    description: 'Стадион на Крестовском, матчи и виды на залив.',
    category: 'viewpoint',
    district: 'Петроградский',
    lat: 59.973,
    lng: 30.221,
    tags: ['спорт', 'движ', 'залив'],
    moodTags: ['active', 'social'],
    priceLevel: 1,
  },
  {
    name: 'Летний дворец Петра I',
    description: 'Скромный дворец Петра в Летнем саду.',
    category: 'museum',
    district: 'Центральный',
    lat: 59.946,
    lng: 30.339,
    tags: ['история', 'архитектура'],
    moodTags: ['solitude', 'inspiration'],
    priceLevel: 1,
  },
  {
    name: 'Аничков мост',
    description: 'Кони Клодта на Фонтанке — открыточный вид.',
    category: 'viewpoint',
    district: 'Центральный',
    lat: 59.933,
    lng: 30.343,
    tags: ['набережная', 'скульптуры', 'романтика'],
    moodTags: ['romance', 'inspiration'],
    priceLevel: 0,
  },
)

const achievements = [
  {
    key: 'first_swipe',
    title: 'Первый свайп',
    level: 'base',
    rule: { type: 'swipe_count', value: 1 },
  },
  {
    key: 'first_route',
    title: 'Первый маршрут',
    level: 'base',
    rule: { type: 'route_count', value: 1 },
  },
  {
    key: 'explorer_3_districts',
    title: 'Исследователь Петербурга',
    level: 'advanced',
    rule: { type: 'districts_visited', value: 3 },
  },
  {
    key: 'wn_white_night_walk',
    title: 'Прогулка в белую ночь',
    level: 'advanced',
    rule: { type: 'route_after', value: 22 },
    season: 'white_nights',
  },
  {
    key: 'wn_bridges',
    title: 'Развод мостов',
    level: 'epic',
    rule: { type: 'visit', value: 'bridge' },
    season: 'white_nights',
  },
  {
    key: 'winter_warm_cup',
    title: 'Согреться какао',
    level: 'base',
    rule: { type: 'visit_category', value: 'cafe' },
    season: 'winter',
  },
  {
    key: 'autumn_golden_park',
    title: 'Золотой парк',
    level: 'base',
    rule: { type: 'visit_category', value: 'park' },
    season: 'autumn',
  },
  {
    key: 'spring_first_sun',
    title: 'Первое солнце',
    level: 'base',
    rule: { type: 'visit_category', value: 'viewpoint' },
    season: 'spring',
  },
]

async function main() {
  const catMap = new Map<string, string>()
  for (const c of categories) {
    const cat = await prisma.placeCategory.upsert({
      where: { slug: c.slug },
      update: { title: c.title },
      create: c,
    })
    catMap.set(c.slug, cat.id)
  }

  let placeCount = 0
  for (const p of places) {
    const categoryId = catMap.get(p.category)
    if (!categoryId) continue
    // у мест нет натурального уникального ключа в схеме → дедуп по имени вручную
    const existing = await prisma.place.findFirst({ where: { name: p.name } })
    const data = {
      name: p.name,
      description: p.description,
      categoryId,
      district: p.district,
      lat: p.lat,
      lng: p.lng,
      tags: p.tags,
      moodTags: p.moodTags,
      // реальное фото из Wikimedia, иначе стабильный плейсхолдер
      photos: [
        photoMap[p.name] ??
          `https://picsum.photos/seed/mooni-${encodeURIComponent(p.name)}/800/1000`,
      ],
      priceLevel: p.priceLevel,
      source: 'seed',
    }
    if (existing) {
      await prisma.place.update({ where: { id: existing.id }, data })
    } else {
      await prisma.place.create({ data })
    }
    placeCount++
  }

  // секретные места — открываются на городском уровне доверия (cityLevel)
  const secretPlaces: Record<string, number> = {
    'Крыша на Лофт Проджект Этажи': 3,
    'Новая Голландия': 2,
  }
  for (const [name, minLevel] of Object.entries(secretPlaces)) {
    await prisma.place.updateMany({ where: { name }, data: { minLevel } })
  }

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {
        title: a.title,
        level: a.level,
        rule: a.rule,
        season: (a as { season?: string }).season ?? null,
      },
      create: a,
    })
  }

  // события (афиша) — относительно текущей даты
  const day = 24 * 60 * 60 * 1000
  const events = [
    {
      title: 'Выставка современного искусства',
      category: 'выставка',
      district: 'Василеостровский',
      inDays: 2,
      lat: 59.929,
      lng: 30.225,
    },
    {
      title: 'Джаз-вечер на крыше',
      category: 'концерт',
      district: 'Центральный',
      inDays: 3,
      lat: 59.927,
      lng: 30.354,
    },
    {
      title: 'Лекция: история Петербурга',
      category: 'лекция',
      district: 'Центральный',
      inDays: 5,
      lat: 59.937,
      lng: 30.331,
    },
    {
      title: 'Квиз в баре',
      category: 'квиз',
      district: 'Центральный',
      inDays: 6,
      lat: 59.927,
      lng: 30.357,
    },
    {
      title: 'Фестиваль уличной еды',
      category: 'фестиваль',
      district: 'Василеостровский',
      inDays: 8,
      lat: 59.928,
      lng: 30.232,
    },
    {
      title: 'Маркет винила и книг',
      category: 'маркет',
      district: 'Центральный',
      inDays: 10,
      lat: 59.936,
      lng: 30.349,
    },
  ]
  // чистим старый сид-сет событий, чтобы не плодить дубли
  await prisma.event.deleteMany({ where: { source: 'seed' } })
  for (const e of events) {
    await prisma.event.create({
      data: {
        title: e.title,
        category: e.category,
        district: e.district,
        startsAt: new Date(Date.now() + e.inDays * day),
        lat: e.lat,
        lng: e.lng,
        source: 'seed',
      },
    })
  }

  // демо-пользователь для dev (telegramId 1)
  const demo = await prisma.user.upsert({
    where: { telegramId: BigInt(1) },
    update: {},
    create: {
      telegramId: BigInt(1),
      firstName: 'Demo',
      username: 'demo',
      interests: { create: [{ tag: 'кофе' }, { tag: 'искусство' }] },
    },
  })

  // демо-слоты (создатель — demo), чтобы экран коммьюнити не был пустым
  const slotSeeds = [
    {
      title: 'Баскетбол на Крестовском',
      type: 'sport',
      district: 'Петроградский',
      inDays: 1,
      min: 6,
      max: 10,
    },
    {
      title: 'Настолки в антикафе',
      type: 'boardgames',
      district: 'Центральный',
      inDays: 2,
      min: 3,
      max: 8,
    },
    {
      title: 'Прогулка по крышам на закате',
      type: 'walk',
      district: 'Центральный',
      inDays: 3,
      min: 2,
      max: 6,
    },
  ]
  await prisma.activitySlot.deleteMany({ where: { creatorId: demo.id } })
  for (const s of slotSeeds) {
    await prisma.activitySlot.create({
      data: {
        creatorId: demo.id,
        title: s.title,
        type: s.type,
        district: s.district,
        startsAt: new Date(Date.now() + s.inDays * day),
        minParticipants: s.min,
        maxParticipants: s.max,
        participants: { create: { userId: demo.id } },
      },
    })
  }

  // партнёры + QR (v3 susCoin)
  const partnerSeeds = [
    {
      name: 'Кофейня «Смена»',
      category: 'cafe',
      district: 'Центральный',
      code: 'MOONI-SMENA',
      coins: 15,
      xp: 5,
    },
    {
      name: 'Севкабель Порт',
      category: 'viewpoint',
      district: 'Василеостровский',
      code: 'MOONI-SEVKABEL',
      coins: 20,
      xp: 8,
    },
  ]
  for (const ps of partnerSeeds) {
    const existing = await prisma.partner.findFirst({
      where: { name: ps.name },
    })
    const partner =
      existing ??
      (await prisma.partner.create({
        data: { name: ps.name, category: ps.category, district: ps.district },
      }))
    await prisma.qrCode.upsert({
      where: { code: ps.code },
      update: { rewardCoins: ps.coins, rewardXp: ps.xp, partnerId: partner.id },
      create: {
        code: ps.code,
        partnerId: partner.id,
        rewardCoins: ps.coins,
        rewardXp: ps.xp,
      },
    })
  }

  // маркет впечатлений (v3)
  const experiences = [
    {
      title: 'SUP-прогулка по каналам',
      description: 'Сапсёрфинг по рекам и каналам центра на закате.',
      category: 'актив',
      price: 2500,
    },
    {
      title: 'Фотосессия на крышах',
      description: 'Часовая съёмка с видами Петербурга + 15 обработанных фото.',
      category: 'фото',
      price: 4000,
    },
    {
      title: 'Мастер-класс по гончарному делу',
      description: 'Слепи свою чашку за вечер, материалы включены.',
      category: 'крафт',
      price: 3000,
    },
    {
      title: 'Гастро-ужин у Невы',
      description: 'Сет из 5 блюд от локального шефа с видом на воду.',
      category: 'гастро',
      price: 5500,
    },
  ]
  for (const e of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { title: e.title },
    })
    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data: e })
    } else {
      await prisma.experience.create({ data: e })
    }
  }

  // Каталог локальных услуг (ниша, которой нет в агрегаторах)
  const services = [
    {
      name: 'Гид по крышам Петроградки',
      type: 'rooftop',
      description: 'Легальные крыши с видом на город, закаты и истории.',
      priceFrom: 1500,
      contact: '@spb_rooftops',
    },
    {
      name: 'Фотограф для прогулки',
      type: 'photographer',
      description: 'Атмосферная съёмка во время маршрута по городу.',
      priceFrom: 3000,
      contact: '@spb_photowalk',
    },
    {
      name: 'Авторская экскурсия «Дворы-колодцы»',
      type: 'excursion',
      description: 'Спрятанные дворы и парадные центра с гидом.',
      priceFrom: 800,
      contact: '@spb_yards',
    },
    {
      name: 'Аренда лофта для вечеринки',
      type: 'venue',
      description: 'Площадки на 10–40 человек для слотов и праздников.',
      priceFrom: 2000,
      contact: '@spb_lofts',
    },
  ]
  for (const s of services) {
    const existing = await prisma.localService.findFirst({
      where: { name: s.name },
    })
    if (!existing) await prisma.localService.create({ data: s })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

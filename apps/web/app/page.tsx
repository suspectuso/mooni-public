'use client'

/**
 * Главный экран Луми — канон C2 (тёплый светлый + бирюза-акцент).
 * База — каркас Match, перестилена под дизайн-систему Луми (см. dnevnik/.../дизайн-система-луми.md).
 * Прежний хаб Match сохранён в git-истории.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getUserId } from '@/utils/telegram'
import {
	Bell,
	Sparkles,
	Sun,
	ArrowUpRight,
	Heart,
	Coffee,
	CalendarDays,
	Ticket,
	Moon,
	UsersRound,
	Compass,
	Map as MapIcon,
	Star,
	Home,
	User,
	ChevronRight,
} from 'lucide-react'

import {
	T,
	page,
	scrollArea,
	header,
	logoMark,
	bellBtn,
	artPanel,
	artCaption,
	bubble,
	moodScroll,
	moodPill,
	weatherCard,
	bigBtn,
	tileGrid,
	tile,
	tileActive,
	ideaCard,
	ideaHead,
	ctaChip,
	carouselHead,
	carouselRow,
	miniCard,
	bookChip,
	wideCta,
	ctaRound,
	seasonBanner,
	bottomNav,
} from './home.styles'

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), {
	ssr: false,
})

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

const MOODS = [
	{ key: 'social', label: 'Random Coffee', Icon: Coffee, color: T.tealDeep },
	{ key: 'romance', label: 'Свидание', Icon: Heart, color: T.rose },
	{ key: 'inspiration', label: 'Вдохновение', Icon: Sparkles, color: T.lavender },
	{ key: 'recharge', label: 'Устал', Icon: Moon, color: T.sky },
	{ key: 'social2', label: 'Найти кого-то', Icon: UsersRound, color: T.amber },
	{ key: 'active', label: 'Движ', Icon: Compass, color: T.tealDeep },
]

const WEATHER_LABEL: Record<string, string> = {
	ясно: 'ясно',
	облачно: 'облачно',
	дождь: 'дождь',
	снег: 'снег',
	туман: 'туман',
	гроза: 'гроза',
}

interface CityItem {
	id: string
	kind?: string
	title: string
	subtitle?: string | null
}
interface Exp {
	id: string
	title: string
	price: number
	imageUrl?: string | null
}

export default function HomeScreen() {
	const router = useRouter()
	const [weather, setWeather] = useState<{
		weather: string
		tempC: number | null
		timeOfDay: string
	} | null>(null)
	const [city, setCity] = useState<CityItem[]>([])
	const [exps, setExps] = useState<Exp[]>([])
	const [coffee, setCoffee] = useState<string>('none')
	const [season, setSeason] = useState<{
		title?: string
		earned?: number
		total?: number
	} | null>(null)

	// На главной body должен быть тёплым (а не тёмным #121212 от Match),
	// иначе за плавающим меню/по краям просвечивает тёмный прямоугольник.
	useEffect(() => {
		const prev = document.body.style.background
		document.body.style.background = 'linear-gradient(180deg,#FFF1E6,#E4F8F3)'
		return () => {
			document.body.style.background = prev
		}
	}, [])

	useEffect(() => {
		const uid = getUserId()
		const j = (r: Response) => r.json()
		fetch(`${API}/city/context`).then(j).then(setWeather).catch(() => {})
		fetch(`${API}/city/feed`)
			.then(j)
			.then((d) => setCity(Array.isArray(d) ? d.slice(0, 10) : []))
			.catch(() => {})
		fetch(`${API}/experiences`)
			.then(j)
			.then((d) => setExps(Array.isArray(d) ? d : []))
			.catch(() => {})
		fetch(`${API}/coffee/status?userId=${uid}`)
			.then(j)
			.then((d) => setCoffee(d?.status ?? 'none'))
			.catch(() => {})
		fetch(`${API}/season/current?userId=${uid}`)
			.then(j)
			.then((d) =>
				setSeason({
					title: d?.title,
					earned: d?.challenges?.filter((c: { earned?: boolean }) => c.earned)
						.length,
					total: d?.challenges?.length,
				}),
			)
			.catch(() => {})
	}, [])

	const pickMood = (mood: string) => {
		const m = mood === 'social2' ? 'social' : mood
		if (mood === 'social') {
			router.push('/coffee')
			return
		}
		localStorage.setItem('mooniMood', m)
		router.push('/networking')
	}

	const w = weather
	const weatherText = w
		? `Сегодня · ${w.tempC != null ? Math.round(w.tempC) + '°' : ''} · ${
				WEATHER_LABEL[w.weather] ?? 'в городе'
			}`
		: 'Сегодня в городе'

	return (
		<div style={page}>
			<div style={scrollArea}>
			{/* 1. Хедер */}
			<header style={header}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
					<div style={logoMark}>
						<Sparkles size={18} color="#fff" strokeWidth={2.4} />
					</div>
					<span style={{ fontFamily: T.head, fontSize: 23, fontWeight: 600, color: T.text }}>
						Луми
					</span>
				</div>
				<Link href="/missions" style={bellBtn} aria-label="Уведомления">
					<Bell size={19} color={T.text} strokeWidth={2} />
				</Link>
			</header>

			{/* 2. Геро */}
			<section style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
				{/* ЛЕВО */}
				<div style={{ width: 172, flexShrink: 0 }}>
					<div style={artPanel}>
						<GuideArt />
						<span style={artCaption}>Луми</span>
						{/* реплика Луми — поверх аватара */}
						<div style={bubble}>Как ты? 💬</div>
					</div>
					<div style={moodScroll}>
						{MOODS.map((m) => (
							<button key={m.key} style={moodPill} onClick={() => pickMood(m.key)}>
								<m.Icon size={16} color={m.color} strokeWidth={2.2} />
								<span>{m.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* ПРАВО */}
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
					<div style={weatherCard}>
						<Sun size={22} color={T.amber} strokeWidth={2.2} />
						<span style={{ fontWeight: 700, color: T.text }}>{weatherText}</span>
					</div>

					<div style={{ display: 'flex', gap: 9 }}>
						<button style={bigBtn} onClick={() => router.push('/scenarios')}>
							<ArrowUpRight size={18} color={T.tealDeep} strokeWidth={2.4} />
							Куда пойти
						</button>
						<button style={bigBtn} onClick={() => pickMood('romance')}>
							<Heart size={18} color={T.rose} strokeWidth={2.4} />
							Свидание
						</button>
					</div>

					<div style={tileGrid}>
						<Tile Icon={CalendarDays} color={T.sky} label="События" href="/city" />
						<Tile Icon={Ticket} color={T.amber} label="Впечатления" href="/education" />
						<Tile
							Icon={Coffee}
							color={T.tealDeep}
							label="Random Coffee"
							href="/coffee"
							active={coffee !== 'matched'}
						/>
						<Tile Icon={Moon} color={T.lavender} label="Ночной город" onClick={() => pickMood('active')} />
						<Tile Icon={UsersRound} color={T.rose} label="С друзьями" href="/sprints" />
						<Tile Icon={Star} color={T.tealDeep} label="Сезон" href="/season" />
					</div>
				</div>
			</section>

			{/* 3. Идея на вечер */}
			<Link href="/networking/likes" style={{ textDecoration: 'none' }}>
				<div style={ideaCard}>
					<div style={ideaHead}>
						<span style={{ fontFamily: T.head, fontWeight: 600, fontSize: 17, color: T.text }}>
							Идея на вечер
						</span>
						<ChevronRight size={18} color={T.muted} />
					</div>
					<div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
						<div style={{ width: 132, height: 92, flexShrink: 0 }}>
							<RouteMap points={IDEA_POINTS} height={92} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 800, color: T.text, fontSize: 15 }}>
								Закатный маршрут по центру
							</div>
							<div style={{ color: T.muted, fontSize: 13, margin: '3px 0 10px' }}>
								Романтика · 2 ч · от 1800 ₽
							</div>
							<span style={ctaChip}>
								<UsersRound size={14} color={T.tealDeep} /> Компания через 17 мин
							</span>
						</div>
					</div>
				</div>
			</Link>

			{/* 4. Лента */}
			<Carousel title="Сейчас в городе">
				{(city.length ? city : PLACEHOLDER_CITY).map((c) => (
					<MiniCard
						key={c.id}
						title={c.title}
						sub={c.subtitle ?? c.kind ?? 'в городе'}
						accent={T.sky}
					/>
				))}
			</Carousel>

			<Carousel title="Необычный Питер">
				{(exps.length ? exps : PLACEHOLDER_EXP).map((e) => (
					<ExpCard key={e.id} title={e.title} price={e.price} />
				))}
			</Carousel>

			{/* Не один сегодня — широкая CTA */}
			<div style={wideCta} onClick={() => router.push('/coffee')}>
				<div>
					<div style={{ fontFamily: T.head, fontWeight: 600, fontSize: 16, color: T.tealInk }}>
						Не один сегодня?
					</div>
					<div style={{ color: T.tealDeep, fontSize: 13, fontWeight: 600 }}>
						{coffee === 'waiting'
							? 'Ищем тебе пару…'
							: coffee === 'matched'
								? 'Пара найдена — открой Кофе'
								: 'Random Coffee — найдём собеседника'}
					</div>
				</div>
				<div style={ctaRound}>
					<Coffee size={20} color="#fff" strokeWidth={2.2} />
				</div>
			</div>

			<Carousel title="Сборы рядом">
				{PLACEHOLDER_SLOTS.map((s, i) => (
					<MiniCard key={i} title={s.title} sub={s.sub} accent={T.rose} href="/sprints" />
				))}
			</Carousel>

			<Carousel title="Твой месяц">
				<MiniCard title="Альбом памяти" sub="твои выходы" accent={T.lavender} href="/memories" />
				<MiniCard title="Вайбы" sub="настроения месяца" accent={T.tealDeep} href="/vibes" />
				<MiniCard title="Миссии" sub="награды города" accent={T.amber} href="/missions" />
			</Carousel>

			{/* Сезон */}
			<Link href="/season" style={{ textDecoration: 'none' }}>
				<div style={seasonBanner}>
					<div>
						<div style={{ fontFamily: T.head, fontWeight: 600, fontSize: 16, color: T.tealInk }}>
							Сезон · {season?.title ?? 'Белые ночи'}
						</div>
						<div style={{ color: T.tealDeep, fontSize: 13, fontWeight: 600 }}>
							{season?.total
								? `Челленджи: ${season.earned ?? 0}/${season.total}`
								: 'Сезонные челленджи и награды'}
						</div>
					</div>
					<Star size={26} color={T.tealDeep} strokeWidth={2} />
				</div>
			</Link>
			</div>

			{/* 5. Нижнее меню — отдельная панель вне скролла (контент под неё не заходит) */}
			<nav style={bottomNav}>
				<NavItem Icon={Home} label="Главная" active />
				<NavItem Icon={MapIcon} label="Карта" href="/map" />
				<NavItem Icon={Ticket} label="Впечатления" href="/education" />
				<NavItem Icon={UsersRound} label="Сообщество" href="/coffee" />
				<NavItem Icon={User} label="Профиль" href="/tracker/profile" />
			</nav>
		</div>
	)
}

// под-компоненты

function GuideArt() {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'flex-end',
				justifyContent: 'center',
			}}
		>
			<GuideAvatar size={188} />
		</div>
	)
}

const GuideAvatar = dynamic(() => import('@/components/guide/GuideAvatar'), {
	ssr: false,
})

function Tile({
	Icon,
	color,
	label,
	href,
	onClick,
	active,
}: {
	Icon: typeof Coffee
	color: string
	label: string
	href?: string
	onClick?: () => void
	active?: boolean
}) {
	const inner = (
		<div style={{ ...tile, ...(active ? tileActive : {}) }}>
			<Icon size={20} color={active ? T.tealDeep : color} strokeWidth={2.2} />
			<span style={{ fontSize: 12, fontWeight: 700, color: active ? T.tealInk : T.text }}>
				{label}
			</span>
		</div>
	)
	if (href)
		return (
			<Link href={href} style={{ textDecoration: 'none' }}>
				{inner}
			</Link>
		)
	return (
		<button onClick={onClick} style={{ border: 'none', background: 'none', padding: 0 }}>
			{inner}
		</button>
	)
}

function Carousel({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div style={{ marginBottom: 18 }}>
			<div style={carouselHead}>{title}</div>
			<div style={carouselRow}>{children}</div>
		</div>
	)
}

function MiniCard({
	title,
	sub,
	accent,
	href,
}: {
	title: string
	sub: string
	accent: string
	href?: string
}) {
	const inner = (
		<div style={miniCard}>
			<div style={{ width: 34, height: 34, borderRadius: 10, background: accent + '22', marginBottom: 8 }} />
			<div style={{ fontWeight: 800, fontSize: 14, color: T.text, lineHeight: 1.2 }}>{title}</div>
			<div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</div>
		</div>
	)
	if (href)
		return (
			<Link href={href} style={{ textDecoration: 'none', flexShrink: 0 }}>
				{inner}
			</Link>
		)
	return inner
}

function ExpCard({ title, price }: { title: string; price: number }) {
	return (
		<div style={{ ...miniCard, width: 180 }}>
			<div
				style={{
					height: 86,
					borderRadius: 12,
					background: 'linear-gradient(135deg,#FBD0B6,#E4C3EE)',
					marginBottom: 8,
				}}
			/>
			<div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
				<span style={{ fontSize: 11, color: T.tealDeep, fontWeight: 700 }}>✓ проверено</span>
			</div>
			<div style={{ fontWeight: 800, fontSize: 14, color: T.text, lineHeight: 1.2 }}>{title}</div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
				<span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>от {price} ₽</span>
				<span style={bookChip}>Бронь</span>
			</div>
		</div>
	)
}

function NavItem({
	Icon,
	label,
	href,
	active,
}: {
	Icon: typeof Home
	label: string
	href?: string
	active?: boolean
}) {
	const c = active ? T.tealDeep : '#9aa0a6'
	const inner = (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 4,
				minHeight: 52,
				width: '100%',
				minWidth: 0,
			}}
		>
			<Icon size={22} color={c} strokeWidth={2.5} />
			<span
				style={{
					fontSize: 9.5,
					fontWeight: 700,
					color: c,
					lineHeight: 1,
					whiteSpace: 'nowrap',
					maxWidth: '100%',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
				}}
			>
				{label}
			</span>
		</div>
	)
	const slot: React.CSSProperties = {
		flex: 1,
		minWidth: 0,
		display: 'flex',
		textDecoration: 'none',
	}
	if (href)
		return (
			<Link href={href} style={slot}>
				{inner}
			</Link>
		)
	return <div style={slot}>{inner}</div>
}

// данные-заглушки и семплы
const IDEA_POINTS = [
	{ lat: 59.9398, lng: 30.3146, name: 'Дворцовая' },
	{ lat: 59.9343, lng: 30.3351, name: 'Летний сад' },
	{ lat: 59.9281, lng: 30.3128, name: 'Новая Голландия' },
]
const PLACEHOLDER_CITY: CityItem[] = [
	{ id: 'p1', title: 'Сбор на прогулку', subtitle: 'через 30 мин' },
	{ id: 'p2', title: 'Лекция в Севкабеле', subtitle: 'сегодня' },
	{ id: 'p3', title: 'Новое место', subtitle: 'кофейня' },
]
const PLACEHOLDER_EXP: Exp[] = [
	{ id: 'e1', title: 'Крыши Петроградки', price: 1500 },
	{ id: 'e2', title: 'Прогулка на сапах', price: 2500 },
]
const PLACEHOLDER_SLOTS = [
	{ title: 'Баскетбол', sub: 'нужно ещё 3' },
	{ title: 'Настолки', sub: 'нужно ещё 2' },
	{ title: 'Фотопрогулка', sub: 'нужно ещё 4' },
]


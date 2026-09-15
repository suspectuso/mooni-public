'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserId } from '@/utils/telegram'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

const PSYCHO = [
	{ key: 'introvert', label: 'Интроверт', emoji: '🌙' },
	{ key: 'extrovert', label: 'Экстраверт', emoji: '⚡' },
	{ key: 'seeker', label: 'Искатель', emoji: '🧭' },
]
const INTERESTS = [
	'гастро',
	'кофе',
	'архитектура',
	'искусство',
	'природа',
	'спорт',
	'ночная жизнь',
	'история',
	'музыка',
	'фото',
	'коворкинг',
	'романтика',
]

const RAINBOW =
	'linear-gradient(95deg,#ff6b9d 0%,#ffd56b 28%,#6bffb3 52%,#65fff7 72%,#a78bfa 100%)'

export default function OnboardingPage() {
	const router = useRouter()
	const [psychotype, setPsychotype] = useState<string | null>(null)
	const [interests, setInterests] = useState<string[]>([])
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		const userId = getUserId()
		fetch(`${API}/me/profile?userId=${userId}`)
			.then((r) => r.json())
			.then((p) => {
				if (p?.psychotype) setPsychotype(p.psychotype)
				if (Array.isArray(p?.interests)) setInterests(p.interests)
			})
			.catch(() => {})
	}, [])

	const toggle = (tag: string) =>
		setInterests((cur) =>
			cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
		)

	const save = async () => {
		setBusy(true)
		try {
			const userId = getUserId()
			await fetch(`${API}/me/profile?userId=${userId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ psychotype, interests }),
			})
			router.push('/networking')
		} finally {
			setBusy(false)
		}
	}

	return (
		<div style={wrap}>
			<div style={blobA} />
			<div style={blobB} />

			<div style={{ position: 'relative', zIndex: 1 }}>
				<div style={hello}>Привет 👋</div>
				<div style={lead}>
					Я Муни — твой проводник по Питеру. Настроим город под тебя.
				</div>

				<div style={section}>Кто ты по духу?</div>
				<div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
					{PSYCHO.map((p) => (
						<button
							key={p.key}
							onClick={() => setPsychotype(p.key)}
							style={{
								...psychoBtn,
								...(psychotype === p.key ? psychoActive : {}),
							}}
						>
							<div style={{ fontSize: 30 }}>{p.emoji}</div>
							{p.label}
						</button>
					))}
				</div>

				<div style={section}>Что любишь?</div>
				<div
					style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 34 }}
				>
					{INTERESTS.map((tag, i) => {
						const on = interests.includes(tag)
						return (
							<button
								key={tag}
								onClick={() => toggle(tag)}
								style={{
									...chip,
									...(on
										? {
												background: RAINBOW,
												color: '#121212',
												border: '1px solid transparent',
												fontWeight: 800,
												backgroundPosition: `${i * 12}% 50%`,
											}
										: {}),
								}}
							>
								{tag}
							</button>
						)
					})}
				</div>

				<button style={cta} disabled={busy} onClick={save}>
					{busy ? 'Сохраняем…' : 'Поехали →'}
				</button>
				<button style={skip} onClick={() => router.push('/networking')}>
					пропустить
				</button>
			</div>

			<style>{`@keyframes mooniFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-24px)}}`}</style>
		</div>
	)
}

const wrap: React.CSSProperties = {
	position: 'relative',
	minHeight: '100dvh',
	background: '#0e0e12',
	color: '#fcf9f7',
	maxWidth: 480,
	margin: '0 auto',
	padding: '40px 22px 48px',
	overflow: 'hidden',
}
const blobA: React.CSSProperties = {
	position: 'absolute',
	top: -90,
	right: -70,
	width: 280,
	height: 280,
	borderRadius: '50%',
	background: RAINBOW,
	filter: 'blur(70px)',
	opacity: 0.5,
	animation: 'mooniFloat 9s ease-in-out infinite',
}
const blobB: React.CSSProperties = {
	position: 'absolute',
	bottom: -110,
	left: -80,
	width: 260,
	height: 260,
	borderRadius: '50%',
	background: 'linear-gradient(95deg,#a78bfa,#65fff7,#6bffb3)',
	filter: 'blur(80px)',
	opacity: 0.4,
	animation: 'mooniFloat 11s ease-in-out infinite reverse',
}
const hello: React.CSSProperties = {
	fontSize: 46,
	fontWeight: 900,
	lineHeight: 1.05,
	background: RAINBOW,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	marginBottom: 14,
}
const lead: React.CSSProperties = {
	fontSize: 17,
	lineHeight: 1.45,
	color: 'rgba(252,249,247,0.75)',
	marginBottom: 36,
}
const section: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 700,
	letterSpacing: 0.5,
	color: 'rgba(252,249,247,0.45)',
	marginBottom: 12,
	textTransform: 'uppercase',
}
const psychoBtn: React.CSSProperties = {
	flex: 1,
	padding: '18px 8px',
	borderRadius: 20,
	border: '1px solid rgba(252,249,247,0.12)',
	background: 'rgba(255,255,255,0.03)',
	color: '#fcf9f7',
	fontSize: 14,
	fontWeight: 700,
	cursor: 'pointer',
}
const psychoActive: React.CSSProperties = {
	border: '2px solid #65fff7',
	background: 'rgba(101,255,247,0.12)',
}
const chip: React.CSSProperties = {
	padding: '11px 17px',
	borderRadius: 999,
	border: '1px solid rgba(252,249,247,0.18)',
	background: 'rgba(255,255,255,0.03)',
	color: '#fcf9f7',
	fontSize: 14,
	cursor: 'pointer',
}
const cta: React.CSSProperties = {
	width: '100%',
	padding: 17,
	borderRadius: 18,
	border: 'none',
	background: RAINBOW,
	color: '#121212',
	fontSize: 17,
	fontWeight: 900,
	cursor: 'pointer',
	marginBottom: 10,
}
const skip: React.CSSProperties = {
	width: '100%',
	padding: 10,
	border: 'none',
	background: 'transparent',
	color: 'rgba(252,249,247,0.45)',
	fontSize: 14,
	cursor: 'pointer',
}

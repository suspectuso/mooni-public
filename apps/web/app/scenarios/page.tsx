'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// сценарий → ключ настроения (совпадает с MOOD_QUERY бэкенда для семантического подбора)
const SCENARIOS = [
	{ mood: 'recharge', emoji: '💆', label: 'Перезагрузка', hint: 'тихо, спокойно' },
	{ mood: 'inspiration', emoji: '✨', label: 'Вдохновение', hint: 'искусство, красота' },
	{ mood: 'romance', emoji: '🥂', label: 'Свидание', hint: 'для двоих, закат' },
	{ mood: 'social', emoji: '🎉', label: 'Движ', hint: 'люди, компания' },
	{ mood: 'solitude', emoji: '🌙', label: 'Уединение', hint: 'побыть одному' },
	{ mood: 'anxious', emoji: '🧘', label: 'Спокойствие', hint: 'умиротворение' },
	{ mood: 'active', emoji: '⚡', label: 'Активность', hint: 'спорт, энергия' },
]

const TEAL = '#65fff7'

export default function ScenariosPage() {
	const router = useRouter()
	const [active, setActive] = useState<string | null>(null)

	useEffect(() => {
		setActive(localStorage.getItem('mooniMood'))
	}, [])

	const pick = (mood: string | null) => {
		if (mood) localStorage.setItem('mooniMood', mood)
		else localStorage.removeItem('mooniMood')
		router.push('/networking')
	}

	return (
		<div style={wrap}>
			<h1 style={h1}>Под какое настроение?</h1>
			<p style={sub}>Муни подберёт места и маршрут под твой вайб.</p>

			<div style={grid}>
				{SCENARIOS.map((s) => {
					const on = active === s.mood
					return (
						<button
							key={s.mood}
							onClick={() => pick(s.mood)}
							style={{ ...card, ...(on ? cardOn : {}) }}
						>
							<div style={{ fontSize: 34 }}>{s.emoji}</div>
							<div style={{ fontSize: 16, fontWeight: 800 }}>{s.label}</div>
							<div style={{ fontSize: 12, color: 'rgba(252,249,247,0.5)' }}>
								{s.hint}
							</div>
						</button>
					)
				})}
			</div>

			<button style={anyBtn} onClick={() => pick(null)}>
				Без настроения — показать всё
			</button>
		</div>
	)
}

const wrap: React.CSSProperties = {
	minHeight: '100dvh',
	background: '#0e0e12',
	color: '#fcf9f7',
	maxWidth: 480,
	margin: '0 auto',
	padding: '36px 20px 48px',
}
const h1: React.CSSProperties = { fontSize: 30, fontWeight: 900, margin: '0 0 6px' }
const sub: React.CSSProperties = {
	color: 'rgba(252,249,247,0.65)',
	margin: '0 0 28px',
}
const grid: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: 12,
	marginBottom: 24,
}
const card: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	alignItems: 'flex-start',
	textAlign: 'left',
	padding: 18,
	borderRadius: 20,
	border: '1px solid rgba(252,249,247,0.1)',
	background: 'rgba(255,255,255,0.03)',
	color: '#fcf9f7',
	cursor: 'pointer',
}
const cardOn: React.CSSProperties = {
	border: `2px solid ${TEAL}`,
	background: 'rgba(101,255,247,0.12)',
	boxShadow: `0 0 24px rgba(101,255,247,0.15)`,
}
const anyBtn: React.CSSProperties = {
	width: '100%',
	padding: 15,
	borderRadius: 16,
	border: `1px solid ${TEAL}`,
	background: 'transparent',
	color: TEAL,
	fontSize: 15,
	fontWeight: 700,
	cursor: 'pointer',
}

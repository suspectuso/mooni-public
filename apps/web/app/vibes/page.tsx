'use client'

import { useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'
const TEAL = '#65fff7'

const MOOD_LABEL: Record<string, { emoji: string; label: string }> = {
	recharge: { emoji: '💆', label: 'Перезагрузка' },
	inspiration: { emoji: '✨', label: 'Вдохновение' },
	romance: { emoji: '🥂', label: 'Свидание' },
	social: { emoji: '🎉', label: 'Движ' },
	solitude: { emoji: '🌙', label: 'Уединение' },
	anxious: { emoji: '🧘', label: 'Спокойствие' },
	active: { emoji: '⚡', label: 'Активность' },
}

interface Vibes {
	total: number
	top: string | null
	items: { mood: string; count: number }[]
}

export default function VibesPage() {
	const [data, setData] = useState<Vibes | null>(null)

	useEffect(() => {
		const userId = getUserId()
		fetch(`${API}/me/profile/vibes?userId=${userId}`)
			.then((r) => r.json())
			.then(setData)
			.catch(() => {})
	}, [])

	const topLabel = data?.top ? MOOD_LABEL[data.top]?.label : null

	return (
		<div style={wrap}>
			<h1 style={h1}>Твои вайбы</h1>
			<p style={sub}>Под какое настроение ты чаще выбираешь места.</p>

			{!data || data.total === 0 ? (
				<div style={empty}>
					Пока пусто. Полайкай места под настроение (выбери вайб на свайпе) — здесь
					появится твой паттерн.
				</div>
			) : (
				<>
					{topLabel && (
						<div style={topCard}>
							Чаще всего — <span style={{ color: TEAL }}>{topLabel}</span>
						</div>
					)}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						{data.items.map((it) => {
							const m = MOOD_LABEL[it.mood] ?? { emoji: '🎭', label: it.mood }
							const pct = Math.round((it.count / data.total) * 100)
							return (
								<div key={it.mood}>
									<div style={row}>
										<span>
											{m.emoji} {m.label}
										</span>
										<span style={{ color: 'rgba(252,249,247,0.6)' }}>
											{it.count}
										</span>
									</div>
									<div style={barBg}>
										<div style={{ ...barFill, width: `${pct}%` }} />
									</div>
								</div>
							)
						})}
					</div>
				</>
			)}
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
	margin: '0 0 26px',
}
const empty: React.CSSProperties = {
	background: 'rgba(255,255,255,0.03)',
	border: '1px solid rgba(252,249,247,0.1)',
	borderRadius: 18,
	padding: 22,
	color: 'rgba(252,249,247,0.7)',
	lineHeight: 1.5,
}
const topCard: React.CSSProperties = {
	background: 'rgba(101,255,247,0.1)',
	border: `1px solid ${TEAL}`,
	borderRadius: 16,
	padding: 16,
	fontSize: 17,
	fontWeight: 700,
	marginBottom: 22,
}
const row: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	fontSize: 15,
	fontWeight: 600,
	marginBottom: 6,
}
const barBg: React.CSSProperties = {
	height: 10,
	borderRadius: 999,
	background: 'rgba(255,255,255,0.06)',
	overflow: 'hidden',
}
const barFill: React.CSSProperties = {
	height: '100%',
	borderRadius: 999,
	background: TEAL,
}

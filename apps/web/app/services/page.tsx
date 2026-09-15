'use client'

import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'
const TEAL = '#65fff7'

const TYPE_LABEL: Record<string, string> = {
	rooftop: '🌆 Крыши',
	photographer: '📷 Фото',
	excursion: '🚶 Экскурсии',
	venue: '🏛 Площадки',
	guide: '🧭 Гиды',
	other: '✨ Другое',
}

interface Service {
	id: string
	name: string
	type: string
	description: string | null
	priceFrom: number | null
	contact: string | null
}

export default function ServicesPage() {
	const [items, setItems] = useState<Service[]>([])

	useEffect(() => {
		fetch(`${API}/services`)
			.then((r) => r.json())
			.then(setItems)
			.catch(() => {})
	}, [])

	const open = (contact: string) => {
		const handle = contact.replace(/^@/, '')
		window.Telegram?.WebApp?.openTelegramLink?.(`https://t.me/${handle}`)
	}

	return (
		<div style={wrap}>
			<h1 style={h1}>Локальные услуги</h1>
			<p style={sub}>Гиды по крышам, фотографы, экскурсии, площадки — то, чего нет в агрегаторах.</p>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				{items.map((s) => (
					<div key={s.id} style={card}>
						<div style={{ fontSize: 12, color: TEAL, fontWeight: 700, marginBottom: 4 }}>
							{TYPE_LABEL[s.type] ?? s.type}
						</div>
						<div style={{ fontSize: 17, fontWeight: 800 }}>{s.name}</div>
						{s.description && (
							<div style={{ fontSize: 14, color: 'rgba(252,249,247,0.7)', margin: '6px 0' }}>
								{s.description}
							</div>
						)}
						<div style={footer}>
							{s.priceFrom ? <span>от {s.priceFrom} ₽</span> : <span />}
							{s.contact && (
								<button style={btn} onClick={() => open(s.contact!)}>
									Написать
								</button>
							)}
						</div>
					</div>
				))}
				{items.length === 0 && (
					<div style={{ color: 'rgba(252,249,247,0.5)' }}>Скоро здесь появятся услуги.</div>
				)}
			</div>
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
	margin: '0 0 24px',
	lineHeight: 1.4,
}
const card: React.CSSProperties = {
	background: 'rgba(255,255,255,0.03)',
	border: '1px solid rgba(252,249,247,0.1)',
	borderRadius: 18,
	padding: 18,
}
const footer: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginTop: 8,
	fontWeight: 700,
}
const btn: React.CSSProperties = {
	padding: '8px 16px',
	borderRadius: 999,
	border: 'none',
	background: TEAL,
	color: '#121212',
	fontWeight: 800,
	fontSize: 14,
	cursor: 'pointer',
}

'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

interface Item {
	type: 'slot' | 'event' | 'place'
	id: string
	title: string
	subtitle: string
	photo: string | null
	at: string | null
}

const BADGE: Record<string, { label: string; color: string }> = {
	slot: { label: '🤝 Сбор', color: '#65fff7' },
	event: { label: '🎭 Событие', color: '#e6f43f' },
	place: { label: '📍 Место', color: '#fc2a0d' },
}

export default function CityPage() {
	const [items, setItems] = useState<Item[] | null>(null)

	useEffect(() => {
		fetch(`${API}/city/feed`)
			.then(r => r.json())
			.then(d => setItems(Array.isArray(d) ? d : []))
			.catch(() => setItems([]))
	}, [])

	return (
		<div style={wrap}>
			<div style={{ flex: 1, padding: 20 }}>
				<h1 style={h1}>Город сейчас</h1>
				<p style={{ color: 'rgba(252,249,247,0.6)', marginBottom: 20 }}>
					Живая лента: сборы, события и новые места Петербурга.
				</p>

				{!items && <p style={{ opacity: 0.6 }}>Загрузка…</p>}

				<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
					{items?.map(it => {
						const b = BADGE[it.type]
						return (
							<div key={`${it.type}-${it.id}`} style={card}>
								{it.photo && (
									<div
										style={{
											height: 160,
											borderRadius: 12,
											marginBottom: 10,
											backgroundColor: '#3a3a37',
											backgroundImage: `url(${it.photo})`,
											backgroundSize: 'cover',
											backgroundPosition: 'center',
										}}
									/>
								)}
								<span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>
									{b.label}
								</span>
								<div style={{ fontSize: 18, fontWeight: 600, margin: '4px 0 2px' }}>
									{it.title}
								</div>
								<div style={{ fontSize: 14, opacity: 0.65 }}>{it.subtitle}</div>
							</div>
						)
					})}
				</div>
			</div>
			<BottomNav />
		</div>
	)
}

const wrap: React.CSSProperties = {
	minHeight: '100dvh',
	background: '#121212',
	color: '#fcf9f7',
	display: 'flex',
	flexDirection: 'column',
	maxWidth: 480,
	margin: '0 auto',
}
const h1: React.CSSProperties = { fontSize: 32, fontWeight: 900, margin: '8px 0 6px' }
const card: React.CSSProperties = { background: '#272727', borderRadius: 16, padding: 16 }

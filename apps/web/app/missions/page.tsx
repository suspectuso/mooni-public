'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'
const TEAL = '#65fff7'

interface Mission {
	key: string
	title: string
	emoji: string
	coins: number
	xp: number
	done: boolean
	claimed: boolean
}

export default function MissionsPage() {
	const [items, setItems] = useState<Mission[]>([])
	const [busy, setBusy] = useState<string | null>(null)

	const load = useCallback(() => {
		const userId = getUserId()
		fetch(`${API}/missions?userId=${userId}`)
			.then((r) => r.json())
			.then((d) => setItems(Array.isArray(d) ? d : []))
			.catch(() => {})
	}, [])

	useEffect(() => {
		load()
	}, [load])

	const claim = async (key: string) => {
		setBusy(key)
		try {
			const userId = getUserId()
			await fetch(`${API}/missions/${key}/claim?userId=${userId}`, {
				method: 'POST',
			})
			load()
		} finally {
			setBusy(null)
		}
	}

	return (
		<div style={wrap}>
			<h1 style={h1}>Городские миссии</h1>
			<p style={sub}>Исследуй город — забирай награды в susCoin и XP.</p>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
				{items.map((m) => (
					<div
						key={m.key}
						style={{ ...card, opacity: m.claimed ? 0.55 : 1 }}
					>
						<div style={{ fontSize: 28 }}>{m.emoji}</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: 16, fontWeight: 800 }}>{m.title}</div>
							<div style={{ fontSize: 13, color: TEAL, marginTop: 2 }}>
								+{m.coins} susCoin{m.xp ? ` · +${m.xp} XP` : ''}
							</div>
						</div>
						{m.claimed ? (
							<span style={tag}>✓ Получено</span>
						) : m.done ? (
							<button
								style={btn}
								disabled={busy === m.key}
								onClick={() => claim(m.key)}
							>
								Забрать
							</button>
						) : (
							<span style={{ ...tag, color: 'rgba(252,249,247,0.4)' }}>🔒</span>
						)}
					</div>
				))}
				{items.length === 0 && (
					<div style={{ color: 'rgba(252,249,247,0.5)' }}>Загрузка…</div>
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
	margin: '0 0 26px',
}
const card: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 14,
	background: 'rgba(255,255,255,0.03)',
	border: '1px solid rgba(252,249,247,0.1)',
	borderRadius: 18,
	padding: 16,
}
const btn: React.CSSProperties = {
	padding: '9px 16px',
	borderRadius: 999,
	border: 'none',
	background: TEAL,
	color: '#121212',
	fontWeight: 800,
	fontSize: 14,
	cursor: 'pointer',
}
const tag: React.CSSProperties = { fontSize: 14, fontWeight: 700 }

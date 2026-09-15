'use client'

import { useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'
import BottomNav from '@/components/BottomNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

interface Challenge {
	key: string
	title: string
	level: string
	earned: boolean
}
interface SeasonData {
	key: string
	title: string
	emoji: string
	challenges: Challenge[]
}

const LEVEL: Record<string, string> = { base: '🟢', advanced: '🔵', epic: '🟣' }

export default function SeasonPage() {
	const [s, setS] = useState<SeasonData | null>(null)

	useEffect(() => {
		const userId = getUserId()
		fetch(`${API}/season/current?userId=${userId}`)
			.then(r => r.json())
			.then(setS)
			.catch(() => {})
	}, [])

	const done = s?.challenges.filter(c => c.earned).length ?? 0

	return (
		<div style={wrap}>
			<div style={{ flex: 1, padding: 20 }}>
				{s && (
					<>
						<div style={banner}>
							<div style={{ fontSize: 52 }}>{s.emoji}</div>
							<div style={{ fontSize: 28, fontWeight: 900 }}>{s.title}</div>
							<div style={{ opacity: 0.7, marginTop: 4 }}>
								Сезон · {done}/{s.challenges.length} челленджей
							</div>
						</div>

						<h2 style={{ fontSize: 18, fontWeight: 700, margin: '20px 0 12px' }}>
							Челленджи сезона
						</h2>
						{s.challenges.length === 0 && (
							<p style={{ opacity: 0.6 }}>Скоро здесь появятся задания сезона.</p>
						)}
						<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
							{s.challenges.map(c => (
								<div
									key={c.key}
									style={{
										...card,
										display: 'flex',
										alignItems: 'center',
										gap: 12,
										opacity: c.earned ? 1 : 0.55,
									}}
								>
									<span style={{ fontSize: 22 }}>{LEVEL[c.level] ?? '⚪'}</span>
									<span style={{ flex: 1, fontWeight: 600 }}>{c.title}</span>
									{c.earned && <span style={{ color: '#65fff7' }}>✓</span>}
								</div>
							))}
						</div>
					</>
				)}
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
const banner: React.CSSProperties = {
	background: '#272727',
	borderRadius: 20,
	padding: 24,
	textAlign: 'center',
}
const card: React.CSSProperties = { background: '#272727', borderRadius: 14, padding: '12px 16px' }

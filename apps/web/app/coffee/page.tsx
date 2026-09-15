'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'
import BottomNav from '@/components/BottomNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

interface Partner {
	username: string | null
	firstName: string | null
}
interface Status {
	status: 'none' | 'waiting' | 'matched'
	kind?: string
	partner?: Partner | null
}

const KINDS = [
	{ key: 'coffee', emoji: '☕', label: 'Кофе' },
	{ key: 'walk', emoji: '🚶', label: 'Прогулка' },
	{ key: 'friending', emoji: '👋', label: 'Знакомство' },
	{ key: 'buddy', emoji: '🏋️', label: 'Бадди' },
]

export default function CoffeePage() {
	const [state, setState] = useState<Status>({ status: 'none' })
	const [busy, setBusy] = useState(false)
	const [kind, setKind] = useState('coffee')

	const refresh = useCallback(async () => {
		const userId = getUserId()
		const r = await fetch(`${API}/coffee/status?userId=${userId}`)
		setState(await r.json())
	}, [])

	useEffect(() => {
		refresh()
	}, [refresh])

	// пока ждём — опрашиваем статус
	useEffect(() => {
		if (state.status !== 'waiting') return
		const t = setInterval(refresh, 4000)
		return () => clearInterval(t)
	}, [state.status, refresh])

	const act = async (path: 'join' | 'leave') => {
		setBusy(true)
		try {
			const userId = getUserId()
			const q =
				path === 'join'
					? `?userId=${userId}&kind=${kind}`
					: `?userId=${userId}`
			await fetch(`${API}/coffee/${path}${q}`, { method: 'POST' })
			await refresh()
		} finally {
			setBusy(false)
		}
	}

	const partner = state.partner
	const partnerName = partner
		? partner.username
			? `@${partner.username}`
			: partner.firstName || 'собеседник'
		: null

	return (
		<div style={wrap}>
			<div style={{ flex: 1 }}>
				<h1 style={h1}>Random Coffee</h1>
				<p style={{ color: 'rgba(252,249,247,0.6)', marginBottom: 24 }}>
					Случайный собеседник на кофе или прогулку по городу.
				</p>

				<div style={card}>
					<div style={{ fontSize: 56, textAlign: 'center', marginBottom: 12 }}>☕</div>

					{state.status === 'none' && (
						<>
							<div
								style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 8,
									justifyContent: 'center',
									marginBottom: 16,
								}}
							>
								{KINDS.map((k) => (
									<button
										key={k.key}
										onClick={() => setKind(k.key)}
										style={{
											padding: '8px 14px',
											borderRadius: 999,
											border:
												kind === k.key
													? '1px solid #65fff7'
													: '1px solid rgba(252,249,247,0.2)',
											background:
												kind === k.key ? 'rgba(101,255,247,0.12)' : 'transparent',
											color: kind === k.key ? '#65fff7' : '#fcf9f7',
											fontSize: 14,
											fontWeight: 700,
											cursor: 'pointer',
										}}
									>
										{k.emoji} {k.label}
									</button>
								))}
							</div>
							<button style={btn} disabled={busy} onClick={() => act('join')}>
								Найти собеседника
							</button>
						</>
					)}

					{state.status === 'waiting' && (
						<>
							<p style={{ textAlign: 'center', marginBottom: 12 }}>
								Ищем тебе пару… как только кто-то найдётся — пришлём контакт в бот.
							</p>
							<button style={ghost} disabled={busy} onClick={() => act('leave')}>
								Отменить
							</button>
						</>
					)}

					{state.status === 'matched' && (
						<>
							<p style={{ textAlign: 'center', fontSize: 18, marginBottom: 8 }}>
								Нашёлся собеседник:
							</p>
							<p
								style={{
									textAlign: 'center',
									fontSize: 22,
									fontWeight: 900,
									color: '#65fff7',
									marginBottom: 16,
								}}
							>
								{partnerName}
							</p>
							{partner?.username && (
								<button
									style={btn}
									onClick={() =>
										window.Telegram?.WebApp?.openTelegramLink?.(
											`https://t.me/${partner.username}`,
										)
									}
								>
									Написать в Telegram
								</button>
							)}
							<button style={ghost} disabled={busy} onClick={() => act('leave')}>
								Завершить
							</button>
						</>
					)}
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
const h1: React.CSSProperties = { fontSize: 32, fontWeight: 900, margin: '8px 0 6px', padding: '0 20px' }
const card: React.CSSProperties = { background: '#272727', borderRadius: 20, padding: 24, margin: '0 20px' }
const btn: React.CSSProperties = {
	width: '100%',
	padding: 16,
	borderRadius: 16,
	border: 'none',
	background: '#65fff7',
	color: '#121212',
	fontSize: 16,
	fontWeight: 900,
	cursor: 'pointer',
	marginBottom: 10,
}
const ghost: React.CSSProperties = {
	width: '100%',
	padding: 14,
	borderRadius: 16,
	border: '1px solid rgba(252,249,247,0.3)',
	background: 'transparent',
	color: '#fcf9f7',
	fontSize: 15,
	cursor: 'pointer',
}

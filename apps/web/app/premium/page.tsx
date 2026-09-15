'use client'

import { useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'
import BottomNav from '@/components/BottomNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

interface Experience {
	id: string
	title: string
	description: string | null
	price: number
}

function tg() {
	return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
}

async function pay(
	purpose: 'premium' | 'booking',
	provider: 'yookassa' | 'xrocket',
	refId?: string,
) {
	const userId = getUserId()
	const qs = new URLSearchParams({ userId: userId || '', purpose, provider })
	if (refId) qs.set('refId', refId)
	const res = await fetch(`${API}/payments/create?${qs.toString()}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// безопасность: передаём подписанный Telegram initData
			'X-Telegram-Init-Data': tg()?.initData || '',
		},
		body: JSON.stringify({}),
	})
	const data = await res.json()
	if (data.url) {
		const t = tg()
		if (t?.openLink) t.openLink(data.url)
		else window.location.href = data.url
	} else {
		alert('Платежи пока не настроены (нет ключей провайдера).')
	}
}

export default function PremiumPage() {
	const [experiences, setExperiences] = useState<Experience[]>([])

	useEffect(() => {
		fetch(`${API}/experiences`)
			.then(r => r.json())
			.then(d => setExperiences(Array.isArray(d) ? d : []))
			.catch(() => {})
	}, [])

	return (
		<div
			style={{
				minHeight: '100vh',
				background: '#121212',
				padding: '20px',
				paddingBottom: '120px',
				maxWidth: '480px',
				margin: '0 auto',
			}}
		>
			<h1 style={{ fontSize: '34px', color: '#FCF9F7', marginBottom: '6px' }}>
				Mooni Premium
			</h1>
			<p style={{ color: 'rgba(252,249,247,0.6)', marginBottom: '20px' }}>
				Секретные маршруты, расширенная афиша, без лимитов.
			</p>

			<div
				style={{
					background: '#272727',
					borderRadius: '20px',
					padding: '20px',
					marginBottom: '28px',
				}}
			>
				<div style={{ color: '#FCF9F7', fontWeight: 600, marginBottom: '14px' }}>
					Подписка на 30 дней
				</div>
				<button onClick={() => pay('premium', 'yookassa')} style={primaryBtn}>
					Купить за 299 ₽ · ЮKassa
				</button>
				<button onClick={() => pay('premium', 'xrocket')} style={cryptoBtn}>
					Купить за 3 USDT · xRocket (крипта)
				</button>
			</div>

			<h2 style={{ fontSize: '22px', color: '#FCF9F7', marginBottom: '12px' }}>
				Впечатления
			</h2>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				{experiences.map(e => (
					<div
						key={e.id}
						style={{ background: '#272727', borderRadius: '16px', padding: '16px' }}
					>
						<div style={{ color: '#FCF9F7', fontWeight: 600, fontSize: '17px' }}>
							{e.title}
						</div>
						{e.description && (
							<div
								style={{
									color: 'rgba(252,249,247,0.6)',
									fontSize: '14px',
									margin: '4px 0 12px',
								}}
							>
								{e.description}
							</div>
						)}
						<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
							<button
								onClick={() => pay('booking', 'yookassa', e.id)}
								style={{ ...primaryBtn, margin: 0, flex: 1 }}
							>
								{e.price} ₽ · оплатить
							</button>
							<button
								onClick={() => pay('booking', 'xrocket', e.id)}
								style={{ ...cryptoBtn, margin: 0, width: 'auto', padding: '14px 16px' }}
							>
								USDT
							</button>
						</div>
					</div>
				))}
			</div>

			<BottomNav />
		</div>
	)
}

const primaryBtn: React.CSSProperties = {
	display: 'block',
	width: '100%',
	padding: '16px',
	borderRadius: '16px',
	border: 'none',
	background: '#65FFF7',
	color: '#121212',
	fontSize: '16px',
	fontWeight: 900,
	cursor: 'pointer',
	marginBottom: '10px',
}

const cryptoBtn: React.CSSProperties = {
	display: 'block',
	width: '100%',
	padding: '16px',
	borderRadius: '16px',
	border: '1px solid rgba(252,249,247,0.3)',
	background: 'transparent',
	color: '#FCF9F7',
	fontSize: '15px',
	fontWeight: 700,
	cursor: 'pointer',
}

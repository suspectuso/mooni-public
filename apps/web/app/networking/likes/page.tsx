'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getUserId } from '@/utils/telegram'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), {
	ssr: false,
})

interface LikedPlace {
	id: string
	name: string
	photo: string
	district: string | null
	category: string
	tags: string[]
}

interface RoutePoint {
	order: number
	note: string | null
	name: string
	district: string | null
	photo: string
	lat?: number | null
	lng?: number | null
}

interface RouteResult {
	id: string
	title: string
	points: RoutePoint[]
}

export default function LikedPlacesPage() {
	const [places, setPlaces] = useState<LikedPlace[]>([])
	const [loading, setLoading] = useState(true)
	const [building, setBuilding] = useState(false)
	const [route, setRoute] = useState<RouteResult | null>(null)

	useEffect(() => {
		const userId = getUserId()
		fetch(`/api/networking/liked?userId=${userId}`)
			.then(r => r.json())
			.then(d => {
				setPlaces(Array.isArray(d) ? d : [])
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}, [])

	const build = async () => {
		const userId = getUserId()
		setBuilding(true)
		try {
			const mood =
				typeof window !== 'undefined' ? localStorage.getItem('mooniMood') : null
			const r = await fetch(`/api/networking/route/build?userId=${userId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(mood ? { mood } : {}),
			})
			const data = await r.json()
			if (data.id) setRoute(data)
		} finally {
			setBuilding(false)
		}
	}

	return (
		<div style={{ minHeight: '100vh', background: '#121212', padding: '20px', paddingBottom: '120px', maxWidth: '480px', margin: '0 auto' }}>
			{!route && (
				<>
					<h1 style={{ fontSize: '32px', color: '#FCF9F7', marginBottom: '6px' }}>Мои места</h1>
					<p style={{ color: 'rgba(252,249,247,0.6)', marginBottom: '20px' }}>
						Лайкнутые места — собери из них маршрут под настроение.
					</p>

					{loading && <p style={{ color: 'rgba(252,249,247,0.5)' }}>Загрузка…</p>}
					{!loading && places.length === 0 && (
						<p style={{ color: 'rgba(252,249,247,0.5)' }}>
							Пока нет лайков. Свайпай места вправо — они появятся здесь.
						</p>
					)}

					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
						{places.map(p => (
							<div key={p.id} style={{ display: 'flex', gap: '12px', background: '#272727', borderRadius: '16px', padding: '10px', alignItems: 'center' }}>
								<div style={{ width: '64px', height: '64px', borderRadius: '12px', flexShrink: 0, backgroundColor: '#3a3a37', backgroundImage: p.photo ? `url(${p.photo})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
									{!p.photo && '📍'}
								</div>
								<div style={{ minWidth: 0 }}>
									<div style={{ color: '#FCF9F7', fontWeight: 600, fontSize: '16px' }}>{p.name}</div>
									<div style={{ color: 'rgba(252,249,247,0.55)', fontSize: '13px' }}>
										{p.category}{p.district ? ` · ${p.district}` : ''}
									</div>
								</div>
							</div>
						))}
					</div>

					{places.length >= 2 && (
						<button
							onClick={build}
							disabled={building}
							style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: '100px', width: 'calc(100% - 40px)', maxWidth: '440px', padding: '16px', borderRadius: '16px', border: 'none', background: '#65FFF7', color: '#121212', fontSize: '16px', fontWeight: 900, cursor: 'pointer', zIndex: 50 }}
						>
							{building ? 'Собираю маршрут…' : `Собрать маршрут из ${places.length} мест`}
						</button>
					)}
				</>
			)}

			{route && (
				<>
					<button onClick={() => setRoute(null)} style={{ background: '#272727', color: '#FCF9F7', border: 'none', borderRadius: '12px', padding: '8px 14px', marginBottom: '16px', cursor: 'pointer' }}>← К местам</button>
					<h1 style={{ fontSize: '30px', color: '#FCF9F7', marginBottom: '4px' }}>{route.title}</h1>
					<p style={{ color: 'rgba(252,249,247,0.6)', marginBottom: '20px' }}>{route.points.length} точек</p>

					<RouteMap points={route.points} />

					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
						{route.points.map(pt => (
							<div key={pt.order} style={{ background: '#272727', borderRadius: '16px', padding: '16px' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
									<span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#65FFF7', color: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', flexShrink: 0 }}>{pt.order + 1}</span>
									<strong style={{ color: '#FCF9F7', fontSize: '17px' }}>{pt.name}</strong>
								</div>
								{pt.district && <div style={{ color: 'rgba(252,249,247,0.5)', fontSize: '13px', marginTop: '4px' }}>{pt.district}</div>}
								{pt.note && <p style={{ color: 'rgba(252,249,247,0.85)', fontSize: '14px', margin: '10px 0 0' }}>{pt.note}</p>}
							</div>
						))}
					</div>
				</>
			)}

			<NetworkingBottomNav />
		</div>
	)
}

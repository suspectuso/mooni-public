'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'
import BottomNav from '@/components/BottomNav'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

interface Memory {
	key: string
	title: string
	level: string
	earnedAt: string
	note: string | null
	photo: string | null
	mood: string | null
}

const LEVEL: Record<string, string> = { base: '🟢', advanced: '🔵', epic: '🟣' }

export default function MemoriesPage() {
	const [items, setItems] = useState<Memory[] | null>(null)
	const [editKey, setEditKey] = useState<string | null>(null)
	const [note, setNote] = useState('')
	const [photo, setPhoto] = useState('')

	const load = useCallback(async () => {
		const userId = getUserId()
		const r = await fetch(`${API}/memories?userId=${userId}`)
		setItems(await r.json())
	}, [])

	useEffect(() => {
		load()
	}, [load])

	const save = async (key: string) => {
		const userId = getUserId()
		await fetch(`${API}/memories?userId=${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ achievementKey: key, note, photo }),
		})
		setEditKey(null)
		setNote('')
		setPhoto('')
		load()
	}

	return (
		<div style={wrap}>
			<div style={{ flex: 1, padding: 20 }}>
				<h1 style={h1}>Альбом</h1>
				<p style={{ color: 'rgba(252,249,247,0.6)', marginBottom: 20 }}>
					Твои ачивки как воспоминания: добавь фото и пару слов «как это было».
				</p>

				{!items && <p style={{ opacity: 0.6 }}>Загрузка…</p>}
				{items && items.length === 0 && (
					<p style={{ opacity: 0.6 }}>
						Пока пусто. Свайпай места и собирай маршруты — ачивки появятся здесь.
					</p>
				)}

				<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
					{items?.map(m => (
						<div key={m.key} style={card}>
							<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
								<span style={{ fontSize: 22 }}>{LEVEL[m.level] ?? '⚪'}</span>
								<strong style={{ fontSize: 17 }}>{m.title}</strong>
							</div>
							{m.photo && (
								<img
									src={m.photo}
									alt=""
									style={{
										width: '100%',
										borderRadius: 12,
										margin: '10px 0',
										maxHeight: 200,
										objectFit: 'cover',
									}}
								/>
							)}
							{m.note && (
								<p style={{ margin: '8px 0 0', opacity: 0.85 }}>{m.note}</p>
							)}

							{editKey === m.key ? (
								<div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
									<input
										style={inp}
										placeholder="Фото (URL)"
										value={photo}
										onChange={e => setPhoto(e.target.value)}
									/>
									<textarea
										style={{ ...inp, minHeight: 60 }}
										placeholder="Как это было…"
										value={note}
										onChange={e => setNote(e.target.value)}
									/>
									<div style={{ display: 'flex', gap: 8 }}>
										<button style={btn} onClick={() => save(m.key)}>
											Сохранить
										</button>
										<button style={ghost} onClick={() => setEditKey(null)}>
											Отмена
										</button>
									</div>
								</div>
							) : (
								<button
									style={{ ...ghost, marginTop: 10 }}
									onClick={() => {
										setEditKey(m.key)
										setNote(m.note ?? '')
										setPhoto(m.photo ?? '')
									}}
								>
									{m.note || m.photo ? 'Изменить воспоминание' : '+ Добавить воспоминание'}
								</button>
							)}
						</div>
					))}
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
const inp: React.CSSProperties = {
	background: '#1c1c1a',
	color: '#fcf9f7',
	border: '1px solid rgba(252,249,247,0.2)',
	borderRadius: 10,
	padding: '10px 12px',
	fontSize: 15,
}
const btn: React.CSSProperties = {
	background: '#65fff7',
	color: '#121212',
	border: 'none',
	borderRadius: 10,
	padding: '10px 16px',
	fontWeight: 800,
	cursor: 'pointer',
}
const ghost: React.CSSProperties = {
	background: 'transparent',
	color: '#fcf9f7',
	border: '1px solid rgba(252,249,247,0.3)',
	borderRadius: 10,
	padding: '8px 14px',
	cursor: 'pointer',
}

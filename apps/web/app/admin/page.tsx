'use client'

import { useCallback, useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

interface Place {
	id: string
	name: string
	district: string | null
	category: { slug: string; title: string }
	active: boolean
}
interface Raw {
	id: string
	source: string
	text: string
}

export default function AdminPage() {
	const [token, setToken] = useState('')
	const [authed, setAuthed] = useState(false)
	const [stats, setStats] = useState<Record<string, number> | null>(null)
	const [places, setPlaces] = useState<Place[]>([])
	const [pending, setPending] = useState<Raw[]>([])
	const [cats, setCats] = useState<{ slug: string; title: string }[]>([])
	const [form, setForm] = useState({ name: '', categorySlug: 'cafe', district: '' })
	const [err, setErr] = useState('')

	useEffect(() => {
		const t = localStorage.getItem('mooni_admin_token')
		if (t) {
			setToken(t)
			setAuthed(true)
		}
	}, [])

	const api = useCallback(
		async (path: string, init?: RequestInit) => {
			const res = await fetch(`${API}/admin${path}`, {
				...init,
				headers: {
					'Content-Type': 'application/json',
					'X-Admin-Token': token,
					...init?.headers,
				},
			})
			if (res.status === 403) throw new Error('Неверный токен')
			return res.json()
		},
		[token],
	)

	const load = useCallback(async () => {
		try {
			setErr('')
			const [s, p, q, c] = await Promise.all([
				api('/stats'),
				api('/places'),
				api('/ingestion/pending'),
				api('/categories'),
			])
			setStats(s)
			setPlaces(p)
			setPending(q)
			setCats(c)
			setAuthed(true)
			localStorage.setItem('mooni_admin_token', token)
		} catch (e) {
			setErr(String(e instanceof Error ? e.message : e))
			setAuthed(false)
		}
	}, [api, token])

	useEffect(() => {
		if (authed && token) load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authed])

	const addPlace = async () => {
		if (!form.name) return
		await api('/places', { method: 'POST', body: JSON.stringify(form) })
		setForm({ name: '', categorySlug: form.categorySlug, district: '' })
		load()
	}
	const delPlace = async (id: string) => {
		await api(`/places/${id}`, { method: 'DELETE' })
		load()
	}
	const reject = async (id: string) => {
		await api(`/ingestion/${id}/reject`, { method: 'POST' })
		load()
	}

	if (!authed) {
		return (
			<div style={wrap}>
				<h1 style={h1}>Mooni · Админка</h1>
				<input
					style={inp}
					placeholder="Admin token"
					value={token}
					onChange={e => setToken(e.target.value)}
				/>
				<button style={btn} onClick={load}>
					Войти
				</button>
				{err && <p style={{ color: '#fc2a0d' }}>{err}</p>}
			</div>
		)
	}

	return (
		<div style={wrap}>
			<h1 style={h1}>Mooni · Админка</h1>

			{stats && (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
					{Object.entries(stats).map(([k, v]) => (
						<div key={k} style={card}>
							<div style={{ fontSize: 22, fontWeight: 900, color: '#65fff7' }}>{v}</div>
							<div style={{ fontSize: 12, opacity: 0.7 }}>{k}</div>
						</div>
					))}
				</div>
			)}

			<h2 style={h2}>Добавить место</h2>
			<div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
				<input style={{ ...inp, flex: 2 }} placeholder="Название" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
				<select style={inp} value={form.categorySlug} onChange={e => setForm({ ...form, categorySlug: e.target.value })}>
					{cats.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
				</select>
				<input style={{ ...inp, flex: 1 }} placeholder="Район" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
				<button style={btn} onClick={addPlace}>+ Добавить</button>
			</div>

			<h2 style={h2}>Места ({places.length})</h2>
			<div style={{ marginBottom: 20 }}>
				{places.map(p => (
					<div key={p.id} style={{ ...row, opacity: p.active ? 1 : 0.4 }}>
						<span>{p.name} · {p.category?.title}{p.district ? ` · ${p.district}` : ''}</span>
						{p.active && <button style={delBtn} onClick={() => delPlace(p.id)}>удалить</button>}
					</div>
				))}
			</div>

			<h2 style={h2}>Очередь модерации ({pending.length})</h2>
			{pending.length === 0 && <p style={{ opacity: 0.6 }}>Пусто</p>}
			{pending.map(r => (
				<div key={r.id} style={{ ...card, marginBottom: 8 }}>
					<div style={{ fontSize: 12, opacity: 0.6 }}>{r.source}</div>
					<div style={{ margin: '6px 0' }}>{r.text}</div>
					<button style={delBtn} onClick={() => reject(r.id)}>отклонить</button>
				</div>
			))}
		</div>
	)
}

const wrap: React.CSSProperties = { maxWidth: 720, margin: '0 auto', padding: 24, color: '#fcf9f7', minHeight: '100dvh' }
const h1: React.CSSProperties = { fontSize: 28, fontWeight: 900, marginBottom: 16 }
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: '12px 0 8px' }
const card: React.CSSProperties = { background: '#272727', borderRadius: 12, padding: 14, textAlign: 'center' }
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#272727', borderRadius: 10, padding: '10px 14px', marginBottom: 6, fontSize: 14 }
const inp: React.CSSProperties = { background: '#1c1c1a', color: '#fcf9f7', border: '1px solid rgba(252,249,247,0.2)', borderRadius: 10, padding: '10px 12px', fontSize: 15 }
const btn: React.CSSProperties = { background: '#65fff7', color: '#121212', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }
const delBtn: React.CSSProperties = { background: 'transparent', color: '#fc2a0d', border: '1px solid #fc2a0d', borderRadius: 8, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }

'use client'

import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'
const TEAL = '#65fff7'

interface Idea {
	title: string
	steps: string[]
}

export default function CouplePage() {
	const [questions, setQuestions] = useState<string[]>([])
	const [qi, setQi] = useState(0)
	const [idea, setIdea] = useState<Idea | null>(null)
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		fetch(`${API}/relationship/questions`)
			.then((r) => r.json())
			.then((d) => setQuestions(d.questions ?? []))
			.catch(() => {})
	}, [])

	const genIdea = async () => {
		setBusy(true)
		try {
			const r = await fetch(`${API}/relationship/date-idea`, { method: 'POST' })
			setIdea(await r.json())
		} finally {
			setBusy(false)
		}
	}

	return (
		<div style={wrap}>
			<h1 style={h1}>Для двоих</h1>
			<p style={sub}>Идеи свиданий и тёплые вопросы — чтобы вечер вдвоём был особенным.</p>

			<div style={section}>Идея свидания</div>
			<div style={card}>
				{idea ? (
					<>
						<div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
							{idea.title}
						</div>
						<ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
							{idea.steps.map((s, i) => (
								<li key={i}>{s}</li>
							))}
						</ol>
						<button style={ghost} disabled={busy} onClick={genIdea}>
							{busy ? '…' : 'Другая идея'}
						</button>
					</>
				) : (
					<button style={cta} disabled={busy} onClick={genIdea}>
						{busy ? 'Придумываю…' : '💡 Придумай свидание'}
					</button>
				)}
			</div>

			<div style={section}>Вопрос для двоих</div>
			<div style={card}>
				{questions.length > 0 ? (
					<>
						<div style={{ fontSize: 18, lineHeight: 1.45, marginBottom: 14 }}>
							{questions[qi]}
						</div>
						<button
							style={ghost}
							onClick={() => setQi((i) => (i + 1) % questions.length)}
						>
							Следующий вопрос →
						</button>
					</>
				) : (
					<span style={{ color: 'rgba(252,249,247,0.5)' }}>Загрузка…</span>
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
	lineHeight: 1.4,
}
const section: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 700,
	letterSpacing: 0.5,
	color: 'rgba(252,249,247,0.45)',
	textTransform: 'uppercase',
	margin: '0 0 10px',
}
const card: React.CSSProperties = {
	background: 'rgba(255,255,255,0.03)',
	border: '1px solid rgba(252,249,247,0.1)',
	borderRadius: 18,
	padding: 18,
	marginBottom: 26,
}
const cta: React.CSSProperties = {
	width: '100%',
	padding: 15,
	borderRadius: 14,
	border: 'none',
	background: TEAL,
	color: '#121212',
	fontSize: 16,
	fontWeight: 900,
	cursor: 'pointer',
}
const ghost: React.CSSProperties = {
	marginTop: 14,
	padding: '10px 16px',
	borderRadius: 12,
	border: `1px solid ${TEAL}`,
	background: 'transparent',
	color: TEAL,
	fontSize: 14,
	fontWeight: 700,
	cursor: 'pointer',
}

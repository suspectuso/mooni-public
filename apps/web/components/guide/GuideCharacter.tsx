'use client'

import { useCallback, useEffect, useState } from 'react'
import GuideAvatar from './GuideAvatar'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'

type Ctx = 'greeting' | 'mood' | 'route_built' | 'achievement' | 'idle'

/** Проводник «Муни»: аватар + реплика по контексту/настроению. */
export default function GuideCharacter({
	context = 'greeting',
	mood,
}: {
	context?: Ctx
	mood?: string
}) {
	const [text, setText] = useState('…')
	const [talking, setTalking] = useState(false)

	const say = useCallback(async () => {
		try {
			const qs = new URLSearchParams({ context })
			if (mood) qs.set('mood', mood)
			const r = await fetch(`${API}/npc/phrase?${qs.toString()}`)
			const d = await r.json()
			setText(d.text || '...')
			setTalking(true)
			window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
			setTimeout(() => setTalking(false), 1600)
		} catch {
			setText('Привет! Я Муни 🌃')
		}
	}, [context, mood])

	useEffect(() => {
		say()
	}, [say])

	return (
		<div
			onClick={say}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '12px',
				cursor: 'pointer',
				marginBottom: '20px',
			}}
		>
			<GuideAvatar talking={talking} size={84} />
			<div
				style={{
					position: 'relative',
					background: '#272727',
					borderRadius: '16px',
					borderTopLeftRadius: '4px',
					padding: '12px 14px',
					color: '#FCF9F7',
					fontSize: '15px',
					lineHeight: 1.35,
					flex: 1,
				}}
			>
				{text}
			</div>
		</div>
	)
}

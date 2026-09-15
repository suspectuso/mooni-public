'use client'

import { useRef, useState } from 'react'
import { MapPin as PinIcon, Star, Route } from 'lucide-react'
import { graber, routeBtn, tagChip, T } from './map.styles'
import type { Pin } from './useMapData'

export type Snap = 'peek' | 'half' | 'full'
const HEIGHTS: Record<Snap, number> = { peek: 128, half: 340, full: 620 }
const ORDER: Snap[] = ['peek', 'half', 'full']

/**
 * Bottom-sheet карты. Абсолютный внутри контейнера (без position:fixed — viewport Telegram).
 * Ручка-грабер: тап циклит снапы, драг — тянет и защёлкивает к ближайшему. При выбранном пине —
 * карточка места; иначе (peek) — лента ближайших.
 */
export default function BottomSheet({
	snap,
	onSnap,
	selected,
	pins,
	onSelect,
	onRoute,
}: {
	snap: Snap
	onSnap: (s: Snap) => void
	selected: Pin | null
	pins: Pin[]
	onSelect: (p: Pin) => void
	onRoute: (p: Pin) => void
}) {
	const [drag, setDrag] = useState<number | null>(null)
	const startY = useRef(0)
	const startH = useRef(0)

	const height = drag ?? HEIGHTS[snap]

	const onDown = (e: React.PointerEvent) => {
		startY.current = e.clientY
		startH.current = HEIGHTS[snap]
		setDrag(HEIGHTS[snap])
		;(e.target as HTMLElement).setPointerCapture(e.pointerId)
	}
	const onMove = (e: React.PointerEvent) => {
		if (drag == null) return
		const next = Math.max(80, Math.min(680, startH.current + (startY.current - e.clientY)))
		setDrag(next)
	}
	const onUp = () => {
		if (drag == null) return
		const nearest = ORDER.reduce((best, s) =>
			Math.abs(HEIGHTS[s] - drag) < Math.abs(HEIGHTS[best] - drag) ? s : best,
		)
		setDrag(null)
		onSnap(nearest)
	}
	const cycle = () => onSnap(ORDER[(ORDER.indexOf(snap) + 1) % ORDER.length])

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 0,
				height,
				background: T.card,
				borderRadius: '22px 22px 0 0',
				boxShadow: '0 -4px 24px rgba(0,0,0,.10)',
				zIndex: 30,
				transition: drag == null ? 'height .28s cubic-bezier(.4,0,.2,1)' : 'none',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
				paddingBottom: 'calc(78px + env(safe-area-inset-bottom))',
			}}
		>
			<div
				onPointerDown={onDown}
				onPointerMove={onMove}
				onPointerUp={onUp}
				onClick={cycle}
				style={{ flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
			>
				<div style={graber} />
			</div>

			<div style={{ overflowY: 'auto', padding: '2px 16px 12px' }}>
				{selected ? (
					<PlaceCard pin={selected} onRoute={onRoute} />
				) : (
					<>
						<div style={{ fontFamily: T.head, fontWeight: 600, fontSize: 17, marginBottom: 10 }}>
							Рядом с тобой
						</div>
						{pins.slice(0, 12).map((p) => (
							<Row key={p.id} pin={p} onClick={() => onSelect(p)} />
						))}
					</>
				)}
			</div>
		</div>
	)
}

function meta(pin: Pin): string {
	const parts = [pin.district, pin.distanceKm != null ? `${pin.distanceKm.toFixed(1)} км` : null].filter(Boolean)
	return parts.join(' · ')
}

function PlaceCard({ pin, onRoute }: { pin: Pin; onRoute: (p: Pin) => void }) {
	return (
		<div>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
				<Thumb pin={pin} size={62} />
				<div style={{ minWidth: 0, flex: 1 }}>
					<div style={{ fontFamily: T.head, fontWeight: 600, fontSize: 18, color: T.text }}>{pin.name}</div>
					<div style={{ fontSize: 13, color: T.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
						{meta(pin)}
						{pin.rating != null && (
							<>
								<Star size={13} color={T.amber} fill={T.amber} />
								<span style={{ color: T.text, fontWeight: 700 }}>{pin.rating.toFixed(1)}</span>
							</>
						)}
					</div>
				</div>
			</div>
			<div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
				{(pin.tags ?? []).slice(0, 2).map((t) => (
					<span key={t} style={tagChip}>
						{t}
					</span>
				))}
			</div>
			<button style={{ ...routeBtn, width: '100%', marginTop: 14, justifyContent: 'center' }} onClick={() => onRoute(pin)}>
				<Route size={17} /> Маршрут
			</button>
		</div>
	)
}

function Row({ pin, onClick }: { pin: Pin; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			style={{
				display: 'flex',
				gap: 12,
				alignItems: 'center',
				width: '100%',
				padding: '8px 0',
				background: 'transparent',
				border: 'none',
				borderBottom: '1px solid #F2EEF4',
				textAlign: 'left',
			}}
		>
			<Thumb pin={pin} size={46} />
			<div style={{ minWidth: 0, flex: 1 }}>
				<div style={{ fontWeight: 700, fontSize: 15, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
					{pin.name}
				</div>
				<div style={{ fontSize: 12.5, color: T.muted }}>{meta(pin)}</div>
			</div>
			{pin.rating != null && (
				<span style={{ fontSize: 12.5, color: T.text, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
					<Star size={12} color={T.amber} fill={T.amber} />
					{pin.rating.toFixed(1)}
				</span>
			)}
		</button>
	)
}

function Thumb({ pin, size }: { pin: Pin; size: number }) {
	if (pin.photo)
		return (
			<img
				src={pin.photo}
				alt={pin.name}
				style={{ width: size, height: size, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
			/>
		)
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: 14,
				background: T.tealTint,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
			}}
		>
			<PinIcon size={size * 0.4} color={T.tealDeep} />
		</div>
	)
}

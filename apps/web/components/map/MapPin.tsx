import { PIN_STYLE, T } from './map.styles'
import type { Pin } from './useMapData'

/**
 * Пин-маркер MapLibre (рендерится в DOM через createRoot; anchor:'bottom' — остриё капли на
 * координате). Капля border-radius 50% 50% 50% 4px + rotate45, внутри контр-повёрнутая lucide-иконка.
 * Рекомендованные Луми — крупнее и с текст-лейблом над каплей. Достопримечательности (place ★≥4.8) — `sight`.
 */
export function PinMarker({ pin, active = false }: { pin: Pin; active?: boolean }) {
	const key = pin.type === 'place' && (pin.rating ?? 0) >= 4.8 ? 'sight' : pin.type
	const { color, Icon } = PIN_STYLE[key]
	const big = pin.recommended || active
	const size = big ? 38 : 30

	return (
		<div style={{ position: 'relative', cursor: 'pointer', zIndex: big ? 2 : 1 }}>
			{pin.recommended && pin.name && (
				<div
					style={{
						position: 'absolute',
						bottom: 'calc(100% + 4px)',
						left: '50%',
						transform: 'translateX(-50%)',
						background: T.card,
						color: T.tealInk,
						font: `700 11px/1 ${T.body}`,
						padding: '4px 8px',
						borderRadius: 8,
						boxShadow: T.shadow,
						whiteSpace: 'nowrap',
						maxWidth: 120,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{pin.name}
				</div>
			)}
			<div
				style={{
					width: size,
					height: size,
					background: color,
					borderRadius: '50% 50% 50% 4px',
					transform: 'rotate(45deg)',
					boxShadow: '0 3px 8px rgba(0,0,0,.28)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					border: '2px solid #fff',
				}}
			>
				<div style={{ transform: 'rotate(-45deg)', display: 'flex' }}>
					<Icon size={big ? 18 : 15} color="#fff" strokeWidth={2.4} />
				</div>
			</div>
		</div>
	)
}

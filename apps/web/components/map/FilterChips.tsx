'use client'

import { CHIPS, T } from './map.styles'
import type { PinType } from './useMapData'

export type FilterKey = 'all' | PinType

/**
 * Горизонтальная лента фильтр-чипов [Всё · Места · Впечатления · События · Сборы].
 * Активный — заливка #0E9E86. Справа mask-fade (лента прокручивается).
 */
export default function FilterChips({
	value,
	onChange,
}: {
	value: FilterKey
	onChange: (k: FilterKey) => void
}) {
	return (
		<div
			style={{
				pointerEvents: 'auto',
				display: 'flex',
				gap: 8,
				overflowX: 'auto',
				paddingRight: 28,
				WebkitMaskImage: 'linear-gradient(to right,#000 88%,transparent)',
				maskImage: 'linear-gradient(to right,#000 88%,transparent)',
				scrollbarWidth: 'none',
			}}
		>
			{CHIPS.map(({ key, label }) => {
				const on = key === value
				return (
					<button
						key={key}
						onClick={() => onChange(key)}
						style={{
							flexShrink: 0,
							height: 34,
							padding: '0 14px',
							borderRadius: 17,
							border: 'none',
							fontSize: 13,
							fontWeight: 700,
							fontFamily: T.body,
							whiteSpace: 'nowrap',
							background: on ? T.tealDeep : T.card,
							color: on ? '#fff' : T.muted,
							boxShadow: T.shadow,
						}}
					>
						{label}
					</button>
				)
			})}
		</div>
	)
}

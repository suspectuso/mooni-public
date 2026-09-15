import type React from 'react'
import { MapPin, Ticket, CalendarDays, Users, Landmark } from 'lucide-react'
import { T } from '../../app/home.styles'
import type { PinType } from './useMapData'

export { T }

// цвет + иконка пина по типу (канон C2)
export const PIN_STYLE: Record<PinType | 'sight', { color: string; Icon: typeof MapPin }> = {
	place: { color: T.tealDeep, Icon: MapPin },
	experience: { color: T.rose, Icon: Ticket },
	event: { color: T.lavender, Icon: CalendarDays },
	sprint: { color: T.amber, Icon: Users },
	sight: { color: T.sky, Icon: Landmark },
}

export const CHIPS: { key: 'all' | PinType; label: string }[] = [
	{ key: 'all', label: 'Всё' },
	{ key: 'place', label: 'Места' },
	{ key: 'experience', label: 'Впечатления' },
	{ key: 'event', label: 'События' },
	{ key: 'sprint', label: 'Сборы' },
]

// полноэкранный контейнер (карта абсолютна внутри, sheet/контролы поверх — без position:fixed для TMA)
export const shell: React.CSSProperties = {
	position: 'relative',
	width: '100%',
	minHeight: '100dvh',
	overflow: 'hidden',
	background: 'linear-gradient(180deg,#FFF1E6,#E4F8F3)',
	fontFamily: T.body,
	color: T.text,
	maxWidth: 480,
	margin: '0 auto',
}

export const mapCanvas: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
}

// ── верхние контролы ──
export const topWrap: React.CSSProperties = {
	position: 'absolute',
	top: 'calc(10px + env(safe-area-inset-top))',
	left: 12,
	right: 12,
	zIndex: 20,
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	pointerEvents: 'none',
}
export const searchBar: React.CSSProperties = {
	pointerEvents: 'auto',
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	height: 48,
	padding: '0 8px 0 14px',
	background: T.card,
	borderRadius: 16,
	boxShadow: T.shadow,
}
export const searchText: React.CSSProperties = {
	flex: 1,
	fontSize: 15,
	fontWeight: 600,
	color: T.muted,
	fontFamily: T.body,
}
export const filterBtn: React.CSSProperties = {
	width: 36,
	height: 36,
	borderRadius: 11,
	background: T.tealTint,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	border: 'none',
	flexShrink: 0,
}

// ── нижние плавающие контролы (над sheet) ──
export const moodChip: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 7,
	height: 40,
	padding: '0 15px',
	background: T.tealDeep,
	color: '#fff',
	borderRadius: 20,
	fontSize: 13,
	fontWeight: 700,
	fontFamily: T.body,
	boxShadow: '0 4px 14px rgba(14,158,134,.35)',
	border: 'none',
	whiteSpace: 'nowrap',
}
export const fab: React.CSSProperties = {
	width: 46,
	height: 46,
	borderRadius: '50%',
	background: T.card,
	boxShadow: T.shadowLg,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	border: 'none',
	flexShrink: 0,
}

// ── bottom-sheet ──
export const graber: React.CSSProperties = {
	width: 40,
	height: 4,
	borderRadius: 4,
	background: '#E4E0E7',
	margin: '9px auto 6px',
}
export const routeBtn: React.CSSProperties = {
	height: 44,
	padding: '0 18px',
	background: T.teal,
	color: T.tealInk,
	border: 'none',
	borderRadius: 14,
	fontSize: 14,
	fontWeight: 800,
	fontFamily: T.body,
	display: 'inline-flex',
	alignItems: 'center',
	gap: 6,
	boxShadow: '0 2px 10px rgba(101,255,247,.4)',
}
export const tagChip: React.CSSProperties = {
	padding: '4px 10px',
	background: T.tealTint,
	color: T.tealInk,
	borderRadius: 9,
	fontSize: 11,
	fontWeight: 700,
	fontFamily: T.body,
}

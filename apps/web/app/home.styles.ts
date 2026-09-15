import type React from 'react'

// токены C2 (канон дизайн-системы Луми)
export const T = {
	card: '#FFFFFF',
	text: '#2D2A33',
	muted: '#8A8390',
	hint: '#B3AEB8',
	teal: '#65FFF7',
	tealDeep: '#0E9E86',
	tealTint: '#E1FBF5',
	tealInk: '#08443D',
	rose: '#ff6b9d',
	amber: '#E89A3C',
	lavender: '#a78bfa',
	sky: '#3fb6e0',
	shadow: '0 2px 8px rgba(0,0,0,.05)',
	shadowLg: '0 3px 12px rgba(0,0,0,.06)',
	head: "'Fredoka', sans-serif",
	body: "'Nunito', sans-serif",
}

export const page: React.CSSProperties = {
	minHeight: '100dvh',
	background: 'linear-gradient(180deg,#FFF1E6,#E4F8F3)',
	fontFamily: T.body,
	color: T.text,
	maxWidth: 412,
	margin: '0 auto',
	padding: '12px 12px calc(104px + env(safe-area-inset-bottom))',
}
// контент-обёртка нейтральна: страница скроллится целиком, меню — fixed поверх
export const scrollArea: React.CSSProperties = {
	display: 'contents',
}
export const header: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	marginBottom: 14,
}
export const logoMark: React.CSSProperties = {
	width: 32,
	height: 32,
	borderRadius: 10,
	background: T.tealDeep,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}
export const bellBtn: React.CSSProperties = {
	width: 38,
	height: 38,
	borderRadius: '50%',
	background: T.card,
	boxShadow: T.shadow,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}
export const artPanel: React.CSSProperties = {
	position: 'relative',
	height: 300,
	borderRadius: 24,
	background: 'linear-gradient(160deg,#FBD0B6,#E4C3EE)',
	overflow: 'hidden',
	boxShadow: T.shadowLg,
}
export const artCaption: React.CSSProperties = {
	position: 'absolute',
	left: 14,
	top: 12,
	fontFamily: T.head,
	fontWeight: 600,
	color: '#fff',
	fontSize: 16,
	textShadow: '0 1px 4px rgba(0,0,0,.25)',
}
export const bubble: React.CSSProperties = {
	position: 'absolute',
	left: 12,
	bottom: 12,
	zIndex: 2,
	padding: '8px 13px',
	background: T.teal,
	color: T.tealInk,
	fontFamily: T.head,
	fontWeight: 500,
	fontSize: 14,
	borderRadius: '16px 16px 16px 5px',
	boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
}
export const moodScroll: React.CSSProperties = {
	marginTop: 9,
	maxHeight: 184,
	overflowY: 'auto',
	display: 'flex',
	flexDirection: 'column',
	gap: 7,
	// вайбовое затухание снизу
	WebkitMaskImage: 'linear-gradient(to bottom,#000 72%,transparent)',
	maskImage: 'linear-gradient(to bottom,#000 72%,transparent)',
	scrollbarWidth: 'none',
}
export const moodPill: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 7,
	padding: '9px 11px',
	background: T.card,
	border: 'none',
	borderRadius: 14,
	boxShadow: T.shadow,
	fontFamily: T.body,
	fontSize: 13,
	fontWeight: 700,
	color: T.text,
	cursor: 'pointer',
	textAlign: 'left',
	flexShrink: 0,
}
export const weatherCard: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 9,
	padding: '13px 14px',
	background: T.card,
	borderRadius: 16,
	boxShadow: T.shadow,
	fontSize: 14,
}
export const bigBtn: React.CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: 8,
	padding: '13px 13px',
	background: T.card,
	border: 'none',
	borderRadius: 16,
	boxShadow: T.shadow,
	fontFamily: T.body,
	fontWeight: 800,
	fontSize: 14,
	color: T.text,
	cursor: 'pointer',
}
export const tileGrid: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: 9,
}
export const tile: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	padding: '13px 12px',
	background: T.card,
	borderRadius: 15,
	boxShadow: T.shadow,
	minHeight: 44,
}
export const tileActive: React.CSSProperties = {
	background: T.tealTint,
	border: `1.5px solid ${T.teal}`,
}
export const ideaCard: React.CSSProperties = {
	background: T.card,
	borderRadius: 20,
	boxShadow: T.shadowLg,
	padding: 15,
	marginBottom: 18,
}
export const ideaHead: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
}
export const ctaChip: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 6,
	padding: '7px 11px',
	background: T.tealTint,
	color: T.tealDeep,
	borderRadius: 12,
	fontSize: 12.5,
	fontWeight: 700,
}
export const carouselHead: React.CSSProperties = {
	fontFamily: T.head,
	fontWeight: 600,
	fontSize: 18,
	color: T.text,
	marginBottom: 10,
}
export const carouselRow: React.CSSProperties = {
	display: 'flex',
	gap: 11,
	overflowX: 'auto',
	paddingBottom: 4,
	WebkitMaskImage: 'linear-gradient(to right,#000 85%,transparent)',
	maskImage: 'linear-gradient(to right,#000 85%,transparent)',
	scrollbarWidth: 'none',
}
export const miniCard: React.CSSProperties = {
	width: 144,
	flexShrink: 0,
	background: T.card,
	borderRadius: 16,
	boxShadow: T.shadow,
	padding: 13,
}
export const bookChip: React.CSSProperties = {
	padding: '5px 12px',
	background: T.tealDeep,
	color: '#fff',
	borderRadius: 999,
	fontSize: 12,
	fontWeight: 700,
}
export const wideCta: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	background: T.tealTint,
	borderRadius: 18,
	padding: 16,
	marginBottom: 18,
	cursor: 'pointer',
}
export const ctaRound: React.CSSProperties = {
	width: 44,
	height: 44,
	borderRadius: '50%',
	background: T.tealDeep,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
}
export const seasonBanner: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	background: 'linear-gradient(120deg,#E1FBF5,#EAF0FF)',
	borderRadius: 18,
	padding: 16,
	marginBottom: 8,
}
// Плавающая стеклянная пилюля (по макету основателя). zIndex поверх контента.
export const bottomNav: React.CSSProperties = {
	position: 'fixed',
	left: 16,
	right: 16,
	bottom: 'calc(24px + env(safe-area-inset-bottom))',
	maxWidth: 358,
	margin: '0 auto',
	zIndex: 50,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-around',
	padding: '8px 0',
	borderRadius: 24,
	background: 'rgba(255,255,255,0.25)',
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	boxShadow:
		'0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
	border: '1px solid rgba(255,255,255,0.3)',
}

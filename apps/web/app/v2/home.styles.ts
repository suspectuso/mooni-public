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
// персонаж стоит свободно на фоне — низ плавно затухает в фон (не обрывается)
export const artPanel: React.CSSProperties = {
	position: 'relative',
	height: 300,
	display: 'flex',
	alignItems: 'flex-end',
	justifyContent: 'center',
	WebkitMaskImage: 'linear-gradient(to bottom,#000 74%,transparent 97%)',
	maskImage: 'linear-gradient(to bottom,#000 74%,transparent 97%)',
}

// чат-формат: крупный персонаж → реплика Луми → быстрые ответы-чипы
export const chatHero: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	marginBottom: 16,
}
export const lumiMsg: React.CSSProperties = {
	alignSelf: 'center',
	textAlign: 'center',
	maxWidth: '90%',
	marginTop: 6,
	padding: '11px 16px',
	background: T.tealTint,
	color: T.tealInk,
	fontFamily: T.head,
	fontWeight: 500,
	fontSize: 16,
	lineHeight: 1.3,
	borderRadius: 18,
}
export const replyRow: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	marginTop: 12,
	overflowX: 'auto',
	paddingBottom: 4,
	WebkitMaskImage: 'linear-gradient(to right,#000 88%,transparent)',
	maskImage: 'linear-gradient(to right,#000 88%,transparent)',
	scrollbarWidth: 'none',
}
export const replyChip: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 7,
	flexShrink: 0,
	padding: '10px 15px',
	background: T.card,
	border: '1px solid rgba(0,0,0,0.05)',
	borderRadius: 999,
	boxShadow: T.shadow,
	fontFamily: T.body,
	fontSize: 14,
	fontWeight: 700,
	color: T.text,
	cursor: 'pointer',
	whiteSpace: 'nowrap',
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

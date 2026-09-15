'use client'

interface LimitReachedOverlayProps {
	limitMessage: string
	timeUntilReset: string
	onOpenSubscription: () => void
}

export default function LimitReachedOverlay({
	limitMessage: _limitMessage,
	timeUntilReset,
	onOpenSubscription,
}: LimitReachedOverlayProps) {
	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				zIndex: 100000,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '24px',
				pointerEvents: 'auto',
			}}
			onClick={e => {
				e.stopPropagation()
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
			}}
		>
			<div
				style={{
					backgroundColor: 'rgba(18, 18, 18, 0.85)',
					backdropFilter: 'blur(20px)',
					borderRadius: '28px',
					padding: '32px 24px',
					maxWidth: '400px',
					width: '100%',
					textAlign: 'center',
				}}
				onClick={e => e.stopPropagation()}
			>
				<h2
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '28px',
						color: '#FCF9F7',
						marginBottom: '16px',
						lineHeight: '1.2',
					}}
				>
					Лимит свайпов исчерпан
				</h2>
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: 'rgba(252, 249, 247, 0.8)',
						marginBottom: '24px',
						lineHeight: '1.5',
					}}
				>
					Вы можете продолжить через
				</p>
				<div
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '48px',
						color: '#FCF9F7',
						marginBottom: '32px',
						letterSpacing: '0.05em',
					}}
				>
					{timeUntilReset}
				</div>
				<button
					onClick={onOpenSubscription}
					style={{
						width: '100%',
						height: '56px',
						borderRadius: '28px',
						border: 'none',
						background: 'linear-gradient(to right, #F7710B, #F23318)',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						fontWeight: 600,
						color: '#FCF9F7',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '8px',
						transition: 'transform 0.2s',
					}}
					onMouseDown={e => {
						e.currentTarget.style.transform = 'scale(0.98)'
					}}
					onMouseUp={e => {
						e.currentTarget.style.transform = 'scale(1)'
					}}
					onMouseLeave={e => {
						e.currentTarget.style.transform = 'scale(1)'
					}}
				>
					<span style={{ fontSize: '35px', lineHeight: '1' }}>∞</span> Свайпы
				</button>
			</div>
		</div>
	)
}

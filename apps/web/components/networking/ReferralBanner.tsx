'use client'

interface ReferralBannerProps {
	onClick: () => void
}

export default function ReferralBanner({ onClick }: ReferralBannerProps) {
	const handleClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		onClick()
	}

	return (
		<div
			onClick={handleClick}
			style={{
				position: 'relative',
				background: '#121212',
				borderRadius: '24px',
				overflow: 'hidden',
				cursor: 'pointer',
				width: '100%',
				height: '180px',
				marginBottom: '16px',
			}}
		>
			{/* Orange glow behind +M logo */}
			<div
				style={{
					position: 'absolute',
					right: '30%',
					bottom: '-20%',
					width: '130px',
					height: '130px',
					borderRadius: '50%',
					background: 'rgba(247, 113, 11, 0.45)',
					filter: 'blur(4px)',
					transform: 'rotate(-13.62deg)',
					boxShadow: '0px 0px 30px 0px rgba(247, 113, 11, 0.45)',
				}}
			/>

			{/* Bottom decorative ellipses */}
			<div
				style={{
					position: 'absolute',
					left: '50%',
					bottom: '-60px',
					transform: 'translateX(-50%)',
					width: '660px',
					height: '200px',
					background:
						'radial-gradient(ellipse at center, rgba(247, 113, 11, 0.15) 0%, transparent 70%)',
					pointerEvents: 'none',
				}}
			/>

			{/* Title */}
			<p
				style={{
					position: 'absolute',
					top: '14px',
					left: '16px',
					fontFamily: 'Oks, sans-serif',
					fontSize: '42px',
					lineHeight: 0.9,
					color: '#FCF9F7',
					margin: 0,
					whiteSpace: 'nowrap',
				}}
			>
				зови друзей
			</p>

			{/* Subtitle */}
			<p
				style={{
					position: 'absolute',
					top: '66px',
					left: '16px',
					fontFamily: "'Zen Kaku Gothic New', sans-serif",
					fontSize: '14px',
					fontWeight: 500,
					lineHeight: 1.2,
					color: '#FCF9F7',
					margin: 0,
					maxWidth: '55%',
				}}
			>
				И получай подписку НЕТВОРКИНГ+ на 3 дня
			</p>

			{/* Invite button */}
			<div
				style={{
					position: 'absolute',
					bottom: '18px',
					left: '16px',
					width: '130px',
					height: '42px',
					borderRadius: '23px',
					backgroundColor: '#FCF9F7',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<span
					style={{
						fontFamily: "'Zen Kaku Gothic New', sans-serif",
						fontSize: '16px',
						fontWeight: 900,
						color: '#121212',
						whiteSpace: 'nowrap',
					}}
				>
					Пригласить
				</span>
			</div>

			{/* Dogs image */}
			<img
				src='/referral_dogs.png'
				alt=''
				style={{
					position: 'absolute',
					top: '-5px',
					right: '-30px',
					width: '220px',
					height: '220px',
					objectFit: 'cover',
					pointerEvents: 'none',
				}}
			/>

			{/* +3 days badge */}
			<div
				style={{
					position: 'absolute',
					right: '8px',
					bottom: '18px',
					width: '62px',
					height: '30px',
					borderRadius: '17px',
					backgroundColor: '#F7710B',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: 'rotate(11.54deg)',
				}}
			>
				<span
					style={{
						fontFamily: "'Zen Kaku Gothic New', sans-serif",
						fontSize: '12px',
						fontWeight: 900,
						color: '#FCF9F7',
						whiteSpace: 'nowrap',
					}}
				>
					+3 дня
				</span>
			</div>
		</div>
	)
}

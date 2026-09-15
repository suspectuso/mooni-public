'use client'

import { useEffect, useState } from 'react'

const dogPulseKeyframes = `
@keyframes dogPulse1 {
	0% { transform: scale(1) rotate(-4deg); }
	25% { transform: scale(1.05) rotate(5deg); }
	50% { transform: scale(1.07) rotate(-3deg); }
	75% { transform: scale(1.04) rotate(4deg); }
	100% { transform: scale(1) rotate(-4deg); }
}
@keyframes dogPulse2 {
	0% { transform: scale(1) rotate(5deg); }
	25% { transform: scale(1.04) rotate(-4deg); }
	50% { transform: scale(1.07) rotate(3deg); }
	75% { transform: scale(1.05) rotate(-5deg); }
	100% { transform: scale(1) rotate(5deg); }
}
@keyframes dogPulse3 {
	0% { transform: scale(1) rotate(-4deg); }
	25% { transform: scale(1.05) rotate(5deg); }
	50% { transform: scale(1.07) rotate(-3deg); }
	75% { transform: scale(1.04) rotate(4deg); }
	100% { transform: scale(1) rotate(-4deg); }
}
`

interface SubscriptionModalProps {
	isOpen: boolean
	onClose: () => void
	onPurchase: () => void
	hasActiveSubscription?: boolean
	subscriptionEndDate?: string
}

export default function SubscriptionModal({
	isOpen,
	onClose,
	onPurchase,
	hasActiveSubscription = false,
	subscriptionEndDate,
}: SubscriptionModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setIsAnimating(true), 10)
		} else {
			setIsAnimating(false)
		}
	}, [isOpen])

	// Telegram BackButton
	useEffect(() => {
		if (!isOpen) return
		const tg = (window as any).Telegram?.WebApp
		if (!tg?.BackButton) return

		tg.BackButton.show()
		tg.BackButton.onClick(onClose)
		return () => {
			tg.BackButton.offClick(onClose)
			tg.BackButton.hide()
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'Не указана'
		const date = new Date(dateString)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	return (
		<>
		<style>{dogPulseKeyframes}</style>
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 10000000,
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'rgba(0,0,0,0.6)',
				opacity: isAnimating ? 1 : 0,
				transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			{/* Bottom sheet */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					backgroundColor: '#1D1D1B',
					display: 'flex',
					flexDirection: 'column',
					transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
					transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				}}
			>
				{/* Hero section — background image with dogs overlay */}
				<div
					style={{
						flex: 1,
						overflow: 'hidden',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-end',
						position: 'relative',
					}}
				>
					{/* Header overlaid on top of image */}
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							zIndex: 10,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							paddingTop: 'calc(var(--tg-safe-top, 0px) + 10px)',
							paddingLeft: '24px',
							paddingRight: '24px',
						}}
					>
						<h1
							style={{
								fontFamily: "'Zen Kaku Gothic New', sans-serif",
								fontSize: '24px',
								fontWeight: 900,
								color: '#FCF9F7',
								margin: 0,
							}}
						>
							Нетворкинг+
						</h1>
					</div>
					<div
						style={{
							position: 'relative',
							width: '100%',
							flex: 1,
						}}
					>
						{/* Background with pills, glow, gradient (baked glass effect) */}
						<img
							src="/netw_sub_bg.png"
							alt=""
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
						{/* Dog 1 — top left (roses) */}
						<div
							style={{
								position: 'absolute',
								top: '12%',
								left: '3%',
								width: '42%',
								aspectRatio: '1',
								borderRadius: '50%',
								overflow: 'hidden',
								animation: 'dogPulse1 3s ease-in-out infinite',
							}}
						>
							<img
								src="/netw_sub_dog1.png"
								alt=""
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						</div>
						{/* Dog 2 — center right (business) */}
						<div
							style={{
								position: 'absolute',
								top: '34%',
								right: '3%',
								width: '42%',
								aspectRatio: '1',
								borderRadius: '50%',
								overflow: 'hidden',
								animation: 'dogPulse2 3.5s ease-in-out infinite',
								animationDelay: '0.5s',
							}}
						>
							<img
								src="/netw_sub_dog2.png"
								alt=""
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						</div>
						{/* Dog 3 — bottom left (phone + bubbles) */}
						<div
							style={{
								position: 'absolute',
								top: '52%',
								left: '3%',
								width: '42%',
								aspectRatio: '1',
								borderRadius: '50%',
								overflow: 'hidden',
								animation: 'dogPulse3 4s ease-in-out infinite',
								animationDelay: '1s',
							}}
						>
							<img
								src="/netw_sub_dog3.png"
								alt=""
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						</div>
					</div>
				</div>

				{/* Text + button block at bottom */}
				<div
					style={{
						padding: '0 24px 40px',
						marginTop: '-120px',
						position: 'relative',
						zIndex: 5,
					}}
				>
					<div style={{ textAlign: 'center', marginBottom: '16px' }}>
						<h2
							style={{
								fontFamily: "'Zen Kaku Gothic New', sans-serif",
								fontSize: '22px',
								fontWeight: 900,
								color: '#FCF9F7',
								margin: '0 0 6px',
								lineHeight: 1.2,
							}}
						>
							Ловите мэтч здесь и сейчас
						</h2>
						<p
							style={{
								fontFamily: "'Zen Kaku Gothic New', sans-serif",
								fontSize: '14px',
								fontWeight: 500,
								color: 'rgba(252, 249, 247, 0.65)',
								margin: 0,
								lineHeight: 1.4,
								whiteSpace: 'pre-line',
								padding: '0 20px',
							}}
						>
							Находите новые знакомства по ауре{'\n'}и фильтруйте ленту под ваш вайб
						</p>
					</div>
					{!hasActiveSubscription && (
						<button
							onClick={() => {
								onPurchase()
							}}
							style={{
								width: '100%',
								height: '56px',
								borderRadius: '28px',
								border: 'none',
								background: 'linear-gradient(270deg, #F7710B 0%, #F23318 100%)',
								fontFamily: "'Zen Kaku Gothic New', sans-serif",
								fontSize: '18px',
								fontWeight: 900,
								color: '#FCF9F7',
								cursor: 'pointer',
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
							Оформить 99р/мес.
						</button>
					)}

					{hasActiveSubscription && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
							}}
						>
							<button
								onClick={onClose}
								style={{
									width: '56px',
									height: '56px',
									borderRadius: '28px',
									border: 'none',
									background: 'linear-gradient(270deg, #F7710B 0%, #F23318 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
									flexShrink: 0,
									transition: 'transform 0.2s',
								}}
								onMouseDown={e => {
									e.currentTarget.style.transform = 'scale(0.95)'
								}}
								onMouseUp={e => {
									e.currentTarget.style.transform = 'scale(1)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.transform = 'scale(1)'
								}}
							>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M18 6L6 18M6 6L18 18'
										stroke='#FCF9F7'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</button>
							<div
								style={{
									flex: 1,
									height: '56px',
									borderRadius: '28px',
									backgroundColor: '#3e3e3c',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontFamily: "'Zen Kaku Gothic New', sans-serif",
									fontSize: '16px',
									fontWeight: 900,
									color: '#949290',
								}}
							>
								Подписка до {formatDate(subscriptionEndDate)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
		</>
	)
}

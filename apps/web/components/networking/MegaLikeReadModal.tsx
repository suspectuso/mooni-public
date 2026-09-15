'use client'

import { useEffect, useState } from 'react'

interface MegaLikeReadModalProps {
	isOpen: boolean
	onClose: () => void
	senderAvatar: string
	senderName: string
	message: string
	senderUsername?: string | null
	senderTelegramId?: string | null
	expiresAt?: string | null
}

export default function MegaLikeReadModal({
	isOpen,
	onClose,
	senderAvatar,
	senderName,
	message,
	senderUsername,
	senderTelegramId,
	expiresAt,
}: MegaLikeReadModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)
	const [timer, setTimer] = useState('47:59:59')

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true)
			setTimeout(() => setIsAnimating(true), 10)
		} else if (shouldRender) {
			setIsAnimating(false)
			setTimeout(() => setShouldRender(false), 400)
		}
	}, [isOpen])

	// Countdown timer from expiresAt (48h)
	useEffect(() => {
		if (!isOpen) return

		const target = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 48 * 60 * 60 * 1000)

		const updateTimer = () => {
			const diff = target.getTime() - Date.now()

			if (diff <= 0) {
				setTimer('00:00:00')
				return
			}

			const h = Math.floor(diff / 3600000)
			const m = Math.floor((diff % 3600000) / 60000)
			const s = Math.floor((diff % 60000) / 1000)
			setTimer(
				`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
			)
		}

		updateTimer()
		const interval = setInterval(updateTimer, 1000)
		return () => clearInterval(interval)
	}, [isOpen, expiresAt])

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

	const handleOpenChat = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
			const base = senderUsername
				? `https://t.me/${senderUsername}`
				: senderTelegramId
					? `https://t.me/user${senderTelegramId}`
					: null
			if (base) {
				const link = message ? `${base}?text=${encodeURIComponent(message)}` : base
				tg.openTelegramLink(link)
			}
		}
		onClose()
	}

	if (!shouldRender) return null

	return (
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
				backgroundColor: '#121212',
				opacity: isAnimating ? 1 : 0,
				transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				overflow: 'hidden',
			}}
		>
			{/* Glow images */}
			<img
				src='/glow-left.png'
				alt=''
				className='mega-like-glow-left'
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					height: '100%',
					width: 'auto',
					zIndex: 0,
					pointerEvents: 'none',
				}}
			/>
			<img
				src='/glow-right.png'
				alt=''
				className='mega-like-glow-right'
				style={{
					position: 'absolute',
					top: 0,
					right: 0,
					height: '100%',
					width: 'auto',
					zIndex: 0,
					pointerEvents: 'none',
				}}
			/>
			<style jsx global>{`
				@keyframes glowPulse {
					0%, 100% {
						opacity: 0.7;
						transform: scaleX(1);
					}
					50% {
						opacity: 1;
						transform: scaleX(1.15);
					}
				}
				@keyframes iconGlowPulse {
					0%, 100% {
						opacity: 0.7;
						transform: translate(-50%, -50%) scale(1);
					}
					50% {
						opacity: 1;
						transform: translate(-50%, -50%) scale(1.1);
					}
				}
				.mega-like-glow-left {
					animation: glowPulse 3s ease-in-out infinite;
					transform-origin: left center;
				}
				.mega-like-glow-right {
					animation: glowPulse 3s ease-in-out infinite;
					transform-origin: right center;
				}
				.mega-like-icon-glow {
					animation: iconGlowPulse 3s ease-in-out infinite;
				}
			`}</style>

			<div
				onClick={e => e.stopPropagation()}
				style={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh',
					transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
					opacity: isAnimating ? 1 : 0,
					transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
					transitionDelay: '0.1s',
				}}
			>
				{/* Content */}
				<div
					style={{
						position: 'relative',
						zIndex: 2,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: 'calc(var(--tg-safe-top, 0px) + 20px) 24px 20px',
						minHeight: '100vh',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							width: '100%',
						}}
					>
						{/* Timer */}
						<p
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '14px',
								fontWeight: 500,
								color: 'rgba(252, 249, 247, 0.65)',
								margin: '0 0 4px 0',
								textAlign: 'center' as const,
								width: '100%',
							}}
						>
							{`\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u043F\u0430\u0434\u0451\u0442 \u0447\u0435\u0440\u0435\u0437: ${timer}`}
						</p>

						{/* Super icon with glow */}
						<div
							style={{
								position: 'relative',
								width: '120px',
								height: '120px',
								marginTop: '-10px',
								marginBottom: '-10px',
							}}
						>
							<div
								className='mega-like-icon-glow'
								style={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%)',
									width: '140%',
									height: '140%',
									borderRadius: '50%',
									background: 'radial-gradient(circle, rgba(247, 113, 11, 0.4) 0%, rgba(242, 51, 24, 0.2) 40%, transparent 65%)',
									filter: 'blur(8px)',
									pointerEvents: 'none',
								}}
							/>
							<img
								src='/super.png'
								alt=''
								style={{
									width: '100%',
									height: '100%',
									position: 'relative',
									zIndex: 1,
									filter: 'drop-shadow(0px 0px 12px rgba(247, 113, 11, 0.65)) drop-shadow(0px 0px 34px rgba(242, 51, 24, 0.65))',
								}}
							/>
						</div>

						{/* Title */}
						<h1
							style={{
								fontFamily: 'Oks Free, Oks, sans-serif',
								fontSize: '50px',
								color: '#FCF9F7',
								textAlign: 'center',
								margin: 0,
								marginBottom: '8px',
								lineHeight: '0.9',
							}}
						>
							{'\u043C\u0435\u0433\u0430-\u043B\u0430\u0439\u043A'}
							<br />
							{`\u043E\u0442 ${senderName}`}
						</h1>

						{/* Sender avatar */}
						<div
							style={{
								width: '100px',
								height: '100px',
								borderRadius: '50%',
								overflow: 'hidden',
								marginBottom: '12px',
							}}
						>
							<img
								src={senderAvatar || '/default-avatar.webp'}
								alt={senderName}
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						</div>

						{/* Message section */}
						<div style={{ width: '100%', maxWidth: '450px', textAlign: 'left' }}>
							<p
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '18px',
									fontWeight: 900,
									color: '#FCF9F7',
									margin: '0 0 6px 0',
								}}
							>
								{`\u041F\u043E\u0441\u043B\u0430\u043D\u0438\u0435 \u043E\u0442 ${senderName}:`}
							</p>
							<div
								style={{
									background: 'rgba(252, 249, 247, 0.15)',
									borderRadius: '24px',
									padding: '14px 18px',
								}}
							>
								<p
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '16px',
										fontWeight: 500,
										color: 'rgba(252, 249, 247, 0.65)',
										lineHeight: '1.5',
										margin: 0,
										wordBreak: 'break-word',
									}}
								>
									{message}
								</p>
							</div>
						</div>
					</div>

					{/* CTA button */}
					<button
						onClick={handleOpenChat}
						style={{
							width: '100%',
							maxWidth: '450px',
							height: '56px',
							borderRadius: '28px',
							marginTop: '12px',
							marginBottom: '16px',
							border: 'none',
							background: 'linear-gradient(90deg, #F23318 0%, #F7710B 100%)',
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontSize: '18px',
							fontWeight: 900,
							color: '#FCF9F7',
							cursor: 'pointer',
							transition: 'all 0.3s',
						}}
					>
						{'\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043B\u0438\u0447\u043D\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F'}
					</button>
				</div>
			</div>
		</div>
	)
}

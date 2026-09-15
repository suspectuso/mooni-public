'use client'

import { useEffect, useState } from 'react'

interface MegaLikeModalProps {
	isOpen: boolean
	onClose: () => void
	onSend: (message: string) => Promise<{ targetUsername?: string | null; targetTelegramId?: string | null } | void>
	currentUserAvatar: string
	targetUserAvatar: string
	targetUserName: string
	megaLikesLeft: number
}

export default function MegaLikeModal({
	isOpen,
	onClose,
	onSend,
	currentUserAvatar,
	targetUserAvatar,
	targetUserName,
	megaLikesLeft,
}: MegaLikeModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)
	const [message, setMessage] = useState('')
	const [screen, setScreen] = useState<'compose' | 'success'>('compose')
	const [successData, setSuccessData] = useState<{ username?: string | null; telegramId?: string | null }>({})
	const MAX_LENGTH = 150

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true)
			setMessage('')
			setScreen('compose')
			setSuccessData({})
			setTimeout(() => setIsAnimating(true), 10)
		} else if (shouldRender) {
			setIsAnimating(false)
			setTimeout(() => setShouldRender(false), 400)
		}
	}, [isOpen])

	const handleSend = async () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('heavy')
			setTimeout(() => tg.HapticFeedback.impactOccurred('medium'), 100)
		}
		const result = await onSend(message.trim())
		if (result) {
			setSuccessData({ username: result.targetUsername, telegramId: result.targetTelegramId })
			setScreen('success')
		}
	}

	const handleOpenChat = () => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const username = successData.username
		const telegramId = successData.telegramId
		const link = username
			? `https://t.me/${username}`
			: `https://t.me/user${telegramId}`
		// Вставляем сообщение, если есть
		const text = message.trim()
		const finalLink = text ? `${link}?text=${encodeURIComponent(text)}` : link
		tg.openTelegramLink(finalLink)
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
			{/* Свечение */}
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
					{screen === 'compose' ? (
						<>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									width: '100%',
								}}
							>
								{/* Иконка super со свечением */}
								<div
									style={{
										position: 'relative',
										width: '100px',
										height: '100px',
										marginTop: '0px',
										marginBottom: '0px',
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
										alt='Мега-лайк'
										style={{
											width: '100%',
											height: '100%',
											position: 'relative',
											zIndex: 1,
											filter: 'drop-shadow(0px 0px 12px rgba(247, 113, 11, 0.65)) drop-shadow(0px 0px 34px rgba(242, 51, 24, 0.65))',
										}}
									/>
								</div>

								{/* Заголовок */}
								<h1
									style={{
										fontFamily: 'Oks Free, Oks, sans-serif',
										fontSize: '58px',
										color: '#FCF9F7',
										textAlign: 'center',
										margin: 0,
										marginBottom: '10px',
										lineHeight: '0.9',
									}}
								>
									Мега-лайк
								</h1>

								{/* Счётчик */}
								<p
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '14px',
										fontWeight: 900,
										color: '#FCF9F7',
										textAlign: 'center',
										margin: '0 0 4px 0',
									}}
								>
									Счётчик мега-лайков
								</p>

								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '6px',
										background: '#FCF9F7',
										borderRadius: '22.5px',
										padding: '6px 16px',
										marginBottom: '12px',
									}}
								>
									<img src='/mail.png' alt='' style={{ width: '28px', height: 'auto', objectFit: 'contain' }} />
									<span
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '18px',
											fontWeight: 900,
											color: '#121212',
											position: 'relative',
											top: '-2px',
										}}
									>
										{megaLikesLeft}
									</span>
								</div>

								{/* Аватарки */}
								<div
									style={{
										position: 'relative',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '12px',
									}}
								>
									<div style={{ width: '95px', height: '95px', borderRadius: '50%', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
										<img src={currentUserAvatar || '/default-avatar.webp'} alt='You' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
									</div>
									<div style={{ width: '95px', height: '95px', borderRadius: '50%', overflow: 'hidden', position: 'relative', marginLeft: '-30px', zIndex: 2 }}>
										<img src={targetUserAvatar || '/default-avatar.webp'} alt='Target' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
									</div>
								</div>

								{/* Послание */}
								<div style={{ width: '100%', maxWidth: '450px', textAlign: 'left' }}>
									<p
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '16px',
											fontWeight: 900,
											color: '#FCF9F7',
											margin: '0 0 10px 0',
										}}
									>
										Послание:
									</p>
									<div
										style={{
											position: 'relative',
											background: 'rgba(252, 249, 247, 0.15)',
											borderRadius: '20px',
											padding: '16px 18px',
										}}
									>
										<textarea
											value={message}
											onChange={e => {
												if (e.target.value.length <= MAX_LENGTH) {
													setMessage(e.target.value)
												}
											}}
											placeholder={`Начните  общение с *${targetUserName}*`}
											style={{
												width: '100%',
												minHeight: '80px',
												background: 'none',
												border: 'none',
												outline: 'none',
												resize: 'none',
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '14px',
												fontWeight: 500,
												color: '#FCF9F7',
												lineHeight: '1.4',
											}}
										/>
										<div
											style={{
												textAlign: 'right',
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '12px',
												color: 'rgba(252, 249, 247, 0.45)',
												marginTop: '4px',
											}}
										>
											{message.length}/{MAX_LENGTH}
										</div>
									</div>
								</div>
							</div>

							{/* Кнопка отправить — всегда активна */}
							<button
								onClick={handleSend}
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
								Отправить мега-лайк
							</button>
						</>
					) : (
						/* Экран успеха */
						<>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									width: '100%',
									flex: 1,
									justifyContent: 'center',
								}}
							>
								{/* Иконка */}
								<div
									style={{
										position: 'relative',
										width: '100px',
										height: '100px',
										marginBottom: '16px',
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
										alt='Отправлено'
										style={{
											width: '100%',
											height: '100%',
											position: 'relative',
											zIndex: 1,
											filter: 'drop-shadow(0px 0px 12px rgba(247, 113, 11, 0.65)) drop-shadow(0px 0px 34px rgba(242, 51, 24, 0.65))',
										}}
									/>
								</div>

								<h1
									style={{
										fontFamily: 'Oks Free, Oks, sans-serif',
										fontSize: '44px',
										color: '#FCF9F7',
										textAlign: 'center',
										margin: 0,
										marginBottom: '16px',
										lineHeight: '1',
									}}
								>
									Мега-лайк{'\n'}отправлен!
								</h1>

								{/* Username получателя */}
								{(successData.username || successData.telegramId) && (
									<div
										style={{
											background: 'rgba(252, 249, 247, 0.1)',
											borderRadius: '16px',
											padding: '16px 24px',
											marginBottom: '24px',
											textAlign: 'center',
										}}
									>
										<p
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '14px',
												color: 'rgba(252, 249, 247, 0.6)',
												margin: '0 0 8px 0',
											}}
										>
											Telegram {targetUserName}:
										</p>
										<p
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '22px',
												fontWeight: 900,
												color: '#FCF9F7',
												margin: 0,
											}}
										>
											@{successData.username || `user${successData.telegramId}`}
										</p>
									</div>
								)}

								{/* Кнопка написать */}
								<button
									onClick={handleOpenChat}
									style={{
										width: '100%',
										maxWidth: '450px',
										height: '56px',
										borderRadius: '28px',
										border: 'none',
										background: 'linear-gradient(90deg, #F23318 0%, #F7710B 100%)',
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '18px',
										fontWeight: 900,
										color: '#FCF9F7',
										cursor: 'pointer',
										marginBottom: '12px',
									}}
								>
									Написать в Telegram
								</button>
							</div>

							{/* Кнопка закрыть */}
							<button
								onClick={onClose}
								style={{
									width: '100%',
									maxWidth: '450px',
									height: '48px',
									borderRadius: '24px',
									border: '1px solid rgba(252, 249, 247, 0.2)',
									background: 'transparent',
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '16px',
									fontWeight: 700,
									color: 'rgba(252, 249, 247, 0.6)',
									cursor: 'pointer',
									marginBottom: '16px',
								}}
							>
								Закрыть
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

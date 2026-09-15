'use client'

import { useEffect, useState } from 'react'

interface MutualSympathyModalProps {
	isOpen: boolean
	onClose: () => void
	onSend: () => void
	currentUserAvatar: string
	targetUserAvatar: string
	targetUserName: string
	targetUsername?: string
	targetTelegramId?: string
}

export default function MutualSympathyModal({
	isOpen,
	onClose: _onClose,
	onSend,
	currentUserAvatar,
	targetUserAvatar,
	targetUserName,
	targetUsername,
	targetTelegramId,
}: MutualSympathyModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)
	const [isClosing, setIsClosing] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setIsClosing(false)
			setTimeout(() => setIsAnimating(true), 10)
		} else {
			setIsAnimating(false)
		}
	}, [isOpen])

	const handleSend = () => {
		setIsClosing(true)

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('heavy')
			setTimeout(() => tg.HapticFeedback.impactOccurred('medium'), 100)
			setTimeout(() => tg.HapticFeedback.impactOccurred('light'), 200)
		}

		setTimeout(() => {
			onSend()

			// Открываем чат с пользователем
			if (tg && (targetUsername || targetTelegramId)) {
				const chatLink = targetUsername
					? `https://t.me/${targetUsername}`
					: `tg://user?id=${targetTelegramId}`
				tg.openTelegramLink(chatLink)
			}
		}, 1500)
	}

	if (!isOpen) return null

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
				opacity: isClosing ? 0 : isAnimating ? 1 : 0,
				transition: isClosing
					? 'opacity 0.5s ease-out 1s'
					: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				overflowY: 'auto',
			}}
		>
			{/* Анимация сердечка при закрытии */}
			{isClosing && (
				<>
					<div
						style={{
							position: 'fixed',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							width: '400px',
							height: '400px',
							borderRadius: '50%',
							background:
								'radial-gradient(circle, rgba(232, 101, 255, 0.9) 0%, rgba(232, 101, 255, 0.6) 20%, rgba(232, 101, 255, 0.3) 40%, transparent 70%)',
							animation:
								'pulseGradient 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
							zIndex: 10000001,
							pointerEvents: 'none',
							filter: 'blur(20px)',
						}}
					/>
					<div
						style={{
							position: 'fixed',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							zIndex: 10000002,
							pointerEvents: 'none',
							animation:
								'heartExplosion 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
						}}
					>
						<img
							src='/ily_big_icon.webp'
							alt='Heart'
							style={{
								width: '200px',
								height: 'auto',
								display: 'block',
							}}
						/>
					</div>
				</>
			)}

			<div
				onClick={e => e.stopPropagation()}
				style={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh',
					transform: isClosing
						? 'scale(0.9)'
						: isAnimating
							? 'translateY(0) scale(1)'
							: 'translateY(30px) scale(0.95)',
					opacity: isClosing ? 0 : isAnimating ? 1 : 0,
					transition: isClosing
						? 'transform 0.4s ease-out, opacity 0.4s ease-out'
						: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
					transitionDelay: isClosing ? '0s' : '0.1s',
				}}
			>
				{/* Фон с сердечком - растянут на 250vw */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: '50%',
						transform: 'translateX(-50%)',
						width: '250vw',
						height: '100vh',
						backgroundImage: 'url(/ily_big_icon.webp)',
						backgroundSize: 'contain',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						zIndex: 1,
						opacity: 0.3,
					}}
				/>

					{/* Контент */}
				<div
					style={{
						position: 'relative',
						zIndex: 2,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '60px 24px 24px',
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
						{/* Заголовок */}
						<h1
							style={{
								fontFamily: 'Oks, sans-serif',
								fontSize: '72px',
								color: '#E865FF',
								textAlign: 'center',
								margin: 0,
								marginBottom: '40px',
								lineHeight: '1',
								textTransform: 'uppercase',
							}}
						>
							Взаимная
							<br />
							симпатия
						</h1>

						{/* Аватарки */}
						<div
							style={{
								position: 'relative',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: '32px',
							}}
						>
							<div
								style={{
									width: '140px',
									height: '140px',
									borderRadius: '50%',
									overflow: 'hidden',
									position: 'relative',
									zIndex: 1,
								}}
							>
								<img
									src={currentUserAvatar || '/default-avatar.webp'}
									alt='Your avatar'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
							</div>

							<div
								style={{
									width: '140px',
									height: '140px',
									borderRadius: '50%',
									overflow: 'hidden',
									position: 'relative',
									marginLeft: '-40px',
									zIndex: 2,
								}}
							>
								<img
									src={targetUserAvatar || '/default-avatar.webp'}
									alt='Target avatar'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
							</div>
						</div>

						{/* Текст */}
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								textAlign: 'center',
								margin: 0,
								lineHeight: '1.5',
								marginBottom: '16px',
							}}
						>
							Вы нравитесь {targetUserName}, скорее начинайте общение в чате.
						</p>

						{/* Username плашка */}
						{targetUsername && (
							<div
								className='inline-flex items-center rounded-[14px] cursor-pointer active:scale-95 transition-transform'
								style={{
									height: '28px',
									padding: '4px 12px',
									backgroundColor: '#7d271a',
								}}
								onClick={e => {
									e.stopPropagation()
									const tg = (window as any).Telegram?.WebApp
									if (tg) {
										tg.HapticFeedback.impactOccurred('light')
										tg.openTelegramLink(`https://t.me/${targetUsername}`)
									}
								}}
							>
								<span
									className='text-[13px] font-semibold text-[#FCF9F7]'
									style={{ fontFamily: 'LT Superior, sans-serif' }}
								>
									@{targetUsername}
								</span>
							</div>
						)}
					</div>

					{/* Кнопка */}
					<button
						onClick={handleSend}
						style={{
							width: '100%',
							maxWidth: '450px',
							height: '72px',
							borderRadius: '28px',
							border: 'none',
							backgroundColor: '#E865FF',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							cursor: 'pointer',
							boxShadow: '0 4px 52px rgba(232, 101, 255, 0.15)',
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
						Написать {targetUserName}
					</button>
				</div>
			</div>

			<style jsx global>{`
				@keyframes heartExplosion {
					0% {
						transform: translate(-50%, -50%) scale(1) rotate(0deg);
						opacity: 1;
					}
					40% {
						transform: translate(-50%, -50%) scale(4) rotate(15deg);
						opacity: 1;
					}
					70% {
						transform: translate(-50%, -50%) scale(5.5) rotate(-10deg);
						opacity: 0.7;
					}
					100% {
						transform: translate(-50%, -50%) scale(7) rotate(0deg);
						opacity: 0;
					}
				}

				@keyframes pulseGradient {
					0% {
						transform: translate(-50%, -50%) scale(0.3);
						opacity: 0;
					}
					20% {
						transform: translate(-50%, -50%) scale(1.2);
						opacity: 1;
					}
					50% {
						transform: translate(-50%, -50%) scale(2.5);
						opacity: 0.8;
					}
					80% {
						transform: translate(-50%, -50%) scale(4);
						opacity: 0.3;
					}
					100% {
						transform: translate(-50%, -50%) scale(5);
						opacity: 0;
					}
				}
			`}</style>
		</div>
	)
}

'use client'

import { useEffect, useRef, useState } from 'react'

interface ExpressLoveModalProps {
	isOpen: boolean
	onClose: () => void
	onSend: () => void
	currentUserAvatar: string
	targetUserAvatar: string
	targetUserName: string
	targetUserGender?: string
}

export default function ExpressLoveModal({
	isOpen,
	onClose: _onClose,
	onSend,
	currentUserAvatar,
	targetUserAvatar,
	targetUserName,
	targetUserGender,
}: ExpressLoveModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)
	const [isClosing, setIsClosing] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)
	const isSendCloseRef = useRef(false)

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true)
			setIsClosing(false)
			isSendCloseRef.current = false
			setTimeout(() => setIsAnimating(true), 10)
		} else if (shouldRender) {
			if (isClosing) {
				// Send-flow: isClosing уже true от handleSend
				// Ждём окончания анимации и чистим
				setTimeout(() => {
					setShouldRender(false)
					setIsClosing(false)
					isSendCloseRef.current = false
				}, 500)
			} else {
				// Back-button close: просто убираем isAnimating
				// Transition уже установлен (opening), браузер анимирует обратно
				setIsAnimating(false)
				setTimeout(() => {
					setShouldRender(false)
				}, 500)
			}
		}
	}, [isOpen])

	const handleSend = () => {
		// Запускаем анимацию закрытия (send-close с сердечком)
		isSendCloseRef.current = true
		setIsClosing(true)

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			// Последовательность вибраций для эффекта взрыва
			tg.HapticFeedback.impactOccurred('heavy')
			setTimeout(() => tg.HapticFeedback.impactOccurred('medium'), 100)
			setTimeout(() => tg.HapticFeedback.impactOccurred('light'), 200)
		}

		// Ждем завершения анимации перед вызовом onSend
		setTimeout(() => {
			onSend()
		}, 1500) // Уменьшено для более динамичной анимации
	}

	if (!shouldRender) return null

	// Определяем текст в зависимости от пола
	const getGenderText = () => {
		if (targetUserGender === 'MALE') {
			return `Намекнуть ${targetUserName}, что он вам понравился.`
		} else if (targetUserGender === 'FEMALE') {
			return `Намекнуть ${targetUserName}, что она вам понравилась.`
		}
		return `Намекнуть ${targetUserName}, что он/она вам понравился (-лась).`
	}

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
					? (isSendCloseRef.current
						? 'opacity 0.5s ease-out 1s'
						: 'opacity 0.3s ease-out')
					: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				overflowY: 'auto',
			}}
		>
			{/* Анимация сердечка при отправке */}
			{isClosing && isSendCloseRef.current && (
				<>
					{/* Пульсирующий круглый градиент */}
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
								'radial-gradient(circle, rgba(242, 51, 24, 0.9) 0%, rgba(242, 51, 24, 0.6) 20%, rgba(242, 51, 24, 0.3) 40%, transparent 70%)',
							animation:
								'pulseGradient 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
							zIndex: 10000001,
							pointerEvents: 'none',
							filter: 'blur(20px)',
						}}
					/>
					{/* Увеличивающееся сердечко */}
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
				{/* Красное свечение - прижато к верху */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '40vh',
						backgroundImage: 'url(/match_netw.webp)',
						backgroundSize: 'cover',
						backgroundPosition: 'top center',
						zIndex: 1,
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
						padding: 'calc(var(--tg-safe-top, 0px) + 20px) 24px 10px',
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
								color: '#F23318',
								textAlign: 'center',
								margin: 0,
								marginBottom: '-60px',
								lineHeight: '1',
								textTransform: 'uppercase',
								zIndex: 3,
							}}
						>
							Выразить
							<br />
							симпатию
						</h1>

						{/* Большое сердце - абсолютное позиционирование на 100vw */}
						<div
							style={{
								position: 'absolute',
								left: '50%',
								top: '120px',
								transform: 'translateX(-50%)',
								width: '100vw',
								zIndex: 2,
							}}
						>
							<img
								src='/ily_big_icon.webp'
								alt='Heart'
								style={{
									width: '100%',
									height: 'auto',
									display: 'block',
								}}
							/>
						</div>

						{/* Отступ для контента после сердца */}
						<div style={{ height: '280px' }} />

						{/* Аватарки */}
						<div
							style={{
								position: 'relative',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: '20px',
								zIndex: 4,
							}}
						>
							{/* Первая аватарка (текущий пользователь) */}
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

							{/* Вторая аватарка (целевой пользователь) - налазит на первую */}
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
							}}
						>
							{getGenderText()}
						</p>
					</div>

					{/* Кнопка - прижата к низу */}
					<button
						onClick={handleSend}
						style={{
							width: '100%',
							maxWidth: '450px',
							height: '72px',
							borderRadius: '28px',
							marginBottom: '20px',
							border: 'none',
							backgroundColor: '#F23318',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							cursor: 'pointer',
							boxShadow: '0 4px 52px rgba(242, 51, 24, 0.15)',
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
						Ты мне нравишься!
					</button>
				</div>
			</div>

			{/* CSS Animations */}
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

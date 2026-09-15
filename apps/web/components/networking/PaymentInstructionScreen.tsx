'use client'

import { useEffect, useState } from 'react'

interface PaymentInstructionScreenProps {
	isOpen: boolean
	onClose: () => void
}

export default function PaymentInstructionScreen({
	isOpen,
	onClose,
}: PaymentInstructionScreenProps) {
	const [isAnimating, setIsAnimating] = useState(false)

	useEffect(() => {
		if (isOpen) {
			// Небольшая задержка для плавной анимации
			setTimeout(() => {
				setIsAnimating(true)
			}, 10)
		} else {
			setIsAnimating(false)
		}
	}, [isOpen])

	if (!isOpen) return null

	const handleClose = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
			tg.openTelegramLink('https://t.me/match_msd_bot')
		} else {
			onClose()
		}
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 99999,
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: '#121212',
				backgroundImage: 'url(/full_netw_bg.webp)',
				backgroundSize: '100% auto',
				backgroundPosition: 'top center',
				backgroundRepeat: 'no-repeat',
				opacity: isAnimating ? 1 : 0,
				transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
				transition:
					'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			{/* Кнопка закрытия */}
			<div
				style={{
					position: 'absolute',
					top: '60px',
					left: 0,
					right: 0,
					zIndex: 100000,
					display: 'flex',
					justifyContent: 'center',
					opacity: isAnimating ? 1 : 0,
					transition:
						'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
				}}
			>
				<button
					onClick={handleClose}
					style={{
						width: '46px',
						height: '46px',
						borderRadius: '50%',
						backgroundColor: 'rgba(252, 249, 247, 0.15)',
						border: 'none',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						backdropFilter: 'blur(10px)',
						transition: 'all 0.2s',
					}}
					onMouseDown={e => {
						e.currentTarget.style.transform = 'scale(0.95)'
						e.currentTarget.style.backgroundColor = 'rgba(252, 249, 247, 0.25)'
					}}
					onMouseUp={e => {
						e.currentTarget.style.transform = 'scale(1)'
						e.currentTarget.style.backgroundColor = 'rgba(252, 249, 247, 0.15)'
					}}
					onMouseLeave={e => {
						e.currentTarget.style.transform = 'scale(1)'
						e.currentTarget.style.backgroundColor = 'rgba(252, 249, 247, 0.15)'
					}}
					onTouchStart={e => {
						e.currentTarget.style.transform = 'scale(0.95)'
						e.currentTarget.style.backgroundColor = 'rgba(252, 249, 247, 0.25)'
					}}
					onTouchEnd={e => {
						e.currentTarget.style.transform = 'scale(1)'
						e.currentTarget.style.backgroundColor = 'rgba(252, 249, 247, 0.15)'
					}}
				>
					<svg
						width='18'
						height='18'
						viewBox='0 0 18 18'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<line
							x1='1.41421'
							y1='1'
							x2='17'
							y2='16.5858'
							stroke='#FCF9F7'
							strokeWidth='2'
							strokeLinecap='round'
						/>
						<line
							x1='1'
							y1='16.5858'
							x2='16.5858'
							y2='1'
							stroke='#FCF9F7'
							strokeWidth='2'
							strokeLinecap='round'
						/>
					</svg>
				</button>
			</div>

			{/* Контент */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 24px',
					opacity: isAnimating ? 1 : 0,
					transform: isAnimating ? 'translateY(0)' : 'translateY(30px)',
					transition:
						'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
				}}
			>
				{/* Стрелка вверх */}
				<div
					style={{
						marginBottom: '40px',
						opacity: isAnimating ? 1 : 0,
						transform: isAnimating
							? 'translateY(0) scale(1)'
							: 'translateY(20px) scale(0.8)',
						transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
					}}
				>
					<svg
						width='80'
						height='80'
						viewBox='0 0 80 80'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						style={{
							filter: 'drop-shadow(0 4px 20px rgba(247, 113, 11, 0.4))',
							animation: isAnimating
								? 'bounce 2s ease-in-out infinite'
								: 'none',
						}}
					>
						<path
							d='M40 10L40 70M40 10L20 30M40 10L60 30'
							stroke='url(#gradient)'
							strokeWidth='6'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<defs>
							<linearGradient
								id='gradient'
								x1='40'
								y1='10'
								x2='40'
								y2='70'
								gradientUnits='userSpaceOnUse'
							>
								<stop offset='0%' stopColor='#F7710B' />
								<stop offset='100%' stopColor='#F23318' />
							</linearGradient>
						</defs>
					</svg>
				</div>

				{/* Заголовок */}
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '48px',
						lineHeight: '1.1',
						textTransform: 'uppercase',
						color: '#F7710B',
						textAlign: 'center',
						marginBottom: '24px',
						opacity: isAnimating ? 1 : 0,
						transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
						transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
					}}
				>
					СВЕРНИТЕ
					<br />
					ПРИЛОЖЕНИЕ
				</h1>

				{/* Текст */}
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						color: '#FCF9F7',
						textAlign: 'center',
						fontSize: '18px',
						lineHeight: '1.6',
						marginBottom: '16px',
						opacity: isAnimating ? 1 : 0,
						transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
						transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s',
					}}
				>
					Ссылка на оплату
					<br />
					отправлена в бот
				</p>

				{/* Подсказка */}
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						color: 'rgba(252, 249, 247, 0.6)',
						textAlign: 'center',
						fontSize: '14px',
						opacity: isAnimating ? 1 : 0,
						transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
						transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
					}}
				>
					Нажмите на крестик чтобы свернуть
				</p>
			</div>

			{/* CSS анимация для стрелки */}
			<style>{`
				@keyframes bounce {
					0%, 100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-15px);
					}
				}
			`}</style>
		</div>
	)
}

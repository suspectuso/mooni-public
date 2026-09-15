'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'

// Вынесли стили наружу
const containerStyles = {
	minHeight: '100vh',
	backgroundColor: '#121212',
	display: 'flex',
	flexDirection: 'column' as const,
	alignItems: 'center',
	padding: '20px 20px 40px',
	maxWidth: '480px',
	margin: '0 auto',
	overflowY: 'auto' as const,
	overflowX: 'hidden' as const,
	WebkitOverflowScrolling: 'touch' as const,
}

const buttonContainerStyles = {
	width: '100%',
	maxWidth: '400px',
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	marginBottom: '30px',
	paddingLeft: '10px',
}


const logoContainerStyles = { marginBottom: '30px' }

const subtitleStyles = {
	fontFamily: 'LT Superior, sans-serif',
	fontSize: '28px',
	color: '#FCF9F7',
	textAlign: 'center' as const,
	marginBottom: '60px',
	fontWeight: 400,
	lineHeight: '1.3',
}

const gridStyles = {
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: '16px',
	width: '100%',
	maxWidth: '400px',
	marginBottom: '16px',
}

const linkStyles = {
	display: 'block',
	transition: 'transform 0.2s',
}

const trackerButtonStyles = {
	backgroundColor: '#fc2a0d',
	borderRadius: '50px',
	padding: '18px 40px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	border: 'none',
	cursor: 'pointer',
	transition: 'transform 0.2s',
	width: '100%',
	maxWidth: '400px',
	marginBottom: '16px',
	textDecoration: 'none',
}

const requestButtonStyles = {
	backgroundColor: '#272727',
	borderRadius: '50px',
	padding: '18px 40px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '12px',
	border: 'none',
	cursor: 'pointer',
	transition: 'transform 0.2s',
	width: '100%',
	maxWidth: '400px',
}

export default function EcosystemPage() {
	const [showModal, setShowModal] = useState(false)

	const handleClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
		}
	}, [])

	const handleBackClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
		}
		window.location.href = '/'
	}, [])

	const handlePlusClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
		}
		setShowModal(true)
	}, [])

	const handleCloseModal = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
		}
		setShowModal(false)
	}, [])

	const handleRequestClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
			window.Telegram.WebApp.openTelegramLink('https://t.me/match_freelance')
		}
	}, [])

	return (
		<div style={containerStyles}>
			{/* Кнопка назад */}
			<div style={buttonContainerStyles}>
				<button
					onClick={handleBackClick}
					style={{
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						padding: 0,
					}}
				>
					<img
						src='/back.webp'
						alt='Назад'
						width={80}
						height={80}
						style={{ cursor: 'pointer', width: '80px', height: 'auto' }}
					/>
				</button>
			</div>

			{/* Логотип МЭТЧ */}
			<div style={logoContainerStyles}>
				<img src='/logo.svg' alt='МЭТЧ' width={250} height={100} />
			</div>

			{/* Подзаголовок */}
			<h2 style={subtitleStyles}>
				Экосистема
				<br />
				совместного развития
			</h2>

			{/* Сетка навигации 2x2 */}
			<div style={gridStyles}>
				{/* Работа */}
				<Link
					href='/work'
					onClick={handleClick}
					style={linkStyles}
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
					<img
						src='/nav_biz_work.webp'
						alt='Работа'
						width={200}
						height={200}
						loading='lazy'
						style={{ width: '100%', height: 'auto' }}
					/>
				</Link>

				{/* Обучение */}
				<Link
					href='/education'
					onClick={handleClick}
					style={linkStyles}
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
					<img
						src='/nav_biz_edu.webp'
						alt='Обучение'
						width={200}
						height={200}
						loading='lazy'
						style={{ width: '100%', height: 'auto' }}
					/>
				</Link>

				{/* Нетворкинг */}
				<Link
					href='/networking'
					onClick={handleClick}
					style={linkStyles}
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
					<img
						src='/nav_biz_netw.webp'
						alt='Нетворкинг'
						width={200}
						height={200}
						loading='lazy'
						style={{ width: '100%', height: 'auto' }}
					/>
				</Link>

				{/* Match Radar */}
				<Link
					href='/radar'
					onClick={handleClick}
					style={linkStyles}
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
					<img
						src='/nav_biz_radar.webp'
						alt='Match Radar'
						width={200}
						height={200}
						loading='lazy'
						style={{ width: '100%', height: 'auto' }}
					/>
				</Link>
			</div>

			{/* Кнопка "Трекер привычек" */}
			<Link
				href='/tracker'
				onClick={handleClick}
				style={trackerButtonStyles}
				onMouseDown={e => {
					e.currentTarget.style.transform = 'scale(0.95)'
				}}
				onMouseUp={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
			>
				<span
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '20px',
						color: '#E3F040',
						textTransform: 'uppercase',
					}}
				>
					Трекер привычек
				</span>
			</Link>

			{/* Кнопка "Отправить запрос" */}
			<button
				onClick={handleRequestClick}
				style={requestButtonStyles}
				onMouseDown={e => {
					e.currentTarget.style.transform = 'scale(0.95)'
				}}
				onMouseUp={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
			>
				<img src='/hand.svg' alt='Hand' width={24} height={24} />
				<span
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '20px',
						color: '#E3F040',
					}}
				>
					ОТПРАВИТЬ ЗАПРОС
				</span>
			</button>

			{/* Modal */}
			{showModal && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.95)',
						zIndex: 9999,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'flex-end',
					}}
					onClick={handleCloseModal}
				>
					{/* Modal Content */}
					<div
						onClick={e => e.stopPropagation()}
						style={{
							position: 'relative',
							width: '100%',
							height: '95vh',
							backgroundColor: '#1D1D1B',
							borderTopLeftRadius: '30px',
							borderTopRightRadius: '30px',
							padding: '40px 20px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
						}}
					>
						{/* Close button */}
						<button
							onClick={handleCloseModal}
							style={{
								position: 'absolute',
								top: '20px',
								right: '20px',
								background: 'rgba(252, 249, 247, 0.1)',
								border: 'none',
								borderRadius: '50%',
								width: '40px',
								height: '40px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								zIndex: 10,
							}}
						>
							<svg
								width='20'
								height='20'
								viewBox='0 0 20 20'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M15 5L5 15M5 5L15 15'
									stroke='#FCF9F7'
									strokeWidth='2'
									strokeLinecap='round'
								/>
							</svg>
						</button>

						{/* Content Container */}
						<div
							style={{
								position: 'relative',
								zIndex: 1,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								width: '100%',
								maxWidth: '400px',
							}}
						>
							{/* 4 icons - not aligned, different sizes, closer to edges */}
							<div
								style={{
									position: 'relative',
									width: '100%',
									height: '280px',
									marginBottom: '60px',
								}}
							>
								{/* Top left - Networking (z-index 3) */}
								<div
									style={{
										position: 'absolute',
										top: '0px',
										left: '5px',
										zIndex: 3,
									}}
								>
									<img
										src='/+m_netw.webp'
										alt='Нетворкинг'
										width={105}
										height={105}
										style={{ width: '105px', height: '105px' }}
									/>
								</div>

								{/* Top right - Education (z-index 3) */}
								<div
									style={{
										position: 'absolute',
										top: '15px',
										right: '0px',
										zIndex: 3,
									}}
								>
									<img
										src='/+m_edu.webp'
										alt='Обучение'
										width={135}
										height={135}
										style={{ width: '135px', height: '135px' }}
									/>
								</div>

								{/* Background Text (z-index 2 - between top and bottom icons) */}
								<div
									style={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
										fontFamily: 'Oks, sans-serif',
										fontSize: 'clamp(80px, 20vw, 175px)',
										color: '#FCF9F7',

										textAlign: 'center',
										lineHeight: '0.9',
										pointerEvents: 'none',
										whiteSpace: 'nowrap',
										zIndex: 2,
									}}
								>
									МЭТЧ
									<br />
									ПОДПИСКА
								</div>

								{/* Bottom left - Tracker (z-index 1) */}
								<div
									style={{
										position: 'absolute',
										bottom: '-50px',
										left: '20px',
										zIndex: 1,
									}}
								>
									<img
										src='/+m_tracker.webp'
										alt='Трекер'
										width={125}
										height={125}
										style={{ width: '125px', height: '125px' }}
									/>
								</div>

								{/* Bottom right - Work (z-index 1) */}
								<div
									style={{
										position: 'absolute',
										bottom: '-60px',
										right: '10px',
										zIndex: 1,
									}}
								>
									<img
										src='/+m_work.webp'
										alt='Работа'
										width={110}
										height={110}
										style={{ width: '110px', height: '110px' }}
									/>
								</div>
							</div>

							{/* Lock icon */}
							<div style={{ marginBottom: '24px' }}>
								<img
									src='/subs_modal.png'
									alt='Lock'
									width={138}
									height={58}
									style={{ width: '137.75px', height: '57.91px' }}
								/>
							</div>

							{/* Text */}
							<p
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontWeight: 900,
									fontSize: '24px',
									color: '#FCF9F7',
									textAlign: 'center',
									marginBottom: '50px',
								}}
							>
								Будет доступно скоро
							</p>

							{/* Button */}
							<button
								onClick={handleCloseModal}
								style={{
									backgroundColor: '#272727',
									border: 'none',
									borderRadius: '50px',
									padding: '16px 60px',
									fontFamily: 'Oks, sans-serif',
									fontSize: '18px',
									color: '#FCF9F7',
									cursor: 'pointer',
									width: '100%',
									maxWidth: '300px',
								}}
							>
								Понятно
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

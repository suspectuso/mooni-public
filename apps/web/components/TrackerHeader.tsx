'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TrackerHeader() {
	const pathname = usePathname()
	const router = useRouter()
	const [showModal, setShowModal] = useState(false)

	// Main navigation pages (show menu button)
	const mainPages = [
		'/tracker',
		'/tracker/habits',
		'/tracker/leaderboard',
		'/tracker/profile',
		'/tracker/sprints',
	]
	const isMainPage = mainPages.some(page => pathname === page)

	const handleBackClick = () => {
		router.back()
	}

	const handlePlusClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')
		setShowModal(true)
	}

	const handleCloseModal = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')
		setShowModal(false)
	}

	return (
		<>
			<div
				style={{
					padding: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
					{/* +M Icon - clickable */}
					<button
						onClick={handlePlusClick}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: 0,
						}}
					>
						<img
							src='/+m_habits.webp'
							alt='+M'
							width={50}
							height={50}
							style={{ width: '50px', height: '50px', marginBottom: '20px' }}
						/>
					</button>

					{/* Logo (white) */}
					<img
						src='/logo.svg'
						alt='МЭТЧ'
						width={120}
						height={48}
						style={{ filter: 'brightness(0) invert(1)' }}
					/>
				</div>

				{/* Menu or Back Button */}
				{isMainPage ? (
					<a href='/'>
						<img
							src='/menu.webp'
							alt='Меню'
							width={80}
							height={80}
							style={{ cursor: 'pointer', width: '80px', height: 'auto' }}
						/>
					</a>
				) : (
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
				)}
			</div>

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
										src='/+m_habits.webp'
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
		</>
	)
}

'use client'

import { useEffect, useState } from 'react'

interface RewindExhaustedModalProps {
	isOpen: boolean
	onClose: () => void
	onSubscribe: () => void
	nextResetDate?: string // ISO date when rewinds reset
}

export default function RewindExhaustedModal({
	isOpen,
	onClose: _onClose,
	onSubscribe,
	nextResetDate,
}: RewindExhaustedModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setIsAnimating(true), 10)
		} else {
			setIsAnimating(false)
		}
	}, [isOpen])

	if (!isOpen) return null

	const formatResetDate = () => {
		if (!nextResetDate) {
			const now = new Date()
			const next = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
			return `${String(next.getDate()).padStart(2, '0')}.${String(next.getMonth() + 1).padStart(2, '0')}.${next.getFullYear()}`
		}
		const date = new Date(nextResetDate)
		return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
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
				backgroundColor: 'rgba(0,0,0,0.6)',
				opacity: isAnimating ? 1 : 0,
				transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
			}}
		>
			{/* Full-screen sheet */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: '#121212',
					display: 'flex',
					flexDirection: 'column',
					transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
					transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				}}
			>
					{/* Content */}
				<div
					style={{
						position: 'relative',
						zIndex: 2,
						display: 'flex',
						flexDirection: 'column',
						height: '100%',
						padding: '0 24px',
					}}
				>
					{/* Title */}
					<div style={{ paddingTop: 'calc(var(--tg-safe-top, 0px) + 60px)' }}>
						<h1
							style={{
								fontFamily: 'Oks, sans-serif',
								fontSize: '72px',
								lineHeight: 0.85,
								color: '#FCF9F7',
								margin: 0,
								textAlign: 'center',
								textTransform: 'uppercase',
							}}
						>
							Ой, у вас закончились возвраты
						</h1>
					</div>

					{/* Subtitle */}
					<p
						style={{
							fontFamily: "'Zen Kaku Gothic New', sans-serif",
							fontWeight: 500,
							fontSize: '18px',
							lineHeight: 1.3,
							color: '#FCF9F7',
							textAlign: 'center',
							margin: '24px 0 0 0',
						}}
					>
						Оформите подписку НЕТВОРКИНГ+, чтобы получить ∞ возвратов в месяц
					</p>

					{/* Decorative rewind buttons */}
					<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<div style={{ position: 'relative', width: '280px', height: '200px' }}>
							{/* Center large button */}
							<div
								style={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%) rotate(-5deg)',
									width: '160px',
									height: '156px',
									borderRadius: '50%',
									background: 'rgba(252, 249, 247, 0.05)',
									border: '1px solid rgba(217, 217, 217, 0.08)',
									opacity: 0.4,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg width="93" height="56" viewBox="0 0 126.567 75.9401" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M22.7029 36.9216L38.2865 52.2949C38.8694 52.8307 39.3369 53.4769 39.6612 54.1948C39.9854 54.9127 40.1598 55.6878 40.1738 56.4736C40.1879 57.2595 40.0414 58.0401 39.743 58.7688C39.4446 59.4976 39.0004 60.1596 38.4371 60.7154C37.8737 61.2712 37.2026 61.7093 36.4639 62.0037C35.7252 62.298 34.9339 62.4426 34.1373 62.4287C33.3407 62.4149 32.5551 62.2428 31.8273 61.923C31.0996 61.6031 30.4446 61.1418 29.9014 60.5668L4.19253 35.2048L0 31.0688L4.19253 26.9329L29.9014 1.57082C31.0261 0.536987 32.5136 -0.0258409 34.0506 0.000911839C35.5876 0.0276646 37.0541 0.64191 38.1411 1.71424C39.2281 2.78657 39.8507 4.23326 39.8779 5.74953C39.905 7.2658 39.3344 8.73326 38.2865 9.84275L22.7029 25.216H100.858C107.676 25.216 114.216 27.8881 119.037 32.6444C123.858 37.4007 126.567 43.8517 126.567 50.5781C126.567 57.3045 123.858 63.7554 119.037 68.5117C114.216 73.2681 107.676 75.9401 100.858 75.9401H85.0371C83.4636 75.9401 81.9546 75.3235 80.842 74.2259C79.7294 73.1283 79.1043 71.6396 79.1043 70.0873C79.1043 68.5351 79.7294 67.0464 80.842 65.9488C81.9546 64.8512 83.4636 64.2346 85.0371 64.2346H100.858C104.529 64.2346 108.051 62.7958 110.647 60.2347C113.243 57.6736 114.701 54.2 114.701 50.5781C114.701 46.9562 113.243 43.4826 110.647 40.9215C108.051 38.3604 104.529 36.9216 100.858 36.9216H22.7029Z" fill="rgba(252, 249, 247, 0.65)"/>
								</svg>
								{/* Badge with 0 */}
								<div
									style={{
										position: 'absolute',
										top: '2px',
										right: '8px',
										width: '48px',
										height: '48px',
										borderRadius: '50%',
										background: 'rgba(252, 249, 247, 0.65)',
										backdropFilter: 'blur(20px)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<span
										style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '32px',
											color: '#121212',
											lineHeight: 1,
										}}
									>
										0
									</span>
								</div>
							</div>

							{/* Left small button */}
							<div
								style={{
									position: 'absolute',
									top: '55%',
									left: '0',
									transform: 'translate(0, -50%) rotate(6deg)',
									width: '72px',
									height: '70px',
									borderRadius: '50%',
									background: 'rgba(252, 249, 247, 0.05)',
									border: '1px solid rgba(217, 217, 217, 0.05)',
									opacity: 0.22,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg width="42" height="25" viewBox="0 0 56.7874 34.0724" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M10.1862 16.5658L17.1782 23.4634C17.4397 23.7038 17.6495 23.9937 17.795 24.3159C17.9405 24.638 18.0187 24.9857 18.025 25.3383C18.0313 25.6909 17.9656 26.0411 17.8317 26.3681C17.6978 26.6951 17.4985 26.9921 17.2458 27.2415C16.993 27.4908 16.6919 27.6874 16.3604 27.8195C16.029 27.9516 15.674 28.0164 15.3165 28.0102C14.9591 28.004 14.6066 27.9268 14.2801 27.7833C13.9536 27.6398 13.6597 27.4328 13.416 27.1748L1.88108 15.7955L0 13.9398L1.88108 12.0841L13.416 0.704789C13.9206 0.240933 14.588 -0.0115942 15.2777 0.00040912C15.9673 0.0124124 16.6253 0.288009 17.113 0.769137C17.6007 1.25026 17.88 1.89936 17.8922 2.57967C17.9044 3.25998 17.6484 3.91839 17.1782 4.4162L10.1862 11.3138H45.2525C48.3117 11.3138 51.2457 12.5127 53.4089 14.6467C55.5721 16.7808 56.7874 19.6751 56.7874 22.6931C56.7874 25.7111 55.5721 28.6055 53.4089 30.7395C51.2457 32.8735 48.3117 34.0724 45.2525 34.0724H38.154C37.448 34.0724 36.771 33.7958 36.2718 33.3033C35.7726 32.8108 35.4921 32.1429 35.4921 31.4464C35.4921 30.75 35.7726 30.0821 36.2718 29.5896C36.771 29.0971 37.448 28.8204 38.154 28.8204H45.2525C46.8997 28.8204 48.4796 28.1749 49.6444 27.0258C50.8092 25.8767 51.4636 24.3182 51.4636 22.6931C51.4636 21.0681 50.8092 19.5095 49.6444 18.3605C48.4796 17.2114 46.8997 16.5658 45.2525 16.5658H10.1862Z" fill="rgba(252, 249, 247, 0.65)"/>
								</svg>
								<div
									style={{
										position: 'absolute',
										top: '1px',
										right: '2px',
										width: '22px',
										height: '22px',
										borderRadius: '50%',
										background: 'rgba(252, 249, 247, 0.65)',
										backdropFilter: 'blur(9px)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<span
										style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '14px',
											color: '#121212',
											lineHeight: 1,
										}}
									>
										0
									</span>
								</div>
							</div>

							{/* Right small button */}
							<div
								style={{
									position: 'absolute',
									top: '55%',
									right: '0',
									transform: 'translate(0, -50%) rotate(6deg)',
									width: '72px',
									height: '70px',
									borderRadius: '50%',
									background: 'rgba(252, 249, 247, 0.05)',
									border: '1px solid rgba(217, 217, 217, 0.05)',
									opacity: 0.22,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg width="42" height="25" viewBox="0 0 56.7874 34.0724" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path fillRule="evenodd" clipRule="evenodd" d="M10.1862 16.5658L17.1782 23.4634C17.4397 23.7038 17.6495 23.9937 17.795 24.3159C17.9405 24.638 18.0187 24.9857 18.025 25.3383C18.0313 25.6909 17.9656 26.0411 17.8317 26.3681C17.6978 26.6951 17.4985 26.9921 17.2458 27.2415C16.993 27.4908 16.6919 27.6874 16.3604 27.8195C16.029 27.9516 15.674 28.0164 15.3165 28.0102C14.9591 28.004 14.6066 27.9268 14.2801 27.7833C13.9536 27.6398 13.6597 27.4328 13.416 27.1748L1.88108 15.7955L0 13.9398L1.88108 12.0841L13.416 0.704789C13.9206 0.240933 14.588 -0.0115942 15.2777 0.00040912C15.9673 0.0124124 16.6253 0.288009 17.113 0.769137C17.6007 1.25026 17.88 1.89936 17.8922 2.57967C17.9044 3.25998 17.6484 3.91839 17.1782 4.4162L10.1862 11.3138H45.2525C48.3117 11.3138 51.2457 12.5127 53.4089 14.6467C55.5721 16.7808 56.7874 19.6751 56.7874 22.6931C56.7874 25.7111 55.5721 28.6055 53.4089 30.7395C51.2457 32.8735 48.3117 34.0724 45.2525 34.0724H38.154C37.448 34.0724 36.771 33.7958 36.2718 33.3033C35.7726 32.8108 35.4921 32.1429 35.4921 31.4464C35.4921 30.75 35.7726 30.0821 36.2718 29.5896C36.771 29.0971 37.448 28.8204 38.154 28.8204H45.2525C46.8997 28.8204 48.4796 28.1749 49.6444 27.0258C50.8092 25.8767 51.4636 24.3182 51.4636 22.6931C51.4636 21.0681 50.8092 19.5095 49.6444 18.3605C48.4796 17.2114 46.8997 16.5658 45.2525 16.5658H10.1862Z" fill="rgba(252, 249, 247, 0.65)"/>
								</svg>
								<div
									style={{
										position: 'absolute',
										top: '1px',
										right: '2px',
										width: '22px',
										height: '22px',
										borderRadius: '50%',
										background: 'rgba(252, 249, 247, 0.65)',
										backdropFilter: 'blur(9px)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<span
										style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '14px',
											color: '#121212',
											lineHeight: 1,
										}}
									>
										0
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom buttons */}
					<div
						style={{
							paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
							display: 'flex',
							gap: '8px',
						}}
					>
						{/* Subscribe button (orange gradient) */}
						<button
							onClick={onSubscribe}
							style={{
								width: '72px',
								height: '72px',
								borderRadius: '28px',
								border: 'none',
								background: 'linear-gradient(270deg, rgb(247, 113, 11) 0%, rgb(242, 51, 24) 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								flexShrink: 0,
								transition: 'transform 0.2s',
							}}
							onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)' }}
							onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
							onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
						>
							<span
								style={{
									fontFamily: "'Zen Kaku Gothic New', sans-serif",
									fontWeight: 900,
									fontSize: '32px',
									color: '#FCF9F7',
									lineHeight: 1,
								}}
							>
								∞
							</span>
						</button>

						{/* Reset date pill */}
						<div
							style={{
								flex: 1,
								height: '72px',
								borderRadius: '28px',
								backgroundColor: 'rgba(252, 249, 247, 0.15)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<span
								style={{
									fontFamily: "'Zen Kaku Gothic New', sans-serif",
									fontWeight: 900,
									fontSize: '18px',
									color: 'rgba(252, 249, 247, 0.45)',
								}}
							>
								Новые возвраты {formatResetDate()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

'use client'

import { useEffect, useState } from 'react'

interface MissedMatchOnboardingModalProps {
	isOpen: boolean
	onClose: () => void
	onUseRewind: () => void
	rewindCount: number
	hasActiveSubscription: boolean
	lastSkippedProfile?: {
		photos: string[]
		firstName: string
		skills?: string[]
		city?: string
	} | null
}

export default function MissedMatchOnboardingModal({
	isOpen,
	onClose,
	onUseRewind,
	rewindCount,
	hasActiveSubscription,
	lastSkippedProfile,
}: MissedMatchOnboardingModalProps) {
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

	const remainingRewinds = hasActiveSubscription ? '∞' : Math.max(0, 3 - rewindCount)
	const profilePhoto = lastSkippedProfile?.photos?.[0]
	const profileName = lastSkippedProfile?.firstName || ''
	const profileSkills = lastSkippedProfile?.skills || []
	const profileCity = lastSkippedProfile?.city || ''

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
					overflow: 'hidden',
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
								fontSize: '80px',
								lineHeight: 0.8,
								color: '#FCF9F7',
								margin: 0,
								textAlign: 'center',
								textTransform: 'lowercase',
							}}
						>
							вернуться назад
						</h1>
					</div>

					{/* Card preview area */}
					<div style={{
						flex: 1,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
						minHeight: 0,
					}}>
						<div style={{
							position: 'relative',
							width: '280px',
							height: '400px',
						}}>
							{/* Background ghost cards */}
							<div style={{
								position: 'absolute',
								top: '10px',
								left: '50%',
								transform: 'translateX(-50%) rotate(-9deg)',
								width: '240px',
								height: '360px',
								borderRadius: '16px',
								background: 'rgba(252, 249, 247, 0.05)',
								opacity: 0.3,
								filter: 'blur(1px)',
							}} />
							<div style={{
								position: 'absolute',
								top: '5px',
								left: '50%',
								transform: 'translateX(-50%) rotate(-5deg)',
								width: '245px',
								height: '365px',
								borderRadius: '16px',
								background: 'rgba(252, 249, 247, 0.08)',
								opacity: 0.4,
							}} />

							{/* Main card */}
							<div style={{
								position: 'absolute',
								top: 0,
								left: '50%',
								transform: 'translateX(-50%) rotate(-4deg)',
								width: '250px',
								height: '370px',
								borderRadius: '16px',
								overflow: 'hidden',
								mixBlendMode: 'luminosity',
							}}>
								{profilePhoto ? (
									<img
										src={profilePhoto}
										alt=""
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
								) : (
									<div style={{
										width: '100%',
										height: '100%',
										background: 'linear-gradient(225deg, rgb(242, 51, 24) 1%, rgb(18, 18, 18) 68%)',
									}} />
								)}

								{/* Gradient overlay */}
								<div style={{
									position: 'absolute',
									bottom: 0,
									left: 0,
									right: 0,
									height: '60%',
									background: 'linear-gradient(to top, rgba(18,18,18,0.9) 0%, transparent 100%)',
								}} />

								{/* Name */}
								{profileName && (
									<p style={{
										position: 'absolute',
										bottom: '80px',
										left: '16px',
										fontFamily: 'Oks, sans-serif',
										fontSize: '32px',
										lineHeight: 0.9,
										color: '#FCF9F7',
										margin: 0,
										opacity: 0.65,
									}}>
										{profileName}
									</p>
								)}

								{/* City */}
								{profileCity && (
									<div style={{
										position: 'absolute',
										bottom: '55px',
										left: '16px',
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
									}}>
										<svg width="8" height="11" viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M4 0C1.79 0 0 1.79 0 4C0 7 4 11 4 11C4 11 8 7 8 4C8 1.79 6.21 0 4 0ZM4 5.5C3.17 5.5 2.5 4.83 2.5 4C2.5 3.17 3.17 2.5 4 2.5C4.83 2.5 5.5 3.17 5.5 4C5.5 4.83 4.83 5.5 4 5.5Z" fill="rgba(252,249,247,0.65)"/>
										</svg>
										<span style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '11px',
											color: 'rgba(252, 249, 247, 0.65)',
										}}>
											{profileCity}
										</span>
									</div>
								)}

								{/* Skills */}
								{profileSkills.length > 0 && (
									<div style={{
										position: 'absolute',
										bottom: '12px',
										left: '16px',
										right: '16px',
										display: 'flex',
										flexWrap: 'wrap',
										gap: '4px',
									}}>
										{profileSkills.slice(0, 3).map((skill, i) => (
											<div key={i} style={{
												padding: '5px 10px',
												borderRadius: '14px',
												background: 'rgba(252, 249, 247, 0.1)',
												backdropFilter: 'blur(16px)',
											}}>
												<span style={{
													fontFamily: "'Zen Kaku Gothic New', sans-serif",
													fontWeight: 900,
													fontSize: '11px',
													color: 'rgba(252, 249, 247, 0.65)',
												}}>
													{skill}
												</span>
											</div>
										))}
									</div>
								)}

								{/* Dark overlay on card */}
								<div style={{
									position: 'absolute',
									inset: 0,
									background: 'rgba(18, 18, 18, 0.5)',
									borderRadius: '16px',
								}} />
							</div>

							{/* Bubble "Вы пропустили МЭТЧ" */}
							<div style={{
								position: 'absolute',
								top: '-20px',
								right: '-30px',
								zIndex: 5,
								transform: 'rotate(6deg)',
							}}>
								<div style={{ position: 'relative', width: '180px' }}>
									<img
										src="/missed_match_bubble.png"
										alt=""
										style={{ width: '100%', height: 'auto', display: 'block' }}
									/>
									<span style={{
										position: 'absolute',
										top: '38%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
										fontFamily: "'Zen Kaku Gothic New', sans-serif",
										fontWeight: 900,
										fontSize: '14px',
										color: '#121212',
										whiteSpace: 'nowrap',
									}}>
										Вы пропустили МЭТЧ
									</span>
								</div>
							</div>

							{/* Rewind buttons decoration */}
							{/* Big rewind */}
							<div style={{
								position: 'absolute',
								top: '25%',
								right: '-45px',
								zIndex: 4,
								transform: 'rotate(6deg)',
							}}>
								<div style={{
									width: '90px',
									height: '88px',
									borderRadius: '50%',
									background: 'rgba(247, 113, 11, 0.65)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									position: 'relative',
								}}>
									<svg width="42" height="25" viewBox="0 0 56.7874 34.0724" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fillRule="evenodd" clipRule="evenodd" d="M10.1862 16.5658L17.1782 23.4634C17.4397 23.7038 17.6495 23.9937 17.795 24.3159C17.9405 24.638 18.0187 24.9857 18.025 25.3383C18.0313 25.6909 17.9656 26.0411 17.8317 26.3681C17.6978 26.6951 17.4985 26.9921 17.2458 27.2415C16.993 27.4908 16.6919 27.6874 16.3604 27.8195C16.029 27.9516 15.674 28.0164 15.3165 28.0102C14.9591 28.004 14.6066 27.9268 14.2801 27.7833C13.9536 27.6398 13.6597 27.4328 13.416 27.1748L1.88108 15.7955L0 13.9398L1.88108 12.0841L13.416 0.704789C13.9206 0.240933 14.588 -0.0115942 15.2777 0.00040912C15.9673 0.0124124 16.6253 0.288009 17.113 0.769137C17.6007 1.25026 17.88 1.89936 17.8922 2.57967C17.9044 3.25998 17.6484 3.91839 17.1782 4.4162L10.1862 11.3138H45.2525C48.3117 11.3138 51.2457 12.5127 53.4089 14.6467C55.5721 16.7808 56.7874 19.6751 56.7874 22.6931C56.7874 25.7111 55.5721 28.6055 53.4089 30.7395C51.2457 32.8735 48.3117 34.0724 45.2525 34.0724H38.154C37.448 34.0724 36.771 33.7958 36.2718 33.3033C35.7726 32.8108 35.4921 32.1429 35.4921 31.4464C35.4921 30.75 35.7726 30.0821 36.2718 29.5896C36.771 29.0971 37.448 28.8204 38.154 28.8204H45.2525C46.8997 28.8204 48.4796 28.1749 49.6444 27.0258C50.8092 25.8767 51.4636 24.3182 51.4636 22.6931C51.4636 21.0681 50.8092 19.5095 49.6444 18.3605C48.4796 17.2114 46.8997 16.5658 45.2525 16.5658H10.1862Z" fill="rgba(252, 249, 247, 0.85)"/>
									</svg>
									{/* Badge */}
									<div style={{
										position: 'absolute',
										top: '-2px',
										right: '-2px',
										width: '28px',
										height: '28px',
										borderRadius: '50%',
										background: 'rgba(252, 249, 247, 0.65)',
										backdropFilter: 'blur(11px)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}>
										<span style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '18px',
											color: '#121212',
											lineHeight: 1,
										}}>
											3
										</span>
									</div>
								</div>
							</div>

							{/* Medium rewind */}
							<div style={{
								position: 'absolute',
								top: '48%',
								right: '-55px',
								zIndex: 3,
								transform: 'rotate(-30deg)',
							}}>
								<div style={{
									width: '62px',
									height: '60px',
									borderRadius: '50%',
									background: 'rgba(247, 113, 11, 0.65)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									position: 'relative',
								}}>
									<svg width="28" height="17" viewBox="0 0 56.7874 34.0724" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fillRule="evenodd" clipRule="evenodd" d="M10.1862 16.5658L17.1782 23.4634C17.4397 23.7038 17.6495 23.9937 17.795 24.3159C17.9405 24.638 18.0187 24.9857 18.025 25.3383C18.0313 25.6909 17.9656 26.0411 17.8317 26.3681C17.6978 26.6951 17.4985 26.9921 17.2458 27.2415C16.993 27.4908 16.6919 27.6874 16.3604 27.8195C16.029 27.9516 15.674 28.0164 15.3165 28.0102C14.9591 28.004 14.6066 27.9268 14.2801 27.7833C13.9536 27.6398 13.6597 27.4328 13.416 27.1748L1.88108 15.7955L0 13.9398L1.88108 12.0841L13.416 0.704789C13.9206 0.240933 14.588 -0.0115942 15.2777 0.00040912C15.9673 0.0124124 16.6253 0.288009 17.113 0.769137C17.6007 1.25026 17.88 1.89936 17.8922 2.57967C17.9044 3.25998 17.6484 3.91839 17.1782 4.4162L10.1862 11.3138H45.2525C48.3117 11.3138 51.2457 12.5127 53.4089 14.6467C55.5721 16.7808 56.7874 19.6751 56.7874 22.6931C56.7874 25.7111 55.5721 28.6055 53.4089 30.7395C51.2457 32.8735 48.3117 34.0724 45.2525 34.0724H38.154C37.448 34.0724 36.771 33.7958 36.2718 33.3033C35.7726 32.8108 35.4921 32.1429 35.4921 31.4464C35.4921 30.75 35.7726 30.0821 36.2718 29.5896C36.771 29.0971 37.448 28.8204 38.154 28.8204H45.2525C46.8997 28.8204 48.4796 28.1749 49.6444 27.0258C50.8092 25.8767 51.4636 24.3182 51.4636 22.6931C51.4636 21.0681 50.8092 19.5095 49.6444 18.3605C48.4796 17.2114 46.8997 16.5658 45.2525 16.5658H10.1862Z" fill="rgba(252, 249, 247, 0.85)"/>
									</svg>
									<div style={{
										position: 'absolute',
										top: '-2px',
										right: '-2px',
										width: '20px',
										height: '20px',
										borderRadius: '50%',
										background: 'rgba(252, 249, 247, 0.65)',
										backdropFilter: 'blur(8px)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}>
										<span style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '13px',
											color: '#121212',
											lineHeight: 1,
										}}>2</span>
									</div>
								</div>
							</div>

							{/* Small rewind */}
							<div style={{
								position: 'absolute',
								top: '65%',
								right: '-40px',
								zIndex: 2,
								transform: 'rotate(21deg)',
							}}>
								<div style={{
									width: '45px',
									height: '44px',
									borderRadius: '50%',
									background: 'rgba(247, 113, 11, 0.65)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									position: 'relative',
								}}>
									<svg width="20" height="12" viewBox="0 0 56.7874 34.0724" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fillRule="evenodd" clipRule="evenodd" d="M10.1862 16.5658L17.1782 23.4634C17.4397 23.7038 17.6495 23.9937 17.795 24.3159C17.9405 24.638 18.0187 24.9857 18.025 25.3383C18.0313 25.6909 17.9656 26.0411 17.8317 26.3681C17.6978 26.6951 17.4985 26.9921 17.2458 27.2415C16.993 27.4908 16.6919 27.6874 16.3604 27.8195C16.029 27.9516 15.674 28.0164 15.3165 28.0102C14.9591 28.004 14.6066 27.9268 14.2801 27.7833C13.9536 27.6398 13.6597 27.4328 13.416 27.1748L1.88108 15.7955L0 13.9398L1.88108 12.0841L13.416 0.704789C13.9206 0.240933 14.588 -0.0115942 15.2777 0.00040912C15.9673 0.0124124 16.6253 0.288009 17.113 0.769137C17.6007 1.25026 17.88 1.89936 17.8922 2.57967C17.9044 3.25998 17.6484 3.91839 17.1782 4.4162L10.1862 11.3138H45.2525C48.3117 11.3138 51.2457 12.5127 53.4089 14.6467C55.5721 16.7808 56.7874 19.6751 56.7874 22.6931C56.7874 25.7111 55.5721 28.6055 53.4089 30.7395C51.2457 32.8735 48.3117 34.0724 45.2525 34.0724H38.154C37.448 34.0724 36.771 33.7958 36.2718 33.3033C35.7726 32.8108 35.4921 32.1429 35.4921 31.4464C35.4921 30.75 35.7726 30.0821 36.2718 29.5896C36.771 29.0971 37.448 28.8204 38.154 28.8204H45.2525C46.8997 28.8204 48.4796 28.1749 49.6444 27.0258C50.8092 25.8767 51.4636 24.3182 51.4636 22.6931C51.4636 21.0681 50.8092 19.5095 49.6444 18.3605C48.4796 17.2114 46.8997 16.5658 45.2525 16.5658H10.1862Z" fill="rgba(252, 249, 247, 0.85)"/>
									</svg>
									<div style={{
										position: 'absolute',
										top: '-2px',
										right: '-2px',
										width: '15px',
										height: '15px',
										borderRadius: '50%',
										background: 'rgba(252, 249, 247, 0.65)',
										backdropFilter: 'blur(6px)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}>
										<span style={{
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '10px',
											color: '#121212',
											lineHeight: 1,
										}}>1</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Description text */}
					<p style={{
						fontFamily: "'Zen Kaku Gothic New', sans-serif",
						fontWeight: 500,
						fontSize: '20px',
						lineHeight: 1.3,
						color: '#FCF9F7',
						textAlign: 'center',
						margin: '0 0 20px 0',
					}}>
						Случайно пролистнули интересную анкету?{'\n'}Верните её с помощью возврата
					</p>

					{/* CTA Button */}
					<div style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
					}}>
						<button
							onClick={() => {
								onClose()
								onUseRewind()
							}}
							style={{
								width: '100%',
								height: '72px',
								borderRadius: '37px',
								border: 'none',
								background: '#f7710b',
								boxShadow: '0px 5px 69px 0px rgba(247, 113, 11, 0.65)',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'transform 0.2s',
							}}
							onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
							onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
							onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
						>
							<span style={{
								fontFamily: "'Zen Kaku Gothic New', sans-serif",
								fontWeight: 900,
								fontSize: '24px',
								color: '#FCF9F7',
							}}>
								Использовать x{remainingRewinds}
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

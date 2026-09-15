'use client'

import EducationBottomNav from '@/components/EducationBottomNav'
import EducationHeader from '@/components/EducationHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserId } from '@/utils/telegram'

export default function EducationPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [events, setEvents] = useState<any[]>([])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const handleBack = () => {
			if (document.body.dataset.eduHeaderModal) {
				window.dispatchEvent(new Event('closeEduHeaderModal'))
				return
			}
			router.push('/')
		}
		tg.BackButton.show()
		tg.BackButton.onClick(handleBack)
		return () => {
			tg.BackButton.offClick(handleBack)
			tg.BackButton.hide()
		}
	}, [router])

	useEffect(() => {
		loadEvents()
	}, [])

	const loadEvents = async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/courses?userId=${getUserId()}`)
			if (response.ok) {
				const data = await response.json()
				setEvents(data)
			}
		} catch (error) {
			console.error('Error loading courses:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
			<EducationHeader />

			{/* Title */}
			<div style={{ padding: '0 20px 20px' }}>
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '68px',
						color: '#FCF9F7',
						margin: 0,
						lineHeight: 1,
					}}
				>
					КУРСЫ
				</h1>
			</div>

			{/* Content */}
			<div style={{ padding: '0 20px 20px' }}>
				{loading ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: '40px',
						}}
					>
						<div
							style={{
								width: '40px',
								height: '40px',
								border: '3px solid rgba(168, 85, 247, 0.3)',
								borderTop: '3px solid #A855F7',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite',
							}}
						/>
					</div>
				) : events.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '40px 20px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.5)',
							}}
						>
							Пока ничего нет
						</p>
					</div>
				) : (
					events.map((event, index) => (
						<div
							key={event.id}
							style={{
								marginBottom: '16px',
								position: 'relative',
								width: '100%',
								maxWidth: '391px',
								height: '186px',
								cursor: 'pointer',
							}}
							onClick={() => {
								if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
									window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
								}
								router.push(event.price > 0 ? `/education/courses/${event.id}` : `/education/lectures/${event.id}`)
							}}
						>
							{/* Background Pattern - alternating rotation */}
							<div
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundImage: 'url(/pattern_card_edu.webp)',
									backgroundSize: 'cover',
									backgroundPosition: 'center',
									transform:
										index % 2 === 0 ? 'rotate(0deg)' : 'rotate(180deg)',
									borderRadius: '28px',
									zIndex: 0,
								}}
							/>

							{/* Card Content */}
							<div
								style={{
									position: 'relative',
									width: '100%',
									height: '100%',
									borderRadius: '28px',
									padding: '20px',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									zIndex: 1,
								}}
							>
								{/* Top Section - Title and Book Icon */}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
										gap: '12px',
									}}
								>
									<h3
										style={{
											fontFamily: 'Oks, sans-serif',
											fontSize: '38px',
											color: '#FCF9F7',
											margin: 0,
											lineHeight: 1.2,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											flex: 1,
										}}
									>
										{event.title}
									</h3>
									<img
										src='/edu_book.webp'
										alt='Book'
										style={{
											width: '48px',
											height: '48px',
											flexShrink: 0,
										}}
									/>
								</div>


								{/* Bottom Section - Speaker & Arrow */}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-end',
									}}
								>
									{/* Speaker Info */}
									{event.speakerPhotoUrl && (
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '12px',
											}}
										>
											<div
												style={{
													width: '48px',
													height: '48px',
													borderRadius: '50%',
													overflow: 'hidden',
													border: '2px solid #FCF9F7',
												}}
											>
												<img
													src={event.speakerPhotoUrl}
													alt='Speaker'
													style={{
														width: '100%',
														height: '100%',
														objectFit: 'cover',
													}}
												/>
											</div>
											<div>
												<p
													style={{
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '14px',
														color: '#FCF9F7',
														margin: 0,
														lineHeight: 1.2,
													}}
												>
													{event.speakerName}
												</p>
												{event.speakerPosition && (
													<p
														style={{
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '12px',
															color: 'rgba(252, 249, 247, 0.7)',
															margin: 0,
															lineHeight: 1.2,
														}}
													>
														{event.speakerPosition}
													</p>
												)}
											</div>
										</div>
									)}

									{/* Arrow Icon */}
									<img
										src='/arr_edu.webp'
										alt='Arrow'
										style={{
											width: '48px',
											height: '48px',
										}}
									/>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>

			<EducationBottomNav />
		</div>
	)
}

'use client'

import EducationBottomNav from '@/components/EducationBottomNav'
import EducationHeader from '@/components/EducationHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LecturesPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [lectures, setLectures] = useState<any[]>([])

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
		loadLectures()
	}, [])

	const loadLectures = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/courses')
			if (response.ok) {
				const data = await response.json()
				setLectures(data)
			}
		} catch (error) {
			console.error('Error loading lectures:', error)
		} finally {
			setLoading(false)
		}
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = String(date.getFullYear()).slice(-2)
		return `${day}.${month}.${year}`
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
					ЛЕКЦИИ
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
								border: '3px solid rgba(101, 255, 247, 0.3)',
								borderTop: '3px solid #65FFF7',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite',
							}}
						/>
					</div>
				) : lectures.length === 0 ? (
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
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '12px',
							width: '100%',
						}}
					>
						{lectures.map(lecture => (
							<div
								key={lecture.id}
								style={{
									backgroundColor: '#5111E3',
									borderRadius: '28px',
									padding: '20px',
									cursor: 'pointer',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									minHeight: '341px',
									minWidth: 0,
									boxSizing: 'border-box',
								}}
								onClick={() => {
									if (
										typeof window !== 'undefined' &&
										window.Telegram?.WebApp
									) {
										window.Telegram.WebApp.HapticFeedback.impactOccurred(
											'light',
										)
									}
									router.push(`/education/lectures/${lecture.id}`)
								}}
							>
								{/* Title */}
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '18px',
										fontWeight: 600,
										color: '#FCF9F7',
										margin: '0 0 16px 0',
										lineHeight: 1.3,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										display: '-webkit-box',
										WebkitLineClamp: 3,
										WebkitBoxOrient: 'vertical',
										wordBreak: 'break-word',
									}}
								>
									{lecture.title}
								</h3>

								{/* Bottom Section */}
								<div>
									{/* Speaker Photo */}
									{lecture.speakerPhotoUrl && (
										<div
											style={{
												width: '100px',
												height: '100px',
												borderRadius: '50%',
												overflow: 'hidden',
												border: '3px solid #FCF9F7',
												margin: '0 auto 12px',
											}}
										>
											<img
												src={lecture.speakerPhotoUrl}
												alt='Speaker'
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										</div>
									)}

									{/* Speaker Info */}
									<div style={{ textAlign: 'center', marginBottom: '16px' }}>
										<p
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												fontWeight: 600,
												color: '#FCF9F7',
												margin: '0 0 4px 0',
												lineHeight: 1.2,
												wordBreak: 'break-word',
											}}
										>
											{lecture.speakerName}
										</p>
										{lecture.speakerPosition && (
											<p
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '12px',
													color: 'rgba(252, 249, 247, 0.7)',
													margin: 0,
													lineHeight: 1.2,
													wordBreak: 'break-word',
												}}
											>
												{lecture.speakerPosition}
											</p>
										)}
									</div>

									{/* Date Badge and Arrow */}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											gap: '8px',
										}}
									>
										<div
											style={{
												backgroundColor: '#E865FF',
												borderRadius: '20px',
												padding: '8px 16px',
												flexShrink: 0,
											}}
										>
											<p
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '14px',
													fontWeight: 600,
													color: '#1E1B1A',
													margin: 0,
													whiteSpace: 'nowrap',
												}}
											>
												{formatDate(lecture.lectureDate)}
											</p>
										</div>

										{/* Arrow Icon */}
										<img
											src='/sp_edu_arr.webp'
											alt='Arrow'
											style={{
												width: '32px',
												height: '32px',
												flexShrink: 0,
											}}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
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

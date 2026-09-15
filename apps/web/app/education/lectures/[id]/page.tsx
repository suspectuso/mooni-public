'use client'

import EducationBottomNav from '@/components/EducationBottomNav'
import EducationHeader from '@/components/EducationHeader'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LectureDetailPage() {
	const params = useParams()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [lecture, setLecture] = useState<any>(null)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const handleBack = () => {
			if (document.body.dataset.eduHeaderModal) {
				window.dispatchEvent(new Event('closeEduHeaderModal'))
				return
			}
			router.push('/education/lectures')
		}
		tg.BackButton.show()
		tg.BackButton.onClick(handleBack)
		return () => {
			tg.BackButton.offClick(handleBack)
			tg.BackButton.hide()
		}
	}, [router])

	useEffect(() => {
		if (params.id) {
			loadLecture()
		}
	}, [params.id])

	const loadLecture = async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/courses/${params.id}`)
			if (response.ok) {
				const data = await response.json()
				setLecture(data)
			}
		} catch (error) {
			console.error('Error loading lecture:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleVideoClick = () => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
			if (lecture?.videoTgLink) {
				window.Telegram.WebApp.openTelegramLink(lecture.videoTgLink)
			}
		}
	}

	const handlePodcastClick = () => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
			if (lecture?.podcastTgLink) {
				window.Telegram.WebApp.openTelegramLink(lecture.podcastTgLink)
			}
		}
	}

	if (loading) {
		return (
			<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
				<EducationHeader />
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
			</div>
		)
	}

	if (!lecture) {
		return (
			<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
				<EducationHeader />
				<div style={{ padding: '20px', textAlign: 'center' }}>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: 'rgba(252, 249, 247, 0.5)',
						}}
					>
						Лекция не найдена
					</p>
				</div>
			</div>
		)
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
			<EducationHeader />

			<div style={{ padding: '0 20px 20px' }}>
				{/* Title - 3 lines max */}
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '62px',
						color: '#FCF9F7',
						margin: '0 0 32px 0',
						lineHeight: 1.1,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
					}}
				>
					{lecture.title}
				</h1>

				{/* Speaker Section - Photo on right, text on left */}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'space-between',
						marginBottom: '32px',
						gap: '20px',
					}}
				>
					{/* Left side - Speaker info */}
					<div style={{ flex: 1 }}>
						{lecture.speakerName && (
							<p
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '14px',
									fontWeight: 400,
									color: '#FCF9F7',
									margin: '0 0 4px 0',
								}}
							>
								{lecture.speakerName}
							</p>
						)}
						{lecture.speakerPosition && (
							<p
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '14px',
									fontWeight: 400,
									color: 'rgba(252, 249, 247, 0.65)',
									margin: 0,
								}}
							>
								{lecture.speakerPosition}
							</p>
						)}
					</div>

					{/* Right side - Speaker photo */}
					{lecture.speakerPhotoUrl && (
						<div
							style={{
								width: '212px',
								height: '212px',
								borderRadius: '50%',
								overflow: 'hidden',
								border: '4px solid #FCF9F7',
								flexShrink: 0,
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
				</div>

				{/* Video Button */}
				{lecture.videoTgLink && (
					<button
						onClick={handleVideoClick}
						style={{
							width: '100%',
							padding: '18px',
							backgroundColor: '#E865FF',
							border: 'none',
							borderRadius: '28px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							cursor: 'pointer',
							marginBottom: '16px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '12px',
						}}
					>
						<svg
							width='18'
							height='20'
							viewBox='0 0 18 20'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M2.55827e-05 2.00331C2.54608e-05 0.463712 1.66669 -0.498538 3.00003 0.271263L16.1304 7.85211C17.4638 8.62191 17.4638 10.5464 16.1304 11.3162L3.00002 18.8971C1.66669 19.6669 2.52906e-05 18.7046 2.50176e-05 17.165L2.55827e-05 2.00331Z'
								fill='#FCF9F7'
							/>
						</svg>
						Смотреть видео
					</button>
				)}

				{/* Podcast Button */}
				{lecture.podcastTgLink && (
					<button
						onClick={handlePodcastClick}
						style={{
							width: '100%',
							padding: '18px',
							backgroundColor: '#5111E3',
							border: 'none',
							borderRadius: '28px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '12px',
						}}
					>
						<svg
							width='26'
							height='24'
							viewBox='0 0 26 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M0.866667 8.57143C0.39 8.57143 0 8.95714 0 9.42857V14.5714C0 15.0429 0.39 15.4286 0.866667 15.4286C1.34333 15.4286 1.73333 15.0429 1.73333 14.5714V9.42857C1.73333 8.95714 1.34333 8.57143 0.866667 8.57143ZM25.1333 8.57143C24.6567 8.57143 24.2667 8.95714 24.2667 9.42857V14.5714C24.2667 15.0429 24.6567 15.4286 25.1333 15.4286C25.61 15.4286 26 15.0429 26 14.5714V9.42857C26 8.95714 25.61 8.57143 25.1333 8.57143ZM4.33333 3.42857C3.85667 3.42857 3.46667 3.81429 3.46667 4.28571V19.7143C3.46667 20.1857 3.85667 20.5714 4.33333 20.5714C4.81 20.5714 5.2 20.1857 5.2 19.7143V4.28571C5.2 3.81429 4.81 3.42857 4.33333 3.42857ZM7.8 6.85714C7.32333 6.85714 6.93333 7.24286 6.93333 7.71429V16.2857C6.93333 16.7571 7.32333 17.1429 7.8 17.1429C8.27667 17.1429 8.66667 16.7571 8.66667 16.2857V7.71429C8.66667 7.24286 8.27667 6.85714 7.8 6.85714ZM11.2667 10.2857C10.79 10.2857 10.4 10.6714 10.4 11.1429V12.8571C10.4 13.3286 10.79 13.7143 11.2667 13.7143C11.7433 13.7143 12.1333 13.3286 12.1333 12.8571V11.1429C12.1333 10.6714 11.7433 10.2857 11.2667 10.2857ZM14.7333 6.85714C14.2567 6.85714 13.8667 7.24286 13.8667 7.71429V16.2857C13.8667 16.7571 14.2567 17.1429 14.7333 17.1429C15.21 17.1429 15.6 16.7571 15.6 16.2857V7.71429C15.6 7.24286 15.21 6.85714 14.7333 6.85714ZM18.2 0C17.7233 0 17.3333 0.385714 17.3333 0.857143V23.1429C17.3333 23.6143 17.7233 24 18.2 24C18.6767 24 19.0667 23.6143 19.0667 23.1429V0.857143C19.0667 0.385714 18.6767 0 18.2 0ZM21.6667 3.42857C21.19 3.42857 20.8 3.81429 20.8 4.28571V19.7143C20.8 20.1857 21.19 20.5714 21.6667 20.5714C22.1433 20.5714 22.5333 20.1857 22.5333 19.7143V4.28571C22.5333 3.81429 22.1433 3.42857 21.6667 3.42857Z'
								fill='#FCF9F7'
							/>
						</svg>
						Слушать подкаст
					</button>
				)}
			</div>

			<EducationBottomNav />
		</div>
	)
}

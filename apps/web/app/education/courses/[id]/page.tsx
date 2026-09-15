'use client'

import EducationBottomNav from '@/components/EducationBottomNav'
import EducationHeader from '@/components/EducationHeader'
import PaymentInstructionScreen from '@/components/networking/PaymentInstructionScreen'
import { getUserId } from '@/utils/telegram'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const formatDuration = (minutes: number | null | undefined): string => {
	if (!minutes) return ''
	const hours = minutes / 60
	if (hours >= 1) {
		const h = Math.floor(hours)
		const m = minutes % 60
		if (m > 0) return `${h},${Math.round((m / 60) * 10)} часа`
		return `${h} ${h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'}`
	}
	return `${minutes} мин`
}

export default function CourseDetailPage() {
	const params = useParams()
	const router = useRouter()
	const [course, setCourse] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [purchased, setPurchased] = useState(false)
	const [inviteLink, setInviteLink] = useState<string | null>(null)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const [buyLoading, setBuyLoading] = useState(false)

	const loadCourse = useCallback(async () => {
		setLoading(true)
		try {
			const response = await fetch(`/api/courses/${params.id}`)
			if (response.ok) {
				const data = await response.json()
				setCourse(data)
			}
		} catch (error) {
			console.error('Error loading course:', error)
		} finally {
			setLoading(false)
		}
	}, [params.id])

	const checkPurchase = useCallback(async () => {
		const userId = getUserId()
		if (!userId || !params.id) return

		try {
			const response = await fetch(
				`/api/courses/${params.id}/check-purchase?userId=${userId}`
			)
			if (response.ok) {
				const data = await response.json()
				setPurchased(data.purchased)
				setInviteLink(data.inviteLink)
			}
		} catch (error) {
			console.error('Error checking purchase:', error)
		}
	}, [params.id])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const handleBack = () => {
			if (document.body.dataset.eduHeaderModal) {
				window.dispatchEvent(new Event('closeEduHeaderModal'))
				return
			}
			router.push('/education')
		}
		tg.BackButton.show()
		tg.BackButton.onClick(handleBack)
		return () => {
			tg.BackButton.offClick(handleBack)
			tg.BackButton.hide()
		}
	}, [router])

	useEffect(() => {
		loadCourse()
		checkPurchase()
	}, [loadCourse, checkPurchase])

	// Перепроверяем покупку при возврате в приложение
	useEffect(() => {
		const handleVisibility = () => {
			if (document.visibilityState === 'visible') {
				checkPurchase()
			}
		}
		document.addEventListener('visibilitychange', handleVisibility)
		return () =>
			document.removeEventListener('visibilitychange', handleVisibility)
	}, [checkPurchase])

	const handleBuy = async () => {
		const userId = getUserId()
		if (!userId || !course) return

		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('medium')

		setBuyLoading(true)
		try {
			await fetch('/api/bot/send-course-payment-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, courseId: course.id }),
			})
			setShowPaymentInstruction(true)
		} catch (error) {
			console.error('Error initiating purchase:', error)
		} finally {
			setBuyLoading(false)
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
							border: '3px solid rgba(168, 85, 247, 0.3)',
							borderTop: '3px solid #A855F7',
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
				<EducationBottomNav />
			</div>
		)
	}

	if (!course) {
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
						Курс не найден
					</p>
				</div>
				<EducationBottomNav />
			</div>
		)
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
			<EducationHeader />

			<div style={{ padding: '0 20px 20px' }}>
				{/* Duration Badge */}
				{course.durationMinutes && (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							width: '89px',
							height: '34px',
							backgroundColor: '#E865FF',
							borderRadius: '36px',
							marginBottom: '12px',
						}}
					>
						<span
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '18px',
								color: '#1E1B1A',
								fontWeight: 500,
								lineHeight: '18px',
								textAlign: 'center' as const,
							}}
						>
							{formatDuration(course.durationMinutes)}
						</span>
					</div>
				)}

				{/* Title */}
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '44px',
						color: '#FCF9F7',
						margin: '0 0 40px 0',
						lineHeight: 1.05,
						textTransform: 'uppercase',
						wordBreak: 'break-word',
					}}
				>
					{course.title?.split(/\s(?=и\s)/i).map((part: string, i: number, arr: string[]) =>
						i < arr.length - 1 ? (
							<span key={i}>{part}<br /></span>
						) : (
							<span key={i}>{part}</span>
						)
					)}
				</h1>

				{/* Speaker — text left, photo right */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-end',
						gap: '16px',
						marginBottom: '24px',
					}}
				>
					<div style={{ textAlign: 'left' }}>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#FCF9F7',
								margin: 0,
								fontWeight: 500,
								lineHeight: 1.3,
							}}
						>
							{course.speakerName}
						</p>
						{course.speakerPosition && (
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: 'rgba(252, 249, 247, 0.6)',
									margin: '2px 0 0 0',
									lineHeight: 1.3,
								}}
							>
								{course.speakerPosition}
							</p>
						)}
					</div>
					{course.speakerPhotoUrl && (
						<div
							style={{
								width: '168px',
								height: '168px',
								borderRadius: '50%',
								overflow: 'hidden',
								flexShrink: 0,
							}}
						>
							<img
								src={course.speakerPhotoUrl}
								alt={course.speakerName || 'Speaker'}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						</div>
					)}
				</div>

				{/* Buy / Purchased Button */}
				{course.price > 0 && !purchased && (
					<button
						onClick={handleBuy}
						disabled={buyLoading}
						style={{
							width: '100%',
							maxWidth: '390px',
							height: '72px',
							borderRadius: '28px',
							border: 'none',
							backgroundColor: '#5111E3',
							color: '#FCF9F7',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							cursor: buyLoading ? 'not-allowed' : 'pointer',
							opacity: buyLoading ? 0.7 : 1,
							marginBottom: '28px',
							transition: 'opacity 0.2s',
						}}
					>
						{buyLoading
							? 'Отправка...'
							: `Купить ${course.price}/руб.`}
					</button>
				)}

				{purchased && inviteLink && (
					<a
						href={inviteLink}
						target='_blank'
						rel='noopener noreferrer'
						style={{
							display: 'block',
							width: '100%',
							padding: '16px',
							borderRadius: '28px',
							border: 'none',
							backgroundColor: '#22C55E',
							color: '#FCF9F7',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							textAlign: 'center',
							textDecoration: 'none',
							marginBottom: '28px',
							boxSizing: 'border-box',
						}}
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) tg.HapticFeedback.impactOccurred('light')
						}}
					>
						Перейти в канал курса
					</a>
				)}

				{purchased && !inviteLink && (
					<div
						style={{
							width: '100%',
							padding: '16px',
							borderRadius: '28px',
							backgroundColor: 'rgba(34, 197, 94, 0.2)',
							border: '1px solid rgba(34, 197, 94, 0.4)',
							textAlign: 'center',
							marginBottom: '28px',
							boxSizing: 'border-box',
						}}
					>
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#22C55E',
								fontWeight: 600,
							}}
						>
							Курс оплачен
						</span>
					</div>
				)}

				{/* Description */}
				{course.description && (
					<div style={{ marginBottom: '20px' }}>
						<h3
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#FCF9F7',
								margin: '0 0 12px 0',
								fontWeight: 600,
							}}
						>
							Про что курс?
						</h3>
						<div
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.8)',
								lineHeight: 1.6,
								whiteSpace: 'pre-line',
							}}
						>
							{course.description}
						</div>
					</div>
				)}
			</div>

			<PaymentInstructionScreen
				isOpen={showPaymentInstruction}
				onClose={() => {
					setShowPaymentInstruction(false)
					checkPurchase()
				}}
			/>

			<EducationBottomNav />
		</div>
	)
}

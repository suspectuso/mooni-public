'use client'

import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import { getUserId } from '@/utils/telegram'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReferralPage() {
	const router = useRouter()
	const [userName, setUserName] = useState('')
	const [userPhoto, setUserPhoto] = useState('')
	const [userId, setUserId] = useState('')
	const [referralCount, setReferralCount] = useState(0)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => router.push('/networking/profile')
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		const telegramId = getUserId()
		if (telegramId) {
			setUserId(telegramId)
			fetchProfile(telegramId)
			fetchReferralCount(telegramId)
		}

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
			}
		}
	}, [router])

	const fetchReferralCount = async (telegramId: string) => {
		try {
			const response = await fetch(
				`/api/users/telegram/${telegramId}/referral-count`,
			)
			if (response.ok) {
				const data = await response.json()
				setReferralCount(data.referralCount ?? 0)
			}
		} catch (error) {
			console.error('Error fetching referral count:', error)
		}
	}

	const fetchProfile = async (telegramId: string) => {
		try {
			const response = await fetch(
				`/api/networking/profile?userId=${telegramId}`,
			)
			if (response.ok) {
				const data = await response.json()
				setUserName(
					data.networkingName || data.firstName || 'User',
				)
				setUserPhoto(data.networkingPhoto || '')
			}
		} catch (error) {
			console.error('Error fetching profile:', error)
		}
	}

	const handleShareLink = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
			const refLink = `https://t.me/Match_MSD_bot?start=ref_${userId}`
			try {
				tg.openTelegramLink(
					`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('Присоединяйся к Match!')}`,
				)
			} catch {
				// Fallback
				if (navigator.clipboard) {
					navigator.clipboard.writeText(refLink)
					tg.showAlert('Ссылка скопирована!')
				}
			}
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				background: '#121212',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Background M letters */}
			<img
				src='/referral_m_bg.svg'
				alt=''
				style={{
					position: 'absolute',
					top: '0',
					left: '0',
					width: '100%',
					height: 'auto',
					maxHeight: '570px',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>

			{/* Background orange glow */}
			<div
				style={{
					position: 'absolute',
					top: '0',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '566px',
					height: '370px',
					background:
						'radial-gradient(ellipse at center, rgba(247, 113, 11, 0.2) 0%, transparent 60%)',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>

			{/* Header */}
			<div style={{ position: 'relative', zIndex: 10 }}>
				<NetworkingHeader />
			</div>

			{/* Content */}
			<div
				style={{
					position: 'relative',
					zIndex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					padding: '0 24px',
					paddingBottom: 'calc(120px + env(safe-area-inset-bottom))',
				}}
			>
				{/* Avatar with glow */}
				<div
					style={{
						position: 'relative',
						marginTop: '20px',
						marginBottom: '20px',
					}}
				>
					{/* Orange glow behind avatar */}
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							width: '240px',
							height: '240px',
							borderRadius: '50%',
							background:
								'radial-gradient(circle, rgba(247, 113, 11, 0.25) 0%, transparent 70%)',
							pointerEvents: 'none',
						}}
					/>
					<div
						style={{
							width: '180px',
							height: '180px',
							borderRadius: '50%',
							overflow: 'hidden',
							position: 'relative',
						}}
					>
						{userPhoto ? (
							<img
								src={userPhoto}
								alt={userName}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						) : (
							<div
								style={{
									width: '100%',
									height: '100%',
									background: 'rgba(252, 249, 247, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg
									width='60'
									height='68'
									viewBox='0 0 30 34'
									fill='none'
								>
									<path
										d='M15 19.8576C20.0063 19.8576 30 23.0163 30 29.2863V32.0002C30 33.1048 29.1046 34.0002 28 34.0002H2C0.895431 34.0002 0 33.1048 0 32.0002L0 29.2863C0 23.0163 9.99375 19.8576 15 19.8576ZM11.9385 0.609558C13.4002 0.00408872 15.0088 -0.155114 16.5605 0.153503C18.1124 0.462185 19.5384 1.22414 20.6572 2.34296C21.776 3.46178 22.538 4.88779 22.8467 6.43964C23.1553 7.99141 22.9961 9.59997 22.3906 11.0617C21.7851 12.5234 20.7599 13.7725 19.4443 14.6516C18.1287 15.5306 16.5822 16.0002 15 16.0002C12.8783 16.0002 10.8431 15.1577 9.34277 13.6574C7.84248 12.1571 7 10.1219 7 8.00018C7 6.41793 7.46958 4.87144 8.34863 3.55585C9.22764 2.24032 10.4768 1.21507 11.9385 0.609558Z'
										fill='#979594'
									/>
								</svg>
							</div>
						)}
					</div>
				</div>

				{/* Name */}
				<p
					style={{
						fontFamily: "'Zen Kaku Gothic New', sans-serif",
						fontSize: '24px',
						fontWeight: 900,
						color: '#FCF9F7',
						textAlign: 'center',
						margin: '0 0 32px 0',
					}}
				>
					{userName}
				</p>

				{/* "Моя ссылка" label */}
				<p
					style={{
						fontFamily: "'Zen Kaku Gothic New', sans-serif",
						fontSize: '16px',
						fontWeight: 900,
						color: '#FCF9F7',
						alignSelf: 'flex-start',
						margin: '0 0 12px 0',
					}}
				>
					Моя ссылка
				</p>

				{/* Personal link button */}
				<button
					onClick={handleShareLink}
					style={{
						width: '100%',
						height: '56px',
						borderRadius: '38px',
						backgroundColor: 'rgba(247, 113, 11, 0.45)',
						border: 'none',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 24px',
						marginBottom: '24px',
					}}
				>
					<span
						style={{
							fontFamily: "'Zen Kaku Gothic New', sans-serif",
							fontSize: '16px',
							fontWeight: 900,
							color: '#F7710B',
						}}
					>
						Персональная ссылка
					</span>
					{/* Link icon */}
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'
							stroke='#FCF9F7'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<path
							d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
							stroke='#FCF9F7'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</button>

				{/* Friends counter section */}
				<div
					style={{
						width: '100%',
						backgroundColor: 'rgba(252, 249, 247, 0.05)',
						borderRadius: '38px',
						padding: '24px',
						marginBottom: '24px',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							marginBottom: '8px',
						}}
					>
						{/* People icon */}
						<svg
							width='29'
							height='23'
							viewBox='0 0 29 23'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M10.5 11.5C13.2614 11.5 15.5 9.26142 15.5 6.5C15.5 3.73858 13.2614 1.5 10.5 1.5C7.73858 1.5 5.5 3.73858 5.5 6.5C5.5 9.26142 7.73858 11.5 10.5 11.5Z'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
							<path
								d='M1.5 21.5V19.5C1.5 17.2909 3.29086 15.5 5.5 15.5H15.5C17.7091 15.5 19.5 17.2909 19.5 19.5V21.5'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
							<path
								d='M20.5 1.7C21.6772 2.02076 22.7106 2.72293 23.4401 3.69637C24.1696 4.66981 24.5536 5.86004 24.5285 7.07659C24.5034 8.29314 24.0706 9.46656 23.3015 10.4091C22.5325 11.3517 21.4716 12.0099 20.2834 12.2808'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
							<path
								d='M23.5 15.5C24.6997 15.5232 25.8702 15.8987 26.8671 16.5813C27.864 17.264 28.6419 18.2236 29.1 19.3333'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
						<span
							style={{
								fontFamily:
									"'Zen Kaku Gothic New', sans-serif",
								fontSize: '21px',
								fontWeight: 900,
								color: '#FCF9F7',
							}}
						>
							Счетчик друзей
						</span>
					</div>
					<p
						style={{
							fontFamily: 'Oks, sans-serif',
							fontSize: '52px',
							lineHeight: 0.9,
							color: '#FCF9F7',
							textAlign: 'right',
							margin: 0,
						}}
					>
						{referralCount}
					</p>
				</div>

				{/* Description */}
				<p
					style={{
						fontFamily: "'Zen Kaku Gothic New', sans-serif",
						fontSize: '16px',
						fontWeight: 500,
						lineHeight: 1.2,
						color: 'rgba(252, 249, 247, 0.65)',
						margin: '0',
					}}
				>
					Приглашайте друзей по реферальной ссылке в бот и за каждого
					друга получайте подписку НЕТВОРКИНГ+ на 3 дня
				</p>
			</div>

			{/* Bottom Navigation */}
			<NetworkingBottomNav />
		</div>
	)
}

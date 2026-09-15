'use client'

import MatchLoader from '@/components/MatchLoader'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import MutualSympathyModal from '@/components/networking/MutualSympathyModal'
import ProfileHeader from '@/components/networking/ProfileHeader'
import { getUserId } from '@/utils/telegram'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from "react";

interface NetworkingProfile {
	id: string
	networkingName: string
	firstName?: string
	displayName?: string
	networkingPhoto: string
	avatarUrl: string
	networkingLocation: string
	networkingGender?: string | null
	networkingAbout: string
	networkingSkills: { name: string }[]
	networkingValues: { name: string }[]
	networkingAura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
	networkingLookingFor: string[]
	networkingCases: {
		id: string
		photoPath: string
		title: string | null
		link: string | null
		sortOrder: number
	}[]
	hasWorkProfile: boolean
	linkedResumeId: string | null
	linkedVacancyId: string | null
	linkedResume?: {
		id: string
		position: string
		category?: { name: string }
	}
	linkedVacancy?: {
		id: string
		position: string
	}
	username?: string | null
	telegramId?: string | null
}

export default function NetworkingUserPage() {
	const router = useRouter()
	const params = useParams()
	const userId = params.id as string

	const [profile, setProfile] = useState<NetworkingProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [_isLiked, setIsLiked] = useState(false)
	const [isMatch, setIsMatch] = useState(false)
	const [hasLikedMe, setHasLikedMe] = useState(false)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [showMutualSympathyModal, setShowMutualSympathyModal] = useState(false)
	const [myProfile, setMyProfile] = useState<any>(null)
	const [hasExpressedLoveToMe, setHasExpressedLoveToMe] = useState(false)
	const [haveIExpressedLove, setHaveIExpressedLove] = useState(false)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.ready()
			tg.expand()
			tg.disableVerticalSwipes()
		}

		fetchProfile()
	}, [userId])

	// BackButton — ref чтобы хендлер не пересоздавался
	const showMutualSympathyModalRef = useRef(showMutualSympathyModal)
	useEffect(() => { showMutualSympathyModalRef.current = showMutualSympathyModal }, [showMutualSympathyModal])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg?.BackButton) return

		const handler = () => {
			if (showMutualSympathyModalRef.current) {
				setShowMutualSympathyModal(false)
				return
			}
			router.back()
		}

		tg.BackButton.show()
		tg.BackButton.onClick(handler)
		return () => {
			tg.BackButton.offClick(handler)
			tg.BackButton.hide()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const fetchProfile = async () => {
		try {
			const response = await fetch(`/api/networking/user/${userId}`)
			const data = await response.json()
			setProfile(data)

			const tg = (window as any).Telegram?.WebApp
			const myTelegramId = getUserId() || ''
			const theirTelegramId = data.telegramId

			// Получаем свой профиль
			const myProfileResponse = await fetch(
				`/api/networking/profile?userId=${myTelegramId}`,
			)
			const myProfileData = await myProfileResponse.json()
			setMyProfile(myProfileData)

			// Проверяем подписку просматриваемого пользователя
			try {
				const subscriptionResponse = await fetch(
					`/api/subscriptions/check?userId=${theirTelegramId}&type=NETWORKING_PLUS`,
				)
				const subscriptionData = await subscriptionResponse.json()
				setHasActiveSubscription(subscriptionData.hasActive || false)
			} catch (error) {
				console.error('Error checking subscription:', error)
				setHasActiveSubscription(false)
			}

			// Проверяем симпатии (express love)
			let sympathiesData: any[] = []
			try {
				const sympathiesResponse = await fetch(
					`/api/networking/sympathies?userId=${myTelegramId}`,
				)
				sympathiesData = await sympathiesResponse.json()

				// Проверяем, выразил ли он мне симпатию
				const theyExpressedLove =
					Array.isArray(sympathiesData) &&
					sympathiesData.some(
						(user: any) =>
							user.telegramId === theirTelegramId || user.id === userId,
					)
				setHasExpressedLoveToMe(theyExpressedLove)

			} catch (error) {
				console.error('Error checking sympathies:', error)
				setHasExpressedLoveToMe(false)
			}

			// Проверяем, выразил ли я симпатию
			// Для этого нужно получить список тех, кому я выразил симпатию
			// Пока используем проверку через API (можно добавить отдельный endpoint)
			// Временно будем считать что если есть мэтч по симпатиям, то я тоже выразил

			// Проверяем, лайкнул ли он меня
			const likesReceivedResponse = await fetch(
				`/api/networking/likes-received?userId=${myTelegramId}`,
			)
			const likesReceivedData = await likesReceivedResponse.json()
			const theyLikedMe =
				Array.isArray(likesReceivedData) &&
				likesReceivedData.some(
					(user: any) => user.telegramId === theirTelegramId,
				)
			setHasLikedMe(theyLikedMe)

			// Проверяем, лайкнул ли я его
			const myLikesResponse = await fetch(
				`/api/networking/my-likes?userId=${myTelegramId}`,
			)
			const myLikesData = await myLikesResponse.json()
			const iLikedThem =
				Array.isArray(myLikesData) &&
				myLikesData.some((user: any) => user.telegramId === theirTelegramId)
			setIsLiked(iLikedThem)

			// Проверяем мэтчи
			const matchesResponse = await fetch(
				`/api/networking/matches?userId=${myTelegramId}`,
			)
			const matchesData = await matchesResponse.json()
			const hasMatch =
				Array.isArray(matchesData) &&
				matchesData.some((match: any) => match.telegramId === theirTelegramId)

			// Мэтч = есть в списке мэтчей ИЛИ оба лайкнули друг друга
			const isMatchState = hasMatch || (theyLikedMe && iLikedThem)
			setIsMatch(isMatchState)

			// Проверяем взаимность симпатий через sympathies
			// Если в sympathies есть isMatch: true, значит взаимная симпатия
			if (Array.isArray(sympathiesData)) {
				const sympathyMatch = sympathiesData.find(
					(user: any) =>
						(user.telegramId === theirTelegramId || user.id === userId) &&
						user.isMatch,
				)
				if (sympathyMatch) {
					setHaveIExpressedLove(true)
				}
			}
		} catch (error) {
			console.error('Error fetching profile:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleAddFriend = async () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			setTimeout(() => tg.HapticFeedback?.impactOccurred('medium'), 0)
		}

		try {
			const myTelegramId = getUserId() || ''
			const theirTelegramId = profile?.telegramId

			if (!theirTelegramId) {
				console.error('Target user telegramId not found')
				return
			}

			const response = await fetch(
				`/api/networking/like/${theirTelegramId}?userId=${myTelegramId}`,
				{
					method: 'POST',
				},
			)
			const data = await response.json()

			if (response.ok) {
				setIsLiked(true)
				setHasLikedMe(false)
				if (data.isMatch) {
					setIsMatch(true)
				}
			}
		} catch (error) {
			console.error('Error adding friend:', error)
		}
	}

	const handleRemoveMatch = async () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			setTimeout(() => tg.HapticFeedback?.impactOccurred('medium'), 0)
		}

		try {
			const myTelegramId = getUserId() || ''
			const theirTelegramId = profile?.telegramId

			if (!theirTelegramId) {
				console.error('Target user telegramId not found')
				return
			}

			const response = await fetch(
				`/api/networking/unlike/${theirTelegramId}?userId=${myTelegramId}`,
				{
					method: 'DELETE',
				},
			)

			const data = await response.json()

			if (!response.ok) {
				console.error('Failed to unlike:', data)
				return
			}

			setIsLiked(false)
			setIsMatch(false)

			// Проверяем, лайкнул ли он меня
			const likesReceivedResponse = await fetch(
				`/api/networking/likes-received?userId=${myTelegramId}`,
			)
			const likesReceivedData = await likesReceivedResponse.json()
			const theyLikedMe = likesReceivedData.some(
				(user: any) => user.telegramId === theirTelegramId,
			)

			setHasLikedMe(theyLikedMe)
		} catch (error) {
			console.error('Error removing match:', error)
		}
	}

	const handleOpenWork = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			setTimeout(() => tg.HapticFeedback?.impactOccurred('light'), 0)
		}

		if (profile?.linkedResumeId) {
			router.push(`/work/resumes/${profile.linkedResumeId}`)
		} else if (profile?.linkedVacancyId) {
			router.push(`/work/vacancies/${profile.linkedVacancyId}`)
		}
	}

	const handleExpressMutualSympathy = async () => {
		const tg = (window as any).Telegram?.WebApp
		const myTelegramId = getUserId() || ''

		try {
			const response = await fetch(
				`/api/networking/express-love?userId=${myTelegramId}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						candidateId: profile?.telegramId,
					}),
				},
			)

			const data = await response.json()

			if (data.isMatch) {
				// Взаимная симпатия
				setHaveIExpressedLove(true)
			}

			setShowMutualSympathyModal(false)
			fetchProfile()

			if (tg) {
				tg.HapticFeedback.notificationOccurred('success')
			}
		} catch (error) {
			console.error('Error expressing mutual sympathy:', error)
		}
	}

	if (loading) {
		return <MatchLoader />
	}

	if (!profile) {
		return (
			<div className='min-h-screen bg-[#121212] flex flex-col'>
				<NetworkingHeader />
				<div className='flex-1 flex items-center justify-center'>
					<p className='text-[#FCF9F7] text-lg'>Профиль не найден</p>
				</div>
				<NetworkingBottomNav />
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-[#121212] flex flex-col pb-20'>
			<NetworkingHeader />

			<ProfileHeader
				profile={profile}
				uploadingAvatar={false}
				onAvatarUpload={() => {}}
				onEditClick={() => {}}
				isOwnProfile={false}
				showAddFriendButton={hasLikedMe && !isMatch}
				showRemoveMatchButton={isMatch}
				onAddFriend={handleAddFriend}
				onRemoveMatch={handleRemoveMatch}
				hasActiveSubscription={hasActiveSubscription}
				isMatch={isMatch}
			/>

			<div
				style={{
					padding: '20px',
					paddingBottom: '120px',
					WebkitOverflowScrolling: 'touch',
				}}
				className='flex-1 overflow-y-auto'
			>
				{/* Кнопка взаимной симпатии */}
				{hasExpressedLoveToMe && !haveIExpressedLove && (
					<div
						className='flex justify-center'
						style={{ margin: '18px 0' }}
					>
						<div
							className='inline-flex items-center gap-1.5 rounded-[14px] cursor-pointer active:scale-95 transition-transform'
							style={{
								height: '28px',
								padding: '4px 12px',
								backgroundColor: 'rgba(232, 101, 255, 0.15)',
							}}
							onClick={() => {
								const tg = (window as any).Telegram?.WebApp
								if (tg) {
									tg.HapticFeedback.impactOccurred('light')
								}
								setShowMutualSympathyModal(true)
							}}
						>
							<span
								className='text-[13px] font-semibold'
								style={{
									fontFamily: 'LT Superior, sans-serif',
									color: '#E865FF',
								}}
							>
								+ Взаимная симпатия
							</span>
						</div>
					</div>
				)}

				{/* О себе */}
				{profile.networkingAbout && (
					<div style={{ marginBottom: '24px' }}>
						<h2
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '24px',
								fontWeight: 900,
								color: 'rgba(252, 249, 247, 0.65)',
								margin: '0 0 10px',
							}}
						>
							О себе
						</h2>
						<p
							className='m-0'
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '15px',
								fontWeight: 500,
								lineHeight: '1.5',
								color: '#FCF9F7',
								wordWrap: 'break-word',
								overflowWrap: 'break-word',
							}}
						>
							{profile.networkingAbout}
						</p>
					</div>
				)}

				{/* Навыки */}
				{profile.networkingSkills && profile.networkingSkills.length > 0 && (
					<div style={{ marginBottom: '24px' }}>
						<h2
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '24px',
								fontWeight: 900,
								color: 'rgba(252, 249, 247, 0.65)',
								margin: '0 0 10px',
							}}
						>
							Навыки
						</h2>
						<div className='flex flex-wrap gap-2'>
							{profile.networkingSkills.map((skill, index) => (
								<span
									key={index}
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '13px',
										fontWeight: 900,
										padding: '7px 12px 10px',
										borderRadius: '17.5px',
										backgroundColor: 'rgba(252, 249, 247, 0.15)',
										color: 'rgba(252, 249, 247, 0.65)',
									}}
								>
									{skill.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Ценности */}
				{profile.networkingValues && profile.networkingValues.length > 0 && (
					<div style={{ marginBottom: '24px' }}>
						<h2
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '24px',
								fontWeight: 900,
								color: 'rgba(252, 249, 247, 0.65)',
								margin: '0 0 10px',
							}}
						>
							Ценности
						</h2>
						<div className='flex flex-wrap gap-2'>
							{profile.networkingValues.map((value, index) => (
								<span
									key={index}
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '13px',
										fontWeight: 900,
										padding: '7px 12px 10px',
										borderRadius: '17.5px',
										backgroundColor: 'rgba(252, 249, 247, 0.15)',
										color: 'rgba(252, 249, 247, 0.65)',
									}}
								>
									{value.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Плашка мэтч-работа — компактная пилла */}
				{profile.hasWorkProfile && (
					<div
						onClick={handleOpenWork}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '10px 16px',
							backgroundColor: 'rgba(252, 249, 247, 0.15)',
							borderRadius: '28px',
							cursor: 'pointer',
							marginBottom: '12px',
							gap: '10px',
						}}
					>
						<img src='/+m_netw.webp' width={38} height={38} alt='+M' style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
						<span style={{
							color: '#FCF9F7',
							fontSize: '16px',
							fontWeight: 900,
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
						}}>
							{profile.linkedResume?.position || profile.linkedVacancy?.position || 'Профиль на мэтч-работе'}
						</span>
					</div>
				)}
			</div>

			<NetworkingBottomNav />

			{/* Модалка взаимной симпатии */}
			{myProfile && (
				<MutualSympathyModal
					isOpen={showMutualSympathyModal}
					onClose={() => setShowMutualSympathyModal(false)}
					onSend={handleExpressMutualSympathy}
					currentUserAvatar={
						myProfile.networkingPhoto || myProfile.avatarUrl || ''
					}
					targetUserAvatar={profile.networkingPhoto || profile.avatarUrl || ''}
					targetUserName={
						profile.networkingName ||
						profile.displayName ||
						profile.firstName ||
						'Пользователь'
					}
					targetUsername={profile.username || undefined}
					targetTelegramId={profile.telegramId || undefined}
				/>
			)}
		</div>
	)
}

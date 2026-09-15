'use client'

import MatchLoader from '@/components/MatchLoader'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import ProfileHeader from '@/components/networking/ProfileHeader'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NetworkingProfile {
	id: string
	networkingName: string
	firstName?: string
	networkingPhoto: string
	avatarUrl: string
	networkingLocation: string
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
	const [isLiked, setIsLiked] = useState(false)
	const [isMatch, setIsMatch] = useState(false)
	const [_showGradient, _setShowGradient] = useState(false)
	const [hasLikedMe, setHasLikedMe] = useState(false)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.ready()
			tg.expand()
			// Убираем BackButton, так как теперь кнопка в хедере
			tg.BackButton.hide()

			// Отключаем свайпы влево/вправо
			tg.disableVerticalSwipes()
		}

		fetchProfile()
	}, [userId])

	const fetchProfile = async () => {
		try {
			const response = await fetch(`/api/networking/user/${userId}`)
			const data = await response.json()
			setProfile(data)

			// Проверяем есть ли уже лайк или мэтч
			const tg = (window as any).Telegram?.WebApp
			const myUserId = tg?.initDataUnsafe?.user?.id || 'test_user'

			// Проверяем, лайкнул ли этот пользователь меня
			const likesReceivedResponse = await fetch(
				`/api/networking/likes-received?userId=${myUserId}`,
			)
			const likesReceivedData = await likesReceivedResponse.json()
			const theyLikedMe = likesReceivedData.some(
				(user: any) => user.id === userId,
			)
			setHasLikedMe(theyLikedMe)

			// Проверяем, лайкнул ли я его
			const myLikesResponse = await fetch(
				`/api/networking/my-likes?userId=${myUserId}`,
			)
			const myLikesData = await myLikesResponse.json()
			const iLikedThem = myLikesData.some((user: any) => user.id === userId)
			setIsLiked(iLikedThem)

			// Проверяем мэтчи (оба лайкнули друг друга)
			const matchesResponse = await fetch(
				`/api/networking/matches?userId=${myUserId}`,
			)
			const matchesData = await matchesResponse.json()
			const hasMatch = matchesData.some((match: any) => match.id === userId)

			// Мэтч = оба лайкнули друг друга
			const isMatchState = hasMatch || (theyLikedMe && iLikedThem)
			setIsMatch(isMatchState)

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
			const myUserId = tg?.initDataUnsafe?.user?.id || 'test_user'
			const response = await fetch(
				`/api/networking/like/${userId}?userId=${myUserId}`,
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
			const myUserId = tg?.initDataUnsafe?.user?.id || 'test_user'

			// Удаляем мой лайк
			await fetch(`/api/networking/unlike/${userId}?userId=${myUserId}`, {
				method: 'DELETE',
			})

			// Обновляем состояние
			setIsLiked(false)
			setIsMatch(false)

			// Проверяем, лайкнул ли он меня - если да, показываем кнопку add_match
			const likesReceivedResponse = await fetch(
				`/api/networking/likes-received?userId=${myUserId}`,
			)
			const likesReceivedData = await likesReceivedResponse.json()
			const theyLikedMe = likesReceivedData.some(
				(user: any) => user.id === userId,
			)

			setHasLikedMe(theyLikedMe)
		} catch (error) {
			console.error('Error removing match:', error)
		}
	}

	const handleOpenWork = () => {
		const tg = (window as any).Telegram?.WebApp
		// Haptic feedback асинхронно
		if (tg) {
			setTimeout(() => tg.HapticFeedback?.impactOccurred('light'), 0)
		}

		if (profile?.linkedResumeId) {
			router.push(`/work/resumes/${profile.linkedResumeId}`)
		} else if (profile?.linkedVacancyId) {
			router.push(`/work/vacancies/${profile.linkedVacancyId}`)
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
			/>

			{/* Debug info */}
			{process.env.NODE_ENV === 'development' && (
				<div
					style={{
						padding: '10px',
						background: '#333',
						color: '#fff',
						fontSize: '12px',
					}}
				>
					<div>hasLikedMe: {hasLikedMe ? 'true' : 'false'}</div>
					<div>isMatch: {isMatch ? 'true' : 'false'}</div>
					<div>isLiked: {isLiked ? 'true' : 'false'}</div>
					<div>
						showAddFriendButton: {hasLikedMe && !isMatch ? 'true' : 'false'}
					</div>
					<div>showRemoveMatchButton: {isMatch ? 'true' : 'false'}</div>
				</div>
			)}

			<div
				style={{
					padding: '20px',
					paddingBottom: '120px',
					WebkitOverflowScrolling: 'touch',
				}}
				className='flex-1 overflow-y-auto'
			>
				{/* Местоположение */}
				{(profile.networkingLocation || isMatch) && (
					<div
						className='flex justify-center gap-2 flex-wrap'
						style={{ margin: '18px 0' }}
					>
						{/* Красная плашка с юзернеймом при мэтче */}
						{isMatch && (
							<div
								className='inline-flex items-center rounded-[14px] cursor-pointer active:scale-95 transition-transform'
								style={{
									height: '28px',
									padding: '4px 12px',
									backgroundColor: '#7d271a',
								}}
								onClick={() => {
									const tg = (window as any).Telegram?.WebApp
									if (tg) {
										tg.HapticFeedback.impactOccurred('light')
										// Открываем личку в Telegram
										if (profile.telegramId) {
											tg.openTelegramLink(
												`https://t.me/${profile.username || `user${profile.telegramId}`}`,
											)
										}
									}
								}}
							>
								<span
									className='text-[13px] font-semibold text-[#FCF9F7]'
									style={{ fontFamily: 'LT Superior, sans-serif' }}
								>
									@
									{profile.username ||
										profile.networkingName.toLowerCase().replace(/\s+/g, '')}
								</span>
							</div>
						)}

						{profile.networkingLocation && (
							<div
								className='inline-flex items-center gap-1.5 rounded-[14px] bg-[rgba(252,249,247,0.15)]'
								style={{
									height: '28px',
									padding: '4px 12px',
									maxWidth: '150px',
								}}
							>
								<svg
									width='11'
									height='14'
									viewBox='0 0 11 14'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										fillRule='evenodd'
										clipRule='evenodd'
										d='M6.56333 12.7967C8.5228 10.6134 11 7.8526 11 5.3697C11 2.4045 8.53747 0 5.5 0C2.46253 0 0 2.4045 0 5.3697C0 7.8526 2.4772 10.6134 4.43667 12.7967C4.53422 12.9056 4.63053 13.0129 4.7252 13.1187C5.1357 13.5774 5.86431 13.5774 6.2748 13.1187C6.36947 13.0129 6.46578 12.9056 6.56333 12.7967ZM5.5 7C5.76483 7 6.02707 6.95021 6.27175 6.85347C6.51642 6.75673 6.73873 6.61493 6.926 6.43618C7.11326 6.25743 7.26181 6.04522 7.36316 5.81167C7.4645 5.57811 7.51667 5.32779 7.51667 5.075C7.51667 4.82221 7.4645 4.57189 7.36316 4.33833C7.26181 4.10478 7.11326 3.89257 6.926 3.71382C6.73873 3.53507 6.51642 3.39327 6.27175 3.29653C6.02707 3.19979 5.76483 3.15 5.5 3.15C4.96515 3.15 4.4522 3.35281 4.074 3.71382C3.6958 4.07483 3.48333 4.56446 3.48333 5.075C3.48333 5.58554 3.6958 6.07517 4.074 6.43618C4.4522 6.79719 4.96515 7 5.5 7Z'
										fill='#FCF9F7'
										fillOpacity='0.65'
									/>
								</svg>
								<span
									className='text-[13px] font-semibold text-[rgba(252,249,247,0.65)]'
									style={{
										fontFamily: 'LT Superior, sans-serif',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{profile.networkingLocation.length > 15
										? `${profile.networkingLocation.substring(0, 15)}...`
										: profile.networkingLocation}
								</span>
							</div>
						)}
					</div>
				)}

				{/* Плашка мэтч-работа */}
				{profile.hasWorkProfile && (
					<div
						className='relative rounded-[28px] overflow-hidden cursor-pointer active:scale-98 transition-transform'
						onClick={handleOpenWork}
						style={{
							width: '100%',
							height: '0',
							paddingBottom: '50.51%', // 197/390 = 0.5051 (сохраняем пропорции)
							backgroundImage: 'url(/banner_netw_work.webp)',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							marginBottom: '16px',
						}}
					>
						<div
							className='absolute inset-0 z-10'
							style={{ padding: '12px 24px' }}
						>
							<h3
								className='text-[#FCF9F7] mb-1 uppercase'
								style={{
									fontFamily: 'Oks, sans-serif',
									fontSize: '30px',
									lineHeight: '1.2',
									letterSpacing: '0.02em',
								}}
							>
								Профиль
								<br />
								на мэтч-работе
							</h3>
							<p
								className='text-[#FCF9F7] text-sm mb-4 opacity-90'
								style={{
									fontFamily: 'LT Superior, sans-serif',
									maxWidth: '50%',
								}}
							>
								{profile.linkedResume
									? `Смотри резюме от этого пользователя`
									: `Смотри вакансии от этого пользователя`}
							</p>
							<button
								className='inline-flex items-center gap-2 rounded-[20px] bg-[#FCF9F7] cursor-pointer border-none'
								style={{
									height: '40px',
									padding: '0 20px',
								}}
							>
								<svg
									width='11'
									height='11'
									viewBox='0 0 11 11'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M0.749999 -6.35649e-07C0.335786 -7.83163e-07 -7.83163e-07 0.335786 -6.35649e-07 0.749999L-1.05712e-06 7.5C-1.05712e-06 7.91421 0.335785 8.25 0.749999 8.25C1.16421 8.25 1.5 7.91421 1.5 7.5V1.5H7.5C7.91421 1.5 8.25 1.16421 8.25 0.749999C8.25 0.335785 7.91421 -1.05712e-06 7.5 -1.05712e-06L0.749999 -6.35649e-07ZM9.75 9.75L10.2803 9.21967L1.28033 0.219669L0.749999 0.749999L0.219669 1.28033L9.21967 10.2803L9.75 9.75Z'
										fill='#1D1D1B'
									/>
								</svg>
								<span
									className='text-[15px] font-semibold text-[#1D1D1B]'
									style={{ fontFamily: 'LT Superior, sans-serif' }}
								>
									Открыть
								</span>
							</button>
						</div>
					</div>
				)}

				{/* О себе */}
				{profile.networkingAbout && (
					<div
						className='bg-[#272727] rounded-[28px]'
						style={{ padding: '20px', marginBottom: '12px' }}
					>
						<h2
							className='text-[#FCF9F7] font-semibold text-[20px] mb-3 m-0'
							style={{ fontFamily: 'LT Superior, sans-serif' }}
						>
							О себе
						</h2>
						<p
							className='text-[rgba(252,249,247,0.85)] text-[15px] leading-relaxed m-0'
							style={{
								fontFamily: 'LT Superior, sans-serif',
								display: '-webkit-box',
								WebkitLineClamp: 3,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
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
					<div
						className='bg-[#272727] rounded-[28px]'
						style={{ padding: '20px', marginBottom: '12px' }}
					>
						<h2
							className='text-[#FCF9F7] font-semibold text-[20px] mb-3 m-0'
							style={{ fontFamily: 'LT Superior, sans-serif' }}
						>
							Навыки
						</h2>
						<div className='flex flex-wrap gap-2'>
							{profile.networkingSkills.map((skill, index) => (
								<span
									key={index}
									className='bg-[#F7710B] rounded-2xl text-[13px] text-[#121212] font-medium'
									style={{
										fontFamily: 'LT Superior, sans-serif',
										padding: '2px 8px',
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
					<div
						className='bg-[#272727] rounded-[28px]'
						style={{ padding: '20px', marginBottom: '12px' }}
					>
						<h2
							className='text-[#FCF9F7] font-semibold text-[20px] mb-3 m-0'
							style={{ fontFamily: 'LT Superior, sans-serif' }}
						>
							Ценности
						</h2>
						<div className='flex flex-wrap gap-2'>
							{profile.networkingValues.map((value, index) => (
								<span
									key={index}
									className='bg-[#F7710B] rounded-2xl text-[13px] text-[#121212] font-medium'
									style={{
										fontFamily: 'LT Superior, sans-serif',
										padding: '2px 8px',
									}}
								>
									{value.name}
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			<NetworkingBottomNav />
		</div>
	)
}

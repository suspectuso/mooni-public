'use client'

import ImagePreloader from '@/components/ImagePreloader'
import MatchLoader from '@/components/MatchLoader'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import ExpressLoveModal from '@/components/networking/ExpressLoveModal'
import LimitOverlay from '@/components/networking/LimitOverlay'
import MatchModal from '@/components/networking/MatchModal'
import PaymentInstructionScreen from '@/components/networking/PaymentInstructionScreen'
import SubscriptionModal from '@/components/networking/SubscriptionModal'
import { useNetworkingLimits } from '@/hooks/useNetworkingLimits'
import { getUserId, useNetworkingState } from '@/hooks/useNetworkingState'
import { useNetworkingSwipe } from '@/hooks/useNetworkingSwipe'
import { useEffect } from 'react'

const IMAGES_TO_PRELOAD = [
	'/card_aura_blue.webp',
	'/card_aura_orange.webp',
	'/card_aura_red.webp',
	'/blue_aura_top.webp',
	'/orange_aura_top.webp',
	'/red_aura_top.webp',
	'/match_netw.png',
	'/netw_subs.png',
	'/full_netw_bg.webp',
	'/ad_netw_plus.webp',
	'/skip_ad.webp',
	'/add_match.webp',
]

const AD_FREQUENCY = 20

export default function NetworkingPage() {
	const state = useNetworkingState()
	const limits = useNetworkingLimits()
	const swipe = useNetworkingSwipe(
		state.hasActiveSubscription,
		limits.likesCount,
		limits.swipesCount,
		limits.incrementLikes,
		limits.incrementSwipes,
		limits.setLimitReached,
		limits.setLimitMessage,
	)

	useEffect(() => {
		document.body.style.overflow = 'hidden'
		document.body.style.position = 'fixed'
		document.body.style.width = '100%'
		document.body.style.height = '100%'
		document.body.style.backgroundColor = '#121212'
		document.documentElement.style.backgroundColor = '#121212'

		const initPage = async () => {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.ready()
				tg.expand()
				tg.BackButton.show()
				tg.BackButton.onClick(() => state.router.push('/'))
				tg.setHeaderColor('#121212')
				tg.setBackgroundColor('#121212')
				tg.disableVerticalSwipes()

				const platform = tg.platform || ''
				const isDesktop =
					platform.includes('macos') ||
					platform.includes('windows') ||
					platform.includes('linux') ||
					platform.includes('web')
				state.setIsPlatformDesktop(isDesktop)
			}

			await state.checkProfileCompletion()
			await state.loadMyProfile()
			await limits.loadCounts()
			state.fetchProfiles()
		}

		initPage()

		return () => {
			document.body.style.overflow = ''
			document.body.style.position = ''
			document.body.style.width = ''
			document.body.style.height = ''
			document.body.style.backgroundColor = ''
			document.documentElement.style.backgroundColor = ''
		}
	}, [])

	useEffect(() => {
		if (
			Array.isArray(state.profiles) &&
			state.profiles.length - state.currentIndex <= 2 &&
			!state.isLoadingMore &&
			state.profiles.length > 0
		) {
			state.loadMoreProfiles()
		}
	}, [state.currentIndex, state.profiles.length])

	useEffect(() => {
		if (!state.isCheckingProfile && !state.isProfileComplete) {
			state.router.push('/networking/onboarding')
		}
	}, [state.isCheckingProfile, state.isProfileComplete, state.router])

	useEffect(() => {
		if (
			Array.isArray(state.profiles) &&
			state.currentIndex >= state.profiles.length &&
			state.profiles.length > 0 &&
			!state.isLoadingMore
		) {
			state.loadMoreProfiles()
		}
	}, [state.currentIndex, state.profiles.length])

	const handleLike = async () => {
		if (swipe.isSwipeDisabled) return

		if (!state.hasActiveSubscription) {
			if (limits.likesCount >= limits.LIKES_LIMIT) {
				limits.setLimitReached(true)
				limits.setLimitMessage('Вы достигли лимита лайков на сегодня (20)')
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
				return
			}
			if (limits.swipesCount >= limits.SWIPES_LIMIT) {
				limits.setLimitReached(true)
				limits.setLimitMessage('Вы достигли лимита свайпов на сегодня (50)')
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
				return
			}
		}

		swipe.setIsSwipeDisabled(true)

		if (Math.abs(swipe.dragOffset) < 150) {
			swipe.setDragOffset(150)
		}

		swipe.setIsAnimatingOut(true)
		swipe.setSwipeDirection('right')

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback?.impactOccurred('medium')
		}

		const currentProfile = state.profiles[state.currentIndex]
		const userId = getUserId()

		limits.incrementLikes()

		setTimeout(() => {
			swipe.setIsFadingOut(true)
		}, 300)

		setTimeout(() => {
			state.setCurrentIndex(prev => prev + 1)
			swipe.setDragOffset(0)
			swipe.setIsAnimatingOut(false)
			swipe.setSwipeDirection(null)
			swipe.setIsSwipeDisabled(false)
			swipe.setIsFadingOut(false)
			state.setTotalViewedCards(prev => prev + 1)
		}, 600)

		fetch(`/api/networking/swipe?userId=${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				candidateId: currentProfile.id,
				action: 'like',
			}),
		})
			.then(response => response.json())
			.then(async data => {
				if (data.isMatch) {
					const myProfileResponse = await fetch(
						`/api/networking/profile?userId=${userId}`,
					)
					const myProfile = await myProfileResponse.json()

					state.setMatchData({
						myAvatar: myProfile.networkingPhoto || myProfile.avatarUrl || '',
						matchAvatar: currentProfile.networkingPhoto,
						matchName:
							currentProfile.networkingName ||
							currentProfile.firstName ||
							'Пользователь',
						matchUsername: currentProfile.username,
					})

					state.setShowMatchModal(true)
					if (tg) tg.HapticFeedback.notificationOccurred('success')
				}
			})
			.catch(error => {
				console.error('Error swiping profile:', error)
			})
	}

	const handlePass = () => {
		if (swipe.isSwipeDisabled) return

		if (!state.hasActiveSubscription) {
			if (limits.swipesCount >= limits.SWIPES_LIMIT) {
				limits.setLimitReached(true)
				limits.setLimitMessage('Вы достигли лимита свайпов на сегодня (50)')
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
				return
			}
		}

		swipe.setIsSwipeDisabled(true)

		if (Math.abs(swipe.dragOffset) < 150) {
			swipe.setDragOffset(-150)
		}

		swipe.setIsAnimatingOut(true)
		swipe.setSwipeDirection('left')

		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')

		limits.incrementSwipes()

		const currentProfile = state.profiles[state.currentIndex]
		const userId = getUserId()

		setTimeout(() => {
			state.setCurrentIndex(prev => prev + 1)
			swipe.setDragOffset(0)
			swipe.setIsAnimatingOut(false)
			swipe.setSwipeDirection(null)
			swipe.setIsSwipeDisabled(false)
			state.setTotalViewedCards(prev => prev + 1)
		}, 600)

		fetch(`/api/networking/swipe?userId=${userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				candidateId: currentProfile.id,
				action: 'skip',
			}),
		}).catch(error => {
			console.error('Error swiping profile:', error)
		})
	}

	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!swipe.isDragging || swipe.isSwipeDisabled) return
			if (limits.limitReached && !state.hasActiveSubscription) return

			const currentX = e.clientX
			const diff = currentX - swipe.startX
			const resistance = 0.8
			swipe.setDragOffset(diff * resistance)
		}

		const handleGlobalMouseUp = () => {
			if (!swipe.isDragging || swipe.isSwipeDisabled) return

			if (limits.limitReached && !state.hasActiveSubscription) {
				swipe.setIsDragging(false)
				swipe.setDragOffset(0)
				return
			}

			swipe.setIsDragging(false)

			if (Math.abs(swipe.dragOffset) > 70) {
				if (swipe.dragOffset > 0) {
					handleLike()
				} else {
					handlePass()
				}
			} else {
				swipe.setDragOffset(0)
			}
		}

		if (swipe.isDragging) {
			document.addEventListener('mousemove', handleGlobalMouseMove)
			document.addEventListener('mouseup', handleGlobalMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleGlobalMouseUp)
		}
	}, [swipe.isDragging, swipe.isSwipeDisabled, swipe.dragOffset, swipe.startX])

	if (state.loading || state.isCheckingProfile) {
		return <MatchLoader />
	}

	const userId = getUserId()
	if (!userId) {
		return (
			<div className='h-screen bg-[#121212] flex flex-col'>
				<NetworkingHeader />
				<div className='flex-1 flex flex-col items-center justify-center px-6'>
					<div
						style={{
							width: '80px',
							height: '80px',
							borderRadius: '50%',
							backgroundColor: 'rgba(252, 249, 247, 0.1)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: '24px',
						}}
					>
						<svg
							width='40'
							height='40'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'
								fill='#FCF9F7'
								opacity='0.65'
							/>
						</svg>
					</div>
					<p
						className='text-[#FCF9F7] text-xl text-center mb-2'
						style={{ fontFamily: 'Oks, sans-serif' }}
					>
						Ошибка инициализации
					</p>
					<p className='text-[#FCF9F7]/65 text-sm text-center mb-8'>
						Откройте приложение через Telegram бота
					</p>
				</div>
				<NetworkingBottomNav />
			</div>
		)
	}

	if (!state.isProfileComplete) {
		return <MatchLoader />
	}

	if (state.currentIndex >= state.profiles.length && !limits.limitReached) {
		return (
			<div className='h-screen bg-[#121212] flex flex-col'>
				<NetworkingHeader />
				<div className='flex-1 flex flex-col items-center justify-center px-6'>
					{state.profiles.length === 0 && !state.loading ? (
						<>
							<p className='text-[#FCF9F7] text-lg text-center mb-4'>
								Пока нет профилей
							</p>
							<p className='text-[#FCF9F7]/65 text-sm text-center'>
								Включите показ профиля в настройках
							</p>
						</>
					) : (
						<MatchLoader />
					)}
				</div>
				<NetworkingBottomNav />
			</div>
		)
	}

	const rotation = swipe.dragOffset * 0.03
	const opacity =
		swipe.dragOffset < 0 ? 1 - Math.abs(swipe.dragOffset) / 400 : 1

	let visibleProfiles = Array.isArray(state.profiles)
		? state.profiles.slice(state.currentIndex, state.currentIndex + 3)
		: []

	if (
		limits.limitReached &&
		visibleProfiles.length === 0 &&
		state.profiles.length > 0
	) {
		visibleProfiles = [state.profiles[state.profiles.length - 1]]
	}

	const shouldShowAdAtCurrentPosition =
		state.totalViewedCards > 0 && state.totalViewedCards % AD_FREQUENCY === 0

	return (
		<ImagePreloader images={IMAGES_TO_PRELOAD}>
			<div
				className='h-screen bg-[#121212] flex flex-col relative'
				style={{
					overflow: 'hidden',
					position: 'fixed',
					width: '100%',
					top: 0,
					left: 0,
					touchAction: 'none',
				}}
			>
				<NetworkingHeader />

				{(swipe.dragOffset < -50 ||
					(swipe.isAnimatingOut && swipe.swipeDirection === 'left')) && (
					<div
						className='fixed inset-0 pointer-events-none'
						style={{
							backgroundColor: 'rgba(0, 0, 0, 0.7)',
							opacity: swipe.isAnimatingOut
								? 0.7
								: Math.min(Math.abs(swipe.dragOffset) / 200, 0.7),
							zIndex: 100,
							transition: swipe.isAnimatingOut
								? 'opacity 0.6s ease'
								: 'opacity 0.2s ease',
						}}
					/>
				)}

				{(swipe.dragOffset > 0 ||
					(swipe.isAnimatingOut && swipe.swipeDirection === 'right')) && (
					<div
						className='fixed inset-0 pointer-events-none flex items-center justify-center'
						style={{
							zIndex: 10,
							opacity: swipe.isFadingOut
								? 0
								: swipe.isAnimatingOut
									? 1.1
									: Math.min(0.1 + swipe.dragOffset / 150, 1.1),
							transition: swipe.isFadingOut
								? 'opacity 0.3s ease-out'
								: swipe.isAnimatingOut
									? 'opacity 0.2s ease-out'
									: swipe.isDragging
										? 'none'
										: 'opacity 0.3s ease',
						}}
					>
						<img
							src='/netw_yes.webp'
							alt='Like'
							style={{
								width: '100vw',
								height: '100vh',
								objectFit: 'cover',
							}}
						/>
					</div>
				)}

				<div
					className='flex-1 relative flex items-center justify-center'
					style={{ zIndex: 2, paddingBottom: '140px' }}
				>
					{/* Карточки профилей будут здесь - продолжение в следующем файле */}
				</div>

				<NetworkingBottomNav />

				{state.showMatchModal && state.matchData && (
					<MatchModal
						isOpen={state.showMatchModal}
						onClose={() => state.setShowMatchModal(false)}
						myAvatar={state.matchData.myAvatar}
						matchAvatar={state.matchData.matchAvatar}
						matchName={state.matchData.matchName}
						matchUsername={state.matchData.matchUsername}
					/>
				)}

				{state.showExpressLoveModal && state.expressLoveData && (
					<ExpressLoveModal
						isOpen={state.showExpressLoveModal}
						onClose={() => state.setShowExpressLoveModal(false)}
						onSend={async () => {
							const userId = getUserId()
							if (!userId) return

							try {
								const response = await fetch(
									`/api/networking/express-love?userId=${userId}`,
									{
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											candidateId: state.expressLoveData!.targetUserId,
										}),
									},
								)

								const data = await response.json()
								if (data.isMatch) {
									state.setMatchData({
										myAvatar: state.expressLoveData!.currentUserAvatar,
										matchAvatar: state.expressLoveData!.targetUserAvatar,
										matchName: state.expressLoveData!.targetUserName,
									})
									state.setShowMatchModal(true)
								}

								const tg = (window as any).Telegram?.WebApp
								if (tg) {
									tg.HapticFeedback.notificationOccurred('success')
								}
							} catch (error) {
								console.error('Error expressing love:', error)
							}

							state.setShowExpressLoveModal(false)
						}}
						currentUserAvatar={state.expressLoveData.currentUserAvatar}
						targetUserAvatar={state.expressLoveData.targetUserAvatar}
						targetUserName={state.expressLoveData.targetUserName}
						targetUserGender={state.expressLoveData.targetUserGender}
					/>
				)}

				<SubscriptionModal
					isOpen={state.showSubscriptionModal}
					onClose={() => state.setShowSubscriptionModal(false)}
					hasActiveSubscription={state.hasActiveSubscription}
					subscriptionEndDate={state.subscriptionEndDate}
					onPurchase={async () => {
						const tg = (window as any).Telegram?.WebApp
						try {
							const userId = getUserId()
							if (!userId) {
								throw new Error('No userId available')
							}

							const response = await fetch('/api/bot/send-payment-message', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ userId }),
							})

							if (!response.ok) {
								throw new Error('Failed to send payment message')
							}

							state.setShowSubscriptionModal(false)
							state.setShowPaymentInstruction(true)

							if (tg) {
								tg.openTelegramLink('https://t.me/match_msd_bot')
								tg.HapticFeedback.notificationOccurred('success')
							}
						} catch (error) {
							console.error('Error sending payment message:', error)
							if (tg) {
								tg.showAlert('Ошибка при отправке сообщения. Попробуйте позже.')
								tg.HapticFeedback.notificationOccurred('error')
							}
						}
					}}
				/>

				<PaymentInstructionScreen
					isOpen={state.showPaymentInstruction}
					onClose={() => state.setShowPaymentInstruction(false)}
				/>

				<LimitOverlay
					limitReached={limits.limitReached}
					hasActiveSubscription={state.hasActiveSubscription}
					timeUntilReset={limits.timeUntilReset}
					onOpenSubscription={async () => {
						await state.checkSubscription()
						state.setShowSubscriptionModal(true)
					}}
				/>

				<style jsx global>{`
					@keyframes rotateAura {
						from {
							transform: translate(-50%, -50%) rotate(0deg);
						}
						to {
							transform: translate(-50%, -50%) rotate(360deg);
						}
					}

					@keyframes shake {
						0%,
						100% {
							transform: translateX(0) rotate(0deg);
						}
						10%,
						30%,
						50%,
						70%,
						90% {
							transform: translateX(-5px) rotate(-2deg);
						}
						20%,
						40%,
						60%,
						80% {
							transform: translateX(5px) rotate(2deg);
						}
					}
				`}</style>
			</div>
		</ImagePreloader>
	)
}

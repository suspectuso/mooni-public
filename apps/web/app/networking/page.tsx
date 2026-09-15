'use client'

import ImagePreloader from '@/components/ImagePreloader'
import MatchLoader from '@/components/MatchLoader'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import EmptyState from '@/components/networking/EmptyState'
import ExpressLoveModal from '@/components/networking/ExpressLoveModal'
import MegaLikeModal from '@/components/networking/MegaLikeModal'
import LimitReachedOverlay from '@/components/networking/LimitReachedOverlay'
import MatchModal from '@/components/networking/MatchModal'
import PaymentInstructionScreen from '@/components/networking/PaymentInstructionScreen'
import ProfileCard from '@/components/networking/ProfileCard'
import ProfileCardAura from '@/components/networking/ProfileCard/ProfileCardAura'
import MissedMatchOnboardingModal from '@/components/networking/MissedMatchOnboardingModal'
import RewindExhaustedModal from '@/components/networking/RewindExhaustedModal'
import SubscriptionModal from '@/components/networking/SubscriptionModal'
import SwipeIndicators from '@/components/networking/SwipeIndicators'
import { useSwipeGestures } from '@/hooks/useSwipeGestures'
import { useSwipeLimits } from '@/hooks/useSwipeLimits'
import { useTelegramInit } from '@/hooks/useTelegramInit'
import { NetworkingProfile } from '@/types/networking'
import { getUserId } from '@/utils/telegram'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const IMAGES_TO_PRELOAD = [
	'/card_aura_blue.webp',
	'/card_aura_orange.webp',
	'/card_aura_red.webp',
	'/blue_aura_top.webp',
	'/orange_aura_top.webp',
	'/red_aura_top.webp',
	'/match_netw.webp',
	'/netw_subs.png',
	'/full_netw_bg.webp',
	'/ad_netw_plus.webp',
	'/skip_ad.webp',
	'/add_match.webp',
	'/rewind_btn_active.png',
]

export default function NetworkingPage() {
	const router = useRouter()
	const { isPlatformDesktop } = useTelegramInit()

	const [profiles, setProfiles] = useState<NetworkingProfile[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [currentPhotoLoaded, setCurrentPhotoLoaded] = useState(false)
	const [loading, setLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [isSwipeDisabled, setIsSwipeDisabled] = useState(false)
	const [isProfileComplete, setIsProfileComplete] = useState(true)
	const [isCheckingProfile, setIsCheckingProfile] = useState(true)
	const [isAnimatingOut, setIsAnimatingOut] = useState(false)
	const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
		null,
	)
	const [isFadingOut, setIsFadingOut] = useState(false)
	const [lastSwipedCards, setLastSwipedCards] = useState<Array<{
		profile: NetworkingProfile
		action: 'like' | 'skip'
	}>>([])
	const [isRewinding, setIsRewinding] = useState(false)
	const [rewindCount, setRewindCount] = useState<number | null>(null)
	const [rewindResetAt, setRewindResetAt] = useState<string | null>(null)
	const [missedMatch, setMissedMatch] = useState(false)
	const [missedMatchFading, setMissedMatchFading] = useState(false)
	const swipeCountRef = useRef(0)
	const missedMatchShownRef = useRef(false)
	const [showMissedMatchOnboarding, setShowMissedMatchOnboarding] = useState(false)
	const missedMatchOnboardingShownRef = useRef(false)

	const [showMatchModal, setShowMatchModal] = useState(false)
	const [matchData, setMatchData] = useState<{
		myAvatar: string
		matchAvatar: string
		matchName: string
		matchUsername?: string
	} | null>(null)

	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [showRewindExhaustedModal, setShowRewindExhaustedModal] = useState(false)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<
		string | undefined
	>(undefined)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const [headerModalOpen, setHeaderModalOpen] = useState(false)

	// Track header modal state (SubscriptionModal opened from NetworkingHeader)
	useEffect(() => {
		const observer = new MutationObserver(() => {
			setHeaderModalOpen(!!document.body.dataset.headerModal)
		})
		observer.observe(document.body, { attributes: true, attributeFilter: ['data-header-modal'] })
		return () => observer.disconnect()
	}, [])

	const [showExpressLoveModal, setShowExpressLoveModal] = useState(false)
	const [expressLoveData, setExpressLoveData] = useState<{
		currentUserAvatar: string
		targetUserAvatar: string
		targetUserName: string
		targetUserGender?: string
		targetUserId: string
	} | null>(null)

	const [showMegaLikeModal, setShowMegaLikeModal] = useState(false)
	const [megaLikeData, setMegaLikeData] = useState<{
		currentUserAvatar: string
		targetUserAvatar: string
		targetUserName: string
		targetUserId: string
	} | null>(null)

	const [myProfile, setMyProfile] = useState<any>(null)

	const {
		swipesCount,
		likesCount,
		limitReached,
		setLimitReached,
		limitMessage,
		setLimitMessage,
		timeUntilReset,
		loadCounts,
		incrementSwipes,
		incrementLikes,
		resetLimit,
		SWIPES_LIMIT,
		LIKES_LIMIT,
	} = useSwipeLimits()

	const handleSwipeLeft = () => handlePass()
	const handleSwipeRight = () => handleLike()

	const {
		dragOffset,
		isDragging,
		setDragOffset,
		setIsDragging,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleMouseDown,
	} = useSwipeGestures({
		isSwipeDisabled,
		limitReached,
		hasActiveSubscription,
		onSwipeLeft: handleSwipeLeft,
		onSwipeRight: handleSwipeRight,
	})

	// BackButton — refs чтобы хендлер не пересоздавался при смене состояний
	const showExpressLoveModalRef = useRef(showExpressLoveModal)
	const showMatchModalRef = useRef(showMatchModal)
	const showSubscriptionModalRef = useRef(showSubscriptionModal)
	const showPaymentInstructionRef = useRef(showPaymentInstruction)
	const showMegaLikeModalRef = useRef(showMegaLikeModal)

	useEffect(() => { showExpressLoveModalRef.current = showExpressLoveModal }, [showExpressLoveModal])
	useEffect(() => { showMatchModalRef.current = showMatchModal }, [showMatchModal])
	useEffect(() => { showSubscriptionModalRef.current = showSubscriptionModal }, [showSubscriptionModal])
	useEffect(() => { showPaymentInstructionRef.current = showPaymentInstruction }, [showPaymentInstruction])
	useEffect(() => { showMegaLikeModalRef.current = showMegaLikeModal }, [showMegaLikeModal])

	// BackButton — единый обработчик, регистрируется один раз
	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg?.BackButton) return

		const handler = () => {
			// Сначала проверяем модалки из NetworkingHeader (подписка, фильтры, оплата)
			if (document.body.dataset.headerModal) {
				window.dispatchEvent(new Event('closeHeaderModal'))
				return
			}
			if (showMegaLikeModalRef.current) {
				setShowMegaLikeModal(false)
				return
			}
			if (showExpressLoveModalRef.current) {
				setShowExpressLoveModal(false)
				return
			}
			if (showMatchModalRef.current) {
				setShowMatchModal(false)
				return
			}
			if (showSubscriptionModalRef.current) {
				setShowSubscriptionModal(false)
				return
			}
			if (showPaymentInstructionRef.current) {
				setShowPaymentInstruction(false)
				return
			}
			router.push('/')
		}

		tg.BackButton.show()
		tg.BackButton.onClick(handler)
		return () => {
			tg.BackButton.offClick(handler)
			tg.BackButton.hide()
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const initPage = async () => {
			await checkProfileCompletion()

			// Проверяем сохранённое состояние (возврат из просмотра профиля)
			let restored = false
			try {
				const saved = sessionStorage.getItem('networkingFeedState')
				if (saved) {
					sessionStorage.removeItem('networkingFeedState')
					const state = JSON.parse(saved)
					// Восстанавливаем только если прошло менее 5 минут
					if (
						state.profiles?.length > 0 &&
						Date.now() - state.timestamp < 5 * 60 * 1000
					) {
						setProfiles(state.profiles)
						setCurrentIndex(state.currentIndex)
						setLoading(false)
						restored = true
					}
				}
			} catch (e) {
				console.error('Error restoring feed state:', e)
			}

			// Загружаем счётчик возвратов с бэкенда
			const loadRewindStatus = async () => {
				try {
					const uid = getUserId()
					if (!uid) return
					const res = await fetch(`/api/networking/rewind?userId=${uid}`)
					if (res.ok) {
						const data = await res.json()
						setRewindCount(data.rewindCount || 0)
						setRewindResetAt(data.resetAt || null)
					}
				} catch (e) {
					console.warn('Error loading rewind status:', e)
				}
			}

			// Остальные запросы параллельно
			await Promise.all([
				loadMyProfile(),
				checkSubscription(),
				loadRewindStatus(),
				loadCounts(),
				...(restored ? [] : [fetchProfiles()]),
			])
		}
		initPage()

		// Слушаем событие обновления фильтров
		const handleFiltersUpdate = () => {
			setCurrentIndex(0)
			setCurrentPhotoLoaded(false)
			setProfiles([])
			fetchProfiles()
		}

		window.addEventListener('filtersUpdated', handleFiltersUpdate)

		return () => {
			window.removeEventListener('filtersUpdated', handleFiltersUpdate)
		}
	}, [])

	useEffect(() => {
		if (
			Array.isArray(profiles) &&
			profiles.length - currentIndex <= 2 &&
			!isLoadingMore &&
			profiles.length > 0
		) {
			loadMoreProfiles()
		}
	}, [currentIndex, profiles.length])

	useEffect(() => {
		if (!isCheckingProfile && !isProfileComplete) {
			router.push('/networking/onboarding')
		}
	}, [isCheckingProfile, isProfileComplete, router])

	useEffect(() => {
		// Сбрасываем лимит если есть активная подписка
		if (!isCheckingSubscription && hasActiveSubscription && limitReached) {
			resetLimit()
		}
	}, [isCheckingSubscription, hasActiveSubscription, limitReached])

	useEffect(() => {
		if (
			Array.isArray(profiles) &&
			currentIndex >= profiles.length &&
			profiles.length > 0 &&
			!isLoadingMore
		) {
			loadMoreProfiles()
		}
	}, [currentIndex, profiles.length])

	const checkProfileCompletion = async () => {
		try {
			const userId = getUserId()
			if (!userId) {
				console.error('No userId available from Telegram')
				setIsProfileComplete(false)
				setIsCheckingProfile(false)
				return
			}

			const response = await fetch(`/api/networking/profile?userId=${userId}`)
			if (!response.ok) {
				console.error('Failed to fetch profile:', response.status)
				setIsProfileComplete(false)
				setIsCheckingProfile(false)
				return
			}

			const profile = await response.json()

			// Обязательные поля:
			// 1. Город (networkingLocation)
			// 2. Возраст (networkingAge)
			// 3. Пол (networkingGender)
			// 4. О себе (networkingAbout)
			// 5. Навыки (networkingSkills - хотя бы один)
			// 6. Ценности (networkingValues - хотя бы одна)
			// 7. Статус поиска (networkingLookingFor - хотя бы один)
			const isComplete =
				profile.networkingLocation &&
				profile.networkingAge &&
				profile.networkingGender &&
				profile.networkingAbout &&
				profile.networkingSkills?.length > 0 &&
				profile.networkingValues?.length > 0 &&
				profile.networkingLookingFor?.length > 0

			setIsProfileComplete(isComplete)
			setIsCheckingProfile(false)
		} catch (error) {
			console.error('Error checking profile:', error)
			setIsProfileComplete(false)
			setIsCheckingProfile(false)
		}
	}

	const loadMyProfile = async () => {
		try {
			const userId = getUserId()
			if (!userId) return

			const response = await fetch(`/api/networking/profile?userId=${userId}`)
			if (response.ok) {
				const profile = await response.json()
				setMyProfile(profile)
			}
		} catch (error) {
			console.error('Error loading my profile:', error)
		}
	}

	const checkSubscription = async () => {
		try {
			const userId = getUserId()
			if (!userId) {
				setIsCheckingSubscription(false)
				return
			}

			const response = await fetch(
				`/api/subscriptions/check?userId=${userId}&type=NETWORKING_PLUS`,
			)
			const data = await response.json()
			setHasActiveSubscription(data.hasActive || false)
			setSubscriptionEndDate(data.endDate)
		} catch (error) {
			console.error('Error checking subscription:', error)
			setHasActiveSubscription(false)
			setSubscriptionEndDate(undefined)
		} finally {
			setIsCheckingSubscription(false)
		}
	}

	const fetchProfiles = async () => {
		try {
			const userId = getUserId()
			if (!userId) {
				console.error('No userId available from Telegram')
				setProfiles([])
				setLoading(false)
				return
			}

			// Получаем фильтры из localStorage
			let filters: any = null
			if (typeof window !== 'undefined') {
				const savedFilters = localStorage.getItem('networkingFilters')
				if (savedFilters) {
					const parsedFilters = JSON.parse(savedFilters)

					// Проверяем что фильтры не пустые
					const hasActiveFilters =
						parsedFilters.gender ||
						parsedFilters.city ||
						(parsedFilters.ageRange &&
							parsedFilters.ageRange.length === 2 &&
							(parsedFilters.ageRange[0] !== 16 ||
								parsedFilters.ageRange[1] !== 70)) ||
						(parsedFilters.auras && parsedFilters.auras.length > 0) ||
						(parsedFilters.skills && parsedFilters.skills.length > 0) ||
						(parsedFilters.values && parsedFilters.values.length > 0)

					if (hasActiveFilters) {
						filters = parsedFilters
					}
				}
			}

			// Формируем query параметры
			const params = new URLSearchParams({
				userId: userId.toString(),
				limit: '10',
			})

			// Mooni: выбранный сценарий/настроение из пикера (/scenarios)
			if (typeof window !== 'undefined') {
				const mood = localStorage.getItem('mooniMood')
				if (mood) params.append('mood', mood)
			}

			// Добавляем фильтры только если они активны
			if (filters) {
				params.append('filters', JSON.stringify(filters))
			} else {
				console.log('📤 No active filters, fetching all profiles')
			}

			const response = await fetch(`/api/networking/feed?${params.toString()}`)
			if (!response.ok) {
				console.error('Failed to fetch feed, status:', response.status)
				const errorData = await response.json()
				console.error('Error data:', errorData)
				setProfiles([])
				return
			}

			const data = await response.json()

			if (Array.isArray(data)) {
				setProfiles(data)
			} else {
				console.error('Feed data is not an array:', data)
				setProfiles([])
			}
		} catch (error) {
			console.error('Error fetching feed:', error)
			setProfiles([])
		} finally {
			setLoading(false)
		}
	}

	const loadMoreProfiles = async () => {
		if (isLoadingMore) return
		setIsLoadingMore(true)

		try {
			const userId = getUserId()

			// Получаем фильтры из localStorage
			let filters: any = null
			if (typeof window !== 'undefined') {
				const savedFilters = localStorage.getItem('networkingFilters')
				if (savedFilters) {
					const parsedFilters = JSON.parse(savedFilters)

					// Проверяем что фильтры не пустые
					const hasActiveFilters =
						parsedFilters.gender ||
						parsedFilters.city ||
						(parsedFilters.ageRange &&
							parsedFilters.ageRange.length === 2 &&
							(parsedFilters.ageRange[0] !== 16 ||
								parsedFilters.ageRange[1] !== 70)) ||
						(parsedFilters.auras && parsedFilters.auras.length > 0) ||
						(parsedFilters.skills && parsedFilters.skills.length > 0) ||
						(parsedFilters.values && parsedFilters.values.length > 0)

					if (hasActiveFilters) {
						filters = parsedFilters
					}
				}
			}

			// Формируем query параметры
			const params = new URLSearchParams({
				userId: userId.toString(),
				limit: '10',
			})

			// Mooni: выбранный сценарий/настроение из пикера (/scenarios)
			if (typeof window !== 'undefined') {
				const mood = localStorage.getItem('mooniMood')
				if (mood) params.append('mood', mood)
			}

			// Добавляем фильтры только если они активны
			if (filters) {
				params.append('filters', JSON.stringify(filters))
			}

			const response = await fetch(`/api/networking/feed?${params.toString()}`)
			const data = await response.json()

			if (!Array.isArray(data)) {
				console.error('Feed data is not an array:', data)
				setProfiles([])
				setIsLoadingMore(false)
				return
			}

			const existingIds = new Set(
				Array.isArray(profiles) ? profiles.map(p => p.id) : [],
			)
			const newProfiles = data.filter(
				(p: NetworkingProfile) => !existingIds.has(p.id),
			)

			if (newProfiles.length > 0) {
				setProfiles(prev => [...prev, ...newProfiles])
			} else if (data.length > 0) {
				// Нет новых уникальных — дописываем повторных в конец (без сброса индекса)
				setProfiles(prev => [...prev, ...data])
			}
		} catch (error) {
			console.error('Error loading more profiles:', error)
			setProfiles([])
		} finally {
			setIsLoadingMore(false)
		}
	}

	const handleLike = async () => {
		if (isSwipeDisabled) return

		if (!hasActiveSubscription) {
			if (likesCount >= LIKES_LIMIT) {
				setLimitReached(true)
				setLimitMessage('Вы достигли лимита лайков на сегодня (20)')
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
				return
			}
			if (swipesCount >= SWIPES_LIMIT) {
				setLimitReached(true)
				setLimitMessage('Вы достигли лимита свайпов на сегодня (50)')
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
				return
			}
		}

		setIsSwipeDisabled(true)

		if (Math.abs(dragOffset) < 150) {
			setDragOffset(150)
		}

		setIsAnimatingOut(true)
		setSwipeDirection('right')

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback?.impactOccurred('medium')
		}

		const currentProfile = profiles[currentIndex]
		const userId = getUserId()

		// Save for rewind (max 2 cards)
		setLastSwipedCards(prev => [{ profile: currentProfile, action: 'like' as const }, ...prev].slice(0, 2))

		if (!hasActiveSubscription) {
			incrementLikes()
		}

		setTimeout(() => {
			setIsAnimatingOut(false)
			setSwipeDirection(null)
			setDragOffset(0)
			setIsFadingOut(false)
			setCurrentPhotoLoaded(false)
			setCurrentIndex(prev => prev + 1)
			requestAnimationFrame(() => {
				setIsSwipeDisabled(false)
			})
		}, 300)

		fetch(
			`/api/networking/swipe?userId=${userId}${typeof window !== 'undefined' && localStorage.getItem('mooniMood') ? `&mood=${localStorage.getItem('mooniMood')}` : ''}`,
			{
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

					setMatchData({
						myAvatar: myProfile.networkingPhoto || myProfile.avatarUrl || '',
						matchAvatar: currentProfile.networkingPhoto,
						matchName:
							currentProfile.networkingName ||
							currentProfile.firstName ||
							'Пользователь',
						matchUsername: currentProfile.username,
					})

					setShowMatchModal(true)
					if (tg) tg.HapticFeedback.notificationOccurred('success')
				}
			})
			.catch(error => {
				console.error('Error swiping profile:', error)
			})
	}

	const handlePass = () => {
		if (isSwipeDisabled) return

		if (!hasActiveSubscription) {
			if (swipesCount >= SWIPES_LIMIT) {
				setLimitReached(true)
				setLimitMessage('Вы достигли лимита свайпов на сегодня (50)')
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('error')
				return
			}
		}

		setIsSwipeDisabled(true)

		if (Math.abs(dragOffset) < 150) {
			setDragOffset(-150)
		}

		setIsAnimatingOut(true)
		setSwipeDirection('left')

		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')

		if (!hasActiveSubscription) {
			incrementSwipes()
		}

		const currentProfile = profiles[currentIndex]
		const userId = getUserId()

		// Save for rewind (max 2 cards)
		setLastSwipedCards(prev => [{ profile: currentProfile, action: 'skip' as const }, ...prev].slice(0, 2))

		setTimeout(() => {
			setIsAnimatingOut(false)
			setSwipeDirection(null)
			setDragOffset(0)
			setCurrentPhotoLoaded(false)
			setCurrentIndex(prev => prev + 1)
			requestAnimationFrame(() => {
				setIsSwipeDisabled(false)
			})
		}, 300)

		fetch(
			`/api/networking/swipe?userId=${userId}${typeof window !== 'undefined' && localStorage.getItem('mooniMood') ? `&mood=${localStorage.getItem('mooniMood')}` : ''}`,
			{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				candidateId: currentProfile.id,
				action: 'skip',
			}),
		})
			.then(res => res.json())
			.then(data => {
				swipeCountRef.current += 1
				if (data?.missedMatch && swipeCountRef.current >= 2 && !missedMatchShownRef.current) {
					missedMatchShownRef.current = true
					setMissedMatch(true)
					setMissedMatchFading(false)
					setTimeout(() => {
						setMissedMatchFading(true)
						setTimeout(() => setMissedMatch(false), 500)
					}, 3500)
				}
			})
			.catch(error => {
				console.error('Error swiping profile:', error)
			})
	}

	const handleExpressLove = () => {
		const currentProfile = profiles[currentIndex]
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}

		setExpressLoveData({
			currentUserAvatar:
				myProfile?.networkingPhoto || myProfile?.avatarUrl || '',
			targetUserAvatar: currentProfile.networkingPhoto,
			targetUserName:
				currentProfile.networkingName || currentProfile.firstName || '',
			targetUserGender: currentProfile.networkingGender,
			targetUserId: currentProfile.id,
		})
		setShowExpressLoveModal(true)
	}

	const handleMegaLike = () => {
		const currentProfile = profiles[currentIndex]
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}

		setMegaLikeData({
			currentUserAvatar:
				myProfile?.networkingPhoto || myProfile?.avatarUrl || '',
			targetUserAvatar: currentProfile.networkingPhoto,
			targetUserName:
				currentProfile.networkingName || currentProfile.firstName || '',
			targetUserId: currentProfile.id,
		})
		setShowMegaLikeModal(true)
	}

	const handleRewind = async () => {
		if (lastSwipedCards.length === 0 || isRewinding || isSwipeDisabled) return

		const FREE_REWIND_LIMIT = 3

		// Free users: 3 rewinds total, premium: unlimited
		// Also show exhausted modal if rewind status not loaded yet
		if (!hasActiveSubscription && (rewindCount === null || rewindCount >= FREE_REWIND_LIMIT)) {
			setShowRewindExhaustedModal(true)
			return
		}

		// Show onboarding modal on first missed match rewind (only if rewinds available)
		if (missedMatchShownRef.current && !missedMatchOnboardingShownRef.current) {
			missedMatchOnboardingShownRef.current = true
			setShowMissedMatchOnboarding(true)
			return
		}

		setIsRewinding(true)
		setIsSwipeDisabled(true)

		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('medium')

		const lastCard = lastSwipedCards[0]

		// If last action was like, undo it on backend
		if (lastCard.action === 'like') {
			const userId = getUserId()
			try {
				await fetch(`/api/networking/unlike/${lastCard.profile.id}?userId=${userId}`, {
					method: 'DELETE',
				})
			} catch (error) {
				console.error('Error undoing like:', error)
			}
		}

		const startOffset = lastCard.action === 'like' ? 2000 : -2000

		setIsDragging(true)
		setDragOffset(startOffset)
		setCurrentIndex(prev => prev - 1)
		setProfiles(prev => {
			const newProfiles = [...prev]
			newProfiles[currentIndex - 1] = lastCard.profile
			return newProfiles
		})

		setLastSwipedCards(prev => prev.slice(1))

		// Increment rewind count for free users (on backend)
		if (!hasActiveSubscription) {
			const userId = getUserId()
			try {
				const res = await fetch(`/api/networking/rewind/use?userId=${userId}`, { method: 'POST' })
				if (res.ok) {
					const data = await res.json()
					setRewindCount(data.rewindCount || (rewindCount ?? 0) + 1)
					if (data.resetAt) setRewindResetAt(data.resetAt)
				}
			} catch (e) {
				console.warn('Error updating rewind count:', e)
				setRewindCount(prev => (prev ?? 0) + 1)
			}
		}

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setIsDragging(false)
				setDragOffset(0)

				setTimeout(() => {
					setIsRewinding(false)
					setIsSwipeDisabled(false)
				}, 300)
			})
		})
	}

	const handleCardClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')
		// Сохраняем состояние перед переходом в профиль
		try {
			sessionStorage.setItem(
				'networkingFeedState',
				JSON.stringify({
					profiles,
					currentIndex,
					timestamp: Date.now(),
				}),
			)
		} catch (e) {
			console.error('Error saving feed state:', e)
		}
		router.push(`/networking/user/${profiles[currentIndex].id}`)
	}

	if (loading || isCheckingProfile) {
		return <MatchLoader />
	}

	const userId = getUserId()
	if (!userId) {
		return <EmptyState type='no-user-id' />
	}

	if (!isProfileComplete) {
		return <MatchLoader />
	}

	if (currentIndex >= profiles.length && !limitReached) {
		return profiles.length === 0 && !loading ? (
			<EmptyState type='no-profiles' />
		) : (
			<div className='h-screen bg-[#121212] flex flex-col'>
				<NetworkingHeader />
				<div className='flex-1 flex flex-col items-center justify-center px-6'>
					<MatchLoader />
				</div>
				<NetworkingBottomNav />
			</div>
		)
	}

	const rotation = dragOffset * 0.03
	const rawOpacity = dragOffset < 0 ? 1 - Math.abs(dragOffset) / 400 : 1
	const opacity = isRewinding ? 1 : rawOpacity

	let visibleProfiles = Array.isArray(profiles)
		? profiles.slice(currentIndex, currentIndex + 3)
		: []

	if (limitReached && visibleProfiles.length === 0 && profiles.length > 0) {
		visibleProfiles = [profiles[profiles.length - 1]]
	}

	return (
		<ImagePreloader images={IMAGES_TO_PRELOAD}>
			<div
				className='bg-[#121212] flex flex-col relative'
				style={{
					overflow: 'hidden',
					position: 'fixed',
					width: '100%',
					top: 0,
					left: 0,
					bottom: 0,
					paddingTop: 'var(--tg-safe-top, 0px)',
					touchAction: 'none',
				}}
			>
				<NetworkingHeader />

				<SwipeIndicators
					dragOffset={dragOffset}
					isAnimatingOut={isAnimatingOut}
					swipeDirection={swipeDirection}
					isDragging={isDragging}
					isFadingOut={isFadingOut}
				/>

				<div
					className='flex-1 relative flex flex-col items-center'
					style={{ zIndex: 2, paddingBottom: '120px' }}
				>
					{/* "Ищу" speech bubble — between header and card */}
					{visibleProfiles.length > 0 && visibleProfiles[0].networkingSearchText && (() => {
						const a = visibleProfiles[0].networkingAura
						const bubbleBg = a === 'ORANGE' ? '#F7710B' : a === 'RED' ? '#F23318' : a === 'TURQUOISE' ? '#65FFF7' : 'rgba(252, 249, 247, 0.2)'
						const bubbleText = (!a || a === 'NONE') ? '#FCF9F7' : '#262626'
						return (
							<div
								style={{
									width: 'calc(100vw - 78px)',
									maxWidth: '400px',
									position: 'relative',
									flexShrink: 0,
									marginTop: '-20px',
									marginBottom: '30px',
									zIndex: 10,
								}}
							>
								<div
									style={{
										background: bubbleBg,
										borderRadius: '18px',
										padding: '12px 20px',
									}}
								>
									<p
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '14px',
											fontWeight: 500,
											color: bubbleText,
											lineHeight: 1.3,
											textAlign: 'center',
											margin: 0,
											wordBreak: 'break-word',
											overflowWrap: 'break-word',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical' as any,
											overflow: 'hidden',
										}}
									>
										{visibleProfiles[0].networkingSearchText}
									</p>
								</div>
								{/* Decorative circles — right */}
								<div
									style={{
										width: '16px',
										height: '16px',
										borderRadius: '50%',
										background: bubbleBg,
										position: 'absolute',
										right: '28px',
										top: 'calc(100% + -9px)',
										clipPath: 'inset(calc(50% + 1px) 0 0 0)',
									}}
								/>
								<div
									style={{
										width: '9px',
										height: '9px',
										borderRadius: '50%',
										background: bubbleBg,
										position: 'absolute',
										right: '23px',
										top: 'calc(100% + 5px)',
									}}
								/>
							</div>
						)
					})()}

					<div
						className='relative'
						style={{
							width: 'calc(100vw - 78px)',
							maxWidth: '400px',
							flex: 1,
						}}
					>
						{visibleProfiles.length > 0 && (
							<ProfileCardAura
								aura={visibleProfiles[0].networkingAura}
								photoReady={currentPhotoLoaded}
							/>
						)}

						{visibleProfiles.map((profile, index) => {
							const isCurrentCard = index === 0
							const isSecondCard = index === 1

							return (
								<ProfileCard
									key={profile.id}
									profile={profile}
									isCurrentCard={isCurrentCard}
									isSecondCard={isSecondCard}
									visibleProfilesLength={visibleProfiles.length}
									index={index}
									dragOffset={dragOffset}
									rotation={rotation}
									opacity={opacity}
									isDragging={isDragging}
									isAnimatingOut={isAnimatingOut}
									swipeDirection={swipeDirection}
									isSwipeDisabled={isSwipeDisabled}
									isPlatformDesktop={isPlatformDesktop}
									myProfile={myProfile}
									onTouchStart={handleTouchStart}
									onTouchMove={handleTouchMove}
									onTouchEnd={handleTouchEnd}
									onMouseDown={handleMouseDown}
									onCardClick={handleCardClick}
									onSkip={handlePass}
									onLike={handleLike}
									onExpressLove={handleExpressLove}
									onMegaLike={handleMegaLike}
									onPhotoLoad={() => setCurrentPhotoLoaded(true)}
								/>
							)
						})}

						{/* Missed match banner */}
						{missedMatch && lastSwipedCards.length > 0 && (
							<div
								style={{
									position: 'absolute',
									bottom: '37px',
									left: '50%',
									transform: `translateX(-50%) translateY(${missedMatchFading ? '10px' : '0'})`,
									zIndex: 49,
									width: '180px',
									opacity: missedMatchFading ? 0 : 1,
									transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
									animation: 'fadeIn 0.3s ease-out',
								}}
							>
								<div style={{ position: 'relative', width: '100%' }}>
									<img
										src="/missed_match_bubble.png"
										alt=""
										style={{
											width: '100%',
											height: 'auto',
											display: 'block',
										}}
									/>
									<span
										style={{
											position: 'absolute',
											top: '38%',
											left: '50%',
											transform: 'translate(-50%, -50%)',
											fontFamily: "'Zen Kaku Gothic New', sans-serif",
											fontWeight: 900,
											fontSize: '14px',
											color: '#121212',
											whiteSpace: 'nowrap',
										}}
									>
										Вы пропустили МЭТЧ
									</span>
								</div>
							</div>
						)}

						{/* Rewind button — visible for all, premium required to use */}
						{lastSwipedCards.length > 0 && visibleProfiles.length > 0 && (
							<div style={{ position: 'absolute', bottom: '-33px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
								<button
									onClick={handleRewind}
									disabled={isRewinding || isSwipeDisabled}
									style={{
										width: '56px',
										height: '56px',
										border: 'none',
										background: 'none',
										padding: 0,
										cursor: 'pointer',
										opacity: isRewinding || isSwipeDisabled ? 0.5 : 1,
										transition: 'opacity 0.2s',
										position: 'relative',
									}}
								>
									<img
										src={rewindCount !== null && (hasActiveSubscription || rewindCount < 3) ? '/rewind_btn_active.png' : '/rewind_btn.png'}
										alt='Назад'
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'contain',
											opacity: 0.85,
										}}
									/>
								</button>
								{/* Rewind count badge */}
								{rewindCount !== null && (hasActiveSubscription || rewindCount < 3) && (
									<div
										style={{
											position: 'absolute',
											top: '-4px',
											right: '-4px',
											width: '24px',
											height: '24px',
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
												fontSize: hasActiveSubscription ? '18px' : '14px',
												color: '#121212',
												lineHeight: 1,
												marginTop: hasActiveSubscription ? '-2px' : 0,
											}}
										>
											{hasActiveSubscription ? '∞' : 3 - (rewindCount ?? 0)}
										</span>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{limitReached && !hasActiveSubscription && !isCheckingSubscription && (
					<LimitReachedOverlay
						limitMessage={limitMessage}
						timeUntilReset={timeUntilReset}
						onOpenSubscription={async () => {
							await checkSubscription()
							setShowSubscriptionModal(true)
						}}
					/>
				)}
			</div>

			{!showSubscriptionModal && !headerModalOpen && <NetworkingBottomNav />}

			{showMatchModal && matchData && (
				<MatchModal
					isOpen={showMatchModal}
					onClose={() => setShowMatchModal(false)}
					myAvatar={matchData.myAvatar}
					matchAvatar={matchData.matchAvatar}
					matchName={matchData.matchName}
					matchUsername={matchData.matchUsername}
				/>
			)}

			{expressLoveData && (
				<ExpressLoveModal
					isOpen={showExpressLoveModal}
					onClose={() => setShowExpressLoveModal(false)}
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
										candidateId: expressLoveData.targetUserId,
									}),
								},
							)

							const data = await response.json()
							if (data.isMatch) {
								setMatchData({
									myAvatar: expressLoveData.currentUserAvatar,
									matchAvatar: expressLoveData.targetUserAvatar,
									matchName: expressLoveData.targetUserName,
								})
								setShowMatchModal(true)
							}

							const tg = (window as any).Telegram?.WebApp
							if (tg) {
								tg.HapticFeedback.notificationOccurred('success')
							}
						} catch (error) {
							console.error('Error expressing love:', error)
						}

						setShowExpressLoveModal(false)
					}}
					currentUserAvatar={expressLoveData.currentUserAvatar}
					targetUserAvatar={expressLoveData.targetUserAvatar}
					targetUserName={expressLoveData.targetUserName}
					targetUserGender={expressLoveData.targetUserGender}
				/>
			)}

			{megaLikeData && (
				<MegaLikeModal
					isOpen={showMegaLikeModal}
					onClose={() => setShowMegaLikeModal(false)}
					onSend={async (message) => {
						try {
							const userId = getUserId()
							const res = await fetch(
								`/api/networking/mega-like?userId=${userId}`,
								{
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({
										candidateId: megaLikeData.targetUserId,
										message,
									}),
								},
							)
							const data = await res.json()

							const tg = (window as any).Telegram?.WebApp
							if (tg) {
								tg.HapticFeedback.notificationOccurred('success')
							}

							if (data.success) {
								return {
									targetUsername: data.targetUsername,
									targetTelegramId: data.targetTelegramId,
								}
							}
						} catch (error) {
							console.error('Error sending mega-like:', error)
						}
					}}
					currentUserAvatar={megaLikeData.currentUserAvatar}
					targetUserAvatar={megaLikeData.targetUserAvatar}
					targetUserName={megaLikeData.targetUserName}
					megaLikesLeft={2}
				/>
			)}

			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				hasActiveSubscription={hasActiveSubscription}
				subscriptionEndDate={subscriptionEndDate}
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

						setShowSubscriptionModal(false)
						setShowPaymentInstruction(true)

						if (tg) {
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
				isOpen={showPaymentInstruction}
				onClose={() => setShowPaymentInstruction(false)}
			/>

			<RewindExhaustedModal
				isOpen={showRewindExhaustedModal}
				onClose={() => setShowRewindExhaustedModal(false)}
				onSubscribe={() => {
					setShowRewindExhaustedModal(false)
					setShowSubscriptionModal(true)
				}}
				nextResetDate={rewindResetAt || undefined}
			/>

			<MissedMatchOnboardingModal
				isOpen={showMissedMatchOnboarding}
				onClose={() => setShowMissedMatchOnboarding(false)}
				onUseRewind={() => {
					setShowMissedMatchOnboarding(false)
					handleRewind()
				}}
				rewindCount={rewindCount ?? 0}
				hasActiveSubscription={hasActiveSubscription}
				lastSkippedProfile={lastSwipedCards[0]?.profile ? {
					photos: [lastSwipedCards[0].profile.networkingPhoto].filter(Boolean),
					firstName: lastSwipedCards[0].profile.networkingName || lastSwipedCards[0].profile.firstName || '',
					skills: lastSwipedCards[0].profile.networkingSkills?.map(s => s.name) || [],
					city: lastSwipedCards[0].profile.networkingLocation || '',
				} : null}
			/>

		</ImagePreloader>
	)
}

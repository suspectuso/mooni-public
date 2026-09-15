import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface NetworkingProfile {
	id: string
	networkingName: string
	firstName?: string
	username?: string
	networkingPhoto: string
	networkingLocation: string
	networkingAbout: string
	networkingSkills: { name: string }[]
	networkingValues: { name: string }[]
	networkingAura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
	networkingLookingFor: string[]
	networkingGender?: string
	networkingCases: { id: string; photoPath: string; link: string | null }[]
	hasWorkProfile: boolean
	primarySkill: string | null
}

export const getUserId = () => {
	const tg = (window as any).Telegram?.WebApp
	let userId = tg?.initDataUnsafe?.user?.id?.toString()

	if (!userId || userId === 'undefined') {
		const initData = tg?.initData
		if (initData) {
			try {
				const params = new URLSearchParams(initData)
				const userParam = params.get('user')
				if (userParam) {
					const user = JSON.parse(userParam)
					userId = user.id?.toString()
				}
			} catch (e) {
				console.error('Error parsing initData:', e)
			}
		}
	}

	return userId || null
}

export const useNetworkingState = () => {
	const router = useRouter()
	const [profiles, setProfiles] = useState<NetworkingProfile[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const [showMatchModal, setShowMatchModal] = useState(false)
	const [matchData, setMatchData] = useState<{
		myAvatar: string
		matchAvatar: string
		matchName: string
		matchUsername?: string
	} | null>(null)
	const [isProfileComplete, setIsProfileComplete] = useState(true)
	const [isCheckingProfile, setIsCheckingProfile] = useState(true)
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<
		string | undefined
	>(undefined)
	const [showExpressLoveModal, setShowExpressLoveModal] = useState(false)
	const [totalViewedCards, setTotalViewedCards] = useState(0)
	const [expressLoveData, setExpressLoveData] = useState<{
		currentUserAvatar: string
		targetUserAvatar: string
		targetUserName: string
		targetUserGender?: string
		targetUserId: string
	} | null>(null)
	const [myProfile, setMyProfile] = useState<any>(null)
	const [isPlatformDesktop, setIsPlatformDesktop] = useState(false)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)

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
			const isComplete =
				profile.networkingLocation &&
				profile.networkingAbout &&
				profile.networkingSkills?.length > 0 &&
				profile.networkingValues?.length > 0

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
			if (!userId) return

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

			const response = await fetch(
				`/api/networking/feed?userId=${userId}&limit=10`,
			)
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
			const response = await fetch(
				`/api/networking/feed?userId=${userId}&limit=10`,
			)
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
				setProfiles(data)
				setCurrentIndex(0)
			} else {
				setProfiles([])
				setCurrentIndex(0)
			}
		} catch (error) {
			console.error('Error loading more profiles:', error)
			setProfiles([])
		} finally {
			setIsLoadingMore(false)
		}
	}

	return {
		profiles,
		setProfiles,
		currentIndex,
		setCurrentIndex,
		loading,
		isLoadingMore,
		showMatchModal,
		setShowMatchModal,
		matchData,
		setMatchData,
		isProfileComplete,
		isCheckingProfile,
		showSubscriptionModal,
		setShowSubscriptionModal,
		hasActiveSubscription,
		subscriptionEndDate,
		showExpressLoveModal,
		setShowExpressLoveModal,
		totalViewedCards,
		setTotalViewedCards,
		expressLoveData,
		setExpressLoveData,
		myProfile,
		isPlatformDesktop,
		setIsPlatformDesktop,
		showPaymentInstruction,
		setShowPaymentInstruction,
		checkProfileCompletion,
		loadMyProfile,
		checkSubscription,
		fetchProfiles,
		loadMoreProfiles,
		router,
	}
}

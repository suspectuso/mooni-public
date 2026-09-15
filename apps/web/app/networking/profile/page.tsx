'use client'

import MatchLoader from '@/components/MatchLoader'
import CasesModal from '@/components/networking/CasesModal'
import CasesSection from '@/components/networking/CasesSection'
import PaymentInstructionScreen from '@/components/networking/PaymentInstructionScreen'
import ProfileEditModal, { type BadgeType } from '@/components/networking/ProfileEditModal'
import ProfileHeader from '@/components/networking/ProfileHeader'
import ProfileInfoSection from '@/components/networking/ProfileInfoSection'
import ReferralBanner from '@/components/networking/ReferralBanner'
import ProfileSkillsValues from '@/components/networking/ProfileSkillsValues'
import ProfileToggle from '@/components/networking/ProfileToggle'
import SubscriptionModal from '@/components/networking/SubscriptionModal'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import WorkLinkModal from '@/components/work/WorkLinkModal'
import { getUserId } from '@/utils/telegram'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserProfile {
	networkingName: string
	firstName?: string
	networkingPhoto: string
	networkingLocation: string
	networkingAbout: string
	networkingEnabled: boolean
	networkingSkills: { name: string }[]
	networkingValues: { name: string }[]
	networkingLinkedResumeId: string | null
	networkingLinkedVacancyId: string | null
	linkedResume?: { id: string; position: string; category?: { name: string } }
	linkedVacancy?: { id: string; position: string }
	networkingGender?: string | null
	networkingBadge?: string | null
	networkingAura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
	networkingLookingFor: string[]
	networkingHelpText?: string | null
	networkingSearchText?: string | null
	networkingCases: {
		id: string
		photoPath: string
		title: string | null
		link: string | null
		sortOrder: number
	}[]
}

export default function NetworkingProfilePage() {
	const router = useRouter()
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [uploadingAvatar, setUploadingAvatar] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [showCasesModal, setShowCasesModal] = useState(false)
	const [showWorkLinkModal, setShowWorkLinkModal] = useState(false)
	const [uploadingCase, setUploadingCase] = useState<number | null>(null)
	const [viewingUserId, setViewingUserId] = useState<string | null>(null)
	const [hasLikedMe, setHasLikedMe] = useState(false)
	const [isMatch, setIsMatch] = useState(false)

	const [location, setLocation] = useState('')
	const [about, setAbout] = useState('')
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [selectedValues, setSelectedValues] = useState<string[]>([])
	const [selectedAura, setSelectedAura] = useState<
		'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED'
	>('NONE')
	const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([])
	const [selectedBadge, setSelectedBadge] = useState<BadgeType>('NONE')
	const [nickname, setNickname] = useState('')
	const [cases, setCases] = useState<
		{
			id: string
			photoPath: string
			title: string | null
			link: string | null
			sortOrder: number
		}[]
	>([])
	const [caseLinks, setCaseLinks] = useState<{ [key: string]: string }>({})
	const [caseTitles, _setCaseTitles] = useState<{ [key: string]: string }>({})
	const [_editingCaseLink, setEditingCaseLink] = useState<string | null>(null)

	const [categories, setCategories] = useState<any[]>([])
	const [values, setValues] = useState<any[]>([])
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const [_pendingAura, setPendingAura] = useState<
		'TURQUOISE' | 'ORANGE' | 'RED' | null
	>(null)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<
		string | undefined
	>(undefined)
	const [bannerLoaded] = useState(true)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => router.push('/networking')
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		fetchProfile()
		loadData()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	const loadData = async () => {
		try {
			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
			const categoriesRes = await fetch(`${API_URL}/work/skills/categories`)
			if (categoriesRes.ok) {
				const categoriesData = await categoriesRes.json()
				setCategories(categoriesData)
			}
			const valuesRes = await fetch(`${API_URL}/work/values`)
			if (valuesRes.ok) {
				const valuesData = await valuesRes.json()
				setValues(valuesData)
			}
		} catch (error) {
			console.error('Error loading data:', error)
		}
	}

	const checkSubscription = async () => {
		try {
			const telegramId = getUserId()

			// Проверяем подписку для просматриваемого профиля
			const urlParams = new URLSearchParams(window.location.search)
			const userIdParam = urlParams.get('userId')
			const profileUserId = userIdParam || telegramId

			const response = await fetch(
				`/api/subscriptions/check?userId=${profileUserId}&type=NETWORKING_PLUS`,
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

	const fetchProfile = async () => {
		try {
			const telegramId = getUserId() || ''

			// Check if we're viewing another user's profile
			const urlParams = new URLSearchParams(window.location.search)
			const userIdParam = urlParams.get('userId')

			// Determine which profile to fetch
			const profileUserId = userIdParam || telegramId

			// Set viewingUserId only if we're viewing someone else's profile
			if (userIdParam && userIdParam !== telegramId) {
				setViewingUserId(userIdParam)
			} else {
				setViewingUserId(null)
			}

			const response = await fetch(
				`/api/networking/profile?userId=${profileUserId}`,
			)
			const data = await response.json()

			// Log each case to check if id exists
			if (data.networkingCases) {
				data.networkingCases.forEach((c: any, index: number) => {
					console.log(`Case ${index}:`, {
						id: c.id,
						title: c.title,
						sortOrder: c.sortOrder,
						photoPath: c.photoPath,
					})
				})
			}

			setProfile(data)
			setLocation(data.networkingLocation || '')
			setAbout(data.networkingAbout || '')
			const skillsArray = data.networkingSkills?.map((s: any) => s.name) || []
			const valuesArray = data.networkingValues?.map((v: any) => v.name) || []
			setSelectedSkills(skillsArray)
			setSelectedValues(valuesArray)
			setSelectedAura(data.networkingAura || 'NONE')
			setSelectedBadge((data.networkingBadge as BadgeType) || 'NONE')
			setSelectedLookingFor(data.networkingLookingFor || [])
			setNickname(data.networkingName || '')
			setCases(data.networkingCases || [])
			const links: { [key: string]: string } = {}
			data.networkingCases?.forEach((c: any) => {
				if (c.link) links[c.id] = c.link
			})
			setCaseLinks(links)

			// If viewing another user's profile, check if they liked me
			if (userIdParam && userIdParam !== telegramId) {
				checkIfUserLikedMe(telegramId, userIdParam)
			}

			// Проверяем подписку
			await checkSubscription()
		} catch (error) {
			console.error('Error fetching profile:', error)
		} finally {
			setLoading(false)
		}
	}

	const checkIfUserLikedMe = async (myId: string, theirId: string) => {
		try {
			// Check if they liked me
			const likesResponse = await fetch(
				`/api/networking/likes-received?userId=${myId}`,
			)
			const likesReceived = await likesResponse.json()
			const hasLiked = likesReceived.some((user: any) => user.id === theirId)
			setHasLikedMe(hasLiked)

			// Check if I liked them
			const myLikesResponse = await fetch(
				`/api/networking/my-likes?userId=${myId}`,
			)
			const myLikes = await myLikesResponse.json()
			const iLikedThem = myLikes.some((user: any) => user.id === theirId)

			// Check if we're already matched (both liked each other)
			const matchesResponse = await fetch(
				`/api/networking/matches?userId=${myId}`,
			)
			const matches = await matchesResponse.json()
			const isMatched = matches.some((user: any) => user.id === theirId)

			// If both liked each other OR already matched, show remove button
			setIsMatch(isMatched || (hasLiked && iLikedThem))
		} catch (error) {
			console.error('Error checking if user liked me:', error)
		}
	}

	const handleAddFriend = async () => {
		if (!viewingUserId) return

		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			// Like the user back to create a match
			const response = await fetch(
				`/api/networking/like/${viewingUserId}?userId=${telegramId}`,
				{
					method: 'POST',
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				setHasLikedMe(false)
				setIsMatch(true)
			}
		} catch (error) {
			console.error('Error adding friend:', error)
		}
	}

	const handleRemoveMatch = async () => {
		if (!viewingUserId) return

		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			// Unlike the user to remove the match
			const response = await fetch(
				`/api/networking/unlike/${viewingUserId}?userId=${telegramId}`,
				{
					method: 'DELETE',
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				setIsMatch(false)
				// Check if they still like us
				checkIfUserLikedMe(telegramId, viewingUserId)
			}
		} catch (error) {
			console.error('Error removing match:', error)
		}
	}

	const saveField = async (field: string, value: any) => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			const response = await fetch(
				`/api/networking/profile?userId=${telegramId}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ [field]: value }),
				},
			)
			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				await fetchProfile()
			}
		} catch (error) {
			console.error('Error saving:', error)
		}
	}

	const handleSaveWorkLink = async (
		type: 'resume' | 'vacancy',
		id: string | null,
	) => {
		const field =
			type === 'resume'
				? 'networkingLinkedResumeId'
				: 'networkingLinkedVacancyId'
		await saveField(field, id)
	}

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		const fileName = file.name.toLowerCase()
		const allowedExtensions = [
			'.jpg',
			'.jpeg',
			'.png',
			'.webp',
			'.heic',
			'.heif',
		]
		const hasValidExtension = allowedExtensions.some(ext =>
			fileName.endsWith(ext),
		)

		if (!hasValidExtension) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, HEIC')
			}
			event.target.value = ''
			return
		}

		if (file.size > 10 * 1024 * 1024) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Файл слишком большой. Максимальный размер: 10MB')
			}
			event.target.value = ''
			return
		}

		setUploadingAvatar(true)

		try {
			const userId = getUserId()
			if (!userId) {
				console.error('No userId available')
				setUploadingAvatar(false)
				event.target.value = ''
				return
			}

			const formData = new FormData()
			formData.append('avatar', file)

			const response = await fetch(
				`/api/upload/avatar/networking?userId=${userId}`,
				{
					method: 'POST',
					body: formData,
				},
			)

			if (response.ok) {
				const tg = (window as any).Telegram?.WebApp
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				await fetchProfile()
			} else {
				const errorData = await response.json().catch(() => ({}))
				console.error('Failed to upload avatar:', {
					status: response.status,
					statusText: response.statusText,
					error: errorData,
				})
				throw new Error(
					`Failed to upload avatar: ${response.status} ${errorData.error || response.statusText}`,
				)
			}
		} catch (error) {
			console.error('Error uploading avatar:', error)
		} finally {
			setUploadingAvatar(false)
			event.target.value = ''
		}
	}

	const handleCaseUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
		sortOrder: number,
	): Promise<string | void> => {
		const file = event.target.files?.[0]
		if (!file) return

		const fileName = file.name.toLowerCase()
		const allowedExtensions = [
			'.jpg',
			'.jpeg',
			'.png',
			'.webp',
			'.heic',
			'.heif',
		]
		const hasValidExtension = allowedExtensions.some(ext =>
			fileName.endsWith(ext),
		)

		if (!hasValidExtension) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, HEIC')
			}
			event.target.value = ''
			return
		}

		if (file.size > 10 * 1024 * 1024) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Файл слишком большой. Максимальный размер: 10MB')
			}
			event.target.value = ''
			return
		}

		setUploadingCase(sortOrder)

		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			const formData = new FormData()
			formData.append('file', file)
			formData.append('userId', telegramId)
			formData.append('sortOrder', sortOrder.toString())

			const existingCase = cases.find(c => c.sortOrder === sortOrder)

			if (existingCase) {
				const response = await fetch(
					`/api/networking/cases/${existingCase.id}?userId=${telegramId}`,
					{
						method: 'PATCH',
						body: formData,
					},
				)
				if (response.ok) {
					if (tg) tg.HapticFeedback.notificationOccurred('success')
					await fetchProfile()
					return existingCase.id
				}
			} else {
				const response = await fetch(
					`/api/networking/cases?userId=${telegramId}`,
					{
						method: 'POST',
						body: formData,
					},
				)
				if (response.ok) {
					if (tg) tg.HapticFeedback.notificationOccurred('success')
					const newCase = await response.json()
					await fetchProfile()
					return newCase.id
				}
			}
		} catch (error) {
			console.error('Error uploading case:', error)
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Ошибка при загрузке кейса')
			}
		} finally {
			setUploadingCase(null)
			event.target.value = ''
		}
	}

	const handleDeleteCase = async (caseId: string) => {

		if (!caseId || caseId === 'undefined') {
			console.error('Invalid caseId:', caseId)
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert(
					'Ошибка: ID кейса не найден. Попробуйте обновить страницу.',
				)
			}
			return
		}

		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			const response = await fetch(
				`/api/networking/cases/${caseId}?userId=${telegramId}`,
				{
					method: 'DELETE',
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				await fetchProfile()
			} else {
				const errorText = await response.text()
				console.error('Delete failed:', errorText)
			}
		} catch (error) {
			console.error('Error deleting case:', error)
		}
	}

	const handleSaveCase = async (
		caseId: string,
		title: string,
		link: string,
	) => {

		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			const response = await fetch(
				`/api/networking/cases/${caseId}?userId=${telegramId}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: title || null, link: link || null }),
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				await fetchProfile()
			} else {
				const errorText = await response.text()
				console.error('Save case failed:', errorText)
			}
		} catch (error) {
			console.error('Error saving case:', error)
		}
	}

	const handleSaveCaseLink = async (caseId: string) => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			const response = await fetch(
				`/api/networking/cases/${caseId}?userId=${telegramId}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: caseTitles[caseId] || null,
						link: caseLinks[caseId] || null,
					}),
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				setEditingCaseLink(null)
				await fetchProfile()
			}
		} catch (error) {
			console.error('Error saving case link:', error)
		}
	}

	const toggleLookingFor = (type: string) => {
		if (selectedLookingFor.includes(type)) {
			setSelectedLookingFor(selectedLookingFor.filter(t => t !== type))
		} else {
			setSelectedLookingFor([...selectedLookingFor, type])
		}
	}

	const handleAuraChange = async (
		aura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED',
	) => {
		const tg = (window as any).Telegram?.WebApp

		// Если выбрана аура (не "Без ауры"), проверяем подписку
		if (aura !== 'NONE') {
			setLoading(true)
			try {
				const telegramId = getUserId() || ''

				// Проверяем есть ли активная подписка
				const response = await fetch(
					`/api/subscriptions/check?userId=${telegramId}&type=NETWORKING_PLUS`,
				)
				const data = await response.json()

				if (data.hasActive) {
					// Подписка есть - сохраняем ауру
					setSelectedAura(aura)
					setLoading(false)
				} else {
					// Подписки нет - показываем модалку
					setPendingAura(aura as 'TURQUOISE' | 'ORANGE' | 'RED')
					setLoading(false)
					await checkSubscription() // Обновляем данные подписки
					setShowSubscriptionModal(true)
				}
			} catch (error) {
				console.error('Error checking subscription:', error)
				setLoading(false)
				setPendingAura(aura as 'TURQUOISE' | 'ORANGE' | 'RED')
				await checkSubscription()
				setShowSubscriptionModal(true)
			}
		} else {
			setSelectedAura(aura)
		}
	}

	const handleSubscriptionPurchase = async () => {
		const tg = (window as any).Telegram?.WebApp

		try {
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!telegramId) {
				const urlParams = new URLSearchParams(window.location.search)
				telegramId = urlParams.get('tgWebAppStartParam')
			}
			if (!telegramId || telegramId === 'undefined') {
				throw new Error('No userId available')
			}

			// Отправляем запрос на бэк для отправки сообщения в бот
			const response = await fetch('/api/bot/send-payment-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: telegramId }),
			})

			if (!response.ok) {
				throw new Error('Failed to send payment message')
			}

			// Закрываем модалку
			setShowSubscriptionModal(false)

			// Показываем экран с инструкцией
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
	}

	const handleSaveEditModal = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const telegramId = getUserId() || ''

			const response = await fetch(
				`/api/networking/profile?userId=${telegramId}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						networkingAura: selectedAura,
						networkingBadge: selectedBadge,
						networkingLookingFor: selectedLookingFor,
						networkingName: nickname || null,
					}),
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				await fetchProfile()
				// Обновляем бейдж локально (бэкенд может ещё не хранить это поле)
				setProfile(prev => prev ? { ...prev, networkingBadge: selectedBadge } : prev)
				setShowEditModal(false)
			}
		} catch (error) {
			console.error('Error saving:', error)
		}
	}

	if (loading || !profile || !bannerLoaded) {
		return <MatchLoader />
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
				paddingBottom: '80px',
			}}
		>
			<NetworkingHeader />

			<ProfileHeader
				profile={profile}
				uploadingAvatar={uploadingAvatar}
				onAvatarUpload={handleAvatarUpload}
				onEditClick={() => setShowEditModal(true)}
				onSaveBubbleText={async (field, value) => {
					try {
						const tg = (window as any).Telegram?.WebApp
						const telegramId = getUserId() || ''

						await fetch(`/api/networking/profile?userId=${telegramId}`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ [field]: value }),
						})
						if (tg) tg.HapticFeedback.notificationOccurred('success')
						await fetchProfile()
					} catch (error) {
						console.error('Error saving bubble text:', error)
					}
				}}
				isOwnProfile={!viewingUserId}
				showAddFriendButton={!!viewingUserId && hasLikedMe && !isMatch}
				showRemoveMatchButton={!!viewingUserId && isMatch}
				onAddFriend={handleAddFriend}
				onRemoveMatch={handleRemoveMatch}
				hasActiveSubscription={hasActiveSubscription}
			/>

			<div style={{ padding: '16px' }}>
				<CasesSection
					cases={cases}
					onEdit={viewingUserId ? undefined : () => setShowCasesModal(true)}
				/>

				{!viewingUserId && (
					<CasesModal
						isOpen={showCasesModal}
						cases={cases}
						uploadingCase={uploadingCase}
						onClose={() => setShowCasesModal(false)}
						onUpload={handleCaseUpload}
						onDelete={handleDeleteCase}
						onSaveCase={handleSaveCase}
						onCaseCreated={caseId => {
							// Ждем немного, чтобы cases обновился после fetchProfile
							setTimeout(() => {
								const newCase = cases.find(c => c.id === caseId)
								if (newCase) {
									// Модалка сама откроет форму редактирования через handleEditCase
								}
							}, 100)
						}}
					/>
				)}

				{!viewingUserId && (
					<ReferralBanner
						onClick={() => router.push('/networking/referral')}
					/>
				)}

				<ProfileInfoSection
					gender={profile?.networkingGender}
					location={location}
					about={about}
					onSave={viewingUserId ? undefined : saveField}
				/>

				<ProfileSkillsValues
					selectedSkills={selectedSkills}
					selectedValues={selectedValues}
					categories={categories}
					values={values}
					onSaveSkills={
						viewingUserId
							? undefined
							: async skills => {
									await saveField('skills', skills)
									setSelectedSkills(skills)
								}
					}
					onSaveValues={
						viewingUserId
							? undefined
							: async values => {
									await saveField('values', values)
									setSelectedValues(values)
								}
					}
				/>

				{/* Кнопка привязки вакансии/резюме - только для своего профиля */}
				{!viewingUserId && !profile.linkedResume && !profile.linkedVacancy && (
					<div
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) {
								setTimeout(() => tg.HapticFeedback?.impactOccurred('light'), 0)
							}
							setShowWorkLinkModal(true)
						}}
						style={{
							background: 'linear-gradient(90deg, #002EE7 0%, #65FFF7 100%)',
							borderRadius: '28px',
							padding: '16px 20px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '10px',
							marginBottom: '24px',
						}}
					>
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								fontWeight: 600,
							}}
						>
							Привязать вакансию/резюме
						</span>
					</div>
				)}

				{/* Показываем связанные работы если есть */}
				{(profile.linkedResume || profile.linkedVacancy) && (
					<div style={{ marginBottom: '24px' }}>
						<div
							style={{
								backgroundColor: 'rgba(252, 249, 247, 0.05)',
								borderRadius: '16px',
								padding: '16px',
							}}
						>
							{!viewingUserId && (
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										marginBottom: '12px',
									}}
								>
									<h3
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											fontWeight: 600,
											color: '#FCF9F7',
										}}
									>
										Связанные работы
									</h3>
									<div
										onClick={() => setShowWorkLinkModal(true)}
										style={{
											width: '32px',
											height: '32px',
											borderRadius: '50%',
											backgroundColor: 'rgba(252, 249, 247, 0.1)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
										}}
									>
										<svg
											width='16'
											height='16'
											viewBox='0 0 16 16'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M0 12.6667V16H3.33333L13.1667 6.16667L9.83333 2.83333L0 12.6667ZM15.7333 3.6C16.0889 3.24444 16.0889 2.66667 15.7333 2.31111L13.6889 0.266667C13.3333 -0.0888889 12.7556 -0.0888889 12.4 0.266667L10.7778 1.88889L14.1111 5.22222L15.7333 3.6Z'
												fill='#FCF9F7'
												fillOpacity='0.65'
											/>
										</svg>
									</div>
								</div>
							)}

							{viewingUserId && (
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										marginBottom: '12px',
									}}
								>
									Связанные работы
								</h3>
							)}

							{profile.linkedResume && (
								<div
									style={{
										backgroundColor: 'rgba(252, 249, 247, 0.05)',
										borderRadius: '12px',
										padding: '12px',
										marginBottom: '8px',
										position: 'relative',
									}}
								>
									<div
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
											marginBottom: '4px',
										}}
									>
										Резюме
									</div>
									<div
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '15px',
											fontWeight: 600,
											color: '#FCF9F7',
										}}
									>
										{profile.linkedResume.position}
									</div>
									{profile.linkedResume.category && (
										<div
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '13px',
												color: 'rgba(252, 249, 247, 0.6)',
												marginTop: '4px',
											}}
										>
											{profile.linkedResume.category.name}
										</div>
									)}
									{/* Кнопка отвязать - только для своего профиля */}
									{!viewingUserId && (
										<div
											onClick={async () => {
												const tg = (window as any).Telegram?.WebApp
												if (tg) {
													setTimeout(
														() => tg.HapticFeedback?.impactOccurred('light'),
														0,
													)
												}
												await handleSaveWorkLink('resume', null as any)
												fetchProfile()
											}}
											style={{
												position: 'absolute',
												top: '12px',
												right: '12px',
												width: '24px',
												height: '24px',
												borderRadius: '12px',
												backgroundColor: 'rgba(252, 249, 247, 0.1)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												cursor: 'pointer',
											}}
										>
											<svg
												width='12'
												height='12'
												viewBox='0 0 12 12'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M11.25 1.8075L10.1925 0.75L6 4.9425L1.8075 0.75L0.75 1.8075L4.9425 6L0.75 10.1925L1.8075 11.25L6 7.0575L10.1925 11.25L11.25 10.1925L7.0575 6L11.25 1.8075Z'
													fill='#FCF9F7'
													fillOpacity='0.65'
												/>
											</svg>
										</div>
									)}
								</div>
							)}

							{profile.linkedVacancy && (
								<div
									style={{
										backgroundColor: 'rgba(252, 249, 247, 0.05)',
										borderRadius: '12px',
										padding: '12px',
										position: 'relative',
									}}
								>
									<div
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
											marginBottom: '4px',
										}}
									>
										Вакансия
									</div>
									<div
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '15px',
											fontWeight: 600,
											color: '#FCF9F7',
										}}
									>
										{profile.linkedVacancy.position}
									</div>
									{/* Кнопка отвязать - только для своего профиля */}
									{!viewingUserId && (
										<div
											onClick={async () => {
												const tg = (window as any).Telegram?.WebApp
												if (tg) {
													setTimeout(
														() => tg.HapticFeedback?.impactOccurred('light'),
														0,
													)
												}
												await handleSaveWorkLink('vacancy', null as any)
												fetchProfile()
											}}
											style={{
												position: 'absolute',
												top: '12px',
												right: '12px',
												width: '24px',
												height: '24px',
												borderRadius: '12px',
												backgroundColor: 'rgba(252, 249, 247, 0.1)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												cursor: 'pointer',
											}}
										>
											<svg
												width='12'
												height='12'
												viewBox='0 0 12 12'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M11.25 1.8075L10.1925 0.75L6 4.9425L1.8075 0.75L0.75 1.8075L4.9425 6L0.75 10.1925L1.8075 11.25L6 7.0575L10.1925 11.25L11.25 10.1925L7.0575 6L11.25 1.8075Z'
													fill='#FCF9F7'
													fillOpacity='0.65'
												/>
											</svg>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{/* ProfileToggle - только для своего профиля */}
				{!viewingUserId && (
					<ProfileToggle
						enabled={profile.networkingEnabled}
						onToggle={async (enabled: boolean) => {
							await saveField('networkingEnabled', enabled)
						}}
					/>
				)}
			</div>

			<ProfileEditModal
				isOpen={showEditModal}
				profile={profile}
				selectedAura={selectedAura}
				selectedBadge={selectedBadge}
				selectedLookingFor={selectedLookingFor}
				uploadingAvatar={uploadingAvatar}
				nickname={nickname}
				onClose={() => setShowEditModal(false)}
				onAvatarUpload={handleAvatarUpload}
				onAuraChange={handleAuraChange}
				onBadgeChange={setSelectedBadge}
				onLookingForToggle={toggleLookingFor}
				onNicknameChange={setNickname}
				onSave={handleSaveEditModal}
			/>

			<WorkLinkModal
				isOpen={showWorkLinkModal}
				onClose={() => setShowWorkLinkModal(false)}
				onSave={async (type: 'resume' | 'vacancy', id: string) => {
					await handleSaveWorkLink(type, id)
					setShowWorkLinkModal(false)
					fetchProfile()
				}}
				currentLinkedResumeId={profile.linkedResume?.id}
				currentLinkedVacancyId={profile.linkedVacancy?.id}
			/>

			<NetworkingBottomNav />

			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				onPurchase={handleSubscriptionPurchase}
				hasActiveSubscription={hasActiveSubscription}
				subscriptionEndDate={subscriptionEndDate}
			/>

			<PaymentInstructionScreen
				isOpen={showPaymentInstruction}
				onClose={() => setShowPaymentInstruction(false)}
			/>
		</div>
	)
}

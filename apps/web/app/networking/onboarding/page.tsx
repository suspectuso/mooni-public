'use client'

import MatchLoader from '@/components/MatchLoader'
import NetworkingHeader from '@/components/NetworkingHeader'
import AuraSelection from '@/components/networking/AuraSelection'
import PaymentInstructionScreen from '@/components/networking/PaymentInstructionScreen'
import SubscriptionModal from '@/components/networking/SubscriptionModal'
import { RUSSIAN_CITIES } from '@/constants/cities'
import { getUserId } from '@/utils/telegram'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const STEPS = {
	NAME_AVATAR: 0,
	LOCATION_AGE_GENDER: 1,
	LOOKING_FOR: 2,
	SKILLS: 3,
	VALUES: 4,
	ABOUT: 5,
	HELP_SEARCH: 6,
	AURA: 7,
	COMPLETE: 8,
}

const TOTAL_STEPS = 8

const LOOKING_FOR_OPTIONS = [
	{
		type: 'relationships',
		label: 'Отношения',
		bgColor: 'rgba(242, 51, 24, 0.45)',
		textColor: '#F23318',
		icon: (
			<svg
				width='16'
				height='14'
				viewBox='0 0 16 14'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					d='M15.501 1.97563C14.8309 0.641827 12.9006 -0.449469 10.6553 0.185907C9.58235 0.486493 8.64624 1.13111 7.99989 2.01443C7.35354 1.13111 6.41743 0.486493 5.3445 0.185907C3.09417 -0.439769 1.16888 0.641827 0.498786 1.97563C-0.441352 3.84296 -0.0512946 5.9431 1.65896 8.21784C2.99915 9.99787 4.91444 11.8021 7.69484 13.8974C7.78271 13.9639 7.89095 14 8.00239 14C8.11382 14 8.22207 13.9639 8.30994 13.8974C11.0853 11.807 13.0056 10.0173 14.3458 8.21784C16.0511 5.9431 16.4411 3.84296 15.501 1.97563Z'
					fill='#F23318'
				/>
			</svg>
		),
	},
	{
		type: 'work',
		label: 'Работа',
		bgColor: 'rgba(247, 113, 11, 0.45)',
		textColor: '#F7710B',
		icon: (
			<svg
				width='19'
				height='17'
				viewBox='0 0 19 17'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					d='M10.45 12.2778H8.55C8.0275 12.2778 7.6 11.8528 7.6 11.3333H0.9595V15.1111C0.9595 16.15 1.8145 17 2.8595 17H16.15C17.195 17 18.05 16.15 18.05 15.1111V11.3333H11.4C11.4 11.8528 10.9725 12.2778 10.45 12.2778ZM17.1 3.77778H13.3C13.3 1.69056 11.5995 0 9.5 0C7.4005 0 5.7 1.69056 5.7 3.77778H1.9C0.855 3.77778 0 4.62778 0 5.66667V8.5C0 9.54833 0.8455 10.3889 1.9 10.3889H7.6V9.44444C7.6 8.925 8.0275 8.5 8.55 8.5H10.45C10.9725 8.5 11.4 8.925 11.4 9.44444V10.3889H17.1C18.145 10.3889 19 9.53889 19 8.5V5.66667C19 4.62778 18.145 3.77778 17.1 3.77778ZM7.6 3.77778C7.6 2.73889 8.455 1.88889 9.5 1.88889C10.545 1.88889 11.4 2.73889 11.4 3.77778H7.5905H7.6Z'
					fill='#F7710B'
				/>
			</svg>
		),
	},
	{
		type: 'employees',
		label: 'Сотрудники',
		bgColor: 'rgba(101, 255, 247, 0.45)',
		textColor: '#65FFF7',
		icon: (
			<svg
				width='15'
				height='17'
				viewBox='0 0 15 17'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					fillRule='evenodd'
					clipRule='evenodd'
					d='M7.5 9.93033C10.0031 9.93033 15 11.5092 15 14.6442V16.0016C14.9998 16.5537 14.5522 17.0016 14 17.0016H1C0.447851 17.0016 0.000181532 16.5537 0 16.0016L0 14.6442C0 11.5092 4.99686 9.93035 7.5 9.93033ZM5.96973 0.304355C6.70048 0.00172426 7.50452 -0.0774349 8.28027 0.0768155C9.0562 0.231156 9.76969 0.612133 10.3291 1.17154C10.8883 1.73085 11.2685 2.44369 11.4229 3.21939C11.5772 3.99532 11.4981 4.80001 11.1953 5.53092C10.8926 6.26163 10.3803 6.88639 9.72266 7.32584C9.06486 7.76536 8.29112 7.99967 7.5 7.99967C6.43933 7.99961 5.42195 7.57871 4.67188 6.82877C3.92173 6.07862 3.5 5.06053 3.5 3.99967C3.50005 3.20864 3.73533 2.43571 4.1748 1.77799C4.61433 1.12019 5.23882 0.607105 5.96973 0.304355Z'
					fill='#65FFF7'
				/>
			</svg>
		),
	},
]


export default function NetworkingOnboardingPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [currentStep, setCurrentStep] = useState(STEPS.NAME_AVATAR)
	const [profile, setProfile] = useState<any>(null)

	// Form data
	const [networkingName, setNetworkingName] = useState('')
	const [avatarUrl, setAvatarUrl] = useState('')
	const [telegramPhotoUrl, setTelegramPhotoUrl] = useState('')
	const [uploadingAvatar, setUploadingAvatar] = useState(false)
	const [location, setLocation] = useState('')
	const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
	const [age, setAge] = useState('')
	const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('')
	const [lookingFor, setLookingFor] = useState<string[]>([])
	const [skills, setSkills] = useState<string[]>([])
	const [skillInput, setSkillInput] = useState('')
	const [skillSuggestions, setSkillSuggestions] = useState<any[]>([])
	const [allSkillsCategories, setAllSkillsCategories] = useState<any[]>([])
	const [allValues, setAllValues] = useState<any[]>([])
	const [values, setValues] = useState<string[]>([])
	const [valueInput, setValueInput] = useState('')
	const [valueSuggestions, setValueSuggestions] = useState<any[]>([])
	const [about, setAbout] = useState('')
	const [aboutTextareaHeight, setAboutTextareaHeight] = useState(72)
	const [helpText, setHelpText] = useState('')
	const [helpTextareaHeight, setHelpTextareaHeight] = useState(72)
	const [searchText, setSearchText] = useState('')
	const [searchTextareaHeight, setSearchTextareaHeight] = useState(72)
	const [aura, setAura] = useState<'TURQUOISE' | 'ORANGE' | 'RED' | 'NONE'>(
		'NONE',
	)
	const [_pendingAura, setPendingAura] = useState<
		'TURQUOISE' | 'ORANGE' | 'RED' | null
	>(null)
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<
		string | undefined
	>(undefined)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.hide()
			tg.disableVerticalSwipes()

			// Получаем фото из Telegram для фолбэка
			const photoUrl = tg.initDataUnsafe?.user?.photo_url
			if (photoUrl) {
				setTelegramPhotoUrl(photoUrl)
			}
		}

		// Добавляем CSS анимацию для спиннера
		const style = document.createElement('style')
		style.textContent = `
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`
		document.head.appendChild(style)

		loadSkillsCategories()
		loadValues()
		checkProfile()
		checkSubscription()

		return () => {
			document.head.removeChild(style)
		}
	}, [])

	// BackButton для модалок подписки/оплаты
	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg?.BackButton) return

		if (showSubscriptionModal || showPaymentInstruction) {
			const handler = () => {
				if (showPaymentInstruction) {
					setShowPaymentInstruction(false)
				} else if (showSubscriptionModal) {
					setShowSubscriptionModal(false)
				}
			}
			tg.BackButton.show()
			tg.BackButton.onClick(handler)
			return () => {
				tg.BackButton.offClick(handler)
				tg.BackButton.hide()
			}
		} else {
			tg.BackButton.hide()
		}
	}, [showSubscriptionModal, showPaymentInstruction])

	useEffect(() => {
		// Редирект на networking если профиль заполнен
		if (!loading && profile && isProfileComplete()) {
			router.push('/networking')
		}
	}, [loading, profile])

	// Отладка: отслеживаем изменения skills и values
	useEffect(() => {
		console.log('Skills state changed:', skills)
	}, [skills])

	useEffect(() => {
		console.log('Values state changed:', values)
	}, [values])

	const loadSkillsCategories = async () => {
		try {
			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
			const categoriesRes = await fetch(`${API_URL}/work/skills/categories`)

			if (categoriesRes.ok) {
				const categoriesData = await categoriesRes.json()
				setAllSkillsCategories(categoriesData)
			}
		} catch (error) {
			console.error('Error loading skills categories:', error)
		}
	}

	const loadValues = async () => {
		try {
			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
			const valuesRes = await fetch(`${API_URL}/work/values`)

			if (valuesRes.ok) {
				const valuesData = await valuesRes.json()
				setAllValues(valuesData)
			}
		} catch (error) {
			console.error('Error loading values:', error)
		}
	}

	const getUserName = () => {
		if (profile?.networkingName) {
			return profile.networkingName
		}
		if (profile?.username) {
			return profile.username
		}
		if (profile?.firstName) {
			return profile.firstName
		}
		return 'Друг'
	}

	const isProfileComplete = () => {
		if (!profile) return false

		const isComplete =
			profile.networkingName &&
			profile.networkingLocation &&
			profile.networkingAge &&
			profile.networkingGender &&
			profile.networkingLookingFor?.length > 0 &&
			profile.networkingSkills?.length > 0 &&
			profile.networkingValues?.length > 0 &&
			profile.networkingAbout
		// Аура необязательна

		return isComplete
	}

	const checkProfile = async () => {
		try {
			const userId = getUserId()
			if (!userId) {
				console.error('No userId available')
				return
			}

			const response = await fetch(`/api/networking/profile?userId=${userId}`)
			const data = await response.json()

			setProfile(data)

			// Загружаем аватарку из БД
			const avatarFromDb = data.networkingAvatarUrl || data.avatarUrl || ''
			setAvatarUrl(avatarFromDb)

			// Загружаем ВСЕ данные из БД сразу

			if (data.networkingName) {
				setNetworkingName(data.networkingName)
			}
			if (data.networkingLocation) {
				setLocation(data.networkingLocation)
			}
			if (data.networkingAge) {
				setAge(data.networkingAge.toString())
			}
			if (data.networkingGender) {
				setGender(data.networkingGender)
			}
			if (data.networkingLookingFor && data.networkingLookingFor.length > 0) {
				setLookingFor(data.networkingLookingFor)
			}
			if (data.networkingSkills && data.networkingSkills.length > 0) {
				const skillNames = data.networkingSkills.map((s: any) => s.name)
				setSkills(skillNames)
			}
			if (data.networkingValues && data.networkingValues.length > 0) {
				const valueNames = data.networkingValues.map((v: any) => v.name)
				setValues(valueNames)
			}
			if (data.networkingAbout) {
				setAbout(data.networkingAbout)
			}
			if (data.networkingHelpText) {
				setHelpText(data.networkingHelpText)
			}
			if (data.networkingSearchText) {
				setSearchText(data.networkingSearchText)
			}
			if (data.networkingAura && data.networkingAura !== 'NONE') {
				setAura(data.networkingAura)
			}

			// Определяем с какого шага начать
			if (!data.networkingName) {
				setCurrentStep(STEPS.NAME_AVATAR)
			} else if (
				!data.networkingLocation ||
				!data.networkingAge ||
				!data.networkingGender
			) {
				setCurrentStep(STEPS.LOCATION_AGE_GENDER)
			} else if (
				!data.networkingLookingFor ||
				data.networkingLookingFor.length === 0
			) {
				setCurrentStep(STEPS.LOOKING_FOR)
			} else if (!data.networkingSkills || data.networkingSkills.length === 0) {
				setCurrentStep(STEPS.SKILLS)
			} else if (!data.networkingValues || data.networkingValues.length === 0) {
				setCurrentStep(STEPS.VALUES)
			} else if (!data.networkingAbout) {
				setCurrentStep(STEPS.ABOUT)
			} else if (!data.networkingHelpText && !data.networkingSearchText) {
				setCurrentStep(STEPS.HELP_SEARCH)
			} else if (!data.networkingAura || data.networkingAura === 'NONE') {
				setCurrentStep(STEPS.AURA)
			}
			// Если все заполнено - useEffect сделает редирект

			setLoading(false)
		} catch (error) {
			console.error('Error checking profile:', error)
			setLoading(false)
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

	const canProceed = () => {
		switch (currentStep) {
			case STEPS.NAME_AVATAR:
				return networkingName.trim().length > 0
			case STEPS.LOCATION_AGE_GENDER:
				return (
					location.trim().length > 0 && age.trim().length > 0 && gender !== ''
				)
			case STEPS.LOOKING_FOR:
				return lookingFor.length > 0
			case STEPS.SKILLS:
				return skills.length > 0
			case STEPS.VALUES:
				return values.length > 0
			case STEPS.ABOUT:
				return about.trim().length > 0
			case STEPS.HELP_SEARCH:
				return true // Помогу/Ищу необязательны
			case STEPS.AURA:
				return true // Аура необязательна
			default:
				return false
		}
	}

	const saveAndNext = async () => {
		if (!canProceed()) return

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}

		try {
			const userId = getUserId()
			if (!userId) {
				console.error('No userId available')
				return
			}

			const updateData: any = {}

			// Сохраняем данные текущего шага
			switch (currentStep) {
				case STEPS.NAME_AVATAR:
					updateData.networkingName = networkingName.trim()
					if (avatarUrl) {
						updateData.networkingAvatarUrl = avatarUrl
					}
					break
				case STEPS.LOCATION_AGE_GENDER:
					updateData.networkingLocation = location.trim()
					updateData.networkingAge = parseInt(age)
					updateData.networkingGender = gender
					break
				case STEPS.LOOKING_FOR:
					updateData.networkingLookingFor = lookingFor
					break
				case STEPS.SKILLS:
					updateData.skills = skills
					break
				case STEPS.VALUES:
					updateData.values = values
					break
				case STEPS.ABOUT:
					// Не используем trim() чтобы сохранить переносы строк
					updateData.networkingAbout = about
					break
				case STEPS.HELP_SEARCH:
					if (helpText.trim()) updateData.networkingHelpText = helpText.trim()
					if (searchText.trim()) updateData.networkingSearchText = searchText.trim()
					break
				case STEPS.AURA:
					updateData.networkingAura = aura
					updateData.networkingEnabled = true
					break
			}

			const response = await fetch(`/api/networking/profile?userId=${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData),
			})

			if (!response.ok) {
				console.error('Failed to save profile:', response.status)
				const tg = (window as any).Telegram?.WebApp
				if (tg) {
					tg.HapticFeedback.notificationOccurred('error')
				}
				return
			}

			// Переход к следующему шагу или завершение
			if (currentStep === STEPS.AURA) {
				setCurrentStep(STEPS.COMPLETE)
			} else {
				setCurrentStep(currentStep + 1)
			}
		} catch (error) {
			console.error('Error saving:', error)
		}
	}

	const goToNetworking = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		router.push('/networking')
	}

	const goBack = () => {
		if (currentStep > STEPS.NAME_AVATAR) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.impactOccurred('light')
			}
			setCurrentStep(currentStep - 1)
		}
	}

	const toggleLookingFor = (option: string) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.selectionChanged()
		}

		if (lookingFor.includes(option)) {
			setLookingFor(lookingFor.filter(o => o !== option))
		} else {
			setLookingFor([...lookingFor, option])
		}
	}

	const addSkill = () => {
		if (skillInput.trim() && !skills.includes(skillInput.trim())) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.selectionChanged()
			}
			setSkills([...skills, skillInput.trim()])
			setSkillInput('')
			setSkillSuggestions([])
		}
	}

	const addSkillFromSuggestion = (skillName: string) => {
		if (!skills.includes(skillName) && skills.length < 5) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.selectionChanged()
			}
			setSkills([...skills, skillName])
			setSkillInput('')
			setSkillSuggestions([])
		}
	}

	const handleSkillInputChange = (value: string) => {
		setSkillInput(value)

		if (value.trim().length > 0) {
			// Поиск по всем навыкам из всех категорий
			const allSkills: any[] = []
			allSkillsCategories.forEach(category => {
				category.skills.forEach((skill: any) => {
					allSkills.push(skill)
				})
			})

			// Фильтруем навыки по введенному тексту
			const filtered = allSkills.filter(skill =>
				skill.name.toLowerCase().includes(value.toLowerCase()),
			)

			setSkillSuggestions(filtered.slice(0, 10)) // Показываем максимум 10 результатов
		} else {
			setSkillSuggestions([])
		}
	}

	const removeSkill = (skill: string) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.selectionChanged()
		}
		setSkills(skills.filter(s => s !== skill))
	}

	const addValueFromSuggestion = (valueName: string) => {
		if (!values.includes(valueName) && values.length < 5) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.selectionChanged()
			}
			setValues([...values, valueName])
			setValueInput('')
			setValueSuggestions([])
		}
	}

	const handleValueInputChange = (value: string) => {
		setValueInput(value)

		if (value.trim().length > 0) {
			// Фильтруем ценности по введенному тексту
			const filtered = allValues.filter(val =>
				val.name.toLowerCase().includes(value.toLowerCase()),
			)

			setValueSuggestions(filtered.slice(0, 10))
		} else {
			setValueSuggestions([])
		}
	}

	const removeValue = (value: string) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.selectionChanged()
		}
		setValues(values.filter(v => v !== value))
	}

	const selectAura = async (
		auraId: 'TURQUOISE' | 'ORANGE' | 'RED' | 'NONE',
	) => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.selectionChanged()
		}

		// Если выбрана аура (не "Без ауры"), проверяем подписку
		if (auraId !== 'NONE') {
			setLoading(true)
			try {
				const userId = getUserId()
				if (!userId) {
					console.error('No userId available')
					setLoading(false)
					return
				}

				// Проверяем есть ли активная подписка
				const response = await fetch(
					`/api/subscriptions/check?userId=${userId}&type=NETWORKING_PLUS`,
				)
				const data = await response.json()

				if (data.hasActive) {
					// Подписка есть - сразу сохраняем ауру
					setAura(auraId)
					setLoading(false)
				} else {
					// Подписки нет - сохраняем выбор и показываем модалку
					setPendingAura(auraId)
					setLoading(false)
					await checkSubscription() // Обновляем данные подписки
					setShowSubscriptionModal(true)
					// НЕ сохраняем ауру пока не оплатят
				}
			} catch (error) {
				console.error('Error checking subscription:', error)
				setLoading(false)
				// В случае ошибки сохраняем выбор и показываем модалку
				setPendingAura(auraId)
				await checkSubscription()
				setShowSubscriptionModal(true)
			}
		} else {
			setAura(auraId)
		}
	}

	const handleSubscriptionClose = () => {
		setShowSubscriptionModal(false)
	}

	const handleSubscriptionPurchase = async () => {
		const tg = (window as any).Telegram?.WebApp

		try {
			const userId = getUserId()
			if (!userId) {
				console.error('No userId available')
				return
			}

			if (!userId) {
				throw new Error('No userId available')
			}

			// Отправляем запрос на бэк для отправки сообщения в бот
			const response = await fetch('/api/bot/send-payment-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
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

	const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setAbout(e.target.value)

		// Автоматически увеличиваем высоту textarea
		const textarea = e.target
		textarea.style.height = '72px' // Сбрасываем на минимальную высоту
		const newHeight = Math.max(72, textarea.scrollHeight)
		setAboutTextareaHeight(newHeight)
	}

	const handleHelpTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setHelpText(e.target.value)
		const textarea = e.target
		textarea.style.height = '72px'
		const newHeight = Math.max(72, textarea.scrollHeight)
		setHelpTextareaHeight(newHeight)
	}

	const handleSearchTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setSearchText(e.target.value)
		const textarea = e.target
		textarea.style.height = '72px'
		const newHeight = Math.max(72, textarea.scrollHeight)
		setSearchTextareaHeight(newHeight)
	}

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}

		setUploadingAvatar(true)

		try {
			const formData = new FormData()
			formData.append('avatar', file)

			const userId = getUserId()
			if (!userId) {
				console.error('No userId available')
				setUploadingAvatar(false)
				return
			}

			const response = await fetch(
				`/api/upload/avatar/networking?userId=${userId}`,
				{
					method: 'POST',
					body: formData,
				},
			)

			if (!response.ok) {
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

			const data = await response.json()
			setAvatarUrl(data.avatarPath || data.avatarUrl)

			if (tg) {
				tg.HapticFeedback.notificationOccurred('success')
			}
		} catch (error) {
			console.error('Error uploading avatar:', error)
			if (tg) {
				tg.showAlert('Ошибка при загрузке фото')
				tg.HapticFeedback.notificationOccurred('error')
			}
		} finally {
			setUploadingAvatar(false)
		}
	}

	const handleLocationChange = (value: string) => {
		setLocation(value)

		if (value.trim().length > 0) {
			// Фильтруем города по введенному тексту
			const filtered = RUSSIAN_CITIES.filter(city =>
				city.toLowerCase().includes(value.toLowerCase()),
			)
			setLocationSuggestions(filtered.slice(0, 10))
		} else {
			setLocationSuggestions([])
		}
	}

	const selectCity = (city: string) => {
		setLocation(city)
		setLocationSuggestions([])
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.selectionChanged()
		}
	}

	if (loading) {
		return <MatchLoader />
	}

	const progress = ((currentStep + 1) / TOTAL_STEPS) * 100

	// Финальный экран
	if (currentStep === STEPS.COMPLETE) {
		return (
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					width: '100vw',
					height: '100vh',
					margin: 0,
					padding: 0,
					display: 'flex',
					flexDirection: 'column',
					background:
						'#121212 url(/full_netw_bg.webp) top center / 100% auto no-repeat',
					maxWidth: 'none',
				}}
			>
				<div
					style={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0 24px',
					}}
				>
					<h1
						style={{
							fontFamily: 'Oks, sans-serif',
							fontSize: '48px',
							lineHeight: '1.1',
							textTransform: 'uppercase',
							color: '#F7710B',
							textAlign: 'center',
							marginBottom: '16px',
						}}
					>
						АНКЕТА
						<br />
						ЗАПОЛНЕНА
					</h1>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							color: '#FCF9F7',
							textAlign: 'center',
							fontSize: '16px',
						}}
					>
						Теперь вы можете смотреть
						<br />
						анкеты других
					</p>
				</div>

				<div
					style={{
						padding: '20px',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<button
						onClick={goToNetworking}
						style={{
							width: '90vw',
							maxWidth: '450px',
							height: '72px',
							borderRadius: '28px',
							background: 'linear-gradient(to right, #F7710B, #F23318)',
							border: 'none',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '17px',
							fontWeight: 600,
							color: '#FCF9F7',
							cursor: 'pointer',
							transition: 'transform 0.2s',
							boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
						}}
					>
						К анкетам
					</button>
				</div>
			</div>
		)
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<NetworkingHeader />

			{/* Progress bar */}
			<div style={{ padding: '0 16px', marginBottom: '16px' }}>
				<div
					style={{
						height: '14px',
						borderRadius: '7px',
						overflow: 'hidden',
						backgroundColor: 'rgba(252, 249, 247, 0.1)',
					}}
				>
					<div
						style={{
							height: '100%',
							background: 'linear-gradient(to right, #F23318, #F7710B)',
							width: `${progress}%`,
							transition: 'width 0.3s ease',
							borderRadius: '7px',
						}}
					/>
				</div>
			</div>

			{/* Content */}
			<div style={{ flex: 1, padding: '0 20px 120px', overflowY: 'auto' }}>
				{/* Step 0: Name & Avatar */}
				{currentStep === STEPS.NAME_AVATAR && (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<h1
							style={{
								fontFamily: 'Oks, sans-serif',
								fontSize: '48px',
								lineHeight: '1.1',
								textTransform: 'uppercase',
								color: '#F7710B',
								textAlign: 'center',
								marginBottom: '20px',
							}}
						>
							ЗАПОЛНИТЕ
							<br />
							АНКЕТУ
						</h1>

						{/* Avatar */}
						<div
							style={{
								position: 'relative',
								marginBottom: '10px',
							}}
						>
							<div
								style={{
									width: '200px',
									height: '200px',
									borderRadius: '50%',
									overflow: 'hidden',
									backgroundColor: '#282826',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{(avatarUrl || telegramPhotoUrl) ? (
									<img
										src={avatarUrl || telegramPhotoUrl}
										alt='Avatar'
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
								) : (
									<div
										style={{
											color: 'rgba(252, 249, 247, 0.3)',
											fontSize: '14px',
											fontFamily: 'LT Superior, sans-serif',
											textAlign: 'center',
										}}
									>
										Нет фото
									</div>
								)}
							</div>

							{/* Edit button */}
							<label
								htmlFor='avatar-upload'
								style={{
									position: 'absolute',
									bottom: '10px',
									right: '10px',
									width: '46px',
									height: '46px',
									borderRadius: '50%',
									backgroundColor: '#FCF9F7',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
									boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
								}}
							>
								{uploadingAvatar ? (
									<div
										style={{
											width: '20px',
											height: '20px',
											border: '2px solid #1D1D1B',
											borderTopColor: 'transparent',
											borderRadius: '50%',
											animation: 'spin 1s linear infinite',
										}}
									/>
								) : (
									<svg
										width='17'
										height='17'
										viewBox='0 0 17 17'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M8.85811 4.30379L0.75 12.4119V16.0605H4.39865L12.5068 7.95244M8.85811 4.30379L12.5068 7.95244M8.85811 4.30379L12.1014 1.06055L15.75 4.7092L12.5068 7.95244'
											stroke='#1D1D1B'
											strokeWidth='1.5'
										/>
									</svg>
								)}
							</label>
							<input
								id='avatar-upload'
								type='file'
								accept='image/*'
								onChange={handleAvatarUpload}
								disabled={uploadingAvatar}
								style={{ display: 'none' }}
							/>
						</div>

						{/* Name input */}
						<div style={{ width: '100%' }}>
							<label
								style={{
									display: 'block',
									color: '#FCF9F7',
									fontSize: '16px',
									fontWeight: 600,
									marginBottom: '12px',
									fontFamily: 'LT Superior, sans-serif',
								}}
							>
								Имя
							</label>
							<input
								type='text'
								value={networkingName}
								onChange={e => setNetworkingName(e.target.value)}
								placeholder='Ваше имя'
								style={{
									width: '100%',
									height: '75px',
									backgroundColor: '#282826',
									border: 'none',
									borderRadius: '28px',
									padding: '0 24px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: '#FCF9F7',
									outline: 'none',
									boxSizing: 'border-box',
								}}
							/>
						</div>
					</div>
				)}

				{/* Step 1: Location, Age & Gender */}
				{currentStep === STEPS.LOCATION_AGE_GENDER && (
					<div>
						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							1. Из какого вы города?
						</h2>
						<input
							type='text'
							value={location}
							onChange={e => handleLocationChange(e.target.value)}
							placeholder='Москва'
							style={{
								width: '100%',
								height: '75px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '0 24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								marginBottom: '16px',
							}}
						/>

						{/* Выпадающий список с подсказками городов */}
						{locationSuggestions.length > 0 && (
							<div
								style={{
									backgroundColor: '#3a3a3a',
									borderRadius: '16px',
									marginBottom: '16px',
									maxHeight: '200px',
									overflowY: 'auto',
									padding: '12px',
								}}
							>
								<div
									style={{
										display: 'flex',
										gap: '8px',
										flexWrap: 'wrap',
									}}
								>
									{locationSuggestions.map(city => (
										<button
											key={city}
											onClick={() => selectCity(city)}
											style={{
												backgroundColor: '#272727',
												border: 'none',
												borderRadius: '20px',
												padding: '8px 16px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												fontWeight: 500,
												color: '#FCF9F7',
												cursor: 'pointer',
												transition: 'all 0.2s ease',
											}}
										>
											{city}
										</button>
									))}
								</div>
							</div>
						)}

						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							2. Сколько вам лет?
						</h2>
						<input
							type='number'
							value={age}
							onChange={e => {
								const value = e.target.value
								// Ограничиваем от 0 до 90
								if (
									value === '' ||
									(Number(value) >= 0 && Number(value) <= 90)
								) {
									setAge(value)
								}
							}}
							placeholder='17'
							min='0'
							max='90'
							style={{
								width: '100%',
								height: '75px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '0 24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								marginBottom: '16px',
							}}
						/>

						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							3. Ваш пол
						</h2>
						<div
							style={{
								display: 'flex',
								gap: '12px',
								justifyContent: 'center',
							}}
						>
							{/* Мужчина */}
							<button
								onClick={() => {
									const tg = (window as any).Telegram?.WebApp
									if (tg) {
										tg.HapticFeedback.selectionChanged()
									}
									setGender('MALE')
								}}
								style={{
									flex: 1,
									height: '56px',
									borderRadius: '28px',
									border: 'none',
									backgroundColor: gender === 'MALE' ? '#353534' : '#1e1e1d',
									cursor: 'pointer',
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px',
									transition: 'all 0.2s',
								}}
							>
								<svg
									width='20'
									height='20'
									viewBox='0 0 20 20'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										fillRule='evenodd'
										clipRule='evenodd'
										d='M11.4283 1.07131C11.4283 0.787179 11.5412 0.514688 11.7421 0.313779C11.9431 0.11287 12.2156 0 12.4998 0L18.9285 0C19.2127 0 19.4852 0.11287 19.6862 0.313779C19.8871 0.514688 20 0.787179 20 1.07131V7.49915C20 7.78328 19.8871 8.05577 19.6862 8.25668C19.4852 8.45759 19.2127 8.57046 18.9285 8.57046C18.6444 8.57046 18.3718 8.45759 18.1709 8.25668C17.97 8.05577 17.8571 7.78328 17.8571 7.49915V3.65673L12.8941 8.62188C13.9626 10.0721 14.4436 11.8725 14.2407 13.6623C14.0378 15.4521 13.1661 17.0991 11.8 18.2735C10.434 19.4478 8.67467 20.0627 6.87443 19.9949C5.07418 19.9272 3.36603 19.1818 2.09216 17.9081C0.818296 16.6345 0.0728124 14.9265 0.00505809 13.1266C-0.0626962 11.3266 0.552283 9.56746 1.72679 8.20165C2.9013 6.83583 4.54859 5.96418 6.33865 5.76133C8.12871 5.55848 9.92931 6.03941 11.3797 7.10777L16.3413 2.14404H12.4998C12.359 2.14404 12.2195 2.11629 12.0894 2.06236C11.9593 2.00843 11.8411 1.92939 11.7416 1.82976C11.6421 1.73013 11.5632 1.61186 11.5095 1.48172C11.4557 1.35158 11.4281 1.21211 11.4283 1.07131ZM10.5797 9.22467C9.62536 8.32113 8.35358 7.82964 7.03954 7.85652C5.72551 7.8834 4.4749 8.4265 3.5583 9.36831C2.6417 10.3101 2.13284 11.5749 2.1418 12.889C2.15076 14.2031 2.67683 15.4608 3.60619 16.39C4.53555 17.3193 5.79345 17.8453 7.10773 17.8542C8.42201 17.8632 9.68697 17.3544 10.6289 16.4379C11.5709 15.5215 12.114 14.271 12.1409 12.9572C12.1678 11.6433 11.6762 10.3717 10.7726 9.4175C10.7008 9.36115 10.6361 9.29641 10.5797 9.22467Z'
										fill={gender === 'MALE' ? '#FCF9F7' : '#82817f'}
									/>
								</svg>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: gender === 'MALE' ? '#FCF9F7' : '#82817f',
									}}
								>
									Мужчина
								</span>
							</button>

							{/* Женщина */}
							<button
								onClick={() => {
									const tg = (window as any).Telegram?.WebApp
									if (tg) {
										tg.HapticFeedback.selectionChanged()
									}
									setGender('FEMALE')
								}}
								style={{
									flex: 1,
									height: '56px',
									borderRadius: '28px',
									border: 'none',
									backgroundColor: gender === 'FEMALE' ? '#353534' : '#1e1e1d',
									cursor: 'pointer',
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px',
									transition: 'all 0.2s',
								}}
							>
								<svg
									width='16'
									height='23'
									viewBox='0 0 16 23'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										fillRule='evenodd'
										clipRule='evenodd'
										d='M8.00164 2.05643C7.2206 2.05643 6.44722 2.21045 5.72563 2.50969C5.00405 2.80894 4.3484 3.24754 3.79612 3.80047C3.24385 4.35341 2.80576 5.00983 2.50687 5.73227C2.20798 6.45471 2.05414 7.22901 2.05414 8.01097C2.05414 8.79294 2.20798 9.56724 2.50687 10.2897C2.80576 11.0121 3.24385 11.6685 3.79612 12.2215C4.3484 12.7744 5.00405 13.213 5.72563 13.5123C6.44722 13.8115 7.2206 13.9655 8.00164 13.9655C9.57901 13.9655 11.0918 13.3382 12.2072 12.2215C13.3225 11.1048 13.9491 9.59022 13.9491 8.01097C13.9491 6.43173 13.3225 4.91717 12.2072 3.80047C11.0918 2.68378 9.57901 2.05643 8.00164 2.05643ZM16 8.01097C15.9997 9.95693 15.2919 11.8362 14.0087 13.2978C12.7254 14.7594 10.9546 15.7033 9.02707 15.9531V18.0721H11.283C11.555 18.0721 11.8158 18.1803 12.0081 18.3728C12.2004 18.5653 12.3084 18.8265 12.3084 19.0987C12.3084 19.371 12.2004 19.6322 12.0081 19.8247C11.8158 20.0172 11.555 20.1254 11.283 20.1254H9.02707V21.9734C9.02707 22.2456 8.91903 22.5068 8.72673 22.6993C8.53442 22.8918 8.2736 23 8.00164 23C7.72968 23 7.46886 22.8918 7.27655 22.6993C7.08425 22.5068 6.97621 22.2456 6.97621 21.9734V20.1254H4.72026C4.4483 20.1254 4.18748 20.0172 3.99517 19.8247C3.80287 19.6322 3.69483 19.371 3.69483 19.0987C3.69483 18.8265 3.80287 18.5653 3.99517 18.3728C4.18748 18.1803 4.4483 18.0721 4.72026 18.0721H6.97621V15.9531C5.45024 15.756 4.01342 15.1224 2.83796 14.1285C1.6625 13.1345 0.798278 11.8222 0.348866 10.3489C-0.100546 8.87568 -0.116077 7.30391 0.304134 5.82203C0.724345 4.34014 1.56247 3.01102 2.71806 1.99395C3.87364 0.976879 5.29766 0.31502 6.81944 0.0876958C8.34122 -0.139628 9.89619 0.0772284 11.298 0.712274C12.6998 1.34732 13.8889 2.37361 14.7229 3.66814C15.5569 4.96268 16.0003 6.47053 16 8.01097Z'
										fill={gender === 'FEMALE' ? '#FCF9F7' : '#82817f'}
									/>
								</svg>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: gender === 'FEMALE' ? '#FCF9F7' : '#82817f',
									}}
								>
									Женщина
								</span>
							</button>
						</div>
					</div>
				)}

				{/* Step 2: Looking For */}
				{currentStep === STEPS.LOOKING_FOR && (
					<div>
						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							4. {getUserName()}, что бы вам хотелось найти?
						</h2>
						<div
							style={{
								display: 'flex',
								gap: '8px',
								flexWrap: 'wrap',
								justifyContent: 'center',
							}}
						>
							{LOOKING_FOR_OPTIONS.map(option => {
								const isSelected = lookingFor.includes(option.type)
								return (
									<div
										key={option.type}
										onClick={() => toggleLookingFor(option.type)}
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											height: '32px',
											paddingLeft: '8px',
											paddingRight: '8px',
											borderRadius: '16px',
											backgroundColor: option.bgColor,
											backdropFilter: 'blur(10px)',
											cursor: 'pointer',
											opacity: isSelected ? 1 : 0.35,
										}}
									>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '4px',
												whiteSpace: 'nowrap',
											}}
										>
											{option.icon}
											<span
												style={{
													fontFamily: 'Zen Kaku Gothic New, sans-serif',
													fontSize: '12px',
													fontWeight: 900,
													color: option.textColor,
												}}
											>
												{option.label}
											</span>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}

				{/* Step 3: Skills */}
				{currentStep === STEPS.SKILLS && (
					<div>
						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							5. {getUserName()}, какие свои навыки вы считаете самыми сильными?
						</h2>
						<input
							type='text'
							value={skillInput}
							onChange={e => handleSkillInputChange(e.target.value)}
							placeholder='Начните вводить'
							style={{
								width: '100%',
								height: '75px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '0 24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								marginBottom: '16px',
							}}
						/>

						{/* Выпадающий список с подсказками */}
						{skillSuggestions.length > 0 && (
							<div
								style={{
									backgroundColor: '#3a3a3a',
									borderRadius: '16px',
									marginBottom: '16px',
									maxHeight: '200px',
									overflowY: 'auto',
									padding: '12px',
								}}
							>
								<div
									style={{
										display: 'flex',
										gap: '8px',
										flexWrap: 'wrap',
									}}
								>
									{skillSuggestions.map(skill => {
										const isSelected = skills.includes(skill.name)
										const isDisabled = !isSelected && skills.length >= 5

										return (
											<button
												key={skill.id}
												onClick={() => addSkillFromSuggestion(skill.name)}
												disabled={isDisabled || isSelected}
												style={{
													backgroundColor: isSelected ? '#F7710B' : '#272727',
													border: 'none',
													borderRadius: '20px',
													padding: '8px 16px',
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '14px',
													fontWeight: 500,
													color: isSelected ? '#1D1D1B' : '#FCF9F7',
													cursor:
														isDisabled || isSelected
															? 'not-allowed'
															: 'pointer',
													opacity: isDisabled || isSelected ? 0.5 : 1,
													transition: 'all 0.2s ease',
												}}
											>
												{skill.name}
											</button>
										)
									})}
								</div>
							</div>
						)}

						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
							{skills.map(skill => (
								<div
									key={skill}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										padding: '8px 16px',
										borderRadius: '16px',
										backgroundColor: '#F7710B',
										color: '#121212',
										fontSize: '13px',
										fontWeight: 500,
										fontFamily: 'LT Superior, sans-serif',
									}}
								>
									<span>{skill}</span>
									<button
										onClick={() => removeSkill(skill)}
										style={{
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											padding: 0,
											display: 'flex',
											alignItems: 'center',
										}}
									>
										<svg
											width='14'
											height='14'
											viewBox='0 0 14 14'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5'
												stroke='#121212'
												strokeWidth='1.5'
												strokeLinecap='round'
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Step 4: Values */}
				{currentStep === STEPS.VALUES && (
					<div>
						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							6. {getUserName()}, что вы цените в себе и в других?
						</h2>

						<input
							type='text'
							value={valueInput}
							onChange={e => handleValueInputChange(e.target.value)}
							placeholder='Начните вводить'
							style={{
								width: '100%',
								height: '75px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '0 24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								marginBottom: '16px',
							}}
						/>

						{/* Выпадающий список с подсказками */}
						{valueSuggestions.length > 0 && (
							<div
								style={{
									backgroundColor: '#3a3a3a',
									borderRadius: '16px',
									marginBottom: '16px',
									maxHeight: '200px',
									overflowY: 'auto',
									padding: '12px',
								}}
							>
								<div
									style={{
										display: 'flex',
										gap: '8px',
										flexWrap: 'wrap',
									}}
								>
									{valueSuggestions.map(val => {
										const isSelected = values.includes(val.name)
										const isDisabled = !isSelected && values.length >= 5

										return (
											<button
												key={val.id}
												onClick={() => addValueFromSuggestion(val.name)}
												disabled={isDisabled || isSelected}
												style={{
													backgroundColor: isSelected ? '#F7710B' : '#272727',
													border: 'none',
													borderRadius: '20px',
													padding: '8px 16px',
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '14px',
													fontWeight: 500,
													color: isSelected ? '#1D1D1B' : '#FCF9F7',
													cursor:
														isDisabled || isSelected
															? 'not-allowed'
															: 'pointer',
													opacity: isDisabled || isSelected ? 0.5 : 1,
													transition: 'all 0.2s ease',
												}}
											>
												{val.name}
											</button>
										)
									})}
								</div>
							</div>
						)}

						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
							{values.map(value => (
								<div
									key={value}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										padding: '8px 16px',
										borderRadius: '16px',
										backgroundColor: '#F7710B',
										color: '#121212',
										fontSize: '13px',
										fontWeight: 500,
										fontFamily: 'LT Superior, sans-serif',
									}}
								>
									<span>{value}</span>
									<button
										onClick={() => removeValue(value)}
										style={{
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											padding: 0,
											display: 'flex',
											alignItems: 'center',
										}}
									>
										<svg
											width='14'
											height='14'
											viewBox='0 0 14 14'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5'
												stroke='#121212'
												strokeWidth='1.5'
												strokeLinecap='round'
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Step 5: About */}
				{currentStep === STEPS.ABOUT && (
					<div>
						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							7. Расскажите о себе, чтобы мэтчи были крепче:)
						</h2>
						<h3
							style={{
								color: '#FCF9F7',
								fontSize: '16px',
								fontWeight: 600,
								marginBottom: '12px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							О вас
						</h3>
						<textarea
							value={about}
							onChange={handleAboutChange}
							placeholder='Расскажите о себе...'
							style={{
								width: '100%',
								height: `${aboutTextareaHeight}px`,
								minHeight: '72px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								resize: 'none',
								overflow: 'hidden',
								lineHeight: '1.5',
							}}
						/>
					</div>
				)}

				{/* Step 6: Help & Search texts */}
				{currentStep === STEPS.HELP_SEARCH && (
					<div>
						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							8. {getUserName()}, чем вы можете помочь другим?
						</h2>
						<textarea
							value={helpText}
							onChange={handleHelpTextChange}
							placeholder='Например: помогу с дизайном, маркетингом...'
							style={{
								width: '100%',
								height: `${helpTextareaHeight}px`,
								minHeight: '72px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								resize: 'none',
								overflow: 'hidden',
								lineHeight: '1.5',
								marginBottom: '24px',
							}}
						/>

						<h2
							style={{
								color: '#FCF9F7',
								fontSize: '20px',
								fontWeight: 600,
								marginBottom: '16px',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							9. Что вы ищете?
						</h2>
						<textarea
							value={searchText}
							onChange={handleSearchTextChange}
							placeholder='Например: ищу партнёра для проекта...'
							style={{
								width: '100%',
								height: `${searchTextareaHeight}px`,
								minHeight: '72px',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								boxSizing: 'border-box',
								resize: 'none',
								overflow: 'hidden',
								lineHeight: '1.5',
							}}
						/>
					</div>
				)}

				{/* Step 7: Aura */}
				{currentStep === STEPS.AURA && (
					<AuraSelection selectedAura={aura} onSelect={selectAura} />
				)}
			</div>

			{/* Next button */}
			<div
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					padding: '20px',
					backgroundColor: 'transparent',
					display: 'flex',
					justifyContent: 'center',
					gap: '12px',
				}}
			>
				{/* Кнопка "Назад" - показываем только если не первый шаг */}
				{currentStep > STEPS.NAME_AVATAR && (
					<button
						onClick={goBack}
						style={{
							width: '140px',
							height: '72px',
							borderRadius: '28px',
							border: 'none',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '17px',
							fontWeight: 600,
							color: '#FCF9F7',
							backgroundColor: '#1E1E1D',
							cursor: 'pointer',
							transition: 'all 0.2s',
							boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
						}}
					>
						Назад
					</button>
				)}

				{/* Кнопка "Далее" */}
				<button
					onClick={saveAndNext}
					disabled={!canProceed()}
					style={{
						flex: currentStep > STEPS.NAME_AVATAR ? 1 : undefined,
						width: currentStep > STEPS.NAME_AVATAR ? undefined : '90vw',
						maxWidth: '450px',
						height: '72px',
						borderRadius: '28px',
						border: 'none',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '17px',
						fontWeight: 600,
						color: '#FCF9F7',
						backgroundColor: canProceed() ? '#F7710B' : 'rgba(252,249,247,0.1)',
						opacity: canProceed() ? 1 : 0.5,
						cursor: canProceed() ? 'pointer' : 'not-allowed',
						transition: 'all 0.2s',
						boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
					}}
				>
					Далее
				</button>
			</div>

			{/* Модалка подписки */}
			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={handleSubscriptionClose}
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

'use client'

import CasesModal from '@/components/networking/CasesModal'
import MyListingsSection from '@/components/work/MyListingsSection'
import WorkHeader from '@/components/WorkHeader'
import { useEffect, useRef, useState } from 'react'

export default function WorkProfilePage() {
	const [user, setUser] = useState<any>(null)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const [mode, setMode] = useState<'candidate' | 'company'>('candidate')

	// Modal states
	const [showAboutModal, setShowAboutModal] = useState(false)
	const [showSkillsModal, setShowSkillsModal] = useState(false)
	const [showExperienceModal, setShowExperienceModal] = useState(false)
	const [showValuesModal, setShowValuesModal] = useState(false)

	// Edit states
	const [aboutMe, setAboutMe] = useState('')
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [experienceText, setExperienceText] = useState('')
	const [experienceLevel, setExperienceLevel] = useState('нет опыта')
	const [selectedValues, setSelectedValues] = useState<string[]>([])

	// Available options - load from backend
	const [_availableSkills, setAvailableSkills] = useState<string[]>([])
	const [skillCategories, setSkillCategories] = useState<any[]>([])
	const [availableValues, setAvailableValues] = useState<string[]>([])
	const [loadingSkills, setLoadingSkills] = useState(false)
	const [loadingValues, setLoadingValues] = useState(false)
	const [dataLoaded, setDataLoaded] = useState(false)
	const experienceLevels = [
		'нет опыта',
		'менее года',
		'1-3 года',
		'3-5 лет',
		'более 5 лет',
	]

	// Resumes and Vacancies from backend
	const [resumes, setResumes] = useState<any[]>([])
	const [vacancies, setVacancies] = useState<any[]>([])
	const [_loadingResumes, setLoadingResumes] = useState(true)
	const [_loadingVacancies, setLoadingVacancies] = useState(true)
	const [uploadingAvatar, setUploadingAvatar] = useState(false)

	// Cases states
	const [cases, setCases] = useState<
		{
			id: string
			photoPath: string
			title: string | null
			link: string | null
			sortOrder: number
		}[]
	>([])
	const [showCasesModal, setShowCasesModal] = useState(false)
	const [uploadingCase, setUploadingCase] = useState<number | null>(null)

	const toggleSkill = (skill: string) => {
		if (selectedSkills.includes(skill)) {
			setSelectedSkills(selectedSkills.filter(s => s !== skill))
		} else if (selectedSkills.length < 5) {
			setSelectedSkills([...selectedSkills, skill])
		}
	}

	const toggleValue = (value: string) => {
		if (selectedValues.includes(value)) {
			setSelectedValues(selectedValues.filter(v => v !== value))
		} else if (selectedValues.length < 5) {
			setSelectedValues([...selectedValues, value])
		}
	}

	useEffect(() => {
		const savedMode = localStorage.getItem('workMode') as
			| 'candidate'
			| 'company'
			| null
		if (savedMode) {
			setMode(savedMode)
		}

		// Listen for mode changes
		const handleModeChange = (e: CustomEvent) => {
			const newMode = e.detail as 'candidate' | 'company'
			setMode(newMode)
		}

		window.addEventListener('modeChange' as any, handleModeChange as any)

		return () => {
			window.removeEventListener('modeChange' as any, handleModeChange as any)
		}
	}, [])

	// Reload data when mode changes
	useEffect(() => {
		const tg = window.Telegram?.WebApp
		const tgUser = tg?.initDataUnsafe?.user

		if (tgUser) {
			if (mode === 'candidate') {
				loadResumes(tgUser.id.toString())
				setLoadingVacancies(false) // Stop loading vacancies
			} else {
				loadVacancies(tgUser.id.toString())
				setLoadingResumes(false) // Stop loading resumes
			}
		}

		// Listen for reload event
		const handleReload = () => {
			if (tgUser) {
				if (mode === 'candidate') {
					loadResumes(tgUser.id.toString())
				} else {
					loadVacancies(tgUser.id.toString())
				}
			}
		}

		window.addEventListener('reloadWorkProfile', handleReload)

		return () => {
			window.removeEventListener('reloadWorkProfile', handleReload)
		}
	}, [mode])

	useEffect(() => {
		const savedMode = localStorage.getItem('workMode') as
			| 'candidate'
			| 'company'
			| null
		if (savedMode && (savedMode === 'candidate' || savedMode === 'company')) {
			setMode(savedMode)
		}

		// Listen for mode changes
		const handleModeChange = (e: CustomEvent) => {
			const newMode = e.detail as 'candidate' | 'company'
			if (newMode !== mode) {
				setMode(newMode)
			}
		}

		window.addEventListener('modeChange' as any, handleModeChange as any)

		// Load skills and values only once
		if (!dataLoaded) {
			loadSkillsAndValues()
			setDataLoaded(true)
		}

		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			const tg = window.Telegram.WebApp
			const tgUser = tg.initDataUnsafe?.user

			if (tgUser) {
				setUser({
					id: tgUser.id,
					firstName: tgUser.first_name || '',
					lastName: tgUser.last_name || '',
					username: tgUser.username || '',
					photoUrl: tgUser.photo_url || null,
				})

				if (mode === 'candidate') {
					loadResumes(tgUser.id.toString())
				} else {
					loadVacancies(tgUser.id.toString())
				}
				loadUserProfile(tgUser.id.toString())
			} else {
				// Fallback for development - use test user id
				setLoadingResumes(false)
			}
		} else {
			// Not in Telegram environment
			setLoadingResumes(false)
		}

		return () => {
			window.removeEventListener('modeChange' as any, handleModeChange as any)
		}
	}, [])

	const loadSkillsAndValues = async () => {
		try {
			setLoadingSkills(true)
			const categoriesRes = await fetch('/api/work/skills/categories')
			if (categoriesRes.ok) {
				const categoriesData = await categoriesRes.json()
				setSkillCategories(categoriesData)

				// Flatten all skills for availableSkills array
				const allSkills = categoriesData.flatMap((cat: any) =>
					cat.skills.map((s: any) => s.name),
				)
				setAvailableSkills(allSkills)
			} else {
				console.error('Failed to load categories:', categoriesRes.status)
			}
			setLoadingSkills(false)

			setLoadingValues(true)
			const valuesRes = await fetch('/api/work/values')
			if (valuesRes.ok) {
				const valuesData = await valuesRes.json()
				const valueNames = valuesData.map((v: any) => v.name)
				setAvailableValues(valueNames)
			} else {
				console.error('Failed to load values:', valuesRes.status)
			}
			setLoadingValues(false)
		} catch (error) {
			console.error('Error loading skills and values:', error)
			setLoadingSkills(false)
			setLoadingValues(false)
		}
	}

	const loadResumes = async (userId: string) => {
		setLoadingResumes(true)
		try {
			const response = await fetch('/api/work/resumes/my', {
				headers: {
					'x-telegram-user-id': userId,
				},
			})
			if (response.ok) {
				const data = await response.json()
				setResumes(data)
			}
		} catch (_error) {
			// Silently fail - resumes are optional
		} finally {
			setLoadingResumes(false)
		}
	}

	const loadVacancies = async (userId: string) => {
		setLoadingVacancies(true)
		try {
			const response = await fetch('/api/work/vacancies/my', {
				headers: {
					'x-telegram-user-id': userId,
				},
			})
			if (response.ok) {
				const data = await response.json()
				setVacancies(data)
			} else {
				console.error('Failed to load vacancies:', await response.text())
			}
		} catch (error) {
			// Silently fail - vacancies are optional
			console.error('Could not load vacancies:', error)
		} finally {
			setLoadingVacancies(false)
		}
	}

	const handleDeleteListing = async (
		id: string,
		type: 'resume' | 'vacancy',
	) => {
		try {
			const tg = (window as any).Telegram?.WebApp
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!telegramId || telegramId === 'undefined') {
				telegramId = 'test_user'
			}

			const endpoint =
				type === 'resume'
					? `/api/work/resumes/${id}`
					: `/api/work/vacancies/${id}`

			const response = await fetch(endpoint, {
				method: 'DELETE',
				headers: {
					'x-telegram-user-id': telegramId,
				},
			})

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				// Reload data
				if (type === 'resume') {
					loadResumes(telegramId)
				} else {
					loadVacancies(telegramId)
				}
			}
		} catch (error) {
			console.error('Error deleting:', error)
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Ошибка при удалении')
			}
		}
	}

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Проверка расширения файла
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
			} else {
				alert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, HEIC')
			}
			event.target.value = '' // Сбрасываем input
			return
		}

		// Проверка типа файла (дополнительная)
		const allowedTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
			'image/heic',
			'image/heif',
		]
		if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, HEIC')
			} else {
				alert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, HEIC')
			}
			event.target.value = '' // Сбрасываем input
			return
		}

		// Проверка размера (10MB)
		if (file.size > 10 * 1024 * 1024) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Файл слишком большой. Максимальный размер: 10MB')
			} else {
				alert('Файл слишком большой. Максимальный размер: 10MB')
			}
			event.target.value = '' // Сбрасываем input
			return
		}

		setUploadingAvatar(true)

		try {
			const tg = (window as any).Telegram?.WebApp
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()

			if (!telegramId || telegramId === 'undefined') {
				telegramId = 'test_user'
			}

			const formData = new FormData()
			formData.append('file', file)
			formData.append('userId', telegramId)

			const response = await fetch('/api/upload/avatar/work', {
				method: 'POST',
				body: formData,
			})

			if (response.ok) {
				const data = await response.json()
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				// Обновляем аватар в состоянии
				setUser((prev: any) => ({
					...prev,
					photoUrl: data.avatarPath,
				}))
			} else {
				throw new Error('Upload failed')
			}
		} catch (error) {
			console.error('Error uploading avatar:', error)
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Ошибка при загрузке фото')
			} else {
				alert('Ошибка при загрузке фото')
			}
		} finally {
			setUploadingAvatar(false)
			event.target.value = '' // Сбрасываем input
		}
	}

	const loadUserProfile = async (userId: string) => {
		try {
			// TODO: Replace with actual API endpoint when backend is ready
			// For now, we'll use mock data or localStorage
			const savedProfile = localStorage.getItem(`userProfile_${userId}`)
			if (savedProfile) {
				const profile = JSON.parse(savedProfile)
				if (profile.aboutMe) setAboutMe(profile.aboutMe)
				if (profile.selectedSkills) setSelectedSkills(profile.selectedSkills)
				if (profile.experienceText) setExperienceText(profile.experienceText)
				if (profile.experienceLevel) setExperienceLevel(profile.experienceLevel)
				if (profile.selectedValues) setSelectedValues(profile.selectedValues)
			}

			const response = await fetch(`/api/networking/profile?userId=${userId}`)
			if (response.ok) {
				const data = await response.json()
				setCases(data.networkingCases || [])
			}
		} catch (_error) {
			console.log('Could not load user profile')
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
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!telegramId || telegramId === 'undefined') {
				telegramId = 'test_user'
			}

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
					await loadUserProfile(telegramId)
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
					await loadUserProfile(telegramId)
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
				tg.showAlert('Ошибка: ID кейса не найден')
			}
			return
		}

		try {
			const tg = (window as any).Telegram?.WebApp
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!telegramId || telegramId === 'undefined') {
				telegramId = 'test_user'
			}

			const response = await fetch(
				`/api/networking/cases/${caseId}?userId=${telegramId}`,
				{
					method: 'DELETE',
				},
			)

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				await loadUserProfile(telegramId)
			} else {
				const errorText = await response.text()
				console.error('Delete failed:', errorText)
				// Не показываем ошибку пользователю, просто обновляем профиль
				await loadUserProfile(telegramId)
			}
		} catch (error) {
			console.error('Error deleting case:', error)
			// Обновляем профиль в любом случае
			const tg = (window as any).Telegram?.WebApp
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!telegramId || telegramId === 'undefined') {
				telegramId = 'test_user'
			}
			await loadUserProfile(telegramId)
		}
	}

	const handleSaveCase = async (
		caseId: string,
		title: string,
		link: string,
	) => {
		try {
			const tg = (window as any).Telegram?.WebApp
			let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!telegramId || telegramId === 'undefined') {
				telegramId = 'test_user'
			}

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
				await loadUserProfile(telegramId)
			}
		} catch (error) {
			console.error('Error saving case:', error)
		}
	}

	const saveUserProfile = () => {
		if (user) {
			const profile = {
				aboutMe,
				selectedSkills,
				experienceText,
				experienceLevel,
				selectedValues,
			}
			localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(profile))
		}
	}

	const displayName = user
		? `${user.firstName} ${user.lastName}`.trim() || user.username || 'Ваше имя'
		: 'Ваше имя'

	const username = user?.username ? `@${user.username}` : '@dorimagoe'

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
			}}
		>
			<WorkHeader />

			{/* Profile Section */}
			<div
				style={{
					padding: '0 20px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					overflow: 'visible',
					position: 'relative',
				}}
			>
				{/* Avatar with Cases */}
				<div
					style={{
						marginBottom: '16px',
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						overflow: 'visible',
					}}
				>
					{/* Avatar container */}
					<div
						style={{
							position: 'relative',
							width: '170px',
							height: '170px',
							overflow: 'visible',
						}}
					>
						{/* Avatar */}
						<div
							style={{
								width: '170px',
								height: '170px',
								borderRadius: '50%',
								backgroundColor: '#3a3a3a',
								overflow: 'hidden',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								position: 'relative',
								zIndex: 2,
							}}
						>
							{user?.photoUrl ? (
								<img
									src={user.photoUrl}
									alt='Profile'
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							) : (
								<svg width='80' height='80' viewBox='0 0 24 24' fill='#FCF9F7'>
									<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
									<circle cx='12' cy='7' r='4' />
								</svg>
							)}
						</div>

						{/* Edit button */}
						<label
							htmlFor='work-avatar-upload'
							style={{
								position: 'absolute',
								top: '0',
								right: '0',
								width: '40px',
								height: '40px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
								opacity: uploadingAvatar ? 0.5 : 1,
								zIndex: 10,
							}}
						>
							{uploadingAvatar ? (
								<div
									style={{
										width: '20px',
										height: '20px',
										border: '2px solid #1E1B1A',
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
							id='work-avatar-upload'
							type='file'
							accept='.jpg,.jpeg,.png,.webp,.heic,.heif'
							onChange={handleAvatarUpload}
							disabled={uploadingAvatar}
							style={{ display: 'none' }}
						/>

						{/* Floating Cases */}
						{cases.length > 0 &&
							cases.slice(0, 3).map((caseItem, index) => {
								const positions = [
									{ top: '-25%', left: '-25%' },
									{ top: '10%', left: '95%' },
									{ top: '50%', left: '-63%' },
								]
								const position = positions[index % positions.length]

								return (
									<div
										key={`${caseItem.id}-${index}`}
										onClick={() => {
											if (caseItem.link) {
												window.open(caseItem.link, '_blank')
											}
										}}
										style={{
											position: 'absolute',
											...position,
											zIndex: 5,
											width: '118px',
											height: '118px',
											cursor: caseItem.link ? 'pointer' : 'default',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										{/* Аура за кейсом - всегда голубая, светится */}
										<img
											src='/blue_aura.webp'
											alt='Aura'
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '118px',
												height: '118px',
												objectFit: 'contain',
												zIndex: 0,
												filter:
													'drop-shadow(0 0 20px rgba(101, 255, 247, 0.8))',
												animation: 'rotateAura 15s linear infinite',
											}}
										/>

										{/* Фото кейса 52x52 */}
										{caseItem.photoPath && (
											<img
												src={caseItem.photoPath}
												alt={caseItem.title || 'Case'}
												style={{
													position: 'relative',
													width: '52px',
													height: '52px',
													borderRadius: '50%',
													objectFit: 'cover',
													zIndex: 1,
													backgroundColor: '#272727',
												}}
											/>
										)}
									</div>
								)
							})}
					</div>
				</div>

				{/* Name */}
				<h2
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '28px',
						color: '#FCF9F7',
						marginBottom: '4px',
						fontWeight: 600,
					}}
				>
					{displayName}
				</h2>

				{/* Username */}
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: 'rgba(252, 249, 247, 0.5)',
						marginBottom: '24px',
					}}
				>
					{username}
				</p>

				{/* Cases Section */}
				<div style={{ width: '100%', padding: '0 20px', marginBottom: '16px' }}>
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '28px',
							padding: '20px',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								marginBottom: cases.length > 0 ? '12px' : '0',
							}}
						>
							<h2
								style={{
									color: '#FCF9F7',
									fontWeight: 600,
									fontSize: '20px',
									fontFamily: 'LT Superior, sans-serif',
									margin: 0,
								}}
							>
								Кейсы
							</h2>
							<button
								onClick={() => {
									const tg = (window as any).Telegram?.WebApp
									if (tg) tg.HapticFeedback.impactOccurred('light')
									setShowCasesModal(true)
								}}
								style={{
									cursor: 'pointer',
									background: 'none',
									border: 'none',
									padding: 0,
								}}
							>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z'
										fill='#FCF9F7'
										fillOpacity='0.65'
									/>
								</svg>
							</button>
						</div>

						{cases.length > 0 ? (
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								{cases.map(caseItem => (
									<div
										key={caseItem.id}
										onClick={() => {
											if (caseItem.link) {
												window.open(caseItem.link, '_blank')
											}
										}}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '6px',
											backgroundColor: 'rgba(252, 249, 247, 0.65)',
											borderRadius: '18px',
											padding: '5px',
											height: '35px',
											cursor: caseItem.link ? 'pointer' : 'default',
										}}
									>
										{caseItem.photoPath && (
											<img
												src={caseItem.photoPath}
												alt={caseItem.title || 'Case'}
												style={{
													width: '25px',
													height: '25px',
													borderRadius: '50%',
													objectFit: 'cover',
													backgroundColor: '#272727',
												}}
											/>
										)}
										{caseItem.title && (
											<span
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '12px',
													color: '#1D1D1B',
													fontWeight: 600,
													paddingRight: '8px',
												}}
											>
												{caseItem.title}
											</span>
										)}
									</div>
								))}
							</div>
						) : (
							<p
								style={{
									color: 'rgba(252, 249, 247, 0.5)',
									fontSize: '14px',
									fontFamily: 'LT Superior, sans-serif',
									margin: 0,
								}}
							>
								Кейсы не добавлены
							</p>
						)}
					</div>
				</div>

				{/* Completion status - aligned left */}
				<div
					style={{
						width: '100%',
						padding: '0 20px',
						marginBottom: '12px',
					}}
				>
					<div
						style={{
							backgroundColor: '#FCF9F7',
							borderRadius: '20px',
							padding: '8px 20px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#121212',
							fontWeight: 600,
							display: 'inline-block',
						}}
					>
						1/3
					</div>
				</div>
			</div>

			{/* Horizontal Slider with 4 cards: About Me + 3 sections */}
			<div style={{ marginBottom: '24px', paddingLeft: '20px' }}>
				<div
					ref={scrollContainerRef}
					style={{
						display: 'flex',
						gap: '16px',
						overflowX: 'auto',
						padding: '0 20px 20px 0',
						paddingLeft: '0',
						scrollSnapType: 'x mandatory',
						WebkitOverflowScrolling: 'touch',
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
					}}
				>
					{/* About Me Card */}
					<div
						style={{
							minWidth: 'calc(80vw - 32px)',
							maxWidth: 'calc(80vw - 32px)',
							backgroundColor: '#272727',
							borderRadius: '20px',
							padding: '24px',
							scrollSnapAlign: 'start',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '16px',
							}}
						>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '22px',
									color: '#FCF9F7',
									margin: 0,
									fontWeight: 600,
								}}
							>
								Обо мне
							</h3>
							<button
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
								}}
								onClick={() => setShowAboutModal(true)}
							>
								<img src='/pen.svg' alt='Edit' width={24} height={24} />
							</button>
						</div>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '15px',
								color: 'rgba(252, 249, 247, 0.7)',
								lineHeight: '1.5',
								margin: 0,
							}}
						>
							{aboutMe ||
								'Это описание будут видеть работодатели/исполнители в профиле исполнителя или компании'}
						</p>
					</div>

					{/* Навыки Card */}
					<div
						style={{
							minWidth: 'calc(80vw - 32px)',
							maxWidth: 'calc(80vw - 32px)',
							backgroundColor: '#272727',
							borderRadius: '20px',
							padding: '24px',
							scrollSnapAlign: 'start',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '16px',
							}}
						>
							<h4
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '20px',
									color: '#FCF9F7',
									margin: 0,
									fontWeight: 600,
								}}
							>
								Навыки
							</h4>
							<button
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
								}}
								onClick={() => setShowSkillsModal(true)}
							>
								<img src='/pen.svg' alt='Edit' width={20} height={20} />
							</button>
						</div>
						{selectedSkills.length > 0 ? (
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
								{selectedSkills.map((skill, index) => (
									<span
										key={index}
										style={{
											backgroundColor: '#65FFF7',
											borderRadius: '16px',
											padding: '6px 14px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '13px',
											color: '#121212',
											fontWeight: 500,
											transition: 'all 0.3s ease',
										}}
									>
										{skill}
									</span>
								))}
							</div>
						) : (
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: 'rgba(252, 249, 247, 0.5)',
									margin: 0,
								}}
							>
								Выберите навыки
							</p>
						)}
					</div>

					{/* Опыт работы Card */}
					<div
						style={{
							minWidth: 'calc(80vw - 32px)',
							maxWidth: 'calc(80vw - 32px)',
							backgroundColor: '#272727',
							borderRadius: '20px',
							padding: '24px',
							scrollSnapAlign: 'start',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '16px',
							}}
						>
							<h4
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '20px',
									color: '#FCF9F7',
									margin: 0,
									fontWeight: 600,
								}}
							>
								Опыт работы
							</h4>
							<button
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
								}}
								onClick={() => setShowExperienceModal(true)}
							>
								<img src='/pen.svg' alt='Edit' width={20} height={20} />
							</button>
						</div>
						<div style={{ marginBottom: '12px' }}>
							<span
								style={{
									backgroundColor: '#65FFF7',
									borderRadius: '16px',
									padding: '6px 14px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '13px',
									color: '#121212',
									fontWeight: 500,
									display: 'inline-block',
									transition: 'all 0.3s ease',
								}}
							>
								{experienceLevel}
							</span>
						</div>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: experienceText
									? 'rgba(252, 249, 247, 0.7)'
									: 'rgba(252, 249, 247, 0.5)',
								lineHeight: '1.5',
								margin: 0,
							}}
						>
							{experienceText ||
								'Описание опыта работы: какие задачи выполняли и т.д.'}
						</p>
					</div>

					{/* Ценности Card */}
					<div
						style={{
							minWidth: 'calc(80vw - 32px)',
							maxWidth: 'calc(80vw - 32px)',
							backgroundColor: '#272727',
							borderRadius: '20px',
							padding: '24px',
							scrollSnapAlign: 'start',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '16px',
							}}
						>
							<h4
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '20px',
									color: '#FCF9F7',
									margin: 0,
									fontWeight: 600,
								}}
							>
								Ценности
							</h4>
							<button
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
								}}
								onClick={() => setShowValuesModal(true)}
							>
								<img src='/pen.svg' alt='Edit' width={20} height={20} />
							</button>
						</div>
						{selectedValues.length > 0 ? (
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
								{selectedValues.map((value, index) => (
									<span
										key={index}
										style={{
											backgroundColor: '#65FFF7',
											borderRadius: '16px',
											padding: '6px 14px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '13px',
											color: '#121212',
											fontWeight: 500,
											transition: 'all 0.3s ease',
										}}
									>
										{value}
									</span>
								))}
							</div>
						) : (
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: 'rgba(252, 249, 247, 0.5)',
									margin: 0,
								}}
							>
								Выберите ценности
							</p>
						)}
					</div>
				</div>

				<style jsx>{`
					div::-webkit-scrollbar {
						display: none;
					}
				`}</style>
			</div>

			{/* Cases Modal */}
			<CasesModal
				isOpen={showCasesModal}
				cases={cases}
				uploadingCase={uploadingCase}
				onClose={() => setShowCasesModal(false)}
				onUpload={handleCaseUpload}
				onDelete={handleDeleteCase}
				onSaveCase={handleSaveCase}
				onCaseCreated={caseId => {
					console.log('Case created:', caseId)
				}}
			/>

			{/* My Listings Section */}
			<MyListingsSection
				mode={mode}
				resumes={resumes}
				vacancies={vacancies}
				onDelete={handleDeleteListing}
			/>

			{/* Edit Modals */}
			{showAboutModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px',
						zIndex: 1000,
						animation: 'fadeIn 0.3s ease',
					}}
					onClick={() => setShowAboutModal(false)}
				>
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '24px',
							padding: '24px',
							maxWidth: '480px',
							width: '100%',
							animation: 'slideUp 0.3s ease',
						}}
						onClick={e => e.stopPropagation()}
					>
						<h3
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '22px',
								color: '#FCF9F7',
								marginBottom: '16px',
							}}
						>
							Обо мне
						</h3>
						<textarea
							value={aboutMe}
							onChange={e => setAboutMe(e.target.value)}
							placeholder='Это описание будут видеть работодатели/исполнители в профиле исполнителя или компании'
							rows={5}
							style={{
								width: '100%',
								backgroundColor: '#3a3a3a',
								border: 'none',
								borderRadius: '16px',
								padding: '16px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								resize: 'none',
								marginBottom: '16px',
								transition: 'all 0.3s ease',
							}}
						/>
						<button
							onClick={() => {
								setShowAboutModal(false)
								saveUserProfile()
							}}
							style={{
								width: '100%',
								backgroundColor: '#65FFF7',
								border: 'none',
								borderRadius: '24px',
								padding: '16px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#121212',
								cursor: 'pointer',
								fontWeight: 600,
								transition: 'all 0.3s ease',
							}}
						>
							Сохранить
						</button>
					</div>
				</div>
			)}

			{showSkillsModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px',
						zIndex: 1000,
						animation: 'fadeIn 0.3s ease',
					}}
					onClick={() => {
						setShowSkillsModal(false)
						saveUserProfile()
					}}
				>
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '24px',
							padding: '20px',
							maxWidth: '480px',
							width: '100%',
							maxHeight: '80vh',
							display: 'flex',
							flexDirection: 'column',
							animation: 'slideUp 0.3s ease',
						}}
						onClick={e => e.stopPropagation()}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '6px',
							}}
						>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '20px',
									color: '#FCF9F7',
									margin: 0,
								}}
							>
								Навыки
							</h3>
							<button
								onClick={() => setSelectedSkills([])}
								style={{
									background: 'none',
									border: '1px solid rgba(252, 249, 247, 0.3)',
									borderRadius: '12px',
									padding: '6px 12px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '12px',
									color: '#FCF9F7',
									cursor: 'pointer',
									transition: 'all 0.3s ease',
								}}
							>
								Сбросить
							</button>
						</div>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '13px',
								color: 'rgba(252, 249, 247, 0.7)',
								marginBottom: '12px',
							}}
						>
							Выберите до 5 навыков ({selectedSkills.length}/5)
						</p>
						<div
							style={{
								flex: 1,
								overflowY: 'auto',
								marginBottom: '16px',
								backgroundColor: '#3a3a3a',
								borderRadius: '16px',
								padding: '12px',
							}}
						>
							{loadingSkills ? (
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
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
							) : skillCategories.length === 0 ? (
								<p
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: 'rgba(252, 249, 247, 0.5)',
										textAlign: 'center',
										padding: '20px',
									}}
								>
									Навыки не найдены
								</p>
							) : (
								skillCategories.map(category => (
									<div key={category.id} style={{ marginBottom: '16px' }}>
										<h4
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: 'rgba(252, 249, 247, 0.5)',
												marginBottom: '8px',
												fontWeight: 600,
											}}
										>
											{category.name}
										</h4>
										<div
											style={{
												display: 'flex',
												gap: '6px',
												flexWrap: 'wrap',
											}}
										>
											{category.skills.map((skill: any) => {
												const isSelected = selectedSkills.includes(skill.name)
												const isDisabled =
													!isSelected && selectedSkills.length >= 5
												return (
													<button
														key={skill.id}
														onClick={() => toggleSkill(skill.name)}
														disabled={isDisabled}
														style={{
															backgroundColor: isSelected
																? '#F7710B'
																: '#272727',
															border: 'none',
															borderRadius: '20px',
															padding: '8px 16px',
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '14px',
															fontWeight: 500,
															color: isSelected ? '#1D1D1B' : '#FCF9F7',
															cursor: isDisabled ? 'not-allowed' : 'pointer',
															opacity: isDisabled ? 0.5 : 1,
															transition: 'all 0.2s ease',
														}}
													>
														{skill.name}
													</button>
												)
											})}
										</div>
									</div>
								))
							)}
						</div>
						<button
							onClick={() => {
								setShowSkillsModal(false)
								saveUserProfile()
							}}
							style={{
								width: '100%',
								backgroundColor: '#65FFF7',
								border: 'none',
								borderRadius: '24px',
								padding: '14px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#121212',
								cursor: 'pointer',
								fontWeight: 600,
								transition: 'all 0.3s ease',
							}}
						>
							Сохранить
						</button>
					</div>
				</div>
			)}

			{showExperienceModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px',
						zIndex: 1000,
						animation: 'fadeIn 0.3s ease',
					}}
					onClick={() => setShowExperienceModal(false)}
				>
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '24px',
							padding: '24px',
							maxWidth: '480px',
							width: '100%',
							animation: 'slideUp 0.3s ease',
						}}
						onClick={e => e.stopPropagation()}
					>
						<h3
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '22px',
								color: '#FCF9F7',
								marginBottom: '16px',
							}}
						>
							Опыт работы
						</h3>
						<div style={{ marginBottom: '16px' }}>
							<label
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: '#FCF9F7',
									display: 'block',
									marginBottom: '8px',
								}}
							>
								Уровень опыта
							</label>
							<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
								{experienceLevels.map(level => (
									<button
										key={level}
										onClick={() => setExperienceLevel(level)}
										style={{
											backgroundColor:
												experienceLevel === level ? '#65FFF7' : 'transparent',
											border:
												experienceLevel === level
													? 'none'
													: '1px solid rgba(252, 249, 247, 0.3)',
											borderRadius: '16px',
											padding: '8px 16px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: experienceLevel === level ? '#121212' : '#FCF9F7',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
									>
										{level}
									</button>
								))}
							</div>
						</div>
						<textarea
							value={experienceText}
							onChange={e => setExperienceText(e.target.value)}
							placeholder='Опишите ваш опыт работы'
							rows={5}
							style={{
								width: '100%',
								backgroundColor: '#3a3a3a',
								border: 'none',
								borderRadius: '16px',
								padding: '16px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
								outline: 'none',
								resize: 'none',
								marginBottom: '16px',
								transition: 'all 0.3s ease',
							}}
						/>
						<button
							onClick={() => {
								setShowExperienceModal(false)
								saveUserProfile()
							}}
							style={{
								width: '100%',
								backgroundColor: '#65FFF7',
								border: 'none',
								borderRadius: '24px',
								padding: '16px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#121212',
								cursor: 'pointer',
								fontWeight: 600,
								transition: 'all 0.3s ease',
							}}
						>
							Сохранить
						</button>
					</div>
				</div>
			)}

			{showValuesModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '20px',
						zIndex: 1000,
						animation: 'fadeIn 0.3s ease',
					}}
					onClick={() => {
						setShowValuesModal(false)
						saveUserProfile()
					}}
				>
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '24px',
							padding: '24px',
							maxWidth: '480px',
							width: '100%',
							animation: 'slideUp 0.3s ease',
						}}
						onClick={e => e.stopPropagation()}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '8px',
							}}
						>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '22px',
									color: '#FCF9F7',
									margin: 0,
								}}
							>
								Ценности
							</h3>
							<button
								onClick={() => setSelectedValues([])}
								style={{
									background: 'none',
									border: '1px solid rgba(252, 249, 247, 0.3)',
									borderRadius: '12px',
									padding: '6px 12px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '12px',
									color: '#FCF9F7',
									cursor: 'pointer',
									transition: 'all 0.3s ease',
								}}
							>
								Сбросить
							</button>
						</div>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.7)',
								marginBottom: '16px',
							}}
						>
							Выберите до 5 ценностей ({selectedValues.length}/5)
						</p>
						<div
							style={{
								display: 'flex',
								gap: '8px',
								flexWrap: 'wrap',
								marginBottom: '24px',
								backgroundColor: '#3a3a3a',
								borderRadius: '16px',
								padding: '12px',
							}}
						>
							{loadingValues ? (
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										padding: '40px',
										width: '100%',
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
							) : availableValues.length === 0 ? (
								<p
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: 'rgba(252, 249, 247, 0.5)',
										textAlign: 'center',
										padding: '20px',
										width: '100%',
									}}
								>
									Ценности не найдены
								</p>
							) : (
								availableValues.map(value => {
									const isSelected = selectedValues.includes(value)
									const isDisabled = !isSelected && selectedValues.length >= 5
									return (
										<button
											key={value}
											onClick={() => toggleValue(value)}
											disabled={isDisabled}
											style={{
												backgroundColor: isSelected ? '#F7710B' : '#272727',
												border: 'none',
												borderRadius: '20px',
												padding: '8px 16px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												fontWeight: 500,
												color: isSelected ? '#1D1D1B' : '#FCF9F7',
												cursor: isDisabled ? 'not-allowed' : 'pointer',
												opacity: isDisabled ? 0.5 : 1,
												transition: 'all 0.2s ease',
											}}
										>
											{value}
										</button>
									)
								})
							)}
						</div>
						<button
							onClick={() => {
								setShowValuesModal(false)
								saveUserProfile()
							}}
							style={{
								width: '100%',
								backgroundColor: '#65FFF7',
								border: 'none',
								borderRadius: '24px',
								padding: '16px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#121212',
								cursor: 'pointer',
								fontWeight: 600,
								transition: 'all 0.3s ease',
							}}
						>
							Сохранить
						</button>
					</div>
				</div>
			)}

			<style>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}

				@keyframes rotateAura {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	)
}

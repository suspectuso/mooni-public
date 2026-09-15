'use client'

import { RUSSIAN_CITIES } from '@/constants/cities'
import { useEffect, useRef, useState } from 'react'

interface FiltersModalProps {
	isOpen: boolean
	onClose: () => void
	onApply: (filters: any) => void
	hasActiveSubscription: boolean
	onSubscriptionClick: () => void
	activeFiltersCount?: number
}

export default function FiltersModal({
	isOpen,
	onClose,
	onApply,
	hasActiveSubscription,
	onSubscriptionClick,
	activeFiltersCount: _activeFiltersCount = 0,
}: FiltersModalProps) {
	const [isAnimating, setIsAnimating] = useState(false)
	const [ageRange, setAgeRange] = useState([16, 70])
	const [city, setCity] = useState('')
	const [citySuggestions, setCitySuggestions] = useState<string[]>([])
	const [gender, setGender] = useState<string | null>(null)
	const [selectedAuras, setSelectedAuras] = useState<string[]>([])
	const [values, setValues] = useState<string[]>([])
	const [valueInput, setValueInput] = useState('')
	const [valueSuggestions, setValueSuggestions] = useState<any[]>([])
	const [allValues, setAllValues] = useState<any[]>([])
	const [skills, setSkills] = useState<string[]>([])
	const [skillInput, setSkillInput] = useState('')
	const [skillSuggestions, setSkillSuggestions] = useState<any[]>([])
	const [allSkillsCategories, setAllSkillsCategories] = useState<any[]>([])
	const [lookingFor, setLookingFor] = useState<string[]>([])
	const [showResetConfirm, setShowResetConfirm] = useState(false)
	const scrollRef = useRef<HTMLDivElement>(null)
	const [animationDone, setAnimationDone] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setIsAnimating(true), 10)
			loadSkillsCategories()
			loadValues()
			loadSavedFilters()
		} else {
			setIsAnimating(false)
		}
	}, [isOpen])

	// После завершения анимации убираем transform — без него скролл работает нативно
	useEffect(() => {
		if (isAnimating) {
			const timer = setTimeout(() => setAnimationDone(true), 500)
			return () => clearTimeout(timer)
		}
		setAnimationDone(false)
	}, [isAnimating])

	// Ручной тач-скролл: полностью берём контроль над скроллом
	// Android WebView перехватывает upward swipe даже с disableVerticalSwipes()
	useEffect(() => {
		const el = scrollRef.current
		if (!el || !isOpen) return

		let isScrolling = false
		let startY = 0
		let scrollStart = 0
		let lastY = 0
		let animId = 0

		// Буфер последних N замеров velocity для усреднения (убирает рывки)
		const velocityBuffer: { v: number; t: number }[] = []
		const BUFFER_SIZE = 6

		// Не скроллить если тач на слайдере возраста (у него touchAction: none)
		const isInteractiveTouch = (target: HTMLElement): boolean => {
			let node: HTMLElement | null = target
			while (node && node !== el) {
				if (node.style.touchAction === 'none') return true
				node = node.parentElement
			}
			return false
		}

		const getSmoothedVelocity = (): number => {
			if (velocityBuffer.length === 0) return 0
			// Берём только свежие замеры (последние 150ms)
			const now = performance.now()
			const recent = velocityBuffer.filter(s => now - s.t < 150)
			if (recent.length === 0) return 0
			// Взвешенное среднее: свежие замеры имеют больший вес
			let totalWeight = 0
			let weightedSum = 0
			for (let i = 0; i < recent.length; i++) {
				const weight = i + 1 // 1, 2, 3, ... — более свежие имеют больший вес
				weightedSum += recent[i].v * weight
				totalWeight += weight
			}
			return weightedSum / totalWeight
		}

		const onTouchStart = (e: TouchEvent) => {
			cancelAnimationFrame(animId)
			if (isInteractiveTouch(e.target as HTMLElement)) {
				isScrolling = false
				return
			}
			isScrolling = true
			startY = e.touches[0].clientY
			lastY = startY
			scrollStart = el.scrollTop
			velocityBuffer.length = 0
		}

		const onTouchMove = (e: TouchEvent) => {
			if (!isScrolling) return
			e.preventDefault()

			const touchY = e.touches[0].clientY
			const now = performance.now()

			// Считаем мгновенную velocity и добавляем в буфер
			const dy = lastY - touchY
			const instantV = (dy / 16) * 1000 // нормализуем к px/s
			velocityBuffer.push({ v: instantV, t: now })
			if (velocityBuffer.length > BUFFER_SIZE) velocityBuffer.shift()

			lastY = touchY

			const delta = startY - touchY
			const maxScroll = el.scrollHeight - el.clientHeight
			el.scrollTop = Math.max(0, Math.min(maxScroll, scrollStart + delta))
		}

		const onTouchEnd = () => {
			if (!isScrolling) return
			isScrolling = false

			const smoothedV = getSmoothedVelocity()

			// Плавная инерция — имитация iOS UIScrollView deceleration
			let v = smoothedV * 0.4 // мягкий начальный импульс
			let lastFrame = performance.now()

			// iOS deceleration rate ≈ 0.998 per ms, мы используем per-frame
			const DECELERATION = 0.997

			const animate = () => {
				const now = performance.now()
				const dt = now - lastFrame
				lastFrame = now

				// Применяем затухание пропорционально прошедшему времени
				v *= Math.pow(DECELERATION, dt)

				if (Math.abs(v) < 8) return

				el.scrollTop += (v * dt) / 1000

				const maxScroll = el.scrollHeight - el.clientHeight
				if (el.scrollTop <= 0) {
					el.scrollTop = 0
					return
				}
				if (el.scrollTop >= maxScroll) {
					el.scrollTop = maxScroll
					return
				}

				animId = requestAnimationFrame(animate)
			}

			if (Math.abs(smoothedV) > 50) {
				animId = requestAnimationFrame(animate)
			}
		}

		el.addEventListener('touchstart', onTouchStart, { passive: true })
		el.addEventListener('touchmove', onTouchMove, { passive: false })
		el.addEventListener('touchend', onTouchEnd, { passive: true })

		return () => {
			cancelAnimationFrame(animId)
			el.removeEventListener('touchstart', onTouchStart)
			el.removeEventListener('touchmove', onTouchMove)
			el.removeEventListener('touchend', onTouchEnd)
		}
	}, [isOpen])

	if (!isOpen) return null

	const loadSavedFilters = () => {
		try {
			const savedFilters = localStorage.getItem('networkingFilters')
			if (savedFilters) {
				const filters = JSON.parse(savedFilters)
				if (filters.ageRange) setAgeRange(filters.ageRange)
				if (filters.city) setCity(filters.city)
				if (filters.gender) setGender(filters.gender)
				if (filters.auras) setSelectedAuras(filters.auras)
				if (filters.values) setValues(filters.values)
				if (filters.skills) setSkills(filters.skills)
				if (filters.lookingFor) setLookingFor(filters.lookingFor)
			}
		} catch (error) {
			console.error('Error loading saved filters:', error)
		}
	}

	const loadSkillsCategories = async () => {
		try {
			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
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
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
			const valuesRes = await fetch(`${API_URL}/work/values`)

			if (valuesRes.ok) {
				const valuesData = await valuesRes.json()
				setAllValues(valuesData)
			}
		} catch (error) {
			console.error('Error loading values:', error)
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

			setSkillSuggestions(filtered.slice(0, 10))
		} else {
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

	const addValueFromSuggestion = (valueName: string) => {
		if (!values.includes(valueName) && values.length < 3) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.selectionChanged()
			}
			setValues([...values, valueName])
			setValueInput('')
			setValueSuggestions([])
		}
	}

	const handleCitySearch = (value: string) => {
		setCity(value)
		if (value.trim().length > 0) {
			const filtered = RUSSIAN_CITIES.filter(cityName =>
				cityName.toLowerCase().includes(value.toLowerCase()),
			)
			setCitySuggestions(filtered.slice(0, 10))
		} else {
			setCitySuggestions([])
		}
	}

	const selectCity = (cityName: string) => {
		setCity(cityName)
		setCitySuggestions([])
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
	}

	const handleAgeChange = (value: number, index: number) => {
		const newRange = [...ageRange]

		if (index === 0) {
			// Минимальный возраст не может быть больше максимального
			newRange[0] = Math.min(value, ageRange[1])
		} else {
			// Максимальный возраст не может быть меньше минимального
			newRange[1] = Math.max(value, ageRange[0])
		}

		// Вибрация только если значение действительно изменилось
		if (newRange[index] !== ageRange[index]) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.impactOccurred('medium')
			}
		}

		setAgeRange(newRange)
	}

	const handleLockedClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.notificationOccurred('warning')
		}
		onSubscriptionClick()
	}

	const toggleAura = (auraId: string) => {
		if (!hasActiveSubscription) {
			handleLockedClick()
			return
		}
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}
		setSelectedAuras(prev =>
			prev.includes(auraId)
				? prev.filter(a => a !== auraId)
				: [...prev, auraId],
		)
	}

	const toggleValue = (value: string) => {
		if (!hasActiveSubscription) {
			handleLockedClick()
			return
		}
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		setValues(prev =>
			prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
		)
	}

	const toggleSkill = (skill: string) => {
		if (!hasActiveSubscription) {
			handleLockedClick()
			return
		}
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		setSkills(prev =>
			prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
		)
	}

	const toggleLookingFor = (type: string) => {
		if (!hasActiveSubscription) {
			handleLockedClick()
			return
		}
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		setLookingFor(prev =>
			prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
		)
	}

	const handleClose = () => {
		// Проверяем, есть ли активные фильтры
		const hasActiveFilters =
			ageRange[0] !== 16 ||
			ageRange[1] !== 70 ||
			city ||
			gender ||
			selectedAuras.length > 0 ||
			values.length > 0 ||
			skills.length > 0

		if (hasActiveFilters) {
			setShowResetConfirm(true)
		} else {
			onClose()
		}
	}

	const handleResetFilters = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}

		// Сбрасываем все фильтры
		setAgeRange([16, 70])
		setCity('')
		setGender(null)
		setSelectedAuras([])
		setValues([])
		setSkills([])
		setLookingFor([])

		const emptyFilters = {
			ageRange: [16, 70],
			city: '',
			gender: null,
			auras: [],
			values: [],
			skills: [],
			lookingFor: [],
		}

		// Сохраняем пустые фильтры в localStorage
		localStorage.setItem('networkingFilters', JSON.stringify(emptyFilters))

		// Вызываем событие обновления фильтров
		window.dispatchEvent(new Event('filtersUpdated'))

		// Применяем пустые фильтры
		onApply(emptyFilters)

		setShowResetConfirm(false)
		onClose()
	}

	const handleCancelReset = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		setShowResetConfirm(false)
		// НЕ закрываем модалку фильтров, только модалку подтверждения
	}

	return (
		<>
			{/* Бэкдроп — отдельный от панели, не перехватывает тач */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 10000000,
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					opacity: isAnimating ? 1 : 0,
					transition: 'opacity 0.3s ease',
				}}
				onClick={handleClose}
			/>
			{/* Панель фильтров — отдельный fixed-элемент */}
			<div
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 10000001,
					backgroundColor: '#1e1e1d',
					borderRadius: '24px 24px 0 0',
					maxHeight: '85vh',
					display: 'flex',
					flexDirection: 'column',
					transform: animationDone
						? 'none'
						: isAnimating
							? 'translateY(0)'
							: 'translateY(100%)',
					transition: animationDone
						? 'none'
						: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
				}}
			>
				{/* Скроллируемый контент */}
				<div
					ref={scrollRef}
					style={{
						overflowY: 'auto',
						padding: '24px',
						paddingBottom: '120px',
						flex: 1,
						minHeight: 0,
						touchAction: 'none',
					}}
				>
						{/* Заголовок */}
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '24px',
							}}
						>
							<h2
								style={{
									fontFamily: 'Oks, sans-serif',
									fontSize: '24px',
									color: '#FCF9F7',
									margin: 0,
								}}
							>
								Фильтры
							</h2>
							<div
								style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
							>
								{/* Кнопка сбросить */}
								<button
									onClick={() => {
										const tg = (window as any).Telegram?.WebApp
										if (tg) {
											tg.HapticFeedback.impactOccurred('light')
										}
										setShowResetConfirm(true)
									}}
									style={{
										background: 'none',
										border: 'none',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 400,
										color: 'rgba(252, 249, 247, 0.45)',
										cursor: 'pointer',
										textDecoration: 'underline',
										padding: 0,
									}}
								>
									Сбросить
								</button>
								{/* Кнопка закрыть */}
								<button
									onClick={() => {
										const tg = (window as any).Telegram?.WebApp
										if (tg) {
											tg.HapticFeedback.impactOccurred('light')
										}
										onClose()
									}}
									style={{
										width: '32px',
										height: '32px',
										borderRadius: '50%',
										backgroundColor: 'rgba(252, 249, 247, 0.1)',
										border: 'none',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
									}}
								>
									<svg
										width='14'
										height='14'
										viewBox='0 0 14 14'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<line
											x1='0.366397'
											y1='0.339462'
											x2='13.3664'
											y2='13.3395'
											stroke='#FCF9F7'
										/>
										<line
											y1='-0.5'
											x2='19.105'
											y2='-0.5'
											transform='matrix(-0.680451 0.732793 0.732793 0.680451 14 0)'
											stroke='#FCF9F7'
										/>
									</svg>
								</button>
							</div>
						</div>

						{/* Возраст (бесплатный) */}
						<div style={{ marginBottom: '32px' }}>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#FCF9F7',
									marginBottom: '16px',
								}}
							>
								Возраст
							</h3>
							<div style={{ position: 'relative', padding: '0 8px' }}>
								{/* Трек */}
								<div
									style={{
										height: '4px',
										background: '#353534',
										borderRadius: '2px',
										position: 'relative',
										marginBottom: '20px',
									}}
								>
									{/* Активная часть трека */}
									<div
										style={{
											position: 'absolute',
											height: '4px',
											background: '#F7710B',
											borderRadius: '2px',
											left: `${((ageRange[0] - 16) / 54) * 100}%`,
											right: `${100 - ((ageRange[1] - 16) / 54) * 100}%`,
										}}
									/>

									{/* Кружок минимального возраста */}
									<div
										style={{
											position: 'absolute',
											left: `${((ageRange[0] - 16) / 54) * 100}%`,
											top: '50%',
											transform: 'translate(-50%, -50%)',
											width: '26px',
											height: '26px',
											borderRadius: '50%',
											background: '#FCF9F7',
											cursor: 'pointer',
											zIndex: 3,
											touchAction: 'none',
										}}
										onMouseDown={e => {
											e.preventDefault()
											const container = e.currentTarget.parentElement
											if (!container) return

											const handleMouseMove = (moveEvent: MouseEvent) => {
												const rect = container.getBoundingClientRect()
												const percent = Math.max(
													0,
													Math.min(
														1,
														(moveEvent.clientX - rect.left) / rect.width,
													),
												)
												const newValue = Math.round(16 + percent * 54)

												if (newValue <= ageRange[1]) {
													handleAgeChange(newValue, 0)
												}
											}

											const handleMouseUp = () => {
												document.removeEventListener(
													'mousemove',
													handleMouseMove,
												)
												document.removeEventListener('mouseup', handleMouseUp)
											}

											document.addEventListener('mousemove', handleMouseMove)
											document.addEventListener('mouseup', handleMouseUp)
										}}
										onTouchStart={e => {
											e.preventDefault()
											const container = (e.target as HTMLElement).parentElement
											if (!container) return

											const handleTouchMove = (moveEvent: TouchEvent) => {
												const touch = moveEvent.touches[0]
												const rect = container.getBoundingClientRect()
												const percent = Math.max(
													0,
													Math.min(1, (touch.clientX - rect.left) / rect.width),
												)
												const newValue = Math.round(16 + percent * 54)

												if (newValue <= ageRange[1]) {
													handleAgeChange(newValue, 0)
												}
											}

											const handleTouchEnd = () => {
												document.removeEventListener(
													'touchmove',
													handleTouchMove,
												)
												document.removeEventListener('touchend', handleTouchEnd)
											}

											document.addEventListener('touchmove', handleTouchMove)
											document.addEventListener('touchend', handleTouchEnd)
										}}
									/>

									{/* Кружок максимального возраста */}
									<div
										style={{
											position: 'absolute',
											left: `${((ageRange[1] - 16) / 54) * 100}%`,
											top: '50%',
											transform: 'translate(-50%, -50%)',
											width: '26px',
											height: '26px',
											borderRadius: '50%',
											background: '#FCF9F7',
											cursor: 'pointer',
											zIndex: 4,
											touchAction: 'none',
										}}
										onMouseDown={e => {
											e.preventDefault()
											const container = e.currentTarget.parentElement
											if (!container) return

											const handleMouseMove = (moveEvent: MouseEvent) => {
												const rect = container.getBoundingClientRect()
												const percent = Math.max(
													0,
													Math.min(
														1,
														(moveEvent.clientX - rect.left) / rect.width,
													),
												)
												const newValue = Math.round(16 + percent * 54)

												if (newValue >= ageRange[0]) {
													handleAgeChange(newValue, 1)
												}
											}

											const handleMouseUp = () => {
												document.removeEventListener(
													'mousemove',
													handleMouseMove,
												)
												document.removeEventListener('mouseup', handleMouseUp)
											}

											document.addEventListener('mousemove', handleMouseMove)
											document.addEventListener('mouseup', handleMouseUp)
										}}
										onTouchStart={e => {
											e.preventDefault()
											const container = (e.target as HTMLElement).parentElement
											if (!container) return

											const handleTouchMove = (moveEvent: TouchEvent) => {
												const touch = moveEvent.touches[0]
												const rect = container.getBoundingClientRect()
												const percent = Math.max(
													0,
													Math.min(1, (touch.clientX - rect.left) / rect.width),
												)
												const newValue = Math.round(16 + percent * 54)

												if (newValue >= ageRange[0]) {
													handleAgeChange(newValue, 1)
												}
											}

											const handleTouchEnd = () => {
												document.removeEventListener(
													'touchmove',
													handleTouchMove,
												)
												document.removeEventListener('touchend', handleTouchEnd)
											}

											document.addEventListener('touchmove', handleTouchMove)
											document.addEventListener('touchend', handleTouchEnd)
										}}
									/>
								</div>

								{/* Значения */}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#82817f',
									}}
								>
									<span>{ageRange[0]}</span>
									<span>{ageRange[1]}</span>
								</div>
							</div>
						</div>

						{/* Город (платный) */}
						<div style={{ marginBottom: '32px', position: 'relative' }}>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#FCF9F7',
									marginBottom: '16px',
								}}
							>
								Город
							</h3>
							<input
								type='text'
								placeholder='Начните набирать...'
								value={city}
								onChange={e => {
									if (!hasActiveSubscription) {
										handleLockedClick()
										return
									}
									handleCitySearch(e.target.value)
								}}
								onClick={() => {
									if (!hasActiveSubscription) {
										handleLockedClick()
									}
								}}
								style={{
									width: '100%',
									height: '70px',
									padding: '0 24px',
									backgroundColor: '#353534',
									border: 'none',
									borderRadius: '28px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: hasActiveSubscription ? '#FCF9F7' : '#82817f',
									outline: 'none',
								}}
								disabled={!hasActiveSubscription}
							/>
							{!hasActiveSubscription && (
								<div
									style={{
										position: 'absolute',
										top: '50%',
										right: '24px',
										fontSize: '20px',
									}}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width={24}
										height={24}
										viewBox='0 0 24 24'
									>
										<path
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
										></path>
									</svg>
								</div>
							)}

							{/* Выпадающий список с подсказками городов */}
							{citySuggestions.length > 0 && hasActiveSubscription && (
								<div
									style={{
										position: 'absolute',
										top: '100%',
										left: 0,
										right: 0,
										marginTop: '8px',
										backgroundColor: '#272727',
										borderRadius: '16px',
										maxHeight: '200px',
										overflowY: 'auto',
										zIndex: 1000,
										boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
									}}
								>
									{citySuggestions.map(cityName => (
										<button
											key={cityName}
											onClick={() => selectCity(cityName)}
											style={{
												width: '100%',
												padding: '12px 16px',
												backgroundColor: 'transparent',
												border: 'none',
												color: '#FCF9F7',
												fontSize: '16px',
												textAlign: 'left',
												cursor: 'pointer',
												fontFamily: 'LT Superior, sans-serif',
												transition: 'background-color 0.2s',
											}}
											onMouseEnter={e => {
												e.currentTarget.style.backgroundColor = '#353534'
											}}
											onMouseLeave={e => {
												e.currentTarget.style.backgroundColor = 'transparent'
											}}
										>
											{cityName}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Гендер (платный) */}
						<div style={{ marginBottom: '32px' }}>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#FCF9F7',
									marginBottom: '16px',
								}}
							>
								Гендер
							</h3>
							<div style={{ display: 'flex', gap: '12px' }}>
								<button
									onClick={() => {
										if (!hasActiveSubscription) {
											handleLockedClick()
											return
										}
										const tg = (window as any).Telegram?.WebApp
										if (tg) {
											tg.HapticFeedback.impactOccurred('medium')
										}
										setGender(gender === 'MALE' ? null : 'MALE')
									}}
									style={{
										flex: 1,
										height: '56px',
										borderRadius: '28px',
										border: 'none',
										backgroundColor:
											gender === 'MALE' && hasActiveSubscription
												? '#353534'
												: '#282826',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '8px',
										cursor: 'pointer',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color:
											gender === 'MALE' && hasActiveSubscription
												? '#FCF9F7'
												: '#82817f',
										transition: 'all 0.2s',
										opacity: hasActiveSubscription ? 1 : 0.5,
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
											fill={
												gender === 'MALE' && hasActiveSubscription
													? '#FCF9F7'
													: '#82817f'
											}
											fillOpacity={
												gender === 'MALE' && hasActiveSubscription
													? '1'
													: '0.45'
											}
										/>
									</svg>
									Мужчина
									{!hasActiveSubscription && (
										<span>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={24}
												height={24}
												viewBox='0 0 24 24'
											>
												<path
													fill='none'
													stroke='currentColor'
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
												></path>
											</svg>
										</span>
									)}
								</button>
								<button
									onClick={() => {
										if (!hasActiveSubscription) {
											handleLockedClick()
											return
										}
										const tg = (window as any).Telegram?.WebApp
										if (tg) {
											tg.HapticFeedback.impactOccurred('medium')
										}
										setGender(gender === 'FEMALE' ? null : 'FEMALE')
									}}
									style={{
										flex: 1,
										height: '56px',
										borderRadius: '28px',
										border: 'none',
										backgroundColor:
											gender === 'FEMALE' && hasActiveSubscription
												? '#353534'
												: '#282826',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '8px',
										cursor: 'pointer',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color:
											gender === 'FEMALE' && hasActiveSubscription
												? '#FCF9F7'
												: '#82817f',
										transition: 'all 0.2s',
										opacity: hasActiveSubscription ? 1 : 0.5,
									}}
								>
									<svg
										width='20'
										height='20'
										viewBox='0 0 16 23'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											fillRule='evenodd'
											clipRule='evenodd'
											d='M8.00164 2.05643C7.2206 2.05643 6.44722 2.21045 5.72563 2.50969C5.00405 2.80894 4.3484 3.24754 3.79612 3.80047C3.24385 4.35341 2.80576 5.00983 2.50687 5.73227C2.20798 6.45471 2.05414 7.22901 2.05414 8.01097C2.05414 8.79294 2.20798 9.56724 2.50687 10.2897C2.80576 11.0121 3.24385 11.6685 3.79612 12.2215C4.3484 12.7744 5.00405 13.213 5.72563 13.5123C6.44722 13.8115 7.2206 13.9655 8.00164 13.9655C9.57902 13.9655 11.0918 13.3382 12.2072 12.2215C13.3225 11.1048 13.9491 9.59022 13.9491 8.01097C13.9491 6.43173 13.3225 4.91717 12.2072 3.80047C11.0918 2.68378 9.57902 2.05643 8.00164 2.05643ZM16 8.01097C15.9997 9.95693 15.2919 11.8362 14.0087 13.2978C12.7254 14.7594 10.9546 15.7033 9.02707 15.9531V18.0721H11.283C11.555 18.0721 11.8158 18.1803 12.0081 18.3728C12.2004 18.5653 12.3084 18.8265 12.3084 19.0987C12.3084 19.371 12.2004 19.6322 12.0081 19.8247C11.8158 20.0172 11.555 20.1254 11.283 20.1254H9.02707V21.9734C9.02707 22.2456 8.91904 22.5068 8.72673 22.6993C8.53442 22.8918 8.2736 23 8.00164 23C7.72968 23 7.46886 22.8918 7.27655 22.6993C7.08425 22.5068 6.97621 22.2456 6.97621 21.9734V20.1254H4.72026C4.4483 20.1254 4.18748 20.0172 3.99517 19.8247C3.80287 19.6322 3.69483 19.371 3.69483 19.0987C3.69483 18.8265 3.80287 18.5653 3.99517 18.3728C4.18748 18.1803 4.4483 18.0721 4.72026 18.0721H6.97621V15.9531C5.45024 15.756 4.01342 15.1224 2.83796 14.1285C1.6625 13.1345 0.798278 11.8222 0.348866 10.3489C-0.100546 8.87568 -0.116077 7.30391 0.304134 5.82203C0.724345 4.34014 1.56247 3.01102 2.71806 1.99395C3.87364 0.976879 5.29766 0.31502 6.81944 0.0876958C8.34122 -0.139628 9.89619 0.0772284 11.298 0.712274C12.6998 1.34732 13.8889 2.37361 14.7229 3.66814C15.5569 4.96268 16.0003 6.47053 16 8.01097Z'
											fill={
												gender === 'FEMALE' && hasActiveSubscription
													? '#FCF9F7'
													: '#82817f'
											}
										/>
									</svg>
									Женщина
									{!hasActiveSubscription && (
										<span>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={24}
												height={24}
												viewBox='0 0 24 24'
											>
												<path
													fill='none'
													stroke='currentColor'
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
												></path>
											</svg>
										</span>
									)}
								</button>
							</div>
						</div>

						{/* Что ищет - Аура (платный) */}
						<div style={{ marginBottom: '32px' }}>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#FCF9F7',
									marginBottom: '16px',
								}}
							>
								Что ищет
							</h3>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(3, 1fr)',
									gap: '16px',
								}}
							>
								{[
									{
										id: 'RED',
										label: 'Любовь',
										image: '/red_aura.webp',
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
										bgColor: 'rgba(242, 51, 24, 0.2)',
									},
									{
										id: 'TURQUOISE',
										label: 'Команда',
										image: '/blue_aura.webp',
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
										bgColor: 'rgba(101, 255, 247, 0.2)',
									},
									{
										id: 'ORANGE',
										label: 'Работа',
										image: '/orange_aura.webp',
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
										bgColor: 'rgba(247, 113, 11, 0.2)',
									},
								].map(aura => (
									<button
										key={aura.id}
										onClick={() => toggleAura(aura.id)}
										style={{
											position: 'relative',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '8px',
											border: 'none',
											background: 'none',
											cursor: 'pointer',
											padding: 0,
											opacity: hasActiveSubscription ? 1 : 0.5,
											transition: 'opacity 0.2s',
										}}
									>
										{/* Аура */}
										<div
											style={{
												position: 'relative',
												width: '100%',
												marginBottom: '-12px',
												opacity:
													selectedAuras.includes(aura.id) &&
													hasActiveSubscription
														? 1
														: 0.3,
												transition: 'opacity 0.2s',
											}}
										>
											<img
												src={aura.image}
												alt={aura.label}
												style={{
													width: '100%',
													height: 'auto',
													objectFit: 'contain',
												}}
											/>
										</div>

										{/* Иконка в кружке */}
										<div
											style={{
												width: '30px',
												height: '30px',
												borderRadius: '50%',
												backgroundColor: aura.bgColor,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<div
												style={{
													width: '15px',
													height: '15px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												{aura.icon}
											</div>
										</div>

										{/* Название */}
										<div
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: '#FCF9F7',
												whiteSpace: 'nowrap',
											}}
										>
											{aura.label}
										</div>

										{/* Галочка */}
										<div
											style={{
												width: '30px',
												height: '30px',
												borderRadius: '50%',
												backgroundColor:
													selectedAuras.includes(aura.id) &&
													hasActiveSubscription
														? '#F7710B'
														: '#353534',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												transition: 'background-color 0.2s',
											}}
										>
											<svg
												width='12'
												height='10'
												viewBox='0 0 16 12'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M1.33301 6L5.99967 10.6667L14.6663 2'
													stroke={
														selectedAuras.includes(aura.id) &&
														hasActiveSubscription
															? '#FCF9F7'
															: '#82817f'
													}
													strokeWidth='2.5'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
										</div>

										{!hasActiveSubscription && (
											<div
												style={{
													position: 'absolute',
													top: '8px',
													right: '8px',
													fontSize: '16px',
												}}
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width={24}
													height={24}
													viewBox='0 0 24 24'
												>
													<path
														fill='none'
														stroke='currentColor'
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
													></path>
												</svg>
											</div>
										)}
									</button>
								))}
							</div>
						</div>

						{/* Ценности (платный) */}
						<div style={{ marginBottom: '32px', position: 'relative' }}>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#FCF9F7',
									marginBottom: '16px',
								}}
							>
								Ценности (до 3-х)
							</h3>
							<input
								type='text'
								placeholder='Начните вводить'
								value={valueInput}
								onChange={e => {
									if (!hasActiveSubscription) {
										handleLockedClick()
										return
									}
									handleValueInputChange(e.target.value)
								}}
								onClick={() => {
									if (!hasActiveSubscription) {
										handleLockedClick()
									}
								}}
								style={{
									width: '100%',
									height: '70px',
									padding: '0 24px',
									backgroundColor: '#353534',
									border: 'none',
									borderRadius: '28px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: hasActiveSubscription ? '#FCF9F7' : '#82817f',
									outline: 'none',
									marginBottom: '12px',
								}}
								disabled={!hasActiveSubscription}
							/>

							{/* Выпадающий список с подсказками */}
							{valueSuggestions.length > 0 && hasActiveSubscription && (
								<div
									style={{
										position: 'absolute',
										top: '90px',
										left: 0,
										right: 0,
										backgroundColor: '#272727',
										borderRadius: '16px',
										maxHeight: '200px',
										overflowY: 'auto',
										zIndex: 1000,
										boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
									}}
								>
									{valueSuggestions.map(val => {
										const isSelected = values.includes(val.name)
										const isDisabled = !isSelected && values.length >= 3

										return (
											<button
												key={val.id}
												onClick={() => {
													if (!isDisabled) {
														addValueFromSuggestion(val.name)
													}
												}}
												disabled={isDisabled}
												style={{
													width: '100%',
													padding: '12px 16px',
													backgroundColor: 'transparent',
													border: 'none',
													color: isDisabled ? '#82817f' : '#FCF9F7',
													fontSize: '16px',
													textAlign: 'left',
													cursor: isDisabled ? 'not-allowed' : 'pointer',
													fontFamily: 'LT Superior, sans-serif',
													transition: 'background-color 0.2s',
													opacity: isDisabled ? 0.5 : 1,
												}}
												onMouseEnter={e => {
													if (!isDisabled) {
														e.currentTarget.style.backgroundColor = '#353534'
													}
												}}
												onMouseLeave={e => {
													e.currentTarget.style.backgroundColor = 'transparent'
												}}
											>
												{val.name}
											</button>
										)
									})}
								</div>
							)}

							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								{values.map(value => (
									<button
										key={value}
										onClick={() => toggleValue(value)}
										style={{
											padding: '8px 16px',
											borderRadius: '20px',
											border: 'none',
											backgroundColor: '#F7710B',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											fontWeight: 600,
											color: '#FCF9F7',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											opacity: hasActiveSubscription ? 1 : 0.5,
										}}
									>
										{value}
										<span>×</span>
									</button>
								))}
							</div>
							{!hasActiveSubscription && (
								<div
									style={{
										marginTop: '8px',
										fontSize: '12px',
										color: '#82817f',
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
									}}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width={24}
										height={24}
										viewBox='0 0 24 24'
									>
										<path
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
										></path>
									</svg>{' '}
									Доступно с подпиской
								</div>
							)}
						</div>

						{/* Навыки (платный) */}
						<div style={{ marginBottom: '32px', position: 'relative' }}>
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#FCF9F7',
									marginBottom: '16px',
								}}
							>
								Навыки (до 5-и)
							</h3>
							<input
								type='text'
								placeholder='Начните вводить'
								value={skillInput}
								onChange={e => {
									if (!hasActiveSubscription) {
										handleLockedClick()
										return
									}
									handleSkillInputChange(e.target.value)
								}}
								onClick={() => {
									if (!hasActiveSubscription) {
										handleLockedClick()
									}
								}}
								style={{
									width: '100%',
									height: '70px',
									padding: '0 24px',
									backgroundColor: '#353534',
									border: 'none',
									borderRadius: '28px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: hasActiveSubscription ? '#FCF9F7' : '#82817f',
									outline: 'none',
									marginBottom: '12px',
								}}
								disabled={!hasActiveSubscription}
							/>

							{/* Выпадающий список с подсказками */}
							{skillSuggestions.length > 0 && hasActiveSubscription && (
								<div
									style={{
										position: 'absolute',
										top: '90px',
										left: 0,
										right: 0,
										backgroundColor: '#272727',
										borderRadius: '16px',
										maxHeight: '200px',
										overflowY: 'auto',
										zIndex: 1000,
										boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
									}}
								>
									{skillSuggestions.map(skill => {
										const isSelected = skills.includes(skill.name)
										const isDisabled = !isSelected && skills.length >= 5

										return (
											<button
												key={skill.id}
												onClick={() => {
													if (!isDisabled) {
														addSkillFromSuggestion(skill.name)
													}
												}}
												disabled={isDisabled}
												style={{
													width: '100%',
													padding: '12px 16px',
													backgroundColor: 'transparent',
													border: 'none',
													color: isDisabled ? '#82817f' : '#FCF9F7',
													fontSize: '16px',
													textAlign: 'left',
													cursor: isDisabled ? 'not-allowed' : 'pointer',
													fontFamily: 'LT Superior, sans-serif',
													transition: 'background-color 0.2s',
													opacity: isDisabled ? 0.5 : 1,
												}}
												onMouseEnter={e => {
													if (!isDisabled) {
														e.currentTarget.style.backgroundColor = '#353534'
													}
												}}
												onMouseLeave={e => {
													e.currentTarget.style.backgroundColor = 'transparent'
												}}
											>
												{skill.name}
											</button>
										)
									})}
								</div>
							)}

							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
								{skills.map(skill => (
									<button
										key={skill}
										onClick={() => toggleSkill(skill)}
										style={{
											padding: '8px 16px',
											borderRadius: '20px',
											border: 'none',
											backgroundColor: '#F7710B',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											fontWeight: 600,
											color: '#FCF9F7',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											opacity: hasActiveSubscription ? 1 : 0.5,
										}}
									>
										{skill}
										<span>×</span>
									</button>
								))}
							</div>
							{!hasActiveSubscription && (
								<div
									style={{
										marginTop: '8px',
										fontSize: '12px',
										color: '#82817f',
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
									}}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width={24}
										height={24}
										viewBox='0 0 24 24'
									>
										<path
											fill='none'
											stroke='currentColor'
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
										></path>
									</svg>{' '}
									Доступно с подпиской
								</div>
							)}
						</div>
					</div>

					{/* Fixed кнопка применить */}
					<button
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) {
								tg.HapticFeedback.impactOccurred('medium')
							}

							const filters = {
								ageRange,
								city,
								gender,
								auras: selectedAuras,
								values,
								skills,
								lookingFor,
							}

							// Сохраняем фильтры в localStorage
							localStorage.setItem('networkingFilters', JSON.stringify(filters))

							// Вызываем событие обновления фильтров
							window.dispatchEvent(new Event('filtersUpdated'))

							onApply(filters)
							onClose()
						}}
						style={{
							position: 'fixed',
							bottom: '105px',
							left: '24px',
							right: '24px',
							width: 'calc(100% - 48px)',
							maxWidth: '450px',
							height: '56px',
							borderRadius: '28px',
							border: 'none',
							backgroundColor: '#F7710B',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							cursor: 'pointer',
							margin: '0 auto',
						}}
					>
						Применить фильтры
					</button>
				</div>

			{/* Модалка подтверждения сброса */}
			{showResetConfirm && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 10000002,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'rgba(0, 0, 0, 0.7)',
							padding: '20px',
						}}
						onClick={handleCancelReset}
					>
						<div
							onClick={e => e.stopPropagation()}
							style={{
								backgroundColor: '#1e1e1d',
								borderRadius: '24px',
								padding: '32px 24px',
								maxWidth: '400px',
								width: '100%',
							}}
						>
							<h3
								style={{
									fontFamily: 'Oks, sans-serif',
									fontSize: '20px',
									color: '#FCF9F7',
									marginBottom: '16px',
									textAlign: 'center',
								}}
							>
								Сбросить фильтры?
							</h3>
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: 'rgba(252, 249, 247, 0.65)',
									marginBottom: '24px',
									textAlign: 'center',
								}}
							>
								Все примененные фильтры будут удалены
							</p>
							<div style={{ display: 'flex', gap: '12px' }}>
								<button
									onClick={handleCancelReset}
									style={{
										flex: 1,
										height: '48px',
										borderRadius: '24px',
										border: 'none',
										backgroundColor: '#353534',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										cursor: 'pointer',
									}}
								>
									Отменить
								</button>
								<button
									onClick={handleResetFilters}
									style={{
										flex: 1,
										height: '48px',
										borderRadius: '24px',
										border: 'none',
										backgroundColor: '#F23318',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										cursor: 'pointer',
									}}
								>
									Сбросить
								</button>
							</div>
						</div>
					</div>
				)}
		</>
	)
}

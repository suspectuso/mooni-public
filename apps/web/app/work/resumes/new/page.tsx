'use client'

import MatchLoader from '@/components/MatchLoader'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function CreateResumeContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const editId = searchParams.get('edit')
	const [isEditing, setIsEditing] = useState(false)
	const [loading, setLoading] = useState(!!editId)

	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [position, setPosition] = useState('')
	const [categoryId, setCategoryId] = useState('')
	const [experience, setExperience] = useState('')
	const [workStartDate, setWorkStartDate] = useState('')
	const [workEndDate, setWorkEndDate] = useState('')
	const [stillWorking, setStillWorking] = useState(false)
	const [dateErrors, setDateErrors] = useState({
		startDate: '',
		endDate: '',
	})
	const [toast, setToast] = useState<{
		message: string
		type: 'success' | 'error'
	} | null>(null)
	const [hasChanges, setHasChanges] = useState(false)
	const [initialData, setInitialData] = useState<any>(null)
	const [showExitModal, setShowExitModal] = useState(false)

	// Format date input (DD.MM.YYYY)
	const formatDateInput = (value: string) => {
		const digits = value.replace(/\D/g, '')

		// Format as DD.MM.YYYY
		if (digits.length <= 2) {
			return digits
		} else if (digits.length <= 4) {
			return `${digits.slice(0, 2)}.${digits.slice(2)}`
		} else {
			return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`
		}
	}

	const handleDateChange = (
		value: string,
		setter: (val: string) => void,
		field: 'startDate' | 'endDate',
	) => {
		const formatted = formatDateInput(value)
		setter(formatted)

		// Clear error when user starts typing
		if (dateErrors[field]) {
			setDateErrors(prev => ({ ...prev, [field]: '' }))
		}

		// Validate if complete
		if (formatted.length === 10) {
			if (!validateDate(formatted)) {
				const parts = formatted.split('.')
				const year = parseInt(parts[2], 10)
				if (year < 1900) {
					setDateErrors(prev => ({
						...prev,
						[field]: 'Год не может быть раньше 1900',
					}))
				} else {
					setDateErrors(prev => ({
						...prev,
						[field]: 'Неверный формат даты',
					}))
				}
			}
		}
	}

	const validateDate = (dateStr: string): boolean => {
		if (!dateStr || dateStr.length !== 10) return false

		const parts = dateStr.split('.')
		if (parts.length !== 3) return false

		const day = parseInt(parts[0], 10)
		const month = parseInt(parts[1], 10)
		const year = parseInt(parts[2], 10)

		if (isNaN(day) || isNaN(month) || isNaN(year)) return false
		if (day < 1 || day > 31) return false
		if (month < 1 || month > 12) return false
		if (year < 1900 || year > 2100) return false

		return true
	}
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [selectedValues, setSelectedValues] = useState<string[]>([])
	const [salaryMin, setSalaryMin] = useState('')
	const [salaryMax, setSalaryMax] = useState('')
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

	// Cases state (1-3 cases)
	const [cases, setCases] = useState<
		Array<{
			description: string
			startDate: string
			endDate: string
			stillWorking: boolean
		}>
	>([
		{
			description: '',
			startDate: '',
			endDate: '',
			stillWorking: false,
		},
	])

	const addCase = () => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
		if (cases.length < 3) {
			setCases([
				...cases,
				{
					description: '',
					startDate: '',
					endDate: '',
					stillWorking: false,
				},
			])
		}
	}

	const removeCase = (index: number) => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
		if (cases.length > 1) {
			setCases(cases.filter((_, i) => i !== index))
		}
	}

	const updateCase = (
		index: number,
		field: keyof (typeof cases)[0],
		value: any,
	) => {
		const newCases = [...cases]
		newCases[index] = { ...newCases[index], [field]: value }
		setCases(newCases)

		// Validate date if it's a date field and complete
		if (
			(field === 'startDate' || field === 'endDate') &&
			typeof value === 'string' &&
			value.length === 10
		) {
			if (!validateDate(value)) {
				const parts = value.split('.')
				const year = parseInt(parts[2], 10)
				if (year < 1900) {
					window.Telegram?.WebApp?.showAlert?.('Год не может быть раньше 1900')
				}
			}
		}
	}

	// Format salary with spaces (e.g., "1 000 000")
	const formatSalary = (value: string) => {
		const digits = value.replace(/\D/g, '')
		if (!digits) return ''

		// Add spaces every 3 digits from the right
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	}

	const handleSalaryChange = (value: string, setter: (val: string) => void) => {
		const formatted = formatSalary(value)
		setter(formatted)
	}
	const [showSkillsDropdown, setShowSkillsDropdown] = useState(false)
	const [showValuesDropdown, setShowValuesDropdown] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Data from API
	const [categories, setCategories] = useState<any[]>([])
	const [values, setValues] = useState<any[]>([])
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(),
	)

	useEffect(() => {
		const loadData = async () => {
			try {
				const API_URL =
					process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

				const categoriesRes = await fetch(`${API_URL}/work/skills/categories`)
				if (categoriesRes.ok) {
					const categoriesData = await categoriesRes.json()
					setCategories(categoriesData)
				} else {
					console.error('Failed to load categories:', categoriesRes.status)
				}

				const valuesRes = await fetch(`${API_URL}/work/values`)
				if (valuesRes.ok) {
					const valuesData = await valuesRes.json()
					setValues(valuesData)
				} else {
					console.error('Failed to load values:', valuesRes.status)
				}

				// Load resume data if editing
				if (editId) {
					setIsEditing(true)
					const tg = (window as any).Telegram?.WebApp
					let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
					if (!telegramId || telegramId === 'undefined') {
						telegramId = 'test_user'
					}

					const resumeRes = await fetch(`${API_URL}/work/resumes/${editId}`, {
						headers: {
							'x-telegram-user-id': telegramId,
						},
					})

					if (resumeRes.ok) {
						const resumeData = await resumeRes.json()

						// Fill form with existing data
						setFirstName(resumeData.firstName || '')
						setLastName(resumeData.lastName || '')
						setPosition(resumeData.position || '')
						setCategoryId(resumeData.categoryId || '')
						setExperience(resumeData.experience || '')
						setStillWorking(resumeData.stillWorking || false)

						// Format dates
						if (resumeData.workStartDate) {
							const date = new Date(resumeData.workStartDate)
							const formatted = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
							setWorkStartDate(formatted)
						}
						if (resumeData.workEndDate && !resumeData.stillWorking) {
							const date = new Date(resumeData.workEndDate)
							const formatted = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
							setWorkEndDate(formatted)
						}

						// Set selected skills
						if (resumeData.skills && resumeData.skills.length > 0) {
							const skillIds = resumeData.skills.map((s: any) => s.skillId)
							setSelectedSkills(skillIds)
						}

						// Set selected values
						if (resumeData.values && resumeData.values.length > 0) {
							const valueIds = resumeData.values.map((v: any) => v.valueId)
							setSelectedValues(valueIds)
						}

						// Set cases with formatted dates
						if (resumeData.cases && resumeData.cases.length > 0) {
							const formattedCases = resumeData.cases.map((c: any) => {
								const startDate = c.startDate
									? (() => {
											const d = new Date(c.startDate)
											const formatted = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
											return formatted
										})()
									: ''
								const endDate =
									c.endDate && !c.stillWorking
										? (() => {
												const d = new Date(c.endDate)
												const formatted = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
												return formatted
											})()
										: ''
								const result = {
									description: c.description || '',
									startDate,
									endDate,
									stillWorking: c.stillWorking || false,
								}
								return result
							})
							setCases(formattedCases)
						}

						// Set salary with formatting
						if (resumeData.salaryMin) {
							const formatted = formatSalary(resumeData.salaryMin.toString())
							setSalaryMin(formatted)
						}
						if (resumeData.salaryMax) {
							const formatted = formatSalary(resumeData.salaryMax.toString())
							setSalaryMax(formatted)
						}

						// Store initial data for change detection
						setInitialData(resumeData)
					} else {
						console.error('Failed to load resume:', await resumeRes.text())
					}
				}
			} catch (error) {
				console.error('Error loading data:', error)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [editId])

	const handleClose = () => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')

		if (hasChanges) {
			setShowExitModal(true)
		} else {
			router.push('/work/profile')
		}
	}

	const confirmExit = () => {
		window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
		router.push('/work/profile')
	}

	const cancelExit = () => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
		setShowExitModal(false)
	}

	// Track changes
	useEffect(() => {
		if (!initialData) return

		const currentData = {
			firstName,
			lastName,
			position,
			categoryId,
			experience,
			workStartDate,
			workEndDate,
			stillWorking,
			selectedSkills: selectedSkills.sort().join(','),
			selectedValues: selectedValues.sort().join(','),
			salaryMin,
			salaryMax,
			cases: JSON.stringify(cases),
		}

		const initial = {
			firstName: initialData.firstName || '',
			lastName: initialData.lastName || '',
			position: initialData.position || '',
			categoryId: initialData.categoryId || '',
			experience: initialData.experience || '',
			workStartDate: initialData.workStartDate
				? (() => {
						const d = new Date(initialData.workStartDate)
						return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
					})()
				: '',
			workEndDate:
				initialData.workEndDate && !initialData.stillWorking
					? (() => {
							const d = new Date(initialData.workEndDate)
							return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
						})()
					: '',
			stillWorking: initialData.stillWorking || false,
			selectedSkills: (initialData.skills || [])
				.map((s: any) => s.skillId)
				.sort()
				.join(','),
			selectedValues: (initialData.values || [])
				.map((v: any) => v.valueId)
				.sort()
				.join(','),
			salaryMin: initialData.salaryMin
				? formatSalary(initialData.salaryMin.toString())
				: '',
			salaryMax: initialData.salaryMax
				? formatSalary(initialData.salaryMax.toString())
				: '',
			cases: JSON.stringify(
				(initialData.cases || []).map((c: any) => {
					const startDate = c.startDate
						? (() => {
								const d = new Date(c.startDate)
								return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
							})()
						: ''
					const endDate =
						c.endDate && !c.stillWorking
							? (() => {
									const d = new Date(c.endDate)
									return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
								})()
							: ''
					return {
						description: c.description || '',
						startDate,
						endDate,
						stillWorking: c.stillWorking || false,
					}
				}),
			),
		}

		const changed = JSON.stringify(currentData) !== JSON.stringify(initial)
		setHasChanges(changed)
	}, [
		firstName,
		lastName,
		position,
		categoryId,
		experience,
		workStartDate,
		workEndDate,
		stillWorking,
		selectedSkills,
		selectedValues,
		salaryMin,
		salaryMax,
		cases,
		initialData,
	])

	const toggleSkill = (skillId: string) => {
		window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
		if (selectedSkills.includes(skillId)) {
			setSelectedSkills(selectedSkills.filter(s => s !== skillId))
		} else if (selectedSkills.length < 5) {
			setSelectedSkills([...selectedSkills, skillId])
		}
	}

	const toggleCategory = (categoryId: string) => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
		const newExpanded = new Set(expandedCategories)
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId)
		} else {
			newExpanded.add(categoryId)
		}
		setExpandedCategories(newExpanded)
	}

	const toggleValue = (valueId: string) => {
		window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
		if (selectedValues.includes(valueId)) {
			setSelectedValues(selectedValues.filter(v => v !== valueId))
		} else if (selectedValues.length < 5) {
			setSelectedValues([...selectedValues, valueId])
		}
	}

	const handleSubmit = async () => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
		if (!position || !experience) {
			return
		}

		// Validate dates if provided
		let hasErrors = false
		const newErrors = { startDate: '', endDate: '' }

		if (workStartDate && !validateDate(workStartDate)) {
			newErrors.startDate = 'Неверный формат даты'
			hasErrors = true
		}

		if (!stillWorking && workEndDate && !validateDate(workEndDate)) {
			newErrors.endDate = 'Неверный формат даты'
			hasErrors = true
		}

		if (hasErrors) {
			setDateErrors(newErrors)
			return
		}

		setIsSubmitting(true)
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) {
				setToast({
					message: 'Ошибка: не удалось получить данные пользователя',
					type: 'error',
				})
				setIsSubmitting(false)
				return
			}

			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
			const url = isEditing
				? `${API_URL}/work/resumes/${editId}`
				: `${API_URL}/work/resumes`
			const method = isEditing ? 'PATCH' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'x-telegram-user-id': tgUser.id.toString(),
				},
				body: JSON.stringify({
					firstName: firstName || tgUser.first_name,
					lastName: lastName || tgUser.last_name,
					position,
					categoryId: categoryId || null,
					experience,
					workStartDate: workStartDate || null,
					workEndDate: stillWorking ? null : workEndDate || null,
					stillWorking,
					salaryMin: salaryMin ? parseInt(salaryMin.replace(/\D/g, '')) : null,
					salaryMax: salaryMax ? parseInt(salaryMax.replace(/\D/g, '')) : null,
					skillIds: selectedSkills,
					valueIds: selectedValues,
					cases: cases
						.filter(c => c.description.trim())
						.map(c => ({
							description: c.description,
							startDate: c.startDate || null,
							endDate: c.stillWorking ? null : c.endDate || null,
							stillWorking: c.stillWorking,
						})),
				}),
			})

			if (response.ok) {
				window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
				setToast({
					message: isEditing
						? 'Резюме успешно обновлено!'
						: 'Резюме успешно создано!',
					type: 'success',
				})
				// Trigger reload event for profile page
				window.dispatchEvent(new CustomEvent('reloadWorkProfile'))
				setTimeout(() => router.push('/work/profile'), 1500)
			} else {
				window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
				const error = await response.json()
				setToast({
					message: error.message || 'Не удалось создать резюме',
					type: 'error',
				})
			}
		} catch (error) {
			console.error('Error creating resume:', error)
			window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
			setToast({ message: 'Ошибка при создании резюме', type: 'error' })
		} finally {
			setIsSubmitting(false)
		}
	}

	const selectedCategory = categories.find(c => c.id === categoryId)

	if (loading) {
		return <MatchLoader />
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: 'rgba(0, 0, 0, 0.9)',
				padding: '20px',
				overflowY: 'auto',
			}}
		>
			<div
				style={{
					backgroundColor: '#272727',
					borderRadius: '24px',
					padding: '24px',
					maxWidth: '480px',
					margin: '0 auto',
				}}
			>
				{/* Header */}
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
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '24px',
							color: '#FCF9F7',
							margin: 0,
						}}
					>
						{isEditing ? 'Редактировать резюме' : 'Создать резюме'}
					</h2>
					<button
						onClick={handleClose}
						style={{
							background: 'rgba(255, 255, 255, 0.1)',
							border: 'none',
							borderRadius: '50%',
							width: '32px',
							height: '32px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							color: '#FCF9F7',
							fontSize: '20px',
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
								d='M12 4L4 12M4 4L12 12'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
				</div>

				{/* Name Fields */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '12px',
						marginBottom: '20px',
					}}
				>
					<div>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								display: 'block',
								marginBottom: '8px',
							}}
						>
							Имя
						</label>
						<input
							type='text'
							value={firstName}
							onChange={e => setFirstName(e.target.value)}
							placeholder='Вася'
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
							}}
						/>
					</div>
					<div>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								display: 'block',
								marginBottom: '8px',
							}}
						>
							Фамилия
						</label>
						<input
							type='text'
							value={lastName}
							onChange={e => setLastName(e.target.value)}
							placeholder='Васильев'
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
							}}
						/>
					</div>
				</div>

				{/* Position */}
				<div style={{ marginBottom: '20px' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '8px',
						}}
					>
						Должность *
					</label>
					<input
						type='text'
						value={position}
						onChange={e => setPosition(e.target.value)}
						placeholder='Графический дизайнер'
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
						}}
					/>
				</div>

				{/* Category Dropdown */}
				<div style={{ marginBottom: '20px', position: 'relative' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '8px',
						}}
					>
						Категория
					</label>
					<div
						style={{
							width: '100%',
							backgroundColor: '#3a3a3a',
							border: 'none',
							borderRadius: '16px',
							padding: '16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: selectedCategory ? '#FCF9F7' : 'rgba(252, 249, 247, 0.5)',
							cursor: 'pointer',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
						onClick={() => {
							window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
							setShowCategoryDropdown(!showCategoryDropdown)
						}}
					>
						<span>{selectedCategory?.name || 'Выберите категорию'}</span>
						<svg
							width='12'
							height='8'
							viewBox='0 0 12 8'
							fill='#FCF9F7'
							style={{
								transform: showCategoryDropdown
									? 'rotate(180deg)'
									: 'rotate(0deg)',
								transition: 'transform 0.2s',
							}}
						>
							<path d='M1 1L6 6L11 1' stroke='#FCF9F7' strokeWidth='2' />
						</svg>
					</div>
					{showCategoryDropdown && (
						<div
							style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								right: 0,
								backgroundColor: '#3a3a3a',
								borderRadius: '16px',
								marginTop: '8px',
								zIndex: 10,
								maxHeight: '200px',
								overflowY: 'auto',
							}}
						>
							{categories.map(cat => (
								<div
									key={cat.id}
									onClick={() => {
										window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
										setCategoryId(cat.id)
										setShowCategoryDropdown(false)
									}}
									style={{
										padding: '16px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										cursor: 'pointer',
										borderBottom: '1px solid rgba(252, 249, 247, 0.1)',
									}}
								>
									{cat.name}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Experience */}
				<div style={{ marginBottom: '20px' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '8px',
						}}
					>
						Опыт работы *
					</label>
					<textarea
						value={experience}
						onChange={e => setExperience(e.target.value)}
						placeholder='Что входило в ваши обязанности'
						rows={3}
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
						}}
					/>
				</div>

				{/* Add Case Button */}
				<div style={{ marginBottom: '20px' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '12px',
						}}
					>
						Опыт работы
					</label>
					{cases.length < 3 && (
						<button
							onClick={addCase}
							style={{
								width: '100%',
								backgroundColor: '#3a3a3a',
								border: 'none',
								borderRadius: '24px',
								padding: '18px 24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#FCF9F7',
								cursor: 'pointer',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '16px',
							}}
						>
							<span>Добавить</span>
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z'
									fill='#FCF9F7'
								/>
							</svg>
						</button>
					)}
				</div>

				{/* Cases Section */}
				<div style={{ marginBottom: '20px' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '12px',
						}}
					>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
							}}
						>
							Кейсы (1-3)
						</label>
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
							}}
						>
							{cases.length}/3
						</span>
					</div>

					{cases.map((caseItem, index) => (
						<div
							key={index}
							style={{
								backgroundColor: '#3a3a3a',
								borderRadius: '16px',
								padding: '16px',
								marginBottom: '12px',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: '12px',
								}}
							>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: 'rgba(252, 249, 247, 0.7)',
									}}
								>
									Кейс {index + 1}
								</span>
								{cases.length > 1 && (
									<button
										onClick={() => removeCase(index)}
										style={{
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											padding: '4px',
										}}
									>
										<svg
											width='18'
											height='22'
											viewBox='0 0 18 22'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M7.2 0C6.7293 0 6.2469 0.168667 5.9058 0.516084C5.5656 0.861667 5.4 1.353 5.4 1.83333V2.75H0V4.58333H0.9V19.25C0.9 20.7579 2.1195 22 3.6 22H14.4C15.8805 22 17.1 20.7579 17.1 19.25V4.58333H18V2.75H12.6V1.83333C12.6 1.35392 12.4344 0.862583 12.0933 0.515167C11.754 0.168666 11.2707 0 10.8 0H7.2ZM7.2 1.83333H10.8V2.75H7.2V1.83333ZM2.7 4.58333H15.3V19.25C15.3 19.7588 14.8995 20.1667 14.4 20.1667H3.6C3.1005 20.1667 2.7 19.7588 2.7 19.25V4.58333ZM4.5 7.33333V17.4167H6.3V7.33333H4.5ZM8.1 7.33333V17.4167H9.9V7.33333H8.1ZM11.7 7.33333V17.4167H13.5V7.33333H11.7Z'
												fill='#F23318'
											/>
										</svg>
									</button>
								)}
							</div>

							<textarea
								value={caseItem.description}
								onChange={e => updateCase(index, 'description', e.target.value)}
								placeholder='Описание вашего опыта'
								rows={3}
								style={{
									width: '100%',
									backgroundColor: '#272727',
									border: 'none',
									borderRadius: '12px',
									padding: '12px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: '#FCF9F7',
									outline: 'none',
									resize: 'none',
									marginBottom: '12px',
									boxSizing: 'border-box',
								}}
							/>

							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: '8px',
									marginBottom: '8px',
								}}
							>
								<div style={{ boxSizing: 'border-box' }}>
									<label
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '12px',
											color: 'rgba(252, 249, 247, 0.7)',
											display: 'block',
											marginBottom: '6px',
										}}
									>
										Начало работы
									</label>
									<div
										style={{
											backgroundColor: '#272727',
											borderRadius: '12px',
											padding: '10px',
											display: 'flex',
											alignItems: 'center',
											gap: '6px',
											boxSizing: 'border-box',
										}}
									>
										<img
											src='/calendar.svg'
											alt='Calendar'
											width={16}
											height={16}
										/>
										<input
											type='text'
											value={caseItem.startDate}
											onChange={e =>
												updateCase(
													index,
													'startDate',
													formatDateInput(e.target.value),
												)
											}
											placeholder='ДД.ММ.ГГ'
											maxLength={10}
											style={{
												flex: 1,
												backgroundColor: 'transparent',
												border: 'none',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: '#FCF9F7',
												outline: 'none',
												width: '100%',
												boxSizing: 'border-box',
											}}
										/>
									</div>
								</div>

								<div style={{ boxSizing: 'border-box' }}>
									<label
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '12px',
											color: 'rgba(252, 249, 247, 0.7)',
											display: 'block',
											marginBottom: '6px',
										}}
									>
										Окончание работы
									</label>
									<div
										style={{
											backgroundColor: '#272727',
											borderRadius: '12px',
											padding: '10px',
											display: 'flex',
											alignItems: 'center',
											gap: '6px',
											boxSizing: 'border-box',
										}}
									>
										<img
											src='/calendar.svg'
											alt='Calendar'
											width={16}
											height={16}
										/>
										<input
											type='text'
											value={caseItem.endDate}
											onChange={e =>
												updateCase(
													index,
													'endDate',
													formatDateInput(e.target.value),
												)
											}
											disabled={caseItem.stillWorking}
											placeholder='ДД.ММ.ГГ'
											maxLength={10}
											style={{
												flex: 1,
												backgroundColor: 'transparent',
												border: 'none',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: caseItem.stillWorking
													? 'rgba(252, 249, 247, 0.3)'
													: '#FCF9F7',
												outline: 'none',
												width: '100%',
												boxSizing: 'border-box',
											}}
										/>
									</div>
								</div>
							</div>

							<label
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									cursor: 'pointer',
								}}
							>
								<div
									style={{
										width: '40px',
										height: '40px',
										borderRadius: '10px',
										backgroundColor: caseItem.stillWorking
											? '#65FFF7'
											: '#272727',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										transition: 'all 0.2s',
									}}
									onClick={() => {
										window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(
											'light',
										)
										updateCase(index, 'stillWorking', !caseItem.stillWorking)
									}}
								>
									{caseItem.stillWorking && (
										<img src='/tick.svg' alt='Check' width={20} height={16} />
									)}
								</div>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#FCF9F7',
									}}
								>
									Всё ещё работаю
								</span>
							</label>
						</div>
					))}
				</div>

				{/* Skills */}
				<div style={{ marginBottom: '20px', position: 'relative' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '8px',
						}}
					>
						Ключевые навыки (до 5)
					</label>
					<div
						style={{
							width: '100%',
							backgroundColor: '#3a3a3a',
							border: 'none',
							borderRadius: '16px',
							padding: '16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color:
								selectedSkills.length > 0
									? '#FCF9F7'
									: 'rgba(252, 249, 247, 0.5)',
							cursor: 'pointer',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
						onClick={() => {
							window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
							setShowSkillsDropdown(!showSkillsDropdown)
						}}
					>
						<span>
							{selectedSkills.length > 0
								? `Выбрано: ${selectedSkills.length}/5`
								: 'Выберите навыки'}
						</span>
						<svg
							width='12'
							height='8'
							viewBox='0 0 12 8'
							fill='#FCF9F7'
							style={{
								transform: showSkillsDropdown
									? 'rotate(180deg)'
									: 'rotate(0deg)',
								transition: 'transform 0.2s',
							}}
						>
							<path d='M1 1L6 6L11 1' stroke='#FCF9F7' strokeWidth='2' />
						</svg>
					</div>
					{showSkillsDropdown && (
						<div
							style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								right: 0,
								backgroundColor: '#3a3a3a',
								borderRadius: '16px',
								marginTop: '8px',
								zIndex: 10,
								maxHeight: '300px',
								overflowY: 'auto',
								padding: '12px',
							}}
						>
							{categories.map(category => (
								<div key={category.id} style={{ marginBottom: '12px' }}>
									<div
										onClick={() => {
											window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(
												'light',
											)
											toggleCategory(category.id)
										}}
										style={{
											backgroundColor: '#272727',
											borderRadius: '12px',
											padding: '10px 12px',
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											cursor: 'pointer',
											marginBottom: expandedCategories.has(category.id)
												? '8px'
												: '0',
										}}
									>
										<span
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: '#FCF9F7',
												fontWeight: 600,
											}}
										>
											{category.name}
										</span>
										<svg
											width='10'
											height='6'
											viewBox='0 0 12 8'
											fill='#FCF9F7'
											style={{
												transform: expandedCategories.has(category.id)
													? 'rotate(180deg)'
													: 'rotate(0deg)',
												transition: 'transform 0.2s',
											}}
										>
											<path
												d='M1 1L6 6L11 1'
												stroke='#FCF9F7'
												strokeWidth='2'
											/>
										</svg>
									</div>

									{expandedCategories.has(category.id) && (
										<div
											style={{
												display: 'flex',
												gap: '8px',
												flexWrap: 'wrap',
												paddingLeft: '8px',
											}}
										>
											{category.skills.map((skill: any) => (
												<button
													key={skill.id}
													onClick={() => {
														window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
														toggleSkill(skill.id)
													}}
													disabled={
														!selectedSkills.includes(skill.id) &&
														selectedSkills.length >= 5
													}
													style={{
														backgroundColor: selectedSkills.includes(skill.id)
															? '#F7710B'
															: '#272727',
														border: 'none',
														borderRadius: '20px',
														padding: '8px 16px',
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '14px',
														fontWeight: 500,
														color: selectedSkills.includes(skill.id)
															? '#1D1D1B'
															: '#FCF9F7',
														cursor:
															!selectedSkills.includes(skill.id) &&
															selectedSkills.length >= 5
																? 'not-allowed'
																: 'pointer',
														opacity:
															!selectedSkills.includes(skill.id) &&
															selectedSkills.length >= 5
																? 0.5
																: 1,
														transition: 'all 0.2s ease',
													}}
												>
													{skill.name}
												</button>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Values */}
				<div style={{ marginBottom: '24px', position: 'relative' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '8px',
						}}
					>
						Ценности (до 5)
					</label>
					<div
						style={{
							width: '100%',
							backgroundColor: '#3a3a3a',
							border: 'none',
							borderRadius: '16px',
							padding: '16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color:
								selectedValues.length > 0
									? '#FCF9F7'
									: 'rgba(252, 249, 247, 0.5)',
							cursor: 'pointer',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
						onClick={() => {
							window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
							setShowValuesDropdown(!showValuesDropdown)
						}}
					>
						<span>
							{selectedValues.length > 0
								? `Выбрано: ${selectedValues.length}/5`
								: 'Выберите ценности'}
						</span>
						<svg
							width='12'
							height='8'
							viewBox='0 0 12 8'
							fill='#FCF9F7'
							style={{
								transform: showValuesDropdown
									? 'rotate(180deg)'
									: 'rotate(0deg)',
								transition: 'transform 0.2s',
							}}
						>
							<path d='M1 1L6 6L11 1' stroke='#FCF9F7' strokeWidth='2' />
						</svg>
					</div>
					{showValuesDropdown && (
						<div
							style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								right: 0,
								backgroundColor: '#3a3a3a',
								borderRadius: '16px',
								marginTop: '8px',
								zIndex: 10,
								maxHeight: '300px',
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
								{values.map(value => (
									<button
										key={value.id}
										onClick={() => {
											window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
											toggleValue(value.id)
										}}
										disabled={
											!selectedValues.includes(value.id) &&
											selectedValues.length >= 5
										}
										style={{
											backgroundColor: selectedValues.includes(value.id)
												? '#F7710B'
												: '#272727',
											border: 'none',
											borderRadius: '20px',
											padding: '8px 16px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											fontWeight: 500,
											color: selectedValues.includes(value.id)
												? '#1D1D1B'
												: '#FCF9F7',
											cursor:
												!selectedValues.includes(value.id) &&
												selectedValues.length >= 5
													? 'not-allowed'
													: 'pointer',
											opacity:
												!selectedValues.includes(value.id) &&
												selectedValues.length >= 5
													? 0.5
													: 1,
											transition: 'all 0.2s ease',
										}}
									>
										{value.name}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Salary Range */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '12px',
						marginBottom: '32px',
					}}
				>
					<div>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								display: 'block',
								marginBottom: '8px',
							}}
						>
							Стоимость от
						</label>
						<input
							type='text'
							value={salaryMin}
							onChange={e => handleSalaryChange(e.target.value, setSalaryMin)}
							placeholder='60 000₽'
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
							}}
						/>
					</div>

					<div>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								display: 'block',
								marginBottom: '8px',
							}}
						>
							Стоимость до
						</label>
						<input
							type='text'
							value={salaryMax}
							onChange={e => handleSalaryChange(e.target.value, setSalaryMax)}
							placeholder='80 000₽'
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
							}}
						/>
					</div>
				</div>

				{/* Submit Button */}
				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					style={{
						width: '100%',
						background: isSubmitting
							? '#3a3a3a'
							: 'linear-gradient(90deg, #65FFF7 0%, #002EE7 100%)',
						border: 'none',
						borderRadius: '24px',
						padding: '18px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '18px',
						color: isSubmitting ? 'rgba(252, 249, 247, 0.5)' : '#FCF9F7',
						cursor: isSubmitting ? 'not-allowed' : 'pointer',
						fontWeight: 600,
					}}
				>
					{isSubmitting
						? isEditing
							? 'Сохранение...'
							: 'Создание...'
						: isEditing
							? 'Сохранить изменения'
							: 'Создать резюме'}
				</button>
			</div>

			{/* Toast Notification */}
			{toast && (
				<div
					style={{
						position: 'fixed',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						backgroundColor: 'rgba(39, 39, 39, 0.95)',
						backdropFilter: 'blur(10px)',
						borderRadius: '20px',
						padding: '24px',
						display: 'flex',
						alignItems: 'center',
						gap: '16px',
						zIndex: 1000,
						minWidth: '280px',
						animation: 'fadeIn 0.3s ease-in-out',
					}}
				>
					<div
						style={{
							width: '48px',
							height: '48px',
							borderRadius: '50%',
							backgroundColor:
								toast.type === 'success'
									? 'rgba(101, 255, 247, 0.2)'
									: 'rgba(242, 51, 24, 0.2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						{toast.type === 'success' ? (
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'
									fill='#65FFF7'
								/>
							</svg>
						) : (
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'
									fill='#F23318'
								/>
							</svg>
						)}
					</div>
					<span
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							flex: 1,
						}}
					>
						{toast.message}
					</span>
				</div>
			)}

			{/* Exit Confirmation Modal */}
			{showExitModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1001,
						padding: '20px',
					}}
					onClick={cancelExit}
				>
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '24px',
							padding: '32px 24px',
							maxWidth: '400px',
							width: '100%',
						}}
						onClick={e => e.stopPropagation()}
					>
						<h3
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '20px',
								color: '#FCF9F7',
								margin: '0 0 16px 0',
								textAlign: 'center',
								fontWeight: 600,
							}}
						>
							Несохраненные изменения
						</h3>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.7)',
								margin: '0 0 24px 0',
								textAlign: 'center',
							}}
						>
							Вы уверены, что хотите выйти? Все изменения будут потеряны
						</p>
						<div
							style={{
								display: 'flex',
								gap: '12px',
							}}
						>
							<button
								onClick={cancelExit}
								style={{
									flex: 1,
									backgroundColor: '#3a3a3a',
									border: 'none',
									borderRadius: '24px',
									padding: '14px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: '#FCF9F7',
									cursor: 'pointer',
									fontWeight: 600,
								}}
							>
								Отмена
							</button>
							<button
								onClick={confirmExit}
								style={{
									flex: 1,
									backgroundColor: '#F23318',
									border: 'none',
									borderRadius: '24px',
									padding: '14px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: '#FCF9F7',
									cursor: 'pointer',
									fontWeight: 600,
								}}
							>
								Выйти
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default function CreateResumePage() {
	return (
		<Suspense fallback={<MatchLoader />}>
			<CreateResumeContent />
		</Suspense>
	)
}

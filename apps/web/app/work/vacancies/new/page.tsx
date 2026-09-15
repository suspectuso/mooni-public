'use client'

import MatchLoader from '@/components/MatchLoader'
import Toast from '@/components/Toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function CreateVacancyContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const editId = searchParams.get('edit')
	const [isEditing, setIsEditing] = useState(false)
	const [loading, setLoading] = useState(!!editId)
	const [hasChanges, setHasChanges] = useState(false)
	const [initialData, setInitialData] = useState<any>(null)
	const [showExitModal, setShowExitModal] = useState(false)

	const [position, setPosition] = useState('')
	const [description, setDescription] = useState('')
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [selectedValues, setSelectedValues] = useState<string[]>([])
	const [salaryMin, setSalaryMin] = useState('')
	const [salaryMax, setSalaryMax] = useState('')
	const [showSkillsDropdown, setShowSkillsDropdown] = useState(false)
	const [toast, setToast] = useState<{
		message: string
		type: 'success' | 'error'
	} | null>(null)

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
				}

				const valuesRes = await fetch(`${API_URL}/work/values`)
				if (valuesRes.ok) {
					const valuesData = await valuesRes.json()
					setValues(valuesData)
				}

				// Load vacancy data if editing
				if (editId) {
					setIsEditing(true)
					const tg = (window as any).Telegram?.WebApp
					let telegramId = tg?.initDataUnsafe?.user?.id?.toString()
					if (!telegramId || telegramId === 'undefined') {
						telegramId = 'test_user'
					}

					const vacancyRes = await fetch(
						`${API_URL}/work/vacancies/${editId}`,
						{
							headers: {
								'x-telegram-user-id': telegramId,
							},
						},
					)

					if (vacancyRes.ok) {
						const vacancyData = await vacancyRes.json()

						// Fill form with existing data
						setPosition(vacancyData.position || '')
						setDescription(vacancyData.description || '')

						// Set selected skills
						if (vacancyData.skills && vacancyData.skills.length > 0) {
							const skillIds = vacancyData.skills.map((s: any) => s.skillId)
							setSelectedSkills(skillIds)
						}

						// Set selected values
						if (vacancyData.values && vacancyData.values.length > 0) {
							const valueIds = vacancyData.values.map((v: any) => v.valueId)
							setSelectedValues(valueIds)
						}

						// Set salary with formatting
						if (vacancyData.salaryMin) {
							const formatted = formatSalary(vacancyData.salaryMin.toString())
							setSalaryMin(formatted)
						}
						if (vacancyData.salaryMax) {
							const formatted = formatSalary(vacancyData.salaryMax.toString())
							setSalaryMax(formatted)
						}

						// Store initial data for change detection
						setInitialData(vacancyData)
					} else {
						console.error('Failed to load vacancy:', await vacancyRes.text())
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
			position,
			description,
			selectedSkills: selectedSkills.sort().join(','),
			selectedValues: selectedValues.sort().join(','),
			salaryMin,
			salaryMax,
		}

		const initial = {
			position: initialData.position || '',
			description: initialData.description || '',
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
		}

		const changed = JSON.stringify(currentData) !== JSON.stringify(initial)
		setHasChanges(changed)
	}, [
		position,
		description,
		selectedSkills,
		selectedValues,
		salaryMin,
		salaryMax,
		initialData,
	])

	const toggleSkill = (skillId: string) => {
		if (selectedSkills.includes(skillId)) {
			setSelectedSkills(selectedSkills.filter(s => s !== skillId))
		} else if (selectedSkills.length < 5) {
			setSelectedSkills([...selectedSkills, skillId])
		}
	}

	const toggleCategory = (categoryId: string) => {
		const newExpanded = new Set(expandedCategories)
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId)
		} else {
			newExpanded.add(categoryId)
		}
		setExpandedCategories(newExpanded)
	}

	const toggleValue = (valueId: string) => {
		if (selectedValues.includes(valueId)) {
			setSelectedValues(selectedValues.filter(v => v !== valueId))
		} else if (selectedValues.length < 5) {
			setSelectedValues([...selectedValues, valueId])
		}
	}

	const handleSubmit = async () => {
		if (!position || !description) {
			setToast({
				message: 'Пожалуйста, заполните обязательные поля',
				type: 'error',
			})
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
				? `${API_URL}/work/vacancies/${editId}`
				: `${API_URL}/work/vacancies`
			const method = isEditing ? 'PATCH' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'x-telegram-user-id': tgUser.id.toString(),
				},
				body: JSON.stringify({
					position,
					description,
					salaryMin: salaryMin ? parseInt(salaryMin.replace(/\D/g, '')) : null,
					salaryMax: salaryMax ? parseInt(salaryMax.replace(/\D/g, '')) : null,
					skillIds: selectedSkills,
					valueIds: selectedValues,
				}),
			})

			if (response.ok) {
				setToast({
					message: isEditing
						? 'Вакансия успешно обновлена!'
						: 'Вакансия успешно создана!',
					type: 'success',
				})
				// Switch to company mode after creating vacancy
				if (!isEditing) {
					localStorage.setItem('workMode', 'company')
					window.dispatchEvent(
						new CustomEvent('modeChange', { detail: 'company' }),
					)
				}
				// Trigger reload event for profile page
				window.dispatchEvent(new CustomEvent('reloadWorkProfile'))
				setTimeout(() => router.push('/work/profile'), 1500)
			} else {
				const error = await response.json()
				setToast({
					message: error.message || 'Не удалось создать вакансию',
					type: 'error',
				})
			}
		} catch (error) {
			console.error('Error creating vacancy:', error)
			setToast({ message: 'Ошибка при создании вакансии', type: 'error' })
		} finally {
			setIsSubmitting(false)
		}
	}

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
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			<div
				style={{
					backgroundColor: '#272727',
					borderRadius: '24px',
					padding: '24px',
					maxWidth: '480px',
					margin: '0 auto',
					maxHeight: 'calc(100vh - 40px)',
					overflowY: 'auto',
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
						{isEditing ? 'Редактировать вакансию' : 'Создать вакансию'}
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

				{/* Description */}
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
						Описание вакансии *
					</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder='Что входит в обязанности, требования к кандидату'
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
						}}
					/>
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
						onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
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
										onClick={() => toggleCategory(category.id)}
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
													onClick={() => toggleSkill(skill.id)}
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
						onClick={() => setShowValuesDropdown(!showValuesDropdown)}
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
										onClick={() => toggleValue(value.id)}
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
							Зарплата от
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
							Зарплата до
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
						backgroundColor: isSubmitting ? '#3a3a3a' : '#65FFF7',
						border: 'none',
						borderRadius: '24px',
						padding: '18px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '18px',
						color: isSubmitting ? 'rgba(252, 249, 247, 0.5)' : '#121212',
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
							: 'Создать вакансию'}
				</button>
			</div>

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

export default function CreateVacancyPage() {
	return (
		<Suspense fallback={<MatchLoader />}>
			<CreateVacancyContent />
		</Suspense>
	)
}

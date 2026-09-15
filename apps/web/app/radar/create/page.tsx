'use client'

import FounderSearchModal from '@/components/radar/FounderSearchModal'
import FoundersList from '@/components/radar/FoundersList'
import ImageUploadSection from '@/components/radar/ImageUploadSection'
import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import VacancySelectionModal from '@/components/work/VacancySelectionModal'
import { convertToWebP, uploadAvatar, uploadPhotos } from '@/lib/imageUtils'
import { useEffect, useState } from 'react'

interface Category {
	id: string
	name: string
}

interface Tag {
	id: string
	name: string
}


interface SelectedVacancy {
	id: string
	position: string
}

interface Founder {
	id: string
	username: string
	avatarUrl: string | null
}

export default function CreateProjectPage() {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [projectUrl, setProjectUrl] = useState('')
	const [stage, setStage] = useState('Идея')
	const [needsInvestment, setNeedsInvestment] = useState(false)
	const [investmentMin, setInvestmentMin] = useState('')
	const [investmentMax, setInvestmentMax] = useState('')
	const [investmentPurpose, setInvestmentPurpose] = useState('')
	const [investorShare, setInvestorShare] = useState('')
	const [needsEmployees, setNeedsEmployees] = useState(false)
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [photos, setPhotos] = useState<File[]>([])
	const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [tags, setTags] = useState<Tag[]>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [linkedVacancies, setLinkedVacancies] = useState<SelectedVacancy[]>([])
	const [showVacancyModal, setShowVacancyModal] = useState(false)
	const [founders, setFounders] = useState<Founder[]>([])
	const [showFounderModal, setShowFounderModal] = useState(false)
	const [founderSearch, setFounderSearch] = useState('')
	const [searchResults, setSearchResults] = useState<Founder[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { window.location.href = '/radar' }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		fetchFiltersData()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	const fetchFiltersData = async () => {
		try {
			const [categoriesRes, tagsRes] = await Promise.all([
				fetch('/api/radar/categories'),
				fetch('/api/radar/tags'),
			])

			if (categoriesRes.ok) {
				const categoriesData = await categoriesRes.json()
				setCategories(categoriesData)
			}

			if (tagsRes.ok) {
				const tagsData = await tagsRes.json()
				setTags(tagsData)
			}
		} catch (error) {
			console.error('Error fetching filters:', error)
		}
	}

	const handleVacancySelect = (vacancies: SelectedVacancy[]) => {
		setLinkedVacancies(vacancies)
	}

	const removeVacancy = (vacancyId: string) => {
		setLinkedVacancies(linkedVacancies.filter(v => v.id !== vacancyId))
	}

	const searchFounders = async (query: string) => {
		if (!query.trim()) {
			setSearchResults([])
			return
		}

		setSearchLoading(true)
		try {
			const response = await fetch(
				`/api/users/search?query=${encodeURIComponent(query)}`,
			)
			if (response.ok) {
				const users = await response.json()
				setSearchResults(users)
			}
		} catch (error) {
			console.error('Error searching founders:', error)
		} finally {
			setSearchLoading(false)
		}
	}

	const addFounder = (founder: Founder) => {
		if (!founders.find(f => f.id === founder.id)) {
			setFounders([...founders, founder])
		}
		setShowFounderModal(false)
		setFounderSearch('')
		setSearchResults([])
	}

	const removeFounder = (founderId: string) => {
		setFounders(founders.filter(f => f.id !== founderId))
	}

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			try {
				// Конвертируем в WebP с 80% качеством
				const webpFile = await convertToWebP(file, 0.8)
				setAvatarFile(webpFile)

				// Создаем превью
				const reader = new FileReader()
				reader.onloadend = () => {
					setAvatarPreview(reader.result as string)
				}
				reader.readAsDataURL(webpFile)
			} catch (error) {
				console.error('Error converting avatar:', error)
				alert('Ошибка при обработке изображения')
			}
		}
	}

	const handlePhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (photos.length + files.length > 5) {
			alert('Максимум 5 фотографий')
			return
		}

		try {
			// Конвертируем все файлы в WebP с 80% качеством
			const webpFiles = await Promise.all(
				files.map(file => convertToWebP(file, 0.8)),
			)
			setPhotos([...photos, ...webpFiles])

			// Создаем превью
			const newPreviews: string[] = []
			for (const file of webpFiles) {
				const reader = new FileReader()
				const preview = await new Promise<string>((resolve, reject) => {
					reader.onloadend = () => resolve(reader.result as string)
					reader.onerror = reject
					reader.readAsDataURL(file)
				})
				newPreviews.push(preview)
			}
			setPhotoPreviews([...photoPreviews, ...newPreviews])
		} catch (error) {
			console.error('Error converting photos:', error)
			alert('Ошибка при обработке изображений')
		}
	}

	const removePhoto = (index: number) => {
		setPhotos(photos.filter((_, i) => i !== index))
		setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
	}

	const handleSubmit = async () => {
		if (!name.trim()) {
			alert('Введите название проекта')
			return
		}

		if (!description.trim()) {
			alert('Введите описание проекта')
			return
		}

		if (selectedCategories.length === 0) {
			alert('Выберите хотя бы одну категорию')
			return
		}

		setLoading(true)

		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			// Загружаем аватар если есть
			let avatarPath: string | null = null
			if (avatarFile) {
				avatarPath = await uploadAvatar(avatarFile)
			}

			// Загружаем фотографии если есть
			const photoPaths = photos.length > 0 ? await uploadPhotos(photos) : []

			// Создаем проект
			const projectData = {
				name,
				description,
				avatarPath,
				projectUrl: projectUrl || null,
				stage,
				needsInvestment,
				investmentMin:
					needsInvestment && investmentMin
						? parseInt(investmentMin.replace(/[^0-9]/g, ''))
						: null,
				investmentMax:
					needsInvestment && investmentMax
						? parseInt(investmentMax.replace(/[^0-9]/g, ''))
						: null,
				investmentPurpose: needsInvestment ? investmentPurpose : null,
				investorShare:
					needsInvestment && investorShare ? parseInt(investorShare) : null,
				needsEmployees,
				linkedVacancyId:
					needsEmployees && linkedVacancies[0]?.id
						? linkedVacancies[0].id
						: null,
				categories: selectedCategories,
				tags: selectedTags,
				photos: photoPaths,
			}

			const response = await fetch('/api/radar/projects', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-telegram-user-id': userId.toString(),
				},
				body: JSON.stringify(projectData),
			})

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				window.location.href = '/radar'
			} else {
				throw new Error('Failed to create project')
			}
		} catch (error) {
			console.error('Error creating project:', error)
			alert('Ошибка при создании проекта')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#1E1B1A',
				paddingBottom: '100px',
			}}
		>
			<RadarHeader />
			<div style={{ padding: '20px' }}>
				<h1
					style={{
						fontFamily: 'Zen Kaku Gothic New, sans-serif',
						fontWeight: 900,
						fontSize: '24px',
						color: '#FCF9F7',
						marginBottom: '24px',
					}}
				>
					Создать проект
				</h1>

				{/* Название */}
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
						Название
					</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='Введите название'
						style={{
							width: '100%',
							padding: '14px',
							backgroundColor: '#2A2725',
							borderRadius: '28px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							outline: 'none',
						}}
					/>
				</div>

				{/* Загрузка изображений */}
				<ImageUploadSection
					avatarPreview={avatarPreview}
					onAvatarChange={handleAvatarChange}
					photoPreviews={photoPreviews}
					onPhotosChange={handlePhotosChange}
					onRemovePhoto={removePhoto}
				/>

				{/* Категория (до 2-х) */}
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
						Категория (до 2-х)
					</label>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						{categories.map(category => (
							<button
								key={category.id}
								onClick={() => {
									if (selectedCategories.includes(category.id)) {
										setSelectedCategories(
											selectedCategories.filter(id => id !== category.id),
										)
									} else if (selectedCategories.length < 2) {
										setSelectedCategories([...selectedCategories, category.id])
									}
								}}
								style={{
									padding: '10px 18px',
									backgroundColor: selectedCategories.includes(category.id)
										? '#8CFF65'
										: '#2A2725',
									border: 'none',
									borderRadius: '20px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									fontWeight: 600,
									color: selectedCategories.includes(category.id)
										? '#1E1B1A'
										: '#FCF9F7',
									cursor: 'pointer',
								}}
							>
								{category.name}
							</button>
						))}
					</div>
				</div>

				{/* Задачи */}
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
						Задачи (до 5-и)
					</label>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						{tags.map(tag => (
							<button
								key={tag.id}
								onClick={() => {
									if (selectedTags.includes(tag.id)) {
										setSelectedTags(selectedTags.filter(id => id !== tag.id))
									} else if (selectedTags.length < 5) {
										setSelectedTags([...selectedTags, tag.id])
									}
								}}
								style={{
									padding: '10px 18px',
									backgroundColor: selectedTags.includes(tag.id)
										? '#8CFF65'
										: '#2A2725',
									border: 'none',
									borderRadius: '20px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									fontWeight: 600,
									color: selectedTags.includes(tag.id) ? '#1E1B1A' : '#FCF9F7',
									cursor: 'pointer',
								}}
							>
								{tag.name}
							</button>
						))}
					</div>
				</div>

				{/* Проекты... */}
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
						Проекты...
					</label>
					<div style={{ display: 'flex', gap: '8px' }}>
						{['Стартапы', 'Устоявшиеся'].map(stageOption => (
							<button
								key={stageOption}
								onClick={() =>
									setStage(
										stageOption === 'Стартапы' ? 'Идея' : 'Масштабирование',
									)
								}
								style={{
									padding: '10px 18px',
									backgroundColor:
										(stageOption === 'Стартапы' &&
											['Идея', 'MVP', 'Рост'].includes(stage)) ||
										(stageOption === 'Устоявшиеся' &&
											stage === 'Масштабирование')
											? '#8CFF65'
											: '#2A2725',
									border: 'none',
									borderRadius: '20px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									fontWeight: 600,
									color:
										(stageOption === 'Стартапы' &&
											['Идея', 'MVP', 'Рост'].includes(stage)) ||
										(stageOption === 'Устоявшиеся' &&
											stage === 'Масштабирование')
											? '#1E1B1A'
											: '#FCF9F7',
									cursor: 'pointer',
								}}
							>
								{stageOption}
							</button>
						))}
					</div>
				</div>

				{/* Описание */}
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
						Описание
					</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder='Расскажите о проекте...'
						rows={5}
						style={{
							width: '100%',
							padding: '14px',
							backgroundColor: '#2A2725',
							border: '1px solid #878684',
							borderRadius: '28px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							outline: 'none',
							resize: 'vertical',
						}}
					/>
				</div>

				{/* Основатели */}
				<FoundersList
					founders={founders}
					onRemove={removeFounder}
					onAdd={() => setShowFounderModal(true)}
				/>

				{/* Требуются инвестиции */}
				<div style={{ marginBottom: '20px' }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							marginBottom: '12px',
						}}
					>
						<div
							style={{
								width: '40px',
								height: '40px',
								borderRadius: '10px',
								backgroundColor: needsInvestment ? '#8CFF65' : '#272727',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'all 0.2s',
								cursor: 'pointer',
							}}
							onClick={() => {
								const tg = (window as any).Telegram?.WebApp
								if (tg) tg.HapticFeedback.impactOccurred('light')
								setNeedsInvestment(!needsInvestment)
								if (!needsInvestment === false) {
									setInvestmentMin('')
									setInvestmentMax('')
									setInvestmentPurpose('')
								}
							}}
						>
							{needsInvestment && (
								<svg
									width='20'
									height='16'
									viewBox='0 0 20 16'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M1 8L7 14L19 2'
										stroke='#1E1B1A'
										strokeWidth='3'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							)}
						</div>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								fontWeight: 600,
								color: '#FCF9F7',
							}}
						>
							Требуются инвестиции
						</label>
					</div>

					{needsInvestment && (
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
						>
							<div style={{ display: 'flex', gap: '12px' }}>
								<div style={{ flex: 1 }}>
									<label
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
											display: 'block',
											marginBottom: '8px',
										}}
									>
										От
									</label>
									<input
										type='text'
										inputMode='numeric'
										value={investmentMin}
										onChange={e => {
											const value = e.target.value.replace(/[^0-9]/g, '')
											setInvestmentMin(value)
										}}
										placeholder='1000000'
										style={{
											width: '100%',
											padding: '14px',
											backgroundColor: '#2A2725',
											border: '1px solid rgba(140, 255, 101, 0.2)',
											borderRadius: '28px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											color: '#FCF9F7',
											outline: 'none',
										}}
									/>
								</div>
								<div style={{ flex: 1 }}>
									<label
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
											display: 'block',
											marginBottom: '8px',
										}}
									>
										До
									</label>
									<input
										type='text'
										inputMode='numeric'
										value={investmentMax}
										onChange={e => {
											const value = e.target.value.replace(/[^0-9]/g, '')
											setInvestmentMax(value)
										}}
										placeholder='15000000'
										style={{
											width: '100%',
											padding: '14px',
											backgroundColor: '#2A2725',
											border: '1px solid rgba(140, 255, 101, 0.2)',
											borderRadius: '28px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											color: '#FCF9F7',
											outline: 'none',
										}}
									/>
								</div>
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
									На что потребуются инвестиции
								</label>
								<input
									type='text'
									value={investmentPurpose}
									onChange={e => setInvestmentPurpose(e.target.value)}
									placeholder='На маркетинг, рекламу, софт и т.д'
									style={{
										width: '100%',
										padding: '14px',
										backgroundColor: '#2A2725',
										border: '1px solid rgba(140, 255, 101, 0.2)',
										borderRadius: '28px',
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
									Предварительная доля инвестора (%)
								</label>
								<input
									type='text'
									inputMode='numeric'
									value={investorShare}
									onChange={e => {
										const value = e.target.value.replace(/[^0-9]/g, '')
										const numValue = parseInt(value) || 0
										if (numValue <= 99 || value === '') {
											setInvestorShare(value)
										}
									}}
									placeholder='10'
									style={{
										width: '100%',
										padding: '14px',
										backgroundColor: '#2A2725',
										border: '1px solid rgba(140, 255, 101, 0.2)',
										borderRadius: '28px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										outline: 'none',
									}}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Требуются сотрудники */}
				<div style={{ marginBottom: '20px' }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							marginBottom: '12px',
						}}
					>
						<div
							style={{
								width: '40px',
								height: '40px',
								borderRadius: '10px',
								backgroundColor: needsEmployees ? '#8CFF65' : '#272727',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'all 0.2s',
								cursor: 'pointer',
							}}
							onClick={() => {
								const tg = (window as any).Telegram?.WebApp
								if (tg) tg.HapticFeedback.impactOccurred('light')
								setNeedsEmployees(!needsEmployees)
							}}
						>
							{needsEmployees && (
								<svg
									width='20'
									height='16'
									viewBox='0 0 20 16'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M1 8L7 14L19 2'
										stroke='#1E1B1A'
										strokeWidth='3'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							)}
						</div>
						<label
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								fontWeight: 600,
								color: '#FCF9F7',
							}}
						>
							Требуются сотрудники
						</label>
					</div>

					{needsEmployees && (
						<div>
							{linkedVacancies.length > 0 && (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '12px',
										marginBottom: '12px',
									}}
								>
									{linkedVacancies.map(vacancy => (
										<div
											key={vacancy.id}
											style={{
												background: '#3A3735',
												borderRadius: '28px',
												padding: '16px 20px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
											}}
										>
											<span
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '16px',
													color: '#FCF9F7',
													fontWeight: 600,
													flex: 1,
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{vacancy.position}
											</span>
											<button
												onClick={() => removeVacancy(vacancy.id)}
												style={{
													background: 'none',
													border: 'none',
													color: 'rgba(252, 249, 247, 0.5)',
													cursor: 'pointer',
													padding: '4px',
													fontSize: '20px',
													lineHeight: 1,
												}}
											>
												×
											</button>
										</div>
									))}
								</div>
							)}

							{linkedVacancies.length < 3 && (
								<div
									onClick={() => {
										const tg = (window as any).Telegram?.WebApp
										if (tg) tg.HapticFeedback.impactOccurred('medium')
										setShowVacancyModal(true)
									}}
									style={{
										background:
											'linear-gradient(90deg, #002EE7 0%, #65FFF7 100%)',
										borderRadius: '28px',
										padding: '16px 20px',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '10px',
									}}
								>
									<img
										src='/link_btn.webp'
										alt='Link'
										style={{ width: '32px', height: '32px', flexShrink: 0 }}
									/>
									<span
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											color: '#FCF9F7',
											fontWeight: 600,
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											maxWidth: 'calc(100% - 42px)',
										}}
									>
										{linkedVacancies.length > 0
											? '+ Добавить вакансию'
											: 'Привязать вакансию/резюме'}
									</span>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Ссылка на проект */}
				<div style={{ marginBottom: '32px' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '8px',
						}}
					>
						Ссылка на проект
					</label>
					<input
						type='url'
						value={projectUrl}
						onChange={e => setProjectUrl(e.target.value)}
						placeholder='Ссылка URL на сайт продукта'
						style={{
							width: '100%',
							padding: '14px',
							backgroundColor: '#2A2725',
							border: '1px solid rgba(140, 255, 101, 0.2)',
							borderRadius: '12px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							outline: 'none',
						}}
					/>
				</div>

				{/* Кнопка создать */}
				<button
					onClick={handleSubmit}
					disabled={loading}
					style={{
						width: '100%',
						padding: '16px',
						background: loading
							? '#666'
							: 'linear-gradient(135deg, #8CFF65 0%, #E3F040 100%)',
						border: 'none',
						borderRadius: '24px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						fontWeight: 600,
						color: '#1E1B1A',
						cursor: loading ? 'not-allowed' : 'pointer',
					}}
				>
					{loading ? 'Создание...' : 'Создать проект'}
				</button>
			</div>

			<RadarBottomNav />

			{/* Vacancy Selection Modal */}
			<VacancySelectionModal
				isOpen={showVacancyModal}
				onClose={() => setShowVacancyModal(false)}
				onSave={handleVacancySelect}
				selectedVacancies={linkedVacancies}
				maxSelection={3}
			/>

			{/* Founder Search Modal */}
			<FounderSearchModal
				isOpen={showFounderModal}
				onClose={() => setShowFounderModal(false)}
				searchQuery={founderSearch}
				onSearchChange={query => {
					setFounderSearch(query)
					searchFounders(query)
				}}
				searchResults={searchResults}
				searchLoading={searchLoading}
				onSelectFounder={addFounder}
			/>
		</div>
	)
}

'use client'

import FounderSearchModal from '@/components/radar/FounderSearchModal'
import FoundersList from '@/components/radar/FoundersList'
import ImageUploadSection from '@/components/radar/ImageUploadSection'
import VacancySelectionModal from '@/components/work/VacancySelectionModal'
import {
	convertToWebP,
	deleteFile,
	uploadAvatar,
	uploadPhotos,
} from '@/lib/imageUtils'
import { useState } from 'react'

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

interface ProjectFormProps {
	initialData?: {
		name: string
		description: string
		avatarPath: string | null
		projectUrl: string
		stage: string
		needsInvestment: boolean
		investmentMin: string
		investmentMax: string
		investmentPurpose: string
		investorShare: string
		needsEmployees: boolean
		selectedCategories: string[]
		selectedTags: string[]
		linkedVacancies: SelectedVacancy[]
		founders: Founder[]
		photos: string[]
	}
	categories: Category[]
	tags: Tag[]
	onSubmit: (data: any) => Promise<void>
	submitButtonText: string
	loading: boolean
}

export default function ProjectForm({
	initialData,
	categories,
	tags,
	onSubmit,
	submitButtonText,
	loading,
}: ProjectFormProps) {
	const [name, setName] = useState(initialData?.name || '')
	const [description, setDescription] = useState(initialData?.description || '')
	const [projectUrl, setProjectUrl] = useState(initialData?.projectUrl || '')
	const [stage, setStage] = useState(initialData?.stage || 'Идея')
	const [needsInvestment, setNeedsInvestment] = useState(
		initialData?.needsInvestment || false,
	)
	const [investmentMin, setInvestmentMin] = useState(
		initialData?.investmentMin || '',
	)
	const [investmentMax, setInvestmentMax] = useState(
		initialData?.investmentMax || '',
	)
	const [investmentPurpose, setInvestmentPurpose] = useState(
		initialData?.investmentPurpose || '',
	)
	const [investorShare, setInvestorShare] = useState(
		initialData?.investorShare || '',
	)
	const [needsEmployees, setNeedsEmployees] = useState(
		initialData?.needsEmployees || false,
	)
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		initialData?.avatarPath || null,
	)
	const [photos, setPhotos] = useState<File[]>([])
	const [photoPreviews, setPhotoPreviews] = useState<string[]>(
		initialData?.photos || [],
	)
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		initialData?.selectedCategories || [],
	)
	const [selectedTags, setSelectedTags] = useState<string[]>(
		initialData?.selectedTags || [],
	)
	const [linkedVacancies, setLinkedVacancies] = useState<SelectedVacancy[]>(
		initialData?.linkedVacancies || [],
	)
	const [showVacancyModal, setShowVacancyModal] = useState(false)
	const [founders, setFounders] = useState<Founder[]>(
		initialData?.founders || [],
	)
	const [showFounderModal, setShowFounderModal] = useState(false)
	const [founderSearch, setFounderSearch] = useState('')
	const [searchResults, setSearchResults] = useState<Founder[]>([])
	const [searchLoading, setSearchLoading] = useState(false)
	const [filesToDelete, setFilesToDelete] = useState<string[]>([])

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
				// Помечаем старую аватарку для удаления (но не удаляем сразу)
				if (avatarPreview && avatarPreview.startsWith('http')) {
					setFilesToDelete(prev => [...prev, avatarPreview])
				}

				const webpFile = await convertToWebP(file, 0.8)
				setAvatarFile(webpFile)

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
			const webpFiles = await Promise.all(
				files.map(file => convertToWebP(file, 0.8)),
			)
			setPhotos([...photos, ...webpFiles])

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
		// Помечаем фото для удаления (но не удаляем сразу)
		const photoToRemove = photoPreviews[index]
		if (photoToRemove && photoToRemove.startsWith('http')) {
			setFilesToDelete(prev => [...prev, photoToRemove])
		}

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

		try {
			let avatarPath: string | null = avatarPreview
			if (avatarFile) {
				avatarPath = await uploadAvatar(avatarFile)
			}

			const photoPaths =
				photos.length > 0
					? await uploadPhotos(photos)
					: photoPreviews.filter(p => p.startsWith('http'))

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
				linkedVacancyIds:
					needsEmployees && linkedVacancies.length > 0
						? linkedVacancies.map(v => v.id)
						: [],
				founderIds: founders.map(f => f.id),
				categories: selectedCategories,
				tags: selectedTags,
				photos: photoPaths,
			}

			await onSubmit(projectData)

			// Удаляем файлы только после успешного сохранения
			if (filesToDelete.length > 0) {
				await Promise.all(
					filesToDelete.map(fileUrl =>
						deleteFile(fileUrl).catch(err =>
							console.error('Error deleting file:', err),
						),
					),
				)
			}
		} catch (error) {
			console.error('Error submitting project:', error)
			alert('Ошибка при сохранении проекта')
		}
	}

	return (
		<div>
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
						border: 'none',
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
									(stageOption === 'Устоявшиеся' && stage === 'Масштабирование')
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
									(stageOption === 'Устоявшиеся' && stage === 'Масштабирование')
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

			{/* Кнопка сохранить */}
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
				{loading ? 'Сохранение...' : submitButtonText}
			</button>

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

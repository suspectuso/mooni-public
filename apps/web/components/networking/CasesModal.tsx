'use client'

import { useEffect, useState } from 'react'

interface Case {
	id: string
	photoPath: string
	title: string | null
	link: string | null
	sortOrder: number
}

interface CasesModalProps {
	isOpen: boolean
	cases: Case[]
	uploadingCase: number | null
	onClose: () => void
	onUpload: (
		e: React.ChangeEvent<HTMLInputElement>,
		sortOrder: number,
	) => Promise<string | void>
	onDelete: (caseId: string) => void
	onSaveCase: (caseId: string, title: string, link: string) => void
	onCaseCreated?: (caseId: string) => void
}

export default function CasesModal({
	isOpen,
	cases,
	uploadingCase,
	onClose,
	onUpload,
	onDelete,
	onSaveCase,
	onCaseCreated: _onCaseCreated,
}: CasesModalProps) {
	const [editingCase, setEditingCase] = useState<string | null>(null)
	const [caseTitle, setCaseTitle] = useState('')
	const [caseLink, setCaseLink] = useState('')
	const [pendingCaseId, setPendingCaseId] = useState<string | null>(null)

	// New states for new case creation flow
	const [newCaseFile, setNewCaseFile] = useState<File | null>(null)
	const [newCasePreview, setNewCasePreview] = useState<string | null>(null)
	const [newCaseSortOrder, setNewCaseSortOrder] = useState<number | null>(null)
	const [isCreatingNewCase, setIsCreatingNewCase] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	// Debug: log cases prop
	cases?.forEach((c, i) => {
		console.log(`Case ${i}:`, {
			id: c.id,
			hasId: !!c.id,
			idType: typeof c.id,
			title: c.title,
			sortOrder: c.sortOrder,
		})
	})

	// Автоматически открываем форму редактирования для нового кейса
	useEffect(() => {
		if (pendingCaseId && cases.length > 0) {
			const newCase = cases.find(c => c.id === pendingCaseId)
			if (newCase) {
				handleEditCase(newCase)
				setPendingCaseId(null)
			}
		}
	}, [cases, pendingCaseId])

	// Reset new case states when modal closes
	useEffect(() => {
		if (!isOpen) {
			setNewCaseFile(null)
			setNewCasePreview(null)
			setNewCaseSortOrder(null)
			setIsCreatingNewCase(false)
			setEditingCase(null)
			setCaseTitle('')
			setCaseLink('')
			setIsSaving(false)
		}
	}, [isOpen])

	if (!isOpen) return null

	const handleEditCase = (caseItem: Case) => {
		setEditingCase(caseItem.id)
		setCaseTitle(caseItem.title || '')
		setCaseLink(caseItem.link || '')
		setIsCreatingNewCase(false)
		setNewCaseFile(null)
		setNewCasePreview(null)
	}

	const handleFileSelect = (file: File, sortOrder: number) => {
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
				tg.HapticFeedback.notificationOccurred('error')
			} else {
				alert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, HEIC')
			}
			return
		}

		if (file.size > 10 * 1024 * 1024) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Файл слишком большой. Максимальный размер: 10MB')
				tg.HapticFeedback.notificationOccurred('error')
			} else {
				alert('Файл слишком большой. Максимальный размер: 10MB')
			}
			return
		}

		const reader = new FileReader()
		reader.onloadend = () => {
			setNewCasePreview(reader.result as string)
		}
		reader.readAsDataURL(file)

		// Store file and open edit form
		setNewCaseFile(file)
		setNewCaseSortOrder(sortOrder)
		setIsCreatingNewCase(true)
		setCaseTitle('')
		setCaseLink('')
	}

	const validateLink = (link: string): boolean => {
		if (!link || link.trim() === '') return true // Пустая ссылка допустима

		// Проверяем что ссылка начинается с http:// или https://
		if (!link.startsWith('http://') && !link.startsWith('https://')) {
			return false
		}

		// Проверяем что есть домен с точкой (например .com, .ru, .io и т.д.)
		const urlPattern = /^https?:\/\/[^\s]+\.[^\s]+$/
		return urlPattern.test(link)
	}

	const handleSave = async () => {

		// Валидация ссылки
		if (caseLink && !validateLink(caseLink)) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert(
					'Неверный формат ссылки. Ссылка должна начинаться с https:// и содержать домен (например, https://example.com)',
				)
				tg.HapticFeedback.notificationOccurred('error')
			} else {
				alert(
					'Неверный формат ссылки. Ссылка должна начинаться с https:// и содержать домен (например, https://example.com)',
				)
			}
			return
		}

		setIsSaving(true)

		// If creating new case, upload file first
		if (isCreatingNewCase && newCaseFile && newCaseSortOrder !== null) {
			const fakeInput = document.createElement('input')
			fakeInput.type = 'file'
			const dataTransfer = new DataTransfer()
			dataTransfer.items.add(newCaseFile)
			fakeInput.files = dataTransfer.files

			const fakeEvent = {
				target: fakeInput,
				currentTarget: fakeInput,
			} as React.ChangeEvent<HTMLInputElement>

			try {
				const newCaseId = await onUpload(fakeEvent, newCaseSortOrder)

				if (newCaseId) {
					// Now save title and link
					onSaveCase(newCaseId, caseTitle, caseLink)
				}

				// Reset states
				setIsCreatingNewCase(false)
				setNewCaseFile(null)
				setNewCasePreview(null)
				setNewCaseSortOrder(null)
				setCaseTitle('')
				setCaseLink('')
			} catch (error) {
				console.error('Error uploading new case:', error)
				const tg = (window as any).Telegram?.WebApp
				if (tg) {
					tg.showAlert('Ошибка при загрузке кейса')
					tg.HapticFeedback.notificationOccurred('error')
				}
			} finally {
				setIsSaving(false)
			}
		} else if (editingCase) {
			// Editing existing case
			try {
				onSaveCase(editingCase, caseTitle, caseLink)
				setEditingCase(null)
				setCaseTitle('')
				setCaseLink('')
			} finally {
				setIsSaving(false)
			}
		}
	}

	const handleCancel = () => {
		if (isCreatingNewCase) {
			setIsCreatingNewCase(false)
			setNewCaseFile(null)
			setNewCasePreview(null)
			setNewCaseSortOrder(null)
		} else {
			setEditingCase(null)
		}
		setCaseTitle('')
		setCaseLink('')
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 1000,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Блюр сверху 10vh */}
			<div
				onClick={onClose}
				style={{
					height: '10vh',
					backdropFilter: 'blur(10px)',
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
				}}
			/>

			{/* Модалка 90vh */}
			<div
				onClick={e => e.stopPropagation()}
				style={{
					height: '90vh',
					backgroundColor: '#272727',
					borderRadius: '28px 28px 0 0',
					padding: '24px',
					overflowY: 'auto',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<h2
					style={{
						color: '#FCF9F7',
						fontFamily: 'Oks, sans-serif',
						fontSize: '24px',
						marginBottom: '8px',
						textAlign: 'center',
					}}
				>
					Кейсы
				</h2>
				<p
					style={{
						color: 'rgba(252, 249, 247, 0.65)',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						marginBottom: '24px',
						textAlign: 'center',
					}}
				>
					Добавить до 3-х кейсов
				</p>

				{editingCase || isCreatingNewCase ? (
					// Форма редактирования кейса
					<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
						{/* Photo preview for new case */}
						{isCreatingNewCase && newCasePreview && (
							<div style={{ marginBottom: '16px', textAlign: 'center' }}>
								<div
									style={{
										width: '120px',
										height: '120px',
										borderRadius: '50%',
										overflow: 'hidden',
										margin: '0 auto',
										backgroundColor: '#3a3a3a',
									}}
								>
									<img
										src={newCasePreview}
										alt='Preview'
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
									/>
								</div>
							</div>
						)}

						<div style={{ marginBottom: '16px' }}>
							<label
								style={{
									display: 'block',
									color: '#FCF9F7',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									marginBottom: '8px',
								}}
							>
								Название проекта
							</label>
							<input
								type='text'
								value={caseTitle}
								onChange={e => setCaseTitle(e.target.value)}
								placeholder='Введите название'
								style={{
									width: '100%',
									backgroundColor: '#3a3a3a',
									border: 'none',
									borderRadius: '16px',
									padding: '12px 16px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '15px',
									color: 'rgba(252, 249, 247, 0.7)',
									outline: 'none',
								}}
							/>
						</div>

						<div style={{ marginBottom: '24px' }}>
							<label
								style={{
									display: 'block',
									color: '#FCF9F7',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									marginBottom: '8px',
								}}
							>
								Ссылка на проект
							</label>
							<input
								type='text'
								value={caseLink}
								onChange={e => setCaseLink(e.target.value)}
								placeholder='Введите ссылку'
								style={{
									width: '100%',
									backgroundColor: '#3a3a3a',
									border: 'none',
									borderRadius: '16px',
									padding: '12px 16px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '15px',
									color: 'rgba(252, 249, 247, 0.7)',
									outline: 'none',
								}}
							/>
						</div>

						<div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
							<button
								onClick={handleCancel}
								disabled={isSaving}
								style={{
									flex: 1,
									backgroundColor: 'rgba(252, 249, 247, 0.1)',
									border: 'none',
									borderRadius: '28px',
									padding: '16px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '18px',
									color: '#FCF9F7',
									cursor: isSaving ? 'not-allowed' : 'pointer',
									fontWeight: 600,
									opacity: isSaving ? 0.5 : 1,
								}}
							>
								Отмена
							</button>
							<button
								onClick={handleSave}
								disabled={
									isSaving || (isCreatingNewCase && (!caseTitle || !caseLink))
								}
								style={{
									flex: 1,
									backgroundColor: '#65FFF7',
									border: 'none',
									borderRadius: '28px',
									padding: '16px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '18px',
									color: '#1D1D1B',
									cursor:
										isSaving || (isCreatingNewCase && (!caseTitle || !caseLink))
											? 'not-allowed'
											: 'pointer',
									fontWeight: 600,
									opacity:
										isSaving || (isCreatingNewCase && (!caseTitle || !caseLink))
											? 0.5
											: 1,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px',
								}}
							>
								{isSaving ? (
									<>
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
										<span>Загрузка...</span>
									</>
								) : (
									'Сохранить'
								)}
							</button>
						</div>
					</div>
				) : (
					// Список кейсов
					<>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '12px',
								marginBottom: '16px',
								flex: 1,
							}}
						>
							{[0, 1, 2].map(index => {
								const existingCase = cases.find(c => c.sortOrder === index)
								return (
									<div
										key={index}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '12px',
											backgroundColor: '#3a3a3a',
											borderRadius: '20px',
											padding: '12px',
										}}
									>
										{existingCase ? (
											<>
												<div
													style={{
														width: '48px',
														height: '48px',
														borderRadius: '50%',
														overflow: 'hidden',
														flexShrink: 0,
														backgroundColor: '#272727',
													}}
												>
													{existingCase.photoPath && (
														<img
															src={existingCase.photoPath}
															alt='Case'
															style={{
																width: '100%',
																height: '100%',
																objectFit: 'cover',
															}}
														/>
													)}
												</div>
												<span
													style={{
														flex: 1,
														color: '#FCF9F7',
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '15px',
														fontWeight: 600,
													}}
												>
													{existingCase.title || `Кейс ${index + 1}`}
												</span>
												<button
													onClick={() => handleEditCase(existingCase)}
													style={{
														width: '36px',
														height: '36px',
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
														width='17'
														height='17'
														viewBox='0 0 17 17'
														fill='none'
														xmlns='http://www.w3.org/2000/svg'
													>
														<path
															d='M8.85811 4.30379L0.75 12.4119V16.0605H4.39865L12.5068 7.95244M8.85811 4.30379L12.5068 7.95244M8.85811 4.30379L12.1014 1.06055L15.75 4.7092L12.5068 7.95244'
															stroke='#878684'
															strokeWidth='1.5'
														/>
													</svg>
												</button>
												<button
													onClick={() => {
														if (!existingCase.id) {
															console.error(
																'Case ID is undefined!',
																existingCase,
															)
														}
														onDelete(existingCase.id)
													}}
													style={{
														width: '36px',
														height: '36px',
														borderRadius: '50%',
														backgroundColor: 'rgba(242, 51, 24, 0.2)',
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
														<path
															d='M1 1L13 13M1 13L13 1'
															stroke='#F23318'
															strokeWidth='2'
															strokeLinecap='round'
														/>
													</svg>
												</button>
											</>
										) : (
											<>
												<label
													htmlFor={`modal-case-upload-${index}`}
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '12px',
														flex: 1,
														cursor:
															uploadingCase === index
																? 'not-allowed'
																: 'pointer',
													}}
												>
													<div
														style={{
															width: '48px',
															height: '48px',
															borderRadius: '50%',
															backgroundColor: 'rgba(252, 249, 247, 0.1)',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															flexShrink: 0,
														}}
													>
														{uploadingCase === index ? (
															<div
																style={{
																	width: '24px',
																	height: '24px',
																	border: '2px solid #FCF9F7',
																	borderTopColor: 'transparent',
																	borderRadius: '50%',
																	animation: 'spin 1s linear infinite',
																}}
															/>
														) : (
															<svg
																width='24'
																height='24'
																viewBox='0 0 24 24'
																fill='none'
																xmlns='http://www.w3.org/2000/svg'
															>
																<path
																	d='M12 5V19M5 12H19'
																	stroke='#FCF9F7'
																	strokeOpacity='0.5'
																	strokeWidth='2'
																	strokeLinecap='round'
																/>
															</svg>
														)}
													</div>
													<span
														style={{
															color: 'rgba(252, 249, 247, 0.5)',
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '15px',
															fontWeight: 600,
														}}
													>
														Добавить
													</span>
												</label>
												<input
													id={`modal-case-upload-${index}`}
													type='file'
													accept='.jpg,.jpeg,.png,.webp,.heic,.heif'
													onChange={e => {
														const file = e.target.files?.[0]
														if (file) {
															handleFileSelect(file, index)
														}
														e.target.value = '' // Reset input
													}}
													disabled={uploadingCase === index}
													style={{ display: 'none' }}
												/>
											</>
										)}
									</div>
								)
							})}
						</div>

						<button
							onClick={() => {
								const tg = (window as any).Telegram?.WebApp
								if (tg) tg.HapticFeedback.notificationOccurred('success')
								onClose()
							}}
							style={{
								width: '100%',
								backgroundColor: '#65FFF7',
								border: 'none',
								borderRadius: '28px',
								padding: '16px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#1D1D1B',
								cursor: 'pointer',
								fontWeight: 600,
							}}
						>
							Закрыть
						</button>
					</>
				)}
			</div>

			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	)
}

'use client'

import { useEffect, useState } from 'react'

interface Vacancy {
	id: string
	position: string
	description: string
	salaryMin: number | null
	salaryMax: number | null
	workFormat: string
	skills: Array<{ skill: { name: string } }>
}

interface SelectedVacancy {
	id: string
	position: string
}

interface VacancySelectionModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (vacancies: SelectedVacancy[]) => void
	selectedVacancies: SelectedVacancy[]
	maxSelection?: number
}

export default function VacancySelectionModal({
	isOpen,
	onClose,
	onSave,
	selectedVacancies,
	maxSelection = 3,
}: VacancySelectionModalProps) {
	const [vacancies, setVacancies] = useState<Vacancy[]>([])
	const [selected, setSelected] = useState<SelectedVacancy[]>(selectedVacancies)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (isOpen) {
			fetchVacancies()
			setSelected(selectedVacancies)
		}
	}, [isOpen, selectedVacancies])

	const fetchVacancies = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			const response = await fetch(`/api/work/vacancies/my`, {
				headers: {
					'x-telegram-user-id': userId,
				},
			})

			const data = await response.json()
			setVacancies(data)
		} catch (error) {
			console.error('Error fetching vacancies:', error)
		} finally {
			setLoading(false)
		}
	}

	const toggleVacancy = (vacancy: Vacancy) => {
		const isSelected = selected.some(v => v.id === vacancy.id)

		if (isSelected) {
			setSelected(selected.filter(v => v.id !== vacancy.id))
		} else if (selected.length < maxSelection) {
			setSelected([...selected, { id: vacancy.id, position: vacancy.position }])
		}
	}

	const handleSave = () => {
		onSave(selected)
		onClose()
	}

	if (!isOpen) return null

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				backdropFilter: 'blur(10px)',
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-end',
			}}
			onClick={onClose}
		>
			<div
				onClick={e => e.stopPropagation()}
				style={{
					width: '100%',
					maxHeight: '80vh',
					backgroundColor: '#2A2725',
					borderTopLeftRadius: '30px',
					borderTopRightRadius: '30px',
					padding: '24px',
					overflowY: 'auto',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* Заголовок */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px',
					}}
				>
					<h2
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontWeight: 900,
							fontSize: '24px',
							color: '#FCF9F7',
							margin: 0,
						}}
					>
						Мэтч работа
					</h2>
					<button
						onClick={onClose}
						style={{
							background: 'rgba(252, 249, 247, 0.1)',
							border: 'none',
							borderRadius: '50%',
							width: '40px',
							height: '40px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
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
								d='M15 5L5 15M5 5L15 15'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
							/>
						</svg>
					</button>
				</div>

				<div style={{ marginBottom: '20px' }}>
					<button
						style={{
							padding: '10px 20px',
							backgroundColor: '#65FFF7',
							border: 'none',
							borderRadius: '20px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							fontWeight: 600,
							color: '#1E1B1A',
							cursor: 'pointer',
						}}
					>
						Мои вакансии
					</button>
				</div>

				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: 'rgba(252, 249, 247, 0.6)',
						marginBottom: '20px',
					}}
				>
					Выбрано: {selected.length} из {maxSelection}
				</p>

				{/* Контент */}
				<div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
					{loading ? (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								padding: '40px 0',
							}}
						>
							<div
								style={{
									width: '40px',
									height: '40px',
									border: '3px solid rgba(140, 255, 101, 0.2)',
									borderTop: '3px solid #8CFF65',
									borderRadius: '50%',
									animation: 'spin 1s linear infinite',
								}}
							/>
						</div>
					) : vacancies.length === 0 ? (
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.6)',
								textAlign: 'center',
								padding: '40px 20px',
							}}
						>
							У вас пока нет вакансий. Создайте вакансию в разделе Match Работа.
						</p>
					) : (
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
						>
							{vacancies.map(vacancy => {
								const isSelected = selected.some(v => v.id === vacancy.id)
								const canSelect = selected.length < maxSelection || isSelected

								return (
									<div
										key={vacancy.id}
										onClick={() => canSelect && toggleVacancy(vacancy)}
										style={{
											backgroundColor: '#3A3735',
											borderRadius: '20px',
											padding: '16px',
											cursor: canSelect ? 'pointer' : 'not-allowed',
											opacity: canSelect ? 1 : 0.5,
											border: isSelected
												? '2px solid #65FFF7'
												: '2px solid transparent',
											transition: 'all 0.2s',
										}}
									>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'flex-start',
												marginBottom: '8px',
											}}
										>
											<h3
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '18px',
													fontWeight: 600,
													color: '#FCF9F7',
													margin: 0,
													flex: 1,
												}}
											>
												{vacancy.position}
											</h3>
											<div
												style={{
													width: '24px',
													height: '24px',
													borderRadius: '50%',
													border: `2px solid ${isSelected ? '#65FFF7' : 'rgba(252, 249, 247, 0.3)'}`,
													backgroundColor: isSelected
														? '#65FFF7'
														: 'transparent',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													marginLeft: '12px',
													flexShrink: 0,
												}}
											>
												{isSelected && (
													<svg
														width='12'
														height='10'
														viewBox='0 0 12 10'
														fill='none'
														xmlns='http://www.w3.org/2000/svg'
													>
														<path
															d='M1 5L4.5 8.5L11 1.5'
															stroke='#1E1B1A'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
														/>
													</svg>
												)}
											</div>
										</div>

										<p
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: 'rgba(252, 249, 247, 0.6)',
												margin: 0,
												marginBottom: '12px',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
											}}
										>
											{vacancy.description}
										</p>

										{vacancy.skills && vacancy.skills.length > 0 && (
											<div
												style={{
													display: 'flex',
													gap: '6px',
													flexWrap: 'wrap',
													marginBottom: '12px',
												}}
											>
												{vacancy.skills.slice(0, 2).map((skillObj, idx) => (
													<span
														key={idx}
														style={{
															backgroundColor: '#65FFF7',
															borderRadius: '12px',
															padding: '4px 10px',
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '12px',
															color: '#1E1B1A',
															fontWeight: 600,
														}}
													>
														{skillObj.skill.name}
													</span>
												))}
												{vacancy.skills.length > 2 && (
													<span
														style={{
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '12px',
															color: 'rgba(252, 249, 247, 0.5)',
															padding: '4px 10px',
														}}
													>
														+{vacancy.skills.length - 2}
													</span>
												)}
											</div>
										)}

										<p
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: '#FCF9F7',
												margin: 0,
												fontWeight: 600,
											}}
										>
											{vacancy.salaryMin && vacancy.salaryMax
												? `${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()} ₽`
												: 'Не указан'}
										</p>
									</div>
								)
							})}
						</div>
					)}
				</div>

				{/* Кнопка сохранить */}
				<button
					onClick={handleSave}
					style={{
						width: '100%',
						padding: '16px',
						background: 'linear-gradient(90deg, #65FFF7 0%, #002EE7 100%)',
						border: 'none',
						borderRadius: '24px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						fontWeight: 600,
						color: '#1E1B1A',
						cursor: 'pointer',
					}}
				>
					Прикрепить вакансию ({selected.length})
				</button>
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

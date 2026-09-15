'use client'

import { useEffect, useState } from 'react'
import MatchLoaderSmall from '../MatchLoaderSmall'

interface Resume {
	id: string
	position: string
	experience: string
	salaryMin: number | null
	salaryMax: number | null
	category?: { name: string }
	skills: Array<{ skill: { name: string } }>
}

interface Vacancy {
	id: string
	position: string
	description: string
	salaryMin: number | null
	salaryMax: number | null
	workFormat: string
	skills: Array<{ skill: { name: string } }>
}

interface WorkLinkModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (type: 'resume' | 'vacancy', id: string) => void
	currentLinkedResumeId?: string | null
	currentLinkedVacancyId?: string | null
}

export default function WorkLinkModal({
	isOpen,
	onClose,
	onSave,
	currentLinkedResumeId,
	currentLinkedVacancyId,
}: WorkLinkModalProps) {
	const [activeTab, setActiveTab] = useState<'vacancy' | 'resume'>('resume')
	const [vacancies, setVacancies] = useState<Vacancy[]>([])
	const [resumes, setResumes] = useState<Resume[]>([])
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (isOpen) {
			fetchData()
			// Устанавливаем текущий выбранный элемент и активный таб
			if (currentLinkedResumeId) {
				setActiveTab('resume')
				setSelectedId(currentLinkedResumeId)
			} else if (currentLinkedVacancyId) {
				setActiveTab('vacancy')
				setSelectedId(currentLinkedVacancyId)
			} else {
				// По умолчанию открываем резюме
				setActiveTab('resume')
				setSelectedId(null)
			}
		}
	}, [isOpen, currentLinkedResumeId, currentLinkedVacancyId])

	const fetchData = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			const [vacanciesRes, resumesRes] = await Promise.all([
				fetch(`/api/work/vacancies/my`, {
					headers: {
						'x-telegram-user-id': userId,
					},
				}),
				fetch(`/api/work/resumes/my`, {
					headers: {
						'x-telegram-user-id': userId,
					},
				}),
			])

			const vacanciesData = await vacanciesRes.json()
			const resumesData = await resumesRes.json()

			setVacancies(vacanciesData)
			setResumes(resumesData)
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSave = () => {
		if (selectedId) {
			onSave(activeTab, selectedId)
		}
		onClose()
	}

	if (!isOpen) return null

	const currentData = activeTab === 'vacancy' ? vacancies : resumes

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				zIndex: 1000,
				display: 'flex',
				alignItems: 'flex-end',
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: '#1E1B1A',
					borderTopLeftRadius: '28px',
					borderTopRightRadius: '28px',
					width: '100%',
					maxHeight: '80vh',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}
				onClick={e => e.stopPropagation()}
			>
				{/* Заголовок */}
				<div
					style={{
						padding: '20px',
						borderBottom: '1px solid rgba(252, 249, 247, 0.1)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
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
						Мэтч работа
					</h2>
					<button
						onClick={onClose}
						style={{
							width: '32px',
							height: '32px',
							borderRadius: '50%',
							backgroundColor: 'rgba(252, 249, 247, 0.1)',
							border: 'none',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
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
								d='M1 1L13 13M13 1L1 13'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
							/>
						</svg>
					</button>
				</div>

				{/* Табы */}
				<div
					style={{
						display: 'flex',
						gap: '12px',
						padding: '16px 20px',
					}}
				>
					<button
						onClick={() => setActiveTab('resume')}
						style={{
							flex: 1,
							height: '40px',
							borderRadius: '20px',
							border: 'none',
							cursor: 'pointer',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '15px',
							fontWeight: 600,
							backgroundColor:
								activeTab === 'resume' ? '#65FFF7' : 'rgba(252, 249, 247, 0.1)',
							color: activeTab === 'resume' ? '#1D1D1B' : '#FCF9F7',
							transition: 'all 0.3s',
						}}
					>
						Мои резюме
					</button>
					<button
						onClick={() => setActiveTab('vacancy')}
						style={{
							flex: 1,
							height: '40px',
							borderRadius: '20px',
							border: 'none',
							cursor: 'pointer',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '15px',
							fontWeight: 600,
							backgroundColor:
								activeTab === 'vacancy'
									? '#65FFF7'
									: 'rgba(252, 249, 247, 0.1)',
							color: activeTab === 'vacancy' ? '#1D1D1B' : '#FCF9F7',
							transition: 'all 0.3s',
						}}
					>
						Мои вакансии
					</button>
				</div>

				{/* Контент */}
				<div
					style={{
						flex: 1,
						overflowY: 'auto',
						padding: '0 20px 20px',
					}}
				>
					{loading ? (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								padding: '40px 0',
							}}
						>
							<MatchLoaderSmall />
						</div>
					) : currentData.length === 0 ? (
						<p
							style={{
								textAlign: 'center',
								color: 'rgba(252, 249, 247, 0.5)',
								padding: '40px 0',
								fontFamily: 'LT Superior, sans-serif',
							}}
						>
							Нет {activeTab === 'vacancy' ? 'вакансий' : 'резюме'}
						</p>
					) : (
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
						>
							{activeTab === 'resume'
								? (resumes as Resume[]).map(resume => (
										<div
											key={resume.id}
											onClick={() => setSelectedId(resume.id)}
											style={{
												backgroundColor:
													selectedId === resume.id
														? 'rgba(252, 249, 247, 0.15)'
														: 'rgba(252, 249, 247, 0.05)',
												borderRadius: '24px',
												padding: '20px',
												cursor: 'pointer',
												transition: 'all 0.3s',
											}}
										>
											<h3
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '20px',
													fontWeight: 600,
													color: '#FCF9F7',
													marginBottom: '12px',
													margin: 0,
												}}
											>
												{resume.position}
											</h3>
											<p
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '14px',
													color: 'rgba(252, 249, 247, 0.6)',
													margin: 0,
													marginBottom: '16px',
													display: '-webkit-box',
													WebkitLineClamp: 3,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													lineHeight: '1.4',
												}}
											>
												{resume.experience}
											</p>

											{resume.skills && resume.skills.length > 0 && (
												<>
													<p
														style={{
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '14px',
															color: 'rgba(252, 249, 247, 0.6)',
															margin: 0,
															marginBottom: '8px',
														}}
													>
														Ключевые слова
													</p>
													<div
														style={{
															display: 'flex',
															gap: '8px',
															flexWrap: 'wrap',
															marginBottom: '16px',
														}}
													>
														{resume.skills.slice(0, 2).map((skillObj, idx) => (
															<span
																key={idx}
																style={{
																	backgroundColor: '#65FFF7',
																	borderRadius: '16px',
																	padding: '6px 14px',
																	fontFamily: 'LT Superior, sans-serif',
																	fontSize: '13px',
																	color: '#1D1D1B',
																	fontWeight: 600,
																}}
															>
																{skillObj.skill.name}
															</span>
														))}
														{resume.skills.length > 2 && (
															<span
																style={{
																	backgroundColor: 'transparent',
																	borderRadius: '16px',
																	padding: '6px 14px',
																	fontFamily: 'LT Superior, sans-serif',
																	fontSize: '13px',
																	color: '#FCF9F7',
																	fontWeight: 600,
																	display: 'flex',
																	alignItems: 'center',
																}}
															>
																•••
															</span>
														)}
													</div>
												</>
											)}

											<p
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '16px',
													color: '#FCF9F7',
													margin: 0,
													fontWeight: 600,
												}}
											>
												{resume.salaryMin && resume.salaryMax
													? `${resume.salaryMin.toLocaleString()} - ${resume.salaryMax.toLocaleString()} ₽`
													: 'Не указан'}
											</p>
										</div>
									))
								: (vacancies as Vacancy[]).map(vacancy => (
										<div
											key={vacancy.id}
											onClick={() => setSelectedId(vacancy.id)}
											style={{
												backgroundColor:
													selectedId === vacancy.id
														? 'rgba(252, 249, 247, 0.15)'
														: 'rgba(252, 249, 247, 0.05)',
												borderRadius: '24px',
												padding: '20px',
												cursor: 'pointer',
												transition: 'all 0.3s',
											}}
										>
											<h3
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '20px',
													fontWeight: 600,
													color: '#FCF9F7',
													marginBottom: '12px',
													margin: 0,
												}}
											>
												{vacancy.position}
											</h3>
											<p
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '14px',
													color: 'rgba(252, 249, 247, 0.6)',
													margin: 0,
													marginBottom: '16px',
													display: '-webkit-box',
													WebkitLineClamp: 3,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													lineHeight: '1.4',
												}}
											>
												{vacancy.description}
											</p>

											{vacancy.skills && vacancy.skills.length > 0 && (
												<>
													<p
														style={{
															fontFamily: 'LT Superior, sans-serif',
															fontSize: '14px',
															color: 'rgba(252, 249, 247, 0.6)',
															margin: 0,
															marginBottom: '8px',
														}}
													>
														Ключевые слова
													</p>
													<div
														style={{
															display: 'flex',
															gap: '8px',
															flexWrap: 'wrap',
															marginBottom: '16px',
														}}
													>
														{vacancy.skills.slice(0, 2).map((skillObj, idx) => (
															<span
																key={idx}
																style={{
																	backgroundColor: '#65FFF7',
																	borderRadius: '16px',
																	padding: '6px 14px',
																	fontFamily: 'LT Superior, sans-serif',
																	fontSize: '13px',
																	color: '#1D1D1B',
																	fontWeight: 600,
																}}
															>
																{skillObj.skill.name}
															</span>
														))}
														{vacancy.skills.length > 2 && (
															<span
																style={{
																	backgroundColor: 'transparent',
																	borderRadius: '16px',
																	padding: '6px 14px',
																	fontFamily: 'LT Superior, sans-serif',
																	fontSize: '13px',
																	color: '#FCF9F7',
																	fontWeight: 600,
																	display: 'flex',
																	alignItems: 'center',
																}}
															>
																•••
															</span>
														)}
													</div>
												</>
											)}

											<p
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '16px',
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
									))}
						</div>
					)}
				</div>

				{/* Кнопка сохранить */}
				<div style={{ padding: '20px' }}>
					<button
						onClick={handleSave}
						disabled={!selectedId}
						style={{
							width: '100%',
							height: '52px',
							borderRadius: '26px',
							border: 'none',
							cursor: selectedId ? 'pointer' : 'not-allowed',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							backgroundColor: selectedId
								? '#65FFF7'
								: 'rgba(101, 255, 247, 0.3)',
							color: '#1D1D1B',
							transition: 'all 0.3s',
						}}
					>
						Сохранить изменения
					</button>
				</div>
			</div>
		</div>
	)
}

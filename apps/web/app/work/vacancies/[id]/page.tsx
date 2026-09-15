'use client'

import Toast from '@/components/Toast'
import ResumeSelectionModal from '@/components/work/ResumeSelectionModal'
import WorkBottomNav from '@/components/WorkBottomNav'
import WorkHeader from '@/components/WorkHeader'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VacancyDetailPage() {
	const params = useParams()
	const router = useRouter()
	const [vacancy, setVacancy] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [responding, setResponding] = useState(false)
	const [isOwner, setIsOwner] = useState(false)
	const [hasResponded, setHasResponded] = useState(false)
	const [isFavorite, setIsFavorite] = useState(false)
	const [showResumeModal, setShowResumeModal] = useState(false)
	const [myResumes, setMyResumes] = useState<any[]>([])
	const [selectedResume, setSelectedResume] = useState<string | null>(null)
	const [vacancyId, setVacancyId] = useState<string | null>(null)
	const [toast, setToast] = useState<{
		message: string
		type: 'success' | 'error'
	} | null>(null)

	useEffect(() => {
		const getId = async () => {
			const id = await params.id
			setVacancyId(id as string)
		}
		getId()
	}, [params])

	useEffect(() => {
		if (vacancyId) {
			loadVacancy()
			checkIfResponded()
		}
	}, [vacancyId])

	useEffect(() => {
		if (vacancy && vacancyId) {
			loadMyResumes()
		}
	}, [vacancy])

	const loadVacancy = async () => {
		if (!vacancyId) return

		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			const response = await fetch(`/api/work/vacancies/${vacancyId}`)
			if (response.ok) {
				const data = await response.json()
				setVacancy(data)
				setIsFavorite(data.isFavorite || false)

				// Check if current user is the owner
				if (tgUser && data.user) {
					setIsOwner(data.user.telegramId === tgUser.id.toString())
				}
			}
		} catch (error) {
			console.error('Error loading vacancy:', error)
		} finally {
			setLoading(false)
		}
	}

	const checkIfResponded = async () => {
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			const response = await fetch('/api/work/responses/my', {
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (response.ok) {
				const responses = await response.json()
				const responded = responses.some((r: any) => r.vacancyId === vacancyId)
				setHasResponded(responded)
			}
		} catch (error) {
			console.error('Error checking responses:', error)
		}
	}

	const toggleFavorite = async () => {
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			// Optimistic update
			const prevState = isFavorite
			setIsFavorite(!isFavorite)

			const response = await fetch(
				`/api/work/favorites/vacancies/${vacancyId}`,
				{
					method: 'POST',
					headers: {
						'x-telegram-user-id': tgUser.id.toString(),
					},
				},
			)

			if (!response.ok) {
				// Revert on error
				setIsFavorite(prevState)
			}
		} catch (error) {
			console.error('Error toggling favorite:', error)
			// Revert on error
			setIsFavorite(!isFavorite)
		}
	}

	const loadMyResumes = async () => {
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			const response = await fetch('/api/work/resumes/my', {
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})
			if (response.ok) {
				const data = await response.json()

				// Sort resumes by matching skills
				if (vacancy && vacancy.skills) {
					const vacancySkillIds = vacancy.skills.map((s: any) => s.skill.id)
					const sortedResumes = data.sort((a: any, b: any) => {
						const aMatches =
							a.skills?.filter((s: any) => vacancySkillIds.includes(s.skill.id))
								.length || 0
						const bMatches =
							b.skills?.filter((s: any) => vacancySkillIds.includes(s.skill.id))
								.length || 0
						return bMatches - aMatches // Sort by most matches first
					})
					setMyResumes(sortedResumes)
				} else {
					setMyResumes(data)
				}
			}
		} catch (error) {
			console.error('Error loading resumes:', error)
		}
	}

	const handleRespond = async () => {
		// Temporarily disable owner check for debugging
		// if (isOwner) {
		// 	alert('Вы не можете откликнуться на свою вакансию')
		// 	return
		// }

		if (myResumes.length === 0) {
			if (
				confirm(
					'У вас нет резюме. Хотите создать резюме для отклика на вакансию?',
				)
			) {
				router.push('/work/resumes/new')
			}
			return
		}

		// Show resume selection modal
		setShowResumeModal(true)
	}

	const submitResponse = async () => {
		if (!selectedResume) {
			setToast({ message: 'Выберите резюме для отклика', type: 'error' })
			return
		}

		setResponding(true)
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) {
				setToast({
					message: 'Ошибка: не удалось получить данные пользователя',
					type: 'error',
				})
				return
			}

			const response = await fetch('/api/work/responses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-telegram-user-id': tgUser.id.toString(),
				},
				body: JSON.stringify({
					resumeId: selectedResume,
					vacancyId: params.id,
				}),
			})

			if (response.ok) {
				setToast({ message: 'Отклик успешно отправлен!', type: 'success' })
				setShowResumeModal(false)
				setHasResponded(true)
				setTimeout(() => router.push('/work'), 1500)
			} else if (response.status === 409) {
				setToast({
					message: 'Вы уже откликнулись на эту вакансию с этим резюме',
					type: 'error',
				})
			} else {
				const error = await response.json()
				setToast({
					message: error.message || 'Не удалось отправить отклик',
					type: 'error',
				})
			}
		} catch (error) {
			console.error('Error responding:', error)
			setToast({ message: 'Ошибка при отправке отклика', type: 'error' })
		} finally {
			setResponding(false)
		}
	}

	if (loading) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#121212',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
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
		)
	}

	if (!vacancy) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#121212',
					padding: '20px',
				}}
			>
				<WorkHeader />
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						textAlign: 'center',
						marginTop: '40px',
					}}
				>
					Вакансия не найдена
				</p>
			</div>
		)
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
				paddingBottom: '200px',
			}}
		>
			<WorkHeader />

			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			<div style={{ padding: '20px' }}>
				{/* Title with Favorite Button */}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						marginBottom: '20px',
						gap: '12px',
					}}
				>
					<h1
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '28px',
							color: '#FCF9F7',
							lineHeight: '1.2',
							margin: 0,
							flex: 1,
							overflow: 'hidden',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							textOverflow: 'ellipsis',
						}}
					>
						{vacancy.position}
					</h1>
					<button
						onClick={toggleFavorite}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: 0,
							flexShrink: 0,
							marginTop: '4px',
						}}
					>
						<img
							src={isFavorite ? '/favorite_fill.webp' : '/favorite.webp'}
							alt='Favorite'
							width={28}
							height={28}
							style={{
								transition: 'transform 0.2s',
							}}
						/>
					</button>
				</div>

				{/* Skills */}
				{vacancy.skills && vacancy.skills.length > 0 && (
					<div style={{ marginBottom: '20px' }}>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								marginBottom: '12px',
							}}
						>
							Ключевые навыки
						</p>
						<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
							{vacancy.skills.map((skillItem: any) => (
								<span
									key={skillItem.skill.id}
									style={{
										backgroundColor: '#65FFF7',
										borderRadius: '16px',
										padding: '8px 16px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#121212',
									}}
								>
									{skillItem.skill.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Salary */}
				{(vacancy.salaryMin || vacancy.salaryMax) && (
					<p
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontSize: '20px',
							fontWeight: 500,
							color: '#FCF9F7',
							marginBottom: '20px',
						}}
					>
						{vacancy.salaryMin && vacancy.salaryMax
							? `${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()}₽/мес.`
							: vacancy.salaryMin
								? `от ${vacancy.salaryMin.toLocaleString()}₽/мес.`
								: `до ${vacancy.salaryMax.toLocaleString()}₽/мес.`}
					</p>
				)}

				{/* Company */}
				{vacancy.user && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							marginBottom: '20px',
							padding: '16px',
							backgroundColor: '#272727',
							borderRadius: '16px',
						}}
					>
						{vacancy.user.avatarUrl ? (
							<img
								src={vacancy.user.avatarUrl}
								alt='Company'
								width={48}
								height={48}
								style={{ borderRadius: '50%' }}
							/>
						) : (
							<div
								style={{
									width: '48px',
									height: '48px',
									borderRadius: '50%',
									backgroundColor: '#3a3a3a',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg width='24' height='24' viewBox='0 0 24 24' fill='#FCF9F7'>
									<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' />
								</svg>
							</div>
						)}
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
							}}
						>
							{vacancy.user.displayName ||
								vacancy.user.username ||
								'Компания/имя'}
						</span>
					</div>
				)}

				{/* Work Format, Payment, Experience */}
				<div style={{ marginBottom: '20px' }}>
					{vacancy.workFormat && (
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.7)',
								marginBottom: '8px',
							}}
						>
							<strong>Формат:</strong>{' '}
							{vacancy.workFormat === 'REMOTE'
								? 'удаленно'
								: vacancy.workFormat === 'ONSITE'
									? 'на месте работодателя'
									: 'гибрид'}
						</p>
					)}
					{vacancy.paymentFrequency && (
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.7)',
								marginBottom: '8px',
							}}
						>
							<strong>Выплаты:</strong>{' '}
							{vacancy.paymentFrequency === 'MONTHLY'
								? '1 раз в месяц'
								: vacancy.paymentFrequency === 'TWICE_MONTHLY'
									? '2 раза в месяц/сдельно'
									: 'за задачу'}
						</p>
					)}
					{vacancy.experienceRequired && (
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.7)',
								marginBottom: '8px',
							}}
						>
							<strong>Опыт:</strong> {vacancy.experienceRequired}
						</p>
					)}
				</div>

				{/* Description */}
				<div
					style={{
						backgroundColor: '#272727',
						borderRadius: '16px',
						padding: '20px',
						marginBottom: '20px',
					}}
				>
					<h3
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							marginBottom: '12px',
						}}
					>
						Описание
					</h3>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: 'rgba(252, 249, 247, 0.7)',
							lineHeight: '1.6',
							whiteSpace: 'pre-wrap',
						}}
					>
						{vacancy.description}
					</p>
				</div>

				{/* Values */}
				{vacancy.values && vacancy.values.length > 0 && (
					<div>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								marginBottom: '12px',
							}}
						>
							Ценности
						</p>
						<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
							{vacancy.values.map((valueItem: any) => (
								<span
									key={valueItem.value.id}
									style={{
										backgroundColor: '#65FFF7',
										borderRadius: '16px',
										padding: '8px 16px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#121212',
									}}
								>
									{valueItem.value.name}
								</span>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Resume Selection Modal */}
			<ResumeSelectionModal
				show={showResumeModal}
				onClose={() => setShowResumeModal(false)}
				resumes={myResumes}
				vacancy={vacancy}
				selectedResume={selectedResume}
				onSelectResume={setSelectedResume}
				onSubmit={submitResponse}
				responding={responding}
			/>

			{/* Response Button */}
			<div
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					padding: '20px',
					paddingBottom: '100px',
					background:
						'linear-gradient(to top, rgba(29, 28, 26, 1) 0%, rgba(29, 28, 26, 1) 60%, rgba(29, 28, 26, 0) 100%)',
					zIndex: 5,
				}}
			>
				{isOwner ? (
					<button
						disabled
						style={{
							width: '100%',
							background: 'rgba(60, 60, 60, 0.8)',
							border: 'none',
							borderRadius: '24px',
							padding: '18px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							color: '#FCF9F7',
							cursor: 'not-allowed',
							fontWeight: 600,
						}}
					>
						Ваша вакансия
					</button>
				) : hasResponded ? (
					<button
						disabled
						style={{
							width: '100%',
							background: 'rgba(60, 60, 60, 0.8)',
							border: 'none',
							borderRadius: '24px',
							padding: '18px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							color: '#FCF9F7',
							cursor: 'not-allowed',
							fontWeight: 600,
						}}
					>
						Вы откликнулись
					</button>
				) : (
					<button
						onClick={handleRespond}
						disabled={responding}
						style={{
							width: '100%',
							background: 'linear-gradient(90deg, #65FFF7 0%, #002EE7 100%)',
							border: 'none',
							borderRadius: '24px',
							padding: '18px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							color: '#FCF9F7',
							cursor: responding ? 'not-allowed' : 'pointer',
							fontWeight: 600,
							opacity: responding ? 0.5 : 1,
						}}
					>
						{responding ? 'Отправка...' : 'Откликнуться'}
					</button>
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
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				@keyframes slideUp {
					from {
						transform: translateY(100%);
					}
					to {
						transform: translateY(0);
					}
				}
				@keyframes slideInRight {
					from {
						opacity: 0;
						transform: translateX(20px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0.7;
					}
				}
			`}</style>

			<WorkBottomNav />
		</div>
	)
}

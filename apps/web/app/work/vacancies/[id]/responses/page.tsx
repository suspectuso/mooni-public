'use client'

import WorkBottomNav from '@/components/WorkBottomNav'
import WorkHeader from '@/components/WorkHeader'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VacancyResponsesPage() {
	const params = useParams()
	const router = useRouter()
	const [responses, setResponses] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [vacancy, setVacancy] = useState<any>(null)

	useEffect(() => {
		loadResponses()
		loadVacancy()
	}, [params.id])

	const loadVacancy = async () => {
		try {
			const response = await fetch(`/api/work/vacancies/${params.id}`)
			if (response.ok) {
				const data = await response.json()
				setVacancy(data)
			}
		} catch (error) {
			console.error('Error loading vacancy:', error)
		}
	}

	const loadResponses = async () => {
		setLoading(true)
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			const response = await fetch(`/api/work/responses/vacancy/${params.id}`, {
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				setResponses(data)
			}
		} catch (error) {
			console.error('Error loading responses:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
				paddingBottom: '100px',
			}}
		>
			<WorkHeader />

			<div style={{ padding: '20px' }}>
				{/* Vacancy Title */}
				{vacancy && (
					<div style={{ marginBottom: '20px' }}>
						<h1
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '24px',
								color: '#FCF9F7',
								marginBottom: '8px',
							}}
						>
							{vacancy.position}
						</h1>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.5)',
							}}
						>
							Отклики на вакансию
						</p>
					</div>
				)}

				{/* Responses List */}
				{loading ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
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
				) : responses.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '40px 20px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.5)',
							}}
						>
							Пока нет откликов
						</p>
					</div>
				) : (
					responses.map(response => (
						<div
							key={response.id}
							style={{
								backgroundColor: '#272727',
								borderRadius: '16px',
								padding: '20px',
								marginBottom: '16px',
								cursor: 'pointer',
							}}
							onClick={() => {
								router.push(`/work/responses/${response.id}`)
							}}
						>
							{/* User Info */}
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									marginBottom: '16px',
								}}
							>
								{response.resume?.user?.avatarUrl ? (
									<img
										src={response.resume.user.avatarUrl}
										alt='User'
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
										<svg
											width='24'
											height='24'
											viewBox='0 0 24 24'
											fill='#FCF9F7'
										>
											<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' />
										</svg>
									</div>
								)}
								<div>
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											color: '#FCF9F7',
											marginBottom: '4px',
										}}
									>
										{response.resume.firstName} {response.resume.lastName}
									</p>
									{response.resume?.user?.username && (
										<p
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: 'rgba(252, 249, 247, 0.5)',
											}}
										>
											@{response.resume.user.username}
										</p>
									)}
								</div>
							</div>

							{/* Resume Position */}
							<h3
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '18px',
									color: '#FCF9F7',
									marginBottom: '12px',
								}}
							>
								{response.resume.position}
							</h3>

							{/* Skills */}
							{response.resume.skills && response.resume.skills.length > 0 && (
								<div style={{ marginBottom: '12px' }}>
									<div
										style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
									>
										{response.resume.skills
											.slice(0, 3)
											.map((skillItem: any) => (
												<span
													key={skillItem.skill.id}
													style={{
														backgroundColor: '#65FFF7',
														borderRadius: '16px',
														padding: '6px 12px',
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '12px',
														color: '#121212',
													}}
												>
													{skillItem.skill.name}
												</span>
											))}
										{response.resume.skills.length > 3 && (
											<span
												style={{
													backgroundColor: 'transparent',
													border: '1px solid rgba(252, 249, 247, 0.3)',
													borderRadius: '16px',
													padding: '6px 12px',
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '12px',
													color: '#FCF9F7',
												}}
											>
												+{response.resume.skills.length - 3}
											</span>
										)}
									</div>
								</div>
							)}

							{/* Salary */}
							{(response.resume.salaryMin || response.resume.salaryMax) && (
								<p
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '16px',
										fontWeight: 500,
										color: '#FCF9F7',
										margin: 0,
									}}
								>
									{response.resume.salaryMin && response.resume.salaryMax
										? `${response.resume.salaryMin.toLocaleString()} - ${response.resume.salaryMax.toLocaleString()}₽/мес.`
										: response.resume.salaryMin
											? `от ${response.resume.salaryMin.toLocaleString()}₽/мес.`
											: `до ${response.resume.salaryMax.toLocaleString()}₽/мес.`}
								</p>
							)}

							{/* Response Date */}
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '12px',
									color: 'rgba(252, 249, 247, 0.5)',
									marginTop: '12px',
								}}
							>
								Откликнулся{' '}
								{new Date(response.createdAt).toLocaleDateString('ru-RU', {
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}
							</p>
						</div>
					))
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

			<WorkBottomNav />
		</div>
	)
}

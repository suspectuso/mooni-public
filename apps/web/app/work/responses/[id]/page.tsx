'use client'

import Toast from '@/components/Toast'
import WorkBottomNav from '@/components/WorkBottomNav'
import WorkHeader from '@/components/WorkHeader'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResponseDetailPage() {
	const params = useParams()
	const router = useRouter()
	const [response, setResponse] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [showContact, setShowContact] = useState(false)
	const [responseId, setResponseId] = useState<string | null>(null)
	const [toast, setToast] = useState<{
		message: string
		type: 'success' | 'error'
	} | null>(null)

	useEffect(() => {
		const getId = async () => {
			const id = await params.id
			setResponseId(id as string)
		}
		getId()
	}, [params])

	useEffect(() => {
		if (responseId) {
			loadResponse()
		}
	}, [responseId])

	const loadResponse = async () => {
		if (!responseId) return

		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			const response = await fetch(`/api/work/responses/${responseId}`, {
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				setResponse(data)
			}
		} catch (error) {
			console.error('Error loading response:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleShowContact = () => {
		if (!showContact) {
			setShowContact(true)
		} else {
			// Open Telegram - use resume user's username (the candidate)
			const username = response?.resume?.user?.username
			if (username) {
				window.open(`https://t.me/${username}`, '_blank')
			} else {
				setToast({
					message: 'У пользователя нет username в Telegram',
					type: 'error',
				})
			}
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

	if (!response) {
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
					Отклик не найден
				</p>
			</div>
		)
	}

	const resume = response.resume
	const vacancy = response.vacancy

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
				{/* VACANCY INFORMATION AT TOP */}
				{/* Title */}
				<h1
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '28px',
						color: '#FCF9F7',
						marginBottom: '20px',
						lineHeight: '1.2',
					}}
				>
					{vacancy?.position}
				</h1>

				{/* Vacancy Skills */}
				{vacancy?.skills && vacancy.skills.length > 0 && (
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

				{/* Vacancy Salary */}
				{(vacancy?.salaryMin || vacancy?.salaryMax) && (
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

				{/* Company Info */}
				{vacancy?.user && (
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
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '20px',
									color: '#FCF9F7',
									fontWeight: 600,
								}}
							>
								{vacancy.user.displayName?.charAt(0) ||
									vacancy.user.username?.charAt(0) ||
									'?'}
							</div>
						)}
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: '#FCF9F7',
							}}
						>
							{vacancy.user.displayName || vacancy.user.username || 'Компания'}
						</span>
					</div>
				)}

				{/* Work Format */}
				{vacancy?.workFormat && (
					<div style={{ marginBottom: '20px' }}>
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
								? 'удаленно/на месте работодателя'
								: vacancy.workFormat === 'ONSITE'
									? 'на месте работодателя'
									: 'гибрид'}
						</p>
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
									? '1 раз в месяц/сдельно'
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
								}}
							>
								<strong>Опыт:</strong> {vacancy.experienceRequired}
							</p>
						)}
					</div>
				)}

				{/* Vacancy Description */}
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
						{vacancy?.description}
					</p>
				</div>

				{/* Vacancy Values */}
				{vacancy?.values && vacancy.values.length > 0 && (
					<div style={{ marginBottom: '20px' }}>
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

				{/* RESUME INFORMATION - Responses from candidates section */}
				<div style={{ marginTop: '40px' }}>
					<h3
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: 'rgba(252, 249, 247, 0.5)',
							marginBottom: '16px',
						}}
					>
						Отклики от кандидатов
					</h3>

					{/* Candidate Card - Shows RESUME information */}
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '16px',
							padding: '20px',
							marginBottom: '16px',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								marginBottom: '16px',
							}}
						>
							{resume?.user?.avatarUrl ? (
								<img
									src={resume.user.avatarUrl}
									alt='Candidate'
									width={40}
									height={40}
									style={{ borderRadius: '50%' }}
								/>
							) : (
								<div
									style={{
										width: '40px',
										height: '40px',
										borderRadius: '50%',
										backgroundColor: '#3a3a3a',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										fontWeight: 600,
									}}
								>
									{resume?.user?.displayName?.charAt(0) ||
										resume?.user?.username?.charAt(0) ||
										'?'}
								</div>
							)}
							<span
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: '#FCF9F7',
									fontWeight: 600,
								}}
							>
								{resume?.user?.displayName ||
									resume?.user?.username ||
									'Кандидат'}
							</span>
						</div>

						{/* Candidate Skills */}
						{resume?.skills && resume.skills.length > 0 && (
							<div style={{ marginBottom: '12px' }}>
								<p
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '12px',
										color: 'rgba(252, 249, 247, 0.5)',
										marginBottom: '8px',
									}}
								>
									Ключевые навыки
								</p>
								<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
									{resume.skills.slice(0, 6).map((skillItem: any) => (
										<span
											key={skillItem.skill.id}
											style={{
												backgroundColor: '#65FFF7',
												borderRadius: '12px',
												padding: '6px 12px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '12px',
												color: '#121212',
											}}
										>
											{skillItem.skill.name}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Candidate Values */}
						{resume?.values && resume.values.length > 0 && (
							<div style={{ marginBottom: '12px' }}>
								<p
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '12px',
										color: 'rgba(252, 249, 247, 0.5)',
										marginBottom: '8px',
									}}
								>
									Ценности
								</p>
								<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
									{resume.values.slice(0, 3).map((valueItem: any) => (
										<span
											key={valueItem.value.id}
											style={{
												backgroundColor: 'rgba(101, 255, 247, 0.2)',
												borderRadius: '12px',
												padding: '6px 12px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '12px',
												color: '#65FFF7',
											}}
										>
											{valueItem.value.name}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Show Contact Button */}
						<button
							onClick={handleShowContact}
							style={{
								width: '100%',
								background: showContact ? '#121212' : '#121212',
								border: 'none',
								borderRadius: '16px',
								padding: '16px',
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '16px',
								fontWeight: 500,
								color: '#FCF9F7',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '12px',
								transition: 'all 0.2s',
								marginTop: '12px',
							}}
						>
							<svg
								width='22'
								height='15'
								viewBox='0 0 22 15'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M6.76953 7.4987C6.76953 6.39363 7.21527 5.33382 8.00869 4.55242C8.80212 3.77102 9.87823 3.33203 11.0003 3.33203C12.1224 3.33203 13.1985 3.77102 13.9919 4.55242C14.7853 5.33382 15.2311 6.39363 15.2311 7.4987C15.2311 8.60377 14.7853 9.66357 13.9919 10.445C13.1985 11.2264 12.1224 11.6654 11.0003 11.6654C9.87823 11.6654 8.80212 11.2264 8.00869 10.445C7.21527 9.66357 6.76953 8.60377 6.76953 7.4987ZM11.0003 4.9987C10.3271 4.9987 9.68139 5.26209 9.20534 5.73093C8.72928 6.19977 8.46184 6.83566 8.46184 7.4987C8.46184 8.16174 8.72928 8.79762 9.20534 9.26646C9.68139 9.73531 10.3271 9.9987 11.0003 9.9987C11.6735 9.9987 12.3192 9.73531 12.7953 9.26646C13.2713 8.79762 13.5388 8.16174 13.5388 7.4987C13.5388 6.83566 13.2713 6.19977 12.7953 5.73093C12.3192 5.26209 11.6735 4.9987 11.0003 4.9987Z'
									fill='#FCF9F7'
								/>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M2.33877 5.99556C1.86605 6.66667 1.69231 7.19222 1.69231 7.5C1.69231 7.80778 1.86605 8.33333 2.33877 9.00445C2.79682 9.65222 3.476 10.3556 4.33569 11.0056C6.05846 12.3078 8.4198 13.3333 11 13.3333C13.5802 13.3333 15.9415 12.3078 17.6643 11.0056C18.524 10.3556 19.2032 9.65222 19.6612 9.00445C20.1339 8.33333 20.3077 7.80778 20.3077 7.5C20.3077 7.19222 20.1339 6.66667 19.6612 5.99556C19.2032 5.34778 18.524 4.64444 17.6643 3.99444C15.9415 2.69222 13.5802 1.66667 11 1.66667C8.4198 1.66667 6.05846 2.69222 4.33569 3.99444C3.476 4.64444 2.79682 5.34778 2.33877 5.99556ZM3.30451 2.67222C5.25744 1.19667 7.9719 0 11 0C14.0281 0 16.7426 1.19667 18.6944 2.67222C19.6725 3.41111 20.4803 4.23556 21.0512 5.04556C21.6063 5.83333 22 6.69667 22 7.5C22 8.30333 21.6051 9.16667 21.0512 9.95444C20.4803 10.7644 19.6725 11.5878 18.6955 12.3278C16.7437 13.8033 14.0281 15 11 15C7.9719 15 5.25744 13.8033 3.30564 12.3278C2.32749 11.5889 1.51969 10.7644 0.948821 9.95444C0.394872 9.16667 0 8.30333 0 7.5C0 6.69667 0.394872 5.83333 0.948821 5.04556C1.51969 4.23556 2.32749 3.41222 3.30451 2.67222Z'
									fill='#FCF9F7'
								/>
							</svg>
							{showContact
								? `@${resume?.user?.username || 'username'}`
								: 'Показать контакт'}
						</button>
					</div>
				</div>
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

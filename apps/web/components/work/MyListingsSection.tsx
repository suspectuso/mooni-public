'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Resume {
	id: string
	position: string
	category?: { name: string }
	skills: { skill: { name: string } }[]
	isActive: boolean
}

interface Vacancy {
	id: string
	position: string
	description: string
	skills: { skill: { name: string } }[]
	isActive: boolean
}

interface Props {
	mode: 'candidate' | 'company'
	resumes: Resume[]
	vacancies: Vacancy[]
	onDelete: (id: string, type: 'resume' | 'vacancy') => void
}

export default function MyListingsSection({
	mode,
	resumes,
	vacancies,
	onDelete,
}: Props) {
	const router = useRouter()
	const [activeTab, setActiveTab] = useState<'vacancies' | 'resumes'>(
		mode === 'company' ? 'vacancies' : 'resumes',
	)
	const [deleteModal, setDeleteModal] = useState<{
		id: string
		type: 'resume' | 'vacancy'
	} | null>(null)

	const handleEdit = (id: string, type: 'resume' | 'vacancy') => {
		if (type === 'resume') {
			router.push(`/work/resumes/edit/${id}`)
		} else {
			router.push(`/work/vacancies/edit/${id}`)
		}
	}

	const handleDelete = (id: string, type: 'resume' | 'vacancy') => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
		setDeleteModal({ id, type })
	}

	const confirmDelete = () => {
		if (deleteModal) {
			window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
			onDelete(deleteModal.id, deleteModal.type)
			setDeleteModal(null)
		}
	}

	const cancelDelete = () => {
		window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
		setDeleteModal(null)
	}

	const items =
		activeTab === 'vacancies'
			? vacancies.map(v => ({ ...v, type: 'vacancy' as const }))
			: resumes.map(r => ({ ...r, type: 'resume' as const }))

	return (
		<div style={{ padding: '0 20px', marginBottom: '24px' }}>
			{/* Tabs */}
			<div
				style={{
					display: 'flex',
					gap: '12px',
					alignItems: 'center',
					marginBottom: '16px',
				}}
			>
				<button
					onClick={() => setActiveTab('vacancies')}
					style={{
						backgroundColor: activeTab === 'vacancies' ? '#65FFF7' : '#3a3a3a',
						border: 'none',
						borderRadius: '24px',
						padding: '8px 16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: activeTab === 'vacancies' ? '#121212' : '#FCF9F7',
						cursor: 'pointer',
						fontWeight: 600,
					}}
				>
					Вакансии
				</button>
				<button
					onClick={() => setActiveTab('resumes')}
					style={{
						backgroundColor: activeTab === 'resumes' ? '#65FFF7' : '#3a3a3a',
						border: 'none',
						borderRadius: '24px',
						padding: '8px 16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: activeTab === 'resumes' ? '#121212' : '#FCF9F7',
						cursor: 'pointer',
						fontWeight: 600,
					}}
				>
					Резюме
				</button>
			</div>

			{/* List */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				{items.length === 0 ? (
					<div
						style={{
							backgroundColor: '#272727',
							borderRadius: '16px',
							padding: '24px',
							textAlign: 'center',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.5)',
								margin: 0,
							}}
						>
							{activeTab === 'vacancies'
								? 'У вас пока нет вакансий'
								: 'У вас пока нет резюме'}
						</p>
					</div>
				) : (
					items.map(item => (
						<div
							key={item.id}
							style={{
								backgroundColor: '#272727',
								borderRadius: '16px',
								padding: '16px',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
							}}
						>
							<div style={{ flex: 1 }}>
								<h4
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '18px',
										color: '#FCF9F7',
										margin: '0 0 8px 0',
										fontWeight: 600,
									}}
								>
									{item.position}
								</h4>
								{item.skills && item.skills.length > 0 && (
									<div
										style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
									>
										{item.skills.slice(0, 3).map((s, idx) => (
											<span
												key={idx}
												style={{
													backgroundColor: 'rgba(101, 255, 247, 0.2)',
													borderRadius: '12px',
													padding: '4px 10px',
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '12px',
													color: '#65FFF7',
													fontWeight: 500,
												}}
											>
												{s.skill.name}
											</span>
										))}
										{item.skills.length > 3 && (
											<span
												style={{
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '12px',
													color: 'rgba(252, 249, 247, 0.5)',
													padding: '4px 10px',
												}}
											>
												+{item.skills.length - 3}
											</span>
										)}
									</div>
								)}
							</div>

							{/* Actions */}
							<div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
								<button
									onClick={() => handleEdit(item.id, item.type)}
									style={{
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										padding: '4px',
									}}
								>
									<svg
										width='20'
										height='20'
										viewBox='0 0 17 17'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M8.85811 4.30379L0.75 12.4119V16.0605H4.39865L12.5068 7.95244M8.85811 4.30379L12.5068 7.95244M8.85811 4.30379L12.1014 1.06055L15.75 4.7092L12.5068 7.95244'
											stroke='#FCF9F7'
											strokeOpacity='0.65'
											strokeWidth='1.5'
										/>
									</svg>
								</button>
								<button
									onClick={() => handleDelete(item.id, item.type)}
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
							</div>
						</div>
					))
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{deleteModal && (
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
						zIndex: 1000,
						padding: '20px',
					}}
					onClick={cancelDelete}
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
							Удалить {deleteModal.type === 'resume' ? 'резюме' : 'вакансию'}?
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
							Это действие нельзя будет отменить
						</p>
						<div
							style={{
								display: 'flex',
								gap: '12px',
							}}
						>
							<button
								onClick={cancelDelete}
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
								onClick={confirmDelete}
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
								Удалить
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

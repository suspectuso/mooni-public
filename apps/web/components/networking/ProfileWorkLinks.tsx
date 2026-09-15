'use client'

import { useState } from 'react'
import WorkLinkModal from '../work/WorkLinkModal'

interface ProfileWorkLinksProps {
	linkedResume?: { id: string; position: string; category?: { name: string } }
	linkedVacancy?: { id: string; position: string }
	onSave: (type: 'resume' | 'vacancy', id: string) => Promise<void>
}

export default function ProfileWorkLinks({
	linkedResume,
	linkedVacancy,
	onSave,
}: ProfileWorkLinksProps) {
	const [showWorkLinkModal, setShowWorkLinkModal] = useState(false)

	return (
		<div style={{ marginBottom: '24px' }}>
			<div
				style={{
					backgroundColor: 'rgba(252, 249, 247, 0.05)',
					borderRadius: '16px',
					padding: '16px',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '12px',
					}}
				>
					<h3
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							color: '#FCF9F7',
						}}
					>
						Связанные работы
					</h3>
					<div
						onClick={() => setShowWorkLinkModal(true)}
						style={{
							width: '32px',
							height: '32px',
							borderRadius: '50%',
							backgroundColor: 'rgba(252, 249, 247, 0.1)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
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
								d='M0 12.6667V16H3.33333L13.1667 6.16667L9.83333 2.83333L0 12.6667ZM15.7333 3.6C16.0889 3.24444 16.0889 2.66667 15.7333 2.31111L13.6889 0.266667C13.3333 -0.0888889 12.7556 -0.0888889 12.4 0.266667L10.7778 1.88889L14.1111 5.22222L15.7333 3.6Z'
								fill='#FCF9F7'
								fillOpacity='0.65'
							/>
						</svg>
					</div>
				</div>

				{linkedResume && (
					<div
						style={{
							backgroundColor: 'rgba(252, 249, 247, 0.05)',
							borderRadius: '12px',
							padding: '12px',
							marginBottom: '8px',
						}}
					>
						<div
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								marginBottom: '4px',
							}}
						>
							Резюме
						</div>
						<div
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '15px',
								fontWeight: 600,
								color: '#FCF9F7',
							}}
						>
							{linkedResume.position}
						</div>
						{linkedResume.category && (
							<div
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '13px',
									color: 'rgba(252, 249, 247, 0.6)',
									marginTop: '4px',
								}}
							>
								{linkedResume.category.name}
							</div>
						)}
					</div>
				)}

				{linkedVacancy && (
					<div
						style={{
							backgroundColor: 'rgba(252, 249, 247, 0.05)',
							borderRadius: '12px',
							padding: '12px',
						}}
					>
						<div
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								marginBottom: '4px',
							}}
						>
							Вакансия
						</div>
						<div
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '15px',
								fontWeight: 600,
								color: '#FCF9F7',
							}}
						>
							{linkedVacancy.position}
						</div>
					</div>
				)}

				{!linkedResume && !linkedVacancy && (
					<div
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: 'rgba(252, 249, 247, 0.5)',
							textAlign: 'center',
							padding: '12px',
						}}
					>
						Нет связанных работ
					</div>
				)}
			</div>

			<WorkLinkModal
				isOpen={showWorkLinkModal}
				onClose={() => setShowWorkLinkModal(false)}
				onSave={onSave}
				currentLinkedResumeId={linkedResume?.id}
				currentLinkedVacancyId={linkedVacancy?.id}
			/>
		</div>
	)
}

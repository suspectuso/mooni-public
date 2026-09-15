'use client'

import EditIcon from '@/components/EditIcon'

interface Case {
	id: string
	photoPath: string
	title: string | null
	link: string | null
	sortOrder: number
}

interface CasesSectionProps {
	cases: Case[]
	onEdit?: () => void
}

export default function CasesSection({ cases, onEdit }: CasesSectionProps) {
	return (
		<div
			style={{
				backgroundColor: '#272727',
				borderRadius: '28px',
				padding: '20px',
				marginBottom: '16px',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: cases.length > 0 ? '12px' : '0',
				}}
			>
				<h2
					style={{
						color: '#FCF9F7',
						fontWeight: 600,
						fontSize: '20px',
						fontFamily: 'LT Superior, sans-serif',
						margin: 0,
					}}
				>
					Кейсы
				</h2>
				{onEdit && (
					<button
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) tg.HapticFeedback.impactOccurred('light')
							onEdit()
						}}
						style={{
							cursor: 'pointer',
							background: 'none',
							border: 'none',
							padding: 0,
						}}
					>
						<EditIcon />
					</button>
				)}
			</div>

			{cases.length > 0 ? (
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{cases.map(caseItem => (
						<div
							key={caseItem.id}
							onClick={() => {
								if (caseItem.link) {
									window.open(caseItem.link, '_blank')
								}
							}}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								backgroundColor: 'rgba(252, 249, 247, 0.65)',
								borderRadius: '18px',
								padding: '5px',
								height: '35px',
								cursor: caseItem.link ? 'pointer' : 'default',
							}}
						>
							{caseItem.photoPath && (
								<img
									src={caseItem.photoPath}
									alt={caseItem.title || 'Case'}
									style={{
										width: '25px',
										height: '25px',
										borderRadius: '50%',
										objectFit: 'cover',
										backgroundColor: '#272727',
									}}
								/>
							)}
							{caseItem.title && (
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '12px',
										color: '#1D1D1B',
										fontWeight: 600,
										paddingRight: '8px',
									}}
								>
									{caseItem.title}
								</span>
							)}
						</div>
					))}
				</div>
			) : (
				<p
					style={{
						color: 'rgba(252, 249, 247, 0.5)',
						fontSize: '14px',
						fontFamily: 'LT Superior, sans-serif',
						margin: 0,
					}}
				>
					Кейсы не добавлены
				</p>
			)}
		</div>
	)
}

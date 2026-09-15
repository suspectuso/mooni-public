'use client'

interface ResumeCardProps {
	resume: {
		id: string
		position: string
		experience: string
		skills: Array<{ skill: { name: string } }>
		salaryMin?: number
		salaryMax?: number
	}
	onEdit?: () => void
}

export default function ResumeCard({ resume, onEdit }: ResumeCardProps) {
	const displayedSkills = resume.skills.slice(0, 2)
	const hasMoreSkills = resume.skills.length > 2

	const salaryText =
		resume.salaryMin && resume.salaryMax
			? `${resume.salaryMin.toLocaleString()} - ${resume.salaryMax.toLocaleString()}₽/мес.`
			: resume.salaryMin
				? `от ${resume.salaryMin.toLocaleString()}₽/мес.`
				: resume.salaryMax
					? `до ${resume.salaryMax.toLocaleString()}₽/мес.`
					: 'Не указан'

	return (
		<div
			style={{
				backgroundColor: '#272727',
				borderRadius: '20px',
				padding: '24px',
				marginBottom: '16px',
				transition: 'all 0.3s ease',
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					marginBottom: '16px',
				}}
			>
				<h4
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '22px',
						color: '#FCF9F7',
						margin: 0,
						fontWeight: 600,
					}}
				>
					{resume.position}
				</h4>
				{onEdit && (
					<button
						onClick={onEdit}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: 0,
							transition: 'transform 0.2s ease',
						}}
					>
						<img src='/pen.svg' alt='Edit' width={24} height={24} />
					</button>
				)}
			</div>

			<p
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '14px',
					color: 'rgba(252, 249, 247, 0.6)',
					marginBottom: '16px',
					lineHeight: '1.5',
					display: '-webkit-box',
					WebkitLineClamp: 3,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
				}}
			>
				{resume.experience}
			</p>

			<p
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '13px',
					color: 'rgba(252, 249, 247, 0.5)',
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
				{displayedSkills.map((item, index) => (
					<span
						key={index}
						style={{
							backgroundColor: '#65FFF7',
							borderRadius: '16px',
							padding: '6px 14px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '13px',
							color: '#121212',
							fontWeight: 500,
							transition: 'all 0.3s ease',
						}}
					>
						{item.skill.name}
					</span>
				))}
				{hasMoreSkills && (
					<span
						style={{
							backgroundColor: 'transparent',
							border: '1px solid rgba(252, 249, 247, 0.3)',
							borderRadius: '16px',
							padding: '6px 14px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '13px',
							color: '#FCF9F7',
						}}
					>
						•••
					</span>
				)}
			</div>

			<p
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '16px',
					color: '#FCF9F7',
					margin: 0,
					fontWeight: 500,
				}}
			>
				{salaryText}
			</p>
		</div>
	)
}

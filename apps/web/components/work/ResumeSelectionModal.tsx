interface ResumeSelectionModalProps {
	show: boolean
	onClose: () => void
	resumes: any[]
	vacancy: any
	selectedResume: string | null
	onSelectResume: (id: string) => void
	onSubmit: () => void
	responding: boolean
}

export default function ResumeSelectionModal({
	show,
	onClose,
	resumes,
	vacancy,
	selectedResume,
	onSelectResume,
	onSubmit,
	responding,
}: ResumeSelectionModalProps) {
	if (!show) return null

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
				backdropFilter: 'blur(10px)',
				WebkitBackdropFilter: 'blur(10px)',
				display: 'flex',
				alignItems: 'flex-end',
				zIndex: 1000,
				animation: 'fadeIn 0.3s ease-out',
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: '#121212',
					borderRadius: '24px 24px 0 0',
					padding: '24px',
					width: '100%',
					maxHeight: '95vh',
					overflowY: 'auto',
					animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
					boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
				}}
				onClick={e => e.stopPropagation()}
			>
				{/* Header */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '24px',
					}}
				>
					<h2
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '22px',
							color: '#FCF9F7',
							margin: 0,
							fontWeight: 600,
						}}
					>
						Резюме для отклика
					</h2>
					<button
						onClick={onClose}
						style={{
							background: 'rgba(252, 249, 247, 0.1)',
							border: 'none',
							borderRadius: '50%',
							width: '36px',
							height: '36px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							transition: 'all 0.2s',
						}}
						onMouseEnter={e => {
							e.currentTarget.style.background = 'rgba(252, 249, 247, 0.2)'
						}}
						onMouseLeave={e => {
							e.currentTarget.style.background = 'rgba(252, 249, 247, 0.1)'
						}}
					>
						<svg width='20' height='20' viewBox='0 0 20 20' fill='#FCF9F7'>
							<path
								d='M15 5L5 15M5 5L15 15'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
							/>
						</svg>
					</button>
				</div>

				{/* Matching Badge */}
				{resumes.some((resume: any) => {
					const matches =
						vacancy?.skills?.filter((vs: any) =>
							resume.skills?.some((rs: any) => rs.skill.id === vs.skill.id),
						) || []
					return matches.length > 0
				}) && (
					<div
						style={{
							backgroundColor: 'rgba(60, 60, 60, 0.8)',
							borderRadius: '20px',
							padding: '8px 16px',
							marginBottom: '16px',
							display: 'inline-block',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								margin: 0,
								fontWeight: 400,
							}}
						>
							Мэтч по ключевым словам
						</p>
					</div>
				)}

				{/* Resumes List */}
				{resumes.map((resume, index) => {
					const matchingSkills =
						vacancy?.skills?.filter((vs: any) =>
							resume.skills?.some((rs: any) => rs.skill.id === vs.skill.id),
						) || []
					const hasMatch = matchingSkills.length > 0
					const isSelected = selectedResume === resume.id

					return (
						<div
							key={resume.id}
							style={{
								backgroundColor: isSelected
									? 'rgba(101, 255, 247, 0.1)'
									: '#272727',
								border: isSelected
									? '2px solid #65FFF7'
									: '2px solid transparent',
								borderRadius: '20px',
								padding: '20px',
								marginBottom: '16px',
								cursor: 'pointer',
								transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
								animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`,
								transform: isSelected ? 'scale(1.02)' : 'scale(1)',
							}}
							onClick={() => onSelectResume(resume.id)}
							onMouseEnter={e => {
								if (!isSelected) {
									e.currentTarget.style.backgroundColor = '#2a2a2a'
									e.currentTarget.style.transform = 'scale(1.01)'
								}
							}}
							onMouseLeave={e => {
								if (!isSelected) {
									e.currentTarget.style.backgroundColor = '#272727'
									e.currentTarget.style.transform = 'scale(1)'
								}
							}}
						>
							<div style={{ marginBottom: '12px' }}>
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '20px',
										color: '#FCF9F7',
										margin: '0 0 8px 0',
										fontWeight: 600,
									}}
								>
									{resume.position}
								</h3>

								{resume.experience && (
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: 'rgba(252, 249, 247, 0.6)',
											margin: 0,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											lineHeight: '1.4',
										}}
									>
										{resume.experience}
									</p>
								)}
							</div>

							{/* Skills */}
							{resume.skills && resume.skills.length > 0 && (
								<div style={{ marginBottom: '12px' }}>
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '12px',
											color: 'rgba(252, 249, 247, 0.5)',
											marginBottom: '8px',
											fontWeight: 500,
										}}
									>
										Ключевые навыки
									</p>
									<div
										style={{
											display: 'flex',
											gap: '6px',
											flexWrap: 'wrap',
										}}
									>
										{resume.skills.slice(0, 5).map((skillItem: any) => {
											const isMatching = matchingSkills.some(
												(ms: any) => ms.skill.id === skillItem.skill.id,
											)
											return (
												<span
													key={skillItem.skill.id}
													style={{
														backgroundColor: isMatching
															? '#65FFF7'
															: 'rgba(252, 249, 247, 0.1)',
														borderRadius: '12px',
														padding: '6px 12px',
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '12px',
														color: isMatching ? '#121212' : '#FCF9F7',
														fontWeight: isMatching ? 600 : 400,
														transition: 'all 0.2s',
													}}
												>
													{skillItem.skill.name}
												</span>
											)
										})}
										{resume.skills.length > 5 && (
											<span
												style={{
													backgroundColor: 'rgba(252, 249, 247, 0.05)',
													borderRadius: '12px',
													padding: '6px 12px',
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '12px',
													color: 'rgba(252, 249, 247, 0.5)',
												}}
											>
												+{resume.skills.length - 5}
											</span>
										)}
									</div>
								</div>
							)}

							{/* Salary */}
							{(resume.salaryMin || resume.salaryMax) && (
								<p
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '16px',
										fontWeight: 500,
										color: '#FCF9F7',
										margin: 0,
									}}
								>
									{resume.salaryMin && resume.salaryMax
										? `${resume.salaryMin.toLocaleString()} - ${resume.salaryMax.toLocaleString()}₽`
										: resume.salaryMin
											? `от ${resume.salaryMin.toLocaleString()}₽`
											: `до ${resume.salaryMax.toLocaleString()}₽`}
								</p>
							)}
						</div>
					)
				})}

				{/* Other Resumes Section */}
				{resumes.length > 1 &&
					resumes.some((resume: any) => {
						const matches =
							vacancy?.skills?.filter((vs: any) =>
								resume.skills?.some((rs: any) => rs.skill.id === vs.skill.id),
							) || []
						return matches.length === 0
					}) && (
						<div
							style={{
								backgroundColor: 'rgba(60, 60, 60, 0.8)',
								borderRadius: '20px',
								padding: '8px 16px',
								marginBottom: '16px',
								marginTop: '24px',
								display: 'inline-block',
							}}
						>
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: '#FCF9F7',
									margin: 0,
									fontWeight: 400,
								}}
							>
								Другие резюме
							</p>
						</div>
					)}

				{/* Submit Button */}
				<button
					onClick={onSubmit}
					disabled={!selectedResume || responding}
					style={{
						width: '100%',
						background:
							!selectedResume || responding
								? 'rgba(101, 255, 247, 0.3)'
								: 'linear-gradient(90deg, #65FFF7 0%, #002EE7 100%)',
						border: 'none',
						borderRadius: '24px',
						padding: '18px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						cursor: !selectedResume || responding ? 'not-allowed' : 'pointer',
						fontWeight: 600,
						marginTop: '20px',
						transition: 'all 0.3s',
						transform: !selectedResume || responding ? 'scale(1)' : 'scale(1)',
					}}
					onMouseEnter={e => {
						if (selectedResume && !responding) {
							e.currentTarget.style.transform = 'scale(1.02)'
							e.currentTarget.style.boxShadow =
								'0 4px 20px rgba(101, 255, 247, 0.3)'
						}
					}}
					onMouseLeave={e => {
						e.currentTarget.style.transform = 'scale(1)'
						e.currentTarget.style.boxShadow = 'none'
					}}
				>
					{responding ? 'Отправка...' : 'Отправить отклик'}
				</button>

				<style jsx>{`
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
				`}</style>
			</div>
		</div>
	)
}

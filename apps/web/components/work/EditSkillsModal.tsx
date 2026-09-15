'use client'

import { useState } from 'react'

interface Category {
	id: string
	name: string
	skills: Skill[]
}

interface Skill {
	id: string
	name: string
}

interface EditSkillsModalProps {
	show: boolean
	selectedSkills: string[]
	categories: Category[]
	onClose: () => void
	onToggle: (skillId: string) => void
	onReset: () => void
}

export default function EditSkillsModal({
	show,
	selectedSkills,
	categories,
	onClose,
	onToggle,
	onReset,
}: EditSkillsModalProps) {
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set(),
	)

	if (!show) return null

	const toggleCategory = (categoryId: string) => {
		const newExpanded = new Set(expandedCategories)
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId)
		} else {
			newExpanded.add(categoryId)
		}
		setExpandedCategories(newExpanded)
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.9)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '20px',
				zIndex: 1000,
				animation: 'fadeIn 0.3s ease',
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: '#272727',
					borderRadius: '24px',
					padding: '24px',
					maxWidth: '480px',
					width: '100%',
					maxHeight: '80vh',
					overflowY: 'auto',
					animation: 'slideUp 0.3s ease',
				}}
				onClick={e => e.stopPropagation()}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '8px',
					}}
				>
					<h3
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '22px',
							color: '#FCF9F7',
						}}
					>
						Навыки
					</h3>
					<button
						onClick={onReset}
						style={{
							backgroundColor: 'transparent',
							border: '1px solid rgba(252, 249, 247, 0.3)',
							borderRadius: '12px',
							padding: '8px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							cursor: 'pointer',
						}}
					>
						Сбросить
					</button>
				</div>
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: 'rgba(252, 249, 247, 0.7)',
						marginBottom: '16px',
					}}
				>
					Выберите до 5 навыков ({selectedSkills.length}/5)
				</p>

				{/* Categories with spoilers */}
				<div style={{ marginBottom: '24px' }}>
					{categories.map(category => (
						<div key={category.id} style={{ marginBottom: '8px' }}>
							{/* Category Header */}
							<div
								onClick={() => toggleCategory(category.id)}
								style={{
									backgroundColor: '#3a3a3a',
									borderRadius: '16px',
									padding: '12px 16px',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									cursor: 'pointer',
									marginBottom: expandedCategories.has(category.id)
										? '8px'
										: '0',
								}}
							>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
									}}
								>
									{category.name}
								</span>
								<svg
									width='12'
									height='8'
									viewBox='0 0 12 8'
									fill='#FCF9F7'
									style={{
										transform: expandedCategories.has(category.id)
											? 'rotate(180deg)'
											: 'rotate(0deg)',
										transition: 'transform 0.2s',
									}}
								>
									<path d='M1 1L6 6L11 1' stroke='#FCF9F7' strokeWidth='2' />
								</svg>
							</div>

							{/* Skills in Category */}
							{expandedCategories.has(category.id) && (
								<div
									style={{
										display: 'flex',
										gap: '8px',
										flexWrap: 'wrap',
										paddingLeft: '8px',
									}}
								>
									{category.skills.map(skill => (
										<button
											key={skill.id}
											onClick={() => onToggle(skill.id)}
											disabled={
												!selectedSkills.includes(skill.id) &&
												selectedSkills.length >= 5
											}
											style={{
												backgroundColor: selectedSkills.includes(skill.id)
													? '#65FFF7'
													: 'transparent',
												border: '1px solid',
												borderColor: selectedSkills.includes(skill.id)
													? '#65FFF7'
													: 'rgba(252, 249, 247, 0.3)',
												borderRadius: '16px',
												padding: '8px 16px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: selectedSkills.includes(skill.id)
													? '#121212'
													: '#FCF9F7',
												cursor:
													!selectedSkills.includes(skill.id) &&
													selectedSkills.length >= 5
														? 'not-allowed'
														: 'pointer',
												opacity:
													!selectedSkills.includes(skill.id) &&
													selectedSkills.length >= 5
														? 0.5
														: 1,
												transition: 'all 0.3s ease',
												transform: selectedSkills.includes(skill.id)
													? 'scale(1.05)'
													: 'scale(1)',
											}}
										>
											{skill.name}
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</div>

				<button
					onClick={onClose}
					style={{
						width: '100%',
						backgroundColor: '#65FFF7',
						border: 'none',
						borderRadius: '24px',
						padding: '16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '18px',
						color: '#121212',
						cursor: 'pointer',
						fontWeight: 600,
						transition: 'all 0.3s ease',
					}}
				>
					Сохранить
				</button>
			</div>
		</div>
	)
}

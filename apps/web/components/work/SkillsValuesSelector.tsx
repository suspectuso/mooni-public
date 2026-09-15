import { useState } from 'react'

interface Skill {
	id: string
	name: string
	categoryId: string
}

interface Value {
	id: string
	name: string
}

interface Category {
	id: string
	name: string
}

interface SkillsValuesSelectorProps {
	skills: Skill[]
	values: Value[]
	categories: Category[]
	selectedSkills: string[]
	selectedValues: string[]
	onSkillToggle: (skillId: string) => void
	onValueToggle: (valueId: string) => void
	maxSkills?: number
	maxValues?: number
}

export default function SkillsValuesSelector({
	skills,
	values,
	categories,
	selectedSkills,
	selectedValues,
	onSkillToggle,
	onValueToggle,
	maxSkills = 5,
	maxValues = 5,
}: SkillsValuesSelectorProps) {
	const [showSkillsDropdown, setShowSkillsDropdown] = useState(false)
	const [showValuesDropdown, setShowValuesDropdown] = useState(false)
	const [expandedCategories, setExpandedCategories] = useState<string[]>([])

	const toggleCategory = (categoryId: string) => {
		setExpandedCategories(prev =>
			prev.includes(categoryId)
				? prev.filter(id => id !== categoryId)
				: [...prev, categoryId],
		)
	}

	return (
		<>
			{/* Skills Section */}
			<div style={{ marginBottom: '20px' }}>
				<label
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: '#FCF9F7',
						display: 'block',
						marginBottom: '8px',
					}}
				>
					Ключевые навыки (до {maxSkills})
				</label>
				<div style={{ position: 'relative' }}>
					<button
						type='button'
						onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
						style={{
							width: '100%',
							backgroundColor: '#3a3a3a',
							border: 'none',
							borderRadius: '12px',
							padding: '12px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							textAlign: 'left',
							cursor: 'pointer',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<span>
							{selectedSkills.length > 0
								? `Выбрано: ${selectedSkills.length}/${maxSkills}`
								: 'Выберите навыки'}
						</span>
						<span
							style={{
								transform: showSkillsDropdown ? 'rotate(180deg)' : 'rotate(0)',
								transition: 'transform 0.2s',
							}}
						>
							▼
						</span>
					</button>

					{showSkillsDropdown && (
						<div
							style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								right: 0,
								backgroundColor: '#272727',
								borderRadius: '12px',
								marginTop: '8px',
								maxHeight: '300px',
								overflowY: 'auto',
								zIndex: 10,
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
							}}
						>
							{categories.map(category => {
								const categorySkills = skills.filter(
									s => s.categoryId === category.id,
								)
								if (categorySkills.length === 0) return null

								const isExpanded = expandedCategories.includes(category.id)

								return (
									<div key={category.id}>
										<button
											type='button'
											onClick={() => toggleCategory(category.id)}
											style={{
												width: '100%',
												backgroundColor: 'transparent',
												border: 'none',
												padding: '12px 16px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: '#FCF9F7',
												textAlign: 'left',
												cursor: 'pointer',
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												borderBottom: '1px solid rgba(252, 249, 247, 0.1)',
											}}
										>
											<span style={{ fontWeight: 600 }}>{category.name}</span>
											<span
												style={{
													transform: isExpanded
														? 'rotate(180deg)'
														: 'rotate(0)',
													transition: 'transform 0.2s',
												}}
											>
												▼
											</span>
										</button>

										{isExpanded && (
											<div
												style={{
													padding: '8px',
													display: 'flex',
													gap: '8px',
													flexWrap: 'wrap',
												}}
											>
												{categorySkills.map(skill => {
													const isSelected = selectedSkills.includes(skill.id)
													const isDisabled =
														!isSelected && selectedSkills.length >= maxSkills

													return (
														<button
															key={skill.id}
															type='button'
															onClick={() => onSkillToggle(skill.id)}
															disabled={isDisabled}
															style={{
																backgroundColor: isSelected
																	? '#F7710B'
																	: '#272727',
																border: 'none',
																borderRadius: '20px',
																padding: '8px 16px',
																fontFamily: 'LT Superior, sans-serif',
																fontSize: '14px',
																fontWeight: 500,
																color: isSelected ? '#1D1D1B' : '#FCF9F7',
																cursor: isDisabled ? 'not-allowed' : 'pointer',
																opacity: isDisabled ? 0.5 : 1,
																transition: 'all 0.2s ease',
															}}
														>
															{skill.name}
														</button>
													)
												})}
											</div>
										)}
									</div>
								)
							})}
						</div>
					)}
				</div>

				{/* Selected Skills Display */}
				{selectedSkills.length > 0 && (
					<div
						style={{
							display: 'flex',
							gap: '8px',
							flexWrap: 'wrap',
							marginTop: '12px',
						}}
					>
						{selectedSkills.map(skillId => {
							const skill = skills.find(s => s.id === skillId)
							return (
								<span
									key={skillId}
									style={{
										backgroundColor: '#F7710B',
										borderRadius: '20px',
										padding: '8px 16px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										fontWeight: 500,
										color: '#1D1D1B',
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
									}}
								>
									{skill?.name}
									<button
										type='button'
										onClick={() => onSkillToggle(skillId)}
										style={{
											background: 'none',
											border: 'none',
											color: '#1D1D1B',
											cursor: 'pointer',
											padding: 0,
											fontSize: '16px',
											lineHeight: 1,
										}}
									>
										×
									</button>
								</span>
							)
						})}
					</div>
				)}
			</div>

			{/* Values Section */}
			<div style={{ marginBottom: '20px' }}>
				<label
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: '#FCF9F7',
						display: 'block',
						marginBottom: '8px',
					}}
				>
					Ценности (до {maxValues})
				</label>
				<div style={{ position: 'relative' }}>
					<button
						type='button'
						onClick={() => setShowValuesDropdown(!showValuesDropdown)}
						style={{
							width: '100%',
							backgroundColor: '#3a3a3a',
							border: 'none',
							borderRadius: '12px',
							padding: '12px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: '#FCF9F7',
							textAlign: 'left',
							cursor: 'pointer',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<span>
							{selectedValues.length > 0
								? `Выбрано: ${selectedValues.length}/${maxValues}`
								: 'Выберите ценности'}
						</span>
						<span
							style={{
								transform: showValuesDropdown ? 'rotate(180deg)' : 'rotate(0)',
								transition: 'transform 0.2s',
							}}
						>
							▼
						</span>
					</button>

					{showValuesDropdown && (
						<div
							style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								right: 0,
								backgroundColor: '#272727',
								borderRadius: '12px',
								marginTop: '8px',
								maxHeight: '300px',
								overflowY: 'auto',
								zIndex: 10,
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
								padding: '8px',
								display: 'flex',
								gap: '8px',
								flexWrap: 'wrap',
							}}
						>
							{values.map(value => {
								const isSelected = selectedValues.includes(value.id)
								const isDisabled =
									!isSelected && selectedValues.length >= maxValues

								return (
									<button
										key={value.id}
										type='button'
										onClick={() => onValueToggle(value.id)}
										disabled={isDisabled}
										style={{
											backgroundColor: isSelected ? '#F7710B' : '#272727',
											border: 'none',
											borderRadius: '20px',
											padding: '8px 16px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											fontWeight: 500,
											color: isSelected ? '#1D1D1B' : '#FCF9F7',
											cursor: isDisabled ? 'not-allowed' : 'pointer',
											opacity: isDisabled ? 0.5 : 1,
											transition: 'all 0.2s ease',
										}}
									>
										{value.name}
									</button>
								)
							})}
						</div>
					)}
				</div>

				{/* Selected Values Display */}
				{selectedValues.length > 0 && (
					<div
						style={{
							display: 'flex',
							gap: '8px',
							flexWrap: 'wrap',
							marginTop: '12px',
						}}
					>
						{selectedValues.map(valueId => {
							const value = values.find(v => v.id === valueId)
							return (
								<span
									key={valueId}
									style={{
										backgroundColor: '#F7710B',
										borderRadius: '20px',
										padding: '8px 16px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										fontWeight: 500,
										color: '#1D1D1B',
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
									}}
								>
									{value?.name}
									<button
										type='button'
										onClick={() => onValueToggle(valueId)}
										style={{
											background: 'none',
											border: 'none',
											color: '#1D1D1B',
											cursor: 'pointer',
											padding: 0,
											fontSize: '16px',
											lineHeight: 1,
										}}
									>
										×
									</button>
								</span>
							)
						})}
					</div>
				)}
			</div>
		</>
	)
}

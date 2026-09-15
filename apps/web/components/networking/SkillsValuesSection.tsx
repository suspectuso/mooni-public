'use client'

import EditIcon from '@/components/EditIcon'

interface SkillsValuesSectionProps {
	type: 'skills' | 'values'
	items: string[]
	isOpen: boolean
	hasChanges: boolean
	categories?: any[]
	values?: any[]
	expandedCategories?: Set<string>
	onToggle: () => void
	onItemToggle: (item: string) => void
	onCategoryToggle?: (categoryId: string) => void
	onSave: () => void
}

export default function SkillsValuesSection({
	type,
	items,
	isOpen,
	hasChanges,
	categories,
	values,
	expandedCategories,
	onToggle,
	onItemToggle,
	onCategoryToggle,
	onSave,
}: SkillsValuesSectionProps) {
	const title = type === 'skills' ? 'Навыки (до 5)' : 'Ценности (до 5)'
	const emptyText =
		type === 'skills' ? 'Навыки не добавлены' : 'Ценности не добавлены'

	return (
		<>
			<div
				style={{
					backgroundColor: '#272727',
					borderRadius: '28px',
					padding: '20px',
					marginBottom: isOpen ? '8px' : '16px',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: '12px',
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
						{title}
					</h2>
					<button
						onClick={e => {
							e.stopPropagation()
							onToggle()
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
				</div>
				{items.length > 0 ? (
					<div
						style={{
							display: 'flex',
							gap: '8px',
							flexWrap: 'wrap',
							marginBottom: isOpen ? '12px' : '0',
						}}
					>
						{items.map((item, index) => (
							<span
								key={index}
								style={{
									backgroundColor: 'rgba(252, 249, 247, 0.1)',
									borderRadius: '16px',
									padding: '6px 14px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '13px',
									color: 'rgba(252, 249, 247, 0.65)',
									fontWeight: 500,
								}}
							>
								{item}
							</span>
						))}
					</div>
				) : (
					<p
						style={{
							color: 'rgba(252, 249, 247, 0.5)',
							fontSize: '14px',
							fontFamily: 'LT Superior, sans-serif',
							margin: 0,
							marginBottom: isOpen ? '12px' : '0',
						}}
					>
						{emptyText}
					</p>
				)}
				{isOpen && hasChanges && (
					<button
						onClick={onSave}
						style={{
							width: '100%',
							backgroundColor: 'rgba(252, 249, 247, 0.15)',
							border: 'none',
							borderRadius: '28px',
							padding: '12px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							color: '#FCF9F7',
							cursor: 'pointer',
							fontWeight: 600,
						}}
					>
						Сохранить
					</button>
				)}
			</div>

			{isOpen && type === 'skills' && categories && (
				<div
					onClick={e => e.stopPropagation()}
					style={{
						backgroundColor: '#3a3a3a',
						borderRadius: '16px',
						marginBottom: '16px',
						maxHeight: '300px',
						overflowY: 'auto',
						padding: '12px',
					}}
				>
					{categories.map(category => (
						<div key={category.id} style={{ marginBottom: '12px' }}>
							<div
								onClick={() => onCategoryToggle?.(category.id)}
								style={{
									backgroundColor: '#272727',
									borderRadius: '12px',
									padding: '10px 12px',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									cursor: 'pointer',
									marginBottom: expandedCategories?.has(category.id)
										? '8px'
										: '0',
								}}
							>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#FCF9F7',
										fontWeight: 600,
									}}
								>
									{category.name}
								</span>
								<svg
									width='10'
									height='6'
									viewBox='0 0 12 8'
									fill='#FCF9F7'
									style={{
										transform: expandedCategories?.has(category.id)
											? 'rotate(180deg)'
											: 'rotate(0deg)',
										transition: 'transform 0.2s',
									}}
								>
									<path d='M1 1L6 6L11 1' stroke='#FCF9F7' strokeWidth='2' />
								</svg>
							</div>

							{expandedCategories?.has(category.id) && (
								<div
									style={{
										display: 'flex',
										gap: '8px',
										flexWrap: 'wrap',
										paddingLeft: '8px',
									}}
								>
									{category.skills.map((skill: any) => {
										const isSelected = items.includes(skill.name)
										const isDisabled = !isSelected && items.length >= 5

										return (
											<button
												key={skill.id}
												onClick={() => onItemToggle(skill.name)}
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
												{skill.name}
											</button>
										)
									})}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{isOpen && type === 'values' && values && (
				<div
					onClick={e => e.stopPropagation()}
					style={{
						backgroundColor: '#3a3a3a',
						borderRadius: '16px',
						marginBottom: '16px',
						maxHeight: '300px',
						overflowY: 'auto',
						padding: '12px',
					}}
				>
					<div
						style={{
							display: 'flex',
							gap: '8px',
							flexWrap: 'wrap',
						}}
					>
						{values.map(value => {
							const isSelected = items.includes(value.name)
							const isDisabled = !isSelected && items.length >= 5

							return (
								<button
									key={value.id}
									onClick={() => onItemToggle(value.name)}
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
				</div>
			)}
		</>
	)
}

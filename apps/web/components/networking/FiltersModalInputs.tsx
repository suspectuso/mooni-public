'use client'

interface FiltersModalInputsProps {
	hasActiveSubscription: boolean
	handleLockedClick: () => void
	valueInput: string
	handleValueInputChange: (value: string) => void
	valueSuggestions: any[]
	addValueFromSuggestion: (valueName: string) => void
	values: string[]
	toggleValue: (value: string) => void
	skillInput: string
	handleSkillInputChange: (value: string) => void
	skillSuggestions: any[]
	addSkillFromSuggestion: (skillName: string) => void
	skills: string[]
	toggleSkill: (skill: string) => void
}

export default function FiltersModalInputs({
	hasActiveSubscription,
	handleLockedClick,
	valueInput,
	handleValueInputChange,
	valueSuggestions,
	addValueFromSuggestion,
	values,
	toggleValue,
	skillInput,
	handleSkillInputChange,
	skillSuggestions,
	addSkillFromSuggestion,
	skills,
	toggleSkill,
}: FiltersModalInputsProps) {
	return (
		<>
			{/* Ценности (платный) */}
			<div style={{ marginBottom: '32px', position: 'relative' }}>
				<h3
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						fontWeight: 600,
						color: '#FCF9F7',
						marginBottom: '16px',
					}}
				>
					Ценности (до 3-х)
				</h3>
				<input
					type='text'
					placeholder='Начните вводить'
					value={valueInput}
					onChange={e => {
						if (!hasActiveSubscription) {
							handleLockedClick()
							return
						}
						handleValueInputChange(e.target.value)
					}}
					onClick={() => {
						if (!hasActiveSubscription) {
							handleLockedClick()
						}
					}}
					style={{
						width: '100%',
						height: '70px',
						padding: '0 24px',
						backgroundColor: '#353534',
						border: 'none',
						borderRadius: '28px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: hasActiveSubscription ? '#FCF9F7' : '#82817f',
						outline: 'none',
						marginBottom: '12px',
					}}
					disabled={!hasActiveSubscription}
				/>

				{/* Выпадающий список с подсказками */}
				{valueSuggestions.length > 0 && hasActiveSubscription && (
					<div
						style={{
							position: 'absolute',
							top: '90px',
							left: 0,
							right: 0,
							backgroundColor: '#272727',
							borderRadius: '16px',
							maxHeight: '200px',
							overflowY: 'auto',
							zIndex: 1000,
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
						}}
					>
						{valueSuggestions.map(val => {
							const isSelected = values.includes(val.name)
							const isDisabled = !isSelected && values.length >= 3

							return (
								<button
									key={val.id}
									onClick={() => {
										if (!isDisabled) {
											addValueFromSuggestion(val.name)
										}
									}}
									disabled={isDisabled}
									style={{
										width: '100%',
										padding: '12px 16px',
										backgroundColor: 'transparent',
										border: 'none',
										color: isDisabled ? '#82817f' : '#FCF9F7',
										fontSize: '16px',
										textAlign: 'left',
										cursor: isDisabled ? 'not-allowed' : 'pointer',
										fontFamily: 'LT Superior, sans-serif',
										transition: 'background-color 0.2s',
										opacity: isDisabled ? 0.5 : 1,
									}}
									onMouseEnter={e => {
										if (!isDisabled) {
											e.currentTarget.style.backgroundColor = '#353534'
										}
									}}
									onMouseLeave={e => {
										e.currentTarget.style.backgroundColor = 'transparent'
									}}
								>
									{val.name}
								</button>
							)
						})}
					</div>
				)}

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{values.map(value => (
						<button
							key={value}
							onClick={() => toggleValue(value)}
							style={{
								padding: '8px 16px',
								borderRadius: '20px',
								border: 'none',
								backgroundColor: '#F7710B',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color: '#FCF9F7',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								opacity: hasActiveSubscription ? 1 : 0.5,
							}}
						>
							{value}
							<span>×</span>
						</button>
					))}
				</div>
				{!hasActiveSubscription && (
					<div
						style={{
							marginTop: '8px',
							fontSize: '12px',
							color: '#82817f',
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
						}}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width={24}
							height={24}
							viewBox='0 0 24 24'
						>
							<path
								fill='none'
								stroke='currentColor'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
							></path>
						</svg>
						Доступно с подпиской
					</div>
				)}
			</div>

			{/* Навыки (платный) */}
			<div style={{ marginBottom: '32px', position: 'relative' }}>
				<h3
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						fontWeight: 600,
						color: '#FCF9F7',
						marginBottom: '16px',
					}}
				>
					Навыки (до 5-и)
				</h3>
				<input
					type='text'
					placeholder='Начните вводить'
					value={skillInput}
					onChange={e => {
						if (!hasActiveSubscription) {
							handleLockedClick()
							return
						}
						handleSkillInputChange(e.target.value)
					}}
					onClick={() => {
						if (!hasActiveSubscription) {
							handleLockedClick()
						}
					}}
					style={{
						width: '100%',
						height: '70px',
						padding: '0 24px',
						backgroundColor: '#353534',
						border: 'none',
						borderRadius: '28px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: hasActiveSubscription ? '#FCF9F7' : '#82817f',
						outline: 'none',
						marginBottom: '12px',
					}}
					disabled={!hasActiveSubscription}
				/>

				{/* Выпадающий список с подсказками */}
				{skillSuggestions.length > 0 && hasActiveSubscription && (
					<div
						style={{
							position: 'absolute',
							top: '90px',
							left: 0,
							right: 0,
							backgroundColor: '#272727',
							borderRadius: '16px',
							maxHeight: '200px',
							overflowY: 'auto',
							zIndex: 1000,
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
						}}
					>
						{skillSuggestions.map(skill => {
							const isSelected = skills.includes(skill.name)
							const isDisabled = !isSelected && skills.length >= 5

							return (
								<button
									key={skill.id}
									onClick={() => {
										if (!isDisabled) {
											addSkillFromSuggestion(skill.name)
										}
									}}
									disabled={isDisabled}
									style={{
										width: '100%',
										padding: '12px 16px',
										backgroundColor: 'transparent',
										border: 'none',
										color: isDisabled ? '#82817f' : '#FCF9F7',
										fontSize: '16px',
										textAlign: 'left',
										cursor: isDisabled ? 'not-allowed' : 'pointer',
										fontFamily: 'LT Superior, sans-serif',
										transition: 'background-color 0.2s',
										opacity: isDisabled ? 0.5 : 1,
									}}
									onMouseEnter={e => {
										if (!isDisabled) {
											e.currentTarget.style.backgroundColor = '#353534'
										}
									}}
									onMouseLeave={e => {
										e.currentTarget.style.backgroundColor = 'transparent'
									}}
								>
									{skill.name}
								</button>
							)
						})}
					</div>
				)}

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{skills.map(skill => (
						<button
							key={skill}
							onClick={() => toggleSkill(skill)}
							style={{
								padding: '8px 16px',
								borderRadius: '20px',
								border: 'none',
								backgroundColor: '#F7710B',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color: '#FCF9F7',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								opacity: hasActiveSubscription ? 1 : 0.5,
							}}
						>
							{skill}
							<span>×</span>
						</button>
					))}
				</div>
				{!hasActiveSubscription && (
					<div
						style={{
							marginTop: '8px',
							fontSize: '12px',
							color: '#82817f',
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
						}}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width={24}
							height={24}
							viewBox='0 0 24 24'
						>
							<path
								fill='none'
								stroke='currentColor'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1'
							></path>
						</svg>{' '}
						Доступно с подпиской
					</div>
				)}
			</div>
		</>
	)
}

'use client'

interface ProjectFormFieldsProps {
	name: string
	setName: (value: string) => void
	description: string
	setDescription: (value: string) => void
	projectUrl: string
	setProjectUrl: (value: string) => void
	stage: string
	setStage: (value: string) => void
	categories: Array<{ id: string; name: string }>
	selectedCategories: string[]
	setSelectedCategories: (value: string[]) => void
	tags: Array<{ id: string; name: string }>
	selectedTags: string[]
	setSelectedTags: (value: string[]) => void
	needsInvestment: boolean
	setNeedsInvestment: (value: boolean) => void
	investmentMin: string
	setInvestmentMin: (value: string) => void
	investmentMax: string
	setInvestmentMax: (value: string) => void
	investmentPurpose: string
	setInvestmentPurpose: (value: string) => void
	investorShare: string
	setInvestorShare: (value: string) => void
	needsEmployees: boolean
	setNeedsEmployees: (value: boolean) => void
	linkedVacancies: Array<{ id: string; position: string }>
	removeVacancy: (id: string) => void
	onAddVacancy: () => void
}

export default function ProjectFormFields({
	name,
	setName,
	description,
	setDescription,
	projectUrl,
	setProjectUrl,
	stage,
	setStage,
	categories,
	selectedCategories,
	setSelectedCategories,
	tags,
	selectedTags,
	setSelectedTags,
	needsInvestment,
	setNeedsInvestment,
	investmentMin,
	setInvestmentMin,
	investmentMax,
	setInvestmentMax,
	investmentPurpose,
	setInvestmentPurpose,
	investorShare,
	setInvestorShare,
	needsEmployees,
	setNeedsEmployees,
	linkedVacancies,
	removeVacancy,
	onAddVacancy,
}: ProjectFormFieldsProps) {
	return (
		<>
			{/* Название */}
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
					Название
				</label>
				<input
					type='text'
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder='Введите название'
					style={{
						width: '100%',
						padding: '14px',
						backgroundColor: '#2A2725',
						borderRadius: '28px',
						border: 'none',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						outline: 'none',
					}}
				/>
			</div>

			{/* Категория */}
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
					Категория (до 2-х)
				</label>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{categories.map(category => (
						<button
							key={category.id}
							onClick={() => {
								if (selectedCategories.includes(category.id)) {
									setSelectedCategories(
										selectedCategories.filter(id => id !== category.id),
									)
								} else if (selectedCategories.length < 2) {
									setSelectedCategories([...selectedCategories, category.id])
								}
							}}
							style={{
								padding: '10px 18px',
								backgroundColor: selectedCategories.includes(category.id)
									? '#8CFF65'
									: '#2A2725',
								border: 'none',
								borderRadius: '20px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color: selectedCategories.includes(category.id)
									? '#1E1B1A'
									: '#FCF9F7',
								cursor: 'pointer',
							}}
						>
							{category.name}
						</button>
					))}
				</div>
			</div>

			{/* Задачи */}
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
					Задачи (до 5-и)
				</label>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
					{tags.map(tag => (
						<button
							key={tag.id}
							onClick={() => {
								if (selectedTags.includes(tag.id)) {
									setSelectedTags(selectedTags.filter(id => id !== tag.id))
								} else if (selectedTags.length < 5) {
									setSelectedTags([...selectedTags, tag.id])
								}
							}}
							style={{
								padding: '10px 18px',
								backgroundColor: selectedTags.includes(tag.id)
									? '#8CFF65'
									: '#2A2725',
								border: 'none',
								borderRadius: '20px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color: selectedTags.includes(tag.id) ? '#1E1B1A' : '#FCF9F7',
								cursor: 'pointer',
							}}
						>
							{tag.name}
						</button>
					))}
				</div>
			</div>

			{/* Проекты... */}
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
					Проекты...
				</label>
				<div style={{ display: 'flex', gap: '8px' }}>
					{['Стартапы', 'Устоявшиеся'].map(stageOption => (
						<button
							key={stageOption}
							onClick={() =>
								setStage(
									stageOption === 'Стартапы' ? 'Идея' : 'Масштабирование',
								)
							}
							style={{
								padding: '10px 18px',
								backgroundColor:
									(stageOption === 'Стартапы' &&
										['Идея', 'MVP', 'Рост'].includes(stage)) ||
									(stageOption === 'Устоявшиеся' && stage === 'Масштабирование')
										? '#8CFF65'
										: '#2A2725',
								border: 'none',
								borderRadius: '20px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color:
									(stageOption === 'Стартапы' &&
										['Идея', 'MVP', 'Рост'].includes(stage)) ||
									(stageOption === 'Устоявшиеся' && stage === 'Масштабирование')
										? '#1E1B1A'
										: '#FCF9F7',
								cursor: 'pointer',
							}}
						>
							{stageOption}
						</button>
					))}
				</div>
			</div>

			{/* Описание */}
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
					Описание
				</label>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder='Расскажите о проекте...'
					rows={5}
					style={{
						width: '100%',
						padding: '14px',
						backgroundColor: '#2A2725',
						border: '1px solid #878684',
						borderRadius: '28px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						outline: 'none',
						resize: 'vertical',
					}}
				/>
			</div>

			{/* Требуются инвестиции */}
			<div style={{ marginBottom: '20px' }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						marginBottom: '12px',
					}}
				>
					<div
						style={{
							width: '40px',
							height: '40px',
							borderRadius: '10px',
							backgroundColor: needsInvestment ? '#8CFF65' : '#272727',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transition: 'all 0.2s',
							cursor: 'pointer',
						}}
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) tg.HapticFeedback.impactOccurred('light')
							setNeedsInvestment(!needsInvestment)
							if (!needsInvestment === false) {
								setInvestmentMin('')
								setInvestmentMax('')
								setInvestmentPurpose('')
							}
						}}
					>
						{needsInvestment && (
							<img src='/tick.svg' alt='Check' width={20} height={16} />
						)}
					</div>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							color: '#FCF9F7',
						}}
					>
						Требуются инвестиции
					</label>
				</div>

				{needsInvestment && (
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
					>
						<div style={{ display: 'flex', gap: '12px' }}>
							<div style={{ flex: 1 }}>
								<label
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#FCF9F7',
										display: 'block',
										marginBottom: '8px',
									}}
								>
									От
								</label>
								<input
									type='text'
									value={investmentMin}
									onChange={e => setInvestmentMin(e.target.value)}
									placeholder='1.000.000₽'
									style={{
										width: '100%',
										padding: '14px',
										backgroundColor: '#2A2725',
										border: '1px solid rgba(140, 255, 101, 0.2)',
										borderRadius: '28px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										outline: 'none',
									}}
								/>
							</div>
							<div style={{ flex: 1 }}>
								<label
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#FCF9F7',
										display: 'block',
										marginBottom: '8px',
									}}
								>
									До
								</label>
								<input
									type='text'
									value={investmentMax}
									onChange={e => setInvestmentMax(e.target.value)}
									placeholder='15.000.000₽'
									style={{
										width: '100%',
										padding: '14px',
										backgroundColor: '#2A2725',
										border: '1px solid rgba(140, 255, 101, 0.2)',
										borderRadius: '28px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										outline: 'none',
									}}
								/>
							</div>
						</div>
						<div>
							<label
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: '#FCF9F7',
									display: 'block',
									marginBottom: '8px',
								}}
							>
								На что потребуются инвестиции
							</label>
							<input
								type='text'
								value={investmentPurpose}
								onChange={e => setInvestmentPurpose(e.target.value)}
								placeholder='На маркетинг, рекламу, софт и т.д'
								style={{
									width: '100%',
									padding: '14px',
									backgroundColor: '#2A2725',
									border: '1px solid rgba(140, 255, 101, 0.2)',
									borderRadius: '28px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: '#FCF9F7',
									outline: 'none',
								}}
							/>
						</div>
						<div>
							<label
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									color: '#FCF9F7',
									display: 'block',
									marginBottom: '8px',
								}}
							>
								Предварительная доля инвестора (%)
							</label>
							<input
								type='number'
								value={investorShare}
								onChange={e => setInvestorShare(e.target.value)}
								placeholder='10'
								min='0'
								max='100'
								style={{
									width: '100%',
									padding: '14px',
									backgroundColor: '#2A2725',
									border: '1px solid rgba(140, 255, 101, 0.2)',
									borderRadius: '28px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: '#FCF9F7',
									outline: 'none',
								}}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Требуются сотрудники */}
			<div style={{ marginBottom: '20px' }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						marginBottom: '12px',
					}}
				>
					<div
						style={{
							width: '40px',
							height: '40px',
							borderRadius: '10px',
							backgroundColor: needsEmployees ? '#8CFF65' : '#272727',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transition: 'all 0.2s',
							cursor: 'pointer',
						}}
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) tg.HapticFeedback.impactOccurred('light')
							setNeedsEmployees(!needsEmployees)
						}}
					>
						{needsEmployees && (
							<img src='/tick.svg' alt='Check' width={20} height={16} />
						)}
					</div>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							color: '#FCF9F7',
						}}
					>
						Требуются сотрудники
					</label>
				</div>

				{needsEmployees && (
					<div>
						{linkedVacancies.length > 0 && (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '12px',
									marginBottom: '12px',
								}}
							>
								{linkedVacancies.map(vacancy => (
									<div
										key={vacancy.id}
										style={{
											background: '#3A3735',
											borderRadius: '28px',
											padding: '16px 20px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<span
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '16px',
												color: '#FCF9F7',
												fontWeight: 600,
												flex: 1,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{vacancy.position}
										</span>
										<button
											onClick={() => removeVacancy(vacancy.id)}
											style={{
												background: 'none',
												border: 'none',
												color: 'rgba(252, 249, 247, 0.5)',
												cursor: 'pointer',
												padding: '4px',
												fontSize: '20px',
												lineHeight: 1,
											}}
										>
											×
										</button>
									</div>
								))}
							</div>
						)}

						{linkedVacancies.length < 3 && (
							<div
								onClick={() => {
									const tg = (window as any).Telegram?.WebApp
									if (tg) tg.HapticFeedback.impactOccurred('medium')
									onAddVacancy()
								}}
								style={{
									background:
										'linear-gradient(90deg, #002EE7 0%, #65FFF7 100%)',
									borderRadius: '28px',
									padding: '16px 20px',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '10px',
								}}
							>
								<img
									src='/link_btn.webp'
									alt='Link'
									width={32}
									height={32}
									style={{ width: '32px', height: '32px', flexShrink: 0 }}
								/>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										fontWeight: 600,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										maxWidth: 'calc(100% - 42px)',
									}}
								>
									{linkedVacancies.length > 0
										? '+ Добавить вакансию'
										: 'Привязать вакансию/резюме'}
								</span>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Ссылка на проект */}
			<div style={{ marginBottom: '32px' }}>
				<label
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: '#FCF9F7',
						display: 'block',
						marginBottom: '8px',
					}}
				>
					Ссылка на проект
				</label>
				<input
					type='url'
					value={projectUrl}
					onChange={e => setProjectUrl(e.target.value)}
					placeholder='Ссылка URL на сайт продукта'
					style={{
						width: '100%',
						padding: '14px',
						backgroundColor: '#2A2725',
						border: '1px solid rgba(140, 255, 101, 0.2)',
						borderRadius: '12px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						outline: 'none',
					}}
				/>
			</div>
		</>
	)
}

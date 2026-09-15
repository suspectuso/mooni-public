'use client'

const AURA_OPTIONS = [
	{
		id: 'TURQUOISE',
		label: 'Команда',
		color: '#4ECDC4',
		image: '/blue_aura.webp',
	},
	{
		id: 'ORANGE',
		label: 'Работа',
		color: '#F7710B',
		image: '/orange_aura.webp',
	},
	{
		id: 'RED',
		label: 'Любовь',
		color: '#F23318',
		image: '/red_aura.webp',
	},
]

interface AuraSelectionProps {
	selectedAura: 'TURQUOISE' | 'ORANGE' | 'RED' | 'NONE'
	onSelect: (aura: 'TURQUOISE' | 'ORANGE' | 'RED' | 'NONE') => void
}

export default function AuraSelection({
	selectedAura,
	onSelect,
}: AuraSelectionProps) {
	return (
		<div>
			<h2
				style={{
					color: '#FCF9F7',
					fontSize: '24px',
					fontWeight: 600,
					marginBottom: '12px',
					textAlign: 'center',
					fontFamily: 'LT Superior, sans-serif',
				}}
			>
				Ваша аура...
			</h2>
			<p
				style={{
					color: 'rgba(252,249,247,0.65)',
					fontSize: '14px',
					marginBottom: '32px',
					textAlign: 'center',
					fontFamily: 'LT Superior, sans-serif',
				}}
			>
				Поможет вам найти мэтч в разных
				<br />
				сферах жизни быстрее
			</p>

			{/* Первый ряд - 3 ауры */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: '16px',
					marginBottom: '24px',
				}}
			>
				{AURA_OPTIONS.map(option => (
					<div
						key={option.id}
						onClick={() => onSelect(option.id as any)}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							cursor: 'pointer',
							transition: 'transform 0.2s',
						}}
					>
						<div
							style={{
								width: '100%',
								aspectRatio: '1',
								borderRadius: '50%',
								marginBottom: '8px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								position: 'relative',
								opacity: selectedAura === option.id ? 1 : 0.4,
							}}
						>
							<img
								src={option.image}
								alt={option.label}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
								}}
							/>
						</div>
						<p
							style={{
								color: '#FCF9F7',
								fontSize: '14px',
								fontWeight: 600,
								marginBottom: '4px',
								fontFamily: 'LT Superior, sans-serif',
								textAlign: 'center',
							}}
						>
							{option.label}
						</p>
						<div
							style={{
								width: '20px',
								height: '20px',
								borderRadius: '50%',
								border: '2px solid',
								borderColor:
									selectedAura === option.id
										? option.color
										: 'rgba(252,249,247,0.2)',
								backgroundColor:
									selectedAura === option.id ? option.color : 'transparent',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{selectedAura === option.id && (
								<svg
									width='12'
									height='9'
									viewBox='0 0 14 10'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M1 5L5 9L13 1'
										stroke='#FCF9F7'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Второй ряд - "Без ауры" по центру */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					onClick={() => onSelect('NONE')}
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						cursor: 'pointer',
						width: '33%',
					}}
				>
					<p
						style={{
							color: '#FCF9F7',
							fontSize: '14px',
							fontWeight: 600,
							marginBottom: '8px',
							fontFamily: 'LT Superior, sans-serif',
						}}
					>
						Без ауры
					</p>
					<div
						style={{
							width: '20px',
							height: '20px',
							borderRadius: '50%',
							border: '2px solid',
							borderColor:
								selectedAura === 'NONE' ? '#FCF9F7' : 'rgba(252,249,247,0.2)',
							backgroundColor:
								selectedAura === 'NONE' ? '#FCF9F7' : 'transparent',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{selectedAura === 'NONE' && (
							<svg
								width='12'
								height='9'
								viewBox='0 0 14 10'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M1 5L5 9L13 1'
									stroke='#121212'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

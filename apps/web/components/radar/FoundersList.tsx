'use client'

interface Founder {
	id: string
	username: string
	avatarUrl: string | null
}

interface FoundersListProps {
	founders: Founder[]
	onRemove: (founderId: string) => void
	onAdd: () => void
}

export default function FoundersList({
	founders,
	onRemove,
	onAdd,
}: FoundersListProps) {
	return (
		<div style={{ marginBottom: '20px' }}>
			<label
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '14px',
					color: '#FCF9F7',
					display: 'block',
					marginBottom: '12px',
				}}
			>
				Основатели
			</label>
			<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
				{founders.map(founder => (
					<div
						key={founder.id}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							backgroundColor: '#3A3735',
							borderRadius: '28px',
							padding: '6px 12px 6px 6px',
						}}
					>
						<div
							style={{
								width: '25px',
								height: '25px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								overflow: 'hidden',
								flexShrink: 0,
							}}
						>
							{founder.avatarUrl ? (
								<img
									src={founder.avatarUrl}
									alt={founder.username}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
							) : (
								<div
									style={{
										width: '100%',
										height: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: '10px',
										color: '#1E1B1A',
									}}
								>
									{founder.username.substring(0, 2).toUpperCase()}
								</div>
							)}
						</div>
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
							}}
						>
							@{founder.username}
						</span>
						<button
							onClick={() => onRemove(founder.id)}
							style={{
								background: 'none',
								border: 'none',
								color: 'rgba(252, 249, 247, 0.5)',
								cursor: 'pointer',
								padding: '0 4px',
								fontSize: '16px',
							}}
						>
							×
						</button>
					</div>
				))}
				<button
					onClick={onAdd}
					style={{
						backgroundColor: '#3A3735',
						border: 'none',
						borderRadius: '28px',
						padding: '8px 16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: '#FCF9F7',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						gap: '4px',
					}}
				>
					+ Добавить
				</button>
			</div>
		</div>
	)
}

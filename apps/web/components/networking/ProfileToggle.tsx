'use client'

interface ProfileToggleProps {
	enabled: boolean
	onToggle: (enabled: boolean) => void | Promise<void>
}

export default function ProfileToggle({
	enabled,
	onToggle,
}: ProfileToggleProps) {
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
				}}
			>
				<div>
					<h2
						style={{
							color: '#FCF9F7',
							fontWeight: 600,
							fontSize: '20px',
							fontFamily: 'LT Superior, sans-serif',
							margin: 0,
							marginBottom: '4px',
						}}
					>
						Показывать в нетворкинге
					</h2>
					<p
						style={{
							color: 'rgba(252, 249, 247, 0.5)',
							fontSize: '14px',
							fontFamily: 'LT Superior, sans-serif',
							margin: 0,
						}}
					>
						{enabled ? 'Ваш профиль виден другим' : 'Ваш профиль скрыт'}
					</p>
				</div>
				<button
					onClick={() => onToggle(!enabled)}
					style={{
						width: '56px',
						height: '32px',
						borderRadius: '16px',
						border: 'none',
						cursor: 'pointer',
						position: 'relative',
						backgroundColor: enabled ? '#F7710B' : 'rgba(252, 249, 247, 0.2)',
						transition: 'background-color 0.3s',
						padding: 0,
					}}
				>
					<div
						style={{
							width: '24px',
							height: '24px',
							borderRadius: '12px',
							backgroundColor: '#FCF9F7',
							position: 'absolute',
							top: '4px',
							left: enabled ? '28px' : '4px',
							transition: 'left 0.3s',
						}}
					/>
				</button>
			</div>
		</div>
	)
}

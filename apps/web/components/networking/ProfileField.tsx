'use client'

import EditIcon from '@/components/EditIcon'

interface ProfileFieldProps {
	title: string
	value: string
	placeholder?: string
	icon?: React.ReactNode
	isEditing: boolean
	multiline?: boolean
	onEdit: () => void
	onChange: (value: string) => void
	onSave: () => void
	onCancel?: () => void
}

export default function ProfileField({
	title,
	value,
	placeholder,
	icon,
	isEditing,
	multiline = false,
	onEdit,
	onChange,
	onSave,
	onCancel: _onCancel,
}: ProfileFieldProps) {
	// Определяем максимальную длину в зависимости от поля
	const getMaxLength = () => {
		if (title === 'Формат работы') return 20
		if (title === 'Местоположение') return 50
		if (title === 'О себе') return 150
		return undefined
	}

	const maxLength = getMaxLength()

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
					marginBottom: isEditing ? '12px' : '8px',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					{icon}
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
				</div>
				{!isEditing && (
					<button
						onClick={onEdit}
						style={{
							cursor: 'pointer',
							background: 'none',
							border: 'none',
							padding: 0,
						}}
					>
						<EditIcon />
					</button>
				)}
			</div>
			{isEditing ? (
				<>
					{multiline ? (
						<>
							<textarea
								value={value}
								onChange={e => onChange(e.target.value)}
								maxLength={maxLength}
								rows={4}
								placeholder={placeholder}
								style={{
									width: '100%',
									backgroundColor: '#3a3a3a',
									border: 'none',
									borderRadius: '16px',
									padding: '12px 16px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '15px',
									color: '#FCF9F7',
									outline: 'none',
									resize: 'none',
									marginBottom: '8px',
									boxSizing: 'border-box',
									wordWrap: 'break-word',
									overflowWrap: 'break-word',
								}}
							/>
							{maxLength && (
								<div
									style={{
										textAlign: 'right',
										fontSize: '12px',
										color: 'rgba(252, 249, 247, 0.5)',
										marginBottom: '12px',
										fontFamily: 'LT Superior, sans-serif',
									}}
								>
									{value.length}/{maxLength}
								</div>
							)}
						</>
					) : (
						<>
							<input
								type='text'
								value={value}
								onChange={e => onChange(e.target.value)}
								maxLength={maxLength}
								placeholder={placeholder}
								style={{
									width: '100%',
									backgroundColor: '#3a3a3a',
									border: 'none',
									borderRadius: '16px',
									padding: '12px 16px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '15px',
									color: '#FCF9F7',
									outline: 'none',
									marginBottom: '8px',
									boxSizing: 'border-box',
								}}
							/>
							{maxLength && (
								<div
									style={{
										textAlign: 'right',
										fontSize: '12px',
										color: 'rgba(252, 249, 247, 0.5)',
										marginBottom: '12px',
										fontFamily: 'LT Superior, sans-serif',
									}}
								>
									{value.length}/{maxLength}
								</div>
							)}
						</>
					)}
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
						Сохранить изменения
					</button>
				</>
			) : (
				<p
					style={{
						color: '#FCF9F7',
						fontSize: '15px',
						fontFamily: 'LT Superior, sans-serif',
						lineHeight: multiline ? '1.5' : 'normal',
						margin: 0,
						wordWrap: 'break-word',
						overflowWrap: 'break-word',
					}}
				>
					{value || placeholder || 'Не указано'}
				</p>
			)}
		</div>
	)
}

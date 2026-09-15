'use client'

interface EditAboutModalProps {
	show: boolean
	aboutMe: string
	onClose: () => void
	onChange: (value: string) => void
}

export default function EditAboutModal({
	show,
	aboutMe,
	onClose,
	onChange,
}: EditAboutModalProps) {
	if (!show) return null

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
					animation: 'slideUp 0.3s ease',
				}}
				onClick={e => e.stopPropagation()}
			>
				<h3
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '22px',
						color: '#FCF9F7',
						marginBottom: '16px',
					}}
				>
					Обо мне
				</h3>
				<textarea
					value={aboutMe}
					onChange={e => onChange(e.target.value)}
					placeholder='Это описание будут видеть работодатели/исполнители в профиле исполнителя или компании'
					rows={5}
					style={{
						width: '100%',
						backgroundColor: '#3a3a3a',
						border: 'none',
						borderRadius: '16px',
						padding: '16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						outline: 'none',
						resize: 'none',
						marginBottom: '16px',
						transition: 'all 0.3s ease',
					}}
				/>
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

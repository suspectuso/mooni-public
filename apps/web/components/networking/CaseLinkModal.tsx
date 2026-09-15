'use client'

interface CaseLinkModalProps {
	isOpen: boolean
	link: string
	onClose: () => void
	onChange: (link: string) => void
	onSave: () => void
}

export default function CaseLinkModal({
	isOpen,
	link,
	onClose,
	onChange,
	onSave,
}: CaseLinkModalProps) {
	if (!isOpen) return null

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
				flexDirection: 'column',
				justifyContent: 'flex-end',
				zIndex: 1001,
			}}
			onClick={onClose}
		>
			<div
				onClick={e => e.stopPropagation()}
				style={{
					backgroundColor: '#272727',
					borderRadius: '28px 28px 0 0',
					padding: '24px',
				}}
			>
				<h3
					style={{
						color: '#FCF9F7',
						fontFamily: 'Oks, sans-serif',
						fontSize: '20px',
						marginBottom: '8px',
						textAlign: 'center',
					}}
				>
					Добавить кейс
				</h3>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: '16px',
					}}
				>
					<svg
						width='24'
						height='12'
						viewBox='0 0 24 12'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M18 0H14.4C13.74 0 13.2 0.54 13.2 1.2C13.2 1.86 13.74 2.4 14.4 2.4H18C19.98 2.4 21.6 4.02 21.6 6C21.6 7.98 19.98 9.6 18 9.6H14.4C13.74 9.6 13.2 10.14 13.2 10.8C13.2 11.46 13.74 12 14.4 12H18C21.312 12 24 9.312 24 6C24 2.688 21.312 0 18 0ZM7.2 6C7.2 6.66 7.74 7.2 8.4 7.2H15.6C16.26 7.2 16.8 6.66 16.8 6C16.8 5.34 16.26 4.8 15.6 4.8H8.4C7.74 4.8 7.2 5.34 7.2 6ZM9.6 9.6H6C4.02 9.6 2.4 7.98 2.4 6C2.4 4.02 4.02 2.4 6 2.4H9.6C10.26 2.4 10.8 1.86 10.8 1.2C10.8 0.54 10.26 0 9.6 0H6C2.688 0 0 2.688 0 6C0 9.312 2.688 12 6 12H9.6C10.26 12 10.8 11.46 10.8 10.8C10.8 10.14 10.26 9.6 9.6 9.6Z'
							fill='#FCF9F7'
							fillOpacity='0.65'
						/>
					</svg>
				</div>
				<input
					type='url'
					value={link}
					onChange={e => onChange(e.target.value)}
					placeholder='https://...'
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
						marginBottom: '16px',
					}}
				/>
				<button
					onClick={onSave}
					style={{
						width: '100%',
						backgroundColor: '#65FFF7',
						border: 'none',
						borderRadius: '28px',
						padding: '16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '18px',
						color: '#1D1D1B',
						cursor: 'pointer',
						fontWeight: 600,
					}}
				>
					Добавить
				</button>
			</div>
		</div>
	)
}

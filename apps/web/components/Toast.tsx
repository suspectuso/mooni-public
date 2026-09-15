import { useEffect } from 'react'

interface ToastProps {
	message: string
	type: 'success' | 'error'
	onClose: () => void
	duration?: number
}

export default function Toast({
	message,
	type,
	onClose,
	duration = 3000,
}: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose()
		}, duration)

		return () => clearTimeout(timer)
	}, [duration, onClose])

	return (
		<div
			style={{
				position: 'fixed',
				top: '20px',
				left: '50%',
				transform: 'translateX(-50%)',
				backgroundColor: 'rgba(60, 60, 60, 0.95)',
				backdropFilter: 'blur(10px)',
				WebkitBackdropFilter: 'blur(10px)',
				borderRadius: '20px',
				padding: '16px 20px',
				display: 'flex',
				alignItems: 'center',
				gap: '12px',
				zIndex: 10000,
				minWidth: '280px',
				maxWidth: '90vw',
				boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
				animation: 'slideDown 0.3s ease-out',
			}}
		>
			{type === 'success' ? (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					style={{ flexShrink: 0 }}
				>
					<circle cx='12' cy='12' r='10' fill='#65FFF7' />
					<path
						d='M8 12L11 15L16 9'
						stroke='#121212'
						strokeWidth='3'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			) : (
				<svg
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					style={{ flexShrink: 0 }}
				>
					<circle cx='12' cy='12' r='10' fill='#FF4444' />
					<path
						d='M8 8L16 16M16 8L8 16'
						stroke='#121212'
						strokeWidth='3'
						strokeLinecap='round'
					/>
				</svg>
			)}
			<p
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '15px',
					color: '#FCF9F7',
					margin: 0,
					fontWeight: 500,
					flex: 1,
				}}
			>
				{message}
			</p>
			<style jsx>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateX(-50%) translateY(-20px);
					}
					to {
						opacity: 1;
						transform: translateX(-50%) translateY(0);
					}
				}
			`}</style>
		</div>
	)
}

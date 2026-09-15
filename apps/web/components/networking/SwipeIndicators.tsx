'use client'

interface SwipeIndicatorsProps {
	dragOffset: number
	isAnimatingOut: boolean
	swipeDirection: 'left' | 'right' | null
	isDragging: boolean
	isFadingOut: boolean
}

export default function SwipeIndicators({
	dragOffset,
	isAnimatingOut,
	swipeDirection,
	isDragging,
}: SwipeIndicatorsProps) {
	// Лайк (свайп вправо) — оранжевое свечение
	const likeActive = dragOffset > 30 || (isAnimatingOut && swipeDirection === 'right')
	const likeOpacity = isAnimatingOut && swipeDirection === 'right'
		? 0.8
		: dragOffset > 30
			? Math.min((dragOffset - 30) / 120, 0.8)
			: 0

	// Пропуск (свайп влево) — лёгкое затемнение
	const skipOpacity = isAnimatingOut && swipeDirection === 'left'
		? 0.35
		: dragOffset < -50
			? Math.min(Math.abs(dragOffset + 50) / 150, 0.35)
			: 0

	return (
		<>
			{/* Затемнение при свайпе влево (пропуск) */}
			<div
				className='fixed inset-0 pointer-events-none'
				style={{
					backgroundColor: 'rgba(0, 0, 0, 1)',
					opacity: skipOpacity,
					zIndex: 100,
					transition: isDragging ? 'opacity 0.05s linear' : 'opacity 0.2s ease-out',
					willChange: 'opacity',
				}}
			/>

			{/* Прожекторы при свайпе вправо (лайк) */}
			<div
				className='fixed inset-0 pointer-events-none'
				style={{
					opacity: likeOpacity,
					zIndex: 10,
					transition: isDragging ? 'opacity 0.05s linear' : 'opacity 0.3s ease-out',
					willChange: 'opacity',
					background: `
						radial-gradient(ellipse 50% 80% at 20% 0%, rgba(255, 140, 0, 0.9) 0%, rgba(255, 100, 0, 0.3) 30%, transparent 60%),
						radial-gradient(ellipse 50% 80% at 80% 0%, rgba(255, 140, 0, 0.9) 0%, rgba(255, 100, 0, 0.3) 30%, transparent 60%),
						radial-gradient(ellipse 90% 50% at 50% 20%, rgba(255, 120, 0, 0.6) 0%, rgba(247, 113, 11, 0.15) 50%, transparent 80%),
						radial-gradient(ellipse 40% 60% at 50% 100%, rgba(255, 80, 0, 0.4) 0%, transparent 50%)
					`,
				}}
			/>
		</>
	)
}

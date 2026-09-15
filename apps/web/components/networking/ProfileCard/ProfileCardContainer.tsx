'use client'

import { NetworkingProfile } from '@/types/networking'

interface ProfileCardContainerProps {
	profile: NetworkingProfile
	isCurrentCard: boolean
	isSecondCard: boolean
	visibleProfilesLength: number
	index: number
	dragOffset: number
	rotation: number
	opacity: number
	isDragging: boolean
	isAnimatingOut: boolean
	swipeDirection: 'left' | 'right' | null
	isSwipeDisabled: boolean
	onTouchStart?: (e: React.TouchEvent) => void
	onTouchMove?: (e: React.TouchEvent) => void
	onTouchEnd?: (e: React.TouchEvent) => void
	onMouseDown?: (e: React.MouseEvent) => void
	onCardClick: () => void
	children: React.ReactNode
	overlay?: React.ReactNode
}

export default function ProfileCardContainer({
	profile: _profile,
	isCurrentCard,
	isSecondCard,
	visibleProfilesLength,
	index,
	dragOffset,
	rotation,
	opacity,
	isDragging,
	isAnimatingOut,
	swipeDirection,
	isSwipeDisabled,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onMouseDown,
	onCardClick: _onCardClick,
	children,
	overlay,
}: ProfileCardContainerProps) {
	const baseRotation = isSecondCard ? 4 : 0
	const scale = isCurrentCard ? 1 : 0.98
	const translateY = isCurrentCard ? 0 : 8
	const zIndex = visibleProfilesLength - index

	let cardTransform
	if (isCurrentCard) {
		if (isAnimatingOut) {
			const startOffset =
				swipeDirection === 'right'
					? Math.max(dragOffset, 150)
					: Math.min(dragOffset, -150)
			const flyOutDistance = swipeDirection === 'right' ? 2000 : -2000
			const flyOutRotation = swipeDirection === 'right' ? 90 : -90
			cardTransform = `translateX(${flyOutDistance}px) rotate(${flyOutRotation}deg)`
		} else {
			cardTransform = `translateX(${dragOffset}px) rotate(${rotation}deg)`
		}
	} else if (isSecondCard) {
		if (isAnimatingOut) {
			cardTransform = `scale(1) translateY(0px) rotate(0deg)`
		} else {
			cardTransform = `scale(${scale}) translateY(${translateY}px) rotate(${baseRotation}deg)`
		}
	} else {
		cardTransform = `scale(${scale}) translateY(${translateY}px) rotate(${baseRotation}deg)`
	}

	const cardTransition = isCurrentCard
		? isAnimatingOut
			? 'transform 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease-out'
			: isDragging
				? 'none'
				: 'transform 0.3s ease-out, opacity 0.3s ease-out'
		: isAnimatingOut && isSecondCard
			? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out'
			: 'transform 0.3s ease-out, opacity 0.3s ease-out'

	let cardOpacity
	if (isCurrentCard) {
		if (isAnimatingOut) {
			cardOpacity = 1
		} else {
			cardOpacity = opacity
		}
	} else if (isSecondCard) {
		if (isAnimatingOut) {
			cardOpacity = 1
		} else {
			cardOpacity = 0.7
		}
	} else {
		cardOpacity = 0
	}

	return (
		<div
			className='absolute inset-0'
			style={{
				zIndex: zIndex,
				pointerEvents: isCurrentCard ? 'auto' : 'none',
				userSelect: 'none',
			}}
		>
			<div
				style={{
					transform: cardTransform,
					transition: cardTransition,
					opacity: cardOpacity,
					cursor: isCurrentCard
						? isDragging
							? 'grabbing'
							: isSwipeDisabled
								? 'default'
								: 'grab'
						: 'default',
					width: '100%',
					height: '100%',
					position: 'relative',
					willChange: 'transform, opacity',
					backfaceVisibility: 'hidden',
				}}
				onTouchStart={isCurrentCard ? onTouchStart : undefined}
				onTouchMove={isCurrentCard ? onTouchMove : undefined}
				onTouchEnd={isCurrentCard ? onTouchEnd : undefined}
				onMouseDown={isCurrentCard ? onMouseDown : undefined}
			>
				<div
					className='w-full h-full rounded-[18px] overflow-hidden relative'
					style={{
						backgroundColor: '#282826',
						zIndex: 1,
					}}
				>
					{children}
				</div>
				{overlay}
			</div>
		</div>
	)
}

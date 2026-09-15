import { useState } from 'react'

export const useNetworkingSwipe = (
	hasActiveSubscription: boolean,
	_likesCount: number,
	_swipesCount: number,
	_incrementLikes: () => void,
	_incrementSwipes: () => void,
	_setLimitReached: (reached: boolean) => void,
	_setLimitMessage: (message: string) => void,
) => {
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [isSwipeDisabled, setIsSwipeDisabled] = useState(false)
	const [isAnimatingOut, setIsAnimatingOut] = useState(false)
	const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
		null,
	)
	const [isFadingOut, setIsFadingOut] = useState(false)
	const [adDragOffset, setAdDragOffset] = useState(0)
	const [isAdShaking, setIsAdShaking] = useState(false)

	const SWIPES_LIMIT = 50
	const LIKES_LIMIT = 20
	const isDev = false

	const handleTouchStart = (e: React.TouchEvent, limitReached: boolean) => {
		if (isSwipeDisabled) return

		if (limitReached && !hasActiveSubscription) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) tg.HapticFeedback.notificationOccurred('error')
			return
		}

		setIsDragging(true)
		setStartX(e.touches[0].clientX)

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('soft')
		}
	}

	const handleTouchMove = (e: React.TouchEvent, limitReached: boolean) => {
		if (!isDragging || isSwipeDisabled) return
		if (limitReached && !hasActiveSubscription) return

		const currentX = e.touches[0].clientX
		const diff = currentX - startX
		const resistance = 0.8
		setDragOffset(diff * resistance)

		if (Math.abs(diff * resistance) > 80) {
			const tg = (window as any).Telegram?.WebApp
			if (tg && Math.abs(diff * resistance) < 85) {
				tg.HapticFeedback.impactOccurred('light')
			}
		}
	}

	const handleTouchEnd = (
		limitReached: boolean,
		handleLike: () => void,
		handlePass: () => void,
	) => {
		if (isSwipeDisabled) return

		if (limitReached && !hasActiveSubscription) {
			setIsDragging(false)
			setDragOffset(0)
			return
		}

		setIsDragging(false)

		if (Math.abs(dragOffset) > 70) {
			if (dragOffset > 0) {
				handleLike()
			} else {
				handlePass()
			}
			return
		}

		const tg = (window as any).Telegram?.WebApp
		if (tg && Math.abs(dragOffset) > 30) {
			tg.HapticFeedback.impactOccurred('soft')
		}
		setDragOffset(0)
	}

	return {
		dragOffset,
		setDragOffset,
		isDragging,
		setIsDragging,
		startX,
		setStartX,
		isSwipeDisabled,
		setIsSwipeDisabled,
		isAnimatingOut,
		setIsAnimatingOut,
		swipeDirection,
		setSwipeDirection,
		isFadingOut,
		setIsFadingOut,
		adDragOffset,
		setAdDragOffset,
		isAdShaking,
		setIsAdShaking,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
	}
}

'use client'

import { useEffect, useRef, useState } from 'react'

interface UseSwipeGesturesProps {
	isSwipeDisabled: boolean
	limitReached: boolean
	hasActiveSubscription: boolean
	onSwipeLeft: () => void
	onSwipeRight: () => void
}

export function useSwipeGestures({
	isSwipeDisabled,
	limitReached,
	hasActiveSubscription,
	onSwipeLeft,
	onSwipeRight,
}: UseSwipeGesturesProps) {
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const dragOffsetRef = useRef(0)

	const updateDragOffset = (value: number) => {
		setDragOffset(value)
		dragOffsetRef.current = value
	}

	const handleTouchStart = (e: React.TouchEvent) => {
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

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging || isSwipeDisabled) return
		if (limitReached && !hasActiveSubscription) return
		const currentX = e.touches[0].clientX
		const diff = currentX - startX
		const resistance = 0.8
		updateDragOffset(diff * resistance)

		if (Math.abs(diff * resistance) > 80) {
			const tg = (window as any).Telegram?.WebApp
			if (tg && Math.abs(diff * resistance) < 85) {
				tg.HapticFeedback.impactOccurred('light')
			}
		}
	}

	const handleTouchEnd = () => {
		if (isSwipeDisabled) return
		if (limitReached && !hasActiveSubscription) {
			setIsDragging(false)
			updateDragOffset(0)
			return
		}
		setIsDragging(false)

		const currentOffset = dragOffsetRef.current
		if (Math.abs(currentOffset) > 70) {
			if (currentOffset > 0) {
				onSwipeRight()
			} else {
				onSwipeLeft()
			}
			return
		}

		const tg = (window as any).Telegram?.WebApp
		if (tg && Math.abs(currentOffset) > 30) {
			tg.HapticFeedback.impactOccurred('soft')
		}
		updateDragOffset(0)
	}

	const handleMouseDown = (e: React.MouseEvent) => {
		if (isSwipeDisabled) return
		if (limitReached && !hasActiveSubscription) {
			const tg = (window as any).Telegram?.WebApp
			if (tg) tg.HapticFeedback.notificationOccurred('error')
			return
		}
		setIsDragging(true)
		setStartX(e.clientX)
		e.preventDefault()
	}

	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!isDragging || isSwipeDisabled) return
			if (limitReached && !hasActiveSubscription) return
			const currentX = e.clientX
			const diff = currentX - startX
			const resistance = 0.8
			updateDragOffset(diff * resistance)
		}

		const handleGlobalMouseUp = () => {
			if (!isDragging || isSwipeDisabled) return
			if (limitReached && !hasActiveSubscription) {
				setIsDragging(false)
				updateDragOffset(0)
				return
			}
			setIsDragging(false)

			const currentOffset = dragOffsetRef.current
			if (Math.abs(currentOffset) > 70) {
				if (currentOffset > 0) {
					onSwipeRight()
				} else {
					onSwipeLeft()
				}
			} else {
				updateDragOffset(0)
			}
		}

		if (isDragging) {
			document.addEventListener('mousemove', handleGlobalMouseMove)
			document.addEventListener('mouseup', handleGlobalMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('mouseup', handleGlobalMouseUp)
		}
	}, [
		isDragging,
		isSwipeDisabled,
		startX,
		limitReached,
		hasActiveSubscription,
	])

	return {
		dragOffset,
		isDragging,
		setDragOffset: updateDragOffset,
		setIsDragging,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleMouseDown,
	}
}

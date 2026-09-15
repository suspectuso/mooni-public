'use client'

import { useState } from 'react'
import AdCard from './AdCard'

interface AdCardWrapperProps {
	onClose: () => void
	onOpenSubscription: () => void
}

export default function AdCardWrapper({
	onClose,
	onOpenSubscription,
}: AdCardWrapperProps) {
	const [adDragOffset, setAdDragOffset] = useState(0)
	const [isAdShaking, setIsAdShaking] = useState(false)
	const [startX, setStartX] = useState(0)

	const handleShake = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.notificationOccurred('error')
		}
		setIsAdShaking(true)
		setTimeout(() => {
			setAdDragOffset(0)
			setIsAdShaking(false)
		}, 500)
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		if (!isAdShaking) {
			setStartX(e.touches[0].clientX)
		}
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isAdShaking) {
			const currentX = e.touches[0].clientX
			const diff = currentX - startX
			setAdDragOffset(Math.min(Math.max(diff * 0.3, -50), 50))
		}
	}

	const handleTouchEnd = () => {
		if (!isAdShaking && Math.abs(adDragOffset) > 10) {
			handleShake()
		} else {
			setAdDragOffset(0)
		}
	}

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!isAdShaking) {
			setStartX(e.clientX)
		}
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isAdShaking && e.buttons === 1) {
			const diff = e.clientX - startX
			setAdDragOffset(Math.min(Math.max(diff * 0.3, -50), 50))
		}
	}

	const handleMouseUp = () => {
		if (!isAdShaking && Math.abs(adDragOffset) > 10) {
			handleShake()
		} else {
			setAdDragOffset(0)
		}
	}

	const handleMouseLeave = () => {
		if (!isAdShaking) {
			setAdDragOffset(0)
		}
	}

	return (
		<div
			style={{
				transform: isAdShaking
					? 'translateX(0) rotate(0deg)'
					: `translateX(${Math.min(Math.max(adDragOffset, -50), 50)}px) rotate(${Math.min(Math.max(adDragOffset, -50), 50) * 0.02}deg)`,
				transition: isAdShaking
					? 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
					: 'none',
				opacity: 1,
				cursor: 'grab',
				width: '100%',
				height: '100%',
				position: 'relative',
				animation: isAdShaking ? 'shake 0.5s' : 'none',
			}}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
		>
			<AdCard onClose={onClose} onOpenSubscription={onOpenSubscription} />
		</div>
	)
}

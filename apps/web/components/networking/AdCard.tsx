'use client'

import { useState } from 'react'

interface AdCardProps {
	onClose: () => void
	onOpenSubscription: () => void
}

export default function AdCard({ onClose, onOpenSubscription }: AdCardProps) {
	const [isClosing, setIsClosing] = useState(false)

	const handleClose = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}

		setIsClosing(true)
		// Ждем завершения анимации перед вызовом onClose
		setTimeout(() => {
			onClose()
		}, 300)
	}

	const handleOpenSubscription = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}
		onOpenSubscription()
	}

	return (
		<div
			style={{
				position: 'relative',
				width: '90vw',
				maxWidth: '450px',
				height: '52vh',
				maxHeight: '480px',
				borderRadius: '28px',
				overflow: 'hidden',
				background: 'linear-gradient(180deg, #F23318 0%, #F7710B 100%)',
				opacity: isClosing ? 0 : 1,
				transform: isClosing ? 'translateX(100%)' : 'translateX(0)',
				transition: 'opacity 0.3s ease, transform 0.3s ease',
			}}
		>
			{/* Изображение рекламы - растянуто по высоте, ограничено по ширине */}
			<div
				onClick={handleOpenSubscription}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
				}}
			>
				<img
					src='/ad_netw_plus.webp'
					alt='Нетворкинг+'
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
				/>
			</div>

			{/* Кнопка skip - левый верхний угол */}
			<button
				onClick={handleClose}
				style={{
					position: 'absolute',
					top: '16px',
					left: '16px',
					width: '46px',
					height: '46px',
					borderRadius: '50%',
					border: 'none',
					background: 'transparent',
					cursor: 'pointer',
					padding: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 10,
					transition: 'transform 0.2s',
				}}
				onMouseDown={e => {
					e.currentTarget.style.transform = 'scale(0.95)'
				}}
				onMouseUp={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
				onMouseLeave={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
				onTouchStart={e => {
					e.currentTarget.style.transform = 'scale(0.95)'
				}}
				onTouchEnd={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
			>
				<img
					src='/skip_ad.webp'
					alt='Закрыть'
					width={46}
					height={46}
					style={{
						width: '46px',
						height: '46px',
					}}
				/>
			</button>

			{/* Кнопка add_match - правый верхний угол */}
			<button
				onClick={handleOpenSubscription}
				style={{
					position: 'absolute',
					top: '16px',
					right: '16px',
					width: '46px',
					height: '46px',
					borderRadius: '50%',
					border: 'none',
					background: 'transparent',
					cursor: 'pointer',
					padding: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 10,
					transition: 'transform 0.2s',
				}}
				onMouseDown={e => {
					e.currentTarget.style.transform = 'scale(0.95)'
				}}
				onMouseUp={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
				onMouseLeave={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
				onTouchStart={e => {
					e.currentTarget.style.transform = 'scale(0.95)'
				}}
				onTouchEnd={e => {
					e.currentTarget.style.transform = 'scale(1)'
				}}
			>
				<img
					src='/add_match.webp'
					alt='Добавить'
					width={46}
					height={46}
					style={{
						width: '46px',
						height: '46px',
					}}
				/>
			</button>
		</div>
	)
}

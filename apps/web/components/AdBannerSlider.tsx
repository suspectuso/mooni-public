'use client'

import { useRef, useState } from 'react'

const AdBannerSlider = () => {
	const [currentBanner, setCurrentBanner] = useState(0)
	const scrollRef = useRef<HTMLDivElement>(null)
	const [touchStartX, setTouchStartX] = useState(0)
	const [touchStartY, setTouchStartY] = useState(0)
	const [hasMoved, setHasMoved] = useState(false)

	const banners = [
		{
			src: '/ad_anomaliya.png',
			alt: 'Реклама',
			href: 'https://t.me/anomaly_grebenuk_bot?start=ambassador_751385399',
		},
		{
			src: '/ad_banner_nav.png',
			alt: 'Реклама',
			href: 'https://t.me/markkorovaichikov',
		},
		{
			src: '/banner_eco.webp',
			alt: 'Экосистема',
			href: '/ecosystem',
		},
	]

	const handleClick = (e: React.MouseEvent, href: string) => {
		// Если был свайп - не переходим по ссылке
		if (hasMoved) {
			e.preventDefault()
			return
		}

		// Открываем ссылку
		e.preventDefault()
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}

		// Если внутренняя ссылка - используем роутер, если внешняя - открываем внутри Telegram
		if (href.startsWith('/')) {
			window.location.href = href
		} else {
			// Открываем внешние ссылки внутри Telegram (не в браузере)
			tg?.openTelegramLink(href)
		}
	}

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const container = e.currentTarget
		const scrollLeft = container.scrollLeft
		const containerWidth = container.offsetWidth
		const index = Math.round(scrollLeft / containerWidth)
		setCurrentBanner(index)
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStartX(e.touches[0].clientX)
		setTouchStartY(e.touches[0].clientY)
		setHasMoved(false)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		const deltaX = Math.abs(e.touches[0].clientX - touchStartX)
		const deltaY = Math.abs(e.touches[0].clientY - touchStartY)

		// Если движение больше 10px - считаем что это свайп
		if (deltaX > 10 || deltaY > 10) {
			setHasMoved(true)
		}
	}

	const handleTouchEnd = () => {
		// Сбрасываем флаг через небольшую задержку
		setTimeout(() => setHasMoved(false), 50)
	}

	const goToSlide = (index: number) => {
		if (scrollRef.current) {
			const containerWidth = scrollRef.current.offsetWidth
			scrollRef.current.scrollTo({
				left: index * containerWidth,
				behavior: 'smooth',
			})
			setCurrentBanner(index)
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.HapticFeedback.impactOccurred('light')
			}
		}
	}

	return (
		<div style={{ width: '100%' }}>
			<div
				ref={scrollRef}
				style={{
					display: 'flex',
					overflowX: 'scroll',
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					WebkitOverflowScrolling: 'touch',
					scrollSnapType: 'x mandatory',
				}}
				className='hide-scrollbar'
				onScroll={handleScroll}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{banners.map((banner, index) => (
					<div
						key={index}
						style={{
							minWidth: '100%',
							maxWidth: '100%',
							flexShrink: 0,
							scrollSnapAlign: 'start',
							scrollSnapStop: 'always',
							padding: '0 10px',
							boxSizing: 'border-box',
						}}
					>
						<div
							onClick={e => handleClick(e, banner.href)}
							style={{
								display: 'block',
								cursor: 'pointer',
								transition: 'transform 0.2s',
							}}
							onTouchStart={e => {
								e.currentTarget.style.transform = 'scale(0.98)'
							}}
							onTouchEnd={e => {
								e.currentTarget.style.transform = 'scale(1)'
							}}
						>
							<img
								src={banner.src}
								alt={banner.alt}
								width={440}
								height={115}
								style={{
									width: '100%',
									height: 'auto',
									borderRadius: '16px',
									display: 'block',
									pointerEvents: 'none',
								}}
								draggable={false}
							/>
						</div>
					</div>
				))}
			</div>

			{/* Индикаторы */}
			{banners.length > 1 && (
				<div
					style={{
						display: 'flex',
						gap: '8px',
						justifyContent: 'center',
						marginTop: '12px',
					}}
				>
					{banners.map((_, index) => (
						<button
							key={index}
							onClick={() => goToSlide(index)}
							style={{
								width: currentBanner === index ? '25px' : '6px',
								height: '6px',
								borderRadius: currentBanner === index ? '3px' : '50%',
								backgroundColor:
									currentBanner === index
										? '#FCF9F7'
										: 'rgba(252, 249, 247, 0.45)',
								transition: 'all 0.3s ease',
								border: 'none',
								padding: 0,
								cursor: 'pointer',
							}}
							aria-label={`Перейти к баннеру ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default AdBannerSlider

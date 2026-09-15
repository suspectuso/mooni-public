'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useState } from 'react'

// Вынесли стили наружу
const navStyles = {
	position: 'fixed' as const,
	left: 0,
	right: 0,
	bottom: 0,
	paddingBottom: '20px',
	zIndex: 100,
	pointerEvents: 'none' as const,
	transform: 'translate3d(0, 0, 0)',
	backfaceVisibility: 'hidden' as const,
	WebkitBackfaceVisibility: 'hidden' as const,
}

const containerStyles = {
	position: 'relative' as const,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 100,
	pointerEvents: 'auto' as const,
}

const navBarStyles = {
	position: 'relative' as const,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '20px',
	height: '70px',
	width: '90vw',
	maxWidth: '358px',
	// стеклянная пилюля как на главной (C2)
	backgroundColor: 'rgba(255, 255, 255, 0.25)',
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	boxShadow:
		'0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
	border: '1px solid rgba(255,255,255,0.3)',
	padding: '0 20px',
	borderRadius: '28px',
}

const linkStyles = {
	position: 'relative' as const,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	transition: 'all 0.3s',
	width: '70px',
	height: '70px',
}

const NetworkingBottomNav = memo(() => {
	console.log('[NetworkingBottomNav] 🔄 Component rendering')

	const pathname = usePathname()
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

	console.log('[NetworkingBottomNav] State:', {
		pathname,
		isKeyboardOpen,
	})

	const isActive = useCallback((path: string) => pathname === path, [pathname])

	const handleClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
		}
	}, [])

	useEffect(() => {
		// Фиксируем высоту viewport для Telegram
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.expand()
			tg.disableVerticalSwipes()
		}

		// Отслеживаем фокус на input/textarea
		const handleFocus = (e: FocusEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				setIsKeyboardOpen(true)
			}
		}

		const handleBlur = (e: FocusEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				setIsKeyboardOpen(false)
			}
		}

		document.addEventListener('focusin', handleFocus)
		document.addEventListener('focusout', handleBlur)

		return () => {
			document.removeEventListener('focusin', handleFocus)
			document.removeEventListener('focusout', handleBlur)
		}
	}, [])

	// Скрываем навигацию когда клавиатура открыта
	if (isKeyboardOpen) {
		return null
	}

	return (
		<nav className='flex justify-center items-end' style={navStyles}>
			<div style={containerStyles}>
				<div style={navBarStyles}>
					{/* Левый круг - Лайки (Сердечко) */}
					<Link
						href='/networking/likes'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/networking/likes') ? 30 : 10,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/networking/likes') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='37'
										height='33'
										viewBox='0 0 37 33'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M35.846 4.65685C34.2964 1.51288 29.8327 -1.05946 24.6403 0.43821C22.1592 1.14673 19.9944 2.66618 18.4997 4.74831C17.0051 2.66618 14.8403 1.14673 12.3592 0.43821C7.15526 -1.0366 2.70305 1.51288 1.15344 4.65685C-1.02063 9.05841 -0.118619 14.0087 3.83634 19.3706C6.93554 23.5664 11.3646 27.8193 17.7943 32.7582C17.9975 32.9149 18.2478 33 18.5055 33C18.7632 33 19.0135 32.9149 19.2167 32.7582C25.6349 27.8308 30.0755 23.6121 33.1747 19.3706C37.1181 14.0087 38.0201 9.05841 35.846 4.65685Z'
											fill='#1D1D1B'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='37'
									height='33'
									viewBox='0 0 37 33'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M35.846 4.65685C34.2964 1.51288 29.8327 -1.05946 24.6403 0.43821C22.1592 1.14673 19.9944 2.66618 18.4997 4.74831C17.0051 2.66618 14.8403 1.14673 12.3592 0.43821C7.15526 -1.0366 2.70305 1.51288 1.15344 4.65685C-1.02063 9.05841 -0.118619 14.0087 3.83634 19.3706C6.93554 23.5664 11.3646 27.8193 17.7943 32.7582C17.9975 32.9149 18.2478 33 18.5055 33C18.7632 33 19.0135 32.9149 19.2167 32.7582C25.6349 27.8308 30.0755 23.6121 33.1747 19.3706C37.1181 14.0087 38.0201 9.05841 35.846 4.65685Z'
										fill='#FCF9F7'
										fillOpacity='0.45'
									/>
								</svg>
							)}
						</div>
					</Link>

					{/* Центральный круг - Меню */}
					<Link
						href='/networking'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/networking') ? 30 : 25,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/networking') ? (
								<div
									className='rounded-full flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '62px',
										height: '62px',
										animation: 'scaleIn 0.3s ease-out',
										filter: 'brightness(1.3)',
									}}
								>
									<img
										src='/netw_menu.webp'
										alt='Menu'
										style={{
											width: '62px',
											height: '62px',
										}}
									/>
								</div>
							) : (
								<img
									src='/netw_menu.webp'
									alt='Menu'
									style={{
										width: '62px',
										height: '62px',
										transition: 'filter 0.3s ease',
									}}
								/>
							)}
						</div>
					</Link>

					{/* Правый круг - Профиль */}
					<Link
						href='/networking/profile'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/networking/profile') ? 30 : 10,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/networking/profile') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='30'
										height='34'
										viewBox='0 0 30 34'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M15 19.8576C20.0063 19.8576 30 23.0163 30 29.2863V32.0002C30 33.1048 29.1046 34.0002 28 34.0002H2C0.895431 34.0002 0 33.1048 0 32.0002L0 29.2863C0 23.0163 9.99375 19.8576 15 19.8576ZM11.9385 0.609558C13.4002 0.00408872 15.0088 -0.155114 16.5605 0.153503C18.1124 0.462185 19.5384 1.22414 20.6572 2.34296C21.776 3.46178 22.538 4.88779 22.8467 6.43964C23.1553 7.99141 22.9961 9.59997 22.3906 11.0617C21.7851 12.5234 20.7599 13.7725 19.4443 14.6516C18.1287 15.5306 16.5822 16.0002 15 16.0002C12.8783 16.0002 10.8431 15.1577 9.34277 13.6574C7.84248 12.1571 7 10.1219 7 8.00018C7 6.41793 7.46958 4.87144 8.34863 3.55585C9.22764 2.24032 10.4768 1.21507 11.9385 0.609558Z'
											fill='#1D1D1B'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='30'
									height='34'
									viewBox='0 0 30 34'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M15 19.8576C20.0063 19.8576 30 23.0163 30 29.2863V32.0002C30 33.1048 29.1046 34.0002 28 34.0002H2C0.895431 34.0002 0 33.1048 0 32.0002L0 29.2863C0 23.0163 9.99375 19.8576 15 19.8576ZM11.9385 0.609558C13.4002 0.00408872 15.0088 -0.155114 16.5605 0.153503C18.1124 0.462185 19.5384 1.22414 20.6572 2.34296C21.776 3.46178 22.538 4.88779 22.8467 6.43964C23.1553 7.99141 22.9961 9.59997 22.3906 11.0617C21.7851 12.5234 20.7599 13.7725 19.4443 14.6516C18.1287 15.5306 16.5822 16.0002 15 16.0002C12.8783 16.0002 10.8431 15.1577 9.34277 13.6574C7.84248 12.1571 7 10.1219 7 8.00018C7 6.41793 7.46958 4.87144 8.34863 3.55585C9.22764 2.24032 10.4768 1.21507 11.9385 0.609558Z'
										fill='#979594'
									/>
								</svg>
							)}
						</div>
					</Link>
				</div>
			</div>

			<style jsx>{`
				@keyframes scaleIn {
					0% {
						transform: scale(0.8);
						opacity: 0.5;
					}
					50% {
						transform: scale(1.1);
					}
					100% {
						transform: scale(1);
						opacity: 1;
					}
				}
			`}</style>
		</nav>
	)
})

NetworkingBottomNav.displayName = 'NetworkingBottomNav'

export default NetworkingBottomNav

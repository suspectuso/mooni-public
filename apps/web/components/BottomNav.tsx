'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback } from 'react'

// Вынесли стили наружу для предотвращения пересоздания
const navStyles = {
	position: 'fixed' as const,
	bottom: '20px',
	left: 0,
	right: 0,
	paddingBottom: 'safe',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'end',
}

const containerStyles = {
	position: 'relative' as const,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 100,
}

const navBarStyles = {
	position: 'relative' as const,
	display: 'flex',
	alignItems: 'center',
	borderRadius: '9999px',
	height: '70px',
	backgroundColor: 'rgba(39, 39, 39, 0.6)',
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	padding: '0 10px',
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

const BottomNav = memo(() => {
	const pathname = usePathname()

	const isActive = useCallback((path: string) => pathname === path, [pathname])

	const handleClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
		}
	}, [])

	return (
		<nav style={navStyles}>
			<div style={containerStyles}>
				<div style={navBarStyles}>
					{/* Левый круг - Трекер */}
					<Link
						href='/tracker'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/tracker') ? 30 : 10,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/tracker') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='29'
										height='27'
										viewBox='0 0 29 27'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M14.5 0C14.5 0 5.5303 8.01 0.51765 12.348C0.358075 12.4917 0.229518 12.6685 0.140335 12.867C0.051151 13.0655 0.00333689 13.2812 0 13.5C0 13.8978 0.152767 14.2794 0.424695 14.5607C0.696623 14.842 1.06544 15 1.45 15H4.35V25.5C4.35 25.8978 4.50277 26.2794 4.7747 26.5607C5.04662 26.842 5.41544 27 5.8 27H10.15C10.5346 27 10.9034 26.842 11.1753 26.5607C11.4472 26.2794 11.6 25.8978 11.6 25.5V19.5H17.4V25.5C17.4 25.8978 17.5528 26.2794 17.8247 26.5607C18.0966 26.842 18.4654 27 18.85 27H23.2C23.5846 27 23.9534 26.842 24.2253 26.5607C24.4972 26.2794 24.65 25.8978 24.65 25.5V15H27.55C27.9346 15 28.3034 14.842 28.5753 14.5607C28.8472 14.2794 29 13.8978 29 13.5C28.998 13.277 28.9469 13.0574 28.8507 12.8578C28.7545 12.6582 28.6156 12.4839 28.4447 12.348C23.4668 8.01 14.5 0 14.5 0Z'
											fill='#1D1D1B'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='29'
									height='27'
									viewBox='0 0 29 27'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M14.5 0C14.5 0 5.5303 8.01 0.51765 12.348C0.358075 12.4917 0.229518 12.6685 0.140335 12.867C0.051151 13.0655 0.00333689 13.2812 0 13.5C0 13.8978 0.152767 14.2794 0.424695 14.5607C0.696623 14.842 1.06544 15 1.45 15H4.35V25.5C4.35 25.8978 4.50277 26.2794 4.7747 26.5607C5.04662 26.842 5.41544 27 5.8 27H10.15C10.5346 27 10.9034 26.842 11.1753 26.5607C11.4472 26.2794 11.6 25.8978 11.6 25.5V19.5H17.4V25.5C17.4 25.8978 17.5528 26.2794 17.8247 26.5607C18.0966 26.842 18.4654 27 18.85 27H23.2C23.5846 27 23.9534 26.842 24.2253 26.5607C24.4972 26.2794 24.65 25.8978 24.65 25.5V15H27.55C27.9346 15 28.3034 14.842 28.5753 14.5607C28.8472 14.2794 29 13.8978 29 13.5C28.998 13.277 28.9469 13.0574 28.8507 12.8578C28.7545 12.6582 28.6156 12.4839 28.4447 12.348C23.4668 8.01 14.5 0 14.5 0Z'
										fill='#979594'
									/>
								</svg>
							)}
						</div>
					</Link>

					{/* Второй круг - Спринты */}
					<Link
						href='/tracker/sprints'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/tracker/sprints') ? 30 : 15,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/tracker/sprints') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='25'
										height='34'
										viewBox='0 0 25 34'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M1.00188 -1.03068e-06L16.2802 -3.62841e-07C16.6774 -3.4548e-07 17.0369 0.235039 17.1962 0.598848L24.2563 16.7202C24.4456 17.1526 24.3068 17.6586 23.9233 17.9338L19.4453 21.1472C18.9769 21.4834 18.889 22.145 19.2535 22.5918L23.6545 27.987C24.0997 28.5329 23.8561 29.3558 23.1854 29.5712L9.95304 33.8212C8.8493 34.1757 8.12767 32.6826 9.09117 32.0379L15.8143 27.5398C16.3718 27.1668 16.4113 26.3615 15.8929 25.9358L11.7621 22.544C11.2734 22.1427 11.2751 21.3943 11.7657 20.9953L15.249 18.1624C15.7095 17.7879 15.7443 17.097 15.3238 16.6781L0.296143 1.70847C-0.335699 1.07907 0.110048 -1.06966e-06 1.00188 -1.03068e-06Z'
											fill='#1D1D1B'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='25'
									height='34'
									viewBox='0 0 25 34'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M1.00188 -1.03068e-06L16.2802 -3.62841e-07C16.6774 -3.4548e-07 17.0369 0.235039 17.1962 0.598848L24.2563 16.7202C24.4456 17.1526 24.3068 17.6586 23.9233 17.9338L19.4453 21.1472C18.9769 21.4834 18.889 22.145 19.2535 22.5918L23.6545 27.987C24.0997 28.5329 23.8561 29.3558 23.1854 29.5712L9.95304 33.8212C8.8493 34.1757 8.12767 32.6826 9.09117 32.0379L15.8143 27.5398C16.3718 27.1668 16.4113 26.3615 15.8929 25.9358L11.7621 22.544C11.2734 22.1427 11.2751 21.3943 11.7657 20.9953L15.249 18.1624C15.7095 17.7879 15.7443 17.097 15.3238 16.6781L0.296143 1.70847C-0.335699 1.07907 0.110048 -1.06966e-06 1.00188 -1.03068e-06Z'
										fill='#979594'
									/>
								</svg>
							)}
						</div>
					</Link>

					{/* Третий круг - Лидерборд */}
					<Link
						href='/tracker/leaderboard'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/tracker/leaderboard') ? 30 : 20,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/tracker/leaderboard') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='27'
										height='38'
										viewBox='0 0 27 38'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M23.1429 1C23.1429 0.447716 22.6951 0 22.1429 0H16.4286C15.8763 0 15.4286 0.447715 15.4286 1V6.81464C15.4286 7.32521 15.8139 7.75068 16.318 7.83164C18.1427 8.12469 19.9058 8.70437 21.5404 9.54664C22.2484 9.91145 23.1429 9.42322 23.1429 8.62677V1ZM11.5714 1C11.5714 0.447715 11.1237 0 10.5714 0H4.85714C4.30486 0 3.85714 0.447715 3.85714 1V8.62677C3.85714 9.42322 4.75159 9.91145 5.45958 9.54664C7.09419 8.70437 8.8573 8.12469 10.682 7.83164C11.1861 7.75068 11.5714 7.32521 11.5714 6.81464V1ZM13.5 38C17.0804 38 20.5142 36.5988 23.0459 34.1045C25.5777 31.6103 27 28.2274 27 24.7C27 21.1726 25.5777 17.7897 23.0459 15.2955C20.5142 12.8012 17.0804 11.4 13.5 11.4C9.91958 11.4 6.4858 12.8012 3.95406 15.2955C1.42232 17.7897 0 21.1726 0 24.7C0 28.2274 1.42232 31.6103 3.95406 34.1045C6.4858 36.5988 9.91958 38 13.5 38ZM10.6194 21.8879C10.9439 21.8416 11.2251 21.6391 11.372 21.346L12.606 18.8838C12.9748 18.1479 14.0252 18.1479 14.394 18.8838L15.628 21.346C15.7749 21.6391 16.0561 21.8416 16.3806 21.8879L19.1125 22.2782C19.9375 22.396 20.2648 23.4119 19.664 23.9892L17.7061 25.8704C17.4662 26.1008 17.3566 26.4354 17.4137 26.7631L17.879 29.4338C18.0209 30.2486 17.1687 30.8736 16.4342 30.4935L13.9597 29.2129C13.6714 29.0637 13.3286 29.0637 13.0403 29.213L10.568 30.493C9.83346 30.8733 8.9811 30.2482 9.12305 29.4334L9.5882 26.7631C9.64528 26.4354 9.53571 26.1008 9.29587 25.8704L7.33786 23.9891C6.73701 23.4118 7.06436 22.396 7.88924 22.2781L10.6194 21.8879Z'
											fill='#1D1D1B'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='27'
									height='38'
									viewBox='0 0 27 38'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M23.1429 1C23.1429 0.447716 22.6951 0 22.1429 0H16.4286C15.8763 0 15.4286 0.447715 15.4286 1V6.81464C15.4286 7.32521 15.8139 7.75068 16.318 7.83164C18.1427 8.12469 19.9058 8.70437 21.5404 9.54664C22.2484 9.91145 23.1429 9.42322 23.1429 8.62677V1ZM11.5714 1C11.5714 0.447715 11.1237 0 10.5714 0H4.85714C4.30486 0 3.85714 0.447715 3.85714 1V8.62677C3.85714 9.42322 4.75159 9.91145 5.45958 9.54664C7.09419 8.70437 8.8573 8.12469 10.682 7.83164C11.1861 7.75068 11.5714 7.32521 11.5714 6.81464V1ZM13.5 38C17.0804 38 20.5142 36.5988 23.0459 34.1045C25.5777 31.6103 27 28.2274 27 24.7C27 21.1726 25.5777 17.7897 23.0459 15.2955C20.5142 12.8012 17.0804 11.4 13.5 11.4C9.91958 11.4 6.4858 12.8012 3.95406 15.2955C1.42232 17.7897 0 21.1726 0 24.7C0 28.2274 1.42232 31.6103 3.95406 34.1045C6.4858 36.5988 9.91958 38 13.5 38ZM10.6194 21.8879C10.9439 21.8416 11.2251 21.6391 11.372 21.346L12.606 18.8838C12.9748 18.1479 14.0252 18.1479 14.394 18.8838L15.628 21.346C15.7749 21.6391 16.0561 21.8416 16.3806 21.8879L19.1125 22.2782C19.9375 22.396 20.2648 23.4119 19.664 23.9892L17.7061 25.8704C17.4662 26.1008 17.3566 26.4354 17.4137 26.7631L17.879 29.4338C18.0209 30.2486 17.1687 30.8736 16.4342 30.4935L13.9597 29.2129C13.6714 29.0637 13.3286 29.0637 13.0403 29.213L10.568 30.493C9.83346 30.8733 8.9811 30.2482 9.12305 29.4334L9.5882 26.7631C9.64528 26.4354 9.53571 26.1008 9.29587 25.8704L7.33786 23.9891C6.73701 23.4118 7.06436 22.396 7.88924 22.2781L10.6194 21.8879Z'
										fill='#979594'
									/>
								</svg>
							)}
						</div>
					</Link>

					{/* Правый круг - Профиль */}
					<Link
						href='/tracker/profile'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/tracker/profile') ? 30 : 10,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/tracker/profile') ? (
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

BottomNav.displayName = 'BottomNav'

export default BottomNav

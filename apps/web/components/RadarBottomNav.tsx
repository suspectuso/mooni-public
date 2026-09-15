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
	maxWidth: '90vw',
	backgroundColor: 'rgba(39, 39, 39, 0.6)',
	backdropFilter: 'blur(20px) saturate(180%)',
	WebkitBackdropFilter: 'blur(20px) saturate(180%)',
	padding: '0 20px',
	borderRadius: '35px',
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

const RadarBottomNav = memo(() => {
	const pathname = usePathname()
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
	const [rotation, setRotation] = useState(0)

	const isActive = useCallback((path: string) => pathname === path, [pathname])

	const handleClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
		}
	}, [])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.expand()
			tg.disableVerticalSwipes()
		}

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

	useEffect(() => {
		const interval = setInterval(() => {
			setRotation(prev => (prev + 2) % 360)
		}, 30)
		return () => clearInterval(interval)
	}, [])

	if (isKeyboardOpen) {
		return null
	}

	return (
		<nav className='flex justify-center items-end' style={navStyles}>
			<div style={containerStyles}>
				<div style={navBarStyles}>
					<Link
						href='/radar'
						onClick={handleClick}
						style={{
							...linkStyles,
							zIndex: isActive('/radar') ? 30 : 10,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/radar') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='35'
										height='35'
										viewBox='0 0 35 35'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M28.8 17.25C28.8 20.3133 27.5831 23.251 25.4171 25.4171C23.251 27.5831 20.3133 28.8 17.25 28.8M28.8 17.25C28.8 14.1867 27.5831 11.249 25.4171 9.08292C23.251 6.91687 20.3133 5.7 17.25 5.7M28.8 17.25H33.75M17.25 28.8C14.1867 28.8 11.249 27.5831 9.08292 25.4171C6.91687 23.251 5.7 20.3133 5.7 17.25M17.25 28.8V33.75M17.25 5.7C14.1867 5.7 11.249 6.91687 9.08292 9.08292C6.91687 11.249 5.7 14.1867 5.7 17.25M17.25 5.7V0.75M5.7 17.25H0.75M18.9 17.25C18.9 17.6876 18.7262 18.1073 18.4167 18.4167C18.1073 18.7262 17.6876 18.9 17.25 18.9C16.8124 18.9 16.3927 18.7262 16.0833 18.4167C15.7738 18.1073 15.6 17.6876 15.6 17.25C15.6 16.8124 15.7738 16.3927 16.0833 16.0833C16.3927 15.7738 16.8124 15.6 17.25 15.6C17.6876 15.6 18.1073 15.7738 18.4167 16.0833C18.7262 16.3927 18.9 16.8124 18.9 17.25Z'
											stroke='#1D1D1B'
											strokeWidth='1.5'
											strokeLinecap='round'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='35'
									height='35'
									viewBox='0 0 35 35'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M28.8 17.25C28.8 20.3133 27.5831 23.251 25.4171 25.4171C23.251 27.5831 20.3133 28.8 17.25 28.8M28.8 17.25C28.8 14.1867 27.5831 11.249 25.4171 9.08292C23.251 6.91687 20.3133 5.7 17.25 5.7M28.8 17.25H33.75M17.25 28.8C14.1867 28.8 11.249 27.5831 9.08292 25.4171C6.91687 23.251 5.7 20.3133 5.7 17.25M17.25 28.8V33.75M17.25 5.7C14.1867 5.7 11.249 6.91687 9.08292 9.08292C6.91687 11.249 5.7 14.1867 5.7 17.25M17.25 5.7V0.75M5.7 17.25H0.75M18.9 17.25C18.9 17.6876 18.7262 18.1073 18.4167 18.4167C18.1073 18.7262 17.6876 18.9 17.25 18.9C16.8124 18.9 16.3927 18.7262 16.0833 18.4167C15.7738 18.1073 15.6 17.6876 15.6 17.25C15.6 16.8124 15.7738 16.3927 16.0833 16.0833C16.3927 15.7738 16.8124 15.6 17.25 15.6C17.6876 15.6 18.1073 15.7738 18.4167 16.0833C18.7262 16.3927 18.9 16.8124 18.9 17.25Z'
										stroke='#FCF9F7'
										strokeOpacity='0.45'
										strokeWidth='1.5'
										strokeLinecap='round'
									/>
								</svg>
							)}
						</div>
					</Link>

					<button
						onClick={() => {
							handleClick()
							window.location.href = '/radar/create'
						}}
						className='relative flex items-center justify-center transition-all duration-300'
						style={{
							width: '70px',
							height: '70px',
							zIndex: 25,
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: 0,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{
								width: '60px',
								height: '60px',
								background: `linear-gradient(${rotation}deg, rgba(140, 255, 101, 0.4) 0%, rgba(227, 240, 64, 0.4) 100%)`,
							}}
						>
							<svg
								width='31'
								height='31'
								viewBox='0 0 31 31'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M15.75 0C16.1642 1.81059e-08 16.5 0.335786 16.5 0.75V15H30.25C30.6642 15 31 15.3358 31 15.75C31 16.1642 30.6642 16.5 30.25 16.5H16.5V30.25C16.5 30.6642 16.1642 31 15.75 31C15.3358 31 15 30.6642 15 30.25V16.5H0.75C0.335787 16.5 0 16.1642 0 15.75C0 15.3358 0.335787 15 0.75 15H15V0.75C15 0.335786 15.3358 -1.81059e-08 15.75 0Z'
									fill='#FCF9F7'
									fillOpacity='0.65'
								/>
							</svg>
						</div>
					</button>

					<Link
						href='/radar/profile'
						onClick={handleClick}
						className='relative flex items-center justify-center transition-all duration-300'
						style={{
							width: '70px',
							height: '70px',
							zIndex: isActive('/radar/profile') ? 30 : 10,
						}}
					>
						<div
							className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
							style={{ backgroundColor: 'transparent' }}
						>
							{isActive('/radar/profile') ? (
								<div
									className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
									style={{
										width: '50px',
										height: '50px',
										animation: 'scaleIn 0.3s ease-out',
									}}
								>
									<svg
										width='32'
										height='36'
										viewBox='0 0 32 36'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M2.75 34.75V35.5V35.5V34.75ZM12.6885 1.35938L12.4015 0.666465L12.4014 0.666473L12.6885 1.35938ZM17.3105 0.90332L17.4569 0.167731L17.4568 0.167727L17.3105 0.90332ZM21.4072 3.09277L21.9376 2.56244V2.56244L21.4072 3.09277ZM23.5967 7.18945L24.3323 7.04316L24.3323 7.04314L23.5967 7.18945ZM23.1406 11.8115L23.8335 12.0986L23.8335 12.0985L23.1406 11.8115ZM20.1943 15.4014L20.611 16.025L20.611 16.025L20.1943 15.4014ZM15.75 16.75V17.5V17.5V16.75ZM10.0928 14.4072L9.56244 14.9376H9.56244L10.0928 14.4072ZM7.75 8.75H7V8.75H7.75ZM9.09863 4.30566L8.47503 3.88898L8.47503 3.88899L9.09863 4.30566ZM15.75 20.6074V21.3574C18.1335 21.3574 21.7682 22.1185 24.79 23.6404C27.849 25.181 30 27.3465 30 30.0361H30.75H31.5C31.5 26.4557 28.6541 23.9069 25.4647 22.3007C22.2381 20.6757 18.3728 19.8574 15.75 19.8574V20.6074ZM30.75 30.0361H30V32.75H30.75H31.5V30.0361H30.75ZM30.75 32.75H30C30 33.4404 29.4404 34 28.75 34V34.75V35.5C30.2688 35.5 31.5 34.2688 31.5 32.75H30.75ZM28.75 34.75V34H2.75V34.75V35.5H28.75V34.75ZM2.75 34.75V34C2.05964 34 1.5 33.4404 1.5 32.75H0.75H0C0 34.2688 1.23122 35.5 2.75 35.5V34.75ZM0.75 32.75H1.5V30.0361H0.75H0V32.75H0.75ZM0.75 30.0361H1.5C1.5 27.3465 3.65097 25.181 6.71001 23.6404C9.73183 22.1185 13.3665 21.3574 15.75 21.3574V20.6074V19.8574C13.1272 19.8574 9.26192 20.6757 6.03531 22.3007C2.84591 23.9069 0 26.4557 0 30.0361H0.75ZM12.6885 1.35938L12.9755 2.05228C14.3004 1.50348 15.7582 1.35928 17.1643 1.63891L17.3105 0.90332L17.4568 0.167727C15.7593 -0.169871 14 0.00432837 12.4015 0.666465L12.6885 1.35938ZM17.3105 0.90332L17.1642 1.63891C18.5707 1.91867 19.863 2.60923 20.8769 3.6231L21.4072 3.09277L21.9376 2.56244C20.7138 1.33868 19.1541 0.505337 17.4569 0.167731L17.3105 0.90332ZM21.4072 3.09277L20.8769 3.6231C21.8908 4.63698 22.5813 5.92933 22.8611 7.33577L23.5967 7.18945L24.3323 7.04314C23.9947 5.34588 23.1613 3.78621 21.9376 2.56244L21.4072 3.09277ZM23.5967 7.18945L22.8611 7.33575C23.1407 8.7418 22.9965 10.1996 22.4477 11.5245L23.1406 11.8115L23.8335 12.0985C24.4957 10.5 24.6699 8.74065 24.3323 7.04316L23.5967 7.18945ZM23.1406 11.8115L22.4477 11.5245C21.899 12.8491 20.9699 13.9811 19.7777 14.7778L20.1943 15.4014L20.611 16.025C22.0498 15.0636 23.1712 13.6973 23.8335 12.0986L23.1406 11.8115ZM20.1943 15.4014L19.7777 14.7778C18.5853 15.5745 17.1838 16 15.75 16V16.75V17.5C17.4807 17.5 19.1722 16.9864 20.611 16.025L20.1943 15.4014ZM15.75 16.75V16C13.8271 16 11.9827 15.2364 10.6231 13.8769L10.0928 14.4072L9.56244 14.9376C11.2035 16.5786 13.4295 17.5 15.75 17.5V16.75ZM10.0928 14.4072L10.6231 13.8769C9.26356 12.5173 8.5 10.6729 8.5 8.75H7.75H7C7 11.0705 7.92141 13.2965 9.56244 14.9376L10.0928 14.4072ZM7.75 8.75H8.5C8.5 7.31623 8.92551 5.91472 9.72223 4.72234L9.09863 4.30566L8.47503 3.88899C7.51365 5.32779 7 7.01927 7 8.75H7.75ZM9.09863 4.30566L9.72223 4.72234C10.5189 3.53013 11.6509 2.60101 12.9755 2.05228L12.6885 1.35938L12.4014 0.666473C10.8027 1.32876 9.43643 2.45015 8.47503 3.88898L9.09863 4.30566Z'
											fill='#1D1D1B'
										/>
									</svg>
								</div>
							) : (
								<svg
									width='32'
									height='36'
									viewBox='0 0 32 36'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M2.75 34.75V35.5V35.5V34.75ZM12.6885 1.35938L12.4015 0.666465L12.4014 0.666473L12.6885 1.35938ZM17.3105 0.90332L17.4569 0.167731L17.4568 0.167727L17.3105 0.90332ZM21.4072 3.09277L21.9376 2.56244V2.56244L21.4072 3.09277ZM23.5967 7.18945L24.3323 7.04316L24.3323 7.04314L23.5967 7.18945ZM23.1406 11.8115L23.8335 12.0986L23.8335 12.0985L23.1406 11.8115ZM20.1943 15.4014L20.611 16.025L20.611 16.025L20.1943 15.4014ZM15.75 16.75V17.5V17.5V16.75ZM10.0928 14.4072L9.56244 14.9376H9.56244L10.0928 14.4072ZM7.75 8.75H7V8.75H7.75ZM9.09863 4.30566L8.47503 3.88898L8.47503 3.88899L9.09863 4.30566ZM15.75 20.6074V21.3574C18.1335 21.3574 21.7682 22.1185 24.79 23.6404C27.849 25.181 30 27.3465 30 30.0361H30.75H31.5C31.5 26.4557 28.6541 23.9069 25.4647 22.3007C22.2381 20.6757 18.3728 19.8574 15.75 19.8574V20.6074ZM30.75 30.0361H30V32.75H30.75H31.5V30.0361H30.75ZM30.75 32.75H30C30 33.4404 29.4404 34 28.75 34V34.75V35.5C30.2688 35.5 31.5 34.2688 31.5 32.75H30.75ZM28.75 34.75V34H2.75V34.75V35.5H28.75V34.75ZM2.75 34.75V34C2.05964 34 1.5 33.4404 1.5 32.75H0.75H0C0 34.2688 1.23122 35.5 2.75 35.5V34.75ZM0.75 32.75H1.5V30.0361H0.75H0V32.75H0.75ZM0.75 30.0361H1.5C1.5 27.3465 3.65097 25.181 6.71001 23.6404C9.73183 22.1185 13.3665 21.3574 15.75 21.3574V20.6074V19.8574C13.1272 19.8574 9.26192 20.6757 6.03531 22.3007C2.84591 23.9069 0 26.4557 0 30.0361H0.75ZM12.6885 1.35938L12.9755 2.05228C14.3004 1.50348 15.7582 1.35928 17.1643 1.63891L17.3105 0.90332L17.4568 0.167727C15.7593 -0.169871 14 0.00432837 12.4015 0.666465L12.6885 1.35938ZM17.3105 0.90332L17.1642 1.63891C18.5707 1.91867 19.863 2.60923 20.8769 3.6231L21.4072 3.09277L21.9376 2.56244C20.7138 1.33868 19.1541 0.505337 17.4569 0.167731L17.3105 0.90332ZM21.4072 3.09277L20.8769 3.6231C21.8908 4.63698 22.5813 5.92933 22.8611 7.33577L23.5967 7.18945L24.3323 7.04314C23.9947 5.34588 23.1613 3.78621 21.9376 2.56244L21.4072 3.09277ZM23.5967 7.18945L22.8611 7.33575C23.1407 8.7418 22.9965 10.1996 22.4477 11.5245L23.1406 11.8115L23.8335 12.0985C24.4957 10.5 24.6699 8.74065 24.3323 7.04316L23.5967 7.18945ZM23.1406 11.8115L22.4477 11.5245C21.899 12.8491 20.9699 13.9811 19.7777 14.7778L20.1943 15.4014L20.611 16.025C22.0498 15.0636 23.1712 13.6973 23.8335 12.0986L23.1406 11.8115ZM20.1943 15.4014L19.7777 14.7778C18.5853 15.5745 17.1838 16 15.75 16V16.75V17.5C17.4807 17.5 19.1722 16.9864 20.611 16.025L20.1943 15.4014ZM15.75 16.75V16C13.8271 16 11.9827 15.2364 10.6231 13.8769L10.0928 14.4072L9.56244 14.9376C11.2035 16.5786 13.4295 17.5 15.75 17.5V16.75ZM10.0928 14.4072L10.6231 13.8769C9.26356 12.5173 8.5 10.6729 8.5 8.75H7.75H7C7 11.0705 7.92141 13.2965 9.56244 14.9376L10.0928 14.4072ZM7.75 8.75H8.5C8.5 7.31623 8.92551 5.91472 9.72223 4.72234L9.09863 4.30566L8.47503 3.88899C7.51365 5.32779 7 7.01927 7 8.75H7.75ZM9.09863 4.30566L9.72223 4.72234C10.5189 3.53013 11.6509 2.60101 12.9755 2.05228L12.6885 1.35938L12.4014 0.666473C10.8027 1.32876 9.43643 2.45015 8.47503 3.88898L9.09863 4.30566Z'
										fill='#FCF9F7'
										fillOpacity='0.45'
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

RadarBottomNav.displayName = 'RadarBottomNav'

export default RadarBottomNav

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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

const WorkBottomNav = memo(() => {
	const pathname = usePathname()
	const router = useRouter()
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
	const [showCreateModal, setShowCreateModal] = useState(false)

	const isActive = useCallback((path: string) => pathname === path, [pathname])

	const handleClick = useCallback(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
		}
	}, [])

	const handleCreateClick = useCallback(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('medium')
		setShowCreateModal(true)
	}, [])

	const handleCreateResume = useCallback(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')
		setShowCreateModal(false)
		router.push('/work/resumes/new')
	}, [router])

	const handleCreateVacancy = useCallback(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')
		setShowCreateModal(false)
		router.push('/work/vacancies/new')
	}, [router])

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

	if (isKeyboardOpen) {
		return null
	}

	return (
		<>
			<nav className='flex justify-center items-end' style={navStyles}>
				<div style={containerStyles}>
					<div style={navBarStyles}>
						{/* Главная */}
						<Link
							href='/work'
							onClick={handleClick}
							style={{
								...linkStyles,
								zIndex: isActive('/work') ? 30 : 10,
							}}
						>
							<div
								className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
								style={{ backgroundColor: 'transparent' }}
							>
								{isActive('/work') ? (
									<div
										className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
										style={{
											width: '50px',
											height: '50px',
											animation: 'scaleIn 0.3s ease-out',
										}}
									>
										<svg
											width='31'
											height='29'
											viewBox='0 0 31 29'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M16.5801 1.97559C17.562 2.8551 18.927 4.07649 20.458 5.44336C23.5195 8.17668 27.2486 11.4949 29.9121 13.8271L29.9248 13.8379L29.9385 13.8486C30.0315 13.9229 30.1092 14.0204 30.1641 14.1348C30.2053 14.2207 30.2327 14.3138 30.2441 14.4102L30.25 14.5068C30.2483 14.7417 30.1577 14.9612 30.0059 15.1191C29.8534 15.2776 29.6527 15.3613 29.4502 15.3613H25.5996V27.3887C25.5996 27.6261 25.5088 27.8484 25.3555 28.0078C25.203 28.1663 25.0024 28.25 24.7998 28.25H20.1504C19.9478 28.25 19.7472 28.1663 19.5947 28.0078C19.4413 27.8484 19.3496 27.6262 19.3496 27.3887V20.1943H11.6504V27.3887C11.6504 27.6262 11.5587 27.8484 11.4053 28.0078C11.2528 28.1663 11.0522 28.25 10.8496 28.25H6.2002C5.99758 28.25 5.79699 28.1663 5.64453 28.0078C5.4912 27.8484 5.40039 27.6261 5.40039 27.3887V15.3613H1.5498C1.34726 15.3613 1.14655 15.2776 0.994141 15.1191C0.842327 14.9612 0.751728 14.7417 0.75 14.5068C0.752618 14.3743 0.782029 14.2443 0.834961 14.126C0.886334 14.0112 0.958672 13.9107 1.0459 13.8291C3.72881 11.4962 7.4682 8.17767 10.5352 5.44434C12.0691 4.07729 13.4351 2.8552 14.418 1.97559C14.8642 1.57626 15.231 1.24697 15.499 1.00684C15.7668 1.24697 16.134 1.576 16.5801 1.97559Z'
												stroke='#1D1D1B'
												strokeWidth='1.5'
												fill='#1D1D1B'
											/>
										</svg>
									</div>
								) : (
									<svg
										width='31'
										height='29'
										viewBox='0 0 31 29'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M16.5801 1.97559C17.562 2.8551 18.927 4.07649 20.458 5.44336C23.5195 8.17668 27.2486 11.4949 29.9121 13.8271L29.9248 13.8379L29.9385 13.8486C30.0315 13.9229 30.1092 14.0204 30.1641 14.1348C30.2053 14.2207 30.2327 14.3138 30.2441 14.4102L30.25 14.5068C30.2483 14.7417 30.1577 14.9612 30.0059 15.1191C29.8534 15.2776 29.6527 15.3613 29.4502 15.3613H25.5996V27.3887C25.5996 27.6261 25.5088 27.8484 25.3555 28.0078C25.203 28.1663 25.0024 28.25 24.7998 28.25H20.1504C19.9478 28.25 19.7472 28.1663 19.5947 28.0078C19.4413 27.8484 19.3496 27.6262 19.3496 27.3887V20.1943H11.6504V27.3887C11.6504 27.6262 11.5587 27.8484 11.4053 28.0078C11.2528 28.1663 11.0522 28.25 10.8496 28.25H6.2002C5.99758 28.25 5.79699 28.1663 5.64453 28.0078C5.4912 27.8484 5.40039 27.6261 5.40039 27.3887V15.3613H1.5498C1.34726 15.3613 1.14655 15.2776 0.994141 15.1191C0.842327 14.9612 0.751728 14.7417 0.75 14.5068C0.752618 14.3743 0.782029 14.2443 0.834961 14.126C0.886334 14.0112 0.958672 13.9107 1.0459 13.8291C3.72881 11.4962 7.4682 8.17767 10.5352 5.44434C12.0691 4.07729 13.4351 2.8552 14.418 1.97559C14.8642 1.57626 15.231 1.24697 15.499 1.00684C15.7668 1.24697 16.134 1.576 16.5801 1.97559Z'
											stroke='#FCF9F7'
											strokeOpacity='0.45'
											strokeWidth='1.5'
											fill='none'
										/>
									</svg>
								)}
							</div>
						</Link>

						{/* Отклики */}
						<Link
							href='/work/responses'
							onClick={handleClick}
							style={{
								...linkStyles,
								zIndex: pathname?.startsWith('/work/responses') ? 30 : 10,
							}}
						>
							<div
								className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
								style={{ backgroundColor: 'transparent' }}
							>
								{pathname?.startsWith('/work/responses') ? (
									<div
										className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
										style={{
											width: '50px',
											height: '50px',
											animation: 'scaleIn 0.3s ease-out',
										}}
									>
										<svg
											width='28'
											height='32'
											viewBox='0 0 28 32'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M18.6556 24.0833H8.84076M18.6556 24.0833H24.5283C27.5767 24.0833 27.0616 20.9833 25.5195 19.41C19.9653 13.7517 27.8546 0.75 13.7482 0.75C-0.358217 0.75 7.53265 13.75 1.9785 19.41C0.494894 20.9233 -0.13722 24.0833 2.96973 24.0833H8.84076M18.6556 24.0833C18.6556 27.2917 17.6026 30.75 13.7482 30.75C9.89374 30.75 8.84076 27.2917 8.84076 24.0833'
												stroke='#1D1D1B'
												strokeWidth='1.5'
												strokeLinecap='round'
												strokeLinejoin='round'
												fill='#1D1D1B'
											/>
										</svg>
									</div>
								) : (
									<svg
										width='28'
										height='32'
										viewBox='0 0 28 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M18.6556 24.0833H8.84076M18.6556 24.0833H24.5283C27.5767 24.0833 27.0616 20.9833 25.5195 19.41C19.9653 13.7517 27.8546 0.75 13.7482 0.75C-0.358217 0.75 7.53265 13.75 1.9785 19.41C0.494894 20.9233 -0.13722 24.0833 2.96973 24.0833H8.84076M18.6556 24.0833C18.6556 27.2917 17.6026 30.75 13.7482 30.75C9.89374 30.75 8.84076 27.2917 8.84076 24.0833'
											stroke='#FCF9F7'
											strokeOpacity='0.45'
											strokeWidth='1.5'
											strokeLinecap='round'
											strokeLinejoin='round'
											fill='none'
										/>
									</svg>
								)}
							</div>
						</Link>

						{/* Создать (плюс) */}
						<button
							onClick={handleCreateClick}
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
									width: '62px',
									height: '62px',
									filter: showCreateModal ? 'brightness(1.1)' : 'brightness(1)',
								}}
							>
								<img
									src='/work_add.webp'
									alt='Создать'
									style={{ width: '62px', height: '62px' }}
								/>
							</div>
						</button>

						{/* Избранное */}
						<Link
							href='/work/favorites'
							onClick={handleClick}
							style={{
								...linkStyles,
								zIndex: isActive('/work/favorites') ? 30 : 10,
							}}
						>
							<div
								className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
								style={{ backgroundColor: 'transparent' }}
							>
								{isActive('/work/favorites') ? (
									<div
										className='rounded-full bg-white flex items-center justify-center transition-all duration-300 ease-out'
										style={{
											width: '50px',
											height: '50px',
											animation: 'scaleIn 0.3s ease-out',
										}}
									>
										<svg
											width='33'
											height='29'
											viewBox='0 0 33 29'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M22.1816 1.10645C26.4801 -0.115136 30.0855 2.00056 31.2998 4.42773L31.3008 4.42871C33.0667 7.95182 32.4056 11.9945 28.9873 16.5742L28.9854 16.5762C26.2818 20.2217 22.3845 23.8792 16.6865 28.1895L16.6855 28.1904C16.6362 28.2279 16.5726 28.25 16.5049 28.25C16.4372 28.25 16.3736 28.2279 16.3242 28.1904L16.3232 28.1895L15.2744 27.3867C10.1361 23.4102 6.55902 19.9567 4.02246 16.5732C0.701405 12.1369 -0.0224055 8.20495 1.54102 4.76074L1.69922 4.42871V4.42773C2.91207 2.00319 6.50697 -0.0974451 10.8203 1.10645V1.10742C12.8737 1.68529 14.6613 2.92297 15.8936 4.61426L16.5 5.44629L17.1055 4.61426C18.3378 2.9228 20.1261 1.68526 22.1797 1.10742L22.1816 1.10645Z'
												stroke='#1D1D1B'
												strokeWidth='1.5'
												fill='#1D1D1B'
											/>
										</svg>
									</div>
								) : (
									<svg
										width='33'
										height='29'
										viewBox='0 0 33 29'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M22.1816 1.10645C26.4801 -0.115136 30.0855 2.00056 31.2998 4.42773L31.3008 4.42871C33.0667 7.95182 32.4056 11.9945 28.9873 16.5742L28.9854 16.5762C26.2818 20.2217 22.3845 23.8792 16.6865 28.1895L16.6855 28.1904C16.6362 28.2279 16.5726 28.25 16.5049 28.25C16.4372 28.25 16.3736 28.2279 16.3242 28.1904L16.3232 28.1895L15.2744 27.3867C10.1361 23.4102 6.55902 19.9567 4.02246 16.5732C0.701405 12.1369 -0.0224055 8.20495 1.54102 4.76074L1.69922 4.42871V4.42773C2.91207 2.00319 6.50697 -0.0974451 10.8203 1.10645V1.10742C12.8737 1.68529 14.6613 2.92297 15.8936 4.61426L16.5 5.44629L17.1055 4.61426C18.3378 2.9228 20.1261 1.68526 22.1797 1.10742L22.1816 1.10645Z'
											stroke='#FCF9F7'
											strokeOpacity='0.45'
											strokeWidth='1.5'
											fill='none'
										/>
									</svg>
								)}
							</div>
						</Link>

						{/* Профиль */}
						<Link
							href='/work/profile'
							onClick={handleClick}
							style={{
								...linkStyles,
								zIndex: isActive('/work/profile') ? 30 : 10,
							}}
						>
							<div
								className='w-full h-full rounded-full flex items-center justify-center transition-all duration-300'
								style={{ backgroundColor: 'transparent' }}
							>
								{isActive('/work/profile') ? (
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
											height='30'
											viewBox='0 0 27 30'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M13.2354 17.5214C17.6527 17.5215 26.4707 20.3084 26.4707 25.8408V27.9999C26.4707 29.1045 25.5752 29.9999 24.4707 29.9999H2C0.895431 29.9999 0 29.1045 0 27.9999L0 25.8408C0 20.3084 8.81807 17.5214 13.2354 17.5214ZM10.5342 0.537057C11.8239 0.00287859 13.2431 -0.136653 14.6123 0.13569C15.9816 0.408052 17.2394 1.08016 18.2266 2.06733C19.2137 3.05451 19.8858 4.31234 20.1582 5.68159C20.4305 7.05077 20.291 8.46996 19.7568 9.75971C19.2226 11.0494 18.3179 12.1521 17.1572 12.9277C15.9964 13.7033 14.6314 14.1171 13.2354 14.1171C11.3632 14.1171 9.56793 13.3735 8.24414 12.0498C6.92038 10.726 6.17676 8.93064 6.17676 7.05854C6.17679 5.6625 6.59061 4.29743 7.36621 3.13667C8.14183 1.97601 9.24447 1.07127 10.5342 0.537057Z'
												fill='#1D1D1B'
											/>
										</svg>
									</div>
								) : (
									<svg
										width='28'
										height='32'
										viewBox='0 0 28 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M13.9854 18.2715L13.9854 17.5215H13.9854V18.2715ZM25.2207 30.75V31.5H25.2207L25.2207 30.75ZM2.75 30.75V31.5V31.5V30.75ZM11.2842 1.28711L10.9972 0.594189L10.9972 0.5942L11.2842 1.28711ZM15.3623 0.885742L15.5086 0.150153L15.5086 0.150153L15.3623 0.885742ZM18.9766 2.81738L19.5069 2.28705L19.5069 2.28705L18.9766 2.81738ZM20.9082 6.43164L21.6438 6.28532V6.28532L20.9082 6.43164ZM20.5068 10.5098L21.1997 10.7968L21.1998 10.7967L20.5068 10.5098ZM17.9072 13.6777L18.3239 14.3013L18.3239 14.3013L17.9072 13.6777ZM13.9854 14.8672V15.6172H13.9854L13.9854 14.8672ZM8.99414 12.7998L8.46381 13.3301L8.46381 13.3301L8.99414 12.7998ZM6.92676 7.80859L6.17676 7.80857V7.80859H6.92676ZM8.11621 3.88672L7.49263 3.47001L7.49261 3.47004L8.11621 3.88672ZM13.9854 18.2715L13.9853 19.0215C16.0743 19.0215 19.2679 19.6897 21.9222 21.0264C24.6137 22.3819 26.4707 24.2701 26.4707 26.5908H27.2207H27.9707C27.9707 23.3793 25.4187 21.1078 22.5969 19.6867C19.7378 18.2468 16.3137 17.5215 13.9854 17.5215L13.9854 18.2715ZM27.2207 26.5908H26.4707V28.75H27.2207H27.9707V26.5908H27.2207ZM27.2207 28.75H26.4707C26.4707 29.4403 25.911 30 25.2207 30L25.2207 30.75L25.2207 31.5C26.7394 31.4999 27.9707 30.2688 27.9707 28.75H27.2207ZM25.2207 30.75V30H2.75V30.75V31.5H25.2207V30.75ZM2.75 30.75V30C2.05964 30 1.5 29.4404 1.5 28.75H0.75H0C0 30.2688 1.23122 31.5 2.75 31.5V30.75ZM0.75 28.75H1.5V26.5908H0.75H0L0 28.75H0.75ZM0.75 26.5908H1.5C1.5 24.27 3.35704 22.3818 6.04854 21.0264C8.70282 19.6896 11.8964 19.0215 13.9854 19.0215V18.2715V17.5215C11.6571 17.5215 8.23293 18.2468 5.37385 19.6867C2.552 21.1078 0 23.3792 0 26.5908H0.75ZM11.2842 1.28711L11.5712 1.98003C12.7238 1.50264 13.9922 1.37791 15.216 1.62133L15.3623 0.885742L15.5086 0.150153C13.994 -0.15111 12.4241 0.00322223 10.9972 0.594189L11.2842 1.28711ZM15.3623 0.885742L15.216 1.62133C16.4398 1.86477 17.564 2.46548 18.4462 3.34772L18.9766 2.81738L19.5069 2.28705C18.4148 1.19494 17.0233 0.451441 15.5086 0.150153L15.3623 0.885742ZM18.9766 2.81738L18.4462 3.34771C19.3285 4.22995 19.9292 5.35412 20.1726 6.57797L20.9082 6.43164L21.6438 6.28532C21.3425 4.77066 20.599 3.37918 19.5069 2.28705L18.9766 2.81738ZM20.9082 6.43164L20.1726 6.57796C20.416 7.80173 20.2913 9.07014 19.8139 10.2228L20.5068 10.5098L21.1998 10.7967C21.7907 9.36989 21.9451 7.7999 21.6438 6.28532L20.9082 6.43164ZM20.5068 10.5098L19.8139 10.2228C19.3365 11.3755 18.5278 12.361 17.4905 13.0542L17.9072 13.6777L18.3239 14.3013C19.608 13.4433 20.6088 12.2235 21.1997 10.7968L20.5068 10.5098ZM17.9072 13.6777L17.4905 13.0541C16.4532 13.7473 15.2332 14.1172 13.9853 14.1172L13.9854 14.8672L13.9854 15.6172C15.5297 15.6172 17.0397 15.1594 18.3239 14.3013L17.9072 13.6777ZM13.9854 14.8672V14.1172C12.3121 14.1172 10.7076 13.4526 9.52447 12.2695L8.99414 12.7998L8.46381 13.3301C9.92826 14.7946 11.9143 15.6172 13.9854 15.6172V14.8672ZM8.99414 12.7998L9.52448 12.2695C8.34137 11.0864 7.67676 9.48179 7.67676 7.80859H6.92676H6.17676C6.17676 9.8796 6.99939 11.8657 8.46381 13.3301L8.99414 12.7998ZM6.92676 7.80859L7.67676 7.80861C7.67679 6.5608 8.04668 5.34075 8.73981 4.3034L8.11621 3.88672L7.49261 3.47004C6.63454 4.75423 6.1768 6.26431 6.17676 7.80857L6.92676 7.80859ZM8.11621 3.88672L8.73979 4.30343C9.43298 3.26613 10.4185 2.45749 11.5712 1.98002L11.2842 1.28711L10.9972 0.5942C9.57046 1.18516 8.35068 2.186 7.49263 3.47001L8.11621 3.88672Z'
											fill='#FCF9F7'
											fillOpacity='0.45'
										/>
									</svg>
								)}
							</div>
						</Link>
					</div>
				</div>
			</nav>

			{/* Create Modal */}
			{showCreateModal && (
				<div
					onClick={() => setShowCreateModal(false)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
						backdropFilter: 'blur(8px)',
						zIndex: 200,
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'center',
					}}
				>
					<div
						onClick={e => e.stopPropagation()}
						style={{
							backgroundColor: '#272727',
							borderRadius: '28px 28px 0 0',
							padding: '24px',
							width: '100%',
							maxWidth: '500px',
							marginBottom: 0,
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								marginBottom: '24px',
							}}
						>
							<h2
								style={{
									fontFamily: 'Oks, sans-serif',
									fontSize: '24px',
									color: '#FCF9F7',
									margin: 0,
								}}
							>
								Создать
							</h2>
							<button
								onClick={() => setShowCreateModal(false)}
								style={{
									width: '32px',
									height: '32px',
									borderRadius: '50%',
									backgroundColor: 'rgba(252, 249, 247, 0.1)',
									border: 'none',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
								}}
							>
								<svg
									width='14'
									height='14'
									viewBox='0 0 14 14'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M1 1L13 13M1 13L13 1'
										stroke='#FCF9F7'
										strokeWidth='2'
										strokeLinecap='round'
									/>
								</svg>
							</button>
						</div>

						<button
							onClick={handleCreateResume}
							style={{
								width: '100%',
								backgroundColor: '#65FFF7',
								border: 'none',
								borderRadius: '28px',
								padding: '20px',
								marginBottom: '12px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '12px',
							}}
						>
							<svg
								width='19'
								height='17'
								viewBox='0 0 19 17'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M10.45 12.2778H8.55C8.0275 12.2778 7.6 11.8528 7.6 11.3333H0.9595V15.1111C0.9595 16.15 1.8145 17 2.8595 17H16.15C17.195 17 18.05 16.15 18.05 15.1111V11.3333H11.4C11.4 11.8528 10.9725 12.2778 10.45 12.2778ZM17.1 3.77778H13.3C13.3 1.69056 11.5995 0 9.5 0C7.4005 0 5.7 1.69056 5.7 3.77778H1.9C0.855 3.77778 0 4.62778 0 5.66667V8.5C0 9.54833 0.8455 10.3889 1.9 10.3889H7.6V9.44444C7.6 8.925 8.0275 8.5 8.55 8.5H10.45C10.9725 8.5 11.4 8.925 11.4 9.44444V10.3889H17.1C18.145 10.3889 19 9.53889 19 8.5V5.66667C19 4.62778 18.145 3.77778 17.1 3.77778ZM7.6 3.77778C7.6 2.73889 8.455 1.88889 9.5 1.88889C10.545 1.88889 11.4 2.73889 11.4 3.77778H7.5905H7.6Z'
									fill='#1D1D1B'
								/>
							</svg>
							<span
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '18px',
									fontWeight: 600,
									color: '#1D1D1B',
								}}
							>
								Резюме
							</span>
						</button>

						<button
							onClick={handleCreateVacancy}
							style={{
								width: '100%',
								backgroundColor: '#282826',
								border: 'none',
								borderRadius: '28px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '12px',
							}}
						>
							<svg
								width='15'
								height='17'
								viewBox='0 0 15 17'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M7.5 9.93032C10.0031 9.93032 14.9999 11.5093 15 14.6442V16.0016C14.9999 16.5538 14.5522 17.0016 14 17.0016H1C0.447774 17.0016 9.44757e-05 16.5538 0 16.0016L0 14.6442C0.000113726 11.5093 4.99691 9.93032 7.5 9.93032ZM5.96973 0.304339C6.70043 0.00180043 7.5046 -0.077461 8.28027 0.0767998C9.05604 0.23111 9.76877 0.612298 10.3281 1.17153C10.8875 1.73094 11.2685 2.44443 11.4229 3.22035C11.5771 3.99616 11.498 4.80012 11.1953 5.5309C10.8926 6.26164 10.3802 6.88631 9.72266 7.32582C9.06486 7.76535 8.29112 8.00063 7.5 8.00063C6.43921 8.00063 5.422 7.5788 4.67188 6.82875C3.9218 6.07868 3.50008 5.06138 3.5 4.00063C3.5 3.20954 3.73434 2.43575 4.17383 1.77797C4.61335 1.12018 5.23882 0.607089 5.96973 0.304339Z'
									fill='#FCF9F7'
									fillOpacity='0.45'
								/>
							</svg>
							<span
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '18px',
									fontWeight: 600,
									color: '#FCF9F7',
								}}
							>
								Вакансию
							</span>
						</button>
					</div>
				</div>
			)}

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
		</>
	)
})

WorkBottomNav.displayName = 'WorkBottomNav'

export default WorkBottomNav

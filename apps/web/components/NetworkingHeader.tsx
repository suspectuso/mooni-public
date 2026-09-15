'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import FiltersModal from './networking/FiltersModal'
import PaymentInstructionScreen from './networking/PaymentInstructionScreen'
import SubscriptionModal from './networking/SubscriptionModal'

export default function NetworkingHeader() {
	console.log('[NetworkingHeader] 🔄 Component rendering')

	const pathname = usePathname()
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [showFiltersModal, setShowFiltersModal] = useState(false)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<
		string | undefined
	>(undefined)
	const [_activeFilters, setActiveFilters] = useState<any>(null)
	const [activeFiltersCount, setActiveFiltersCount] = useState(0)
	console.log('[NetworkingHeader] State:', {
		pathname,
		showSubscriptionModal,
		showFiltersModal,
		hasActiveSubscription,
		activeFiltersCount,
	})

	const isNetworkingMainPage = pathname === '/networking'

	// Сообщаем странице о текущей открытой модалке (для BackButton)
	useEffect(() => {
		if (showPaymentInstruction) {
			document.body.dataset.headerModal = 'payment'
		} else if (showSubscriptionModal) {
			document.body.dataset.headerModal = 'subscription'
		} else if (showFiltersModal) {
			document.body.dataset.headerModal = 'filters'
		} else {
			document.body.dataset.headerModal = ''
		}
	}, [showSubscriptionModal, showFiltersModal, showPaymentInstruction])

	// Слушаем событие закрытия модалки от BackButton handler
	useEffect(() => {
		const handler = () => {
			if (showPaymentInstruction) {
				setShowPaymentInstruction(false)
			} else if (showSubscriptionModal) {
				setShowSubscriptionModal(false)
			} else if (showFiltersModal) {
				setShowFiltersModal(false)
			}
		}
		window.addEventListener('closeHeaderModal', handler)
		return () => window.removeEventListener('closeHeaderModal', handler)
	}, [showSubscriptionModal, showFiltersModal, showPaymentInstruction])

	useEffect(() => {
		checkSubscription()

		// Загружаем счетчик фильтров из localStorage
		if (typeof window !== 'undefined') {
			const savedCount = localStorage.getItem('networkingFiltersCount')
			if (savedCount) {
				setActiveFiltersCount(parseInt(savedCount))
			}
		}
	}, [])

	const checkSubscription = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id?.toString() || 'test_user'

			const response = await fetch(
				`/api/subscriptions/check?userId=${userId}&type=NETWORKING_PLUS`,
			)
			const data = await response.json()

			setHasActiveSubscription(data.hasActive || false)
			setSubscriptionEndDate(data.endDate)
		} catch (error) {
			console.error('Error checking subscription:', error)
			setHasActiveSubscription(false)
			setSubscriptionEndDate(undefined)
		}
	}

	const handleSubscriptionClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		checkSubscription() // Обновляем данные перед показом модалки
		setShowSubscriptionModal(true)
	}

	const handleFiltersClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		checkSubscription() // Обновляем данные перед показом модалки
		setShowFiltersModal(true)
	}

	const handleFiltersApply = (filters: any) => {

		// Подсчитываем активные фильтры
		let count = 0

		// Возраст (если не дефолтный 16-70)
		if (filters.ageRange[0] !== 16 || filters.ageRange[1] !== 70) {
			count++
		}

		// Город
		if (filters.city) {
			count++
		}

		// Гендер
		if (filters.gender) {
			count++
		}

		// Ауры
		if (filters.auras && filters.auras.length > 0) {
			count++
		}

		// Ценности
		if (filters.values && filters.values.length > 0) {
			count++
		}

		// Навыки
		if (filters.skills && filters.skills.length > 0) {
			count++
		}

		setActiveFilters(filters)
		setActiveFiltersCount(count)

		// Сохраняем фильтры в localStorage для доступа со страницы
		if (typeof window !== 'undefined') {
			localStorage.setItem('networkingFilters', JSON.stringify(filters))
			localStorage.setItem('networkingFiltersCount', count.toString())
			// Триггерим событие для обновления страницы
			window.dispatchEvent(new Event('filtersUpdated'))
		}
	}

	const handleSubscriptionPurchase = async () => {
		const tg = (window as any).Telegram?.WebApp

		try {
			const userId = tg?.initDataUnsafe?.user?.id?.toString()

			if (!userId) {
				throw new Error('No userId available')
			}

			// Отправляем запрос на бэк для отправки сообщения в бот
			const response = await fetch('/api/bot/send-payment-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			})

			if (!response.ok) {
				throw new Error('Failed to send payment message')
			}

			// Закрываем модалку подписки
			setShowSubscriptionModal(false)

			// Показываем экран с инструкцией
			setShowPaymentInstruction(true)

			// Открываем бот внутри Telegram (не в браузере)
			if (tg) {
				tg.HapticFeedback.notificationOccurred('success')
				// Используем openTelegramLink для открытия бота внутри Telegram
				tg.openTelegramLink('https://t.me/match_msd_bot')
			}
		} catch (error) {
			console.error('Error sending payment message:', error)
			if (tg) {
				tg.showAlert('Ошибка при отправке сообщения. Попробуйте позже.')
				tg.HapticFeedback.notificationOccurred('error')
			}
		}
	}

	const LOGO_SIZE = 53
	const FILTER_SIZE = 41

	const filterButton = (
		<button
			onClick={handleFiltersClick}
			style={{
				background: 'none',
				border: 'none',
				cursor: 'pointer',
				padding: 0,
				width: `${FILTER_SIZE}px`,
				height: `${FILTER_SIZE}px`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				position: 'relative',
				flexShrink: 0,
			}}
		>
			<img
				src='/filter_icon.png'
				alt='Фильтры'
				style={{ width: `${FILTER_SIZE}px`, height: `${FILTER_SIZE}px`, objectFit: 'contain' }}
			/>
			{activeFiltersCount > 0 && (
				<div
					style={{
						position: 'absolute',
						top: '-4px',
						left: '-4px',
						width: '18px',
						height: '18px',
						borderRadius: '50%',
						backgroundColor: '#F7710B',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '11px',
						fontWeight: 600,
						color: '#FCF9F7',
					}}
				>
					{activeFiltersCount}
				</div>
			)}
		</button>
	)

	const logoButton = (
		<button
			onClick={handleSubscriptionClick}
			style={{
				background: 'none',
				border: 'none',
				cursor: 'pointer',
				padding: 0,
				width: `${LOGO_SIZE}px`,
				height: `${LOGO_SIZE}px`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
			}}
		>
			<img
				src='/+m_netw.webp'
				alt='+M'
				style={{
					width: `${LOGO_SIZE}px`,
					height: `${LOGO_SIZE}px`,
					borderRadius: '50%',
					objectFit: 'cover',
				}}
			/>
		</button>
	)

	return (
		<>
			{/* На мобилке (Telegram) поднимаем в зону content safe area, на десктопе --tg-content-safe-top = 0 */}
			<div
				style={{
					marginTop: 'calc(-1 * var(--tg-content-safe-top, 0px))',
					paddingTop: '0px',
					paddingBottom: isNetworkingMainPage ? '24px' : '0px',
					paddingLeft: '103px',
					paddingRight: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start',
					minHeight: 'var(--tg-content-safe-top, auto)',
					background: '#121212',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
					}}
				>
					{isNetworkingMainPage && filterButton}
					{logoButton}
				</div>
			</div>

			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				onPurchase={handleSubscriptionPurchase}
				hasActiveSubscription={hasActiveSubscription}
				subscriptionEndDate={subscriptionEndDate}
			/>

			<FiltersModal
				isOpen={showFiltersModal}
				onClose={() => setShowFiltersModal(false)}
				onApply={handleFiltersApply}
				hasActiveSubscription={hasActiveSubscription}
				onSubscriptionClick={handleSubscriptionClick}
				activeFiltersCount={activeFiltersCount}
			/>

			<PaymentInstructionScreen
				isOpen={showPaymentInstruction}
				onClose={() => setShowPaymentInstruction(false)}
			/>
		</>
	)
}

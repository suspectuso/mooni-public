'use client'

import { useEffect, useRef, useState } from 'react'
import PaymentInstructionScreen from './networking/PaymentInstructionScreen'
import SubscriptionModal from './networking/SubscriptionModal'

const LOGO_SIZE = 53

export default function EducationHeader() {
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
	const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | undefined>(undefined)

	const checkSubscription = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id?.toString() || 'test_user'
			const response = await fetch(`/api/subscriptions/check?userId=${userId}&type=NETWORKING_PLUS`)
			const data = await response.json()
			setHasActiveSubscription(data.hasActive || false)
			setSubscriptionEndDate(data.endDate)
		} catch (error) {
			console.error('Error checking subscription:', error)
			setHasActiveSubscription(false)
			setSubscriptionEndDate(undefined)
		}
	}

	// Refs для актуального состояния в event listener
	const showSubscriptionRef = useRef(showSubscriptionModal)
	const showPaymentRef = useRef(showPaymentInstruction)
	useEffect(() => { showSubscriptionRef.current = showSubscriptionModal }, [showSubscriptionModal])
	useEffect(() => { showPaymentRef.current = showPaymentInstruction }, [showPaymentInstruction])

	// Слушаем событие закрытия от BackButton
	useEffect(() => {
		const handler = () => {
			if (showPaymentRef.current) {
				setShowPaymentInstruction(false)
			} else if (showSubscriptionRef.current) {
				setShowSubscriptionModal(false)
			}
		}
		window.addEventListener('closeEduHeaderModal', handler)
		return () => window.removeEventListener('closeEduHeaderModal', handler)
	}, [])

	// Сообщаем page.tsx что модалка открыта
	useEffect(() => {
		if (showSubscriptionModal || showPaymentInstruction) {
			document.body.dataset.eduHeaderModal = 'true'
		} else {
			delete document.body.dataset.eduHeaderModal
		}
	}, [showSubscriptionModal, showPaymentInstruction])

	const handleLogoClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}
		checkSubscription()
		setShowSubscriptionModal(true)
	}

	const handleSubscriptionPurchase = async () => {
		const tg = (window as any).Telegram?.WebApp
		try {
			const userId = tg?.initDataUnsafe?.user?.id?.toString()
			if (!userId) throw new Error('No userId available')

			const response = await fetch('/api/bot/send-payment-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			})
			if (!response.ok) throw new Error('Failed to send payment message')

			setShowSubscriptionModal(false)
			setShowPaymentInstruction(true)

			if (tg) {
				tg.HapticFeedback.notificationOccurred('success')
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

	return (
		<>
			<div
				style={{
					marginTop: 'calc(-1 * var(--tg-content-safe-top, 0px))',
					paddingTop: '0px',
					paddingBottom: '0px',
					paddingLeft: '103px',
					paddingRight: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start',
					minHeight: 'var(--tg-content-safe-top, auto)',
				}}
			>
				<button
					onClick={handleLogoClick}
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
						src='/+m_edu.webp'
						alt='+M'
						style={{
							width: `${LOGO_SIZE}px`,
							height: `${LOGO_SIZE}px`,
							borderRadius: '50%',
							objectFit: 'cover',
						}}
					/>
				</button>
			</div>

			<SubscriptionModal
				isOpen={showSubscriptionModal}
				onClose={() => setShowSubscriptionModal(false)}
				onPurchase={handleSubscriptionPurchase}
				hasActiveSubscription={hasActiveSubscription}
				subscriptionEndDate={subscriptionEndDate}
			/>

			<PaymentInstructionScreen
				isOpen={showPaymentInstruction}
				onClose={() => setShowPaymentInstruction(false)}
			/>
		</>
	)
}

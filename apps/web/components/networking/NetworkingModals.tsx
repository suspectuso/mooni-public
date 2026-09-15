'use client'

import { memo } from 'react'
import ExpressLoveModal from './ExpressLoveModal'
import MatchModal from './MatchModal'
import SubscriptionModal from './SubscriptionModal'
import SwipeLimitModal from './SwipeLimitModal'

interface NetworkingModalsProps {
	// Match Modal
	showMatchModal: boolean
	setShowMatchModal: (show: boolean) => void
	matchData: {
		myAvatar: string
		matchAvatar: string
		matchName: string
		matchUsername?: string
	} | null

	// Express Love Modal
	showExpressLoveModal: boolean
	setShowExpressLoveModal: (show: boolean) => void
	expressLoveData: {
		currentUserAvatar: string
		targetUserAvatar: string
		targetUserName: string
		targetUserGender?: string
		targetUserId: string
	} | null
	onExpressLoveSend: () => Promise<void>

	// Subscription Modal
	showSubscriptionModal: boolean
	setShowSubscriptionModal: (show: boolean) => void
	hasActiveSubscription: boolean
	subscriptionEndDate?: string
	onPurchase: () => void

	// Swipe Limit Modal
	limitReached: boolean
	onSubscribe: () => Promise<void>
}

const NetworkingModals = memo(function NetworkingModals({
	showMatchModal,
	setShowMatchModal,
	matchData,
	showExpressLoveModal,
	setShowExpressLoveModal,
	expressLoveData,
	onExpressLoveSend,
	showSubscriptionModal,
	setShowSubscriptionModal,
	hasActiveSubscription,
	subscriptionEndDate,
	onPurchase,
	limitReached,
	onSubscribe,
}: NetworkingModalsProps) {
	return (
		<>
			{/* Модалка мэтча */}
			{showMatchModal && matchData && (
				<MatchModal
					isOpen={showMatchModal}
					onClose={() => setShowMatchModal(false)}
					myAvatar={matchData.myAvatar}
					matchAvatar={matchData.matchAvatar}
					matchName={matchData.matchName}
					matchUsername={matchData.matchUsername}
				/>
			)}

			{/* Модалка "Выразить симпатию" */}
			{showExpressLoveModal && expressLoveData && (
				<ExpressLoveModal
					isOpen={showExpressLoveModal}
					onClose={() => setShowExpressLoveModal(false)}
					onSend={onExpressLoveSend}
					currentUserAvatar={expressLoveData.currentUserAvatar}
					targetUserAvatar={expressLoveData.targetUserAvatar}
					targetUserName={expressLoveData.targetUserName}
					targetUserGender={expressLoveData.targetUserGender}
				/>
			)}

			{/* Модалка подписки */}
			{showSubscriptionModal && (
				<SubscriptionModal
					isOpen={showSubscriptionModal}
					onClose={() => setShowSubscriptionModal(false)}
					onPurchase={onPurchase}
					hasActiveSubscription={hasActiveSubscription}
					subscriptionEndDate={subscriptionEndDate}
				/>
			)}

			{/* Модалка с лимитом свайпов */}
			<SwipeLimitModal
				isOpen={limitReached && !hasActiveSubscription}
				onSubscribe={onSubscribe}
			/>
		</>
	)
})

export default NetworkingModals

'use client'

import MatchLoader from '@/components/MatchLoader'
import PaymentInstructionScreen from '@/components/networking/PaymentInstructionScreen'
import SubscriptionModal from '@/components/networking/SubscriptionModal'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type NotificationType = 'WORK' | 'NETWORKING' | 'RADAR' | 'EDUCATION'

interface Notification {
	id: string
	type: NotificationType
	title: string
	body: string
	isRead: boolean
	createdAt: string
	data?: { matchUserId?: string } | null
}

type Tab = 'all' | 'WORK' | 'NETWORKING' | 'RADAR' | 'EDUCATION'



// Иконки действий (в карточках)
const HeartSvgPath = 'M23.2515 3.10457C22.2463 1.00858 19.3509 -0.706309 15.9829 0.29214C14.3735 0.764489 12.9694 1.77745 11.9998 3.16554C11.0303 1.77745 9.62614 0.764489 8.01675 0.29214C4.64125 -0.691065 1.75333 1.00858 0.748179 3.10457C-0.662028 6.03894 -0.0769419 9.33916 2.48844 12.9138C4.49873 15.7109 7.37165 18.5462 11.5423 21.8388C11.6741 21.9433 11.8364 22 12.0036 22C12.1707 22 12.3331 21.9433 12.4649 21.8388C16.628 18.5539 19.5084 15.7414 21.5187 12.9138C24.0766 9.33916 24.6617 6.03894 23.2515 3.10457Z'
const FireSvgPath = 'M10 29C15.5233 29 20 25.375 20 19.0313C20 16.3125 19.1667 11.7813 15.8333 8.15625C16.25 10.875 13.75 11.7813 13.75 11.7813C15 7.25 11.6667 0.90625 6.66667 0C7.26167 3.625 7.5 7.25 3.33333 10.875C1.25 12.6875 0 15.8213 0 19.0313C0 25.375 4.47667 29 10 29ZM10 27.1875C7.23833 27.1875 5 25.375 5 22.2031C5 20.8438 5.41667 18.5781 7.08333 16.7656C6.875 18.125 8.33333 19.0313 8.33333 19.0313C7.70833 16.7656 9.16667 13.1406 11.6667 12.6875C11.3683 14.5 11.25 16.3125 13.3333 18.125C14.375 19.0313 15 20.5973 15 22.2031C15 25.375 12.7617 27.1875 10 27.1875Z'

// Тип-иконки — маленькие, в верхнем левом углу карточки
// WORK: портфель (#F7710B orange)
const WorkTypeSvgPath = 'M7.15 7.98056H5.85C5.4925 7.98056 5.2 7.70431 5.2 7.36667H0.6565V9.82222C0.6565 10.4975 1.2415 11.05 1.9565 11.05H11.05C11.765 11.05 12.35 10.4975 12.35 9.82222V7.36667H7.8C7.8 7.70431 7.5075 7.98056 7.15 7.98056ZM11.7 2.45556H9.1C9.1 1.09886 7.9365 0 6.5 0C5.0635 0 3.9 1.09886 3.9 2.45556H1.3C0.585 2.45556 0 3.00806 0 3.68333V5.525C0 6.20642 0.5785 6.75278 1.3 6.75278H5.2V6.13889C5.2 5.80125 5.4925 5.525 5.85 5.525H7.15C7.5075 5.525 7.8 5.80125 7.8 6.13889V6.75278H11.7C12.415 6.75278 13 6.20028 13 5.525V3.68333C13 3.00806 12.415 2.45556 11.7 2.45556ZM5.2 2.45556C5.2 1.78028 5.785 1.22778 6.5 1.22778C7.215 1.22778 7.8 1.78028 7.8 2.45556H5.1935H5.2Z'
// NETWORKING: person+ (#F7710B orange)
const NetworkingTypeSvgPath = 'M12.5636 7.5C12.4532 7.5 12.3636 7.41046 12.3636 7.3V5.45C12.3636 5.33954 12.2741 5.25 12.1636 5.25H10.3818C10.2714 5.25 10.1818 5.16046 10.1818 5.05V3.95C10.1818 3.83954 10.2714 3.75 10.3818 3.75H12.1636C12.2741 3.75 12.3636 3.66046 12.3636 3.55V1.7C12.3636 1.58954 12.4532 1.5 12.5636 1.5H13.6182C13.7286 1.5 13.8182 1.58954 13.8182 1.7V3.55C13.8182 3.66046 13.9077 3.75 14.0182 3.75H15.8C15.9105 3.75 16 3.83954 16 3.95V5.05C16 5.16046 15.9105 5.25 15.8 5.25H14.0182C13.9077 5.25 13.8182 5.33954 13.8182 5.45V7.3C13.8182 7.41046 13.7286 7.5 13.6182 7.5H12.5636ZM5.81818 6C5.01818 6 4.33333 5.70625 3.76364 5.11875C3.19394 4.53125 2.90909 3.825 2.90909 3C2.90909 2.175 3.19394 1.46875 3.76364 0.88125C4.33333 0.29375 5.01818 0 5.81818 0C6.61818 0 7.30303 0.29375 7.87273 0.88125C8.44242 1.46875 8.72727 2.175 8.72727 3C8.72727 3.825 8.44242 4.53125 7.87273 5.11875C7.30303 5.70625 6.61818 6 5.81818 6ZM0.2 12C0.0895428 12 0 11.9105 0 11.8V9.9C0 9.475 0.106182 9.0845 0.318545 8.7285C0.530909 8.3725 0.812606 8.1005 1.16364 7.9125C1.91515 7.525 2.67879 7.2345 3.45455 7.041C4.2303 6.8475 5.01818 6.7505 5.81818 6.75C6.61818 6.7495 7.40606 6.8465 8.18182 7.041C8.95758 7.2355 9.72121 7.526 10.4727 7.9125C10.8242 8.1 11.1062 8.372 11.3185 8.7285C11.5309 9.085 11.6368 9.4755 11.6364 9.9V11.8C11.6364 11.9105 11.5468 12 11.4364 12H0.2Z'
// RADAR: crosshair (#8CFF65 green)
const RadarTypeSvgPath = 'M13.9944 8.39437C13.9944 9.87958 13.4044 11.304 12.3542 12.3542C11.304 13.4044 9.87958 13.9944 8.39437 13.9944M13.9944 8.39437C13.9944 6.90915 13.4044 5.48477 12.3542 4.43457C11.304 3.38436 9.87958 2.79437 8.39437 2.79437M13.9944 8.39437H16.3944M8.39437 13.9944C6.90915 13.9944 5.48477 13.4044 4.43457 12.3542C3.38436 11.304 2.79437 9.87958 2.79437 8.39437M8.39437 13.9944V16.3944M8.39437 2.79437C6.90915 2.79437 5.48477 3.38436 4.43457 4.43457C3.38436 5.48477 2.79437 6.90915 2.79437 8.39437M8.39437 2.79437V0.394366M2.79437 8.39437H0.394366M9.19437 8.39437C9.19437 8.60654 9.11008 8.81002 8.96005 8.96005C8.81002 9.11008 8.60654 9.19437 8.39437 9.19437C8.18219 9.19437 7.97871 9.11008 7.82868 8.96005C7.67865 8.81002 7.59437 8.60654 7.59437 8.39437C7.59437 8.18219 7.67865 7.97871 7.82868 7.82868C7.97871 7.67865 8.18219 7.59437 8.39437 7.59437C8.60654 7.59437 8.81002 7.67865 8.96005 7.82868C9.11008 7.97871 9.19437 8.18219 9.19437 8.39437Z'

// Иконки в табах
const TabWorkSvgPath = 'M7.7 8.66667H6.3C5.915 8.66667 5.6 8.36667 5.6 8H0.707V10.6667C0.707 11.4 1.337 12 2.107 12H11.9C12.67 12 13.3 11.4 13.3 10.6667V8H8.4C8.4 8.36667 8.085 8.66667 7.7 8.66667ZM12.6 2.66667H9.8C9.8 1.19333 8.547 0 7 0C5.453 0 4.2 1.19333 4.2 2.66667H1.4C0.63 2.66667 0 3.26667 0 4V6C0 6.74 0.623 7.33333 1.4 7.33333H5.6V6.66667C5.6 6.3 5.915 6 6.3 6H7.7C8.085 6 8.4 6.3 8.4 6.66667V7.33333H12.6C13.37 7.33333 14 6.73333 14 6V4C14 3.26667 13.37 2.66667 12.6 2.66667ZM5.6 2.66667C5.6 1.93333 6.23 1.33333 7 1.33333C7.77 1.33333 8.4 1.93333 8.4 2.66667H5.593H5.6Z'
const TabNetworkingSvgPath = 'M12.5636 7.5C12.4532 7.5 12.3636 7.41046 12.3636 7.3V5.45C12.3636 5.33954 12.2741 5.25 12.1636 5.25H10.3818C10.2714 5.25 10.1818 5.16046 10.1818 5.05V3.95C10.1818 3.83954 10.2714 3.75 10.3818 3.75H12.1636C12.2741 3.75 12.3636 3.66046 12.3636 3.55V1.7C12.3636 1.58954 12.4532 1.5 12.5636 1.5H13.6182C13.7286 1.5 13.8182 1.58954 13.8182 1.7V3.55C13.8182 3.66046 13.9077 3.75 14.0182 3.75H15.8C15.9105 3.75 16 3.83954 16 3.95V5.05C16 5.16046 15.9105 5.25 15.8 5.25H14.0182C13.9077 5.25 13.8182 5.33954 13.8182 5.45V7.3C13.8182 7.41046 13.7286 7.5 13.6182 7.5H12.5636ZM5.81818 6C5.01818 6 4.33333 5.70625 3.76364 5.11875C3.19394 4.53125 2.90909 3.825 2.90909 3C2.90909 2.175 3.19394 1.46875 3.76364 0.88125C4.33333 0.29375 5.01818 0 5.81818 0C6.61818 0 7.30303 0.29375 7.87273 0.88125C8.44242 1.46875 8.72727 2.175 8.72727 3C8.72727 3.825 8.44242 4.53125 7.87273 5.11875C7.30303 5.70625 6.61818 6 5.81818 6ZM0.2 12C0.0895428 12 0 11.9105 0 11.8V9.9C0 9.475 0.106182 9.0845 0.318545 8.7285C0.530909 8.3725 0.812606 8.1005 1.16364 7.9125C1.91515 7.525 2.67879 7.2345 3.45455 7.041C4.2303 6.8475 5.01818 6.7505 5.81818 6.75C6.61818 6.7495 7.40606 6.8465 8.18182 7.041C8.95758 7.2355 9.72121 7.526 10.4727 7.9125C10.8242 8.1 11.1062 8.372 11.3185 8.7285C11.5309 9.085 11.6368 9.4755 11.6364 9.9V11.8C11.6364 11.9105 11.5468 12 11.4364 12H0.2Z'
const TabRadarSvgPath = 'M16.65 10C16.65 11.7637 15.9494 13.4551 14.7023 14.7023C13.4551 15.9494 11.7637 16.65 10 16.65M16.65 10C16.65 8.23631 15.9494 6.54486 14.7023 5.29774C13.4551 4.05062 11.7637 3.35 10 3.35M16.65 10H19.5M10 16.65C8.23631 16.65 6.54486 15.9494 5.29774 14.7023C4.05062 13.4551 3.35 11.7637 3.35 10M10 16.65V19.5M10 3.35C8.23631 3.35 6.54486 4.05062 5.29774 5.29774C4.05062 6.54486 3.35 8.23631 3.35 10M10 3.35V0.5M3.35 10H0.5M10.95 10C10.95 10.252 10.8499 10.4936 10.6718 10.6718C10.4936 10.8499 10.252 10.95 10 10.95C9.74804 10.95 9.50641 10.8499 9.32825 10.6718C9.15009 10.4936 9.05 10.252 9.05 10C9.05 9.74804 9.15009 9.50641 9.32825 9.32825C9.50641 9.15009 9.74804 9.05 10 9.05C10.252 9.05 10.4936 9.15009 10.6718 9.32825C10.8499 9.50641 10.95 9.74804 10.95 10Z'


function TypeIcon({ type }: { type: NotificationType }) {
	if (type === 'WORK') {
		return (
			<svg width='13' height='11' viewBox='0 0 13 11.05' fill='none' overflow='visible'>
				<path d={WorkTypeSvgPath} fill='#F7710B' />
			</svg>
		)
	}
	if (type === 'NETWORKING') {
		return (
			<svg width='14' height='12' viewBox='0 0 16 12' fill='none' overflow='visible'>
				<path d={NetworkingTypeSvgPath} fill='#F7710B' />
			</svg>
		)
	}
	if (type === 'RADAR') {
		return (
			<svg width='14' height='14' viewBox='0 0 16.7887 16.7887' fill='none' overflow='visible'>
				<path d={RadarTypeSvgPath} stroke='#8CFF65' strokeWidth='0.788732' strokeLinecap='round' />
			</svg>
		)
	}
	// EDUCATION
	return (
		<svg width='13' height='11' viewBox='0 0 16 13' fill='none' overflow='visible'>
			<path d='M6.20748 0.844985C5.00325 0.284449 3.32006 0.00986736 1.06658 0.000118904C0.854053 -0.00269609 0.645697 0.0577221 0.469296 0.173317C0.324504 0.268731 0.20598 0.397371 0.124148 0.547922C0.0423158 0.698473 -0.000316094 0.866322 1.76447e-06 1.03671V10.3335C1.76447e-06 10.9619 0.45863 11.436 1.06658 11.436C3.43538 11.436 5.81152 11.6518 7.23473 12.9633C7.2542 12.9813 7.27867 12.9934 7.30511 12.9979C7.33154 13.0025 7.35877 12.9994 7.38341 12.989C7.40806 12.9786 7.42903 12.9614 7.44372 12.9395C7.45841 12.9176 7.46617 12.892 7.46604 12.8658V1.91147C7.46608 1.83756 7.44985 1.76451 7.41846 1.69724C7.38707 1.62997 7.34123 1.57005 7.28406 1.52153C6.95806 1.24982 6.59593 1.02225 6.20748 0.844985ZM15.5294 0.172342C15.3529 0.0570349 15.1445 -0.00304595 14.9321 0.000118904C12.6786 0.00986736 10.9954 0.283149 9.79118 0.844985C9.40276 1.02192 9.04053 1.24905 8.71427 1.52023C8.65721 1.56883 8.61148 1.62877 8.58014 1.69602C8.54881 1.76328 8.53261 1.8363 8.53262 1.91017V12.8652C8.53261 12.8903 8.54021 12.9149 8.55448 12.9359C8.56874 12.9568 8.58904 12.9732 8.61282 12.983C8.6366 12.9927 8.68815 12.9907C8.71349 12.986 8.73684 12.9741 8.75527 12.9565C9.61087 12.1279 11.1124 11.4351 14.9334 11.4354C15.2163 11.4354 15.4876 11.3258 15.6876 11.1308C15.8876 10.9358 16 10.6713 16 10.3956V1.03703C16.0004 0.86631 15.9577 0.698123 15.8756 0.547318C15.7935 0.396514 15.6746 0.267731 15.5294 0.172342Z' fill='rgba(252,249,247,0.65)' />
		</svg>
	)
}

function ActionIcon({ body }: { body: string }) {
	const isFire =
		body.toLowerCase().includes('мэтч') ||
		body.toLowerCase().includes('оценил') ||
		body.toLowerCase().includes('огон')

	if (isFire) {
		return (
			<svg width='20' height='29' viewBox='0 0 20 29' fill='none' overflow='visible'>
				<path d={FireSvgPath} fill='rgba(252,249,247,0.65)' />
			</svg>
		)
	}
	return (
		<svg width='24' height='22' viewBox='0 0 24 22' fill='none' overflow='visible'>
			<path d={HeartSvgPath} fill='rgba(252,249,247,0.65)' />
		</svg>
	)
}

const TABS: { key: Tab; label: string; icon?: React.ReactNode }[] = [
	{ key: 'all', label: 'Все' },
	{
		key: 'WORK',
		label: 'Работа',
		icon: (
			<svg width='14' height='12' viewBox='0 0 14 12' fill='none' overflow='visible'>
				<path d={TabWorkSvgPath} fill='currentColor' fillOpacity={0.65} />
			</svg>
		),
	},
	{
		key: 'NETWORKING',
		label: 'Нетворкинг',
		icon: (
			<svg width='17' height='13' viewBox='0 0 17 13' fill='none' overflow='visible'>
				<path d={TabNetworkingSvgPath} fill='currentColor' fillOpacity={0.65} />
			</svg>
		),
	},
	{
		key: 'RADAR',
		label: 'Радар',
		icon: (
			<svg width='20' height='20' viewBox='0 0 20 20' fill='none' overflow='visible'>
				<path d={TabRadarSvgPath} stroke='currentColor' strokeOpacity={0.65} strokeLinecap='round' />
			</svg>
		),
	},
	{
		key: 'EDUCATION',
		label: 'Обучение',
		icon: (
			<svg width='16' height='13' viewBox='0 0 16 13' fill='none' overflow='visible'>
				<path d='M6.20748 0.844985C5.00325 0.284449 3.32006 0.00986736 1.06658 0.000118904C0.854053 -0.00269609 0.645697 0.0577221 0.469296 0.173317C0.324504 0.268731 0.20598 0.397371 0.124148 0.547922C0.0423158 0.698473 -0.000316094 0.866322 1.76447e-06 1.03671V10.3335C1.76447e-06 10.9619 0.45863 11.436 1.06658 11.436C3.43538 11.436 5.81152 11.6518 7.23473 12.9633C7.2542 12.9813 7.27867 12.9934 7.30511 12.9979C7.33154 13.0025 7.35877 12.9994 7.38341 12.989C7.40806 12.9786 7.42903 12.9614 7.44372 12.9395C7.45841 12.9176 7.46617 12.892 7.46604 12.8658V1.91147C7.46608 1.83756 7.44985 1.76451 7.41846 1.69724C7.38707 1.62997 7.34123 1.57005 7.28406 1.52153C6.95806 1.24982 6.59593 1.02225 6.20748 0.844985ZM15.5294 0.172342C15.3529 0.0570349 15.1445 -0.00304595 14.9321 0.000118904C12.6786 0.00986736 10.9954 0.283149 9.79118 0.844985C9.40276 1.02192 9.04053 1.24905 8.71427 1.52023C8.65721 1.56883 8.61148 1.62877 8.58014 1.69602C8.54881 1.76328 8.53261 1.8363 8.53262 1.91017V12.8652C8.53261 12.8903 8.54021 12.9149 8.55448 12.9359C8.56874 12.9568 8.58904 12.9732 8.61282 12.983C8.6366 12.9927 8.68815 12.9907C8.71349 12.986 8.73684 12.9741 8.75527 12.9565C9.61087 12.1279 11.1124 11.4351 14.9334 11.4354C15.2163 11.4354 15.4876 11.3258 15.6876 11.1308C15.8876 10.9358 16 10.6713 16 10.3956V1.03703C16.0004 0.86631 15.9577 0.698123 15.8756 0.547318C15.7935 0.396514 15.6746 0.267731 15.5294 0.172342Z' fill='currentColor' fillOpacity={0.65} />
			</svg>
		),
	},
]

export default function NotificationsPage() {
	const router = useRouter()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<Tab>('all')
	const [_unreadCount, setUnreadCount] = useState(0)
	const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
	const [showPaymentInstruction, setShowPaymentInstruction] = useState(false)
	const showSubscriptionRef = useRef(false)
	const showPaymentRef = useRef(false)
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

	const handleLogoClick = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) tg.HapticFeedback.impactOccurred('light')
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

	useEffect(() => { showSubscriptionRef.current = showSubscriptionModal }, [showSubscriptionModal])
	useEffect(() => { showPaymentRef.current = showPaymentInstruction }, [showPaymentInstruction])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => {
			if (showPaymentRef.current) {
				setShowPaymentInstruction(false)
				return
			}
			if (showSubscriptionRef.current) {
				setShowSubscriptionModal(false)
				return
			}
			router.push('/')
		}
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}
		const telegramId = tg?.initDataUnsafe?.user?.id?.toString()
		if (!telegramId) { setLoading(false); return }

		const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
		fetch(`${API}/notifications?telegramId=${telegramId}`)
			.then(r => r.json())
			.then(data => {
				const list: Notification[] = Array.isArray(data) ? data : []
				setNotifications(list)
				setUnreadCount(list.filter(n => !n.isRead).length)
				setLoading(false)
				fetch(`${API}/notifications/read-all?telegramId=${telegramId}`, { method: 'PATCH' }).catch(() => {})
			})
			.catch(() => setLoading(false))

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [router])

	const filtered = activeTab === 'all' ? notifications : notifications.filter(n => n.type === activeTab)

	if (loading) return <MatchLoader />

	return (
		<div style={{
			minHeight: '100vh',
			backgroundColor: '#121212',
			display: 'flex',
			flexDirection: 'column',
			maxWidth: '480px',
			margin: '0 auto',
			padding: '0 25px',
			fontFamily: 'Zen Kaku Gothic New, sans-serif',
		}}>

			{/* ── Top nav ── */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'flex-start',
				paddingTop: '0px',
				paddingBottom: '0px',
				paddingLeft: '78px',
				paddingRight: '0px',
				marginTop: 'calc(-1 * var(--tg-content-safe-top, 0px))',
				minHeight: 'var(--tg-content-safe-top, auto)',
			}}>
				{/* +М логотип — кликабельный, как в обучении */}
				<button
					onClick={handleLogoClick}
					style={{
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						padding: 0,
						width: '53px',
						height: '53px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					<img
						src='/+m_edu.webp'
						alt='+М'
						style={{
							width: '53px',
							height: '53px',
							borderRadius: '50%',
							objectFit: 'cover',
						}}
					/>
				</button>
			</div>

			{/* ── Title ── */}
			<h1 style={{
				fontFamily: 'Zen Kaku Gothic New, sans-serif',
				fontWeight: 900,
				fontSize: '24px',
				lineHeight: 1,
				color: '#FCF9F7',
				margin: '24px 0 20px',
				padding: 0,
			}}>
				Уведомления
			</h1>

			{/* ── Tabs ── */}
			<div style={{
				display: 'flex',
				gap: '8px',
				marginBottom: '16px',
				overflowX: 'auto',
				scrollbarWidth: 'none',
			} as React.CSSProperties}>
				{TABS.map(tab => {
					const isActive = activeTab === tab.key
					return (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '5px',
								padding: '0 14px',
								height: '35px',
								borderRadius: '21px',
								border: 'none',
								background: isActive ? '#FCF9F7' : 'rgba(252,249,247,0.15)',
								color: isActive ? '#121212' : '#FCF9F7',
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontWeight: 900,
								fontSize: '14px',
								lineHeight: 1,
								cursor: 'pointer',
								whiteSpace: 'nowrap',
								flexShrink: 0,
							}}
						>
							{tab.icon}
							{tab.label}
						</button>
					)
				})}
			</div>

			{/* ── Notifications ── */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '40px' }}>
				{filtered.length === 0 ? (
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', gap: '16px' }}>
						<svg width='40' height='40' viewBox='0 0 24 24' fill='none'>
							<path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' stroke='rgba(252,249,247,0.2)' strokeWidth='1.5' strokeLinecap='round' />
						</svg>
						<p style={{ fontFamily: 'Zen Kaku Gothic New, sans-serif', fontSize: '14px', color: 'rgba(252,249,247,0.4)', margin: 0 }}>
							Уведомлений пока нет
						</p>
					</div>
				) : (
					filtered.map(notif => (
						<div
							key={notif.id}
							onClick={() => {
								if (notif.data?.matchUserId) {
									router.push(`/networking/user/${notif.data.matchUserId}`)
								}
							}}
							style={{
								position: 'relative',
								width: '100%',
								minHeight: '68px',
								borderRadius: '18px',
								backgroundColor: notif.isRead ? 'rgba(252,249,247,0.01)' : 'rgba(252,249,247,0.05)',
								display: 'flex',
								alignItems: 'center',
								padding: '14px 14px 14px 16px',
								gap: '10px',
								boxSizing: 'border-box',
								cursor: notif.data?.matchUserId ? 'pointer' : 'default',
							}}
						>
							{/* Маленькая иконка типа — абсолют верх-лево */}
							<div style={{ position: 'absolute', top: '10px', left: '12px' }}>
								<TypeIcon type={notif.type} />
							</div>

							{/* Иконка действия */}
							<div style={{ flexShrink: 0, width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<ActionIcon body={notif.body} />
							</div>

							{/* Текст */}
							<p style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontWeight: 500,
								fontSize: '14px',
								lineHeight: 1,
								color: '#FCF9F7',
								margin: 0,
								flex: 1,
								minWidth: 0,
								overflow: 'hidden',
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
							} as React.CSSProperties}>
								{notif.body}
							</p>

							{/* Красная точка — только у непрочитанных */}
							{!notif.isRead && (
								<div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F23318', flexShrink: 0 }} />
							)}
						</div>
					))
				)}
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
		</div>
	)
}

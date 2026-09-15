'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import MatchLoader from './MatchLoader'

export default function BanChecker() {
	const router = useRouter()
	const pathname = usePathname()
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		// Не проверяем на странице бана
		if (pathname === '/banned') {
			setIsChecking(false)
			return
		}

		const checkBan = async () => {
			try {
				const tg = (window as any).Telegram?.WebApp
				const userId = tg?.initDataUnsafe?.user?.id?.toString()

				console.log('[BanChecker] Starting check')
				console.error(
					'[BanChecker] Telegram WebApp:',
					tg ? 'exists' : 'not found',
				)
				console.log('[BanChecker] initDataUnsafe:', tg?.initDataUnsafe)
				console.log('[BanChecker] userId:', userId)

				if (!userId) {
					console.log('[BanChecker] No userId, skipping check')
					setIsChecking(false)
					return
				}

				const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
				const url = `${API_URL}/users/telegram/${userId}/check-ban`
				console.log('[BanChecker] Fetching:', url)

				const response = await fetch(url)

				console.log('[BanChecker] Response status:', response.status)

				if (!response.ok) {
					console.error('[BanChecker] API error, status:', response.status)
					setIsChecking(false)
					return
				}

				const data = await response.json()
				console.log('[BanChecker] Response data:', data)

				if (data.isBanned) {
					console.log('[BanChecker] User is banned, redirecting to /banned')
					router.replace('/banned')
				} else {
					console.log('[BanChecker] User is not banned')
					setIsChecking(false)
				}
			} catch (error) {
				console.error('[BanChecker] Error checking ban:', error)
				setIsChecking(false)
			}
		}

		checkBan()
	}, [pathname, router])

	// Показываем overlay пока проверяем
	if (isChecking && pathname !== '/banned') {
		return <MatchLoader />
	}

	return null
}

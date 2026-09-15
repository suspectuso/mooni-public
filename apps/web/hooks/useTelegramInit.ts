'use client'

import { useEffect, useState } from 'react'

export function useTelegramInit() {
	const [isPlatformDesktop, setIsPlatformDesktop] = useState(false)

	useEffect(() => {
		document.body.style.overflow = 'hidden'
		document.body.style.position = 'fixed'
		document.body.style.width = '100%'
		document.body.style.height = '100%'
		document.body.style.backgroundColor = '#121212'
		document.documentElement.style.backgroundColor = '#121212'

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.ready()
			tg.expand()
			tg.setHeaderColor('#121212')
			tg.setBackgroundColor('#121212')
			tg.disableVerticalSwipes()

			const platform = tg.platform || ''
			const isDesktop =
				platform.includes('macos') ||
				platform.includes('windows') ||
				platform.includes('linux') ||
				platform.includes('web')
			setIsPlatformDesktop(isDesktop)

		} else {
			console.warn('Telegram WebApp not available')
		}

		return () => {
			document.body.style.overflow = ''
			document.body.style.position = ''
			document.body.style.width = ''
			document.body.style.height = ''
			document.body.style.backgroundColor = ''
			document.documentElement.style.backgroundColor = ''
		}
	}, [])

	return { isPlatformDesktop }
}

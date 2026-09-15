'use client'

import { useEffect } from 'react'

let fetchPatched = false

export default function TelegramInit() {
	useEffect(() => {
		// Хардненинг: один раз патчим fetch — подписанный initData во все запросы к /api/*.
		// Бэк доверяет initData, а не ?userId. Покрывает сырой fetch экранов Match.
		if (!fetchPatched) {
			fetchPatched = true
			const origFetch = window.fetch.bind(window)
			window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
				let nextInit = init
				try {
					const url =
						typeof input === 'string'
							? input
							: input instanceof URL
								? input.href
								: input.url
					const initData = window.Telegram?.WebApp?.initData
					if (initData && url.includes('/api/')) {
						const headers = new Headers(init?.headers)
						if (!headers.has('X-Telegram-Init-Data')) {
							headers.set('X-Telegram-Init-Data', initData)
						}
						nextInit = { ...init, headers }
					}
				} catch {
					// нестандартный ввод — не ломаем fetch
				}
				return origFetch(input, nextInit)
			}
		}

		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			const tg = window.Telegram.WebApp

			// Готовность приложения
			tg.ready()

			// Расширяем и переходим в fullscreen только на мобильных
			tg.expand()
			const isMobile = tg.platform === 'ios' || tg.platform === 'android'
			if (isMobile && typeof tg.requestFullscreen === 'function') {
				tg.requestFullscreen()
			}

			// Устанавливаем цвета
			tg.setHeaderColor('#121212')
			tg.setBackgroundColor('#121212')

			// Safe area — отступ под шапкой Telegram (актуально в fullscreen)
			const root = document.documentElement
			const updateSafeArea = () => {
				const safe = tg.safeAreaInset || { top: 0 }
				const content = tg.contentSafeAreaInset || { top: 0 }
				root.style.setProperty('--tg-safe-top', `${safe.top + content.top}px`)
				root.style.setProperty('--tg-content-safe-top', `${content.top}px`)
			}
			tg.onEvent('safeAreaChanged', updateSafeArea)
			tg.onEvent('contentSafeAreaChanged', updateSafeArea)
			tg.onEvent('fullscreenChanged', updateSafeArea)
			updateSafeArea()

			// Сохраняем аватарку пользователя
			const saveUserAvatar = async () => {
				const user = tg.initDataUnsafe?.user

				if (user) {
					try {
						// Получаем фото профиля через Telegram WebApp API
						const photoUrl = user.photo_url || null

						// Обновляем пользователя с аватаркой
						const response = await fetch('/api/users', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								telegramId: user.id.toString(),
								username: user.username || null,
								firstName: user.first_name || null,
								lastName: user.last_name || null,
								avatarUrl: photoUrl,
							}),
						})

						if (!response.ok) {
							const errorText = await response.text()
							console.error('telegram-init: Failed to create user:', errorText)
						} else {
							const userData = await response.json()
						}
					} catch (error) {
						console.error('Error saving user avatar:', error)
					}
				} else {
					console.warn('telegram-init: No user data from Telegram')
				}
			}

			saveUserAvatar()
		}

		// Блокируем только pull-to-refresh и bounce эффект
		let lastTouchY = 0
		let preventPullToRefresh = false

		const touchStart = (e: TouchEvent) => {
			// Блокируем pinch-zoom (два пальца и более)
			if (e.touches.length > 1) {
				e.preventDefault()
				e.stopPropagation()
				return false
			}

			if (e.touches.length === 1) {
				lastTouchY = e.touches[0].clientY
				// Проверяем, находимся ли мы в начале страницы
				preventPullToRefresh = window.scrollY === 0
			}
		}

		const touchMove = (e: TouchEvent) => {
			// Блокируем pinch-zoom (два пальца и более)
			if (e.touches.length > 1) {
				e.preventDefault()
				e.stopPropagation()
				return false
			}

			if (e.touches.length !== 1) return

			const touchY = e.touches[0].clientY
			const touchYDelta = touchY - lastTouchY
			lastTouchY = touchY

			// Блокируем pull-to-refresh только если тянем вниз в начале страницы
			if (preventPullToRefresh && touchYDelta > 0) {
				e.preventDefault()
				return
			}
		}

		const touchEnd = (e: TouchEvent) => {
			// Блокируем pinch-zoom
			if (e.touches.length > 1) {
				e.preventDefault()
				e.stopPropagation()
				return false
			}
		}

		const preventZoom = (e: WheelEvent) => {
			// Блокируем только zoom (Ctrl+колесико), но разрешаем обычный скролл
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault()
			}
		}

		// Блокируем жесты масштабирования
		const preventGesture = (e: Event) => {
			e.preventDefault()
		}

		document.addEventListener('touchstart', touchStart, { passive: false })
		document.addEventListener('touchmove', touchMove, { passive: false })
		document.addEventListener('touchend', touchEnd, { passive: false })
		document.addEventListener('wheel', preventZoom, { passive: false })
		document.addEventListener('gesturestart', preventGesture, {
			passive: false,
		})
		document.addEventListener('gesturechange', preventGesture, {
			passive: false,
		})
		document.addEventListener('gestureend', preventGesture, { passive: false })

		return () => {
			document.removeEventListener('touchstart', touchStart)
			document.removeEventListener('touchmove', touchMove)
			document.removeEventListener('touchend', touchEnd)
			document.removeEventListener('wheel', preventZoom)
			document.removeEventListener('gesturestart', preventGesture)
			document.removeEventListener('gesturechange', preventGesture)
			document.removeEventListener('gestureend', preventGesture)
		}
	}, [])

	return null
}

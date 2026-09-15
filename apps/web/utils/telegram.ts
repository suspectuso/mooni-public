// Сырой подписанный Telegram initData — для заголовка X-Telegram-Init-Data (хардненинг).
export const getInitData = (): string => {
	if (typeof window === 'undefined') return ''
	return (window as any).Telegram?.WebApp?.initData ?? ''
}

export const getUserId = () => {
	const tg = (window as any).Telegram?.WebApp

	// Способ 1: Прямой доступ к user.id
	let userId = tg?.initDataUnsafe?.user?.id?.toString()

	if (userId && userId !== 'undefined') {
		return userId
	}

	// Способ 2: Парсинг initData
	const initData = tg?.initData
	if (initData) {
		try {
			const params = new URLSearchParams(initData)
			const userParam = params.get('user')
			if (userParam) {
				const user = JSON.parse(userParam)
				userId = user.id?.toString()
				if (userId && userId !== 'undefined') {
					return userId
				}
			}
		} catch (e) {
			console.error('Error parsing initData:', e)
		}
	}

	// Способ 3: Проверяем query_id (для старых версий)
	if (initData) {
		try {
			const params = new URLSearchParams(initData)
			const queryId = params.get('query_id')
			if (queryId) {
				console.log(
					'getUserId: Found query_id, but no user id. InitData:',
					initData,
				)
			}
		} catch (e) {
			console.error('Error checking query_id:', e)
		}
	}

	// Вне Telegram (обычный браузер / дев) — демо-пользователь, чтобы экраны работали.
	console.warn('getUserId: no Telegram context, falling back to demo user 1')
	return '1'
}

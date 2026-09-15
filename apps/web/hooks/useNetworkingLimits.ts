import { useEffect, useState } from 'react'

export const useNetworkingLimits = () => {
	const [swipesCount, setSwipesCount] = useState(0)
	const [likesCount, setLikesCount] = useState(0)
	const [limitReached, setLimitReached] = useState(false)
	const [limitMessage, setLimitMessage] = useState('')
	const [timeUntilReset, setTimeUntilReset] = useState('')

	const SWIPES_LIMIT = 50
	const LIKES_LIMIT = 20
	const isDev = false

	const getTodayKey = () => {
		const now = new Date()
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
	}

	const loadCounts = async () => {
		if (isDev) {
			return
		}

		const tg = (window as any).Telegram?.WebApp
		if (!tg?.CloudStorage) {
			console.warn('Telegram Cloud Storage not available')
			return
		}

		const today = getTodayKey()
		return new Promise<void>(resolve => {
			tg.CloudStorage.getItems(
				[`swipes_${today}`, `likes_${today}`],
				(error: any, result: any) => {
					if (error) {
						console.error('Error loading counts:', error)
						resolve()
						return
					}

					const swipes = parseInt(result[`swipes_${today}`] || '0')
					const likes = parseInt(result[`likes_${today}`] || '0')

					setSwipesCount(swipes)
					setLikesCount(likes)

					if (swipes >= SWIPES_LIMIT) {
						setLimitReached(true)
						setLimitMessage('Вы достигли лимита свайпов на сегодня (50)')
					} else if (likes >= LIKES_LIMIT) {
						setLimitReached(true)
						setLimitMessage('Вы достигли лимита лайков на сегодня (20)')
					}

					resolve()
				},
			)
		})
	}

	const saveCounts = (newSwipes: number, newLikes: number) => {
		if (isDev) return

		const tg = (window as any).Telegram?.WebApp
		if (!tg?.CloudStorage) {
			console.warn('Telegram Cloud Storage not available')
			return
		}

		const today = getTodayKey()

		tg.CloudStorage.setItem(
			`swipes_${today}`,
			newSwipes.toString(),
			(error: any, _success: boolean) => {
				if (error) {
					console.error('Error saving swipes:', error)
				} else {
					console.log('Swipes saved successfully:', newSwipes)
				}
			},
		)

		tg.CloudStorage.setItem(
			`likes_${today}`,
			newLikes.toString(),
			(error: any, _success: boolean) => {
				if (error) {
					console.error('Error saving likes:', error)
				} else {
					console.log('Likes saved successfully:', newLikes)
				}
			},
		)
	}

	const incrementSwipes = () => {
		const newCount = swipesCount + 1
		setSwipesCount(newCount)
		saveCounts(newCount, likesCount)

		if (newCount >= SWIPES_LIMIT) {
			setLimitReached(true)
			setLimitMessage('Вы достигли лимита свайпов на сегодня (50)')
		}
	}

	const incrementLikes = () => {
		const newCount = likesCount + 1
		setLikesCount(newCount)
		saveCounts(swipesCount + 1, newCount)

		if (newCount >= LIKES_LIMIT) {
			setLimitReached(true)
			setLimitMessage('Вы достигли лимита лайков на сегодня (20)')
		}
	}

	useEffect(() => {
		if (!limitReached) return

		const updateTimer = () => {
			const now = new Date()
			const tomorrow = new Date(now)
			tomorrow.setDate(tomorrow.getDate() + 1)
			tomorrow.setHours(0, 0, 0, 0)

			const diff = tomorrow.getTime() - now.getTime()
			const hours = Math.floor(diff / (1000 * 60 * 60))
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
			const seconds = Math.floor((diff % (1000 * 60)) / 1000)

			setTimeUntilReset(
				`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
			)
		}

		updateTimer()
		const interval = setInterval(updateTimer, 1000)
		return () => clearInterval(interval)
	}, [limitReached])

	return {
		swipesCount,
		likesCount,
		limitReached,
		setLimitReached,
		limitMessage,
		setLimitMessage,
		timeUntilReset,
		loadCounts,
		incrementSwipes,
		incrementLikes,
		SWIPES_LIMIT,
		LIKES_LIMIT,
	}
}

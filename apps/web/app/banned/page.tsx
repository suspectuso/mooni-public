'use client'

import MatchLoader from '@/components/MatchLoader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BannedPage() {
	const router = useRouter()
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.hide()
		}

		// Блокируем скролл
		document.body.style.overflow = 'hidden'
		document.body.style.position = 'fixed'
		document.body.style.width = '100%'
		document.body.style.height = '100%'

		// Проверяем статус бана только один раз при загрузке
		const checkBanStatus = async () => {
			try {
				const userId = tg?.initDataUnsafe?.user?.id?.toString()

				if (!userId) {
					setIsChecking(false)
					return
				}

				const API_URL =
					process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
				const response = await fetch(
					`${API_URL}/users/telegram/${userId}/check-ban`,
				)
				const data = await response.json()

				if (!data.isBanned) {
					// Пользователь разбанен - возвращаем на главную
					router.replace('/')
				} else {
					setIsChecking(false)
				}
			} catch (error) {
				console.error('Error checking ban status:', error)
				setIsChecking(false)
			}
		}

		checkBanStatus()

		return () => {
			document.body.style.overflow = ''
			document.body.style.position = ''
			document.body.style.width = ''
			document.body.style.height = ''
		}
	}, [router])

	if (isChecking) {
		return <MatchLoader />
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: '#1E1B1A',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '20px',
				zIndex: 9999,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					width: '100px',
					height: '100px',
					borderRadius: '50%',
					backgroundColor: 'rgba(242, 51, 24, 0.2)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: '32px',
				}}
			>
				<svg
					width='50'
					height='50'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 7.58 7.58 4 12 4C13.85 4 15.55 4.63 16.9 5.69L5.69 16.9C4.63 15.55 4 13.85 4 12ZM12 20C10.15 20 8.45 19.37 7.1 18.31L18.31 7.1C19.37 8.45 20 10.15 20 12C20 16.42 16.42 20 12 20Z'
						fill='#F23318'
					/>
				</svg>
			</div>

			<h1
				style={{
					fontFamily: 'Oks, sans-serif',
					fontSize: '32px',
					lineHeight: '1.1',
					letterSpacing: '0.02em',
					color: '#FCF9F7',
					textAlign: 'center',
					marginBottom: '16px',
					margin: 0,
				}}
			>
				Вы заблокированы
			</h1>

			<p
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '16px',
					lineHeight: '1.5',
					color: 'rgba(252, 249, 247, 0.65)',
					textAlign: 'center',
					maxWidth: '400px',
					marginBottom: '32px',
					margin: '0 0 32px 0',
				}}
			>
				Ваш аккаунт был заблокирован администрацией. Доступ к приложению
				ограничен.
			</p>

			<p
				style={{
					fontFamily: 'LT Superior, sans-serif',
					fontSize: '14px',
					lineHeight: '1.5',
					color: 'rgba(252, 249, 247, 0.45)',
					textAlign: 'center',
					maxWidth: '400px',
					margin: 0,
				}}
			>
				Если вы считаете, что это ошибка, обратитесь в поддержку
			</p>
		</div>
	)
}

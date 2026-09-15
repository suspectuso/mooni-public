'use client'

import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditRadarProfilePage() {
	const router = useRouter()
	const [name, setName] = useState('')
	const [username, setUsername] = useState('')
	const [showUsername, setShowUsername] = useState(true)
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [_showModal, setShowModal] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { router.back() }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		loadProfile()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	const loadProfile = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			// Загружаем данные профиля
			const response = await fetch(`/api/users/profile?userId=${userId}`)
			if (response.ok) {
				const data = await response.json()
				setName(data.firstName || '')
				setUsername(data.username || '')
				setAvatarUrl(data.avatarUrl)
				// TODO: загрузить настройку showUsername из базы
			}
		} catch (error) {
			console.error('Error loading profile:', error)
		}
	}

	const handleAvatarClick = () => {
		setShowModal(true)
	}

	const handleSave = async () => {
		setLoading(true)
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			const response = await fetch(`/api/users/profile`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'x-telegram-user-id': userId.toString(),
				},
				body: JSON.stringify({
					firstName: name,
					username: showUsername ? username : null,
				}),
			})

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				router.back()
			}
		} catch (error) {
			console.error('Error saving profile:', error)
			alert('Ошибка при сохранении')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#1E1B1A',
				paddingBottom: '100px',
			}}
		>
			<RadarHeader />
			<div style={{ padding: '20px' }}>
				<h1
					style={{
						fontFamily: 'Zen Kaku Gothic New, sans-serif',
						fontWeight: 900,
						fontSize: '24px',
						color: '#FCF9F7',
						marginBottom: '24px',
						textAlign: 'center',
					}}
				>
					Мэтч радар
				</h1>

				{/* Аватар с иконкой редактирования */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '32px',
						position: 'relative',
					}}
				>
					<div
						onClick={handleAvatarClick}
						style={{
							width: '200px',
							height: '200px',
							borderRadius: '50%',
							backgroundColor: '#FCF9F7',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '72px',
							fontWeight: 700,
							color: '#1E1B1A',
							overflow: 'hidden',
							cursor: 'pointer',
							position: 'relative',
						}}
					>
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt='Avatar'
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						) : (
							name.substring(0, 2).toUpperCase()
						)}
						{/* Иконка редактирования */}
						<div
							style={{
								position: 'absolute',
								top: '10px',
								right: '10px',
								width: '40px',
								height: '40px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<svg
								width='20'
								height='20'
								viewBox='0 0 20 20'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M14.166 2.5009C14.3849 2.28203 14.6447 2.10842 14.9307 1.98996C15.2167 1.87151 15.5232 1.81055 15.8327 1.81055C16.1422 1.81055 16.4487 1.87151 16.7347 1.98996C17.0206 2.10842 17.2805 2.28203 17.4993 2.5009C17.7182 2.71977 17.8918 2.97961 18.0103 3.26558C18.1287 3.55154 18.1897 3.85804 18.1897 4.16757C18.1897 4.4771 18.1287 4.7836 18.0103 5.06956C17.8918 5.35553 17.7182 5.61537 17.4993 5.83424L6.24935 17.0842L1.66602 18.3342L2.91602 13.7509L14.166 2.5009Z'
									stroke='#1E1B1A'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Имя */}
				<div style={{ marginBottom: '24px' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '12px',
						}}
					>
						Имя
					</label>
					<input
						type='text'
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='Ваше имя'
						style={{
							width: '100%',
							padding: '16px 20px',
							backgroundColor: '#2A2725',
							border: 'none',
							borderRadius: '28px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							outline: 'none',
						}}
					/>
				</div>

				{/* Скрыть ник */}
				<div style={{ marginBottom: '32px' }}>
					<label
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							color: '#FCF9F7',
							display: 'block',
							marginBottom: '12px',
						}}
					>
						Скрыть ник
					</label>
					<button
						onClick={() => {
							const tg = (window as any).Telegram?.WebApp
							if (tg) tg.HapticFeedback.impactOccurred('light')
							setShowUsername(!showUsername)
						}}
						style={{
							width: '100%',
							padding: '16px 20px',
							backgroundColor: '#2A2725',
							border: 'none',
							borderRadius: '28px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							outline: 'none',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
						}}
					>
						<svg
							width='20'
							height='16'
							viewBox='0 0 20 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M0.969302 8.368C2.0203 10.173 4.9823 14.37 9.7873 14.37C14.6003 14.37 17.5573 10.171 18.6073 8.368C18.7504 8.12291 18.8257 7.84416 18.8255 7.56036C18.8253 7.27656 18.7497 6.99792 18.6063 6.753C17.5563 4.949 14.5963 0.75 9.7873 0.75C4.9783 0.75 2.0193 4.947 0.969302 6.751C0.825695 6.99624 0.75 7.27531 0.75 7.5595C0.75 7.84369 0.825695 8.12276 0.969302 8.368Z'
								stroke='#FCF9F7'
								strokeWidth='1.5'
								strokeLinejoin='round'
								opacity={showUsername ? '1' : '0.3'}
							/>
							<path
								d='M9.78711 10.1855C10.4833 10.1855 11.151 9.90899 11.6433 9.4167C12.1355 8.92442 12.4121 8.25674 12.4121 7.56055C12.4121 6.86435 12.1355 6.19667 11.6433 5.70439C11.151 5.21211 10.4833 4.93555 9.78711 4.93555C9.09092 4.93555 8.42324 5.21211 7.93095 5.70439C7.43867 6.19667 7.16211 6.86435 7.16211 7.56055C7.16211 8.25674 7.43867 8.92442 7.93095 9.4167C8.42324 9.90899 9.09092 10.1855 9.78711 10.1855Z'
								stroke='#FCF9F7'
								strokeWidth='1.5'
								strokeLinejoin='round'
								opacity={showUsername ? '1' : '0.3'}
							/>
							{!showUsername && (
								<line
									x1='2'
									y1='14'
									x2='18'
									y2='2'
									stroke='#FCF9F7'
									strokeWidth='1.5'
									strokeLinecap='round'
								/>
							)}
						</svg>
						{showUsername ? 'Открыть' : 'Скрыто'}
					</button>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '12px',
							color: 'rgba(252, 249, 247, 0.5)',
							marginTop: '8px',
						}}
					>
						*Другие пользователи не смогут видеть ваш юзернейм для связи с вами
					</p>
				</div>

				{/* Кнопка сохранить */}
				<button
					onClick={handleSave}
					disabled={loading}
					style={{
						width: '100%',
						padding: '16px',
						background: loading
							? '#666'
							: 'linear-gradient(135deg, #8CFF65 0%, #E3F040 100%)',
						border: 'none',
						borderRadius: '28px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						fontWeight: 600,
						color: '#1E1B1A',
						cursor: loading ? 'not-allowed' : 'pointer',
					}}
				>
					{loading ? 'Сохранение...' : 'Сохранить изменения'}
				</button>
			</div>

			<RadarBottomNav />
		</div>
	)
}

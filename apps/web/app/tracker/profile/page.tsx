'use client'

import BottomNav from '@/components/BottomNav'
import TrackerHeader from '@/components/TrackerHeader'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
	const [user, setUser] = useState<any>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [stats, setStats] = useState<any>(null)
	const [prediction, setPrediction] = useState<string>('')
	const [showPrediction, setShowPrediction] = useState(false)
	const [dailyColor, setDailyColor] = useState<string>('#e6f43f')
	const [formData, setFormData] = useState({
		displayName: '',
		bio: '',
		achievements: '',
		interests: '',
		goals: '',
		isProfilePublic: true,
	})

	useEffect(() => {
		const initTelegram = async () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				const tg = window.Telegram.WebApp
				tg.ready()
				tg.expand()

				// Предотвращаем закрытие приложения
				tg.enableClosingConfirmation()

				const tgUser = tg.initDataUnsafe?.user

				if (tgUser) {
					const API_URL =
						process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
					const response = await fetch(`${API_URL}/users/telegram/${tgUser.id}`)
					const userData = await response.json()
					setUser(userData)
					setFormData({
						displayName:
							userData.displayName ||
							`${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
						bio: userData.bio || '',
						achievements: userData.achievements || '',
						interests: userData.interests || '',
						goals: userData.goals || '',
						isProfilePublic: userData.isProfilePublic ?? true,
					})

					// Загружаем статистику
					try {
						const statsResponse = await fetch(
							`${API_URL}/users/${userData.id}/stats`,
						)
						const statsData = await statsResponse.json()
						setStats(statsData)

						// Загружаем предсказание
						try {
							const predictionResponse = await fetch(
								`${API_URL}/users/${userData.id}/prediction`,
							)

							if (predictionResponse.ok) {
								const predictionData = await predictionResponse.json()

								if (predictionData && predictionData.prediction) {
									setPrediction(predictionData.prediction)
								} else {
									console.warn('⚠️ No prediction in response')
								}
							} else {
								console.error(
									'❌ Prediction request failed:',
									predictionResponse.status,
								)
							}
						} catch (predError) {
							console.error('❌ Error loading prediction:', predError)
						}

						// Загружаем цвет дня
						const colorResponse = await fetch(
							`${API_URL}/users/${userData.id}/daily-color`,
						)
						const colorData = await colorResponse.json()
						setDailyColor(colorData.colorHex)
					} catch (error) {
						console.error('Error loading stats:', error)
					}
				}
			}
		}

		initTelegram()
	}, [])

	const handleSave = async () => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		if (user) {
			await fetch(`${API_URL}/users/${user.id}/profile`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})
			setUser({ ...user, ...formData })
			setIsEditing(false)
		}
	}

	if (!user)
		return (
			<div className='min-h-screen flex items-center justify-center text-gray-400'>
				Загрузка...
			</div>
		)

	return (
		<div
			style={{
				minHeight: '100vh',
				paddingBottom: '140px',
				backgroundColor: '#121212',
				maxWidth: '480px',
				margin: '0 auto',
			}}
		>
			<TrackerHeader />

			{/* Header */}
			<div style={{ padding: '0 18px 0' }}>
				<h1
					style={{ fontFamily: 'Oks, sans-serif' }}
					className='text-3xl font-bold mb-6 text-white'
				>
					Профиль
				</h1>

				{/* Profile Card */}
				<div
					className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]'
					style={{ padding: '20px', marginBottom: '16px' }}
				>
					<div className='flex items-center gap-4 mb-5'>
						{user.avatarUrl ? (
							<img
								src={user.avatarUrl}
								alt='Avatar'
								className='w-20 h-20 rounded-full object-cover'
							/>
						) : (
							<div className='w-20 h-20 rounded-full bg-gradient-to-br from-[#fc2a0d] to-[#e6f43f] flex items-center justify-center text-2xl font-bold text-black'>
								{(formData.displayName || user.firstName)?.[0] || 'U'}
							</div>
						)}
						<div className='flex-1'>
							{isEditing ? (
								<input
									type='text'
									value={formData.displayName}
									onChange={e =>
										setFormData({ ...formData, displayName: e.target.value })
									}
									placeholder='Ваше имя'
									className='w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-[#fc2a0d]'
									style={{ padding: '10px 14px' }}
								/>
							) : (
								<h2 className='text-xl font-bold text-white'>
									{formData.displayName ||
										`${user.firstName || ''} ${user.lastName || ''}`.trim()}
								</h2>
							)}
							{user.username && (
								<p className='text-gray-400 text-sm mt-1'>@{user.username}</p>
							)}
						</div>
					</div>

					<div className='pt-4 mt-4 border-t border-[#2a2a2a] mb-5'>
						<div className='flex justify-between items-center'>
							<span className='text-gray-400'>Очки</span>
							<span className='text-3xl font-bold text-[#e6f43f]'>
								{user.points}
							</span>
						</div>
					</div>

					{!isEditing && (
						<>
							<button
								onClick={() => {
									if (window.Telegram?.WebApp) {
										window.Telegram.WebApp.HapticFeedback.impactOccurred(
											'light',
										)
									}
									setIsEditing(true)
								}}
								className='w-full rounded-full font-medium text-white bg-[#2a2a2a] transition-all hover:bg-[#3a3a3a] mb-3'
								style={{ padding: '12px' }}
							>
								Редактировать профиль
							</button>

							{/* Privacy Toggle */}
							<div
								className='flex items-center justify-between bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]'
								style={{ padding: '16px', marginTop: '12px' }}
							>
								<div>
									<h3 className='text-white font-semibold'>
										{formData.isProfilePublic
											? 'Публичный профиль'
											: 'Приватный профиль'}
									</h3>
									<p className='text-xs text-gray-400'>
										{formData.isProfilePublic
											? 'Все могут видеть ваши привычки'
											: 'Привычки скрыты от других'}
									</p>
								</div>
								<button
									onClick={async () => {
										const API_URL =
											process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
										if (window.Telegram?.WebApp) {
											window.Telegram.WebApp.HapticFeedback.impactOccurred(
												'medium',
											)
										}
										const newValue = !formData.isProfilePublic
										setFormData({ ...formData, isProfilePublic: newValue })
										await fetch(`${API_URL}/users/${user.id}/profile`, {
											method: 'PUT',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({ isProfilePublic: newValue }),
										})
									}}
									className='w-12 h-7 rounded-full transition-all relative flex-shrink-0'
									style={{
										backgroundColor: formData.isProfilePublic
											? '#10b981'
											: '#6b7280',
									}}
								>
									<div
										className='w-5 h-5 rounded-full bg-white absolute top-1 transition-all'
										style={{
											left: formData.isProfilePublic ? '24px' : '4px',
										}}
									/>
								</button>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '0 18px' }}>
				{isEditing ? (
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
					>
						<div>
							<label className='block text-sm text-gray-400 mb-3'>Интро</label>
							<textarea
								value={formData.bio}
								onChange={e =>
									setFormData({ ...formData, bio: e.target.value })
								}
								placeholder='Расскажите о себе...'
								className='w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white focus:outline-none focus:border-[#fc2a0d] resize-none'
								style={{ padding: '14px 16px' }}
								rows={3}
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-3'>
								Ваши достижения (опционально)
							</label>
							<textarea
								value={formData.achievements}
								onChange={e =>
									setFormData({ ...formData, achievements: e.target.value })
								}
								placeholder='Чем вы гордитесь?'
								className='w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white focus:outline-none focus:border-[#fc2a0d] resize-none'
								style={{ padding: '14px 16px' }}
								rows={3}
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-3'>
								Ваши увлечения (опционально)
							</label>
							<textarea
								value={formData.interests}
								onChange={e =>
									setFormData({ ...formData, interests: e.target.value })
								}
								placeholder='Чем вы увлекаетесь?'
								className='w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white focus:outline-none focus:border-[#fc2a0d] resize-none'
								style={{ padding: '14px 16px' }}
								rows={3}
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-3'>
								Цели (опционально)
							</label>
							<textarea
								value={formData.goals}
								onChange={e =>
									setFormData({ ...formData, goals: e.target.value })
								}
								placeholder='Каких целей вы хотите достичь?'
								className='w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white focus:outline-none focus:border-[#fc2a0d] resize-none'
								style={{ padding: '14px 16px' }}
								rows={3}
							/>
						</div>

						<div style={{ display: 'flex', gap: '12px' }}>
							<button
								onClick={() => {
									if (window.Telegram?.WebApp) {
										window.Telegram.WebApp.HapticFeedback.impactOccurred(
											'light',
										)
									}
									setFormData({
										displayName:
											user.displayName ||
											`${user.firstName || ''} ${user.lastName || ''}`.trim(),
										bio: user.bio || '',
										achievements: user.achievements || '',
										interests: user.interests || '',
										goals: user.goals || '',
										isProfilePublic: user.isProfilePublic ?? true,
									})
									setIsEditing(false)
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#2a2a2a] transition-all hover:bg-[#3a3a3a]'
								style={{ padding: '16px' }}
							>
								Отмена
							</button>
							<button
								onClick={() => {
									if (window.Telegram?.WebApp) {
										window.Telegram.WebApp.HapticFeedback.notificationOccurred(
											'success',
										)
									}
									handleSave()
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#fc2a0d] transition-all hover:bg-[#e02509]'
								style={{ padding: '16px' }}
							>
								Сохранить
							</button>
						</div>
					</div>
				) : (
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
					>
						{/* Prediction Button */}
						<button
							onClick={() => {
								if (window.Telegram?.WebApp) {
									window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
								}
								setShowPrediction(!showPrediction)
							}}
							className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] transition-all hover:border-[#3a3a3a]'
							style={{ padding: '18px' }}
						>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width={28}
										height={28}
										viewBox='0 0 24 24'
										style={{ color: dailyColor }}
									>
										<path
											fill='currentColor'
											d='M10.995 21.005v-6.588L6.34 19.072a1 1 0 1 1-1.414-1.414L9.584 13H3a1 1 0 1 1 0-2h6.574L4.926 6.352A1 1 0 1 1 6.34 4.937l4.655 4.656V3.005a1 1 0 1 1 2 0v6.584l4.658-4.658a1 1 0 1 1 1.414 1.414L14.412 11H21a1 1 0 1 1 0 2h-6.598l4.665 4.665a1 1 0 0 1-1.414 1.414l-4.658-4.658v6.584a1 1 0 0 1-2 0'
										></path>
									</svg>
									<span
										className='font-bold'
										style={{
											color: dailyColor,
											fontSize: '18px',
											fontFamily: "'Oks', sans-serif",
										}}
									>
										Предсказание на сегодня
									</span>
								</div>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width={24}
									height={24}
									viewBox='0 0 24 24'
									style={{
										color: '#666',
										transform: showPrediction ? 'rotate(180deg)' : 'rotate(0)',
										transition: 'transform 0.3s ease',
									}}
								>
									<path fill='currentColor' d='M7 10l5 5 5-5z'></path>
								</svg>
							</div>
						</button>

						{/* Prediction Content */}
						{showPrediction && prediction && (
							<div
								className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] relative overflow-hidden'
								style={{
									padding: '20px',
									animation: 'slideDown 0.3s ease-out',
								}}
							>
								{/* Background glow */}
								<div
									className='absolute inset-0 opacity-10'
									style={{
										background: `radial-gradient(circle at top right, ${dailyColor} 0%, transparent 60%)`,
									}}
								/>

								<div className='relative'>
									<p
										className='text-gray-200 leading-relaxed mb-4'
										style={{ fontSize: '16px' }}
									>
										{prediction}
									</p>
									<button
										onClick={() => {
											if (window.Telegram?.WebApp) {
												window.Telegram.WebApp.HapticFeedback.impactOccurred(
													'medium',
												)

												const botUsername = 'match_msd_bot'
												const shareText = `"${prediction}"\n\n✨ Узнай свою цитату дня в @${botUsername}`

												const shareUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(
													shareText,
												)}`

												window.Telegram.WebApp.openTelegramLink(shareUrl)
											}
										}}
										className='w-full rounded-full font-medium transition-all'
										style={{
											padding: '12px',
											fontFamily: "'Oks', sans-serif",
											backgroundColor: dailyColor,
											color: '#000',
										}}
									>
										Поделиться
									</button>
								</div>
							</div>
						)}

						{/* Statistics */}
						<div
							className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]'
							style={{ padding: '18px' }}
						>
							<h3 className='font-semibold mb-4 text-white text-lg'>
								Статистика
							</h3>

							{/* Week Stats */}
							<div className='mb-6'>
								<div className='flex justify-between items-center mb-3'>
									<span className='text-sm text-gray-400'>
										Последние 4 недели
									</span>
									<span className='text-sm font-semibold text-white'>
										{stats?.weekStats && stats.weekStats.length > 0
											? Math.round(
													stats.weekStats.reduce(
														(sum: number, week: any) => sum + week.percentage,
														0,
													) / stats.weekStats.length || 0,
												)
											: 0}
										%
									</span>
								</div>
								<div
									className='flex gap-3 items-end'
									style={{ height: '120px' }}
								>
									{stats?.weekStats && stats.weekStats.length > 0 ? (
										stats.weekStats.map((item: any, i: number) => {
											// Ограничиваем высоту столбца максимум 90px (90% от контейнера 120px)
											const barHeight = Math.min(
												Math.max(item.percentage * 0.9, 6),
												90,
											)
											return (
												<div
													key={i}
													className='flex-1 flex flex-col items-center justify-end'
												>
													<div
														className='w-full rounded-lg transition-all duration-700 ease-out'
														style={{
															height: `${barHeight}px`,
															backgroundColor:
																item.percentage > 0 ? '#f5710b' : '#2a2a2a',
															animation: `slideUp 0.6s ease-out ${
																i * 0.1
															}s both`,
															marginBottom: '8px',
														}}
													/>
													<div className='text-xs text-center text-gray-400 font-medium'>
														{item.week}
													</div>
												</div>
											)
										})
									) : (
										<div className='text-sm text-gray-500 w-full text-center'>
											{stats ? 'Нет данных' : 'Загрузка...'}
										</div>
									)}
								</div>
							</div>

							{/* Month Stats */}
							<div className='mb-6'>
								<div className='flex justify-between items-center mb-3'>
									<span className='text-sm text-gray-400'>Этот месяц</span>
									<span className='text-sm font-semibold text-white'>
										{stats?.monthPercentage || 0}%
									</span>
								</div>
								<div className='h-3 bg-[#2a2a2a] rounded-full overflow-hidden'>
									<div
										className='h-full rounded-full transition-all'
										style={{
											width: `${stats?.monthPercentage || 0}%`,
											backgroundColor: '#f5710b',
										}}
									/>
								</div>
							</div>

							{/* Overall Stats */}
							<div className='space-y-3'>
								<div className='flex justify-between items-center'>
									<span className='text-gray-400'>Активных привычек</span>
									<span className='font-semibold text-white text-lg'>
										{stats?.activeHabits || 0}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-400'>Всего выполнено</span>
									<span className='font-semibold text-white text-lg'>
										{stats?.totalCompleted || 0}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-400'>Текущая серия</span>
									<span className='font-semibold text-[#e6f43f] text-lg'>
										{stats?.currentStreak || 0}{' '}
										{stats?.currentStreak > 0 ? '🔥' : ''}
									</span>
								</div>
							</div>
						</div>

						{/* Combined Bio Block */}
						{(formData.bio ||
							formData.achievements ||
							formData.interests ||
							formData.goals) && (
							<div
								className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]'
								style={{ padding: '18px' }}
							>
								<div className='text-gray-300 whitespace-pre-wrap leading-relaxed'>
									{formData.bio && <p className='mb-3'>{formData.bio}</p>}
									{formData.achievements && (
										<p className='mb-3'>{formData.achievements}</p>
									)}
									{formData.interests && (
										<p className='mb-3'>{formData.interests}</p>
									)}
									{formData.goals && <p>{formData.goals}</p>}
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			<style jsx>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slideUp {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>

			<BottomNav />
		</div>
	)
}

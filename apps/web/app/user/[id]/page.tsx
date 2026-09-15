'use client'

import BottomNav from '@/components/BottomNav'
import { HABIT_CATEGORIES } from '@/lib/categories'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UserProfilePage() {
	const params = useParams()
	const router = useRouter()
	const [user, setUser] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [calendarData, setCalendarData] = useState<any>(null)
	const [selectedMonth, setSelectedMonth] = useState(new Date())

	useEffect(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			const tg = window.Telegram.WebApp
			tg.ready()
			tg.expand()
			tg.enableClosingConfirmation()
		}

		loadUser()
	}, [params.id])

	const loadUser = async () => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		try {
			const response = await fetch(`${API_URL}/users/${params.id}/public`)
			const data = await response.json()
			setUser(data)

			// Загружаем календарь
			const now = new Date()
			const calendarResponse = await fetch(
				`${API_URL}/users/${params.id}/calendar/${now.getFullYear()}/${
					now.getMonth() + 1
				}`
			)
			const calendarData = await calendarResponse.json()
			setCalendarData(calendarData)
		} catch (error) {
			console.error('Error loading user:', error)
		} finally {
			setLoading(false)
		}
	}

	const loadCalendar = async (date: Date) => {
		if (!params.id) return
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		try {
			const response = await fetch(
				`${API_URL}/users/${params.id}/calendar/${date.getFullYear()}/${
					date.getMonth() + 1
				}`
			)
			const data = await response.json()
			setCalendarData(data)
		} catch (error) {
			console.error('Error loading calendar:', error)
		}
	}

	if (loading) {
		return (
			<div
				className='min-h-screen flex items-center justify-center text-gray-400'
				style={{ backgroundColor: '#121212' }}
			>
				Загрузка...
			</div>
		)
	}

	if (!user) {
		return (
			<div
				className='min-h-screen flex items-center justify-center text-gray-400'
				style={{ backgroundColor: '#121212' }}
			>
				Пользователь не найден
			</div>
		)
	}

	const isPrivate = !user.isProfilePublic

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
			{/* Header */}
			<div style={{ padding: '24px 18px 0' }}>
				<button
					onClick={() => {
						if (window.Telegram?.WebApp) {
							window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
						}
						router.back()
					}}
					className='mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width={24}
						height={24}
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
					>
						<path d='M19 12H5M12 19l-7-7 7-7' />
					</svg>
					Назад
				</button>

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
								{user.firstName?.[0] || 'U'}
							</div>
						)}
						<div className='flex-1'>
							<h2 className='text-xl font-bold text-white'>
								{user.displayName ||
									`${user.firstName || ''} ${user.lastName || ''}`.trim()}
							</h2>
							{user.username && (
								<p className='text-gray-400 text-sm mt-1'>@{user.username}</p>
							)}
						</div>
					</div>

					<div className='pt-4 mt-4 border-t border-[#2a2a2a]'>
						<div className='flex justify-between items-center'>
							<span className='text-gray-400'>Очки</span>
							<span className='text-3xl font-bold text-[#e6f43f]'>
								{user.points}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '0 18px' }}>
				{isPrivate ? (
					<div
						className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] text-center'
						style={{ padding: '40px 20px' }}
					>
						<h3 className='text-xl font-bold text-white mb-2'>
							Приватный профиль
						</h3>
						<p className='text-gray-400'>
							Этот пользователь скрыл свои привычки
						</p>
					</div>
				) : (
					<>
						{/* Combined Bio Block */}
						{(user.bio ||
							user.achievements ||
							user.interests ||
							user.goals) && (
							<div
								className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] mb-4'
								style={{ padding: '18px' }}
							>
								<div className='text-gray-300 whitespace-pre-wrap leading-relaxed'>
									{user.bio && <p className='mb-3'>{user.bio}</p>}
									{user.achievements && (
										<p className='mb-3'>{user.achievements}</p>
									)}
									{user.interests && <p className='mb-3'>{user.interests}</p>}
									{user.goals && <p>{user.goals}</p>}
								</div>
							</div>
						)}

						{/* Calendar */}
						{calendarData && (
							<div
								className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] mb-4'
								style={{ padding: '18px' }}
							>
								<div className='flex justify-between items-center mb-4'>
									<button
										onClick={() => {
											if (window.Telegram?.WebApp) {
												window.Telegram.WebApp.HapticFeedback.impactOccurred(
													'light'
												)
											}
											const newDate = new Date(selectedMonth)
											newDate.setMonth(newDate.getMonth() - 1)
											setSelectedMonth(newDate)
											loadCalendar(newDate)
										}}
										className='text-gray-400 hover:text-white transition-colors'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width={24}
											height={24}
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth={2}
										>
											<path d='M15 18l-6-6 6-6' />
										</svg>
									</button>
									<h3 className='font-semibold text-white text-lg'>
										{selectedMonth.toLocaleDateString('ru', {
											month: 'long',
											year: 'numeric',
										})}
									</h3>
									<button
										onClick={() => {
											if (window.Telegram?.WebApp) {
												window.Telegram.WebApp.HapticFeedback.impactOccurred(
													'light'
												)
											}
											const newDate = new Date(selectedMonth)
											newDate.setMonth(newDate.getMonth() + 1)
											setSelectedMonth(newDate)
											loadCalendar(newDate)
										}}
										className='text-gray-400 hover:text-white transition-colors'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width={24}
											height={24}
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth={2}
										>
											<path d='M9 18l6-6-6-6' />
										</svg>
									</button>
								</div>

								{/* Days of week */}
								<div
									className='grid grid-cols-7 gap-2 mb-2'
									style={{ marginBottom: '8px' }}
								>
									{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
										<div
											key={day}
											className='text-center text-xs text-gray-500 font-medium'
										>
											{day}
										</div>
									))}
								</div>

								{/* Calendar grid */}
								<div className='grid grid-cols-7 gap-2'>
									{/* Empty cells for days before month starts */}
									{Array.from({
										length:
											new Date(
												calendarData.year,
												calendarData.month - 1,
												1
											).getDay() === 0
												? 6
												: new Date(
														calendarData.year,
														calendarData.month - 1,
														1
												  ).getDay() - 1,
									}).map((_, i) => (
										<div key={`empty-${i}`} />
									))}

									{/* Calendar days */}
									{calendarData.days.map((dayData: any) => {
										const isToday =
											new Date().getDate() === dayData.day &&
											new Date().getMonth() === calendarData.month - 1 &&
											new Date().getFullYear() === calendarData.year

										return (
											<div
												key={dayData.day}
												className='aspect-square rounded-lg flex items-center justify-center relative overflow-hidden transition-all'
												style={{
													backgroundColor: '#2a2a2a',
													border: isToday ? '2px solid #fc2a0d' : 'none',
												}}
											>
												{/* Gradient fill based on percentage */}
												{dayData.percentage > 0 && (
													<div
														className='absolute inset-0'
														style={{
															background:
																dayData.percentage === 100
																	? '#10b981'
																	: `linear-gradient(to top, #f5710b 0%, #f5710b ${dayData.percentage}%, transparent ${dayData.percentage}%, transparent 100%)`,
														}}
													/>
												)}
												<span
													className='text-sm font-semibold relative z-10'
													style={{
														color: dayData.percentage > 0 ? '#fff' : '#666',
													}}
												>
													{dayData.day}
												</span>
											</div>
										)
									})}
								</div>

								{/* Legend */}
								<div
									className='flex items-center justify-center gap-4 mt-4'
									style={{ fontSize: '12px' }}
								>
									<div className='flex items-center gap-2'>
										<div
											className='w-4 h-4 rounded'
											style={{ backgroundColor: '#2a2a2a' }}
										/>
										<span className='text-gray-400'>Не выполнено</span>
									</div>
									<div className='flex items-center gap-2'>
										<div
											className='w-4 h-4 rounded'
											style={{ backgroundColor: '#f5710b' }}
										/>
										<span className='text-gray-400'>Частично</span>
									</div>
									<div className='flex items-center gap-2'>
										<div
											className='w-4 h-4 rounded'
											style={{ backgroundColor: '#10b981' }}
										/>
										<span className='text-gray-400'>Все</span>
									</div>
								</div>
							</div>
						)}

						{user.habits && user.habits.length > 0 && (
							<div
								className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] mb-4'
								style={{ padding: '18px' }}
							>
								<h3 className='text-lg font-bold text-white mb-4'>
									Привычки ({user.habits.length})
								</h3>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '12px',
									}}
								>
									{user.habits.map((habit: any) => {
										const category =
											HABIT_CATEGORIES[
												habit.category as keyof typeof HABIT_CATEGORIES
											]
										return (
											<div
												key={habit.id}
												className='bg-[#272727] rounded-2xl'
												style={{ padding: '14px 16px' }}
											>
												<div className='flex items-center gap-3'>
													<div
														className='w-1 h-10 rounded-full flex-shrink-0'
														style={{
															backgroundColor: category?.color || '#6b7280',
															width: '2px',
														}}
													/>
													<div className='flex-1 min-w-0'>
														<h4 className='font-semibold text-white text-base truncate'>
															{habit.title}
														</h4>
														{habit.description && (
															<p className='text-sm text-gray-400 truncate'>
																{habit.description}
															</p>
														)}
														<p className='text-xs text-gray-500 mt-1'>
															{category?.name || 'Другое'}
														</p>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<BottomNav />
		</div>
	)
}

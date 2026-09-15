'use client'

import HabitCalendar from '@/components/HabitCalendar'
import HabitsList from '@/components/HabitsList'
import SprintTasks from '@/components/SprintTasks'
import TrackerHeader from '@/components/TrackerHeader'
import { habitsApi, usersApi } from '@/lib/api'
import { HABIT_CATEGORIES } from '@/lib/categories'
import { useEffect, useState } from 'react'

export default function TrackerPage() {
	const getLocalDateString = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getLocalDate = () => {
		const now = new Date()
		return new Date(now.getFullYear(), now.getMonth(), now.getDate())
	}

	const [habits, setHabits] = useState<any[]>([])
	const [userId, setUserId] = useState<string>('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [newHabit, setNewHabit] = useState({
		title: '',
		description: '',
		color: '#fc2a0d',
		category: 'OTHER',
	})
	const [user, setUser] = useState<any>(null)
	const [habitLogs, setHabitLogs] = useState<any[]>([])
	const [selectedDate, setSelectedDate] = useState<Date>(getLocalDate())
	const [showExplosion, setShowExplosion] = useState(false)
	const [dailyColor, setDailyColor] = useState<string>('#e6f43f')
	const [userSprints, setUserSprints] = useState<any[]>([])
	const [sprintTaskStatuses, setSprintTaskStatuses] = useState<
		Map<string, any>
	>(new Map())
	const [habitStreak, setHabitStreak] = useState<number>(0)
	const [editingHabit, setEditingHabit] = useState<any>(null)
	const [deletingHabit, setDeletingHabit] = useState<any>(null)

	useEffect(() => {
		const initTelegram = async () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				const tg = window.Telegram.WebApp
				tg.ready()
				tg.expand()
				tg.HapticFeedback.impactOccurred('light')
				tg.enableClosingConfirmation()

				const tgUser = tg.initDataUnsafe?.user
				if (tgUser) {
					const response = await usersApi.createOrUpdate({
						telegramId: tgUser.id.toString(),
						username: tgUser.username,
						firstName: tgUser.first_name,
						lastName: tgUser.last_name,
						avatarUrl: tgUser.photo_url,
					})
					setUserId(response.data.id)
					setUser(response.data)
					loadHabits(response.data.id)
					loadUserSprints(response.data.id)

					try {
						const API_URL =
							process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
						const colorResponse = await fetch(
							`${API_URL}/users/${response.data.id}/daily-color`,
						)
						const colorData = await colorResponse.json()
						setDailyColor(colorData.colorHex)
					} catch (error) {
						console.error('Error loading daily color:', error)
					}
				}
			}
		}
		initTelegram()
	}, [])

	const loadHabits = async (uid: string) => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		const response = await habitsApi.getUserHabits(uid)
		setHabits(response.data)

		try {
			const logsResponse = await fetch(`${API_URL}/habits/logs/${uid}`)
			const logs = await logsResponse.json()
			setHabitLogs(logs)
			calculateStreak(response.data, logs)
		} catch (error) {
			console.error('Error loading habit logs:', error)
		}
	}

	const calculateStreak = (habitsData: any[], logsData: any[]) => {
		if (habitsData.length === 0) {
			setHabitStreak(0)
			return
		}

		let streak = 0
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		for (let i = 0; i < 365; i++) {
			const checkDate = new Date(
				today.getFullYear(),
				today.getMonth(),
				today.getDate() - i,
			)
			const dateStr = getLocalDateString(checkDate)
			const logsForDay = logsData.filter(
				log => log.completedAt.split('T')[0] === dateStr,
			)
			const completedHabitIds = new Set(logsForDay.map(log => log.habitId))
			const allCompleted = habitsData.every(habit =>
				completedHabitIds.has(habit.id),
			)

			if (allCompleted) {
				streak++
			} else {
				if (i > 0) break
			}
		}
		setHabitStreak(streak)
	}

	const getStreakText = (days: number): string => {
		if (days === 0) return '0 дней'
		const lastDigit = days % 10
		const lastTwoDigits = days % 100
		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${days} дней`
		if (lastDigit === 1) return `${days} день`
		if (lastDigit >= 2 && lastDigit <= 4) return `${days} дня`
		return `${days} дней`
	}

	const loadUserSprints = async (uid: string) => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		try {
			const response = await fetch(`${API_URL}/sprints/user/${uid}`)
			const sprints = await response.json()

			// Фильтруем только активные спринты (не завершенные)
			const now = new Date()
			const activeSprints = sprints.filter((sprint: any) => {
				if (!sprint.endDate) return true // Если нет даты окончания, показываем
				const endDate = new Date(sprint.endDate)
				return endDate >= now // Показываем только если спринт еще не закончился
			})

			setUserSprints(activeSprints)

			const statuses = new Map()
			for (const sprint of activeSprints) {
				const statusResponse = await fetch(
					`${API_URL}/sprints/${sprint.id}/user/${uid}/task-status`,
				)
				const status = await statusResponse.json()
				statuses.set(sprint.id, status)
			}
			setSprintTaskStatuses(statuses)
		} catch (error) {
			console.error('Error loading user sprints:', error)
		}
	}

	const handleCompleteSprintTask = async (sprintId: string) => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		try {
			window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success')
			await fetch(`${API_URL}/sprints/${sprintId}/complete-task`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			})
			loadUserSprints(userId)
			setShowExplosion(true)
			setTimeout(() => setShowExplosion(false), 1000)
		} catch (error) {
			console.error('Error completing sprint task:', error)
			window.Telegram?.WebApp?.showAlert('Задача уже выполнена сегодня')
		}
	}

	const handleAddHabit = async () => {
		if (!newHabit.title.trim()) return
		window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success')
		await habitsApi.create({ ...newHabit, userId })
		setNewHabit({
			title: '',
			description: '',
			color: '#fc2a0d',
			category: 'OTHER',
		})
		setShowAddModal(false)
		loadHabits(userId)
	}

	const handleEditHabit = async () => {
		if (!editingHabit?.title.trim()) return
		window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success')
		await habitsApi.update(editingHabit.id, {
			userId,
			title: editingHabit.title,
			description: editingHabit.description,
			color: editingHabit.color,
			category: editingHabit.category,
		})
		setEditingHabit(null)
		loadHabits(userId)
	}

	const handleDeleteHabit = async () => {
		if (!deletingHabit) return
		window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success')
		await habitsApi.delete(deletingHabit.id, userId)
		setDeletingHabit(null)
		loadHabits(userId)
	}

	const handleLogHabit = async (habitId: string) => {
		window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success')
		const dateStr = getLocalDateString(selectedDate)
		const isCurrentlyCompleted =
			getCompletedHabitsForDay(selectedDate).has(habitId)
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

		try {
			if (isCurrentlyCompleted) {
				await fetch(`${API_URL}/habits/log`, {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId, habitId, completedAt: dateStr }),
				})
			} else {
				await fetch(`${API_URL}/habits/log`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId, habitId, completedAt: dateStr }),
				})
			}

			const logsResponse = await fetch(`${API_URL}/habits/logs/${userId}`)
			const logs = await logsResponse.json()
			setHabitLogs(logs)
		} catch (error) {
			console.error('Error syncing with backend:', error)
			loadHabits(userId)
		}
	}

	const getDayProgress = (date: Date) => {
		if (habits.length === 0) return 0
		const completedForDay = getCompletedHabitsForDay(date)
		if (completedForDay.size === 0) return 0
		return (completedForDay.size / habits.length) * 100
	}

	const getCompletedHabitsForDay = (date: Date) => {
		const dateStr = getLocalDateString(date)
		const logsForDay = habitLogs.filter(
			log => log.completedAt.split('T')[0] === dateStr,
		)
		return new Set(logsForDay.map(log => log.habitId))
	}

	const progress =
		habits.length > 0
			? (Array.from(getCompletedHabitsForDay(selectedDate)).length /
					habits.length) *
				100
			: 0

	const handleDayClick = (date: Date) => {
		window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light')
		setSelectedDate(date)
	}

	const isToday = (date: Date) => {
		const today = new Date()
		return getLocalDateString(date) === getLocalDateString(today)
	}

	const isSelectedToday = isToday(selectedDate)
	const selectedDayCompleted = getCompletedHabitsForDay(selectedDate)
	const selectedActiveHabits = habits.filter(
		h => !selectedDayCompleted.has(h.id),
	)
	const selectedCompletedHabits = habits.filter(h =>
		selectedDayCompleted.has(h.id),
	)

	const handleExplosionClick = () => {
		const tg = window.Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('heavy')
			setTimeout(() => tg.HapticFeedback.impactOccurred('rigid'), 100)
			setTimeout(() => tg.HapticFeedback.impactOccurred('medium'), 200)
			setTimeout(() => tg.HapticFeedback.impactOccurred('light'), 300)
		}
		setShowExplosion(true)
		setTimeout(() => setShowExplosion(false), 1000)
	}

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
			<TrackerHeader />

			<div style={{ padding: '0 18px 0' }}>
				<div
					className='flex justify-between items-center'
					style={{ marginBottom: '24px' }}
				>
					<h1
						style={{
							fontFamily: 'Oks, sans-serif',
							fontSize: '50px',
							color: '#E3F040',
						}}
					>
						Привычки
					</h1>
					<div className='flex items-center gap-3'>
						{user?.avatarUrl ? (
							<div className='flex flex-col items-end relative'>
								<img
									src={user.avatarUrl}
									alt='Avatar'
									style={{
										width: '56px',
										height: '56px',
										borderRadius: '50%',
										objectFit: 'cover',
									}}
								/>
								<div
									onClick={handleExplosionClick}
									className='rounded-full text-center font-bold absolute cursor-pointer hover:scale-105 transition-transform active:scale-95 flex items-center justify-center'
									style={{
										backgroundColor: '#E865FF',
										width: '56px',
										height: '22px',
										fontFamily: 'Oks, sans-serif',
										bottom: '-6px',
										whiteSpace: 'nowrap',
									}}
								>
									<svg
										width='33'
										height='12'
										viewBox='0 0 33 12'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M7.95599 11.3479L8.50771 9.65401L10.3828 4.20127L6.49854 11.4106L3.68732 11.5316L5.94903 4.11647L2.99488 9.94973L2.12841 11.5994L0 11.6909L6.12751 0L9.08018 0.126842L8.38922 2.58256L6.914 7.17321L9.37937 2.48743L10.6761 0.196163L13.4385 0.314893L9.82742 11.2676L7.95599 11.3479Z'
											fill='#5111E3'
										/>
										<path
											d='M15.4123 11.201C13.3126 11.2952 11.6773 10.5113 10.9781 9.0346L10.9072 8.88516L12.6437 7.98414L12.7382 8.19689C13.2033 9.2444 14.3388 9.81269 15.8295 9.76263C18.1263 9.68607 20.3545 8.2705 21.4036 6.31387L15.7874 6.34405L16.3477 4.92848L21.9094 4.96307C22.0932 4.05616 21.9167 3.24422 21.4029 2.65899C20.9008 2.08629 20.1116 1.7646 19.1127 1.73147C17.6915 1.68436 16.1233 2.22394 14.8158 3.22876L14.6541 3.35316L13.6323 2.38663L13.7999 2.26443C15.5755 0.965164 17.6568 0.285718 19.5055 0.368164C21.0064 0.435152 22.1995 0.970317 22.8869 1.86766C23.6584 2.87394 23.7721 4.24388 23.2117 5.74852C22.6779 7.18177 21.6222 8.51416 20.2164 9.50867C18.7893 10.5186 17.086 11.1252 15.4116 11.2003L15.4123 11.201Z'
											fill='#5111E3'
										/>
										<path
											d='M22.5381 10.7262L25.7325 2.14124L24.1207 2.09025L24.6136 0.782959L29.1669 0.978055L28.7114 2.23436L27.1827 2.18632L24.0698 10.6604L22.5381 10.7262Z'
											fill='#5111E3'
										/>
										<path
											d='M28.3712 10.4235L29.0625 8.4743C28.9182 8.51605 28.7562 8.53949 28.5771 8.54388C28.0894 8.55634 27.6806 8.38566 27.4286 8.06117C27.1529 7.70664 27.1023 7.20488 27.2896 6.68773L29.3419 1.02405L30.6918 1.08192L28.6336 6.83423C28.586 6.96681 28.5942 7.08987 28.6566 7.17118C28.7094 7.24077 28.7986 7.27666 28.913 7.2752C29.2327 7.2708 29.5791 7.02102 29.6861 6.71923L31.67 1.1244L32.9634 1.17934L29.7456 10.3663L28.3719 10.4249L28.3712 10.4235Z'
											fill='#5111E3'
										/>
									</svg>
								</div>
							</div>
						) : (
							<div className='flex flex-col items-end relative'>
								<div
									style={{
										width: '56px',
										height: '56px',
										borderRadius: '50%',
										background:
											'linear-gradient(135deg, #fc2a0d 0%, #e6f43f 100%)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: '24px',
										fontWeight: 'bold',
										color: '#000',
									}}
								>
									{user?.firstName?.[0] || 'U'}
								</div>
								<div
									onClick={handleExplosionClick}
									className='rounded-full text-center font-bold absolute cursor-pointer hover:scale-105 transition-transform active:scale-95 flex items-center justify-center'
									style={{
										backgroundColor: '#E865FF',
										width: '56px',
										height: '22px',
										fontFamily: 'Oks, sans-serif',
										bottom: '-6px',
										whiteSpace: 'nowrap',
									}}
								>
									<svg
										width='33'
										height='12'
										viewBox='0 0 33 12'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M7.95599 11.3479L8.50771 9.65401L10.3828 4.20127L6.49854 11.4106L3.68732 11.5316L5.94903 4.11647L2.99488 9.94973L2.12841 11.5994L0 11.6909L6.12751 0L9.08018 0.126842L8.38922 2.58256L6.914 7.17321L9.37937 2.48743L10.6761 0.196163L13.4385 0.314893L9.82742 11.2676L7.95599 11.3479Z'
											fill='#5111E3'
										/>
										<path
											d='M15.4123 11.201C13.3126 11.2952 11.6773 10.5113 10.9781 9.0346L10.9072 8.88516L12.6437 7.98414L12.7382 8.19689C13.2033 9.2444 14.3388 9.81269 15.8295 9.76263C18.1263 9.68607 20.3545 8.2705 21.4036 6.31387L15.7874 6.34405L16.3477 4.92848L21.9094 4.96307C22.0932 4.05616 21.9167 3.24422 21.4029 2.65899C20.9008 2.08629 20.1116 1.7646 19.1127 1.73147C17.6915 1.68436 16.1233 2.22394 14.8158 3.22876L14.6541 3.35316L13.6323 2.38663L13.7999 2.26443C15.5755 0.965164 17.6568 0.285718 19.5055 0.368164C21.0064 0.435152 22.1995 0.970317 22.8869 1.86766C23.6584 2.87394 23.7721 4.24388 23.2117 5.74852C22.6779 7.18177 21.6222 8.51416 20.2164 9.50867C18.7893 10.5186 17.086 11.1252 15.4116 11.2003L15.4123 11.201Z'
											fill='#5111E3'
										/>
										<path
											d='M22.5381 10.7262L25.7325 2.14124L24.1207 2.09025L24.6136 0.782959L29.1669 0.978055L28.7114 2.23436L27.1827 2.18632L24.0698 10.6604L22.5381 10.7262Z'
											fill='#5111E3'
										/>
										<path
											d='M28.3712 10.4235L29.0625 8.4743C28.9182 8.51605 28.7562 8.53949 28.5771 8.54388C28.0894 8.55634 27.6806 8.38566 27.4286 8.06117C27.1529 7.70664 27.1023 7.20488 27.2896 6.68773L29.3419 1.02405L30.6918 1.08192L28.6336 6.83423C28.586 6.96681 28.5942 7.08987 28.6566 7.17118C28.7094 7.24077 28.7986 7.27666 28.913 7.2752C29.2327 7.2708 29.5791 7.02102 29.6861 6.71923L31.67 1.1244L32.9634 1.17934L29.7456 10.3663L28.3719 10.4249L28.3712 10.4235Z'
											fill='#5111E3'
										/>
									</svg>
								</div>
							</div>
						)}
					</div>
				</div>

				<HabitCalendar
					selectedDate={selectedDate}
					habitStreak={habitStreak}
					getStreakText={getStreakText}
					getDayProgress={getDayProgress}
					handleDayClick={handleDayClick}
				/>

				<div style={{ marginTop: '10px', marginBottom: '24px' }}>
					<div
						style={{ height: '37px' }}
						className='bg-[#272727] rounded-full overflow-hidden'
					>
						<div
							className='h-full rounded-full transition-all duration-500'
							style={{
								width: `${Math.round(progress)}%`,
								background: 'linear-gradient(90deg, #fc2a0d 0%, #e6f43f 100%)',
							}}
						/>
					</div>
				</div>
			</div>

			<SprintTasks
				userSprints={userSprints}
				sprintTaskStatuses={sprintTaskStatuses}
				selectedDate={selectedDate}
				isToday={isToday}
				handleCompleteSprintTask={handleCompleteSprintTask}
			/>

			<HabitsList
				selectedActiveHabits={selectedActiveHabits}
				selectedCompletedHabits={selectedCompletedHabits}
				userId={userId}
				handleLogHabit={handleLogHabit}
				loadHabits={loadHabits}
				setShowAddModal={setShowAddModal}
				setEditingHabit={setEditingHabit}
				setDeletingHabit={setDeletingHabit}
			/>

			{/* Edit Modal */}
			{editingHabit && (
				<div
					className='fixed inset-0 flex items-center justify-center z-50'
					style={{
						padding: '18px',
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(4px)',
					}}
				>
					<div
						className='w-full max-w-md'
						style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
					>
						<div
							className='bg-[#272727] rounded-3xl border border-[#2a2a2a]'
							style={{ padding: '14px 18px' }}
						>
							<input
								type='text'
								placeholder='Название'
								value={editingHabit.title}
								onChange={e =>
									setEditingHabit({ ...editingHabit, title: e.target.value })
								}
								className='w-full bg-transparent text-white focus:outline-none placeholder-gray-500'
							/>
						</div>
						<div
							className='bg-[#272727] rounded-3xl border border-[#2a2a2a]'
							style={{ padding: '14px 18px' }}
						>
							<textarea
								placeholder='Описание (опционально)'
								value={editingHabit.description || ''}
								onChange={e =>
									setEditingHabit({
										...editingHabit,
										description: e.target.value,
									})
								}
								className='w-full bg-transparent text-white focus:outline-none resize-none placeholder-gray-500'
								rows={3}
							/>
						</div>
						<div
							className='bg-[#272727] rounded-3xl border border-[#2a2a2a]'
							style={{ padding: '14px 18px' }}
						>
							<select
								value={editingHabit.category}
								onChange={e =>
									setEditingHabit({ ...editingHabit, category: e.target.value })
								}
								className='w-full bg-transparent text-white focus:outline-none'
								style={{ fontSize: '16px' }}
							>
								{Object.entries(HABIT_CATEGORIES)
									.filter(([key]) => key !== 'ALL')
									.map(([key, cat]) => (
										<option
											key={key}
											value={key}
											style={{ background: '#272727' }}
										>
											{cat.name}
										</option>
									))}
							</select>
						</div>
						<div style={{ display: 'flex', gap: '12px' }}>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.impactOccurred(
										'light',
									)
									setEditingHabit(null)
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#272727] border border-[#2a2a2a] transition-all hover:bg-[#2a2a2a]'
								style={{ padding: '16px' }}
							>
								Отмена
							</button>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.notificationOccurred(
										'success',
									)
									handleEditHabit()
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#fc2a0d] transition-all hover:bg-[#e02509]'
								style={{ padding: '16px' }}
							>
								Сохранить
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deletingHabit && (
				<div
					className='fixed inset-0 flex items-center justify-center z-50'
					style={{
						padding: '18px',
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(4px)',
					}}
				>
					<div
						className='w-full max-w-md bg-[#272727] rounded-3xl border border-[#2a2a2a]'
						style={{ padding: '24px' }}
					>
						<h3
							className='text-white font-semibold text-center'
							style={{ marginBottom: '8px', fontSize: '18px' }}
						>
							Удалить привычку?
						</h3>
						<p
							className='text-gray-400 text-center'
							style={{ marginBottom: '24px', fontSize: '14px' }}
						>
							{deletingHabit.title}
						</p>
						<div style={{ display: 'flex', gap: '12px' }}>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.impactOccurred(
										'light',
									)
									setDeletingHabit(null)
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#272727] border border-[#2a2a2a] transition-all hover:bg-[#2a2a2a]'
								style={{ padding: '16px' }}
							>
								Отмена
							</button>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.notificationOccurred(
										'warning',
									)
									handleDeleteHabit()
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#fc2a0d] transition-all hover:bg-[#e02509]'
								style={{ padding: '16px' }}
							>
								Удалить
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add Modal */}
			{showAddModal && (
				<div
					className='fixed inset-0 flex items-center justify-center z-50'
					style={{
						padding: '18px',
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(4px)',
					}}
				>
					<div
						className='w-full max-w-md'
						style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
					>
						<div
							className='bg-[#272727] rounded-3xl border border-[#2a2a2a]'
							style={{ padding: '14px 18px' }}
						>
							<input
								type='text'
								placeholder='Название'
								value={newHabit.title}
								onChange={e =>
									setNewHabit({ ...newHabit, title: e.target.value })
								}
								className='w-full bg-transparent text-white focus:outline-none placeholder-gray-500'
							/>
						</div>
						<div
							className='bg-[#272727] rounded-3xl border border-[#2a2a2a]'
							style={{ padding: '14px 18px' }}
						>
							<textarea
								placeholder='Описание (опционально)'
								value={newHabit.description}
								onChange={e =>
									setNewHabit({ ...newHabit, description: e.target.value })
								}
								className='w-full bg-transparent text-white focus:outline-none resize-none placeholder-gray-500'
								rows={3}
							/>
						</div>
						<div
							className='bg-[#272727] rounded-3xl border border-[#2a2a2a]'
							style={{ padding: '14px 18px' }}
						>
							<select
								value={newHabit.category}
								onChange={e =>
									setNewHabit({ ...newHabit, category: e.target.value })
								}
								className='w-full bg-transparent text-white focus:outline-none'
								style={{ fontSize: '16px' }}
							>
								{Object.entries(HABIT_CATEGORIES)
									.filter(([key]) => key !== 'ALL')
									.map(([key, cat]) => (
										<option
											key={key}
											value={key}
											style={{ background: '#272727' }}
										>
											{cat.name}
										</option>
									))}
							</select>
						</div>
						<div style={{ display: 'flex', gap: '12px' }}>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.impactOccurred(
										'light',
									)
									setShowAddModal(false)
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#272727] border border-[#2a2a2a] transition-all hover:bg-[#2a2a2a]'
								style={{ padding: '16px' }}
							>
								Отмена
							</button>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.notificationOccurred(
										'success',
									)
									handleAddHabit()
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#fc2a0d] transition-all hover:bg-[#e02509]'
								style={{ padding: '16px' }}
							>
								Создать
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Explosion Animation */}
			{showExplosion && (
				<div
					className='fixed inset-0 z-[100] flex items-center justify-center'
					style={{
						backgroundColor: 'rgba(0, 0, 0, 0.95)',
						animation: 'fadeIn 0.15s ease-out',
					}}
				>
					<div
						className='font-bold text-center'
						style={{
							fontSize: '140px',
							fontFamily: "'Oks', sans-serif",
							color: dailyColor,
							transform: 'rotate(-7deg)',
							animation: 'explodeText 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
							textShadow: `0 0 80px ${dailyColor}`,
							letterSpacing: '0.05em',
							lineHeight: 1,
						}}
					>
						#МЭТЧ
					</div>
					{[1, 2, 3].map(i => (
						<div
							key={`glow-${i}`}
							className='absolute'
							style={{
								width: '300px',
								height: '300px',
								borderRadius: '50%',
								background: `radial-gradient(circle, ${dailyColor}55 0%, transparent 70%)`,
								animation: `glowWave ${1.2}s ease-out ${i * 0.15}s`,
								opacity: 0,
							}}
						/>
					))}
				</div>
			)}

			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
				@keyframes explodeText {
					0% {
						transform: rotate(-7deg) scale(0.3);
						opacity: 0;
						filter: blur(20px);
					}
					60% {
						transform: rotate(-7deg) scale(1.15);
						opacity: 1;
						filter: blur(0px);
					}
					100% {
						transform: rotate(-7deg) scale(1);
						opacity: 1;
						filter: blur(0px);
					}
				}
				@keyframes glowWave {
					0% {
						transform: scale(0);
						opacity: 0.8;
					}
					100% {
						transform: scale(6);
						opacity: 0;
					}
				}
			`}</style>
		</div>
	)
}

'use client'

import BottomNav from '@/components/BottomNav'
import TrackerHeader from '@/components/TrackerHeader'
import { HABIT_CATEGORIES } from '@/lib/categories'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Habit {
	id: string
	title: string
	description: string
	color: string
	category: string
	isActive: boolean
	createdAt: string
}

export default function HabitsManagePage() {
	const router = useRouter()
	const [habits, setHabits] = useState<Habit[]>([])
	const [userId, setUserId] = useState<string>('')
	const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
	const [showEditModal, setShowEditModal] = useState(false)

	useEffect(() => {
		const handleBack = () => { router.back() }

		const initTelegram = async () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				const tg = window.Telegram.WebApp
				tg.ready()
				tg.expand()

				tg.BackButton.show()
				tg.BackButton.onClick(handleBack)

				const tgUser = tg.initDataUnsafe?.user
				if (tgUser) {
					const API_URL =
						process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
					const response = await fetch(`${API_URL}/users/telegram/${tgUser.id}`)
					const userData = await response.json()
					setUserId(userData.id)
					loadHabits(userData.id)
				}
			}
		}

		initTelegram()

		return () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				window.Telegram.WebApp.BackButton.offClick(handleBack)
				window.Telegram.WebApp.BackButton.hide()
			}
		}
	}, [])

	const loadHabits = async (uid: string) => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		const response = await fetch(`${API_URL}/habits/user/${uid}/all`)
		const data = await response.json()
		setHabits(Array.isArray(data) ? data : [])
	}

	const handleToggleActive = async (habitId: string) => {
		window.Telegram?.WebApp?.HapticFeedback.impactOccurred('medium')
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		await fetch(`${API_URL}/habits/${habitId}/toggle`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId }),
		})
		loadHabits(userId)
	}

	const handleEdit = (habit: Habit) => {
		window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light')
		setEditingHabit(habit)
		setShowEditModal(true)
	}

	const handleSaveEdit = async () => {
		if (!editingHabit) return

		window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success')
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		await fetch(`${API_URL}/habits/${editingHabit.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				title: editingHabit.title,
				description: editingHabit.description,
				category: editingHabit.category,
				color: editingHabit.color,
			}),
		})
		setShowEditModal(false)
		setEditingHabit(null)
		loadHabits(userId)
	}

	const activeHabits = habits.filter(h => h.isActive)
	const archivedHabits = habits.filter(h => !h.isActive)

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

			<div style={{ padding: '0 18px 0' }}>
				<h1
					style={{ fontFamily: 'Oks, sans-serif', marginBottom: '8px' }}
					className='text-3xl font-bold text-white'
				>
					Управление
				</h1>
				<p className='text-gray-400 text-sm' style={{ marginBottom: '24px' }}>
					Редактируйте и архивируйте привычки
				</p>

				{/* Active Habits */}
				<div style={{ marginBottom: '32px' }}>
					<div
						className='flex items-center justify-between'
						style={{ marginBottom: '16px' }}
					>
						<h2 className='text-lg font-semibold text-white'>Активные</h2>
						<span className='text-sm text-gray-500'>{activeHabits.length}</span>
					</div>
					{activeHabits.length === 0 ? (
						<div
							className='bg-[#272727] rounded-2xl border border-[#2a2a2a]'
							style={{ padding: '48px 24px' }}
						>
							<p className='text-gray-500 text-center'>Нет активных привычек</p>
						</div>
					) : (
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
						>
							{activeHabits.map(habit => (
								<div
									key={habit.id}
									className='bg-[#272727] rounded-2xl border border-[#2a2a2a] transition-all hover:border-[#3a3a3a]'
									style={{ padding: '16px' }}
								>
									<div
										className='flex items-center justify-between'
										style={{ marginBottom: '12px' }}
									>
										<div className='flex-1' style={{ minWidth: 0 }}>
											<h3 className='text-white font-semibold text-base truncate'>
												{habit.title}
											</h3>
											{habit.description && (
												<p
													className='text-sm text-gray-400 truncate'
													style={{ marginTop: '2px' }}
												>
													{habit.description}
												</p>
											)}
										</div>
									</div>
									<div className='flex items-center justify-between'>
										<span
											className='text-xs text-gray-500 bg-[#1a1a1a] rounded-full'
											style={{ padding: '4px 10px' }}
										>
											{HABIT_CATEGORIES[
												habit.category as keyof typeof HABIT_CATEGORIES
											]?.name || 'Другое'}
										</span>
										<div className='flex items-center' style={{ gap: '8px' }}>
											<button
												onClick={() => handleEdit(habit)}
												className='flex items-center justify-center rounded-full transition-all hover:bg-[#3a3a3a]'
												style={{ width: '36px', height: '36px' }}
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width={18}
													height={18}
													viewBox='0 0 24 24'
													style={{ color: '#e6f43f' }}
												>
													<path
														fill='currentColor'
														d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z'
													/>
												</svg>
											</button>
											<button
												onClick={() => handleToggleActive(habit.id)}
												className='flex items-center justify-center rounded-full transition-all hover:bg-[#3a3a3a]'
												style={{ width: '36px', height: '36px' }}
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width={18}
													height={18}
													viewBox='0 0 24 24'
													style={{ color: '#ff9800' }}
												>
													<path
														fill='currentColor'
														d='M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67l-.5-.68C10.96 2.54 10.05 2 9 2C7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2M15 4c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1M9 4c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1m11 15H4v-2h16zm0-5H4V8h5.08L7 10.83L8.62 12L12 7.4l3.38 4.6L17 10.83L14.92 8H20z'
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Archived Habits */}
				{archivedHabits.length > 0 && (
					<div>
						<div
							className='flex items-center justify-between'
							style={{ marginBottom: '16px' }}
						>
							<h2 className='text-lg font-semibold text-gray-400'>Архив</h2>
							<span className='text-sm text-gray-600'>
								{archivedHabits.length}
							</span>
						</div>
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
						>
							{archivedHabits.map(habit => (
								<div
									key={habit.id}
									className='bg-[#272727] rounded-2xl border border-[#2a2a2a] opacity-50 transition-all hover:opacity-70'
									style={{ padding: '16px' }}
								>
									<div className='flex items-center justify-between'>
										<div className='flex-1' style={{ minWidth: 0 }}>
											<h3 className='text-gray-400 font-semibold text-base truncate'>
												{habit.title}
											</h3>
											{habit.description && (
												<p
													className='text-sm text-gray-500 truncate'
													style={{ marginTop: '2px' }}
												>
													{habit.description}
												</p>
											)}
											<span
												className='text-xs text-gray-600 bg-[#1a1a1a] rounded-full'
												style={{
													marginTop: '8px',
													display: 'inline-block',
													padding: '4px 10px',
												}}
											>
												{HABIT_CATEGORIES[
													habit.category as keyof typeof HABIT_CATEGORIES
												]?.name || 'Другое'}
											</span>
										</div>
										<button
											onClick={() => handleToggleActive(habit.id)}
											className='flex items-center justify-center rounded-full transition-all hover:bg-[#3a3a3a]'
											style={{
												width: '36px',
												height: '36px',
												marginLeft: '12px',
												flexShrink: 0,
											}}
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width={20}
												height={20}
												viewBox='0 0 24 24'
												style={{ color: '#4caf50' }}
											>
												<path
													fill='currentColor'
													d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4l8-8z'
												/>
											</svg>
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Edit Modal */}
			{showEditModal && editingHabit && (
				<div
					className='fixed inset-0 flex items-center justify-center z-50'
					style={{
						padding: '18px',
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						backdropFilter: 'blur(8px)',
					}}
				>
					<div
						className='w-full max-w-md'
						style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
					>
						<h2
							className='text-xl font-bold text-white text-center'
							style={{ marginBottom: '8px' }}
						>
							Редактировать
						</h2>
						<div
							className='bg-[#272727] rounded-2xl border border-[#2a2a2a]'
							style={{ padding: '16px 18px' }}
						>
							<input
								type='text'
								placeholder='Название'
								value={editingHabit.title}
								onChange={e =>
									setEditingHabit({ ...editingHabit, title: e.target.value })
								}
								className='w-full bg-transparent text-white focus:outline-none placeholder-gray-500'
								style={{ fontSize: '16px' }}
							/>
						</div>
						<div
							className='bg-[#272727] rounded-2xl border border-[#2a2a2a]'
							style={{ padding: '16px 18px' }}
						>
							<textarea
								placeholder='Описание (опционально)'
								value={editingHabit.description}
								onChange={e =>
									setEditingHabit({
										...editingHabit,
										description: e.target.value,
									})
								}
								className='w-full bg-transparent text-white focus:outline-none resize-none placeholder-gray-500'
								style={{ fontSize: '16px' }}
								rows={3}
							/>
						</div>
						<div
							className='bg-[#272727] rounded-2xl border border-[#2a2a2a]'
							style={{ padding: '16px 18px' }}
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
						<div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
							<button
								onClick={() => {
									window.Telegram?.WebApp?.HapticFeedback.impactOccurred(
										'light',
									)
									setShowEditModal(false)
									setEditingHabit(null)
								}}
								className='flex-1 rounded-full font-medium text-white bg-[#272727] border border-[#2a2a2a] transition-all hover:bg-[#2a2a2a]'
								style={{ padding: '14px' }}
							>
								Отмена
							</button>
							<button
								onClick={handleSaveEdit}
								className='flex-1 rounded-full font-medium text-white bg-[#fc2a0d] transition-all hover:bg-[#e02509]'
								style={{ padding: '14px' }}
							>
								Сохранить
							</button>
						</div>
					</div>
				</div>
			)}

			<BottomNav />
		</div>
	)
}

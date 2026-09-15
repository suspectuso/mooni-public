'use client'

import BottomNav from '@/components/BottomNav'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Sprint {
	id: string
	title: string
	description: string
	taskTitle: string
	taskDescription: string
	conditions: string | null
	startDate: string | null
	endDate: string | null
	isActive: boolean
	participants?: Array<{
		userId: string
		sprintId: string
		points: number
		user: {
			id: string
			displayName?: string
			firstName?: string
			lastName?: string
			username?: string
			avatarUrl?: string
		}
	}>
}

interface LeaderboardEntry {
	rank: number
	userId: string
	points: number
	user: {
		displayName?: string
		firstName?: string
		lastName?: string
		username?: string
		avatarUrl?: string
	}
}

export default function SprintDetailPage() {
	const params = useParams()
	const router = useRouter()
	const sprintId = params.id as string

	const [sprint, setSprint] = useState<Sprint | null>(null)
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
	const [user, setUser] = useState<any>(null)
	const [isParticipant, setIsParticipant] = useState(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(false)

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
					setUser(userData)
				}
			}
		}

		initTelegram()
		loadSprint()

		return () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				window.Telegram.WebApp.BackButton.offClick(handleBack)
				window.Telegram.WebApp.BackButton.hide()
			}
		}
	}, [sprintId])

	useEffect(() => {
		if (sprint) {
			loadLeaderboard()
		}
	}, [sprint, page])

	useEffect(() => {
		if (sprint && user) {
			const isInSprint =
				sprint.participants?.some((p: any) => p.userId === user.id) || false
			setIsParticipant(isInSprint)
		}
	}, [sprint, user])

	const loadSprint = async () => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		const response = await fetch(`${API_URL}/sprints/${sprintId}`)
		const data = await response.json()
		setSprint(data)

		if (user) {
			const isInSprint =
				data.participants?.some((p: any) => p.userId === user.id) || false
			setIsParticipant(isInSprint)
		}
	}

	const joinSprint = async () => {
		if (!user) return
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

		if (window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
		}

		await fetch(`${API_URL}/sprints/${sprintId}/join`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id }),
		})

		// Перезагружаем данные спринта и таблицу лидеров
		await loadSprint()
		await loadLeaderboard()
	}

	const leaveSprint = async () => {
		if (!user) return

		if (window.Telegram?.WebApp) {
			window.Telegram.WebApp.showConfirm(
				'Ваш прогресс будет обнулен. Вы уверены?',
				async confirmed => {
					if (confirmed) {
						const API_URL =
							process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
						await fetch(`${API_URL}/sprints/${sprintId}/leave`, {
							method: 'DELETE',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ userId: user.id }),
						})
						// Перезагружаем данные спринта и таблицу лидеров
						await loadSprint()
						await loadLeaderboard()
					}
				}
			)
		}
	}

	const loadLeaderboard = async () => {
		setLoading(true)
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		const response = await fetch(
			`${API_URL}/sprints/${sprintId}/leaderboard?page=${page}&limit=20`
		)
		const data = await response.json()
		setLeaderboard(data.data || [])
		setTotalPages(data.pagination?.totalPages || 1)
		setLoading(false)
	}

	const openChat = () => {
		if (window.Telegram?.WebApp) {
			window.Telegram.WebApp.openTelegramLink('https://t.me/match_MSD')
		}
	}

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Бессрочно'
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
		})
	}

	const isSprintEnded = () => {
		if (!sprint?.endDate) return false
		return new Date(sprint.endDate) < new Date()
	}

	if (!sprint) {
		return (
			<div
				style={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#121212',
				}}
			>
				<p className='text-gray-400'>Загрузка...</p>
			</div>
		)
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
			<div style={{ padding: '24px 18px 0' }}>
				<h1
					style={{ fontFamily: 'Oks, sans-serif', marginBottom: '24px' }}
					className='text-3xl font-bold text-white'
				>
					{sprint.title}
				</h1>

				{/* Sprint Info */}
				<div
					className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]'
					style={{ padding: '20px', marginBottom: '16px' }}
				>
					<div
						className='flex items-start justify-between'
						style={{ marginBottom: '12px' }}
					>
						<span
							className={`rounded-full text-xs font-medium ${
								isSprintEnded()
									? 'bg-gray-500/20 text-gray-400'
									: 'bg-green-500/20 text-green-400'
							}`}
							style={{ padding: '4px 12px' }}
						>
							{isSprintEnded() ? 'Завершен' : 'Активен'}
						</span>
					</div>

					{sprint.description && (
						<p className='text-gray-400' style={{ marginBottom: '16px' }}>
							{sprint.description}
						</p>
					)}

					{/* Task */}
					<div
						className='bg-[#0a0a0a] rounded-xl'
						style={{ padding: '16px', marginBottom: '16px' }}
					>
						<h3
							className='text-white font-semibold'
							style={{ marginBottom: '8px' }}
						>
							📋 Задача:
						</h3>
						<p
							className='text-[#e6f43f] font-medium'
							style={{ marginBottom: '4px' }}
						>
							{sprint.taskTitle}
						</p>
						{sprint.taskDescription && (
							<p className='text-gray-400 text-sm'>{sprint.taskDescription}</p>
						)}
					</div>

					{/* Conditions */}
					{sprint.conditions && (
						<div
							className='bg-[#0a0a0a] rounded-xl border border-[#2a2a2a]'
							style={{ padding: '16px', marginBottom: '16px' }}
						>
							<h3
								className='text-white font-semibold'
								style={{ marginBottom: '12px' }}
							>
								📝 Условия:
							</h3>
							<div className='text-gray-300 text-sm leading-relaxed whitespace-pre-line'>
								{sprint.conditions
									.split('t.me/match_MSD')
									.map((part, i, arr) => (
										<span key={i}>
											{part}
											{i < arr.length - 1 && (
												<button
													onClick={openChat}
													className='text-[#e6f43f] hover:underline'
												>
													t.me/match_MSD
												</button>
											)}
										</span>
									))}
							</div>
						</div>
					)}

					{/* Dates */}
					<div
						className='flex items-center text-sm text-gray-400'
						style={{ gap: '16px', marginBottom: '16px' }}
					>
						<div>
							<span className='text-gray-500'>Начало:</span>{' '}
							{formatDate(sprint.startDate)}
						</div>
						<div>
							<span className='text-gray-500'>Конец:</span>{' '}
							{formatDate(sprint.endDate)}
						</div>
					</div>

					{/* Action Button */}
					{!isSprintEnded() &&
						(isParticipant ? (
							<button
								onClick={leaveSprint}
								className='w-full rounded-full font-medium transition-all hover:bg-red-500/30'
								style={{
									padding: '12px 24px',
									backgroundColor: 'rgba(239, 68, 68, 0.2)',
									color: '#f87171',
								}}
							>
								Покинуть спринт
							</button>
						) : (
							<button
								onClick={joinSprint}
								className='w-full rounded-full font-medium transition-all hover:bg-[#e02509]'
								style={{
									padding: '12px 24px',
									backgroundColor: '#fc2a0d',
									color: '#fff',
								}}
							>
								Принять участие
							</button>
						))}
				</div>

				{/* Leaderboard */}
				<div
					className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]'
					style={{ padding: '20px' }}
				>
					<h3
						className='text-lg font-bold text-white'
						style={{ marginBottom: '16px' }}
					>
						🏆 Таблица лидеров
					</h3>

					{leaderboard.length === 0 ? (
						<div
							className='text-center text-gray-500'
							style={{ padding: '32px 0' }}
						>
							<p>Пока нет участников с очками</p>
						</div>
					) : (
						<>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '12px',
								}}
							>
								{leaderboard.map(entry => (
									<div
										key={entry.userId}
										className='flex items-center rounded-xl'
										style={{
											gap: '12px',
											padding: '12px',
											backgroundColor:
												entry.rank <= 3 ? '#2a2a2a' : 'transparent',
										}}
									>
										<div
											className='flex items-center justify-center font-bold'
											style={{
												width: '32px',
												height: '32px',
												borderRadius: '50%',
												backgroundColor:
													entry.rank === 1
														? '#FFD700'
														: entry.rank === 2
														? '#C0C0C0'
														: entry.rank === 3
														? '#CD7F32'
														: '#3a3a3a',
												color: entry.rank <= 3 ? '#000' : '#fff',
												flexShrink: 0,
											}}
										>
											{entry.rank}
										</div>
										{entry.user.avatarUrl ? (
											<img
												src={entry.user.avatarUrl}
												alt='Avatar'
												className='w-10 h-10 rounded-full'
												style={{ flexShrink: 0 }}
											/>
										) : (
											<div
												className='w-10 h-10 rounded-full bg-gradient-to-br from-[#fc2a0d] to-[#e6f43f] flex items-center justify-center text-sm font-bold text-black'
												style={{ flexShrink: 0 }}
											>
												{(entry.user.displayName ||
													entry.user.firstName)?.[0] || 'U'}
											</div>
										)}
										<div className='flex-1' style={{ minWidth: 0 }}>
											<div className='text-white font-medium truncate'>
												{entry.user.displayName ||
													`${entry.user.firstName || ''} ${
														entry.user.lastName || ''
													}`.trim() ||
													entry.user.username ||
													'Пользователь'}
											</div>
										</div>
										<div
											className='text-[#e6f43f] font-bold'
											style={{ flexShrink: 0 }}
										>
											{entry.points}
										</div>
									</div>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div
									className='flex items-center justify-center'
									style={{ gap: '12px', marginTop: '16px' }}
								>
									<button
										onClick={() => setPage(p => Math.max(1, p - 1))}
										disabled={page === 1 || loading}
										className='px-4 py-2 rounded-full bg-[#2a2a2a] text-white disabled:opacity-50'
									>
										←
									</button>
									<span className='text-gray-400'>
										{page} / {totalPages}
									</span>
									<button
										onClick={() => setPage(p => Math.min(totalPages, p + 1))}
										disabled={page === totalPages || loading}
										className='px-4 py-2 rounded-full bg-[#2a2a2a] text-white disabled:opacity-50'
									>
										→
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<BottomNav />
		</div>
	)
}

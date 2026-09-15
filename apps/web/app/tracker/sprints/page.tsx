'use client'

import BottomNav from '@/components/BottomNav'
import TrackerHeader from '@/components/TrackerHeader'
import { useRouter } from 'next/navigation'
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
}

export default function SprintsPage() {
	const router = useRouter()
	const [sprints, setSprints] = useState<Sprint[]>([])
	const [_user, setUser] = useState<any>(null)
	const [userSprints, setUserSprints] = useState<Set<string>>(new Set())

	useEffect(() => {
		const initTelegram = async () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				const tg = window.Telegram.WebApp
				tg.ready()
				tg.expand()

				const tgUser = tg.initDataUnsafe?.user
				if (tgUser) {
					const API_URL =
						process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
					const response = await fetch(`${API_URL}/users/telegram/${tgUser.id}`)
					const userData = await response.json()
					setUser(userData)

					const userSprintsResponse = await fetch(
						`${API_URL}/sprints/user/${userData.id}`,
					)
					const userSprintsData = await userSprintsResponse.json()
					setUserSprints(new Set(userSprintsData.map((s: Sprint) => s.id)))
				}
			}
		}

		initTelegram()
		loadSprints()
	}, [])

	const loadSprints = async () => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		const response = await fetch(`${API_URL}/sprints`)
		const data = await response.json()
		setSprints(data)
	}

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Бессрочно'
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
		})
	}

	const isSprintEnded = (sprint: Sprint) => {
		if (!sprint.endDate) return false
		return new Date(sprint.endDate) < new Date()
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
			<TrackerHeader />

			<div style={{ padding: '0 18px 0' }}>
				<h1
					style={{ fontFamily: 'Oks, sans-serif', marginBottom: '24px' }}
					className='text-3xl font-bold text-white'
				>
					Спринты
				</h1>

				{sprints.length === 0 ? (
					<div
						className='text-center text-gray-400'
						style={{ marginTop: '48px' }}
					>
						<p>Нет активных спринтов</p>
					</div>
				) : (
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
					>
						{sprints.map(sprint => {
							const ended = isSprintEnded(sprint)
							const participating = userSprints.has(sprint.id)

							return (
								<div
									key={sprint.id}
									className='bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] cursor-pointer hover:border-[#3a3a3a] transition-all'
									style={{ padding: '20px' }}
									onClick={() => router.push(`/tracker/sprints/${sprint.id}`)}
								>
									<div
										className='flex items-start justify-between'
										style={{ marginBottom: '12px' }}
									>
										<h2 className='text-xl font-bold text-white'>
											{sprint.title}
										</h2>
										<span
											className={`rounded-full text-xs font-medium ${
												ended
													? 'bg-gray-500/20 text-gray-400'
													: 'bg-green-500/20 text-green-400'
											}`}
											style={{ flexShrink: 0, padding: '4px 12px' }}
										>
											{ended ? 'Завершен' : 'Активен'}
										</span>
									</div>

									{sprint.description && (
										<p
											className='text-gray-400 text-sm'
											style={{ marginBottom: '12px' }}
										>
											{sprint.description}
										</p>
									)}

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

									{participating && (
										<div
											className='text-[#e6f43f] text-sm font-medium'
											style={{ marginBottom: '12px' }}
										>
											✓ Вы участвуете
										</div>
									)}

									<button
										className='w-full rounded-full font-medium transition-all'
										style={{
											padding: '12px 24px',
											backgroundColor: ended ? '#2a2a2a' : '#fc2a0d',
											color: '#fff',
										}}
										onClick={e => {
											e.stopPropagation()
											router.push(`/tracker/sprints/${sprint.id}`)
										}}
									>
										{ended ? 'Посмотреть результаты' : 'Подробнее'}
									</button>
								</div>
							)
						})}
					</div>
				)}
			</div>

			<BottomNav />
		</div>
	)
}

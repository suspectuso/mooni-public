'use client'

import BottomNav from '@/components/BottomNav'
import TrackerHeader from '@/components/TrackerHeader'
import { leaderboardApi } from '@/lib/api'
import { HABIT_CATEGORIES } from '@/lib/categories'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
	const [leaders, setLeaders] = useState<any[]>([])
	const [selectedCategory, setSelectedCategory] = useState('ALL')
	const router = useRouter()

	useEffect(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			const tg = window.Telegram.WebApp
			tg.ready()
			tg.expand()

			// Предотвращаем закрытие приложения
			tg.enableClosingConfirmation()
		}

		loadLeaderboard()
	}, [selectedCategory])

	const loadLeaderboard = async () => {
		const category = selectedCategory === 'ALL' ? undefined : selectedCategory
		const response = await leaderboardApi.get(50, category)
		setLeaders(response.data)
	}

	const getMedalEmoji = (index: number) => {
		if (index === 0) return '🥇'
		if (index === 1) return '🥈'
		if (index === 2) return '🥉'
		return `${index + 1}`
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

			{/* Header */}
			<div style={{ padding: '0 18px 0' }}>
				<h1
					style={{ fontFamily: 'Oks, sans-serif' }}
					className='text-3xl font-bold text-white mb-2'
				>
					Лидерборд
				</h1>
				<p className='text-sm text-gray-400 mb-4'>
					Топ {leaders.length} участников по очкам
				</p>

				{/* Category Filter */}
				<div
					className='flex gap-2 overflow-x-auto pb-2 mb-6'
					style={{
						scrollbarWidth: 'none',
						marginBottom: '10px',
						marginTop: '5px',
					}}
				>
					{Object.entries(HABIT_CATEGORIES).map(([key, cat]) => (
						<button
							key={key}
							onClick={() => {
								if (window.Telegram?.WebApp) {
									window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
								}
								setSelectedCategory(key)
							}}
							className='rounded-full transition-all flex-shrink-0'
							style={{
								padding: '4px 12px',
								backgroundColor:
									selectedCategory === key ? '#e6f43f' : '#272727',
								color: selectedCategory === key ? '#000' : '#fff',
								border: `1px solid ${
									selectedCategory === key ? '#e6f43f' : '#2a2a2a'
								}`,
								fontWeight: selectedCategory === key ? 'bold' : 'normal',
								fontSize: '12px',
							}}
						>
							{cat.name}
						</button>
					))}
				</div>
			</div>

			{/* Leaders List */}
			<div style={{ padding: '0 18px' }}>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					{leaders.map((leader, index) => (
						<div
							key={leader.id}
							onClick={() => {
								if (window.Telegram?.WebApp) {
									window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
								}
								router.push(`/tracker/user/${leader.id}`)
							}}
							className='bg-[#272727] rounded-2xl border border-[#2a2a2a] transition-all hover:border-[#3a3a3a] cursor-pointer active:scale-98'
							style={{
								padding: '16px',
								animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
							}}
						>
							<div className='flex items-center gap-3'>
								<div
									className='font-bold w-8 text-center flex-shrink-0'
									style={{
										fontSize: index < 3 ? '24px' : '18px',
										color: index < 3 ? '#e6f43f' : '#666',
									}}
								>
									{getMedalEmoji(index)}
								</div>

								{leader.avatarUrl ? (
									<img
										src={leader.avatarUrl}
										alt='Avatar'
										className='w-12 h-12 rounded-full flex-shrink-0 object-cover'
									/>
								) : (
									<div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#fc2a0d] to-[#e6f43f] flex items-center justify-center font-bold text-black flex-shrink-0'>
										{leader.firstName?.[0] || 'U'}
									</div>
								)}

								<div className='flex-1 min-w-0'>
									<h3 className='font-semibold text-white truncate text-base'>
										{leader.firstName} {leader.lastName}
									</h3>
									{leader.username && (
										<p className='text-sm text-gray-500 truncate'>
											@{leader.username}
										</p>
									)}
								</div>

								<div className='text-right flex-shrink-0'>
									<div
										className='font-bold'
										style={{
											fontSize: index < 3 ? '22px' : '18px',
											color: index < 3 ? '#e6f43f' : '#fff',
										}}
									>
										{leader.points}
									</div>
									<div className='text-xs text-gray-500'>очков</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{leaders.length === 0 && (
					<div className='text-center text-gray-400 mt-10'>
						Пока нет участников
					</div>
				)}
			</div>

			<style jsx>{`
				@keyframes fadeInUp {
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

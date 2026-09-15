'use client'

import WorkBottomNav from '@/components/WorkBottomNav'
import WorkHeader from '@/components/WorkHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WorkPage() {
	const router = useRouter()
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<'vacancies' | 'resumes'>(
		'vacancies',
	)

	// Preload favorite images
	useEffect(() => {
		const img1 = new window.Image()
		img1.src = '/favorite.webp'
		const img2 = new window.Image()
		img2.src = '/favorite_fill.webp'
	}, [])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const handleBack = () => router.push('/')
		tg.ready()
		tg.expand()
		tg.BackButton.show()
		tg.BackButton.onClick(handleBack)
		return () => {
			tg.BackButton.offClick(handleBack)
			tg.BackButton.hide()
		}
	}, [router])

	// Load data when tab changes
	useEffect(() => {
		loadData()
	}, [activeTab])

	const loadData = async () => {
		setLoading(true)
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			let endpoint = ''

			if (activeTab === 'vacancies') {
				// Показываем все вакансии
				endpoint = '/api/work/vacancies'
			} else {
				// Показываем все резюме
				endpoint = '/api/work/resumes'
			}

			const headers: any = {}
			if (tgUser) {
				headers['x-telegram-user-id'] = tgUser.id.toString()
			}

			const response = await fetch(endpoint, { headers })
			if (response.ok) {
				const data = await response.json()
				setItems(data)
			}
		} catch (error) {
			console.error('Error loading data:', error)
		} finally {
			setLoading(false)
		}
	}

	const toggleFavorite = async (itemId: string, e: React.MouseEvent) => {
		e.stopPropagation()

		// Optimistic update
		setItems(prevItems =>
			prevItems.map(item =>
				item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
			),
		)

		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) {
				// Revert on error
				setItems(prevItems =>
					prevItems.map(item =>
						item.id === itemId
							? { ...item, isFavorite: !item.isFavorite }
							: item,
					),
				)
				return
			}

			const endpoint =
				activeTab === 'vacancies'
					? `/api/work/favorites/vacancies/${itemId}`
					: `/api/work/favorites/resumes/${itemId}`

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (!response.ok) {
				// Revert on error
				setItems(prevItems =>
					prevItems.map(item =>
						item.id === itemId
							? { ...item, isFavorite: !item.isFavorite }
							: item,
					),
				)
			}
		} catch (error) {
			console.error('Error toggling favorite:', error)
			// Revert on error
			setItems(prevItems =>
				prevItems.map(item =>
					item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
				),
			)
		}
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
			<WorkHeader />

			{/* Tabs: Вакансии и Резюме */}
			<div style={{ padding: '0 20px 20px' }}>
				<div
					style={{
						display: 'flex',
						gap: '12px',
						alignItems: 'center',
					}}
				>
					{/* Вакансии Button */}
					<button
						onClick={() => setActiveTab('vacancies')}
						style={{
							backgroundColor:
								activeTab === 'vacancies' ? '#65FFF7' : '#3a3a3a',
							border: 'none',
							borderRadius: '24px',
							padding: '8px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: activeTab === 'vacancies' ? '#121212' : '#FCF9F7',
							cursor: 'pointer',
							fontWeight: 600,
						}}
					>
						Вакансии
					</button>

					{/* Резюме Button */}
					<button
						onClick={() => setActiveTab('resumes')}
						style={{
							backgroundColor: activeTab === 'resumes' ? '#65FFF7' : '#3a3a3a',
							border: 'none',
							borderRadius: '24px',
							padding: '8px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: activeTab === 'resumes' ? '#121212' : '#FCF9F7',
							cursor: 'pointer',
							fontWeight: 600,
						}}
					>
						Резюме
					</button>
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '0 20px 100px' }}>
				{loading ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: '40px',
						}}
					>
						<div
							style={{
								width: '40px',
								height: '40px',
								border: '3px solid rgba(101, 255, 247, 0.3)',
								borderTop: '3px solid #65FFF7',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite',
							}}
						/>
					</div>
				) : items.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '40px 20px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.5)',
							}}
						>
							{activeTab === 'vacancies'
								? 'Вакансии не найдены'
								: 'Резюме не найдены'}
						</p>
					</div>
				) : (
					items.map(item => (
						<div key={item.id} style={{ marginBottom: '16px' }}>
							<div
								style={{
									backgroundColor: '#272727',
									borderRadius: '28px',
									padding: '20px',
									cursor: 'pointer',
								}}
								onClick={() => {
									const path =
										activeTab === 'vacancies'
											? `/work/vacancies/${item.id}`
											: `/work/resumes/${item.id}`
									router.push(path)
								}}
							>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
										marginBottom: '12px',
									}}
								>
									<h3
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '20px',
											color: '#FCF9F7',
											margin: 0,
										}}
									>
										{item.position}
									</h3>
									<button
										onClick={e => toggleFavorite(item.id, e)}
										style={{
											background: 'none',
											border: 'none',
											cursor: 'pointer',
											padding: 0,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'transform 0.2s ease',
										}}
										onMouseDown={e => {
											e.currentTarget.style.transform = 'scale(0.9)'
										}}
										onMouseUp={e => {
											e.currentTarget.style.transform = 'scale(1)'
										}}
										onMouseLeave={e => {
											e.currentTarget.style.transform = 'scale(1)'
										}}
									>
										<img
											src={
												item.isFavorite
													? '/favorite_fill.webp'
													: '/favorite.webp'
											}
											alt='Favorite'
											width={33}
											height={30}
											style={{
												width: '33px',
												height: '30px',
												transition: 'opacity 0.2s ease',
											}}
										/>
									</button>
								</div>

								<p
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: 'rgba(252, 249, 247, 0.7)',
										marginBottom: '16px',
										lineHeight: '1.5',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										display: '-webkit-box',
										WebkitLineClamp: 3,
										WebkitBoxOrient: 'vertical',
									}}
								>
									{activeTab === 'vacancies'
										? item.description
										: item.experience}
								</p>

								{item.skills && item.skills.length > 0 && (
									<div style={{ marginBottom: '12px' }}>
										<p
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '12px',
												color: 'rgba(252, 249, 247, 0.5)',
												marginBottom: '8px',
											}}
										>
											Ключевые навыки
										</p>
										<div
											style={{
												display: 'flex',
												gap: '8px',
												flexWrap: 'wrap',
											}}
										>
											{item.skills.slice(0, 3).map((skillItem: any) => (
												<span
													key={skillItem.skill.id}
													style={{
														backgroundColor: '#65FFF7',
														borderRadius: '16px',
														padding: '6px 12px',
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '12px',
														color: '#121212',
													}}
												>
													{skillItem.skill.name}
												</span>
											))}
											{item.skills.length > 3 && (
												<span
													style={{
														backgroundColor: 'transparent',
														border: '1px solid rgba(252, 249, 247, 0.3)',
														borderRadius: '16px',
														padding: '6px 12px',
														fontFamily: 'LT Superior, sans-serif',
														fontSize: '12px',
														color: '#FCF9F7',
													}}
												>
													+{item.skills.length - 3}
												</span>
											)}
										</div>
									</div>
								)}

								{(item.salaryMin || item.salaryMax) && (
									<p
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '16px',
											fontWeight: 500,
											color: '#FCF9F7',
											margin: 0,
										}}
									>
										{item.salaryMin && item.salaryMax
											? `${item.salaryMin.toLocaleString()} - ${item.salaryMax.toLocaleString()}₽/мес.`
											: item.salaryMin
												? `от ${item.salaryMin.toLocaleString()}₽/мес.`
												: `до ${item.salaryMax.toLocaleString()}₽/мес.`}
									</p>
								)}
							</div>
						</div>
					))
				)}
			</div>

			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>

			<WorkBottomNav />
		</div>
	)
}

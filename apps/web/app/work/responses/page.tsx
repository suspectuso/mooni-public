'use client'

import WorkBottomNav from '@/components/WorkBottomNav'
import WorkHeader from '@/components/WorkHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResponsesPage() {
	const router = useRouter()
	const [responses, setResponses] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadResponses()
	}, [])

	const loadResponses = async () => {
		setLoading(true)
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			const response = await fetch('/api/work/vacancies/my', {
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				setResponses(data)
			}
		} catch (error) {
			console.error('Error loading responses:', error)
		} finally {
			setLoading(false)
		}
	}

	const toggleFavorite = async (itemId: string, e: React.MouseEvent) => {
		e.stopPropagation()

		// Optimistic update
		setResponses(prevItems =>
			prevItems.map(item =>
				item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
			),
		)

		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) {
				// Revert on error
				setResponses(prevItems =>
					prevItems.map(item =>
						item.id === itemId
							? { ...item, isFavorite: !item.isFavorite }
							: item,
					),
				)
				return
			}

			const endpoint = `/api/work/favorites/vacancies/${itemId}`

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (!response.ok) {
				// Revert on error
				setResponses(prevItems =>
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
			setResponses(prevItems =>
				prevItems.map(item =>
					item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
				),
			)
		}
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
			<WorkHeader />

			<div style={{ padding: '0 20px 20px' }}>
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '32px',
						color: '#FCF9F7',
						marginBottom: '20px',
					}}
				>
					Отклики
				</h1>
			</div>

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
				) : responses.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '40px 20px',
							backgroundColor: '#272727',
							borderRadius: '16px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.5)',
							}}
						>
							Пока нет откликов
						</p>
					</div>
				) : (
					responses.map(vacancy => (
						<div key={vacancy.id} style={{ marginBottom: '16px' }}>
							<div
								style={{
									backgroundColor: '#272727',
									borderRadius: '28px',
									padding: '20px',
									cursor: 'pointer',
								}}
								onClick={() => {
									if (vacancy.firstResponseId) {
										router.push(`/work/responses/${vacancy.firstResponseId}`)
									} else {
										router.push(`/work/vacancies/${vacancy.id}/responses`)
									}
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
										{vacancy.position}
									</h3>
									<button
										onClick={e => toggleFavorite(vacancy.id, e)}
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
												vacancy.isFavorite
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
									{vacancy.description}
								</p>

								{vacancy.skills && vacancy.skills.length > 0 && (
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
											{vacancy.skills.slice(0, 3).map((skillItem: any) => (
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
											{vacancy.skills.length > 3 && (
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
													+{vacancy.skills.length - 3}
												</span>
											)}
										</div>
									</div>
								)}

								{(vacancy.salaryMin || vacancy.salaryMax) && (
									<p
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '16px',
											fontWeight: 500,
											color: '#FCF9F7',
											margin: 0,
										}}
									>
										{vacancy.salaryMin && vacancy.salaryMax
											? `${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()}₽/мес.`
											: vacancy.salaryMin
												? `от ${vacancy.salaryMin.toLocaleString()}₽/мес.`
												: `до ${vacancy.salaryMax.toLocaleString()}₽/мес.`}
									</p>
								)}
							</div>

							{/* Responses Section with avatars */}
							{vacancy.recentResponders &&
								vacancy.recentResponders.length > 0 && (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											marginTop: '12px',
											padding: '20px',
											backgroundColor: '#272727',
											borderRadius: '28px',
											height: '96px',
											cursor: 'pointer',
										}}
										onClick={e => {
											e.stopPropagation()
											if (vacancy.firstResponseId) {
												router.push(
													`/work/responses/${vacancy.firstResponseId}`,
												)
											} else {
												router.push(`/work/vacancies/${vacancy.id}/responses`)
											}
										}}
									>
										{/* Avatars */}
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '0',
											}}
										>
											{vacancy.recentResponders.map(
												(avatarUrl: any, index: number) => {
													const validUrl =
														typeof avatarUrl === 'string' && avatarUrl
															? avatarUrl
															: null
													if (!validUrl) return null

													return (
														<div
															key={index}
															style={{
																width: '58px',
																height: '58px',
																borderRadius: '50%',
																overflow: 'hidden',
																border: '2px solid #121212',
																marginLeft: index > 0 ? '-16px' : 0,
																position: 'relative',
																zIndex: 3 - index,
															}}
														>
															<img
																src={validUrl}
																alt=''
																style={{
																	width: '100%',
																	height: '100%',
																	objectFit: 'cover',
																}}
															/>
														</div>
													)
												},
											)}
										</div>

										{/* All Responses Button */}
										<span
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '18px',
												fontWeight: 500,
												color: '#FCF9F7',
											}}
										>
											Все отклики
										</span>
									</div>
								)}
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

'use client'

import WorkBottomNav from '@/components/WorkBottomNav'
import WorkHeader from '@/components/WorkHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FavoritesPage() {
	const router = useRouter()
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [mode, setMode] = useState<'candidate' | 'company'>('candidate')

	// Preload favorite images
	useEffect(() => {
		const img1 = new window.Image()
		img1.src = '/favorite.webp'
		const img2 = new window.Image()
		img2.src = '/favorite_fill.webp'
	}, [])

	useEffect(() => {
		const savedMode = localStorage.getItem('workMode') as
			| 'candidate'
			| 'company'
			| null
		if (savedMode) {
			setMode(savedMode)
		}

		// Listen for mode changes
		const handleModeChange = (e: CustomEvent) => {
			const newMode = e.detail as 'candidate' | 'company'
			setMode(newMode)
		}

		window.addEventListener('modeChange' as any, handleModeChange as any)

		return () => {
			window.removeEventListener('modeChange' as any, handleModeChange as any)
		}
	}, [])

	useEffect(() => {
		// Clear items when mode changes
		setItems([])
		loadData()
	}, [mode])

	const loadData = async () => {
		setLoading(true)
		try {
			const tg = window.Telegram?.WebApp
			const tgUser = tg?.initDataUnsafe?.user

			if (!tgUser) return

			const endpoint =
				mode === 'candidate'
					? '/api/work/favorites/vacancies'
					: '/api/work/favorites/resumes'

			const response = await fetch(endpoint, {
				headers: {
					'x-telegram-user-id': tgUser.id.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()

				if (mode === 'company' && tgUser && data.length > 0) {
					const itemsWithResponses = await Promise.all(
						data.map(async (item: any) => {
							// Check if this vacancy belongs to current user
							if (item.user?.telegramId === tgUser.id.toString()) {
								try {
									const responsesRes = await fetch(
										`/api/work/responses/vacancy/${item.id}`,
										{
											headers: {
												'x-telegram-user-id': tgUser.id.toString(),
											},
										},
									)
									if (responsesRes.ok) {
										const responses = await responsesRes.json()
										return {
											...item,
											responsesCount: responses.length,
											responses: responses.slice(0, 3),
										}
									}
								} catch (error) {
									console.error('Error loading responses:', error)
								}
							}
							return item
						}),
					)
					setItems(itemsWithResponses)
				} else {
					setItems(data)
				}
			}
		} catch (error) {
			console.error('Error loading data:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
				paddingBottom: '100px',
			}}
		>
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
						onClick={() => {
							setMode('candidate')
							localStorage.setItem('workMode', 'candidate')
							window.dispatchEvent(
								new CustomEvent('modeChange', { detail: 'candidate' }),
							)
						}}
						style={{
							backgroundColor: mode === 'candidate' ? '#65FFF7' : '#3a3a3a',
							border: 'none',
							borderRadius: '24px',
							padding: '8px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: mode === 'candidate' ? '#121212' : '#FCF9F7',
							cursor: 'pointer',
							fontWeight: 600,
						}}
					>
						Вакансии
					</button>

					{/* Резюме Button */}
					<button
						onClick={() => {
							setMode('company')
							localStorage.setItem('workMode', 'company')
							window.dispatchEvent(
								new CustomEvent('modeChange', { detail: 'company' }),
							)
						}}
						style={{
							backgroundColor: mode === 'company' ? '#65FFF7' : '#3a3a3a',
							border: 'none',
							borderRadius: '24px',
							padding: '8px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: mode === 'company' ? '#121212' : '#FCF9F7',
							cursor: 'pointer',
							fontWeight: 600,
						}}
					>
						Резюме
					</button>
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '20px' }}>
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
							{mode === 'candidate'
								? 'Нет избранных вакансий'
								: 'Нет избранных резюме'}
						</p>
					</div>
				) : (
					items.map(item => {
						const displayItem = item

						return (
							<div
								key={item.id}
								style={{
									backgroundColor: '#272727',
									borderRadius: '28px',
									padding: '20px',
									marginBottom: '16px',
									cursor: 'pointer',
									overflow: 'visible',
								}}
								onClick={() => {
									const path =
										mode === 'candidate'
											? `/work/vacancies/${displayItem.id}`
											: `/work/resumes/${displayItem.id}`
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
										{displayItem.position}
									</h3>
									<img
										src='/favorite_fill.webp'
										alt='Favorite'
										width={33}
										height={30}
										style={{
											width: '33px',
											height: '30px',
										}}
									/>
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
									{displayItem.description || displayItem.experience}
								</p>

								{displayItem.skills && displayItem.skills.length > 0 && (
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
											style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
										>
											{displayItem.skills.slice(0, 3).map((skillItem: any) => (
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
											{displayItem.skills.length > 3 && (
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
													+{displayItem.skills.length - 3}
												</span>
											)}
										</div>
									</div>
								)}

								{(displayItem.salaryMin || displayItem.salaryMax) && (
									<p
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '16px',
											fontWeight: 500,
											color: '#FCF9F7',
											margin: 0,
											marginBottom:
												mode === 'company' && item.responsesCount > 0
													? '12px'
													: 0,
										}}
									>
										{displayItem.salaryMin && displayItem.salaryMax
											? `${displayItem.salaryMin.toLocaleString()} - ${displayItem.salaryMax.toLocaleString()}₽/мес.`
											: displayItem.salaryMin
												? `от ${displayItem.salaryMin.toLocaleString()}₽/мес.`
												: `до ${displayItem.salaryMax.toLocaleString()}₽/мес.`}
									</p>
								)}

								{/* Responses Badge - Only for company mode and own vacancies */}
								{mode === 'company' && item.responsesCount > 0 && (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											backgroundColor: '#3a3a3a',
											borderRadius: '24px',
											padding: '8px 16px',
											width: 'fit-content',
											cursor: 'pointer',
										}}
										onClick={e => {
											e.stopPropagation()
											router.push(`/work/vacancies/${item.id}/responses`)
										}}
									>
										<svg
											width='14'
											height='16'
											viewBox='0 0 14 16'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M9.01412 11.6389H4.4842M9.01412 11.6389H11.7246C13.1316 11.6389 12.8938 10.1922 12.1821 9.458C9.61861 6.81744 13.2598 0.75 6.74916 0.75C0.238515 0.75 3.88046 6.81667 1.317 9.458C0.632259 10.1642 0.340514 11.6389 1.77449 11.6389H4.4842M9.01412 11.6389C9.01412 13.1361 8.52813 14.75 6.74916 14.75C4.97019 14.75 4.4842 13.1361 4.4842 11.6389'
												stroke='#FCF9F7'
												strokeWidth='1.5'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
										<span
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: '#FCF9F7',
											}}
										>
											Все отклики
										</span>
										{item.responses && item.responses.length > 0 && (
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													marginLeft: '4px',
												}}
											>
												{item.responses.map((response: any, index: number) => (
													<div
														key={response.id}
														style={{
															width: '24px',
															height: '24px',
															borderRadius: '50%',
															backgroundColor: '#65FFF7',
															border: '2px solid #3a3a3a',
															marginLeft: index > 0 ? '-8px' : 0,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															overflow: 'hidden',
															position: 'relative',
															zIndex: item.responses.length - index,
														}}
													>
														{response.user?.avatarUrl ? (
															<img
																src={response.user.avatarUrl}
																alt=''
																style={{
																	width: '100%',
																	height: '100%',
																	objectFit: 'cover',
																}}
															/>
														) : (
															<svg
																width='12'
																height='12'
																viewBox='0 0 24 24'
																fill='#121212'
															>
																<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' />
															</svg>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								)}
							</div>
						)
					})
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

'use client'

import ProjectCard from '@/components/radar/ProjectCard'
import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import { useEffect, useState } from 'react'

interface Project {
	id: string
	name: string
	description: string
	avatarPath: string | null
	projectUrl: string | null
	stage: string
	investmentAmount: string | null
	linkedVacancyId: string | null
	fireCount: number
	teamMemberCount: number
	hasFired: boolean
	photos: Array<{ photoPath: string }>
	categories: Array<{ category: { name: string } }>
	tags: Array<{ tag: { name: string } }>
}

export default function RadarPage() {
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [offset, setOffset] = useState(0)
	const [showFilters, setShowFilters] = useState(false)
	const [categories, setCategories] = useState<
		Array<{ id: string; name: string }>
	>([])
	const [tags, setTags] = useState<Array<{ id: string; name: string }>>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [sortBy, setSortBy] = useState('newest')
	const [showSortDropdown, setShowSortDropdown] = useState(false)
	const LIMIT = 10

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { window.location.href = '/' }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		fetchProjects()
		fetchFiltersData()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = () => {
			if (showSortDropdown) {
				setShowSortDropdown(false)
			}
		}

		if (showSortDropdown) {
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	}, [showSortDropdown])

	const fetchFiltersData = async () => {
		try {
			const [categoriesRes, tagsRes] = await Promise.all([
				fetch('/api/radar/categories'),
				fetch('/api/radar/tags'),
			])

			if (categoriesRes.ok) {
				const categoriesData = await categoriesRes.json()
				setCategories(categoriesData)
			}

			if (tagsRes.ok) {
				const tagsData = await tagsRes.json()
				setTags(tagsData)
			}
		} catch (error) {
			console.error('Error fetching filters:', error)
		}
	}

	const fetchProjects = async (loadMore = false) => {
		try {
			if (loadMore) {
				setLoadingMore(true)
			} else {
				setLoading(true)
				setOffset(0)
			}

			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id

			if (!userId) {
				console.error('[Radar] No userId available')
				setProjects([])
				setLoading(false)
				setLoadingMore(false)
				return
			}

			const currentOffset = loadMore ? offset : 0

			const response = await fetch(
				`/api/radar/projects?limit=${LIMIT}&offset=${currentOffset}`,
				{
					headers: {
						'x-telegram-user-id': userId.toString(),
					},
				},
			)

			if (response.ok) {
				let data = await response.json()

				console.log('[Radar] Fetched projects:', data.length)
				console.log('[Radar] First project:', data[0])

				// Применяем фильтры на клиенте
				let filtered = [...data]

				// Фильтр по категориям
				if (selectedCategories.length > 0) {
					filtered = filtered.filter(project =>
						project.categories.some((cat: any) =>
							selectedCategories.includes(cat.category.id),
						),
					)
				}

				// Фильтр по тегам
				if (selectedTags.length > 0) {
					filtered = filtered.filter(project =>
						project.tags.some((tag: any) => selectedTags.includes(tag.tag.id)),
					)
				}

				// Сортировка
				if (sortBy === 'popular') {
					filtered.sort((a, b) => b.teamMemberCount - a.teamMemberCount)
				} else if (sortBy === 'fires') {
					filtered.sort((a, b) => b.fireCount - a.fireCount)
				}

				if (loadMore) {
					setProjects(prev => [...prev, ...filtered])
				} else {
					setProjects(filtered)
				}

				setHasMore(data.length === LIMIT)
				setOffset(currentOffset + LIMIT)
			} else {
				setProjects([])
				setHasMore(false)
			}
		} catch (error) {
			console.error('Error fetching projects:', error)
			setProjects([])
			setHasMore(false)
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}

	const handleFire = async (projectId: string) => {
		const tg = (window as any).Telegram?.WebApp
		const userId = tg?.initDataUnsafe?.user?.id

		if (!userId) {
			console.error('[Radar] No userId for fire toggle')
			return
		}

		// Находим текущий проект
		const currentProject = projects.find(p => p.id === projectId)
		if (!currentProject) return

		const wasActive = currentProject.hasFired
		const originalCount = currentProject.fireCount

		// Оптимистичное обновление UI
		setProjects(prev =>
			prev.map(p => {
				if (p.id === projectId) {
					const newHasFired = !p.hasFired
					return {
						...p,
						hasFired: newHasFired,
						fireCount: newHasFired ? p.fireCount + 1 : p.fireCount - 1,
					}
				}
				return p
			}),
		)

		try {
			const response = await fetch(`/api/radar/projects/${projectId}/fire`, {
				method: 'POST',
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				console.log('[Radar] Fire toggle response:', data)
				// Обновляем состояние на основе ответа сервера
				setProjects(prev =>
					prev.map(p => {
						if (p.id === projectId) {
							return {
								...p,
								hasFired: data.hasFired,
								fireCount: data.hasFired
									? originalCount + 1
									: originalCount - 1,
							}
						}
						return p
					}),
				)
			} else {
				console.error('Failed to toggle fire')
				// Откатываем изменения при ошибке
				setProjects(prev =>
					prev.map(p => {
						if (p.id === projectId) {
							return {
								...p,
								hasFired: wasActive,
								fireCount: originalCount,
							}
						}
						return p
					}),
				)
			}
		} catch (error) {
			console.error('Error toggling fire:', error)
			// Откатываем изменения при ошибке
			setProjects(prev =>
				prev.map(p => {
					if (p.id === projectId) {
						return {
							...p,
							hasFired: wasActive,
							fireCount: originalCount,
						}
					}
					return p
				}),
			)
		}
	}

	const handleFavoriteToggle = async (
		projectId: string,
		isFavorite: boolean,
	) => {
		const tg = (window as any).Telegram?.WebApp
		const userId = tg?.initDataUnsafe?.user?.id

		if (!userId) {
			console.error('[Radar] No userId for favorite toggle')
			return
		}

		try {
			const response = await fetch(`/api/radar/favorites/${projectId}`, {
				method: isFavorite ? 'POST' : 'DELETE',
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (!response.ok) {
				console.error('Failed to toggle favorite')
			}
		} catch (error) {
			console.error('Error toggling favorite:', error)
		}
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#1E1B1A',
				paddingBottom: '100px',
			}}
		>
			<RadarHeader />
			<div style={{ padding: '20px' }}>
				{/* Header with title and filters button */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '24px',
					}}
				>
					<h1
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontWeight: 900,
							fontSize: '24px',
							color: '#FCF9F7',
							margin: 0,
						}}
					>
						Лента стартапов
					</h1>

					<button
						onClick={() => setShowFilters(true)}
						style={{
							background: '#8CFF65',
							border: 'none',
							borderRadius: '20px',
							padding: '8px 16px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							fontWeight: 600,
							color: '#1E1B1A',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							height: '35px',
							minWidth: '109px',
						}}
					>
						<svg
							width='17'
							height='17'
							viewBox='0 0 17 17'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M15.75 8.24957H5.73243M2.19649 8.24957H0.75M2.19649 8.24957C2.19649 7.75611 2.38271 7.28286 2.7142 6.93393C3.04568 6.585 3.49527 6.38898 3.96405 6.38898C4.43284 6.38898 4.88243 6.585 5.21391 6.93393C5.5454 7.28286 5.73162 7.75611 5.73162 8.24957C5.73162 8.74303 5.5454 9.21628 5.21391 9.56521C4.88243 9.91414 4.43284 10.1102 3.96405 10.1102C3.49527 10.1102 3.04568 9.91414 2.7142 9.56521C2.38271 9.21628 2.19649 8.74303 2.19649 8.24957ZM15.75 13.8885H11.0895M11.0895 13.8885C11.0895 14.3821 10.9028 14.8559 10.5712 15.2049C10.2397 15.5539 9.78998 15.75 9.32108 15.75C8.85229 15.75 8.40271 15.5531 8.07122 15.2042C7.73974 14.8553 7.55351 14.382 7.55351 13.8885M11.0895 13.8885C11.0895 13.395 10.9028 12.922 10.5712 12.573C10.2397 12.224 9.78998 12.028 9.32108 12.028C8.85229 12.028 8.40271 12.224 8.07122 12.5729C7.73974 12.9218 7.55351 13.3951 7.55351 13.8885M7.55351 13.8885H0.75M15.75 2.6106H13.2324M9.69649 2.6106H0.75M9.69649 2.6106C9.69649 2.11714 9.88271 1.64389 10.2142 1.29496C10.5457 0.946027 10.9953 0.75 11.4641 0.75C11.6962 0.75 11.926 0.798126 12.1405 0.89163C12.3549 0.985133 12.5498 1.12218 12.7139 1.29496C12.878 1.46773 13.0082 1.67284 13.0971 1.89858C13.1859 2.12432 13.2316 2.36626 13.2316 2.6106C13.2316 2.85493 13.1859 3.09688 13.0971 3.32262C13.0082 3.54836 12.878 3.75347 12.7139 3.92624C12.5498 4.09901 12.3549 4.23606 12.1405 4.32957C11.926 4.42307 11.6962 4.47119 11.4641 4.47119C10.9953 4.47119 10.5457 4.27517 10.2142 3.92624C9.88271 3.57731 9.69649 3.10406 9.69649 2.6106Z'
								stroke='#1D1D1B'
								strokeWidth='1.5'
								strokeMiterlimit='10'
								strokeLinecap='round'
							/>
						</svg>
						Фильтры
					</button>
				</div>

				{loading ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							padding: '60px 20px',
						}}
					>
						<div
							style={{
								width: '40px',
								height: '40px',
								border: '3px solid rgba(140, 255, 101, 0.2)',
								borderTop: '3px solid #8CFF65',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite',
							}}
						/>
					</div>
				) : projects.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '60px 20px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								fontWeight: 600,
								color: '#FCF9F7',
								marginBottom: '8px',
							}}
						>
							Пока нет проектов
						</p>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: '#FCF9F7',
								opacity: 0.6,
							}}
						>
							Создайте первый проект и найдите команду!
						</p>
					</div>
				) : (
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
					>
						{projects.map(project => (
							<ProjectCard
								key={project.id}
								project={project}
								onFireToggle={handleFire}
								showFavoriteButton={false}
							/>
						))}
					</div>
				)}

				{/* Кнопка "Загрузить еще" */}
				{!loading && projects.length > 0 && hasMore && (
					<div style={{ marginTop: '20px', textAlign: 'center' }}>
						<button
							onClick={() => fetchProjects(true)}
							disabled={loadingMore}
							style={{
								padding: '14px 32px',
								background: loadingMore
									? '#3A3735'
									: 'linear-gradient(135deg, #8CFF65 0%, #E3F040 100%)',
								border: 'none',
								borderRadius: '24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								fontWeight: 600,
								color: '#1E1B1A',
								cursor: loadingMore ? 'not-allowed' : 'pointer',
								opacity: loadingMore ? 0.7 : 1,
							}}
						>
							{loadingMore ? 'Загрузка...' : 'Загрузить еще'}
						</button>
					</div>
				)}
			</div>
			<RadarBottomNav />

			{/* Filters Modal */}
			{showFilters && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(10px)',
						zIndex: 9999,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'flex-end',
					}}
					onClick={() => setShowFilters(false)}
				>
					<div
						onClick={e => e.stopPropagation()}
						style={{
							width: '100%',
							maxHeight: '90vh',
							backgroundColor: '#2A2725',
							borderTopLeftRadius: '30px',
							borderTopRightRadius: '30px',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						{/* Scrollable Content */}
						<div
							style={{
								flex: 1,
								overflowY: 'auto',
								padding: '24px',
								paddingBottom: '100px',
							}}
						>
							{/* Header */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: '24px',
								}}
							>
								<h2
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontWeight: 900,
										fontSize: '24px',
										color: '#FCF9F7',
										margin: 0,
									}}
								>
									Фильтры
								</h2>
								<button
									onClick={() => setShowFilters(false)}
									style={{
										background: 'rgba(252, 249, 247, 0.1)',
										border: 'none',
										borderRadius: '50%',
										width: '40px',
										height: '40px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
									}}
								>
									<svg
										width='20'
										height='20'
										viewBox='0 0 20 20'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M15 5L5 15M5 5L15 15'
											stroke='#FCF9F7'
											strokeWidth='2'
											strokeLinecap='round'
										/>
									</svg>
								</button>
							</div>

							{/* Sort */}
							<div style={{ marginBottom: '24px', position: 'relative' }}>
								<label
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										display: 'block',
										marginBottom: '12px',
									}}
								>
									Сортировать
								</label>
								<button
									onClick={e => {
										e.stopPropagation()
										setShowSortDropdown(!showSortDropdown)
									}}
									style={{
										width: '100%',
										padding: '14px',
										backgroundColor: '#3A3735',
										border: 'none',
										borderRadius: '12px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										cursor: 'pointer',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<span>
										{sortBy === 'newest'
											? 'Сначала новые'
											: sortBy === 'popular'
												? 'Популярные'
												: 'По огонькам'}
									</span>
									<svg
										width='12'
										height='8'
										viewBox='0 0 12 8'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
										style={{
											transform: showSortDropdown
												? 'rotate(180deg)'
												: 'rotate(0deg)',
											transition: 'transform 0.2s',
										}}
									>
										<path
											d='M1 1L6 6L11 1'
											stroke='#FCF9F7'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										/>
									</svg>
								</button>

								{showSortDropdown && (
									<div
										style={{
											position: 'absolute',
											top: '100%',
											left: 0,
											right: 0,
											marginTop: '8px',
											backgroundColor: '#3A3735',
											borderRadius: '12px',
											overflow: 'hidden',
											zIndex: 10,
											boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
										}}
									>
										{[
											{ value: 'newest', label: 'Сначала новые' },
											{ value: 'popular', label: 'Популярные' },
											{ value: 'fires', label: 'По огонькам' },
										].map(option => (
											<button
												key={option.value}
												onClick={() => {
													setSortBy(option.value)
													setShowSortDropdown(false)
												}}
												style={{
													width: '100%',
													padding: '14px',
													backgroundColor:
														sortBy === option.value
															? 'rgba(140, 255, 101, 0.15)'
															: 'transparent',
													border: 'none',
													borderBottom:
														option.value !== 'fires'
															? '1px solid rgba(252, 249, 247, 0.1)'
															: 'none',
													fontFamily: 'LT Superior, sans-serif',
													fontSize: '16px',
													color:
														sortBy === option.value ? '#8CFF65' : '#FCF9F7',
													cursor: 'pointer',
													textAlign: 'left',
													transition: 'all 0.2s',
												}}
												onMouseEnter={e => {
													if (sortBy !== option.value) {
														e.currentTarget.style.backgroundColor =
															'rgba(252, 249, 247, 0.05)'
													}
												}}
												onMouseLeave={e => {
													if (sortBy !== option.value) {
														e.currentTarget.style.backgroundColor =
															'transparent'
													}
												}}
											>
												{option.label}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Categories */}
							<div style={{ marginBottom: '24px' }}>
								<label
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										display: 'block',
										marginBottom: '12px',
									}}
								>
									Категория
								</label>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
									{categories.map(category => (
										<button
											key={category.id}
											onClick={() => {
												setSelectedCategories(prev =>
													prev.includes(category.id)
														? prev.filter(id => id !== category.id)
														: [...prev, category.id],
												)
											}}
											style={{
												padding: '10px 18px',
												backgroundColor: selectedCategories.includes(
													category.id,
												)
													? '#8CFF65'
													: '#3A3735',
												border: 'none',
												borderRadius: '20px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												fontWeight: 600,
												color: selectedCategories.includes(category.id)
													? '#1E1B1A'
													: '#FCF9F7',
												cursor: 'pointer',
											}}
										>
											{category.name}
										</button>
									))}
									<button
										style={{
											padding: '10px 18px',
											backgroundColor: 'transparent',
											border: '1px dashed rgba(252, 249, 247, 0.3)',
											borderRadius: '20px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: '4px',
										}}
									>
										+ Добавить
									</button>
								</div>
							</div>

							{/* Tags */}
							<div style={{ marginBottom: '24px' }}>
								<label
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										display: 'block',
										marginBottom: '12px',
									}}
								>
									Задачи
								</label>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
									{tags.map(tag => (
										<button
											key={tag.id}
											onClick={() => {
												setSelectedTags(prev =>
													prev.includes(tag.id)
														? prev.filter(id => id !== tag.id)
														: [...prev, tag.id],
												)
											}}
											style={{
												padding: '10px 18px',
												backgroundColor: selectedTags.includes(tag.id)
													? '#8CFF65'
													: '#3A3735',
												border: 'none',
												borderRadius: '20px',
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												fontWeight: 600,
												color: selectedTags.includes(tag.id)
													? '#1E1B1A'
													: '#FCF9F7',
												cursor: 'pointer',
											}}
										>
											{tag.name}
										</button>
									))}
									<button
										style={{
											padding: '10px 18px',
											backgroundColor: 'transparent',
											border: '1px dashed rgba(252, 249, 247, 0.3)',
											borderRadius: '20px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											gap: '4px',
										}}
									>
										+ Добавить
									</button>
								</div>
							</div>

							{/* Project Stage */}
							<div style={{ marginBottom: '32px' }}>
								<label
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										display: 'block',
										marginBottom: '12px',
									}}
								>
									Проекты...
								</label>
								<div style={{ display: 'flex', gap: '8px' }}>
									<button
										style={{
											padding: '10px 18px',
											backgroundColor: '#8CFF65',
											border: 'none',
											borderRadius: '20px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											fontWeight: 600,
											color: '#1E1B1A',
											cursor: 'pointer',
										}}
									>
										Стартапы
									</button>
									<button
										style={{
											padding: '10px 18px',
											backgroundColor: '#3A3735',
											border: 'none',
											borderRadius: '20px',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											fontWeight: 600,
											color: '#FCF9F7',
											cursor: 'pointer',
										}}
									>
										Устоявшиеся
									</button>
								</div>
							</div>
						</div>

						{/* Fixed Apply Button */}
						<div
							style={{
								position: 'sticky',
								bottom: 0,
								left: 0,
								right: 0,
								padding: '16px 24px 24px',
								backgroundColor: '#2A2725',
								borderTop: '1px solid rgba(252, 249, 247, 0.1)',
							}}
						>
							<button
								onClick={() => {
									setShowFilters(false)
									setLoading(true)
									fetchProjects()
								}}
								style={{
									width: '100%',
									padding: '16px',
									background:
										'linear-gradient(135deg, #8CFF65 0%, #E3F040 100%)',
									border: 'none',
									borderRadius: '24px',
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									fontWeight: 600,
									color: '#1E1B1A',
									cursor: 'pointer',
								}}
							>
								Применить фильтры
							</button>
						</div>
					</div>
				</div>
			)}

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
		</div>
	)
}

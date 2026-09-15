'use client'

import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import ProjectCard from '@/components/radar/ProjectCard'
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

export default function FavoritesPage() {
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [showFilters, setShowFilters] = useState(false)
	const [categories, setCategories] = useState<
		Array<{ id: string; name: string }>
	>([])
	const [tags, setTags] = useState<Array<{ id: string; name: string }>>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { window.location.href = '/radar' }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		fetchFavoriteProjects()
		fetchFiltersData()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

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

	const fetchFavoriteProjects = async () => {
		try {
			setLoading(true)
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			const response = await fetch('/api/radar/favorites', {
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				setProjects(data)
			}
		} catch (error) {
			console.error('Error fetching favorite projects:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleFavoriteToggle = async (
		projectId: string,
		isFavorite: boolean,
	) => {
		const tg = (window as any).Telegram?.WebApp
		const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

		try {
			// Если убираем из избранного, сразу удаляем из списка
			if (!isFavorite) {
				setProjects(projects.filter(p => p.id !== projectId))
			}

			const response = await fetch(`/api/radar/favorites/${projectId}`, {
				method: isFavorite ? 'POST' : 'DELETE',
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (!response.ok) {
				console.error('Failed to toggle favorite')
				// Если ошибка, возвращаем карточку обратно
				if (!isFavorite) {
					fetchFavoriteProjects()
				}
			}
		} catch (error) {
			console.error('Error toggling favorite:', error)
			// Если ошибка, возвращаем карточку обратно
			if (!isFavorite) {
				fetchFavoriteProjects()
			}
		}
	}

	const applyFilters = () => {
		// TODO: Implement filtering logic
		setShowFilters(false)
	}

	const resetFilters = () => {
		setSelectedCategories([])
		setSelectedTags([])
	}

	if (loading) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#1E1B1A',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
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
		)
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

			<div style={{ padding: '0 20px' }}>
				{/* Title and Filters */}
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
							fontSize: '32px',
							color: '#FCF9F7',
							margin: 0,
						}}
					>
						Избранное
					</h1>

					<button
						onClick={() => setShowFilters(true)}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							padding: '12px 20px',
							backgroundColor: '#8CFF65',
							borderRadius: '24px',
							border: 'none',
							cursor: 'pointer',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							fontWeight: 600,
							color: '#1E1B1A',
						}}
					>
						<svg
							width='18'
							height='12'
							viewBox='0 0 18 12'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M0 1C0 0.447715 0.447715 0 1 0H17C17.5523 0 18 0.447715 18 1C18 1.55228 17.5523 2 17 2H1C0.447715 2 0 1.55228 0 1ZM3 6C3 5.44772 3.44772 5 4 5H14C14.5523 5 15 5.44772 15 6C15 6.55228 14.5523 7 14 7H4C3.44772 7 3 6.55228 3 6ZM7 11C6.44772 11 6 10.5523 6 10C6 9.44772 6.44772 9 7 9H11C11.5523 9 12 9.44772 12 10C12 10.5523 11.5523 11 11 11H7Z'
								fill='#1E1B1A'
							/>
						</svg>
						Фильтры
					</button>
				</div>

				{/* Projects List */}
				{projects.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '60px 20px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.6)',
							}}
						>
							У вас пока нет избранных проектов
						</p>
					</div>
				) : (
					<div>
						{projects.map(project => (
							<ProjectCard
								key={project.id}
								project={project}
								onFavoriteToggle={handleFavoriteToggle}
								isFavorite={true}
								showFavoriteButton={true}
							/>
						))}
					</div>
				)}
			</div>

			{/* Filters Modal */}
			{showFilters && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						zIndex: 1000,
						display: 'flex',
						flexDirection: 'column',
					}}
					onClick={() => setShowFilters(false)}
				>
					<div
						onClick={e => e.stopPropagation()}
						style={{
							backgroundColor: '#1E1B1A',
							borderRadius: '28px 28px 0 0',
							marginTop: 'auto',
							maxHeight: '80vh',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						{/* Scrollable Content */}
						<div
							style={{
								flex: 1,
								overflowY: 'auto',
								padding: '24px 20px 100px 20px',
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
									onClick={resetFilters}
									style={{
										background: 'none',
										border: 'none',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										color: '#8CFF65',
										cursor: 'pointer',
									}}
								>
									Сбросить
								</button>
							</div>

							{/* Categories */}
							<div style={{ marginBottom: '24px' }}>
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										marginBottom: '12px',
									}}
								>
									Категории
								</h3>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
									{categories.map(category => (
										<button
											key={category.id}
											onClick={() => {
												if (selectedCategories.includes(category.id)) {
													setSelectedCategories(
														selectedCategories.filter(id => id !== category.id),
													)
												} else {
													setSelectedCategories([
														...selectedCategories,
														category.id,
													])
												}
											}}
											style={{
												padding: '10px 18px',
												backgroundColor: selectedCategories.includes(
													category.id,
												)
													? '#8CFF65'
													: '#2A2725',
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
								</div>
							</div>

							{/* Tags */}
							<div style={{ marginBottom: '24px' }}>
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										marginBottom: '12px',
									}}
								>
									Задачи
								</h3>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
									{tags.map(tag => (
										<button
											key={tag.id}
											onClick={() => {
												if (selectedTags.includes(tag.id)) {
													setSelectedTags(
														selectedTags.filter(id => id !== tag.id),
													)
												} else {
													setSelectedTags([...selectedTags, tag.id])
												}
											}}
											style={{
												padding: '10px 18px',
												backgroundColor: selectedTags.includes(tag.id)
													? '#8CFF65'
													: '#2A2725',
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
								</div>
							</div>
						</div>

						{/* Apply Button - Fixed at bottom */}
						<div
							style={{
								position: 'absolute',
								bottom: 0,
								left: 0,
								right: 0,
								padding: '16px 20px',
								backgroundColor: '#1E1B1A',
								borderTop: '1px solid #3A3735',
							}}
						>
							<button
								onClick={applyFilters}
								style={{
									width: '100%',
									padding: '16px',
									backgroundColor: '#8CFF65',
									border: 'none',
									borderRadius: '28px',
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

			<RadarBottomNav />

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

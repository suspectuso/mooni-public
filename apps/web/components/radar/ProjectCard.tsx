'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'

// Вынесли стили наружу
const cardStyles = {
	display: 'block',
	backgroundColor: '#2A2725',
	borderRadius: '28px',
	padding: '20px',
	textDecoration: 'none',
	marginBottom: '16px',
}

const headerStyles = {
	display: 'flex',
	alignItems: 'flex-start',
	gap: '16px',
	marginBottom: '16px',
}

const avatarStyles = {
	width: '60px',
	height: '60px',
	borderRadius: '50%',
	backgroundColor: '#FCF9F7',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontFamily: 'LT Superior, sans-serif',
	fontSize: '20px',
	fontWeight: 700,
	color: '#1E1B1A',
	overflow: 'hidden',
	flexShrink: 0,
}

const nameContainerStyles = { flex: 1, minWidth: 0 }

const nameStyles = {
	fontFamily: 'Zen Kaku Gothic New, sans-serif',
	fontWeight: 900,
	fontSize: '18px',
	color: '#FCF9F7',
	marginBottom: '8px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap' as const,
}

const descriptionStyles = {
	fontFamily: 'LT Superior, sans-serif',
	fontSize: '14px',
	color: 'rgba(252, 249, 247, 0.6)',
	margin: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	display: '-webkit-box',
	WebkitLineClamp: 2,
	WebkitBoxOrient: 'vertical' as const,
}

const fireContainerStyles = {
	display: 'flex',
	flexDirection: 'column' as const,
	alignItems: 'center',
	gap: '4px',
}

const fireCountStyles = {
	fontFamily: 'LT Superior, sans-serif',
	fontSize: '12px',
	fontWeight: 500,
	color: '#FCF9F7',
}

const tagsContainerStyles = {
	display: 'flex',
	alignItems: 'flex-start',
	gap: '8px',
	marginBottom: '12px',
}

const tagsWrapperStyles = {
	flex: 1,
	display: 'flex',
	flexWrap: 'wrap' as const,
	gap: '8px',
	minWidth: 0,
}

const categoryBadgeStyles = {
	backgroundColor: '#8CFF65',
	borderRadius: '12px',
	padding: '6px 12px',
	fontFamily: 'LT Superior, sans-serif',
	fontSize: '12px',
	fontWeight: 600,
	color: '#1E1B1A',
	whiteSpace: 'nowrap' as const,
}

const tagBadgeStyles = {
	backgroundColor: '#525250',
	borderRadius: '12px',
	padding: '6px 12px',
	fontFamily: 'LT Superior, sans-serif',
	fontSize: '12px',
	fontWeight: 600,
	color: '#FCF9F7',
	whiteSpace: 'nowrap' as const,
}

const favoriteButtonStyles = {
	width: '32px',
	height: '32px',
	borderRadius: '50%',
	backgroundColor: 'rgba(227, 240, 64, 0.15)',
	border: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	flexShrink: 0,
	padding: 0,
}

interface Project {
	id: string
	name: string
	description: string
	avatarPath: string | null
	fireCount: number
	teamMemberCount: number
	hasFired: boolean
	categories: Array<{ category: { name: string } }>
	tags: Array<{ tag: { name: string } }>
}

interface ProjectCardProps {
	project: Project
	onFavoriteToggle?: (projectId: string, isFavorite: boolean) => void
	onFireToggle?: (projectId: string) => void
	isFavorite?: boolean
	showFavoriteButton?: boolean
}

const ProjectCard = memo(
	({
		project,
		onFavoriteToggle,
		onFireToggle,
		isFavorite = false,
		showFavoriteButton = false,
	}: ProjectCardProps) => {
		const [localFavorite, setLocalFavorite] = useState(isFavorite)
		const [localFireCount, setLocalFireCount] = useState(project.fireCount)
		const [localHasFired, setLocalHasFired] = useState(project.hasFired)

		// Обновляем локальное состояние при изменении пропсов
		useEffect(() => {
			setLocalHasFired(project.hasFired)
			setLocalFireCount(project.fireCount)
		}, [project.hasFired, project.fireCount])

		const handleFavoriteClick = useCallback(
			(e: React.MouseEvent) => {
				e.preventDefault()
				e.stopPropagation()
				const newFavoriteState = !localFavorite
				setLocalFavorite(newFavoriteState)
				if (onFavoriteToggle) {
					onFavoriteToggle(project.id, newFavoriteState)
				}
			},
			[localFavorite, onFavoriteToggle, project.id],
		)

		const handleFireClick = useCallback(
			(e: React.MouseEvent) => {
				e.preventDefault()
				e.stopPropagation()

				// Оптимистичное обновление UI
				const wasActive = localHasFired
				setLocalHasFired(!wasActive)
				setLocalFireCount(wasActive ? localFireCount - 1 : localFireCount + 1)

				if (onFireToggle) {
					onFireToggle(project.id)
				}
			},
			[localHasFired, localFireCount, onFireToggle, project.id],
		)

		const fireButtonStyles = useMemo(
			() => ({
				width: '36px',
				height: '36px',
				borderRadius: '50%',
				backgroundColor: localHasFired ? 'rgba(227, 240, 64, 0.15)' : '#484745',
				border: 'none',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
				padding: 0,
			}),
			[localHasFired],
		)

		const avatarContent = useMemo(() => {
			if (project.avatarPath) {
				return (
					<img
						src={project.avatarPath}
						alt={project.name}
						loading='lazy'
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				)
			}
			return project.name.substring(0, 2).toUpperCase()
		}, [project.avatarPath, project.name])

		return (
			<a href={`/radar/project/${project.id}`} style={cardStyles}>
				{/* Header with Avatar and Stats */}
				<div style={headerStyles}>
					{/* Avatar */}
					<div style={avatarStyles}>{avatarContent}</div>

					{/* Name and Description */}
					<div style={nameContainerStyles}>
						<h3 style={nameStyles}>{project.name}</h3>
						<p style={descriptionStyles}>{project.description}</p>
					</div>

					{/* Fire Count */}
					<div style={fireContainerStyles}>
						<button onClick={handleFireClick} style={fireButtonStyles}>
							<svg
								width='12'
								height='17'
								viewBox='0 0 16 23'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M8 23C12.4187 23 16 20.125 16 15.0938C16 12.9375 15.3333 9.34375 12.6667 6.46875C13 8.625 11 9.34375 11 9.34375C12 5.75 9.33333 0.71875 5.33333 0C5.80933 2.875 6 5.75 2.66667 8.625C1 10.0625 0 12.5479 0 15.0938C0 20.125 3.58133 23 8 23ZM8 21.5625C5.79067 21.5625 4 20.125 4 17.6094C4 16.5312 4.33333 14.7344 5.66667 13.2969C5.5 14.375 6.66667 15.0938 6.66667 15.0938C6.16667 13.2969 7.33333 10.4219 9.33333 10.0625C9.09467 11.5 9 12.9375 10.6667 14.375C11.5 15.0938 12 16.3357 12 17.6094C12 20.125 10.2093 21.5625 8 21.5625Z'
									fill={localHasFired ? '#E3F040' : '#FCF9F7'}
									fillOpacity={localHasFired ? '1' : '0.25'}
								/>
							</svg>
						</button>
						<span style={fireCountStyles}>{localFireCount}</span>
					</div>
				</div>

				{/* Categories and Tags with Favorite Button */}
				<div style={tagsContainerStyles}>
					{/* Categories and Tags Container */}
					<div style={tagsWrapperStyles}>
						{/* Categories */}
						{project.categories.slice(0, 2).map((cat, idx) => (
							<span key={idx} style={categoryBadgeStyles}>
								{cat.category.name}
							</span>
						))}

						{/* Tags */}
						{project.tags.slice(0, 3).map((tag, idx) => (
							<span key={idx} style={tagBadgeStyles}>
								{tag.tag.name}
							</span>
						))}
					</div>

					{/* Favorite Button - only show if showFavoriteButton is true */}
					{showFavoriteButton && (
						<button onClick={handleFavoriteClick} style={favoriteButtonStyles}>
							<svg
								width='12'
								height='17'
								viewBox='0 0 12 17'
								fill='#E3F040'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M11 0H1C0.447715 0 0 0.447716 0 1V15.5007C0 16.4033 1.10139 16.844 1.72401 16.1905L5.53829 12.187C5.93182 11.7739 6.5906 11.7733 6.98494 12.1856L10.2774 15.6276C10.9006 16.2792 12 15.8381 12 14.9364V1C12 0.447715 11.5523 0 11 0Z'
									fill='#E3F040'
								/>
							</svg>
						</button>
					)}
				</div>
			</a>
		)
	},
)

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard

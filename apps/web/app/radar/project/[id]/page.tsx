'use client'

import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Project {
	id: string
	name: string
	description: string
	avatarPath: string | null
	projectUrl: string | null
	stage: string
	needsInvestment: boolean
	investmentMin: number | null
	investmentMax: number | null
	investmentPurpose: string | null
	investorShare: number | null
	needsEmployees: boolean
	createdAt: string
	fireCount: number
	teamMemberCount: number
	hasFired: boolean
	photos: Array<{ photoPath: string }>
	categories: Array<{ category: { name: string } }>
	tags: Array<{ tag: { name: string } }>
	teamMembers: Array<{
		user: {
			id: string
			username: string
			firstName: string
			lastName: string
			avatarUrl: string | null
		}
	}>
	linkedVacancies: Array<{
		vacancy: {
			id: string
			position: string
		}
	}>
}

export default function ProjectDetailPage() {
	const params = useParams()
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)
	const [isFavorite, setIsFavorite] = useState(false)
	const [hasFired, setHasFired] = useState(false)
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { window.location.href = '/radar' }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		loadProject()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	const loadProject = async () => {
		try {
			const id = Array.isArray(params.id) ? params.id[0] : params.id
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id

			if (!userId) {
				console.error('[Project Detail] No userId available')
				setLoading(false)
				return
			}

			const response = await fetch(`/api/radar/projects/${id}`, {
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})
			if (response.ok) {
				const data = await response.json()
				setProject(data)
				setHasFired(data.hasFired || false)

				// Check if project is in favorites
				const favoritesResponse = await fetch(
					`/api/radar/favorites?userId=${userId}`,
				)
				if (favoritesResponse.ok) {
					const favorites = await favoritesResponse.json()
					const isInFavorites = favorites.some((fav: any) => fav.id === data.id)
					setIsFavorite(isInFavorites)
				}
			}
		} catch (error) {
			console.error('Error loading project:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleFire = async () => {
		if (!project) return

		const tg = (window as any).Telegram?.WebApp
		const userId = tg?.initDataUnsafe?.user?.id

		if (!userId) {
			console.error('[Project Detail] No userId for fire toggle')
			return
		}

		if (tg) tg.HapticFeedback.impactOccurred('light')

		const wasActive = hasFired
		const originalCount = project.fireCount

		try {
			// Оптимистичное обновление UI
			setHasFired(!wasActive)
			setProject({
				...project,
				fireCount: wasActive ? project.fireCount - 1 : project.fireCount + 1,
				hasFired: !wasActive,
			})

			const response = await fetch(`/api/radar/projects/${project.id}/fire`, {
				method: 'POST',
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				console.log('[Project Detail] Fire toggle response:', data)
				// Обновляем на основе ответа сервера
				setHasFired(data.hasFired)
				setProject({
					...project,
					fireCount: data.hasFired ? originalCount + 1 : originalCount - 1,
					hasFired: data.hasFired,
				})
			} else {
				// Откатываем изменения при ошибке
				setHasFired(wasActive)
				setProject({
					...project,
					fireCount: originalCount,
					hasFired: wasActive,
				})
			}
		} catch (error) {
			console.error('Error toggling fire:', error)
			// Откатываем изменения при ошибке
			setHasFired(wasActive)
			setProject({
				...project,
				fireCount: originalCount,
				hasFired: wasActive,
			})
		}
	}

	const handleShare = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')

			// Формируем ссылку на бота с startapp параметром
			const botUsername = 'Match_MSD_bot' // Замените на имя вашего бота
			const startParam = `radar_${project?.id}`
			const shareUrl = `https://t.me/${botUsername}?startapp=${startParam}`
			const shareText = `Посмотри проект "${project?.name}" в МЭТЧ РАДАР\n\nНаше сообщество: @Match_MSD`

			// Открываем интерфейс Telegram для шаринга
			tg.openTelegramLink(
				`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
			)
		}
	}

	const toggleFavorite = async () => {
		if (!project) return

		const tg = (window as any).Telegram?.WebApp
		const userId = tg?.initDataUnsafe?.user?.id

		if (!userId) {
			console.error('[Project Detail] No userId for favorite toggle')
			return
		}

		if (tg) {
			tg.HapticFeedback.impactOccurred('light')
		}

		const newFavoriteState = !isFavorite
		const previousState = isFavorite
		setIsFavorite(newFavoriteState)

		try {
			const response = await fetch(`/api/radar/favorites/${project.id}`, {
				method: newFavoriteState ? 'POST' : 'DELETE',
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (!response.ok) {
				const errorData = await response.json()
				console.error('Failed to toggle favorite:', errorData)
				// Откатываем изменения при ошибке
				setIsFavorite(previousState)
			} else {
				console.log('Favorite toggled successfully')
			}
		} catch (error) {
			// Откатываем изменения при ошибке
			setIsFavorite(previousState)
			console.error('Error toggling favorite:', error)
		}
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

	if (!project) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#1E1B1A',
					padding: '20px',
				}}
			>
				<RadarHeader />
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						textAlign: 'center',
						marginTop: '40px',
					}}
				>
					Проект не найден
				</p>
			</div>
		)
	}

	const truncatedDescription =
		project.description.length > 500
			? project.description.substring(0, 500) + '...'
			: project.description

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
				{/* Аватар */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '20px',
					}}
				>
					<div
						style={{
							width: '225px',
							height: '225px',
							borderRadius: '50%',
							backgroundColor: '#FCF9F7',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '72px',
							fontWeight: 700,
							color: '#1E1B1A',
							overflow: 'hidden',
						}}
					>
						{project.avatarPath ? (
							<img
								src={project.avatarPath}
								alt={project.name}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						) : (
							project.name.substring(0, 2).toUpperCase()
						)}
					</div>
				</div>

				{/* Название и бейдж */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '12px',
						marginBottom: '12px',
					}}
				>
					<h1
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontWeight: 900,
							fontSize: '24px',
							color: '#FCF9F7',
							textAlign: 'center',
							margin: 0,
						}}
					>
						{project.name}
					</h1>
					{project.stage && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								padding: '4px 12px',
								height: '27px',
								borderRadius: '14px',
								backgroundColor:
									project.stage === 'Идея' ||
									project.stage === 'MVP' ||
									project.stage === 'Рост'
										? 'rgba(140, 255, 101, 0.45)'
										: 'rgba(227, 240, 64, 0.45)',
							}}
						>
							{project.stage === 'Идея' ||
							project.stage === 'MVP' ||
							project.stage === 'Рост' ? (
								<svg
									width='13'
									height='13'
									viewBox='0 0 13 13'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M11.8465 0.423767C11.8465 0.311377 11.8009 0.20359 11.7198 0.124119C11.6386 0.0446467 11.5286 0 11.4139 0C11.2992 0 11.1891 0.0446467 11.108 0.124119C11.0269 0.20359 10.9813 0.311377 10.9813 0.423767V1.13005H10.2604C10.1456 1.13005 10.0356 1.17469 9.95448 1.25417C9.87335 1.33364 9.82778 1.44142 9.82778 1.55381C9.82778 1.6662 9.87335 1.77399 9.95448 1.85346C10.0356 1.93293 10.1456 1.97758 10.2604 1.97758H10.9813V2.68386C10.9813 2.79625 11.0269 2.90404 11.108 2.98351C11.1891 3.06298 11.2992 3.10763 11.4139 3.10763C11.5286 3.10763 11.6386 3.06298 11.7198 2.98351C11.8009 2.90404 11.8465 2.79625 11.8465 2.68386V1.97758H12.5674C12.6822 1.97758 12.7922 1.93293 12.8733 1.85346C12.9544 1.77399 13 1.6662 13 1.55381C13 1.44142 12.9544 1.33364 12.8733 1.25417C12.7922 1.17469 12.6822 1.13005 12.5674 1.13005H11.8465V0.423767ZM3.33914 1.41256C3.45387 1.41256 3.56389 1.4572 3.64502 1.53668C3.72614 1.61615 3.77172 1.72394 3.77172 1.83633V2.5426H4.49268C4.6074 2.5426 4.71743 2.58725 4.79855 2.66672C4.87968 2.74619 4.92525 2.85398 4.92525 2.96637C4.92525 3.07876 4.87968 3.18655 4.79855 3.26602C4.71743 3.34549 4.6074 3.39014 4.49268 3.39014H3.77172V4.09642C3.77172 4.20881 3.72614 4.3166 3.64502 4.39607C3.56389 4.47554 3.45387 4.52019 3.33914 4.52019C3.22441 4.52019 3.11439 4.47554 3.03326 4.39607C2.95214 4.3166 2.90656 4.20881 2.90656 4.09642V3.39014H2.18561C2.07088 3.39014 1.96085 3.34549 1.87973 3.26602C1.7986 3.18655 1.75303 3.07876 1.75303 2.96637C1.75303 2.85398 1.7986 2.74619 1.87973 2.66672C1.96085 2.58725 2.07088 2.5426 2.18561 2.5426H2.90656V1.83633C2.90656 1.72394 2.95214 1.61615 3.03326 1.53668C3.11439 1.4572 3.22441 1.41256 3.33914 1.41256ZM10.2604 7.91033C10.3751 7.91033 10.4851 7.95497 10.5662 8.03444C10.6474 8.11392 10.6929 8.2217 10.6929 8.33409V9.04037H11.4139C11.5286 9.04037 11.6386 9.08502 11.7198 9.16449C11.8009 9.24396 11.8465 9.35175 11.8465 9.46414C11.8465 9.57653 11.8009 9.68432 11.7198 9.76379C11.6386 9.84326 11.5286 9.88791 11.4139 9.88791H10.6929V10.5942C10.6929 10.7066 10.6474 10.8144 10.5662 10.8938C10.4851 10.9733 10.3751 11.018 10.2604 11.018C10.1456 11.018 10.0356 10.9733 9.95448 10.8938C9.87335 10.8144 9.82778 10.7066 9.82778 10.5942V9.88791H9.10682C8.99209 9.88791 8.88206 9.84326 8.80094 9.76379C8.71982 9.68432 8.67424 9.57653 8.67424 9.46414C8.67424 9.35175 8.71982 9.24396 8.80094 9.16449C8.88206 9.08502 8.99209 9.04037 9.10682 9.04037H9.82778V8.33409C9.82778 8.2217 9.87335 8.11392 9.95448 8.03444C10.0356 7.95497 10.1456 7.91033 10.2604 7.91033ZM10.1934 3.66022C10.0687 3.44107 9.89373 3.25322 9.68239 3.11141C9.47106 2.9696 9.22906 2.87768 8.97537 2.84287C8.72169 2.80805 8.46322 2.83129 8.22024 2.91075C7.97727 2.99021 7.75638 3.12374 7.57492 3.30087L7.08582 3.77775L9.43154 6.07513L9.91602 5.60051C10.1715 5.35075 10.3369 5.02613 10.3869 4.67595C10.437 4.32577 10.3691 3.96914 10.1934 3.66022ZM8.81901 6.67405L6.4733 4.3761L0.488177 10.2201C0.176199 10.5249 0.000596424 10.9387 1.51648e-06 11.3703C-0.000593391 11.8019 0.173868 12.2161 0.485005 12.5218C0.796143 12.8274 1.21847 12.9994 1.65908 13C2.09969 13.0006 2.52249 12.8297 2.83447 12.5249L8.81901 6.67405Z'
										fill='#8CFF65'
									/>
								</svg>
							) : (
								<svg
									width='14'
									height='12'
									viewBox='0 0 14 12'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M7.7 8.66667H6.3C5.915 8.66667 5.6 8.36667 5.6 8H0.707V10.6667C0.707 11.4 1.337 12 2.107 12H11.9C12.67 12 13.3 11.4 13.3 10.6667V8H8.4C8.4 8.36667 8.085 8.66667 7.7 8.66667ZM12.6 2.66667H9.8C9.8 1.19333 8.547 0 7 0C5.453 0 4.2 1.19333 4.2 2.66667H1.4C0.63 2.66667 0 3.26667 0 4V6C0 6.74 0.623 7.33333 1.4 7.33333H5.6V6.66667C5.6 6.3 5.915 6 6.3 6H7.7C8.085 6 8.4 6.3 8.4 6.66667V7.33333H12.6C13.37 7.33333 14 6.73333 14 6V4C14 3.26667 13.37 2.66667 12.6 2.66667ZM5.6 2.66667C5.6 1.93333 6.23 1.33333 7 1.33333C7.77 1.33333 8.4 1.93333 8.4 2.66667H5.593H5.6Z'
										fill='#E3F040'
									/>
								</svg>
							)}
							<span
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '14px',
									fontWeight: 600,
									color:
										project.stage === 'Идея' ||
										project.stage === 'MVP' ||
										project.stage === 'Рост'
											? '#8CFF65'
											: '#E3F040',
								}}
							>
								{project.stage === 'Идея' ||
								project.stage === 'MVP' ||
								project.stage === 'Рост'
									? 'Стартап'
									: 'Компания'}
							</span>
						</div>
					)}
				</div>

				{/* Краткое описание */}
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: 'rgba(252, 249, 247, 0.6)',
						textAlign: 'center',
						marginBottom: '20px',
					}}
				>
					{project.stage}
				</p>

				{/* Кнопки действий */}
				<div
					style={{
						display: 'flex',
						gap: '12px',
						justifyContent: 'center',
						marginBottom: '24px',
						alignItems: 'flex-start',
					}}
				>
					{/* Смотреть проект */}
					{project.projectUrl && (
						<a
							href={project.projectUrl}
							target='_blank'
							rel='noopener noreferrer'
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								padding: '16px 20px',
								height: '55px',
								backgroundColor: '#3A3735',
								borderRadius: '24px',
								textDecoration: 'none',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color: '#FCF9F7',
							}}
						>
							<svg
								width='20'
								height='16'
								viewBox='0 0 20 16'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M0.969302 8.368C2.0203 10.173 4.9823 14.37 9.7873 14.37C14.6003 14.37 17.5573 10.171 18.6073 8.368C18.7504 8.12291 18.8257 7.84416 18.8255 7.56036C18.8253 7.27656 18.7497 6.99792 18.6063 6.753C17.5563 4.949 14.5963 0.75 9.7873 0.75C4.9783 0.75 2.0193 4.947 0.969302 6.751C0.825695 6.99624 0.75 7.27531 0.75 7.5595C0.75 7.84369 0.825695 8.12276 0.969302 8.368Z'
									stroke='#FCF9F7'
									strokeWidth='1.5'
									strokeLinejoin='round'
								/>
								<path
									d='M9.78711 10.1855C10.4833 10.1855 11.151 9.90899 11.6433 9.4167C12.1355 8.92442 12.4121 8.25674 12.4121 7.56055C12.4121 6.86435 12.1355 6.19667 11.6433 5.70439C11.151 5.21211 10.4833 4.93555 9.78711 4.93555C9.09092 4.93555 8.42324 5.21211 7.93095 5.70439C7.43867 6.19667 7.16211 6.86435 7.16211 7.56055C7.16211 8.25674 7.43867 8.92442 7.93095 9.4167C8.42324 9.90899 9.09092 10.1855 9.78711 10.1855Z'
									stroke='#FCF9F7'
									strokeWidth='1.5'
									strokeLinejoin='round'
								/>
							</svg>
							Смотреть проект
						</a>
					)}

					{/* Огонек */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '4px',
						}}
					>
						<button
							onClick={handleFire}
							style={{
								width: '40px',
								height: '40px',
								borderRadius: '50%',
								backgroundColor: hasFired
									? 'rgba(227, 240, 64, 0.15)'
									: '#484745',
								border: 'none',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
						>
							<svg
								width='12'
								height='17'
								viewBox='0 0 16 23'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M8 23C12.4187 23 16 20.125 16 15.0938C16 12.9375 15.3333 9.34375 12.6667 6.46875C13 8.625 11 9.34375 11 9.34375C12 5.75 9.33333 0.71875 5.33333 0C5.80933 2.875 6 5.75 2.66667 8.625C1 10.0625 0 12.5479 0 15.0938C0 20.125 3.58133 23 8 23ZM8 21.5625C5.79067 21.5625 4 20.125 4 17.6094C4 16.5312 4.33333 14.7344 5.66667 13.2969C5.5 14.375 6.66667 15.0938 6.66667 15.0938C6.16667 13.2969 7.33333 10.4219 9.33333 10.0625C9.09467 11.5 9 12.9375 10.6667 14.375C11.5 15.0938 12 16.3357 12 17.6094C12 20.125 10.2093 21.5625 8 21.5625Z'
									fill={hasFired ? '#E3F040' : '#FCF9F7'}
									fillOpacity={hasFired ? '1' : '0.25'}
								/>
							</svg>
						</button>
						<span
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 500,
								color: '#FCF9F7',
							}}
						>
							{project.fireCount}
						</span>
					</div>

					{/* Избранное */}
					<button
						onClick={toggleFavorite}
						style={{
							width: '55px',
							height: '55px',
							backgroundColor: '#3A3735',
							borderRadius: '50%',
							border: 'none',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
					>
						<svg
							width='19'
							height='26'
							viewBox='0 0 19 26'
							fill={isFavorite ? '#E3F040' : 'none'}
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M16.75 0.75H1.75C1.19772 0.75 0.75 1.19772 0.75 1.75V24.2151C0.75 25.1225 1.86118 25.5608 2.48066 24.8979L8.89035 18.0383C9.28509 17.6159 9.95475 17.6152 10.3503 18.0369L16.0207 24.0812C16.6408 24.7423 17.75 24.3034 17.75 23.3971V1.75C17.75 1.19772 17.3023 0.75 16.75 0.75Z'
								fill={isFavorite ? '#E3F040' : 'none'}
								stroke={isFavorite ? '#E3F040' : '#6e6d6b'}
								strokeWidth='1.5'
							/>
						</svg>
					</button>

					{/* Поделиться */}
					<button
						onClick={handleShare}
						style={{
							width: '55px',
							height: '55px',
							backgroundColor: '#3A3735',
							borderRadius: '50%',
							border: 'none',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
					>
						<svg
							width='23'
							height='27'
							viewBox='0 0 23 27'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M14.75 5.61111L7.75 10.4722M14.75 20.8889L7.75 16.0278M7.75 13.25C7.75 14.1709 7.38125 15.0541 6.72487 15.7052C6.0685 16.3564 5.17826 16.7222 4.25 16.7222C3.32174 16.7222 2.4315 16.3564 1.77513 15.7052C1.11875 15.0541 0.75 14.1709 0.75 13.25C0.75 12.3291 1.11875 11.4459 1.77513 10.7948C2.4315 10.1436 3.32174 9.77778 4.25 9.77778C5.17826 9.77778 6.0685 10.1436 6.72487 10.7948C7.38125 11.4459 7.75 12.3291 7.75 13.25ZM21.75 22.2778C21.75 23.1987 21.3813 24.0818 20.7249 24.733C20.0685 25.3842 19.1783 25.75 18.25 25.75C17.3217 25.75 16.4315 25.3842 15.7751 24.733C15.1187 24.0818 14.75 23.1987 14.75 22.2778C14.75 21.3569 15.1187 20.4737 15.7751 19.8225C16.4315 19.1714 17.3217 18.8056 18.25 18.8056C19.1783 18.8056 20.0685 19.1714 20.7249 19.8225C21.3813 20.4737 21.75 21.3569 21.75 22.2778ZM21.75 4.22222C21.75 5.14311 21.3813 6.02629 20.7249 6.67745C20.0685 7.32862 19.1783 7.69444 18.25 7.69444C17.3217 7.69444 16.4315 7.32862 15.7751 6.67745C15.1187 6.02629 14.75 5.14311 14.75 4.22222C14.75 3.30133 15.1187 2.41816 15.7751 1.76699C16.4315 1.11582 17.3217 0.75 18.25 0.75C19.1783 0.75 20.0685 1.11582 20.7249 1.76699C21.3813 2.41816 21.75 3.30133 21.75 4.22222Z'
								stroke='#FCF9F7'
								strokeOpacity='0.25'
								strokeWidth='1.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
				</div>

				{/* Слайдер фото */}
				{project.photos && project.photos.length > 0 && (
					<div
						ref={scrollRef}
						style={{
							display: 'flex',
							gap: '12px',
							overflowX: 'auto',
							scrollSnapType: 'x mandatory',
							marginBottom: '24px',
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
							marginLeft: '-20px',
							marginRight: '-20px',
							paddingLeft: '20px',
							paddingRight: '20px',
						}}
					>
						{project.photos.map((photo, index) => (
							<div
								key={index}
								style={{
									minWidth: '270px',
									maxWidth: '270px',
									height: '480px',
									borderRadius: '20px',
									overflow: 'hidden',
									scrollSnapAlign: 'center',
									flexShrink: 0,
									position: 'relative',
								}}
							>
								<img
									src={photo.photoPath}
									alt={`Photo ${index + 1}`}
									style={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										objectPosition: 'center',
									}}
								/>
							</div>
						))}
					</div>
				)}

				{/* О проекте */}
				<div style={{ marginBottom: '24px' }}>
					<h2
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							marginBottom: '12px',
						}}
					>
						О проекте
					</h2>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: 'rgba(252, 249, 247, 0.8)',
							lineHeight: '1.6',
						}}
					>
						{truncatedDescription}
					</p>
				</div>

				{/* Основатели */}
				{project.teamMembers && project.teamMembers.length > 0 && (
					<div style={{ marginBottom: '24px' }}>
						<h2
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								fontWeight: 600,
								color: '#FCF9F7',
								marginBottom: '12px',
							}}
						>
							Основатели
						</h2>
						<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
							{project.teamMembers.map(member => (
								<div
									key={member.user.id}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										backgroundColor: '#3A3735',
										borderRadius: '28px',
										padding: '6px 12px 6px 6px',
									}}
								>
									<div
										style={{
											width: '32px',
											height: '32px',
											borderRadius: '50%',
											backgroundColor: '#FCF9F7',
											overflow: 'hidden',
											flexShrink: 0,
										}}
									>
										{member.user.avatarUrl ? (
											<img
												src={member.user.avatarUrl}
												alt={member.user.username}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										) : (
											<div
												style={{
													width: '100%',
													height: '100%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '12px',
													fontWeight: 600,
													color: '#1E1B1A',
												}}
											>
												{member.user.username
													? member.user.username.substring(0, 2).toUpperCase()
													: member.user.firstName
														? member.user.firstName
																.substring(0, 2)
																.toUpperCase()
														: 'US'}
											</div>
										)}
									</div>
									<span
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: '#FCF9F7',
										}}
									>
										{member.user.firstName && member.user.lastName
											? `${member.user.firstName} ${member.user.lastName}`
											: member.user.firstName || member.user.username || 'User'}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Инвестиции */}
				{project.needsInvestment && (
					<div style={{ marginBottom: '24px' }}>
						{/* Заголовок с иконкой */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								marginBottom: '16px',
							}}
						>
							<svg
								width='18'
								height='21'
								viewBox='0 0 18 21'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M16.2112 3.23986C14.9768 1.15096 13.2873 0 11.4545 0H6.54545C4.71273 0 3.02318 1.15096 1.78875 3.23986C0.635114 5.19144 0 7.77404 0 10.5C0 13.226 0.635114 15.8086 1.78875 17.7601C3.02318 19.849 4.71273 21 6.54545 21H11.4545C13.2873 21 14.9768 19.849 16.2112 17.7601C17.3649 15.8086 18 13.226 18 10.5C18 7.77404 17.3649 5.19144 16.2112 3.23986ZM16.3422 9.69231H13.0694C13.0055 8.03489 12.6712 6.3985 12.0794 4.84615H15.208C15.8339 6.19702 16.247 7.875 16.3422 9.69231ZM14.2353 3.23077H11.297C10.9554 2.64544 10.5433 2.10304 10.0698 1.61538H11.4545C12.4773 1.61538 13.4386 2.22115 14.2353 3.23077ZM1.63636 10.5C1.63636 5.68413 3.88636 1.61538 6.54545 1.61538C9.20455 1.61538 11.4545 5.68413 11.4545 10.5C11.4545 15.3159 9.20455 19.3846 6.54545 19.3846C3.88636 19.3846 1.63636 15.3159 1.63636 10.5ZM11.4545 19.3846H10.0728C10.5464 18.897 10.9585 18.3546 11.3001 17.7692H14.2384C13.4386 18.7788 12.4773 19.3846 11.4545 19.3846ZM15.208 16.1538H12.0805C12.6722 14.6015 13.0065 12.9651 13.0705 11.3077H16.3432C16.247 13.125 15.8339 14.803 15.208 16.1538Z'
									fill='#FCF9F7'
								/>
							</svg>
							<h2
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '18px',
									fontWeight: 600,
									color: '#FCF9F7',
									margin: 0,
								}}
							>
								Инвестиции
							</h2>
						</div>

						{/* Сумма инвестиций */}
						{(project.investmentMin || project.investmentMax) && (
							<div style={{ marginBottom: '16px' }}>
								<div
									style={{
										background: '#2e4128',
										borderRadius: '28px',
										padding: '20px 24px',
										display: 'inline-block',
									}}
								>
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '24px',
											fontWeight: 600,
											color: '#8fff6d',
											margin: 0,
										}}
									>
										{project.investmentMin && project.investmentMax
											? `${project.investmentMin.toLocaleString()}-${project.investmentMax.toLocaleString()}₽`
											: project.investmentMin
												? `от ${project.investmentMin.toLocaleString()}₽`
												: `до ${project.investmentMax?.toLocaleString()}₽`}
									</p>
								</div>
							</div>
						)}

						{/* Доля инвестора */}
						{project.investorShare && (
							<div style={{ marginBottom: '16px' }}>
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '18px',
										fontWeight: 600,
										color: '#FCF9F7',
										marginBottom: '12px',
									}}
								>
									% Доля инвестора
								</h3>
								<div
									style={{
										background: '#2e4128',
										borderRadius: '28px',
										padding: '20px 24px',
										display: 'inline-block',
									}}
								>
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '24px',
											fontWeight: 600,
											color: '#8fff6d',
											margin: 0,
										}}
									>
										{project.investorShare}%
									</p>
								</div>
							</div>
						)}

						{/* На что требуются инвестиции */}
						{project.investmentPurpose && (
							<div>
								<h3
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '18px',
										fontWeight: 600,
										color: '#FCF9F7',
										marginBottom: '12px',
									}}
								>
									На что требуются инвестиции
								</h3>
								<p
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
										lineHeight: '1.5',
										margin: 0,
									}}
								>
									- {project.investmentPurpose}
								</p>
							</div>
						)}
					</div>
				)}

				{/* Вакансии */}
				{project.linkedVacancies && project.linkedVacancies.length > 0 && (
					<div style={{ marginBottom: '24px' }}>
						{project.linkedVacancies.map(lv => (
							<a
								key={lv.vacancy.id}
								href={`/work/vacancies/${lv.vacancy.id}`}
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									backgroundColor: '#3E3E3C',
									borderRadius: '28px',
									padding: '16px 20px',
									textDecoration: 'none',
									cursor: 'pointer',
									transition: 'transform 0.2s',
									marginBottom: '12px',
								}}
								onMouseEnter={e => {
									e.currentTarget.style.transform = 'translateY(-2px)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.transform = 'translateY(0)'
								}}
							>
								<div>
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '14px',
											color: 'rgba(252, 249, 247, 0.6)',
											marginBottom: '8px',
										}}
									>
										Открытая вакансия
									</p>
									<p
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											fontWeight: 600,
											color: '#FCF9F7',
											margin: 0,
										}}
									>
										{lv.vacancy.position}
									</p>
								</div>
								<img
									src='/arr_right_top.webp'
									alt='Arrow'
									style={{
										width: '26px',
										height: '26px',
									}}
								/>
							</a>
						))}
					</div>
				)}

				{/* Категории */}
				{project.categories && project.categories.length > 0 && (
					<div style={{ marginBottom: '24px' }}>
						<h2
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								fontWeight: 600,
								color: '#FCF9F7',
								marginBottom: '12px',
							}}
						>
							Категории
						</h2>
						<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
							{project.categories.map((cat, idx) => (
								<span
									key={idx}
									style={{
										backgroundColor: '#8CFF65',
										borderRadius: '12px',
										padding: '6px 12px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										fontWeight: 600,
										color: '#1E1B1A',
									}}
								>
									{cat.category.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Задачи */}
				{project.tags && project.tags.length > 0 && (
					<div style={{ marginBottom: '24px' }}>
						<h2
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								fontWeight: 600,
								color: '#FCF9F7',
								marginBottom: '12px',
							}}
						>
							Задачи
						</h2>
						<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
							{project.tags.map((tag, idx) => (
								<span
									key={idx}
									style={{
										backgroundColor: '#525250',
										borderRadius: '12px',
										padding: '6px 12px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '14px',
										fontWeight: 600,
										color: '#FCF9F7',
									}}
								>
									{tag.tag.name}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Дата публикации */}
				<div style={{ marginBottom: '24px' }}>
					<h2
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#FCF9F7',
							marginBottom: '12px',
						}}
					>
						Дата публикации
					</h2>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: 'rgba(252, 249, 247, 0.8)',
						}}
					>
						{new Date(project.createdAt).toLocaleDateString('ru-RU', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					</p>
				</div>
			</div>
			<RadarBottomNav />

			<style jsx>{`
				div::-webkit-scrollbar {
					display: none;
				}
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

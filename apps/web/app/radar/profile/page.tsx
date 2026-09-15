'use client'

import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Project {
	id: string
	name: string
	description: string
	avatarPath: string | null
	stage: string
	fireCount: number
	teamMemberCount: number
	categories: Array<{ category: { name: string } }>
}

interface UserProfile {
	firstName: string
	lastName: string
	username: string
	avatarUrl: string | null
}

export default function RadarProfilePage() {
	const router = useRouter()
	const [projects, setProjects] = useState<Project[]>([])
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { window.location.href = '/radar' }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		checkBanStatus()
		fetchProfile()
		fetchMyProjects()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	const checkBanStatus = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id

			if (!userId) return

			const response = await fetch(`/api/users/check-ban?userId=${userId}`)
			if (response.ok) {
				const data = await response.json()
				if (data.isBanned) {
					// Перенаправляем на страницу бана
					router.push('/banned')
				}
			}
		} catch (error) {
			console.error('Error checking ban status:', error)
		}
	}

	const fetchProfile = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id
			const telegramUser = tg?.initDataUnsafe?.user

			// Используем данные из Telegram напрямую
			if (telegramUser) {
				setProfile({
					firstName: telegramUser.first_name || 'Пользователь',
					lastName: telegramUser.last_name || '',
					username: telegramUser.username || 'username',
					avatarUrl: telegramUser.photo_url || null,
				})
			}

			// Также пытаемся загрузить из API если есть userId
			if (userId) {
				const response = await fetch(`/api/users/profile?userId=${userId}`)
				if (response.ok) {
					const data = await response.json()
					setProfile({
						firstName:
							data.firstName || telegramUser?.first_name || 'Пользователь',
						lastName: data.lastName || telegramUser?.last_name || '',
						username: data.username || telegramUser?.username || 'username',
						avatarUrl: data.avatarUrl || telegramUser?.photo_url || null,
					})
				}
			}
		} catch (error) {
			console.error('Error fetching profile:', error)
		}
	}

	const fetchMyProjects = async () => {
		try {
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id

			if (!userId) {
				console.error('[Radar Profile] No userId available')
				setLoading(false)
				return
			}

			const response = await fetch('/api/radar/my-projects', {
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (response.ok) {
				const data = await response.json()
				setProjects(data)
			}
		} catch (error) {
			console.error('Error fetching my projects:', error)
		} finally {
			setLoading(false)
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
				{/* Профиль пользователя */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						marginBottom: '32px',
						position: 'relative',
					}}
				>
					{/* Аватар с иконкой редактирования */}
					<div style={{ position: 'relative', marginBottom: '16px' }}>
						<div
							style={{
								width: '150px',
								height: '150px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '48px',
								fontWeight: 700,
								color: '#1E1B1A',
								overflow: 'hidden',
							}}
						>
							{profile?.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt='Avatar'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
							) : (
								profile?.firstName.substring(0, 2).toUpperCase() || 'U'
							)}
						</div>
						{/* Иконка редактирования */}
						<button
							onClick={() => router.push('/radar/profile/edit')}
							style={{
								position: 'absolute',
								top: '5px',
								right: '5px',
								width: '36px',
								height: '36px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								border: 'none',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
						>
							<svg
								width='18'
								height='18'
								viewBox='0 0 20 20'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M14.166 2.5009C14.3849 2.28203 14.6447 2.10842 14.9307 1.98996C15.2167 1.87151 15.5232 1.81055 15.8327 1.81055C16.1422 1.81055 16.4487 1.87151 16.7347 1.98996C17.0206 2.10842 17.2805 2.28203 17.4993 2.5009C17.7182 2.71977 17.8918 2.97961 18.0103 3.26558C18.1287 3.55154 18.1897 3.85804 18.1897 4.16757C18.1897 4.4771 18.1287 4.7836 18.0103 5.06956C17.8918 5.35553 17.7182 5.61537 17.4993 5.83424L6.24935 17.0842L1.66602 18.3342L2.91602 13.7509L14.166 2.5009Z'
									stroke='#1E1B1A'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
					</div>

					{/* Имя */}
					<h2
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontWeight: 900,
							fontSize: '24px',
							color: '#FCF9F7',
							margin: 0,
							marginBottom: '4px',
						}}
					>
						{profile?.firstName || 'Пользователь'}
					</h2>

					{/* Username */}
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '14px',
							color: 'rgba(252, 249, 247, 0.6)',
							margin: 0,
						}}
					>
						@{profile?.username || 'username'}
					</p>
				</div>

				{/* Заголовок секции */}
				<h3
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '18px',
						fontWeight: 600,
						color: '#FCF9F7',
						marginBottom: '16px',
					}}
				>
					Мои стартапы
				</h3>

				{/* Кнопка создать проект */}
				<button
					onClick={() => router.push('/radar/create')}
					style={{
						width: '100%',
						padding: '20px',
						backgroundColor: '#3A3735',
						border: 'none',
						borderRadius: '28px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						marginBottom: '16px',
					}}
				>
					<div
						style={{
							width: '50px',
							height: '50px',
							borderRadius: '50%',
							background: 'linear-gradient(135deg, #8CFF65 0%, #E3F040 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M12 5V19M5 12H19'
								stroke='#1E1B1A'
								strokeWidth='3'
								strokeLinecap='round'
							/>
						</svg>
					</div>
				</button>

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
							padding: '40px 20px',
						}}
					>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '16px',
								color: 'rgba(252, 249, 247, 0.6)',
							}}
						>
							У вас пока нет проектов
						</p>
					</div>
				) : (
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
					>
						{projects.map(project => (
							<div
								key={project.id}
								style={{
									backgroundColor: '#3A3735',
									borderRadius: '28px',
									padding: '20px',
									position: 'relative',
								}}
							>
								{/* Огонек со статистикой в правом верхнем углу */}
								<div
									style={{
										position: 'absolute',
										top: '20px',
										right: '20px',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '4px',
									}}
								>
									<svg
										width='16'
										height='23'
										viewBox='0 0 16 23'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M8 23C12.4187 23 16 20.125 16 15.0938C16 12.9375 15.3333 9.34375 12.6667 6.46875C13 8.625 11 9.34375 11 9.34375C12 5.75 9.33333 0.71875 5.33333 0C5.80933 2.875 6 5.75 2.66667 8.625C1 10.0625 0 12.5479 0 15.0938C0 20.125 3.58133 23 8 23ZM8 21.5625C5.79067 21.5625 4 20.125 4 17.6094C4 16.5312 4.33333 14.7344 5.66667 13.2969C5.5 14.375 6.66667 15.0938 6.66667 15.0938C6.16667 13.2969 7.33333 10.4219 9.33333 10.0625C9.09467 11.5 9 12.9375 10.6667 14.375C11.5 15.0938 12 16.3357 12 17.6094C12 20.125 10.2093 21.5625 8 21.5625Z'
											fill='#FCF9F7'
											fillOpacity='0.25'
										/>
									</svg>
									<span
										style={{
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '16px',
											fontWeight: 600,
											color: '#FCF9F7',
										}}
									>
										{project.fireCount}
									</span>
								</div>

								<div
									onClick={() => router.push(`/radar/project/${project.id}`)}
									style={{
										display: 'flex',
										gap: '16px',
										cursor: 'pointer',
										marginBottom: '16px',
									}}
								>
									{/* Аватар */}
									<div
										style={{
											width: '80px',
											height: '80px',
											borderRadius: '50%',
											backgroundColor: '#FCF9F7',
											flexShrink: 0,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontFamily: 'LT Superior, sans-serif',
											fontSize: '32px',
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

									{/* Контент */}
									<div style={{ flex: 1, minWidth: 0, paddingRight: '60px' }}>
										{/* Заголовок */}
										<h3
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '18px',
												fontWeight: 600,
												color: '#FCF9F7',
												margin: 0,
												marginBottom: '8px',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{project.name}
										</h3>

										{/* Описание */}
										<p
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												color: 'rgba(252, 249, 247, 0.6)',
												margin: 0,
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
												lineHeight: '1.5',
											}}
										>
											{project.description}
										</p>
									</div>
								</div>

								{/* Категории */}
								<div
									style={{
										display: 'flex',
										gap: '8px',
										flexWrap: 'wrap',
										marginBottom: '16px',
									}}
								>
									{project.categories.slice(0, 2).map((cat, idx) => (
										<span
											key={idx}
											style={{
												fontFamily: 'LT Superior, sans-serif',
												fontSize: '14px',
												fontWeight: 600,
												color: '#1E1B1A',
												backgroundColor: '#8CFF65',
												padding: '8px 16px',
												borderRadius: '20px',
											}}
										>
											{cat.category.name}
										</span>
									))}
								</div>

								{/* Кнопка редактировать */}
								<button
									onClick={() => router.push(`/radar/edit/${project.id}`)}
									style={{
										width: '100%',
										padding: '16px',
										backgroundColor: '#525250',
										border: 'none',
										borderRadius: '28px',
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										fontWeight: 600,
										color: '#FCF9F7',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '8px',
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
											d='M8.85811 4.30379L0.75 12.4119V16.0605H4.39865L12.5068 7.95244M8.85811 4.30379L12.5068 7.95244M8.85811 4.30379L12.1014 1.06055L15.75 4.7092L12.5068 7.95244'
											stroke='#FCF9F7'
											strokeWidth='1.5'
										/>
									</svg>
									Редактировать
								</button>
							</div>
						))}
					</div>
				)}
			</div>
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

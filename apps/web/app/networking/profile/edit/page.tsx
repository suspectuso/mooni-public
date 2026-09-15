'use client'

import MatchLoader from '@/components/MatchLoader'
import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'
import CaseWithAura from '@/components/networking/CaseWithAura'
import { getUserId } from '@/utils/telegram'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NetworkingCase {
	id: string
	photoPath: string
	link: string | null
	sortOrder: number
}

export default function EditNetworkingProfilePage() {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	// Profile data
	const [networkingName, setNetworkingName] = useState('')
	const [networkingPhoto, setNetworkingPhoto] = useState('')
	const [telegramPhotoUrl, setTelegramPhotoUrl] = useState('')
	const [uploadingAvatar, setUploadingAvatar] = useState(false)
	const [aura, setAura] = useState<'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED'>(
		'NONE',
	)
	const [lookingFor, setLookingFor] = useState<string[]>([])
	const [cases, setCases] = useState<NetworkingCase[]>([])

	const auraOptions = [
		{ value: 'NONE', label: 'нет', color: null },
		{ value: 'TURQUOISE', label: 'Бирюзовая', image: '/blue_aura.webp' },
		{ value: 'ORANGE', label: 'Оранжевая', image: '/orange_aura.webp' },
		{ value: 'RED', label: 'Красная', image: '/red_aura.webp' },
	]

	const lookingForOptions = [
		{ value: 'relationships', label: 'Отношения', color: '#F23318' },
		{ value: 'work', label: 'Работа', color: '#F7710B' },
		{ value: 'employees', label: 'Сотрудники', color: '#65FFF7' },
	]

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => router.push('/networking/profile')
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)

			// Получаем фото из Telegram для фолбэка
			const photoUrl = tg.initDataUnsafe?.user?.photo_url
			if (photoUrl) {
				setTelegramPhotoUrl(photoUrl)
			}
		}

		// CSS анимация для спиннера загрузки
		const style = document.createElement('style')
		style.textContent = `
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`
		document.head.appendChild(style)

		fetchProfile()

		return () => {
			document.head.removeChild(style)
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	// getUserId imported from @/utils/telegram

	const fetchProfile = async () => {
		try {
			const userId = getUserId()
			const API_URL =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
			const response = await fetch(
				`${API_URL}/networking/profile?userId=${userId}`,
			)
			const data = await response.json()

			setNetworkingName(data.networkingName || '')
			setNetworkingPhoto(data.networkingPhoto || '')
			setAura(data.networkingAura || 'NONE')
			setLookingFor(data.networkingLookingFor || [])
			setCases(data.networkingCases || [])
		} catch (error) {
			console.error('Error fetching profile:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		setSaving(true)
		try {
			const userId = getUserId()

			await fetch(`/api/networking/profile?userId=${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					networkingAura: aura,
					networkingLookingFor: lookingFor,
				}),
			})

			const tg = (window as any).Telegram?.WebApp
			if (tg) tg.HapticFeedback.notificationOccurred('success')

			router.push('/networking/profile')
		} catch (error) {
			console.error('Error saving profile:', error)
			const tg = (window as any).Telegram?.WebApp
			if (tg) tg.HapticFeedback.notificationOccurred('error')
		} finally {
			setSaving(false)
		}
	}

	const toggleLookingFor = (value: string) => {
		if (lookingFor.includes(value)) {
			setLookingFor(lookingFor.filter(v => v !== value))
		} else {
			setLookingFor([...lookingFor, value])
		}
	}

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const tg = (window as any).Telegram?.WebApp
		if (tg) {
			tg.HapticFeedback.impactOccurred('medium')
		}

		setUploadingAvatar(true)

		try {
			const formData = new FormData()
			formData.append('avatar', file)

			const userId = getUserId()

			const response = await fetch(
				`/api/upload/avatar/networking?userId=${userId}`,
				{
					method: 'POST',
					body: formData,
				},
			)

			if (!response.ok) {
				throw new Error(`Failed to upload avatar: ${response.status}`)
			}

			const data = await response.json()
			setNetworkingPhoto(data.avatarPath || data.avatarUrl)

			if (tg) {
				tg.HapticFeedback.notificationOccurred('success')
			}
		} catch (error) {
			console.error('Error uploading avatar:', error)
			const tg = (window as any).Telegram?.WebApp
			if (tg) {
				tg.showAlert('Ошибка при загрузке фото')
				tg.HapticFeedback.notificationOccurred('error')
			}
		} finally {
			setUploadingAvatar(false)
		}
	}

	const handleCaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || cases.length >= 3) return

		// TODO: Implement upload logic
	}

	if (loading) {
		return <MatchLoader />
	}

	return (
		<div className='min-h-screen bg-[#121212] flex flex-col'>
			<NetworkingHeader />

			<div
				className='flex-1 overflow-y-auto'
				style={{ paddingBottom: '100px' }}
			>
				<div style={{ padding: '20px' }}>
					{/* Аватар с кнопкой редактирования */}
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							marginBottom: '24px',
							position: 'relative',
						}}
					>
						<div style={{ position: 'relative' }}>
							<CaseWithAura
								photoPath={networkingPhoto || telegramPhotoUrl || '/default-avatar.webp'}
								auraColor={aura}
								size={200}
							/>
							<label
								htmlFor='avatar-upload'
								style={{
									position: 'absolute',
									bottom: '10px',
									right: '10px',
									width: '48px',
									height: '48px',
									borderRadius: '24px',
									backgroundColor: '#FCF9F7',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
									boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
								}}
							>
								{uploadingAvatar ? (
									<div
										style={{
											width: '20px',
											height: '20px',
											border: '2px solid #1D1D1B',
											borderTopColor: 'transparent',
											borderRadius: '50%',
											animation: 'spin 1s linear infinite',
										}}
									/>
								) : (
									<svg
										width='24'
										height='24'
										viewBox='0 0 24 24'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'
											fill='#1D1D1B'
										/>
									</svg>
								)}
							</label>
							<input
								id='avatar-upload'
								type='file'
								accept='image/*'
								disabled={uploadingAvatar}
								style={{ display: 'none' }}
								onChange={handleAvatarUpload}
							/>
						</div>
					</div>

					{/* Имя */}
					<div style={{ marginBottom: '24px' }}>
						<label
							style={{
								display: 'block',
								color: '#FCF9F7',
								fontSize: '16px',
								marginBottom: '8px',
								fontFamily: 'Oks, sans-serif',
							}}
						>
							Имя
						</label>
						<input
							type='text'
							value={networkingName}
							onChange={e => setNetworkingName(e.target.value)}
							style={{
								width: '100%',
								padding: '12px 16px',
								borderRadius: '12px',
								backgroundColor: 'rgba(252, 249, 247, 0.1)',
								border: '1px solid rgba(252, 249, 247, 0.2)',
								color: '#FCF9F7',
								fontSize: '16px',
							}}
						/>
					</div>

					{/* Статус поиска */}
					<div style={{ marginBottom: '24px' }}>
						<label
							style={{
								display: 'block',
								color: '#FCF9F7',
								fontSize: '16px',
								marginBottom: '12px',
								fontFamily: 'Oks, sans-serif',
							}}
						>
							Статус поиска
						</label>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
							{lookingForOptions.map(option => (
								<button
									key={option.value}
									onClick={() => toggleLookingFor(option.value)}
									style={{
										padding: '12px 20px',
										borderRadius: '24px',
										backgroundColor: lookingFor.includes(option.value)
											? option.color
											: 'rgba(252, 249, 247, 0.1)',
										border: 'none',
										color: lookingFor.includes(option.value)
											? '#1D1D1B'
											: '#FCF9F7',
										fontSize: '14px',
										fontWeight: 900,
										cursor: 'pointer',
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					{/* Цвет ауры */}
					<div style={{ marginBottom: '24px' }}>
						<label
							style={{
								display: 'block',
								color: '#FCF9F7',
								fontSize: '16px',
								marginBottom: '12px',
								fontFamily: 'Oks, sans-serif',
							}}
						>
							Цвет ауры
						</label>
						<div
							style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}
						>
							{auraOptions.map(option => (
								<div
									key={option.value}
									onClick={() =>
										setAura(
											option.value as 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED',
										)
									}
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '8px',
										cursor: 'pointer',
									}}
								>
									<div
										style={{
											width: '80px',
											height: '80px',
											borderRadius: '50%',
											backgroundColor: 'rgba(252, 249, 247, 0.1)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											border:
												aura === option.value
													? '3px solid #FCF9F7'
													: '3px solid transparent',
											position: 'relative',
										}}
									>
										{option.image ? (
											<img
												src={option.image}
												alt={option.label}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'contain',
												}}
											/>
										) : (
											<span style={{ color: '#FCF9F7', fontSize: '24px' }}>
												—
											</span>
										)}
										{aura === option.value && (
											<div
												style={{
													position: 'absolute',
													bottom: '-5px',
													right: '-5px',
													width: '24px',
													height: '24px',
													borderRadius: '50%',
													backgroundColor: '#FCF9F7',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<svg
													width='16'
													height='16'
													viewBox='0 0 16 16'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
												>
													<path
														d='M6 10.5L3.5 8L2.5 9L6 12.5L14 4.5L13 3.5L6 10.5Z'
														fill='#1D1D1B'
													/>
												</svg>
											</div>
										)}
									</div>
									<span
										style={{
											color: '#FCF9F7',
											fontSize: '12px',
											opacity: 0.65,
										}}
									>
										{option.label}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Кейсы */}
					<div style={{ marginBottom: '24px' }}>
						<label
							style={{
								display: 'block',
								color: '#FCF9F7',
								fontSize: '16px',
								marginBottom: '12px',
								fontFamily: 'Oks, sans-serif',
							}}
						>
							Кейсы
						</label>
						<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
							{cases.map(caseItem => (
								<CaseWithAura
									key={caseItem.id}
									photoPath={caseItem.photoPath}
									auraColor={aura}
									size={100}
								/>
							))}
							{cases.length < 3 && (
								<label
									htmlFor='case-upload'
									style={{
										width: '100px',
										height: '100px',
										borderRadius: '50%',
										backgroundColor: 'rgba(252, 249, 247, 0.1)',
										border: '2px dashed rgba(252, 249, 247, 0.3)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
									}}
								>
									<svg
										width='32'
										height='32'
										viewBox='0 0 32 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M16 8V24M8 16H24'
											stroke='#FCF9F7'
											strokeWidth='2'
											strokeLinecap='round'
										/>
									</svg>
								</label>
							)}
							<input
								id='case-upload'
								type='file'
								accept='image/*'
								style={{ display: 'none' }}
								onChange={handleCaseUpload}
							/>
						</div>
					</div>

					{/* Кнопка сохранить */}
					<button
						onClick={handleSave}
						disabled={saving}
						style={{
							width: '100%',
							padding: '16px',
							borderRadius: '50px',
							backgroundColor: '#F23318',
							border: 'none',
							color: '#FCF9F7',
							fontSize: '18px',
							fontFamily: 'Oks, sans-serif',
							cursor: saving ? 'not-allowed' : 'pointer',
							opacity: saving ? 0.6 : 1,
						}}
					>
						{saving ? 'Сохранение...' : 'Сохранить изменения'}
					</button>
				</div>
			</div>

			<NetworkingBottomNav />
		</div>
	)
}

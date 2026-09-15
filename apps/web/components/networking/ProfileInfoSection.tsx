'use client'

import { useState } from 'react'
import ProfileField from './ProfileField'

interface ProfileInfoSectionProps {
	gender?: string | null
	location: string
	about: string
	onSave?: (field: string, value: string) => Promise<void>
}

export default function ProfileInfoSection({
	gender,
	location,
	about,
	onSave,
}: ProfileInfoSectionProps) {
	const [editingGender, setEditingGender] = useState(false)
	const [editingLocation, setEditingLocation] = useState(false)
	const [editingAbout, setEditingAbout] = useState(false)

	const [localGender, setLocalGender] = useState(gender || '')
	const [localLocation, setLocalLocation] = useState(location)
	const [localAbout, setLocalAbout] = useState(about)

	const handleSaveGender = async () => {
		if (onSave) {
			await onSave('networkingGender', localGender)
		}
		setEditingGender(false)
	}

	const handleSaveLocation = async () => {
		if (onSave) {
			await onSave('networkingLocation', localLocation)
		}
		setEditingLocation(false)
	}

	const handleSaveAbout = async () => {
		if (onSave) {
			await onSave('networkingAbout', localAbout)
		}
		setEditingAbout(false)
	}

	const isReadOnly = !onSave

	const genderLabel = localGender === 'MALE' ? 'Мужчина' : localGender === 'FEMALE' ? 'Женщина' : 'Не указан'
	const genderIcon = localGender === 'MALE' ? (
		<svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
			<circle cx='6' cy='10' r='4.25' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' />
			<path d='M9.5 6.5L14 2M14 2h-4M14 2v4' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	) : localGender === 'FEMALE' ? (
		<svg width='14' height='16' viewBox='0 0 14 16' fill='none'>
			<circle cx='7' cy='5.5' r='4.25' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' />
			<path d='M7 9.75v5M5 12.5h4' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' strokeLinecap='round' />
		</svg>
	) : null

	return (
		<div style={{ marginBottom: '24px' }}>
			{/* Гендер */}
			<div
				style={{
					backgroundColor: '#272727',
					borderRadius: '28px',
					padding: '20px',
					marginBottom: '16px',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: editingGender ? '12px' : '8px',
					}}
				>
					<h2
						style={{
							color: '#FCF9F7',
							fontWeight: 600,
							fontSize: '20px',
							fontFamily: 'LT Superior, sans-serif',
							margin: 0,
						}}
					>
						Гендер
					</h2>
					{!isReadOnly && !editingGender && (
						<button
							onClick={() => setEditingGender(true)}
							style={{
								cursor: 'pointer',
								background: 'none',
								border: 'none',
								padding: 0,
							}}
						>
							<svg width='17' height='17' viewBox='0 0 17 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path d='M8.85811 4.30379L0.75 12.4119V16.0605H4.39865L12.5068 7.95244M8.85811 4.30379L12.5068 7.95244M8.85811 4.30379L12.1014 1.06055L15.75 4.7092L12.5068 7.95244' stroke='#FCF9F7' strokeWidth='1.5' />
							</svg>
						</button>
					)}
				</div>
				{editingGender ? (
					<>
						<div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
							<button
								onClick={() => setLocalGender('MALE')}
								style={{
									flex: 1,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px',
									padding: '12px',
									borderRadius: '16px',
									border: 'none',
									cursor: 'pointer',
									backgroundColor: localGender === 'MALE' ? '#353534' : '#1e1e1d',
									transition: 'background-color 0.2s',
								}}
							>
								<svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
									<circle cx='6' cy='10' r='4.25' stroke={localGender === 'MALE' ? '#FCF9F7' : '#82817f'} strokeWidth='1.5' />
									<path d='M9.5 6.5L14 2M14 2h-4M14 2v4' stroke={localGender === 'MALE' ? '#FCF9F7' : '#82817f'} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
								</svg>
								<span style={{ fontFamily: 'LT Superior, sans-serif', fontSize: '15px', color: localGender === 'MALE' ? '#FCF9F7' : '#82817f' }}>
									Мужчина
								</span>
							</button>
							<button
								onClick={() => setLocalGender('FEMALE')}
								style={{
									flex: 1,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '8px',
									padding: '12px',
									borderRadius: '16px',
									border: 'none',
									cursor: 'pointer',
									backgroundColor: localGender === 'FEMALE' ? '#353534' : '#1e1e1d',
									transition: 'background-color 0.2s',
								}}
							>
								<svg width='14' height='16' viewBox='0 0 14 16' fill='none'>
									<circle cx='7' cy='5.5' r='4.25' stroke={localGender === 'FEMALE' ? '#FCF9F7' : '#82817f'} strokeWidth='1.5' />
									<path d='M7 9.75v5M5 12.5h4' stroke={localGender === 'FEMALE' ? '#FCF9F7' : '#82817f'} strokeWidth='1.5' strokeLinecap='round' />
								</svg>
								<span style={{ fontFamily: 'LT Superior, sans-serif', fontSize: '15px', color: localGender === 'FEMALE' ? '#FCF9F7' : '#82817f' }}>
									Женщина
								</span>
							</button>
						</div>
						<button
							onClick={handleSaveGender}
							style={{
								width: '100%',
								backgroundColor: 'rgba(252, 249, 247, 0.15)',
								border: 'none',
								borderRadius: '28px',
								padding: '12px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '18px',
								color: '#FCF9F7',
								cursor: 'pointer',
								fontWeight: 600,
							}}
						>
							Сохранить изменения
						</button>
					</>
				) : (
					<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
						{genderIcon}
						<p
							style={{
								color: '#FCF9F7',
								fontSize: '15px',
								fontFamily: 'LT Superior, sans-serif',
								margin: 0,
							}}
						>
							{genderLabel}
						</p>
					</div>
				)}
			</div>

			<ProfileField
				title='Местоположение'
				value={localLocation}
				placeholder='Введите город'
				icon={
					<svg
						width='16'
						height='20'
						viewBox='0 0 16 20'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M8 0C3.58 0 0 3.58 0 8C0 14 8 20 8 20C8 20 16 14 16 8C16 3.58 12.42 0 8 0ZM8 10.5C6.62 10.5 5.5 9.38 5.5 8C5.5 6.62 6.62 5.5 8 5.5C9.38 5.5 10.5 6.62 10.5 8C10.5 9.38 9.38 10.5 8 10.5Z'
							fill='#FCF9F7'
							fillOpacity='0.65'
						/>
					</svg>
				}
				isEditing={editingLocation}
				onEdit={isReadOnly ? () => {} : () => setEditingLocation(true)}
				onChange={setLocalLocation}
				onSave={handleSaveLocation}
				onCancel={() => {
					setLocalLocation(location)
					setEditingLocation(false)
				}}
			/>

			<ProfileField
				title='О себе'
				value={localAbout}
				placeholder='Расскажите о себе'
				isEditing={editingAbout}
				onEdit={isReadOnly ? () => {} : () => setEditingAbout(true)}
				onChange={setLocalAbout}
				onSave={handleSaveAbout}
				onCancel={() => {
					setLocalAbout(about)
					setEditingAbout(false)
				}}
				multiline
			/>
		</div>
	)
}

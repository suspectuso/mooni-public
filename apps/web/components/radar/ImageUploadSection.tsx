'use client'

interface ImageUploadSectionProps {
	avatarPreview: string | null
	onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	photoPreviews: string[]
	onPhotosChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onRemovePhoto: (index: number) => void
}

export default function ImageUploadSection({
	avatarPreview,
	onAvatarChange,
	photoPreviews,
	onPhotosChange,
	onRemovePhoto,
}: ImageUploadSectionProps) {
	return (
		<>
			{/* Аватар/логотип */}
			<div style={{ marginBottom: '20px' }}>
				<label
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: '#FCF9F7',
						display: 'block',
						marginBottom: '8px',
					}}
				>
					Аватар/логотип
				</label>
				{avatarPreview ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '12px',
						}}
					>
						<div
							style={{
								width: '150px',
								height: '150px',
								borderRadius: '50%',
								overflow: 'hidden',
								border: '3px solid #878684',
								position: 'relative',
							}}
						>
							<img
								src={avatarPreview}
								alt='Avatar'
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						</div>
						<button
							onClick={() => document.getElementById('avatar-input')?.click()}
							style={{
								padding: '10px 20px',
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
							Изменить аватар
						</button>
					</div>
				) : (
					<div
						onClick={() => document.getElementById('avatar-input')?.click()}
						style={{
							width: '100%',
							height: '200px',
							backgroundColor: '#2A2725',
							border: '2px dashed #878684',
							borderRadius: '28px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
					>
						<svg
							width='35'
							height='35'
							viewBox='0 0 35 35'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M17.5 5V25M17.5 25L12.5 20M17.5 25L22.5 20M5 30H30'
								stroke='#FCF9F7'
								strokeOpacity='0.45'
								strokeWidth='2.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.5)',
								marginTop: '12px',
							}}
						>
							Выберите файл в формате jpg, jpeg, png
						</p>
					</div>
				)}
				<input
					id='avatar-input'
					type='file'
					accept='image/jpeg,image/jpg,image/png'
					onChange={onAvatarChange}
					style={{ display: 'none' }}
				/>
			</div>

			{/* Скрины и фото-контент */}
			<div style={{ marginBottom: '20px' }}>
				<label
					style={{
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: '#FCF9F7',
						display: 'block',
						marginBottom: '8px',
					}}
				>
					Скрины и фото-контент (до 5)
				</label>
				<div
					onClick={() => document.getElementById('photos-input')?.click()}
					style={{
						width: '100%',
						height: '120px',
						backgroundColor: '#2A2725',
						border: '2px dashed #878684',
						borderRadius: '28px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						marginBottom: '12px',
						gap: '8px',
					}}
				>
					<svg
						width='31'
						height='31'
						viewBox='0 0 31 31'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M15.5 0C16.3284 3.62118e-08 17 0.671573 17 1.5V14H29.5C30.3284 14 31 14.6716 31 15.5C31 16.3284 30.3284 17 29.5 17H17V29.5C17 30.3284 16.3284 31 15.5 31C14.6716 31 14 30.3284 14 29.5V17H1.5C0.671574 17 0 16.3284 0 15.5C0 14.6716 0.671574 14 1.5 14H14V1.5C14 0.671573 14.6716 -3.62118e-08 15.5 0Z'
							fill='#FCF9F7'
							fillOpacity='0.45'
						/>
					</svg>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '18px',
							fontWeight: 600,
							color: '#888683',
							margin: 0,
						}}
					>
						9:16
					</p>
				</div>
				<input
					id='photos-input'
					type='file'
					accept='image/jpeg,image/jpg,image/png'
					multiple
					onChange={onPhotosChange}
					style={{ display: 'none' }}
				/>

				{photoPreviews.length > 0 && (
					<div
						style={{
							display: 'flex',
							gap: '8px',
							flexWrap: 'wrap',
						}}
					>
						{photoPreviews.map((preview, index) => (
							<div
								key={index}
								style={{
									position: 'relative',
									width: '90px',
									height: '160px',
									borderRadius: '12px',
									overflow: 'hidden',
								}}
							>
								<img
									src={preview}
									alt={`Photo ${index + 1}`}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
								<button
									onClick={() => onRemovePhoto(index)}
									style={{
										position: 'absolute',
										top: '4px',
										right: '4px',
										width: '20px',
										height: '20px',
										borderRadius: '50%',
										backgroundColor: '#FCF9F7',
										border: 'none',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: 0,
									}}
								>
									<svg
										width='6'
										height='6'
										viewBox='0 0 6 6'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<line
											x1='0.249796'
											y1='0.249414'
											x2='5.03078'
											y2='5.39817'
											stroke='#F23318'
											strokeWidth='0.5'
											strokeLinecap='round'
										/>
										<line
											x1='0.25'
											y1='-0.25'
											x2='7.2762'
											y2='-0.25'
											transform='matrix(-0.680451 0.732793 0.732793 0.680451 5.41211 0.236328)'
											stroke='#F23318'
											strokeWidth='0.5'
											strokeLinecap='round'
										/>
									</svg>
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</>
	)
}

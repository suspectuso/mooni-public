'use client'

export type BadgeType = 'NONE' | 'PLUS_M' | 'TURQUOISE_CHECK' | 'ORANGE_CHECK' | 'RED_CHECK'

interface ProfileEditModalProps {
	isOpen: boolean
	profile: {
		networkingPhoto: string
		networkingName: string
		firstName?: string
	}
	selectedAura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED'
	selectedBadge: BadgeType
	selectedLookingFor: string[]
	uploadingAvatar: boolean
	nickname: string
	onClose: () => void
	onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
	onAuraChange: (aura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED') => void
	onBadgeChange: (badge: BadgeType) => void
	onLookingForToggle: (type: string) => void
	onNicknameChange: (nickname: string) => void
	onSave: () => void
}

export default function ProfileEditModal({
	isOpen,
	profile,
	selectedAura,
	selectedBadge,
	selectedLookingFor,
	uploadingAvatar,
	nickname,
	onClose,
	onAvatarUpload,
	onAuraChange,
	onBadgeChange,
	onLookingForToggle,
	onNicknameChange,
	onSave,
}: ProfileEditModalProps) {
	if (!isOpen) return null

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.9)',
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'center',
				zIndex: 1000,
				padding: '20px',
				paddingTop: 'calc(var(--tg-safe-top, 0px) + 60px)',
				overflowY: 'auto',
			}}
			onClick={onClose}
		>
			<div
				onClick={e => e.stopPropagation()}
				style={{
					backgroundColor: '#171717',
					borderRadius: '28px',
					width: '100%',
					maxWidth: '400px',
					maxHeight: '90vh',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column' as const,
				}}
			>
				{/* Заголовок — фиксированный */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '24px 24px 0 24px',
						marginBottom: '24px',
						flexShrink: 0,
					}}
				>
					<h2
						style={{
							color: '#FCF9F7',
							fontFamily: 'Oks, sans-serif',
							fontSize: '24px',
							margin: 0,
						}}
					>
						Мэтч работа
					</h2>
					<button
						onClick={onClose}
						style={{
							width: '32px',
							height: '32px',
							borderRadius: '50%',
							backgroundColor: 'rgba(252, 249, 247, 0.1)',
							border: 'none',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
					>
						<svg
							width='14'
							height='14'
							viewBox='0 0 14 14'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M1 1L13 13M1 13L13 1'
								stroke='#FCF9F7'
								strokeWidth='2'
								strokeLinecap='round'
							/>
						</svg>
					</button>
				</div>

				{/* Скроллируемый контент */}
				<div style={{ overflowY: 'auto', padding: '0 24px 24px 24px', flex: 1 }}>

				{/* Аватарка с кнопкой загрузки */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '24px',
					}}
				>
					<div style={{ position: 'relative' }}>
						<div
							style={{
								width: '120px',
								height: '120px',
								borderRadius: '50%',
								overflow: 'hidden',
								backgroundColor: '#3a3a3a',
							}}
						>
							{profile.networkingPhoto && (
								<img
									src={profile.networkingPhoto}
									alt={profile.networkingName}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
									}}
								/>
							)}
						</div>
						<label
							htmlFor='modal-avatar-upload'
							style={{
								position: 'absolute',
								bottom: '0',
								right: '0',
								width: '36px',
								height: '36px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
								opacity: uploadingAvatar ? 0.5 : 1,
							}}
						>
							{uploadingAvatar ? (
								<div
									style={{
										width: '18px',
										height: '18px',
										border: '2px solid #1E1B1A',
										borderTopColor: 'transparent',
										borderRadius: '50%',
										animation: 'spin 1s linear infinite',
									}}
								/>
							) : (
								<svg
									width='16'
									height='16'
									viewBox='0 0 16 16'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M15.2 9.6C14.9878 9.6 14.7843 9.68429 14.6343 9.83432C14.4843 9.98434 14.4 10.1878 14.4 10.4V13.6C14.4 13.8122 14.3157 14.0157 14.1657 14.1657C14.0157 14.3157 13.8122 14.4 13.6 14.4H2.4C2.18783 14.4 1.98434 14.3157 1.83431 14.1657C1.68429 14.0157 1.6 13.8122 1.6 13.6V10.4C1.6 10.1878 1.51571 9.98434 1.36569 9.83432C1.21566 9.68429 1.01217 9.6 0.8 9.6C0.587827 9.6 0.384344 9.68429 0.234315 9.83432C0.0842854 9.98434 0 10.1878 0 10.4V13.6C0 14.2365 0.252856 14.847 0.702944 15.2971C1.15303 15.7471 1.76348 16 2.4 16H13.6C14.2365 16 14.847 15.7471 15.2971 15.2971C15.7471 14.847 16 14.2365 16 13.6V10.4C16 10.1878 15.9157 9.98434 15.7657 9.83432C15.6157 9.68429 15.4122 9.6 15.2 9.6ZM7.432 10.968C7.50808 11.0408 7.5978 11.0979 7.696 11.136C7.79176 11.1783 7.8953 11.2002 8 11.2002C8.1047 11.2002 8.20824 11.1783 8.304 11.136C8.4022 11.0979 8.49192 11.0408 8.568 10.968L11.768 7.768C11.9186 7.61736 12.0033 7.41304 12.0033 7.2C12.0033 6.98696 11.9186 6.78264 11.768 6.632C11.6174 6.48136 11.413 6.39673 11.2 6.39673C10.987 6.39673 10.7826 6.48136 10.632 6.632L8.8 8.472V0.8C8.8 0.587827 8.71571 0.384344 8.56569 0.234315C8.41566 0.0842854 8.21217 0 8 0C7.78783 0 7.58434 0.0842854 7.43431 0.234315C7.28429 0.384344 7.2 0.587827 7.2 0.8V8.472L5.368 6.632C5.29341 6.55741 5.20486 6.49824 5.1074 6.45787C5.00994 6.4175 4.90549 6.39673 4.8 6.39673C4.69451 6.39673 4.59006 6.4175 4.4926 6.45787C4.39514 6.49824 4.30659 6.55741 4.232 6.632C4.15741 6.70659 4.09824 6.79514 4.05787 6.8926C4.0175 6.99006 3.99673 7.09451 3.99673 7.2C3.99673 7.30549 4.0175 7.40994 4.05787 7.5074C4.09824 7.60486 4.15741 7.69341 4.232 7.768L7.432 10.968Z'
										fill='#1D1D1B'
									/>
								</svg>
							)}
						</label>
						<input
							id='modal-avatar-upload'
							type='file'
							accept='.jpg,.jpeg,.png,.webp,.heic,.heif'
							onChange={onAvatarUpload}
							disabled={uploadingAvatar}
							style={{ display: 'none' }}
						/>
					</div>
				</div>

				{/* Никнейм */}
				<div style={{ marginBottom: '24px' }}>
					<input
						type='text'
						value={nickname}
						onChange={e => onNicknameChange(e.target.value)}
						placeholder='Введите никнейм'
						style={{
							width: '100%',
							height: '75px',
							backgroundColor: '#282826',
							border: 'none',
							borderRadius: '28px',
							padding: '0 24px',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: '#FCF9F7',
							outline: 'none',
							boxSizing: 'border-box',
						}}
					/>
				</div>

				{/* Статус поиска */}
				<div style={{ marginBottom: '24px' }}>
					<h3
						style={{
							color: '#FCF9F7',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							marginBottom: '12px',
						}}
					>
						Статус поиска
					</h3>
					<div
						style={{
							display: 'flex',
							gap: '8px',
							flexWrap: 'wrap',
							justifyContent: 'center',
						}}
					>
						{[
							{
								type: 'relationships',
								label: 'Отношения',
								bgColor: 'rgba(242, 51, 24, 0.45)',
								textColor: '#F23318',
								icon: (
									<svg
										width='16'
										height='14'
										viewBox='0 0 16 14'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M15.501 1.97563C14.8309 0.641827 12.9006 -0.449469 10.6553 0.185907C9.58235 0.486493 8.64624 1.13111 7.99989 2.01443C7.35354 1.13111 6.41743 0.486493 5.3445 0.185907C3.09417 -0.439769 1.16888 0.641827 0.498786 1.97563C-0.441352 3.84296 -0.0512946 5.9431 1.65896 8.21784C2.99915 9.99787 4.91444 11.8021 7.69484 13.8974C7.78271 13.9639 7.89095 14 8.00239 14C8.11382 14 8.22207 13.9639 8.30994 13.8974C11.0853 11.807 13.0056 10.0173 14.3458 8.21784C16.0511 5.9431 16.4411 3.84296 15.501 1.97563Z'
											fill='#F23318'
										/>
									</svg>
								),
							},
							{
								type: 'work',
								label: 'Работа',
								bgColor: 'rgba(247, 113, 11, 0.45)',
								textColor: '#F7710B',
								icon: (
									<svg
										width='19'
										height='17'
										viewBox='0 0 19 17'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M10.45 12.2778H8.55C8.0275 12.2778 7.6 11.8528 7.6 11.3333H0.9595V15.1111C0.9595 16.15 1.8145 17 2.8595 17H16.15C17.195 17 18.05 16.15 18.05 15.1111V11.3333H11.4C11.4 11.8528 10.9725 12.2778 10.45 12.2778ZM17.1 3.77778H13.3C13.3 1.69056 11.5995 0 9.5 0C7.4005 0 5.7 1.69056 5.7 3.77778H1.9C0.855 3.77778 0 4.62778 0 5.66667V8.5C0 9.54833 0.8455 10.3889 1.9 10.3889H7.6V9.44444C7.6 8.925 8.0275 8.5 8.55 8.5H10.45C10.9725 8.5 11.4 8.925 11.4 9.44444V10.3889H17.1C18.145 10.3889 19 9.53889 19 8.5V5.66667C19 4.62778 18.145 3.77778 17.1 3.77778ZM7.6 3.77778C7.6 2.73889 8.455 1.88889 9.5 1.88889C10.545 1.88889 11.4 2.73889 11.4 3.77778H7.5905H7.6Z'
											fill='#F7710B'
										/>
									</svg>
								),
							},
							{
								type: 'employees',
								label: 'Сотрудники',
								bgColor: 'rgba(101, 255, 247, 0.45)',
								textColor: '#65FFF7',
								icon: (
									<svg
										width='15'
										height='17'
										viewBox='0 0 15 17'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											fillRule='evenodd'
											clipRule='evenodd'
											d='M7.5 9.93033C10.0031 9.93033 15 11.5092 15 14.6442V16.0016C14.9998 16.5537 14.5522 17.0016 14 17.0016H1C0.447851 17.0016 0.000181532 16.5537 0 16.0016L0 14.6442C0 11.5092 4.99686 9.93035 7.5 9.93033ZM5.96973 0.304355C6.70048 0.00172426 7.50452 -0.0774349 8.28027 0.0768155C9.0562 0.231156 9.76969 0.612133 10.3291 1.17154C10.8883 1.73085 11.2685 2.44369 11.4229 3.21939C11.5772 3.99532 11.4981 4.80001 11.1953 5.53092C10.8926 6.26163 10.3803 6.88639 9.72266 7.32584C9.06486 7.76536 8.29112 7.99967 7.5 7.99967C6.43933 7.99961 5.42195 7.57871 4.67188 6.82877C3.92173 6.07862 3.5 5.06053 3.5 3.99967C3.50005 3.20864 3.73533 2.43571 4.1748 1.77799C4.61433 1.12019 5.23882 0.607105 5.96973 0.304355Z'
											fill='#65FFF7'
										/>
									</svg>
								),
							},
						].map(({ type, label, bgColor, textColor, icon }) => {
							const isSelected = selectedLookingFor.includes(type)
							return (
								<div
									key={type}
									onClick={() => {
										const tg = (window as any).Telegram?.WebApp
										if (tg) tg.HapticFeedback.selectionChanged()
										onLookingForToggle(type)
									}}
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										height: '32px',
										paddingLeft: '8px',
										paddingRight: '8px',
										borderRadius: '16px',
										backgroundColor: bgColor,
										backdropFilter: 'blur(10px)',
										cursor: 'pointer',
										opacity: isSelected ? 1 : 0.35,
									}}
								>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '4px',
											whiteSpace: 'nowrap',
										}}
									>
										{icon}
										<span
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '12px',
												fontWeight: 900,
												color: textColor,
											}}
										>
											{label}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Галочки */}
				<div style={{ marginBottom: '24px' }}>
					<h3
						style={{
							color: '#FCF9F7',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							marginBottom: '12px',
						}}
					>
						Галочки
					</h3>
					<div
						style={{
							display: 'flex',
							gap: '10px',
							alignItems: 'center',
						}}
					>
						{([
							{ value: 'NONE' as BadgeType, image: '/net.png', label: 'Нет' },
							{ value: 'PLUS_M' as BadgeType, image: '/orange.png', label: '+M' },
							{ value: 'TURQUOISE_CHECK' as BadgeType, image: '/golub.png', label: '' },
							{ value: 'ORANGE_CHECK' as BadgeType, image: '/orange_yes.png', label: '' },
							{ value: 'RED_CHECK' as BadgeType, image: '/red_yes.png', label: '' },
						]).map(({ value, image, label }) => {
							const isSelected = selectedBadge === value
							return (
								<button
									key={value}
									onClick={() => {
										const tg = (window as any).Telegram?.WebApp
										if (tg) tg.HapticFeedback.selectionChanged()
										onBadgeChange(value)
									}}
									style={{
										width: '46px',
										height: '46px',
										borderRadius: '50%',
										border: 'none',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: 0,
										backgroundColor: image ? 'transparent' : '#3a3a3a',
										opacity: isSelected ? 1 : 0.45,
										transition: 'opacity 0.2s, transform 0.2s',
										transform: isSelected ? 'scale(1.15)' : 'scale(1)',
										overflow: 'hidden',
									}}
								>
									{image ? (
										<img
											src={image}
											alt={label}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
												borderRadius: '50%',
											}}
										/>
									) : (
										<svg width='22' height='18' viewBox='0 0 22 18' fill='none'>
											<path d='M2 9L8.5 15.5L20 2' stroke='#1D1D1B' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
										</svg>
									)}
								</button>
							)
						})}
					</div>
				</div>

				{/* Цвет ауры */}
				<div style={{ marginBottom: '24px' }}>
					<h3
						style={{
							color: '#FCF9F7',
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							fontWeight: 600,
							marginBottom: '12px',
						}}
					>
						Цвет ауры
					</h3>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(4, 1fr)',
							gap: '12px',
						}}
					>
						{[
							{ value: 'NONE', label: 'нет', image: null },
							{ value: 'TURQUOISE', label: '', image: '/aura_blue.png' },
							{ value: 'ORANGE', label: '', image: '/aura_orange.png' },
							{ value: 'RED', label: '', image: '/aura_red.png' },
						].map(({ value, label, image }) => (
							<button
								key={value}
								onClick={() => {
									const tg = (window as any).Telegram?.WebApp
									if (tg) tg.HapticFeedback.selectionChanged()
									onAuraChange(value as any)
								}}
								style={{
									backgroundColor: 'transparent',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
									display: 'flex',
									flexDirection: 'column' as any,
									alignItems: 'center',
									gap: '8px',
								}}
							>
								{image ? (
									<div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
										<img src={image} alt={value} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
										<img src='/aura_m.png' alt='' style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px' }} />
									</div>
								) : (
									<div style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'LT Superior, sans-serif', fontSize: '14px', color: '#FCF9F7' }}>
										{label}
									</div>
								)}
								<img src='/aura_check.svg' alt='' style={{ width: '20px', height: '20px', opacity: selectedAura === value ? 1 : 0.4 }} />
							</button>
						))}
					</div>
					<p style={{ color: 'rgba(252, 249, 247, 0.5)', fontFamily: 'LT Superior, sans-serif', fontSize: '12px', marginTop: '12px', lineHeight: '1.4' }}>
						Выбирая ауру определенного цвета вы сможете быстрее найти нужных людей
					</p>
				</div>

				{/* Кнопка сохранения */}
				<button
					onClick={onSave}
					style={{
						width: '100%',
						backgroundColor: '#65FFF7',
						border: 'none',
						borderRadius: '28px',
						padding: '16px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '18px',
						color: '#1D1D1B',
						cursor: 'pointer',
						fontWeight: 600,
					}}
				>
					Сохранить
				</button>
				</div>
			</div>
		</div>
	)
}

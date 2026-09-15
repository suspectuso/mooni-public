'use client'

interface Founder {
	id: string
	username: string
	avatarUrl: string | null
}

interface FounderSearchModalProps {
	isOpen: boolean
	onClose: () => void
	searchQuery: string
	onSearchChange: (query: string) => void
	searchResults: Founder[]
	searchLoading: boolean
	onSelectFounder: (founder: Founder) => void
}

export default function FounderSearchModal({
	isOpen,
	onClose,
	searchQuery,
	onSearchChange,
	searchResults,
	searchLoading,
	onSelectFounder,
}: FounderSearchModalProps) {
	const handleInvite = () => {
		const tg = (window as any).Telegram?.WebApp
		const inviteText = `Присоединяйся к МЭТЧ РАДАР https://t.me/Match_MSD_bot\n\nНаш чат @Match_MSD\nНаш канал @theMatchClub`

		if (tg) {
			// Открываем Telegram с готовым текстом
			tg.openTelegramLink(
				`https://t.me/share/url?url=${encodeURIComponent(inviteText)}`,
			)
		}
	}

	if (!isOpen) return null

	return (
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
			onClick={onClose}
		>
			<div
				onClick={e => e.stopPropagation()}
				style={{
					width: '100%',
					maxHeight: '70vh',
					backgroundColor: '#2A2725',
					borderTopLeftRadius: '30px',
					borderTopRightRadius: '30px',
					padding: '24px',
					overflowY: 'auto',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px',
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
						Поиск основателя
					</h2>
					<button
						onClick={onClose}
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

				<input
					type='text'
					value={searchQuery}
					onChange={e => onSearchChange(e.target.value)}
					placeholder='Поиск'
					style={{
						width: '100%',
						padding: '14px',
						backgroundColor: '#3A3735',
						border: 'none',
						borderRadius: '28px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '16px',
						color: '#FCF9F7',
						outline: 'none',
						marginBottom: '20px',
					}}
				/>

				{searchLoading ? (
					<div style={{ textAlign: 'center', padding: '40px 0' }}>
						<div
							style={{
								width: '40px',
								height: '40px',
								border: '3px solid rgba(140, 255, 101, 0.2)',
								borderTop: '3px solid #8CFF65',
								borderRadius: '50%',
								animation: 'spin 1s linear infinite',
								margin: '0 auto',
							}}
						/>
					</div>
				) : searchResults.length > 0 ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '12px',
						}}
					>
						{searchResults.map(user => (
							<div
								key={user.id}
								onClick={() => onSelectFounder(user)}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									padding: '12px',
									backgroundColor: '#3A3735',
									borderRadius: '16px',
									cursor: 'pointer',
								}}
							>
								<div
									style={{
										width: '40px',
										height: '40px',
										borderRadius: '50%',
										backgroundColor: '#FCF9F7',
										overflow: 'hidden',
										flexShrink: 0,
									}}
								>
									{user.avatarUrl ? (
										<img
											src={user.avatarUrl}
											alt={user.username}
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
												fontSize: '14px',
												fontWeight: 600,
												color: '#1E1B1A',
											}}
										>
											{user.username.substring(0, 2).toUpperCase()}
										</div>
									)}
								</div>
								<span
									style={{
										fontFamily: 'LT Superior, sans-serif',
										fontSize: '16px',
										color: '#FCF9F7',
									}}
								>
									@{user.username}
								</span>
							</div>
						))}
					</div>
				) : searchQuery.trim() ? (
					<div style={{ textAlign: 'center', padding: '40px 20px' }}>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								color: 'rgba(252, 249, 247, 0.6)',
								marginBottom: '20px',
							}}
						>
							Пользователь не найден
						</p>
						<p
							style={{
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '12px',
								color: 'rgba(252, 249, 247, 0.4)',
								marginBottom: '16px',
							}}
						>
							*Пригласите пользователя в приложение, чтобы добавить его в проект
						</p>
						<button
							onClick={handleInvite}
							style={{
								background: 'linear-gradient(135deg, #8CFF65 0%, #E3F040 100%)',
								border: 'none',
								borderRadius: '28px',
								padding: '12px 24px',
								fontFamily: 'LT Superior, sans-serif',
								fontSize: '14px',
								fontWeight: 600,
								color: '#1E1B1A',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								margin: '0 auto',
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
									d='M8 0L8 16M0 8L16 8'
									stroke='#1E1B1A'
									strokeWidth='2'
									strokeLinecap='round'
								/>
							</svg>
							Пригласить
						</button>
					</div>
				) : null}
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
		</div>
	)
}
